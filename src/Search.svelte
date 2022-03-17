<script lang="ts">
    // can handle a million files whilst still being responsive!
    import SearchEngine from './searchengine';
    import { joinPath } from './util';
    export let searchEngine: SearchEngine;
    export let mountPoint: string = "";
    export let query: string = "";

    let report: ProgressReport;

    let results: string[] = [];

    searchEngine.onResult = result => results = [...results, result];
    searchEngine.onProgressUpdate = progressReport => report = progressReport;
    searchEngine.onInvalidateResults = () => results = [];

    // it's important this is done after binding handlers so it has to be here
    // instead of outside this component, as a race can occur if this component
    // is not mounted yet; for instance on initial hash based search.
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
            <td><a href={joinPath(mountPoint, path)} download>{path}</a></td>
          </tr>
        {/if}
    {/each}
    </tbody>
</table>
