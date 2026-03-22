# Astralbrowser packages. Call with pkgs.callPackage ./default.nix { }.
{
  pkgs ? import <nixpkgs> { },
}:
let
  src = ./.;
  python = pkgs.python3.withPackages (ps: [ ps.inotify ]);
in
{
  # Svelte frontend -- built from source via vite
  frontend = pkgs.buildNpmPackage {
    pname = "astralbrowser-frontend";
    version = "0.0.1";
    inherit src;
    npmDepsHash = "sha256-FkFjIzj86jl6UWcC4Rynx1mzSlkTkWRjMyE6COoHomw=";
    buildPhase = ''
      npm run build
    '';
    installPhase = ''
      mkdir -p $out
      cp public/build/astralbrowser.js $out/
      cp public/build/astralbrowser.css $out/
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
