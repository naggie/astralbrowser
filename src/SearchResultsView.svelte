<script lang="ts">
    // can handle a million files whilst still being responsive!
    import { onMount } from 'svelte';
    import SearchResultRow from './SearchResultRow.svelte';
    export let results: Result[];
    export let report: ProgressReport;
    export let error: string = "";
    export let mountPoint: string = "";
    export let selected: number = -1;

    let tbody: HTMLTableSectionElement;

    // indexer runs every 24h
    const MAX_INDEX_AGE = 28 * 3600 * 1000;


    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "ArrowDown") {
            if (selected < results.length - 1) {
                selected += 1;
            } else {
                // wrap around
                selected = 0;
            }
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            if (selected > 0) {
                selected -= 1;
            } else {
                // wrap around
                selected = results.length - 1;
            }
            e.preventDefault();
        } else if (e.key === "Enter") {
            const a = tbody.querySelector("tr.selected a:first-child") as HTMLAnchorElement;
            if (a) {
                a.click();
            }
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("keydown", handleKeydown);
        }
    });
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
    <table style="table-layout: fixed; word-wrap: break-word;">
        <thead>
          <tr>
            <th>Name</th>
            <th style="width:60%;">Path</th>
            <th style="width:96px">Size</th> 
          </tr>
        </thead>
        <tbody bind:this={tbody}>
        {#each results as result, i}
            <SearchResultRow result={result} mountPoint={mountPoint} selected={i === selected} />
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
        background-color: black;
        display: flex;
        margin: 20px 0;
    }

    .astralbrowser-progress-bar {
        background-color: white;
        transition: width 200ms;
    }
</style>
