/// <reference types="svelte" />
export interface Directory {
    name: string;
    type: "directory";
    mtime: string;
}

export interface File {
    name: string;
    type: "file";
    mtime: string;
    size: number;
}

export type Listing = Array<File|Directory>;
