/*
    SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
    SPDX-License-Identifier: LGPL-2.1-or-later
*/

#ifndef TRANSLATIONHELPER_H
#define TRANSLATIONHELPER_H

#include <QObject>
#include <QString>
#include <QStringList>

class QQmlEngine;

/**
 * Exposes the application's interface languages to QML and applies language
 * changes at runtime. The supported languages are en_US (default) and zh_CN.
 */
class TranslationHelper : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString language READ language NOTIFY languageChanged)

public:
    static TranslationHelper *instance();

    QString language() const;

    Q_INVOKABLE void setLanguage(const QString &code);
    Q_INVOKABLE QStringList availableLanguages() const;

    void setEngine(QQmlEngine *engine);

    /// Normalizes "zh-CN"/"zh"/"en-US"/"" to one of the supported language codes.
    static QString normalizeLanguage(const QString &code);

Q_SIGNALS:
    void languageChanged();

private:
    explicit TranslationHelper(QObject *parent = nullptr);
    Q_DISABLE_COPY(TranslationHelper)

    QString m_language;
    QQmlEngine *m_engine = nullptr;
};

#endif // TRANSLATIONHELPER_H
