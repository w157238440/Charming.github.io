/* ==============================================================================
   lab.js — 实验台页面专用脚本（波形画布 / 光标读数 / 演示反馈）
   ------------------------------------------------------------------------------
   依赖：core.js（提供 CL.$、CL.$all、CL.rafThrottle、CL.prefersReduced）。
   设计取舍：
     · 只在本页加载，其它页面不需要这段代码，避免无谓解析；
     · 画布在离开视口或页面隐藏时停止绘制（省电，也避免后台掉帧）；
     · 减少动效偏好下只画一帧静态曲线，不做逐帧循环；
     · 颜色从 CSS 变量读取，主题切换后重新取色，不把色值写死在 JS 里。
   ============================================================================== */
(function () {
  "use strict";

  var CL = window.CL;
  if (!CL) return;

  var $ = CL.$;
  var $all = CL.$all;
  var reduced = CL.prefersReduced();

  /* ---------- 1. 读取当前主题下的两个曲线颜色 ---------- */
  function palette() {
    var style = window.getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue("--accent").trim() || "#a6402b";
    var jade = style.getPropertyValue("--jade").trim() || "#2f6f5e";
    var ink = style.getPropertyValue("--ink").trim() || "#0f1714";
    return { accent: accent, jade: jade, ink: ink };
  }

  /* ---------- 2. Canvas 波形 ---------- */
  function initWave() {
    var canvas = $("[data-wave]");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var toggle = $("[data-wave-toggle]");
    var playing = !reduced;
    var running = false;
    var frames = 0;
    var colors = palette();

    // 画布按 DPR 放大，避免在 2 倍屏上糊掉
    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t) {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      var mid = h / 2;
      var phase = t * 0.0016;

      ctx.clearRect(0, 0, w, h);

      // 基线：三条很淡的参考线
      ctx.strokeStyle = "rgba(127, 140, 134, 0.18)";
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach(function (k) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(h * k) + 0.5);
        ctx.lineTo(w, Math.round(h * k) + 0.5);
        ctx.stroke();
      });

      // 两条正弦叠加，振幅与周期不同，形成「呼吸」感
      [
        { color: colors.jade, amp: h * 0.34, freq: 0.014, speed: 1.0, width: 1.2 },
        { color: colors.accent, amp: h * 0.2, freq: 0.026, speed: -1.6, width: 1.6 },
      ].forEach(function (wave) {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.width;
        ctx.globalAlpha = 0.85;
        for (var x = 0; x <= w; x += 2) {
          var y = mid + Math.sin(x * wave.freq + phase * wave.speed) * wave.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // 一个跟随相位移动的读数点，让画面有「在跑」的落点
      var px = w * (0.5 + 0.5 * Math.sin(phase));
      var py = mid + Math.sin(px * 0.014 + phase) * h * 0.34;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    function loop(t) {
      if (!running) return;
      frames += 1;
      draw(t);
      if (playing) {
        window.requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function start() {
      if (running) return;
      running = true;
      resize();
      window.requestAnimationFrame(loop);
    }

    resize();
    draw(0); // 先画一帧，保证暂停状态下也有内容

    if (toggle) {
      toggle.setAttribute("aria-pressed", playing ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        playing ? "暂停波形动画" : "播放波形动画"
      );
      toggle.addEventListener("click", function () {
        playing = !playing;
        toggle.setAttribute("aria-pressed", playing ? "true" : "false");
        toggle.setAttribute("aria-label", playing ? "暂停波形动画" : "播放波形动画");
        if (playing) start();
      });
    }

    window.addEventListener("resize", CL.rafThrottle(function () {
      resize();
      draw(0);
    }));

    // 离开视口就停，回来再继续
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (playing) start();
            } else {
              running = false;
            }
          });
        },
        { threshold: 0.15 }
      );
      io.observe(canvas);
    } else if (playing) {
      start();
    }

    // 切到后台标签页时停掉，回来重画一帧
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
      } else if (playing) {
        start();
      }
    });

    // 主题切换后重新取色，避免曲线还停留在旧主题的颜色上
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        colors = palette();
        draw(0);
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }
  }

  /* ---------- 3. 光标读数 ---------- */
  function initHud() {
    var zone = $("[data-hud-zone]");
    if (!zone) return;

    var outX = $('[data-hud="x"]', zone);
    var outY = $('[data-hud="y"]', zone);
    var outLocal = $('[data-hud="local"]', zone);
    var outFps = $('[data-hud="fps"]', zone);
    if (!outX || !outY || !outLocal) return;

    var move = CL.rafThrottle(function (x, y) {
      var rect = zone.getBoundingClientRect();
      var lx = ((x - rect.left) / rect.width) * 100;
      var ly = ((y - rect.top) / rect.height) * 100;
      outX.textContent = Math.round(x) + " px";
      outY.textContent = Math.round(y) + " px";
      outLocal.textContent =
        Math.max(0, Math.min(100, Math.round(lx))) + " / " +
        Math.max(0, Math.min(100, Math.round(ly)));
    });

    zone.addEventListener(
      "pointermove",
      function (e) {
        move(e.clientX, e.clientY);
      },
      { passive: true }
    );

    zone.addEventListener("pointerleave", function () {
      outX.textContent = "—";
      outY.textContent = "—";
      outLocal.textContent = "—";
    });

    // 帧率：只在页面可见时计数，避免后台空转
    if (outFps && !reduced) {
      var last = performance.now();
      var count = 0;
      function tick(now) {
        count += 1;
        if (now - last >= 1000) {
          outFps.textContent = count + " fps";
          count = 0;
          last = now;
        }
        window.requestAnimationFrame(tick);
      }
      window.requestAnimationFrame(tick);
    } else if (outFps) {
      outFps.textContent = "已关闭";
    }
  }

  /* ---------- 4. 演示按钮的反馈 ---------- */
  function initToast() {
    var trigger = $("[data-demo-toast]");
    if (!trigger) return;

    var toast = null;
    var timer = 0;

    function show(text) {
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
      }
      toast.textContent = text;
      toast.classList.add("is-on");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        toast.classList.remove("is-on");
      }, 2400);
    }

    trigger.addEventListener("click", function () {
      show("收到了一次点击：这说明按钮不是装饰，它真的绑了事件。");
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    [initWave, initHud, initToast].forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        if (window.location.hostname === "127.0.0.1") console.warn("[lab]", err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
