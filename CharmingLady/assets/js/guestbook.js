/* =============================================================================
   guestbook.js — 留言簿（本地存储版）
   -----------------------------------------------------------------------------
   这个页面要解决的是一个矛盾：
   用户希望「留言别人能看到、长期保存」，但整站是纯静态的（零后端、零框架、
   零外部 CDN、断网可开），没有任何服务端能接收写入。

   所以这里分成两层：
   1) 种子层（本文件顶部的 SEED 数组）
      —— 直接写进 JS 源码，随站点一起部署。任何访客打开页面都能看到，
         换设备、清缓存都不影响，因为它不是「数据」而是「文件」。
   2) 本机层（localStorage，键名 cl-guestbook-v2）
      —— 访客当场写的留言存在自己浏览器里，立即可见，但只在这台设备这个浏览器里。
         要让它变成所有人都能看到的「正式留言」，需要把导出的 JSON 并入 SEED，
         再提交一次代码（页面上有完整的操作步骤）。

   设计约束（改代码前请先读）：
   · 所有用户输入一律用 textContent 写入，绝不用 innerHTML —— 留言是陌生内容，
     拼字符串进页面等于自己开一个 XSS 口子。
   · localStorage 读取必须包 try/catch：隐私模式、禁用存储、配额满都会抛异常。
   · 本机留言上限 200 条，超出后丢最旧的，避免把浏览器存储写爆。
   · 日期用「本地时区的 YYYY-MM-DD」拼接，不用 toISOString()（那是 UTC，
     东八区晚上会差一天）。
   · 本文件不依赖任何第三方库，只用到 core.js 暴露的 window.CL 工具函数，
     并且没有 CL 时也能独立工作（页面脚本顺序见 guestbook.html 底部注释）。
   ============================================================================= */
