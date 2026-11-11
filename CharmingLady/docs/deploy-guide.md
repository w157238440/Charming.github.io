# 部署手册 · CharmingLady.github.io

写给第一次把站点发到线上的人。按顺序做完，每一步都给了「怎么验证它真的成了」。

---

## 0. 上线前的五分钟自检

先把这五项过一遍，能省掉后面一半的排错时间。

| 检查项 | 怎么做 | 通过标准 |
| --- | --- | --- |
| 入口在根目录 | 确认 `index.html` 与 `assets/`、`pages/` 同级 | 打开仓库首页就能看到 `index.html`，不是套在某个子文件夹里 |
| 页面在 `pages/` | 确认 11 个内容页都在 `pages/` 里 | 根目录不应再出现 `about.html` 之类的散落页面 |
| `.nojekyll` 存在 | 根目录找隐藏文件 | 文件存在且为空；缺了它 GitHub Pages 会用 Jekyll 处理，忽略 `_` 开头的路径 |
| 大小写一致 | 页面里的 `src` / `href` 与磁盘上的文件名逐字对比 | Linux 服务器**区分大小写**，`Hero-Desk.jpg` 写成 `hero-desk.jpg` 本地能过、线上 404 |
| 路径是相对的 | 根页面写 `assets/css/base.css`，`pages/` 里的页面写 `../assets/css/base.css` | 不要以 `/` 开头（`404.html` 例外，见第 4 节） |
| 图片体积 | `assets/img/` 总计 | 首屏图 ≤ 600KB，其余 ≤ 400KB；总量控制在 3MB 内比较稳 |

本地起服务验证一次，别只看 `file://`：

```bash
python -m http.server 8080
# 浏览器打开 http://localhost:8080，逐个点：导航、筛选、项目弹层、笔记弹层、表单、主题切换
```

---

## 1. 方式 A：GitHub Actions 自动部署（推荐）

适合「以后还会经常改」的站点。每次 push 自动发布，不用手动点。

### 1.1 推到仓库

```bash
cd CharmingLady.github.io
git init
git add .
git commit -m "init: CharmingLady portfolio site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 仓库名建议就叫 `<你的用户名>.github.io`。这样站点地址是 `https://<用户名>.github.io/`，
> 部署在**域名根目录**，所有以 `/` 开头的路径也能正常工作。用别的仓库名会部署到
> `https://<用户名>.github.io/<仓库名>/` 这个**子路径**，需要额外处理（见第 4 节）。

### 1.2 打开 Pages 的 Actions 来源

仓库 → **Settings** → **Pages** → **Build and deployment** → **Source** 选 **GitHub Actions**。

这一步不做，工作流跑到部署环节会报
`Get Pages site failed. Please verify that the repository has Pages enabled`。

### 1.3 工作流做了什么

`.github/workflows/pages.yml` 只有两个 job：

1. `build`：把整个目录打包成 Pages 需要的 artifact（没有构建步骤，因为站点是纯静态的）；
2. `deploy`：把 artifact 发布到 Pages 环境。

它需要三个权限，文件里已经写好：`contents: read`、`pages: write`、`id-token: write`。
如果你的组织策略禁用了 `id-token`，部署会失败，需要找管理员开。

### 1.4 验证

- 仓库 → **Actions** 标签页，看到绿色对勾；
- **Settings → Pages** 顶部出现 `Your site is live at https://...`；
- 打开那个地址，检查 `/`、`/pages/about.html`、`/pages/projects.html`、`/pages/lab.html` 都能进。

首次发布通常 1–2 分钟；如果 5 分钟还没好，去看 Actions 日志里的具体报错（第 6 节有对照表）。

---

## 2. 方式 B：分支直出（最省事）

不想用 Actions 就走这条。

1. 仓库 → **Settings** → **Pages**；
2. **Source** 选 **Deploy from a branch**；
3. **Branch** 选 `main`，目录选 **`/ (root)`**，保存；
4. 等 1 分钟左右，页面顶部会出现访问地址。

之后每次 `git push`，Pages 会在 1 分钟内重新发布。缺点是：没有构建日志，出问题只能靠猜。

---

## 3. 方式 C：其他静态托管

站点没有任何构建依赖，把**整个目录**当根目录上传即可。

| 平台 | 关键设置 |
| --- | --- |
| Vercel | 新建项目 → Framework 选 **Other** → Build Command 留空 → Output Directory 填 `.` |
| Netlify | 拖拽文件夹即可；若用 Git，Build 留空、Publish directory 填 `.` |
| Cloudflare Pages | Build 留空、输出目录 `.`；记得在 Rules 里配置 404 页面 |
| 阿里云 OSS / 腾讯云 COS | 开启「静态网站托管」，默认首页 `index.html`，默认 404 填 `404.html` |
| 自建 Nginx | 见下面的最小配置 |

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/charminglady;      # 站点目录
    index index.html;

    # 关键一行：找不到文件时回落到 404 页，而不是 Nginx 默认页
    error_page 404 /404.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # 静态资源缓存：让 CSS / JS / 图片在客户端留久一点
    location ~* \.(css|js|jpg|jpeg|png|svg|webp)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

---

## 4. 子路径部署（仓库名不是 `<用户名>.github.io` 时）

此时站点地址是 `https://<用户名>.github.io/<仓库名>/`，根路径 `/` 指向的是**域名根**，不是你的站点。
会出现：首页能开、CSS 全丢、跳转跑到别人的页面。

三种解法，任选其一：

