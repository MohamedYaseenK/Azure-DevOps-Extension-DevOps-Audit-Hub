# DevOps Hub for Productivity 

**Azure DevOps extension for team productivity monitoring, commit analytics, and anomaly detection.**

This repository contains a React + TypeScript Azure DevOps hub extension that runs inside the Azure DevOps web experience and provides a dashboard for tracking developer activity, work items, pull requests, and anomalous behavior.

---

## Key Features

- Team and developer productivity dashboards
- Commit, pull request, and work item trend analysis
- Drill-down developer view with charts and activity summaries
- Anomaly detection for unusual work item, commit, or PR behavior
- Azure DevOps Extension SDK integration for in-host rendering
- Vite-powered React application with TypeScript support

## Technology Stack

- React 19
- TypeScript 6
- Vite 8
- Azure DevOps Extension SDK
- Azure DevOps Node API
- Recharts for charts and visual reporting
- ESLint for code quality

## Prerequisites

- Node.js 20 or newer
- npm installed
- Azure DevOps organization and project access
- Browser session authenticated with Azure DevOps
- (Optional) `tfx` CLI installed for packaging the extension

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/MohamedYaseenK/DevOps-Audit-Hub-Azure-DevOps-Extension.git
cd ado-devops-hub
```

2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run dev
```

> Note: When running locally, Azure DevOps extension authentication may require the app to be hosted through the Azure DevOps preview experience or a secure proxy.

## Build

Compile and bundle the application for production:

```bash
npm run build
```

Output is generated in the `dist/` folder.

## Linting

Run ESLint across the repository:

```bash
npm run lint
```

## Packaging the Azure DevOps Extension

The extension manifest is defined in `vss-extension.json`, and the packaged extension includes the `dist` output and `images` assets.

1. Build the app:

```bash
npm run build
```

2. Package the extension with the Azure DevOps packaging CLI:

```bash
tfx extension create --manifest-globs vss-extension.json
```

3. Publish the generated `.vsix` file to your Azure DevOps organization or use it for local testing.

## Manifest Details

The extension manifest in `vss-extension.json` defines:

- `id`: `devops-hub-for-bluescope`
- `name`: `DevOps Hub for Bluescope`
- `publisher`: `MohamedYaseen`
- `version`: `1.2.6`
- `description`: Developer productivity monitoring hub for Azure DevOps
- `targets`: `Microsoft.VisualStudio.Services`
- `scopes`: `vso.project`, `vso.code`, `vso.work`
- Contribution type: `ms.vss-web.hub`
- Hub target: `ms.vss-work-web.work-hub-group`
- Entry point: `dist/index.html`

## Project Structure

- `src/main.tsx` — initializes the Azure DevOps Extension SDK and renders the React app
- `src/App.tsx` — top-level application shell and routing logic
- `src/components/TeamView.tsx` — team dashboard, metrics, and anomaly detection logic
- `src/components/DeveloperView.tsx` — developer profile view, commits, PRs, and work item details
- `src/api/adoApi.ts` — Azure DevOps REST API calls for commits, PRs, work items, and team data
- `src/anomaly/detector.ts` — anomaly detection rules and scoring logic
- `vss-extension.json` — Azure DevOps extension manifest
- `package.json` — npm scripts and dependencies

## How It Works

- The extension loads inside Azure DevOps as a web hub contribution.
- It calls Azure DevOps APIs to fetch team members, git commits, pull requests, and work items.
- The UI aggregates activity data per developer and computes anomaly signals.
- Users can filter by time range and inspect developer-level activity.

## Notes and Recommendations

- Work item effort is expected under `Microsoft.VSTS.Scheduling.Effort`; custom fields may require updates.
- The current implementation is built for a single team/project context.
- Use `npm run build` before packaging to ensure the latest code is included.
- The local experience may require serving through the Azure DevOps extension host for SDK authentication.

## Suggested Improvements

- Add configuration for custom ADO field names and team definitions
- Improve anomaly detection with adjustable thresholds and historical baselines
- Add multi-project or multi-team reporting support
- Add automated packaging and CI/CD publishing workflows

## License

This repository does not include a license file. Add a `LICENSE` file if you want to publish this project under a specific open source license.
