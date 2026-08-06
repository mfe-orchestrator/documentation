# Graph Report - .  (2026-08-06)

## Corpus Check
- 115 files · ~400,456 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 575 nodes · 706 edges · 59 communities (53 shown, 6 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.82)
- Token cost: 1,563,656 input · 24,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Canary Releases & Product Concepts|Canary Releases & Product Concepts]]
- [[_COMMUNITY_Deployments, Storage & CICD Docs|Deployments, Storage & CI/CD Docs]]
- [[_COMMUNITY_Docusaurus Package Config|Docusaurus Package Config]]
- [[_COMMUNITY_Docs Landing Page Components|Docs Landing Page Components]]
- [[_COMMUNITY_Microfrontends Diagram View|Microfrontends Diagram View]]
- [[_COMMUNITY_Templates Library Screen|Templates Library Screen]]
- [[_COMMUNITY_Frontend Integration Tabs|Frontend Integration Tabs]]
- [[_COMMUNITY_Microfrontends Table View|Microfrontends Table View]]
- [[_COMMUNITY_Project Settings Screen|Project Settings Screen]]
- [[_COMMUNITY_Docusaurus Config & llms.txt Plugin|Docusaurus Config & llms.txt Plugin]]
- [[_COMMUNITY_Environment Creation Dialog|Environment Creation Dialog]]
- [[_COMMUNITY_Edit Microfrontend Form|Edit Microfrontend Form]]
- [[_COMMUNITY_Microfrontend Version Select|Microfrontend Version Select]]
- [[_COMMUNITY_Microfrontends Grid View|Microfrontends Grid View]]
- [[_COMMUNITY_Deployments History Screen|Deployments History Screen]]
- [[_COMMUNITY_Deployments Overview Screen|Deployments Overview Screen]]
- [[_COMMUNITY_Add Repository Provider Modal|Add Repository Provider Modal]]
- [[_COMMUNITY_Environments List Screen|Environments List Screen]]
- [[_COMMUNITY_CURL Integration Tab|CURL Integration Tab]]
- [[_COMMUNITY_Environment Variables Integration|Environment Variables Integration]]
- [[_COMMUNITY_Vite Integration Tab|Vite Integration Tab]]
- [[_COMMUNITY_Webpack Integration Tab|Webpack Integration Tab]]
- [[_COMMUNITY_AWS S3 Storage Form|AWS S3 Storage Form]]
- [[_COMMUNITY_Azure Storage Auth Types|Azure Storage Auth Types]]
- [[_COMMUNITY_Storage Provider Selection|Storage Provider Selection]]
- [[_COMMUNITY_Add Microfrontend Empty State|Add Microfrontend Empty State]]
- [[_COMMUNITY_Code Repositories Empty State|Code Repositories Empty State]]
- [[_COMMUNITY_Console Registration Screen|Console Registration Screen]]
- [[_COMMUNITY_New Microfrontend Form|New Microfrontend Form]]
- [[_COMMUNITY_Hosting Type Selector|Hosting Type Selector]]
- [[_COMMUNITY_Azure DevOps Repository Form|Azure DevOps Repository Form]]
- [[_COMMUNITY_Azure Blob Storage Form|Azure Blob Storage Form]]
- [[_COMMUNITY_Storages Empty State|Storages Empty State]]
- [[_COMMUNITY_Team Members Screen|Team Members Screen]]
- [[_COMMUNITY_API Key Creation Dialog|API Key Creation Dialog]]
- [[_COMMUNITY_API Keys Empty State|API Keys Empty State]]
- [[_COMMUNITY_Console Login Screen|Console Login Screen]]
- [[_COMMUNITY_Environment Variables List|Environment Variables List]]
- [[_COMMUNITY_Invite User Dialog|Invite User Dialog]]
- [[_COMMUNITY_Project Switcher Modal|Project Switcher Modal]]
- [[_COMMUNITY_GitLab Repository Form|GitLab Repository Form]]
- [[_COMMUNITY_New Storage Dialog|New Storage Dialog]]
- [[_COMMUNITY_Canary Users Placeholder|Canary Users Placeholder]]
- [[_COMMUNITY_Environment Variable Dialog|Environment Variable Dialog]]
- [[_COMMUNITY_Google Cloud Storage Form|Google Cloud Storage Form]]
- [[_COMMUNITY_Canary Settings Panel|Canary Settings Panel]]
- [[_COMMUNITY_Social Card Branding|Social Card Branding]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_single-spa Logo|single-spa Logo]]
- [[_COMMUNITY_Vite Marketplace Logo|Vite Marketplace Logo]]
- [[_COMMUNITY_Web Components Marketplace Logo|Web Components Marketplace Logo]]
- [[_COMMUNITY_Webpack Marketplace Logo|Webpack Marketplace Logo]]
- [[_COMMUNITY_Category Index Page Wrapper|Category Index Page Wrapper]]
- [[_COMMUNITY_Layout Wrapper Component|Layout Wrapper Component]]
- [[_COMMUNITY_MFE Orchestrator Logo|MFE Orchestrator Logo]]
- [[_COMMUNITY_Sidebar Configuration|Sidebar Configuration]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_Web Components Logo Asset|Web Components Logo Asset]]
- [[_COMMUNITY_Webpack Logo Asset|Webpack Logo Asset]]

