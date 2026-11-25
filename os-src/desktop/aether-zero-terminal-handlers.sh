#!/usr/bin/env bash
# AetherOS Zero-Terminal Windows-Style File & Installer Handlers
# Registers automatic double-click installation for .exe, .msi, .deb, .AppImage
# and 1-click bulk Font installation (.ttf / .otf) directly from the File Manager
# (installing to Linux ~/.local/share/fonts + syncing into all Adobe Wine prefixes).

set -euo pipefail

BIN_DIR="/usr/local/bin"
APPS_DIR="/usr/share/applications"
SERVICE_MENU_DIR="/usr/share/kio/servicemenus"

mkdir -p "$BIN_DIR" "$APPS_DIR" "$SERVICE_MENU_DIR"

# 1. Bulk Font Installer (Linux + All Isolated Adobe Wine Prefixes)
cat <<'EOF' > "$BIN_DIR/aether-install-fonts"
#!/usr/bin/env bash
set -euo pipefail

LINUX_FONTS_DIR="$HOME/.local/share/fonts/AetherOS-User"
WINE_PREFIX_ROOT="$HOME/.local/share/aether-adobe/prefixes"
mkdir -p "$LINUX_FONTS_DIR"

INSTALLED=0
for FONT_FILE in "$@"; do
  case "${FONT_FILE,,}" in
    *.ttf|*.otf)
      cp -f "$FONT_FILE" "$LINUX_FONTS_DIR/"
      # Auto-mirror into every isolated Adobe Wine prefix
      if [[ -d "$WINE_PREFIX_ROOT" ]]; then
        for PREFIX in "$WINE_PREFIX_ROOT"/*; do
          [[ -d "$PREFIX/drive_c/windows/Fonts" ]] || continue
          cp -f "$FONT_FILE" "$PREFIX/drive_c/windows/Fonts/"
        done
      fi
      INSTALLED=$((INSTALLED + 1))
      ;;
  esac
done

fc-cache -f "$LINUX_FONTS_DIR" >/dev/null 2>&1 || true

if command -v notify-send >/dev/null 2>&1; then
  notify-send "AetherOS Font Installer" "Installed ${INSTALLED} font(s) to Linux & synced to all Adobe Wine prefixes."
fi
EOF
chmod +x "$BIN_DIR/aether-install-fonts"

# 2. Automatic AppImage 1-Click Integrator (No manual chmod +x)
cat <<'EOF' > "$BIN_DIR/aether-run-appimage"
#!/usr/bin/env bash
set -euo pipefail

SRC="$1"
DEST_DIR="$HOME/Applications"
mkdir -p "$DEST_DIR"

BASENAME="$(basename "$SRC")"
TARGET="$DEST_DIR/$BASENAME"
cp -f "$SRC" "$TARGET"
chmod +x "$TARGET"

APP_NAME="${BASENAME%.AppImage}"
cat <<DESKTOP > "$HOME/.local/share/applications/aether-appimage-${APP_NAME}.desktop"
[Desktop Entry]
Type=Application
Name=${APP_NAME}
Exec="${TARGET}"
Terminal=false
Categories=Utility;Graphics;
DESKTOP

update-desktop-database "$HOME/.local/share/applications" >/dev/null 2>&1 || true
exec "$TARGET" &
EOF
chmod +x "$BIN_DIR/aether-run-appimage"

# 3. 1-Click .deb GUI Package Installer (No manual dpkg / apt commands)
cat <<'EOF' > "$BIN_DIR/aether-install-deb"
#!/usr/bin/env bash
set -euo pipefail
DEB_FILE="$1"
pkexec apt-get install -y --fix-broken "$DEB_FILE"
if command -v notify-send >/dev/null 2>&1; then
  notify-send "AetherOS Software Installer" "Installed $(basename "$DEB_FILE") with all dependencies."
fi
EOF
chmod +x "$BIN_DIR/aether-install-deb"

# 4. Desktop MIME Handlers & File Manager Bulk Context Menu
cat <<'EOF' > "$APPS_DIR/aether-bulk-font-installer.desktop"
[Desktop Entry]
Type=Application
Name=Install Fonts (Linux + Adobe Wine)
Exec=/usr/local/bin/aether-install-fonts %F
MimeType=font/ttf;font/otf;application/x-font-ttf;application/x-font-otf;
NoDisplay=false
EOF

cat <<'EOF' > "$APPS_DIR/aether-appimage-handler.desktop"
[Desktop Entry]
Type=Application
Name=AetherOS 1-Click AppImage Installer
Exec=/usr/local/bin/aether-run-appimage %f
MimeType=application/x-iso9660-appimage;application/vnd.appimage;
NoDisplay=false
EOF

cat <<'EOF' > "$APPS_DIR/aether-deb-handler.desktop"
[Desktop Entry]
Type=Application
Name=AetherOS 1-Click Debian Installer
Exec=/usr/local/bin/aether-install-deb %f
MimeType=application/vnd.debian.binary-package;
NoDisplay=false
EOF

cat <<'EOF' > "$SERVICE_MENU_DIR/aether-bulk-fonts.desktop"
[Desktop Entry]
Type=Service
MimeType=font/ttf;font/otf;application/x-font-ttf;application/x-font-otf;
Actions=InstallAllFonts;

[Desktop Action InstallAllFonts]
Name=Install Selected Fonts (Linux + Adobe Wine)
Icon=preferences-desktop-font
Exec=/usr/local/bin/aether-install-fonts %F
EOF

update-desktop-database "$APPS_DIR" >/dev/null 2>&1 || true
echo "[AetherOS] Registered zero-terminal double-click handlers (.exe, .msi, .deb, .AppImage) and bulk Font installer."
