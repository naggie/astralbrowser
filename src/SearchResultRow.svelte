<script lang="ts">
    // can handle a million files whilst still being responsive!
    import { joinPath, splitName, humanFileSize } from './util';
    export let result: Result;
    export let mountPoint: string;
    export let selected: boolean = false;

    const [path, name] = splitName(result.path);
</script>

          <tr class:selected>
                {#if name.endsWith("/")}
                    <td><a class="astralbrowser-directory" href={'#' + path + name}>{name}</a></td>
                    <td><a class="path" href={'#' + path}>{path}</a></td>
                {:else}
                    <td><a href={joinPath(mountPoint, path, name)} download>{name}</a></td>
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
