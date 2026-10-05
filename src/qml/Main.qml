/*
    SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
    SPDX-FileContributor: VekarisWesion <vekaris@zohomail.com>
    SPDX-License-Identifier: LGPL-2.1-or-later
*/

import QtQuick
import QtQuick.Controls as Controls
import QtQuick.Layouts
import org.kde.kirigami as Kirigami
import org.kde.kirigamiaddons.formcard as FormCard
import org.kde.coreaddons
import cn.vekaris.kchater

Kirigami.ApplicationWindow {
    id: root

    width: Kirigami.Units.gridUnit * 48
    height: Kirigami.Units.gridUnit * 40

    minimumWidth: Kirigami.Units.gridUnit * 48
    minimumHeight: Kirigami.Units.gridUnit * 40

    globalDrawer: Kirigami.GlobalDrawer {
        title: i18n("KChater")
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
        FormCard.AboutPage {
            aboutData: root.buildAboutData()
            getInvolvedUrl: "https://github.com/VekarisWesion/KChater"
        }
    }

    pageStack.initialPage: ChatPage {
        id: chatPage
    }

    // Built here instead of using the AboutData singleton: that singleton takes
    // a snapshot of KAboutData when it is first read, so it would keep the
    // language the application started with.
    function buildAboutData() {
        return {
            "componentName": "cn.vekaris.kchater",
            "productName": "KChater",
            "displayName": "KChater",
            "version": Qt.application.version,
            "shortDescription": i18n("A simple AI chat client for OpenAI-compatible providers"),
            "copyrightStatement": i18n("© 2024–2026 Denys Madureira\n© 2026 Vekaris Wesion (KChater modifications)"),
            "otherText": i18n("KChater is an independent project. It is not affiliated with, endorsed by, or sponsored by KDE e.V. \"KDE\" and \"Plasma\" are trademarks of KDE e.V., used here only to describe what the application is built for. Qt is a trademark of The Qt Company Ltd."),
            "homepage": "https://vekaris.cn",
            "bugAddress": "https://github.com/VekarisWesion/KChater/issues",
            "desktopFileName": "cn.vekaris.kchater",
            "programLogo": "",
            "licenses": [
                {
                    "name": "GPL-3.0-or-later",
                    "spdx": "GPL-3.0-or-later",
                    "text": AboutData.licenses.length > 0 ? AboutData.licenses[0].text : ""
                }
            ],
            "authors": [
                {
                    "name": "Denys Madureira",
                    "task": i18nc("@info:credit", "ChatQT author"),
                    "emailAddress": "denys@koderoots.org",
                    "webAddress": "https://denysmadureira.dev"
                },
                {
                    "name": "Vekaris Wesion",
                    "task": i18nc("@info:credit", "KChater fork author"),
                    "emailAddress": "vekaris@zohomail.com",
                    "webAddress": "https://vekaris.cn"
                }
            ],
            "credits": [],
            "translators": [
                {
                    "name": "Vekaris Wesion",
                    "emailAddress": "vekaris@zohomail.com"
                }
            ]
        }
    }
}
