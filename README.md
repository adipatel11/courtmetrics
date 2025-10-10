## Tennis Stats Visualizer

Secure player authentication and stat charting built with Next.js 15, React 19, and Tailwind.

### Features
- Landing page with login/sign-up toggle and security callouts.
- Password hashing with `bcryptjs`; never stores plaintext credentials.
- AWS DynamoDB persistence via the AWS SDK v3 document client.
- Signed, HTTP-only cookie sessions with a 7-day TTL.
- Authenticated dashboard for CSV uploads and Recharts visualizations.

### Prerequisites
- Node.js 18+ and npm (ships with the project scaffold).
- AWS account with IAM permissions for DynamoDB.

### Environment Variables
Copy `.env.local.example` to `.env.local` and paste your actual secrets in place of the placeholders:

```
cp .env.local.example .env.local
```

| Variable | Description |
| --- | --- |
| `AWS_REGION` | AWS region where your DynamoDB table lives (e.g. `us-east-1`). |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Programmatic IAM credentials with DynamoDB permissions. |
| `AWS_DYNAMO_USERS_TABLE` | DynamoDB table for auth users (default `tsv-users`). |
| `SESSION_SECRET` | 64+ char random string for signing session cookies. |

### DynamoDB Table
Provision a table that matches the expected schema:
- Table name: value from `AWS_DYNAMO_USERS_TABLE`.
- Partition key: `email` (String).
- No sort key required.

Grant the IAM identity `dynamodb:PutItem` and `dynamodb:GetItem` permissions on the table.

### Install Dependencies
Install the new runtime dependencies (AWS SDK + bcryptjs):

```bash
npm install
```

### Local Development
```bash
npm run dev
```

Visit `http://localhost:3000` for the landing page and `http://localhost:3000/dashboard` after signing in.

### Testing Authentication
1. Register with an email + password (hashed before storage).
2. DynamoDB will contain records shaped as:
   ```json
   { "email": "player@example.com", "hashedPassword": "...", "createdAt": "ISO8601" }
   ```
3. Subsequent logins verify the hash and set the `tsv_session` HTTP-only cookie.
4. Logout from the dashboard to clear the cookie.

### Project Scripts
- `npm run dev` – Next dev server with Turbopack.
- `npm run build` – Production build.
- `npm run lint` – ESLint across the project.

### Notes
- The session token uses HMAC-SHA256 and expires after 7 days.
- Client CSV uploads persist temporarily in `sessionStorage`.
- Update Tailwind tokens and copy variants in `globals.css` or component-level classes.

### AWS Setup Reference
Detailed walkthrough: [`docs/aws-setup.md`](docs/aws-setup.md)
