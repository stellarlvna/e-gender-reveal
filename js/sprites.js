/* Tiny pixel-art sprites (hearts, stars) drawn as crisp SVG so they never blur.
   Used for decoration only. Any element with data-sprite="heart|star",
   data-tone="red|pink|blue" and data-px="<pixel size>" is filled automatically. */
(function () {
  "use strict";

  var GRIDS = {
    heart: [
      "..oo.oo..",
      ".oHRoRRo.",
      "oHRRRRRRo",
      "oRRRRRRRo",
      ".oRRRRRo.",
      "..oRRRo..",
      "...oRo...",
      "....o...."
    ],
    star: [
      "....o....",
      "...oYo...",
      "...oYo...",
      "ooooYoooo",
      "oYYYYYYYo",
      ".oYYYYYo.",
      "..oYYYo..",
      ".oYYoYYo.",
      ".ooo.ooo."
    ]
  };

  var TONES = {
    red:  { o: "#b8485a", R: "#ef6f7e", H: "#ff9fa8" },
    pink: { o: "#e2899c", R: "#f6b3c0", H: "#ffd6dd" },
    blue: { o: "#5f9ccf", R: "#9ccbf0", H: "#c9e5fa" },
    gold: { o: "#b07418", Y: "#f3c24d" }
  };

  function svg(name, tone, px) {
    var grid = GRIDS[name];
    if (!grid) return "";
    var palette = TONES[tone || (name === "star" ? "gold" : "red")] || TONES.red;
    var size = Number(px) || 2;
    var w = grid[0].length, h = grid.length, rects = "";
    for (var y = 0; y < h; y++) {
      var x = 0;
      while (x < w) {
        var ch = grid[y][x];
        if (ch === ".") { x++; continue; }
        var start = x;
        while (x < w && grid[y][x] === ch) x++;
        rects += '<rect x="' + start + '" y="' + y + '" width="' + (x - start) + '" height="1" fill="' + (palette[ch] || "#000") + '"/>';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '" width="' + (w * size) +
      '" height="' + (h * size) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + "</svg>";
  }

  function mount(root) {
    var nodes = (root || document).querySelectorAll("[data-sprite]");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.firstChild) continue;
      n.innerHTML = svg(n.getAttribute("data-sprite"), n.getAttribute("data-tone"), n.getAttribute("data-px"));
    }
  }

  window.Sprites = { svg: svg, mount: mount };
})();
