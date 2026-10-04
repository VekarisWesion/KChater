# SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
# SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
# SPDX-FileContributor: VekarisWesion <vekaris@zohomail.com>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# Modifications for QtChater (rename, translations) made in 2026.

set(QT_QML_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/src)

add_executable(qtchater)

ecm_add_qml_module(qtchater
    URI cn.vekaris.qtchater
)

qt_policy(SET QTP0001 NEW)

target_sources(qtchater
    PRIVATE
    main.cpp
    sessionstore.cpp
    filehelper.cpp
    hotreload.cpp
    translationhelper.cpp
)

ecm_target_qml_sources(qtchater
    SOURCES
    qml/Main.qml
    qml/pages/ChatPage.qml
    qml/components/ChatMessage.qml
    qml/components/MessageInput.qml
    qml/components/ProviderCard.qml
    qml/components/InstanceCard.qml
    qml/components/SessionCard.qml
    qml/components/SessionSidebar.qml
    qml/components/McpCard.qml
    qml/settings/SettingsPage.qml
    qml/settings/SettingsGeneral.qml
    qml/settings/SettingsOpenClaw.qml
    qml/settings/SettingsOpenAICompatible.qml
    qml/settings/SettingsMCP.qml
    qml/settings/SettingsSoul.qml
    qml/settings/SettingsMemory.qml
    qml/logic/AppSettings.qml
    qml/logic/ApiClient.js
    qml/logic/HumanizerSoul.js
    qml/logic/McpClient.js
)

target_link_libraries(qtchater PRIVATE
    Qt6::Core
    Qt6::Quick
    Qt6::Qml
    Qt6::QuickControls2
    Qt6::Widgets
    Qt6::Sql
    Qt6::Network
    Qt6::LabsPlatform
    KF6::CoreAddons
    KF6::I18n
    KF6::Kirigami
    KF6::ConfigGui
    KF6::Crash
)

# Fedora's kf6-ki18n-devel ships libKF6I18nQml.so and the KLocalizedQmlContext
# header without a CMake package config, so link the library directly.
find_library(KF6I18NQML_LIBRARY NAMES KF6I18nQml REQUIRED)
target_link_libraries(qtchater PRIVATE ${KF6I18NQML_LIBRARY})

target_include_directories(qtchater PRIVATE ${CMAKE_CURRENT_SOURCE_DIR} ${CMAKE_BINARY_DIR})

target_compile_definitions(qtchater PRIVATE
    QTCHATER_LOCALE_DIR="${QTCHATER_LOCALE_BUILD_DIR}"
)

install(TARGETS qtchater ${KDE_INSTALL_TARGETS_DEFAULT_ARGS})
