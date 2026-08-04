---
sidebar_position: 3
title: Deploy with GitHub Actions
sidebar_label: GitHub Actions
description: The build-and-deploy workflow MFE Orchestrator commits when it scaffolds a GitHub repository, the secret it creates, and how to add one by hand.
keywords: [github actions, workflow, ci cd, secrets, deploy]
---

# Deploy with GitHub Actions

When MFE Orchestrator creates a repository from a template on GitHub, it commits a
`.github/workflows/build-and-deploy.yml` workflow and creates the secret the workflow needs. This
page explains that workflow, and how to add one to a repository the platform did not create.

## The generated workflow

```yaml
name: 🚀 Build and deploy

on:
  push:
    tags:
      - '*'
  workflow_dispatch:
    inputs:
      version:
        required: true
        type: string
        description: 'Version to release'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: 🔄 Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 10

    - name: ⚙️ Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '23.11.1'
        cache: 'pnpm'
        cache-dependency-path: '**/pnpm-lock.yaml'

    - name: 🔧 Install Dependencies
      run: pnpm install

    - name: 🏗️ Build
      run: pnpm build

    - name: 🚀 Publish to MFE Orchestrator
      uses: mfe-orchestrator-hub/github-action@0.0.29
      with:
        apikey: ${{ secrets.MICROFRONTEND_ORCHESTRATOR_API_KEY }}
        microfrontend-slug: catalog
        domain: https://console.mfe-orchestrator.dev
        file-path: './dist'
        version: ${{ inputs.version || github.ref_name }}
```

The `microfrontend-slug` and `domain` values are substituted for you at scaffold time — the slug you
chose, and the API base URL of the installation you created it from.

## Two ways to trigger it

**Push a tag.** The version is the tag name:

```bash
git tag 1.4.0
git push origin 1.4.0
```

**Run it manually.** From the Actions tab, or from the console's **Build** action on the
microfrontend card, which creates the tag for you — see
[Versions and builds](../microfrontends/versions-and-builds.md).

Tag-driven versioning is what makes the console's **Build** button work, so keep the tag trigger even
if you add others.

## The publish action

| Input | Meaning |
| --- | --- |
| `apikey` | An MFE Orchestrator [API key](./api-keys.md) with the `MANAGER` role |
| `microfrontend-slug` | The slug of the microfrontend to publish to |
| `domain` | Base URL of your MFE Orchestrator installation |
| `file-path` | The build output directory, e.g. `./dist` |
| `version` | The version to publish |

The action zips `file-path` and calls the [upload endpoint](./manual-upload.md). Point it at the
directory, not at a zip you made yourself.

## The secret

The workflow reads `secrets.MICROFRONTEND_ORCHESTRATOR_API_KEY`. For repositories MFE Orchestrator
created, this already exists — created as a `MANAGER` key valid for one year and written to your
GitHub organization or repository.

:::caution The key expires after a year
When it does, builds succeed and the publish step fails. Create a new
[API key](./api-keys.md) and update the secret. Worth a calendar reminder at scaffold time.
:::

## Adding this to an existing repository

For a repository MFE Orchestrator did not create:

1. Create an [API key](./api-keys.md) with the `MANAGER` role.
2. Add it as a repository secret named `MICROFRONTEND_ORCHESTRATOR_API_KEY`
   (**Settings → Secrets and variables → Actions**).
3. Copy the workflow above into `.github/workflows/build-and-deploy.yml`, replacing
   `microfrontend-slug` and `domain` with your values.
4. Adjust the package manager and build command if you do not use pnpm.

Ready-made variants for other compilers and host types are in
[`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines), under
`<type>/<compiler>/github/`.

## Adapting it

**npm or yarn instead of pnpm** — replace the pnpm setup and `pnpm install` / `pnpm build` with
`npm ci` / `npm run build`, and set `cache: 'npm'`.

**A monorepo** — build only the package that changed and point `file-path` at that package's output,
e.g. `./packages/catalog/dist`. Publishing several microfrontends from one repository means one
publish step per microfrontend, each with its own slug.

**Tests before publishing** — add the step between build and publish. A failing test then stops the
release, which is the behaviour you want.

**Deploying automatically** — for a development environment, add a step calling
`POST <API_BASE>/deployment` with the environment id after publishing. For production, leave the
deployment manual; the separation between *published* and *live* is the platform's main safety
property.

## Troubleshooting

**Publish step fails with an authentication error**

The secret is missing, misnamed or the key has expired. Check the exact name
`MICROFRONTEND_ORCHESTRATOR_API_KEY`, and the key's status in **Settings → API Keys**.

**"Entity not found" for the slug**

`microfrontend-slug` does not match a microfrontend in the key's project. Slugs are lowercase; check
for a typo or a stale value after a rename.

**Publishes, but the app still serves the old version**

Publishing is not deploying. Select the version and
[deploy](../deployments/overview.md) the environment.

**Publishes, but requests 404**

Almost always the **Entry Point** on the microfrontend not matching the build output. Vite Module
Federation emits `assets/remoteEntry.js`; Webpack emits `remoteEntry.js`.

**Workflow does not run**

The generated workflow triggers only on tags and manual dispatch. A push to `main` does nothing by
design.
