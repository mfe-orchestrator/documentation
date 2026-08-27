---
sidebar_position: 4
title: Deploy with Azure Pipelines
sidebar_label: Azure Pipelines
description: The azure-pipelines.yml MFE Orchestrator commits when it scaffolds an Azure DevOps repository, the variable group it creates, and how to add a pipeline by hand.
keywords: [azure pipelines, azure devops, ci cd, variable group, deploy key]
---

# Deploy with Azure Pipelines

When MFE Orchestrator creates a repository from a template in Azure DevOps, it commits an
`azure-pipelines.yml`, creates the pipeline definition, and stores the deploy key in a variable
group.

## The generated pipeline

```yaml
trigger:
  branches:
    include:
      - main
      - develop
      - development
  tags:
    include:
      - '*'

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    displayName: '🏗️ Build'
    jobs:
      - job: BuildJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '24.x'

          - script: npm install -g pnpm
            displayName: '📦 Install pnpm'

          - script: pnpm i
            displayName: '📥 Install dependencies'

          - script: pnpm build
            displayName: '🔨 Build project'

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: 'dist'
              ArtifactName: 'app'
              publishLocation: 'Container'

  - stage: Deploy
    displayName: '🚀 Deploy'
    dependsOn: Build
    condition: and(succeeded(), startsWith(variables['Build.SourceBranch'], 'refs/tags/'))
    variables:
      - group: MFE_ORCHESTRATOR_SECRETS
      - name: VERSION
        value: $[replace(variables['Build.SourceBranch'], 'refs/tags/', '')]
    jobs:
      - job: Deploy
        steps:
          - task: DownloadBuildArtifacts@1
            inputs:
              buildType: 'current'
              downloadType: 'single'
              artifactName: 'app'
              downloadPath: '$(System.ArtifactsDirectory)'

          - task: mfe-orchestrator-upload@1
            inputs:
              apiKey: '$(MICROFRONTEND_ORCHESTRATOR_API_KEY)'
              microfrontendSlug: 'catalog'
              filePath: '$(System.ArtifactsDirectory)/app'
              version: '$(VERSION)'
```

:::caution You have to fill `microfrontendSlug` in yourself
The Azure DevOps scaffolder copies the pipeline in without substituting anything: placeholder
replacement is present in the code but commented out for this path. The committed
`azure-pipelines.yml` therefore keeps the literal `%microfrontendSlug%` — and `%domain%` if the
template it came from names one — and the first tagged run fails on it.

Before your first release, edit the file and replace `%microfrontendSlug%` with the slug of the
microfrontend as it appears in the console. Only the GitHub workflow is substituted for you.
:::

## Two stages, deliberately

Unlike the GitHub workflow, this pipeline separates build from publish:

- **Build** runs on branch pushes *and* tags. Every commit to `main` is verified.
- **Deploy** runs only when the trigger was a **tag**, thanks to the `condition` on
  `refs/tags/`.

So branch pushes give you CI feedback without publishing anything, and a tag publishes. The version
is derived from the tag name by stripping `refs/tags/`.

## The variable group

The publish task reads `$(MICROFRONTEND_ORCHESTRATOR_API_KEY)` from a variable group named
**`MFE_ORCHESTRATOR_SECRETS`**. MFE Orchestrator creates the group and the key when you connect the
Azure DevOps repository to a project — or edit that connection — not when a microfrontend is
scaffolded, and it skips the work when the variable already exists.

The group is created at **project** scope, so several microfrontend repositories in the same Azure
DevOps project share it. That also means the connection must have a project selected: without an
organization and a project id the injector returns without creating anything.

:::note The key is dated 15 days out, and keeps working anyway
The generated key's expiry is computed as 365 *hours*, not a year, so **Settings → API Keys** badges
it **Expired** about two weeks after you connect the repository. The key keeps authenticating —
the expiry date is recorded and never enforced, see
[expiry is recorded, not enforced](./api-keys.md#expiry-is-recorded-not-enforced).
:::

:::caution Pipeline authorization
A newly created variable group may need to be authorized for the pipeline the first time it runs.
If the Deploy stage fails with a permissions error on the variable group, open
**Pipelines → Library → MFE_ORCHESTRATOR_SECRETS → Pipeline permissions** and grant access.
:::

## The publish task

`mfe-orchestrator-upload@1` is an Azure DevOps extension and must be installed in your organization
before a pipeline can use it.

| Input | Meaning |
| --- | --- |
| `apiKey` | An MFE Orchestrator [API key](./api-keys.md) |
| `microfrontendSlug` | The slug of the microfrontend to publish to |
| `filePath` | The directory containing the build output |
| `version` | The version to publish |

The generated pipeline passes exactly these four, and no domain: it publishes to the extension's
default installation. To publish somewhere else, add a `MICROFRONTEND_ORCHESTRATOR_DOMAIN` variable
to the `MFE_ORCHESTRATOR_SECRETS` group and pass it to the task as an additional `domain` input.

:::info If the task is not available
Install the extension from the Visual Studio Marketplace into your organization. If your
organization does not permit third-party extensions, replace the task with a script step calling the
[upload endpoint](./manual-upload.md) directly — it does the same thing:

The `curl` needs a base URL, which the generated pipeline does not carry, so declare it in the
`Deploy` stage's `variables` block — or add it to the `MFE_ORCHESTRATOR_SECRETS` group — before using
the step below:

```yaml
- script: |
    cd $(System.ArtifactsDirectory)/app
    zip -qr $(Build.ArtifactStagingDirectory)/dist.zip .
    curl --fail --show-error --silent -X POST \
      -H "api-key: $(MICROFRONTEND_ORCHESTRATOR_API_KEY)" \
      -F "file=@$(Build.ArtifactStagingDirectory)/dist.zip" \
      "$(MICROFRONTEND_ORCHESTRATOR_DOMAIN)/api/microfrontends/by-slug/catalog/upload/$(VERSION)"
  displayName: '🚀 Upload to MFE Orchestrator'
```

`--fail` is not optional: without it `curl` exits 0 on a rejected upload and the stage passes.
:::

## Publishing a version

Tag and push:

```bash
git tag 1.4.0
git push origin 1.4.0
```

Or use the **Build** action on the microfrontend card in the console, which creates the tag for you.

## Adding this to an existing repository

1. Create an [API key](./api-keys.md).
2. Create a variable group named `MFE_ORCHESTRATOR_SECRETS`
   (**Pipelines → Library → Variable group**) with a secret variable
   `MICROFRONTEND_ORCHESTRATOR_API_KEY`.
3. Commit the pipeline above as `azure-pipelines.yml`, with your slug.
4. Create the pipeline definition pointing at that file.
5. Authorize the variable group for the pipeline.

Variants for other compilers and host types are in
[`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines) under
`<type>/<compiler>/azure_dev_ops/`.

## Troubleshooting

**Deploy stage skipped**

Expected on a branch push — it runs only for tags. Check `Build.SourceBranch` starts with
`refs/tags/`.

**Variable group not found or not authorized**

The group must exist in the same project and be authorized for the pipeline. See the caution above.

**Task `mfe-orchestrator-upload` not found**

The extension is not installed in the organization. Install it, or use the `curl` fallback.

**Authentication failure on publish**

The key is missing from the group, misnamed, or names a key that has been deleted. Check
**Settings → API Keys** in the console — an **Expired** badge is not the cause, since expired keys
still authenticate. If the connection has no Azure DevOps project selected, the group was never
created at all.

**Wrong version published**

`VERSION` comes from the tag name. A tag like `v1.4.0` publishes a version literally called
`v1.4.0` — consistent, but make sure it matches what you select in the console.