## God Nodes (most connected - your core abstractions)
1. `Deployment snapshot` - 13 edges
2. `scripts` - 12 edges
3. `API Key` - 10 edges
4. `Create a Microfrontend (Doc)` - 10 edges
5. `Container Environment Variables Reference (Doc)` - 10 edges
6. `Serve API` - 9 edges
7. `Get Started with MFE Orchestrator (Tutorial)` - 9 edges
8. `Microfrontend Versions and Builds (Doc)` - 9 edges
9. `Templates Library` - 9 edges
10. `Microfrontend Hosting Options (Doc)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Deploy to GitHub Pages workflow` --semantically_similar_to--> `Generated GitHub Actions build-and-deploy workflow`  [INFERRED] [semantically similar]
  .github/workflows/deploy.yml → docs/ci-cd/github-actions.md
- `Documentation Social Card (1200x630 OG Image Source)` --conceptually_related_to--> `Get Started with MFE Orchestrator (Tutorial)`  [INFERRED]
  static/img/social-card.source.html → docs/intro.mdx
- `Docusaurus documentation website` --conceptually_related_to--> `Deploy to GitHub Pages workflow`  [INFERRED]
  README.md → .github/workflows/deploy.yml
- `Environment variables are not a secret store` --semantically_similar_to--> `Serve API`  [INFERRED] [semantically similar]
  docs/environments/environment-variables.md → docs/integration/serve-api.md
- `Documentation Social Card (1200x630 OG Image Source)` --references--> `Module Federation`  [EXTRACTED]
  static/img/social-card.source.html → docs/microfrontends/host-and-remotes.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Supported storage providers for Custom Source hosting** — docs_buckets_overview_storage_bucket, docs_buckets_aws_s3_amazon_s3_storage, docs_buckets_azure_blob_storage_azure_blob_storage, docs_buckets_google_cloud_storage_google_cloud_storage [EXTRACTED 1.00]
