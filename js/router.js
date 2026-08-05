// ═══════════════════════════════════════════════════
// ROUTER.js — turns hakki.in into a single-page app. One index.html,
// four <section class="screen" id="screen-*"> blocks, hash controls
// which one shows. No framework, no build step — just show/hide +
// a lazy per-screen init hook (so blog/store don't fetch anything
// until the person actually taps that nav item).
// ═══════════════════════════════════════════════════
(function () {
  var TITLES = {
    home: 'Hakki — Sandeep Hakki',
    store: 'App Store — Hakki',
    blog: 'Blog — Hakki',
    contact: 'Contact — Hakki'
  };

  var ROUTER = window.ROUTER = { screens: {} };

  // Other modules (store, blog, contact) register an onEnter callback
  // that runs the first time — and only the first time — their screen
  // becomes active.
  ROUTER.register = function (name, onEnter) {
    ROUTER.screens[name] = { onEnter: onEnter, inited: false };
  };

  function activate(name) {
    if (!document.getElementById('screen-' + name)) name = 'home';

    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('active', s.id === 'screen-' + name);
    });
    document.querySelectorAll('nav.links a[data-screen]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-screen') === name);
    });

    document.title = TITLES[name] || TITLES.home;
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    var fab = document.getElementById('storeFab');
    if (fab) fab.classList.toggle('hide-on-store', name === 'store');

    var entry = ROUTER.screens[name];
    if (entry && !entry.inited) {
      entry.inited = true;
      if (entry.onEnter) entry.onEnter();
    }
  }

  function route() {
    var name = (location.hash || '#home').replace('#', '') || 'home';
    activate(name);
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', route);
})();
