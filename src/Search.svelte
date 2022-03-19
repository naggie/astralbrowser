<script lang="ts">
    // can handle a million files whilst still being responsive!
    import { joinPath } from './util';
    export let searchEngineWorker: Worker;
    export let mountPoint: string = "";
    export let query: string = "";

    let report: ProgressReport;

    let results: string[] = [];

    searchEngineWorker.onmessage = (event) {
        const response: WorkerResponse = event.data;

        switch(response.type) {
            case "result":
                results = [...results, response.result];
                break;
            case "progressUpdate":
                report = response.report;
                break;
            case "invalidateResults":
                results = [];
                break;
            default:
                throw new Error("Unknown command");
        }
    }

    // it's important this is done after binding handlers so it has to be here
    // instead of outside this component, as a race can occur if this component
    // is not mounted yet; for instance on initial hash based search.
    $: searchEngineWorker.postMessage({type:"newSearch", query: query});
</script>


{#if report}
<div class="astralbrowser-status">
    <div class="astralbrowser-progress">
        <div class="astralbrowser-progress-bar" style="width:{report.percentSearched}%"></div>
    </div>
    Searched {report.numSearched} items in {report.elapsedMs}ms...
</div>
{/if}

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
</style>
