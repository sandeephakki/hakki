# Hakki.in

Parent hub PWA for the Hakki project family (this site, [Spend-na](https://www.spendna.in/), [Student Insight](https://studin.in/)). Static, no build step, no backend. Single-page app — one HTML shell, hash-routed screens.

## Structure
```
hakki-in/
├── index.html      the entire app — home / store / blog / contact all live here as
│                    <section class="screen" id="screen-*"> blocks, toggled by router.js
├── css/theme.css   shared design tokens — copy this file to start the next Hakki project
├── js/
│   ├── env-config.js   local/QA/prod detection + manual project overrides (optional)
│   ├── apps-auto.js      App Store auto-discovery — see "App Store" section below
│   ├── router.js          hash router — shows/hides screens, lazy-inits each on first visit
│   ├── app.js              theme toggle, SW registration
│   ├── blog.js              Blogger JSONP feed renderer (screen: #blog)
│   └── readme.js             GitHub README fetcher + markdown renderer, used by App Store cards
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

## App Store — zero-touch publishing
Ship a new PWA and want it to show up here automatically? Tag its GitHub repo with
the topic **`hakki-app`** (repo page → gear icon next to "About" → Topics) and set
the repo's **Website** field (same gear icon) to its live URL. That's it — no PR,
no edit, nothing to touch in this repo.

`js/apps-auto.js` asks GitHub's public search API for every repo you own tagged
`hakki-app`, builds a card (name from repo name, description from repo description,
URL from the repo's homepage field, icon convention `assets/icon.png` in the repo
root), and caches the result in the browser for an hour. `js/env-config.js` still
supports a `projects` object for **manual overrides** — useful if you want custom
copy/icon beyond what's auto-pulled, or as an offline fallback if GitHub's API is
ever unreachable. Match the `repo` field exactly (`owner/name`) so overrides merge
onto the right auto-discovered card instead of duplicating it.

Tapping any card — auto or manual — fetches that repo's `README.md` live via
`js/readme.js` and renders it inline.

## On Stage gallery — also zero-touch
Drop a new photo (jpg/png/webp) into `assets/speaking/` on GitHub — web UI upload
works fine — and it appears in the gallery within the hour, no code edit, no
redeploy. `js/speaking-auto.js` lists that folder via GitHub's Contents API and
replaces the hard-coded fallback images. If GitHub's API is unreachable it silently
keeps the 5 photos already baked into `index.html`.
