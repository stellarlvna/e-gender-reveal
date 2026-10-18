# What still needs configuring

Tick these off before you share the link. Everything in **js/config.js** unless noted. Search that file for `[` to find leftover placeholders.

## Essential

- [ ] **Event title**: `event.title`
- [ ] **Parents' names**: `event.hosts`
- [ ] **Date**: `event.date` (`"YYYY-MM-DD"`)
- [ ] **Start and end time**: `event.startTime`, `event.endTime` (`"HH:MM"`, 24-hour, Malaysia time). *Add to calendar* stays off until these are valid.
- [ ] **Venue name and address**: `event.venueName`, `event.venueAddress`. The Google Maps and Waze links are built from the address.
- [ ] **Shared storage connected**: follow `docs/SETUP.md` step 3, then paste the URL into `storage.endpoint`. Until then the site shows **Demo mode** and nothing is saved.

## Content you'll want to fill in

- [ ] **Dress code**: `dressCode.intro`, `guidance`, `suggestions`, `swatches`, optional `avoid` (everything is placeholder text for now)
- [ ] **Gift**: `gift.bankName`, `gift.accountHolder`, `gift.accountNumber` (nothing is pre-filled). Review the `gift.message` wording.
- [ ] **Gift QR code** (optional): save the image in `assets/images/gift/` and set `gift.qrImage`
- [ ] **Gallery photos**: replace the four placeholder pictures in `assets/images/gallery/`, then update `alt` and `caption` in `gallery.photos`
- [ ] **Directory**: `directory.arrivalNotes` (parking and arrival tips) and `directory.contacts` (names and WhatsApp numbers, like `"60123456789"`)
- [ ] **Schedule** (optional): `event.schedule`. Replace the three placeholder rows or set it to `[]` to hide it.
- [ ] **RSVP settings**: `rsvp.deadline` (optional), `rsvp.maxGuestsPerResponse`, and whether to ask for dietary needs and a message
- [ ] **Welcome popup wording** (optional): `welcome`
- [ ] **Hide the "placeholder" notices** once everything is done: `site.showPlaceholderNotices: false`

## Before you send the link

- [ ] Open the published link on **your phone**, and run the guest test in `docs/SETUP.md` step 5
- [ ] **Delete test rows** from the *Votes* and *RSVPs* tabs in your Sheet (keep the header row)
- [ ] Check there is **no dashed yellow outline** anywhere in any panel (that means a placeholder is left)
- [ ] Share the link only with your guests

## Known limits (so there are no surprises)

- One vote per browser is a convenience; guests aren't verified, so it can't guarantee one vote per person.
- Fonts load from Google Fonts, so guests need an internet connection to see them as designed.
- Votes and RSVPs rely on your Google Apps Script deployment staying active under your Google account.
