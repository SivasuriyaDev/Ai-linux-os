// AetherOS Centered Taskbar Component (Qt 6 / QML)
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: bar
    property bool darkMode: true
    signal toggleStartMenu()
    signal toggleQuickSettings()

    color: darkMode ? Qt.rgba(15/255, 23/255, 42/255, 0.78) : Qt.rgba(248/255, 250/255, 252/255, 0.82)

    Rectangle {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 1
        color: darkMode ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0, 0, 0, 0.08)
    }

    // Center Dock Strip
    RowLayout {
        anchors.centerIn: parent
        spacing: 6

        ToolButton {
            text: "Start"
            onClicked: bar.toggleStartMenu()
            Accessible.name: "Open Start Menu"
        }

        Repeater {
            model: pinnedAppsModel
            delegate: ToolButton {
                icon.source: model.iconSource
                ToolTip.visible: hovered
                ToolTip.text: model.title
                onClicked: shellBridge.activateOrLaunch(model.appId)
            }
        }
    }

    // System Tray (Quick Settings + Clock)
    RowLayout {
        anchors.right: parent.right
        anchors.rightMargin: 16
        anchors.verticalCenter: parent.verticalCenter
        spacing: 12

        ToolButton {
            text: "Quick Settings"
            onClicked: bar.toggleQuickSettings()
        }

        Column {
            Text {
                id: clockTime
                text: Qt.formatTime(new Date(), "hh:mm")
                color: bar.darkMode ? "#f8fafc" : "#0f172a"
                font.pixelSize: 12
                font.weight: Font.Medium
            }
            Text {
                text: Qt.formatDate(new Date(), "yyyy-MM-dd")
                color: bar.darkMode ? "#94a3b8" : "#475569"
                font.pixelSize: 11
            }
        }
    }
}
