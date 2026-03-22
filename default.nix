# Astralbrowser packages. Call with pkgs.callPackage ./default.nix { }.
{
  pkgs ? import <nixpkgs> { },
}:
let
  python = pkgs.python3.withPackages (ps: [ ps.inotify ]);
in
{
  # Pre-built Svelte frontend assets (astralbrowser.js, astralbrowser.css)
  frontend = pkgs.stdenv.mkDerivation {
    pname = "astralbrowser-frontend";
    version = "0.0.1";
    src = ./public/build;
    phases = [ "installPhase" ];
    installPhase = ''
      mkdir -p $out
      cp $src/astralbrowser.js $out/
      cp $src/astralbrowser.css $out/
    '';
  };

  # Batch indexer (cron/timer based)
  indexer = pkgs.stdenv.mkDerivation {
    pname = "astralbrowser-indexer";
    version = "0.0.1";
    src = ./.;
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
    src = ./.;
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
