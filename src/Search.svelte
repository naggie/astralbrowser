<script lang="ts">
    import SearchEngine from './searchengine';
    export let indexUrl: string;
    export let query: string = "";

    let results: string[] = [];

    const search = new SearchEngine(indexUrl);
    search.begin();

    search.onResult(result => results = [...results, result]);
    search.onInvalidateResults(() => results = []);

    $: search.newSearch(query);
</script>

{#each results as result}
<p>{result}</p>
{/each}

