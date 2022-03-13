<script lang="ts">

    import SearchEngine from './searchengine';
    export let indexUrl: string;
    export let query: string = "";

    let results: string[] = [];

    const search = new SearchEngine(indexUrl);

    $: search.newSearch(query);

    search.onResult(result => results = [...results, result]);
    search.onInvalidateResults(() => results = []);
</script>
SEARCH IS HERE
{#each results as result}
<p>{result}</p>
{/each}

