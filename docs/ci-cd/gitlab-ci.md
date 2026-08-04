---
sidebar_position: 5
title: Deploy with GitLab CI
sidebar_label: GitLab CI
description: The .gitlab-ci.yml MFE Orchestrator commits when it scaffolds a GitLab repository, the group-level CI/CD variable it creates, and how to add a pipeline by hand.
keywords: [gitlab ci, pipeline, ci cd, ci variables, deploy]
---

# Deploy with GitLab CI

When MFE Orchestrator creates a repository from a template in GitLab, it commits a `.gitlab-ci.yml`
and creates a group-level CI/CD variable holding the deploy key.

## The generated pipeline

The scaffolded `.gitlab-ci.yml` covers install, test and build:

```yaml
stages:
  - install
  - lint
  - test
  - build

variables:
  PNPM_VERSION: "9.15.0"
  NODE_VERSION: "20"

.pnpm_cache:
  cache:
    key:
      files:
        - pnpm-lock.yaml
    paths:
      - .pnpm-store
  before_script:
    - corepack enable
    - corepack prepare pnpm@${PNPM_VERSION} --activate
    - pnpm config set store-dir .pnpm-store
    - pnpm install --frozen-lockfile

install:
  stage: install
  image: node:${NODE_VERSION}
  extends: .pnpm_cache
  script:
    - echo "Dependencies installed"
  artifacts:
    paths:
      - node_modules/
      - .pnpm-store
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  extends: .pnpm_cache
  dependencies:
    - install
  script:
    - pnpm run test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    when: always
    reports:
      junit:
        - coverage/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  allow_failure: false

build:
  stage: build
  image: node:${NODE_VERSION}
  extends: .pnpm_cache
  dependencies:
    - install
  script:
    - pnpm run build
  artifacts:
    paths:
      - dist/
    expire_in: 7 days
  only:
    - main
    - develop
    - tags
```

:::caution Add the publish step yourself
Unlike the GitHub and Azure DevOps templates, the generated GitLab pipeline stops at **build** — it
produces `dist/` as an artifact but does not publish it to MFE Orchestrator. Add the deploy job
below to complete it.
:::

## Adding the publish job

Append a `deploy` stage that uploads the built `dist/` on tags:

```yaml
stages:
  - install
  - lint
  - test
  - build
  - deploy          # ← add

deploy:
  stage: deploy
  image: alpine:latest
  dependencies:
    - build
  variables:
    MFE_SLUG: "catalog"
    API_BASE: "https://console.mfe-orchestrator.dev/api"
  before_script:
    - apk add --no-cache curl zip
  script:
    - cd dist && zip -qr ../dist.zip . && cd ..
    - |
      curl --fail --show-error --silent -X POST \
        -H "api-key: ${MICROFRONTEND_ORCHESTRATOR_API_KEY}" \
        -F "file=@dist.zip" \
        "${API_BASE}/microfrontends/by-slug/${MFE_SLUG}/upload/${CI_COMMIT_TAG}"
    - echo "published ${MFE_SLUG} ${CI_COMMIT_TAG}"
  only:
    - tags
```

Points worth noting:

- `only: tags` keeps publishing tied to tags, which is what makes the console's **Build** action work
  — see [Versions and builds](../microfrontends/versions-and-builds.md).
- `CI_COMMIT_TAG` is the version. It is only set on tag pipelines, which is another reason for
  `only: tags`.
- `--fail` on `curl` is essential: without it the job passes even when the upload is rejected.
- The `zip` is created from **inside** `dist`, so the archive has no directory prefix. See
  [Uploading a build](./manual-upload.md) for why this matters.

## The CI/CD variable

The job reads `MICROFRONTEND_ORCHESTRATOR_API_KEY`. For repositories MFE Orchestrator created, this
already exists as a **group-level** CI/CD variable — created as a `MANAGER` key valid for one year.

Group scope means every microfrontend repository in that GitLab group can publish without further
setup.

:::caution Protected variables and tags
If you mark the variable as **Protected**, it is only exposed to pipelines on protected branches and
tags. Since publishing happens on tags, protect your release tag pattern
(**Settings → Repository → Protected tags**) or the variable will be empty in the deploy job.
:::

## Publishing a version

```bash
git tag 1.4.0
git push origin 1.4.0
```

Or use the **Build** action on the microfrontend card in the console, which creates the tag for you.

## Adding this to an existing repository

1. Create an [API key](./api-keys.md) with the `MANAGER` role.
2. Add it as a CI/CD variable named `MICROFRONTEND_ORCHESTRATOR_API_KEY`, at group or project level
   (**Settings → CI/CD → Variables**). Mark it **Masked**.
3. Add the `deploy` job above to your `.gitlab-ci.yml`, with your slug and API base URL.
4. If the variable is protected, protect your tag pattern too.

Base pipelines for other compilers and host types are in
[`template-pipelines`](https://github.com/mfe-orchestrator/template-pipelines) under
`<type>/<compiler>/gitlab/`.

## Troubleshooting

**Deploy job does not run**

`only: tags` means branch pushes skip it. Confirm you pushed a tag.

**`api-key` empty / authentication failure**

Either the variable is not defined at a scope the project can see, or it is **Protected** and the tag
is not. Check both, and confirm the key has not expired in **Settings → API Keys**.

**`dist/` missing in the deploy job**

The `dependencies: [build]` declaration is what carries the artifact across stages. Also check the
`build` job's `expire_in` has not lapsed for a re-run of an old pipeline.

**Upload succeeds, app 404s**

The **Entry Point** on the microfrontend does not match the build output. Vite Module Federation
emits `assets/remoteEntry.js`.

**Upload succeeds, users see the old version**

Publishing is not deploying — [deploy the environment](../deployments/overview.md).
