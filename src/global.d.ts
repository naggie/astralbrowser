/// <reference types="svelte" />
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
}

export {}
