import SearchEngine from './searchengine';
// Simple Web Worker wrapper for search engine to allow for a completely unblocked UI.

// TODO consider https://www.npmjs.com/package/rollup-plugin-web-worker-loader
// to avoid additional request in the critical path

// https://www.jameslmilner.com/post/workers-with-webpack-and-typescript/
// Not entirely sure about this. Will read later.
const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => {
    const cmd: WorkerCmd = event.data;
    let searchEngine: SearchEngine;

    switch(cmd.type) {
        case "init":
            searchEngine = new SearchEngine(cmd.indexUrl);
            searchEngine.onResult = result => ctx.postMessage({
                type: "result",
                path: result,
            });
            searchEngine.onProgressUpdate = progressReport => ctx.postMessage({
                type: "progressUpdate",
                report: progressReport,
            });
            searchEngine.onInvalidateResults = () => ctx.postMessage({type: "invalidateResults"});
            break;
        case "buildIndex":
            searchEngine.buildIndex();
            break;
        case "newSearch":
            searchEngine.newSearch(cmd.query);
            break
        default:
            throw new Error("Unknown command");
    }
});
