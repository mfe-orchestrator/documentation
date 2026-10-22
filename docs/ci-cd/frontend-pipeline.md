---
sidebar_position: 6
title: Pipeline for a Frontend
sidebar_label: Frontend pipeline
description: Build and push the Docker image of the main frontend, then register its version in MFE Orchestrator with a MANAGER API key.
keywords: [frontend, docker, image, pipeline, register version, api key, ci cd]
---

# Pipeline for a Frontend

A microfrontend publishes a **bundle**. A [Frontend](../microfrontends/main-frontend.md), the main
frontend of the project served by its own container, publishes a **Docker image**. Its pipeline does
three things on a tag: builds the image, pushes it to your registry, and tells MFE Orchestrator which
image is the new version.

The pipelines of the [templates](../templates/templates-library.md) upload a bundle, which a Frontend
does not accept: a bundle upload to it is refused with `FRONTEND_UPLOAD_NOT_ALLOWED`. Write the
pipeline below, or keep it in your [own pipeline templates](./pipeline-templates.md).

## The registration call

```http
POST <API_BASE>/microfrontends/by-slug/{slug}/versions/{version}
```

| | |
| --- | --- |
| **Authentication** | `api-key` header, an [API key](./api-keys.md) with the `MANAGER` role |
| **Body** | JSON: `image` (required), `digest` and `commitSha` (optional) |
| **Project** | Derived from the API key |

```bash
curl --fail --show-error --silent -X POST \
  -H "api-key: ${MFE_ORCHESTRATOR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"image": "ghcr.io/acme/shell:1.4.0", "digest": "sha256:…", "commitSha": "…"}' \
  "https://console.mfe-orchestrator.dev/api/microfrontends/by-slug/shell/versions/1.4.0"
```

- Registering the same version again replaces what was stored for it, so a rerun is safe.
- The Frontend moves to the version only when it is newer than the one it has. Versions that are not
  semver are registered but never move it.
- The first registration also sets the **Image repository** of the Frontend, the image reference
  without tag or digest, when it is still empty.
- Registering a version of a microfrontend is refused, and so is a key that is not `MANAGER`
  (`MICROFRONTEND_VERSION_FORBIDDEN`, 403). A revoked or expired key is refused too.

## GitHub Actions

```yaml
name: Build and register

on:
  push:
    tags:
      - '*'

permissions:
  contents: read
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: build
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.ref_name }}

      - name: Register the version in MFE Orchestrator
        env:
          MFE_API_KEY: ${{ secrets.MICROFRONTEND_ORCHESTRATOR_API_KEY }}
          MFE_DOMAIN: ${{ vars.MICROFRONTEND_ORCHESTRATOR_DOMAIN || 'https://console.mfe-orchestrator.dev' }}
          MFE_IMAGE: ghcr.io/${{ github.repository }}:${{ github.ref_name }}
          MFE_DIGEST: ${{ steps.build.outputs.digest }}
          MFE_VERSION: ${{ github.ref_name }}
        run: |
          curl --fail-with-body --show-error --silent -X POST \
            -H "api-key: ${MFE_API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"image\":\"${MFE_IMAGE}\",\"digest\":\"${MFE_DIGEST}\",\"commitSha\":\"${GITHUB_SHA}\"}" \
            "${MFE_DOMAIN%/}/api/microfrontends/by-slug/shell/versions/${MFE_VERSION}"
```

Replace `shell` with the slug of your Frontend. The values reach the script through `env`, not pasted
into it, so a tag name cannot inject shell.

## GitLab CI and Azure Pipelines

The registration is the same `curl`, after your own build and push:

- **GitLab CI**: run it in a job on tags, with `MICROFRONTEND_ORCHESTRATOR_API_KEY` as a CI/CD
  variable and `CI_COMMIT_TAG` as the version.
- **Azure Pipelines**: run it in a script step of a stage that depends on the build, with the key from
  the `MFE_ORCHESTRATOR_SECRETS` variable group and the tag name as the version.

The secret and its scope are created for you when you connect the repository, as described in
[GitLab CI](./gitlab-ci.md#the-cicd-variable) and
[Azure Pipelines](./azure-pipelines.md#the-variable-group).

## What you see in the console

The versions registered appear in the edit form of the Frontend with their image, digest and commit,
and the **Version** field shows the newest one, read-only. Nothing is deployed by MFE Orchestrator:
your infrastructure runs the image.
