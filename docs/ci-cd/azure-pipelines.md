---
sidebar_position: 4
---

# Azure Pipelines

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

`microfrontendSlug` is substituted with your slug at scaffold time.

## Two stages, deliberately

Unlike the GitHub workflow, this pipeline separates build from publish:

- **Build** runs on branch pushes *and* tags. Every commit to `main` is verified.
- **Deploy** runs only when the trigger was a **tag**, thanks to the `condition` on
  `refs/tags/`.

So branch pushes give you CI feedback without publishing anything, and a tag publishes. The version
is derived from the tag name by stripping `refs/tags/`.

## The variable group

The publish task reads `$(MICROFRONTEND_ORCHESTRATOR_API_KEY)` from a variable group named
**`MFE_ORCHESTRATOR_SECRETS`**, which MFE Orchestrator creates in your Azure DevOps project along
with a `MANAGER` API key valid for one year.

The group is created at **project** scope, so several microfrontend repositories in the same Azure
DevOps project share it.

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
| `apiKey` | An MFE Orchestrator [API key](./api-keys.md) with the `MANAGER` role |
| `microfrontendSlug` | The slug of the microfrontend to publish to |
| `filePath` | The directory containing the build output |
| `version` | The version to publish |

:::info If the task is not available
Install the extension from the Visual Studio Marketplace into your organization. If your
organization does not permit third-party extensions, replace the task with a script step calling the
[upload endpoint](./manual-upload.md) directly — it does the same thing:

```yaml
- script: |
    cd $(System.ArtifactsDirectory)/app
    zip -qr $(Build.ArtifactStagingDirectory)/dist.zip .
    curl --fail --show-error --silent -X POST \
      -H "api-key: $(MICROFRONTEND_ORCHESTRATOR_API_KEY)" \
      -F "file=@$(Build.ArtifactStagingDirectory)/dist.zip" \
      "https://console.mfe-orchestrator.dev/api/microfrontends/by-slug/catalog/upload/$(VERSION)"
  displayName: '🚀 Upload to MFE Orchestrator'
```
:::

## Publishing a version

Tag and push:

```bash
git tag 1.4.0
git push origin 1.4.0
```

Or use the **Build** action on the microfrontend card in the console, which creates the tag for you.

## Adding this to an existing repository

1. Create an [API key](./api-keys.md) with the `MANAGER` role.
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

The key is missing from the group, misnamed, or expired. Check **Settings → API Keys** in the
console.

**Wrong version published**

`VERSION` comes from the tag name. A tag like `v1.4.0` publishes a version literally called
`v1.4.0` — consistent, but make sure it matches what you select in the console.
