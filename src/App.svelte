<script lang="ts">
    // TODO maybe instant search
    import { hash } from './stores';
    import LsDir from './LsDir.svelte';
    import { joinPath } from './util';
    import SearchEngineWorker from 'web-worker:./searchengineworker';
    import SearchResultsView from './SearchResultsView.svelte';
    // path is what user sees, mountpoint is where path exists
    export let mountPoint: string;

    const indexUrl = joinPath(window.location.origin, mountPoint, '.index.txt');
    let searchResults: Result[] = [];
    let searchReport: ProgressReport;
    let searchError: string = "";
    let path: string = "/";
    let query: string = "";

    const searchEngineWorker = new SearchEngineWorker();
    // (when search bar is focused, index is built)
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

    function handlePathSubmit(e: any) {
        window.location.hash = joinPath("/", e.target.elements["path"].value, "/");
    }

    function handleSearchSubmit(e: any) {
        window.location.hash = '?' + e.target.elements["query"].value;
    }

    $: if ($hash.startsWith("?")) {
        query = $hash.slice(1);
        path = "";
        searchEngineWorker.postMessage({type:"buildIndex"});
    } else {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', $hash, '/');
        query = "";
    }

    $: searchEngineWorker.postMessage({type:"newSearch", query: query});
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" on:submit|preventDefault={handlePathSubmit}>
        <input type="text" value={path || query && "Search results"} name="path" spellcheck="false" disabled={!!query}>
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" on:submit|preventDefault={handleSearchSubmit}>
        <input type="text" value={query} name="query" placeholder="Search" spellcheck="false" on:focus={() => searchEngineWorker.postMessage({type:"buildIndex"}) }>
        <input type="submit" hidden />
    </form>
</div>

{#if path}
<LsDir mountPoint={mountPoint} path={path} />
{:else if query}
<SearchResultsView results={searchResults} report={searchReport} error={searchError} mountPoint={mountPoint} />
{:else}
Nothing to do.
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
</style>
