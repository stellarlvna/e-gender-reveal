/* The seven panels (bottom sheets). Each builder reads its wording from
   js/config.js. You normally do not need to edit this file. */
(function () {
  "use strict";

  var CFG = window.INVITATION_CONFIG;
  var h = UI.h, txt = UI.txt, str = UI.str, isMissing = UI.isMissing, isPh = UI.isPh;

  /* ---------- helpers ---------- */
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };

  function section(title, children, cls) {
    return h("section", { class: "block " + (cls || "") }, title ? h("h3", { class: "block__title", text: title }) : null, children);
  }
  function demoBanner(message) {
    return h("p", { class: "notice notice--demo", role: "note" }, h("strong", { text: "Demo mode. " }), message);
  }
  function statusLine() { return h("p", { class: "status", role: "status", "aria-live": "polite" }); }
  function setStatus(el, kind, message) {
    el.className = "status" + (kind ? " status--" + kind : "");
    el.textContent = message || "";
  }
  function button(label, cls, attrs) {
    return h("button", Object.assign({ type: "button", class: "btn " + (cls || "") }, attrs || {}), label);
  }
  function safeHex(v) { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str(v)) ? str(v) : "#e8d9c8"; }
  function safeUrl(v) { return /^https:\/\//i.test(str(v)) ? str(v) : ""; }

  var DEMO_TEXT = "Online storage isn’t connected yet, so nothing you send is saved.";

  /* =================================================================
     1. GUESS THE GENDER
     ================================================================= */
  function votePanel() {
    var c = CFG.vote, labels = c.labels || { boy: "Boy", girl: "Girl" };
    var storeKey = CFG.site.id + ":vote";
    var root = h("div", { class: "vote" });
    var view = h("div", { class: "vote__view" });
    var submissionId = UI.uid();

    if (!c.enabled) {
      root.appendChild(h("p", { class: "lead", text: "Guessing isn’t open right now. Please check back soon!" }));
      return root;
    }
    if (!Store.isConnected()) root.appendChild(demoBanner(DEMO_TEXT + " You can try the layout, but votes won’t count."));
    root.appendChild(view);

    var fineprint = h("p", { class: "fineprint" },
      "To avoid accidental repeats, this browser can send one guess. That doesn’t guarantee one vote per person: guests aren’t verified, so a guess from another device or after clearing browser data would still be counted.");

    /* ----- choice view ----- */
    function renderChoice() {
      var selected = null, busy = false;
      var status = statusLine();
      var legend = h("legend", { class: "lead", text: str(c.intro) || "Boy or girl? Make your guess!" });
      var grid = h("div", { class: "choices choices--row" });
      var group = h("fieldset", { class: "field" }, legend, grid);
      var confirm = h("button", { type: "submit", class: "btn btn--primary btn--block", disabled: true, text: "Confirm my guess" });

      ["boy", "girl"].forEach(function (id) {
        var input = h("input", { type: "radio", name: "guess", value: id, id: "vote-" + id, class: "choice__input",
          on: { change: function () { selected = id; confirm.disabled = false; setStatus(status, "", ""); } } });
        grid.appendChild(h("div", { class: "choice-wrap" }, input,
          h("label", { class: "choice choice--" + id, for: "vote-" + id },
            h("span", { class: "choice__icon", html: Sprites.svg("heart", id === "boy" ? "blue" : "pink", 5) }),
            h("span", { class: "choice__label", text: labels[id] }),
            h("span", { class: "choice__check", "aria-hidden": "true", text: "✓" }))));
      });

      var form = h("form", { class: "vote__form", novalidate: true, on: { submit: function (e) {
        e.preventDefault();
        if (busy || !selected) return;
        if (!Store.isConnected()) {
          setStatus(status, "info", "Demo mode: your guess was NOT saved because online storage isn’t connected yet.");
          return;
        }
        busy = true; confirm.disabled = true; confirm.textContent = "Saving…"; setStatus(status, "info", "Saving your guess…");
        Store.vote(selected, submissionId).then(function (res) {
          LS.set(storeKey, selected);
          renderResults({ mine: selected, justVoted: true, totals: { boy: res.boy, girl: res.girl } });
        }).catch(function (err) {
          setStatus(status, "error", err.message || "Something went wrong. Please try again.");
          confirm.textContent = "Confirm my guess"; confirm.disabled = false;
        }).then(function () { busy = false; });
      } } }, group, confirm, status);

      UI.fill(view, form, fineprint);

      if (!Store.isConnected()) {
        form.appendChild(button("Preview the results layout (sample numbers)", "btn--ghost btn--block", {
          on: { click: function () { renderResults({ mine: selected, sample: true, totals: { boy: 12, girl: 9 } }); } } }));
      }
    }

    /* ----- results view ----- */
    function renderResults(opts) {
      var box = h("div", { class: "results", "aria-live": "polite" });
      var head = opts.sample
        ? h("p", { class: "notice notice--demo", role: "note" }, h("strong", { text: "Sample data. " }), "These numbers are made up, just to show the layout. Nothing was saved.")
        : h("div", { class: "thanks" },
            h("span", { class: "thanks__icon", "aria-hidden": "true", html: Sprites.svg("star", "gold", 3) }),
            h("h3", { class: "thanks__title", text: opts.justVoted ? "Thank you! Your guess is saved." : "You’ve already made your guess" }),
            opts.mine ? h("p", { class: "thanks__sub" }, "Your guess: ", h("strong", { text: labels[opts.mine] || opts.mine })) : null);
      UI.fill(view, head, box, fineprint);

      if (c.showResultsAfterVote === false && !opts.sample) {
        box.appendChild(h("p", { class: "lead", text: "Results will be revealed on the day. Thanks for playing along!" }));
        return;
      }

      function draw(totals) {
        var boy = Number(totals.boy) || 0, girl = Number(totals.girl) || 0, total = boy + girl;
        var rows = [["boy", boy], ["girl", girl]].map(function (r) {
          var pct = total ? Math.round(r[1] / total * 100) : 0;
          return h("div", { class: "result" },
            h("div", { class: "result__top" },
              h("span", { class: "result__label", text: labels[r[0]] }),
              h("span", { class: "result__num", text: r[1] + (r[1] === 1 ? " guess" : " guesses") + " · " + pct + "%" })),
            h("div", { class: "bar", "aria-hidden": "true" }, h("div", { class: "bar__fill bar__fill--" + r[0], style: "width:" + pct + "%" })));
        });
        UI.fill(box, 
          total === 0 ? h("p", { class: "lead", text: "No guesses yet. You’re the first!" }) : rows,
          total ? h("p", { class: "result__total", text: total + (total === 1 ? " guess" : " guesses") + " so far" }) : null,
          opts.sample ? null : button("Refresh results", "btn--ghost", { on: { click: load } }));
      }
      function load() {
        UI.fill(box, h("p", { class: "loading", text: "Loading results…" }));
        Store.getResults().then(function (r) { draw({ boy: r.boy, girl: r.girl }); }).catch(function (err) {
          UI.fill(box, 
            h("p", { class: "status status--error", role: "alert", text: (err && err.message) || "Couldn’t load the results." }),
            button("Try again", "btn--ghost", { on: { click: load } }));
        });
      }

      if (opts.totals) draw(opts.totals); else load();
    }

    var already = LS.get(storeKey);
    if (already === "boy" || already === "girl") renderResults({ mine: already });
    else renderChoice();
    return root;
  }

  /* =================================================================
     2. DRESS CODE
     ================================================================= */
  function dressPanel() {
    var c = CFG.dressCode;
    var root = h("div", { class: "dress" });
    if (!isMissing(c.intro)) root.appendChild(h("p", { class: "lead" }, txt(c.intro)));

    var guidance = (c.guidance || []).filter(function (g) { return !isMissing(g); });
    if (guidance.length) {
      root.appendChild(section("The details", h("ul", { class: "bullets" }, guidance.map(function (g) { return h("li", null, txt(g)); }))));
    }

    var swatches = (c.swatches || []).filter(function (s) { return s && !isMissing(s.name); });
    if (swatches.length) {
      root.appendChild(section("Colour palette", h("ul", { class: "swatches" }, swatches.map(function (s) {
        return h("li", { class: "swatch" },
          h("span", { class: "swatch__chip", style: "background:" + safeHex(s.hex), "aria-hidden": "true" }),
          h("span", { class: "swatch__name" }, txt(s.name)),
          h("span", { class: "sr-only", text: " (" + safeHex(s.hex) + ")" }));
      }))));
    }

    var ideas = (c.suggestions || []).filter(function (s) { return s && (!isMissing(s.title) || !isMissing(s.text)); });
    if (ideas.length) {
      root.appendChild(section("Outfit ideas", h("div", { class: "cards" }, ideas.map(function (s) {
        return h("article", { class: "card" },
          isMissing(s.title) ? null : h("h4", { class: "card__title" }, txt(s.title)),
          isMissing(s.text) ? null : h("p", { class: "card__text" }, txt(s.text)));
      }))));
    }

    if (!isMissing(c.avoid)) root.appendChild(section("Please avoid", h("p", null, txt(c.avoid))));
    UI.placeholderNotice(root);
    return root;
  }

  /* =================================================================
     3. GIFT
     ================================================================= */
  function copyText(text, host) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text, host); });
    }
    return Promise.resolve(legacyCopy(text, host));
  }
  function legacyCopy(text, host) {
    var ta = h("textarea", { readonly: "", "aria-hidden": "true", tabindex: "-1", style: "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0" });
    ta.value = text;
    (host || document.body).appendChild(ta);
    ta.focus({ preventScroll: true }); ta.select(); ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function giftPanel() {
    var c = CFG.gift;
    var root = h("div", { class: "gift" });
    if (!isMissing(c.message)) root.appendChild(h("p", { class: "lead" }, txt(c.message)));

    var rows = [];
    if (!isMissing(c.bankName)) rows.push(["Bank", txt(c.bankName)]);
    if (!isMissing(c.accountHolder)) rows.push(["Account holder", txt(c.accountHolder)]);
    var acct = str(c.accountNumber);
    var acctEl = null;
    if (acct) {
      acctEl = h("span", { class: "acct" + (isPh(acct) ? " is-placeholder" : ""), text: acct });
      rows.push(["Account number", acctEl]);
    }

    if (rows.length) {
      var dl = h("dl", { class: "facts facts--card" });
      rows.forEach(function (r) { dl.appendChild(h("div", { class: "fact" }, h("dt", { text: r[0] }), h("dd", null, r[1]))); });
      root.appendChild(dl);
    } else {
      root.appendChild(h("p", { class: "notice notice--ph", role: "note" }, h("strong", { text: "Gift details not added yet. " }),
        "Add the bank name, account holder and account number in js/config.js."));
    }

    if (acct && !isPh(acct)) {
      var status = statusLine();
      var copyBtn = button("Copy account number", "btn--primary btn--block", { on: { click: function () {
        Promise.resolve(copyText(acct, root)).then(function (ok) {
          if (ok) {
            copyBtn.textContent = "Copied ✓";
            setStatus(status, "ok", "Account number copied.");
            setTimeout(function () { copyBtn.textContent = "Copy account number"; }, 2600);
          } else {
            var sel = window.getSelection(), range = document.createRange();
            range.selectNodeContents(acctEl); sel.removeAllRanges(); sel.addRange(range);
            setStatus(status, "error", "Couldn’t copy automatically. The number is selected. Press and hold it, then choose Copy.");
          }
        });
      } } });
      root.appendChild(copyBtn);
      root.appendChild(status);
    }

    var qr = str(c.qrImage);
    if (qr) {
      var fig = h("figure", { class: "qr" });
      var img = h("img", { src: qr, alt: "QR code for the gift transfer", width: "220", height: "220", loading: "lazy",
        on: { error: function () { UI.fill(fig, h("p", { class: "notice notice--ph", role: "note" }, "The QR code image couldn’t be loaded. Check the path in js/config.js.")); } } });
      fig.appendChild(img);
      if (!isMissing(c.qrCaption)) fig.appendChild(h("figcaption", null, txt(c.qrCaption)));
      root.appendChild(fig);
    }

    root.appendChild(h("p", { class: "fineprint", text: "This page only shows details. No payments are made here." }));
    UI.placeholderNotice(root);
    return root;
  }

  /* =================================================================
     4. GALLERY
     ================================================================= */
  function galleryPanel() {
    var photos = ((CFG.gallery && CFG.gallery.photos) || []).filter(function (p) { return p && !isMissing(p.src); });
    var root = h("div", { class: "gallery" });
    if (!photos.length) {
      root.appendChild(h("p", { class: "lead", text: "Photos are coming soon." }));
      root.appendChild(h("p", { class: "fineprint", text: "Hosts: add pictures to assets/images/gallery/ and list them in js/config.js." }));
      return root;
    }

    var idx = 0;
    var live = h("p", { class: "sr-only", role: "status", "aria-live": "polite" });
    var imgEl = h("img", { class: "viewer__img", alt: "", decoding: "async", draggable: "false" });
    var fallback = h("p", { class: "viewer__fallback", hidden: true, text: "This photo couldn’t be loaded." });
    var counter = h("span", { class: "viewer__count" });
    var caption = h("p", { class: "viewer__caption" });
    imgEl.addEventListener("error", function () { fallback.hidden = false; imgEl.hidden = true; });
    imgEl.addEventListener("load", function () { fallback.hidden = true; imgEl.hidden = false; });

    var prevBtn = h("button", { type: "button", class: "viewer__nav viewer__nav--prev", "aria-label": "Previous photo", html: "<span aria-hidden='true'>‹</span>", on: { click: function () { go(idx - 1); } } });
    var nextBtn = h("button", { type: "button", class: "viewer__nav viewer__nav--next", "aria-label": "Next photo", html: "<span aria-hidden='true'>›</span>", on: { click: function () { go(idx + 1); } } });
    var viewer = h("div", { class: "viewer", tabindex: "0", role: "group", "aria-roledescription": "carousel", "aria-label": "Photo viewer. Use the arrow keys or swipe to change photo." },
      imgEl, fallback, prevBtn, nextBtn, counter);

    var thumbBtns = photos.map(function (p, i) {
      return h("li", null, h("button", { type: "button", class: "thumb", "aria-label": "Show photo " + (i + 1) + " of " + photos.length,
        on: { click: function () { go(i); } } },
        h("img", { src: p.src, alt: "", loading: "lazy", draggable: "false" })));
    });
    var thumbs = h("ul", { class: "thumbs" }, thumbBtns);

    function go(n) {
      idx = (n + photos.length) % photos.length;
      var p = photos[idx];
      fallback.hidden = true; imgEl.hidden = false;
      imgEl.src = p.src;
      imgEl.alt = str(p.alt);
      counter.textContent = (idx + 1) + " / " + photos.length;
      UI.fill(caption, isMissing(p.caption) ? null : txt(p.caption));
      thumbBtns.forEach(function (li, i) {
        var b = li.firstChild;
        if (i === idx) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
      var cur = thumbBtns[idx].firstChild;
      if (thumbs.scrollTo && cur.offsetParent) {
        var left = cur.offsetLeft - (thumbs.clientWidth - cur.offsetWidth) / 2;
        thumbs.scrollTo({ left: left, behavior: UI.reducedMotion() ? "auto" : "smooth" });
      }
      live.textContent = "Photo " + (idx + 1) + " of " + photos.length + (str(p.alt) && !isPh(p.alt) ? ": " + str(p.alt) : "");
      [idx - 1, idx + 1].forEach(function (j) { var q = photos[(j + photos.length) % photos.length]; (new Image()).src = q.src; });
      prevBtn.hidden = nextBtn.hidden = photos.length < 2;
    }

    // swipe (touch, pen, or mouse drag); vertical scrolling is left alone via touch-action: pan-y
    var sx = null, sy = null;
    viewer.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.button !== 0) return; sx = e.clientX; sy = e.clientY; });
    viewer.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? idx + 1 : idx - 1);
    });
    viewer.addEventListener("pointercancel", function () { sx = null; });
    viewer.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
    });

    root.append(viewer, caption, thumbs, live);
    go(0);
    UI.placeholderNotice(root);
    return root;
  }

  /* =================================================================
     5. DATE & TIME
     ================================================================= */
  function datePanel() {
    var ev = CFG.event, locale = CFG.site.locale;
    var root = h("div", { class: "date" });
    var dateText = Cal.formatDate(ev, locale);
    var s = str(ev.startTime), e = str(ev.endTime);
    var timeText = (Cal.formatTime(s) && Cal.formatTime(e)) ? Cal.formatTime(s) + " – " + Cal.formatTime(e) + " (Malaysia time)" : "";

    var dl = h("dl", { class: "facts facts--card" },
      fact("Event", txt(ev.title, "[Event title not set]")),
      fact("Parents", txt(ev.hosts, "[Parents’ names not set]")),
      fact("Date", dateText ? h("span", { text: dateText }) : h("span", { class: "is-placeholder", text: "[Date not set. Add it in js/config.js]" })),
      fact("Time", timeText ? h("span", { text: timeText }) : h("span", { class: "is-placeholder", text: "[Start and end time not set]" })),
      fact("Venue", h("span", null, txt(ev.venueName, "[Venue name not set]"), h("br"), txt(ev.venueAddress, "[Venue address not set]"))));
    root.appendChild(dl);

    var schedule = (ev.schedule || []).filter(function (r) { return r && (!isMissing(r.time) || !isMissing(r.title)); });
    if (schedule.length) {
      root.appendChild(section("Schedule", h("ol", { class: "schedule" }, schedule.map(function (r) {
        return h("li", null, h("span", { class: "schedule__time" }, txt(r.time)), h("span", { class: "schedule__title" }, txt(r.title)));
      }))));
    }

    var v = Cal.validate(ev);
    var status = statusLine();
    var btn = button("Add to calendar", "btn--primary btn--block", { disabled: !v.ok, on: { click: function () {
      var ics = Cal.build(ev, CFG.site.id, ev.venueAddress);
      if (!ics) { setStatus(status, "error", "The calendar file couldn’t be created. Please check the event details."); return; }
      Cal.download(ics, ev.title);
      setStatus(status, "ok", "Calendar file downloaded. Open it to add the event.");
    } } });
    root.appendChild(btn);
    root.appendChild(h("p", { class: "fineprint", id: "cal-hint" }, v.ok
      ? "Downloads a calendar file that opens in Apple, Google or Outlook Calendar."
      : "Add to calendar is switched off until the host sets: " + v.problems.join(", ") + "."));
    if (!v.ok) btn.setAttribute("aria-describedby", "cal-hint");
    root.appendChild(status);
    UI.placeholderNotice(root);
    return root;
  }
  function fact(label, value) { return h("div", { class: "fact" }, h("dt", { text: label }), h("dd", null, value)); }

  /* =================================================================
     6. RSVP
     ================================================================= */
  function todayMY() { return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10); }

  function rsvpPanel() {
    var c = CFG.rsvp;
    var root = h("div", { class: "rsvp" });
    if (!c.enabled) { root.appendChild(h("p", { class: "lead", text: "RSVPs aren’t open right now." })); return root; }

    var deadline = str(c.deadline), deadlineOk = Cal.validDate(deadline);
    if (deadlineOk && todayMY() > deadline) {
      root.appendChild(h("p", { class: "lead", text: "RSVPs have now closed. If you still need to reach the hosts, please contact them directly." }));
      return root;
    }
    if (!Store.isConnected()) root.appendChild(demoBanner(DEMO_TEXT + " Your reply won’t reach the hosts."));
    var introEls = [];
    if (!isMissing(c.intro)) introEls.push(h("p", { class: "lead" }, txt(c.intro)));
    if (deadlineOk) introEls.push(h("p", { class: "fineprint" }, "Please reply by " + Cal.formatDate({ date: deadline }, CFG.site.locale) + "."));
    introEls.forEach(function (el) { root.appendChild(el); });
    function showIntro(show) { introEls.forEach(function (el) { el.hidden = !show; }); }

    var max = Math.max(1, Math.min(50, parseInt(c.maxGuestsPerResponse, 10) || 10));
    var submissionId = UI.uid(), busy = false;
    var holder = h("div", { class: "rsvp__holder" });
    root.appendChild(holder);
    root.appendChild(h("p", { class: "fineprint", text: "Your reply goes privately to the hosts. It is never shown to other guests." }));

    function errEl(id) { return h("p", { class: "err", id: id, hidden: true }); }
    function showErr(input, el, msg) {
      el.textContent = msg || ""; el.hidden = !msg;
      if (input) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    }

    function renderForm() {
      var nameIn = h("input", { type: "text", id: "rsvp-name", name: "name", autocomplete: "name", maxlength: "80", required: true, "aria-describedby": "rsvp-name-err" });
      var nameErr = errEl("rsvp-name-err");

      var attendErr = errEl("rsvp-attend-err");
      var yes = h("input", { type: "radio", name: "attending", value: "yes", id: "rsvp-yes", class: "choice__input", "aria-describedby": "rsvp-attend-err" });
      var no = h("input", { type: "radio", name: "attending", value: "no", id: "rsvp-no", class: "choice__input", "aria-describedby": "rsvp-attend-err" });
      var attendGroup = h("fieldset", { class: "field" },
        h("legend", null, "Will you be joining us? ", h("span", { class: "req", text: "(required)" })),
        h("div", { class: "choices choices--row" },
          h("div", { class: "choice-wrap" }, yes, h("label", { class: "choice choice--small", for: "rsvp-yes" }, h("span", { class: "choice__label", text: "Yes, I’ll be there" }), h("span", { class: "choice__check", "aria-hidden": "true", text: "✓" }))),
          h("div", { class: "choice-wrap" }, no, h("label", { class: "choice choice--small", for: "rsvp-no" }, h("span", { class: "choice__label", text: "Sorry, I can’t make it" }), h("span", { class: "choice__check", "aria-hidden": "true", text: "✓" })))),
        attendErr);

      var guestsIn = h("input", { type: "number", id: "rsvp-guests", name: "guests", inputmode: "numeric", min: "1", max: String(max), value: "1", "aria-describedby": "rsvp-guests-err" });
      var guestsErr = errEl("rsvp-guests-err");
      function step(d) { var n = parseInt(guestsIn.value, 10) || 1; guestsIn.value = String(Math.max(1, Math.min(max, n + d))); showErr(guestsIn, guestsErr, ""); }
      var guestsField = h("div", { class: "field", hidden: true },
        h("label", { for: "rsvp-guests" }, "How many people are coming, including you? ", h("span", { class: "req", text: "(up to " + max + ")" })),
        h("div", { class: "stepper" },
          h("button", { type: "button", class: "stepper__btn", "aria-label": "One fewer person", text: "−", on: { click: function () { step(-1); } } }),
          guestsIn,
          h("button", { type: "button", class: "stepper__btn", "aria-label": "One more person", text: "+", on: { click: function () { step(1); } } })),
        guestsErr);

      function onAttend() {
        guestsField.hidden = !yes.checked;
        attendErr.hidden = true; attendErr.textContent = "";
      }
      yes.addEventListener("change", onAttend); no.addEventListener("change", onAttend);

      var dietIn = h("textarea", { id: "rsvp-diet", name: "dietary", rows: "2", maxlength: "300", placeholder: "e.g. vegetarian, nut allergy" });
      var msgIn = h("textarea", { id: "rsvp-msg", name: "message", rows: "3", maxlength: "500", placeholder: "Anything you’d like to tell us" });
      var trap = h("div", { class: "trap", "aria-hidden": "true" }, h("label", { for: "rsvp-site", text: "Leave this field empty" }), h("input", { type: "text", id: "rsvp-site", name: "website", tabindex: "-1", autocomplete: "off" }));

      var status = statusLine();
      var submit = h("button", { type: "submit", class: "btn btn--primary btn--block", text: "Send RSVP" });

      var form = h("form", { class: "rsvp__form", novalidate: true },
        h("div", { class: "field" }, h("label", { for: "rsvp-name" }, "Your name ", h("span", { class: "req", text: "(required)" })), nameIn, nameErr),
        attendGroup, guestsField,
        c.askDietary === false ? null : h("div", { class: "field" }, h("label", { for: "rsvp-diet" }, "Dietary requirements ", h("span", { class: "req", text: "(optional)" })), dietIn),
        c.askMessage === false ? null : h("div", { class: "field" }, h("label", { for: "rsvp-msg" }, "Message to the hosts ", h("span", { class: "req", text: "(optional)" })), msgIn),
        trap, submit, status);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (busy) return;
        var name = nameIn.value.trim().replace(/\s+/g, " ");
        var attending = yes.checked ? "yes" : (no.checked ? "no" : "");
        var guests = parseInt(guestsIn.value, 10);
        var firstBad = null;

        showErr(nameIn, nameErr, name ? "" : "Please enter your name.");
        if (!name && !firstBad) firstBad = nameIn;
        attendErr.hidden = !!attending; attendErr.textContent = attending ? "" : "Please choose one.";
        if (!attending && !firstBad) firstBad = yes;
        if (attending === "yes" && !(guests >= 1 && guests <= max)) {
          showErr(guestsIn, guestsErr, "Please enter a number from 1 to " + max + ".");
          if (!firstBad) firstBad = guestsIn;
        } else showErr(guestsIn, guestsErr, "");
        if (firstBad) { firstBad.focus(); setStatus(status, "error", "Please fix the highlighted fields."); return; }

        if (!Store.isConnected()) {
          setStatus(status, "info", "Demo mode: your RSVP was NOT saved because online storage isn’t connected yet.");
          return;
        }

        busy = true; submit.disabled = true; submit.textContent = "Sending…"; setStatus(status, "info", "Sending your RSVP…");
        var data = {
          name: name, attending: attending,
          guests: attending === "yes" ? guests : 0,
          dietary: c.askDietary === false ? "" : dietIn.value.trim(),
          message: c.askMessage === false ? "" : msgIn.value.trim(),
          website: form.elements.website.value
        };
        Store.rsvp(data, submissionId).then(function () {
          renderDone(name, attending, data.guests);
        }).catch(function (err) {
          setStatus(status, "error", (err && err.message) || "Something went wrong. Please try again.");
          submit.disabled = false; submit.textContent = "Send RSVP";
        }).then(function () { busy = false; });
      });

      showIntro(true);
      UI.fill(holder, form);
    }

    function renderDone(name, attending, guests) {
      var again = button("Send another response", "btn--ghost btn--block", { on: { click: function () { submissionId = UI.uid(); renderForm(); var f = holder.querySelector("input"); if (f) f.focus(); } } });
      var title = h("h3", { class: "thanks__title", tabindex: "-1", text: "Thank you, " + name + "!" });
      showIntro(false);
      UI.fill(holder, h("div", { class: "thanks" },
        h("span", { class: "thanks__icon", "aria-hidden": "true", html: Sprites.svg("heart", "red", 4) }), title,
        h("p", { class: "thanks__sub", text: attending === "yes"
          ? "Your RSVP is saved for " + guests + (guests === 1 ? " person" : " people") + ". We can’t wait to celebrate with you!"
          : "Your reply is saved. We’ll miss you, and thank you for letting us know." }),
        again));
      title.focus({ preventScroll: true });
    }

    renderForm();
    return root;
  }

  /* =================================================================
     7. DIRECTORY
     ================================================================= */
  function waLink(v) {
    v = str(v);
    if (!v) return "";
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(v)) return v;
    var digits = v.replace(/\D/g, "");
    if (digits.length < 8 || digits.charAt(0) === "0") { if (digits) console.warn("[invitation] WhatsApp number needs the country code and no leading 0 (e.g. 60123456789):", v); return ""; }
    return "https://wa.me/" + digits;
  }

  function directoryPanel() {
    var ev = CFG.event, d = CFG.directory;
    var root = h("div", { class: "directory" });
    var addr = str(ev.venueAddress), name = str(ev.venueName);
    var hasAddr = addr && !isPh(addr);
    var query = [name && !isPh(name) ? name : "", hasAddr ? addr : ""].filter(Boolean).join(", ");

    var maps = safeUrl(d.googleMapsUrl) || (query ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query) : "");
    var waze = safeUrl(d.wazeUrl) || (query ? "https://waze.com/ul?q=" + encodeURIComponent(query) + "&navigate=yes" : "");

    root.appendChild(h("dl", { class: "facts facts--card" },
      fact("Venue", h("span", null, txt(ev.venueName, "[Venue name not set]"), h("br"), txt(ev.venueAddress, "[Venue address not set]")))));

    var links = [];
    if (maps) links.push(h("a", { class: "btn btn--primary", href: maps, target: "_blank", rel: "noopener noreferrer" }, "Open in Google Maps ", h("span", { class: "sr-only", text: "(opens in a new tab)" })));
    if (waze) links.push(h("a", { class: "btn btn--blue", href: waze, target: "_blank", rel: "noopener noreferrer" }, "Open in Waze ", h("span", { class: "sr-only", text: "(opens in a new tab)" })));
    if (links.length) root.appendChild(h("div", { class: "btn-row" }, links));
    else root.appendChild(h("p", { class: "notice notice--ph", role: "note" }, h("strong", { text: "Map links appear once the venue address is set. " }), "Add it in js/config.js."));

    var notes = (d.arrivalNotes || []).filter(function (n) { return !isMissing(n); });
    if (notes.length) root.appendChild(section("Parking & arrival", h("ul", { class: "bullets" }, notes.map(function (n) { return h("li", null, txt(n)); }))));

    var contacts = (d.contacts || []).filter(function (p) { return p && !isMissing(p.name); });
    if (contacts.length) {
      root.appendChild(section("Contact the hosts", h("ul", { class: "contacts" }, contacts.map(function (p) {
        var link = waLink(p.whatsapp);
        return h("li", { class: "contact" },
          h("div", { class: "contact__who" }, h("strong", null, txt(p.name)), isMissing(p.role) ? null : h("span", { class: "contact__role" }, txt(p.role))),
          link ? h("a", { class: "btn btn--wa", href: link, target: "_blank", rel: "noopener noreferrer", "aria-label": "Message " + str(p.name) + " on WhatsApp (opens in a new tab)" }, "WhatsApp") : null);
      }))));
    }
    UI.placeholderNotice(root);
    return root;
  }

  /* ---------- registry ---------- */
  var DEFS = {
    vote:      { title: "Guess the gender", build: votePanel },
    dress:     { title: "Dress code",       build: dressPanel },
    gift:      { title: "Gift",             build: giftPanel },
    gallery:   { title: "Gallery",          build: galleryPanel },
    date:      { title: "Date & time",      build: datePanel },
    rsvp:      { title: "RSVP",             build: rsvpPanel },
    directory: { title: "Directory",        build: directoryPanel }
  };

  var cache = {};
  function get(name) {
    if (cache[name]) return cache[name];
    var def = DEFS[name];
    if (!def) return null;
    var dlg = UI.createSheet({ id: "panel-" + name, title: def.title, content: def.build() });
    document.getElementById("dialogs").appendChild(dlg);
    cache[name] = dlg;
    return dlg;
  }

  window.Panels = { get: get, names: Object.keys(DEFS) };
})();
