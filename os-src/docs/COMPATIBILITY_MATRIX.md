# Adobe Creative Cloud Compatibility Matrix on AetherOS (Linux x86_64)

> **Engineering Transparency Policy**
> AetherOS does **not** falsely claim 100% compatibility across every Adobe Creative Cloud release, and **never** bypasses Adobe authentication, subscription checks, or DRM. Because Adobe does not publish native Linux binaries for Creative Cloud desktop apps, compatibility depends on Wine Staging, DXVK, VKD3D-Proton, and Microsoft runtime behavior per release.

| Application | Version | Compatibility Tier | Graphics Stack | Verified Capabilities & Known Blockers |
| :--- | :--- | :--- | :--- | :--- |
| **Adobe Photoshop** | 2021 (v22.x) | **Gold** | DXVK 2.4.1 (Vulkan) | Layers, masks, Camera Raw, Liquify, pen pressure (Wacom/Evdev) work cleanly. Creative Cloud desktop login may require WebView2 fallback. |
| **Adobe Photoshop** | 2024 (v25.x) | **Silver** | VKD3D-Proton 2.13 | Core raster workflow operates; UXP plugin panels and cloud Neural Filters can crash Wine CEF subprocesses. |
| **Adobe Illustrator** | 2021 (v25.x) | **Gold** | DXVK 2.4.1 (Vulkan) | Pen tool, SVG/PDF/EPS export, artboards, and text rendering (`corefonts` + `atmlib`) stable. Toggle CPU preview if hybrid GPU flickers. |
| **Adobe Illustrator** | 2024 (v28.x) | **Silver** | DXVK 2.4.1 (Vulkan) | Vector editing works; Generative Recolor and newer CEF welcome home screen may render blank. |
| **Adobe Lightroom Classic** | v11.x | **Silver** | DXVK 2.4.1 (Vulkan) | Catalog imports, RAW Develop sliders, and JPEG/TIFF exports work; GPU acceleration should be set to "Off" or "Basic" on NVIDIA hybrid setups. |
| **Adobe Audition** | 2022 (v22.x) | **Silver** | DXVK + PipeWire-JACK | Waveform and Multitrack editing work well; WineASIO routed through `pipewire-jack` achieves sub-15ms monitoring latency. |
| **Adobe Premiere Pro** | 2022 (v22.x) | **Bronze (Partial)** | VKD3D / Software | Frequently limited to Mercury Playback Engine (Software Only). NVENC/CUDA interop and H.265 hardware decode fail inside Wine. |
| **Adobe Premiere Pro** | 2024 (v24.x) | **Unsupported** | N/A | Severe blockers: DirectML/DirectCompute hooks, Creative Cloud IPC daemon, and CEF panel crashes prevent reliable production editing. |
| **Adobe After Effects** | 2022–2024 | **Bronze / Unsupported** | VKD3D | OpenGL/Direct3D compositor crashes on multi-frame rendering; Dynamic Link IPC to Media Encoder is unreliable. |
| **Adobe Media Encoder** | 2022–2024 | **Bronze / Unsupported** | Software Only | Standalone H.264 CPU encoding occasionally succeeds on v2022; Dynamic Link queues from Premiere/AE generally fail. |

## Recommended Workflow for Video Editors
When Premiere Pro 2024 or After Effects hits Wine/CUDA blockers, AetherOS also provides 1-click installation of native Linux GPU-accelerated alternatives (DaVinci Resolve Studio / Kdenlive / Blender) via the Unified Application Manager while keeping Photoshop, Illustrator, and Audition running in isolated Wine prefixes.
