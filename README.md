# START2CODE &mdash; Live Leaderboard & Contribution Scoreboard

> **The Official Live Leaderboard for the Start2Code Open Source Contribution Marathon**  
> Organized by **GitHub Club, Technova &mdash; The Technical Society of SSCSE, Sharda University**  
> **Event Leads:** Tanmoy Saha &middot; Vishnu Shankar Tripathi  
> **Tracked Repository:** [`somu0571/InternPilot`](https://github.com/somu0571/InternPilot)

---

## 📖 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Scoring Engine Rules & Examples](#scoring-engine-rules--examples)
5. [Prerequisites](#prerequisites)
6. [Quick Start](#quick-start)
7. [Environment Configuration (`.env`)](#environment-configuration-env)
8. [Firebase Setup Guide](#firebase-setup-guide)
9. [GitHub Webhook Setup](#github-webhook-setup)
10. [CLI & Utility Scripts](#cli--utility-scripts)
11. [Admin Portal](#admin-portal)
12. [REST API Documentation](#rest-api-documentation)
13. [Security Architecture](#security-architecture)
14. [Deployment Guide](#deployment-guide)
15. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Overview

**START2CODE** is a standalone, real-time leaderboard and contribution scoreboard built for the **Start2Code Open Source Contribution Marathon**. The application tracks pull request contributions made to the open-source repository `somu0571/InternPilot`, calculates scores using label-based logic, handles real-time GitHub Webhook payloads with HMAC SHA-256 verification, and stores all data in Google Cloud Firestore.

### Key Highlights
- **Zero Base Points**: Points are awarded strictly based on qualifying GitHub labels.
- **S2C Tier System**: If multiple S2C tier labels exist on a PR, only the highest tier is awarded.
- **Real-Time Webhooks**: Listens to GitHub PR merge/label events and updates the leaderboard immediately.
- **Idempotent PR Processing**: Prevents double-counting with unique composite keys (`repo_prNumber`).
- **Admin Moderation Portal**: Firebase Auth-secured dashboard for manual point adjustments, approvals, PR resyncing, audit logs, and CSV exports.
- **Zero Fake Data**: The application starts in an empty state and populates solely from verified GitHub events.

---

## System Architecture

```mermaid
flowchart TD
    subgraph GitHub ["GitHub Platform"]
        GH_Repo["somu0571/InternPilot"]
        GH_PR["PR Merged / Labeled"]
        GH_Webhook["GitHub Webhook (HMAC SHA-256)"]
        GH_REST["GitHub REST API"]
    end

    subgraph Server ["START2CODE Node.js / Express Server"]
        WH_Route["POST /api/github/webhook"]
        HMAC_Verify["HMAC Signature Verification"]
        Scoring_Engine["Label Scoring Engine"]
        Admin_Routes["/admin/* Routes"]
        Public_API["/api/* Public Endpoints"]
        Page_Controller["EJS SSR View Engine"]
    end

    subgraph Firebase ["Firebase Cloud Infrastructure"]
        FB_Auth["Firebase Authentication"]
        Firestore[("Cloud Firestore")]
    end

    subgraph Client ["Client Browser"]
        Public_UI["Leaderboard UI (Tailwind CSS)"]
        Admin_UI["Admin Dashboard & Moderation"]
    end

    GH_Repo --> GH_PR
    GH_PR -->|Webhook Payload| GH_Webhook
    GH_Webhook -->|HMAC Header| WH_Route
    WH_Route --> HMAC_Verify
    HMAC_Verify -->|Valid Payload| Scoring_Engine
    Scoring_Engine -->|Store Contributions & Aggregates| Firestore

    GH_REST <-->|Resync & Metadata| Server

    FB_Auth -->|Verify ID Token & Custom Claims| Admin_Routes
    Admin_Routes --> Firestore
    Public_API --> Firestore
    Firestore --> Page_Controller
    Page_Controller --> Public_UI
    Page_Controller --> Admin_UI
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime & Framework** | Node.js (>= 18), Express.js |
| **Database** | Google Cloud Firestore (Firebase Admin SDK) |
| **Authentication** | Firebase Authentication (Admin custom claims: `{ admin: true }`) |
| **View Engine** | EJS (Embedded JavaScript Templates) |
| **Styling** | Tailwind CSS (Compiled standalone, Inter & JetBrains Mono typography) |
| **GitHub Integration** | GitHub REST API (@octokit/rest) + GitHub Webhooks |
| **Security** | Helmet (CSP), express-rate-limit, HMAC SHA-256 validation, timingSafeEqual, cookie-parser |

---

## Scoring Engine Rules & Examples

### 1. Pure Label-Based Scoring (No Base Points)
Pull requests do **NOT** receive any baseline points for being merged. Points are awarded exclusively if valid, active labels are attached to the merged PR.

### 2. S2C Tier Hierarchy
If a pull request has multiple `s2c:` tier labels, only the label with the **highest point value** is counted. Lesser `s2c:` tiers are suppressed. Regular labels (e.g. `bug`, `documentation`) stack additively alongside the highest S2C tier.

### 3. Default Label Points

| Label | Points | Description |
|---|---|---|
| `s2c:major-feature` | **75** | S2C Tier 1: Architectural or major feature |
| `s2c:meaningful-improvement` | **50** | S2C Tier 2: Meaningful feature or enhancement |
| `s2c:significant-docs` | **25** | S2C Tier 3: Significant documentation or tutorial |
| `s2c:bug-fix` | **25** | S2C Tier 3: Bug fix |
| `s2c:helpful-issue` | **15** | S2C Tier 4: Helpful issue or report |
| `s2c:minor-docs` | **10** | S2C Tier 4: Minor documentation fix |
| `feature` | **25** | Regular: New feature implementation |
| `bug` | **20** | Regular: Bug fix |
| `enhancement` | **20** | Regular: Enhancement to existing feature |
| `frontend` | **15** | Regular: Frontend UI work |
| `backend` | **20** | Regular: Backend logic work |
| `testing` | **15** | Regular: Automated test suites |
| `documentation` | **5** | Regular: Minor doc updates |
| `good first issue` | **15** | Regular: First-time contribution |

---

### Concrete Scoring Examples

#### Example 1: Single S2C Tier + Regular Labels
- **Labels**: `s2c:meaningful-improvement` (50), `frontend` (15), `testing` (15)
- **Calculation**: 50 + 15 + 15
- **Total Points**: **80 points**

#### Example 2: Multiple S2C Tiers (Tier Resolution)
- **Labels**: `s2c:major-feature` (75), `s2c:meaningful-improvement` (50), `bug` (20)
- **Calculation**: Highest S2C tier is `s2c:major-feature` (75). `s2c:meaningful-improvement` is suppressed (0). Regular `bug` label adds 20.
- **Total Points**: 75 + 0 + 20 = **95 points**

#### Example 3: PR Merged Without Qualifying Labels
- **Labels**: `dependencies`, `chore` (no point rules defined)
- **Calculation**: No base points + 0 label points.
- **Total Points**: **0 points**

#### Example 4: Multiple Regular Labels Only
- **Labels**: `bug` (20), `testing` (15), `documentation` (5)
- **Calculation**: 20 + 15 + 5
- **Total Points**: **40 points**

---

## Prerequisites

- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Firebase Project**: With Firestore enabled and a Service Account private key JSON.
- **GitHub Personal Access Token** (Optional but recommended to avoid rate limits on GitHub REST API).

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd LeaderBoard

# 2. Install dependencies
npm install

# 3. Create your environment configuration
cp .env.example .env
# Edit .env with your Firebase and GitHub credentials

# 4. Build Tailwind CSS
npm run build:css

# 5. Seed initial point rules in Firestore
node scripts/seedPointRules.js

# 6. Initialize an Admin User
node scripts/setupAdmin.js admin@example.com MySecurePassword123!

# 7. Start the server
npm run dev
# Application will be live at http://localhost:5000
```

---

## Environment Configuration (`.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Express port (default: 5000) | `5000` |
| `NODE_ENV` | No | Environment mode | `development` or `production` |
| `FIREBASE_PROJECT_ID` | **Yes** | Firebase Project ID | `start2code-leaderboard` |
| `FIREBASE_CLIENT_EMAIL` | **Yes** | Firebase Service Account Email | `firebase-adminsdk@...iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | **Yes** | Firebase Private Key | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `FIREBASE_API_KEY` | No | Firebase Web API Key for admin browser login | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | No | Firebase Auth domain | `start2code.firebaseapp.com` |
| `GITHUB_WEBHOOK_SECRET` | **Yes** | Webhook secret configured in GitHub repo | `your-secure-webhook-secret` |
| `GITHUB_REPO_OWNER` | **Yes** | Repository owner | `somu0571` |
| `GITHUB_REPO_NAME` | **Yes** | Repository name | `InternPilot` |
| `GITHUB_TOKEN` | No | GitHub PAT for REST API requests | `ghp_...` |
| `SESSION_SECRET` | **Yes** | Secret for cookie signing | `random-hex-string` |
| `MARATHON_START` | No | Start date (YYYY-MM-DD) | `2026-09-19` |
| `MARATHON_END` | No | End date (YYYY-MM-DD) | `2026-09-27` |
| `ENFORCE_MARATHON_WINDOW` | No | Ignore PRs merged outside window | `true` |
| `REQUIRE_APPROVAL_LABEL` | No | Put PRs into pending state until labeled | `false` |
| `APPROVAL_LABEL` | No | Approval label required if gate is true | `S2C approved` |
| `MAX_PRS_PER_DAY` | No | Anti-spam limit per contributor per day | `5` |

---

## Firebase Setup Guide

### 1. Create Project & Firestore
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `start2code-leaderboard`).
3. Under **Build**, select **Firestore Database** &rarr; **Create database** &rarr; Choose production mode & select a region (e.g. `asia-south1`).
4. Under **Build**, select **Authentication** &rarr; **Get Started** &rarr; Enable **Email/Password**.

### 2. Service Account Private Key
1. Go to **Project settings** &rarr; **Service accounts**.
2. Click **Generate new private key** &rarr; Download the JSON.
3. Copy:
   - `project_id` &rarr; `FIREBASE_PROJECT_ID`
   - `client_email` &rarr; `FIREBASE_CLIENT_EMAIL`
   - `private_key` &rarr; `FIREBASE_PRIVATE_KEY` (keep the `\n` linebreaks intact)

### 3. Deploy Firestore Rules & Composite Indexes
Install the Firebase CLI and deploy the included configuration:
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-firebase-project-id>
firebase deploy --only firestore:rules,firestore:indexes
```

---

## GitHub Webhook Setup

1. Navigate to your repository: `https://github.com/somu0571/InternPilot/settings/hooks`.
2. Click **Add webhook**.
3. Set the following fields:
   - **Payload URL**: `https://<your-domain>/api/github/webhook`
   - **Content type**: `application/json`
   - **Secret**: The secret matching `GITHUB_WEBHOOK_SECRET` in your `.env`.
   - **SSL verification**: Enable SSL verification.
   - **Which events would you like to trigger this webhook?**: Choose **Let me select individual events**:
     - Check `Pull requests`
     - Check `Pings`
4. Click **Add webhook**.
5. When GitHub sends the initial `ping` event, check `/admin/webhook-events` to verify delivery.

---

## CLI & Utility Scripts

### Seed Default Point Rules
Populates or synchronizes standard point rules to Firestore:
```bash
node scripts/seedPointRules.js
```

### Initialize or Elevate Admin User
Creates a Firebase Auth account (if it doesn't exist) and sets the `{ admin: true }` custom claim:
```bash
node scripts/setupAdmin.js admin@example.com MySecurePassword123!
```

### Backfill Merged Pull Requests
Fetches merged PRs from GitHub REST API and runs them through the scoring pipeline (ideal if webhooks were not yet connected):
```bash
node scripts/backfillPRs.js
```

---

## Admin Portal

The administrative interface is available at `/admin/login` and `/admin/dashboard`.

- **Dashboard** (`/admin/dashboard`): Real-time metrics, quick PR resync tool, top activity, and leads info.
- **Manage Contributors** (`/admin/contributors`): Filterable list of all contributors, GitHub ID tracking, rank, total points, and direct links to public profile.
- **Manage Contributions** (`/admin/contributions`): Moderation panel:
  - **Approve**: Award points for pending PRs.
  - **Reject**: Mark PR as rejected with a reason.
  - **Adjust Points**: Apply delta (+/- points) with an mandatory audit reason.
  - **Resync**: Re-pull fresh labels and data from GitHub API.
- **Point Rules** (`/admin/point-rules`): Adjust point values, activate/deactivate labels, and view category groupings.
- **Webhook Events** (`/admin/webhook-events`): Real-time delivery logs, status codes, and error traces.
- **Audit Logs** (`/admin/audit-logs`): Immutable audit trail recording before/after values, admin emails, and timestamps for every manual operation.
- **CSV Exports**: One-click download of all contributors or contributions via `/admin/export/contributors` and `/admin/export/contributions`.

---

## REST API Documentation

### Public Endpoints

#### `GET /api/leaderboard`
Returns paginated, ranked contributors sorted by `totalPoints DESC`, `mergedPRs DESC`, `firstContributionAt ASC`.
- **Query Params**: `page` (default 1), `limit` (default 20, max 100), `search` (filter username)
- **Response**:
```json
{
  "contributors": [
    {
      "rank": 1,
      "githubUsername": "alice",
      "displayName": "Alice Smith",
      "avatarUrl": "https://avatars.githubusercontent.com/u/12345",
      "totalPoints": 150,
      "mergedPRs": 3,
      "lastContributionAt": "2026-09-20T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 45,
  "totalPages": 3
}
```

#### `GET /api/leaderboard/:username`
Returns profile and awarded contributions for a single contributor.

#### `GET /api/stats`
Returns aggregated marathon statistics: `totalContributors`, `totalMergedPRs`, `totalPointsAwarded`, `averagePointsPerPR`, `topContributor`, `marathonDay`, and `daysRemaining`.

#### `GET /api/point-rules`
Returns all active label scoring rules and their assigned point values.

#### `GET /api/repo`
Returns cached GitHub repository metadata (`stars`, `forks`, `openIssues`, `languages`).

---

### Webhook Endpoint

#### `POST /api/github/webhook`
- **Headers**:
  - `X-Hub-Signature-256`: `sha256=<hmac_sha256_signature>`
  - `X-GitHub-Delivery`: Unique GUID
  - `X-GitHub-Event`: `pull_request` | `ping`
- **Security**: Verifies raw request body with `crypto.timingSafeEqual`. Rejects mismatched signatures with HTTP 401.

---

## Security Architecture

1. **HMAC SHA-256 Webhook Verification**: Uses Node.js `crypto` with `timingSafeEqual` to verify payloads against timing attacks.
2. **Raw Body Preservation**: Custom JSON middleware preserves exact raw buffer bytes for HMAC validation before parsing.
3. **Helmet Content Security Policy (CSP)**: Allows only authorized Google Fonts, GitHub Avatars, and Firebase Auth CDN domains.
4. **Rate Limiting**:
   - Webhook endpoint: 120 req / min
   - Public API: 60 req / min
   - Admin routes: 100 req / min
   - Login attempts: 10 req / 15 min
5. **No Public Database Writes**: All Firestore writes are handled by the server via the Firebase Admin SDK.
6. **Double-Submit / Secure Token Authentication**: Admin endpoints verify Firebase ID tokens with custom claim `admin: true`.

---

## Deployment Guide

### Deploying to Ubuntu VPS with PM2 & NGINX

```bash
# 1. Clone & Build
git clone <repo-url> /var/www/leaderboard
cd /var/www/leaderboard
npm ci
npm run build:css

# 2. Configure Environment
nano .env # Set production values and credentials

# 3. Start with PM2
npm install -g pm2
pm2 start server.js --name start2code
pm2 save
pm2 startup
```

#### NGINX Reverse Proxy Configuration
```nginx
server {
    server_name leaderboard.example.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting & FAQ

#### 1. Why is the leaderboard empty after starting the server?
START2CODE strictly follows a **Zero Fake Data** policy. Contributions are only recorded when real GitHub pull requests are merged or backfilled. To load existing merged PRs, run `node scripts/backfillPRs.js`.

#### 2. Why does the webhook return 401 Unauthorized?
Ensure that `GITHUB_WEBHOOK_SECRET` in `.env` matches the Secret entered in GitHub's Webhook configuration settings.

#### 3. Why did a merged PR receive 0 points?
The PR did not have any active qualifying labels matching the point rules table. Check `/scoring` or `/admin/point-rules` to ensure the labels attached to the PR are configured.

---

&copy; 2026 **START2CODE** &mdash; Organized by **GitHub Club, Technova &mdash; SSCSE, Sharda University**.
Event Leads: **Tanmoy Saha** &middot; **Vishnu Shankar Tripathi**.
