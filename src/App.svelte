<script lang="ts">
    // TODO up button
    // TODO use hashref to allow bac/forward/boookmarking/URL sharing etc
    // TODO clickable path to jump to parents
    import { hash } from './stores';
    import { humanFileSize, humanRelativeTime, joinPath, parentDir } from './util';
    export let base: string;
    let req: Promise<Listing> | undefined;


    async function load_path(path: string) {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath(path, '/');

        // can get annoying if we don't do this
        window.scroll(0,0);

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
                throw new Error("Error loading procedure information");
            }
            return response.json();
        });
    }
    $: load_path($hash);
</script>


<h2>{joinPath("/", $hash, "/")}</h2>
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
    {#if joinPath("/", $hash, "/") != "/"}
      <tr>
        <td><a href={'#' + parentDir($hash)}>../</a></td>
        <td>-</td>
        <td>-</td>
      </tr>
    {/if}
    {#each listing as item}
        {#if item.type == "directory"}
          <tr>
            <td><a href={'#' + joinPath("/", $hash, item.name, "/")}>{joinPath(item.name, "/")}</a></td>
            <td>-</td>
            <td>{humanRelativeTime(item.mtime)}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td><a href={joinPath(base, $hash, item.name)} download>{item.name}</a></td>
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
