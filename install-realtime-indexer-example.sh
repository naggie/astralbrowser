#!/usr/bin/env bash
set -ex
cd $(dirname $0)

sudo cp astralbrowser-realtime-indexer.service /etc/systemd/system/
sudo cp astralbrowser-realtime-indexer /usr/local/bin/

sudo systemctl daemon-reload

# Disable the timer-based indexer if it was active, since the realtime
# indexer supersedes it
sudo systemctl disable --now astralbrowser-indexer.timer 2>/dev/null || true

sudo systemctl enable --now astralbrowser-realtime-indexer.service
