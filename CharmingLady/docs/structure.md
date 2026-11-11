# 结构与代码约定

这份文档解释三件事：文件为什么这么放、CSS / JS 各层管什么、加内容时该动哪里。
目标是让接手的人**不用问作者**也能改。

---

## 1. 分层的理由

站点刻意不引框架、不引构建工具。代价是「重复的页头页脚要手动同步」，收益是：

- 克隆下来直接能开，不需要 `npm install`；
- 没有 node_modules，没有版本冲突，也没有「构建失败」这一类问题；
- 任何静态托管都能跑，包括没有 Node 环境的对象存储。

因此文件按**职责**分层，而不是按**页面**分：

```
根目录              只放入口（index.html / 404.html）与元文件，保持清爽
页面（pages/）      一页一个 HTML；页面之间同目录互链，回首页用 ../index.html
样式（assets/css）  五个文件，加载顺序就是层级顺序
脚本（assets/js）   八个文件，靠 window.CL 命名空间协作
资源（assets/img）  图片按下标命名，文件名用用途命名
文档（docs）        写给人看的说明，不参与构建
```

根目录只保留 10 项：`index.html`、`404.html`、`favicon.svg`、`README.md`、`LICENSE`、
`robots.txt`、`sitemap.xml`、`.nojekyll`、`.gitignore`，再加四个目录（`pages/`、`assets/`、`docs/`、
`.github/`）。加页面、加图片都不会让根目录变长。

---

## 2. CSS 五层

加载顺序在 HTML 里写死，顺序错了样式就会被覆盖。根目录页面用 `assets/...`，
`pages/` 里的页面用 `../assets/...`：

```html
<link rel="stylesheet" href="assets/css/base.css">        <!-- 1 令牌与重置 -->
<link rel="stylesheet" href="assets/css/layout.css">      <!-- 2 版式骨架 -->
<link rel="stylesheet" href="assets/css/components.css">  <!-- 3 组件 -->
<link rel="stylesheet" href="assets/css/effects.css">     <!-- 4 动效 -->
<link rel="stylesheet" href="assets/css/pages.css">       <!-- 5 页面独有版式 -->
```

| 文件 | 只管什么 | 绝不放什么 |
| --- | --- | --- |
| `base.css` | `:root` 设计令牌、重置、正文排版、`.shell` / `.sr-only` / `.skip-link` / `.eyebrow` | 具体组件的样式 |
| `layout.css` | 页头、抽屉、区块间距、栅格（`.grid-2/3/4`、`.grid-cases`）、页脚、断点 | 按钮、卡片外观 |
| `components.css` | 按钮、筛选片、代码窗口、项目卡、时间轴、能力条、弹层、表单、手风琴、笔记卡 | 版式间距、动效、页面独有版式 |
| `effects.css` | 入场、逐字、描边、光斑、磁吸、倾斜、视差、噪点、环形进度、极光、降级 | 组件的基础外观 |
| `pages.css` | 价目表（`.tier*`）、实验台槽位（`.demo*`、`.wave`、`.hud`）、装备名录（`.use-*`）、条款排版（`.legal*`）、提示条 `.toast` | 通用组件（应当在 components 里） |

改配色的唯一入口是 `base.css` 的 `:root`：

```css
:root {
  --ink: #0f1714;      /* 墨绿近黑 */
  --paper: #f4f3ed;    /* 纸白 */
  --accent: #a6402b;   /* 朱砂 */
  --jade: #2f6f5e;     /* 青灰绿 */
}
[data-theme="dark"] { /* 翻转 + 提亮 accent */ }
```

**不要**在组件里写 `#a6402b` 这样的字面值，否则主题切换会出现「一处不变」的破口。
唯一例外是深色区块（`.section--dark`、`.site-footer`）：它们把 `--ink` / `--paper` / `--line`
整体翻成本地变量，且底色写死为 `#0f1714`，保证在深色主题下仍然是深色块，而不是变成浅色块。

---

## 3. JS 八个文件

所有脚本 `defer` 加载，按书写顺序执行，共用 `window.CL` 命名空间：

```js
window.CL = {
  $, $all, rafThrottle, prefersReduced, isFinePointer,  // core.js 提供的工具
  ui: { openDialog, closeDialog, replaceState },         // ui.js 提供的弹层 API
};
```

| 文件 | 职责 | 依赖 |
| --- | --- | --- |
| `core.js` | 命名空间与工具、主题初始化与切换、抽屉导航、吸顶、导航高亮、滚动进度、回顶、年份 | 无 |
| `effects.js` | reveal、数字滚动、打字机、光斑、磁吸、倾斜、视差、能力条、逐字、描边、环形进度、极光 | `core.js` |
| `ui.js` | `<dialog>` 单例、手风琴、筛选器 | `core.js` |
| `projects.js` | 项目卡 → `tpl-case-*` 弹层 | `ui.js` |
| `notes.js` | 笔记卡 → `tpl-note-*` 弹层 | `ui.js` |
| `contact.js` | 表单校验 → `mailto` 草稿 → 反馈面板 | `core.js` |
| `lab.js` | 实验台：Canvas 波形、光标读数、演示提示条（只在本页加载） | `core.js` |
| `guestbook.js` | 留言簿：`SEED` 种子留言、localStorage 本机层、关键词 + 标签检索、表单校验、导出 JSON（只在本页加载） | 无（自带小工具，不强依赖 `core.js`） |

