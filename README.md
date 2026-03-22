This is an AJAX file browser that uses an nginx autoindex configured in JSON
mode, as well as a streaming client-side search engine that uses an index
downloaded from the server.

See [my blog
post](https://calbryant.uk/blog/designing-an-incredibly-fast-but-niche-file-search-engine/)
for more details on the design.

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

