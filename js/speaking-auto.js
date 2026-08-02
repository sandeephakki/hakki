// ═══════════════════════════════════════════════════
// SPEAKING-AUTO.js — On Stage gallery, zero-touch.
// Upload a photo to assets/speaking/ in the repo (GitHub web UI, drag-drop,
// no PR review needed on main) → it shows up here within the hour. No
// index.html edit, no redeploy. Uses GitHub Contents API (public, no auth)
// to list the folder, cached 1hr in localStorage like apps-auto.js.
// ═══════════════════════════════════════════════════
(function () {
  var GH_USER = 'sandeephakki';
  var REPO = 'hakki-in';
  var FOLDER = 'assets/speaking';
  var CACHE_KEY = 'hakki_speaking_cache_v1';
  var CACHE_MS = 60 * 60 * 1000;

  var SpeakingAuto = window.SpeakingAuto = {};

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

  SpeakingAuto.load = function (onReady) {
    var cached = readCache();
    if (cached) { onReady(cached); return; }

    var url = 'https://api.github.com/repos/' + GH_USER + '/' + REPO + '/contents/' + FOLDER;
    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { if (!res.ok) throw new Error('gh api error'); return res.json(); })
      .then(function (items) {
        var images = items
          .filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f.name); })
          .sort(function (a, b) { return a.name.localeCompare(b.name); })
          .map(function (f) { return { url: f.download_url, name: f.name }; });
        writeCache(images);
        onReady(images);
      })
      .catch(function () { onReady(null); }); // null = keep whatever's hard-coded as fallback
  };
})();
