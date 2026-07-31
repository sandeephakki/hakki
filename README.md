# Hakki.in

Parent hub PWA for the Hakki project family (this site, [Spend-na](https://sandeephakki.github.io/spend-na/), [Student Insight](https://studin.in/)). Static, no build step, no backend.

## Structure
```
hakki-in/
├── index.html      home / bio
├── store.html      app store — project cards + QR codes
├── blog.html       live posts pulled from hakki.in's Blogger feed
├── contact.html    mailto contact form
├── css/theme.css   shared design tokens — copy this file to start the next Hakki project
├── js/
│   ├── env-config.js   local/QA/prod detection (same pattern as spend-na, student-insight)
│   ├── app.js           theme toggle, nav, SW registration
│   └── blog.js           Blogger JSONP feed renderer
├── manifest.json, sw.js, icon-192.png, icon-512.png, .nojekyll, CNAME
└── assets/          logos, favicons, project icons
```

## Deploying (GitHub Pages)
1. Push this folder as the repo root (repo name doesn't matter for prod — CNAME points `hakki.in` at it).
2. Settings → Pages → deploy from `main` branch, `/ (root)`.
3. `.nojekyll` stops Pages from stripping the leading-underscore-free but dotfile-adjacent assets.
4. QA: push the same content to a repo served at `sandeephakki-qa.github.io/hakki-in/` — `env-config.js` picks it up automatically, no manual "point to QA" step needed.

## Editing your info
Search for `EDIT ME` comments in `index.html` and `contact.html` — bio text and the contact email are placeholders, nothing fabricated.

## Blog
`blog.html` doesn't scrape or export Blogger — it calls Blogger's own public JSON feed (`/feeds/posts/default?alt=json-in-script`) client-side, so new posts on hakki.in show up automatically with zero redeploys.

## Adding the next project to the App Store
Add one entry to `ENV.projects` in `js/env-config.js` (name, url, desc, icon path) — `store.html` renders the card + QR automatically.
