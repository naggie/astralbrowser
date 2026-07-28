This is an AJAX file browser that uses an nginx autoindex configured in JSON
mode, as well as a streaming client-side search engine that uses an index
downloaded from the server.

See [my blog
post](https://calbryant.uk/blog/designing-an-incredibly-fast-but-niche-file-search-engine/)
for more details on the design.

## Features

### Search

Streaming client-side search over the downloaded index. The URL hash is the
single source of truth: `#?term` is a global (non-path-scoped) search, anything
else is a directory path. Searching pushes a single history entry then replaces
it on each keystroke, so back/forward and deep links work without flooding the
back stack. Clearing the search restores the directory you were in.

### Keyboard navigation

- **Up / Down** — move the row selection (wraps; Down from no selection starts
  at the first real item).
- **Enter** — open the selected row.
- **Backspace** — go up a directory (ignored while a text input is focused).
- **Space** — play/stop the selected audio file.
- **Escape** — clear the selection.

### Audio player

Audio files (`mp3`, `ogg`, `oga`, `wav`, `flac`, `aac`, `m4a`, `opus`, `weba`)
get an inline play/stop button. Playback advances gaplessly through the
directory as a playlist using two swapped `<audio>` elements (one plays while
the next preloads). Integrates with system media controls (`mediaSession`):
track title, next/previous track, and hardware media keys.

### README rendering

A `README.md` in a directory is rendered inline as GitHub-flavoured markdown
below the listing (via `marked`). Content is trusted — served from your own
file server — so no HTML sanitisation is applied.

### Hidden files

`.index.txt` and `.zsync` control files (which accompany published ISOs) are
hidden from the listing.

### Responsive layout

On narrow screens (≤700px) the table collapses into cards: the name is
prominent with size/date/path flowing inline below it, and audio buttons are
always visible (no hover on touch).

## Demo

To run a demo of astralbrowser with a sample file tree:

### Using Nix (recommended)

If you have Nix installed, enter the development shell to get all required dependencies:

```bash
nix-shell
make demo
```

### Manual setup

Ensure you have Node.js (v20+) and nginx installed, then:

```bash
make demo
```

This will:
1. Compile the JavaScript application
2. Start nginx on port 8080 (non-root, HTTP only) with JSON autoindex enabled
3. Serve the application at http://localhost:8080/
4. Serve a demo file tree at http://localhost:8080/demotree/

The nginx server runs in non-daemon mode, so press Ctrl+C to stop it.

## Indexers

Two indexers are provided:

### `astralbrowser-indexer` (batch)

Walks the entire file tree and writes `.index.txt` atomically. Designed to run
periodically via a systemd timer (default: every 24h). See
`install-indexer-example.sh`.

If a `.index.txt` is found in a subdirectory (e.g. a mounted network share
running its own indexer) and is less than 24h old, its entries are incorporated
directly and the subdirectory is not crawled. This avoids redundant traversal
of remote filesystems.

### `astralbrowser-realtime-indexer` (inotify)

Long-running daemon that uses inotify to watch `ASTRALBROWSER_ROOT` recursively.
All changes (additions, removals, modifications) trigger an atomic full rewrite
of `.index.txt` in a background thread, rate-limited to once every 5 seconds to
coalesce rapid changes.

Requires the `inotify` Python package (`pip install inotify`, or
`python313Packages.inotify` in Nix).

```bash
export ASTRALBROWSER_ROOT=/var/www/file/
./astralbrowser-realtime-indexer
```

See `install-realtime-indexer-example.sh` for systemd installation.

## NixOS Module

A NixOS module is provided for the realtime indexer. Import `module.nix` and
configure:

```nix
imports = [ /path/to/astralbrowser/module.nix ];

services.astralbrowser-indexer = {
  enable = true;
  root = "/data/shared/";
  user = "nginx";
};
```

`default.nix` also provides packages for the frontend assets and both indexers
via `pkgs.callPackage ./default.nix { }`.

