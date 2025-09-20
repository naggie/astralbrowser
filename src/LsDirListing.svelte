<script lang="ts">
    import { humanFileSize, humanRelativeTime, joinPath, parentDir } from './util';
    import { onMount } from 'svelte';
    export let mountPoint: string;
    export let path: string = "/";
    export let listing: Listing;
    let selected: number = path == "/" ? -1 : -2;

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

    onMount(() => {
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
        <td><a class="astralbrowser-parent-directory" href={'#' + parentDir(path)}>../</a></td>
        <td>-</td>
        <td>-</td>
      </tr>
    {/if}
    {#each listing as item, i}
        <tr class:selected={i === selected}>
            {#if item.type == "directory"}
                <td><a class="astralbrowser-directory" href={'#' + joinPath(path, item.name, "/")}>{joinPath(item.name, "/")}</a></td>
                <td>-</td>
                <td>{humanRelativeTime(item.mtime)}</td>
            {:else if item.type == "file"}
                <td><a href={joinPath(mountPoint, path, item.name)} download>{item.name}</a></td>
                <td>{humanFileSize(item.size)}</td>
                <td>{humanRelativeTime(item.mtime)}</td>
            {/if}
      </tr>
    {/each}
    </tbody>
</table>
