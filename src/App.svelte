<script lang="ts">
    // TODO use hashref to allow bac/forward/boookmarking/URL sharing etc
    import { hash } from './stores';
    export let base: string;
    let req: Promise<Listing> | undefined;


    async function load_path(path: string) {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = join_path(path, '/');

        req = fetch(
            join_path(base, path),
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

    function human_size(bytes: number): string {
        // TODO implement
        return bytes;
    }

    function human_relative_time(dateString: string): string{
        // TODO implement
        return dateString;
    }

    // get an absolute (relative to base) from a name considering the current path
    function join_path(...fragments: string) :string {
        // TODO normalise no double dot -- single slashes and resolve relative to /
        return fragments.join('/').replace(/\/+/g, '/');
    }

    $: load_path($hash);
    $: console.log($hash);
</script>


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
            <td><a href={'#' + join_path($hash, item.name)}>{item.name}</a></td>
            <td>-</td>
            <td>{human_relative_time(item.mtime)}</td>
          </tr>
        {:else if item.type == "file"}
          <tr>
            <td><a href={join_path(base, $hash, item.name)} download>{item.name}</a></td>
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
table td {
    opacity:100%; /* placeholder so css is created */
}
</style>
