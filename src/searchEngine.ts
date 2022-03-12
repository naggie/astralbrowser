// TODO match on directories, high as possible, ignore dupes, via results filter?

class SearchEngine {
    // a list of files, built and searched concurrently
    const index: string[] = [];
    protected let _onResult: Function = () => {};
    protected let _onInvalidateResults: Function = () => {};

    construtor(indexUrl: string) {
        // index file should be a line delimited list of files relative to base
        let response = await fetch(indexUrl);
        const reader = response.body.getReader();
        const contentLength: number = +response.headers.get('Content-Length');
        let receivedLength: number = 0;

        // the last bit after the previous linebreak that may form part of the
        // next incoming
        let fragment: string = "";

        while(true) {
            const {done: boolean, value: Uint8} = await reader.read();

            if (done) {
                break;
            }

            receivedLength += value.length;

            const text = new TextDecoder("utf-8").decode(value);
            const lines = text.split(/\r?\n/);

            lines[0] = fragment + lines[0];
            fragment = array.pop();

            for (const line of lines) {
                this.onNewLine(line);
            }

            console.log(`Received ${receivedLength} of ${contentLength}`)
        }
    }

    newSearch(query: string) {
        this._onInvalidateResults();

        // emit results for existing index (this works without locking as
        // there's only 1 thread and this is blocking/synchronous
        for (const line of index) {
            if (matchesQuery(line, query)) {
                this._onResult(line);
            }
        }
    }

    onInvalidateResults(fn: Function) {
        this._onInvalidateResults = fn;
    }

    // called whenever a single match is found. Use to build an array of
    // matches that should be emptied when the invalidate results callback is
    // fired. Invalidation happens when a new search is carried out.
    onResult(fn: Function) {
        this._onResult = fn;
    }

    protected onNewLine(line: string) {
        // add to index
        index.push(line);

        // emit new results that current search is unaware of
        if (matchesQuery(line, query)) {
            this._onResult(line);
        }
    }
}

function matchesQuery(text: string, query: string): bool {
    // TODO more advanced matching -- split by whitespace and match
    // sequentially. Also, outside of this, match highest directory and ignore
    // resulting dupes
    if (query == "") {
        return false;
    }

    return text.toLowerCase().includes(query.toLowerCase());
}