- **CI/CD publish flow reducing to the upload endpoint** — docs_ci_cd_github_actions_build_and_deploy_workflow, docs_ci_cd_azure_pipelines_generated_pipeline, docs_ci_cd_gitlab_ci_deploy_job, docs_ci_cd_manual_upload_upload_endpoint, docs_ci_cd_api_keys_api_key [EXTRACTED 1.00]
- **Serving from the active deployment** — docs_deployments_overview_deployment_snapshot, docs_integration_serve_api_serve_api, docs_environments_domains_referer_resolution, docs_environments_environment_variables_runtime_variables, docs_integration_runtime_configuration_window_globalconfig [EXTRACTED 1.00]
- **Repository Provider Connection Guides (GitHub, GitLab, Azure DevOps)** — docs_repositories_connect_github, docs_repositories_connect_gitlab, docs_repositories_connect_azure_dev_ops, docs_repositories_connect_github_oauth, docs_repositories_connect_gitlab_pat, docs_repositories_connect_azure_dev_ops_pat [EXTRACTED 1.00]
- **Self-hosted SSO Provider Configuration (Auth0, Entra ID, Google)** — docs_self_hosting_enable_sso_auth0, docs_self_hosting_enable_sso_azure, docs_self_hosting_enable_sso_google, docs_self_hosting_environment_variables [EXTRACTED 1.00]
- **Microfrontend Hosting Type Options (Hub, Custom Source, Custom URL)** — docs_microfrontends_hosting_options_hosting_type, docs_microfrontends_hosting_options_hub, docs_microfrontends_hosting_options_custom_source, docs_microfrontends_hosting_options_custom_url [EXTRACTED 1.00]
- **Microfrontend creation entry points in the console UI** — docs_assets_add_new_microfrontend_microfrontends_page, docs_assets_add_new_microfrontend_empty_state, docs_assets_add_new_microfrontend_add_new_microfrontend_action [EXTRACTED 1.00]
- **Repository provider choice flow: the Add Repository modal on the Code Repositories page offers GitHub, Azure DevOps, and GitLab as interchangeable provider options** — docs_assets_add_repository_provider_add_repository_modal, docs_assets_add_repository_provider_github_provider, docs_assets_add_repository_provider_azure_devops_provider, docs_assets_add_repository_provider_gitlab_provider [EXTRACTED 1.00]
- **Console layout: sidebar navigation, project scoping header, and API Keys content area compose the MFE Orchestrator console screen** — docs_assets_api_keys_mfe_orchestrator_console, docs_assets_api_keys_sidebar_navigation, docs_assets_api_keys_project_scoping, docs_assets_api_keys_api_keys_page [EXTRACTED 1.00]
- **MFE Orchestrator console UI layout: persistent sidebar navigation and project switcher framing the Canary Users content pane** — docs_assets_canary_users, docs_assets_canary_users_sidebar_navigation, docs_assets_canary_users_project_switcher, docs_assets_canary_users_canary_users_feature [EXTRACTED 1.00]
- **Microfrontend Template Selection Flow** — docs_assets_choose_a_template_templates_library, docs_assets_choose_a_template_template_filters, docs_assets_choose_a_template_create_from_scratch, docs_assets_choose_a_template_vite_remote_template, docs_assets_choose_a_template_vite_host_template, docs_assets_choose_a_template_web_component_remote_template [EXTRACTED 1.00]
- **Console screen layout: sidebar navigation, project switcher header, and page content area compose the Code Repositories screen** — docs_assets_code_repositories_code_repositories_page, docs_assets_code_repositories_sidebar_navigation, docs_assets_code_repositories_project_switcher, docs_assets_code_repositories_mfe_orchestrator_console [EXTRACTED 1.00]
- **Console Authentication Entry Flow** — docs_assets_console_login_login_form, docs_assets_console_login_register_link, docs_assets_console_login_mfe_orchestrator_console [INFERRED 0.85]
- **Console User Registration Flow** — docs_assets_console_register_create_account_form, docs_assets_console_register_email_password_authentication, docs_assets_console_register_password_confirmation, docs_assets_console_register_login_link [EXTRACTED 1.00]
- **Deployment lifecycle: select environment, deploy, record snapshot in history** — docs_assets_deployments_history_environment_selector, docs_assets_deployments_history_deploy_action, docs_assets_deployments_history_active_deployment, docs_assets_deployments_history_history_section [INFERRED 0.85]
- **Deployment Snapshot: a deployment pins microfrontend versions and environment variables per environment** — docs_assets_deployments_overview_active_deployment, docs_assets_deployments_overview_microfrontend_versions, docs_assets_deployments_overview_environment_variables, docs_assets_deployments_overview_environment_selector [EXTRACTED 1.00]
- **Environment creation form fields (name, slug, description, allowed domains, color, production toggle)** — docs_assets_environment_dialog_create_new_environment_dialog, docs_assets_environment_dialog_environment_slug, docs_assets_environment_dialog_allowed_domains, docs_assets_environment_dialog_production_environment_flag, docs_assets_environment_dialog_environment_color_label [EXTRACTED 1.00]
- **Add Variable Flow: define a key once and assign per-environment values before creating** — docs_assets_environment_variable_dialog_add_variable_dialog, docs_assets_environment_variable_dialog_per_environment_values, docs_assets_environment_variable_dialog_environment_variables_page [EXTRACTED 1.00]
- **Environment variable management workflow: variables are defined per project and given distinct values for Development, UAT and Production, with add/edit/delete actions in the console** — docs_assets_environment_variables_list_environment_variables_screen, docs_assets_environment_variables_list_per_environment_values, docs_assets_environment_variables_list_add_variable_action, docs_assets_environment_variables_list_project_scoping [EXTRACTED 1.00]
- **Environment configuration model shown in the environments table** — docs_assets_environments_list_environment_entity, docs_assets_environments_list_production_flag, docs_assets_environments_list_allowed_domains, docs_assets_environments_list_environment_ordering [EXTRACTED 1.00]
- **Microfrontend Creation Flow (template selection, general info, hosting config)** — docs_assets_frontend_fill_information_add_new_microfrontend_form, docs_assets_frontend_fill_information_vite_host_template, docs_assets_frontend_fill_information_general_information_section, docs_assets_frontend_fill_information_hosting_information_section [EXTRACTED 1.00]
- **Runtime module resolution flow: host fetches /api/serve/all for an environment and receives remoteEntry.js URLs plus global variables** — docs_assets_integration_curl_curl_api_access, docs_assets_integration_curl_serve_all_endpoint, docs_assets_integration_curl_serve_payload, docs_assets_integration_curl_remote_entry, docs_assets_integration_curl_global_variables [EXTRACTED 1.00]
- **Environment variable consumption flow: microfrontends access environment variables either via a script tag exposing window.globalConfig or by fetching the global-variables serve endpoint directly** — docs_assets_integration_environment_variables_environment_variables_tab, docs_assets_integration_environment_variables_javascript_integration, docs_assets_integration_environment_variables_direct_api_access, docs_assets_integration_environment_variables_global_variables_serve_endpoint [EXTRACTED 1.00]
- **Alternative frontend integration methods (Vite, Webpack, CURL) offered by the Integration Guide** — docs_assets_integration_frontend_vite_module_federation_setup, docs_assets_integration_frontend_webpack_integration, docs_assets_integration_frontend_curl_integration, docs_assets_integration_frontend_frontend_integration_tab [EXTRACTED 1.00]
- **Vite Module Federation integration flow: install @originjs/vite-plugin-federation, configure shell host with remotes served by the console API, share React dependencies** — docs_assets_integration_vite_originjs_vite_plugin_federation, docs_assets_integration_vite_shell_microfrontend, docs_assets_integration_vite_remote_entry_serving_api, docs_assets_integration_vite_shared_react_dependencies [EXTRACTED 1.00]
- **Webpack Module Federation host configuration: the shell host declares catalog/cart/account remotes served from the orchestrator API and shares react singletons** — docs_assets_integration_webpack_shell_host, docs_assets_integration_webpack_module_federation_plugin, docs_assets_integration_webpack_remote_entry_serving, docs_assets_integration_webpack_shared_singletons [EXTRACTED 1.00]
- **Project member invitation workflow: open dialog from Project Members page, enter email, select role, send invitation** — docs_assets_invite_user_dialog_project_members_page, docs_assets_invite_user_dialog_invite_user_to_project_dialog, docs_assets_invite_user_dialog_email_invitation_flow, docs_assets_invite_user_dialog_role_based_membership [EXTRACTED 1.00]
- **Edit Microfrontend configuration flow** — docs_assets_microfrontend_form_edit_microfrontend_screen, docs_assets_microfrontend_form_general_information_section, docs_assets_microfrontend_form_hosting_information_section, docs_assets_microfrontend_form_canary_settings, docs_assets_microfrontend_form_danger_zone [EXTRACTED 1.00]
- **Hosting Type choice: selector offering MFE Orchestrator Hub vs Custom URL within the Edit Microfrontend form** — docs_assets_microfrontend_hosting_type_edit_microfrontend_form, docs_assets_microfrontend_hosting_type_hosting_type_selector, docs_assets_microfrontend_hosting_type_mfe_orchestrator_hub_hosting, docs_assets_microfrontend_hosting_type_custom_url_hosting [EXTRACTED 1.00]
- **Version pinning flow: form, semantic version selector, and hosting config together control which microfrontend build is served** — docs_assets_microfrontend_version_select_edit_microfrontend_form, docs_assets_microfrontend_version_select_version_selector, docs_assets_microfrontend_version_select_mfe_orchestrator_hub_hosting, docs_assets_microfrontend_version_select_remote_entry_point [INFERRED 0.75]
- **Acme Storefront microfrontend dependency graph (Shell as host of Catalog, Cart, Account; Payments feeding Cart)** — docs_assets_microfrontends_diagram_view_shell_microfrontend, docs_assets_microfrontends_diagram_view_catalog_microfrontend, docs_assets_microfrontends_diagram_view_cart_microfrontend, docs_assets_microfrontends_diagram_view_account_microfrontend, docs_assets_microfrontends_diagram_view_payments_microfrontend [EXTRACTED 1.00]
- **Microfrontend card anatomy: each card combines a name/slug, a semantic version badge, a hosting source (Hub or Custom URL), and a Configuration action** — docs_assets_microfrontends_grid_view_microfrontend_card, docs_assets_microfrontends_grid_view_version_badge, docs_assets_microfrontends_grid_view_mfe_orchestrator_hub_hosting, docs_assets_microfrontends_grid_view_custom_url_hosting [EXTRACTED 1.00]
- **Microfrontend metadata model (name, slug, version, host, canary release)** — docs_assets_microfrontends_table_view_microfrontend_versioning, docs_assets_microfrontends_table_view_mfe_orchestrator_hub_hosting, docs_assets_microfrontends_table_view_custom_url_hosting, docs_assets_microfrontends_table_view_canary_release [EXTRACTED 1.00]
- **Project configuration resource cards shown together with counts and View All links** — docs_assets_project_settings_configuration_overview, docs_assets_project_settings_environments, docs_assets_project_settings_team_members, docs_assets_project_settings_storages, docs_assets_project_settings_api_keys, docs_assets_project_settings_code_repositories [EXTRACTED 1.00]
- **Project Switching Flow** — docs_assets_project_switcher_switch_or_create_project_modal, docs_assets_project_switcher_multi_project_support, docs_assets_project_switcher_create_new_project_action, docs_assets_project_switcher_mfe_orchestrator_console [EXTRACTED 1.00]
- **Azure DevOps PAT onboarding flow: create token with required scopes, enter it in the connection form, test, then connect** — docs_assets_repository_form_azure_pat_creation_guide, docs_assets_repository_form_azure_required_token_scopes, docs_assets_repository_form_azure_personal_access_token, docs_assets_repository_form_azure_azure_devops_connection, docs_assets_repository_form_azure_test_connection [EXTRACTED 1.00]
- **GitLab PAT-based repository connection flow (form fields, PAT creation guide, required scopes, test connection)** — docs_assets_repository_form_gitlab_gitlab_connection_form, docs_assets_repository_form_gitlab_personal_access_token, docs_assets_repository_form_gitlab_pat_creation_guide, docs_assets_repository_form_gitlab_required_token_scopes, docs_assets_repository_form_gitlab_test_connection [EXTRACTED 1.00]
- **Storage Provider Setup Flow** — docs_assets_storage_dialog_new_storage_form, docs_assets_storage_dialog_amazon_s3_provider, docs_assets_storage_dialog_provider_configuration, docs_assets_storage_dialog_credential_encryption [EXTRACTED 1.00]
- **AWS S3 Storage Creation Flow** — docs_assets_storage_form_aws_s3_new_storage_form, docs_assets_storage_form_aws_s3_basic_information_section, docs_assets_storage_form_aws_s3_amazon_s3_provider, docs_assets_storage_form_aws_s3_s3_credentials_fields, docs_assets_storage_form_aws_s3_credential_encryption_notice [EXTRACTED 1.00]
- **Azure Blob Storage Authentication Options** — docs_assets_storage_form_azure_auth_types_azure_blob_storage_provider, docs_assets_storage_form_azure_auth_types_connection_string_auth, docs_assets_storage_form_azure_auth_types_api_key_auth, docs_assets_storage_form_azure_auth_types_azure_ad_enterprise_application_auth [EXTRACTED 1.00]
- **Azure Blob Storage Configuration Flow** — docs_assets_storage_form_azure_blob_new_storage_form, docs_assets_storage_form_azure_blob_azure_blob_storage_provider, docs_assets_storage_form_azure_blob_connection_string_authentication, docs_assets_storage_form_azure_blob_container_and_path_settings [EXTRACTED 1.00]
- **GCS Storage Provider Setup Flow** — docs_assets_storage_form_gcs_new_storage_form, docs_assets_storage_form_gcs_google_cloud_storage_provider, docs_assets_storage_form_gcs_service_account_json_key, docs_assets_storage_form_gcs_credential_encryption_notice [EXTRACTED 1.00]
- **Storage provider selection: user picks Amazon S3, Google Cloud Storage, or Azure Blob Storage as the interchangeable backend for microfrontend build storage** — docs_assets_storage_providers_storage_provider, docs_assets_storage_providers_amazon_s3, docs_assets_storage_providers_google_cloud_storage, docs_assets_storage_providers_azure_blob_storage [EXTRACTED 1.00]
- **First Storage Creation Onboarding Flow** — docs_assets_storages_empty_storages_page, docs_assets_storages_empty_empty_state_pattern, docs_assets_storages_empty_new_storage_cta, docs_assets_storages_empty_first_storage_onboarding_rationale [INFERRED 0.85]
- **Project Members screen: manage members via invite, role badges, and card listing** — docs_assets_team_members_project_members_management, docs_assets_team_members_invite_user_action, docs_assets_team_members_owner_role, docs_assets_team_members_member_card_layout [EXTRACTED 1.00]

