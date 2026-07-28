<script lang="ts">
    import {joinPath} from './util';
    import LsDirListing from './LsDirListing.svelte';
    import { marked } from 'marked';

    let { mountPoint, path = "/" }: { mountPoint: string; path?: string } = $props();

    // File extensions (lower-case, no dot) hidden from the listing. e.g. .zsync
    // control files that accompany published ISOs.
    const IGNORED_EXTENSIONS = new Set(["zsync"]);

    function isIgnored(item: ListingItem): boolean {
        if (item.type !== "file") return false;
        const ext = item.name.split('.').pop()?.toLowerCase() ?? '';
        return IGNORED_EXTENSIONS.has(ext);
    }

    // Stays pending (so {#await} shows the loading bar) until the effect below
    // kicks off the first real load on mount. Avoids a nullable initial value.
    let listingReq: Promise<Listing> = $state(new Promise<Listing>(() => {}));
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

        return listing.filter(item => !isIgnored(item));
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

<!-- README rendered as markdown. Content is trusted (own file server), so no
     HTML sanitisation. marked runs sync with GitHub-flavoured defaults. -->
{#if readme}
<div class="astralbrowser-readme">
    {@html marked.parse(readme, { gfm: true })}
</div>
{/if}

<style>
    /* @html content isn't scoped by Svelte, so target it globally. Host page
       styles headings/paragraphs large; shrink them here. Code/pre untouched. */
    :global(.astralbrowser-readme) {
        font-size: 14px;
    }
    :global(.astralbrowser-readme h1) { font-size: 1.6em; }
    :global(.astralbrowser-readme h2) { font-size: 1.3em; }
    :global(.astralbrowser-readme h3) { font-size: 1.1em; }
    :global(.astralbrowser-readme h4),
    :global(.astralbrowser-readme h5),
    :global(.astralbrowser-readme h6) { font-size: 1em; }
    /* Host theme has a descendant rule (#centre ul li) that forces a different
       font on list items; paragraphs escape it (direct-child selector). Match
       lists back to the surrounding text. */
    :global(.astralbrowser-readme ul),
    :global(.astralbrowser-readme ol),
    :global(.astralbrowser-readme li) { font-family: inherit; }
</style>
