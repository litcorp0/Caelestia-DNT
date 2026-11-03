<!-- Caelestia-DNT: Material You New Tab for Noctalia/Niri and Caelestia/Hyprland -->
<h1 align="center">

<img src="icons/icon128.png" width="64" alt="Caelestia-DNT Logo">
<br>
Caelestia-DNT: Dynamic New Tab

</h1>

<div align="center">

**A keyboard-first, distraction-free new tab and dynamic site themer that follows your Linux desktop's Material You wallpaper palette.**

</div>

<div align="center">

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
[![Chromium Compatible](https://img.shields.io/badge/Browsers-Thorium%20%7C%20Brave%20%7C%20Chrome%20%7C%20Edge%20%7C%20Vivaldi-3b82f6?style=for-the-badge&logo=brave&logoColor=white)](#)
[![Noctalia + Niri](https://img.shields.io/badge/Noctalia%20%2B%20Niri-Supported-00c853?style=for-the-badge)](#)
[![Caelestia + Hyprland](https://img.shields.io/badge/Caelestia%20%2B%20Hyprland-Supported-00c853?style=for-the-badge)](#)
[![Material You](https://img.shields.io/badge/Material%20You-Dynamic%20M3-f59e0b?style=for-the-badge&logo=materialdesign&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#)

</div>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-keyboard-shortcuts">Keyboard Shortcuts</a> •
  <a href="#-installation-cachyos--niri--noctalia">Noctalia/Niri Install</a> •
  <a href="#-legacy-caelestia--hyprland">Caelestia/Hyprland</a> •
  <a href="#-dynamic-theming-engine">Dynamic Theming</a> •
  <a href="#-privacy">Privacy</a> •
  <a href="#-license">License</a>
</p>

<img src="screenshots/zen-mode.png" alt="Caelestia-DNT Poster" width="100%">

---

## ✨ Features

- **Noctalia Shell synchronization**: Reads the palette Noctalia generates from your active wallpaper and applies it to the new tab and supported websites.
- **Caelestia Shell synchronization**: Keeps the original Caelestia/Hyprland scheme-file workflow working.
- **Wallpaper-driven everything**: The active wallpaper is copied into the extension, so the new tab background and colors always match the desktop.
- **Niri-friendly**: No compositor-specific hacks; works with Niri's tiling and gaps. Window fullscreen is still available through the browser.
- **Zen / Focus Mode (<kbd>Z</kbd>)**: Opens by default in a clean, distraction-free view with a large clock, personalized greeting, and inspirational quotes.
- **Integrated Quick Search (<kbd>S</kbd>)**: Instant floating search overlay with a search-engine dropdown (Google, Brave, DuckDuckGo, YouTube, Wikipedia).
- **Per-tab theming toggle**: Click the toolbar icon to switch the current tab between the wallpaper theme and the site's native look. A badge shows ON/OFF, and the override survives reloads until the tab is closed.
- **Curated website theming**: Injects your desktop palette into **YouTube**, **GitHub**, **Reddit**, **Wikipedia**, **Google Search**, and **WhatsApp Web**.
- **Optional browser chrome theme**: Generates a Thorium/Chromium theme so the tab strip, toolbar, and frame use the same palette.
- **Dashboard tools**: Quick shortcuts grid, daily task checklist, and an auto-saving scratchpad.
- **Dynamic motivational quotes**: Curated collection with instant clipboard copy (<kbd>C</kbd>) and random refresh (<kbd>R</kbd>).
- **Quick Browser Menu (<kbd>P</kbd>)**: Fast keyboard access to tabs, downloads, history, bookmarks, extensions, and preferences.

---

## 📸 Screenshots

### 1. Zen / Focus Mode
> Distraction-free view featuring a large clock, greeting, inspirational quote, and wallpaper background.

<img src="screenshots/zen-mode.png" alt="Zen Mode" width="100%">

---

### 2. Standard Dashboard Mode (<kbd>Z</kbd>)
> Full productivity dashboard with quick shortcuts, daily tasks checklist, and persistent scratchpad.

<img src="screenshots/standard-mode.png" alt="Standard Dashboard Mode" width="100%">

---

### 3. Dynamic Website Theming & Hidden Address Bar
> Automatically styles complex platforms like GitHub and YouTube using your desktop's active wallpaper palette.

<img src="screenshots/website-theming.png" alt="Website Theming" width="100%">

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Description |
| :---: | :--- | :--- |
| <kbd>Z</kbd> / <kbd>F11</kbd> | **Toggle Zen Mode** | Switch between minimalist Zen focus and full dashboard (native window fullscreen) |
| <kbd>S</kbd> or <kbd>/</kbd> | **Instant Search** | Opens the floating search bar |
| <kbd>P</kbd> | **Browser Menu** | Quick jump to tabs, history, downloads, bookmarks, and settings |
| <kbd>,</kbd> | **Preferences** | Open the options page |
| <kbd>H</kbd> | **History** | Jump directly to browser history |
| <kbd>D</kbd> | **Downloads** | Jump directly to downloads |
| <kbd>B</kbd> | **Bookmarks** | Jump directly to bookmarks |
| <kbd>E</kbd> | **Extensions** | Jump directly to extensions |
| <kbd>C</kbd> | **Copy Quote** | Copy the current quote to the clipboard |
| <kbd>R</kbd> | **New Quote** | Fetch a new random quote |
| <kbd>K</kbd> | **Toggle Hints Bar** | Show or collapse the bottom navigation hints |
| <kbd>?</kbd> | **Welcome Tour** | Reopen the onboarding wizard |
| <kbd>Esc</kbd> | **Dismiss / Return** | Close overlays, search, or return focus to the page |

---

## 🎯 Per-tab theming toggle

The toolbar icon controls theming for the **current tab and current site**. Click it to open the popup:

- **Themed** — the wallpaper palette is applied.
- **Default** — the site's native look is used.
- **Reset to site default** — removes the per-tab override and follows the global site setting again.

The toolbar badge shows `ON` or `OFF`; it is empty on unsupported sites. The override is stored in session storage, survives page reloads and service-worker restarts, and is cleared when the tab is closed or the browser exits.

Effective state:

| Per-tab override | Global site setting | Result |
|---|---|---|
| none | on | Themed |
| none | off | Default |
| on | on or off | Themed |
| off | on or off | Default |

This is independent for each site in a tab: turning off theming on Google does not affect WhatsApp if you navigate that tab there.

---

## 📥 Installation: CachyOS → Niri → Noctalia

### Prerequisites

- CachyOS / Arch Linux running **Niri** and **Noctalia Shell**.
- A Chromium-based browser. **Thorium** is used in the examples.
- `ImageMagick` (`magick`) for wallpaper resizing — already present on most CachyOS installs.

### 1. Clone the extension

```bash
git clone https://github.com/Muideen7/Caelestia-DNT.git ~/.config/caelestia/caelestia-dnt
cd ~/.config/caelestia/caelestia-dnt
```

### 2. Install the Noctalia bridge

```bash
./integrations/noctalia/install.sh
```

This writes `~/.config/noctalia/noctalia-dnt.toml`, copies the current wallpaper into the extension, and runs `noctalia msg templates-apply`. No background daemon is required.

If your extension lives somewhere else:

```bash
./integrations/noctalia/install.sh --extension-dir /path/to/extension
```

### 3. Load into Thorium / Chromium

1. Open `thorium://extensions` or `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select `~/.config/caelestia/caelestia-dnt`.
4. Open a new tab (`Ctrl + T`).

### 4. Optional: theme the actual tab strip

Noctalia can also generate a Chromium theme extension:

1. In `chrome://extensions`, click **Load unpacked**.
2. Select `~/.cache/noctalia-dnt/thorium-theme`.
3. Restart Thorium after a palette or light/dark change.

This colors the browser frame, tab strip, toolbar, bookmark bar, and omnibox. The new tab itself is still rendered by Caelestia-DNT.

### 5. Verify the live sync

```bash
noctalia msg color-scheme-get      # should start with "wallpaper"
noctalia msg templates-apply
noctalia msg wallpaper-next        # change wallpaper, then reopen the new tab
noctalia msg theme-mode-toggle     # switch light/dark, then reopen the new tab
```

### How the Noctalia integration works

Noctalia renders two user templates whenever the palette changes:

| Generated file | Purpose |
|---|---|
| `<extension>/noctalia-theme.json` | Full Material 3 token snapshot read by the extension |
| `<extension>/noctalia-wallpaper.jpg` | Resized copy of the active wallpaper |
| `~/.cache/noctalia-dnt/thorium-theme/manifest.json` | Optional Chromium browser theme |

Both extension files are gitignored, so the repo stays clean. See [`integrations/noctalia/README.md`](integrations/noctalia/README.md) for the template reference, manual configuration, and troubleshooting.

---

## 🦀 Legacy: Caelestia + Hyprland

The original Caelestia workflow is still supported.

### 1. Clone

```bash
git clone https://github.com/Muideen7/Caelestia-DNT.git ~/.config/caelestia/caelestia-dnt
```

### 2. Load the extension

`chrome://extensions` → Developer mode → **Load unpacked** → select the clone directory.

### 3. Sync the scheme on wallpaper/theme changes

Register the post-hooks in `~/.config/caelestia/cli.json`:

```json
{
  "theme": {
    "postHook": "cp -f \"$HOME/.local/state/caelestia/scheme.json\" \"$HOME/.config/caelestia/caelestia-dnt/caelestia-theme.json\""
  },
  "wallpaper": {
    "postHook": "cp -f \"$HOME/.local/state/caelestia/scheme.json\" \"$HOME/.config/caelestia/caelestia-dnt/caelestia-theme.json\""
  }
}
```

The extension reads `noctalia-theme.json` first and falls back to `caelestia-theme.json`.

### Optional desktop bridge (packed installs)

`caelestia-bridge.py` serves the scheme and wallpaper over `http://127.0.0.1:39123` for setups where Noctalia/Caelestia cannot write inside the extension directory (for example, a Chrome Web Store install). It is not needed for the unpacked Noctalia workflow above.

---

## 🎨 Dynamic Theming Engine

Caelestia-DNT resolves colors dynamically at runtime:

1. **Palette generation**: Noctalia (or Caelestia) extracts a Material 3 palette from the active wallpaper.
2. **Template delivery**: Noctalia's template engine writes `noctalia-theme.json` with all semantic roles, plus `noctalia-wallpaper.jpg`.
3. **Extension application**: `newtab.js` maps the tokens to CSS custom properties and the wallpaper; the service worker broadcasts the same snapshot to `content.js`.
4. **Site injection**: `content.js` remaps the design tokens of YouTube, GitHub, Reddit, Wikipedia, Google Search, and WhatsApp Web without breaking their layouts.

Theme sources available in Preferences:

- **Desktop Dynamic** — live Noctalia/Caelestia palette (default).
- **Wallpaper Color Extractor** — upload any image and extract a palette in-browser.
- **Designer Presets** — Caelestia Violet, Catppuccin Mocha, Tokyo Night, Nord Frost, Forest Matcha, Sunset Ember.

### Supported websites

| Site | What gets themed |
|---|---|
| YouTube | Backgrounds, masthead, guide, search box, text, buttons |
| GitHub | Header, navigation, cards, code blocks, forms, text |
| Reddit | Header, posts, cards, text, links |
| Wikipedia | Content, navigation, links, tables |
| Google Search | Results, links, snippets, filter tabs, search box, panels |
| WhatsApp Web | Landing/login page, chat list, conversation, chat bubbles, composer |

Google and WhatsApp adapters can be disabled individually under **Preferences → Website Theming** if a site update changes its markup. Existing four sites are always enabled.

A few limitations:

- Google Search already has its own light/dark setting. Caelestia-DNT layers the wallpaper palette on top of it.
- WhatsApp Web is a complex app; a future WhatsApp redesign may require selector updates.
- Canvas-based apps such as Google Docs, Sheets, Slides, and Figma cannot be fully themed with CSS.
- Arbitrary sites are not themed automatically; each adapter is written and tested per site.

---

## 🛡 Privacy

- **No analytics or telemetry.**
- Tasks, notes, display name, shortcuts, and preferences are stored locally.
- The new tab uses a few optional network services: Open-Meteo and ipapi.co for the weather pill, Quotable/DummyJSON for occasional online quotes, Google's favicon service for shortcut icons, and Google Fonts for typography. These requests are not used for tracking, but they do leave your machine. Block them at the network level if you prefer a fully offline new tab.
- The optional Python bridge binds to `127.0.0.1` only.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
