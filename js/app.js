/* Starts everything: welcome popup, hotspots, hint. You normally do not need to edit this. */
(function () {
  "use strict";

  var CFG = window.INVITATION_CONFIG;
  var HS = window.INVITATION_HOTSPOTS;
  var h = UI.h;
  var SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------- welcome copy from config ---------- */
  function fillWelcome() {
    var w = CFG.welcome || {};
    function set(id, value) { var el = document.getElementById(id); if (el && UI.str(value)) el.textContent = value; }
    set("welcome-title", w.title);
    set("welcome-msg", w.message);
    set("welcome-tag", w.tagline);
    set("welcome-enter-label", w.button);
    if (UI.str(w.eyebrow)) document.getElementById("welcome-eyebrow").textContent = w.eyebrow.toUpperCase();
  }

  /* ---------- hotspots ---------- */
  function round(n) { return Math.round(n * 1000) / 1000; }

  function buildHotspots() {
    var host = document.getElementById("hotspots");
    var W = HS.size.width, H = HS.size.height;

    HS.items.forEach(function (item) {
      var xs = item.polygon.map(function (p) { return p[0]; });
      var ys = item.polygon.map(function (p) { return p[1]; });
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
      var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
      var w = maxX - minX, ht = maxY - minY;

      var clip = "polygon(" + item.polygon.map(function (p) {
        return round((p[0] - minX) / w * 100) + "% " + round((p[1] - minY) / ht * 100) + "%";
      }).join(", ") + ")";

      var pts = item.polygon.map(function (p) { return round(p[0] - minX) + "," + round(p[1] - minY); }).join(" ");

      var btn = h("button", {
        type: "button", class: "hs__btn", "aria-label": item.label, "aria-haspopup": "dialog",
        "data-hotspot": item.id, style: "clip-path:" + clip + ";-webkit-clip-path:" + clip,
        on: { click: function () { openPanel(item.panel, btn); } }
      });

      // Focus / hover / press feedback is drawn as a matching SVG outline (a clipped button can't show its own focus ring)
      var ring = document.createElementNS(SVG_NS, "svg");
      ring.setAttribute("class", "hs__ring");
      ring.setAttribute("viewBox", "0 0 " + w + " " + ht);
      ring.setAttribute("preserveAspectRatio", "none");
      ring.setAttribute("aria-hidden", "true");
      ring.setAttribute("focusable", "false");
      ["glow", "outer", "inner"].forEach(function (kind) {
        var poly = document.createElementNS(SVG_NS, "polygon");
        poly.setAttribute("points", pts);
        poly.setAttribute("class", "ring ring--" + kind);
        ring.appendChild(poly);
      });

      var box = h("div", {
        class: "hs hs--" + item.id,
        style: "left:" + round(minX / W * 100) + "%;top:" + round(minY / H * 100) + "%;width:" + round(w / W * 100) + "%;height:" + round(ht / H * 100) + "%"
      }, btn, ring);
      host.appendChild(box);
    });
  }

  function openPanel(name, opener) {
    var dlg = Panels.get(name);
    if (!dlg) return;
    hideHint(true);
    UI.open(dlg, opener);
  }

  /* ---------- hint ---------- */
  var hintTimer = null, hintEl = null, hintDone = false;
  function showHint() {
    hintEl = document.getElementById("hint");
    var text = UI.str(CFG.site.hintText);
    if (!text || hintDone) return;
    hintEl.textContent = text;
    setTimeout(function () { if (!hintDone) hintEl.classList.add("is-visible"); }, 500);
    hintTimer = setTimeout(function () { hideHint(false); }, 6500);
  }
  function hideHint(permanent) {
    if (!hintEl) return;
    clearTimeout(hintTimer);
    hintEl.classList.remove("is-visible");
    if (permanent) hintDone = true;
  }

  /* ---------- welcome popup ---------- */
  function setupWelcome() {
    var dlg = document.getElementById("welcome");
    var enter = document.getElementById("welcome-enter");
    UI.wire(dlg);
    // Esc or the button both mean "enter"; opener focus restore is not needed
    dlg.addEventListener("sheetclosed", function () {
      document.getElementById("stage").classList.add("is-entered");
      showHint();
    });
    enter.addEventListener("click", function () { UI.close(dlg); });
    UI.open(dlg, null, dlg.querySelector('.welcome'));
  }

  /* ---------- helpful console report for the host ---------- */
  function reportSetup() {
    var flat = JSON.stringify(CFG);
    var left = (flat.match(/"\[[^"]*\]"/g) || []).length;
    var notes = [];
    if (left) notes.push(left + " placeholder value(s) still in js/config.js");
    if (!Store.isConnected()) notes.push("shared storage not connected (DEMO MODE)");
    if (!CFG.event.date) notes.push("event date/time not set");
    if (notes.length && window.console) console.info("[invitation] Still to configure: " + notes.join("; ") + ". See docs/CHECKLIST.md");
  }

  function init() {
    if (typeof HTMLDialogElement === "undefined" || !HTMLDialogElement.prototype.showModal) {
      document.body.insertAdjacentHTML("afterbegin", '<div class="noscript">This invitation needs a newer browser. Please update your browser or open the link in Safari or Chrome.</div>');
      return;
    }
    if (/[?&]debug=hotspots/.test(location.search)) document.documentElement.classList.add("debug-hotspots");
    Sprites.mount(document);
    fillWelcome();
    buildHotspots();
    setupWelcome();
    reportSetup();
    // lets :active styles work on iOS Safari
    document.addEventListener("touchstart", function () {}, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
