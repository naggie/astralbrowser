<script lang="ts">
    // TODO maybe instant search
    import { hash } from './stores';
    import LsDir from './LsDir.svelte';
    import { joinPath } from './util';
    import SearchEngineWorker from 'web-worker:./searchengineworker';
    import SearchResultsView from './SearchResultsView.svelte';
    
    // path is what user sees, mountpoint is where path exists
    let { mountPoint }: { mountPoint: string } = $props();

    let input: HTMLInputElement;

    const indexUrl = joinPath(window.location.origin, mountPoint, '.index.txt');
    let searchResults: Result[] = $state([]);
    let searchReport: ProgressReport | undefined = $state(undefined);
    let searchError: string = $state("");
    let path: string = $state("/");
    let query: string = $state("");

    const searchEngineWorker = new SearchEngineWorker();
    // (when search bar is focused, index is built)
    searchEngineWorker.onmessage = (e) => {
        const response: WorkerResponse = e.data;

        switch(response.type) {
            case "result":
                searchResults = [...searchResults, response.result];
                searchError = "";
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

    function handlePathSubmit(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const pathInput = form.elements.namedItem("path") as HTMLInputElement;
        window.location.hash = joinPath("/", pathInput.value, "/");
    }

    // React to hash changes
    $effect(() => {
        const currentHash = $hash;
        if (currentHash) {
            // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
            path = joinPath('/', currentHash, '/');
            query = "";
        }
    });

    // React to query changes
    $effect(() => {
        searchEngineWorker.postMessage({type:"newSearch", query: query});
    });

    // React to query changes for building index
    $effect(() => {
        if (query) {
            searchEngineWorker.postMessage({type:"buildIndex"});
            path = "/";
        }
    });

    $effect(() => {
        input?.focus();
    });
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" onsubmit={handlePathSubmit}>
        <input type="text" value={query && "Search results" || path} name="path" spellcheck="false" disabled={!!query}>
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" onsubmit={(e) => { e.preventDefault(); }}>
        <input type="text" bind:value={query} name="query" placeholder="Search" spellcheck="false" autocomplete="off" bind:this={input} />
        <input type="submit" hidden />
    </form>
</div>

{#if query}
<SearchResultsView results={searchResults} report={searchReport} error={searchError} mountPoint={mountPoint} />
{:else}
<LsDir mountPoint={mountPoint} path={path} />
{/if}

<style>
    #astralbrowser-toolbar {
        display:flex;
    }

    #astralbrowser-toolbar input {
        width:100%;
    }

    #astralbrowser-toolbar-path {
        width:70%;
    }

    #astralbrowser-toolbar-search {
        width:30%;
    }

    #astralbrowser-toolbar form input[name=path],
    #astralbrowser-toolbar form input[name="path"]:focus {
        border: none!important;
        background: transparent;
        color: var(--heading);
        box-shadow: none;
        padding-left: 0;
    }

    :global(.astralbrowser-parent-directory:before) {
        content: "\21B0";
        display: inline-block;
        margin-right: 0.5em;
        position: relative;
        top: -1px;
    }

    :global(.astralbrowser-directory:before) {
        content: "\1F4C1";
        display: inline-block;
        margin-right: 0.5em;
        filter: saturate(0);
        position: relative;
        top: -1px;
    }
</style>
