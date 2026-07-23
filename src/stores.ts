import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

function getHash():string {
    return decodeURI(window.location.hash.slice(1));  // remove leading #
}

export const hash: Writable<string> = writable(getHash());

// Anchor clicks and back/forward change the fragment and fire hashchange.
window.addEventListener("hashchange", () => hash.set(getHash()));

// Programmatic navigation. history.pushState/replaceState do NOT fire
// hashchange, so the store is updated by hand to stay in sync. `replace` reuses
// the current history entry (used for search keystrokes so typing doesn't spam
// the back stack); otherwise a new entry is pushed.
export function navigateHash(fragment: string, replace = false): void {
    const url = "#" + fragment;
    if (replace) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
    hash.set(decodeURI(fragment));
}
