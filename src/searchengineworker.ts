import SearchEngine from './searchengine';
// Simple Web Worker wrapper for search engine to allow for a completely unblocked UI.

// TODO consider https://www.npmjs.com/package/rollup-plugin-web-worker-loader
// to avoid additional request in the critical path
// https://www.jameslmilner.com/post/workers-with-webpack-and-typescript/

self.addEventListener("message", (e) => {
    const cmd: WorkerCmd = e.data;
    let searchEngine: SearchEngine;

    switch(cmd.type) {
        case "init":
            searchEngine = new SearchEngine(cmd.indexUrl);
            searchEngine.onResult = result => self.postMessage({
                type: "result",
                path: result,
            });
            searchEngine.onProgressUpdate = progressReport => self.postMessage({
                type: "progressUpdate",
                report: progressReport,
            });
            searchEngine.onInvalidateResults = () => self.postMessage({type: "invalidateResults"});
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
