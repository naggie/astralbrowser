// TODO match on directories, high as possible, ignore dupes, via results filter?
// TODO handle fetch errors
// TODO  use web workers. don't forget myWorker.terminate(); on unmount
// // TODO next tick during sync search to prevent blocking too long? (every 100,000 items or something) (then search can be cancelled if query changes) -- await timeout of zero like the teaser
// // TODO ensure gzip
// // TODO report number of files searched in UI
// TODO maybe report match count (so ui can show there are more)
// TODO maybe eventemitter, or simplify by removing indirection for hooks
// TODO emit search progress (0-100 in 0.1 steps)
export default class SearchEngine {
    // a list of files, built and searched concurrently
    indexUrl: string ;
    index: string[];
    query: string;
    resultLimit: number;
    results: []string;
    protected _onResult: Function = () => {};
    protected _onInvalidateResults: Function = () => {};
    protected _onSearchProgress: Function = () => {};

    constructor(indexUrl: string, resultLimit: number = 100) {
        // index file should be a line delimited list of files relative to base
        this.indexUrl = indexUrl;
        this.index = [];
        this.query = "";
        this.resultLimit = resultLimit;
        this.results = [];
    }

    async begin() {
        const response = await fetch(this.indexUrl);

        if (response.status == 404) {
            throw new Error("Search index does not exist");
        } else if (response.status != 200) {
            throw new Error("Error loading search index");
        }

        const reader = response.body.getReader();
        const contentLength: number = +response.headers.get('Content-Length');
        let receivedLength: number = 0;

        // the last bit after the previous linebreak that may form part of the
        // next incoming
        let fragment: string = "";

        while(true) {
            const chunk = await reader.read();

            if (chunk.done) {
                break;
            }

            receivedLength += chunk.value.length;

            const text = new TextDecoder("utf-8").decode(chunk.value);
            const lines = text.split(/\r?\n/);

            // attach last fragment and get next
            lines[0] = fragment + lines[0];
            fragment = lines.pop();

            for (const line of lines) {
                this.onNewLine(line);
            }
        }
    }

    newSearch(query: string) {
        this._onInvalidateResults();
        this.results = [];
        this.query = query;

        // emit results for existing index (this works without locking as
        // there's only 1 thread and this is blocking/synchronous
        for (const line of this.index) {
            if (this.results.length > this.resultLimit) {
                return;
            }

            if (matchesQuery(line, this.query)) {
                this._onResult(line);
                this.results.push(line);
            }
        }
    }

    // called whenever a single match is found. Use to build an array of
    // matches that should be emptied when the invalidate results callback is
    // fired. Invalidation happens when a new search is carried out.
    onResult(fn: Function) {
        this._onResult = fn;
    }

    onInvalidateResults(fn: Function) {
        this._onInvalidateResults = fn;
    }

    onSearchProgress(fn: Function) {
        this._onSearchProgress = fn;
    }

    protected onNewLine(line: string) {
        // add to index
        this.index.push(line);

        if (this.results.length > this.resultLimit) {
            return;
        }

        // emit new results that current search is unaware of
        if (matchesQuery(line, this.query)) {
            this._onResult(line);
            this.results.push(line);
        }
    }
}

// look for sequential matches for tokens in search query
function matchesQuery(text: string, query: string): boolean {
    if (query == "") {
        return false;
    }

    const queryTokens = query.toLowerCase().split(/\W+/);

    // remaining part of test to search, to allow sequential search
    let fragment = text.toLowerCase();

    for (const token of queryTokens) {
        const pos = fragment.indexOf(token);

        // no match
        if (pos == -1) {
            return false
        }

        // chop off up to match
        fragment = fragment.slice(pos + token.length);
    }

    return true;
}
