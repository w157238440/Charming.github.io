/* ==============================================================================
   contact.js — 联系页表单（前端校验 + 生成邮件草稿）
   ------------------------------------------------------------------------------
   重要说明（也写在页面里给访客看）：
     本站是纯静态页面，没有后端，因此表单**不会自动发送**。提交后做三件事：
       1. 逐字段校验，把错误写在字段下方；
       2. 用填写内容拼一封 mailto: 链接；
       3. 显示一个反馈面板，让访客点按钮用本机邮件客户端发出。
     这样既不会出现「点了没反应」的僵尸按钮，也不会在没有后端的情况下假装发送成功。
   ============================================================================== */
(function () {
  "use strict";

  var CL = window.CL;
  if (!CL) return;
  var $ = CL.$;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function boot() {
    var form = $("#contact-form");
    if (!form) return;

    var fields = {
      name: {
        el: $("#name"),
        box: $("#name-field"),
        error: $("#name-error"),
        test: function (v) {
          if (!v) return "请填写你的称呼";
          if (v.length < 2) return "至少 2 个字，方便我们知道怎么称呼你";
          return "";
        }
      },
      email: {
        el: $("#email"),
        box: $("#email-field"),
        error: $("#email-error"),
        test: function (v) {
          if (!v) return "请填写邮箱";
          if (!EMAIL_RE.test(v)) return "邮箱格式看起来不对，检查一下有没有漏掉 @";
          return "";
        }
      },
      type: {
        el: $("#type"),
        box: $("#type-field"),
        error: $("#type-error"),
        test: function (v) {
          if (!v) return "请选择项目类型";
          return "";
        }
      },
      budget: {
        el: $("#budget"),
        box: $("#budget-field"),
        error: $("#budget-error"),
        test: function () {
          return ""; // 选填，永远通过
        }
      },
      message: {
        el: $("#message"),
        box: $("#message-field"),
        error: $("#message-error"),
        test: function (v) {
          if (!v) return "说说你想做什么";
          if (v.length < 10) return "至少写 10 个字，太短我们没法判断";
          return "";
        }
      }
    };

    /** 校验单个字段并写回界面；返回是否通过 */
    function validate(key, silent) {
      var f = fields[key];
      if (!f || !f.el) return true;

      var value = (f.el.value || "").trim();
      var msg = f.test(value);

      if (silent && !msg) return true;

      if (msg) {
        f.box.classList.add("is-invalid");
        f.el.setAttribute("aria-invalid", "true");
        if (f.error) f.error.textContent = msg;
        return false;
      }

      f.box.classList.remove("is-invalid");
      f.el.removeAttribute("aria-invalid");
      if (f.error) f.error.textContent = "";
      return true;
    }

    // 失焦校验 + 输入时消除已有错误（不让红字一直挂着）
    Object.keys(fields).forEach(function (key) {
      var f = fields[key];
      if (!f.el) return;

      f.el.addEventListener("blur", function () {
        validate(key, false);
      });

      f.el.addEventListener("input", function () {
        if (f.box.classList.contains("is-invalid")) validate(key, false);
      });

      f.el.addEventListener("change", function () {
        if (key === "type" || key === "budget") validate(key, false);
      });
    });

    /** 拼 mailto 链接：主题与正文都做 encodeURIComponent，中文不会出错 */
    function buildMailto() {
      var name = fields.name.el.value.trim();
      var email = fields.email.el.value.trim();
      var type = fields.type.el.value;
      var budget = fields.budget.el.value;
      var message = fields.message.el.value.trim();

      var subject = "[" + type + "] 项目咨询 — " + name;
      var body = [
        "称呼：" + name,
        "邮箱：" + email,
        "项目类型：" + type,
        "预算区间：" + (budget || "暂未确定"),
        "",
        "需求描述：",
        message,
        "",
        "—— 来自 charminglady.github.io 联系表单"
      ].join("\n");

      return "mailto:hi@charminglady.dev?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var keys = ["name", "email", "type", "budget", "message"];
      var firstInvalid = null;

      keys.forEach(function (key) {
        var ok = validate(key, false);
        if (!ok && !firstInvalid) firstInvalid = fields[key].el;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var link = buildMailto();
      var panel = $("#form-feedback");
      var anchor = $("#mailto-link");
      if (anchor) {
        anchor.setAttribute("href", link);
        anchor.textContent = "打开邮件客户端发送";
      }
      if (panel) {
        panel.classList.add("is-on");
        panel.setAttribute("role", "status");
      }
      // 滚动到反馈面板，确保访客看到「下一步要做什么」
      if (panel && panel.scrollIntoView) {
        panel.scrollIntoView({ behavior: CL.prefersReduced() ? "auto" : "smooth", block: "center" });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
