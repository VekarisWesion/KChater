cmake_minimum_required(VERSION 3.20)

project(chatqt VERSION 1.1.0 LANGUAGES CXX)

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
    VARIABLE_PREFIX CHATQT
    VERSION_HEADER "${CMAKE_CURRENT_BINARY_DIR}/chatqt_version.h"
)

# --- Translations ---------------------------------------------------------
set(CHATQT_TRANSLATION_LANGUAGES zh_CN)
set(CHATQT_LOCALE_BUILD_DIR "${CMAKE_CURRENT_BINARY_DIR}/locale")

find_program(MSGFMT_EXECUTABLE msgfmt REQUIRED)

set(CHATQT_MO_FILES "")
foreach(_lang IN LISTS CHATQT_TRANSLATION_LANGUAGES)
    set(_po_file "${CMAKE_CURRENT_SOURCE_DIR}/po/${_lang}.po")
    set(_mo_file "${CHATQT_LOCALE_BUILD_DIR}/${_lang}/LC_MESSAGES/chatqt.mo")
    add_custom_command(
        OUTPUT "${_mo_file}"
        COMMAND "${CMAKE_COMMAND}" -E make_directory "${CHATQT_LOCALE_BUILD_DIR}/${_lang}/LC_MESSAGES"
        COMMAND "${MSGFMT_EXECUTABLE}" -o "${_mo_file}" "${_po_file}"
        DEPENDS "${_po_file}"
        COMMENT "Compiling translation ${_lang}"
        VERBATIM
    )
    list(APPEND CHATQT_MO_FILES "${_mo_file}")
    install(FILES "${_mo_file}" DESTINATION "${KDE_INSTALL_LOCALEDIR}/${_lang}/LC_MESSAGES")
endforeach()
add_custom_target(chatqt_translations ALL DEPENDS ${CHATQT_MO_FILES})

add_subdirectory(src)

install(FILES resources/icons/org.koderoots.chatqt.svg DESTINATION ${KDE_INSTALL_ICONDIR}/hicolor/scalable/apps)
install(FILES org.koderoots.chatqt.desktop DESTINATION ${KDE_INSTALL_APPDIR})
install(FILES org.koderoots.chatqt.metainfo.xml DESTINATION ${KDE_INSTALL_METAINFODIR})

feature_summary(WHAT ALL FATAL_ON_MISSING_REQUIRED_PACKAGES)
