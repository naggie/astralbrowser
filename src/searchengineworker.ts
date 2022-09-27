import SearchEngine from './searchengine';
// Simple Web Worker wrapper for search engine to allow for a completely unblocked UI.
// https://www.jameslmilner.com/post/workers-with-webpack-and-typescript/

let searchEngine: SearchEngine;

self.addEventListener("message", async (e) => {
    const cmd: WorkerCmd = e.data;
    try {
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
                await searchEngine.buildIndex();
                break;
            case "newSearch":
                searchEngine.newSearch(cmd.query);
                break
            default:
                throw new Error("Unknown command");
        }
    } catch(error) {
        console.log({type: "error", error: error.message});
    }
});
