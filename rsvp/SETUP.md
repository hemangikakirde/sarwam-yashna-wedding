# RSVP setup (email only — works with a public GitHub repo)

No Google account, no Google Sheet, no secrets in the repo.

Each RSVP is **emailed to you**. Optionally copy rows into your own Excel file on your computer (`rsvp/responses-template.csv`).

## What you need

1. An **email address** for RSVPs (a dedicated inbox is a good idea for a public site).
2. About **2 minutes**.
3. One **activation click** from FormSubmit the first time you test the form.

## Setup

### 1. Add your email

In `rsvp-config.js`:

```js
window.RSVP_EMAIL = "you@example.com";
```

Commit and push. This email will be visible in your public repo (same as putting a contact address on the website). Use something like `sarwam-yashna-rsvp@gmail.com` if you do not want your personal inbox public.

### 2. Activate (one time)

1. Open the live site and submit a **test RSVP**.
2. Check that inbox for a **FormSubmit** activation email.
3. Click the link.

Real RSVPs will arrive as emails after that.

### 3. Your own spreadsheet (optional)

When emails arrive, add a row to Excel or `responses-template.csv` on your machine. Nothing is stored in Google or auto-written to GitHub.

## Privacy

- **Public repo:** only `RSVP_EMAIL` is in the code — no passwords or API keys.
- **FormSubmit** relays the email (free). See [formsubmit.co](https://formsubmit.co) if you want their policy details.
- Guest submissions are **not** saved inside the GitHub repository.
