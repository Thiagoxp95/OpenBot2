# AGENTS.md

## Prompt to production

This project ships every change straight to users. A prompt becomes a change, the change merges to `main`, and the merge deploys. There is no staging step and no manual release.

- Work trunk-based. Branch from `main`, keep the branch to one small change, and merge it back to `main` the same session. Never keep a long-lived branch, a release branch, or a version branch.
- Every merge to `main` deploys. `.github/workflows/release.yml` builds the desktop app for macOS, Windows and Linux, publishes a GitHub Release, and installed apps update themselves from it.
- Treat `main` as production. Before you merge, run `pnpm turbo run typecheck build` and launch the app if you changed it. A change that is not ready does not merge.
- Never set a version by hand. The release version is `0.1.<commit count on main>`, computed in CI.
- To undo a bad release, revert on `main` and merge. The revert ships as a new, higher version.

## Repo

- pnpm workspaces plus Turborepo. Apps live in `apps/`, shared packages in `packages/`.
- `apps/desktop` is the Electron app. `src/updates.ts` owns auto-update through `electron-updater`.
- If Electron starts as plain Node (`bad option` errors), your shell has `ELECTRON_RUN_AS_NODE=1`. Unset it.
