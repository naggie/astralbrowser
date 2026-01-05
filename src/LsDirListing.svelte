<script lang="ts">
    import { parentDir } from './util';
    import LsDirRow from './LsDirRow.svelte';
    
    let { 
        mountPoint, 
        path = "/", 
        listing 
    }: { 
        mountPoint: string, 
        path?: string, 
        listing: Listing 
    } = $props();
    
    let selected: number = $state(-1);

    // Reset selected when path changes
    $effect(() => {
        selected = path == "/" ? -1 : -2;
    });

    // TODO refactor to avoid duplication with SearchResultsView?
    // by always prepending parent dir entry to listing?

    let tbody: HTMLElement;

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "ArrowDown") {
            if (selected < listing.length - 1) {
                selected += 1;
            } else {
                // wrap around
                selected = path != "/" ? -1 : 0;
            }
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            if (selected > 0 || (selected == 0 && path != "/")) {
                selected -= 1;
            } else {
                // wrap around
                selected = listing.length - 1;
            }
            e.preventDefault();
        } else if (e.key === "Enter") {
            const a = tbody.querySelector("tr.selected a:first-child") as HTMLAnchorElement;
            if (a) {
                a.click();
            }
        }
    }

    $effect(() => {
        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("keydown", handleKeydown);
        }
    });
</script>
<table style="table-layout: fixed; word-wrap: break-word;">
    <thead>
      <tr>
        <th>Name</th>
        <th style="width:100px">Size</th>
        <th style="width:280px">Modified</th>
      </tr>
    </thead>
    <tbody bind:this={tbody}>
    {#if path != "/"}
      <tr class:selected={selected == -1}>
        <td><a class="astralbrowser-parent-directory" href={'#' + parentDir(path)}>../ <em>parent directory</em></a></td>
        <td>-</td>
        <td>-</td>
      </tr>
    {/if}
    {#each listing as item, i}
        <LsDirRow {item} {mountPoint} {path} selected={i == selected} />
    {/each}
    </tbody>
</table>
