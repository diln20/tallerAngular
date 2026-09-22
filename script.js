
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

  function renderProgress() {
    buttons.forEach(btn => {
      const done = completed.has(btn.dataset.finish);
      btn.classList.toggle('done', done);
      btn.textContent = done ? '✓ Etapa terminada' : (btn.dataset.finish === '17' ? 'Marcar aplicación terminada' : 'Marcar etapa terminada');
    });
    const n = completed.size;
    const pct = Math.round(n / total * 100);
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
    await navigator.clipboard.writeText(pre.innerText);
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
  }, { rootMargin: '-20% 0px -68% 0px' });
  targets.forEach(t => observer.observe(t));
  renderProgress();
})();
