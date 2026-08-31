# RSVP setup — to do

Email-only setup for a **public GitHub repo**. No Google Sheet required.

- [ ] Create a dedicated RSVP inbox (e.g. `sarwam-yashna-rsvp@gmail.com`) if you do not want your personal email public
- [ ] Open `rsvp-config.js` and set your email:
  ```js
  window.RSVP_EMAIL = "your-rsvp@example.com";
  ```
- [ ] Commit and push to GitHub so the live site picks up the change
- [ ] Open the live wedding site and submit a **test RSVP**
- [ ] Check the RSVP inbox for the **FormSubmit activation** email and click the link (one-time only)
- [ ] Submit another test RSVP and confirm the email arrives with name, contact, attendance, and message
- [ ] (Optional) Copy each RSVP into Excel or `rsvp/responses-template.csv` on your computer for a master list

## Notes

- Guest RSVPs are **not** stored in this GitHub repo — only emailed to you
- The RSVP email address will be visible in `rsvp-config.js` on the public repo (like a contact address on the site)
- Full details: [`SETUP.md`](SETUP.md)
