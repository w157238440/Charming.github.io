# CharmingLady.github.io

CharmingLady 的个人作品集站点：前端 / 后端 / 小程序三条技术线。纯静态、零框架、零构建、
零外部 CDN——克隆下来起一个静态服务就能看，断网也能看，扔到任何能放静态文件的地方都能跑。

- 站点定位：作品集 + 技术说明 + 合作入口
- 技术栈：手写 HTML + CSS + 原生 JavaScript（无包管理、无打包、无运行时依赖）
- 结构：根目录只放入口与元文件，页面集中在 `pages/`，资源按类型分层放在 `assets/`
- 许可：代码 MIT，文字与图片 CC BY-NC 4.0（见 `LICENSE`）

> **重要声明**：站内所有案例、客户名称、数据、评价、履历年份、联系方式（邮箱 / 微信 / 电话）
> 均为**演示或占位内容**，用于展示页面结构与文案写法，不代表真实业务，也不构成任何要约。
> 完整的边界说明见 **[pages/disclaimer.html](pages/disclaimer.html)**（十六条，逐条写明）。

---

## 一、目录结构

```
CharmingLady.github.io/
├── index.html                 唯一入口：首屏 / 数据 / 能力 / 跑马灯 / 精选项目 / 流程 / 评价 / CTA
├── 404.html                   自定义 404（全部使用根路径 /，见文件头注释）
├── favicon.svg                站点图标（套准标记：外圈 + 十字 + 朱砂点）
├── README.md                  本文件：结构、约定、上线前替换清单
├── LICENSE                    MIT + 内容 CC BY-NC 4.0 附加说明
├── robots.txt                 爬虫规则 + sitemap 指向
├── sitemap.xml                站点地图（上线换成真实域名后再提交）
├── .nojekyll                  告诉 GitHub Pages 不要用 Jekyll 处理（空文件，必须有）
├── .gitignore                 忽略系统与编辑器产生的碎片文件
│
├── pages/                     全部内容页（结构清晰：根目录不再堆 HTML）
│   ├── about.html             关于：头图 / 自述 / 时间线 / 能力条 / 工具链 / 原则
│   ├── projects.html          项目：筛选 + 6 张卡 + 6 个详情弹层模板
│   ├── notes.html             笔记：筛选 + 6 条 + 6 篇全文模板
│   ├── contact.html           联系：联系方式 / 表单 / 合作须知 / FAQ
│   ├── services.html          服务与合作：四类服务 / 三档合作 / 交付物 / 流程 / FAQ
│   ├── lab.html               实验台：8 项可动手的动效演示（Canvas / SVG / 磁吸 / 读数）
│   ├── faq.html               常见问题：16 条问答，分五组（合作 / 报价 / 交付 / 小程序 / 隐私）
│   ├── guestbook.html         留言簿：读留言（检索 + 标签筛选）/ 写留言（存本机）/ 导出并并入源码 / 边界声明
│   ├── uses.html              装备与工具：机器配置、软件清单、技术栈与选择理由
│   ├── colophon.html          站点说明：硬约束、目录结构、五层 CSS、动效清单、运行与校验、许可
│   └── disclaimer.html        免责声明：十六条，说清「这是什么、不是什么」
│
├── assets/                    所有资源，按「类型」分层，不按「页面」分
│   ├── css/
│   │   ├── base.css           第 1 层：设计令牌、重置、排版基线、工具类
│   │   ├── layout.css         第 2 层：页头、抽屉、区块骨架、栅格、页脚
│   │   ├── components.css     第 3 层：按钮、卡片、时间轴、弹层、表单、手风琴
│   │   ├── effects.css        第 4 层：动效与装饰（入场、光斑、噪点、环形进度）
│   │   └── pages.css          第 5 层：页面独有版式（价目表 / 演示槽位 / 名录行 / 条款）
│   ├── js/
│   │   ├── core.js            命名空间 CL、主题、导航、进度条、回顶、年份
│   │   ├── effects.js         12 个动效模块（reveal / 数字 / 打字机 / 光斑 / 磁吸 /
│   │   │                      tilt / 视差 / 能力条 / 逐字 / 描边 / 环形进度 / 极光）
│   │   ├── ui.js              弹层单例、手风琴、筛选器（导出 CL.ui）
│   │   ├── projects.js        项目卡 → 详情弹层
│   │   ├── notes.js           笔记卡 → 全文弹层
│   │   ├── contact.js         表单校验 + 生成邮件草稿
│   │   ├── lab.js             实验台专用：Canvas 波形 / 光标读数 / 演示提示条
│   │   └── guestbook.js       留言簿：SEED 种子留言 + localStorage 本机留言 + 检索 + 导出 JSON
│   ├── img/                   8 张配图，全部本地化（压缩后共约 2.8 MB）
│   └── fonts/                 预留目录（本站刻意不使用 webfont，保持零外部请求）
│
├── docs/                      写给「接手的人」
│   ├── deploy-guide.md        部署手册：三种托管 + 自定义域名 + 子路径 + 排错
│   └── structure.md           结构与代码约定：CSS 分层、JS 命名空间、如何加页面/项目
│
└── .github/
    └── workflows/
        └── pages.yml          GitHub Actions 自动部署（push 到 main 即发布）
```

