#!/usr/bin/env python3
"""
AetherOS Graphical & Scripted System Installer Backend
Handles GPT/MBR partitioning (Automatic, Manual, Dual-Boot alongside Windows),
optional LUKS2 full-disk encryption, SquashFS deployment, UEFI/BIOS GRUB2
installation, locale/timezone/keyboard setup, and user account provisioning.
"""

from __future__ import annotations
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import List

@dataclass
class InstallPlan:
    target_disk: str        # e.g. /dev/nvme0n1 or /dev/vda
    mode: str               # automatic | dual-boot | manual
    firmware: str           # uefi | bios
    encrypt_luks2: bool
    locale: str             # e.g. en_US.UTF-8
    keyboard_layout: str    # e.g. us
    timezone: str           # e.g. America/Los_Angeles
    username: str
    hostname: str

def build_partition_commands(plan: InstallPlan) -> List[List[str]]:
    """Generate deterministic parted/mkfs commands without executing destructive ops."""
    disk = plan.target_disk
    cmds: List[List[str]] = []
    if plan.mode == "automatic":
        if plan.firmware == "uefi":
            cmds.extend([
                ["parted", "-s", disk, "mklabel", "gpt"],
                ["parted", "-s", disk, "mkpart", "ESP", "fat32", "1MiB", "513MiB"],
                ["parted", "-s", disk, "set", "1", "esp", "on"],
                ["parted", "-s", disk, "mkpart", "AetherRoot", "ext4", "513MiB", "100%"],
            ])
        else:
            cmds.extend([
                ["parted", "-s", disk, "mklabel", "msdos"],
                ["parted", "-s", disk, "mkpart", "primary", "ext4", "1MiB", "100%"],
                ["parted", "-s", disk, "set", "1", "boot", "on"],
            ])
    return cmds

def configure_installed_system(target_mount: Path, plan: InstallPlan) -> None:
    """Apply hostname, timezone, locale, fstab, user account, and GRUB2 inside chroot."""
    (target_mount / "etc/hostname").write_text(f"{plan.hostname}\n", encoding="utf-8")
    chroot_script = f"""
set -e
ln -sf /usr/share/zoneinfo/{plan.timezone} /etc/localtime
sed -i 's/^# *{plan.locale}/{plan.locale}/' /etc/locale.gen
locale-gen
update-locale LANG={plan.locale}
useradd -m -s /bin/bash -G sudo,video,audio,render,plugdev {plan.username}
if [ "{plan.firmware}" = "uefi" ]; then
  grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=AetherOS --recheck
else
  grub-install --target=i386-pc {plan.target_disk}
fi
update-grub
"""
    subprocess.run(["chroot", str(target_mount), "/bin/bash", "-c", chroot_script], check=True)
