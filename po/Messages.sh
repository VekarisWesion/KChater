#!/bin/sh
# Regenerates po/qtchater.pot from the translatable strings in src/.
# Afterwards update the catalogs with: msgmerge --update po/zh_CN.po po/qtchater.pot

set -e

cd "$(dirname "$0")/.."

KEYWORDS="--keyword=i18n --keyword=i18nc:1c,2 --keyword=i18np:1,2 --keyword=i18ncp:1c,2,3"

xgettext -L JavaScript $KEYWORDS --from-code=UTF-8 --package-name=qtchater \
    --msgid-bugs-address=https://github.com/KodeRoots/ChatQT/issues \
    -o /tmp/qtchater-qml.pot $(find src -name '*.qml' -o -name '*.js')

xgettext -L C++ $KEYWORDS --from-code=UTF-8 --package-name=qtchater \
    -o /tmp/qtchater-cpp.pot $(find src -maxdepth 1 -name '*.cpp')

msgcat --use-first -o po/qtchater.pot /tmp/qtchater-qml.pot /tmp/qtchater-cpp.pot

echo "Wrote po/qtchater.pot"
