<script lang="ts">
    // can handle a million files whilst still being responsive!
    import SearchResultsRow from './SearchResultRow.svelte';
    export let results: Result[];
    export let report: ProgressReport;
    export let error: string = "";
    export let mountPoint: string = "";
    const MAX_INDEX_AGE = 2 * 3600 * 1000;
</script>

{#if error}
<div class="astralbrowser-status">
    <p class="warningbox">{error}</p>
</div>
{/if}

{#if report }
{#if report.indexAgeMs > MAX_INDEX_AGE}
<p class="warningbox">Warning: index is old. Results may be invalid.</p>
{/if}

{#if report.gzipWarning }
<p class="warningbox">Warning: index not sent with compressed content encoding. Search is 10x slower.</p>
{/if}

<div class="astralbrowser-status">
    <div class="astralbrowser-progress">
        <div class="astralbrowser-progress-bar" style="width:{report.percentSearched}%"></div>
    </div>
    Searched {report.numSearched} items in {report.elapsedMs | 0}ms
    {#if !report.searching && report.numResults == 0}
    <p>Nothing found.</p>
    {/if}
</div>
{/if}

{#if results.length > 0}
    <table style="table-layout: fixed;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Path</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
        {#each results as result}
            <SearchResultsRow result={result} mountPoint={mountPoint} />
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
        /* change back to var when re-enable when github.com/darionco/rollup-plugin-web-worker-loader/issues/60 is fixed and we can generate css */
        /* background-color: var(--bg); */
        background-color: white;
        display: flex;
        margin: 20px 0;
    }

    .astralbrowser-progress-bar {
        background-color: var(--active);
        transition: width 200ms;
    }
</style>
