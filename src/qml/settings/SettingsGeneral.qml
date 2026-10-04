/*
    SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
    SPDX-License-Identifier: LGPL-2.1-or-later
*/

import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts

import org.kde.kirigami as Kirigami
import cn.vekaris.qtchater

Kirigami.ScrollablePage {
    id: root

    title: i18nc("@title", "General")

    property var settings: null

    Kirigami.ColumnView.fillWidth: true

    Kirigami.FormLayout {
        anchors.fill: parent

        QQC2.ComboBox {
            id: languageComboBox
            Kirigami.FormData.label: i18nc("@label:listbox", "Language:")
            textRole: "label"
            valueRole: "code"
            model: [
                // Language names are always shown in their own language.
                { code: "en_US", label: "English" },
                { code: "zh_CN", label: "简体中文" }
            ]
            currentIndex: TranslationHelper.language === "zh_CN" ? 1 : 0
            onActivated: TranslationHelper.setLanguage(currentValue)
        }

        Kirigami.Separator {
            Kirigami.FormData.label: i18nc("@title:group", "Enabled Providers:")
            Kirigami.FormData.isSection: true
        }

        QQC2.CheckBox {
            id: ollamaCheckBox
            Kirigami.FormData.label: i18nc("@label:checkbox", "Ollama:")
            text: i18nc("@option:check", "Enable Ollama provider")
            checked: root.settings ? root.settings.ollamaEnabled : true
            onCheckedChanged: {
                if (root.settings) {
                    root.settings.ollamaEnabled = checked;
                }
            }
        }

        QQC2.CheckBox {
            id: openaiCompatibleCheckBox
            Kirigami.FormData.label: i18nc("@label:checkbox", "OpenAI Compatible:")
            text: i18nc("@option:check", "Enable OpenAI Compatible provider")
            checked: root.settings ? root.settings.openaiCompatibleEnabled : true
            onCheckedChanged: {
                if (root.settings) {
                    root.settings.openaiCompatibleEnabled = checked;
                }
            }
        }

        QQC2.CheckBox {
            id: openclawCheckBox
            visible: root.settings && root.settings.experimentalFeatures
            Kirigami.FormData.label: i18nc("@label:checkbox", "OpenClaw:")
            text: i18nc("@option:check", "Enable OpenClaw provider")
            checked: root.settings ? root.settings._openclawEnabledStored : false
            onCheckedChanged: {
                if (root.settings) {
                    root.settings._openclawEnabledStored = checked;
                }
            }
        }

        Kirigami.Separator {
            Kirigami.FormData.label: i18nc("@title:group", "Behavior:")
            Kirigami.FormData.isSection: true
        }

        QQC2.CheckBox {
            id: humanizedOutputCheckBox
            Kirigami.FormData.label: i18nc("@label:checkbox", "Humanized output:")
            text: i18nc("@option:check", "Enable humanized output")
            checked: root.settings ? root.settings.humanizedOutput : false
            onCheckedChanged: {
                if (root.settings) {
                    root.settings.humanizedOutput = checked;
                }
            }
        }

        QQC2.Label {
            text: i18nc("@info", "Appends writing guidelines to the Soul system message so responses read more human. Increases token usage.")
            font: Kirigami.Theme.smallFont
            color: Kirigami.Theme.disabledTextColor
            wrapMode: Text.WordWrap
            // Keep the wrapped prose from inflating the form width; without this
            // the longer English sentences push the whole form outside the dialog.
            Layout.preferredWidth: Kirigami.Units.gridUnit * 20
            Layout.fillWidth: true
        }

        Kirigami.Separator {
            Kirigami.FormData.label: i18nc("@title:group", "MCP (Model Context Protocol):")
            Kirigami.FormData.isSection: true
        }

        QQC2.Label {
            text: i18nc("@info", "MCP allows AI models to use external tools. Configure MCP servers in the MCP Servers settings page.")
            font: Kirigami.Theme.smallFont
            color: Kirigami.Theme.disabledTextColor
            wrapMode: Text.WordWrap
            Layout.preferredWidth: Kirigami.Units.gridUnit * 20
            Layout.fillWidth: true
        }

        QQC2.Label {
            text: i18nc("@info", "Disabled providers will not appear in the provider dropdown.")
            font: Kirigami.Theme.smallFont
            color: Kirigami.Theme.disabledTextColor
            wrapMode: Text.WordWrap
            Layout.preferredWidth: Kirigami.Units.gridUnit * 20
            Layout.fillWidth: true
        }
    }
}
