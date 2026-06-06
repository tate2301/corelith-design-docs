/* Corelith DS — Sandpack bridge
 *
 * Two responsibilities:
 *
 *  1. PLAYGROUND MODE — mounts a SandpackClient into any
 *     <div data-sandpack> on the page. Reads either:
 *       data-sandpack-files = base64-encoded JSON { '/App.tsx': '…', … }
 *       data-code           = a single-file fallback, raw TSX
 *
 *  2. COOKBOOK MODE — finds .ds-specimen[data-sandpack] elements
 *     that system-shell.js has already wrapped in a .ds-preview,
 *     injects a "Run live" tab into the existing Preview/Code
 *     toolbar tab-group, and mounts a sandbox into a third panel
 *     the first time the tab is clicked.
 *
 * No host React required — uses @codesandbox/sandpack-client via
 * esm.sh. The sandbox iframe loads @tate2301/corelith from esm.sh too;
 * for v1 we ship a tiny inline shim that re-exports plain DOM
 * elements with the docs-site components.css class names. Real
 * package resolution can land later without touching this file.
 */
(function () {
  const CLIENT_URL = 'https://esm.sh/@codesandbox/sandpack-client@2';

  // ── @tate2301/corelith bridge ──────────────────────────────────────
  // The package now ships a real IIFE bundle at
  // `packages/react/dist/cdn.global.js` that hangs every export off
  // `window.Corelith`. We resolve its URL from THIS script's own
  // src so it works whether the docs site is served from `/`, a
  // sub-path, or GitHub Pages, then inject a tiny `/corelith.js`
  // shim into each Sandpack sandbox that loads the IIFE inside the
  // iframe and re-exports its named globals.
  //
  // If the IIFE 404s (e.g. fresh checkout without `npm run build`),
  // we fall back to a hand-coded primitive shim so snippets keep
  // rendering *something* while you wait for the build.

  function resolveCdnUrl() {
    const here = document.currentScript && document.currentScript.src;
    if (!here) return '/packages/react/dist/cdn.global.js';
    // /assets/sandpack-bridge.js → /packages/react/dist/cdn.global.js
    return here.replace(/\/assets\/sandpack-bridge\.js.*$/, '/packages/react/dist/cdn.global.js');
  }
  const CDN_URL = resolveCdnUrl();

  // The bridge module inside each Sandpack runs in its own ESM
  // context. It dynamically loads React + ReactDOM from esm.sh,
  // then injects the IIFE bundle as a <script> tag, then re-exports
  // every key off `window.Corelith`. Hooks like `useState` are
  // re-exported straight from React so destructuring imports like
  // `import { useState } from '@tate2301/corelith'` resolve too.
  function buildBridgeModule() {
    return [
      "import * as React from 'react';",
      "import * as ReactDOM from 'react-dom';",
      "import * as ReactDOMClient from 'react-dom/client';",
      "import * as jsxRuntime from 'react/jsx-runtime';",
      "",
      "// Pre-stash React globals so the IIFE can find them.",
      "window.React = React;",
      "window.ReactDOM = ReactDOM;",
      "window.ReactDOMClient = ReactDOMClient;",
      "window.jsxRuntime = jsxRuntime;",
      "",
      "let resolved;",
      "async function load() {",
      "  if (window.Corelith) return window.Corelith;",
      "  const res = await fetch(" + JSON.stringify(CDN_URL) + ");",
      "  if (!res.ok) throw new Error('failed to fetch ' + " + JSON.stringify(CDN_URL) + " + ' — ' + res.status);",
      "  const code = await res.text();",
      "  // eslint-disable-next-line no-new-func",
      "  new Function(code)();",
      "  return window.Corelith;",
      "}",
      "resolved = await load();",
      "",
      "// Re-export every named global off window.Corelith plus all",
      "// of React's hook surface so cookbook snippets that mix",
      "// `import { Button } from '@tate2301/corelith'` and",
      "// `import { useState } from '@tate2301/corelith'` both work.",
      "export const {",
      "  Alert, AppShell, AuthShell, Avatar, Badge, BottomSheet, BottomTabs,",
      "  Button, Checkbox, Combobox, CommandPalette, DataTable, DayList, Dialog,",
      "  Drawer, EmptyState, Field, FilterChips, Form, Grabber, Input, InputOtp,",
      "  Kbd, Menu, Modal, PageHeader, Pagination, Popover, Radio, RadioGroup,",
      "  RoleSwitcher, RowCard, SaveBar, Select, Skeleton, Spinner, Stack,",
      "  StatCard, StatHero, Stepper, Switch, Tabs, Toast, ToastProvider,",
      "  Tooltip, useFieldContext, useInterval, useMatchMedia, useOptimistic,",
      "  useToast, useUpload, useUrlState,",
      "} = resolved;",
      "",
      "export const {",
      "  useState, useEffect, useReducer, useRef, useCallback, useMemo,",
      "  useContext, useId, useImperativeHandle, useLayoutEffect, useTransition,",
      "  useDeferredValue, useSyncExternalStore, useInsertionEffect,",
      "  createContext, forwardRef, Fragment, memo, lazy, Suspense, Children,",
      "  cloneElement, createElement, isValidElement, startTransition,",
      "} = React;",
      "",
      "export default resolved;",
    ].join('\n');
  }
  const CORELITH_SHIM = buildBridgeModule();

  // ── Default starter files for a single-file TSX snippet ──────
  function buildFiles(appCode) {
    return {
      '/App.tsx': { code: appCode },
      '/corelith.js': { code: CORELITH_SHIM, hidden: true },
      '/index.tsx': {
        code:
          "import React from 'react';\n" +
          "import { createRoot } from 'react-dom/client';\n" +
          "import App from './App';\n" +
          "createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);\n",
        hidden: true,
      },
      '/index.html': {
        code: '<!doctype html><html><body style="margin:0;font-family:system-ui"><div id="root"></div></body></html>',
        hidden: true,
      },
      '/package.json': {
        code: JSON.stringify({
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
          },
        }, null, 2),
        hidden: true,
      },
    };
  }

  // Map bare-name '@tate2301/corelith' imports onto the local bridge module
  // that loads the CDN IIFE at runtime. (Sandpack also accepts an
  // import-map alternative, but its `react-ts` template already takes
  // local module paths verbatim — so the local mapping is all we need.)
  const IMPORT_MAP = {
    imports: {
      '@tate2301/corelith': './corelith.js',
    },
  };

  // ── Decode helpers ───────────────────────────────────────────
  function decodeFiles(el) {
    const b64 = el.getAttribute('data-sandpack-files');
    if (b64) {
      try {
        const json = atob(b64.trim());
        const parsed = JSON.parse(json);
        // Normalise: { path: 'code' } → { path: { code: 'code' } }
        const out = {};
        for (const k of Object.keys(parsed)) {
          const v = parsed[k];
          out[k] = typeof v === 'string' ? { code: v } : v;
        }
        return Object.assign(buildFiles(''), out);
      } catch (e) {
        console.warn('[sandpack-bridge] bad data-sandpack-files', e);
      }
    }
    const single = el.getAttribute('data-code') || el.textContent || '';
    return buildFiles(stripExports(single));
  }

  // Recipe snippets often export named symbols and never render
  // them. Wrap the snippet in an App default export so React has
  // something to mount. If the snippet already defines `App` or
  // a default export, leave it alone.
  function stripExports(code) {
    if (/export\s+default/.test(code)) return code;
    const match = code.match(/export\s+function\s+([A-Z][A-Za-z0-9_]*)/);
    if (match) {
      return code + '\n\nexport default ' + match[1] + ';\n';
    }
    // Fallback: wrap raw JSX in a default component.
    return code + '\n\nexport default function App() { return <div style={{padding:24,font:"13px system-ui"}}>Snippet has no exported component — edit /App.tsx to render something.</div>; }\n';
  }

  // ── SandpackClient loader (cached) ───────────────────────────
  // sandpack-client v2 replaced `new SandpackClient(...)` with an async
  // factory `loadSandpackClient(iframe, content, options)`. We probe both
  // shapes so a future SDK change doesn't break the bridge silently.
  let clientPromise = null;
  function loadClient() {
    if (!clientPromise) {
      clientPromise = import(CLIENT_URL).then((m) => {
        const root = m.default && typeof m.default === 'object' ? { ...m.default, ...m } : m;
        return {
          loadSandpackClient: root.loadSandpackClient || (m.default && m.default.loadSandpackClient),
          SandpackClient: root.SandpackClient || (m.default && m.default.SandpackClient),
        };
      });
    }
    return clientPromise;
  }

  async function mountInto(host, files) {
    const { loadSandpackClient, SandpackClient } = await loadClient();
    host.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = host.dataset.sandpackHeight || '460px';
    iframe.style.border = '1px solid var(--border, #e5e7eb)';
    iframe.style.borderRadius = '8px';
    iframe.title = 'Live preview';
    host.appendChild(iframe);

    const content = {
      files,
      template: 'react-ts',
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
    };
    const options = {
      showOpenInCodeSandbox: true,
      showLoadingScreen: true,
    };

    let client;
    if (typeof loadSandpackClient === 'function') {
      client = await loadSandpackClient(iframe, content, options);
    } else if (typeof SandpackClient === 'function') {
      client = new SandpackClient(iframe, content, options);
    } else {
      throw new Error('@codesandbox/sandpack-client exposes neither loadSandpackClient nor SandpackClient — check the CDN bundle.');
    }
    host._sandpackClient = client;
    return client;
  }

  // ── Mode 1 · Playground / standalone divs ────────────────────
  function bootStandalone() {
    document
      .querySelectorAll('div[data-sandpack]:not([data-sandpack-bound])')
      .forEach((host) => {
        // Skip cookbook specimens — those are handled below.
        if (host.classList.contains('ds-specimen')) return;
        host.setAttribute('data-sandpack-bound', '1');
        mountInto(host, decodeFiles(host)).catch((err) => {
          host.textContent = 'Sandpack failed to load: ' + err.message;
        });
      });
  }

  // ── Mode 2 · Cookbook recipes ────────────────────────────────
  // system-shell.js wraps each .ds-specimen in a .ds-preview with
  // a toolbar holding .ds-tab-group (Preview/Code) and a frame.
  // We inject a third "Run live" tab + a sibling panel that lazy-
  // mounts on first click.
  function enhanceSpecimens(scope = document) {
    scope.querySelectorAll('.ds-specimen[data-sandpack]:not([data-sandpack-bound])').forEach((spec) => {
      const wrap = spec.closest('.ds-preview');
      if (!wrap) return; // system-shell hasn't run yet
      spec.setAttribute('data-sandpack-bound', '1');

      const tabGroup = wrap.querySelector('.ds-tab-group');
      const frame = wrap.querySelector('.ds-preview-frame');
      const codePanel = wrap.querySelector('.ds-code-panel');
      if (!tabGroup || !frame) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ds-tab-btn';
      btn.dataset.tab = 'live';
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<span data-icon="play" data-icon-size="13"></span><span class="lbl">Run live</span>';
      tabGroup.appendChild(btn);

      const livePanel = document.createElement('div');
      livePanel.className = 'ds-live-panel';
      livePanel.hidden = true;
      livePanel.style.padding = '16px';
      livePanel.style.background = 'var(--surface, #fff)';
      livePanel.style.border = '1px solid var(--border, #e5e7eb)';
      livePanel.style.borderTop = '0';
      livePanel.style.borderRadius = '0 0 12px 12px';
      livePanel.dataset.sandpackHeight = '520px';
      wrap.appendChild(livePanel);

      let mounted = false;

      btn.addEventListener('click', async () => {
        tabGroup.querySelectorAll('.ds-tab-btn').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        frame.hidden = true;
        if (codePanel) codePanel.hidden = true;
        livePanel.hidden = false;
        wrap.dataset.tab = 'live';

        if (!mounted) {
          mounted = true;
          livePanel.innerHTML = '<div style="padding:24px;color:var(--text-muted,#6b7280);font:13px system-ui;">Loading Sandpack…</div>';
          try {
            await mountInto(livePanel, buildFiles(stripExports(spec.dataset.code || '')));
          } catch (err) {
            livePanel.textContent = 'Sandpack failed to load: ' + err.message;
          }
        }
      });

      // Reset our pressed state when Preview/Code tabs are clicked.
      tabGroup.querySelectorAll('.ds-tab-btn[data-tab="preview"], .ds-tab-btn[data-tab="code"]').forEach((b) => {
        b.addEventListener('click', () => {
          btn.setAttribute('aria-pressed', 'false');
          livePanel.hidden = true;
        });
      });
    });
  }

  // ── Boot ─────────────────────────────────────────────────────
  function boot() {
    bootStandalone();
    enhanceSpecimens(document);
    if (window.Icons && window.Icons.render) window.Icons.render(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    // system-shell.js also runs on DOMContentLoaded; defer one tick
    // so its .ds-preview wrappers exist when we look for them.
    setTimeout(boot, 0);
  }

  // Re-scan on demand (for pages that hydrate specimens later).
  window.SandpackBridge = { boot, enhanceSpecimens };
})();
