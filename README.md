<div align="center">
  <img src="resources/icons/cn.vekaris.kchater.svg" width="128" height="128" alt="KChater icon"/>

  # KChater

  **A native AI chat client for the KDE Plasma desktop**

  Chat with AI models through multiple providers — directly from your desktop

  [English](README.md) · [简体中文](README/zh-CN.md)
</div>

---

## About

KChater is a native KDE Plasma application for chatting with AI models. Built with Qt6/QML and Kirigami, it integrates seamlessly into the KDE desktop with a native look and feel and Plasma-style dialogs.

> **Not affiliated with KDE.** KChater is an independent project. It is not
> affiliated with, endorsed by, or sponsored by KDE e.V. The names "KDE" and
> "Plasma" are trademarks of KDE e.V. and are used here only to describe what
> the application is built for. Qt is a trademark of The Qt Company Ltd.

### How it is pronounced

The leading K stands for KDE and is read as the letter K. "Chater" is not a
misspelling of "chatter": its `a…e` is a long *a*, pronounced /eɪ/ as in
*later*. The name therefore reads **/ˌkeɪˈtʃeɪtər/** — "KAY-CHAY-ter", not
"chatter".

## Features

### Providers

- **Ollama** — Connect to local models running via Ollama with automatic model discovery
- **OpenAI Compatible** — Connect to any OpenAI-compatible API (OpenAI, DeepSeek, Groq, etc.) with multi-provider support and connection testing
- **OpenClaw** — Connect to OpenClaw instances with multi-instance support (experimental)

### Chat

- **Streaming responses** — Real-time token-by-token response display
- **Thinking mode** — Toggle extended thinking/reasoning for supported models
- **Thinking control** — Servers disagree on how reasoning is switched, so each provider picks a convention: DeepSeek's `thinking.type`, the vLLM/Qwen `enable_thinking` template flag, nothing at all, or custom JSON for anything else
- **Session management** — Persistent sessions with sidebar, auto-restore on launch
- **Cancel and stop** — Cancel pending requests or stop mid-stream
- **Auto-scroll** — Automatic scrolling with manual override option
- **Attachments** — Send files together with a message

### MCP (Model Context Protocol)

- **Remote MCP servers** — Connect to Streamable HTTP MCP servers
- **Tool calling** — Automatic tool call detection, execution, and follow-up with configurable depth limit
- **Server status** — Real-time connection status and available tool count

### Desktop Integration

- **Language selection** — English and Simplified Chinese, switchable at runtime from the settings
- **System-wide install** — The `kchater` command, the desktop entry and the icon are installed for you

## Building from Source

KChater is developed and tested on **Fedora** with KDE Plasma. The instructions
below are for Fedora; see [Other distributions](#other-distributions) if you use
something else.

### 1. Install the build dependencies

```bash
sudo dnf install cmake ninja-build gcc-c++ extra-cmake-modules gettext \
    qt6-qtbase-devel qt6-qtdeclarative-devel qt6-qtsvg-devel \
    kf6-kcoreaddons-devel kf6-ki18n-devel kf6-kirigami-devel \
    kf6-kconfig-devel kf6-kcrash-devel kf6-kirigami-addons-devel
```

For the runtime you also want the matching non-devel packages, which are already
pulled in by your Plasma installation.

### 2. Clone and build

```bash
git clone https://github.com/VekarisWesion/KChater.git
cd KChater

cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### 3. Run it

```bash
./build/bin/kchater
```

### 4. Install it (optional)

Installing puts `kchater` on your `PATH` and adds the desktop entry, so you can
start it from the application menu.

User-local install, no root needed:

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX="$HOME/.local"
cmake --build build
cmake --install build
```

The binary then is `~/.local/bin/kchater`.

System-wide install:

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
sudo cmake --install build
```

### Other distributions and packaging

This repository is the application source and nothing else. It is developed and
tested on Fedora, and it does not ship, build or document distribution
packages — no `.rpm`, no `.deb`, no Flatpak.

If you want any of that, it is a packaging question rather than a KChater
question. Install the equivalent Qt 6 / KDE Frameworks 6 / Kirigami Addons /
Extra CMake Modules development packages for your distribution, and ask an AI
assistant to walk you through turning the build into a package. That is a
perfect question for one.

## Repository Layout

Nothing is downloaded while building: the interface is compiled into the binary
and everything else is installed from this repository.

| Path | What it is |
|------|------------|
| `src/` | C++ sources — `main.cpp`, the session store, file helpers, hot reload, the translation helper |
| `src/qml/` | The entire interface: `Main.qml`, `pages/`, `components/`, `settings/` and the JavaScript in `logic/` |
| `po/` | Translations — `zh_CN.po`, the generated `kchater.pot` template and `Messages.sh` to regenerate it |
| `resources/icons/cn.vekaris.kchater.svg` | The application icon, used for the window, the taskbar and the menu entry |
| `cn.vekaris.kchater.desktop` | Desktop entry template, see below |
| `CMakeLists.txt`, `src/CMakeLists.txt` | The build system |
| `LICENSE` | GPL-3.0 |

The icon file name, the `Icon=` value in the desktop entry and the
`QIcon::fromTheme()` call in `src/main.cpp` must stay in sync — they are all the
same string, `cn.vekaris.kchater`.

### The desktop entry is a template

`cn.vekaris.kchater.desktop` is a working entry, but treat it as a template
rather than something that has to stay exactly as it is. `cmake --install`
installs it to `/usr/share/applications/` next to the icon in
`/usr/share/icons/hicolor/scalable/apps/`, and that pair is what makes the app
show up in your application menu.

If you rename the application, or build it by hand, copy the file to
`~/.local/share/applications/` and adjust these keys:

| Key | Must match |
|-----|------------|
| `Exec` | the installed executable name, `kchater` |
| `Icon` | the icon file name without the `.svg` suffix, `cn.vekaris.kchater` |
| `Name` | the name shown in the menu, `KChater` |

Then run `update-desktop-database ~/.local/share/applications` once.

## Experimental Features

KChater includes experimental features that are disabled by default. These features are functional but may have rough edges, change between releases, or lack full polish.

### Enabling Experimental Features

Set the environment variable before launching:

```bash
KCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 kchater
```

Or for development builds:

```bash
KCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 ./build/bin/kchater
```

Once enabled, new provider options appear in **Settings → General**.

### Experimental Providers

| Provider | Description |
|----------|-------------|
| **OpenClaw** | Connect to OpenClaw agent instances. Supports multiple instances with URL/token configuration and connection testing. Requires the OpenAI-compatible Chat Completions endpoint enabled in OpenClaw. |

## License

KChater is distributed under the **GNU General Public License, version 3 or
later** (GPL-3.0-or-later) — see [LICENSE](LICENSE).

Individual files carry their own `SPDX-License-Identifier`. Most of them are
**LGPL-2.1-or-later**, whose text is in
[LICENSES/LGPL-2.1-or-later.txt](LICENSES/LGPL-2.1-or-later.txt).

### Modifications

KChater is a modified version of [ChatQT](https://github.com/KodeRoots/ChatQT)
by Denys Madureira, and it keeps every upstream copyright notice. The original
git history is preserved in this repository.

Changes made in 2026: renamed the application and its application ID, drew a
new icon, rewrote the Simplified Chinese translation, added the runtime
language switcher, removed the system tray, the Flatpak manifest and the
AppStream metadata, and replaced the built-in humanizer text. Files that were
changed carry an `SPDX-FileContributor` tag.

### Third-party content

This repository ships no third-party artwork, fonts or text. The application
icon is original artwork drawn for this project, and the built-in writing
guidelines were written for it.
