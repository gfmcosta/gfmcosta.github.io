(function () {
  'use strict';

  var root = document.documentElement;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
  });

  /* ---------- Language ---------- */
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'pt' ? 'pt-PT' : 'en');
    store('lang', lang);
    renderRepos(lastRepos);
  }
  document.getElementById('langToggle').addEventListener('click', function () {
    setLang(root.getAttribute('data-lang') === 'pt' ? 'en' : 'pt');
  });
  function t(pt, en) { return root.getAttribute('data-lang') === 'pt' ? pt : en; }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuToggle');
  var links = document.querySelector('.nav__links');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      links.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Nav border + active section ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

    /* Reveal on scroll */
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    window.__observeReveal = function (el) { reveal.observe(el); };
    document.querySelectorAll('.reveal').forEach(function (el) { reveal.observe(el); });
  } else {
    root.classList.add('no-js');
    window.__observeReveal = function (el) { el.classList.add('is-visible'); };
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- GitHub repositories ---------- */
  var LANG_COLORS = {
    'C#': '#178600', 'Java': '#b07219', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6',
    'Python': '#3572A5', 'Kotlin': '#A97BFF', 'Swift': '#F05138', 'CSS': '#563d7c',
    'HTML': '#e34c26', 'Dart': '#00B4AB', 'PHP': '#4F5D95', 'Go': '#00ADD8'
  };

  // Shown if the GitHub API is unavailable (rate limit, offline, ...)
  var FALLBACK = [
    { name: 'FinScan', language: 'Kotlin', description: '', html_url: 'https://github.com/gfmcosta/FinScan', stargazers_count: 0, pushed_at: '2026-07-04' },
    { name: 'dw-final-project-react', language: 'JavaScript', description: 'Projeto final de React para a UC de Desenvolvimento Web', html_url: 'https://github.com/gfmcosta/dw-final-project-react', stargazers_count: 1, pushed_at: '2024-08-24' },
    { name: 'Raspberry-Devices', language: 'Swift', description: 'iOS App with the objective of controlling smart devices connected to a raspberry', html_url: 'https://github.com/gfmcosta/Raspberry-Devices', stargazers_count: 0, pushed_at: '2024-08-24' },
    { name: 'dw-final-project-c-sharp', language: 'C#', description: 'Trabalho final da Unidade Curricular de Desenvolvimento Web', html_url: 'https://github.com/gfmcosta/dw-final-project-c-sharp', stargazers_count: 1, pushed_at: '2023-06-30' },
    { name: 'Eleicoes_CD', language: 'Java', description: '', html_url: 'https://github.com/gfmcosta/Eleicoes_CD', stargazers_count: 0, pushed_at: '2024-01-05' },
    { name: 'merkel_tree', language: 'Java', description: 'Project for Data Structures and Algorithms', html_url: 'https://github.com/gfmcosta/merkel_tree', stargazers_count: 0, pushed_at: '2023-02-26' }
  ];

  // Repos not worth featuring on the portfolio
  var HIDDEN = ['gfmcosta', 'gfmcosta.github.io'];
  var MAX_REPOS = 6;
  var lastRepos = null;
  var reposEl = document.getElementById('repos');

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString(t('pt-PT', 'en-GB'), { month: 'short', year: 'numeric' });
  }

  function renderSkeleton() {
    var html = '';
    for (var i = 0; i < MAX_REPOS; i++) html += '<div class="repo repo--skeleton" aria-hidden="true"></div>';
    reposEl.innerHTML = html;
  }

  function renderRepos(repos) {
    if (!repos) return;
    reposEl.innerHTML = repos.map(function (r) {
      var color = LANG_COLORS[r.language] || 'var(--muted)';
      var desc = r.description || t('Sem descrição.', 'No description.');
      return '' +
        '<a class="repo reveal is-visible" href="' + escapeHtml(r.html_url) + '" target="_blank" rel="noopener">' +
          '<div class="repo__top"><i class="fa-regular fa-folder-open"></i><i class="fa-solid fa-arrow-up-right-from-square"></i></div>' +
          '<h3>' + escapeHtml(r.name) + '</h3>' +
          '<p>' + escapeHtml(desc) + '</p>' +
          '<div class="repo__meta">' +
            (r.language ? '<span><span class="lang-dot" style="background:' + color + '"></span>' + escapeHtml(r.language) + '</span>' : '') +
            (r.stargazers_count ? '<span><i class="fa-regular fa-star"></i> ' + r.stargazers_count + '</span>' : '') +
            '<span>' + formatDate(r.pushed_at) + '</span>' +
          '</div>' +
        '</a>';
    }).join('');
  }

  function loadRepos() {
    renderSkeleton();
    fetch('https://api.github.com/users/gfmcosta/repos?per_page=100&sort=pushed')
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (data) {
        var repos = data
          .filter(function (r) { return !r.fork && !r.archived && HIDDEN.indexOf(r.name) === -1; })
          .sort(function (a, b) {
            return (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at));
          })
          .slice(0, MAX_REPOS);
        lastRepos = repos.length ? repos : FALLBACK;
        renderRepos(lastRepos);
      })
      .catch(function () {
        lastRepos = FALLBACK;
        renderRepos(lastRepos);
      });
  }

  loadRepos();
})();
