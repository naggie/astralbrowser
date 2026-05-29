<script lang="ts">
    import { onMount } from 'svelte';
    import SearchResultRow from './SearchResultRow.svelte';

    let { results, report, error = "", mountPoint = "" }: {
        results: Result[];
        report: ProgressReport;
        error?: string;
        mountPoint?: string;
    } = $props();

    let selected = $state(-1);
    let tbody: HTMLTableSectionElement = $state(undefined);

    const MAX_INDEX_AGE = 28 * 3600 * 1000;

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "ArrowDown") {
            if (selected < results.length - 1) {
                selected += 1;
            } else {
                selected = 0;
            }
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            if (selected > 0) {
                selected -= 1;
            } else {
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
    {#if report.numSearched > 0}
        Searched {report.numSearched} items in {report.elapsedMs | 0}ms
    {:else}
        Searching...
    {/if}
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
    .astralbrowser-progress,
    .astralbrowser-progress-bar {
        height: 1px;
        width: 100%;
        margin: 0;
    }

    .astralbrowser-progress {
        background-color: black;
        display: flex;
        margin: 20px 0;
    }

    .astralbrowser-progress-bar {
        background-color: white;
        transition: width 200ms;
    }
</style>
