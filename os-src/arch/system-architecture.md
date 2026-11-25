# AetherOS — Complete System Architecture Specification

## 1. Distribution Foundation & Kernel Strategy
- **Base Distribution**: Debian 12 "Bookworm" Stable Minimal (`debootstrap --variant=minbase`), pinned with Debian Backports for updated Mesa, Vulkan ICDs, PipeWire, and Linux LTS kernel.
- **Target Architecture**: 64-bit `x86_64` (`amd64`) with multi-arch `i386` enabled strictly for 32-bit Wine/DXVK thunking libraries (`wine32`, `libvulkan1:i386`, `libgl1-mesa-dri:i386`).
- **Kernel**: Linux 6.12 LTS (`linux-image-amd64` from backports) with `PREEMPT_DYNAMIC`, `ntsync` (when backported/enabled) or `esync`/`fsync` futex2 support, `zram` lz4 compression, `btrfs`/`ext4`/`ntfs3` kernel drivers, and `fstrim.timer` for NVMe/SATA SSD longevity.
- **Init System**: `systemd` trimmed to minimal boot graph (~38 active units at desktop login; target idle RAM: ~410–460 MB cold boot before launching Adobe Wine prefixes).
- **Boot & Firmware**:
  - Hybrid ISO (`xorriso` + `isohybrid`) supporting both **UEFI (x86_64-efi)** and **Legacy BIOS (i386-pc)** via **GRUB 2.12**.
  - **Secure Boot**: Signed Debian `shim-signed` + `grub-efi-amd64-signed` chain, plus guided Machine Owner Key (MOK) enrollment when users install out-of-tree NVIDIA DKMS modules.
  - **Boot Splash**: Custom Plymouth theme (`aether-bloom`) using DRM/KMS flicker-free handoff into SDDM/Aether Greeter.

## 2. Original Windows 11-Inspired Desktop Environment (`aether-shell`)
Built on **Qt 6.7 / QML + Wayland (KWin/wlroots-compatible compositor layer)** with XWayland seamless fallback for Wine/Adobe windows:
- **Compositor & Material Shaders**: GLSL dual-kawase blur for **Acrylic** flyouts (Start Menu, Quick Settings, Notification Center) and wallpaper-sampled **Mica** tinting on window chrome.
- **Core Shell Components**:
  - `DesktopShell.qml`: Desktop canvas, multi-monitor geometry, wallpaper engine, desktop icon grid, context menus.
  - `Taskbar.qml`: Centered dock/taskbar with Start, Search, Virtual Desktops pager, running window previews, and system tray.
  - `StartMenu.qml`: Pinned creative apps, live indexed search, recent documents, power/session actions.
  - `WindowSnapController`: Native snap zones (50/50 split, 66/33 creative studio split, 4-quadrant tiling) triggered by drag-to-edge or maximize-button hover menu.
- **Audio & Media**: `PipeWire` + `WirePlumber` + `pipewire-pulse` + `pipewire-jack` (low-latency routing for Adobe Audition via WineASIO/PipeWire JACK bridge).

## 3. Adobe Creative Compatibility Subsystem
- **Runtime Stack**:
  - **Wine Staging 9.21+ / Bottles Runner (`soda` / `caffe`)** with `fsync` enabled.
  - **DXVK 2.4.1** (Direct3D 9/10/11 -> Vulkan) and **VKD3D-Proton 2.13** (Direct3D 12 -> Vulkan).
  - **Per-Application Isolated Prefixes**: `~/.local/share/aether-adobe/prefixes/<app>-<version>/` so a Photoshop 2021 prefix never pollutes Illustrator or Audition registry/DLL overrides.
  - **Core Windows Runtime Dependencies** (fetched legally via `winetricks` from official Microsoft redistributables): `vcrun2019`/`vcrun2022`, `msxml6`, `gdiplus`, `atmlib`, `corefonts`, `fontsmooth=rgb`, `dotnet48` (where required).
  - **DRM & Licensing Integrity**: AetherOS **never** patches, cracks, or bypasses Adobe licensing, authentication, or Creative Cloud DRM. Users must authenticate with legitimate Adobe subscriptions and official installers.

## 4. GPU & Creative Graphics Stack
- **Intel**: `mesa-vulkan-drivers`, `intel-media-va-driver-non-free` (QuickSync VA-API decode/encode), `intel-gpu-tools`.
- **AMD**: `mesa-vulkan-drivers` (RADV), `mesa-va-drivers`, `mesa-vdpau-drivers`, `radeontop`, ROCm OpenCL runtime (optional package).
- **NVIDIA**: Proprietary 565+ driver via Debian `non-free-firmware`/`non-free`, `nvidia-vulkan-icd`, NVDEC/NVENC (`libnvidia-encode1`), Prime Render Offload for hybrid laptops.

## 5. Security & Sandboxing Architecture
- **Firewall**: `nftables` default-drop inbound policy, stateful established/related outbound allow, GUI toggle in System Settings.
- **App Sandboxing**: Flatpak portal isolation (`xdg-desktop-portal-aether`), AppArmor profiles confining Wine prefixes from reading SSH keys (`~/.ssh`), GPG rings, or root config.
- **Disk Encryption**: Optional LUKS2 full-disk encryption with Argon2id KDF configurable in the graphical installer.
- **Automatic Security Updates**: `unattended-upgrades` enabled strictly for `Debian-Security` origin so creative workflows aren't disrupted by unexpected ABI upgrades.
