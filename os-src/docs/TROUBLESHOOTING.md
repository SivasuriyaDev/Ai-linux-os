# AetherOS Troubleshooting & Recovery Guide

## 1. Black Screen or Flickering on Hybrid NVIDIA / Intel Laptops
- Reboot and select **Safe Graphics Mode (`nomodeset`)** in GRUB2.
- Open **System Settings -> Graphics & GPU** and switch the active driver profile to `nvidia-driver` (Proprietary 565+) with Prime Render Offload enabled.
- Verify Vulkan ICD registration:
  ```bash
  vulkaninfo --summary
  ```

## 2. Adobe Photoshop Canvas Freezes or Shows Solid Black Viewport
- Open **Adobe Compatibility Manager**, select your Photoshop prefix, and confirm **DXVK 2.4.1** is installed (`winetricks dxvk`).
- Inside Photoshop: navigate to `Edit -> Preferences -> Performance` and toggle **Use Graphics Processor** or disable **Native Canvas**.
- If running on Wayland with HiDPI scaling (150%/200%), launch with `GDK_SCALE=1` and configure DPI inside `winecfg -> Graphics -> Screen Resolution`.

## 3. Missing Fonts or Crisp Text Rendering in Adobe Apps
- Run the Dependency Checker inside **Adobe Compatibility Manager** and install `corefonts`, `atmlib`, and `fontsmooth=rgb`.
- Place any licensed Windows TrueType/OpenType fonts inside `~/.local/share/aether-adobe/prefixes/<app>/drive_c/windows/Fonts/`.

## 4. Dual-Boot Windows 11 Time Skew or NTFS Read-Only Mount
- Windows Fast Startup leaves NTFS volumes in a hibernated state (`hiberfil.sys`), causing Linux `ntfs3` to mount read-only to protect your files.
- Boot Windows once and run `powercfg /h off` (or hold Shift while clicking Shut Down) so AetherOS mounts your NTFS drive with full read/write support.
- To prevent clock drift between Linux and Windows: `timedatectl set-local-rtc 1 --adjust-system-clock`.

## 5. Secure Boot Verification Failure After NVIDIA DKMS Update
- AetherOS uses Debian `shim-signed`. When installing out-of-tree kernel modules (`nvidia-kernel-dkms`), enroll the generated MOK certificate via `mokutil --import /var/lib/dkms/mok.pub` and confirm on the blue MOK Manager screen during reboot.
