<script lang="ts">
    import { humanFileSize, humanRelativeTime, joinPath } from './util';
    export let item: ListingItem;
    export let mountPoint: string;
    export let path: string = "/";
    export let selected: boolean = false;
    let tr: HTMLTableRowElement;

    $: if (tr && selected) {
        tr.scrollIntoView({block: "nearest"});
    }
</script>
<tr class:selected bind:this={tr}>
    {#if item.type == "directory"}
        <td><a class="astralbrowser-directory" href={'#' + joinPath(path, item.name, "/")}>{joinPath(item.name, "/")}</a></td>
        <td>-</td>
        <td>{humanRelativeTime(item.mtime)}</td>
    {:else if item.type == "file"}
        <td><a href={joinPath(mountPoint, path, item.name)}>{item.name}</a></td>
        <td>{humanFileSize(item.size)}</td>
        <td>{humanRelativeTime(item.mtime)}</td>
    {/if}
</tr>
