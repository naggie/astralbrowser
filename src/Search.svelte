<script lang="ts">
    import SearchEngine from './searchengine';
    import { joinPath } from './util';
    export let base: string = "";
    export let indexUrl: string;
    export let query: string = "";
    const resultLimit = 100;

    let results: string[] = [];

    const search = new SearchEngine(indexUrl, resultLimit);
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

{#if results == 1}
    1 result
{:else if results.length < resultLimit}
    {results.length} results
{:else}
    {results.length}+ results
{/if}
