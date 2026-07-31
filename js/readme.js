// ═══════════════════════════════════════════════════
// README.js — fetches a repo's README.md straight from GitHub's raw
// CDN (no token, no build step) and renders it inline in a bottom-sheet
// modal. Tiny hand-rolled markdown -> HTML converter (headings, bold,
// italic, links, images, inline code, fenced code, lists, hr, paragraphs)
// — good enough for typical project READMEs without pulling in a library.
// ═══════════════════════════════════════════════════
(function () {
  var README = window.README = {};
  var cache = {};

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inline(text) {
    text = escapeHtml(text);
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy">');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return text;
  }

  function mdToHtml(md) {
    md = md.replace(/\r\n/g, '\n');
    var lines = md.split('\n');
    var html = '';
    var inCode = false, codeBuf = [];
    var listBuf = [], listType = null;

    function flushList() {
      if (listBuf.length) {
        var tag = listType === 'ol' ? 'ol' : 'ul';
        html += '<' + tag + '>' + listBuf.map(function (li) { return '<li>' + inline(li) + '</li>'; }).join('') + '</' + tag + '>';
        listBuf = []; listType = null;
      }
    }

    lines.forEach(function (line) {
      if (/^\s*```/.test(line)) {
        if (!inCode) { inCode = true; codeBuf = []; }
        else { inCode = false; html += '<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>'; }
        return;
      }
      if (inCode) { codeBuf.push(line); return; }

      if (/^\s*$/.test(line)) { flushList(); return; }
      if (/^#{1,6}\s/.test(line)) {
        flushList();
        var level = line.match(/^#+/)[0].length;
        var text = line.replace(/^#{1,6}\s/, '');
        var t = Math.min(level, 3);
        html += '<h' + t + '>' + inline(text) + '</h' + t + '>';
        return;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushList(); html += '<hr>'; return; }
      if (/^\s*[-*]\s+/.test(line)) {
        if (listType !== 'ul') { flushList(); listType = 'ul'; }
        listBuf.push(line.replace(/^\s*[-*]\s+/, ''));
        return;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        if (listType !== 'ol') { flushList(); listType = 'ol'; }
        listBuf.push(line.replace(/^\s*\d+\.\s+/, ''));
        return;
      }
      flushList();
      html += '<p>' + inline(line) + '</p>';
    });
    flushList();
    return html;
  }

  function ensureOverlay() {
    var ov = document.getElementById('readmeOverlay');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'readmeOverlay';
    ov.className = 'readme-overlay';
    ov.style.display = 'none';
    ov.innerHTML =
      '<div class="readme-panel">' +
        '<div class="rhead"><h3><img id="readmeIcon" alt=""><span id="readmeTitle"></span></h3>' +
        '<button class="rclose" id="readmeClose" aria-label="Close">✕</button></div>' +
        '<div class="readme-body" id="readmeBody"></div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.getElementById('readmeClose').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return ov;
  }

  function close() {
    var ov = document.getElementById('readmeOverlay');
    if (ov) ov.style.display = 'none';
    document.body.style.overflow = '';
  }

  README.open = function (project) {
    var ov = ensureOverlay();
    var body = document.getElementById('readmeBody');
    document.getElementById('readmeTitle').textContent = project.name;
    document.getElementById('readmeIcon').src = project.icon;
    body.innerHTML = '<div class="readme-loading">Fetching README from GitHub…</div>';
    ov.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (cache[project.repo]) { body.innerHTML = cache[project.repo]; return; }
    if (!project.repo) {
      body.innerHTML = '<div class="readme-error">No linked repository for this app yet.<br><a href="' + project.url + '" target="_blank" rel="noopener">Open the app instead →</a></div>';
      return;
    }

    var branches = ['main', 'master'];
    function tryBranch(i) {
      if (i >= branches.length) {
        body.innerHTML = '<div class="readme-error">Couldn\'t load the README right now.<br><a href="https://github.com/' + project.repo + '" target="_blank" rel="noopener">View the repo on GitHub →</a></div>';
        return;
      }
      var url = 'https://raw.githubusercontent.com/' + project.repo + '/' + branches[i] + '/README.md';
      fetch(url).then(function (res) {
        if (!res.ok) throw new Error('not found');
        return res.text();
      }).then(function (md) {
        var html = mdToHtml(md);
        cache[project.repo] = html;
        body.innerHTML = html;
      }).catch(function () { tryBranch(i + 1); });
    }
    tryBranch(0);
  };
})();
