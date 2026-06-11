<script lang="ts">
    import { humanFileSize, humanRelativeTime, joinPath } from './util';

    let { item, mountPoint, path = "/", selected = false, audioPlaying = false, onAudioPlay, onAudioStop }: {
        item: ListingItem;
        mountPoint: string;
        path?: string;
        selected?: boolean;
        audioPlaying?: boolean;
        onAudioPlay?: () => void;
        onAudioStop?: () => void;
    } = $props();

    let tr: HTMLTableRowElement = $state(undefined);

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
        <td>
            <a href={joinPath(mountPoint, path, item.name)}>{item.name}</a>
            {#if onAudioPlay}
                <button class="audio-play-btn" class:playing={audioPlaying} onclick={() => audioPlaying ? onAudioStop() : onAudioPlay()}>
                    {audioPlaying ? "Stop" : "Play"}
                </button>
            {/if}
        </td>
        <td>{humanFileSize(item.size)}</td>
        <td>{humanRelativeTime(item.mtime)}</td>
    {/if}
</tr>

<style>
    .audio-play-btn {
        float: right;
        font-size: 13px;
        padding: 1px 8px;
        margin: 0;
        cursor: pointer;
        visibility: hidden;
    }

    tr:hover .audio-play-btn,
    tr.selected .audio-play-btn,
    .audio-play-btn.playing {
        visibility: visible;
    }

    /* no hover on touch; show permanently so it's tappable */
    @media (max-width: 700px) {
        .audio-play-btn {
            visibility: visible;
        }
    }
</style>
