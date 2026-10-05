<div align="center">
  <img src="../resources/icons/cn.vekaris.kchater.svg" width="128" height="128" alt="KChater 图标"/>

  # KChater

  **为 KDE Plasma 桌面打造的原生 AI 聊天客户端**

  在桌面上直接与多个服务商的 AI 模型对话

  [English](../README.md) · [简体中文](zh-CN.md)
</div>

---

## 简介

KChater 是一个原生的 KDE Plasma 应用，用于和 AI 模型聊天。它基于 Qt6/QML 和 Kirigami 构建，拥有原生的外观与 Plasma 风格的对话框，可以无缝融入 KDE 桌面。

> **与 KDE 无关联。** KChater 是一个独立项目，与 KDE e.V. 没有隶属、背书或赞助关系。
> 「KDE」与「Plasma」是 KDE e.V. 的商标，此处仅用于说明本程序为哪个桌面环境而做。
> Qt 是 The Qt Company Ltd. 的商标。

### 读音说明

开头的 K 取自 KDE，读作字母 K 的音。后面的 "Chater" 并不是 "chatter" 的拼写错误：
这里的 `a…e` 发长元音 /eɪ/，和 *later* 押韵。所以整个名字读作
**/ˌkeɪˈtʃeɪtər/**，近似「KAY-CHAY-ter」，而不是「chatter」。

## 功能

### 服务商

- **Ollama** — 连接本地 Ollama 模型，自动发现可用模型
- **OpenAI 兼容** — 连接任意 OpenAI 兼容 API（OpenAI、DeepSeek、Groq 等），支持多服务商与连接测试
- **OpenClaw** — 连接 OpenClaw 实例，支持多实例（实验性）

### 聊天

- **流式响应** — 逐字实时显示回复
- **思考模式** — 为支持的模型开启扩展思考/推理
- **思考控制** — 各家服务端开关思考的参数并不统一，所以每个服务商可单独选择约定：DeepSeek 的 `thinking.type`、vLLM/Qwen 的 `enable_thinking` 模板参数、不发送任何参数，其他情况用自定义 JSON
- **会话管理** — 持久化会话与侧边栏，启动时自动恢复
- **取消与停止** — 可取消等待中的请求或中途停止输出
- **自动滚动** — 自动滚动，也可手动接管
- **附件** — 随消息一起发送文件

### MCP（模型上下文协议）

- **远程 MCP 服务器** — 连接 Streamable HTTP 类型的 MCP 服务器
- **工具调用** — 自动检测并执行工具调用，可配置递归深度上限
- **服务器状态** — 实时显示连接状态与可用工具数量

### 桌面集成

- **语言切换** — 支持英文与简体中文，可在设置中即时切换
- **全局安装** — 自动安装 `kchater` 命令、桌面入口与图标

## 从源码构建

KChater 在 **Fedora** + KDE Plasma 上开发和测试。下面是 Fedora 的步骤；其他发行版请看 [其他发行版](#其他发行版)。

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
git clone https://github.com/VekarisWesion/KChater.git
cd KChater

cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### 3. 运行

```bash
./build/bin/kchater
```

### 4. 安装（可选）

安装后 `kchater` 会进入 `PATH`，同时安装桌面入口，可以直接从应用菜单启动。

安装到用户目录（无需 root）：

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX="$HOME/.local"
cmake --build build
cmake --install build
```

可执行文件位于 `~/.local/bin/kchater`。

全局安装：

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
sudo cmake --install build
```

### 其他发行版与打包

本仓库只包含程序源码，不含任何打包相关的东西——没有 `.rpm`、没有 `.deb`、也没有
Flatpak。开发和测试只在 Fedora 上进行。

如果你想要上述任何一种包，那属于打包问题，不是 KChater 的问题。请自行从软件源
安装等价的 Qt 6 / KDE Frameworks 6 / Kirigami Addons / Extra CMake Modules 开发包，
然后让 AI 助手带你把这个构建做成安装包——这类问题很适合问 AI。

## 仓库结构

构建过程不需要联网下载任何东西：界面已经编译进可执行文件，其余资源都从这个仓库安装。

| 路径 | 说明 |
|------|------|
| `src/` | C++ 源码 —— `main.cpp`、会话存储、文件助手、热重载、翻译辅助 |
| `src/qml/` | 全部界面：`Main.qml`、`pages/`、`components/`、`settings/`，以及 `logic/` 下的 JavaScript |
| `po/` | 翻译 —— `zh_CN.po`、生成的 `kchater.pot` 模板，以及用于重新生成的 `Messages.sh` |
| `resources/icons/cn.vekaris.kchater.svg` | 应用图标，窗口、任务栏和菜单项都用它 |
| `cn.vekaris.kchater.desktop` | 桌面入口模板，见下 |
| `CMakeLists.txt`、`src/CMakeLists.txt` | 构建系统 |
| `LICENSE` | GPL-3.0 |

图标文件名、桌面入口里的 `Icon=`，以及 `src/main.cpp` 里的 `QIcon::fromTheme()` 必须保持一致——它们都是同一个字符串 `cn.vekaris.kchater`。

### 桌面入口是模板

`cn.vekaris.kchater.desktop` 是一个可用的桌面入口，但请把它当模板看，而不是必须原样保留的东西。`cmake --install` 会把它装到 `/usr/share/applications/`，图标装到 `/usr/share/icons/hicolor/scalable/apps/`，这一对文件才是应用出现在菜单里的原因。

如果你改了应用名，或者想手动构建，把该文件复制到 `~/.local/share/applications/`，并改好这几个键：

| 键 | 需要匹配 |
|-----|---------|
| `Exec` | 安装后的可执行文件名，`kchater` |
| `Icon` | 去掉 `.svg` 后缀的图标文件名，`cn.vekaris.kchater` |
| `Name` | 菜单里显示的名字，`KChater` |

然后执行一次 `update-desktop-database ~/.local/share/applications`。

## 实验性功能

KChater 包含一些默认关闭的实验性功能。它们可用，但可能不够完善、会随版本变化，或缺少打磨。

### 启用实验性功能

启动前设置环境变量：

```bash
KCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 kchater
```

开发构建：

```bash
KCHATER_ENABLE_EXPERIMENTAL_FEATURES=1 ./build/bin/kchater
```

启用后，**设置 → 常规** 中会出现新的服务商选项。

### 实验性服务商

| 服务商 | 说明 |
|----------|-------------|
| **OpenClaw** | 连接 OpenClaw agent 实例，支持多实例的 URL/令牌配置与连接测试。需要在 OpenClaw 中启用兼容 OpenAI 的 Chat Completions 端点。 |

## 许可证

KChater 以 **GNU 通用公共许可证第 3 版或更高版本**（GPL-3.0-or-later）分发 ——
详见 [LICENSE](../LICENSE)。

各个文件带有自己的 `SPDX-License-Identifier`，其中大多数是
**LGPL-2.1-or-later**，许可证全文见
[LICENSES/LGPL-2.1-or-later.txt](../LICENSES/LGPL-2.1-or-later.txt)。

### 修改说明

KChater 是 Denys Madureira 的 [ChatQT](https://github.com/KodeRoots/ChatQT)
的修改版本，保留了上游全部版权声明，仓库中也完整保留了上游的 git 历史。

2026 年所做的修改：重命名应用及其应用 ID、重新绘制图标、重写简体中文翻译、
新增运行时语言切换、移除系统托盘、Flatpak 清单与 AppStream 元数据、替换内置的
拟人化文本。被修改过的文件都带有 `SPDX-FileContributor` 标识。

### 第三方内容

本仓库不包含任何第三方美术素材、字体或文本。应用图标是为本项目绘制的原创作品，
内置的写作规范也是为本项目撰写的。