## Communities (59 total, 6 thin omitted)

### Community 0 - "Canary Releases & Product Concepts"
Cohesion: 0.07
Nodes (56): Get Started with MFE Orchestrator (Tutorial), MFE Orchestrator Online Console, Canary Releases for Microfrontends (Doc), Canary Deployment Type (Based on Version / Based on URL), Canary Release, Canary Targeting Types (Sessions / User / Cookie), Environment-based Progressive Rollout (Canary Alternative), Create a Microfrontend (Doc) (+48 more)

### Community 1 - "Deployments, Storage & CI/CD Docs"
Cohesion: 0.07
Nodes (49): Deploy to GitHub Pages workflow, Amazon S3 storage integration, Minimal IAM policy for S3 storage, Azure AD service principal authentication, Azure Blob Storage integration, Google Cloud Storage integration, Service account JSON key, Deterministic storage path layout (+41 more)

### Community 2 - "Docusaurus Package Config"
Cohesion: 0.06
Nodes (35): browserslist, development, production, dependencies, clsx, @docusaurus/core, @docusaurus/plugin-content-docs, @docusaurus/plugin-google-gtag (+27 more)

### Community 3 - "Docs Landing Page Components"
Cohesion: 0.09
Nodes (12): CAPABILITIES, Card, DOC_SECTIONS, DocSection, LOGOS, ORGANIZATION, START_HERE, Stat (+4 more)

