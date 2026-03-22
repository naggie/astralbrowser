# NixOS module for the astralbrowser realtime indexer service.
#
# Usage in configuration.nix:
#   imports = [ /path/to/astralbrowser/module.nix ];
#   services.astralbrowser-indexer = {
#     enable = true;
#     root = "/data/shared/";
#     user = "nginx";
#   };
{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.services.astralbrowser-indexer;
  astralbrowser = pkgs.callPackage ./default.nix { };
in
{
  options.services.astralbrowser-indexer = {
    enable = lib.mkEnableOption "astralbrowser realtime indexer";

    root = lib.mkOption {
      type = lib.types.path;
      description = "Root directory to index.";
    };

    user = lib.mkOption {
      type = lib.types.str;
      description = "User to chown the .index.txt to (should match the web server user).";
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.services.astralbrowser-realtime-indexer = {
      description = "astralbrowser realtime indexer (inotify)";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];
      path = [ astralbrowser.python ];
      serviceConfig = {
        Type = "simple";
        ExecStart = "${astralbrowser.realtime-indexer}/bin/astralbrowser-realtime-indexer";
        Restart = "on-failure";
        RestartSec = "5";
      };
      environment = {
        PYTHONUNBUFFERED = "1";
        ASTRALBROWSER_ROOT = toString cfg.root;
        ASTRALBROWSER_USER = cfg.user;
      };
    };
  };
}
