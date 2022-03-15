/// <reference types="svelte" />
export interface Directory {
    type: "directory";
    name: string;
    mtime: string;
}

export interface File {
    name: string;
    type: "file";
    mtime: string;
    size: number;
}

export type Listing = Array<File|Directory>;

export interface ProgressReport {
    searching: boolean;
    numSearched: number;
    numResults: number;
    // approximated via bytes of full content length
    percentSearched: number;
    elapsedMs: number;
}
