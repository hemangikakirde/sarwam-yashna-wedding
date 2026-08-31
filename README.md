# Sarwam & Yashna Wedding Invitation

A responsive, single-page wedding invitation website inspired by the uploaded reference:
- Maharashtrian + South Indian visual direction
- Maroon, ivory, muted gold palette
- Editorial serif typography with traditional details
- Hero, story, multi-day schedule, gallery, venue/map placeholder, countdown and RSVP
- Local SVG photo placeholders ready to replace with real photographs

## Run locally
Open `index.html` directly in a browser, or serve the folder:

python3 -m http.server 8080

Then open http://localhost:8080

## RSVP (public repo — no Google)

RSVPs are **emailed to you** only. No Google Sheet, no database in the repo.

1. Set `RSVP_EMAIL` in `rsvp-config.js` (use a dedicated inbox if you prefer).
2. Push and complete the one-time FormSubmit activation — see [`rsvp/SETUP.md`](rsvp/SETUP.md).

## Important
- Wedding year is set to 2026 based on the current date/context. Change it in `index.html` and `script.js` if needed.
- Venue/city is intentionally a placeholder because no venue was supplied.
- Replace `assets/placeholder-*.svg` with real JPG/WEBP photos and keep the same filenames, or update the image paths.
