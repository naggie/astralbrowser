<script lang="ts">
    // can handle a million files whilst still being responsive!
    import { joinPath, splitName } from './util';
    export let searchEngineWorker: Worker;
    export let mountPoint: string = "";
    export let query: string = "";
    const MAX_INDEX_AGE = 2 * 3600 * 1000;

    let report: ProgressReport;
    let error: string;

    let results: string[] = [];

    searchEngineWorker.onmessage = function(e) {
        const response: WorkerResponse = e.data;

        switch(response.type) {
            case "result":
                results = [...results, response.path];
                error = undefined;
                break;
            case "progressUpdate":
                report = response.report;
                break;
            case "invalidateResults":
                results = [];
                break;
            case "error":
                // locks up for good
                error = response.error;
                break;
            default:
                throw new Error("Unknown command");
        }
    }

    // it's important this is done after binding handlers so it has to be here
    // instead of outside this component, as a race can occur if this component
    // is not mounted yet; for instance on initial hash based search.
    $: searchEngineWorker.postMessage({type:"newSearch", query: query});

    // TODO show search results as name/path
</script>


{#if report && report.numSearched > 0}
<div class="astralbrowser-status">
    <div class="astralbrowser-progress">
        <div class="astralbrowser-progress-bar" style="width:{report.percentSearched}%"></div>
    </div>
    Searched {report.numSearched} items in {report.elapsedMs | 0}ms
    {#if report.indexAgeMs > MAX_INDEX_AGE}
    <p class="warningbox">Warning: index is old. Results may be invalid.</p>
    {/if}
</div>
{/if}

{#if error && query}
<div class="astralbrowser-status">
    <p class="warningbox">{error}</p>
</div>
{/if}

{#if results.length > 0}
    <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Path</th>
          </tr>
        </thead>
        <tbody>
        {#each results.map(splitName) as [path, name]}
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
