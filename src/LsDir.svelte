<script lang="ts">
    import {joinPath} from './util';
    import LsDirListing from './LsDirListing.svelte';
    export let mountPoint: string;

    export let path: string = "/";

    let listingReq: Promise<Listing>;

    async function load_path(path: string) : Promise<Listing> {
        // must end in a slash to avoid loading massive non-directories. Set path to reflect in UI
        path = joinPath('/', path, '/');

        // can get annoying if we don't do this
        window.scroll(0,0);

        const response = await fetch(
            joinPath(mountPoint, path),
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        )
        if (response.status == 404) {
            throw new Error("Directory does not exist");
        } else if (response.status != 200) {
            throw new Error("Error loading directory");
        }

        return response.json();
    }

    $: listingReq = load_path(path);
</script>

{#await listingReq}
<div class="accesswait"><div class="progress-line"></div></div>
{:then listing}
    <LsDirListing {mountPoint} {path} {listing} />
{:catch error}
<p class="warningbox">{error.message}</p>
{/await}
