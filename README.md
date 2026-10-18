# Gender Reveal Invitation

A mobile-first, pixel-art nursery invitation. Guests open the link, tap **Enter the nursery**, then tap objects in the room:

| Tap this | Opens |
|---|---|
| Teddy bear | **Guess the gender**: vote Boy or Girl, then see everyone's totals |
| Folded clothes | **Dress code**: guidance, outfit ideas, colour swatches |
| Present | **Gift**: optional gifting note, bank details, copy button, QR code |
| Photo frame | **Gallery**: thumbnails and a swipeable photo viewer |
| Calendar | **Date & time**: event details and an *Add to calendar* file |
| Cot | **RSVP**: private reply form |
| Hanging mobile | **Directory**: Google Maps / Waze links, parking notes, WhatsApp contacts |

It is plain HTML, CSS and JavaScript. There is nothing to install or build, and it works on GitHub Pages.

**Where to start:** open [`docs/SETUP.md`](docs/SETUP.md). It walks you through everything, step by step, and [`docs/CHECKLIST.md`](docs/CHECKLIST.md) lists what still needs your input.

---

## What's in the folder

```
index.html                  The page (you rarely need to touch this)
css/styles.css              All visual styling and the colour palette (top of file)
js/config.js                ★ YOUR CONTENT: names, date, venue, dress code, gift, photos, contacts
js/hotspots.js              Shapes of the invisible buttons over the room picture
js/app.js                   Starts the page: welcome popup, hotspots, hint
js/panels.js                The seven panels
js/ui.js, storage.js,       Small helpers (popups, saving votes/RSVPs, calendar file)
  calendar.js, sprites.js
assets/images/room.webp     The room artwork
assets/images/bow.png       Little pixel bow on the welcome popup
assets/images/gallery/      Gallery photos (4 labelled placeholders to replace)
assets/images/gift/         Put your optional gift QR code here
backend/google-apps-script/Code.gs
                            The tiny script that saves votes and RSVPs into YOUR Google Sheet
docs/SETUP.md              Click-by-click setup + publishing guide
docs/CHECKLIST.md          "What still needs configuring" list
```

**The only file you need to edit for content is `js/config.js`.**

## Editing content

Open `js/config.js` in any text editor, change the words between the quote marks, save, and refresh the page.

* Anything shown as `"[Like this]"` is a placeholder. The invitation draws a dashed outline around placeholders so they're easy to spot. Replace the whole thing, including the square brackets.
* An empty value (`""`) hides optional things such as bank details.
* Search the file for `[` to find everything that's left to fill in.
* While you work, the browser console (right-click → Inspect → Console) prints how many placeholders remain.

### Replace or add gallery photos

1. Put your pictures in `assets/images/gallery/` (JPG or WebP, about 1200 px on the long side, under ~400 KB).
2. Either save over `photo-1.jpg` … `photo-4.jpg`, or add new files and add a line for each in `js/config.js`:
   ```js
   { src: "assets/images/gallery/our-scan.jpg", alt: "Our first scan photo", caption: "12 weeks" },
   ```
3. Keep file names free of spaces, and always write a short `alt` description for screen readers.

### Gift QR code

Save the image into `assets/images/gift/` and set `gift.qrImage` in `js/config.js` to its path. Leave it `""` to hide the QR code.

### Colours and fonts

The palette lives at the top of `css/styles.css` (`:root { --cream … }`). Headings use **Fraunces** and body text uses **Lora**, both loaded from Google Fonts in `index.html`. To change them, edit the `<link>` in `index.html` and the two `--font-…` lines in `styles.css`.

### Changing the room artwork

Swap `assets/images/room.webp` for a new picture with the **same proportions** (941 × 1672, i.e. 9:16). Then re-draw the hotspot shapes in `js/hotspots.js`. Open the page with `?debug=hotspots` on the end of the address (for example `index.html?debug=hotspots`) to see the shapes in pink while you adjust their coordinates.

## How the hotspots stay aligned

Each tappable area is a real `<button>` placed over the picture using **percentages** of the picture's own size, so it scales with the image on every screen. The buttons are invisible, but they carry accessible names, keyboard focus outlines, and a gentle glow when pressed. Shapes cover both the object and its printed label.

## Votes and RSVPs: how they're stored

Votes and RSVPs are saved to **your own private Google Sheet** through a small Google Apps Script. It's free, and no database passwords are placed in the website. Full details, costs, privacy notes and limits are in [`docs/SETUP.md`](docs/SETUP.md).

Until you connect it, the invitation runs in **demo mode**. The Guess and RSVP panels say so clearly and never pretend that something was saved.

## Accessibility notes

* Every popup is a native modal `<dialog>`: focus moves inside, Tab stays inside, Esc closes it, and focus returns to the object you tapped.
* While a popup is open, the room behind it can't be tapped or tabbed to.
* All hotspots have text names (for example "Guess the gender"), and Tab goes through them top to bottom.
* Error and success messages are announced to screen readers.
* If someone's device is set to *reduce motion*, popups appear and disappear without sliding or fading.
* Body text is 15–17 px (small uppercase labels are 12.5–13.5 px), and form inputs are 16 px so iPhones don't zoom in.

## Browser support

Current Safari (iOS 15.4+), Chrome, Edge and Firefox. Older browsers that lack the native `<dialog>` element will see a message asking them to update.

## Tested

Automated browser checks (run before delivery) covered: all seven hotspots stay aligned within 0.02 px of the picture at ten screen sizes from 320 px to 1440 px wide; no horizontal scrolling at any size, with or without a popup open; every panel opens, closes (button, Esc, tap outside) and returns focus; voting, RSVP, copy-to-clipboard, gallery swipe/keys, calendar file contents and the backend script's validation. Real Google Sheets can't be reached from the test environment, so the **connected** flow was tested against an exact in-memory copy of the script. Please do the quick live test in `docs/CHECKLIST.md` after you connect your own Sheet.
