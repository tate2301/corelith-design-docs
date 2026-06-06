import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = 'http://localhost:8888';
const URL = process.argv[2] || '/portals/owner/demo.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(BASE + URL, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(500);
const axe = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

for (const v of axe.violations) {
  console.log('\n=== ' + v.id + ' (' + v.nodes.length + ') ' + v.help + ' ===');
  for (const n of v.nodes.slice(0, 10)) {
    console.log('  target: ' + n.target.join(' '));
    console.log('  html:   ' + (n.html || '').slice(0, 160));
    if (n.any && n.any.length) {
      for (const a of n.any) {
        if (a.message) console.log('  why:    ' + a.message.slice(0, 200));
      }
    }
  }
}

await browser.close();