### Community 4 - "Microfrontends Diagram View"
Cohesion: 0.22
Nodes (14): Microfrontends Diagram View Screenshot, Account Microfrontend, Acme Storefront (demo project), Add New Microfrontend Action, Cart Microfrontend, Catalog Microfrontend, Diagram View Mode (dependency graph visualization), MFE Orchestrator Console (+6 more)

### Community 5 - "Templates Library Screen"
Cohesion: 0.26
Nodes (13): Choose a Template (Templates Library Screenshot), Create From Scratch (Any Framework), Template GitHub Repositories (View on GitHub links), Host/Remote Microfrontend Pattern, Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), Template Filters (Compiler, Type, Search by Name), Templates Library, Vite - host Template (React) (+5 more)

### Community 6 - "Frontend Integration Tabs"
Cohesion: 0.18
Nodes (13): Integration Frontend Screenshot (MFE Orchestrator Console), Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), CURL Integration Option, Environment Selector (dev), Environment Variables Tab, Frontend Integration Tab, Integration Guide Page, MFE Serve API Endpoint (/api/serve/mfe/files) (+5 more)

### Community 7 - "Microfrontends Table View"
Cohesion: 0.24
Nodes (12): Microfrontends Table View Screenshot, Acme Storefront Demo Project, Add New Microfrontend Action, Canary Release, Custom URL Hosting, MFE Orchestrator Console, MFE Orchestrator Hub Hosting, Microfrontend Versioning (+4 more)

### Community 8 - "Project Settings Screen"
Cohesion: 0.20
Nodes (12): Project Settings Screenshot, API Keys, Code Repositories, Configuration Overview Cards, Danger Zone (Delete Project), Environments, Project Information Panel (Name, Slug, ID), Switch or Create Project Control (+4 more)

### Community 9 - "Docusaurus Config & llms.txt Plugin"
Cohesion: 0.21
Nodes (8): config, cleanBody(), llmsTxtPlugin(), mapProse(), Node, Page, Section, stripTags()

