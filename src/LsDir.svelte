<script lang="ts">
    import {joinPath} from './util';
    import LsDirListing from './LsDirListing.svelte';

    let { mountPoint, path = "/" }: { mountPoint: string; path?: string } = $props();

    let listingReq: Promise<Listing> = $state(undefined);
    let readme: string = $state("");

    async function load_path(path: string) : Promise<Listing> {
        readme = "";

        path = joinPath('/', path, '/');

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

        for (let i = 0; i < listing.length; i++) {
            if (listing[i].name == "README.md" && listing[i].type == "file") {
                listing.splice(i, 1);
                const readmeResp = await fetch( joinPath(mountPoint, path, "README.md"));
                readme = await readmeResp.text();
                break;
            }
        }

        for (let i = 0; i < listing.length; i++) {
            if (listing[i].name == ".index.txt" && listing[i].type == "file") {
                listing.splice(i, 1);
                break;
            }
        }

        return listing;
    }

    $effect(() => {
        listingReq = load_path(path);
    });
</script>

{#await listingReq}
    <div class="astralbrowser-progress">
        <div class="astralbrowser-progress-bar astralbrowser-progress-bar-nondeterministic"></div>
    </div>
{:then listing}
    <LsDirListing {mountPoint} {path} {listing} />
{:catch error}
<p class="warningbox">{error.message}</p>
{/await}

{#if readme}
<pre><code>
# README.md

{readme}
</code></pre>
{/if}
