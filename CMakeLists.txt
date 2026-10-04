# SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
# SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
# SPDX-FileContributor: VekarisWesion <vekaris@zohomail.com>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# QtChater is a modified version of ChatQT. Changes: application rename,
# AppStream/Flatpak removal, packaging support (2026).

cmake_minimum_required(VERSION 3.20)

project(QtChater VERSION 1.1.0 LANGUAGES CXX)

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
    VARIABLE_PREFIX QTCHATER
    VERSION_HEADER "${CMAKE_CURRENT_BINARY_DIR}/qtchater_version.h"
)

# --- Translations ---------------------------------------------------------
set(QTCHATER_TRANSLATION_LANGUAGES zh_CN)
set(QTCHATER_LOCALE_BUILD_DIR "${CMAKE_CURRENT_BINARY_DIR}/locale")

find_program(MSGFMT_EXECUTABLE msgfmt REQUIRED)

set(QTCHATER_MO_FILES "")
foreach(_lang IN LISTS QTCHATER_TRANSLATION_LANGUAGES)
    set(_po_file "${CMAKE_CURRENT_SOURCE_DIR}/po/${_lang}.po")
    set(_mo_file "${QTCHATER_LOCALE_BUILD_DIR}/${_lang}/LC_MESSAGES/qtchater.mo")
    add_custom_command(
        OUTPUT "${_mo_file}"
        COMMAND "${CMAKE_COMMAND}" -E make_directory "${QTCHATER_LOCALE_BUILD_DIR}/${_lang}/LC_MESSAGES"
        COMMAND "${MSGFMT_EXECUTABLE}" -o "${_mo_file}" "${_po_file}"
        DEPENDS "${_po_file}"
        COMMENT "Compiling translation ${_lang}"
        VERBATIM
    )
    list(APPEND QTCHATER_MO_FILES "${_mo_file}")
    install(FILES "${_mo_file}" DESTINATION "${KDE_INSTALL_LOCALEDIR}/${_lang}/LC_MESSAGES")
endforeach()
add_custom_target(qtchater_translations ALL DEPENDS ${QTCHATER_MO_FILES})

add_subdirectory(src)

install(FILES resources/icons/cn.vekaris.qtchater.svg DESTINATION ${KDE_INSTALL_ICONDIR}/hicolor/scalable/apps)
install(FILES cn.vekaris.qtchater.desktop DESTINATION ${KDE_INSTALL_APPDIR})

feature_summary(WHAT ALL FATAL_ON_MISSING_REQUIRED_PACKAGES)

# --- Packaging (deb / rpm) ------------------------------------------------
# Build packages with:  cmake --build build && (cd build && cpack -G "DEB;RPM")
set(QTCHATER_PACKAGE_VERSION "${PROJECT_VERSION}" CACHE STRING "Version used for generated packages")
# Debian splits the QML modules into their own packages, which dpkg-shlibdeps
# cannot discover. CI fills this in with the packages that actually exist.
set(QTCHATER_DEBIAN_EXTRA_DEPENDS "" CACHE STRING "Extra dependencies added to the generated .deb")

set(CPACK_PACKAGE_NAME "cn.vekaris.qtchater")
set(CPACK_PACKAGE_VENDOR "vekaris.cn")
set(CPACK_PACKAGE_CONTACT "Vekaris <vekaris@zohomail.com>")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "Native AI chat client for the KDE Plasma desktop")
set(CPACK_PACKAGE_DESCRIPTION "QtChater is a native KDE Plasma chat client for AI models, built with Qt6, QML and Kirigami.")
set(CPACK_PACKAGE_HOMEPAGE_URL "https://vekaris.cn")
set(CPACK_PACKAGE_VERSION "${QTCHATER_PACKAGE_VERSION}")
set(CPACK_PACKAGE_FILE_NAME "cn.vekaris.qtchater-${QTCHATER_PACKAGE_VERSION}-${CMAKE_SYSTEM_PROCESSOR}")
set(CPACK_STRIP_FILES ON)
set(CPACK_GENERATOR "DEB;RPM")

# Debian / Ubuntu / KDE neon
set(CPACK_DEBIAN_PACKAGE_NAME "cn.vekaris.qtchater")
set(CPACK_DEBIAN_PACKAGE_MAINTAINER "Vekaris <vekaris@zohomail.com>")
set(CPACK_DEBIAN_PACKAGE_SECTION "utils")
set(CPACK_DEBIAN_PACKAGE_PRIORITY "optional")
set(CPACK_DEBIAN_PACKAGE_SHLIBDEPS ON)
set(CPACK_DEBIAN_PACKAGE_DEPENDS "${QTCHATER_DEBIAN_EXTRA_DEPENDS}")
set(CPACK_DEBIAN_FILE_NAME DEB-DEFAULT)

# Fedora / openSUSE (rpmbuild fills in the shared library requirements)
set(CPACK_RPM_PACKAGE_NAME "cn.vekaris.qtchater")
set(CPACK_RPM_PACKAGE_LICENSE "GPL-3.0-or-later")
set(CPACK_RPM_PACKAGE_SUMMARY "${CPACK_PACKAGE_DESCRIPTION_SUMMARY}")
set(CPACK_RPM_PACKAGE_DESCRIPTION "${CPACK_PACKAGE_DESCRIPTION}")
set(CPACK_RPM_PACKAGE_URL "${CPACK_PACKAGE_HOMEPAGE_URL}")
set(CPACK_RPM_PACKAGE_RELOCATABLE OFF)
set(CPACK_RPM_FILE_NAME RPM-DEFAULT)

include(CPack)
