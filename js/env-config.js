// ═══════════════════════════════════════════════════
// ENV-CONFIG — v1.0 (hakki.in)
// Same pattern as spend-na/js/env-config.js and student-insight/js/env-config.js:
// detect local / QA / prod purely from location.hostname, expose window.ENV.
// MUST load before app.js.
//
// Prod = custom domain hakki.in (CNAME file at repo root points here).
// QA   = sandeephakki-qa.github.io/hakki-in/
// Local = localhost / file://
// ═══════════════════════════════════════════════════
(function () {
  var QA_HOSTNAMES = ['sandeephakki-qa.github.io'];
  var QA_PATH_PREFIX = '/hakki-in/';

  var PROD_HOSTNAMES = ['hakki.in', 'www.hakki.in', 'sandeephakki.github.io'];
  var PROD_PATH_PREFIX = '/';

  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '' || location.protocol === 'file:';
  var isQA = QA_HOSTNAMES.indexOf(host) !== -1;
  var isProd = PROD_HOSTNAMES.indexOf(host) !== -1;

  var name, label, debug, basePath;
  if (isLocal) {
    name = 'local'; label = 'LOCAL'; debug = true; basePath = '/';
  } else if (isQA) {
    name = 'qa'; label = 'QA'; debug = true; basePath = QA_PATH_PREFIX;
  } else if (isProd) {
    name = 'prod'; label = null; debug = false; basePath = PROD_PATH_PREFIX;
  } else {
    name = 'unknown'; label = null; debug = false; basePath = '/';
  }

  window.ENV = {
    name: name,
    label: label,
    debug: debug,
    basePath: basePath,
    swPath: basePath + 'sw.js',
    isProd: name === 'prod',
    // Public Blogger feed this site migrates content from — used by blog.js
    // to pull posts client-side (JSONP, no server, no build step).
    blogHost: 'https://www.hakki.in',
    // Family project URLs, single source of truth for store.html cards + QR codes.
    projects: {
      spendna: { name: 'Spend-na', url: 'https://www.spendna.in/', desc: 'Personal finance tracker — your money, your device. Offline-first, no accounts.', icon: 'assets/icons/spendna-icon.png', repo: 'sandeephakki/spend-na' },
      studin:  { name: 'Student Insight', url: 'https://studin.in/', desc: 'Privacy-first, in-browser student analytics for schools.', icon: 'assets/icons/studin-icon.png', repo: 'sandeephakki/student-insight' }
    }
  };

  if (window.ENV.label) {
    document.addEventListener('DOMContentLoaded', function () {
      var el = document.createElement('div');
      el.className = 'env-ribbon';
      el.textContent = window.ENV.label;
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    });
  }
})();
