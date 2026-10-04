/*
    SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
    SPDX-License-Identifier: LGPL-2.1-or-later
*/

#include "translationhelper.h"

#include <QQmlEngine>
#include <QSettings>

#include <KLocalizedString>

namespace
{
// Keep this in sync with the keys used by QML's AppSettings (QSettings category "Provider").
constexpr QLatin1String SettingsKey("Provider/language");
constexpr QLatin1String DefaultLanguage("en_US");
// Matches KAboutData's organization domain and component name.
constexpr QLatin1String SettingsOrganization("vekaris.cn");
constexpr QLatin1String SettingsApplication("qtchater");
}

TranslationHelper::TranslationHelper(QObject *parent)
    : QObject(parent)
{
    QSettings settings(SettingsOrganization, SettingsApplication);
    // Defaults to English when nothing has been chosen yet.
    m_language = normalizeLanguage(settings.value(SettingsKey).toString());

    // Apply the stored (or detected) language before the QML engine is created.
    KLocalizedString::setLanguages({m_language});
}

TranslationHelper *TranslationHelper::instance()
{
    static TranslationHelper s_instance;
    return &s_instance;
}

QString TranslationHelper::language() const
{
    return m_language;
}

QStringList TranslationHelper::availableLanguages() const
{
    return {QStringLiteral("en_US"), QStringLiteral("zh_CN")};
}

void TranslationHelper::setEngine(QQmlEngine *engine)
{
    m_engine = engine;
}

void TranslationHelper::setLanguage(const QString &code)
{
    const QString normalized = normalizeLanguage(code);

    QSettings settings(SettingsOrganization, SettingsApplication);
    settings.setValue(SettingsKey, normalized);
    settings.sync();

    KLocalizedString::setLanguages({normalized});

    // Re-evaluate QML bindings that call the i18n*() functions.
    if (m_engine) {
        m_engine->retranslate();
    }

    if (normalized != m_language) {
        m_language = normalized;
        Q_EMIT languageChanged();
    }
}

QString TranslationHelper::normalizeLanguage(const QString &code)
{
    QString normalized = code.trimmed();
    normalized.replace(QLatin1Char('-'), QLatin1Char('_'));

    const QString base = normalized.section(QLatin1Char('_'), 0, 0).toLower();
    if (base == QLatin1String("zh")) {
        return QStringLiteral("zh_CN");
    }
    if (base == QLatin1String("en")) {
        return QStringLiteral("en_US");
    }
    return QString(DefaultLanguage);
}
