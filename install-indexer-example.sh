#!/usr/bin/env bash
set -ex
cd $(dirname $0)

sudo cp astralbrowser-indexer.{service,timer} /etc/systemd/system/
sudo cp astralbrowser-indexer /usr/local/bin/

sudo systemctl daemon-reload

sudo systemctl enable --now astralbrowser-indexer.timer

