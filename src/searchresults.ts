import SearchEngineWorker from 'web-worker:./searchengineworker';

// provides a better interface around the raw search worker
export default class SearchResults {
    results: string[] = [];
    report: ProgressReport;
    error: string;
    searchEngineWorker: SearchEngineWorker;

    constructor(indexUrl: string, resultLimit: number = 100) {
        this.searchEngineWorker = new SearchEngineWorker();
        this.searchEngineWorker.onmessage = function(e) {
            const response: WorkerResponse = e.data;

            switch(response.type) {
                case "result":
                    this.results = [...this.results, response.path];
                    this.error = undefined;
                    break;
                case "progressUpdate":
                    this.report = response.report;
                    break;
                case "invalidateResults":
                    this.results = [];
                    break;
                case "error":
                    this.error = response.error;
                    break;
                default:
                    throw new Error("Unknown worker response");
            }
        }
        this.searchEngineWorker.postMessage({type:"init", indexUrl: indexUrl, buildIndex: resultLimit});
    }

    buildIndex() {
        // idempotent, concurrent!
        this.searchEngineWorker.postMessage({type:"buildIndex"});
    }

    newSearch(query: string) {
        this.searchEngineWorker.postMessage({type:"newSearch", query: query});
    }
}
