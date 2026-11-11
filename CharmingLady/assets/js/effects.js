/* ==============================================================================
   effects.js — 动效模块（滚动揭示 / 数字滚动 / 打字机 / 光标光斑 / 磁吸 /
   3D 倾斜 / 视差 / 能力条）
   ------------------------------------------------------------------------------
   设计原则：
     1. 所有动效都是「可关闭」的：检测到 prefers-reduced-motion 时整段逻辑不启动，
        而不是靠 CSS 强行覆盖（CSS 已做兜底，这里是双保险）。
     2. 只有鼠标类特效（光斑、磁吸、倾斜）在精确指针设备上运行，触屏一律跳过。
     3. 所有高频事件都经 CL.rafThrottle 合并；观察器只观察一次，进入后立刻 unobserve。
   ============================================================================== */
(function () {
  "use strict";

  var CL = window.CL;
  if (!CL) return; // core.js 未加载时直接退出，避免报错

  var $ = CL.$;
  var $all = CL.$all;
  var reduced = CL.prefersReduced();
  var fine = CL.isFinePointer();

  /* ---------- 1. 滚动揭示 ----------
     [重要] clip 类型为什么观察父元素，而不是元素自己：
     "clip" 的初始态是 clip-path: inset(0 0 100% 0)，等于把可见面积裁成 0。
     浏览器在计算 IntersectionObserver 的相交矩形时，会把目标自身的 clip-path 算进去，
     于是 intersectionRect 变成 width:0 height:0、intersectionRatio 恒为 0、
     isIntersecting 恒为 false —— 元素被自己藏起来了，永远等不到那一次揭示。
     （实测：ratio=0，rect={width:0,height:0}，无论滚动到哪里都不变。）
     所以 clip 元素改为观察它没有被裁剪的父元素，命中后再给元素自己加 .is-in。
     另外加了一层「首帧安全检查」：已经在视口里的元素直接显示，
     保证任何观察逻辑出问题时，内容也不会永久空白。 */
  function initReveal() {
    var items = $all("[data-reveal]");
    if (!items.length) return;

    function reveal(el) {
      if (el.classList.contains("is-in")) return;
      var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      if (delay > 0) el.style.transitionDelay = delay + "ms";
      el.classList.add("is-in");
    }

    // 元素是否已经在视口内（用布局矩形判断，不受自身 clip-path 影响）
    function inView(el) {
      var r = el.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 0 && r.top < h - 40;
    }

    // 不支持 IntersectionObserver 或用户要求减少动效：直接全部显示
    if (!("IntersectionObserver" in window) || reduced) {
      items.forEach(reveal);
      return;
    }

    var watched = new WeakMap(); // 被观察节点 → 真正要揭示的元素

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = watched.get(entry.target) || entry.target;
          reveal(el);
          io.unobserve(entry.target); // 只揭示一次，来回滚动不重放
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    items.forEach(function (el) {
      // 已经在首屏里的，直接显示：不给「看不见的初始态」留任何卡死的机会
      if (inView(el)) {
        reveal(el);
        return;
      }
      var target = el;
      if (el.getAttribute("data-reveal") === "clip" && el.parentElement) {
        target = el.parentElement; // 父元素没有被裁剪，能被正常观察
      }
      watched.set(target, el);
      io.observe(target);
    });
  }

  /* ---------- 2. 数字滚动 ---------- */
  function initCounters() {
    var nums = $all("[data-count]");
    if (!nums.length) return;

    function format(value, decimals, sep) {
      var fixed = value.toFixed(decimals);
      if (!sep) return fixed;
      var parts = fixed.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var sep = el.getAttribute("data-sep") === "true";
      var duration = parseInt(el.getAttribute("data-duration") || "1200", 10);

      if (reduced) {
        el.textContent = prefix + format(target, decimals, sep) + suffix;
        return;
      }

      var start = 0;
      var t0 = 0;
      // easeOutExpo：起步快、收尾稳，读数过程不拖沓
      function ease(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / duration);
        var v = start + (target - start) * ease(p);
        el.textContent = prefix + format(v, decimals, sep) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window) || reduced) {
      nums.forEach(run);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    nums.forEach(function (el) {
      el.textContent = el.getAttribute("data-prefix") || "0";
      io.observe(el);
    });
  }

  /* ---------- 3. 打字机（首屏职位轮播） ---------- */
  function initTypewriter() {
    var el = $("[data-typewriter]");
    if (!el) return;

    var items = (el.getAttribute("data-type-items") || "").split("|").filter(Boolean);
    if (!items.length) return;

    if (reduced) {
      el.textContent = items[0];
      return;
    }

    var textNode = doc_createText();
    el.appendChild(textNode);

    var index = 0;
    var char = 0;
    var deleting = false;

    function tick() {
      var full = items[index];
      if (!deleting) {
        char++;
        textNode.nodeValue = full.slice(0, char);
        if (char === full.length) {
          deleting = true;
          window.setTimeout(tick, 1700); // 完整显示后停顿
          return;
        }
      } else {
        char--;
        textNode.nodeValue = full.slice(0, char);
        if (char === 0) {
          deleting = false;
          index = (index + 1) % items.length;
        }
      }
      // 退格比打字快，读起来更像真实输入
      window.setTimeout(tick, deleting ? 42 : 88 + Math.random() * 55);
    }

    function doc_createText() {
      return document.createTextNode("");
    }

    window.setTimeout(tick, 900);
  }

  /* ---------- 4. 光标光斑 ---------- */
  function initCursorGlow() {
    if (!fine || reduced) return;
    var glow = $(".cursor-glow");
    if (!glow) return;

    document.body.classList.add("is-pointer-fine");

    var tx = window.innerWidth / 2;
    var ty = window.innerHeight / 2;
    var cx = tx;
    var cy = ty;
    var active = false;

    window.addEventListener(
      "pointermove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        if (!active) {
          active = true;
          loop();
        }
      },
      { passive: true }
    );

    function loop() {
      // 缓动跟随：8% 的趋近率，产生轻微延迟感而不是硬跟手
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      window.requestAnimationFrame(loop);
    }
  }

  /* ---------- 5. 磁吸按钮 ---------- */
  function initMagnetic() {
    if (!fine || reduced) return;
    $all("[data-magnetic]").forEach(function (el) {
      el.addEventListener(
        "pointermove",
        function (e) {
          var r = el.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          var max = 4; // 位移上限，超过就会显得轻浮
          var mx = Math.max(-max, Math.min(max, dx * 0.18));
          var my = Math.max(-max, Math.min(max, dy * 0.18));
          el.style.setProperty("--mx", mx.toFixed(1) + "px");
          el.style.setProperty("--my", my.toFixed(1) + "px");
        },
        { passive: true }
      );
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- 6. 卡片 3D 倾斜 ---------- */
  function initTilt() {
    if (!fine || reduced) return;
    $all(".tilt").forEach(function (el) {
      var max = 6; // 最大倾角，太大就不像作品集了
      el.addEventListener(
        "pointermove",
        function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform =
            "perspective(900px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" +
            (px * max).toFixed(2) + "deg)";
        },
        { passive: true }
      );
      el.addEventListener("pointerleave", function () {
        el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ---------- 7. 视差 ---------- */
  function initParallax() {
    if (reduced) return;
    var layers = $all("[data-parallax]");
    if (!layers.length) return;

    var update = CL.rafThrottle(function () {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var r = el.getBoundingClientRect();
        // 以「元素中心距视口中心」为位移基准，上下各偏移一半
        var center = r.top + r.height / 2 - vh / 2;
        var k = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        el.style.setProperty("--py", (-center * k).toFixed(1) + "px");
      });
    });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 8. 能力条 ---------- */
  function initMeters() {
    var fills = $all(".meter-fill");
    if (!fills.length) return;

    function on(el) {
      var v = el.getAttribute("data-value") || "0";
      el.style.setProperty("--value", v + "%");
      el.classList.add("is-on");
    }

    if (!("IntersectionObserver" in window) || reduced) {
      fills.forEach(on);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          // 同一组内做 80ms 递进，看起来像一次统一填充
          var i = $all(".meter-fill", el.parentNode.parentNode).indexOf(el);
          window.setTimeout(function () {
            on(el);
          }, Math.max(0, i) * 80);
          io.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    fills.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- 9. 标题逐字入场 ----------
     把 [data-split] 的标题拆成单字 span，进入视口后按 26ms 递进显现。
     读屏不受影响：原文写进 aria-label，拆出来的字全部 aria-hidden。 */
  function initSplit() {
    var nodes = $all("[data-split]");
    if (!nodes.length) return;

    nodes.forEach(function (el) {
      var text = (el.textContent || "").trim();
      if (!text) return;
      el.setAttribute("aria-label", text);

      var frag = document.createDocumentFragment();
      var idx = 0;
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === " " || ch === "\n" || ch === "\t") {
          frag.appendChild(document.createTextNode(" "));
          continue;
        }
        var span = document.createElement("span");
        span.className = "ch";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--i", String(idx));
        span.textContent = ch;
        idx += 1;
        frag.appendChild(span);
      }
      el.textContent = "";
      el.appendChild(frag);
    });

    function on(el) {
      el.classList.add("is-in");
    }

    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(on);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          on(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- 10. SVG 手绘线条 ----------
     读取路径真实长度写入 --len，进入视口后把 dashoffset 归零，形成「画出来」的过程。 */
  function initDraw() {
    var nodes = $all("[data-draw]");
    if (!nodes.length) return;

    nodes.forEach(function (el) {
      if (typeof el.getTotalLength !== "function") return;
      try {
        el.style.setProperty("--len", String(Math.ceil(el.getTotalLength())));
      } catch (err) {
        /* 极少数非路径元素没有这个方法，跳过即可 */
      }
    });

    function on(el) {
      el.classList.add("is-drawn");
    }

    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(on);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // 稍微延迟，避免和同区块的入场动画同时发生
          window.setTimeout(function () {
            on(entry.target);
          }, 120);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- 11. 回到顶部的环形进度 ----------
     写入 --ring（0–100），CSS 用 conic-gradient 画成一小段弧。 */
  function initRing() {
    var btn = $(".to-top");
    if (!btn || reduced) return;

    var update = CL.rafThrottle(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      btn.style.setProperty("--ring", (Math.min(1, Math.max(0, p)) * 100).toFixed(1));
    });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 12. 首屏极光随滚动漂移 ----------
     只写两个位移量，真正的视觉在 effects.css 的 .hero::after 里。 */
  function initHeroDrift() {
    var hero = $(".hero");
    if (!hero || reduced) return;

    var update = CL.rafThrottle(function () {
      var y = window.scrollY || 0;
      hero.style.setProperty("--gy", (y * 0.05).toFixed(1) + "px");
      hero.style.setProperty("--gx", (y * 0.02).toFixed(1) + "px");
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- 启动 ---------- */
  function boot() {
    [
      initReveal,
      initCounters,
      initTypewriter,
      initCursorGlow,
      initMagnetic,
      initTilt,
      initParallax,
      initMeters,
      initSplit,
      initDraw,
      initRing,
      initHeroDrift,
    ].forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        if (window.location.hostname === "127.0.0.1") console.warn("[effects]", err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
