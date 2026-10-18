/* Builds the downloadable calendar file (.ics) in the Asia/Kuala_Lumpur time zone.
   The "Add to calendar" button stays switched off until the event has a real
   title, a valid date and valid start/end times. */
(function () {
  "use strict";

  var TZ = "Asia/Kuala_Lumpur";

  function validDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    if (!m) return false;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  }
  function validTime(s) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(s || ""); }
  function mins(t) { return +t.slice(0, 2) * 60 + +t.slice(3, 5); }

  // Returns { ok: boolean, problems: [text, ...] }
  function validate(ev) {
    var problems = [];
    var title = UI.str(ev.title);
    if (!title || UI.isPh(title)) problems.push("the event title");
    if (!validDate(UI.str(ev.date))) problems.push("the date (YYYY-MM-DD)");
    var okStart = validTime(UI.str(ev.startTime)), okEnd = validTime(UI.str(ev.endTime));
    if (!okStart) problems.push("the start time (HH:MM)");
    if (!okEnd) problems.push("the end time (HH:MM)");
    if (okStart && okEnd && mins(UI.str(ev.endTime)) <= mins(UI.str(ev.startTime))) problems.push("an end time later than the start time");
    return { ok: problems.length === 0, problems: problems };
  }

  /* ---------- display formatting ---------- */
  function formatDate(ev, locale) {
    if (!validDate(UI.str(ev.date))) return "";
    var p = ev.date.split("-").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12));
    try {
      return new Intl.DateTimeFormat(locale || "en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    } catch (e) { return ev.date; }
  }
  function formatTime(t) {
    if (!validTime(t)) return "";
    var hh = +t.slice(0, 2), mm = t.slice(3, 5);
    var suffix = hh >= 12 ? "pm" : "am";
    var h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ":" + mm + " " + suffix;
  }

  /* ---------- .ics building ---------- */
  function esc(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  }
  // Lines must be at most 75 bytes; continuation lines start with one space.
  function fold(line) {
    var enc = new TextEncoder(), out = [], cur = "", curBytes = 0, limit = 75;
    Array.from(line).forEach(function (ch) {
      var b = enc.encode(ch).length;
      if (curBytes + b > limit) { out.push(cur); cur = " "; curBytes = 1; limit = 75; }
      cur += ch; curBytes += b;
    });
    out.push(cur);
    return out.join("\r\n");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function stamp(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }
  function local(date, time) { return date.replace(/-/g, "") + "T" + time.replace(":", "") + "00"; }

  function build(ev, siteId, address) {
    var v = validate(ev);
    if (!v.ok) return null;
    var venue = [UI.str(ev.venueName), UI.str(address || ev.venueAddress)].filter(function (x) { return x && !UI.isPh(x); }).join(", ");
    var notes = [];
    if (!UI.isMissing(ev.calendarNotes) && !UI.isPh(ev.calendarNotes)) notes.push(UI.str(ev.calendarNotes));
    if (!UI.isMissing(ev.hosts) && !UI.isPh(ev.hosts)) notes.push("Hosted by " + UI.str(ev.hosts));

    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gender Reveal Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE",
      "TZID:" + TZ,
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0800",
      "TZOFFSETTO:+0800",
      "TZNAME:MYT",
      "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      "UID:" + (siteId || "invitation") + "-" + ev.date + "-" + ev.startTime.replace(":", "") + "@gender-reveal-invitation",
      "DTSTAMP:" + stamp(new Date()),
      "DTSTART;TZID=" + TZ + ":" + local(ev.date, ev.startTime),
      "DTEND;TZID=" + TZ + ":" + local(ev.date, ev.endTime),
      "SUMMARY:" + esc(UI.str(ev.title))
    ];
    if (venue) lines.push("LOCATION:" + esc(venue));
    if (notes.length) lines.push("DESCRIPTION:" + esc(notes.join("\n")));
    var reminder = Number(ev.reminderMinutesBefore);
    if (reminder > 0) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc(UI.str(ev.title)), "TRIGGER:-PT" + Math.round(reminder) + "M", "END:VALARM");
    }
    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  function download(icsText, title) {
    var slug = (UI.str(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "event").slice(0, 50);
    var blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = slug + ".ics"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  window.Cal = { validate: validate, build: build, download: download, formatDate: formatDate, formatTime: formatTime, validDate: validDate, TZ: TZ };
})();
