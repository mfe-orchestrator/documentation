# GitLab

This guide will walk you through connecting your GitLab repositories to MFE Orchestrator.

## Prerequisites

- An active [GitLab](https://gitlab.com) account (or access to a self-hosted GitLab instance)
- Access to at least one project or group
- Permissions to create Personal Access Tokens

## Step 1: Navigate to Code Repositories

1. Go to **[Code Repositories](https://console.mfe-orchestrator.dev/code-repositories)** in MFE Orchestrator
![alt text](./assets/azure-dev-ops-image.png)
2. Click the **Add Repository** button
![alt text](./assets/azure-dev-ops-image-1.png)
3. Select **GitLab** as your provider
![alt text](./assets/gitlab-image.png)

## Step 2: Create a Personal Access Token (PAT)

A Personal Access Token is required to authenticate MFE Orchestrator with your GitLab account.

### 2.1 Access Token Settings

1. Go to GitLab and click on your **avatar** (top right corner)
2. Select **Edit profile** or **Preferences**
3. In the left sidebar, click on **Access Tokens**
4. Click **Add new token**

:::tip GitLab.com vs Self-Hosted
- For GitLab.com, go to: `https://gitlab.com/-/profile/personal_access_tokens`
- For self-hosted GitLab, use your instance URL: `https://your-gitlab-instance.com/-/profile/personal_access_tokens`
:::

### 2.2 Configure Token Settings

Fill in the token configuration:

- **Token name**: Enter a descriptive name (e.g., "MFE Orchestrator")
- **Expiration date**: Set an expiration date
  - Recommended: 90 days or custom date
  - For security, avoid tokens without expiration dates

### 2.3 Required Token Scopes

:::warning Critical: Select the Correct Scopes
Make sure to select these **exact scopes** for MFE Orchestrator to function properly:
:::

In the **Scopes** section of the token creation dialog, configure the following permissions:

**1. Configure API Scope**
   1. Find the **api** checkbox in the scopes list
   2. Check the **api** checkbox

   > *This grants complete read/write access to the API, including all groups and projects, the container registry, and the package registry - required for full integration with MFE Orchestrator*

**2. Configure Read Repository Scope**
   1. Scroll down to find the **read_repository** checkbox
   2. Check the **read_repository** checkbox

   > *This grants read-only access to repositories - required for fetching repository content*

**3. Configure Write Repository Scope**
   1. Continue scrolling to find the **write_repository** checkbox
   2. Check the **write_repository** checkbox

   > *This grants read-write access to repositories - required for managing deployments and commits*

:::tip Quick Check
After selecting all scopes, verify that you have checked:
-  api
-  read_repository
-  write_repository
:::

### 2.4 Generate the Token

1. After selecting all required scopes, click **Create personal access token**
2. **Important**: A dialog will appear with your token at the top of the page
3. **Copy the token immediately** and save it securely, you won't be able to see this token again!


## Step 3: Configure Connection in MFE Orchestrator

Now that you have your PAT, return to MFE Orchestrator to complete the connection.

### 3.1 Fill in Connection Details

In the **Add Repository** dialog, enter the following information:

1. **Name**: Enter a descriptive name for this connection
   - Example: `"My GitLab"` or `"Company GitLab"`
   - This helps you identify the connection if you have multiple repository sources

2. **GitLab URL**: Enter your GitLab instance URL
   - For GitLab.com, use: `https://gitlab.com`
   - For self-hosted GitLab, use your instance URL: `https://your-gitlab-instance.com`

4. **Personal Access Token**: Paste the PAT you created in Step 2
   - Copy and paste the full token
   - Make sure there are no extra spaces

### 3.2 Test and Save the Connection

Before saving, verify that everything is configured correctly clicking on **Test Connection** button

:::tip Connection Test Success
If the test is successful, you'll see a **green checkmark** and a success message. If it fails, double-check your GitLab URL and PAT.
:::

1. Once the test is successful, click **Connect GitLab**
2. Your GitLab connection is now active!

## Troubleshooting

### Connection Test Fails

If the connection test fails, check the following:

- **Invalid GitLab URL**: Verify that the GitLab URL is correct (e.g., `https://gitlab.com` for GitLab.com or your self-hosted instance URL)
- **Insufficient Permissions**: Ensure you selected all three required scopes (api, read_repository, write_repository)
- **Expired Token**: Check if your PAT has expired and create a new one if needed
- **Network Issues**: Verify that you have internet connectivity and can access GitLab
- **Self-Hosted GitLab**: If using a self-hosted instance, make sure MFE Orchestrator can reach your GitLab server (check firewall rules)

### Token Permissions Error

If you see a permissions error after connecting:

1. Go back to GitLab - User Settings - Access Tokens
2. Find your MFE Orchestrator token
3. Click **Revoke** and create a new token
4. Ensure all required scopes are selected (api, read_repository, write_repository)
5. Update the token in MFE Orchestrator settings

### Cannot Access My Repositories

If your repositories don't appear or you can't access them:

- Verify that you have at least **Developer** role in the project/group
- Make sure the token has the correct scopes selected
- Check that the repositories are not archived or deleted
- If using group/organization name, verify it matches exactly the GitLab group path

### Self-Hosted GitLab Issues

For self-hosted GitLab installations:

- **SSL Certificate Errors**: Ensure your GitLab instance has a valid SSL certificate
- **Firewall**: Make sure MFE Orchestrator can access your GitLab instance (port 443 for HTTPS)
- **Version Compatibility**: Check that your GitLab version supports Personal Access Tokens (GitLab 8.8+)

## Security Best Practices

:::warning Token Security
Follow these best practices to keep your account secure:
:::

- **Never share** your Personal Access Token with anyone
- **Use specific scopes** - only grant the permissions that are needed
- **Set expiration dates** - tokens should expire after 90 days or less
- **Rotate tokens regularly** - create new tokens periodically
- **Revoke immediately** if compromised - if you suspect a token has been exposed, revoke it right away and create a new one
- **Use separate tokens** for different services - don't reuse the same PAT across multiple integrations

## Need Help?

If you encounter any issues or need assistance:

- Check the [GitLab documentation](https://docs.gitlab.com/)
- Review the [Personal Access Tokens documentation](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
- Contact MFE Orchestrator support