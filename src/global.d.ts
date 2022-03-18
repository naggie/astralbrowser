/// <reference types="svelte" />

// this way the interfaces will be in global scope without explicitly telling
// the compiler to make everything in this file global
declare global {
    interface Directory {
        type: "directory";
        name: string;
        mtime: string;
    }

    interface File {
        name: string;
        type: "file";
        mtime: string;
        size: number;
    }

    type Listing = Array<File|Directory>;

    interface ProgressReport {
        searching: boolean;
        numSearched: number;
        numResults: number;
        // approximated via bytes of full content length
        percentSearched: number;
        percentIndexDownloaded: number;
        elapsedMs: number;
        // current query, so it's possible to tell if the search engine is behind
        // and make the UI reflect that
        query: string;
    }

    // for the worker abstraction which allows the search engine to be used
    // such that it does not block the UI thread
    interface WorkerInitCmd {
        type: "init",
        indexUrl: string,
    }

    interface WorkerBuildIndexCmd {
        type: "buildIndex",
    }

    interface WorkerNewSearchCmd {
        type: "newSearch",
        query: string,
    }

    type WorkerCmd = WorkerInitCmd | WorkerBuildIndexCmd | WorkerNewSearchCmd;

    interface WorkerResultResponse {
        type: "result",
        path: string,
    }

    interface WorkerProgressUpdateResponse {
        type: "progressUpdate",
        report: ProgressReport,
    }

    interface WorkerInvalidateResultsResponse {
        type: "invalidateResults",
    }

    type WorkerResponse = WorkerResultResponse | WorkerProgressUpdateResponse | WorkerInvalidateResultsResponse;
}

// necessary, else the file won't be included
export {}
