<script lang="ts">
    import { hash, navigateHash } from './stores';
    import LsDir from './LsDir.svelte';
    import { joinPath } from './util';
    import SearchEngineWorker from './searchengineworker?worker&inline';
    import SearchResultsView from './SearchResultsView.svelte';
    import { onMount, untrack } from 'svelte';

    let { mountPoint }: { mountPoint: string } = $props();

    let input: HTMLInputElement;

    // mountPoint is fixed at mount time; untrack avoids a spurious reactivity warning
    const indexUrl = new URL(joinPath(untrack(() => mountPoint), '.index.txt'), window.location.origin).href;
    let searchResults: Result[] = $state([]);
    let searchReport: ProgressReport = $state(undefined);
    let searchError: string = $state("");
    // The URL hash is the single source of truth. A leading "?" means a global
    // search ("#?term"); anything else is a directory path. Search is not
    // path-scoped, so no path is kept in the URL while searching.
    const isSearchHash = (h: string) => h.startsWith("?");
    const hashToQuery = (h: string) => isSearchHash(h) ? h.slice(1) : "";
    const hashToPath = (h: string) => isSearchHash(h) ? "/" : joinPath('/', h, '/');

    let query: string = $state("");
    let path: string = $derived(hashToPath($hash));
    // Directory to return to when a search is cleared, captured on entry.
    let preSearchHash: string = "";

    const searchEngineWorker = new SearchEngineWorker();
    searchEngineWorker.onmessage = (e) => {
        const response: WorkerResponse = e.data;

        switch(response.type) {
            case "result":
                searchResults = [...searchResults, response.result];
                searchError = undefined;
                break;
            case "progressUpdate":
                searchReport = response.report;
                break;
            case "invalidateResults":
                searchResults = [];
                break;
            case "error":
                searchError = response.error;
                break;
            default:
                throw new Error("Unknown worker response");
        }
    }
    searchEngineWorker.postMessage({type:"init", indexUrl: indexUrl, resultLimit: 100});

    function handlePathSubmit(e: SubmitEvent) {
        const form = e.target as HTMLFormElement;
        window.location.hash = joinPath("/", (form.elements as any)["path"].value, "/");
    }

    function handleSearchInput(e: Event) {
        const value = (e.currentTarget as HTMLInputElement).value;
        const entering = query === "" && value !== "";
        if (entering) preSearchHash = $hash;  // remember directory to restore
        query = value;
        if (value)
            // Push one history entry when search begins, then replace it on each
            // keystroke so typing doesn't flood the back stack.
            navigateHash("?" + encodeURIComponent(value), !entering);
        else
            navigateHash(preSearchHash, true);  // restore directory in place
    }

    // Keep search box in sync with the hash for back/forward and deep links.
    $effect(() => {
        query = hashToQuery($hash);
    });

    $effect(() => {
        searchEngineWorker.postMessage({type:"newSearch", query: query});
    });

    $effect(() => {
        if (query) {
            searchEngineWorker.postMessage({type:"buildIndex"});
        }
    });

    onMount(() => {
        input.focus();
    });
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" onsubmit={(e) => { e.preventDefault(); handlePathSubmit(e); }}>
        <input type="text" value={query && "Search results" || path} name="path" spellcheck="false" disabled={!!query}>
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" onsubmit={(e) => e.preventDefault()}>
        <input type="text" value={query} oninput={handleSearchInput} name="query" placeholder="Search" spellcheck="false" autocomplete="off" bind:this={input} />
        <input type="submit" hidden />
    </form>
</div>

{#if query}
<!-- Result links are #-anchors; the hash effect exits search when clicked. -->
<SearchResultsView results={searchResults} report={searchReport} error={searchError} mountPoint={mountPoint} />
{:else}
<LsDir mountPoint={mountPoint} path={path} />
{/if}

<style>
    /* hack: assumes mount target has id="astralbrowser" */
    :global(#astralbrowser) {
        padding: 0 20px;
    }

    :global(#astralbrowser-toolbar) {
        display:flex;
    }

    :global(#astralbrowser-toolbar input) {
        width:100%;
    }

    :global(#astralbrowser-toolbar-path) {
        width:70%;
    }

    :global(#astralbrowser-toolbar-search) {
        width:30%;
    }

    :global(#astralbrowser-toolbar form input[name=path]),
    :global(#astralbrowser-toolbar form input[name="path"]:focus) {
        border: none!important;
        background: transparent;
        color: var(--heading);
        box-shadow: none;
        padding-left: 0;
    }

    /* Narrow screens: collapse table rows into cards by switching the table,
       tr, and td elements to block/inline display. Each row becomes a card with
       the name prominent on the first line and secondary metadata (size, date,
       path) flowing inline below it. */
    @media (max-width: 700px) {
        :global(#astralbrowser table),
        :global(#astralbrowser table tbody) {
            display: block;
        }

        :global(#astralbrowser table thead) {
            display: none;
        }

        :global(#astralbrowser table tbody tr) {
            display: block;
            padding: 10px 12px;
            padding-right: 90px; /* clearance for the absolute play button */
            margin-bottom: 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.3);
        }

        /* reset even-row stripe so all cards have the same background */
        :global(#astralbrowser table tbody tr:nth-child(even)) {
            background: rgba(255, 255, 255, 0.3);
        }

        :global(#astralbrowser table tbody td) {
            display: block;
            padding: 2px 0;
        }

        /* name / primary column: prominent, single line with ellipsis */
        :global(#astralbrowser table tbody td:first-child) {
            font-size: 16px;
            padding-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* secondary columns (size, date, path) run inline on one line */
        :global(#astralbrowser table tbody td:not(:first-child)) {
            display: inline;
            font-size: 13px;
            color: #555;
            padding: 0;
        }
    }
</style>
