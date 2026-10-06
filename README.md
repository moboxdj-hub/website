# BASSROOM DJs School — website

Static recreation of the BASSROOM landing (https://bassroom-landing.vercel.app/), served at bassroomdjschool.com.

- `index.html` – home
- `reservar/index.html` – fallback (meta refresh); `/reservar` is redirected via `vercel.json` to Google Calendar booking (https://calendar.app.google/jAWiXbuMA2pQXPar5). All on-page CTAs link to the calendar directly.
- `assets/site.css` – compiled styles; `assets/fonts/` – Bebas Neue, Barlow, Space Mono (woff2)
- `images/` – photos

No build step: deploy as static files on Vercel.
