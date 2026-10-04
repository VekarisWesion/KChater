#!/bin/sh
# SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# Regenerates po/kchater.pot from the translatable strings in src/.
# Afterwards update the catalogs with: msgmerge --update po/zh_CN.po po/kchater.pot

set -e

cd "$(dirname "$0")/.."

KEYWORDS="--keyword=i18n --keyword=i18nc:1c,2 --keyword=i18np:1,2 --keyword=i18ncp:1c,2,3"

xgettext -L JavaScript $KEYWORDS --from-code=UTF-8 --package-name=kchater \
    --msgid-bugs-address=https://github.com/VekarisWesion/KChater/issues \
    -o /tmp/kchater-qml.pot $(find src -name '*.qml' -o -name '*.js')

xgettext -L C++ $KEYWORDS --from-code=UTF-8 --package-name=kchater \
    -o /tmp/kchater-cpp.pot $(find src -maxdepth 1 -name '*.cpp')

msgcat --use-first -o po/kchater.pot /tmp/kchater-qml.pot /tmp/kchater-cpp.pot

# Replace the gettext placeholder header with the real licence information.
sed -i \
    -e 's|^# SOME DESCRIPTIVE TITLE\.$|# SPDX-FileCopyrightText: 2024-2026 Denys Madureira\n# SPDX-FileCopyrightText: 2026 VekarisWesion <vekaris@zohomail.com>\n# SPDX-License-Identifier: GPL-3.0-or-later|' \
    -e '/^# Copyright (C) YEAR THE PACKAGE/d' \
    -e '/^# FIRST AUTHOR <EMAIL@ADDRESS>, YEAR\.$/d' \
    po/kchater.pot

echo "Wrote po/kchater.pot"