### Community 10 - "Environment Creation Dialog"
Cohesion: 0.22
Nodes (11): Environment Creation Dialog Screenshot, Allowed Domains (Per-Environment Domain Allowlist), Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), Create New Environment Dialog, Domain-Scoped Access Control Rationale, Environment (Project Environment Entity), Environment Color Label, Drag-to-Reorder Environments (+3 more)

### Community 11 - "Edit Microfrontend Form"
Cohesion: 0.22
Nodes (11): Microfrontend Edit Form Screenshot, Canary Settings (Coming Soon), Danger Zone (irreversible actions), Edit Microfrontend Screen, Entry Point Field (assets/remoteEntry.js), General Information Section (Name, Slug, Version, Description), Hosting Information Section (Hosting Type, Entry Point), MFE Orchestrator Hub Hosting Type (+3 more)

### Community 12 - "Microfrontend Version Select"
Cohesion: 0.20
Nodes (11): Canary Settings (Coming Soon), Custom Version Option, Danger Zone Section, Edit Microfrontend Form, Hosting Information Section, MFE Orchestrator Hub Hosting Type, Module Federation Remote Loading, Entry Point (assets/remoteEntry.js) (+3 more)

### Community 13 - "Microfrontends Grid View"
Cohesion: 0.31
Nodes (11): Microfrontends Grid View Screenshot, Add New Microfrontend Action (button and dashed placeholder card), Custom URL Hosting Source, Grid View Layout for Microfrontends, MFE Orchestrator Console UI, MFE Orchestrator Hub Hosting Source, Microfrontend Card (name, slug, version badge, host source, Configuration button), Project Scoping (Acme Storefront project header, Switch or create project) (+3 more)

### Community 14 - "Deployments History Screen"
Cohesion: 0.31
Nodes (10): Deployments History Screenshot, Active Deployment Section, View Canary Users Control, Deploy Action Button, Deployments Screen (MFE Orchestrator Console), Environment Selector (dev), Environment Variables Snapshot (API_URL, FEATURE_NEW_CHECKOUT, ANALYTICS_ID), Deployment History Section (+2 more)

### Community 15 - "Deployments Overview Screen"
Cohesion: 0.27
Nodes (10): Deployments Overview Screenshot, Active Deployment Panel (Deployment #2), View Canary Users Action, Deploy Action Button, Deployment History Section (collapsed past deployments), Deployments Page (MFE Orchestrator Console), Environment Selector (dev), Deployment Environment Variables Snapshot (API_URL, FEATURE_NEW_CHECKOUT, ANALYTICS_ID) (+2 more)

### Community 16 - "Add Repository Provider Modal"
Cohesion: 0.31
Nodes (9): Add Repository Provider Screenshot, Add Repository Modal, Azure DevOps Provider, Code Repositories Page, Console Sidebar Navigation, GitHub Provider, GitLab Provider, MFE Orchestrator Console (+1 more)

### Community 17 - "Environments List Screen"
Cohesion: 0.31
Nodes (9): Environments List Screenshot, Allowed Domains per Environment, MFE Orchestrator Console Sidebar Navigation, Dev / UAT / Production Environment Pipeline, Environment Entity (Name, Slug, Production flag, Allowed Domains, Color), Drag-to-Reorder Environment Ordering, Environments Management Screen, Production Flag on Environment (+1 more)

### Community 18 - "CURL Integration Tab"
Cohesion: 0.31
Nodes (9): Integration Guide CURL Tab Screenshot, Integration Method Tabs (Vite / Webpack / CURL), Direct API Access via CURL, Environment Selector (dev), Environment Global Variables (API_URL, FEATURE_NEW_CHECKOUT, ANALYTICS_ID), MFE Orchestrator Integration Guide Page, remoteEntry.js Module Federation Remotes, GET /api/serve/all/{environmentId} Endpoint (+1 more)

### Community 19 - "Environment Variables Integration"
Cohesion: 0.33
Nodes (9): MFE Orchestrator Console Sidebar Navigation, Direct API Access to Global Variables, Environment Selector (dev), Environment Variables Integration Tab, Frontend Integration Tab, Global Variables Serve API Endpoint (/api/serve/global-variables/{id}), Integration Guide Page, JavaScript Integration via window.globalConfig (+1 more)

### Community 20 - "Vite Integration Tab"
Cohesion: 0.28
Nodes (9): Integration Guide Vite Tab Screenshot, Bundler Integration Tabs (Vite, Webpack, CURL), Environment Selector (dev), Integration Guide Console Page, @originjs/vite-plugin-federation Plugin, Console remoteEntry Serving API (api/serve/mfe/files), Shared React Dependencies (react, react-dom, react-router-dom), Shell Host Microfrontend (+1 more)

### Community 21 - "Webpack Integration Tab"
Cohesion: 0.28
Nodes (9): Integration Guide Webpack Tab Screenshot, Bundler Tab Selector (Vite / Webpack / CURL), Environment Selector (dev), MFE Orchestrator Console Integration Guide Screen, ModuleFederationPlugin (webpack.config.js), Remote Entry Serving via Orchestrator API (/api/serve/mfe/files), Shared Singleton Dependencies (react, react-dom, react-router-dom), Shell Host Microfrontend (+1 more)

### Community 22 - "AWS S3 Storage Form"
Cohesion: 0.25
Nodes (9): Storage Form AWS S3 Screenshot, Amazon S3 Provider Configuration, Basic Information Section (Name, Provider), Credential Encryption Security Notice, MFE Orchestrator Console UI, New Storage Creation Form, S3 Credential Fields (Bucket Name, Path, Access Key ID, Secret Access Key, Region), Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings) (+1 more)

