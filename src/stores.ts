import { readable, Readable } from "svelte/store";

function getHash():string {
    const hash = window.location.hash.slice(1);  // remove hash
    return decodeURI(hash);
}

export const hash: Readable<string> = readable(getHash(), set => {
    const update = () => set(getHash());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
});
