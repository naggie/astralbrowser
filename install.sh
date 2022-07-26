#!/usr/bin/env bash
set -ex
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not here!)

sudo cp mounts/*.mount /etc/systemd/system/
sudo cp ***REMOVED***astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp poc-indexer /opt/***REMOVED***/bin


# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload

# mount (they will be automounted on boot)
sudo systemctl start $(ls mounts/)
sudo systemctl enable --now ***REMOVED***astralbrowser-indexer.timer
