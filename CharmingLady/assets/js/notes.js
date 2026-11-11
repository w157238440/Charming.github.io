/* ==============================================================================
   notes.js — 笔记页（点击条目在弹层里阅读全文）
   ------------------------------------------------------------------------------
   为什么用弹层而不是新页面：技术笔记篇幅中等，独立成页会让路由膨胀，
   而弹层可以直接复用 ui.js 的 Dialog，且不打断浏览节奏。
   约定：条目 data-note="vite-pitfalls" 对应模板 id "tpl-note-vite-pitfalls"。
   ============================================================================== */
(function () {
  "use strict";

  var CL = window.CL;
  if (!CL || !CL.ui) return;
  var $all = CL.$all;

  function bindNotes() {
    $all("[data-note]").forEach(function (card) {
      var id = card.getAttribute("data-note");

      function open(event) {
        if (event && (event.metaKey || event.ctrlKey || event.shiftKey)) return;
        if (event) event.preventDefault();
        CL.ui.openDialog("tpl-note-" + id, card, null);
      }

      card.addEventListener("click", open);
      // 键盘用户：Enter / 空格 等同于点击（卡片是 <a>，这里补一个兜底）
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(null);
        }
      });
    });
  }

  function boot() {
    try {
      bindNotes();
    } catch (err) {
      if (window.location.hostname === "127.0.0.1") console.warn("[notes]", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
