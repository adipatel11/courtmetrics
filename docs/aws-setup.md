## AWS Setup Guide

Follow these steps to create the AWS resources and credentials needed by the CourtMetrics authentication flow.

### 1. Create / Sign In to AWS
1. Visit [aws.amazon.com](https://aws.amazon.com/) and sign in or create a new AWS account.
2. Configure Multi-Factor Authentication on your root account for security (IAM → Users → Security credentials → MFA).

### 2. Create an IAM User
1. Navigate to **IAM → Users → Create user**.
2. Enter a user name such as `cm-service-user`.
3. **Programmatic access**: Enable the checkbox (if the wizard still asks, choose “Application running outside AWS”).
4. **Console access** (optional): leave disabled unless you plan to sign in with this user. If enabled, let AWS auto-generate the initial password.
5. Permissions:
   - Quick start: attach the AWS managed policy `AmazonDynamoDBFullAccess`.
   - Recommended: click `Create policy`, choose `JSON`, and paste:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": ["dynamodb:GetItem", "dynamodb:PutItem"],
           "Resource": [
             "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/cm-users",
             "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/cm-matches"
           ]
         }
       ]
     }
     ```
     Replace `REGION`, `ACCOUNT_ID`, and the table names with your actual values, save, then attach this policy to the new user.
6. Finish the wizard and download the `.csv` file that contains the `Access key ID` and `Secret access key`. You only see the secret once—store it in a password manager.

### 3. Create DynamoDB Tables
Create two tables—one for users and one for match stats.

**Users table**
1. Go to **DynamoDB → Tables → Create table**.
2. Table name: `cm-users` (or match the value you plan to use in `AWS_DYNAMO_USERS_TABLE`).
3. Partition key: `email` (String). Leave sort key empty.
4. Capacity mode: `On-demand` is fine for most projects; you can switch to provisioned later.
5. Create the table and wait for status `Active`.

**Matches table**
1. Create another table named `cm-matches` (or match `AWS_DYNAMO_MATCHES_TABLE`).
2. Partition key: `userEmail` (String).
3. Sort key: `matchId` (String).
4. Same capacity settings as above.
5. Wait for the table to become `Active`.

### 4. Prepare Local Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Replace placeholder values:
   - `AWS_REGION`: e.g., `us-east-1` (must match the table’s region).
   - `AWS_ACCESS_KEY_ID`: paste the value from the IAM CSV.
   - `AWS_SECRET_ACCESS_KEY`: paste the secret key from the IAM CSV.
   - `AWS_DYNAMO_USERS_TABLE`: exact table name (`cm-users` if you used the default).
   - `AWS_DYNAMO_MATCHES_TABLE`: match table name (`cm-matches` if you used the default).
   - `SESSION_SECRET`: run `openssl rand -hex 64` (macOS/Linux) or use another high-entropy random string (≥64 chars).

### 5. Verify Locally
1. Install dependencies if you haven’t already: `npm install`.
2. Run `npm run dev`.
3. In the browser, go to `http://localhost:3000`, create an account, then check DynamoDB → Tables → `cm-users` → `Explore table items` to confirm a new auth record.
4. Add a match from the dashboard and confirm `cm-matches` now contains a row with your `userEmail`.

### 6. Deployment Checklist
- Mirror the same environment variables wherever you deploy (Vercel, Amplify, etc.).
- Restrict the IAM user’s permissions further if you add more DynamoDB tables.
- Rotate the access keys periodically (IAM → Users → Security credentials → Access keys → `Rotate`).
