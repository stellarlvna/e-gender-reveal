/**
 * ============================================================================
 *  Gender reveal invitation: shared storage for votes + RSVPs
 * ============================================================================
 *  This script lives inside YOUR Google Sheet (Extensions > Apps Script).
 *  Follow docs/SETUP.md for the click-by-click setup.
 *
 *  WHAT IT DOES
 *    GET  ...?action=results  → returns ONLY the vote totals  {ok, boy, girl}
 *    POST {action:"vote"}     → adds one row to the "Votes" tab
 *    POST {action:"rsvp"}     → adds one row to the "RSVPs" tab
 *
 *  PRIVACY / SECURITY
 *    • The Google Sheet itself stays private to your Google account. Guests
 *      never get access to it; the script writes to it on your behalf.
 *    • There is NO action that reads RSVPs. Names, dietary needs and messages
 *      can only be seen by opening the Sheet while signed in as yourself.
 *    • No passwords or secret keys live in the website files. The web-app URL
 *      is not a secret key: all it can do is add a vote/RSVP and read totals.
 *    • Input is validated and length-limited, hidden "honeypot" spam is
 *      ignored, retries are de-duplicated with a per-submission ID, and
 *      writes are serialised with a lock so simultaneous guests can't clash.
 *    • RSVP cells are written as plain text (and anything starting with = + - @
 *      is neutralised), so guest input can never run as a spreadsheet formula.
 *
 *  YOU DO NOT NEED TO EDIT ANYTHING BELOW, except optionally the SETTINGS.
 * ============================================================================
 */

// ----------------------------------------------------------------- SETTINGS --
var SETTINGS = {
  VOTES_TAB: 'Votes',
  RSVP_TAB: 'RSVPs',
  TIMEZONE: 'Asia/Kuala_Lumpur',
  MAX_NAME: 80,
  MAX_DIETARY: 300,
  MAX_MESSAGE: 500,
  MAX_GUESTS: 50,          // hard upper limit, whatever the website says
  MAX_BODY_CHARS: 5000
};

var VOTE_HEADERS = ['Time (Malaysia)', 'Guess', 'Submission ID'];
var RSVP_HEADERS = ['Time (Malaysia)', 'Name', 'Attending', 'Number of guests', 'Dietary requirements', 'Message', 'Submission ID'];

// ------------------------------------------------------------------ ENTRY ---
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'results') {
    var totals = voteTotals_();
    return json_({ ok: true, boy: totals.boy, girl: totals.girl });
  }
  return json_({ ok: true, service: 'invitation-storage', note: 'RSVPs are private and are never returned here.' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(20000);
    if (!locked) return json_({ ok: false, error: 'The server is busy. Please try again in a moment.' });

    var body = parseBody_(e);
    if (!body) return json_({ ok: false, error: 'That request could not be read.' });

    if (body.action === 'vote') return handleVote_(body);
    if (body.action === 'rsvp') return handleRsvp_(body);
    return json_({ ok: false, error: 'Unknown request.' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong on the server. Please try again.' });
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (ignore) {} }
  }
}

// ---------------------------------------------------------------- HANDLERS --
function handleVote_(body) {
  var choice = String(body.choice || '').toLowerCase();
  if (choice !== 'boy' && choice !== 'girl') {
    return json_({ ok: false, error: 'Please choose boy or girl.' });
  }
  var id = cleanId_(body.submissionId);
  var sheet = tab_(SETTINGS.VOTES_TAB, VOTE_HEADERS);

  // A retry of the same submission is acknowledged but not counted twice.
  var duplicate = !!id && alreadySeen_(sheet, 3, id);
  if (!duplicate) appendRow_(sheet, [now_(), choice, id], [1, 2, 3]);

  var totals = voteTotals_();
  return json_({ ok: true, boy: totals.boy, girl: totals.girl, duplicate: duplicate });
}

function handleRsvp_(body) {
  var d = body.data || {};

  // Honeypot: real guests never fill this hidden field. Pretend success, save nothing.
  if (String(d.website || '').trim() !== '') return json_({ ok: true });

  var name = clean_(d.name, SETTINGS.MAX_NAME, false);
  if (!name) return json_({ ok: false, error: 'Please enter your name.' });

  var attending = d.attending === 'yes' ? 'Yes' : (d.attending === 'no' ? 'No' : '');
  if (!attending) return json_({ ok: false, error: 'Please say whether you are attending.' });

  var guests = 0;
  if (attending === 'Yes') {
    guests = parseInt(d.guests, 10);
    if (!(guests >= 1 && guests <= SETTINGS.MAX_GUESTS)) {
      return json_({ ok: false, error: 'Please enter a number of guests from 1 to ' + SETTINGS.MAX_GUESTS + '.' });
    }
  }

  var dietary = clean_(d.dietary, SETTINGS.MAX_DIETARY, false);
  var message = clean_(d.message, SETTINGS.MAX_MESSAGE, true);
  var id = cleanId_(body.submissionId);

  var sheet = tab_(SETTINGS.RSVP_TAB, RSVP_HEADERS);
  if (id && alreadySeen_(sheet, 7, id)) return json_({ ok: true, duplicate: true });

  appendRow_(sheet, [now_(), safeCell_(name), attending, guests, safeCell_(dietary), safeCell_(message), id], [1, 2, 3, 5, 6, 7]);
  return json_({ ok: true });
}

// ----------------------------------------------------------------- HELPERS --
function voteTotals_() {
  var sheet = tab_(SETTINGS.VOTES_TAB, VOTE_HEADERS);
  var totals = { boy: 0, girl: 0 };
  var last = sheet.getLastRow();
  if (last < 2) return totals;
  var values = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    var v = String(values[i][0]).toLowerCase();
    if (v === 'boy') totals.boy++;
    else if (v === 'girl') totals.girl++;
  }
  return totals;
}

function alreadySeen_(sheet, column, id) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, column, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === id) return true;
  }
  return false;
}

// Finds (or creates) a tab with a header row.
function tab_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var head = sheet.getRange(1, 1, 1, headers.length);
    head.setValues([headers]);
    head.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Writes one row. The text cells are switched to "plain text" first so the
// spreadsheet never interprets what a guest typed.
function appendRow_(sheet, values, textColumns) {
  var row = sheet.getLastRow() + 1;
  textColumns.forEach(function (c) { sheet.getRange(row, c).setNumberFormat('@'); });
  sheet.getRange(row, 1, 1, values.length).setValues([values]);
}

// Stops text such as "=HYPERLINK(...)" from being treated as a formula.
function safeCell_(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  var raw = String(e.postData.contents);
  if (raw.length > SETTINGS.MAX_BODY_CHARS) return null;
  try {
    var parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    return null;
  }
}

// Trim, drop control characters, enforce a maximum length.
function clean_(value, max, keepNewlines) {
  var s = String(value === undefined || value === null ? '' : value);
  s = keepNewlines ? s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ') : s.replace(/[\u0000-\u001F\u007F]/g, ' ');
  s = keepNewlines ? s.replace(/[ \t]+/g, ' ') : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
}

function cleanId_(value) {
  var s = String(value || '');
  return /^[A-Za-z0-9_-]{8,64}$/.test(s) ? s : '';
}

function now_() {
  return Utilities.formatDate(new Date(), SETTINGS.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
