(() => {
  const root = document.documentElement;
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const themeBtn = document.getElementById('themeBtn');
  const resetBtn = document.getElementById('resetBtn');
  const search = document.getElementById('search');
  const buttons = [...document.querySelectorAll('[data-finish]')];
  const total = buttons.length;
  let completed = new Set(JSON.parse(localStorage.getItem('angularAulaWorkshopV3') || '[]'));

  const theme = localStorage.getItem('angularAulaTheme');
  if (theme) root.dataset.theme = theme;

  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('angularAulaTheme', next);
  });

  menuBtn?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));

  function escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function tokenLoop(raw, regex, classify) {
    let result = '';
    let last = 0;
    raw.replace(regex, (match, ...args) => {
      const offset = args[args.length - 2];
      result += escapeHtml(raw.slice(last, offset));
      const cls = classify(match);
      result += '<span class="' + cls + '">' + escapeHtml(match) + '</span>';
      last = offset + match.length;
      return match;
    });
    result += escapeHtml(raw.slice(last));
    return result;
  }

  function highlightTs(raw) {
    const regex = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\x60(?:\\.|[^\x60\\])*\x60|@[A-Za-z_$][\w$]*|\b(?:import|from|export|default|class|interface|extends|implements|public|private|protected|readonly|static|constructor|return|if|else|for|of|while|switch|case|break|continue|new|this|const|let|var|function|async|await|try|catch|throw|typeof|instanceof|in|as|satisfies|true|false|null|undefined)\b|\b(?:string|number|boolean|void|unknown|any|never|object)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*(?=\s*\())/g;
    return tokenLoop(raw, regex, token => {
      if (token.startsWith('//') || token.startsWith('/*')) return 'tok-comment';
      if (/^['"`]/.test(token)) return 'tok-string';
      if (token.startsWith('@')) return 'tok-decorator';
      if (/^(string|number|boolean|void|unknown|any|never|object)$/.test(token)) return 'tok-type';
      if (/^\d/.test(token)) return 'tok-number';
      if (/^(import|from|export|default|class|interface|extends|implements|public|private|protected|readonly|static|constructor|return|if|else|for|of|while|switch|case|break|continue|new|this|const|let|var|function|async|await|try|catch|throw|typeof|instanceof|in|as|satisfies|true|false|null|undefined)$/.test(token)) return 'tok-keyword';
      return 'tok-function';
    });
  }

  function highlightAngularExpression(raw) {
    const regex = /(\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\?\s*|:\s*|===|!==|==|!=|>=|<=|&&|\|\||=>|[+\-*\/%!<>])/g;
    return tokenLoop(raw, regex, token => {
      if (/^['"]/.test(token)) return 'tok-string';
      if (/^(true|false|null|undefined)$/.test(token)) return 'tok-keyword';
      if (/^\d/.test(token)) return 'tok-number';
      return 'tok-operator';
    });
  }

  function highlightAngularText(raw) {
    const regex = /(\{\{[\s\S]*?\}\}|@(if|else|for|empty)\b[^\n{]*\{?)/g;
    let result = '';
    let last = 0;

    raw.replace(regex, (match, _controlName, offset) => {
      result += escapeHtml(raw.slice(last, offset));

      if (match.startsWith('{{')) {
        const inner = match.slice(2, -2);
        result += '<span class="tok-interpolation">{{</span>' +
          '<span class="tok-expression">' + highlightAngularExpression(inner) + '</span>' +
          '<span class="tok-interpolation">}}</span>';
      } else {
        const control = match.match(/^@(if|else|for|empty)/)?.[0] || '';
        const rest = match.slice(control.length);
        result += '<span class="tok-control">' + escapeHtml(control) + '</span>' +
          '<span class="tok-expression">' + highlightAngularExpression(rest) + '</span>';
      }

      last = offset + match.length;
      return match;
    });

    result += escapeHtml(raw.slice(last));
    return result;
  }

  function classifyAngularAttr(attr) {
    if (/^\[\(.+\)\]$/.test(attr)) return 'tok-twoway';
    if (/^\(.+\)$/.test(attr)) return 'tok-event';
    if (/^\[.+\]$/.test(attr)) return 'tok-binding';
    if (/^\*/.test(attr)) return 'tok-control';
    if (/^#/.test(attr)) return 'tok-template-ref';
    return 'tok-attr';
  }

  function highlightHtmlTag(tag) {
    const match = tag.match(/^<(\/?)\s*([\w-]+)([\s\S]*?)(\/?)>$/);
    if (!match) return '<span class="tok-tag">' + escapeHtml(tag) + '</span>';

    const [, slash, name, rest, close] = match;
    let attrs = '';
    let last = 0;
    const attrRegex = /(\s+)([\w-:\[\]\(\)\*#]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/g;

    rest.replace(attrRegex, (full, ws, attr, eq, value, offset) => {
      attrs += escapeHtml(rest.slice(last, offset));
      attrs += escapeHtml(ws);

      const attrClass = classifyAngularAttr(attr);
      attrs += '<span class="' + attrClass + '">' + escapeHtml(attr) + '</span>';
      attrs += '<span class="tok-punct">' + escapeHtml(eq) + '</span>';

      const quote = value[0] === '"' || value[0] === "'" ? value[0] : '';
      if (quote) {
        const inner = value.slice(1, -1);
        const isAngularExpr = attrClass !== 'tok-attr' || /\{\{|\$event|\w+\(\)/.test(inner);
        attrs += '<span class="tok-string">' + escapeHtml(quote) + '</span>';
        attrs += isAngularExpr
          ? '<span class="tok-expression">' + highlightAngularExpression(inner) + '</span>'
          : '<span class="tok-value">' + escapeHtml(inner) + '</span>';
        attrs += '<span class="tok-string">' + escapeHtml(quote) + '</span>';
      } else {
        attrs += '<span class="tok-value">' + escapeHtml(value) + '</span>';
      }

      last = offset + full.length;
      return full;
    });

    attrs += escapeHtml(rest.slice(last));

    return '<span class="tok-punct">&lt;' + escapeHtml(slash) + '</span>' +
      '<span class="tok-tag">' + escapeHtml(name) + '</span>' +
      attrs +
      '<span class="tok-punct">' + escapeHtml(close) + '&gt;</span>';
  }

  function highlightHtml(raw) {
    const regex = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/g;
    let result = '';
    let last = 0;

    raw.replace(regex, (match, offset) => {
      result += highlightAngularText(raw.slice(last, offset));
      result += match.startsWith('<!--')
        ? '<span class="tok-comment">' + escapeHtml(match) + '</span>'
        : highlightHtmlTag(match);
      last = offset + match.length;
      return match;
    });

    result += highlightAngularText(raw.slice(last));
    return result;
  }

  function highlightCss(raw) {
    const regex = /(\/\*[\s\S]*?\*\/|#[0-9a-fA-F]{3,8}\b|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b|--[\w-]+|[\w-]+(?=\s*:))/g;
    return tokenLoop(raw, regex, token => {
      if (token.startsWith('/*')) return 'tok-comment';
      if (/^['"]/.test(token)) return 'tok-string';
      if (token.startsWith('#') || /^\d/.test(token)) return 'tok-number';
      if (token.startsWith('--')) return 'tok-type';
      return 'tok-property';
    });
  }

  function highlightShell(raw) {
    const regex = /(#.*$|'[^']*'|"[^"]*"|--?[\w-]+|\b(?:ng|npm|node|cd|mkdir|code|git|Set-ExecutionPolicy)\b|\b\d+(?:\.\d+)*\b)/gm;
    return tokenLoop(raw, regex, token => {
      if (token.startsWith('#')) return 'tok-comment';
      if (/^['"]/.test(token)) return 'tok-string';
      if (token.startsWith('-')) return 'tok-flag';
      if (/^\d/.test(token)) return 'tok-number';
      return 'tok-command';
    });
  }

  function highlightJson(raw) {
    const regex = /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b)/g;
    return tokenLoop(raw, regex, token => {
      if (/^"/.test(token)) return token.endsWith('"') ? 'tok-string' : 'tok-attr';
      if (/^(true|false|null)$/.test(token)) return 'tok-keyword';
      return 'tok-number';
    });
  }

  function inferLanguage(box, raw) {
    const head = box.querySelector('.codehead')?.textContent.toLowerCase() || '';
    const trimmed = raw.trim();

    if (
      head.includes('.html') ||
      head.includes('html') ||
      /^<\/?[A-Za-z]/.test(trimmed) ||
      /<\/?(?:button|div|section|header|main|nav|form|input|label|article|p|h\d|router-outlet|app-[\w-]+)/.test(trimmed) ||
      /@(if|for|empty)\s*\(|\{\{[\s\S]*?\}\}/.test(trimmed)
    ) return ['html', 'Angular HTML'];

    if (
      head.includes('.css') ||
      head.includes('css') ||
      /(^|\n)\s*[.#][\w-]+\s*\{/.test(trimmed) ||
      /(^|\n)\s*@media\b/.test(trimmed)
    ) return ['css', 'CSS'];

    if (head.includes('.json') || head.includes('json')) return ['json', 'JSON'];

    if (
      head.includes('terminal') ||
      head.includes('powershell') ||
      /^(ng|npm|node|cd|mkdir|code|git|Set-ExecutionPolicy)\b/m.test(trimmed)
    ) return ['shell', 'Terminal'];

    if (
      head.includes('.ts') ||
      head.includes('typescript') ||
      /(^|\n)\s*(import|export|interface|@Component|@Injectable|const |let |class |private |readonly )/.test(trimmed)
    ) return ['ts', 'TypeScript'];

    return ['text', 'Código'];
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll('.codebox').forEach(box => {
      const pre = box.querySelector('pre');
      const head = box.querySelector('.codehead');
      if (!pre || pre.dataset.highlighted === 'true') return;

      const raw = pre.textContent.replace(/^\n|\n$/g, '');
      pre.dataset.rawCode = raw;
      const [language, label] = inferLanguage(box, raw);

      let highlighted = escapeHtml(raw);
      if (language === 'ts') highlighted = highlightTs(raw);
      if (language === 'html') highlighted = highlightHtml(raw);
      if (language === 'css') highlighted = highlightCss(raw);
      if (language === 'shell') highlighted = highlightShell(raw);
      if (language === 'json') highlighted = highlightJson(raw);

      pre.innerHTML = highlighted.split('\n').map((line, index) =>
        '<span class="code-line">' +
          '<span class="line-number">' + (index + 1) + '</span>' +
          '<span class="line-code">' + (line || ' ') + '</span>' +
        '</span>'
      ).join('');

      pre.dataset.highlighted = 'true';

      if (head && !head.querySelector('.code-lang')) {
        const badge = document.createElement('span');
        badge.className = 'code-lang';
        badge.textContent = label;
        const copy = head.querySelector('.copy-btn');
        copy ? head.insertBefore(badge, copy) : head.appendChild(badge);
      }
    });
  }


  function enhanceFolderTrees() {
    document.querySelectorAll('.folder').forEach(tree => {
      if (tree.dataset.treeHighlighted === 'true') return;

      const raw = tree.textContent.replace(/^\n|\n$/g, '');
      tree.dataset.rawTree = raw;

      tree.innerHTML = raw.split('\n').map((line, index) => {
        const match = line.match(/^([\s│├└─]*)(.*)$/u);
        const guides = match ? match[1] : '';
        const name = match ? match[2] : line;
        const lower = name.toLowerCase();

        let cls = 'tree-file-generic';
        if (name.endsWith('/')) cls = index === 0 ? 'tree-root-folder' : 'tree-folder-name';
        else if (lower.endsWith('.ts')) cls = 'tree-file-ts';
        else if (lower.endsWith('.html')) cls = 'tree-file-html';
        else if (lower.endsWith('.css')) cls = 'tree-file-css';
        else if (lower.endsWith('.json')) cls = 'tree-file-json';
        else if (lower.endsWith('.js') || lower.endsWith('.cjs') || lower.endsWith('.mjs')) cls = 'tree-file-js';
        else if (lower.endsWith('.md')) cls = 'tree-file-md';

        const icon =
          name.endsWith('/') ? '📁 ' :
          lower.endsWith('.ts') ? '◆ ' :
          lower.endsWith('.html') ? '◇ ' :
          lower.endsWith('.css') ? '● ' :
          lower.endsWith('.json') ? '▣ ' :
          '';

        return '<span class="folder-line">' +
          '<span class="tree-guides">' + escapeHtml(guides) + '</span>' +
          '<span class="tree-entry-icon">' + icon + '</span>' +
          '<span class="' + cls + '">' + escapeHtml(name) + '</span>' +
        '</span>';
      }).join('');

      tree.dataset.treeHighlighted = 'true';
    });
  }

  function renderProgress() {
    buttons.forEach(btn => {
      const done = completed.has(btn.dataset.finish);
      btn.classList.toggle('done', done);
      btn.textContent = done ? '✓ Etapa terminada' : 'Marcar etapa terminada';
    });
    const n = completed.size;
    const pct = total ? Math.round(n / total * 100) : 0;
    document.getElementById('bar').style.width = pct + '%';
    document.getElementById('progressText').textContent = n + ' de ' + total + ' etapas';
    document.getElementById('pct').textContent = pct + '%';
  }

  buttons.forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.finish;
    completed.has(id) ? completed.delete(id) : completed.add(id);
    localStorage.setItem('angularAulaWorkshopV3', JSON.stringify([...completed]));
    renderProgress();
  }));

  resetBtn.addEventListener('click', () => {
    if (!confirm('¿Reiniciar el progreso del taller?')) return;
    completed.clear();
    localStorage.removeItem('angularAulaWorkshopV3');
    renderProgress();
  });

  document.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const pre = btn.closest('.codebox')?.querySelector('pre');
    if (!pre) return;
    const code = pre.dataset.rawCode || pre.innerText;
    await navigator.clipboard.writeText(code);
    const old = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => btn.textContent = old, 1100);
  }));

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    document.querySelectorAll('.section').forEach(section => {
      const text = ((section.dataset.search || '') + ' ' + section.innerText).toLowerCase();
      section.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });

  const links = [...document.querySelectorAll('.nav a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach(entry => {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin:'-20% 0px -68% 0px' });
  targets.forEach(t => observer.observe(t));

  enhanceCodeBlocks();
  enhanceFolderTrees();
  renderProgress();
})();