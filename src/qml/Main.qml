/*
    SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
    SPDX-License-Identifier: LGPL-2.1-or-later
*/

import QtQuick
import QtQuick.Controls as Controls
import QtQuick.Layouts
import org.kde.kirigami as Kirigami
import org.kde.coreaddons
import cn.vekaris.qtchater

Kirigami.ApplicationWindow {
    id: root

    width: Kirigami.Units.gridUnit * 48
    height: Kirigami.Units.gridUnit * 40

    minimumWidth: Kirigami.Units.gridUnit * 48
    minimumHeight: Kirigami.Units.gridUnit * 40

    globalDrawer: Kirigami.GlobalDrawer {
        title: i18n("qtchater")
        titleIcon: "dialog-messages"
        isMenu: true

        actions: [
            Kirigami.Action {
                text: i18n("Disable auto scroll")
                icon.name: "transform-move-vertical"
                checkable: true
                checked: chatPage.disableAutoScroll
                onTriggered: chatPage.disableAutoScroll = !chatPage.disableAutoScroll
            },
            Kirigami.Action {
                text: i18nc("@action", "About")
                icon.name: "help-about"
                enabled: root.pageStack.layers.depth <= 1
                onTriggered: root.pageStack.layers.push(aboutPage)
            }
        ]
    }

    Component {
        id: aboutPage
        Kirigami.AboutPage {
            aboutData: AboutData
            getInvolvedUrl: "https://github.com/VekarisWesion/QtChater"
        }
    }

    pageStack.initialPage: ChatPage {
        id: chatPage
    }
}
