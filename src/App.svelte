<script lang="ts">
    // TODO mount search on interest (focus etc) to start building index
    // TODO maybe instant search
    // TODO deal with race where callback is registered after commencing search (query in search as before)
    import { hash } from './stores';
    import SearchEngine from './searchengine';
    import LsDir from './LsDir.svelte';
    import Search from './Search.svelte';
    import { joinPath } from './util';
    // path is what user sees, mountpoint is where path exists
    export let mountPoint: string;
    // show for / only
    export let readme: HTMLElement;

    let path: string = "/";
    let query: string = "";

    function handlePathSubmit(e: Event) {
        window.location.hash = joinPath("/", e.target.elements["path"].value, "/");
    }

    function handleSearchSubmit(e: Event) {
        window.location.hash = '?' + e.target.elements["query"].value;
    }

    // when search bar is focussed, index is built
    const indexUrl = joinPath(mountPoint, '.index');
    const searchEngine = new SearchEngine(indexUrl);

    $: if ($hash.startsWith("?")) {
        query = $hash.slice(1);
        path = "";
        searchEngine.buildIndex();  // idempotent!
    } else {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', $hash, '/');
        query = "";
    }

    // show readme if appropriate (after load so it does not jump)
    $: readme.style.display = path == '/' ? "block" : "none";
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" on:submit|preventDefault={handlePathSubmit}>
        <input type="text" value={path} name="path" spellcheck="false">
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" on:submit|preventDefault={handleSearchSubmit}>
<input type="text" value={query} name="query" placeholder="Search" spellcheck="false" on:focus|once={() => searchEngine.buildIndex()}>
        <input type="submit" hidden />
    </form>
</div>

{#if path}
<LsDir mountPoint={mountPoint} path={path} />
{:else if query}
<Search searchEngine={searchEngine} mountPoint={mountPoint} query={query} />
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
