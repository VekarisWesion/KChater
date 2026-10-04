<div align="center">
  <img src="../resources/icons/cn.vekaris.qtchater.svg" width="128" height="128" alt="QtChater 图标"/>

  # QtChater

  **为 KDE Plasma 桌面打造的原生 AI 聊天客户端**

  在桌面上直接与多个服务商的 AI 模型对话

  [English](../README.md) · [简体中文](zh-CN.md)
</div>

---

## 简介

QtChater 是一个原生的 KDE Plasma 应用，用于和 AI 模型聊天。它基于 Qt6/QML 和 Kirigami 构建，拥有原生的外观与 Plasma 风格的对话框，可以无缝融入 KDE 桌面。

### 读音说明

"Chater" 并不是 "chatter" 的拼写错误。这里的 `a…e` 发长元音，读 /eɪ/，和 *later* 押韵，所以整个名字读作
**/ˌkjuːtˈtʃeɪtər/**，近似「cute-CHAY-ter」，而不是「chatter」。

## 功能

### 服务商

- **Ollama** — 连接本地 Ollama 模型，自动发现可用模型
- **OpenAI 兼容** — 连接任意 OpenAI 兼容 API（OpenAI、DeepSeek、Groq 等），支持多服务商与连接测试
- **OpenClaw** — 连接 OpenClaw 实例，支持多实例（实验性）
- **OpenCode** — 内置 OpenCode 服务进程管理，可启动/停止/重启并设置自动启动（实验性）
- **Pi** — 内置 Pi 进程管理，通过 RPC 模式自动探测并自动启动（实验性）

### 聊天

- **流式响应** — 逐字实时显示回复
- **思考模式** — 为支持的模型开启扩展思考/推理
- **会话管理** — 持久化会话与侧边栏，启动时自动恢复
- **取消与停止** — 可取消等待中的请求或中途停止输出
- **自动滚动** — 自动滚动，也可手动接管
- **附件** — 随消息一起发送文件

### MCP（模型上下文协议）

- **远程 MCP 服务器** — 连接 Streamable HTTP 类型的 MCP 服务器
- **本地 MCP 服务器** — 以子进程方式运行 stdio 型 MCP 服务器（JSON-RPC）
- **内置服务器** — 预置 Bash MCP 与 Filesystem MCP 服务器
- **工具调用** — 自动检测并执行工具调用，可配置递归深度上限
- **服务器状态** — 实时显示连接状态与可用工具数量

### 技能与 Agent

- **技能发现** — 扫描目录中的 `SKILL.md`，作为系统提示注入对话上下文
- **Agent 指令** — 加载 `AGENTS.md` 或 `CLAUDE.md`，提供长期有效的 AI 指令
- **系统提示构建** — 自动把技能与 Agent 指令合并为系统消息

### 桌面集成

- **语言切换** — 支持英文与简体中文，可在设置中即时切换
- **全局安装** — 自动安装 `qtchater` 命令、桌面入口与图标

## 从源码构建

QtChater 在 **Fedora** + KDE Plasma 上开发和测试。下面是 Fedora 的步骤；其他发行版请看 [其他发行版](#其他发行版)。

### 1. 安装构建依赖

```bash
sudo dnf install cmake ninja-build gcc-c++ extra-cmake-modules gettext \
    qt6-qtbase-devel qt6-qtdeclarative-devel qt6-qtsvg-devel \
    kf6-kcoreaddons-devel kf6-ki18n-devel kf6-kirigami-devel \
    kf6-kconfig-devel kf6-kcrash-devel kf6-kirigami-addons-devel
```

运行时还需要对应的非 devel 包，它们随你的 Plasma 安装一并提供。

### 2. 拉取源码并构建

```bash
git clone https://github.com/VekarisWesion/QtChater.git
cd QtChater

cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### 3. 运行

```bash
./build/bin/qtchater
```

### 4. 安装（可选）

安装后 `qtchater` 会进入 `PATH`，同时安装桌面入口，可以直接从应用菜单启动。

安装到用户目录（无需 root）：

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX="$HOME/.local"
cmake --build build
cmake --install build
```

可执行文件位于 `~/.local/bin/qtchater`。

全局安装：

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
sudo cmake --install build
```

### 生成 .deb / .rpm 包（可选）

`cpack` 可以基于同一次构建产出发行版安装包。用与当前系统匹配的生成器：

```bash
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
cd build

cpack -G RPM    # Fedora / openSUSE，需要 rpm-build
cpack -G DEB    # Debian / Ubuntu，需要 dpkg-dev
```

两种包都会安装 `/usr/bin/qtchater`、桌面入口、图标以及翻译文件。

### 其他发行版

这里只覆盖 Fedora。其他发行版请从自己的软件源安装等价的 Qt 6 / KDE Frameworks 6 / Kirigami Addons / Extra CMake Modules 开发包，后续构建步骤完全一样。

如果不确定对应哪些包，可以把上面 Fedora 的包名列表丢给 AI 助手，让它帮你换算成你的发行版——这类问题很适合问 AI。

## 仓库结构

构建过程不需要联网下载任何东西：界面已经编译进可执行文件，其余资源都从这个仓库安装。

| 路径 | 说明 |
|------|------|
| `src/` | C++ 源码 —— `main.cpp`、会话存储、文件助手、热重载、翻译辅助 |
| `src/qml/` | 全部界面：`Main.qml`、`pages/`、`components/`、`settings/`，以及 `logic/` 下的 JavaScript |
| `po/` | 翻译 —— `zh_CN.po`、生成的 `qtchater.pot` 模板，以及用于重新生成的 `Messages.sh` |
| `resources/icons/cn.vekaris.qtchater.svg` | 应用图标，窗口、任务栏和菜单项都用它 |
| `cn.vekaris.qtchater.desktop` | 桌面入口模板，见下 |
| `CMakeLists.txt`、`src/CMakeLists.txt` | 构建系统，包含可选的 `cpack` 打包 |
| `LICENSE` | GPL-3.0 |

图标文件名、桌面入口里的 `Icon=`，以及 `src/main.cpp` 里的 `QIcon::fromTheme()` 必须保持一致——它们都是同一个字符串 `cn.vekaris.qtchater`。

### 桌面入口是模板

`cn.vekaris.qtchater.desktop` 是一个可用的桌面入口，但请把它当模板看，而不是必须原样保留的东西。`cmake --install` 会把它装到 `/usr/share/applications/`，图标装到 `/usr/share/icons/hicolor/scalable/apps/`，这一对文件才是应用出现在菜单里的原因。

如果你改了应用名，或者想手动构建，把该文件复制到 `~/.local/share/applications/`，并改好这几个键：

| 键 | 需要匹配 |
|-----|---------|
| `Exec` | 安装后的可执行文件名，`qtchater` |
| `Icon` | 去掉 `.svg` 后缀的图标文件名，`cn.vekaris.qtchater` |
| `Name` | 菜单里显示的名字，`QtChater` |

然后执行一次 `update-desktop-database ~/.local/share/applications`。

## 实验性功能

QtChater 包含一些默认关闭的实验性功能。它们可用，但可能不够完善、会随版本变化，或缺少打磨。

### 启用实验性功能

启动前设置环境变量：

```bash
QTCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 qtchater
```

开发构建：

```bash
QTCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 ./build/bin/qtchater
```

启用后，**设置 → 常规** 中会出现新的服务商选项。

### 实验性服务商

| 服务商 | 说明 |
|----------|-------------|
| **OpenClaw** | 连接 OpenClaw agent 实例，支持多实例的 URL/令牌配置与连接测试。需要在 OpenClaw 中启用兼容 OpenAI 的 Chat Completions 端点。 |
| **OpenCode** | 由 QtChater 直接管理 OpenCode 服务进程。可配置二进制路径、自动探测、启动/停止/重启、设置主机与端口，并查看服务日志。支持启动时自动启动与崩溃后自动重启（最多 3 次）。 |
| **Pi** | 通过 RPC 模式（stdin/stdout JSONL 协议）连接 Pi 编码 agent。可配置二进制路径、自动探测、启动/停止并查看日志。当 Pi 为当前服务商时支持自动启动。 |

## 许可证

本项目使用 GPL-3.0 许可证 —— 详见 [LICENSE](../LICENSE)。

QtChater 基于 Denys Madureira 的 [ChatQT](https://github.com/KodeRoots/ChatQT)。
