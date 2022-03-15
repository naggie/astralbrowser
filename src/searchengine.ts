// TODO handle fetch errors
// TODO  use web workers. don't forget myWorker.terminate(); on unmount
// TODO next tick during sync search to prevent blocking too long? (every 100,000 items or something) (then search can be cancelled if query changes) -- await timeout of zero like the teaser
// TODO ensure gzip
// TODO report number of files searched in UI
// TODO emit search progress (0-100 in 0.1 steps)
// TODO display results count only when search has finished
// TODO time search and reflect in UI (searched 5002 items in 34ms. 100+ results)
import { joinPath } from './util';

export default class SearchEngine {
    // a list of files, built and searched concurrently
    indexUrl: string ;
    index: string[];
    query: string;
    resultLimit: number;
    results: string[];

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

            const path = new TextDecoder("utf-8").decode(chunk.value);
            const paths = path.split(/\r?\n/);

            // attach last fragment and get next
            paths[0] = fragment + paths[0];
            fragment = paths.pop();

            for (let path of paths) {
                // normalise path so no leading ./
                path = joinPath(path);
                this.onNewPath(path);
            }
        }
    }

    newSearch(query: string) {
        this.onInvalidateResults();
        this.results = [];
        this.query = query;

        // emit results for existing index (this works without locking as
        // there's only 1 thread and this is blocking/synchronous
        for (const path of this.index) {
            if (this.results.length >= this.resultLimit) {
                return;
            }

            if (matchesQuery(path, this.query)) {
                this.processResult(path);
            }
        }
    }

    // to override!
    // called whenever a single match is found. Use to build an array of
    // matches that should be emptied when the invalidate results callback is
    // fired. Invalidation happens when a new search is carried out.
    onResult(result: string) {
        throw new Error("onResult needs to be overridden");
    }

    onInvalidateResults() {
    }

    // query is specified in case SearchEngine is running behind (so UI can
    // show a non-deterministic progress bar until the current search is
    // displayed)
    onSearchProgress(percent: number, query: string) {
    }

    protected processResult(path: string) {
        // this is a match but maybe not the highest match (if directory can be matched)
        // if it is a directory, there are likely to be many results that
        // resolve to the same highest path. Only emit result if unique.
        const highestPath = highestMatch(path, this.query);

        if (this.results.includes(highestPath)) {
            return;
        }

        this.onResult(highestPath);
        this.results.push(highestPath);
    }

    protected onNewPath(path: string) {
        // add to index
        this.index.push(path);

        if (this.results.length >= this.resultLimit) {
            return;
        }

        // emit new results that current search is unaware of
        if (matchesQuery(path, this.query)) {
            this.processResult(path);
        }
    }
}

// look for sequential matches for tokens in search query
function matchesQuery(path: string, query: string): boolean {
    if (query == "") {
        return false;
    }

    const queryTokens = query.toLowerCase().split(/\W+/);

    // remaining part of test to search, to allow sequential search
    let fragment = path.toLowerCase();

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

// returns the highest path that still matches the query (so results can show
// directories too. Requires de-duping of results)
function highestMatch(path: string, query: string) {
    const parts = path.split(/\/+/);
    const levels = parts.length;  // has to be const as .lenth changes
    const isDir = path.endsWith("/");

    let highestPath = path;

    for (let i = 0; i < levels; i++) {
        // construct, ensure directories are not seen as files
        const currentPath = (i == 0  && !isDir) ? joinPath(...parts) : joinPath(...parts, '/');

        if (!matchesQuery(currentPath, query)) {
            break;
        }

        highestPath = currentPath;
        parts.pop();
    }

    return highestPath;
}
//console.log(highestMatch('./frillip/yes/PROWinx64/PRO1000/Winx64/NDIS63/e1k63x64.cat', 'frillip'))
