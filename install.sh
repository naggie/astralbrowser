#!/usr/bin/env bash
set -ex
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not just here!)
sudo apt-get -y install nfs-common

sudo cp ***REMOVED***astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp astralbrowser-indexer /opt/***REMOVED***/bin

sudo ./mkmount oxygen.***REMOVED***.io:/data/downloads /mnt/astralbrowser/downloads
sudo ./mkmount oxygen.***REMOVED***.io:/data/software /mnt/astralbrowser/software
sudo ./mkmount oxygen.***REMOVED***.io:/data/movies /mnt/astralbrowser/movies
sudo ./mkmount oxygen.***REMOVED***.io:/data/tv /mnt/astralbrowser/tv
sudo ./mkmount oxygen.***REMOVED***.io:/data/music /mnt/astralbrowser/music

sudo ./mkmount dilithium.***REMOVED***.io:/data/shared /mnt/astralbrowser/nfs/naggie
sudo ./mkmount tempestkeep.frillnet.***REMOVED***.io:/srv/media /mnt/astralbrowser/nfs/frillip
sudo ./mkmount 172.18.64.22:/mnt/user/media /mnt/astralbrowser/nfs/votick

sudo mkdir -p /mnt/astralbrowser
sudo chown www-data:www-data /mnt/astralbrowser

# enable ntp, nfs works best with sychronised clocks
sudo cp timesyncd.conf /etc/systemd/
sudo systemctl stop systemd-timesyncd.service
sudo systemctl enable --now systemd-timesyncd.service

# timer triggered services (--now first run only)
# regardless of status.
sudo systemctl daemon-reload

if hostname | grep -q staging; then
    sudo systemctl disable --now ***REMOVED***astralbrowser-indexer.timer
else
    sudo systemctl enable --now ***REMOVED***astralbrowser-indexer.timer
fi