### Community 23 - "Azure Storage Auth Types"
Cohesion: 0.28
Nodes (9): Api Key Authentication, Azure Authentication Type Selector, Azure AD Enterprise Application Authentication, Azure Blob Storage Provider, Connection String Authentication, Credential Encryption Security Notice, MFE Orchestrator Console UI, New Storage Creation Form (+1 more)

### Community 24 - "Storage Provider Selection"
Cohesion: 0.28
Nodes (9): Storage Providers Screenshot (New Storage Screen), Amazon S3 Provider, Azure Blob Storage Provider, Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), Credential Encryption Security Notice, Google Cloud Storage Provider, New Storage Configuration Screen, S3 Provider Configuration Fields (Bucket Name, Path, Access Key ID, Secret Access Key, Region) (+1 more)

### Community 25 - "Add Microfrontend Empty State"
Cohesion: 0.29
Nodes (8): Add New Microfrontend Screenshot, Add New Microfrontend Action, Dual Affordance for Creation in Empty State, Empty State with Dashed Add Placeholder, Microfrontends Management Page, Switch Project Control, Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), List/Grid View Toggle

### Community 26 - "Code Repositories Empty State"
Cohesion: 0.29
Nodes (8): Add Repository Action, Code Repositories Page, Empty State with Primary CTA Pattern, MFE Orchestrator Console, Project Switcher (Acme Storefront / Switch or create project), Multiple Code Repository Providers, Code Repositories Screen Screenshot, Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings)

### Community 27 - "Console Registration Screen"
Cohesion: 0.36
Nodes (8): Centered Card Auth Layout, Create Account Form, Email/Password Authentication, Language and Theme Toggle Controls, Login Link for Existing Users, MF Brand Mark (Purple Logo), Password Confirmation Field, Console Register Screen Screenshot

### Community 28 - "New Microfrontend Form"
Cohesion: 0.29
Nodes (8): Frontend Fill Information Screenshot (Add New Microfrontend form), Add New Microfrontend Form, Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), General Information Section (Name, Slug, Version, Description), Hosting Information Section (Hosting Type, Entry Point), MFE Orchestrator Hub Hosting Type, Entry Point assets/remoteEntry.js (Module Federation remote entry), Vite Host Template (React)

### Community 29 - "Hosting Type Selector"
Cohesion: 0.29
Nodes (8): Microfrontend Hosting Type Screenshot, Canary Settings (Coming Soon), Custom URL Hosting Option, Edit Microfrontend Form, General Information Section (Name, Slug, Version, Description), Hosting Type Selector, MFE Orchestrator Console UI, MFE Orchestrator Hub Hosting Option

### Community 30 - "Azure DevOps Repository Form"
Cohesion: 0.29
Nodes (8): Repository Form - Azure DevOps (Screenshot), Azure DevOps Connection Form, MFE Orchestrator Console (Sidebar Navigation), How to Create a Personal Access Token (Inline Guide), Personal Access Token (PAT) Authentication, Required Token Scopes (Code, Build, Release, Variable Groups), Secure PAT Storage Rationale, Test Connection Before Save

### Community 31 - "Azure Blob Storage Form"
Cohesion: 0.29
Nodes (8): Storage Form - Azure Blob Screenshot, Azure Blob Storage Provider, Connection String Authentication, Container Name and Path Settings, Credential Encryption Security Notice, MFE Orchestrator Console, Microfrontend Build Storage, New Storage Form

### Community 32 - "Storages Empty State"
Cohesion: 0.32
Nodes (8): MFE Orchestrator Console Sidebar Navigation, Empty State with Primary CTA Pattern, Empty State Guides User to Create First Storage, New Storage Button, Project Context and Switch-or-Create-Project Control, Storages Page Empty State Screenshot, Storage Providers and Configurations, Storages Management Page

### Community 33 - "Team Members Screen"
Cohesion: 0.43
Nodes (8): Team Members Screenshot (Project Members Screen), Grid/List View Toggle, Invite User Action, Member Card Layout (Avatar, Role Badge, Email), Owner Role Badge, Project Members Management, Switch or Create Project Control, Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings)

### Community 34 - "API Key Creation Dialog"
Cohesion: 0.38
Nodes (7): API Key Dialog Screenshot, API Key Expiration Date, API Keys Management Page, CI/CD Integration (GitHub Actions), MFE Orchestrator Console Sidebar Navigation, Create API Key Dialog, Programmatic Access via API Keys

### Community 35 - "API Keys Empty State"
Cohesion: 0.38
Nodes (7): API Keys Screen Screenshot, API Keys Management Page, Empty State with Primary CTA (Create API Key), MFE Orchestrator Console UI, Programmatic Access Authentication, Project Scoping and Switcher (Acme Storefront), Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings)