新增页面时，至少加载 `core.js`；有动效加 `effects.js`；有弹层或筛选加 `ui.js`。
顺序必须是 `core → effects → ui → 页面脚本`，因为后三者启动时会读 `core` 暴露的工具。

### 3.1 弹层协议（`ui.js`）

只有一个 `<dialog class="dialog">` 实例，内容按需从 `<template>` 克隆进来：

```html
<dialog class="dialog" aria-label="项目详情"></dialog>

<template id="tpl-case-shiguang"> … </template>
```

```js
CL.ui.openDialog("tpl-case-shiguang", triggerEl, "shiguang"); // 第三参数用于 #case-shiguang 深链
```

行为约定（改动时别破坏这几条）：

- 打开时锁 body 滚动，`ESC` 与点遮罩都能关；
- 关闭后焦点**回到触发元素**，键盘用户不会丢失位置；
- 带 `#case-xxx` 打开页面时自动弹出对应弹层，关闭时把 hash 清掉；
- 同一个弹层正在打开时不重复克隆，避免内容闪烁。

### 3.2 筛选协议（`ui.js`）

```html
<div class="filters" data-filter-group data-filter-target="[data-case]">
  <button class="chip" data-filter="all">全部 <span class="chip-count">6</span></button>
  <button class="chip" data-filter="前端">前端 <span class="chip-count"></span></button>
</div>

<a class="case" data-case data-cats="前端 全栈"> … </a>
```

- `data-cats` 用空格分隔多个分类；
- 每个 chip 的 `.chip-count` 由脚本自动统计填入，**不要手写数字**（除「全部」可写初始值）；
- 筛选后显示 `<span data-filter-count>`，全空时显示 `[data-filter-empty]`。

---

## 4. 动效的属性约定（`effects.js`）

| 属性 | 作用 | 可选值 |
| --- | --- | --- |
| `data-enter="1…6"` | 首屏分层入场序号 | 1–6 |
| `data-reveal` | 进入视口时入场 | 空（默认上滑）/ `clip` / `scale` / `blur` / `left` |
| `data-delay="80"` | 入场延迟毫秒 | 0–300 |
| `data-count="46"` | 数字滚动目标值 | 整数 / 小数 |
| `data-count-suffix="+"` | 滚动后追加后缀 | 文本 |
| `data-count-decimals="1"` | 保留小数位 | 0–2 |
| `data-count-sep="1"` | 千分位分隔 | 1 / 0 |
| `data-typewriter` + `data-type-items="A|B|C"` | 打字机轮播，`\|` 分隔 | 文本 |
| `data-magnetic` | 磁吸偏移（±4px） | 无值 |
| `data-parallax="0.12"` | 视差系数（写入 `--py`） | 0.05–0.2 |
| `data-value="92"` | 能力条目标百分比 | 0–100 |
| `data-split` | 标题逐字入场（原文写进 `aria-label`） | 无值 |
| `data-draw` | SVG 路径描边绘制（`getTotalLength()` 写入 `--len`） | 无值 |
| `.to-top` 上的 `--ring` | 回顶按钮环形进度 | 0–100（脚本写入） |

`prefers-reduced-motion: reduce` 命中时，`effects.css` 会关闭所有关键帧与位移，
`effects.js` 的 `prefersReduced()` 会跳过光斑、磁吸、倾斜与视差。**新增动效必须同时遵守这两处。**

---

## 5. 加内容的操作步骤

### 加一个项目

1. 复制 `projects.html` 里任意一段 `<a class="case" …>`，改 `data-slug`、`data-cats`、标题、图片；
2. 复制对应 `<template id="tpl-case-xxx">`，把 id 改成 `tpl-case-<新 slug>`；
3. 图片放进 `assets/img/`，建议 1200×900，压缩后 ≤ 400KB；
4. 无需改 JS：筛选计数自动统计，卡片与模板靠 `data-slug` ↔ `id` 对应。

### 加一篇笔记

同上，把 `data-note="id"` 与 `tpl-note-id` 对上即可。

### 加一个页面

