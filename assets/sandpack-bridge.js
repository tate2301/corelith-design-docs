/* Huchu DS — Sandpack bridge
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
 * esm.sh. The sandbox iframe loads @huchu/react from esm.sh too;
 * for v1 we ship a tiny inline shim that re-exports plain DOM
 * elements with the docs-site components.css class names. Real
 * package resolution can land later without touching this file.
 */
(function () {
  const CLIENT_URL = 'https://esm.sh/@codesandbox/sandpack-client@2';

  // ── @huchu/react shim ────────────────────────────────────────
  // Maps the named exports the cookbook recipes import (Stack,
  // Form, Field, Input, InputOtp, Button, Alert, Checkbox,
  // AuthShell, useReducer, useState, useEffect, …) onto small
  // React wrappers around the docs-site CSS classes. It's a
  // proof-of-pattern shim, not a real component library — it
  // exists so snippets that import from '@huchu/react' resolve
  // and render *something* believable in the sandbox.
  const HUCHU_SHIM = `
import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
export { useState, useEffect, useReducer, useRef, useCallback, useMemo };

const cls = (...xs) => xs.filter(Boolean).join(' ');

export function Stack({ gap = 'md', align, children, ...rest }) {
  const g = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 }[gap] ?? 14;
  return React.createElement('div', { style: { display:'grid', gap: g, alignItems: align==='center'?'center':undefined, textAlign: align==='center'?'center':undefined }, ...rest }, children);
}

export function Form({ onSubmit, children, ...rest }) {
  return React.createElement('form', {
    ...rest,
    onSubmit: (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const values = Object.fromEntries(fd.entries());
      onSubmit && onSubmit(values);
    },
  }, children);
}

export function Field({ label, name, children }) {
  // Inject name onto the first input-like child.
  const child = React.Children.map(children, (c) =>
    React.isValidElement(c) ? React.cloneElement(c, { name }) : c
  );
  return React.createElement('label', { style: { display:'grid', gap: 4, font: '500 12px/1.2 system-ui', color:'#374151' } },
    label,
    child
  );
}

export function Input(props) {
  return React.createElement('input', {
    ...props,
    style: { height: 36, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 8, font: '14px system-ui', ...(props.style||{}) },
  });
}

export function InputOtp({ length = 6, value = '', onChange, ...rest }) {
  const boxes = Array.from({ length }, (_, i) => value[i] || '');
  return React.createElement('div', { style: { display:'flex', gap: 6 } },
    boxes.map((d, i) => React.createElement('input', {
      key: i,
      value: d,
      maxLength: 1,
      inputMode: 'numeric',
      onChange: (e) => {
        const next = (value.slice(0,i) + e.target.value + value.slice(i+1)).slice(0,length);
        onChange && onChange(next);
      },
      style: { width: 36, height: 44, textAlign:'center', font:'600 18px/1 ui-monospace,monospace', border:'1px solid #d1d5db', borderRadius: 6 },
      ...rest,
    }))
  );
}

export function Button({ variant = 'default', size = 'md', children, ...rest }) {
  const base = { display:'inline-grid', placeItems:'center', height: size==='lg'?40:32, padding:'0 14px', borderRadius: 8, border: 0, cursor: 'pointer', font:'600 13px/1 system-ui' };
  const skin = variant === 'primary'
    ? { background: '#16181d', color: '#fff' }
    : variant === 'ghost'
    ? { background: 'transparent', color: '#374151', border: '1px solid #e5e7eb' }
    : variant === 'link'
    ? { background: 'transparent', color: '#2563eb', padding: 0, height: 'auto', textDecoration: 'underline' }
    : { background: '#f3f4f6', color: '#111827' };
  return React.createElement('button', { ...rest, style: { ...base, ...skin, ...(rest.style||{}) } }, children);
}

export function Alert({ tone = 'info', children, ...rest }) {
  const colors = tone === 'danger'
    ? { bg: '#fef2f2', bd: '#fecaca', fg: '#b91c1c' }
    : tone === 'success'
    ? { bg: '#ecfdf5', bd: '#a7f3d0', fg: '#047857' }
    : { bg: '#eff6ff', bd: '#bfdbfe', fg: '#1d4ed8' };
  return React.createElement('div', { role:'alert', ...rest, style:{ background: colors.bg, border: '1px solid '+colors.bd, color: colors.fg, padding: '8px 10px', borderRadius: 8, font:'13px/1.4 system-ui' } }, children);
}

export function Checkbox({ checked, onChange, children, ...rest }) {
  return React.createElement('label', { style: { display:'flex', alignItems:'center', gap: 8, font:'13px/1 system-ui', color:'#374151' } },
    React.createElement('input', { type:'checkbox', checked: !!checked, onChange: (e) => onChange && onChange(e.target.checked), ...rest }),
    children
  );
}

export function AuthShell({ brand, workspace, children }) {
  return React.createElement('div', { style: { minHeight:'100vh', display:'grid', placeItems:'center', background:'#f9fafb', padding: 24 } },
    React.createElement('div', { style: { width: 360, background:'#fff', border:'1px solid #e5e7eb', borderRadius: 14, padding: 28 } },
      React.createElement('div', { style:{ font:'600 14px/1 system-ui', color:'#16181d', marginBottom: 12 } }, brand || 'Huchu', workspace ? ' · ' + workspace : ''),
      children
    )
  );
}
`;

  // ── Default starter files for a single-file TSX snippet ──────
  function buildFiles(appCode) {
    return {
      '/App.tsx': { code: appCode },
      '/huchu-react.js': { code: HUCHU_SHIM, hidden: true },
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

  // Map bare-name '@huchu/react' imports onto the inline shim.
  const IMPORT_MAP = {
    imports: {
      '@huchu/react': './huchu-react.js',
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
  let clientPromise = null;
  function loadClient() {
    if (!clientPromise) {
      clientPromise = import(CLIENT_URL).then((m) => m.SandpackClient || m.default && m.default.SandpackClient || m.default);
    }
    return clientPromise;
  }

  async function mountInto(host, files) {
    const SandpackClient = await loadClient();
    host.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = host.dataset.sandpackHeight || '460px';
    iframe.style.border = '1px solid var(--border, #e5e7eb)';
    iframe.style.borderRadius = '8px';
    iframe.title = 'Live preview';
    host.appendChild(iframe);

    const client = new SandpackClient(iframe, {
      files,
      template: 'react-ts',
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
    }, {
      showOpenInCodeSandbox: true,
      showLoadingScreen: true,
    });
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
