/* ==============================================================================
   core.js — 基础运行时（工具函数 / 主题 / 导航 / 滚动进度 / 回到顶部）
   ------------------------------------------------------------------------------
   本项目不使用任何框架与构建工具，所有模块以 IIFE 形式挂在 window.CL 上，
   依赖顺序：core.js → effects.js → projects.js / notes.js / contact.js。
   官方说明：
     · 全局只暴露一个命名空间 CL，避免污染 window。
     · 所有 DOM 操作前都做存在性判断，同一份 JS 可以安全地在所有页面加载。
     · 事件监听统一用 passive 或精确的目标，不用 document 全局 scroll 拦截。
   ============================================================================== */
(function () {
  "use strict";

  /* ---------- 1. 工具函数 ---------- */
  var doc = document;

  /** 单个选择器查询（失败返回 null，调用处做判断） */
  function $(sel, ctx) {
    return (ctx || doc).querySelector(sel);
  }

  /** 批量查询，返回真数组，方便用 forEach / map */
  function $all(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }

  /** 用 rAF 合并高频事件（scroll / pointermove），避免一帧内重复计算 */
  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        fn();
      });
    };
}

  /** 是否处于「减少动效」偏好，动效模块统一读这个开关 */
  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** 是否为精确指针设备（触屏返回 false，用于关闭 hover 类特效） */
  function isFinePointer() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  /* ---------- 2. 主题：浅色 / 深色 ---------- */
  var THEME_KEY = "cl-theme";

  function readStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null; // 隐私模式或禁用存储时不报错，退回系统偏好
    }
  }

  function storeTheme(value) {
    try {
      window.localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* 忽略：主题仍在本页生效，只是不记忆 */
    }
  }

  function applyTheme(theme, animate) {
    var root = doc.documentElement;
    root.setAttribute("data-theme", theme);

    // 刷新浏览器 UI 的主题色（移动端状态栏）
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0d1512" : "#f4f3ed");

    var btn = $("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
      var label = $("[data-theme-label]", btn);
      if (label) label.textContent = theme === "dark" ? "浅色" : "深色";
    }

    if (animate) {
      doc.documentElement.classList.add("is-theming");
      window.setTimeout(function () {
        doc.documentElement.classList.remove("is-theming");
      }, 460);
    }
  }

  function initTheme() {
    var stored = readStoredTheme();
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var initial = stored || (systemDark ? "dark" : "light");
    applyTheme(initial, false);

    var btn = $("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = doc.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
      storeTheme(next);
    });
  }

  /* ---------- 3. 移动端导航抽屉 ---------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var drawer = $(".nav-drawer");
    if (!toggle || !drawer) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.classList.toggle("is-open", open);
      // 抽屉展开时锁住页面滚动，避免背景跟着动
      doc.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var first = $("a", drawer);
        if (first) first.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // 点击抽屉里的链接后自动收起，回到目标区块
    drawer.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    // ESC 关闭，符合弹层类交互的通用预期
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus({ preventScroll: true });
      }
    });

    // 视口变宽到桌面断点时收起抽屉，避免残留状态
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- 4. 页头吸顶状态 + 当前页高亮 ---------- */
  function initHeader() {
    var header = $(".site-header");
    var current = doc.body.getAttribute("data-page"); // 每个页面用 data-page 标记自己

    $all(".nav a, .nav-drawer a").forEach(function (link) {
      if (link.getAttribute("data-nav") === current) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });

    if (!header) return;
    var onScroll = rafThrottle(function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 5. 滚动进度条 ---------- */
  function initProgress() {
    var bar = $(".scroll-progress");
    if (!bar) return;
    var update = rafThrottle(function () {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, ratio)) + ")";
    });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 6. 回到顶部 ---------- */
  function initToTop() {
    var btn = $(".to-top");
    if (!btn) return;
    var update = rafThrottle(function () {
      btn.classList.toggle("is-on", window.scrollY > 600);
    });
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced() ? "auto" : "smooth"
      });
    });
    update();
  }

  /* ---------- 7. 页脚年份 ---------- */
  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- 8. 导出命名空间 ---------- */
  window.CL = {
    $: $,
    $all: $all,
    rafThrottle: rafThrottle,
    prefersReduced: prefersReduced,
    isFinePointer: isFinePointer
  };

  /* 统一入口：DOM 就绪后依次初始化，任何一个模块出错不影响其它模块 */
  function boot() {
    [initTheme, initNav, initHeader, initProgress, initToTop, initYear].forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        // 生产环境不打印堆栈，避免控制台噪音；开发时可临时改成 console.error
        if (window.location.hostname === "127.0.0.1") console.warn("[core]", err);
      }
    });
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
