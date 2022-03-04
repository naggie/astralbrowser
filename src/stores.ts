import { readable, Readable } from "svelte/store";

export const hash: Readable<string> = readable(window.location.hash.slice(1), set => {
    const update = () => set(window.location.hash.slice(1));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
});
