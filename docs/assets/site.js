/* ================================================================
   Odoo 20 开发教程 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
// 保持经典 <script> 而不是 type="module"：模块脚本在 file:// 下会被浏览器拦截，
// 而这些页面经常是直接双击打开的。
(() => {
  'use strict';

  const CHAPTERS = [
    { n: 1,  t: '用开发者模式快速上手',   d: '不写一行代码，在界面里搭出一个待办应用', part: '第一部分 · 入门' },
    { n: 2,  t: '准备开发环境',           d: '从源码安装 Odoo 20，认识 odoo-bin 与配置文件' },
    { n: 3,  t: '第一个 Odoo 应用',       d: '从空目录开始，写出一个图书馆模块' },
    { n: 4,  t: '扩展模块',               d: '继承：不改别人的代码，也能改别人的功能' },
    { n: 5,  t: '导入、导出与模块数据',   d: 'CSV / XML 数据文件与外部标识符', part: '第二部分 · 模型' },
    { n: 6,  t: '模型：组织应用数据',     d: '模型类型、字段类型、关系字段与计算字段' },
    { n: 7,  t: '记录集：操作模型数据',   d: 'env、search、Domain、读写与事务' },
    { n: 8,  t: '业务逻辑',               d: '方法、onchange、向导、消息、测试与调试', part: '第三部分 · 业务逻辑' },
    { n: 9,  t: '外部 API',               d: '用 JSON-2 API 让别的程序和 Odoo 对话' },
    { n: 10, t: '后台视图',               d: '表单、列表、搜索与其他视图类型', part: '第四部分 · 视图' },
    { n: 11, t: '看板视图与 OWL 模板',    d: '看板卡片、客户端 QWeb 与前端资源' },
    { n: 12, t: 'PDF 报表',               d: '用服务端 QWeb 生成可打印的报表' },
    { n: 13, t: '网站与门户',             d: '控制器、网页模板与客户门户' },
    { n: 14, t: '内置模型',               d: '公司、用户、伙伴与元数据模型', part: '第五部分 · 部署与维护' },
    { n: 15, t: '部署与维护',             d: '生产环境安装、Nginx 反向代理与升级' },
    { n: 16, t: '附录：15 → 20 变化速查', d: '书里的旧写法和今天的新写法一一对照', part: '附录' }
  ];

  const pad = (n) => String(n).padStart(2, '0');
  const href = (n) => `ch${pad(n)}.html`;

  const cur = Number.parseInt(document.body.dataset.chapter || '0', 10);

  /* ---------- 侧边栏 ---------- */
  const side = document.getElementById('sidebar');
  if (side) {
    const brand = '<a class="brand" href="index.html"><span class="flame">O</span>' +
      '<span>Odoo 20 开发入门<small>从开发者模式到生产部署</small></span></a>';
    const links = CHAPTERS.map(({ n, t, part }) =>
      (part ? `<div class="part">${part}</div>` : '') +
      `<a class="ch${n === cur ? ' active' : ''}" href="${href(n)}"><span class="n">${n}</span><span>${t}</span></a>`
    );
    side.innerHTML = brand + links.join('');
    const active = side.querySelector('a.ch.active');
    if (active) setTimeout(() => active.scrollIntoView({ block: 'center' }), 0);
  }

  /* ---------- 移动端菜单 ---------- */
  const btn = Object.assign(document.createElement('button'), {
    id: 'menu-btn',
    type: 'button',
    innerHTML: '&#9776;',
    onclick: () => document.body.classList.toggle('nav-open')
  });
  btn.setAttribute('aria-label', '目录');
  document.body.appendChild(btn);
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = 'odoo-doc-theme';
  const tbtn = Object.assign(document.createElement('button'), {
    id: 'theme-btn',
    type: 'button',
    innerHTML: '&#9789;',
    onclick: () => {
      const root = document.documentElement;
      const now = root.getAttribute('data-theme');
      const dark = now ? now === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
    }
  });
  tbtn.setAttribute('aria-label', '切换深浅色');
  document.body.appendChild(tbtn);
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch {}

  /* ---------- 箭头 marker（全局一次） ---------- */
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  // 注意：SVG marker 的内容不会从引用它的元素继承 color，
  // 所以这里直接用 CSS 变量填色，而不是 currentColor。
  const marker = (id, fill) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="${fill}"/></marker>`;
  defs.innerHTML = `<defs>${marker('ar', 'var(--fg-faint)')}${marker('ar-a', 'var(--accent)')}` +
    `${marker('ar-b', 'var(--blue)')}${marker('ar-g', 'var(--green)')}${marker('ar-p', 'var(--purple)')}` +
    `${marker('ar-r', 'var(--red)')}</defs>`;
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  const main = document.querySelector('main');
  const slot = document.getElementById('chapter-toc');
  if (slot && main) {
    const hs = [...main.querySelectorAll('h2')];
    if (hs.length > 2) {
      const items = hs.map((h, i) => {
        if (!h.id) h.id = `sec-${i + 1}`;
        return `<li><a href="#${h.id}">${h.textContent}</a></li>`;
      });
      slot.className = 'toc';
      slot.innerHTML = `<div class="h">本章目录</div><ol>${items.join('')}</ol>`;
    }
  }

  /* ---------- 代码块：语言标签 + 复制 + 高亮 ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 每一段用正则字面量写，取 .source 拼起来，省掉字符串里的双重转义

  const JS_KW = ('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
    'extends|for|while|of|in|do|try|catch|finally|throw|switch|case|break|continue|' +
    'typeof|instanceof|delete|void|yield|static|null|undefined|true|false|this|super').split('|');

  const RE_JS = new RegExp([
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/.source,                                           // 1 注释
    /(`(?:\\[\s\S]|[^\\`])*`|'(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")/.source,    // 2 字符串
    String.raw`\b(${JS_KW.join('|')})\b`,                                             // 3 关键字
    /\b([A-Z][A-Za-z0-9_]*)\b/.source,                                                // 4 类型/构造器
    /\b(\d+(?:\.\d+)?)\b/.source,                                                     // 5 数字
    /\b([a-zA-Z_$][\w$]*)(?=\()/.source                                               // 6 函数调用
  ].join('|'), 'g');
  const JS_CLASSES = ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];

  const PY_KW = ('def|class|return|if|elif|else|for|while|in|not|and|or|is|import|from|as|with|try|except|' +
    'finally|raise|pass|break|continue|lambda|yield|global|nonlocal|assert|del|None|True|False|self|super|async|await|match|case').split('|');

  const RE_PY = new RegExp([
    /(#[^\n]*)/.source,                                                               // 1 注释
    /((?:[rRbBfFuU]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^\\"\n])*"|'(?:\\.|[^\\'\n])*'))/.source, // 2 字符串
    /(^[ \t]*@[\w.]+)/.source,                                                        // 3 装饰器
    String.raw`\b(${PY_KW.join('|')})\b`,                                             // 4 关键字
    /\b([A-Z][A-Za-z0-9_]*)\b/.source,                                                // 5 类名
    /\b(\d+(?:\.\d+)?)\b/.source,                                                     // 6 数字
    /\b([a-zA-Z_][\w]*)(?=\()/.source                                                 // 7 函数调用
  ].join('|'), 'gm');
  const PY_CLASSES = ['tk-cm', 'tk-st', 'tk-dc', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];

  const RE_XML = new RegExp([
    /(<!--[\s\S]*?-->)/.source,                                                       // 1 注释
    /("[^"<]*"|'[^'<\n]*')/.source,                                                  // 2 属性值
    /(<\/?[\w:.-]+|\/?>)/.source,                                                     // 3 标签
    /([\w:.-]+)(?==)/.source                                                          // 4 属性名
  ].join('|'), 'g');
  const XML_CLASSES = ['tk-cm', 'tk-st', 'tk-kw', 'tk-at'];

  const SH_WORDS = 'sudo|apt|pip|python3|python|git|cd|mkdir|curl|wget|export|source|docker|psql|createdb|dropdb|' +
    'createuser|pg_dump|pg_restore|systemctl|journalctl|nginx|ln|cp|mv|rm|chown|chmod|ls|cat|tail|odoo-bin|odoo|deactivate|uv|tar|rsync';
  const RE_SH = new RegExp(String.raw`(#[^\n]*)|('(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")|(^\s*\$|(?<![\w/.-])(?:${SH_WORDS})(?![\w-]))`, 'gm');
  const SH_CLASSES = ['tk-cm', 'tk-st', 'tk-kw'];

  // CSV / 纯文本 / ini：只着色注释和字符串
  const RE_PLAIN = /([#;][^\n]*)|("(?:[^"]|"")*")/g;
  const PLAIN_CLASSES = ['tk-cm', 'tk-st'];

  const RULES = {
    js: [RE_JS, JS_CLASSES], ts: [RE_JS, JS_CLASSES], javascript: [RE_JS, JS_CLASSES], json: [RE_JS, JS_CLASSES],
    py: [RE_PY, PY_CLASSES], python: [RE_PY, PY_CLASSES],
    xml: [RE_XML, XML_CLASSES], html: [RE_XML, XML_CLASSES],
    bash: [RE_SH, SH_CLASSES], sh: [RE_SH, SH_CLASSES], shell: [RE_SH, SH_CLASSES],
    nginx: [RE_SH, SH_CLASSES]
  };

  function paint(src, re, classes) {
    let out = '';
    let last = 0;
    // 所有分支都至少匹配一个字符，matchAll 不会卡在零宽匹配上
    for (const m of src.matchAll(re)) {
      if (!m[0]) continue;
      out += esc(src.slice(last, m.index));
      const g = m.findIndex((v, i) => i > 0 && v !== undefined);
      out += `<span class="${classes[g - 1]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  document.querySelectorAll('.code').forEach((box) => {
    const pre = box.querySelector('pre');
    if (!pre) return;
    const { lang = '', file = '' } = box.dataset;

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML = `<span class="tag">${esc(file || lang || 'code')}</span>`;
    const cp = Object.assign(document.createElement('button'), {
      className: 'copy',
      type: 'button',
      textContent: '复制'
    });
    const code = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    cp.onclick = () => {
      navigator.clipboard?.writeText(code);
      cp.textContent = '已复制';
      setTimeout(() => { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);

    const [re, classes] = RULES[lang] || [RE_PLAIN, PLAIN_CLASSES];
    pre.innerHTML = paint(code, re, classes);
  });

  /* ---------- 上一章 / 下一章 ---------- */
  const pager = document.getElementById('pager');
  if (pager && cur) {
    const prev = CHAPTERS.find((c) => c.n === cur - 1);
    const next = CHAPTERS.find((c) => c.n === cur + 1);
    const prevLink = prev
      ? `<a class="prev" href="${href(prev.n)}"><span>&larr; 上一章</span>第 ${prev.n} 章 · ${prev.t}</a>`
      : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    const nextLink = next
      ? `<a class="next" href="${href(next.n)}"><span>下一章 &rarr;</span>第 ${next.n} 章 · ${next.t}</a>`
      : '<a class="next ph" href="#">.</a>';
    pager.className = 'pager';
    pager.innerHTML = prevLink + nextLink;
  }

  /* ---------- 首页目录 ---------- */
  const grid = document.getElementById('toc-grid');
  if (grid) {
    grid.className = 'toc-grid';
    grid.innerHTML = CHAPTERS.map(({ n, t, d }) =>
      `<a class="toc-card" href="${href(n)}">` +
      `<div class="n">${n === 16 ? '附录' : `第 ${n} 章`}</div>` +
      `<div class="t">${t}</div>` +
      `<div class="d">${d}</div></a>`
    ).join('');
  }
})();