**为什么这样分**：GitHub Pages 要求入口 `index.html` 在发布根目录，所以它必须留在根；
其余页面收进 `pages/`，资源收进 `assets/`（再按 css / js / img / fonts 分层），
文档收进 `docs/`。结果是根目录只剩「入口 + 元文件」，加页面时不会和资源混在一起，
接手的人也能在 10 秒内判断该去哪找东西。

---

## 二、本地怎么看

推荐起一个本地静态服务（`file://` 直接双击也能看，但部分浏览器策略对 `file://` 更严格）：

```bash
# 在项目根目录执行（Python 3 自带，无需安装任何东西）
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

Windows 上如果 `python` 不是命令，试 `py -m http.server 8080`。
换端口只需改数字（例如被占用时用 8090）。

---

## 三、页面与技术要点

### 1. 视觉系统（颜色、字体、栅格）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--ink` | `#0f1714` | 墨绿近黑：正文、深色块底色、代码窗口 |
| `--paper` | `#f4f3ed` | 纸白：页面底色 |
| `--accent` | `#a6402b` | 朱砂：强调、链接、时间轴圆点、进度 |
| `--jade` | `#2f6f5e` | 青绿：次级强调、波形曲线 |
| `--line` / `--line-strong` | 半透明墨色 | 发丝线与分隔 |

- 字体：**不做 webfont**。中文走系统字体栈，数字与代码走等宽。
  好处是没有字体加载阻塞，也不会有字重跳变；代价是不同系统字形略有差异。
- 圆角只有 2~3px，全站**零阴影**：层次靠发丝线、底色差与留白。
- 栅格：内容最大宽度 1180px（≥1600px 时 1320px），左右留白 `clamp(20px, 5vw, 40px)`。
- 深色主题只替换令牌值与 accent（提亮到 `#c4553c`），不重写组件；
  代码窗口与深色区块在深色主题下仍保持深底浅字，不跟着翻成纸白。

### 2. 动效（用户要求「越多越好」，但守一条底线）

底线：**不在每个区块重复「淡入上滑」**。首屏是一次编排（6 层依次入场），
其余每个模块只用**一种**特效；所有动效只做一次，滚回去不重播。

