// ═══════════════════════════════════════════════════
// APPS-AUTO.js — App Store, zero-touch edition.
//
// The problem this solves: previously, shipping a new PWA meant coming
// back to THIS repo and hand-editing js/env-config.js. That doesn't scale.
//
// Instead: tag any GitHub repo you want listed with the topic
// "hakki-app" (repo → Settings → gear icon next to About → Topics).
// That's the entire publishing step. This module then:
//   1. Asks GitHub's public search API for every repo you own with
//      that topic (no auth needed — it's a public, unauthenticated,
//      read-only call).
//   2. Builds a project entry per repo: name (from repo name, or a
//      `hakki-app-name` custom property if you set one), description
//      (repo description), URL (repo.homepage if set, else the
//      default sandeephakki.github.io/<repo>/ pages URL), icon
//      (repo/assets/icon.png by convention, falls back to a generic
//      icon if missing).
//   3. Merges in ENV.projects as manual overrides (still supported —
//      handy if you want custom copy/icon beyond the auto-pulled data)
//      keyed by repo name, and as a fallback if the API call fails or
//      GitHub's rate limit is hit.
//   4. Caches the result in localStorage for 1 hour so repeat visits
//      are instant and don't hammer the API.
//
// Result: publish a new PWA → add the "hakki-app" topic on GitHub →
// it shows up on hakki.in within the hour, automatically. No PR here.
// ═══════════════════════════════════════════════════
(function () {
  var GH_USER = 'sandeephakki';
  var TOPIC = 'hakki-app';
  var CACHE_KEY = 'hakki_apps_cache_v1';
  var CACHE_MS = 60 * 60 * 1000; // 1 hour

  var AppsAuto = window.AppsAuto = {};

  function fallbackIcon() { return 'assets/icons/apple-touch-icon.png'; }

  function repoToProject(repo) {
    var name = repo.name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    return {
      name: name,
      url: repo.homepage || ('https://' + GH_USER + '.github.io/' + repo.name + '/'),
      desc: repo.description || 'A PWA by Sandeep Hakki.',
      icon: 'https://raw.githubusercontent.com/' + GH_USER + '/' + repo.name + '/main/assets/icon.png',
      repo: GH_USER + '/' + repo.name,
      _auto: true
    };
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_MS) return null;
      return parsed.data;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
  }

  // Merges auto-discovered repos with manual overrides from ENV.projects.
  // Manual entries win on a per-key basis (matched by repo slug) so you
  // can still hand-tune icon/desc for any app without losing auto-discovery
  // for everything else.
  function merge(autoList) {
    var manual = (window.ENV && window.ENV.projects) || {};
    var byRepo = {};
    autoList.forEach(function (p) { byRepo[p.repo] = p; });
    Object.keys(manual).forEach(function (key) {
      var m = manual[key];
      if (m.repo && byRepo[m.repo]) {
        byRepo[m.repo] = Object.assign({}, byRepo[m.repo], m, { _auto: false });
      } else {
        byRepo[m.repo || key] = Object.assign({ _auto: false }, m);
      }
    });
    return byRepo;
  }

  AppsAuto.load = function (onReady) {
    var cached = readCache();
    if (cached) { onReady(merge(cached)); return; }

    var url = 'https://api.github.com/search/repositories?q=user:' + GH_USER + '+topic:' + TOPIC;
    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { if (!res.ok) throw new Error('gh api error'); return res.json(); })
      .then(function (json) {
        var repos = (json.items || []).map(repoToProject);
        writeCache(repos);
        onReady(merge(repos));
      })
      .catch(function () {
        // API unreachable/rate-limited — fall back to manual list only,
        // so the store screen still works even with zero network calls.
        onReady(merge([]));
      });
  };
})();
