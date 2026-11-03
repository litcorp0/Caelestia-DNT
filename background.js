// Caelestia-DNT service worker
// Keeps the desktop theme snapshot in chrome.storage, brokers browser actions,
// manages per-tab theme overrides, and toggles native window fullscreen.

importScripts('sites.js');

const THEME_FILES = ['noctalia-theme.json', 'caelestia-theme.json'];
const THEME_SOURCE_KEY = 'caelestia_theme_source';
const THEME_ALARM = 'caelestia-theme-sync';
const TAB_OVERRIDES_KEY = 'tabThemeOverrides';
const SITES_ENABLED_KEY = 'caelestia_sites_enabled';
let lastThemeJson = '';

// --- Theme snapshot sync -------------------------------------------------

// Resolve the active theme source. Anything other than the desktop-dynamic
// source (preset / wallpaper-upload) is published by the options page, so the
// service worker must not overwrite it.
async function getThemeSource() {
  try {
    const data = await chrome.storage.local.get([THEME_SOURCE_KEY]);
    return data[THEME_SOURCE_KEY] || 'caelestia-dynamic';
  } catch (_) {
    return 'caelestia-dynamic';
  }
}

// Try the Noctalia snapshot first, then the bundled Caelestia snapshot.
async function fetchThemeSnapshot() {
  for (const file of THEME_FILES) {
    try {
      const url = chrome.runtime.getURL(file);
      const resp = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
      if (resp.ok) return await resp.json();
    } catch (_) {
      // Try the next candidate.
    }
  }
  return null;
}

async function syncThemeToStorage(force = false) {
  try {
    const source = await getThemeSource();
    if (source !== 'caelestia-dynamic') return;

    const theme = await fetchThemeSnapshot();
    if (!theme) return;

    const serialized = JSON.stringify(theme);
    if (!force && serialized === lastThemeJson) return;
    lastThemeJson = serialized;
    await chrome.storage.local.set({ caelestia_theme: theme });
  } catch (e) {
    console.debug('Theme storage sync error:', e);
  }
}

function ensureThemeAlarm() {
  if (!chrome.alarms) return;
  chrome.alarms.create(THEME_ALARM, { periodInMinutes: 1 });
}

// --- Per-tab overrides ---------------------------------------------------

function sessionStore() {
  return chrome.storage.session || chrome.storage.local;
}

async function getTabOverrides() {
  try {
    const data = await sessionStore().get([TAB_OVERRIDES_KEY]);
    return data[TAB_OVERRIDES_KEY] || {};
  } catch (_) {
    return {};
  }
}

async function setTabOverride(tabId, siteId, enabled) {
  const overrides = await getTabOverrides();
  const key = String(tabId);
  const tabOverrides = { ...(overrides[key] || {}) };

  if (enabled === undefined) {
    delete tabOverrides[siteId];
  } else {
    tabOverrides[siteId] = !!enabled;
  }

  if (Object.keys(tabOverrides).length > 0) {
    overrides[key] = tabOverrides;
  } else {
    delete overrides[key];
  }

  await sessionStore().set({ [TAB_OVERRIDES_KEY]: overrides });
  return overrides;
}

async function clearTabOverrides(tabId) {
  try {
    const overrides = await getTabOverrides();
    if (!overrides[String(tabId)]) return;
    delete overrides[String(tabId)];
    await sessionStore().set({ [TAB_OVERRIDES_KEY]: overrides });
  } catch (_) {}
}

async function getSiteSetting(siteId) {
  try {
    const data = await chrome.storage.local.get([SITES_ENABLED_KEY]);
    const enabled = data[SITES_ENABLED_KEY] || {};
    return enabled[siteId] !== false;
  } catch (_) {
    return true;
  }
}

async function getTabState(tab) {
  const empty = {
    supported: false,
    siteId: null,
    siteLabel: '',
    globalEnabled: true,
    hasOverride: false,
    override: null,
    effective: false
  };
  if (!tab?.url) return empty;

  let site = null;
  try {
    site = CaelestiaSites.getByHostname(new URL(tab.url).hostname);
  } catch (_) {}
  if (!site) return empty;

  const [globalEnabled, overrides] = await Promise.all([
    getSiteSetting(site.id),
    getTabOverrides()
  ]);
  const tabOverrides = overrides[String(tab.id)] || {};
  const hasOverride = Object.prototype.hasOwnProperty.call(tabOverrides, site.id);
  const override = hasOverride ? tabOverrides[site.id] : null;
  const effective = hasOverride ? override : globalEnabled;

  return {
    supported: true,
    siteId: site.id,
    siteLabel: site.label,
    globalEnabled,
    hasOverride,
    override,
    effective
  };
}

function sendTabThemeChanged(tabId, state) {
  try {
    chrome.tabs.sendMessage(
      tabId,
      {
        action: 'tabThemeChanged',
        hasOverride: state.hasOverride,
        override: state.override
      },
      () => void chrome.runtime.lastError
    );
  } catch (_) {}
}