| 模块 | 特效 | 实现位置 |
| --- | --- | --- |
| 首屏 | 分层入场：眉标 → 名字 → 打字机 → 导语 → 按钮 → 元信息 | `effects.css` `data-enter` |
| 首屏背景 | orbs 漂移 + 网格底纹 + 随滚动移动的极光带 | `.hero::after` + `initHeroDrift` |
| 全局 | 鼠标光斑（lerp 跟随）、纸纹噪点、顶部滚动进度条 | `effects.js` / `core.js` |
| 数据带 | 数字滚动（easeOutExpo，支持前后缀 / 小数 / 千分位） | `[data-count]` |
| 跑马灯 | 两行反向滚动，悬停暂停 | `.marquee-track--rev` |
| 区块 | IntersectionObserver 入场（5 种起始态） | `[data-reveal]` |
| 标题 | 逐字上浮入场（读屏读原文，不逐字念） | `[data-split]` |
| 按钮 | 磁吸（指针进入 ±4px 偏移） | `[data-magnetic]` |
| 卡片 | 3D 倾斜（最大 6°）+ 顶部朱砂线扫过 | `.tilt` / `.case::after` |
| 能力条 | 进入视口后 80ms 递进填充 | `.meter-fill[data-value]` |
| 线条 | SVG 描边绘制（dashoffset 归零） | `[data-draw]` |
| 回顶按钮 | 环形滚动进度（conic-gradient） | `.to-top::before` + `initRing` |
| 弹层 | 缩放 + 透明度入场，遮罩渐显 | `.dialog` + `dialog-in` |
| 实验台 | Canvas 正弦波形（可暂停 / 离屏停画） | `assets/js/lab.js` |

全部动效都遵守 `prefers-reduced-motion: reduce`：命中时一次性关闭（不做成「慢一点」），
并且把「起始隐藏」一并取消，保证内容始终可见。

### 3. 主题

- 默认跟随系统偏好（`prefers-color-scheme`），用户手动切换后写入 `localStorage["cl-theme"]` 并优先使用。
- 切换时同步 `<meta name="theme-color">`，移动端状态栏颜色跟着变。
- 深色区块（首页 CTA、页脚）**始终是深色**，不因切换主题变成浅块。

### 4. 可访问性

- 全站键盘可达：`Tab` 顺序自然、焦点环 2px 朱砂、`Esc` 关闭弹层与抽屉、抽屉打开时锁滚动。
- 弹层是单例 `<dialog>`：有 `aria-label`、关闭后焦点回到触发元素、`#case-xxx` 深链可分享。
- 装饰层（噪点、光斑、orb、跑马灯、波形画布）全部 `aria-hidden` 或带替代标签，不干扰读屏。
- 图片都有 `alt` 与 `width` / `height`，避免加载时抖动。

### 5. 表单

`pages/contact.html` 的表单**不会向任何服务器提交**（静态站没有后端）。提交时 `contact.js`：

1. 逐字段校验（姓名 / 邮箱 / 类型 / 需求描述），错误写在字段下方并标红；
2. 校验通过后拼一封 `mailto:` 草稿（正文含所有字段）；
3. 显示反馈面板与「打开邮件客户端发送」按钮。

要接真实接口，改 `assets/js/contact.js` 末尾标注 `[接口接入点]` 的那一段，把
`window.location.href = mailto` 换成 `fetch`。

### 6. 留言簿（`pages/guestbook.html` + `assets/js/guestbook.js`）

纯静态站没有后端，所以留言簿是**两层结构**，页面上也把这条边界原样写了出来（第 04 节）：

| 层 | 存在哪 | 谁能看见 | 活多久 |
| --- | --- | --- | --- |
| 种子层 | `guestbook.js` 顶部的 `SEED` 数组（10 条虚构留言） | **所有访客** | 与文件同寿：跟着站点一起部署，是源码不是数据 |
| 本机层 | `localStorage["cl-guestbook-v2"]`（上限 200 条） | 只有写入的那台设备 / 那个浏览器 | 清缓存、换设备、隐私模式都会丢 |

要让一条新留言也变成「别人能看到」的，只有一条路：导出 JSON → 把对象粘进 `SEED` → 提交代码 → 重新部署。
页面第 03 节把这三步、按钮（`#gb-export` / `#gb-copy`）和代码窗预览都摆出来了，不用另写文档。

检索逻辑：关键词同时匹配称呼 / 身份 / 城市 / 标签 / 正文 / 日期，再与标签片（全部 / 合作过 / 技术交流 / 建议 / 闲话）
取交集；输入 80ms 防抖，Esc 清空；`#gb-count` 实时报「共 N 条，其中本机新增 M 条，当前显示 K 条」。

安全约束：**用户输入一律走 `textContent`，禁止 `innerHTML`**——这是本页唯一的注入面，注释里也标了红线。
存储读写全部包在 `try/catch` 里（隐私模式、配额满都不报错，只是留不下来），写入失败会回滚内存里的那条并给出提示。

