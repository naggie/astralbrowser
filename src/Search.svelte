<script lang="ts">
    import SearchEngine from './searchengine';
    import { joinPath } from './util';
    export let base: string = "";
    export let indexUrl: string;
    export let query: string = "";

    let results: string[] = [];

    const search = new SearchEngine(indexUrl);
    search.begin();

    search.onResult = result => results = [...results, result];
    search.onInvalidateResults = () => results = [];

    $: search.newSearch(query);
</script>

<table>
    <thead>
      <tr>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
    {#each results as path}
        {#if path.endsWith("/")}
          <tr>
            <td><a href={'#' + path}>{path}</a></td>
          </tr>
        {:else}
          <tr>
            <td><a href={joinPath(base, path)} download>{path}</a></td>
          </tr>
        {/if}
    {/each}
    </tbody>
</table>

<p>
{#if results == 1}
    1 result.
{:else}
    {results.length} results.
{/if}
</p>
