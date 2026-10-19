# Zof Local Verification for VS Code

Inspect local changes, see findings in Problems, analyze affected files and open portable evidence directly in the editor. A bundled CLI library means no separate CLI installation is required. There is no account requirement, telemetry, workspace-script execution or source upload.

<!-- ZOF_RELEASE_INSTALL_START -->
## Install from GitHub source

Requires Node.js 22 or 24, npm, and Git. Filesystem operations require Linux or macOS with Python 3.10 or newer; Windows file operations fail closed. Clone this repository and explicitly prepare its reviewed release dependencies:

```sh
git clone https://github.com/Zof-AI/zof-vscode.git
cd zof-vscode
node scripts/bootstrap.mjs --allow-network
npm ci --ignore-scripts --prefer-offline
npm run build
npm test
```

The bootstrap downloads only the exact `v0.1.0` dependency assets from [GitHub Releases](https://github.com/Zof-AI/zof-vscode/releases), as listed in `scripts/release-dependencies.json`, verifies SHA256 and byte size, and adds them to the npm cache. It does not extract archives, run package scripts, collect application data, or send credentials. Downloads require the explicit flag and follow only HTTPS GitHub asset redirects. Installation then fetches ordinary third-party dependencies from npm. Use a writable npm cache; set `npm_config_cache` consistently for both commands if needed. An unavailable asset, changed hash, or oversized response stops installation.

GitHub source and release artifacts are the initial distribution channel. These instructions do not claim that `@zofai` packages are published on npm or that the VS Code extension is listed in Marketplace.
<!-- ZOF_RELEASE_INSTALL_END -->

## Install the extension

After the GitHub source installation above, build the extension with `npm run build`, `npm test` and `npm run package`. Install the resulting `zof-verification-0.1.0.vsix` using Extensions: Install from VSIX. The extension identifier uses `zof-ai`; publisher ownership and Marketplace publication remain unverified. Downloadable VSIX assets are listed on this repository's GitHub Releases page. A VSIX is not a Marketplace listing.

## Three workflows

1. Open a trusted local Git workspace, edit a TypeScript or JavaScript function, then run **Zof: Verify Current Changes**. Generic risks appear in Problems and the Zof Verification output channel.
2. Run **Zof: Analyze Change Impact** to inspect static import consumers and limitations. Set `zof.baseRevision` when comparing against another local revision.
3. Run **Zof: Generate Evidence**, then **Zof: Open Verification Report**. The evidence opens as a JSON document held in editor memory; save it deliberately if desired. **Zof: Check Installation** reports the bundled tool and Git availability.

## Configuration and privacy

`zof.baseRevision` defaults to HEAD. `zof.failOn` defaults to high and accepts info, low, medium, high or critical. Commands work only with local filesystem workspaces. Verification requires workspace trust and never executes application code. No hosted connection command is exposed because hosted acceptance is unverified. No credentials are stored, transmitted or read by the extension. No webview or rendered HTML is used. Diagnostic paths remain within the selected workspace.

Cancellation is available in progress notifications, with cooperative checkpoints in the underlying bounded tools. Static heuristics and import analysis are advisory; unsupported cases and missing tests are explicit. They do not prove a change safe. The status bar reports local results. The extension never runs a workspace-selected executable. Uninstall removes the extension; editor-created reports remain only if the user saved them.

## Development and support

Requires VS Code >=1.139.0; 1.139.1 was exercised in the local acceptance run. Build with Node22/24. `npm run test:editor` launches the official extension test runner with an isolated synthetic Git workspace and separate user profile. Tests exercise activation, registered commands, a real unsafe change, diagnostics, impact and evidence display. Platform/Marketplace acceptance is recorded only when actually run. See SECURITY.md, CONTRIBUTING.md and docs/RELEASE.md. Built independently for https://zof.ai; Licensed under [Apache-2.0](LICENSE).

## Filesystem and Git boundaries

Filesystem operations use bounded, directory-relative descriptors on Linux/macOS with Python 3.10 or newer. Symlinks, hard-linked inputs, special files and traversal are rejected. Open descriptors remain attached to the original directory when names change. File contents can still change during a read or snapshot; this is not an atomic filesystem snapshot. Windows filesystem operations fail closed; in-memory JSON validation and analysis do not require the file helper. Git reads use a private bounded snapshot: 256 MiB total, 32 MiB per source/object file, 50,000 entries and 64 directory levels. Repository hooks/configuration are not used; local `.git/info/exclude` and `.git/info/attributes` are preserved. External Git metadata, object alternates, grafts, sparse-checkout metadata, linked worktrees and submodules are unsupported. Limits and unsupported metadata cause an explicit error or incomplete result.