---

## 四、上线前必须替换的占位内容

| 位置 | 现在是什么 | 要改成 |
| --- | --- | --- |
| 页脚 / `pages/contact.html` | `hi@charminglady.dev` | 你的真实邮箱 |
| `pages/contact.html` | 微信 `charminglady`、电话 `010-0000-0000` | 你的真实联系方式 |
| `index.html` / 各页 `og:image` | 相对路径 `assets/img/*.jpg` | `https://你的域名/...` 绝对地址（社交平台不解析相对路径） |
| `sitemap.xml` / `robots.txt` | `https://charminglady.github.io/` | 你的真实域名 |
| 各页 `<meta name="author">` | CharmingLady | 如需真名可替换 |
| `pages/disclaimer.html` 第 04 条 | 「联系方式和身份为占位」 | 换成真实信息后同步改写这条 |
| `pages/services.html` | 价格区间与周期 | 你的真实报价（或保留「演示数据」声明） |
| 各页「内容为演示」声明 | 演示口径 | 换成真实案例后删掉对应句子 |

---

## 五、部署

三种方式、自定义域名、子路径部署与排错清单见 **[docs/deploy-guide.md](docs/deploy-guide.md)**。

1. **GitHub Actions（推荐）**：仓库 Settings → Pages → Source 选 `GitHub Actions`，
   推到 `main` 后由 `.github/workflows/pages.yml` 自动发布。
2. **分支直出**：Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`。
3. **其他静态托管**：Vercel、Netlify、Cloudflare Pages、任意 Nginx——把整个目录当根目录上传即可，无需构建。

必须保留 `.nojekyll`；否则 GitHub Pages 的 Jekyll 会跳过以 `_` 开头的路径。
若部署在**子路径**（例如 `https://example.com/site/`），要把 `404.html` 里所有 `/` 开头的
链接改成 `/site/` 开头，其余页面的相对路径无需改动（见部署手册第 5 节）。

---

## 六、常见改动指引

- **改导航 / 页脚**：这些区块在 13 个页面各有一份副本（纯静态的取舍：零依赖换掉运行时拼装）。
  仓库外的脚手架脚本已用于首次统一生成，后续手工修改需**同时改 13 处**（含 `404.html` 的入口列表），
  改完用 `docs/structure.md` 里的自检清单逐项确认（导航项、`data-nav` 值、抽屉编号、页脚日期）。
- **加一个页面**：在 `pages/` 复制一个现有页面 → 改 `<title>` / `description` / `body[data-page]`
  → 页头导航与抽屉各加一项（13 处都要加）→ 在 `sitemap.xml` 补一条 URL。
- **加一个项目**：复制 `projects.html` 里一段 `<a class="case">` 与一段 `<template id="tpl-case-xxx">`，
  保持 `data-slug` 与模板 id 一一对应；筛选 chip 的计数由 `ui.js` 自动统计，无需手改。
- **加一篇笔记**：同上，卡片 `data-note="id"` ↔ `tpl-note-id`。
- **换配色**：只改 `base.css` 的 `:root` 与 `[data-theme="dark"]` 里的令牌值，组件里不写死颜色。
- **调节奏**：区块间距统一由 `layout.css` 的 `.section` / `.section--tight` 控制，不要逐块加 margin。
- **加动效**：先在 `effects.css` 写状态，再在 `effects.js` 加一个 `initXxx` 并注册进 `boot()`；
  新动效要么遵守 `reduced` 开关，要么说明为什么不遵守。

---

## 七、实机验收记录（踩过并已修的坑）

这些都是用真实浏览器逐页看过之后才发现的问题，写在这里是为了不再踩第二次：

