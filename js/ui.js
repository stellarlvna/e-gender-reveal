/* Small shared helpers: building elements safely, placeholder detection,
   and the popup (dialog) open/close behaviour with proper focus handling. */
(function () {
  "use strict";

  var CFG = window.INVITATION_CONFIG;

  /* ---------- tiny element builder (uses textContent, so config text can't inject HTML) ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (key) {
      var val = props[key];
      if (val === undefined || val === null || val === false) return;
      if (key === "class") el.className = val;
      else if (key === "text") el.textContent = val;
      else if (key === "html") el.innerHTML = val;        // only used with our own static markup
      else if (key === "on") Object.keys(val).forEach(function (ev) { el.addEventListener(ev, val[ev]); });
      else if (key === "style") el.setAttribute("style", val);
      else el.setAttribute(key, val === true ? "" : val);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(parent, child) {
    if (child === undefined || child === null || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(parent, c); }); return; }
    parent.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }

  // Replace everything inside `parent` with the given children (arrays and null are fine).
  function fill(parent) {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    for (var i = 1; i < arguments.length; i++) append(parent, arguments[i]);
    return parent;
  }

  /* ---------- placeholder helpers ---------- */
  function str(v) { return typeof v === "string" ? v.trim() : (v == null ? "" : String(v).trim()); }
  function isMissing(v) { return str(v) === ""; }
  function isPh(v) { return /^\[[\s\S]*\]$/.test(str(v)); }

  // A <span> that is visibly marked when the value is still a "[placeholder]".
  function txt(value, fallback) {
    var v = str(value);
    if (v === "" && fallback) return h("span", { class: "is-placeholder", text: fallback });
    return h("span", { class: isPh(v) ? "is-placeholder" : "", text: v });
  }

  function placeholderNotice(content) {
    if (CFG.site.showPlaceholderNotices === false) return;
    if (!content.querySelector(".is-placeholder")) return;
    content.insertBefore(
      h("p", { class: "notice notice--ph", role: "note" },
        h("strong", { text: "Placeholder text. " }),
        "Anything with a dashed outline is a stand-in. Replace it in js/config.js."),
      content.firstChild
    );
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reducedMotion() { return !!(motionQuery && motionQuery.matches); }

  /* ---------- dialogs ---------- */
  var openCount = 0;
  function lockScroll() { openCount++; document.documentElement.classList.add("is-locked"); }
  function unlockScroll() { openCount = Math.max(0, openCount - 1); if (!openCount) document.documentElement.classList.remove("is-locked"); }

  function open(dlg, opener, focusEl) {
    if (!dlg || dlg.open) return;
    dlg.__opener = opener || null;
    lockScroll();
    dlg.showModal();
    // two frames so the browser paints the "closed" state first and the transition runs
    requestAnimationFrame(function () { requestAnimationFrame(function () { dlg.classList.add("is-open"); }); });
    var target = focusEl || dlg.querySelector("[data-autofocus]") || dlg.querySelector(".sheet__title");
    if (target) target.focus({ preventScroll: true });
  }

  function close(dlg, done) {
    if (!dlg || !dlg.open || dlg.__closing) return;
    dlg.__closing = true;
    dlg.classList.remove("is-open");
    var finish = function () {
      dlg.__closing = false;
      if (dlg.open) dlg.close();
    };
    if (reducedMotion()) finish(); else setTimeout(finish, 280);
    if (done) done();
  }

  // Wire up the standard behaviours for a <dialog>
  function wire(dlg) {
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(dlg); });          // Esc key
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(dlg); });         // tap outside
    dlg.addEventListener("close", function () {
      dlg.classList.remove("is-open");
      unlockScroll();
      var opener = dlg.__opener;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      dlg.dispatchEvent(new CustomEvent("sheetclosed"));
    });
    return dlg;
  }

  var CLOSE_ICON = '<svg viewBox="0 0 12 12" width="18" height="18" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
    '<path d="M1 1h2v1h1v1h1v1h2V3h1V2h1V1h2v2h-1v1h-1v1H8v2h1v1h1v1h1v2h-2v-1H8V9H7V8H5v1H4v1H3v1H1V9h1V8h1V7h1V5H3V4H2V3H1z" fill="currentColor"/></svg>';

  function createSheet(opts) {
    var titleId = opts.id + "-title";
    var dlg = h("dialog", { class: "dlg dlg--sheet", id: opts.id, "aria-labelledby": titleId });
    var closeBtn = h("button", { type: "button", class: "sheet__close", "aria-label": "Close " + opts.title, html: CLOSE_ICON,
      on: { click: function () { close(dlg); } } });
    var head = h("header", { class: "sheet__head" },
      h("h2", { class: "sheet__title", id: titleId, tabindex: "-1", text: opts.title }), closeBtn);
    var body = h("div", { class: "sheet__body" }, opts.content);
    dlg.appendChild(
      h("div", { class: "sheet-shadow" },
        h("div", { class: "pf pf--top sheet__l1" },
          h("div", { class: "pf pf--top sheet__l2" },
            h("div", { class: "pf pf--top sheet__l3" }, head, body))))
    );
    wire(dlg);
    dlg.__body = body;
    return dlg;
  }

  window.UI = {
    h: h, fill: fill, str: str, isMissing: isMissing, isPh: isPh, txt: txt, uid: uid,
    placeholderNotice: placeholderNotice, reducedMotion: reducedMotion,
    open: open, close: close, wire: wire, createSheet: createSheet
  };
})();
