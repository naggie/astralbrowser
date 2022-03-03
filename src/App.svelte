<script lang="ts">
    import { tick } from 'svelte';
    export let base: string;
    let path: string = "";
    let fullPath: string = "";
    let req: Promise<Listing> | undefined;

    // TODO join and normalise (must end in "/" else could load gigabytes and
    // crash tab)
    fullPath = normalise_path("");
    $: fullPath = normalise_path(path);


    async function load_path() {
        req = fetch(fullPath, {
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => {
            if (response.status == 404) {
                throw new Error("Directory does not exist");
            } else if (response.status != 200) {
                throw new Error("Error loading procedure information");
            }
            return response.json();
        });
    }


    function normalise_path(path: string) {
        // return a path joined to the base, normalised, with a training slash
        // TODO implement properly
        return base + "/" + path;
    }

    function human_size(bytes: number) {
        // TODO implement
        return bytes;
    }

    function human_relative_time(dateString: string) {
        // TODO implement
        return dateString;
    }

    load_path();
</script>

<form on:submit|preventDefault={load_path}>
    <input type="text" bind:value={path} />
    <input type="submit" value="Go" />
    <input type="button" value="Up" />
</form>

{#await req}
<div class="nis">Loading...</div>
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
    {#each listing as item}
        {#if item.type == "directory"}
          <tr>
            <td>{item.name}</td>
            <td>-</td>
            <td>{human_relative_time(item.mtime)}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td>{item.name}</td>
            <td>{human_size(item.size)}</td>
            <td>{human_relative_time(item.mtime)}</td>
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
    opacity: 100%; /*placeholder so css file is generated */
}
</style>
