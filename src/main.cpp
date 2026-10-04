/*
    SPDX-FileCopyrightText: 2024 Denys Madureira <denysmb@zoho.com>
    SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
    SPDX-FileContributor: VekarisWesion <vekaris@zohomail.com>
    SPDX-License-Identifier: LGPL-2.1-or-later

    Modifications for QtChater (rename, translations, packaging) made in 2026.
*/

#include <QApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQmlError>
#include <QQuickStyle>
#include <QIcon>
#include <QUrl>
#include <QQmlEngine>
#include <QQuickWindow>
#include <QSettings>
#include <QDir>

#include <KAboutData>
#include <KLocalizedQmlContext>
#include <KLocalizedString>
#include <KCrash>

#include "qtchater_version.h"
#include "sessionstore.h"
#include "filehelper.h"
#include "hotreload.h"
#include "translationhelper.h"

int main(int argc, char *argv[])
{
    // The interface language is deterministic: the saved choice, defaulting to
    // English. Align the process message locale with it before Qt initializes,
    // so KI18n loads exactly that catalog instead of the system locale's, and
    // language switching keeps working even under a C/POSIX locale.
    {
        const QByteArray lcAll = qgetenv("LC_ALL");
        QSettings storedSettings(QStringLiteral("vekaris.cn"), QStringLiteral("qtchater"));
        const QString storedLanguage = storedSettings.value(QStringLiteral("Provider/language")).toString();
        const QString startupLanguage = TranslationHelper::normalizeLanguage(storedLanguage);

        QByteArray messageLocale = startupLanguage.toUtf8();
        messageLocale += ".UTF-8";

        if (!lcAll.isEmpty()) {
            // LC_ALL takes precedence over LC_MESSAGES, so it has to be replaced.
            qputenv("LC_ALL", messageLocale);
        } else {
            qputenv("LC_MESSAGES", messageLocale);
            if (qgetenv("LANG").isEmpty()) {
                qputenv("LANG", messageLocale);
            }
        }
    }

    QApplication app(argc, argv);
    app.setWindowIcon(QIcon::fromTheme(QStringLiteral("cn.vekaris.qtchater")));

    KCrash::initialize();
    KLocalizedString::setApplicationDomain("qtchater");

#ifdef QTCHATER_LOCALE_DIR
    // Prefer catalogs next to the executable (e.g. an installed bin/locale dir),
    // otherwise fall back to the build tree used during development.
    const QString executableLocaleDir = QCoreApplication::applicationDirPath() + QStringLiteral("/locale");
    if (QDir(executableLocaleDir).exists()) {
        KLocalizedString::addDomainLocaleDir("qtchater", executableLocaleDir);
    } else {
        KLocalizedString::addDomainLocaleDir("qtchater", QStringLiteral(QTCHATER_LOCALE_DIR));
    }
#endif
    // Select the saved language before the first translatable string is created,
    // otherwise KI18n caches an empty catalog lookup for the application domain.
    TranslationHelper::instance();

    KAboutData aboutData(
        QStringLiteral("qtchater"),
        i18nc("@title", "QtChater"),
        QStringLiteral(QTCHATER_VERSION_STRING),
        i18n("A simple AI chat client for OpenAI-compatible providers"),
        KAboutLicense::GPL_V3,
        i18n("© 2024–2026 Denys Madureira\n© 2026 VekarisWesion (QtChater modifications)"));
    aboutData.setLicenseText(i18n("QtChater is distributed under the GNU General Public License, version 3 or later (GPL-3.0-or-later). Individual source files carry an LGPL-2.1-or-later notice."));
    aboutData.setBugAddress("https://github.com/VekarisWesion/QtChater/issues");
    aboutData.setOrganizationDomain("vekaris.cn");
    aboutData.addAuthor(
        i18nc("@info:credit", "Denys Madureira"),
        i18nc("@info:credit", "Author"),
        QStringLiteral("denys@koderoots.org"),
        QStringLiteral("https://denysmadureira.dev"));
    aboutData.addAuthor(
        i18nc("@info:credit", "VekarisWesion"),
        i18nc("@info:credit", "QtChater fork and maintenance"),
        QStringLiteral("vekaris@zohomail.com"),
        QStringLiteral("https://vekaris.cn"));
    aboutData.setTranslator(
        i18nc("NAME OF TRANSLATORS", "Your names"),
        i18nc("EMAIL OF TRANSLATORS", "Your emails"));
    aboutData.setDesktopFileName(QStringLiteral("cn.vekaris.qtchater"));
    KAboutData::setApplicationData(aboutData);

    if (qEnvironmentVariableIsEmpty("QT_QUICK_CONTROLS_STYLE")) {
        QQuickStyle::setStyle(QStringLiteral("org.kde.desktop"));
    }

    QQmlApplicationEngine engine;
    KLocalization::setupLocalizedContext(&engine);
    TranslationHelper::instance()->setEngine(&engine);
    engine.rootContext()->setContextProperty(QStringLiteral("experimentalFeaturesEnabled"),
        !qEnvironmentVariableIsEmpty("QTCHATER_ENABLE_EXPERIMENTAL_FEATURES"));

    qWarning() << "About to register SessionStore";
    // Register SessionStore as singleton
    qmlRegisterSingletonInstance("cn.vekaris.qtchater", 1, 0, "SessionStore", SessionStore::instance());
    qmlRegisterSingletonInstance("cn.vekaris.qtchater", 1, 0, "FileHelper", FileHelper::instance());
    qmlRegisterSingletonInstance("cn.vekaris.qtchater", 1, 0, "TranslationHelper", TranslationHelper::instance());
    qWarning() << "SessionStore registered";

    QObject::connect(&engine, &QQmlApplicationEngine::warnings, [](const QList<QQmlError> &warnings) {
        for (const QQmlError &warning : warnings) {
            qWarning() << "QML Warning:" << warning.toString();
        }
    });

    QString qmlSourceDir = qEnvironmentVariable("QML_SRC_DIR");
    if (!qmlSourceDir.isEmpty()) {
        QString path = qmlSourceDir + QStringLiteral("/main.qml");
        QUrl url = QUrl::fromLocalFile(path);
        engine.addImportPath(qmlSourceDir);

        QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                         &app, [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl) {
                QCoreApplication::exit(-1);
            }
        }, Qt::QueuedConnection);
        engine.load(url);

        if (engine.rootObjects().isEmpty()) {
            return -1;
        }

        auto *hotReload = new HotReload(&engine, url, &app);
        auto *window = qobject_cast<QQuickWindow *>(engine.rootObjects().first());
        if (window) {
            hotReload->setWindow(window);
        }
    } else {
        engine.loadFromModule("cn.vekaris.qtchater", "Main");

        qWarning() << "Root objects:" << engine.rootObjects().size();

        if (engine.rootObjects().isEmpty()) {
            return -1;
        }
    }

    return app.exec();
}
