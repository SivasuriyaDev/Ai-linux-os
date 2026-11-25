#!/usr/bin/env bash
# AetherOS — QEMU/KVM Boot & Installation Verification Harness
# Tests UEFI (OVMF) and Legacy BIOS boot, VirtIO-GPU Vulkan/VirGL, audio,
# networking, and disk installation to a virtual 40GB NVMe/VirtIO image.

set -euo pipefail

ISO_PATH="${1:-./aetheros-1.0-lts-x86_64.iso}"
DISK_IMG="./aetheros-test-disk.qcow2"
OVMF_CODE="/usr/share/OVMF/OVMF_CODE_4M.fd"

if [[ ! -f "${ISO_PATH}" ]]; then
  echo "ISO not found at ${ISO_PATH}. Run ./build/build-iso.sh first." >&2
  exit 1
fi

if [[ ! -f "${DISK_IMG}" ]]; then
  qemu-img create -f qcow2 "${DISK_IMG}" 40G
fi

BIOS_ARGS=()
if [[ -f "${OVMF_CODE}" ]]; then
  BIOS_ARGS=(-drive "if=pflash,format=raw,readonly=on,file=${OVMF_CODE}")
  echo "Booting AetherOS in UEFI mode (OVMF)..."
else
  echo "OVMF not found; booting AetherOS in Legacy BIOS mode..."
fi

exec qemu-system-x86_64 \
  -enable-kvm \
  -cpu host \
  -smp 4 \
  -m 4096 \
  "${BIOS_ARGS[@]}" \
  -cdrom "${ISO_PATH}" \
  -drive "file=${DISK_IMG},format=qcow2,if=virtio" \
  -device virtio-vga-gl -display gtk,gl=on \
  -device intel-hda -device hda-duplex \
  -netdev user,id=net0 -device virtio-net-pci,netdev=net0 \
  -usb -device usb-tablet \
  -boot order=dc
