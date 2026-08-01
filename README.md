# Hakki.in

Parent hub PWA for the Hakki project family (this site, [Spend-na](https://www.spendna.in/), [Student Insight](https://studin.in/)). Static, no build step, no backend. Single-page app — one HTML shell, hash-routed screens.

## Structure
```
hakki-in/
├── index.html      the entire app — home / store / blog / contact all live here as
│                    <section class="screen" id="screen-*"> blocks, toggled by router.js
├── css/theme.css   shared design tokens — copy this file to start the next Hakki project
├── js/
│   ├── env-config.js   local/QA/prod detection (same pattern as spend-na, student-insight)
│   ├── router.js        hash router — shows/hides screens, lazy-inits each on first visit
│   ├── app.js            theme toggle, SW registration
│   ├── blog.js            Blogger JSONP feed renderer (screen: #blog)
│   └── readme.js           GitHub README fetcher + markdown renderer, used by App Store cards
├── manifest.json, sw.js, icon-192.png, icon-512.png, .nojekyll, CNAME
└── assets/          logos, favicons, project icons, avatar
```

## Navigation model
Everything is one page. Nav links are `#home`, `#store`, `#blog`, `#contact` — `router.js`
listens for `hashchange`, shows the matching `.screen`, and calls that screen's `onEnter`
hook the *first* time it's opened (so the blog feed / store cards don't fetch anything
until the person actually taps that tab). Back/forward browser buttons work naturally
since it's just hash history.

## Deploying (GitHub Pages)
1. Push this folder as the repo root (repo name doesn't matter for prod — CNAME points `hakki.in` at it).
2. Settings → Pages → deploy from `main` branch, `/ (root)`.
3. `.nojekyll` stops Pages from stripping dotfile-adjacent assets.
4. QA: push the same content to a repo served at `sandeephakki-qa.github.io/hakki-in/` — `env-config.js` picks it up automatically.

## Blog
The blog screen doesn't scrape or export Blogger — it calls Blogger's own public JSON feed
(`/feeds/posts/default?alt=json-in-script`) client-side, so new posts on hakki.in show up
automatically with zero redeploys.

## App Store + live READMEs
Add one entry to `ENV.projects` in `js/env-config.js` (name, url, desc, icon path, and a
`repo: "owner/name"` field) — the store screen renders the card + QR automatically, and
tapping a card fetches that repo's `README.md` straight from GitHub and renders it inline.
