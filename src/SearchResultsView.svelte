<script lang="ts">
    // can handle a million files whilst still being responsive!
    import { joinPath, splitName } from './util';
    export let searchResults: SearchResults;
    export let mountPoint: string = "";
    const MAX_INDEX_AGE = 2 * 3600 * 1000;
</script>


{#if searchResults.report && searchResults.report.numSearched > 0}
<div class="astralbrowser-status">
    <div class="astralbrowser-progress">
        <div class="astralbrowser-progress-bar" style="width:{searchResults.report.percentSearched}%"></div>
    </div>
    Searched {searchResults.report.numSearched} items in {searchResults.report.elapsedMs | 0}ms
    {#if searchResults.report.indexAgeMs > MAX_INDEX_AGE}
    <p class="warningbox">Warning: index is old. Results may be invalid.</p>
    {/if}
</div>
{/if}

{#if searchResults.error}
<div class="astralbrowser-status">
    <p class="warningbox">{searchResults.error}</p>
</div>
{/if}

{#if searchResults.results.length > 0}
    <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Path</th>
          </tr>
        </thead>
        <tbody>
        {#each searchResults.results.map(splitName) as [path, name]}
            {#if name.endsWith("/")}
              <tr>
                <td><a href={'#' + path + name}>{name}</a></td>
                <td><a class="path" href={'#' + path}>{path}</a></td>
              </tr>
            {:else}
              <tr>
                <td><a href={joinPath(mountPoint, path, name)} download>{name}</a></td>
                <td><a class="path" href={'#' + path}>{path}</a></td>
              </tr>
            {/if}
        {/each}
        </tbody>
    </table>
{/if}

<style>
    /* TODO: Migrate to global styles namespace so this can be re-used */
    .astralbrowser-progress,
    .astralbrowser-progress-bar {
        height: 1px;
        width: 100%;
        margin: 0;
    }

    .astralbrowser-progress {
        background-color: var(--bg);
        display: flex;
        margin: 20px 0;
    }

    .astralbrowser-progress-bar {
        background-color: var(--active);
    }

    .path {
        opacity: 0.8;
    }
</style>
