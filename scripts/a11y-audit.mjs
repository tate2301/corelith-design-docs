import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';

const BASE = 'http://localhost:8888';

const URLS = [
  // System
  '/system/foundations.html',
  '/system/p-button.html',
  '/system/p-input.html',
  '/system/p-input-otp.html',
  '/system/b-row-card.html',
  '/system/x-bottom-sheet.html',
  '/system/x-auth.html',
  '/system/x-app-shell.html',
  // Portals
  '/portals/pos/demo.html',
  '/portals/parent/demo.html',
  '/portals/student/demo.html',
  '/portals/teacher/demo.html',
  '/portals/staff/demo.html',
  '/portals/admin/demo.html',
  '/portals/owner/demo.html',
  '/portals/gold/demo.html',
  '/portals/scrap/demo.html',
  // Cookbook
  '/cookbook/index.html',
  '/cookbook/auth-signin-2fa.html',
];

const results = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

for (const url of URLS) {
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(300);
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    results.push({
      url,
      violations: axe.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
        sampleTarget: v.nodes[0]?.target?.join(' '),
        sampleHTML: (v.nodes[0]?.html || '').slice(0, 200),
      })),
      violationCount: axe.violations.reduce((s, v) => s + v.nodes.length, 0),
    });
    console.log(`${url}: ${axe.violations.length} rules, ${results[results.length - 1].violationCount} nodes`);
  } catch (e) {
    results.push({ url, error: e.message });
    console.log(`${url}: ERROR ${e.message}`);
  }
  await page.close();
}

await browser.close();

// Tally
const ruleCounts = {};
for (const r of results) {
  for (const v of (r.violations || [])) {
    ruleCounts[v.id] = (ruleCounts[v.id] || 0) + v.nodes;
  }
}

console.log('\n=== TOP RULES ===');
Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]).forEach(([id, n]) => console.log(`${id}: ${n}`));

fs.writeFileSync('/tmp/a11y-results.json', JSON.stringify(results, null, 2));
console.log('\nWrote /tmp/a11y-results.json');
