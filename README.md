# DevOps Hub for Bluescope

A React + TypeScript Azure DevOps extension for tracking team activity and detecting anomalies across commits, pull requests, and work items.

## Overview

This project is an Azure DevOps hub extension that loads inside the Azure DevOps web experience and displays:

- Team productivity summary
- Commit, PR, and work item counts per developer
- Developer detail view with commit activity, work item list, and PR status
- Anomaly detection based on effort, commit volume, PR activity, and work item engagement
- Date range filters for `Today`, `This Week`, and `This Month`

## Features

- Azure DevOps Extension SDK integration
- ADO REST API usage for team members, git commits, pull requests, and work items
- Developer drill-down experience with charts and status badges
- Simple anomaly detection rules for productivity monitoring
- Vite + React + TypeScript application bundle

## Stack

- React 19
- TypeScript 6
- Vite 8
- Azure DevOps Extension SDK
- Azure DevOps Node API
- ESLint
- Recharts for visual commit analytics

## Prerequisites

- Node.js 20+ installed
- npm available
- Azure DevOps organization and project access
- Browser session authenticated with Azure DevOps

## Setup

```bash
cd "d:\Acads\Internships\5. BlueScope\2. ado-devops-hub"
npm install
```

## Run locally

```bash
npm run dev
```

> Note: Azure DevOps SDK authentication may require the extension to run through the Azure DevOps host or a secure local preview.

## Build

```bash
npm run build
```

This command compiles TypeScript and bundles the app into the `dist/` folder.

## Lint

```bash
npm run lint
```

## Extension manifest

The extension manifest is defined in `vss-extension.json`:

- `id`: `devops-hub-for-bluescope`
- `name`: `DevOps Hub for Bluescope`
- `publisher`: `MohamedYaseen`
- `version`: `1.0.2`
- `targets`: Azure DevOps
- `scopes`: `vso.work`, `vso.code`, `vso.build`
- `uri`: `dist/index.html`

## How it works

- `src/main.tsx` initializes the Azure DevOps Extension SDK and renders the React app.
- `src/App.tsx` shows the top-level team dashboard and developer detail flow.
- `src/components/TeamView.tsx` loads team members, computes commit/PR/work item metrics, and detects anomalies.
- `src/components/DeveloperView.tsx` displays developer activity charts, recent commits, PRs, and work items.
- `src/api/adoApi.ts` fetches Azure DevOps data through REST APIs.
- `src/anomaly/detector.ts` applies simple productivity anomaly rules.

## Important notes

- The app reads team members from Azure DevOps teams.
- Commit activity queries repositories in the current project.
- Pull request data is filtered by author email and selected date range.
- Work item effort is read from `Microsoft.VSTS.Scheduling.Effort`.
- Custom ADO field names or work item states may require query updates.

## Next steps

- Package the extension with Azure DevOps tooling (for example `tfx extension create`)
- Add build automation for packaging and publishing
- Improve anomaly rules with configurable thresholds
- Add support for multiple teams or project-wide summaries
