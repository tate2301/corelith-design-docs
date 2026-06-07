# Installing `@tate2301/corelith`

The package publishes to **two registries**. Pick the one you want.

| Registry | Anonymous install? | When to use |
|---|---|---|
| **public npm** (`registry.npmjs.org`) | ✅ Yes | Default. Use this everywhere unless you have a reason not to. |
| **GitHub Packages** (`npm.pkg.github.com`) | ❌ No — requires a Personal Access Token (PAT) | When your org's policy mandates GitHub Packages, or you want stricter access control. |

---

## Path 1 — public npm (recommended, no setup)

```bash
npm install @tate2301/corelith react react-dom
```

That's it. No `.npmrc`, no PAT.

In your code:

```tsx
import { Button, AuthShell } from '@tate2301/corelith';
import '@tate2301/corelith/styles.css';
```

> If `npm install` says "404 Not Found": the public npm publish step is gated behind the `NPM_TOKEN` repo secret (see the [Setup once](#setup-once-publishing-to-npm) section at the bottom). Until that secret is set, only the GitHub Packages copy exists, and you'll need Path 2.

---

## Path 2 — GitHub Packages (auth required, even for public packages)

**This is a [known and unfixed GitHub Packages limitation](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries).** "Make package public" only changes who can see it in the GitHub UI. `npm install` against `npm.pkg.github.com` requires authentication for every consumer, public or not.

### Step 1 — create a PAT (5 seconds)

1. Go to <https://github.com/settings/tokens?type=beta> (fine-grained token, recommended) or <https://github.com/settings/tokens> (classic).
2. Scope: **`read:packages`**. That's the only permission you need to install.
3. Copy the token. You'll never see it again.

### Step 2 — wire it into `.npmrc`

Add two lines to either `~/.npmrc` (user-wide) or `<repo>/.npmrc` (repo-local). Repo-local is usually what you want so collaborators don't accidentally pull from the wrong registry:

```
@tate2301:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_PAT_HERE
```

> Don't commit a `.npmrc` containing the literal token. Use one of:
>
> - `${NODE_AUTH_TOKEN}` placeholder + a CI secret
> - `~/.npmrc` (user-home, never in the repo)
> - GitHub's [npm-auth-action](https://github.com/actions/setup-node) which writes the file at job start

### Step 3 — install

```bash
npm install @tate2301/corelith react react-dom
```

### CI configurations

**GitHub Actions** consuming the package (same org or different org):

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    registry-url: 'https://npm.pkg.github.com'
    scope: '@tate2301'
- run: npm install
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # same-org
    # or: NODE_AUTH_TOKEN: ${{ secrets.MY_GH_PAT }}  # cross-org
```

**Docker** images:

```dockerfile
ARG GITHUB_TOKEN
RUN echo "@tate2301:registry=https://npm.pkg.github.com" >> ~/.npmrc \
 && echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc \
 && npm install
```

Build it with `--build-arg GITHUB_TOKEN=$GITHUB_TOKEN` — don't bake the token into a layer.

---

## Setup once — publishing to npm

To make the `@tate2301` scope on public npm available so Path 1 just works for everyone:

1. **Create the scope on npm.** Sign in at <https://www.npmjs.com>, then run:
   ```bash
   npm login
   npm whoami    # confirms you're logged in as tate2301
   ```
   If `npm whoami` returns `tate2301`, you already own the `@tate2301` scope. Done.
2. **Create a publishing token.**
   - <https://www.npmjs.com/settings/tate2301/tokens> → **Generate New Token** → **Granular access token**
   - Permissions: **`Read and write`** on packages
   - Scope: **`@tate2301`** only (not your whole account)
   - Copy the token.
3. **Add it as a GitHub repo secret.**
   - <https://github.com/tate2301/corelith-design-docs/settings/secrets/actions> → **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: paste the token from step 2.
4. **Trigger the workflow.** Push to `main` with a version bump in `packages/react/package.json`, or run the **Publish @tate2301/corelith** workflow manually from the Actions tab.

Once `NPM_TOKEN` is set, the workflow publishes to **both** registries on every version bump. You delete it later if you want to stop public-npm publishes; the workflow detects the missing secret and skips that step with a warning.

---

## Troubleshooting

### `npm ERR! 401 Unauthorized` on install

You're hitting GitHub Packages without auth. Either:
- switch to public npm (`npm config get registry` should return `https://registry.npmjs.org/`), or
- finish the Path 2 setup above.

### `npm ERR! 404 Not Found` on install (public npm)

Either:
- The package isn't on public npm yet — see "Setup once" above.
- You're on the wrong registry. `npm view @tate2301/corelith --registry=https://registry.npmjs.org` should return metadata.

### `npm ERR! E403 You cannot publish over the previously published versions`

The workflow's `Check what's already on each registry` step is supposed to catch this and skip. If it doesn't, bump the version in `packages/react/package.json` and try again.

### Styles aren't loading

You forgot the stylesheet import:

```ts
import '@tate2301/corelith/styles.css';
```

It must be imported once at your app entry. If you use Vite, this is `src/main.tsx`. If you use Next.js App Router, it's `app/layout.tsx`.
