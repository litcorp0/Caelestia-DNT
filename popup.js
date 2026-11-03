// Toolbar popup: per-tab theme toggle and status.
(() => {
  'use strict';

  const siteLabel = document.getElementById('siteLabel');
  const statusPill = document.getElementById('statusPill');
  const supportedView = document.getElementById('supportedView');
  const unsupportedView = document.getElementById('unsupportedView');
  const tabToggle = document.getElementById('tabToggle');
  const modeHint = document.getElementById('modeHint');
  const btnReset = document.getElementById('btnReset');
  const btnOptions = document.getElementById('btnOptions');

  let activeTabId = null;
  let currentState = null;

  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  function applyTheme() {
    chrome.storage.local.get(['caelestia_theme'], (result) => {
      const theme = result?.caelestia_theme;
      if (!theme) return;
      document.documentElement.setAttribute('data-theme', theme.mode || 'dark');
      const colours = theme.colours || {};
      for (const [key, value] of Object.entries(colours)) {
        if (typeof value !== 'string') continue;
        document.documentElement.style.setProperty(`--md-sys-color-${camelToKebab(key)}`, value);
      }
    });
  }

  function render(state) {
    currentState = state;

    if (!state?.supported) {
      supportedView.hidden = true;
      unsupportedView.hidden = false;
      siteLabel.textContent = 'Unsupported site';
      statusPill.textContent = '—';
      statusPill.className = 'status-pill';
      return;
    }

    supportedView.hidden = false;
    unsupportedView.hidden = true;
    siteLabel.textContent = state.siteLabel;
    tabToggle.checked = !!state.effective;
    statusPill.textContent = state.effective ? 'Themed' : 'Default';
    statusPill.className = `status-pill ${state.effective ? 'themed' : 'default'}`;

    if (state.hasOverride) {
      modeHint.textContent = 'Overridden for this tab.';
      btnReset.hidden = false;
    } else {
      modeHint.textContent = `Following the site setting (${state.globalEnabled ? 'themed' : 'default'}).`;
      btnReset.hidden = true;
    }
  }

  function requestState() {
    if (activeTabId === null) {
      render({ supported: false });
      return;
    }
    chrome.runtime.sendMessage({ action: 'getTabThemeState', tabId: activeTabId }, (state) => {
      if (chrome.runtime.lastError || !state) {
        render({ supported: false });
        return;
      }
      render(state);
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) {
      render({ supported: false });
      return;
    }
    activeTabId = tab.id;
    requestState();
  });

  tabToggle.addEventListener('change', () => {
    if (!currentState?.supported || activeTabId === null) return;
    const enabled = tabToggle.checked;
    tabToggle.disabled = true;
    chrome.runtime.sendMessage(
      {
        action: 'toggleTabTheme',
        tabId: activeTabId,
        siteId: currentState.siteId,
        enabled
      },
      (state) => {
        tabToggle.disabled = false;
        if (chrome.runtime.lastError || !state) {
          render({ supported: false });
          return;
        }
        render(state);
      }
    );
  });

  btnReset.addEventListener('click', () => {
    if (!currentState?.supported || activeTabId === null) return;
    chrome.runtime.sendMessage(
      {
        action: 'resetTabTheme',
        tabId: activeTabId,
        siteId: currentState.siteId
      },
      (state) => {
        if (chrome.runtime.lastError || !state) return;
        render(state);
      }
    );
  });

  btnOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.caelestia_theme) applyTheme();
    if (changes.caelestia_sites_enabled) requestState();
  });

  applyTheme();
})();