1. 复制 `pages/about.html` 作为骨架（它含完整的页头、页脚、装饰层与 `../` 前缀路径）；
2. 改 `<body data-page="新值">`，并在导航里加一项 `data-nav="新值"`；
3. 改 `<title>`、`<meta name="description">`、`og:` 三项；
4. 页头、抽屉、页脚在 13 个页面里各有一份，不要手改：改 `_tmp/nav_inject.py` 里的
   `TARGETS` / `NAV` / `DRAWER` 模板后重跑一次，脚本会把页头（7 项）、抽屉（12 项）、
   页脚（4 栏）统一写进所有页面（幂等，可反复跑）；`404.html` 不在注入范围内，它的
   入口列表要手工补一行；
5. 若页面需要弹层 / 筛选，把 `ui.js` 加进脚本列表；若需要页面独有版式，写进 `pages.css`；
6. 在 `sitemap.xml` 补一条 `<url>`，`lastmod` 写真实修改日期；`_tmp/validate.py` 的
   `PAGES` 也要加一行，否则自检不会覆盖新页。

---

## 6. 命名与书写约定

- 文件与目录：全小写、连字符分隔（`deploy-guide.md`、`hero-desk.jpg`）；HTML 页面用语义名，不用 `page1.html`。
- CSS 类：组件用名词（`.case`、`.meter`），状态用 `is-*`（`.is-open`、`.is-on`、`.is-invalid`），工具用短横线组合（`.btn--ghost`）。
- JS：函数用动词开头（`initTheme`、`openDialog`），常量全大写，事件处理器以 `on` 开头。
- HTML：一个区块前加一行注释说明它的作用；页面顶部保留文件头注释（写清本页结构与外部依赖）。
- 中文文案：正文标点用全角，技术名词保留英文原样；数字与单位之间不加空格（`7 年`、`120ms` 属排版约定，保持统一即可）。

---

## 7. 五条渲染硬约束（别改坏）

1. **`.js` 守卫**：每个页面 `<head>` 第一行是
   `<script>document.documentElement.classList.add('js');</script>`，
   `effects.css` 里所有「入场初始态」都写成 `.js [data-reveal] { opacity: 0 }`。
   加新页面必须带上这一行，否则禁用 JS 的人会看到整页空白。
2. **噪点层必须在内容之下**：`.grain` 是 `position: fixed; z-index: -1`。
   一旦写成正值，`mix-blend-mode` 会把整页文字压灰——这是已经踩过的坑。
3. **窄屏页头只留名字**：`< 480px` 时 `.brand-sub` 隐藏、主题按钮 `white-space: nowrap`，
   否则 375px 上品牌副标会换行、按钮里的「深色」会竖排。
4. **列表里别用「裸文本 + 多列 grid」**：`.service li` 与 `.use-row` 都踩过同类的坑——
   一个 `grid-template-columns` 里如果只写了列宽、没给子项定位，裸文本节点会被当成
   匿名 grid item 塞进那一条窄列，表现为「整段文字一字一行」或「内容只剩半宽」。
   正确做法是逐项写 `grid-column / grid-row`，或者干脆用块级 + 定位装饰。
5. **别用 `clip-path` 当「等待揭示」的初始态却观察元素自己**：`data-reveal="clip"`
   的初始态把可见面积裁成 0，而浏览器计算 IntersectionObserver 相交矩形时会把自身
   clip-path 算进去，于是 `intersectionRect` 为 0×0、`isIntersecting` 恒 false，
   元素被自己藏死（关于页头图踩过这个坑）。`initReveal` 已对 clip 类型改为观察父元素，
   并保留「首帧在视口内就直接显示」的兜底；新增同类动效时请沿用这套写法。

---

## 8. 已知取舍

| 取舍 | 原因 | 影响 |
| --- | --- | --- |
| 页头页脚在每页各复制一份 | 无构建、无框架 | 改导航要改 13 处（`index.html` + `pages/` 十一页；`404.html` 的入口列表单独手改。统一注入脚本 `_tmp/nav_inject.py` 别手改） |
| 项目详情用 `<template>` 内联 | `file://` 下不能 `fetch` 本地文件 | 单页 HTML 体积偏大（约 23KB） |
| 留言簿分「种子层 + 本机层」 | 纯静态站没有后端，也没有数据库 | 访客自己写的留言只有本机可见；要让所有访客看到，必须导出 JSON 并进 `SEED` 后重新部署 |
| 不用 webfont | 避免字体加载阻塞与跨平台字重跳变 | 排版气质依赖系统字体 |
| 详情弹层而非独立页面 | 少一次页面跳转，阅读连贯 | 详情内容不被搜索引擎单独收录 |
| 表单不提交到服务器 | 静态站无后端 | 需要用户手动发信，或接第三方表单服务 |
| 页面集中到 `pages/` | 根目录清爽、符合中大型项目习惯 | 页内路径要多一层 `../` |
| 免责声明写成独立页而非一句注脚 | 内容为演示性质，需要逐条说明边界 | 多一个页面、多一份维护责任 |

这些取舍都写在这里，是为了让下一个人知道「这不是没想到，是想过了」。
