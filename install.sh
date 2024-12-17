#!/usr/bin/env bash
set -ex
cd $(dirname $0)

# TODO ensure NTP time sync across hosts (not just here!)
sudo apt-get -y install nfs-common

sudo cp ***REMOVED***astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp astralbrowser-indexer /opt/***REMOVED***/bin

sudo ./mkmount oxygen.***REMOVED***.io:/srv/media /mnt/depot
sudo ./mkmount dilithium.***REMOVED***.io:/data/shared /mnt/shares/naggie
sudo ./mkmount tempestkeep.frillnet.***REMOVED***.io:/srv/media /mnt/shares/frillip
sudo ./mkmount 172.18.64.22:/mnt/user/media /mnt/astralbrowser/blackbeard

sudo mkdir -p /mnt/astralbrowser
sudo chown www-data:www-data /mnt/astralbrowser

sudo ln -sfT /mnt/shares /mnt/astralbrowser/user_nfs_shares
sudo ln -sfT /mnt/depot/downloads /mnt/astralbrowser/downloads
sudo ln -sfT /mnt/depot/dsflix/downloads /mnt/astralbrowser/downloads
sudo ln -sfT /mnt/depot/dsflix/media/music /mnt/astralbrowser/music
sudo ln -sfT /mnt/depot/dsflix/media/movies /mnt/astralbrowser/movies
sudo ln -sfT /mnt/depot/dsflix/media/tv /mnt/astralbrowser/tv
sudo ln -sfT /mnt/depot/audio/incoming/ /mnt/astralbrowser/incoming_audio

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

