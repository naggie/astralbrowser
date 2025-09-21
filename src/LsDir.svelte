<script lang="ts">
    import {joinPath} from './util';
    import LsDirListing from './LsDirListing.svelte';
    export let mountPoint: string;

    export let path: string = "/";

    let listingReq: Promise<Listing>;
    let readme: string = "";

    async function load_path(path: string) : Promise<Listing> {
        // invalidate readme
        readme = "";

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

        const listing: Listing = Array.from(await response.json());

        // look for README.md and remove it from listing, download and display it later
        for (let i = 0; i < listing.length; i++) {
            if (listing[i].name == "README.md" && listing[i].type == "file") {
                listing.splice(i, 1);
                const readmeResp = await fetch( joinPath(mountPoint, path, "README.md"));
                readme = await readmeResp.text();
                break; // important to break here, otherwise i may be out of bounds
            }
        }

        return listing;
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

{#if readme}
<strong>README.md</strong>
<br/>
<pre><code>{readme}</code></pre>
{/if}
