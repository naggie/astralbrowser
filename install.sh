#!/usr/bin/env bash
set -ex
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not just here!)
sudo apt-get -y install nfs-common

sudo cp ***REMOVED***astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp poc-indexer /opt/***REMOVED***/bin

# enable ntp, nfs works best with sychronised clocks
sudo cp timesyncd.conf /etc/systemd/
sudo systemctl stop systemd-timesyncd.service
sudo systemctl enable --now systemd-timesyncd.service

# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload
sudo systemctl enable --now ***REMOVED***astralbrowser-indexer.timer

sudo ./mkmount oxygen.***REMOVED***.io:/srv/media /mnt/depot
sudo ./mkmount 172.18.64.17:/data/shared /mnt/shares/naggie
sudo ./mkmount tempestkeep.frillnet.***REMOVED***.io:/srv/media /mnt/shares/frillip
