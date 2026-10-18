/* Talks to the shared online storage (a Google Apps Script web app that writes to
   YOUR private Google Sheet). See docs/SETUP.md.

   • No endpoint in js/config.js  →  DEMO MODE. Nothing is sent or saved, and the
     panels say so. We never pretend something was saved.
   • Votes and RSVPs are only reported as successful after the server replies
     { ok: true }.
   • The endpoint URL is not a secret key. The script behind it can only add a
     vote / RSVP and return vote totals. RSVPs can never be read through it. */
(function () {
  "use strict";

  var CFG = window.INVITATION_CONFIG;
  var TIMEOUT_MS = 20000;

  function endpoint() { return UI.str(CFG.storage && CFG.storage.endpoint); }

  function isConnected() {
    return /^https:\/\/script\.google\.com\/macros\/s\/[^\s/]+\/exec$/.test(endpoint());
  }

  function withTimeout(promiseFactory) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    return promiseFactory(ctrl ? ctrl.signal : undefined).finally(function () { clearTimeout(timer); });
  }

  function parse(response) {
    if (!response.ok) throw new Error("The server answered with status " + response.status + ".");
    return response.text().then(function (text) {
      var data;
      try { data = JSON.parse(text); } catch (e) { throw new Error("The server's reply could not be read."); }
      if (!data || data.ok !== true) {
        throw new Error((data && data.error) || "The server could not save that.");
      }
      return data;
    });
  }

  function friendly(err) {
    if (err && err.name === "AbortError") return new Error("That took too long. Please check your connection and try again.");
    if (err instanceof TypeError) return new Error("Couldn’t reach the server. Please check your connection and try again.");
    return err;
  }

  function post(payload) {
    if (!isConnected()) return Promise.reject(new Error("Storage is not connected (demo mode)."));
    return withTimeout(function (signal) {
      return fetch(endpoint(), {
        method: "POST",
        // text/plain keeps this a "simple" request, so no CORS pre-flight is needed
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow",
        signal: signal
      }).then(parse);
    }).catch(function (e) { throw friendly(e); });
  }

  function getResults() {
    if (!isConnected()) return Promise.reject(new Error("Storage is not connected (demo mode)."));
    return withTimeout(function (signal) {
      return fetch(endpoint() + "?action=results&t=" + Date.now(), { method: "GET", redirect: "follow", signal: signal }).then(parse);
    }).catch(function (e) { throw friendly(e); });
  }

  window.Store = {
    isConnected: isConnected,
    getResults: getResults,
    vote: function (choice, submissionId) {
      return post({ action: "vote", choice: choice, submissionId: submissionId });
    },
    rsvp: function (data, submissionId) {
      return post({ action: "rsvp", submissionId: submissionId, data: data });
    }
  };
})();
