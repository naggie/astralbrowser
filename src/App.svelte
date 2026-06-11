<script lang="ts">
    import { hash } from './stores';
    import LsDir from './LsDir.svelte';
    import { joinPath } from './util';
    import SearchEngineWorker from './searchengineworker?worker&inline';
    import SearchResultsView from './SearchResultsView.svelte';
    import { onMount, untrack } from 'svelte';

    let { mountPoint }: { mountPoint: string } = $props();

    let input: HTMLInputElement;

    // mountPoint is fixed at mount time; untrack avoids a spurious reactivity warning
    const indexUrl = new URL(joinPath(untrack(() => mountPoint), '.index.txt'), window.location.origin).href;
    let searchResults: Result[] = $state([]);
    let searchReport: ProgressReport = $state(undefined);
    let searchError: string = $state("");
    let path: string = $state("/");
    let query: string = $state("");

    const searchEngineWorker = new SearchEngineWorker();
    searchEngineWorker.onmessage = (e) => {
        const response: WorkerResponse = e.data;

        switch(response.type) {
            case "result":
                searchResults = [...searchResults, response.result];
                searchError = undefined;
                break;
            case "progressUpdate":
                searchReport = response.report;
                break;
            case "invalidateResults":
                searchResults = [];
                break;
            case "error":
                searchError = response.error;
                break;
            default:
                throw new Error("Unknown worker response");
        }
    }
    searchEngineWorker.postMessage({type:"init", indexUrl: indexUrl, resultLimit: 100});

    function handlePathSubmit(e: SubmitEvent) {
        const form = e.target as HTMLFormElement;
        window.location.hash = joinPath("/", (form.elements as any)["path"].value, "/");
    }

    function handleSearchResultClick(e: MouseEvent) {
        const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement;
        if (!a) return;
        query = "";
        path = joinPath('/', a.getAttribute('href').slice(1), '/');
    }

    $effect(() => {
        if ($hash) {
            path = joinPath('/', $hash, '/');
            query = "";
        }
    });

    $effect(() => {
        searchEngineWorker.postMessage({type:"newSearch", query: query});
    });

    $effect(() => {
        if (query) {
            searchEngineWorker.postMessage({type:"buildIndex"});
            path = "/";
        }
    });

    onMount(() => {
        input.focus();
    });
</script>

<div id="astralbrowser-toolbar">
    <form id="astralbrowser-toolbar-path" onsubmit={(e) => { e.preventDefault(); handlePathSubmit(e); }}>
        <input type="text" value={query && "Search results" || path} name="path" spellcheck="false" disabled={!!query}>
        <input type="submit" hidden />
    </form>
    <form id="astralbrowser-toolbar-search" onsubmit={(e) => e.preventDefault()}>
        <input type="text" bind:value={query} name="query" placeholder="Search" spellcheck="false" autocomplete="off" bind:this={input} />
        <input type="submit" hidden />
    </form>
</div>

{#if query}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={handleSearchResultClick}>
<SearchResultsView results={searchResults} report={searchReport} error={searchError} mountPoint={mountPoint} />
</div>
{:else}
<LsDir mountPoint={mountPoint} path={path} />
{/if}

<style>
    /* hack: assumes mount target has id="astralbrowser" */
    :global(#astralbrowser) {
        padding: 0 20px;
    }

    :global(#astralbrowser-toolbar) {
        display:flex;
    }

    :global(#astralbrowser-toolbar input) {
        width:100%;
    }

    :global(#astralbrowser-toolbar-path) {
        width:70%;
    }

    :global(#astralbrowser-toolbar-search) {
        width:30%;
    }

    :global(#astralbrowser-toolbar form input[name=path]),
    :global(#astralbrowser-toolbar form input[name="path"]:focus) {
        border: none!important;
        background: transparent;
        color: var(--heading);
        box-shadow: none;
        padding-left: 0;
    }

    :global(.astralbrowser-parent-directory:before) {
        content: "\21B0";
        display: inline-block;
        margin-right: 0.5em;
        position: relative;
        top: -1px;
    }

    :global(.astralbrowser-directory:before) {
        content: "\1F4C1";
        display: inline-block;
        margin-right: 0.5em;
        filter: saturate(0);
        position: relative;
        top: -1px;
    }

    /* Narrow screens: collapse table rows into cards by switching the table,
       tr, and td elements to block/inline display. Each row becomes a card with
       the name prominent on the first line and secondary metadata (size, date,
       path) flowing inline below it. */
    @media (max-width: 700px) {
        :global(#astralbrowser table),
        :global(#astralbrowser table tbody) {
            display: block;
        }

        :global(#astralbrowser table thead) {
            display: none;
        }

        :global(#astralbrowser table tbody tr) {
            display: block;
            padding: 10px 12px;
            margin-bottom: 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.3);
        }

        /* reset even-row stripe so all cards have the same background */
        :global(#astralbrowser table tbody tr:nth-child(even)) {
            background: rgba(255, 255, 255, 0.3);
        }

        :global(#astralbrowser table tbody td) {
            display: block;
            padding: 2px 0;
        }

        /* name / primary column: prominent, single line with ellipsis */
        :global(#astralbrowser table tbody td:first-child) {
            font-size: 16px;
            padding-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* secondary columns (size, date, path) run inline on one line */
        :global(#astralbrowser table tbody td:not(:first-child)) {
            display: inline;
            font-size: 13px;
            color: #555;
            padding: 0;
        }

        /* dot separator before the third column */
        :global(#astralbrowser table tbody td:nth-child(3)::before) {
            content: " · ";
            color: #aaa;
        }
    }
</style>
