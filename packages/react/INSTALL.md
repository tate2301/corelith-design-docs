# Installing `@corelithzw/react`

```bash
npm install @corelithzw/react react react-dom
```

```tsx
import { Button } from '@corelithzw/react';
import '@corelithzw/react/styles.css';
```

That's it. No `.npmrc`, no PAT, no setup.

---

## Owner: one-time NPM_TOKEN setup

To let the publish workflow push releases to npm, the package owner needs to add an `NPM_TOKEN` repo secret once.

1. **Create the scope on npm.** Sign in at <https://www.npmjs.com>, then run:
   ```bash
   npm login
   npm whoami    # confirms you're logged in as corelithzw
   ```
2. **Create a publishing token.**
   - <https://www.npmjs.com/settings/corelithzw/tokens> → **Generate New Token** → **Granular access token**
   - Permissions: **`Read and write`** on packages
   - Scope: **`@corelithzw`** only (not the whole account)
   - Copy the token.
3. **Add it as a GitHub repo secret.**
   - <https://github.com/tate2301/corelith-design-docs/settings/secrets/actions> → **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: paste the token from step 2.
4. **Trigger the workflow.** Push to `main` with a version bump in `packages/react/package.json`, or dispatch **Publish @corelithzw/react** manually from the Actions tab.

Without `NPM_TOKEN` the workflow fails fast at the **Require NPM_TOKEN** step — there is no silent skip.

---

## Troubleshooting

### `npm ERR! 404 Not Found` on install

The version isn't on npm yet. Either the publish workflow hasn't run for this version, or it failed — check the **Actions** tab. `npm view @corelithzw/react versions` lists what's actually published.

### `npm ERR! E403 You cannot publish over the previously published versions`

The workflow's `Check if version is already on npm` step is supposed to catch this and skip. If it doesn't, bump the version in `packages/react/package.json` and try again.

### Styles aren't loading

You forgot the stylesheet import:

```ts
import '@corelithzw/react/styles.css';
```

It must be imported once at your app entry. If you use Vite, this is `src/main.tsx`. If you use Next.js App Router, it's `app/layout.tsx`.
