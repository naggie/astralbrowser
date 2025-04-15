<script lang="ts">
    import { humanFileSize, humanRelativeTime, joinPath, parentDir } from './util';
    export let mountPoint: string;

    export let path: string = "/";

    let listingReq: Promise<Listing>;

    async function load_path(path: string) : Promise<Listing> {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', path, '/');

        // can get annoying if we don't do this
        window.scroll(0,0);

        const response = await fetch(
            joinPath(mountPoint, path),
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        )
        if (response.status == 404) {
            throw new Error("Directory does not exist");
        } else if (response.status != 200) {
            throw new Error("Error loading directory");
        }

        return response.json();
    }

    $: listingReq = load_path(path);
</script>

{#await listingReq}
<div class="accesswait"><div class="progress-line"></div></div>
{:then listing}
<table style="table-layout: fixed; word-wrap: break-word;">
    <thead>
      <tr>
        <th>Name</th>
        <th style="width:100px">Size</th>
        <th style="width:280px">Modified</th>
      </tr>
    </thead>
    <tbody>
    {#if path != "/"}
      <tr>
        <td><a class="astralbrowser-parent-directory" href={'#' + parentDir(path)}>../</a></td>
        <td>-</td>
        <td>-</td>
      </tr>
    {/if}
    {#each listing as item}
        {#if item.type == "directory"}
          <tr>
            <td><a class="astralbrowser-directory" href={'#' + joinPath(path, item.name, "/")}>{joinPath(item.name, "/")}</a></td>
            <td>-</td>
            <td>{humanRelativeTime(item.mtime)}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td><a href={joinPath(mountPoint, path, item.name)} download>{item.name}</a></td>
            <td>{humanFileSize(item.size)}</td>
            <td>{humanRelativeTime(item.mtime)}</td>
          </tr>
        {/if}
    {/each}
    </tbody>
</table>

{:catch error}
<p class="warningbox">{error.message}</p>
{/await}
