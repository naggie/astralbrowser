<script lang="ts">
    // TODO maybe instant search
    import { hash } from './stores';
    import LsDir from './LsDir.svelte';
    import { joinPath } from './util';
    import SearchEngineWorker from 'web-worker:./searchengineworker';
    import SearchResultsView from './SearchResultsView.svelte';
    import { onMount } from 'svelte';
    // path is what user sees, mountpoint is where path exists
    export let mountPoint: string;

    let input: HTMLInputElement;

    const indexUrl = joinPath(window.location.origin, mountPoint, '.index.txt');
    let searchResults: Result[] = [];
    let searchReport: ProgressReport;
    let searchError: string = "";
    let path: string = "/";
    let query: string = "";
    let inputQuery: string = "";

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


    // set initial inputQuery from hash
    if ($hash.startsWith("?")) {
        inputQuery = $hash.slice(1);
    }

    /* conditional to avoid initial change resulting in just #? in URL */
    $: if (window.location.hash || inputQuery) window.location.hash = '?' + inputQuery.trim();

    $: if ($hash.startsWith("?")) {
        query = $hash.slice(1);
        path = "";
        if (inputQuery.length > 0) {
            searchEngineWorker.postMessage({type:"buildIndex"});
        }
    } else {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', $hash, '/');
        query = "";
    }

    $: searchEngineWorker.postMessage({type:"newSearch", query: query});

    onMount(() => {
        input.focus();
    });
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" on:submit|preventDefault={handlePathSubmit}>
        <input type="text" value={path || query && "Search results"} name="path" spellcheck="false" disabled={!!query}>
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" on:submit|preventDefault={() => {}}>
        <input type="text" bind:value={inputQuery} name="query" placeholder="Search" spellcheck="false" autocomplete="off" bind:this={input} />
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
