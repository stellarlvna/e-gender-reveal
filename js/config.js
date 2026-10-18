/* =====================================================================
   ★  EVENT CONFIGURATION  ★   —  THE ONLY FILE YOU NEED TO EDIT FOR CONTENT
   =====================================================================

   How to edit (beginner-friendly):
   1. Open this file in any text editor (VS Code, Notepad, TextEdit in plain-text mode).
   2. Change the text between the "quote marks". Do not delete the quote marks,
      commas, or curly braces.
   3. Save the file and refresh the page in your browser.

   PLACEHOLDERS
   • Anything written like  "[Like this]"  is a placeholder. The invitation
     shows it with a dashed highlight so you can spot it. Replace the whole
     thing, including the square brackets.
   • Leaving a value empty ("") hides that item (for optional things such as
     bank details), or shows a "not set yet" note for essential things such as
     the date.

   Quick search tip: search this file for "[" to find everything left to fill in.
   ===================================================================== */

window.INVITATION_CONFIG = {

  /* ---------------------------------------------------------------
     0. SITE SETTINGS
     --------------------------------------------------------------- */
  site: {
    // A short unique name for THIS invitation (letters, numbers, dashes).
    // It labels the "I already voted" flag saved in each guest's browser.
    // Change it if you ever re-use the page for another event.
    id: "baby-reveal-2026",

    // Language/region used to format the date, e.g. "en-MY" → 14 November 2026
    locale: "en-MY",

    // true  = panels show a small "placeholder" note while "[...]" text remains.
    // false = hide that note (the dashed highlight on text is still shown).
    // Set to false only after you have filled everything in.
    showPlaceholderNotices: true,

    // The little hint shown after guests enter the nursery.
    hintText: "Tap an item to explore"
  },


  /* ---------------------------------------------------------------
     1. OPENING WELCOME POPUP
     --------------------------------------------------------------- */
  welcome: {
    eyebrow: "A little surprise awaits",
    title: "You’re invited!",
    message: "Join us for a special day as we reveal our little one’s big surprise.",
    tagline: "A little love. A big surprise.",
    button: "Enter the nursery"
  },


  /* ---------------------------------------------------------------
     2. EVENT DETAILS   (Calendar panel, Directory panel, calendar file)
     --------------------------------------------------------------- */
  event: {
    title: "[Event title – e.g. Baby Gender Reveal]",
    hosts: "[Parent name] & [Parent name]",      // the parents' names

    // DATE & TIME — these three must be filled in exactly like the examples
    // for the "Add to calendar" button to switch on.
    // Times use the 24-hour clock and are always Malaysia time (Asia/Kuala_Lumpur).
    date: "",            // format YYYY-MM-DD, e.g. "2026-11-14"
    startTime: "",       // format HH:MM,      e.g. "15:00"   (3 pm)
    endTime: "",         // format HH:MM,      e.g. "18:00"   (6 pm)

    venueName: "[Venue name]",
    venueAddress: "[Venue address]",

    // Optional: a sentence added to the calendar entry's notes. Leave "" to skip.
    calendarNotes: "",

    // Calendar reminder, in minutes before the start. 1440 = one day. 0 = none.
    reminderMinutesBefore: 1440,

    // Optional short schedule. Delete the placeholder rows or replace them.
    // To hide the schedule completely, use:  schedule: [],
    schedule: [
      { time: "[Time]", title: "[Guests arrive]" },
      { time: "[Time]", title: "[The big reveal]" },
      { time: "[Time]", title: "[Food & photos]" }
    ]
  },


  /* ---------------------------------------------------------------
     3. GUESS THE GENDER (teddy)
     --------------------------------------------------------------- */
  vote: {
    enabled: true,
    intro: "Boy or girl? Cast your guess and see what everyone else thinks!",
    labels: { boy: "Boy", girl: "Girl" },
    // Show vote totals to guests after they vote
    showResultsAfterVote: true
  },


  /* ---------------------------------------------------------------
     4. DRESS CODE (folded clothes)
     Everything below is placeholder text until you replace it.
     --------------------------------------------------------------- */
  dressCode: {
    intro: "[Dress code introduction – e.g. “Come comfy and colourful!”]",

    guidance: [
      "[Guidance line 1 – e.g. Smart casual]",
      "[Guidance line 2 – e.g. Outdoor venue, comfortable shoes recommended]"
    ],

    suggestions: [
      { title: "[Outfit idea 1]", text: "[Short description of the outfit idea]" },
      { title: "[Outfit idea 2]", text: "[Short description of the outfit idea]" }
    ],

    // Colour swatches. "hex" is the colour shown (any #RRGGBB value).
    // Delete rows you don't need; add rows by copying one line.
    swatches: [
      { name: "[Colour 1]", hex: "#F4B6B6" },
      { name: "[Colour 2]", hex: "#A9D0F0" },
      { name: "[Colour 3]", hex: "#F3E2C7" },
      { name: "[Colour 4]", hex: "#D8A25E" }
    ],

    // Optional "please avoid" note. "" hides it.
    avoid: ""
  },


  /* ---------------------------------------------------------------
     5. GIFT (present)
     Leave any bank field as "" to hide it. Nothing is invented for you.
     --------------------------------------------------------------- */
  gift: {
    message: "Your presence is the best gift of all. If you would still like to give something, gifting is completely optional and entirely up to you.",

    bankName: "",          // e.g. "Maybank"
    accountHolder: "",     // e.g. "Full name as it appears on the account"
    accountNumber: "",     // digits only is easiest to copy, e.g. "1234567890"

    // Optional QR code image. Put the file in assets/images/gift/ and write
    // its path here, e.g. "assets/images/gift/duitnow-qr.png". "" hides it.
    qrImage: "",
    qrCaption: "Scan with your banking app"
  },


  /* ---------------------------------------------------------------
     6. GALLERY (couple picture frame)
     Put your photos in assets/images/gallery/ and list them here.
     The three files below are labelled placeholder pictures.
     --------------------------------------------------------------- */
  gallery: {
    photos: [
      { src: "assets/images/gallery/photo-1.jpg", alt: "[Describe photo 1]", caption: "[Caption – optional]" },
      { src: "assets/images/gallery/photo-2.jpg", alt: "[Describe photo 2]", caption: "[Caption – optional]" },
      { src: "assets/images/gallery/photo-3.jpg", alt: "[Describe photo 3]", caption: "[Caption – optional]" },
      { src: "assets/images/gallery/photo-4.jpg", alt: "[Describe photo 4]", caption: "[Caption – optional]" }
    ]
  },


  /* ---------------------------------------------------------------
     7. RSVP (cot)
     --------------------------------------------------------------- */
  rsvp: {
    enabled: true,
    intro: "Let us know if you can join us. It really helps with our planning!",
    // Optional last day to reply, format YYYY-MM-DD. After this day (Malaysia
    // time) the form closes. "" = never closes.
    deadline: "",
    maxGuestsPerResponse: 10,
    askDietary: true,
    askMessage: true
  },


  /* ---------------------------------------------------------------
     8. DIRECTORY (hanging mobile) — directions & host contacts
     The venue name and address come from the EVENT section above.
     --------------------------------------------------------------- */
  directory: {
    // Optional. If you paste your own links they are used as they are.
    // If left "", the links are built automatically from the venue address.
    googleMapsUrl: "",
    wazeUrl: "",

    arrivalNotes: [
      "[Parking instructions]",
      "[Arrival tip – e.g. which entrance to use]"
    ],

    // whatsapp: a phone number with country code, digits only, no "+" and no
    // leading 0.  Malaysia example: "60123456789" (for 012-345 6789).
    // Leave "" to hide the WhatsApp button for that person.
    contacts: [
      { name: "[Host name 1]", role: "[Role – e.g. Mum-to-be]", whatsapp: "" },
      { name: "[Host name 2]", role: "[Role – e.g. Dad-to-be]", whatsapp: "" }
    ]
  },


  /* ---------------------------------------------------------------
     9. SHARED ONLINE STORAGE  (votes + RSVPs)
     After following docs/SETUP.md, paste your Google Apps Script
     "Web app" URL here. It is NOT a password: it can only add a vote or
     RSVP and read the vote totals. It cannot read RSVPs.
     While this is "" the site runs in DEMO MODE and clearly says so.
     --------------------------------------------------------------- */
  storage: {
    endpoint: ""      // e.g. "https://script.google.com/macros/s/AKfycb.../exec"
  }
};
