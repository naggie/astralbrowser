// TODO match on directories, high as possible, ignore dupes, via results filter?
export default class SearchEngine {
    // a list of files, built and searched concurrently
    index: string[] = [];
    query: string;
    protected _onResult: Function = () => {};
    protected _onInvalidateResults: Function = () => {};
    protected _onSearchProgress: Function = () => {};

    async construtor(indexUrl: string) {
        // index file should be a line delimited list of files relative to base
        const response = await fetch(indexUrl);
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

            console.log(`Received ${receivedLength} of ${contentLength}`)
        }
    }

    newSearch(query: string) {
        this._onInvalidateResults();
        this.query = query;

        // emit results for existing index (this works without locking as
        // there's only 1 thread and this is blocking/synchronous
        for (const line of this.index) {
            if (matchesQuery(line, this.query)) {
                this._onResult(line);
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

        // emit new results that current search is unaware of
        if (matchesQuery(line, this.query)) {
            this._onResult(line);
        }
    }
}

function matchesQuery(text: string, query: string): boolean {
    // TODO more advanced matching -- split by whitespace and match
    // sequentially. Also, outside of this, match highest directory and ignore
    // resulting dupes
    if (query == "") {
        return false;
    }

    return text.toLowerCase().includes(query.toLowerCase());
}
