import SearchEngine from './searchengine';
// Simple Web Worker wrapper for search engine to allow for a completely unblocked UI.
// https://www.jameslmilner.com/post/workers-with-webpack-and-typescript/

let searchEngine: SearchEngine;

self.addEventListener("message", (e) => {
    const cmd: WorkerCmd = e.data;
    console.log(cmd);   // TODO remove

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
