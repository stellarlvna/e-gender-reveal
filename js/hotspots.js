/* =====================================================================
   HOTSPOT SHAPES  (you only need to edit this if you change the room artwork)
   =====================================================================

   Each tappable area is an invisible button laid over the room picture.
   Shapes are measured in the picture's own pixel grid (941 wide × 1672 high),
   then converted to percentages, so they stay aligned at every screen size.

   • "polygon" is a list of [x, y] corner points, in order around the shape.
   • Each shape covers the object AND its printed label, so tapping either works.
   • To see the shapes while tuning them, open the site with  ?debug=hotspots
     at the end of the address (e.g. index.html?debug=hotspots).
   • Order below = keyboard Tab order (top to bottom).
   • "panel" must match one of the panel names in js/panels.js.
   ===================================================================== */

window.INVITATION_HOTSPOTS = {
  size: { width: 941, height: 1672 },

  items: [
    {
      id: "date",
      panel: "date",
      label: "Date and time",
      // calendar + "Date & time" label
      polygon: [[37, 262], [200, 262], [200, 489], [290, 489], [290, 559], [41, 559], [41, 489], [37, 489]]
    },
    {
      id: "directory",
      panel: "directory",
      label: "Directory: directions and host contacts",
      // hanging mobile + "Directory" label
      polygon: [[530, 150], [780, 150], [780, 595], [530, 595]]
    },
    {
      id: "vote",
      panel: "vote",
      label: "Guess the gender",
      // "Guess the gender" label + teddy bear
      polygon: [[32, 617], [312, 617], [312, 682], [252, 682], [252, 858], [266, 858], [266, 932], [72, 932], [72, 682], [32, 682]]
    },
    {
      id: "gallery",
      panel: "gallery",
      label: "Photo gallery",
      // "Gallery" label + framed couple photo
      polygon: [[340, 601], [514, 601], [514, 666], [392, 666], [390, 700], [388, 826], [300, 862], [277, 860], [253, 735], [256, 727], [340, 703]]
    },
    {
      id: "rsvp",
      panel: "rsvp",
      label: "RSVP",
      // crib + "RSVP" label
      polygon: [[468, 770], [600, 700], [665, 696], [941, 860], [941, 1195], [800, 1268], [748, 1268], [480, 1050]]
    },
    {
      id: "dress",
      panel: "dress",
      label: "Dress code",
      // booties + folded clothes + "Dress code" label
      polygon: [[255, 1095], [392, 1095], [395, 1165], [450, 1175], [450, 1347], [110, 1347], [110, 1284], [172, 1284], [172, 1195], [255, 1195]]
    },
    {
      id: "gift",
      panel: "gift",
      label: "Gift",
      // present + "Gift" label
      polygon: [[452, 1215], [672, 1215], [672, 1448], [628, 1448], [628, 1513], [486, 1513], [486, 1448], [452, 1448]]
    }
  ]
};
