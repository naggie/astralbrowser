<script lang="ts">
    import { joinPath, splitName, humanFileSize } from './util';
    import { untrack } from 'svelte';

    let { result, mountPoint, selected = false }: {
        result: Result;
        mountPoint: string;
        selected?: boolean;
    } = $props();

    let tr: HTMLTableRowElement = $state(undefined);

    // result is fixed per row; untrack avoids a spurious reactivity warning
    const [path, name] = untrack(() => splitName(result.path));

    $effect(() => {
        if (tr && selected) {
            tr.scrollIntoView({block: "nearest"});
        }
    });
</script>
    <tr class:selected bind:this={tr}>
        {#if name.endsWith("/")}
            <td><a class="astralbrowser-directory" href={'#' + path + name}>{name}</a></td>
            <td><a class="path" href={'#' + path}>{path}</a></td>
        {:else}
            <td><a href={joinPath(mountPoint, path, name)}>{name}</a></td>
            <td><a class="path" href={'#' + path}>{path}</a></td>
        {/if}
        <td style="width:96px">
            {#if result.size }
                {humanFileSize(result.size)}
            {:else}
                -
            {/if}
        </td>
    </tr>
<style>
    .path {
        opacity: 0.8;
    }
</style>
