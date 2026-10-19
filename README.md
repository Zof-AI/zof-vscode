# Zof Local Verification for VS Code

Inspect local changes, see findings in Problems, analyze affected files and open portable evidence directly in the editor. A bundled CLI library means no separate CLI installation is required. There is no account requirement, telemetry, workspace-script execution or source upload.

## Install the candidate

Build from reviewed candidate dependencies with `npm run build`, `npm test` and `npm run package`. Install the resulting `zof-verification-0.1.0.vsix` using Extensions: Install from VSIX. The proposed publisher is `zof-ai`; publisher ownership and Marketplace publication remain unverified. A VSIX is not a Marketplace listing.

## Three workflows

1. Open a trusted local Git workspace, edit a TypeScript or JavaScript function, then run **Zof: Verify Current Changes**. Generic risks appear in Problems and the Zof Verification output channel.
2. Run **Zof: Analyze Change Impact** to inspect static import consumers and limitations. Set `zof.baseRevision` when comparing against another local revision.
3. Run **Zof: Generate Evidence**, then **Zof: Open Verification Report**. The evidence opens as a JSON document held in editor memory; save it deliberately if desired. **Zof: Check Installation** reports the bundled tool and Git availability.

## Configuration and privacy

`zof.baseRevision` defaults to HEAD. `zof.failOn` defaults to high and accepts info, low, medium, high or critical. Commands work only with local filesystem workspaces. Verification requires workspace trust and never executes application code. No hosted connection command is exposed because hosted acceptance is unverified. No credentials are stored, transmitted or read by the extension. No webview or rendered HTML is used. Diagnostic paths remain within the selected workspace.

Cancellation is available in progress notifications, with cooperative checkpoints in the underlying bounded tools. Static heuristics and import analysis are advisory; unsupported cases and missing tests are explicit. They do not prove a change safe. The status bar reports local results. The extension never runs a workspace-selected executable. Uninstall removes the extension; editor-created reports remain only if the user saved them.

## Development and support

Requires VS Code >=1.99.0. Build with Node22/24. `npm run test:editor` launches the official extension test runner with an isolated synthetic Git workspace and separate user profile. Tests exercise activation, registered commands, a real unsafe change, diagnostics, impact and evidence display. Platform/Marketplace acceptance is recorded only when actually run. See SECURITY.md, CONTRIBUTING.md and docs/RELEASE.md. Built independently for https://zof.ai; proposed Apache-2.0 licensing requires owner/legal approval.
