# ORIGEN: The Open Source AI Tutor

## Admin Onboarding

This application has an automatic admin onboarding workflow that will create the first admin user if no users exist in the system. This is a one-time process that happens automatically when the application is first installed.

### How Admin Onboarding Works

1. The workflow checks if any users exist in the system.
2. If no users exist, it creates a default admin user with the following credentials:
   - Username: `admin`
   - Email: `admin@origen.edu`
   - A secure randomly generated password

3. The credentials are saved to a file named `admin-credentials.txt` in the project root directory.
4. **IMPORTANT:** After logging in for the first time, immediately change the password to something secure that you can remember.

### Running the Admin Onboarding Workflow Manually

The workflow runs automatically when the application is first installed. However, if you need to run it manually, you can use the following command:

```bash
ts-node -r dotenv/config scripts/admin-onboard.ts
```

Or you can use the configured workflow:

```bash
npm run admin:onboard
```

### First-time Setup Instructions

1. After the application is installed, the admin onboarding workflow will run automatically.
2. Look for the `admin-credentials.txt` file in the project root directory.
3. Log in using the provided admin credentials at `/auth`.
4. Navigate to your profile settings and change the default password immediately.
5. You can now start using the admin features to manage the application.

## Security Notice

The admin onboarding workflow is designed to be self-disposing, meaning it will only create an admin user if none exists. Once an admin user has been created, the workflow will exit without making any changes, even if run manually.

For production environments, it's recommended to delete the `admin-credentials.txt` file after you've successfully logged in and changed the password.
