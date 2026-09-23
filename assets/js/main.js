/* ============================================================
   main.js — 移动端抽屉 / 回到顶部 / 客户端搜索 / 代码复制 /
             面包屑来源追踪 / 分类标签视图
   无依赖，纯原生。搜索索引是构建时生成的 /search.json。
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------- 通用小工具 */
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 站点根路径，正常是 "/"，部署在子目录时是 "/repo/" */
  function basePath() {
    var b = window.BLOG_BASE || '/';
    return b.replace(/\/+$/, '') + '/';
  }

  /* ---------------------------------------------- 移动端抽屉 */
  var menuBtn = document.getElementById('menu-btn');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('backdrop');

  function closeDrawer() {
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      var open = sidebar.classList.toggle('is-open');
      if (backdrop) backdrop.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---------------------------------------------- 回到顶部 */
  var toTop = document.getElementById('to-top');
  if (toTop) {
    var syncToTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > 480);
    };
    window.addEventListener('scroll', syncToTop, { passive: true });
    syncToTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------- 搜索索引 */
  var indexPromise = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(window.BLOG_SEARCH_INDEX, { credentials: 'same-origin' })
        .then(function (res) {
          if (!res.ok) throw new Error('index ' + res.status);
          return res.json();
        })
        .then(function (items) {
          items.forEach(function (it) {
            it._title = String(it.title || '').toLowerCase();
            it._hay = [
              it.title,
              (it.tags || []).join(' '),
              (it.categories || []).join(' '),
              it.desc,
              it.body
            ].join(' ').toLowerCase();
          });
          return items;
        })
        .catch(function () { return []; });
    }
    return indexPromise;
  }

  function runSearch(items, query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    var hits = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i], ok = true, score = 0;
      for (var j = 0; j < terms.length; j++) {
        if (it._hay.indexOf(terms[j]) === -1) { ok = false; break; }
        if (it._title.indexOf(terms[j]) !== -1) score += 10;
      }
      if (ok) hits.push({ item: it, score: score });
    }
    hits.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.date < b.item.date ? 1 : -1;
    });
    return hits.map(function (h) { return h.item; });
  }

  /* ---------------------------------------------- 顶栏下拉搜索 */
  var searchBox = document.getElementById('search');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');

  if (searchBox && input && results) {
    var cursor = -1;
    var timer = null;

    var closeResults = function () {
      results.hidden = true;
      results.innerHTML = '';
      cursor = -1;
    };

    var renderResults = function (items, query) {
      if (!query) { closeResults(); return; }
      if (!items.length) {
        results.innerHTML = '<div class="search__empty">没有匹配的文章</div>';
        results.hidden = false;
        return;
      }
      var top = items.slice(0, 8);
      results.innerHTML = top.map(function (it) {
        return '<a class="search__item" href="' + escapeHtml(it.url) + '">' +
          '<span class="search__item-title">' + escapeHtml(it.title) + '</span>' +
          '<span class="search__item-meta">' + escapeHtml(it.date) + '</span></a>';
      }).join('');
      results.hidden = false;
      cursor = -1;
    };

    var doSearch = function () {
      var q = input.value.trim();
      if (!q) { closeResults(); return; }
      loadIndex().then(function (items) { renderResults(runSearch(items, q), q); });
    };

    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(doSearch, 140);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) doSearch();
    });

    input.addEventListener('keydown', function (e) {
      var links = results.querySelectorAll('.search__item');
      if (e.key === 'ArrowDown' && links.length) {
        e.preventDefault();
        cursor = Math.min(cursor + 1, links.length - 1);
      } else if (e.key === 'ArrowUp' && links.length) {
        e.preventDefault();
        cursor = Math.max(cursor - 1, 0);
      } else if (e.key === 'Enter') {
        if (cursor >= 0 && links[cursor]) {
          e.preventDefault();
          window.location.href = links[cursor].getAttribute('href');
        }
        return;
      } else if (e.key === 'Escape') {
        closeResults();
        return;
      } else {
        return;
      }
      for (var i = 0; i < links.length; i++) {
        links[i].classList.toggle('is-cursor', i === cursor);
      }
      if (links[cursor]) links[cursor].scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('click', function (e) {
      if (!searchBox.contains(e.target)) closeResults();
    });

    /* 窄屏时先展开搜索框 */
    searchBox.querySelector('.search__box').addEventListener('click', function () {
      searchBox.classList.add('is-open');
      input.focus();
    });
    document.addEventListener('click', function (e) {
      if (!searchBox.contains(e.target)) searchBox.classList.remove('is-open');
    });
  }

  /* ---------------------------------------------- 搜索页 */
  var pageInput = document.getElementById('search-page-input');
  var pageResults = document.getElementById('search-page-results');
  var pageHint = document.getElementById('search-page-hint');

  if (pageInput && pageResults) {
    var renderPage = function () {
      var q = pageInput.value.trim();
      if (!q) {
        pageResults.innerHTML = '';
        if (pageHint) pageHint.textContent = '';
        return;
      }
      if (pageHint) pageHint.textContent = '搜索中…';
      loadIndex().then(function (items) {
        var found = runSearch(items, q);
        if (pageHint) pageHint.textContent = '「' + q + '」找到 ' + found.length + ' 篇';
        if (!found.length) {
          pageResults.innerHTML = '<p class="empty">没有匹配的文章，换个关键词试试。</p>';
          return;
        }
        pageResults.innerHTML = found.map(function (it) {
          var meta = [it.date].concat(it.categories || []).filter(Boolean).join(' · ');
          return '<article class="card"><div class="card__body">' +
            '<h2 class="card__title"><a href="' + escapeHtml(it.url) + '">' +
              escapeHtml(it.title) + '</a></h2>' +
            '<p class="card__excerpt">' + escapeHtml(it.desc) + '</p>' +
            '<div class="card__meta"><span>' + escapeHtml(meta) + '</span></div>' +
            '</div></article>';
        }).join('');
      });
    };

    var initial = new URLSearchParams(window.location.search).get('q');
    if (initial) pageInput.value = initial;
    pageInput.addEventListener('input', function () {
      clearTimeout(pageInput._t);
      pageInput._t = setTimeout(renderPage, 160);
    });
    renderPage();
  }

  /* ---------------------------------------------- 代码块复制按钮 */
  function copyToClipboard(text, onDone) {
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-2000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); onDone(); } catch (e) { /* 无能为力 */ }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onDone, fallback);
    } else {
      fallback();
    }
  }

  function initCodeCopy() {
    var blocks = document.querySelectorAll('.article pre');
    if (!blocks.length) return;

    var tpl = document.getElementById('tpl-code-copy');

    for (var i = 0; i < blocks.length; i++) {
      var pre = blocks[i];
      // 只处理最外层：kramdown 会输出 <div class="highlight"><pre>，别重复包
      if (pre.parentNode && pre.parentNode.classList &&
          pre.parentNode.classList.contains('code-wrap')) continue;

      var code = pre.querySelector('code');
      var text = (code || pre).textContent;

      var wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var btn;
      if (tpl && tpl.content && tpl.content.firstElementChild) {
        btn = tpl.content.firstElementChild.cloneNode(true);
      } else {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy';
        btn.textContent = '复制';
      }

      (function (button, payload) {
        var label = button.querySelector ? button.querySelector('.code-copy__label') : null;
        button.addEventListener('click', function () {
          copyToClipboard(payload, function () {
            button.classList.add('is-done');
            if (label) label.textContent = '已复制';
            clearTimeout(button._t);
            button._t = setTimeout(function () {
              button.classList.remove('is-done');
              if (label) label.textContent = '复制';
            }, 1600);
          });
        });
      })(btn, text);

      wrap.appendChild(btn);
    }
  }

  /* ---------------------------------------------- 面包屑 */
  /* 顶层页面（首页 / 分类 / 标签 / 归档 / 关于）在左侧导航里是平级的，
     所以面包屑里它们自己就是第一级，只有真上下级才用「/」分隔。 */
  var CRUMB_LABELS = {
    home: '首页',
    categories: '分类',
    tags: '标签',
    archives: '归档',
    about: '关于',
    search: '搜索'
  };

  /* 往上找第一个满足条件的祖先（含自身，不含 root） */
  function closestMatch(node, root, test) {
    while (node && node !== root) {
      if (node.nodeType === 1 && test(node)) return node;
      node = node.parentNode;
    }
    return null;
  }

  /* parts: [{text, href}] —— 有 href 的渲染成链接，最后一个不给 href 就是当前页 */
  function renderCrumb(parts) {
    var crumb = document.getElementById('crumb');
    if (!crumb || !parts || !parts.length) return;
    var html = '';
    for (var i = 0; i < parts.length; i++) {
      if (i > 0) html += '<span class="crumb__sep">/</span>';
      if (parts[i].href) {
        html += '<a href="' + escapeHtml(parts[i].href) + '">' + escapeHtml(parts[i].text) + '</a>';
      } else {
        html += '<span class="crumb__current">' + escapeHtml(parts[i].text) + '</span>';
      }
    }
    crumb.innerHTML = html;
  }

  /* 按「来源页 / 可选的中间层 / 标题」拼面包屑 */
  function crumbFor(kind, mid, title) {
    var base = basePath();
    var parts = [];

    if (kind === 'home') {
      parts.push({ text: '首页', href: base });
    } else if (CRUMB_LABELS[kind]) {
      parts.push({ text: CRUMB_LABELS[kind], href: base + kind + '/' });
      if (mid) {
        parts.push({
          text: mid,
          href: base + kind + '/#' + encodeURIComponent(mid)
        });
      }
    } else {
      parts.push({ text: '首页', href: base });
    }

    parts.push({ text: title });
    return parts;
  }

  /* 把来源页的 pathname 归一化成 "/"、"/tags/" 这种形式 */
  function normalizePath(pathname) {
    var base = basePath();
    var p = pathname;
    if (base !== '/' && p.indexOf(base) === 0) {
      p = '/' + p.slice(base.length);
    }
    if (p === '/index.html') p = '/';
    return p;
  }

  /* 判断 referrer 来自哪个页面；识别不出来返回 '' */
  function sourceFromReferrer() {
    var ref = document.referrer;
    if (!ref) return '';
    var u;
    try { u = new URL(ref); } catch (e) { return ''; }
    if (u.origin !== window.location.origin) return '';

    var p = normalizePath(u.pathname);
    if (p === '/' || /^\/page\/\d+\/?$/.test(p)) return 'home';
    if (/^\/tags\/?$/.test(p)) return 'tags';
    if (/^\/categories\/?$/.test(p)) return 'categories';
    if (/^\/archives\/?$/.test(p)) return 'archives';
    if (/^\/about\/?$/.test(p)) return 'about';
    if (/^\/search\/?$/.test(p)) return 'search';
    return '';
  }

  /* --- 分类 / 标签名怎么传到文章页 ---
     浏览器给的 referrer 会把 URL 的 fragment 去掉，所以从
     /categories/#技术笔记 点进文章时，拿不到「技术笔记」。
     办法：在分类/标签视图里点文章链接时，把当前分类/标签名连目标路径一起
     写进 sessionStorage；文章页打开后读一次就删掉。
     读一次就删是必须的 —— 否则回到首页再点同一篇文章，也会错误地
     显示成「分类 / xxx / 标题」。 */
  var SOURCE_KEY = 'blog.crumb.source';

  function rememberSource(kind, name, targetPath) {
    try {
      sessionStorage.setItem(SOURCE_KEY, JSON.stringify({
        kind: kind,
        name: name || '',
        for: targetPath
      }));
    } catch (e) { /* 隐私模式下可能不可用，忽略 */ }
  }

  function takeSource() {
    var raw = null;
    try {
      raw = sessionStorage.getItem(SOURCE_KEY);
      sessionStorage.removeItem(SOURCE_KEY);
    } catch (e) { return null; }
    if (!raw) return null;
    var o;
    try { o = JSON.parse(raw); } catch (e) { return null; }
    if (!o || o.for !== window.location.pathname) return null;
    return o;
  }

  /* takeSource 会把记录删掉（防止回首页再点同一篇时串味），
     所以整页只读一次，结果缓存在这里给面包屑和上下篇共用。 */
  var _source;
  function getSource() {
    if (_source === undefined) _source = takeSource();
    return _source;
  }

  /* 来源页没给出具体分类/标签名时，退回文章自己的分类 / 第一个标签 */
  function fallbackMid(kind, crumb) {
    if (kind === 'categories') {
      return crumb.getAttribute('data-category') || '';
    }
    if (kind === 'tags') {
      var tags = crumb.getAttribute('data-tags') || '';
      return tags ? tags.split(',')[0] : '';
    }
    return '';
  }

  function initCrumb() {
    var crumb = document.getElementById('crumb');
    if (!crumb) return;
    // 只对文章页做改写；分类/标签页由 initTaxonomy 管
    if (crumb.getAttribute('data-kind') !== 'post') return;

    var title = crumb.getAttribute('data-title') || document.title;
    var src = getSource();
    var kind = src ? src.kind : sourceFromReferrer();
    if (!kind) return; // 没有来源信息，保留服务端渲染的默认面包屑

    var mid = '';
    if (kind === 'categories' || kind === 'tags') {
      mid = (src && src.name) || fallbackMid(kind, crumb);
    }

    renderCrumb(crumbFor(kind, mid, title));
  }

  /* ---------------------------------------------- 上一篇 / 下一篇 */
  /* 服务端渲染的 post-nav 是「全站时间顺序」的相邻文章，首页 / 归档页的
     列表顺序就是它，所以那些来源不用改。

     从某个分类 / 标签页点进来时，顺序应该换成那个分组里的顺序。
     /posts-order.json 里按 site.posts 的顺序（时间倒序）存了每篇的
     url / title / categories / tags，前端过滤出来源分组再取邻居。 */

  /* 比较两个路径。Jekyll 的 post.url 和浏览器的 location.pathname
     对非 ASCII 的编码方式可能不同，所以两边都解码后再比。 */
  function sameUrl(a, b) {
    var x = String(a || ''), y = String(b || '');
    try { x = decodeURIComponent(x); } catch (e) { /* 原样比较 */ }
    try { y = decodeURIComponent(y); } catch (e) { /* 原样比较 */ }
    return x === y;
  }

  function postNavItemHtml(item, side) {
    var isNext = side === 'next';
    if (!item) return '<span></span>';
    return '<a class="post-nav__item' + (isNext ? ' post-nav__item--next' : '') +
      '" href="' + escapeHtml(item.url) + '">' +
      '<span class="post-nav__label">' + (isNext ? '下一篇 →' : '← 上一篇') + '</span>' +
      '<span class="post-nav__title">' + escapeHtml(item.title || '') + '</span>' +
      '</a>';
  }

  function initPostNav() {
    var nav = document.getElementById('post-nav');
    if (!nav || !window.BLOG_POSTS_ORDER) return;

    var src = getSource();
    var kind = src ? src.kind : sourceFromReferrer();
    var name = src && src.name ? src.name : '';

    // 只有分类 / 标签的来源有「另一个顺序」
    if (kind !== 'categories' && kind !== 'tags') return;
    if (!name) return;

    var current = nav.getAttribute('data-url') || '';
    var key = kind === 'categories' ? 'categories' : 'tags';

    fetch(window.BLOG_POSTS_ORDER, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('posts-order ' + res.status);
        return res.json();
      })
      .then(function (list) {
        var filtered = list.filter(function (it) {
          return (it[key] || []).indexOf(name) !== -1;
        });

        var idx = -1;
        for (var i = 0; i < filtered.length; i++) {
          if (sameUrl(filtered[i].url, current)) { idx = i; break; }
        }
        if (idx < 0) return; // 找不到就保留服务端渲染的默认值

        nav.innerHTML =
          postNavItemHtml(filtered[idx - 1], 'prev') +
          postNavItemHtml(filtered[idx + 1], 'next');
      })
      .catch(function () { /* 拿不到就保留服务端渲染的默认值 */ });
  }

  /* ---------------------------------------------- 分类 / 标签页 */
  /* 给一个列表做「客户端分页」，超过 pageSize 条才显示分页器 */
  function setupListPager(listEl, pagerEl, pageSize) {
    var items = Array.prototype.slice.call(listEl.children);
    var totalPages = Math.ceil(items.length / pageSize);
    if (totalPages <= 1) { pagerEl.hidden = true; return; }

    var page = 1;

    function closestGo(node) {
      while (node && node !== pagerEl) {
        if (node.getAttribute && node.getAttribute('data-go') !== null) return node;
        node = node.parentNode;
      }
      return null;
    }

    function renderPager() {
      var html = '';
      html += page > 1
        ? '<button class="pager__btn" type="button" data-go="' + (page - 1) + '">← 上一页</button>'
        : '<span class="pager__btn is-disabled">← 上一页</span>';

      html += '<span class="pager__nums">';
      for (var i = 1; i <= totalPages; i++) {
        if (totalPages > 7 && i !== 1 && i !== totalPages && Math.abs(i - page) > 1) {
          if (Math.abs(i - page) === 2) html += '<span class="pager__gap">…</span>';
          continue;
        }
        html += i === page
          ? '<span class="pager__num is-current">' + i + '</span>'
          : '<button class="pager__num" type="button" data-go="' + i + '">' + i + '</button>';
      }
      html += '</span>';

      html += page < totalPages
        ? '<button class="pager__btn" type="button" data-go="' + (page + 1) + '">下一页 →</button>'
        : '<span class="pager__btn is-disabled">下一页 →</span>';

      pagerEl.innerHTML = html;
    }

    function show(p) {
      page = Math.min(Math.max(p, 1), totalPages);
      var from = (page - 1) * pageSize;
      var to = from + pageSize;
      for (var i = 0; i < items.length; i++) {
        items[i].hidden = (i < from || i >= to);
      }
      renderPager();
    }

    pagerEl.hidden = false;
    pagerEl.addEventListener('click', function (e) {
      var btn = closestGo(e.target);
      if (!btn) return;
      var p = parseInt(btn.getAttribute('data-go'), 10);
      if (isNaN(p)) return;
      show(p);
      // 翻页后回到列表顶部，否则 40 条一页会停在页尾
      if (listEl.scrollIntoView) listEl.scrollIntoView({ block: 'start' });
    });

    show(1);
  }

  function initTaxonomy() {
    var root = document.getElementById('taxonomy');
    if (!root) return;

    var kind = root.getAttribute('data-kind') || '';
    var label = root.getAttribute('data-label') || '';
    var intro = document.getElementById('taxonomy-intro');
    var back = document.getElementById('taxonomy-back');
    var groups = Array.prototype.slice.call(root.querySelectorAll('.tax-group'));
    var base = basePath();
    var defaultPageSize = window.BLOG_GROUP_PAGE_SIZE || 40;
    var pageTitle = document.title;

    // 每个分组各有一份列表 + 分页器，逐个装上
    groups.forEach(function (sec) {
      var list = sec.querySelector('.entry-list[data-page-size]');
      var pager = sec.querySelector('.pager[data-pager]');
      if (!list || !pager) return;
      var size = parseInt(list.getAttribute('data-page-size'), 10) || defaultPageSize;
      setupListPager(list, pager, size);
    });

    function hashName() {
      var h = window.location.hash.slice(1);
      if (!h) return '';
      try { return decodeURIComponent(h); } catch (e) { return h; }
    }

    function findGroup(name) {
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].getAttribute('data-name') === name) return groups[i];
      }
      return null;
    }

    function apply() {
      var name = hashName();
      var sec = name ? findGroup(name) : null;

      if (sec) {
        // 聚焦：收起「汇总 + 全部标签/分类」，其他分组也收起来，只留目标分组
        if (intro) intro.hidden = true;
        if (back) back.hidden = false;
        groups.forEach(function (g) { g.hidden = (g !== sec); });
        renderCrumb([
          { text: label, href: base + kind + '/' },
          { text: sec.getAttribute('data-name') }
        ]);
        document.title = sec.getAttribute('data-name') + ' · ' + pageTitle;
      } else {
        if (intro) intro.hidden = false;
        if (back) back.hidden = true;
        groups.forEach(function (g) { g.hidden = false; });
        renderCrumb([{ text: label }]);
        document.title = pageTitle;
      }
    }

    /* 从分类/标签列表点进文章时，记下「是哪个分类/标签」。
       文章页要用它来决定面包屑，以及上/下一篇的取值范围。
       详见上面 rememberSource 的注释。 */
    root.addEventListener('click', function (e) {
      var a = closestMatch(e.target, root, function (n) {
        return n.tagName === 'A' && n.getAttribute('href');
      });
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;

      var target;
      try { target = new URL(href, window.location.href); } catch (err) { return; }
      if (target.origin !== window.location.origin) return;

      var sec = closestMatch(a, root, function (n) {
        return n.classList && n.classList.contains('tax-group');
      });
      rememberSource(kind, sec ? sec.getAttribute('data-name') : '', target.pathname);
    });

    window.addEventListener('hashchange', function () {
      apply();
      window.scrollTo(0, 0);
    });

    apply();
  }

  /* ---------------------------------------------- 访问量 */
  /* 不蒜子把数字异步写进 #busuanzi_value_*。页面上的位置先放一个占位符
     「–」，这里每 250ms 看一眼，出现纯数字就说明拿到了。

     刻意不做「拿不到就隐藏」：藏起来会让人以为这个功能没做。
     15 秒还拿不到就标记成 is-stale（颜色变淡 + 鼠标悬停有说明），
     这样一眼能看出是「服务没响应」而不是「功能坏了」。
     没启用统计时页面上没有这些 id，这里直接返回。 */
  function initAnalytics() {
    var ids = [
      'busuanzi_value_site_pv',
      'busuanzi_value_site_uv',
      'busuanzi_value_page_pv'
    ];
    var watched = [];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) watched.push(el);
    });
    if (!watched.length) return;

    var MAX_TRIES = 60; // 60 × 250ms = 15 秒
    var tries = 0;

    var timer = setInterval(function () {
      tries++;
      var pending = 0;

      watched.forEach(function (el) {
        if (el.classList.contains('is-ready')) return;
        if (/^\d+$/.test(String(el.textContent).trim())) {
          el.classList.add('is-ready');
          el.classList.remove('is-stale');
          el.removeAttribute('title');
        } else {
          pending++;
        }
      });

      if (!pending) { clearInterval(timer); return; }

      if (tries >= MAX_TRIES) {
        clearInterval(timer);
        watched.forEach(function (el) {
          if (el.classList.contains('is-ready')) return;
          el.classList.add('is-stale');
          el.setAttribute('title', '没取到数据：不蒜子的脚本没加载成功（广告拦截器？网络？）');
        });
      }
    }, 250);
  }

  /* ---------------------------------------------- 启动 */
  /* 每个模块各自 try 一下：以前是一个函数抛错，后面所有初始化都不执行，
     表现就是「某个功能莫名没生效」。 */
  function boot(fn) {
    try {
      fn();
    } catch (e) {
      if (window.console && console.error) console.error('[blog]', e);
    }
  }

  boot(initCodeCopy);
  boot(initCrumb);
  boot(initPostNav);
  boot(initTaxonomy);
  boot(initAnalytics);
})();
