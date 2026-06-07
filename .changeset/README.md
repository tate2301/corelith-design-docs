# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to track unreleased changes destined for the next published version of the design-system packages (currently `@corelithzw/react`, with more to follow).

## Adding a changeset

Every PR that changes shipping code — tokens, components, primitives, or the React wrapper — should ship with a changeset. Once Changesets is installed in CI, the following commands are wired up:

```bash
pnpm changeset           # interactive — picks bumped packages + bump type
# or
npx @changesets/cli      # same, without a global install
```

The CLI will:

1. Ask which packages are affected.
2. Ask whether the change is **patch / minor / major**.
3. Ask for a short summary (one paragraph; markdown OK).
4. Drop a `.changeset/<random-name>.md` file in this folder.

Commit the resulting file alongside your code change.

## Choosing a bump

| Bump  | When                                                           |
| ----- | -------------------------------------------------------------- |
| patch | Bug fix, doc tweak, internal refactor — no API surface change. |
| minor | New component / new variant / new token. Additive only.        |
| major | Rename / removal / behaviour change. Breaks consumers.         |

Pre-1.0 we treat **minor** as the breaking line and **patch** as additive
per common npm convention — see [`../VERSION`](../VERSION).

## Releasing

When the merged changesets are ready to ship:

```bash
pnpm changeset version   # consumes the .md files, bumps versions, writes CHANGELOG.md
pnpm changeset publish   # publishes to the registry (CI does this on main)
```

CI (`.github/workflows/release.yml`, coming soon) handles the publish step.

## Backfill window

For v0.5.x — released before Changesets was installed — the changelog
entries were generated from git history by
[`../scripts/generate-changelog.mjs`](../scripts/generate-changelog.mjs)
and live in [`../system/changelog.html`](../system/changelog.html).
From v0.6.0 onward, every entry comes from a changeset.
