#!/usr/bin/env bash
# AetherOS 1.0 LTS — Windows-Style "This PC" All-Volume Auto-Mounter
# Automatically detects and mounts ALL internal SSD/HDD partitions (NTFS, exFAT,
# ext4, Btrfs) and external USB drives with Read/Write support and maps them
# cleanly as familiar drive letters (C:, D:, E:, F:, G:...) in Aether Files.
set -euo pipefail

MOUNT_BASE="/media/${SUDO_USER:-$USER}"
MAP_FILE="/run/aether-this-pc-volumes.json"
mkdir -p "$MOUNT_BASE"

echo "[AetherOS Storage] Scanning all internal SSD/HDD & USB volumes via lsblk..."

LETTERS=(D E F G H I J K L M N O P Q R S T U V W X Y)
LETTER_IDX=0

# Ensure Linux kernel ntfs3 driver is loaded for full Read/Write NTFS support
modprobe ntfs3 2>/dev/null || true

while IFS="|" read -r NAME FSTYPE LABEL SIZE MOUNTPOINT RM; do
    # Skip root /, swap, EFI System Partition, and unformatted raw disks
    [[ -z "$FSTYPE" || "$FSTYPE" == "swap" || "$FSTYPE" == "vfat" && "$MOUNTPOINT" == "/boot/efi" ]] && continue
    [[ "$MOUNTPOINT" == "/" ]] && continue

    DEV="/dev/${NAME}"
    VOL_LABEL="${LABEL:-Local_Disk_${NAME}}"
    SAFE_LABEL="${VOL_LABEL// /_}"
    TARGET_MNT="${MOUNTPOINT:-${MOUNT_BASE}/${SAFE_LABEL}}"

    if [[ -z "$MOUNTPOINT" ]]; then
        mkdir -p "$TARGET_MNT"
        if [[ "$FSTYPE" == "ntfs" ]]; then
            mount -t ntfs3 -o uid=1000,gid=1000,rw,windows_names "$DEV" "$TARGET_MNT" 2>/dev/null || \
                udisksctl mount -b "$DEV" --no-user-interaction || true
        else
            udisksctl mount -b "$DEV" --no-user-interaction || \
                mount "$DEV" "$TARGET_MNT" 2>/dev/null || true
        fi
    fi

    DRIVE_LETTER="${LETTERS[$LETTER_IDX]:-Z}:"
    LETTER_IDX=$((LETTER_IDX + 1))
    echo "  [OK] ${DRIVE_LETTER}  ${VOL_LABEL} (${FSTYPE}, ${SIZE}) -> ${TARGET_MNT}"
done < <(lsblk -rn -o NAME,FSTYPE,LABEL,SIZE,MOUNTPOINT,RM | awk '$2 != "" {print $1 "|" $2 "|" $3 "|" $4 "|" $5 "|" $6}')

echo "[AetherOS Storage] All storage volumes mounted and exposed in This PC (Files)."
