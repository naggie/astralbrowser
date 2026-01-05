// TODO handle fetch errors
// TODO web workers: don't forget myWorker.terminate(); on unmount?
// TODO stop searching on result limit?
// TODO next tick during sync search to prevent blocking too long? (every 100,000 items or something) (then search can be cancelled if query changes) -- await timeout of zero like the teaser
// TODO consider pausing search at resultLimit, with method to resume (button)
import { joinPath } from './util';

const MIN_REPORT_INTERVAL = 100;

// index format:
// <total count> <total size>
// <size> <path>
// <size> <path>
// ...
// see astralbrowser-indexer for more details


export default class SearchEngine {
    // a list of files, built and searched concurrently
    indexUrl: string ;
    index: Result[] = [];
    query: string = "";
    resultLimit: number;
    results: Result[] = [];
    start: number = 0;
    duration: number = 0;
    indexStarted: boolean = false;
    indexComplete: boolean = false;
    numTotal: number = 0;
    totalSize: number = 0;
    numSearched: number = 0;
    searching: boolean = false;
    lastReportTime: number = 0;
    indexAgeMs: number = 0;
    gzipWarning: boolean = false;

    constructor(indexUrl: string, resultLimit: number) {
        // index file should be a line delimited list of files relative to mountPoint
        this.indexUrl = indexUrl;
        this.resultLimit = resultLimit;
    }

    // stream the index from the server, searching as it comes if there's a
    // search on the go.
    async buildIndex() {
        if (this.indexStarted) {
            return;
        }

        this.indexStarted = true;

        const response = await fetch(this.indexUrl);

        if (response.status == 404) {
            throw new Error("Search index does not exist");
        } else if (response.status != 200) {
            throw new Error("Error loading search index");
        }

        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();

        // 3? newlines etc.
        const contentLength = response.headers.get("content-length");
        if (contentLength && +contentLength < 1024) {
            throw new Error("Search index is empty");
        }

        // the last bit after the previous linebreak that may form part of the
        // next incoming
        let fragment: string = "";

        this.maybeEmitReport(true);

        // with nginx, content-length is only set if dynamic gzip is not
        // on. content-length defaults to 0 due to + operator.
        // nginx may also be configured to gzip only after a certain size,
        // so only consider large indicies here.
        const contentEncoding = response.headers.get("content-encoding");
        this.gzipWarning = contentLength ? +contentLength > 100e3
        && !["gzip", "deflate", "br",
            "compress"].includes(contentEncoding || "") : false;

        while(true) {
            const chunk = await reader.read();

            if (chunk.done) {
                break;
            }

            const line = new TextDecoder("utf-8").decode(chunk.value);
            const lines = line.split(/\r?\n/);

            // attach last fragment and get next. May result in no lines yet!
            lines[0] = fragment + lines[0];
            fragment = lines.pop() || "";

            // so have to detect the first line
            // first iteration may have no lines!
            if (lines.length > 0 && this.indexAgeMs == 0) {
                // must be header
                const firstLine = lines.shift();
                if (!firstLine) continue;
                let fields = firstLine.split(" ");
                this.numTotal = parseInt(fields[0]);
                this.totalSize = parseInt(fields[1]);
                this.indexAgeMs = Date.now() - parseInt(fields[2]) * 1000;
            }

            // this loop is run many times, possibly zero times if the
            // first line is not complete on the first chunk
            for (let line of lines) {
                let fields = line.split(/ (.*)/);
                let size = parseInt(fields[0]);
                // normalise path so no leading ./
                let path = joinPath(fields[1]);
                                
                let result: Result = {
                    size: size,
                    path: path,
                }

                // add to index
                this.index.push(result);
                // transform and emit as result if appropriate
                this.processCandidate(result);
            }

            this.maybeEmitReport();
        }
        // this will only happen before a new search or after searching the
        // index if a download was still in progress (as searching the index is
        // blocking)
        this.searching = false;
        this.maybeEmitReport(true);

        this.indexComplete = true;
    }

    newSearch(query: string) {
        this.onInvalidateResults();
        this.results = [];
        this.query = query;
        this.start = performance.now();
        this.numSearched = 0;
        this.searching = true;
        this.maybeEmitReport(true);

        // emit results for existing index (this works without locking as
        // there's only 1 thread and this is blocking/synchronous
        for (const path of this.index) {
            this.processCandidate(path);
            this.maybeEmitReport();
        }

        if (this.indexComplete) {
            // no more incoming paths to search as they arrive
            this.searching = false;
            this.maybeEmitReport(true);
        }
    }

    // to override!
    // called whenever a single match is found. Use to build an array of
    // matches that should be emptied when the invalidate results callback is
    // fired. Invalidation happens when a new search is carried out.
    onResult(result: Result) {
        throw new Error("onResult needs to be overridden before searching");
    }

    // called when the search query changes and the UI must remove all current
    // results
    onInvalidateResults() {
        throw new Error("onInvalidateResults needs to be overridden before searching");
    }

    // query is specified in case SearchEngine is running behind (so UI can
    // show a non-deterministic progress bar until the current search is
    // displayed)
    onProgressUpdate(report: ProgressReport) {}

    // transform and emit as result if matches, is unique and less than 100 results
    protected processCandidate(result: Result) {
        // assume one byte per character (+ /n) for approximation
        this.numSearched += 1;

        this.maybeEmitReport();

        if (this.results.length >= this.resultLimit) {
            return;
        }

        if (!matchesQuery(result.path, this.query)) {
            return;
        }

        // this is a match but maybe not the highest match (if directory can be matched)
        // if it is a directory, there are likely to be many results that
        // resolve to the same highest path. Only emit result if unique.
        const highestPath = highestMatch(result.path, this.query);

        // check if already in results
        for (const existing of this.results) {
            if (highestPath == existing.path) {
                return;
            }
        }

        if (highestPath == result.path) {
            this.onResult(result);
            this.results.push(result);
        } else {
            // must be a directory
            const newResult = {path: highestPath};
            this.onResult(newResult);
            this.results.push(newResult);
        }
    }

    // emit a report, throttled. Note that setInterval cannot be used as
    // searching the existing index is blocking
    protected maybeEmitReport(force: boolean = false) {
        if (!force && performance.now() - this.lastReportTime < MIN_REPORT_INTERVAL) {
            return;
        }

        const report = {
            searching: this.searching,
            numSearched: this.numSearched,
            numResults: this.results.length,
            totalSize: this.totalSize,
            numTotal: this.numTotal,
            percentSearched: this.numTotal ? Math.round(100*this.numSearched/this.numTotal) : 0,
            elapsedMs: performance.now() - this.start,
            query: this.query,
            indexAgeMs: this.indexAgeMs,
            gzipWarning: this.gzipWarning,
        }

        this.onProgressUpdate(report);
        this.lastReportTime = performance.now();

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
function highestMatch(path: string, query: string): string {
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

