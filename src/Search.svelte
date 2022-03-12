<script lang="ts">

    import SearchEngine from './searchengine';
    export let base: string;
    export let query: string = "";

    const search = new SearchEngine(base);

</script>

{#await listingReq}
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
