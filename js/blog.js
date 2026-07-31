// ═══════════════════════════════════════════════════
// blog.js — renders posts from the hakki.in Blogger feed.
// Blogger already exposes every post as public JSON via its own feed
// API (alt=json-in-script=CALLBACK avoids CORS entirely) — reusing that
// beats hand-rolling a scraper/export step, and it keeps this page in
// sync automatically as new posts go up on Blogger.
// Exposes window.BlogScreen.init() — called lazily by router.js the
// first time the person opens the Blog screen, not on every page load.
// ═══════════════════════════════════════════════════
(function () {
  var MAX_POSTS = 12;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function excerpt(html, len) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    var text = d.textContent || '';
    return text.length > len ? text.slice(0, len).trim() + '…' : text;
  }

  function render(json) {
    var list = document.getElementById('blogList');
    if (!list) return;
    var entries = (json.feed && json.feed.entry) || [];
    if (!entries.length) {
      list.innerHTML = '<div class="state">No posts found yet.</div>';
      return;
    }
    list.innerHTML = entries.map(function (e) {
      var title = esc(e.title ? e.title.$t : 'Untitled');
      var content = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
      var published = e.published ? new Date(e.published.$t) : null;
      var dateStr = published ? published.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
      var link = '#';
      (e.link || []).forEach(function (l) { if (l.rel === 'alternate') link = l.href; });
      return '' +
        '<article class="post">' +
          '<h3>' + title + '</h3>' +
          '<div class="meta">' + dateStr + '</div>' +
          '<div class="excerpt">' + esc(excerpt(content, 220)) + '</div>' +
          '<a class="readmore" href="' + link + '" target="_blank" rel="noopener">Read on hakki.in →</a>' +
        '</article>';
    }).join('');
  }

  function fail() {
    var list = document.getElementById('blogList');
    if (list) {
      list.innerHTML = '<div class="state">Couldn\'t reach the blog feed right now. ' +
        '<a class="readmore" href="' + (window.ENV ? window.ENV.blogHost : '#') + '" target="_blank" rel="noopener">Visit hakki.in directly →</a></div>';
    }
  }

  window.__hakkiBlogCallback = function (json) {
    try { render(json); } catch (e) { fail(); }
  };

  window.BlogScreen = {
    init: function () {
      var list = document.getElementById('blogList');
      if (!list) return;
      var host = (window.ENV && window.ENV.blogHost) || 'https://www.hakki.in';
      var script = document.createElement('script');
      script.src = host + '/feeds/posts/default?alt=json-in-script&max-results=' + MAX_POSTS + '&callback=__hakkiBlogCallback';
      script.onerror = fail;
      var timer = setTimeout(fail, 8000);
      script.onload = function () { clearTimeout(timer); };
      document.body.appendChild(script);
    }
  };
})();
