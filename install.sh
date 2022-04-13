#!/usr/bin/env bash
set -e
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not here!)


sudo cp mounts/*.mount /etc/systemd/system/

# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload

# mount (they will be automounted on boot)
sudo systemctl start $(ls mounts/)
