<script lang="ts">
    import { tick } from 'svelte';
    import { hash } from './stores';
    import { humanFileSize, humanRelativeTime, joinPath, parentDir } from './util';
    export let base: string;
    // show for / only
    export let readme: HTMLElement;

    let path: string = "/";
    let search: string = "";

    let req: Promise<Listing> | undefined;

    async function load_path(path: string) {
        // can get annoying if we don't do this
        window.scroll(0,0);

        if (path != "/") readme.style.display = "none";

        req = fetch(
            joinPath(base, path),
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        )
        .then(response => {
            if (response.status == 404) {
                throw new Error("Directory does not exist");
            } else if (response.status != 200) {
                throw new Error("Error loading directory");
            }

            // show readme if appropriate (after load so it does not jump)
            if (path == "/") readme.style.display = "block";

            return response.json();
        });
    }

    function load_search(query: string) {
        console.log(query);
    }

    function handlePathSubmit(e: Event) {
        window.location.hash = joinPath("/", e.target.elements["path"].value, "/");
    }

    function handleSearchSubmit(e: Event) {
        window.location.hash = '?' + e.target.elements["search"].value;
    }

    $: if ($hash.startsWith("?")) {
        search = $hash.slice(1);
        load_search(search);
        path = "";
    } else {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', $hash, '/');
        load_path(path);
        search = "";
    }
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

{#await req}
<div class="accesswait"><div class="progress-line"></div></div>
{:then listing}
<table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Size</th>
        <th>Modified</th>
      </tr>
    </thead>
    <tbody>
    {#if path != "/"}
      <tr>
        <td><a href={'#' + parentDir(path)}>../</a></td>
        <td>-</td>
        <td>-</td>
      </tr>
    {/if}
    {#each listing as item}
        {#if item.type == "directory"}
          <tr>
            <td><a href={'#' + joinPath(path, item.name, "/")}>{joinPath(item.name, "/")}</a></td>
            <td>-</td>
            <td>{humanRelativeTime(item.mtime)}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td><a href={joinPath(base, path, item.name)} download>{item.name}</a></td>
            <td>{humanFileSize(item.size)}</td>
            <td>{humanRelativeTime(item.mtime)}</td>
          </tr>
        {/if}
    {/each}
    </tbody>
</table>

{:catch error}
<div class="nis nis-error">{error.message}</div>
{/await}

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
