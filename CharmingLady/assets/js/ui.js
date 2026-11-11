/* ==============================================================================
   ui.js — 交互组件（弹层 Dialog / 手风琴 Accordion）
   ------------------------------------------------------------------------------
   为什么单独一个文件：项目详情、笔记阅读、以及后续可能新增的任何「卡片点开看全文」
   都复用同一个弹层，逻辑集中在一处才不会各页各写一份。
   依赖：core.js（提供 CL.$ / CL.$all）
   ============================================================================== */
(function () {
  "use strict";

  var CL = window.CL;
  if (!CL) return;
  var $ = CL.$;
  var $all = CL.$all;

  /* ---------- 1. 弹层 ---------- */
  var dialog = null; // 单例：整页只有一个 <dialog>
  var lastTrigger = null; // 关闭后把焦点还给触发它的卡片

  function getDialog() {
    if (!dialog) dialog = $(".dialog");
    return dialog;
  }

  /** 用模板内容填充弹层并打开。templateId 形如 "tpl-case-taihe" */
  function openDialog(templateId, trigger, slug) {
    var dlg = getDialog();
    var tpl = $("#" + templateId);
    if (!dlg || !tpl) return;

    lastTrigger = trigger || null;

    // 用 cloneNode 深拷贝模板，模板本身保留在文档里供下次复用
    var frag = tpl.content.cloneNode(true);
    dlg.innerHTML = "";
    dlg.appendChild(frag);

    // 关闭按钮：每次重新绑定，避免旧节点的事件残留
    var closeBtn = $(".dialog-close", dlg);
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeDialog(true);
      });
    }

    if (typeof dlg.showModal === "function") {
      dlg.showModal();
    } else {
      // 老浏览器降级：手动铺满 + 类名控制
      dlg.classList.add("no-dialog", "is-open");
      dlg.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    // 让读屏与键盘用户从弹层标题开始
    var heading = $("h2", dlg);
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }

    // 地址栏同步：刷新或分享链接都能回到同一个案例
    if (slug && window.history && window.history.pushState) {
      window.history.pushState({ dialog: slug }, "", "#case-" + slug);
    }
  }

  function closeDialog(updateHistory) {
    var dlg = getDialog();
    if (!dlg || !dlg.open) return;

    dlg.close();

    if (updateHistory && window.history && window.history.pushState) {
      // 用 replaceState 去掉 hash，不新增历史记录
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // 焦点回到触发元素，键盘用户不会「丢位置」
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  function initDialog() {
    var dlg = getDialog();
    if (!dlg) return;

    // 点击遮罩关闭：<dialog> 的点击目标若是它自己，说明点在内容外
    dlg.addEventListener("click", function (event) {
      if (event.target === dlg) closeDialog(true);
    });

    // ESC：拦截原生 cancel，统一走 closeDialog 以保证历史与焦点处理一致
    dlg.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeDialog(true);
    });

    // 关闭后恢复页面滚动（降级模式下需要）
    dlg.addEventListener("close", function () {
      document.body.style.overflow = "";
    });

    // 浏览器后退时同步关闭弹层
    window.addEventListener("popstate", function (event) {
      var state = event.state;
      if (state && state.dialog) {
        openBySlug(state.dialog);
      } else if (dlg.open) {
        closeDialog(false);
      }
    });

    // 首次加载若带 #case-xxx，自动打开对应详情
    var hash = window.location.hash.replace(/^#case-/, "");
    if (hash && window.location.hash.indexOf("#case-") === 0) {
      openBySlug(hash);
    }
  }

  /**
   * 通过 slug 打开某个详情：约定模板 id 为 tpl-case-{slug}，
   * 卡片元素带 data-slug="{slug}"，这样新增案例只要加模板即可。
   */
  function openBySlug(slug) {
    var trigger = $('[data-slug="' + slug + '"]');
    openDialog("tpl-case-" + slug, trigger, slug);
  }

  /* ---------- 2. 手风琴 ---------- */
  function initAccordion() {
    $all("[data-accordion]").forEach(function (group) {
      $all(".acc-btn", group).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = btn.closest(".acc-item");
          var expanded = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", expanded ? "false" : "true");
          item.classList.toggle("is-open", !expanded);
        });
      });
    });
  }

  /* ---------- 3. 通用筛选（项目页 / 笔记页共用） ----------
     约定：
       · 筛选按钮组带 data-filter-group，组内每个按钮带 data-filter="前端"
       · 卡片带 data-cats="前端 小程序"（空格分隔，可多标签）
       · 计数节点带 data-filter-count，空态提示带 data-filter-empty
     好处：新增分类只需在 HTML 里加一个按钮，不需要改 JS。 */
  function initFilter() {
    $all("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-target") || "[data-cats]";
      var items = $all(targetSel);
      var chips = $all("[data-filter]", group);
      if (!chips.length || !items.length) return;

      var counter = $("[data-filter-count]");
      var empty = $("[data-filter-empty]");

      // 首次进入时把每个分类的数量写进按钮，读者不用点就知道有多少
      chips.forEach(function (chip) {
        var key = chip.getAttribute("data-filter");
        var n = key === "all"
          ? items.length
          : items.filter(function (el) {
              return (el.getAttribute("data-cats") || "").split(/\s+/).indexOf(key) > -1;
            }).length;
        var badge = $(".chip-count", chip);
        if (badge) badge.textContent = String(n);
        chip.setAttribute("data-total", String(n));
      });

      function apply(key) {
        var shown = 0;
        items.forEach(function (el) {
          var cats = (el.getAttribute("data-cats") || "").split(/\s+/);
          var ok = key === "all" || cats.indexOf(key) > -1;
          el.hidden = !ok;
          if (ok) shown++;
        });
        chips.forEach(function (chip) {
          chip.setAttribute("aria-pressed", chip.getAttribute("data-filter") === key ? "true" : "false");
        });
        if (counter) counter.textContent = String(shown);
        if (empty) empty.hidden = shown > 0;
      }

      group.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-filter]");
        if (!chip) return;
        apply(chip.getAttribute("data-filter"));
      });

      apply("all");
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    try {
      initDialog();
      initAccordion();
      initFilter();
    } catch (err) {
      if (window.location.hostname === "127.0.0.1") console.warn("[ui]", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  // 暴露给 projects.js / notes.js 使用
  window.CL.ui = {
    openDialog: openDialog,
    closeDialog: closeDialog,
    openBySlug: openBySlug
  };
})();