### Community 36 - "Console Login Screen"
Cohesion: 0.38
Nodes (7): Console Login Screenshot, Email/Password Authentication, Language and Theme Toggle Controls, Login Form (Email + Password), MF Logo / Purple Brand Identity, MFE Orchestrator Console, Register Link (Self-service Signup)

### Community 37 - "Environment Variables List"
Cohesion: 0.29
Nodes (7): Environment Variables List Screenshot, Add Variable Action, MFE Orchestrator Console Sidebar Navigation, Environment Variables Console Screen, Feature Flagging via Environment Variables (FEATURE_NEW_CHECKOUT), Per-Environment Variable Values (Development / UAT / Production), Project Scoping (Acme Storefront, Switch or Create Project)

### Community 38 - "Invite User Dialog"
Cohesion: 0.38
Nodes (7): Invite User Dialog Screenshot, MFE Orchestrator Console Sidebar Navigation, Email-Based Invitation Flow, Invite User to Project Dialog, Modal Dialog with Dimmed Backdrop Pattern, Project Members Page, Role-Based Project Membership (Viewer/Owner Roles)

### Community 39 - "Project Switcher Modal"
Cohesion: 0.43
Nodes (7): Project Switcher Screenshot, Console Sidebar Navigation, Create New Project Action, MFE Orchestrator Console, Microfrontends Dependency Graph View, Multi-Project Support, Switch or Create Project Modal

### Community 40 - "GitLab Repository Form"
Cohesion: 0.38
Nodes (7): GitLab Connection Form, How to Create a Personal Access Token (3-step in-app guide), GitLab Personal Access Token (PAT), Required Token Scopes (api, read_user, read_repository), GitLab Repository Connection Form Screenshot, Self-hosted GitLab Instance Support (configurable GitLab URL), Test Connection Action

### Community 41 - "New Storage Dialog"
Cohesion: 0.38
Nodes (7): Storage Dialog Screenshot (New Storage form), Amazon S3 Storage Provider, MFE Orchestrator Console Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), Credential Encryption Security Notice, Storage of Microfrontend Builds, New Storage Form, Provider Configuration Section (bucket, path, access key ID, secret access key, region)

### Community 42 - "Canary Users Placeholder"
Cohesion: 0.47
Nodes (6): Canary Users Screen Screenshot, Canary Release (Canary Version Access), Canary Users Feature, Coming Soon Placeholder Pattern, Project Switcher (Switch or Create Project), Console Sidebar Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings)

### Community 43 - "Environment Variable Dialog"
Cohesion: 0.53
Nodes (6): Add Variable Dialog, MFE Orchestrator Console Navigation (Microfrontends, Environment Variables, Deployments, Integration, Settings), Environment Variables Page, Environment Variable Dialog Screenshot, Per-Environment Variable Values (Development, UAT, Production), Single Key with One Value per Environment Pattern

### Community 44 - "Google Cloud Storage Form"
Cohesion: 0.33
Nodes (6): Storage Form GCS Screenshot, MFE Orchestrator Console Sidebar Navigation, Credential Encryption Security Notice, Google Cloud Storage Provider Configuration, New Storage Form, GCS Service Account JSON Key Credential

### Community 45 - "Canary Settings Panel"
Cohesion: 0.50
Nodes (5): Canary Deployment, Canary Settings Panel, Coming Soon Badge (Feature Not Yet Available), Disabled Enable Toggle, Microfrontend Canary Settings Screenshot

### Community 46 - "Social Card Branding"
Cohesion: 0.60
Nodes (5): Social Card Image (Documentation Open Graph Card), Positioning: The control plane for your microfrontends, Key Message: Versions, environments, deployments and rollbacks plus Module Federation config for the host, MFE Orchestrator Brand (logo, wordmark, mfe-orchestrator.dev), Module Federation

### Community 47 - "TypeScript Config"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, exclude, extends

### Community 48 - "single-spa Logo"
Cohesion: 0.67
Nodes (3): single-spa Logo, Microfrontend Architecture, single-spa Framework

### Community 49 - "Vite Marketplace Logo"
Cohesion: 0.67
Nodes (3): Vite Logo Image, Marketplace Documentation Assets, Vite Build Tool

### Community 50 - "Web Components Marketplace Logo"
Cohesion: 0.67
Nodes (3): Web Components Logo, Marketplace Framework Option, Web Components

### Community 51 - "Webpack Marketplace Logo"
Cohesion: 0.67
Nodes (3): Webpack Logo Image, Module Federation, Webpack Module Bundler

### Community 54 - "MFE Orchestrator Logo"
Cohesion: 0.67
Nodes (3): MFE Orchestrator Logo, MFE Orchestrator Brand Identity, Announcer Figure with Megaphone

## Knowledge Gaps
- **184 isolated node(s):** `config`, `name`, `version`, `private`, `docusaurus` (+179 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `config`, `name`, `version` to the rest of the system?**
  _203 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Canary Releases & Product Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.06688311688311688 - nodes in this community are weakly interconnected._
- **Should `Deployments, Storage & CI/CD Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.06972789115646258 - nodes in this community are weakly interconnected._
- **Should `Docusaurus Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Docs Landing Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._