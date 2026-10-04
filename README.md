<div align="center">
  # qtchater

  **A native AI chat client for the KDE Plasma desktop**

  Chat with AI models through multiple providers — directly from your desktop

  [English](README.md) · [简体中文](README/zh-CN.md)
</div>

---

## About

qtchater is a native KDE Plasma application for chatting with AI models. Built with Qt6/QML and Kirigami, it integrates seamlessly into the KDE desktop with a native look and feel and Plasma-style dialogs.

## Features

### Providers

- **Ollama** — Connect to local models running via Ollama with automatic model discovery
- **OpenAI Compatible** — Connect to any OpenAI-compatible API (OpenAI, DeepSeek, Groq, etc.) with multi-provider support and connection testing
- **OpenClaw** — Connect to OpenClaw instances with multi-instance support (experimental)
- **OpenCode** — Built-in OpenCode server management with start/stop/restart controls and auto-start (experimental)
- **Pi** — Built-in Pi process management via RPC mode with auto-detect and auto-start (experimental)

### Chat

- **Streaming responses** — Real-time token-by-token response display
- **Thinking mode** — Toggle extended thinking/reasoning for supported models
- **Session management** — Persistent sessions with sidebar, auto-restore on launch
- **Cancel and stop** — Cancel pending requests or stop mid-stream
- **Auto-scroll** — Automatic scrolling with manual override option
- **Attachments** — Send files together with a message

### MCP (Model Context Protocol)

- **Remote MCP servers** — Connect to Streamable HTTP MCP servers
- **Local MCP servers** — Run stdio-based MCP servers as subprocesses (JSON-RPC)
- **Built-in servers** — Pre-configured Bash MCP and Filesystem MCP servers
- **Tool calling** — Automatic tool call detection, execution, and follow-up with configurable depth limit
- **Server status** — Real-time connection status and available tool count

### Skills and Agent

- **Skill discovery** — Scan folders for `SKILL.md` files and inject them into chat context as system prompts
- **Agent instructions** — Load an `AGENTS.md` or `CLAUDE.md` file to provide persistent AI instructions
- **System prompt builder** — Automatically combines skills and agent instructions into a system message

### Desktop Integration

- **Language selection** — English and Simplified Chinese, switchable at runtime from the settings
- **System-wide install** — The desktop entry, icon and AppStream metadata are installed for you
- **Flatpak support** — A Flatpak manifest is available with proper sandboxing utilities

## Building from Source

qtchater is developed and tested on **Fedora** with KDE Plasma. The instructions
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
git clone https://github.com/VekarisWesion/QtChater.git
cd QtChater

cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### 3. Run it

```bash
./build/bin/qtchater
```

### 4. Install it (optional)

Installing puts `qtchater` on your `PATH` and adds the desktop entry, so you can
start it from the application menu.

User-local install, no root needed:

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX="$HOME/.local"
cmake --build build
cmake --install build
```

The binary then is `~/.local/bin/qtchater`.

System-wide install:

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
sudo cmake --install build
```

### Building .deb / .rpm packages (optional)

`cpack` produces distribution packages out of the same build. Use the generator
that matches the machine you are building on:

```bash
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
cd build

cpack -G RPM    # Fedora / openSUSE, needs rpm-build
cpack -G DEB    # Debian / Ubuntu, needs dpkg-dev
```

Both packages install `/usr/bin/qtchater`, the desktop entry, the icon, the
AppStream metadata and the translations.

### Other distributions

Only Fedora is covered here. On any other distribution, install the equivalent
Qt 6 / KDE Frameworks 6 / Kirigami Addons / Extra CMake Modules development
packages from your own repositories — the rest of the build is identical.

If you are not sure which packages those are, ask an AI assistant to translate
the Fedora package list above for your distribution; that is a perfect question
for it.

## Experimental Features

qtchater includes experimental features that are disabled by default. These features are functional but may have rough edges, change between releases, or lack full polish.

### Enabling Experimental Features

Set the environment variable before launching:

```bash
QTCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 qtchater
```

Or for development builds:

```bash
QTCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 ./build/bin/qtchater
```

Once enabled, new provider options appear in **Settings → General**.

### Experimental Providers

| Provider | Description |
|----------|-------------|
| **OpenClaw** | Connect to OpenClaw agent instances. Supports multiple instances with URL/token configuration and connection testing. Requires the OpenAI-compatible Chat Completions endpoint enabled in OpenClaw. |
| **OpenCode** | Manages an OpenCode server process directly from qtchater. Configure the binary path, auto-detect, start/stop/restart, set host/port, and view server logs. Supports auto-start on launch and auto-restart on crash (up to 3 attempts). |
| **Pi** | Connects to a Pi coding agent via RPC mode (stdin/stdout JSONL protocol). Configure the binary path, auto-detect, start/stop, and view logs. Supports auto-start when Pi is the active provider. |

## License

This project is licensed under the GPL-3.0 License — see the [LICENSE](LICENSE) file for details.

qtchater is based on [ChatQT](https://github.com/KodeRoots/ChatQT) by Denys Madureira.
