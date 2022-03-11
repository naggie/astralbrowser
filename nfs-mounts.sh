#!/usr/bin/env bash
set -e

# TODO run on boot (easier than maintaining fstab)

NFS_MOUNTPOINT=/mnt/nfs

which mount.nfs || sudo apt install -y nfs-common
sudo mkdir -p ${NFS_MOUNTPOINT}

function mountnfs() {
    MOUNTPOINT=${NFS_MOUNTPOINT}/$2
    sudo mkdir -p ${MOUNTPOINT}
    mountpoint -q ${MOUNTPOINT} && return
    sudo mount -t nfs -o ro,soft,bg,vers=4 $1 ${MOUNTPOINT}
}

mountnfs tempestkeep.frillnet.***REMOVED***.io:/srv/***REMOVED*** frillip
mountnfs grendelkeep.***REMOVED***.io:/srv/software naggie
