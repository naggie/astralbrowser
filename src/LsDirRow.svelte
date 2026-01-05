<script lang="ts">
    import { humanFileSize, humanRelativeTime, joinPath } from './util';
    
    let { 
        item, 
        mountPoint, 
        path = "/", 
        selected = false 
    }: { 
        item: ListingItem, 
        mountPoint: string, 
        path?: string, 
        selected?: boolean 
    } = $props();
    
    let tr: HTMLTableRowElement;

    $effect(() => {
        if (tr && selected) {
            tr.scrollIntoView({block: "nearest"});
        }
    });
</script>
<tr class:selected bind:this={tr}>
    {#if item.type == "directory"}
        <td><a class="astralbrowser-directory" href={'#' + joinPath(path, item.name, "/")}>{joinPath(item.name, "/")}</a></td>
        <td>-</td>
        <td>{humanRelativeTime(item.mtime)}</td>
    {:else if item.type == "file"}
        <td><a href={joinPath(mountPoint, path, item.name)}>{item.name}</a></td>
        <td>{item.size ? humanFileSize(item.size) : "-"}</td>
        <td>{item.mtime ? humanRelativeTime(item.mtime) : "-"}</td>
    {/if}
</tr>