| 现象 | 原因 | 修法 |
| --- | --- | --- |
| 整页发灰、文字对比度低，浅色主题像蒙了层纱 | `.grain` 噪点层用了 `z-index: 1`，配 `mix-blend-mode: multiply`，压在文字**上面** | 改成 `z-index: -1`：沉到 body 背景之上、正文之下；浅色 `opacity: .18`、深色 `.09` |
| 禁用 JS 或脚本 404 时，整页只剩背景，正文全空 | `[data-reveal]` 无条件 `opacity: 0`，只有 JS 打上 `.is-in` 才显示 | 每页 `<head>` 首行写 `document.documentElement.classList.add('js')`，CSS 选择器改成 `.js [data-reveal]`；已经写在 12 个页面里 |
| 首页能力区的说明文字逐字竖排（一个字一行） | `.service li` 用了 `grid-template-columns: 12px 1fr`，`<span class="mono">` 后面的裸文本被当成匿名 grid item，落进 12px 那一列 | 改成「块级 + 绝对定位短横线 + 左内边距」，文本按容器宽度正常折行 |
| 装备页名录行整体右移、说明窄成一列 | `.use-row` 只声明了两列却未给子项定位，`<p>` 被自动流放进 `auto` 列 | 逐项写 `grid-column / grid-row`：标题与说明占第 1 列，标记固定第 2 列并跨两行 |
| 关于页头图在真实浏览器里完全不显示（关掉动效才看得见） | `data-reveal="clip"` 的初始态是 `clip-path: inset(0 0 100% 0)`，浏览器把自身 clip-path 也算进相交矩形，`intersectionRect` 变成 0×0、`isIntersecting` 恒为 false，揭示类永远等不到 | `initReveal` 对 clip 类型改为观察没有被裁剪的父元素；另加「首帧已在视口就立即显示」的兜底 |
| 深色主题下代码窗口变浅底浅字 | `.code-window` 用 `background: var(--ink)`，深色主题把 `--ink` 翻成了纸白 | 在 `components.css` 加 `[data-theme="dark"] .code-window`，固定深墨底 + 浅字 + 本地线条变量 |
| 375px 上页头挤成两行、主题按钮「深色」竖排 | 品牌副标 + 按钮文字都不允许收缩 | `< 480px` 隐藏 `.brand-sub`；`.theme-toggle` 加 `white-space: nowrap` |
| 首屏下缘到数据带之间空出约 165px | `.hero` 底 padding 80px 叠上数据带 64px | hero 底 padding 收到 `clamp(20px, 3vw, 36px)`，合计 56–100px |
| 页脚/联系页电话号码是 `0830` 区号 | 早期按南方城市写的占位 | 统一改成北京 `010-0000-0000`，与「地址一律北京」的口径一致 |
| 页脚链接一悬停文字就消失（截图里像被挖了个洞） | `.footer-col a:hover` 用了 `color: var(--paper)`；而 `.site-footer` 为了做反色块，把 `--paper` 重写成了页脚自己的深底，悬停色 = 背景色 | 悬停改用固定浅色 `#f4f3ed` + 下划线（下划线颜色另给 40% 透明度），不再依赖被改写的变量 |
| 留言簿入口不明显：只有抽屉和页脚能看到 | 新页只进了抽屉（08）与页脚「更多」，主导航仍是 6 项 | 主导航补第 7 项「留言簿」；首页在「合作方怎么说」之后加一条两栏入口带（说明 + 「去留言簿」按钮 + 「直接写一条」强调链接） |
| 留言簿里「全部」片、检索框在浅色截图里像空白 | 截图时主题正在切换（深色变量 + 浅色底混了一帧），并非真实缺陷 | 换新 profile、单独跑浅色探针页复核：检索框边框、占位文案、`全部` 反色选中态、留言卡在两种主题下都清晰；探针页用完即删 |

复验方式（不需要装任何东西）：

```bash
python -m http.server 8090            # 起服务
# 浏览器逐页点：/ 与 /pages/*.html
# 想跳过入场动画直接看最终布局：系统或浏览器里打开「减少动态效果」即可
```

---

## 八、致谢与说明

- 排版思路受「瑞士式栅格 + 中文正文行长控制」影响；动效刻意避开 `data-aos` 式的全站铺量。
- 所有配图由 AI 生成后再本地压缩，画面内不含文字，避免生成文字出错。
- 站点不采集访问数据：没有埋点、没有统计 SDK、没有第三方 Cookie；主题偏好只存本地。
- 内容边界、素材授权、隐私与技术性免责，全部写在 `pages/disclaimer.html`，不在别处另立说法。

MIT © CharmingLady
