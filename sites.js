// Shared site registry used by the service worker, content script, and popup.
// Keep this list in sync with manifest.json content_scripts.matches.
(function (global) {
  'use strict';

  const SITES = [
    {
      id: 'youtube',
      label: 'YouTube',
      matches(hostname) {
        return hostname === 'youtube.com' || hostname.endsWith('.youtube.com');
      }
    },
    {
      id: 'github',
      label: 'GitHub',
      matches(hostname) {
        return hostname === 'github.com' || hostname.endsWith('.github.com');
      }
    },
    {
      id: 'reddit',
      label: 'Reddit',
      matches(hostname) {
        return hostname === 'reddit.com' || hostname.endsWith('.reddit.com');
      }
    },
    {
      id: 'wikipedia',
      label: 'Wikipedia',
      matches(hostname) {
        return hostname === 'wikipedia.org' || hostname.endsWith('.wikipedia.org');
      }
    },
    {
      id: 'google',
      label: 'Google Search',
      matches(hostname) {
        return hostname === 'google.com'
          || hostname.startsWith('www.google.')
          || /^www\.google\.[a-z]{2,}(\.[a-z]{2,})?$/.test(hostname);
      }
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Web',
      matches(hostname) {
        return hostname === 'web.whatsapp.com';
      }
    }
  ];

  function getByHostname(hostname) {
    if (!hostname) return null;
    const host = hostname.toLowerCase();
    return SITES.find((site) => site.matches(host)) || null;
  }

  function getById(id) {
    return SITES.find((site) => site.id === id) || null;
  }

  global.CaelestiaSites = { SITES, getByHostname, getById };
})(typeof globalThis !== 'undefined' ? globalThis : this);
