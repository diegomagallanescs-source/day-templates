# Day Templates

A tiny frontend-only tool: click a button to stamp a pre-made day template onto
your Google Calendar, or clear whatever this app previously created on a given
day. No backend, no database — templates are baked into the code
([src/templates.ts](src/templates.ts)).

## How it works

- **Auth:** Google Identity Services token flow, entirely client-side. No
  client secret, no refresh token, no server. The consent popup appears once
  ever; after that, tokens renew silently.
- **Safety:** every event this app creates is tagged with a private extended
  property (`app=daytemplates`). "Clear day" only ever deletes events
  carrying that tag — it structurally cannot touch anything else on your
  calendar.
- **Templates:** plain TypeScript objects in `src/templates.ts`. Add a new
  template = add an entry to the array + redeploy. No UI needed to manage
  them.

## Setup

### 1. Google Cloud project

1. [console.cloud.google.com](https://console.cloud.google.com) → new project.
2. Enable the [Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com).
3. **Google Auth Platform → Get Started**:
   - App name: anything
   - Audience: **External**
   - Add your own Google account under **Audience → Test users**
   - Leave publishing status as **Testing** — this app never needs to be
     verified or published, since the token flow issues no refresh token
     (the thing that expires in 7 days under Testing status).
4. **Google Auth Platform → Clients → Create Client**:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:5180` (this app's dev
     port — see `vite.config.ts`), plus your deployed URL once you have one.
     Google matches the origin exactly, including port, so `5180` must be
     listed verbatim.
   - Authorized redirect URIs: leave empty (popup-based flow, no redirect)
   - Copy the **Client ID** (ends in `.apps.googleusercontent.com`). Ignore
     the client secret — never put it in this app.

### 2. Calendar ID

Target calendar defaults to a dedicated one so you can test safely without
risking your primary calendar. To find any calendar's ID: Google Calendar →
Settings → pick the calendar → **Integrate calendar** → Calendar ID. Your
primary calendar's ID is just the literal string `primary`.

### 3. Local env

```bash
cp .env.example .env
```

Fill in `VITE_GOOGLE_CLIENT_ID` (from step 1) — the calendar ID and timezone
are already set. Then:

```bash
npm install
npm run dev
```

## Adding a template

Open [src/templates.ts](src/templates.ts) and append to `TEMPLATES`:

```ts
{
  id: 'unique-id',
  name: 'Display Name',
  emoji: '📅',
  blocks: [
    { title: 'Block title', start: '09:00', end: '10:30' },
  ],
},
```

Commit and redeploy — the new template's button appears automatically.

## Deploying

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Set
the same three `VITE_*` env vars in the host's dashboard, and add the deployed
URL to **Authorized JavaScript origins** in the Google Cloud console.
