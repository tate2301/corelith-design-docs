#!/usr/bin/env node
/* =====================================================================
 *  visual-diff.mjs — compare screenshots against baselines, fail loud
 * =====================================================================
 *
 *  Usage (CI):
 *    node scripts/visual-diff.mjs
 *
 *  Environment knobs:
 *    VISUAL_BASE_URL          (default http://localhost:8888)
 *    VISUAL_DIFF_THRESHOLD    fraction of total pixels allowed to
 *                             differ before failure (default 0.005)
 *    VISUAL_ALLOW_MISSING     '1' → missing baselines are written
 *                             rather than treated as a failure.
 *                             CI uses this on the first run so the
 *                             pipeline can self-seed. Default '0'.
 *
 *  Outputs:
 *    visual-baselines/__actual/<key>.<viewport>.png    actual run
 *    visual-baselines/__diffs/<key>.<viewport>.png     red diff pixels
 *
 *  Both directories are uploaded as a GitHub Actions artifact so the
 *  reviewer can see exactly what changed without re-running locally.
 *
 *  PIXELMATCH PATH
 *  ---------------
 *  We optionally use the `pixelmatch` + `pngjs` packages for an
 *  anti-aliasing-aware diff. If those packages can't be loaded
 *  (lightweight dev environment, etc.), we fall back to a simple
 *  per-pixel RGBA threshold. Either path produces the same exit
 *  contract: 0 on pass, non-zero on regression.
 * =====================================================================
 */
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';

import {
  SURFACES,
  VIEWPORTS,
  baselinePath,
  actualPath,
  diffPath,
  capture,
} from './visual-surfaces.mjs';

const BASE = process.env.VISUAL_BASE_URL || 'http://localhost:8888';
const THRESHOLD = parseFloat(process.env.VISUAL_DIFF_THRESHOLD || '0.005');
const ALLOW_MISSING = process.env.VISUAL_ALLOW_MISSING === '1';

let pixelmatch = null;
let PNG = null;
try {
  pixelmatch = (await import('pixelmatch')).default;
  PNG = (await import('pngjs')).PNG;
} catch (e) {
  console.warn('[visual-diff] pixelmatch/pngjs unavailable, using naive RGBA diff');
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

/* Naive per-pixel RGBA diff used when pixelmatch is unavailable.
 * Treats any pixel whose channels differ by more than 12/255 as
 * different. Roughly equivalent to pixelmatch's default threshold. */
function naiveDiff(aBuf, bBuf) {
  // Both buffers are PNGs — without pngjs we can only do a hash-style
  // exact-equality check. Returns 0 (identical) or 1.0 (different).
  if (aBuf.length !== bBuf.length) return 1.0;
  for (let i = 0; i < aBuf.length; i++) {
    if (aBuf[i] !== bBuf[i]) return 1.0;
  }
  return 0;
}

async function diffPng(baselineBuf, actualBuf, outPath) {
  if (pixelmatch && PNG) {
    const a = PNG.sync.read(baselineBuf);
    const b = PNG.sync.read(actualBuf);
    if (a.width !== b.width || a.height !== b.height) {
      return { diffPixels: a.width * a.height, total: a.width * a.height, fraction: 1.0, sizeMismatch: true };
    }
    const diff = new PNG({ width: a.width, height: a.height });
    const diffPixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, PNG.sync.write(diff));
    const total = a.width * a.height;
    return { diffPixels, total, fraction: diffPixels / total, sizeMismatch: false };
  }
  const frac = naiveDiff(baselineBuf, actualBuf);
  return { diffPixels: frac > 0 ? 1 : 0, total: 1, fraction: frac, sizeMismatch: false };
}

async function main() {
  console.log(`[visual-diff] base=${BASE}  threshold=${THRESHOLD}  allow-missing=${ALLOW_MISSING}`);
  const browser = await chromium.launch();
  const results = [];
  let regressions = 0;
  let missing = 0;

  for (const surface of SURFACES) {
    for (const viewport of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: viewport.size });
      const page = await ctx.newPage();
      const url = BASE + surface.path;
      const baseP = baselinePath(surface, viewport);
      const actP  = actualPath(surface, viewport);
      const diffP = diffPath(surface, viewport);

      try {
        await capture(page, url, surface);
        const actualBuf = await page.screenshot({ fullPage: false });
        await mkdir(dirname(actP), { recursive: true });
        await writeFile(actP, actualBuf);

        if (!(await exists(baseP))) {
          if (ALLOW_MISSING) {
            await mkdir(dirname(baseP), { recursive: true });
            await writeFile(baseP, actualBuf);
            console.log(`  SEED   ${surface.key} @ ${viewport.name}  ->  wrote new baseline`);
            missing++;
          } else {
            console.error(`  MISS   ${surface.key} @ ${viewport.name}  ->  no baseline`);
            regressions++;
          }
          continue;
        }

        const baselineBuf = await readFile(baseP);
        const { diffPixels, total, fraction, sizeMismatch } = await diffPng(baselineBuf, actualBuf, diffP);
        const pct = (fraction * 100).toFixed(3);
        const ok = !sizeMismatch && fraction <= THRESHOLD;
        if (ok) {
          console.log(`  ok     ${surface.key} @ ${viewport.name}  ${diffPixels}/${total} px (${pct}%)`);
        } else {
          regressions++;
          if (sizeMismatch) {
            console.error(`  SIZE   ${surface.key} @ ${viewport.name}  baseline size mismatch`);
          } else {
            console.error(`  DIFF   ${surface.key} @ ${viewport.name}  ${diffPixels}/${total} px (${pct}% > ${(THRESHOLD*100).toFixed(3)}%)`);
          }
        }
        results.push({ key: surface.key, viewport: viewport.name, fraction, ok });
      } catch (err) {
        regressions++;
        console.error(`  FAIL   ${surface.key} @ ${viewport.name}: ${err.message}`);
      } finally {
        await ctx.close();
      }
    }
  }

  await browser.close();

  // GitHub-flavoured step summary if running in CI.
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = ['# Visual diff', '', `Threshold: \`${(THRESHOLD*100).toFixed(3)}%\``, ''];
    lines.push('| Surface | Viewport | Diff % | Status |');
    lines.push('|---|---|---|---|');
    for (const r of results) {
      lines.push(`| ${r.key} | ${r.viewport} | ${(r.fraction*100).toFixed(3)}% | ${r.ok ? 'ok' : 'REGRESSED'} |`);
    }
    if (missing) lines.push(`\n_${missing} baseline(s) auto-seeded this run._`);
    await writeFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'), { flag: 'a' });
  }

  if (regressions > 0) {
    console.error(`[visual-diff] FAILED — ${regressions} surface(s) regressed`);
    process.exit(1);
  }
  console.log(`[visual-diff] passed (${results.length} comparisons, ${missing} seeded)`);
}

main().catch((err) => {
  console.error('[visual-diff] crashed:', err);
  process.exit(2);
});
