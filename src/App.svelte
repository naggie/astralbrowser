<script lang="ts">
    // TODO clickable path fragments to jump to parents
    import { tick } from 'svelte';
    import { hash } from './stores';
    import { humanFileSize, humanRelativeTime, joinPath, parentDir } from './util';
    export let base: string;
    export let path: string = "/";
    // show for / only
    export let readme: HTMLElement;

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

    // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
    $: path = joinPath('/', $hash, '/');
    $: load_path(path);
</script>


<h2>{path}</h2>
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
    table {
        opacity:100%; /* placeholder so CSS file is created */
    }
</style>
