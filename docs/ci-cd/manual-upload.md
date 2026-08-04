---
sidebar_position: 2
title: Upload a build from any CI system
sidebar_label: Uploading a build
description: The single HTTP endpoint every pipeline reduces to, so you can publish a microfrontend build from any CI system, or from your laptop when debugging.
keywords: [upload build, rest api, api key, publish version, ci cd]
---

# Upload a build from any CI system

Everything the provider-specific pipelines do reduces to one HTTP call. This page documents it, so
you can publish from any CI system — or from your laptop when debugging.

## The endpoint

```http
POST <API_BASE>/microfrontends/by-slug/{microfrontendSlug}/upload/{version}
```

| | |
| --- | --- |
| **Authentication** | `api-key` header (see [API keys](./api-keys.md)) |
| **Body** | `multipart/form-data` with a single ZIP file |
| **Project** | Derived from the API key — no `project-id` header needed |

## Minimal example

```bash
cd dist
zip -r ../dist.zip .
cd ..

curl -X POST \
  -H "api-key: $MFE_ORCHESTRATOR_API_KEY" \
  -F "file=@dist.zip" \
  "https://console.mfe-orchestrator.dev/api/microfrontends/by-slug/catalog/upload/1.4.0"
```

## Zipping correctly

This is where most first attempts go wrong. The archive must contain the **contents** of your build
output, not the folder itself:

```
✅ dist.zip
   ├── index.html
   └── assets/
       └── remoteEntry.js

❌ dist.zip
   └── dist/
       ├── index.html
       └── assets/
           └── remoteEntry.js
```

The second produces an entry point at `dist/assets/remoteEntry.js`, which does not match the
configured entry point, and every request 404s.

```bash
# ✅ zip from inside the output directory
cd dist && zip -r ../dist.zip . && cd ..

# ❌ zips the directory itself
zip -r dist.zip dist
```

Verify before uploading:

```bash
unzip -l dist.zip | head
```

The first entries should be your files, not a directory prefix.

## Requirements and behaviour

- The file must be a **ZIP** — the request is rejected on both MIME type and `.zip` extension.
- The microfrontend must already exist in the project, matched by **slug**.
- The archive is extracted into the version's folder, wherever that microfrontend is
  [hosted](../microfrontends/hosting-options.md) — the platform's own storage or your bucket.
- Uploading a version that already exists overwrites its files in place.
- **Custom URL** microfrontends cannot be uploaded to; the request fails. Publishing is entirely
  yours in that case.

:::caution Overwriting a deployed version
Re-uploading a version that some environment is currently serving changes what those users get,
without any deployment. Publish a new version instead — versions are cheap, and it keeps rollback
meaningful.
:::

## Publishing does not deploy

After a successful upload the version exists and is selectable, but nothing changes for your users.
Select the version on the microfrontend and [deploy](../deployments/overview.md) the environment.

Automating that step is possible — `POST /deployment` with a list of environment ids — and is a
reasonable thing to do for a development environment. For production, the manual step is the point.

## A generic pipeline step

For a CI system with no dedicated integration:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${MFE_ORCHESTRATOR_API_KEY:?missing API key}"
: "${VERSION:?missing version}"

SLUG="catalog"
API_BASE="https://console.mfe-orchestrator.dev/api"

npm ci
npm run build

( cd dist && zip -qr ../dist.zip . )

curl --fail --show-error --silent \
  -X POST \
  -H "api-key: ${MFE_ORCHESTRATOR_API_KEY}" \
  -F "file=@dist.zip" \
  "${API_BASE}/microfrontends/by-slug/${SLUG}/upload/${VERSION}"

echo "published ${SLUG} ${VERSION}"
```

`--fail` matters: without it `curl` exits 0 on an HTTP error and your pipeline reports a green build
that published nothing.

Deriving `VERSION` from the Git tag keeps the version and the source in step:

```bash
VERSION="${GITHUB_REF_NAME}"      # GitHub Actions
VERSION="${CI_COMMIT_TAG}"        # GitLab CI
VERSION="${BUILD_SOURCEBRANCHNAME}"  # Azure DevOps
```

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `401` / authentication error | Missing, wrong, revoked or **expired** `api-key` |
| `File must be a ZIP archive` | Wrong MIME type or extension — send a real `.zip` |
| Entity not found for the slug | No microfrontend with that slug in the key's project |
| `Microfrontend host type is not supported` | The microfrontend is **Custom URL** |
| Upload succeeds, app 404s | Entry point mismatch, or the ZIP has a directory prefix |
| Upload succeeds, users see the old version | You have not deployed |

For the entry point: Vite Module Federation emits `assets/remoteEntry.js`, Webpack emits
`remoteEntry.js`. The **Entry Point** field on the microfrontend must match what your build actually
produces.
