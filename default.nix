# Astralbrowser packages. Call with pkgs.callPackage ./default.nix { }.
#
# Uses a single src = ./. so that Nix copies the entire repo into the store
# once. Using sub-paths like ./public/build fails when the nix file is
# evaluated from a git submodule checkout where that directory doesn't exist
# as a standalone store path.
{
  pkgs ? import <nixpkgs> { },
}:
let
  src = ./.;
  python = pkgs.python3.withPackages (ps: [ ps.inotify ]);
in
{
  # Pre-built Svelte frontend assets (astralbrowser.js, astralbrowser.css)
  frontend = pkgs.stdenv.mkDerivation {
    pname = "astralbrowser-frontend";
    version = "0.0.1";
    inherit src;
    phases = [ "installPhase" ];
    installPhase = ''
      mkdir -p $out
      cp $src/public/build/astralbrowser.js $out/
      cp $src/public/build/astralbrowser.css $out/
    '';
  };

  # Batch indexer (cron/timer based)
  indexer = pkgs.stdenv.mkDerivation {
    pname = "astralbrowser-indexer";
    version = "0.0.1";
    inherit src;
    phases = [ "installPhase" ];
    installPhase = ''
      mkdir -p $out/bin
      cp $src/astralbrowser-indexer $out/bin/astralbrowser-indexer
      chmod +x $out/bin/astralbrowser-indexer
    '';
  };

  # Realtime indexer (inotify based, supersedes the batch indexer)
  realtime-indexer = pkgs.stdenv.mkDerivation {
    pname = "astralbrowser-realtime-indexer";
    version = "0.0.1";
    inherit src;
    phases = [ "installPhase" ];
    installPhase = ''
      mkdir -p $out/bin
      cp $src/astralbrowser-realtime-indexer $out/bin/astralbrowser-realtime-indexer
      chmod +x $out/bin/astralbrowser-realtime-indexer
    '';
  };

  # Python with inotify for the realtime indexer
  inherit python;
}