1. **最简单**：把仓库改名为 `<用户名>.github.io`，重新部署，地址变成域名根，什么都不用改。
2. 把所有以 `/` 开头的引用改成相对路径。本项目除 `404.html` 外**全部已是相对路径**，只需处理 404：
   把 `404.html` 里的 `/assets/...`、`/pages/about.html`、`/pages/services.html` 等
   统一加上前缀，改成 `/你的仓库名/assets/...`、`/你的仓库名/pages/...`。
   （`pages/` 里的页面本身就是相对路径，不用动。）
3. 加一行 `<base href="/你的仓库名/">` 到每个页面的 `<head>`，再统一用相对路径。
   注意 `<base>` 会影响所有相对链接，包括 `href="#case-xxx"` 这类锚点，需逐个验证。

> 本项目 `404.html` 刻意使用根路径，是因为 GitHub Pages 在任意层级命中 404 时都会渲染它，
> 那时「当前目录」是不确定的，相对路径会算错。若你走子路径部署，必须按上面的第 2 条改。

---

## 5. 自定义域名

### 5.1 加 CNAME 文件

在**根目录**新建文件 `CNAME`（无扩展名），内容只有一行域名，不要带 `https://`：

```
www.your-domain.com
```

### 5.2 配 DNS

去域名服务商加记录（以 GitHub Pages 官方地址为例，IP 可能变动，以官方文档为准）：

**用根域名（`your-domain.com`）**

| 类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

**用 www 子域（`www.your-domain.com`）**

| 类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| CNAME | `www` | `<你的用户名>.github.io` |

### 5.3 开启 HTTPS

DNS 生效后在 **Settings → Pages** 勾选 **Enforce HTTPS**。证书是自动签发的，
刚配好域名时可能灰着，等几分钟到几小时（DNS 缓存影响），不要反复点。

### 5.4 验证

```bash
# 看解析是否生效（换成你的域名）
nslookup www.your-domain.com
```

浏览器打开 `https://www.your-domain.com`，再打开 `http://`（应自动跳转 https）。
若出现「证书不匹配」，通常是 CNAME 还指着旧域名，或 DNS 还没同步完。

---

## 6. 排错对照表

| 现象 | 最可能的原因 | 处理 |
| --- | --- | --- |
| 首页白屏、CSS 全丢 | 部署在子路径，却用了 `/assets/...` | 见第 4 节 |
| 只有部分图片 404 | 文件名大小写不一致 | 逐字核对 `src` 与实际文件名 |
| 点导航跳回 404 | `404.html` 用了根路径，站点在子路径 | 改 `404.html` 的路径前缀 |
| Actions 报 `Get Pages site failed` | Pages 的 Source 没选 GitHub Actions | 按 1.2 设置 |
| Actions 报 `Resource not accessible by integration` | 缺 `pages: write` 权限 | 检查 workflow 的 `permissions` 段 |
| Actions 报 `id-token` 相关错误 | 组织禁用了 OIDC | 找管理员开启，或改用方式 B |
| 部署成功但页面是旧的 | 浏览器 / CDN 缓存 | 强制刷新（Ctrl+F5），或等 1–2 分钟 |
| 主题切换后刷新又变回浅色 | `localStorage` 被禁用（隐私模式） | 属预期行为，页面仍可用 |
| 表单点了没反应 | 本机没装邮件客户端 | 属预期：本站不提交到服务器，复制反馈里的内容手动发信 |
| 中文显示为方块 | 客户端缺中文字体 | 系统字体栈已覆盖主流平台，极端环境可考虑自托管字体（见 `assets/fonts/`） |

---

## 7. 上线后检查清单

发布完成后，按这张表逐项点一遍（建议用手机也点一遍）：

- [ ] 十三个页面（`index.html` + `404.html` + `pages/` 下十一页）都能从首页或抽屉到达，导航高亮正确（`data-page` × `data-nav`）
- [ ] 移动端（375px 宽）不出横向滚动条，抽屉能开能关
- [ ] 项目页筛选：每个分类的计数与卡片数量一致，空态提示正常
- [ ] 项目 / 笔记弹层：能开、能关、`Esc` 能关、点遮罩能关、深链 `#case-xxx` 能直接打开
- [ ] 联系页表单：空提交有错误提示，填对后出现「打开邮件客户端发送」
- [ ] 深浅主题切换后刷新，选择被记住
- [ ] 打开浏览器控制台，没有 404 请求、没有 JS 报错
- [ ] `robots.txt` 与 `sitemap.xml` 能访问（地址栏直接打开）
- [ ] 分享到微信 / 微博，标题与描述正确（`og:` 标签需为绝对地址才稳）

---

## 8. 回滚

发布出问题时，最快的恢复方式是「回到上一个提交」：

```bash
git log --oneline -5          # 找到上一个正常版本
git revert <坏提交的哈希>      # 生成一个反向提交，保留历史
git push
```

不要用 `git reset --hard` + `push --force` 去「抹掉」历史——那会让协作者与 Pages 的缓存状态更难对齐。

---

## 9. 关于「本站没有后端」这件事

| 想要的能力 | 静态站怎么做 |
| --- | --- |
| 收表单 | 用 Formspree / Getform 之类的表单服务，把 `contact.js` 的 `mailto` 换成它们的 endpoint |
| 搜索 | 站内内容不多时，直接做一个 `search.html`，把所有标题与摘要内联进 JS 里做本地过滤 |
| 访问统计 | 用不采集个人信息的方案（如自建 Umami），或干脆不统计 |
| 评论 | 静态站不适合做评论；把讨论引到邮件或 Issue 里更省事 |

> 任何第三方服务都意味着站点不再「零外部依赖」。加之前先想清楚：值不值得为这个功能引入一个会挂的外部服务。
