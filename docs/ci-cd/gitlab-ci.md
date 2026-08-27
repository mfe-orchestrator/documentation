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

:::caution Host repositories stop at build
Microfrontend repositories get the `deploy` stage below already committed. Host repositories do not
— like their GitHub and Azure DevOps counterparts they build and containerise, but do not publish
themselves to MFE Orchestrator. Add the job below if you want a host published as a remote too.
:::

## The publish job

A `deploy` stage uploads the built `dist/` on tags:

```yaml
stages:
  - install
  - lint
  - test
  - build
  - deploy

deploy:
  stage: deploy
  image: alpine:latest
  dependencies:
    - build
  variables:
    MICROFRONTEND_SLUG: "catalog"
    MICROFRONTEND_ORCHESTRATOR_DOMAIN: "https://console.mfe-orchestrator.dev"
  before_script:
    - apk add --no-cache curl zip
  script:
    - cd dist && zip -qr ../dist.zip . && cd ..
    - |
      curl --fail --show-error --silent -X POST \
        -H "api-key: ${MICROFRONTEND_ORCHESTRATOR_API_KEY}" \
        -F "file=@dist.zip" \
        "${MICROFRONTEND_ORCHESTRATOR_DOMAIN%/}/api/microfrontends/by-slug/${MICROFRONTEND_SLUG}/upload/${CI_COMMIT_TAG}"
    - echo "published ${MICROFRONTEND_SLUG} ${CI_COMMIT_TAG}"
  only:
    - tags
```

:::caution You have to fill these two in yourself
Unlike the GitHub path, the GitLab scaffolder copies the pipeline in without substituting anything:
placeholder replacement is present in the code but commented out for GitLab. The committed
`.gitlab-ci.yml` therefore keeps the literal `%microfrontendSlug%` and `%domain%`, and the first
tagged pipeline fails on them.

Before your first release, edit the file and replace them:

| Placeholder | Replace with |
| --- | --- |
| `%microfrontendSlug%` | The slug of the microfrontend, as it appears in the console |
| `%domain%` | The API base URL of your installation, e.g. `https://console.example.com` |
:::

Both are plain job variables, so a **project** CI/CD variable of the same name wins over them: once
the YAML is correct you can set `MICROFRONTEND_ORCHESTRATOR_DOMAIN` in the project settings to publish
somewhere else without touching the file again.

Points worth noting:

- `only: tags` keeps publishing tied to tags, which is what makes the console's **Build** action work
  — see [Versions and builds](../microfrontends/versions-and-builds.md).
- `CI_COMMIT_TAG` is the version. It is only set on tag pipelines, which is another reason for
  `only: tags`.
- `--fail` on `curl` is essential: without it the job passes even when the upload is rejected.
- The `zip` is created from **inside** `dist`, so the archive has no directory prefix. See
  [Uploading a build](./manual-upload.md) for why this matters.

## The CI/CD variable

The job reads `MICROFRONTEND_ORCHESTRATOR_API_KEY`. It is created as a **group-level** CI/CD variable
when you connect the GitLab repository to a project — or edit that connection — not when a
microfrontend is scaffolded, and it is skipped if a variable of that name already exists in the group.

Group scope means every microfrontend repository in that GitLab group can publish without further
setup. It also means the connection must have a group selected: without a group id the injector
returns without creating anything.

:::note The key is dated 15 days out, and keeps working anyway
The generated key's expiry is computed as 365 *hours*, not a year, so **Settings → API Keys** badges
it **Expired** about two weeks after you connect the repository. The key keeps authenticating —
the expiry date is recorded and never enforced, see
[expiry is recorded, not enforced](./api-keys.md#expiry-is-recorded-not-enforced).
:::

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

1. Create an [API key](./api-keys.md).
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

**The upload URL contains `%domain%`, or the slug is `%microfrontendSlug%`**

The scaffolded pipeline was committed with the placeholders unsubstituted. Replace them as described
[above](#the-publish-job).

**`api-key` empty / authentication failure**

Either the variable is not defined at a scope the project can see, or it is **Protected** and the tag
is not. Check both, and confirm the key still exists in **Settings → API Keys** — an **Expired**
badge is not the cause, since expired keys still authenticate. Only a deleted key stops working.

**`dist/` missing in the deploy job**

The `dependencies: [build]` declaration is what carries the artifact across stages. Also check the
`build` job's `expire_in` has not lapsed for a re-run of an old pipeline.

**Upload succeeds, app 404s**

The **Entry Point** on the microfrontend does not match the build output. Vite Module Federation
emits `assets/remoteEntry.js`.

**Upload succeeds, users see the old version**

Publishing is not deploying — [deploy the environment](../deployments/overview.md).
