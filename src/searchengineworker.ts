import { SearchEngine } from './searchengine';

// TODO consider https://www.npmjs.com/package/rollup-plugin-web-worker-loader
// to avoid additional request in the critical path

// https://www.jameslmilner.com/post/workers-with-webpack-and-typescript/
// Not entirely sure about this. Will read later.
const ctx: Worker = self as any;

const searchEngine = new SearchEngine(indexUrl);

searchEngine.onResult = result => results = [...results, result];
searchEngine.onProgressUpdate = progressReport => report = progressReport;
searchEngine.onInvalidateResults = () => results = [];

// it's important this is done after binding handlers so it has to be here
// instead of outside this component, as a race can occur if this component
// is not mounted yet; for instance on initial hash based search.
searchEngine.newSearch(query);

ctx.addEventListener("message", (event) => {
    var cmd: WorkerCmd = event.data;

    switch(cmd.type) {
        case "init:
            break;
        case "buildIndex":
            break;
        case "buildIndex":
            break
        default:
            break;
    }
});
