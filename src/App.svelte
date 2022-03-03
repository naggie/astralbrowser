<script lang="ts">
    export let base: string;
    let path: string = "";
    let fullPath: string = "";

    // TODO join and normalise (must end in "/" else could load gigabytes and
    // crash tab)
    $: fullPath = base + path;

    async function load_path() {
        let req = fetch(fullPath, {
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
</script>

<input type="text" bind:value={path} />

<input type="button" value="Go" />
<input type="button" value="Up" />

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
            <td>{item.mtime}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td>{item.name}</td>
            <td>{item.size}</td>
            <td>{item.mtime}</td>
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
