// Options & Preferences Logic for Caelestia-DNT

(() => {
  'use strict';

  // --- 1. Dynamic Theme Loading & Engine ---
  const engine = window.CaelestiaThemeEngine;

  async function loadTheme() {
    const themeSource = localStorage.getItem('caelestia_theme_source') || 'caelestia-dynamic';

    if (themeSource === 'preset') {
      const presetKey = localStorage.getItem('caelestia_theme_preset') || 'caelestia-violet';
      const preset = engine?.PRESETS?.[presetKey];
      if (preset) {
        document.documentElement.setAttribute('data-theme', preset.mode || 'dark');
        document.documentElement.setAttribute('data-transparency', 'true');
        engine.applyPaletteToRoot(preset.colours);
      }
      return;
    }

    if (themeSource === 'wallpaper-upload') {
      const savedPaletteStr = localStorage.getItem('caelestia_custom_palette');
      if (savedPaletteStr) {
        try {
          const palette = JSON.parse(savedPaletteStr);
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.setAttribute('data-transparency', 'true');
          engine.applyPaletteToRoot(palette);
          return;
        } catch (e) {
          console.debug('Failed to parse custom palette:', e);
        }
      }
    }

    // Default: desktop dynamic from the generated Noctalia snapshot or the
    // legacy Caelestia scheme file.
    let theme = null;
    try {
      const bridgeResp = await fetch('http://127.0.0.1:39123/theme', { signal: AbortSignal.timeout(600) });
      if (bridgeResp.ok) theme = await bridgeResp.json();
    } catch (_) {}

    if (!theme) {
      for (const file of ['noctalia-theme.json', 'caelestia-theme.json']) {
        try {
          const resp = await fetch(`./${file}?t=${Date.now()}`, { cache: 'no-store' });
          if (resp.ok) {
            theme = await resp.json();
            break;
          }
        } catch (_) {}
      }
    }

    try {
      if (!theme) return;
      const root = document.documentElement;

      const mode = theme.mode || 'dark';
      root.setAttribute('data-theme', mode);
      root.setAttribute('data-transparency', theme.transparency === false ? 'false' : 'true');

      if (theme.colours) {
        for (const [key, rawVal] of Object.entries(theme.colours)) {
          if (typeof rawVal !== 'string') continue;
          const hex = rawVal.startsWith('#') ? rawVal : `#${rawVal}`;
          root.style.setProperty(`--md-sys-color-${camelToKebab(key)}`, hex);
        }
      }
    } catch (e) {
      console.debug('Theme load error:', e);
    }
  }

  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  loadTheme();

  // --- 2. Element References ---
  const displayNameInput = document.getElementById('displayNameInput');
  const btnSaveName = document.getElementById('btnSaveName');
  const greetingPreview = document.getElementById('greetingPreview');
  const radioZen = document.getElementById('radioZen');
  const radioDashboard = document.getElementById('radioDashboard');
  const toggleHints = document.getElementById('toggleHints');
  const btnRestartTour = document.getElementById('btnRestartTour');
  const saveToast = document.getElementById('saveToast');

  let toastTimer = null;
  function showToast(msg = 'Settings saved successfully!') {
    if (!saveToast) return;
    saveToast.textContent = msg;
    saveToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      saveToast.classList.remove('show');
    }, 2400);
  }

  // --- 3. Profile & Display Name ---
  function updatePreview(name) {
    const clean = (name || '').trim() || 'FrontendGeek';
    if (greetingPreview) {
      greetingPreview.textContent = `Good Day, ${clean}`;
    }
  }

  const savedName = localStorage.getItem('caelestia_username') || 'FrontendGeek';
  if (displayNameInput) {
    displayNameInput.value = savedName;
    updatePreview(savedName);

    displayNameInput.addEventListener('input', () => {
      updatePreview(displayNameInput.value);
    });

    displayNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveDisplayName();
      }
    });
  }

  function saveDisplayName() {
    const clean = (displayNameInput?.value || '').trim() || 'FrontendGeek';
    localStorage.setItem('caelestia_username', clean);
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ caelestia_username: clean });
    }
    updatePreview(clean);
    showToast('Display name saved!');
  }

  if (btnSaveName) {
    btnSaveName.addEventListener('click', saveDisplayName);
  }

  // --- 4. Theming & Wallpaper Controller ---
  const wallpaperUploadBox = document.getElementById('wallpaperUploadBox');
  const presetsSection = document.getElementById('presetsSection');
  const wallpaperFileInput = document.getElementById('wallpaperFileInput');
  const wallpaperDropZone = document.getElementById('wallpaperDropZone');
  const wallpaperPreviewBar = document.getElementById('wallpaperPreviewBar');
  const wallpaperThumb = document.getElementById('wallpaperThumb');
  const wallpaperFilename = document.getElementById('wallpaperFilename');
  const extractedSwatches = document.getElementById('extractedSwatches');
  const btnResetWallpaper = document.getElementById('btnResetWallpaper');
  const presetBtns = document.querySelectorAll('.preset-btn');

  function updateThemeSourceUI(source) {
    if (wallpaperUploadBox) {
      wallpaperUploadBox.style.display = source === 'wallpaper-upload' ? 'flex' : 'none';
    }
    if (presetsSection) {
      presetsSection.style.display = source === 'preset' ? 'flex' : 'none';
    }
  }

  // Restore saved theme source radio
  const savedThemeSource = localStorage.getItem('caelestia_theme_source') || 'caelestia-dynamic';
  const currentSourceRadio = document.querySelector(`input[name="themeSource"][value="${savedThemeSource}"]`);
  if (currentSourceRadio) currentSourceRadio.checked = true;
  updateThemeSourceUI(savedThemeSource);

  // --- 4b. Per-site theming toggles ---
  const siteToggleGoogle = document.getElementById('siteToggleGoogle');
  const siteToggleWhatsApp = document.getElementById('siteToggleWhatsApp');

  function readSiteToggles() {
    return {
      google: siteToggleGoogle ? siteToggleGoogle.checked : true,
      whatsapp: siteToggleWhatsApp ? siteToggleWhatsApp.checked : true
    };
  }

  function saveSiteToggles(message) {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ caelestia_sites_enabled: readSiteToggles() }, () => void chrome.runtime.lastError);
    }
    if (message) showToast(message);
  }

  if (chrome?.storage?.local) {
    chrome.storage.local.get(['caelestia_sites_enabled'], (result) => {
      const enabled = result.caelestia_sites_enabled || {};
      if (siteToggleGoogle) siteToggleGoogle.checked = enabled.google !== false;
      if (siteToggleWhatsApp) siteToggleWhatsApp.checked = enabled.whatsapp !== false;
    });
  }

  siteToggleGoogle?.addEventListener('change', () => {
    saveSiteToggles(siteToggleGoogle.checked ? 'Google Search theming enabled' : 'Google Search theming disabled');
  });
  siteToggleWhatsApp?.addEventListener('change', () => {
    saveSiteToggles(siteToggleWhatsApp.checked ? 'WhatsApp Web theming enabled' : 'WhatsApp Web theming disabled');
  });

  // Restore saved preset active state
  const savedPreset = localStorage.getItem('caelestia_theme_preset') || 'caelestia-violet';
  presetBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-preset') === savedPreset);
  });

  // Switch theme source
  document.querySelectorAll('input[name="themeSource"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const newSource = radio.value;
      localStorage.setItem('caelestia_theme_source', newSource);
      if (chrome?.storage?.local) {
        const payload = { caelestia_theme_source: newSource };

        if (newSource === 'preset') {
          const presetKey = localStorage.getItem('caelestia_theme_preset') || 'caelestia-violet';
          const preset = engine?.PRESETS?.[presetKey];
          if (preset) {
            payload.caelestia_theme = {
              name: preset.name,
              desktop: 'preset',
              mode: preset.mode || 'dark',
              transparency: true,
              colours: preset.colours
            };
          }
        }

        chrome.storage.local.set(payload, () => {
          if (newSource === 'caelestia-dynamic' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({ action: 'refreshTheme' }, () => void chrome.runtime.lastError);
          }
        });
      }
      updateThemeSourceUI(newSource);
      loadTheme();

      let msg = 'Switched to desktop dynamic sync';
      if (newSource === 'wallpaper-upload') msg = 'Wallpaper Color Extractor active';
      if (newSource === 'preset') msg = 'Designer Presets active';
      showToast(msg);
    });
  });

  // Handle Preset selection
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      localStorage.setItem('caelestia_theme_source', 'preset');
      localStorage.setItem('caelestia_theme_preset', presetKey);
      const preset = engine?.PRESETS?.[presetKey];
      if (chrome?.storage?.local) {
        const payload = {
          caelestia_theme_source: 'preset',
          caelestia_theme_preset: presetKey
        };
        if (preset) {
          payload.caelestia_theme = {
            name: preset.name,
            desktop: 'preset',
            mode: preset.mode || 'dark',
            transparency: true,
            colours: preset.colours
          };
        }
        chrome.storage.local.set(payload);
      }

      const presetRadio = document.getElementById('themeSourcePreset');
      if (presetRadio) presetRadio.checked = true;
      updateThemeSourceUI('preset');

      if (preset) {
        document.documentElement.setAttribute('data-theme', preset.mode || 'dark');
        engine.applyPaletteToRoot(preset.colours);
        showToast(`Theme set to ${preset.name}`);
      }
    });
  });

  // Render extracted swatches in preview bar
  function renderSwatches(palette) {
    if (!extractedSwatches || !palette) return;
    extractedSwatches.innerHTML = '';
    const sampleKeys = ['primary', 'secondary', 'tertiary', 'surfaceVariant', 'outline'];
    sampleKeys.forEach((k) => {
      if (palette[k]) {
        const dot = document.createElement('div');
        dot.className = 'color-swatch';
        dot.style.backgroundColor = palette[k];
        dot.title = `${k}: ${palette[k]}`;
        extractedSwatches.appendChild(dot);
      }
    });
  }

  // Restore wallpaper preview if saved
  const savedWallpaperData = localStorage.getItem('caelestia_custom_wallpaper_data');
  if (savedWallpaperData && wallpaperThumb && wallpaperPreviewBar) {
    wallpaperThumb.src = savedWallpaperData;
    wallpaperPreviewBar.style.display = 'flex';
    const savedPaletteStr = localStorage.getItem('caelestia_custom_palette');
    if (savedPaletteStr) {
      try {
        renderSwatches(JSON.parse(savedPaletteStr));
      } catch (e) {}
    }
  }

  // Downscale the uploaded wallpaper before storing it. Keeping a full-size
  // data URL in localStorage/chrome.storage easily blows past the quota.
  function makeWallpaperPreview(img, maxDimension = 1600) {
    const naturalWidth = img.naturalWidth || img.width || maxDimension;
    const naturalHeight = img.naturalHeight || img.height || maxDimension;
    const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // Process selected wallpaper image
  function processWallpaperFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const sourceDataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        // Extract palette
        const palette = engine.extractPaletteFromImage(img);
        let previewDataUrl = sourceDataUrl;
        try {
          previewDataUrl = makeWallpaperPreview(img);
        } catch (err) {
          console.warn('Could not build wallpaper preview, using source image:', err);
        }

        // Save palette & thumbnail
        localStorage.setItem('caelestia_theme_source', 'wallpaper-upload');
        localStorage.setItem('caelestia_theme_mode', 'dark');
        localStorage.setItem('caelestia_custom_palette', JSON.stringify(palette));
        try {
          localStorage.setItem('caelestia_custom_wallpaper_data', previewDataUrl);
          localStorage.setItem('caelestia_custom_wallpaper_name', file.name);
        } catch (storageErr) {
          console.warn('Image too large for local storage, palette saved:', storageErr);
        }

        if (chrome?.storage?.local) {
          chrome.storage.local.set({
            caelestia_theme: {
              name: 'wallpaper-extracted',
              desktop: 'wallpaper-upload',
              mode: 'dark',
              transparency: true,
              colours: palette,
              _dominantHex: palette._dominantHex
            },
            caelestia_theme_source: 'wallpaper-upload',
            caelestia_custom_palette: palette,
            caelestia_custom_wallpaper_data: previewDataUrl,
            caelestia_custom_wallpaper_name: file.name
          }, () => void chrome.runtime.lastError);
        }

        // Apply immediately
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-transparency', 'true');
        engine.applyPaletteToRoot(palette);

        // Update preview UI
        if (wallpaperThumb) wallpaperThumb.src = previewDataUrl;
        if (wallpaperFilename) wallpaperFilename.textContent = file.name;
        if (wallpaperPreviewBar) wallpaperPreviewBar.style.display = 'flex';
        renderSwatches(palette);

        const wpRadio = document.getElementById('themeSourceWallpaper');
        if (wpRadio) wpRadio.checked = true;
        updateThemeSourceUI('wallpaper-upload');

        showToast('Wallpaper colors extracted & applied!');
      };
      img.src = sourceDataUrl;
    };
    reader.readAsDataURL(file);
  }

  // File input change
  if (wallpaperFileInput) {
    wallpaperFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) processWallpaperFile(file);
    });
  }

  // Drag and drop onto dropzone
  if (wallpaperDropZone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      wallpaperDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        wallpaperDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      wallpaperDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        wallpaperDropZone.classList.remove('dragover');
      });
    });

    wallpaperDropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) processWallpaperFile(file);
    });
  }

  // Reset custom wallpaper / preset and return to the desktop-dynamic source.
  if (btnResetWallpaper) {
    btnResetWallpaper.addEventListener('click', () => {
      [
        'caelestia_custom_palette',
        'caelestia_custom_wallpaper_data',
        'caelestia_custom_wallpaper_name',
        'caelestia_theme_preset',
        'caelestia_theme_mode'
      ].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem('caelestia_theme_source', 'caelestia-dynamic');

      if (wallpaperPreviewBar) wallpaperPreviewBar.style.display = 'none';
      if (extractedSwatches) extractedSwatches.innerHTML = '';
      if (wallpaperFileInput) wallpaperFileInput.value = '';

      const dynamicRadio = document.getElementById('themeSourceDynamic');
      if (dynamicRadio) dynamicRadio.checked = true;
      updateThemeSourceUI('caelestia-dynamic');

      if (chrome?.storage?.local) {
        chrome.storage.local.set({ caelestia_theme_source: 'caelestia-dynamic' }, () => {
          chrome.storage.local.remove([
            'caelestia_theme',
            'caelestia_custom_palette',
            'caelestia_custom_wallpaper_data',
            'caelestia_custom_wallpaper_name',
            'caelestia_theme_preset'
          ], () => {
            if (chrome.runtime?.sendMessage) {
              chrome.runtime.sendMessage({ action: 'refreshTheme' }, () => void chrome.runtime.lastError);
            }
          });
        });
      }

      loadTheme();
      showToast('Reset to desktop dynamic theme');
    });
  }

  // --- 5. Startup & View Mode ---
  const isZenDefault = localStorage.getItem('caelestia_zen') !== 'false';
  if (radioZen && radioDashboard) {
    if (isZenDefault) {
      radioZen.checked = true;
    } else {
      radioDashboard.checked = true;
    }

    document.querySelectorAll('input[name="defaultView"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const isZen = radioZen.checked;
        localStorage.setItem('caelestia_zen', String(isZen));
        showToast(isZen ? 'Default startup set to Zen Mode' : 'Default startup set to Full Dashboard');
      });
    });
  }

  // --- 6. Navigation Hints Bar ---
  const showHints = localStorage.getItem('caelestia_show_hints') !== 'false';
  if (toggleHints) {
    toggleHints.checked = showHints;
    toggleHints.addEventListener('change', () => {
      localStorage.setItem('caelestia_show_hints', String(toggleHints.checked));
      showToast(toggleHints.checked ? 'Hints bar enabled' : 'Hints bar hidden');
    });
  }

  // --- 7. Search Engine ---
  const currentEngine = localStorage.getItem('caelestia_engine') || 'google';
  const engineRadio = document.querySelector(`input[name="searchEngine"][value="${currentEngine}"]`);
  if (engineRadio) engineRadio.checked = true;

  document.querySelectorAll('input[name="searchEngine"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      localStorage.setItem('caelestia_engine', radio.value);
      showToast(`Default search set to ${radio.value.toUpperCase()}`);
    });
  });

  // --- 8. Replay Onboarding Tour ---
  if (btnRestartTour) {
    btnRestartTour.addEventListener('click', () => {
      localStorage.removeItem('caelestia_onboarded');
      window.location.href = 'newtab.html#onboarding';
    });
  }
})();

