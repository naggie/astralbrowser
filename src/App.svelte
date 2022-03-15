<script lang="ts">
    // TODO mount search on interest (focus etc) to start building index
    // TODO maybe instant search
    import { hash } from './stores';
    import SearchEngine from './searchengine';
    import LsDir from './LsDir.svelte';
    import Search from './Search.svelte';
    import { joinPath } from './util';
    export let mountPoint: string;
    // show for / only
    export let readme: HTMLElement;

    let path: string = "/";
    let search: string = "";

    const indexUrl = joinPath(mountPoint, '.index');

    function handlePathSubmit(e: Event) {
        window.location.hash = joinPath("/", e.target.elements["path"].value, "/");
    }

    function handleSearchSubmit(e: Event) {
        window.location.hash = '?' + e.target.elements["search"].value;
    }

    $: if ($hash.startsWith("?")) {
        search = $hash.slice(1);
        path = "";
    } else {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', $hash, '/');
        search = "";
    }

    // show readme if appropriate (after load so it does not jump)
    $: readme.style.display = path == '/' ? "block" : "none";

    // when search bar is focussed, index is built
    const searchEngine = new SearchEngine(indexUrl);
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" on:submit|preventDefault={handlePathSubmit}>
        <input type="text" value={path} name="path" spellcheck="false">
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" on:submit|preventDefault={handleSearchSubmit}>
<input type="text" value={search} name="search" placeholder="Search" spellcheck="false" on:focus|once={searchEngine.buildIndex}>
        <input type="submit" hidden />
    </form>
</div>

{#if path}
<LsDir mountPoint={mountPoint} path={path} />
{:else if search}
<Search mountPoint={mountPoint} searchEngine />
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