(function () {
  "use strict";

  /* ---------- 0. 依赖与常量 ---------- */
  var CL = window.CL || {};
  var $ = CL.$ || function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $all = CL.$all || function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var STORAGE_KEY = "cl-guestbook-v2"; // 换版本号等于换一个独立命名空间
  var MAX_LOCAL = 200;                 // 本机最多存多少条
  var PAGE_SIZE = 10;                  // 每页显示几条；和「共 N 条」一起决定分页数
  var NAME_MAX = 16;
  var ROLE_MAX = 24;
  var CITY_MAX = 12;
  var TEXT_MIN = 5;
  var TEXT_MAX = 300;

  /* ---------- 1. 种子留言 ----------
     这 10 条是演示内容（虚构人物，用于展示版式与检索效果），
     它们写在源码里，所以所有访客都能看到。
     想加正式留言：把导出的 JSON 条目粘到下面数组里，按日期排序后提交即可。 */
  var SEED = [
    {
      name: "林澈",
      role: "产品经理",
      city: "北京",
      date: "2026-11-11",
      tag: "合作过",
      text: "去年那个会员体系的项目，最让我意外的是你会在需求评审时反问「这个字段以后谁来维护」。上线八个月，那张表一次都没改过结构。"
    },
    {
      name: "周与航",
      role: "创业公司技术负责人",
      city: "杭州",
      date: "2026-11-08",
      tag: "技术交流",
      text: "照着笔记里那篇分页写法改了我们后台的列表接口，10 万行数据从 1.4 秒降到 180 毫秒。分页游标那段注释写得很清楚，省了我半天猜。"
    },
    {
      name: "苏晚",
      role: "独立设计师",
      city: "上海",
      date: "2026-11-04",
      tag: "建议",
      text: "深色模式下的正文对比度很舒服，不像很多站把深色做成纯黑配灰字。唯一想提的是项目卡片的年份，字号再大半档会更醒目。"
    },
    {
      name: "陈默",
      role: "后端工程师",
      city: "成都",
      date: "2026-10-30",
      tag: "技术交流",
      text: "小程序登录态那篇笔记救了我一次。静默登录和手机号授权分开处理这个思路，我们之前混在一起写，导致换手机之后老会话一直不失效。"
    },
    {
      name: "何一鸣",
      role: "运营",
      city: "深圳",
      date: "2026-10-27",
      tag: "合作过",
      text: "数据看板交付那天，你顺手把「哪些指标是估算、哪些是实时」标在了图例上。后面开会没人再问数据准不准，省了很多解释。"
    },
    {
      name: "姜野",
      role: "自由摄影师",
      city: "北京",
      date: "2026-10-22",
      tag: "闲话",
      text: "关于页那张白板图挺打动我的。做创作的人看别人怎么想问题，比看他做出来的成品更有意思。"
    },
    {
      name: "韩青",
      role: "前端新人",
      city: "武汉",
      date: "2026-10-18",
      tag: "技术交流",
      text: "按笔记里的分包方案重写了我们的小程序，首屏从 2.1 秒到 900 毫秒。想问问有没有推荐的代码组织方式，我现在的目录越写越乱。"
    },
    {
      name: "罗启",
      role: "连锁店主",
      city: "长沙",
      date: "2026-10-12",
      tag: "合作过",
      text: "会员卡和储值那块逻辑，你写了三页文档解释「退款时积分怎么办」。当时觉得太啰嗦，后来真遇到退款才发现，啰嗦是好事。"
    },
    {
      name: "吴愔",
      role: "高校教师",
      city: "西安",
      date: "2026-10-06",
      tag: "建议",
      text: "给实验室学生看了一个下午。键盘焦点可见、减少动效开关这些细节，比讲十遍「无障碍不是附加项」有用。"
    },
    {
      name: "沈知微",
      role: "产品实习生",
      city: "广州",
      date: "2026-09-28",
      tag: "闲话",
      text: "第一次见到把「免责声明」写成十六条还带目录的站点。看完反而更信任了。"
    }
  ];

  /* ---------- 2. 工具 ---------- */
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  // 本地时区的今天（不要用 toISOString，那是 UTC）
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseDate(str) {
    var t = Date.parse(str + "T00:00:00");
    return isNaN(t) ? 0 : t;
  }

  function escapeForSearch(str) {
    return String(str == null ? "" : str).toLowerCase();
  }

  /* ---------- 3. 存储层 ----------
     localStorage 在以下场景会抛异常：隐私/无痕模式的旧实现、站点数据被禁、
     配额写满（Safari 尤其容易）。所以读写都要兜住，失败时页面仍然可用。 */
  function readLocal() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!parsed || Object.prototype.toString.call(parsed) !== "[object Array]") return [];
      // 只接受形状正确的条目，脏数据直接丢掉
      return parsed.filter(function (item) {
        return item && typeof item.name === "string" && typeof item.text === "string";
      });
    } catch (err) {
      return [];
    }
  }

  function writeLocal(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_LOCAL)));
      return true;
    } catch (err) {
      return false;
    }
  }

  /* ---------- 4. 数据合并 ----------
     种子条目标记 seed:true，本机条目标记 local:true 并带 ts（毫秒时间戳），
     排序规则：日期倒序；同一天内本机留言优先（新写的排前面）。 */
  var state = {
    seed: [],
    local: [],
    keyword: "",
    tag: "全部",
    page: 1 // 当前页码，从 1 起；检索条件一变就回到第一页
  };

  function normalizeSeed() {
    return SEED.map(function (item) {
      return {
        name: item.name,
        role: item.role || "",
        city: item.city || "",
        date: item.date || "",
        tag: item.tag || "闲话",
        text: item.text,
        seed: true,
        local: false
      };
    });
  }

  function normalizeLocal(list) {
    return list.map(function (item, index) {
      return {
        name: item.name,
        role: item.role || "",
        city: item.city || "",
        date: item.date || today(),
        tag: item.tag || "闲话",
        text: item.text,
        seed: false,
        local: true,
        ts: item.ts || Date.now() + index
      };
    });
  }

  function allEntries() {
    var merged = state.seed.concat(state.local);
    merged.sort(function (a, b) {
      var d = parseDate(b.date) - parseDate(a.date);
      if (d !== 0) return d;
      if (a.local !== b.local) return a.local ? -1 : 1;
      return (b.ts || 0) - (a.ts || 0);
    });
    return merged;
  }

  function matches(item, keyword, tag) {
    if (tag && tag !== "全部" && item.tag !== tag) return false;
    if (!keyword) return true;
    var hay = escapeForSearch([item.name, item.role, item.city, item.tag, item.text, item.date].join(" "));
    return hay.indexOf(keyword) !== -1;
  }

  /* ---------- 5. 渲染 ----------
     全部用 createElement + textContent 组装，不用模板字符串拼 HTML ——
     这是本页唯一的安全底线，别为了少写几行改成 innerHTML。 */
  function buildCard(item) {
    var card = document.createElement("article");
    card.className = "gb-card";

    var head = document.createElement("div");
    head.className = "gb-head";

    var mark = document.createElement("span");
    mark.className = "gb-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = (item.name || "?").slice(0, 1);

    var idBox = document.createElement("div");
    idBox.className = "gb-id";

    var nameLine = document.createElement("p");
    nameLine.className = "gb-name";
    nameLine.textContent = item.name;

    if (item.role) {
      var roleSpan = document.createElement("span");
      roleSpan.className = "gb-role";
      roleSpan.textContent = " · " + item.role + (item.city ? " · " + item.city : "");
      nameLine.appendChild(roleSpan);
    } else if (item.city) {
      var citySpan = document.createElement("span");
      citySpan.className = "gb-role";
      citySpan.textContent = " · " + item.city;
      nameLine.appendChild(citySpan);
    }

    var meta = document.createElement("p");
    meta.className = "gb-meta mono";
    meta.textContent = item.date + " · " + item.tag;

    if (item.local) {
      var badge = document.createElement("span");
      badge.className = "gb-badge mono";
      badge.textContent = "仅本机可见";
      meta.appendChild(badge);
    }

    idBox.appendChild(nameLine);
    idBox.appendChild(meta);
    head.appendChild(mark);
    head.appendChild(idBox);

    var text = document.createElement("p");
    text.className = "gb-text";
    text.textContent = item.text; // 陌生内容只走 textContent

    card.appendChild(head);
    card.appendChild(text);
    return card;
  }

  function renderList() {
    var list = $("#gb-list");
    var empty = $("#gb-empty");
    var count = $("#gb-count");
    if (!list) return;

    var keyword = escapeForSearch(state.keyword).trim();
    var visible = allEntries().filter(function (item) {
      return matches(item, keyword, state.tag);
    });

    /* 分页：先算出总页数，再把页码夹在合法区间里。
       删到只剩一页时页码可能是 2，这里顺手纠正，免得列表空白却显示「第 2 / 1 页」。 */
    var pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    if (state.page > pageCount) state.page = pageCount;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var paged = visible.slice(start, start + PAGE_SIZE);

    list.textContent = ""; // 清空（这里安全：不涉及用户内容）
    var frag = document.createDocumentFragment();
    paged.forEach(function (item) {
      frag.appendChild(buildCard(item));
    });
    list.appendChild(frag);

    renderPager(visible.length, pageCount);

    if (empty) {
      var hasFilter = !!keyword || (state.tag && state.tag !== "全部");
      empty.hidden = visible.length !== 0;
      if (!visible.length) {
        empty.textContent = hasFilter
          ? "没有匹配的留言。换个词试试，或者把筛选切回「全部」。"
          : "还没有留言。下面写第一条。";
      }
    }

    if (count) {
      var total = state.seed.length + state.local.length;
      var parts = "共 " + total + " 条";
      if (state.local.length) parts += "，其中本机新增 " + state.local.length + " 条";
      if (keyword || (state.tag && state.tag !== "全部")) {
        parts += "，匹配 " + visible.length + " 条";
        if (visible.length > PAGE_SIZE) {
          parts += "，本页显示第 " + (start + 1) + "–" + (start + paged.length) + " 条";
        }
      }
      count.textContent = parts;
    }

    // 本机留言变化时，同步更新「导出并并入」那段代码窗（还没初始化时跳过）
    if (state.refreshOutput) state.refreshOutput();
  }

  /* ---------- 5b. 分页条 ----------
     只显示「第 x / y 页」和上一页 / 下一页两个按钮，不做页码列表：
     留言总量最多两百来条，页码列表反而更长、也更难点准。
     按钮用 disabled + aria-disabled 双保险，键盘用户也能看出点不动。 */
  function renderPager(visibleCount, pageCount) {
    var pager = $("#gb-pager");
    var info = $("#gb-page-info");
    var prev = $("#gb-prev");
    var next = $("#gb-next");
    if (!pager) return;

    pager.hidden = visibleCount === 0;
    if (info) {
      info.textContent = "第 " + state.page + " / " + pageCount + " 页 · 共 " + visibleCount + " 条";
    }
    if (prev) {
      prev.disabled = state.page <= 1;
      prev.setAttribute("aria-disabled", state.page <= 1 ? "true" : "false");
    }
    if (next) {
      next.disabled = state.page >= pageCount;
      next.setAttribute("aria-disabled", state.page >= pageCount ? "true" : "false");
    }
  }

  /* ---------- 6. 检索与筛选 ---------- */
  function initSearch() {
    var input = $("#gb-search");
    if (!input) return;

    // 输入防抖：80ms 足够短，不会让人觉得卡，又能减少无谓重排
    var timer = 0;
    input.addEventListener("input", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        state.keyword = input.value;
        state.page = 1; // 换了关键词就回第一页，否则可能落在空页上
        renderList();
      }, 80);
    });

    // 按 Esc 清空检索
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        input.value = "";
        state.keyword = "";
        state.page = 1;
        renderList();
      }
    });

    $all("[data-gb-tag]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tag = btn.getAttribute("data-gb-tag") || "全部";
        state.page = 1;
        $all("[data-gb-tag]").forEach(function (other) {
          other.setAttribute("aria-pressed", other === btn ? "true" : "false");
        });
        renderList();
      });
    });
  }

  /* 翻页后如果列表头已经滚出视野，就把它拉回来；
     用平滑滚动，但尊重系统的「减少动态效果」偏好。 */
  function scrollToListTop() {
    var head = $("#gb-list-head");
    if (!head) return;
    if (head.getBoundingClientRect().top >= 0) return; // 还在视野里，不打扰
    var smooth = true;
    if (typeof CL.prefersReduced === "function" && CL.prefersReduced()) smooth = false;
    head.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }

  function initPager() {
    var prev = $("#gb-prev");
    var next = $("#gb-next");
    if (prev) {
      prev.addEventListener("click", function () {
        if (state.page <= 1) return;
        state.page -= 1;
        renderList();
        scrollToListTop();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        if (next.disabled) return; // 已到最后一页，按钮本身也是 disabled
        state.page += 1;
        renderList();
        scrollToListTop();
      });
    }
  }

  /* ---------- 7. 提交 ----------
     校验 → 写 localStorage → 重渲染 → 反馈。
     不联网、不上传，所以要明确告诉用户「只有你自己看得到」。 */
  function initForm() {
    var form = $("#gb-form");
    if (!form) return;

    var nameEl = $("#gb-name");
    var textEl = $("#gb-text");
    var counter = $("#gb-counter");
    var feedback = $("#gb-feedback");

    if (textEl && counter) {
      var sync = function () {
        counter.textContent = textEl.value.length + " / " + TEXT_MAX;
        counter.classList.toggle("is-over", textEl.value.length > TEXT_MAX);
      };
      textEl.addEventListener("input", sync);
      sync();
    }

    function setError(fieldId, errorId, message) {
      var field = $("#" + fieldId);
      var err = $("#" + errorId);
      if (field) field.classList.toggle("is-invalid", !!message);
      if (err) err.textContent = message || "";
      return !message;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (nameEl ? nameEl.value : "").trim();
      var role = ($("#gb-role") ? $("#gb-role").value : "").trim();
      var city = ($("#gb-city") ? $("#gb-city").value : "").trim();
      var tag = ($("#gb-tag") ? $("#gb-tag").value : "闲话") || "闲话";
      var text = (textEl ? textEl.value : "").trim();

      var okName = setError("gb-name-field", "gb-name-error",
        !name ? "留个称呼吧，昵称也行。" :
          name.length > NAME_MAX ? "称呼请控制在 " + NAME_MAX + " 字以内。" : "");

      var okText = setError("gb-text-field", "gb-text-error",
        text.length < TEXT_MIN ? "至少写 " + TEXT_MIN + " 个字，多说两句更有用。" :
          text.length > TEXT_MAX ? "超出 " + TEXT_MAX + " 字了，删掉一些再发。" : "");

      if (!okName || !okText) {
        if (feedback) {
          feedback.className = "gb-feedback";
          feedback.textContent = "还有两处需要改一下，见字段下方提示。";
        }
        return;
      }

      var entry = {
        name: name.slice(0, NAME_MAX),
        role: role.slice(0, ROLE_MAX),
        city: city.slice(0, CITY_MAX),
        date: today(),
        tag: tag,
        text: text.slice(0, TEXT_MAX),
        ts: Date.now()
      };

      state.local.unshift(entry);
      var saved = writeLocal(state.local);
      if (!saved) {
        state.local = state.local.slice(1); // 写失败就回滚，避免界面骗人
      }

      state.page = 1; // 新留言按日期倒序排在最前，回到第一页才看得见它
      renderList();

      if (feedback) {
        feedback.className = "gb-feedback is-on";
        feedback.textContent = saved
          ? "已保存到本机浏览器。刷新页面它还在；换设备、换浏览器、清缓存就看不到了——" +
            "要让它变成所有人都能看到的留言，用下面「导出并并入」那一步。"
          : "浏览器的本地存储不可用（隐私模式或已写满），这条留言没能保存。可以改用邮件联系。";
      }

      form.reset();
      if (counter && textEl) counter.textContent = "0 / " + TEXT_MAX;
      setError("gb-name-field", "gb-name-error", "");
      setError("gb-text-field", "gb-text-error", "");

      // 提交后把视线带回列表顶部，别让用户自己找
      var listHead = $("#gb-list-head");
      if (listHead) listHead.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- 8. 导出 / 复制 / 清空 ---------- */
  function exportPayload() {
    return JSON.stringify(state.local.map(function (item) {
      return {
        name: item.name,
        role: item.role,
        city: item.city,
        date: item.date,
        tag: item.tag,
        text: item.text
      };
    }), null, 2);
  }

  function initExport() {
    var output = $("#gb-output");
    var copyBtn = $("#gb-copy");
    var downloadBtn = $("#gb-export");
    var clearBtn = $("#gb-clear");

    function refreshOutput() {
      if (!output) return;
      output.textContent = state.local.length
        ? exportPayload()
        : "// 本机还没有留言。先在下面写一条，这里就会出现可以并入源码的 JSON。";
    }

    if (copyBtn && output) {
      copyBtn.addEventListener("click", function () {
        var text = exportPayload();
        if (!state.local.length) {
          copyBtn.textContent = "还没有可导出的留言";
          window.setTimeout(function () { copyBtn.textContent = "复制 JSON"; }, 1800);
          return;
        }
        var done = function () {
          copyBtn.textContent = "已复制";
          window.setTimeout(function () { copyBtn.textContent = "复制 JSON"; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
    }

    // 剪贴板 API 不可用时的兜底：临时 textarea + execCommand
    function fallbackCopy(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        if (copyBtn) copyBtn.textContent = "复制失败，请手动选中";
      }
      document.body.removeChild(ta);
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        if (!state.local.length) {
          downloadBtn.textContent = "还没有可导出的留言";
          window.setTimeout(function () { downloadBtn.textContent = "下载 JSON"; }, 1800);
          return;
        }
        var blob = new Blob([exportPayload()], { type: "application/json;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "guestbook-" + today() + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // 交给浏览器下载后释放内存，稍等再撤销，避免个别浏览器还没读完
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (!state.local.length) {
          clearBtn.textContent = "本机没有留言";
          window.setTimeout(function () { clearBtn.textContent = "清空本机留言"; }, 1800);
          return;
        }
        // 破坏性操作，先问
        var yes = window.confirm("清空会删除本机浏览器里的 " + state.local.length + " 条留言，且无法恢复。继续吗？");
        if (!yes) return;
        state.local = [];
        writeLocal([]);
        renderList();
        refreshOutput();
        if (clearBtn) {
          clearBtn.textContent = "已清空";
          window.setTimeout(function () { clearBtn.textContent = "清空本机留言"; }, 1800);
        }
      });
    }

    refreshOutput();
    // 提供刷新钩子，提交后同步代码窗
    state.refreshOutput = refreshOutput;
  }

  /* ---------- 9. 启动 ---------- */
  function boot() {
    state.seed = normalizeSeed();
    state.local = normalizeLocal(readLocal());

    renderList();   // 先出列表（此时还没有导出面板，跳过同步）
    initSearch();
    initPager();
    initForm();
    initExport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
