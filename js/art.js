/* ============================================================
   art.js: drawn stickers, decor, the cake, and the asset loader.

   Every asset listed in content.js (assets) is checked once. If the
   file loads, it replaces the drawn fallback. If not, the drawn
   version stays. Nothing here needs to change when assets arrive.

   Exposes:
     window.DIDI_READY  promise, resolves when assets are checked
     window.DIDI_ART    sticker(name, cls), decor(name, cls), cake()
   ============================================================ */
(function () {
  "use strict";

  const D = window.DIDI || {};
  const A = D.assets || {};
  const root = document.documentElement;

  /* ---------- drawn stickers: die-cut via a paint-order stroke ---------- */
  const petal = (k) =>
    '<ellipse cx="50" cy="27" rx="17" ry="24" fill="#efe3c8" transform="rotate(' + k * 72 + ' 50 50)"/>';

  const SHAPES = {
    star:
      '<path d="M50 4 L61 36 L95 36 L68 56 L78 90 L50 70 L22 90 L32 56 L5 36 L39 36 Z" fill="#c9a04f"/>',
    heart:
      '<path d="M50 88 C20 66 4 50 4 30 C4 14 16 4 30 4 C40 4 47 10 50 18 C53 10 60 4 70 4 C84 4 96 14 96 30 C96 50 80 66 50 88 Z" fill="#b8615a"/>',
    flower:
      [0, 1, 2, 3, 4].map(petal).join("") + '<circle cx="50" cy="50" r="11" fill="#b48a43"/>',
    bow:
      '<path d="M50 50 C30 18 4 24 10 46 C14 60 36 58 50 50 Z" fill="#6e1f2a"/>' +
      '<path d="M50 50 C70 18 96 24 90 46 C86 60 64 58 50 50 Z" fill="#6e1f2a"/>' +
      '<path d="M46 54 L34 94 L44 88 L50 96 L56 88 L66 94 L54 54 Z" fill="#8a2c37"/>' +
      '<circle cx="50" cy="50" r="8" fill="#b48a43"/>',
    moon:
      '<path d="M62 8 A42 42 0 1 0 92 70 A34 34 0 1 1 62 8 Z" fill="#c9a04f"/>',
    sparkle:
      '<path d="M50 2 C54 36 64 46 98 50 C64 54 54 64 50 98 C46 64 36 54 2 50 C36 46 46 36 50 2 Z" fill="#c9a04f"/>',
    cherry:
      '<path d="M34 52 Q40 22 66 10" fill="none" stroke="#5a6b3a" stroke-width="5"/>' +
      '<circle cx="32" cy="70" r="20" fill="#a33a3f"/>' +
      '<circle cx="68" cy="66" r="20" fill="#b44a4e"/>' +
      '<path d="M66 12 Q88 6 90 30 Q72 30 66 12 Z" fill="#5a6b3a"/>',
    leaf:
      '<path d="M12 88 C12 40 40 12 90 12 C90 62 62 90 12 88 Z" fill="#6b7a45"/>' +
      '<path d="M14 86 L70 30" stroke="#dfd2b2" stroke-width="3" fill="none"/>',
  };

  function svgFor(name) {
    const body = SHAPES[name] || SHAPES.star;
    return (
      '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" class="sticker-svg">' +
      '<g stroke="#fbf6ea" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke">' +
      body +
      "</g></svg>"
    );
  }

  /* ---------- decor: plants, lights, lanterns, vases, lamps, books ---------- */
  const DECOR = {
    plant:
      '<svg viewBox="0 0 120 170" aria-hidden="true" focusable="false">' +
      '<g fill="#4f6b3a">' +
      '<ellipse cx="46" cy="60" rx="26" ry="14" transform="rotate(-35 46 60)"/>' +
      '<ellipse cx="78" cy="54" rx="26" ry="14" transform="rotate(35 78 54)"/>' +
      '<ellipse cx="60" cy="34" rx="20" ry="30"/>' +
      '<ellipse cx="34" cy="92" rx="22" ry="12" transform="rotate(-20 34 92)"/>' +
      '<ellipse cx="86" cy="90" rx="22" ry="12" transform="rotate(20 86 90)"/>' +
      "</g>" +
      '<ellipse cx="60" cy="50" rx="10" ry="22" fill="#6b8a4c"/>' +
      '<path d="M60 110 V80" stroke="#4f6b3a" stroke-width="3"/>' +
      '<path d="M28 112 H92 L84 166 H36 Z" fill="#9c5a3c"/>' +
      '<rect x="24" y="104" width="72" height="12" rx="3" fill="#b06a47"/>' +
      "</svg>",

    fern:
      '<svg viewBox="0 0 120 170" aria-hidden="true" focusable="false">' +
      '<g fill="none" stroke="#4f6b3a" stroke-width="2.5">' +
      '<path d="M60 108 C50 80 40 60 22 40"/><path d="M60 108 C60 80 62 50 58 18"/>' +
      '<path d="M60 108 C70 80 84 60 102 44"/><path d="M60 108 C48 92 34 88 16 94"/>' +
      '<path d="M60 108 C72 92 86 90 104 98"/></g>' +
      '<g fill="#6b8a4c">' +
      '<ellipse cx="30" cy="54" rx="11" ry="5" transform="rotate(-40 30 54)"/>' +
      '<ellipse cx="42" cy="70" rx="11" ry="5" transform="rotate(-30 42 70)"/>' +
      '<ellipse cx="56" cy="36" rx="9" ry="4" transform="rotate(-80 56 36)"/>' +
      '<ellipse cx="90" cy="60" rx="11" ry="5" transform="rotate(35 90 60)"/>' +
      '<ellipse cx="78" cy="76" rx="11" ry="5" transform="rotate(30 78 76)"/>' +
      '<ellipse cx="22" cy="88" rx="10" ry="4" transform="rotate(20 22 88)"/>' +
      '<ellipse cx="98" cy="92" rx="10" ry="4" transform="rotate(-20 98 92)"/></g>' +
      '<path d="M28 112 H92 L84 166 H36 Z" fill="#c7825e"/>' +
      '<rect x="24" y="104" width="72" height="12" rx="3" fill="#d89a78"/>' +
      "</svg>",

    lantern:
      '<svg viewBox="0 0 60 120" aria-hidden="true" focusable="false" overflow="visible">' +
      '<ellipse cx="30" cy="60" rx="46" ry="58" fill="#f6d68a" opacity="0.2"/>' +
      '<path d="M22 14 Q30 4 38 14" fill="none" stroke="#b28c4a" stroke-width="3"/>' +
      '<rect x="16" y="14" width="28" height="6" rx="2" fill="#b28c4a"/>' +
      '<rect x="14" y="20" width="32" height="68" rx="4" fill="#f6d68a"/>' +
      '<rect x="14" y="20" width="32" height="68" rx="4" fill="none" stroke="#b28c4a" stroke-width="3"/>' +
      '<line x1="30" y1="20" x2="30" y2="88" stroke="#b28c4a" stroke-width="2"/>' +
      '<rect x="16" y="88" width="28" height="6" rx="2" fill="#b28c4a"/>' +
      '<path d="M22 94 L30 106 L38 94 Z" fill="#b28c4a"/>' +
      "</svg>",

    lights:
      '<svg viewBox="0 0 420 90" preserveAspectRatio="none" aria-hidden="true" focusable="false" overflow="visible">' +
      '<path d="M0 40 Q210 110 420 40" fill="none" stroke="#5b4d40" stroke-width="2"/>' +
      [
        [42, 52.6], [84, 62.4], [126, 69.4], [168, 73.6], [210, 75],
        [252, 73.6], [294, 69.4], [336, 62.4], [378, 52.6],
      ]
        .map(
          (p, i) =>
            '<g class="bulb-g" style="--d:' + (i * 0.37).toFixed(2) + 's">' +
            '<circle cx="' + p[0] + '" cy="' + (p[1] + 6) + '" r="9" fill="#f6d68a" opacity="0.25"/>' +
            '<circle cx="' + p[0] + '" cy="' + (p[1] + 6) + '" r="4.5" fill="#f6d68a"/></g>'
        )
        .join("") +
      "</svg>",

    vase:
      '<svg viewBox="0 0 100 150" aria-hidden="true" focusable="false">' +
      '<g fill="none" stroke="#4f6b3a" stroke-width="2.5">' +
      '<path d="M50 84 C44 60 38 46 30 26"/><path d="M50 84 C52 60 60 44 70 24"/><path d="M50 84 V40"/></g>' +
      '<circle cx="30" cy="24" r="12" fill="#c98a80"/><circle cx="70" cy="22" r="12" fill="#efe2c6"/>' +
      '<circle cx="50" cy="36" r="11" fill="#b8615a"/>' +
      '<path d="M32 84 H68 C78 96 80 124 70 142 H30 C20 124 22 96 32 84 Z" fill="#5c1c23"/>' +
      '<rect x="34" y="78" width="32" height="8" rx="2" fill="#431419"/>' +
      "</svg>",

    lamp:
      '<svg viewBox="0 0 80 220" aria-hidden="true" focusable="false" overflow="visible">' +
      '<ellipse cx="40" cy="60" rx="58" ry="58" fill="#f6d68a" opacity="0.18"/>' +
      '<path d="M18 44 H62 L70 4 H10 Z" fill="#dcbf7d"/>' +
      '<ellipse cx="40" cy="44" rx="22" ry="3" fill="#f6e8b8"/>' +
      '<rect x="38" y="44" width="4" height="150" fill="#5b4d40"/>' +
      '<ellipse cx="40" cy="200" rx="24" ry="7" fill="#5b4d40"/>' +
      "</svg>",

    books:
      '<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">' +
      '<rect x="8" y="56" width="92" height="18" rx="2" fill="#5c1c23"/>' +
      '<rect x="14" y="36" width="82" height="20" rx="2" fill="#56603d"/>' +
      '<rect x="6" y="18" width="74" height="18" rx="2" fill="#b28c4a"/>' +
      '<rect x="10" y="60" width="84" height="3" fill="#efe6d2" opacity="0.8"/>' +
      '<rect x="18" y="40" width="74" height="3" fill="#efe6d2" opacity="0.8"/>' +
      "</svg>",
  };

  function decorSvg(name) {
    return DECOR[name] || DECOR.plant;
  }

  /* ---------- the cake and its candle ---------- */
  const CAKE =
    '<svg viewBox="0 0 320 330" aria-hidden="true" focusable="false" class="cake-svg" overflow="visible">' +
    // a white cut edge round the whole cake, like the stickers
    '<g fill="#fbf6ea" stroke="#fbf6ea" stroke-width="12" stroke-linejoin="round">' +
    '<ellipse cx="160" cy="300" rx="150" ry="18"/><rect x="58" y="210" width="204" height="90" rx="10"/>' +
    '<rect x="84" y="150" width="152" height="70" rx="8"/><rect x="112" y="92" width="96" height="60" rx="8"/>' +
    '<rect x="152" y="50" width="16" height="44" rx="3"/></g>' +
    '<ellipse cx="160" cy="300" rx="150" ry="18" fill="#e9dcc2"/>' +
    '<rect x="58" y="210" width="204" height="90" rx="10" fill="#f3e6cf"/>' +
    '<path d="M58 228 Q72 258 86 228 Q100 258 114 228 Q128 258 142 228 Q156 258 170 228 Q184 258 198 228 Q212 258 226 228 Q240 258 262 228 V300 H58 Z" fill="#fbf4e4"/>' +
    '<rect x="84" y="150" width="152" height="70" rx="8" fill="#f7eee0"/>' +
    '<path d="M84 166 Q96 190 108 166 Q120 190 132 166 Q144 190 156 166 Q168 190 180 166 Q192 190 204 166 Q216 190 236 166 V220 H84 Z" fill="#fffaf0"/>' +
    '<rect x="112" y="92" width="96" height="60" rx="8" fill="#fbf5ea"/>' +
    '<path d="M112 104 Q124 126 136 104 Q148 126 160 104 Q172 126 184 104 Q196 126 208 104 V150 H112 Z" fill="#ffffff"/>' +
    '<circle cx="106" cy="264" r="6" fill="#b8615a"/><circle cx="160" cy="262" r="6" fill="#c98a80"/>' +
    '<circle cx="214" cy="264" r="6" fill="#b8615a"/><circle cx="134" cy="190" r="5" fill="#b8615a"/>' +
    '<circle cx="186" cy="190" r="5" fill="#c98a80"/><circle cx="160" cy="130" r="5" fill="#b8615a"/>' +
    '<rect x="152" y="50" width="16" height="44" rx="3" fill="#e8d3ad"/>' +
    '<path d="M152 62 L168 56 M152 76 L168 70" stroke="#c9a77a" stroke-width="2"/>' +
    '<g class="smoke">' +
    '<circle cx="160" cy="34" r="9" fill="#efe6d2" opacity="0.8"/>' +
    '<circle cx="168" cy="16" r="12" fill="#efe6d2" opacity="0.6"/>' +
    '<circle cx="154" cy="0" r="14" fill="#efe6d2" opacity="0.4"/>' +
    "</g>" +
    '<g class="flame-g"><path class="flame" d="M160 12 C170 26 174 36 160 48 C146 36 150 26 160 12 Z" fill="#f3c96b"/>' +
    '<path class="flame-core" d="M160 28 C164 34 165 40 160 46 C155 40 156 34 160 28 Z" fill="#fff6d6"/></g>' +
    '<circle class="candle-hit" cx="160" cy="34" r="34" fill="transparent"/>' +
    "</svg>";

  /* ---------- asset loader ---------- */
  const LOADED = {};

  // A missing file answers at once, so it costs nothing. A file that is there is waited for:
  // the house is built from this art (the front door cannot swing without both door paintings),
  // and the "loading birthday girl" screen is up while it arrives. On a very slow connection
  // the wait is capped, and the drawn version is used instead.
  const PROBE_WAIT = 20000;
  function probe(path) {
    return new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => resolve(false), PROBE_WAIT);
      img.onload = () => { clearTimeout(timer); LOADED[path] = true; resolve(true); };
      img.onerror = () => { clearTimeout(timer); resolve(false); };
      img.src = path;
    });
  }

  const jobs = [];
  [
    ["paper", A.paper],
    ["cover", A.cover],
    ["kraft", A.kraft],
    ["wallpaper", A.wallpaper],
    ["vanityBg", A.vanityBg],
    ["mirrorFrame", A.mirrorFrame],
    ["doorOpen", A.doorOpen],
    ["innerHall", A.innerHall],
    ["doorLeaf", A.doorLeaf],
    ["frontDoor", A.frontDoor],
    ["cake", A.cake],
  ].forEach(([key, path]) => {
    if (!path) return;
    jobs.push(
      probe(path).then((ok) => {
        if (!ok) return;
        const url = 'url("' + new URL(path, document.baseURI).href + '")';
        root.style.setProperty("--img-" + key, url);
        root.classList.add("has-" + key);
      })
    );
  });
  Object.values(A.stickers || {}).forEach((path) => {
    if (path) jobs.push(probe(path));
  });
  // the journal's doodles are drawn into its pages when the book is set up, so they are waited for
  (A.doodles || []).forEach((path) => {
    if (path) jobs.push(probe(path));
  });

  // Art that does not hold up the start. It is put in place whenever it arrives, so a room
  // that is already built simply changes to the new picture. onArt(key, fn) runs fn when it has.
  const LATE = [
    "damask", "cloud", "key", "envelope", "seal", "plaster", "vanityProps", "livingWall", "vinyl",
    "reelBg", "coverCloth", "tapeCream", "tapeRose", "tapeSage", "tablecloth", "toyQuiz", "toyMemory",
    "toyTorch", "toySpot", "toyCandles", "toyTickets", "toyCross", "toyWords", "cardBack", "studioWall", "studioProps", "skyNight", "houseNight",
  ];
  const waiting = {};
  function onArt(key, fn) {
    if (A[key] && LOADED[A[key]]) fn(A[key]);
    else (waiting[key] = waiting[key] || []).push(fn);
  }
  LATE.forEach((key) => {
    const path = A[key];
    if (!path) return;
    const img = new Image();
    img.onload = () => {
      LOADED[path] = true;
      root.style.setProperty("--img-" + key, 'url("' + new URL(path, document.baseURI).href + '")');
      root.classList.add("has-" + key);
      (waiting[key] || []).forEach((fn) => fn(path));
      waiting[key] = [];
    };
    img.src = path;
  });

  // the dream house: if the image isn't there, use the drawing instead
  // (the puzzle uses this as a CSS background, so it must resolve first)
  const HOUSE_FALLBACK = "assets/dream-house.svg";
  if (D.dreamHouse && D.dreamHouse !== HOUSE_FALLBACK) {
    jobs.push(probe(D.dreamHouse).then((ok) => { if (!ok) D.dreamHouse = HOUSE_FALLBACK; }));
  }

  window.DIDI_READY = new Promise((resolve) => {
    const go = () => Promise.all(jobs).then(() => resolve());
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
  });

  /* ---------- sticker element: a PNG if it exists, else the drawn one ---------- */
  function sticker(name, cls) {
    const wrap = document.createElement("span");
    wrap.className = "sticker" + (cls ? " " + cls : "");
    wrap.setAttribute("aria-hidden", "true");
    const path = A.stickers && A.stickers[name];
    if (path && LOADED[path]) {
      const img = document.createElement("img");
      img.src = path;
      img.alt = "";
      img.className = "sticker-img";
      wrap.appendChild(img);
    } else {
      wrap.innerHTML = svgFor(name);
    }
    return wrap;
  }

  /* ---------- decor element: a drawn plant, lamp, lantern, etc. ---------- */
  function decor(name, cls) {
    const wrap = document.createElement("span");
    wrap.className = "decor decor--" + name + (cls ? " " + cls : "");
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = decorSvg(name);
    return wrap;
  }

  /* ---------- the cake element: the painted cake if its picture is saved, else the drawn one ---------- */
  function cake() {
    const wrap = document.createElement("div");
    if (A.cake && LOADED[A.cake]) {
      wrap.className = "cake cake-photo";
      const img = document.createElement("img");
      img.src = A.cake;
      img.alt = "";
      const flame = document.createElement("span");
      flame.className = "cake-flame candle-hit";
      const at = (D.cake && D.cake.flame) || { x: 50, y: 9 };
      flame.style.setProperty("--fx", at.x + "%");
      flame.style.setProperty("--fy", at.y + "%");
      if (at.w) flame.style.setProperty("--fw", at.w + "%");
      const smoke = document.createElement("span");
      smoke.className = "cake-smoke";
      smoke.style.setProperty("--fx", at.x + "%");
      smoke.style.setProperty("--fy", at.y + "%");
      smoke.innerHTML = "<i></i><i></i><i></i>";
      wrap.append(img, flame, smoke);
      return wrap;
    }
    wrap.className = "cake";
    wrap.innerHTML = CAKE;
    return wrap;
  }

  // has(key): whether an asset listed in content.js loaded
  const has = (key) => !!(A[key] && LOADED[A[key]]);

  // hasSticker(name): whether that sticker's PNG is saved (the journal's trip stickers wait for it)
  const hasSticker = (name) => !!(A.stickers && A.stickers[name] && LOADED[A.stickers[name]]);

  // the journal's doodles that are saved, in the order content.js lists them
  const doodles = () => (A.doodles || []).filter((p) => LOADED[p]);

  window.DIDI_ART = { sticker, decor, cake, has, hasSticker, onArt, doodles };
})();
