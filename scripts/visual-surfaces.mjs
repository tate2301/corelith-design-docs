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
  // Cookbook hub + key recipes that exercise the recipe shell + charts.
  { key: 'cookbook-index',                path: '/cookbook/index.html' },
  { key: 'cookbook-auth-signin-2fa',      path: '/cookbook/auth-signin-2fa.html' },
  { key: 'cookbook-lists-master-detail',  path: '/cookbook/lists-master-detail.html' },
  { key: 'cookbook-charts-donut',         path: '/cookbook/charts/donut.html' },

  // Portal hub + two signed-in demos exercising bespoke portal chrome.
  { key: 'portals-index',      path: '/portals/index.html' },
  { key: 'portal-owner-demo',  path: '/portals/owner/demo.html', signIn: 'siGoOtpGo' },
  { key: 'portal-stash-demo',  path: '/portals/stash/demo.html', signIn: 'siGoOtpGo' },

  // System reference — exercises system.css + shared.css together.
  { key: 'system-shells',  path: '/system/shells.html' },

  // Playground — the all-component sandbox.
  { key: 'playground',     path: '/playground/index.html' },
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

  // Per-surface sign-in flows. Both owner + stash demos boot to a
  // sign-in screen, then a 6-digit OTP. We click through both with
  // the demo's own buttons so the screenshot shows signed-in state.
  if (surface.signIn === 'siGoOtpGo') {
    try {
      await page.click('#si-go', { timeout: 4000 });
      await page.waitForTimeout(250);
      // Demo accepts any 6 digits — fill them so #otp-go enables in
      // case the demo gates submission on input.
      const otpInputs = await page.$$('[data-otp]');
      for (let i = 0; i < otpInputs.length; i++) {
        await otpInputs[i].fill(String(i % 10));
      }
      await page.click('#otp-go', { timeout: 4000 });
      await page.waitForTimeout(500);
    } catch (err) {
      // Some demos may already be signed in or use a different control
      // — fail soft so the screenshot still captures whatever state.
      console.warn(`  [capture] sign-in step skipped for ${surface.key}: ${err.message}`);
    }
  }

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
