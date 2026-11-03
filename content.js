// Caelestia Material You declarative CSS injector
// Targets YouTube, GitHub, Reddit, Wikipedia, Google Search, and WhatsApp Web,
// with a universal fallback for future adapters.

(() => {
  'use strict';

  const STYLE_ID = 'caelestia-dynamic-site-theme';
  const ROOT_ATTRIBUTES = [
    'data-color-mode',
    'data-dark-theme',
    'data-light-theme',
    'data-theme',
    'data-bs-theme'
  ];
  let currentTheme = null;
  let sitesEnabled = {};
  let tabThemeOverride; // undefined = follow site setting, true/false = tab override
  let themeReady = false;
  let tabStateReady = false;
  let originalRootState = null;

  function captureRootState() {
    if (originalRootState) return;
    const el = document.documentElement;
    originalRootState = {
      attributes: Object.fromEntries(ROOT_ATTRIBUTES.map((attr) => [attr, el.getAttribute(attr)])),
      dark: el.classList.contains('dark'),
      light: el.classList.contains('light')
    };
  }

  function restoreRootState() {
    if (!originalRootState) return;
    const el = document.documentElement;
    for (const attr of ROOT_ATTRIBUTES) {
      const value = originalRootState.attributes[attr];
      if (value === null) el.removeAttribute(attr);
      else el.setAttribute(attr, value);
    }
    el.classList.toggle('dark', originalRootState.dark);
    el.classList.toggle('light', originalRootState.light);
    originalRootState = null;
  }

  function removeInjectedStyle() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    restoreRootState();
  }

  function getCurrentSite() {
    return globalThis.CaelestiaSites?.getByHostname(window.location.hostname.toLowerCase()) || null;
  }

  function isSiteThemeEnabled(site) {
    if (tabThemeOverride !== undefined) return tabThemeOverride;
    return site ? sitesEnabled[site.id] !== false : true;
  }

  function maybeApplyTheme() {
    if (!themeReady || !tabStateReady || !currentTheme) return;
    applyCaelestiaTheme(currentTheme);
  }

  function getHex(val) {
    if (!val) return '';
    return val.startsWith('#') ? val : `#${val}`;
  }

  // WhatsApp's design tokens expose some values as "r, g, b" strings.
  function hexToRgbCsv(val) {
    const clean = getHex(val).replace('#', '');
    const full = clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
    if (!/^[0-9a-f]{6}$/i.test(full)) return '0, 0, 0';
    const num = parseInt(full, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }

  // Purely dynamic token resolution - all colors derived directly from wallpaper scheme
  function resolveThemeTokens(colors, isDark) {
    const primary = getHex(colors.primary) || (isDark ? '#d0bcff' : '#6750a4');
    const onPrimary = getHex(colors.onPrimary) || (isDark ? '#381e72' : '#ffffff');
    const primContainer = getHex(colors.primaryContainer) || primary;
    const onPrimContainer = getHex(colors.onPrimaryContainer) || onPrimary;

    const bg = getHex(colors.background) || getHex(colors.surface) || (isDark ? '#141218' : '#fef7ff');
    const surface = getHex(colors.surface) || bg;
    const surfaceLow = getHex(colors.surfaceContainerLow) || surface;
    const surfaceMid = getHex(colors.surfaceContainer) || getHex(colors.surfaceVariant) || surface;
    const surfaceHigh = getHex(colors.surfaceContainerHigh) || surfaceMid;
    const surfaceHighest = getHex(colors.surfaceContainerHighest) || surfaceMid;

    const onSurface = getHex(colors.onSurface) || (isDark ? '#e6e0e9' : '#1d1b20');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#cac4d0' : '#49454f');
    const outline = getHex(colors.outlineVariant) || getHex(colors.outline) || onSurfaceVar;

    const secondary = getHex(colors.secondary) || primary;
    const onSecondary = getHex(colors.onSecondary) || onPrimary;
    const secContainer = getHex(colors.secondaryContainer) || surfaceMid;
    const onSecContainer = getHex(colors.onSecondaryContainer) || onSurface;

    const tertiary = getHex(colors.tertiary) || secondary;
    const onTertiary = getHex(colors.onTertiary) || onPrimary;
    const tertContainer = getHex(colors.tertiaryContainer) || surfaceMid;
    const onTertContainer = getHex(colors.onTertiaryContainer) || onSurface;

    // Dynamic semantic accents derived from active wallpaper palette
    const green = getHex(colors.green) || getHex(colors.success) || primary;
    const yellow = getHex(colors.yellow) || getHex(colors.peach) || secondary;
    const error = getHex(colors.error) || getHex(colors.red) || outline;
    const mauve = getHex(colors.mauve) || tertiary;
    const blue = getHex(colors.blue) || primary;

    return {
      bg, surface, surfaceLow, surfaceMid, surfaceHigh, surfaceHighest,
      onSurface, onSurfaceVar, outline,
      primary, onPrimary, primContainer, onPrimContainer,
      secondary, onSecondary, secContainer, onSecContainer,
      tertiary, onTertiary, tertContainer, onTertContainer,
      green, yellow, error, mauve, blue
    };
  }

  function buildYouTubeCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const surfaceHighest = t.surfaceHighest;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;
    const primContainer = t.primContainer;
    const onPrimContainer = t.onPrimContainer;

    return `
      /* --- YouTube Caelestia Dynamic Styling --- */
      html, html[dark], [dark], ytd-app {
        --yt-spec-base-background: ${bg} !important;
        --yt-spec-raised-background: ${surfaceLow} !important;
        --yt-spec-menu-background: ${surfaceMid} !important;
        --yt-spec-general-background-a: ${bg} !important;
        --yt-spec-general-background-b: ${surfaceMid} !important;
        --yt-spec-brand-background-solid: ${bg} !important;
        --yt-spec-brand-background-primary: ${surfaceMid} !important;
        --yt-spec-brand-background-secondary: ${surfaceHigh} !important;
        --yt-spec-badge-chip-background: ${surfaceHigh} !important;
        --yt-spec-text-primary: ${onSurface} !important;
        --yt-spec-text-secondary: ${onSurfaceVar} !important;
        --yt-spec-static-brand-white: ${onSurface} !important;
        --yt-spec-call-to-action: ${primary} !important;
        --yt-spec-touch-response: ${primary} !important;
        --yt-spec-icon-active: ${primary} !important;
        --yt-spec-icon-inactive: ${onSurfaceVar} !important;
        --yt-spec-icon-disabled: ${outline} !important;
        --ytd-searchbox-background: ${surfaceLow} !important;
        --ytd-searchbox-text-color: ${onSurface} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      #masthead, ytd-masthead, #masthead-container {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
      }

      form#search-form,
      #container.ytd-searchbox,
      input.ytd-searchbox,
      #search-input input {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      #search-icon-legacy.ytd-searchbox,
      #search-btn.ytd-searchbox {
        background-color: ${surfaceHigh} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      #search-icon-legacy.ytd-searchbox yt-icon {
        color: ${onSurface} !important;
      }

      #guide-content.ytd-app, 
      ytd-guide-renderer, 
      ytd-mini-guide-renderer,
      #sections.ytd-guide-renderer {
        background-color: ${surfaceLow} !important;
      }

      ytd-guide-entry-renderer yt-formatted-string,
      ytd-guide-entry-renderer .title,
      ytd-mini-guide-entry-renderer .title,
      #guide-section-title.ytd-guide-section-renderer,
      #guide-entry yt-icon,
      ytd-guide-entry-renderer yt-icon {
        color: ${onSurface} !important;
        fill: ${onSurface} !important;
        font-weight: 500 !important;
      }

      ytd-guide-entry-renderer[active],
      ytd-guide-entry-renderer:hover {
        background-color: ${surfaceHigh} !important;
      }

      #video-title,
      #video-title.ytd-rich-grid-media,
      #video-title.ytd-compact-video-renderer,
      #channel-name,
      #channel-title,
      #text.ytd-channel-name,
      yt-formatted-string.ytd-channel-name,
      #owner-name,
      #title.ytd-watch-metadata,
      #description-text,
      #content-text {
        color: ${onSurface} !important;
      }

      #metadata-line span,
      #byline,
      #owner-sub-count,
      #subscriber-count,
      .badge-shape-wiz--thumbnail-default {
        color: ${onSurfaceVar} !important;
      }

      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"] {
        background-color: ${surfaceHigh} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }

      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"][selected] {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
        border-color: ${primary} !important;
      }

      ytd-button-renderer.ytd-subscribe-button-renderer ytd-button-renderer button,
      #subscribe-button button,
      .yt-spec-button-shape-next--filled {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-radius: 9999px !important;
      }

      ytd-menu-popup-renderer, 
      tp-yt-paper-dialog, 
      tp-yt-paper-listbox {
        background-color: ${surfaceMid} !important;
        border: 1px solid ${outline} !important;
        border-radius: 16px !important;
        color: ${onSurface} !important;
      }
    `;
  }

  function buildGitHubCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;

    // Fully dynamic semantic colors derived directly from wallpaper palette
    const folderColor = t.yellow;
    const starColor = t.yellow;
    const branchColor = t.primary;
    const openColor = t.green;
    const mergedColor = t.mauve;
    const closedColor = t.error;

    return `
      /* --- GitHub Primer & Modern Tokens Overrides --- */
      :root,
      html,
      body,
      [data-color-mode],
      [data-dark-theme],
      [data-light-theme] {
        --bgColor-default: ${bg} !important;
        --bgColor-muted: ${surfaceLow} !important;
        --bgColor-inset: ${surfaceLow} !important;
        --bgColor-emphasis: ${primary} !important;
        --fgColor-default: ${onSurface} !important;
        --fgColor-muted: ${onSurfaceVar} !important;
        --fgColor-accent: ${primary} !important;
        --borderColor-default: ${outline} !important;
        --borderColor-muted: ${outline} !important;
        --color-canvas-default: ${bg} !important;
        --color-canvas-subtle: ${surfaceLow} !important;
        --color-canvas-inset: ${surfaceLow} !important;
        --color-border-default: ${outline} !important;
        --color-border-muted: ${outline} !important;
        --color-border-subtle: ${outline} !important;
        --color-fg-default: ${onSurface} !important;
        --color-fg-muted: ${onSurfaceVar} !important;
        --color-fg-subtle: ${onSurfaceVar} !important;
        --color-accent-fg: ${primary} !important;
        --color-accent-emphasis: ${primary} !important;
        --color-icon-directory: ${folderColor} !important;
        --color-icon-code: ${primary} !important;
        --iconColor-default: ${onSurface} !important;
        --iconColor-muted: ${onSurfaceVar} !important;
        --iconColor-accent: ${primary} !important;
        --color-btn-icon: ${onSurface} !important;
        --color-btn-bg: ${surfaceMid} !important;
        --color-btn-border: ${outline} !important;
        --color-btn-text: ${onSurface} !important;
        --color-btn-primary-bg: ${primary} !important;
        --color-btn-primary-text: ${onPrimary} !important;
        --color-header-bg: ${surfaceMid} !important;
        --color-header-text: ${onSurface} !important;
        --color-header-logo: ${onSurface} !important;
        --color-page-header-bg: ${surfaceLow} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      /* GitHub App Header Bar & Header Icons */
      header.AppHeader, 
      header.Header, 
      .AppHeader-globalBar, 
      .Header, 
      header,
      .AppHeader {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
        color: ${onSurface} !important;
      }

      header svg, 
      .AppHeader svg, 
      header .octicon,
      .AppHeader .octicon,
      .Header-link svg,
      .octicon-mark-github {
        fill: ${onSurface} !important;
        color: ${onSurface} !important;
      }

      /* Baseline Octicon fill behavior */
      .octicon,
      svg.octicon,
      [class*="octicon-"] {
        fill: currentColor !important;
      }

      /* Directory / Folder Icons (Vibrant & High Contrast) */
      .octicon-file-directory,
      .octicon-file-directory-fill,
      .octicon-file-directory-open-fill,
      .octicon-file-submodule,
      svg[aria-label="Directory"],
      svg[aria-label="Directory"] path,
      svg[aria-label="Submodule"],
      .react-directory-row .octicon-file-directory-fill {
        fill: ${folderColor} !important;
        color: ${folderColor} !important;
      }

      /* File Icons (Clean & Visible) */
      .octicon-file,
      .octicon-file-code,
      .octicon-file-badge,
      .octicon-file-binary,
      svg[aria-label="File"],
      svg[aria-label="File"] path,
      .react-directory-row .octicon-file {
        fill: ${onSurface} !important;
        color: ${onSurface} !important;
        opacity: 0.9 !important;
      }

      /* Star Icons (Bright Radiant Gold) */
      .octicon-star,
      .octicon-star-fill,
      svg[aria-label="Star"],
      .starred .octicon-star,
      .btn[data-hydro-click*="star"] .octicon {
        fill: ${starColor} !important;
        color: ${starColor} !important;
      }

      /* Branch, Commit, History, Tags & Repo Icons */
      .octicon-git-branch,
      .octicon-git-commit,
      .octicon-history,
      .octicon-tag,
      .octicon-repo,
      .octicon-repo-forked,
      .octicon-eye {
        fill: ${branchColor} !important;
        color: ${branchColor} !important;
      }

      /* Status Icons (Issues, PRs, Checks) */
      .octicon-issue-opened,
      .octicon-git-pull-request,
      .octicon-check,
      .octicon-check-circle-fill,
      .color-fg-success .octicon {
        fill: ${openColor} !important;
        color: ${openColor} !important;
      }

      .octicon-issue-closed,
      .octicon-git-merge,
      .octicon-skip,
      .color-fg-done .octicon {
        fill: ${mergedColor} !important;
        color: ${mergedColor} !important;
      }

      .octicon-x,
      .octicon-x-circle-fill,
      .octicon-issue-draft,
      .color-fg-danger .octicon {
        fill: ${closedColor} !important;
        color: ${closedColor} !important;
      }

      /* Navigation Tabs & Badges (Code, Issues, PRs, Actions, Settings) */
      .pagehead, .subnav, .subnav-bordered, .UnderlineNav, .UnderlineNav-body, nav[aria-label="Repository"] {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .UnderlineNav-item {
        color: ${onSurface} !important;
      }

      .UnderlineNav-item .octicon {
        color: ${onSurfaceVar} !important;
        fill: ${onSurfaceVar} !important;
      }

      .UnderlineNav-item[aria-current="page"] .octicon, 
      .UnderlineNav-item.selected .octicon,
      .UnderlineNav-item:hover .octicon {
        color: ${primary} !important;
        fill: ${primary} !important;
      }

      .UnderlineNav-item[aria-current="page"], 
      .UnderlineNav-item.selected {
        color: ${onSurface} !important;
        border-bottom-color: ${primary} !important;
      }

      .UnderlineNav-item .Counter,
      .Counter {
        background-color: ${surfaceHigh} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }

      /* Button & Action Visual Icons */
      .btn, 
      .Button, 
      .btn-sm,
      .Button--secondary {
        background-color: ${surfaceMid} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .btn .octicon,
      .Button .octicon,
      .Button-leadingVisual .octicon,
      .Button-trailingVisual .octicon,
      .Button-visual .octicon {
        fill: currentColor !important;
      }

      .btn-primary, 
      .Button--primary {
        background-color: ${primary} !important;
        border-color: ${primary} !important;
        color: ${onPrimary} !important;
      }

      .btn-primary .octicon,
      .Button--primary .octicon {
        fill: ${onPrimary} !important;
        color: ${onPrimary} !important;
      }

      /* File Explorer Table & Commit Bar */
      .Box, 
      .Box-header, 
      .commit-tease, 
      div[data-target="react-app.reactApp"] > div,
      .js-details-container {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .Box-row {
        border-top-color: ${outline} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      .Box-row:hover {
        background-color: ${surfaceHigh} !important;
      }

      /* React Tree rows */
      .react-directory-row, 
      .react-directory-filename-column, 
      .react-directory-commit-age,
      table.files td {
        color: ${onSurface} !important;
      }

      /* Text readability without blanket div/span pollution */
      p, li, td, th, h1, h2, h3, h4, h5, h6, label {
        color: ${onSurface} !important;
      }

      .color-fg-muted,
      .color-fg-subtle,
      .text-small,
      .f6,
      .commit-author {
        color: ${onSurfaceVar} !important;
      }

      a.Link--primary, 
      a.color-fg-default,
      .react-directory-truncate a,
      .wb-break-all a {
        color: ${onSurface} !important;
      }

      a.Link--secondary, 
      a.color-fg-muted {
        color: ${primary} !important;
      }

      /* Markdown & Code Blocks */
      .markdown-body {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      .markdown-body pre, 
      .markdown-body code {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }

      .markdown-body table tr {
        background-color: ${bg} !important;
        border-top-color: ${outline} !important;
      }

      .markdown-body table tr:nth-child(2n) {
        background-color: ${surfaceLow} !important;
      }

      .markdown-body table th, 
      .markdown-body table td {
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }
    `;
  }

  function buildRedditCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;

    return `
      /* --- Reddit Caelestia Dynamic Styling --- */
      body, shreddit-app, [color-scheme] {
        --color-neutral-background: ${bg} !important;
        --color-neutral-background-weak: ${surfaceLow} !important;
        --color-neutral-content: ${onSurface} !important;
        --color-neutral-content-weak: ${onSurfaceVar} !important;
        --color-primary-background: ${primary} !important;
        --color-tone-1: ${onSurface} !important;
        --color-tone-2: ${onSurfaceVar} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      reddit-header-large, header {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
        color: ${onSurface} !important;
      }

      shreddit-post, article {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      p, span, h1, h2, h3 {
        color: ${onSurface} !important;
      }
    `;
  }

  function buildWikipediaCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;

    return `
      /* --- Wikipedia Caelestia Dynamic Styling --- */
      body, .mw-body, #content {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      .mw-body a, #mw-content-text a {
        color: ${primary} !important;
      }

      p, h1, h2, h3, h4, li {
        color: ${onSurface} !important;
      }

      #mw-navigation, .vector-header, .vector-sticky-header {
        background-color: ${surfaceLow} !important;
        color: ${onSurfaceVar} !important;
        border-bottom: 1px solid ${outline} !important;
      }
    `;
  }

  function buildGoogleCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;
    const primContainer = t.primContainer;
    const onPrimContainer = t.onPrimContainer;

    return `
      /* --- Google Search Caelestia Dynamic Styling --- */
      html, body {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
        color-scheme: ${isDark ? 'dark' : 'light'} !important;
        accent-color: ${primary} !important;
      }

      #main, #rcnt, #center_col, #search, #rso, #taw, #bottomads,
      #hdtb, #gb, #appbar, #top_nav, #before-appbar, .srp {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      #gb, #hdtb {
        border-bottom: 1px solid ${outline} !important;
      }

      /* Search box: theme the inner pill, keep the form transparent. */
      #tsf, form[role="search"], #searchform {
        background-color: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }
      .RNNXgb, .sbibod, .aajZCb {
        background-color: ${surfaceMid} !important;
        border: 1px solid ${outline} !important;
        color: ${onSurface} !important;
        box-shadow: none !important;
      }
      textarea.gLFyf, input[name="q"], .gLFyf {
        background-color: transparent !important;
        color: ${onSurface} !important;
        caret-color: ${primary} !important;
      }

      /* Result titles, links, and visited links. */
      #rso h3, #rso h3 a, #rso a:link, #rso a:visited,
      #search a:link, #search a:visited,
      #gb a:link, #gb a:visited {
        color: ${primary} !important;
      }

      /* URLs, snippets, and secondary metadata. */
      #rso cite, #rso .VwiC3b, #rso .kb0PBd, #rso .aCOpRe,
      #rso .lEBKkf, #rso .MUxGbd, #rso .njrQkf {
        color: ${onSurfaceVar} !important;
      }

      /* Filter tabs. */
      #hdtb a, #hdtb span, #hdtb-more, #hdtb-tls {
        color: ${onSurfaceVar} !important;
      }
      #hdtb a[aria-current="page"], #hdtb a[aria-selected="true"],
      #hdtb .hdtb-mitem.hdtb-msel {
        color: ${primary} !important;
        border-color: ${primary} !important;
      }

      /* Primary buttons (including the Google account button). */
      .gb_A, a.gb_A, #gb a.gb_A,
      input[type="submit"], .Tg7LZd, .gNO89b {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-color: ${primary} !important;
      }
      #gb a.gb_A span, #gb a.gb_A * {
        background-color: transparent !important;
        color: ${onPrimary} !important;
      }

      /* Result cards, knowledge panels, AI panels, and dialogs. */
      #rso .MjjYud {
        border-bottom: 1px solid ${outline} !important;
      }
      #rso .ULSxyf, #rso .TBC9ub, #rso .kp-wholepage, #rso .liYKde,
      #rso .mnr-c, [role="dialog"], .c14XSe, .TBC9ub {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      /* Inputs and secondary interaction surfaces. */
      input, textarea, select {
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }
      a:hover, #rso h3 a:hover {
        color: ${t.secondary} !important;
      }
      ::selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }
      * {
        scrollbar-color: ${outline} ${surfaceLow} !important;
      }
    `;
  }

  function buildWhatsAppCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const surfaceHighest = t.surfaceHighest;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;
    const primContainer = t.primContainer;
    const onPrimContainer = t.onPrimContainer;
    const secondary = t.secondary;
    const green = t.green;
    const yellow = t.yellow;
    const error = t.error;
    const blue = t.blue;

    const rgb = hexToRgbCsv;
    const dimmer = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)';

    return `
      /* --- WhatsApp Web Caelestia Dynamic Styling --- */
      :root:root, html, body, #app, #app *, .app-wrapper, .landing-page {
        --WDS-surface-default: ${bg} !important;
        --WDS-surface-default-RGB: ${rgb(bg)} !important;
        --WDS-surface-elevated-default: ${surfaceMid} !important;
        --WDS-surface-elevated-default-RGB: ${rgb(surfaceMid)} !important;
        --WDS-surface-elevated-emphasized: ${surfaceHigh} !important;
        --WDS-surface-emphasized: ${surfaceHigh} !important;
        --WDS-surface-emphasized-RGB: ${rgb(surfaceHigh)} !important;
        --WDS-surface-highlight: ${surfaceHigh} !important;
        --WDS-surface-highlight-RGB: ${rgb(surfaceHigh)} !important;
        --WDS-surface-pressed: ${surfaceHighest} !important;
        --WDS-surface-inverse: ${onSurface} !important;

        --WDS-content-default: ${onSurface} !important;
        --WDS-content-default-RGB: ${rgb(onSurface)} !important;
        --WDS-content-deemphasized: ${onSurfaceVar} !important;
        --WDS-content-disabled: ${outline} !important;
        --WDS-content-inverse: ${bg} !important;
        --WDS-content-action-default: ${primary} !important;
        --WDS-content-action-emphasized: ${primary} !important;
        --WDS-content-external-link: ${primary} !important;
        --WDS-content-on-accent: ${onPrimary} !important;
        --WDS-content-on-accent-RGB: ${rgb(onPrimary)} !important;
        --WDS-content-read: ${blue} !important;

        --WDS-accent: ${primary} !important;
        --WDS-accent-RGB: ${rgb(primary)} !important;
        --WDS-accent-emphasized: ${primary} !important;
        --WDS-accent-deemphasized: ${primContainer} !important;

        --WDS-lines-divider: ${outline} !important;
        --WDS-lines-outline-default: ${outline} !important;
        --WDS-lines-outline-default-RGB: ${rgb(outline)} !important;
        --WDS-lines-outline-deemphasized: ${outline} !important;

        --WDS-background-wash-plain: ${bg} !important;
        --WDS-background-wash-plain-RGB: ${rgb(bg)} !important;
        --WDS-background-wash-inset: ${surfaceMid} !important;
        --WDS-background-wash-inset-RGB: ${rgb(surfaceMid)} !important;
        --WDS-background-elevated-wash-plain: ${surfaceMid} !important;
        --WDS-background-elevated-wash-inset: ${surfaceHigh} !important;
        --WDS-background-dimmer: ${dimmer} !important;
        --WDS-app-wash: ${bg} !important;
        --WDS-transient-background: ${bg} !important;

        --WDS-secondary-positive: ${green} !important;
        --WDS-secondary-positive-deemphasized: ${green} !important;
        --WDS-secondary-positive-RGB: ${rgb(green)} !important;
        --WDS-secondary-negative: ${error} !important;
        --WDS-secondary-negative-deemphasized: ${error} !important;
        --WDS-secondary-negative-emphasized: ${error} !important;
        --WDS-secondary-negative-RGB: ${rgb(error)} !important;
        --WDS-secondary-warning: ${yellow} !important;
        --WDS-secondary-warning-deemphasized: ${yellow} !important;

        --WDS-systems-bubble-surface-incoming: ${surfaceHigh} !important;
        --WDS-systems-bubble-surface-incoming-RGB: ${rgb(surfaceHigh)} !important;
        --WDS-systems-bubble-surface-outgoing: ${primContainer} !important;
        --WDS-systems-bubble-surface-outgoing-RGB: ${rgb(primContainer)} !important;
        --WDS-systems-bubble-surface-business: ${surfaceHigh} !important;
        --WDS-systems-bubble-surface-e2e: ${surfaceHigh} !important;
        --WDS-systems-bubble-surface-overlay: ${surfaceMid} !important;
        --WDS-systems-bubble-surface-overlay-RGB: ${rgb(surfaceMid)} !important;
        --WDS-systems-bubble-surface-system: ${surfaceMid} !important;
        --WDS-systems-bubble-content-business: ${onSurface} !important;
        --WDS-systems-bubble-content-deemphasized: ${onSurfaceVar} !important;
        --WDS-systems-bubble-content-e2e: ${onSurfaceVar} !important;

        --WDS-systems-chat-background-wallpaper: ${bg} !important;
        --WDS-systems-chat-background-wallpaper-RGB: ${rgb(bg)} !important;
        --WDS-systems-chat-foreground-wallpaper: ${onSurface} !important;
        --WDS-systems-chat-surface-composer: ${surfaceMid} !important;
        --WDS-systems-chat-surface-tray: ${surfaceLow} !important;
        --WDS-systems-status-seen: ${blue} !important;

        --WDS-components-active-list-row: ${primContainer} !important;
        --WDS-components-badge-muted: ${secondary} !important;
        --WDS-components-badge-muted-dot: ${secondary} !important;
        --WDS-components-filter-surface-selected: ${primContainer} !important;
        --WDS-components-outline-profile-photo: ${outline} !important;
        --WDS-components-platform-gesture-bar: ${outline} !important;
        --WDS-components-platform-status-bar: ${bg} !important;
        --WDS-components-surface-nav-bar: ${surfaceMid} !important;

        --WDS-persistent-activity-indicator: ${primary} !important;
        --WDS-persistent-always-branded: ${primary} !important;
        --WDS-persistent-always-branded-RGB: ${rgb(primary)} !important;

        --WDS-green-400: ${primary} !important;
        --WDS-green-500: ${primary} !important;
        --WDS-emerald-400: ${green} !important;
        --WDS-cool-gray-alpha-40: ${outline} !important;
        --WDS-black-alpha-10: rgba(0, 0, 0, 0.10) !important;
      }

      html, body, #app, .app-wrapper, .landing-page {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
        color-scheme: ${isDark ? 'dark' : 'light'} !important;
        accent-color: ${primary} !important;
      }

      .landing-page .btn,
      .landing-page button,
      .landing-page a.btn {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-color: ${primary} !important;
      }

      .landing-page .landing-title,
      .landing-page .landing-subtitle,
      .landing-page .text-tip,
      .landing-page .browser-title {
        color: ${onSurface} !important;
      }

      ::selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }
    `;
  }

  function buildUniversalCSS(colors, isDark) {
    const bg = getHex(colors.background) || getHex(colors.surface) || (isDark ? '#130d0b' : '#fff8f6');
    const surfaceLow = getHex(colors.surfaceContainerLow) || (isDark ? '#1a110f' : '#f8edea');
    const surfaceMid = getHex(colors.surfaceContainer) || getHex(colors.surface) || (isDark ? '#221715' : '#f4e7e4');
    const surfaceHigh = getHex(colors.surfaceContainerHigh) || (isDark ? '#291d1a' : '#efe0dc');
    const surfaceHighest = getHex(colors.surfaceContainerHighest) || getHex(colors.surfaceVariant) || (isDark ? '#302220' : '#e8dad6');

    const onSurface = getHex(colors.onSurface) || (isDark ? '#f9e0db' : '#1c1b1f');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#bca6a2' : '#49454e');
    const outline = getHex(colors.outlineVariant) || getHex(colors.outline) || (isDark ? '#554441' : '#c4c6d0');

    const primary = getHex(colors.primary) || (isDark ? '#f9b7a9' : '#8c4e44');
    const onPrimary = getHex(colors.onPrimary) || (isDark ? '#61342a' : '#ffffff');
    const primContainer = getHex(colors.primaryContainer) || (isDark ? '#76453b' : '#ffdad4');
    const onPrimContainer = getHex(colors.onPrimaryContainer) || (isDark ? '#ffdbd4' : '#3a0b06');

    const secondary = getHex(colors.secondary) || (isDark ? '#e7bdb4' : '#775651');
    const tertiary = getHex(colors.tertiary) || (isDark ? '#ffd9b0' : '#705b2e');

    return `
      /* --- Caelestia Universal Dynamic Theming (Extracted from Wallpaper) --- */
      :root, html, body {
        /* Standard CSS Variables: Tailwind, Radix, Shadcn UI */
        --background: ${bg} !important;
        --foreground: ${onSurface} !important;
        --card: ${surfaceMid} !important;
        --card-foreground: ${onSurface} !important;
        --popover: ${surfaceMid} !important;
        --popover-foreground: ${onSurface} !important;
        --primary: ${primary} !important;
        --primary-foreground: ${onPrimary} !important;
        --secondary: ${surfaceHigh} !important;
        --secondary-foreground: ${onSurface} !important;
        --muted: ${surfaceLow} !important;
        --muted-foreground: ${onSurfaceVar} !important;
        --accent: ${primContainer} !important;
        --accent-foreground: ${onPrimContainer} !important;
        --border: ${outline} !important;
        --input: ${outline} !important;
        --ring: ${primary} !important;

        /* Bootstrap & Modern Component Frameworks */
        --bs-primary: ${primary} !important;
        --bs-body-bg: ${bg} !important;
        --bs-body-color: ${onSurface} !important;
        --bs-secondary-color: ${onSurfaceVar} !important;
        --bs-border-color: ${outline} !important;
        --bs-card-bg: ${surfaceMid} !important;
        --bs-tertiary-bg: ${surfaceLow} !important;

        /* Browser Standard Accents */
        accent-color: ${primary} !important;
        caret-color: ${primary} !important;
      }

      /* Base Page Colors */
      html, body {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      /* Text Highlighting & Selection */
      ::selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }
      ::-moz-selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }

      /* Scrollbars */
      * {
        scrollbar-color: ${outline} ${surfaceLow} !important;
      }
      ::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
      }
      ::-webkit-scrollbar-track {
        background: ${surfaceLow} !important;
      }
      ::-webkit-scrollbar-thumb {
        background: ${outline} !important;
        border-radius: 4px !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${primary} !important;
      }

      /* Links & Interactive Accents */
      a {
        color: ${primary} !important;
      }
      a:hover {
        color: ${secondary} !important;
      }
      :focus-visible {
        outline: 2px solid ${primary} !important;
        outline-offset: 1px !important;
      }

      /* Surfaces: Navbars, Headers, Footers, Cards, Dialogs */
      header, nav, [role="navigation"], .navbar, .header, .site-header, .top-nav {
        background-color: ${surfaceMid} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }
      aside, [role="complementary"], .sidebar, .side-nav {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }
      footer, [role="contentinfo"], .footer, .site-footer {
        background-color: ${surfaceLow} !important;
        color: ${onSurfaceVar} !important;
        border-color: ${outline} !important;
      }
      .card, .panel, .box, dialog, .modal-content, [class*="card-"], [class*="card_"] {
        background-color: ${surfaceMid} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      /* Forms & Input Fields */
      input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]),
      textarea, select {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }
      input:focus, textarea:focus, select:focus {
        border-color: ${primary} !important;
        outline: 1px solid ${primary} !important;
      }

      /* Standard Buttons */
      button.btn-primary, button[type="submit"], input[type="submit"], .btn-primary {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-color: ${primary} !important;
      }

      /* Code & Preformatted Blocks */
      pre, code, kbd, samp {
        background-color: ${surfaceHighest} !important;
        color: ${tertiary} !important;
        border-color: ${outline} !important;
      }

      /* Dividers */
      hr {
        border-color: ${outline} !important;
      }
    `;
  }

  function applyCaelestiaTheme(theme) {
    if (!theme || !theme.colours) return;
    currentTheme = theme;

    const site = getCurrentSite();
    const siteId = site?.id;
    const colors = theme.colours;

    if (!isSiteThemeEnabled(site)) {
      removeInjectedStyle();
      return;
    }

    // Detect light vs dark mode from theme or system preference
    let isDark = true;
    if (theme.mode === 'light') {
      isDark = false;
    } else if (theme.mode === 'auto') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = theme.mode !== 'light';
    }

    // Synchronize site root attributes for sites supporting theme modes
    captureRootState();
    const modeStr = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-mode', modeStr);
    document.documentElement.setAttribute('data-dark-theme', modeStr);
    document.documentElement.setAttribute('data-light-theme', modeStr);
    document.documentElement.setAttribute('data-theme', modeStr);
    document.documentElement.setAttribute('data-bs-theme', modeStr);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    let css = '';
    if (siteId === 'youtube') {
      css = buildYouTubeCSS(colors, isDark);
    } else if (siteId === 'github') {
      css = buildGitHubCSS(colors, isDark);
    } else if (siteId === 'reddit') {
      css = buildRedditCSS(colors, isDark);
    } else if (siteId === 'wikipedia') {
      css = buildWikipediaCSS(colors, isDark);
    } else if (siteId === 'whatsapp') {
      css = buildWhatsAppCSS(colors, isDark);
    } else if (siteId === 'google') {
      css = buildGoogleCSS(colors, isDark);
    } else {
      css = buildUniversalCSS(colors, isDark);
    }

    if (!css) return;

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      const target = document.head || document.documentElement;
      target.appendChild(style);
    }
    style.textContent = css;
  }

  // 1. Load the theme snapshot and the current tab's per-tab override.
  try {
    chrome.storage.local.get(['caelestia_theme', 'caelestia_sites_enabled'], (result) => {
      sitesEnabled = result.caelestia_sites_enabled || {};
      if (result.caelestia_theme) {
        currentTheme = result.caelestia_theme;
      }
      themeReady = true;
      maybeApplyTheme();
    });
  } catch (e) {
    themeReady = true;
  }

  try {
    chrome.runtime.sendMessage({ action: 'getTabThemeState' }, (state) => {
      if (!chrome.runtime.lastError && state) {
        tabThemeOverride = state.hasOverride ? state.override : undefined;
      }
      tabStateReady = true;
      maybeApplyTheme();
    });
  } catch (e) {
    tabStateReady = true;
  }

  // 2. React to theme/site-setting changes and per-tab toggle messages.
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.caelestia_sites_enabled) {
        sitesEnabled = changes.caelestia_sites_enabled.newValue || {};
        maybeApplyTheme();
      }
      if (changes.caelestia_theme?.newValue) {
        currentTheme = changes.caelestia_theme.newValue;
        themeReady = true;
        maybeApplyTheme();
      }
    });
  } catch (e) {}

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'tabThemeChanged') {
        tabThemeOverride = msg.hasOverride ? msg.override : undefined;
        tabStateReady = true;
        maybeApplyTheme();
      }
    });
  } catch (e) {}
})();
