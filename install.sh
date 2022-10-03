#!/usr/bin/env bash
set -ex
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not just here!)

sudo cp ***REMOVED***astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp poc-indexer /opt/***REMOVED***/bin


# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload
sudo systemctl enable --now ***REMOVED***astralbrowser-indexer.timer

sudo ./mkmount oxygen.***REMOVED***.io:/srv/media /mnt/depot
sudo ./mkmount grendelkeep.***REMOVED***.io:/srv/software /mnt/shares/naggie
sudo ./mkmount tempestkeep.frillnet.***REMOVED***.io:/srv/media /mnt/shares/frillip
