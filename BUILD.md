## Build

### Prerequisites

- CMake 3.20 or higher
- Qt6 (Core, Quick, QuickControls2, Widgets, Sql)
- KDE Frameworks 6 (Kirigami, KirigamiAddons, I18n, CoreAddons, Config, Crash)
- C++17 compatible compiler
- Git

### Build Instructions

1. **Clone the repository:**
   ```bash
   git clone https://invent.kde.org/denysmb/ChatQT.git
   cd qtchater
   ```

2. **Configure the build:**
   ```bash
   cmake -B build -DCMAKE_INSTALL_PREFIX=~/.local
   ```

3. **Build:**
   ```bash
   cmake --build build
   ```

4. **Install:**
   ```bash
   cmake --install build
   ```

5. **Update desktop database and icon cache:**
   ```bash
   update-desktop-database ~/.local/share/applications/
   gtk-update-icon-cache ~/.local/share/icons/hicolor/
   ```

6. **Run:**
   ```bash
   ~/.local/bin/qtchater
   ```
   Or search for "qtchater" in your application launcher.

### System-wide Installation

For system-wide installation, omit the `CMAKE_INSTALL_PREFIX` and use sudo for install:
```bash
cmake -B build
cmake --build build
sudo cmake --install build
sudo update-desktop-database
sudo gtk-update-icon-cache /usr/share/icons/hicolor/
```

### Development Build

For development with debugging enabled:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j
```

Run directly from build directory:
```bash
./build/bin/qtchater
```

### Packages (.deb / .rpm)

```bash
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr
cmake --build build
cd build
cpack -G "DEB;RPM"   # or a single one: cpack -G DEB / cpack -G RPM
```

The packages install `/usr/bin/qtchater`, the desktop entry in
`/usr/share/applications`, the icon in `/usr/share/icons/hicolor`, the AppStream
metadata and the translations, so the app shows up in the application menu and
can be started as `qtchater` from anywhere.

Generating a `.deb` needs `dpkg-shlibdeps` (Debian/Ubuntu) and generating a
`.rpm` needs `rpmbuild` (Fedora/openSUSE); each one is best built on its own
distribution. `dnf install -y rpm-build` or `apt install -y dpkg-dev`.

The CI workflow `.github/workflows/release.yml` does this every day and
publishes the packages as a GitHub release, but only when something changed
since the previous release.
