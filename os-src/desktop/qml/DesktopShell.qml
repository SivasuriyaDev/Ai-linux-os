// AetherOS Desktop Shell (Qt 6.7 / QML)
// Original Windows 11-inspired Wayland shell with Mica surfaces,
// centered taskbar, snap layouts, virtual desktops, and dark/light theme parity.

import QtQuick
import QtQuick.Window
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Effects

ApplicationWindow {
    id: root
    visible: true
    visibility: Window.FullScreen
    color: darkMode ? "#0b101b" : "#f3f6fb"

    property bool darkMode: true
    property int activeDesktop: 0
    property int desktopCount: 2
    property bool startMenuOpen: false
    property bool quickSettingsOpen: false
    property real screenBrightness: 1.0
    property color accentColor: "#38bdf8"

    // Background Wallpaper Layer
    Image {
        id: wallpaper
        anchors.fill: parent
        source: darkMode ? "qrc:/wallpapers/aether-bloom-dark.png" : "qrc:/wallpapers/aether-bloom-light.png"
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
    }

    // Desktop Icons Grid (Drag-and-drop repositionable)
    GridView {
        id: desktopGrid
        anchors {
            top: parent.top
            left: parent.left
            bottom: taskbar.top
            margins: 20
        }
        width: 240
        cellWidth: 96
        cellHeight: 96
        model: desktopAppsModel

        delegate: Item {
            width: 88
            height: 88
            Rectangle {
                anchors.fill: parent
                radius: 8
                color: iconMouse.containsMouse
                    ? (root.darkMode ? Qt.rgba(1, 1, 1, 0.12) : Qt.rgba(0, 0, 0, 0.07))
                    : "transparent"

                ColumnLayout {
                    anchors.centerIn: parent
                    spacing: 6
                    Image {
                        source: model.iconSource
                        Layout.preferredWidth: 36
                        Layout.preferredHeight: 36
                        Layout.alignment: Qt.AlignHCenter
                    }
                    Text {
                        text: model.title
                        color: root.darkMode ? "#f8fafc" : "#0f172a"
                        font.family: "Plus Jakarta Sans"
                        font.pixelSize: 12
                        elide: Text.ElideRight
                        Layout.maximumWidth: 80
                        Layout.alignment: Qt.AlignHCenter
                    }
                }

                MouseArea {
                    id: iconMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    onDoubleClicked: shellBridge.launchApplication(model.execCmd)
                }
            }
        }
    }

    // Window Compositor Surface Layer with Snap Layouts (50/50, 66/33, Quadrants)
    Item {
        id: windowWorkspace
        anchors {
            top: parent.top
            left: parent.left
            right: parent.right
            bottom: taskbar.top
        }

        function applySnapLayout(winItem, zone) {
            const w = windowWorkspace.width
            const h = windowWorkspace.height
            const pad = 8
            if (zone === "left") {
                winItem.x = pad; winItem.y = pad; winItem.width = w / 2 - pad * 1.5; winItem.height = h - pad * 2
            } else if (zone === "right") {
                winItem.x = w / 2 + pad * 0.5; winItem.y = pad; winItem.width = w / 2 - pad * 1.5; winItem.height = h - pad * 2
            } else if (zone === "two-thirds-left") {
                winItem.x = pad; winItem.y = pad; winItem.width = w * 0.66 - pad * 1.5; winItem.height = h - pad * 2
            } else if (zone === "one-third-right") {
                winItem.x = w * 0.66 + pad * 0.5; winItem.y = pad; winItem.width = w * 0.34 - pad * 1.5; winItem.height = h - pad * 2
            }
        }
    }

    // Centered Acrylic Taskbar
    Taskbar {
        id: taskbar
        anchors {
            left: parent.left
            right: parent.right
            bottom: parent.bottom
        }
        height: 52
        darkMode: root.darkMode
        onToggleStartMenu: root.startMenuOpen = !root.startMenuOpen
        onToggleQuickSettings: root.quickSettingsOpen = !root.quickSettingsOpen
    }

    // Software Brightness Overlay for external displays without DDC/CI
    Rectangle {
        anchors.fill: parent
        color: "#000000"
        opacity: Math.max(0, 1.0 - root.screenBrightness) * 0.65
        enabled: false
        z: 999
    }
}
