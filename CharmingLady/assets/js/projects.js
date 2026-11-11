/* ==============================================================================
   projects.js — 项目页（卡片点开详情）
   ------------------------------------------------------------------------------
   分工说明：
     · 筛选逻辑在 ui.js 的 initFilter 里（与笔记页共用，避免两套代码）
     · 卡片数据以静态 HTML + <template> 形式存在，保证首屏立即可见、可被搜索引擎收录；
       本文件只负责「点哪张卡 → 开哪个模板」这一层映射。
   ============================================================================== */
(function () {
  "use strict";

  var CL = window.CL;
  if (!CL || !CL.ui) return;
  var $all = CL.$all;

  function bindCards() {
    $all("[data-case]").forEach(function (card) {
      var slug = card.getAttribute("data-slug");
      if (!slug) return;

      card.addEventListener("click", function (event) {
        // 允许用 Ctrl / Cmd / Shift + 点击在新标签打开（链接本身是有效的 #case-xxx）
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        CL.ui.openDialog("tpl-case-" + slug, card, slug);
      });
    });
  }

  function boot() {
    try {
      bindCards();
    } catch (err) {
      if (window.location.hostname === "127.0.0.1") console.warn("[projects]", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
