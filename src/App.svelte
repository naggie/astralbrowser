<script lang="ts">
    // TODO mount search on interest (focus etc) to start building index
    // TODO maybe instant search
    import { hash } from './stores';
    import LsDir from './LsDir.svelte';
    import Search from './Search.svelte';
    import { joinPath } from './util';
    export let base: string;
    // show for / only
    export let readme: HTMLElement;

    let path: string = "/";
    let search: string = "";

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
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" on:submit|preventDefault={handlePathSubmit}>
        <input type="text" value={path} name="path" spellcheck="false">
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" on:submit|preventDefault={handleSearchSubmit}>
        <input type="text" value={search} name="search" placeholder="Search" spellcheck="false">
        <input type="submit" hidden />
    </form>
</div>

{#if path}
<LsDir base={base} path={path} />
{:else if search}
<!-- TODO remove hard code -->
<Search base={base} indexUrl="/file-sharing/mnt/user-shares/.index" query={search} />
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
