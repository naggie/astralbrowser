<script lang="ts">
    // TODO maybe instant search
    import { hash } from './stores';
    import LsDir from './LsDir.svelte';
    import { joinPath } from './util';
    import SearchResults from './searchresults';
    import SearchResultsView from './SearchResultsView.svelte';
    // path is what user sees, mountpoint is where path exists
    export let mountPoint: string;

    let path: string = "/";
    let query: string = "";

    function handlePathSubmit(e: Event) {
        window.location.hash = joinPath("/", e.target.elements["path"].value, "/");
    }

    function handleSearchSubmit(e: Event) {
        window.location.hash = '?' + e.target.elements["query"].value;
    }

    // when search bar is focused, index is built
    // note due to worker context, fully qualified url is required
    const indexUrl = joinPath(window.location.origin, mountPoint, '.index.txt');
    const searchResults = new SearchResults(indexUrl, 100);

    $: if ($hash.startsWith("?")) {
        query = $hash.slice(1);
        path = "";
        searchResults.buildIndex();
    } else {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', $hash, '/');
        query = "";
    }

    $: searchResults.newSearch(query);
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" on:submit|preventDefault={handlePathSubmit}>
        <input type="text" value={path} name="path" spellcheck="false">
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" on:submit|preventDefault={handleSearchSubmit}>
        <input type="text" value={query} name="query" placeholder="Search" spellcheck="false" on:focus={() => searchResults.buildIndex()}>
        <input type="submit" hidden />
    </form>
</div>

{#if path}
<LsDir mountPoint={mountPoint} path={path} />
{:else if query}
<SearchResultsView searchResults={searchResults} mountPoint={mountPoint} />
{/if}


{#if !path && !query}
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
