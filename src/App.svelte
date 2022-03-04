<script lang="ts">
    // TODO use hashref to allow bac/forward/boookmarking/URL sharing etc
    import { tick } from 'svelte';
    export let base: string;
    let path: string = "/";
    let req: Promise<Listing> | undefined;

    async function load_path() {
        let fullPath: string = normalise_path(path);
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


    function normalise_path(path: string): string {
        // TODO join and normalise (must end in "/" else could load gigabytes
        // and crash tab) return a path joined to the base, normalised, with a
        // training slash
        // TODO implement properly
        // TODO relative mode if no / ?
        return base + path;
    }

    function human_size(bytes: number): string {
        // TODO implement
        return bytes;
    }

    function human_relative_time(dateString: string): string{
        // TODO implement
        return dateString;
    }

    // get an absolute (relative to base) from a name considering the current path
    function get_joined_path(name: string) :string {
        // TODO implement cleanly
        return path + "/" + name;
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

<table class="wide">
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
            <td class="astralbrowser-file-name" on:click={() => {path = get_joined_path(item.name); load_path()}}>{item.name}/</td>
            <td>-</td>
            <td>{human_relative_time(item.mtime)}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td class="astralbrowser-file-name"><a href={get_joined_path(item.name)} download>{item.name}</a></td>
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
table td.astralbrowser-file-name {
    cursor: pointer;
}
</style>
