# Setup guide (beginner-friendly)

You'll do four things, in this order. Each takes 5 to 15 minutes, and you can stop after any step.

1. [Preview the invitation on your computer](#1-preview-on-your-computer)
2. [Fill in your details](#2-fill-in-your-details)
3. [Connect shared storage so votes and RSVPs really work](#3-connect-shared-storage-google-sheet)
4. [Publish on GitHub Pages](#4-publish-on-github-pages)

Then run the [quick test](#5-test-it-like-a-guest) and tick off [`CHECKLIST.md`](CHECKLIST.md).

> **What does it cost?** Nothing. GitHub Pages (public repository), Google Sheets, Google Apps Script and Google Fonts are all free. You only pay if you choose to buy your own web address, which is optional and not needed.

---

## 1. Preview on your computer

1. Unzip the folder.
2. Double-click **`index.html`**. It opens in your browser, and the welcome popup appears.
3. Tap through the room. Everything works, except saving votes and RSVPs, which show **Demo mode** until step 3.

Handy: add `?debug=hotspots` to the address to see the tappable areas outlined in pink. For example: `…/index.html?debug=hotspots`.

*(If you prefer a local web server, open a terminal in the folder and run `python3 -m http.server 8000`, then visit http://localhost:8000.)*

## 2. Fill in your details

Open **`js/config.js`** in a text editor. It's written as plain sentences with notes in between, and it's the only file you need to edit.

Work from top to bottom. Change only the words between the quote marks.

| Section | What to change |
|---|---|
| `site` | `id` (any short name for this event), the little hint text |
| `welcome` | Optional: change the popup wording |
| `event` | **title, hosts, date, startTime, endTime, venueName, venueAddress**, schedule |
| `vote` | Optional wording; whether guests see totals |
| `dressCode` | Intro, guidance lines, outfit ideas, colour swatches (hex colours) |
| `gift` | Message, bank name, account holder, account number, optional QR image |
| `gallery` | List of photos in `assets/images/gallery/` |
| `rsvp` | Deadline, maximum people per reply, ask-for-dietary / message |
| `directory` | Arrival notes, host contacts, WhatsApp numbers |
| `storage` | Leave for step 3 |

**Date and time format (important for "Add to calendar"):**

```js
date: "2026-11-14",     // year-month-day
startTime: "15:00",     // 24-hour clock, so 3 pm is 15:00
endTime: "18:30",
```
Times are always Malaysia time (Asia/Kuala_Lumpur). Until all three are valid, the *Add to calendar* button stays switched off and tells guests why.

**WhatsApp numbers:** write the number with the country code, digits only, no `+` and no leading 0. For example, 012-345 6789 becomes `"60123456789"`. Leave `""` to hide that person's WhatsApp button.

**Bank details:** nothing is filled in for you. Fields you leave as `""` simply don't appear. This page only *shows* the details and a Copy button. It never takes payments.

**Photos:** see "Replace or add gallery photos" in the [README](../README.md).

Save, refresh the page, and look through each panel. Any dashed yellow outline is a placeholder you haven't replaced yet.

---

## 3. Connect shared storage (Google Sheet)

### Why Google Sheets?

You wanted votes and RSVPs saved online so that every guest on every device is counted, and so that **only you** can read the RSVPs. A Google Sheet plus a tiny Apps Script does exactly that:

* **Free**, with nothing to install.
* **You read RSVPs in a spreadsheet** you already know how to use (sortable, printable, shareable with your partner).
* **No secret keys in the website.** The Sheet stays private to your Google account. The script writes into it for you.
* The script can only do three things: *add a vote*, *add an RSVP*, and *return vote totals*. **It has no way to return RSVPs.** Names, dietary needs and messages stay in your Sheet.

*(Other options exist, such as Firebase or Supabase, but they need database security rules and more setup. Google Sheets is the simplest safe route for a one-off event.)*

### Step by step

**A. Make the Sheet**

1. Go to <https://sheets.new> (signed in to the Google account you want to own the data. Use a personal Gmail rather than a work/school account, because organisations often block public web apps).
2. Name it, for example, *Baby reveal responses*.

**B. Add the script**

1. In the Sheet, choose **Extensions → Apps Script**. A code editor opens in a new tab.
2. Click in the code box, select everything (Ctrl/Cmd + A) and delete it.
3. Open **`backend/google-apps-script/Code.gs`** from this folder, copy all of it, and paste it into the editor.
4. Click the **Save** (disk) icon.

**C. Publish it as a web app**

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   * **Description:** Invitation
   * **Execute as:** **Me** (your email)
   * **Who has access:** **Anyone**
4. Click **Deploy**.
5. Click **Authorize access**, choose your account, and you'll probably see *"Google hasn't verified this app"*. That's normal, because it's your own script. Click **Advanced → Go to (project name) (unsafe) → Allow**.
6. Copy the **Web app URL**. It ends in `/exec`.

**D. Check it works**

Paste the URL into your browser's address bar and add `?action=results` on the end. You should see:

```
{"ok":true,"boy":0,"girl":0}
```

Go back to the Sheet: a **Votes** tab has appeared. (The **RSVPs** tab appears when the first RSVP arrives.)

**E. Connect the website**

1. Open `js/config.js`.
2. Paste the URL between the quotes in the **storage** section:
   ```js
   storage: {
     endpoint: "https://script.google.com/macros/s/AKfycb.../exec"
   }
   ```
3. Save, refresh the page, and open the Guess panel. The **Demo mode** notice is gone, so you're connected.

> **If you ever edit `Code.gs` again:** Deploy → **Manage deployments** → pencil icon → *Version: New version* → **Deploy**. Your URL stays the same. Without this step, the live script doesn't change.

### Access rules, in plain words

| Who | Can do | Cannot do |
|---|---|---|
| **Any guest / anyone with the web-app URL** | Add one vote; add an RSVP; read the *vote totals* | Read RSVPs, names, messages or dietary info; read or edit the Sheet; delete anything |
| **You (signed in to Google)** | Everything: read, sort, edit, delete rows, export | N/A |

Extra protections built into the script: input validation and length limits; a hidden "honeypot" field that ignores simple spam bots; a lock so two guests submitting at the same second can't clash; retries are de-duplicated (a flaky connection won't double-count a vote or RSVP); guest text is saved as plain text so it can never run as a spreadsheet formula.

### Things to know (honest limits)

* **One vote per browser is a courtesy, not security.** After a successful vote, the guest's browser remembers it and shows results instead of the voting buttons. The panel says so. Someone who clears their browser data, uses a private window or another device could vote again, because guests aren't verified. For a family reveal that's usually fine. If you want strict one-vote-per-person, you'd need guest sign-in or personal invite codes, which this simple version doesn't have.
* **The web-app URL is visible** to anyone who views the page source, as with any website. It is not a password and can't expose RSVPs. A determined person *could* send fake votes or RSVPs to it. If that happens, delete the bad rows in the Sheet, or switch it off at *Deploy → Manage deployments → Archive* and create a new deployment. Only share the invitation link with your guests.
* **It can be a little slow.** Google Apps Script sometimes takes a second or two to answer, longer if nobody has used it for a while. The panels show "Saving…" and never claim success until Google confirms.
* **Quotas:** Apps Script has daily free limits, which a family invitation won't come close to.
* **Guest privacy:** you're collecting names, dietary needs and messages. Keep the Sheet private, and share it only with people who need it. Delete it after the event if you don't need it.

### Seeing your responses

Open the Google Sheet:

* **RSVPs** tab: time, name, attending, number of guests, dietary requirements, message.
* **Votes** tab: time and guess (`boy`/`girl`). The panel shows live totals.

Tip: add a total with `=SUMIF(C:C,"Yes",D:D)` in a spare cell to see the headcount.

---

## 4. Publish on GitHub Pages

GitHub Pages gives you a free web link, such as `https://yourname.github.io/baby-reveal/`.

1. Create a free account at <https://github.com>.
2. Click **+ → New repository**. Name it something short (for example `baby-reveal`), choose **Public**, and click **Create repository**. (Free GitHub Pages needs a public repository.)
3. On the new repository page, click **uploading an existing file**.
4. Drag in **everything inside** the invitation folder: `index.html`, `css`, `js`, `assets`, `backend`, `docs`, `README.md` (and `.nojekyll` if you can see it). `index.html` must be at the top level of the repository, not inside another folder. Click **Commit changes**.
5. Go to **Settings → Pages**. Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: main**, folder **/(root)**, then **Save**.
6. Wait one to three minutes and refresh. The address appears at the top of that page. Open it on your phone to check.

**Updating later:** open a file on GitHub (for example `js/config.js`), click the pencil icon, edit, and click **Commit changes**. The live site updates in a minute or two. (Press refresh twice, since browsers sometimes keep the old version.)

**Good to know before publishing:**

* A public repository means anyone can look at the files, including the names, address and **bank details** you put in `js/config.js`. Those details are visible to every guest anyway, so only put in what you're comfortable sharing with anyone who finds the link. The page asks search engines not to list it, and the link isn't a password, so share it only with your guests.
* If you like, leave the `docs` and `backend` folders out of the upload. The site doesn't need them (keep your own copy).
* Nothing secret is in the repository. There are no keys or passwords anywhere in these files.

---

## 5. Test it like a guest

Do this on your phone with the **published** link:

1. The welcome popup appears, and **Enter the nursery** dismisses it.
2. Tap each object, and check that every panel opens and closes.
3. **Vote** once. You should see "Thank you! Your guess is saved." and the totals. Check the **Votes** tab in your Sheet.
4. Send an **RSVP** for yourself ("Test Guest"). Check the **RSVPs** tab.
5. **Add to calendar** downloads a file that opens in your calendar with the right time.
6. **Copy account number**, and paste it somewhere to check.
7. **Delete your test rows** in the Votes and RSVPs tabs (keep the top header row), and clear the vote flag on your phone by opening the link in a private/incognito tab next time.

## Troubleshooting

| What you see | Likely cause and fix |
|---|---|
| "Demo mode" still showing after step 3 | The URL isn't saved in `js/config.js`, has a typo, or doesn't end in `/exec`. Check for the quote marks, then refresh with Ctrl/Cmd + Shift + R. |
| "Couldn't reach the server" | In *Deploy → Manage deployments* make sure **Who has access** is **Anyone** and that you used the `/exec` URL (not `/dev`). Also check the guest's internet. |
| "The server answered with status 4xx/5xx" | Re-deploy: Deploy → Manage deployments → pencil → New version → Deploy. |
| Votes work but you changed the script and nothing changed | You need a **New version** deployment (see the box in step 3). |
| Add to calendar button is grey | Fill in `date`, `startTime`, `endTime` and the event title in `js/config.js`. The panel lists what's missing. |
| A WhatsApp button is missing | The number needs the country code and no leading 0 (for example `60123456789`). |
| Fonts look different | Fonts load from Google Fonts, so the guest needs internet. A standard serif is used as a fallback. |
| Hotspots look misaligned after changing the room picture | Keep the same 9:16 proportions and redraw shapes in `js/hotspots.js` (use `?debug=hotspots`). |
| Page looks old after an update | Refresh twice, or open in a private tab. |
