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
        <td></td>
        <td>{humanRelativeTime(item.mtime)}</td>
    {:else if item.type == "file"}
        <td>
            <a href={joinPath(mountPoint, path, item.name)}>{item.name}</a>
            {#if onAudioPlay}
                <button class="audio-play-btn" class:playing={audioPlaying} aria-label={audioPlaying ? "Stop" : "Play"} onclick={() => audioPlaying ? onAudioStop() : onAudioPlay()}>
                    {#if audioPlaying}
                        <svg class="audio-icon" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="1" /></svg>
                    {:else}
                        <svg class="audio-icon" viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z" /></svg>
                    {/if}
                </button>
            {/if}
        </td>
        <td>{humanFileSize(item.size)}</td>
        <td>{humanRelativeTime(item.mtime)}</td>
    {/if}
</tr>

<style>
    /* floated right; equal padding -> square */
    .audio-play-btn {
        float: right;
        font-size: 18px;
        padding: 4px;
        margin: 0;
        border: none;
        background: lightgray;
        cursor: pointer;
        visibility: hidden;
        line-height: 0;
    }

    /* icon scales with the button's font-size (see the mobile override below).
       Both icons share the same 1em square box so play/stop never shift layout. */
    .audio-icon {
        width: 1em;
        height: 1em;
        fill: currentColor;
        display: block;
    }

    tr:hover .audio-play-btn,
    tr.selected .audio-play-btn,
    .audio-play-btn.playing {
        visibility: visible;
    }

    /* no hover on touch; show permanently */
    @media (max-width: 700px) {
        .audio-play-btn {
            visibility: visible;
            font-size: 22px;
        }
    }
</style>
