<script lang="ts">
    import SearchEngine from './searchengine';
    import { joinPath } from './util';
    export let base: string = "";
    export let query: string = "";
    export let searchEngine: SearchEngine;

    let results: string[] = [];

    searchEngine.onResult = result => results = [...results, result];
    searchEngine.onInvalidateResults = () => results = [];

    $: searchEngine.newSearch(query);
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
