#!/usr/bin/env node
/* =====================================================================
 *  visual-baseline.mjs — write or refresh baseline screenshots
 * =====================================================================
 *
 *  Usage:
 *    node scripts/visual-baseline.mjs
 *
 *  This is the one-shot generator that captures the "known-good" look
 *  for every surface listed in SURFACES below, at every viewport in
 *  VIEWPORTS. It always overwrites existing baselines — that's the
 *  whole point, you run it after a deliberate visual change.
 *
 *  WORKFLOW
 *  --------
 *    1. Boot a local server:  python3 -m http.server 8888
 *    2. Run this script:      node scripts/visual-baseline.mjs
 *    3. Inspect the diffs:    git status visual-baselines/
 *    4. Commit:               git add visual-baselines/ && git commit
 *
 *  Pair with `scripts/visual-diff.mjs`, which uses the exact same
 *  SURFACES + VIEWPORTS list and compares against these files.
 *
 *  This script is intentionally separate from visual-diff.mjs so
 *  contributors never accidentally "refresh" baselines from a CI run
 *  — if a regression is real, we want it to fail loudly.
 * =====================================================================
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SURFACES, VIEWPORTS, baselinePath, capture } from './visual-surfaces.mjs';

const BASE = process.env.VISUAL_BASE_URL || 'http://localhost:8888';

async function main() {
  console.log(`[visual-baseline] writing baselines against ${BASE}`);
  const browser = await chromium.launch();
  let written = 0;
  let failed = 0;

  for (const surface of SURFACES) {
    for (const viewport of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: viewport.size });
      const page = await ctx.newPage();
      const url = BASE + surface.path;
      const outPath = baselinePath(surface, viewport);
      try {
        await capture(page, url, surface);
        const buf = await page.screenshot({ fullPage: false });
        await mkdir(dirname(outPath), { recursive: true });
        await writeFile(outPath, buf);
        console.log(`  wrote  ${surface.key} @ ${viewport.name}  ->  ${outPath}`);
        written++;
      } catch (err) {
        console.error(`  FAIL   ${surface.key} @ ${viewport.name}: ${err.message}`);
        failed++;
      } finally {
        await ctx.close();
      }
    }
  }

  await browser.close();
  console.log(`[visual-baseline] done — ${written} written, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('[visual-baseline] crashed:', err);
  process.exit(2);
});
