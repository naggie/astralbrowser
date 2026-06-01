<script lang="ts">
    import { joinPath, parentDir } from './util';
    import { onMount, onDestroy, untrack } from 'svelte';
    import LsDirRow from './LsDirRow.svelte';

    const AUDIO_EXTENSIONS = new Set(['mp3', 'ogg', 'oga', 'wav', 'flac', 'aac', 'm4a', 'opus', 'webm', 'weba']);

    let { mountPoint, path = "/", listing }: {
        mountPoint: string;
        path?: string;
        listing: Listing;
    } = $props();

    // path is a prop; untrack captures only the mount-time value for initial selection
    let selected = $state(untrack(() => path == "/" ? -1 : -2));
    let tbody: HTMLElement;

    // Audio playlist — two elements, swapped on advance so preloaded buffer is reused
    let playingFile: string | null = $state(null);
    let audioA: HTMLAudioElement;
    let audioB: HTMLAudioElement;
    let useA = true;

    const playableFiles = $derived(
        listing
            .filter(item => item.type === "file" && AUDIO_EXTENSIONS.has(item.name.split('.').pop()?.toLowerCase() ?? ''))
            .map(item => item.name)
    );

    function fileUrl(name: string): string {
        return joinPath(mountPoint, path, name);
    }

    function startPlaying(name: string) {
        const current = useA ? audioA : audioB;
        const preloader = useA ? audioB : audioA;
        current.pause();
        preloader.pause();
        useA = true;

        playingFile = name;
        audioA.src = fileUrl(name);
        audioA.play();

        const idx = playableFiles.indexOf(name);
        if (idx !== -1 && playableFiles.length > 1) {
            audioB.src = fileUrl(playableFiles[(idx + 1) % playableFiles.length]);
            audioB.load();
        }
    }

    function stopPlaying() {
        const current = useA ? audioA : audioB;
        current.pause();
        current.currentTime = 0;
        playingFile = null;
    }

    function handleEnded() {
        if (!playingFile) return;
        const idx = playableFiles.indexOf(playingFile);
        if (idx === -1) { playingFile = null; return; }

        const nextIdx = (idx + 1) % playableFiles.length;
        playingFile = playableFiles[nextIdx];

        // Swap: the preloaded element becomes the player
        useA = !useA;
        const current = useA ? audioA : audioB;
        current.play();

        // Preload next-next onto the now-idle element
        const preloader = useA ? audioB : audioA;
        const nextNextIdx = (nextIdx + 1) % playableFiles.length;
        preloader.src = fileUrl(playableFiles[nextNextIdx]);
        preloader.load();
    }

    function isPlayable(item: ListingItem): boolean {
        return item.type === "file" && AUDIO_EXTENSIONS.has(item.name.split('.').pop()?.toLowerCase() ?? '');
    }

    // LsDirListing is destroyed on navigation (LsDir re-awaits), but stop audio
    // immediately so there's no bleed during the loading transition
    onDestroy(() => {
        if (audioA) audioA.pause();
        if (audioB) audioB.pause();
    });

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "ArrowDown") {
            if (selected < listing.length - 1) {
                selected += 1;
            } else {
                selected = path != "/" ? -1 : 0;
            }
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            if (selected > 0 || (selected == 0 && path != "/")) {
                selected -= 1;
            } else {
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

<!-- Two hidden audio elements: one plays, one preloads the next track -->
<audio bind:this={audioA} onended={handleEnded}></audio>
<audio bind:this={audioB} onended={handleEnded}></audio>

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
        {@const playable = isPlayable(item)}
        <LsDirRow
            {item} {mountPoint} {path}
            selected={i == selected}
            audioPlaying={playable && playingFile === item.name}
            onAudioPlay={playable ? () => startPlaying(item.name) : undefined}
            onAudioStop={playable ? stopPlaying : undefined}
        />
    {/each}
    </tbody>
</table>