async function updateBadge(tabId) {
  if (!chrome.action || tabId === undefined || tabId === null) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    const state = await getTabState(tab);

    if (!state.supported) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await chrome.action.setTitle({ tabId, title: 'Caelestia-DNT' });
      return;
    }

    await chrome.action.setBadgeText({ tabId, text: state.effective ? 'ON' : 'OFF' });
    await chrome.action.setBadgeBackgroundColor({
      tabId,
      color: state.effective ? '#2e7d32' : '#757575'
    });
    await chrome.action.setTitle({
      tabId,
      title: `Caelestia-DNT — ${state.siteLabel}: ${state.effective ? 'Themed' : 'Default'}`
    });
  } catch (_) {}
}

async function updateAllBadges() {
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.all(tabs.map((tab) => updateBadge(tab.id)));
  } catch (_) {}
}

// --- Startup and browser events -----------------------------------------

// Initial sync, periodic refresh, and first-run onboarding.
syncThemeToStorage();
ensureThemeAlarm();
updateAllBadges();

chrome.runtime.onInstalled.addListener((details) => {
  syncThemeToStorage(true);
  ensureThemeAlarm();
  // Tab IDs are not stable across installs/updates; start clean.
  sessionStore().set({ [TAB_OVERRIDES_KEY]: {} }).catch(() => {});
  updateAllBadges();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'newtab.html#onboarding' });
  }
});

chrome.runtime.onStartup.addListener(() => {
  syncThemeToStorage(true);
  ensureThemeAlarm();
  updateAllBadges();
});

if (chrome.alarms?.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === THEME_ALARM) syncThemeToStorage(true);
  });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabOverrides(tabId);
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateBadge(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateBadge(tabId);
  }
});

if (chrome.windows?.onFocusChanged) {
  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]) updateBadge(tabs[0].id);
    });
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[SITES_ENABLED_KEY]) {
    updateAllBadges();
  }
});

// --- Message handling ----------------------------------------------------

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getTabThemeState') {
    (async () => {
      try {
        const tab = sender.tab
          || (msg.tabId !== undefined ? await chrome.tabs.get(msg.tabId) : null);
        sendResponse(tab ? await getTabState(tab) : { supported: false });
      } catch (err) {
        sendResponse({ supported: false, error: String(err) });
      }
    })();
    return true;
  }

  if (msg.action === 'toggleTabTheme' && msg.tabId !== undefined && msg.siteId) {
    (async () => {
      try {
        await setTabOverride(msg.tabId, msg.siteId, !!msg.enabled);
        const tab = await chrome.tabs.get(msg.tabId);
        const state = await getTabState(tab);
        sendTabThemeChanged(msg.tabId, state);
        await updateBadge(msg.tabId);
        sendResponse(state);
      } catch (err) {
        sendResponse({ supported: false, error: String(err) });
      }
    })();
    return true;
  }

  if (msg.action === 'resetTabTheme' && msg.tabId !== undefined && msg.siteId) {
    (async () => {
      try {
        await setTabOverride(msg.tabId, msg.siteId, undefined);
        const tab = await chrome.tabs.get(msg.tabId);
        const state = await getTabState(tab);
        sendTabThemeChanged(msg.tabId, state);
        await updateBadge(msg.tabId);
        sendResponse(state);
      } catch (err) {
        sendResponse({ supported: false, error: String(err) });
      }
    })();
    return true;
  }

  if (msg.action === 'refreshTheme') {
    syncThemeToStorage(true)
      .then(() => sendResponse({ status: 'ok' }))
      .catch((err) => sendResponse({ status: 'error', message: String(err) }));
    return true;
  }

  if (msg.action === 'setFullscreen') {
    const targetWinId = sender.tab?.windowId;
    const targetState = msg.fullscreen ? 'fullscreen' : 'normal';

    if (targetWinId) {
      chrome.windows.update(targetWinId, { state: targetState }, (win) => {
        sendResponse({ status: 'ok', state: win?.state || targetState });
      });
    } else {
      chrome.windows.getCurrent((win) => {
        if (win) {
          chrome.windows.update(win.id, { state: targetState }, (updatedWin) => {
            sendResponse({ status: 'ok', state: updatedWin?.state || targetState });
          });
        } else {
          sendResponse({ status: 'error', message: 'No window found' });
        }
      });
    }
    return true; // Keep asynchronous response channel open
  }

  if (msg.action === 'openSettings') {
    chrome.tabs.create({ url: 'chrome://settings' }, () => {
      sendResponse({ status: 'settings_opened' });
    });
    return true;
  }

  if (msg.action === 'openUrl' && msg.url) {
    chrome.tabs.create({ url: msg.url }, () => {
      sendResponse({ status: 'url_opened' });
    });
    return true;
  }
});
