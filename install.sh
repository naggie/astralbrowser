#!/usr/bin/env bash
set -e

# TODO ensure NTP time sync


sudo cp mounts/*.mount /etc/systemd/system/

# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload

# mount (they will be automounted on boot)
sudo systemctl start 
