// ═══════════════════════════════════════════════════
// APP.js — hakki.in shell: theme toggle, active-nav, SW registration
// Depends on window.ENV from env-config.js (must load first).
// ═══════════════════════════════════════════════════
(function () {
  var APP = window.APP = window.APP || {};
  var THEME_KEY = 'hakki_theme';

  APP.initTheme = function () {
    var saved = localStorage.getItem(THEME_KEY);
    var mode = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', mode);
  };

  APP.cycleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = next === 'light' ? '🌙' : '☀️';
  };

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
      btn.addEventListener('click', APP.cycleTheme);
    }

    // active nav link is now handled by router.js (hash-based screens)

    var navToggle = document.getElementById('navToggle');
    var navLinks = document.querySelector('nav.links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () { navLinks.classList.toggle('open'); });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { navLinks.classList.remove('open'); });
      });
    }

    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if ('serviceWorker' in navigator && window.ENV) {
      navigator.serviceWorker.register(window.ENV.swPath).catch(function (e) {
        if (window.ENV.debug) console.warn('SW register failed', e);
      });
    }
  });
})();
