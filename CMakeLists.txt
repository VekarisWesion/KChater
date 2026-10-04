# SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
# SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
# SPDX-FileContributor: VekarisWesion <vekaris@zohomail.com>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# KChater is a modified version of ChatQT. Changes: application rename,
# AppStream/Flatpak removal, packaging support (2026).

cmake_minimum_required(VERSION 3.20)

project(KChater VERSION 1.1.0 LANGUAGES CXX)

set(KF_MIN_VERSION "6.0.0")
set(QT_MIN_VERSION "6.5.0")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(ECM ${KF_MIN_VERSION} REQUIRED NO_MODULE)
set(CMAKE_MODULE_PATH ${ECM_MODULE_PATH})

include(KDEInstallDirs6)
include(KDECMakeSettings)
include(KDECompilerSettings NO_POLICY_SCOPE)
include(ECMSetupVersion)
include(ECMGenerateHeaders)
include(ECMPoQmTools)
include(ECMQmlModule)

find_package(Qt6 ${QT_MIN_VERSION} REQUIRED COMPONENTS
    Core
    Quick
    QuickControls2
    Widgets
    Sql
    Network
    Qml
    LabsPlatform
)

find_package(KF6 ${KF_MIN_VERSION} REQUIRED COMPONENTS
    CoreAddons
    I18n
    Kirigami
    Config
    Crash
)

find_package(KF6KirigamiAddons REQUIRED)

ecm_setup_version(${PROJECT_VERSION}
    VARIABLE_PREFIX KCHATER
    VERSION_HEADER "${CMAKE_CURRENT_BINARY_DIR}/kchater_version.h"
)

# --- Translations ---------------------------------------------------------
set(KCHATER_TRANSLATION_LANGUAGES zh_CN)
set(KCHATER_LOCALE_BUILD_DIR "${CMAKE_CURRENT_BINARY_DIR}/locale")

find_program(MSGFMT_EXECUTABLE msgfmt REQUIRED)

set(KCHATER_MO_FILES "")
foreach(_lang IN LISTS KCHATER_TRANSLATION_LANGUAGES)
    set(_po_file "${CMAKE_CURRENT_SOURCE_DIR}/po/${_lang}.po")
    set(_mo_file "${KCHATER_LOCALE_BUILD_DIR}/${_lang}/LC_MESSAGES/kchater.mo")
    add_custom_command(
        OUTPUT "${_mo_file}"
        COMMAND "${CMAKE_COMMAND}" -E make_directory "${KCHATER_LOCALE_BUILD_DIR}/${_lang}/LC_MESSAGES"
        COMMAND "${MSGFMT_EXECUTABLE}" -o "${_mo_file}" "${_po_file}"
        DEPENDS "${_po_file}"
        COMMENT "Compiling translation ${_lang}"
        VERBATIM
    )
    list(APPEND KCHATER_MO_FILES "${_mo_file}")
    install(FILES "${_mo_file}" DESTINATION "${KDE_INSTALL_LOCALEDIR}/${_lang}/LC_MESSAGES")
endforeach()
add_custom_target(kchater_translations ALL DEPENDS ${KCHATER_MO_FILES})

add_subdirectory(src)

install(FILES resources/icons/cn.vekaris.kchater.svg DESTINATION ${KDE_INSTALL_ICONDIR}/hicolor/scalable/apps)
install(FILES cn.vekaris.kchater.desktop DESTINATION ${KDE_INSTALL_APPDIR})

feature_summary(WHAT ALL FATAL_ON_MISSING_REQUIRED_PACKAGES)
