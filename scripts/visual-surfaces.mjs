/* =====================================================================
 *  visual-surfaces.mjs — shared surface + viewport list
 * =====================================================================
 *
 *  Imported by both `visual-baseline.mjs` (writes baselines) and
 *  `visual-diff.mjs` (compares against baselines). Keeping the list
 *  in one file means the two scripts can never drift out of sync.
 *
 *  ADDING A NEW SURFACE
 *  --------------------
 *  Append a new entry to SURFACES with a stable `key` (used as the
 *  filename) and the absolute `path` under the doc root. Then run
 *  `node scripts/visual-baseline.mjs` once to seed the baseline.
 *
 *  WHY THIS CURATED LIST
 *  ---------------------
 *  We deliberately do NOT screenshot every HTML file in the repo.
 *  A 200-page snapshot suite is unreviewable. The set below is the
 *  smallest list that covers every shared CSS file: tokens.css,
 *  components.css, system.css, shared.css, dash.css, portal-shell.css.
 *  If any of those regress, at least one surface here will diff.
 * =====================================================================
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export const VIEWPORTS = [
  { name: 'mobile',  size: { width: 390,  height: 844 } },
  { name: 'desktop', size: { width: 1280, height: 800 } },
];

export const SURFACES = [
  // Cookbook hub + five recipes that exercise the recipe shell.
  { key: 'cookbook-index',                path: '/cookbook/index.html' },
  { key: 'cookbook-auth-signin-2fa',      path: '/cookbook/auth-signin-2fa.html' },
  { key: 'cookbook-onboarding-checklist', path: '/cookbook/onboarding-checklist.html' },
  { key: 'cookbook-forms-multi-step',     path: '/cookbook/forms-multi-step-wizard.html' },
  { key: 'cookbook-lists-master-detail',  path: '/cookbook/lists-master-detail.html' },
  { key: 'cookbook-dashboards-operator',  path: '/cookbook/dashboards-operator-overview.html' },

  // Portal demos — three different shells (POS, parent, owner).
  { key: 'portal-pos-demo',    path: '/portals/pos/demo.html' },
  { key: 'portal-parent-demo', path: '/portals/parent/demo.html' },
  { key: 'portal-owner-demo',  path: '/portals/owner/demo.html' },

  // System reference — exercises system.css + shared.css together.
  { key: 'system-shells', path: '/system/shells.html' },
];

export function baselinePath(surface, viewport) {
  return resolve(ROOT, 'visual-baselines', `${surface.key}.${viewport.name}.png`);
}

export function actualPath(surface, viewport) {
  return resolve(ROOT, 'visual-baselines', '__actual', `${surface.key}.${viewport.name}.png`);
}

export function diffPath(surface, viewport) {
  return resolve(ROOT, 'visual-baselines', '__diffs', `${surface.key}.${viewport.name}.png`);
}

/* Navigate + settle hook. We wait for `networkidle` and then sleep a
 * touch so font swaps and icon SVG injection (icons.js runs on
 * DOMContentLoaded) have flushed. Any per-surface custom waits get
 * added here keyed off `surface.key`. */
export async function capture(page, url, surface) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  // Icons.js renders <span data-icon="…"> asynchronously after
  // domcontentloaded — give it a beat.
  await page.waitForTimeout(400);
  // Block any CSS animation from poisoning the screenshot by injecting
  // a freeze rule. This is removed when the context closes.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
  await page.waitForTimeout(100);
}
