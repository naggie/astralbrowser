{
  description = "astralbrowser - realtime directory indexer + svelte file browser";

  # No inputs: the NixOS module and packages are built via pkgs.callPackage
  # against the consuming host's nixpkgs (preserving prior submodule behaviour).
  # The frontend package is consumed by naggie.net via "${self}/default.nix".
  outputs = { self }: {
    nixosModules.default = import ./module.nix;
  };
}
