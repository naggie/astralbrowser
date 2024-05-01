#!/usr/bin/env bash
set -ex
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not just here!)
sudo apt-get -y install nfs-common

sudo cp ***REMOVED***astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp poc-indexer /opt/***REMOVED***/bin

sudo ./mkmount oxygen.***REMOVED***.io:/srv/media /mnt/depot
sudo ./mkmount dilithium.***REMOVED***.io:/data/shared /mnt/shares/naggie
sudo ./mkmount tempestkeep.frillnet.***REMOVED***.io:/srv/media /mnt/shares/frillip

sudo mkdir -p /mnt/astralbrowser
sudo chown www-data:www-data /mnt/astralbrowser

sudo ln -sf /mnt/shares /mnt/astralbrowser/user_nfs_shares
sudo ln -sf /mnt/depot/downloads /mnt/astralbrowser/downloads
sudo ln -sf /mnt/depot/dsflix/downloads /mnt/astralbrowser/downloads
sudo ln -sf /mnt/depot/dsflix/media/music /mnt/astralbrowser/music
sudo ln -sf /mnt/depot/dsflix/media/movies /mnt/astralbrowser/movies
sudo ln -sf /mnt/depot/dsflix/media/tv /mnt/astralbrowser/tv

# enable ntp, nfs works best with sychronised clocks
sudo cp timesyncd.conf /etc/systemd/
sudo systemctl stop systemd-timesyncd.service
sudo systemctl enable --now systemd-timesyncd.service

# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload
sudo systemctl enable --now ***REMOVED***astralbrowser-indexer.timer

