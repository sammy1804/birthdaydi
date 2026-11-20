/* ============================================================
   studio.js: the studio. A library of mandalas to colour, and a
   page that turns anything she draws into a mandala.

   A mandala is a set of rings, from the middle out. Each ring is a
   band of ground with a shape repeated round it (petals, paisleys,
   hearts, arches...). Every shape is its own piece. In "the whole
   ring" mode a tap paints every copy of that shape, and the colour
   runs round the ring from the one she touched.

   Around that: colour stories (paints that go together), gold leaf,
   three papers (cream, black with gold lines, kraft), a spin, and a
   string on the wall where finished mandalas hang. Everything is
   kept in this browser, so her work is waiting when she comes back.
   ============================================================ */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const n2 = (v) => Math.round(v * 10) / 10;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GOLD = "gold";      // the gold leaf paint, stored by name
  const RUB = "";           // the rubber: back to bare paper

  /* ---------- the papers ---------- */
  const PAPERS = {
    cream: { name: "cream paper", ground: "#fbf4e4", line: "#3a2c22" },
    ink: { name: "black paper, gold lines", ground: "#1f1a17", line: "#c9a04f" },
    kraft: { name: "kraft paper", ground: "#d9bf93", line: "#4a3020" },
  };

  /* ---------- colour stories: seven paints that go together, plus gold ---------- */
  const STORIES = [
    { id: "jaipur", name: "Jaipur pink", c: ["#f8ddd8", "#eaa0a8", "#cf5d73", "#8e2a43", "#f0b25a", "#f6ead2", "#3f6b5c"] },
    { id: "goa", name: "Goa sunset", c: ["#ffe1b3", "#f6a35e", "#e0703a", "#c2413a", "#7a2f4b", "#2f6f6a", "#f6ead2"] },
    { id: "temple", name: "temple gold", c: ["#f3e4c4", "#ecc15a", "#d0a14a", "#b33a32", "#6b1d26", "#7a5230", "#2b2320"] },
    { id: "peacock", name: "peacock", c: ["#d6e8dd", "#82bba7", "#2f7a6f", "#1f4e79", "#2d3a63", "#7d8c48", "#d9b55e"] },
    { id: "mehendi", name: "mehendi", c: ["#f1e5c8", "#d2ac72", "#a8662f", "#6e3a1d", "#b8c49a", "#6b7a45", "#38452a"] },
    { id: "monsoon", name: "monsoon", c: ["#e6eef0", "#a8c8d6", "#5f8fa8", "#2d3a63", "#c3b0d6", "#7b6aa0", "#3d4f4a"] },
    { id: "folk", name: "folk art", c: ["#efe4d6", "#f2b7ad", "#d4584a", "#a8262f", "#e9c23c", "#9dbfae", "#6f7a3a"] },
    { id: "pichwai", name: "pichwai", c: ["#fbf3e6", "#f7c28a", "#f0782f", "#c7461f", "#e8b23a", "#cfdcb0", "#4f6b2c"] },
  ];

  // a small leaf from a to a tip at t, bulging k of its length to each side
  function leafD(ax, ay, tx, ty, k) {
    const mx = (ax + tx) / 2, my = (ay + ty) / 2;
    const px = -(ty - ay) * k, py = (tx - ax) * k;
    return `M${n2(ax)} ${n2(ay)}Q${n2(mx + px)} ${n2(my + py)} ${n2(tx)} ${n2(ty)}Q${n2(mx - px)} ${n2(my - py)} ${n2(ax)} ${n2(ay)}Z`;
  }
  // a pointed petal from a base at y0 to a tip at y1, half width ww
  const pointed = (ww, y0, y1) => {
    const hh = y0 - y1;
    return `M0 ${n2(y0)}C${n2(ww * 1.3)} ${n2(y0 - hh * 0.25)} ${n2(ww * 1.05)} ${n2(y1 + hh * 0.25)} 0 ${n2(y1)}C${n2(-ww * 1.05)} ${n2(y1 + hh * 0.25)} ${n2(-ww * 1.3)} ${n2(y0 - hh * 0.25)} 0 ${n2(y0)}Z`;
  };

  /* ---------- the shapes ----------
     Each shape is drawn in its own little frame: x runs along the ring, y points out from the
     middle (negative is outward). w is half its width, h its full height. A shape can have
     more than one piece (a leaf has two halves, a lotus petal has an inner petal). */
  const SHAPES = {
    petal: (w, h) => [["a", `M0 ${h / 2}C${w * 1.33} ${h / 4} ${w * 1.33} ${-h / 4} 0 ${-h / 2}C${-w * 1.33} ${-h / 4} ${-w * 1.33} ${h / 4} 0 ${h / 2}Z`]],
    leaf: (w, h) => [
      ["l", `M0 ${h / 2}C${-w * 1.33} ${h / 4} ${-w * 1.33} ${-h / 4} 0 ${-h / 2}Z`],
      ["r", `M0 ${h / 2}C${w * 1.33} ${h / 4} ${w * 1.33} ${-h / 4} 0 ${-h / 2}Z`],
    ],
    lotus: (w, h) => {
      const p = (ww, hh, dy) => `M0 ${hh / 2 + dy}C${ww * 1.25} ${hh * 0.22 + dy} ${ww * 1.1} ${-hh / 2 + dy} 0 ${-hh / 2 + dy}C${-ww * 1.1} ${-hh / 2 + dy} ${-ww * 1.25} ${hh * 0.22 + dy} 0 ${hh / 2 + dy}Z`;
      const hh = h * 0.56;
      return [["a", p(w, h, 0)], ["i", p(w * 0.5, hh, h / 2 - hh / 2)]];
    },
    tear: (w, h) => {
      const r = Math.min(w, h * 0.28);
      const cy = h / 2 - r;
      return [["a", `M0 ${-h / 2}C${r * 0.35} ${-h * 0.18} ${r} ${cy - r * 0.7} ${r} ${cy}A${r} ${r} 0 0 1 ${-r} ${cy}C${-r} ${cy - r * 0.7} ${-r * 0.35} ${-h * 0.18} 0 ${-h / 2}Z`]];
    },
    drop: (w, h) => {
      const r = Math.min(w, h * 0.28);
      const cy = -h / 2 + r;
      return [["a", `M0 ${h / 2}C${r * 0.35} ${h * 0.18} ${r} ${cy + r * 0.7} ${r} ${cy}A${r} ${r} 0 0 0 ${-r} ${cy}C${-r} ${cy + r * 0.7} ${-r * 0.35} ${h * 0.18} 0 ${h / 2}Z`]];
    },
    eye: (w, h) => {
      const r = Math.min(w, h * 0.28);
      const cy = h / 2 - r;
      const outer = `M0 ${-h / 2}C${r * 0.35} ${-h * 0.18} ${r} ${cy - r * 0.7} ${r} ${cy}A${r} ${r} 0 0 1 ${-r} ${cy}C${-r} ${cy - r * 0.7} ${-r * 0.35} ${-h * 0.18} 0 ${-h / 2}Z`;
      const ri = r * 0.5;
      const inner = `M${-ri} ${cy}A${ri} ${ri} 0 1 0 ${ri} ${cy}A${ri} ${ri} 0 1 0 ${-ri} ${cy}Z`;
      return [["a", outer], ["i", inner]];
    },
    heart: (w, h) => [["a", `M0 ${h * 0.45}C${-w * 0.1} ${h * 0.3} ${-w} ${h * 0.06} ${-w} ${-h * 0.17}C${-w} ${-h * 0.42} ${-w * 0.5} ${-h * 0.52} 0 ${-h * 0.27}C${w * 0.5} ${-h * 0.52} ${w} ${-h * 0.42} ${w} ${-h * 0.17}C${w} ${h * 0.06} ${w * 0.1} ${h * 0.3} 0 ${h * 0.45}Z`]],
    diamond: (w, h) => [["a", `M0 ${-h / 2}L${w} 0L0 ${h / 2}L${-w} 0Z`]],
    kite: (w, h) => [
      ["l", `M0 ${-h / 2}L${-w} ${-h * 0.05}L0 ${h / 2}Z`],
      ["r", `M0 ${-h / 2}L${w} ${-h * 0.05}L0 ${h / 2}Z`],
    ],
    spike: (w, h) => [["a", `M${-w} ${h / 2}L0 ${-h / 2}L${w} ${h / 2}Z`]],
    arch: (w, h) => {
      const ww = Math.min(w, h * 0.45);
      const wi = ww * 0.55;
      const top = -h / 2 + ww;
      const iTop = top + ww * 0.3;
      return [
        ["a", `M${-ww} ${h / 2}L${-ww} ${top}A${ww} ${ww} 0 0 1 ${ww} ${top}L${ww} ${h / 2}Z`],
        ["i", `M${-wi} ${h / 2 - h * 0.12}L${-wi} ${iTop}A${wi} ${wi} 0 0 1 ${wi} ${iTop}L${wi} ${h / 2 - h * 0.12}Z`],
      ];
    },
    dot: (w, h) => {
      const r = Math.min(w, h / 2) * 0.82;
      return [["a", `M${-r} 0A${r} ${r} 0 1 0 ${r} 0A${r} ${r} 0 1 0 ${-r} 0Z`]];
    },
    scallop: (w, h) => [["a", `M${-w} ${h / 2}L${-w} ${h * 0.1}C${-w} ${-h * 0.62} ${w} ${-h * 0.62} ${w} ${h * 0.1}L${w} ${h / 2}Z`]],
    // the mango-shaped motif from mehendi and block prints: a round bulb at the bottom, the tip curling out
    paisley: (w, h) => {
      const ri = Math.min(w * 0.4, h * 0.16);
      const cy = h * 0.2;
      return [
        ["a", `M${w * 0.5} ${-h / 2}C${-w * 0.35} ${-h * 0.3} ${-w * 1.08} ${-h * 0.04} ${-w * 0.95} ${h * 0.2}C${-w * 0.85} ${h * 0.5} ${w * 0.55} ${h * 0.56} ${w * 0.92} ${h * 0.22}C${w * 1.15} ${-h * 0.02} ${w * 0.78} ${-h * 0.2} ${w * 0.36} ${-h * 0.14}C${w * 0.56} ${-h * 0.27} ${w * 0.62} ${-h * 0.4} ${w * 0.5} ${-h / 2}Z`],
        ["i", `M${-ri} ${cy}A${ri} ${ri} 0 1 0 ${ri} ${cy}A${ri} ${ri} 0 1 0 ${-ri} ${cy}Z`],
      ];
    },
    // the folk-art petal: a pointed petal, a lighter petal inside, and a leafy vein up the middle
    folk: (w, h) => {
      const veins = [`M${n2(-w * 0.035)} ${n2(h * 0.36)}L${n2(-w * 0.02)} ${n2(-h * 0.34)}L${n2(w * 0.02)} ${n2(-h * 0.34)}L${n2(w * 0.035)} ${n2(h * 0.36)}Z`];
      for (let j = 0; j < 4; j++) {
        const y = h * (0.24 - j * 0.15);
        const s = w * (0.34 - j * 0.04);
        veins.push(leafD(0, y, -s, y - s * 0.8, 0.28), leafD(0, y, s, y - s * 0.8, 0.28));
      }
      return [["a", pointed(w, h / 2, -h / 2)], ["i", pointed(w * 0.66, h * 0.42, -h * 0.4)], ["v", veins.join("")]];
    },
    // the onion-dome tile from folk art: a soft tile with a pointed top, a chevron and a little bud
    ogee: (w, h) => [
      ["a", `M0 ${-h / 2}C${w * 0.12} ${-h * 0.32} ${w * 0.95} ${-h * 0.3} ${w * 0.95} 0C${w * 0.95} ${h * 0.3} ${w * 0.62} ${h * 0.5} 0 ${h * 0.4}C${-w * 0.62} ${h * 0.5} ${-w * 0.95} ${h * 0.3} ${-w * 0.95} 0C${-w * 0.95} ${-h * 0.3} ${-w * 0.12} ${-h * 0.32} 0 ${-h / 2}Z`],
      ["i", `M${-w * 0.62} ${-h * 0.06}Q0 ${h * 0.44} ${w * 0.62} ${-h * 0.06}Q0 ${h * 0.18} ${-w * 0.62} ${-h * 0.06}Z`],
      ["b", `M0 ${h * 0.12}C${-w * 0.3} ${h * 0.08} ${-w * 0.32} ${-h * 0.12} ${-w * 0.2} ${-h * 0.2}L0 ${-h * 0.07}L${w * 0.2} ${-h * 0.2}C${w * 0.32} ${-h * 0.12} ${w * 0.3} ${h * 0.08} 0 ${h * 0.12}Z`],
    ],
    // a four-pointed sparkle
    sparkle: (w, h) => {
      const s = Math.min(w, h / 2), c = s * 0.16;
      return [["a", `M0 ${-s}Q${c} ${-c} ${s} 0Q${c} ${c} 0 ${s}Q${-c} ${c} ${-s} 0Q${-c} ${-c} 0 ${-s}Z`]];
    },
    // the pichwai lotus: a tall middle petal, two petals curling out, and a little cup underneath
    bloom: (w, h) => [
      ["s", `M${-w * 0.08} ${h * 0.34}C${-w * 0.62} ${h * 0.3} ${-w * 0.98} ${h * 0.02} ${-w * 0.95} ${-h * 0.3}C${-w * 0.6} ${-h * 0.18} ${-w * 0.3} ${h * 0.02} ${-w * 0.08} ${h * 0.34}Z` +
              `M${w * 0.08} ${h * 0.34}C${w * 0.62} ${h * 0.3} ${w * 0.98} ${h * 0.02} ${w * 0.95} ${-h * 0.3}C${w * 0.6} ${-h * 0.18} ${w * 0.3} ${h * 0.02} ${w * 0.08} ${h * 0.34}Z`],
      ["c", pointed(w * 0.36, h * 0.36, -h / 2)],
      ["b", `M${-w * 0.5} ${h * 0.24}Q0 ${h * 0.58} ${w * 0.5} ${h * 0.24}Q0 ${h * 0.36} ${-w * 0.5} ${h * 0.24}Z`],
    ],
    // a vine: a thin stem with leaves in pairs up it
    sprig: (w, h) => {
      const leaves = [];
      for (let j = 0; j < 4; j++) {
        const y = h * (0.3 - j * 0.2);
        const s = Math.min(w * 0.7, h * 0.22) * (1 - j * 0.12);
        leaves.push(leafD(0, y, -s, y - s * 0.75, 0.3), leafD(0, y, s, y - s * 0.75, 0.3));
      }
      leaves.push(leafD(0, -h * 0.32, 0, -h / 2, 0.3));
      const t = Math.max(1.5, w * 0.04);
      return [["s", `M${-t} ${h / 2}L${-t} ${-h * 0.34}L${t} ${-h * 0.34}L${t} ${h / 2}Z`], ["l", leaves.join("")]];
    },
    // a circle with a circle inside: the border of a colouring book page
    hoop: (w, h) => {
      const r = Math.min(w, h / 2) * 0.86, ri = r * 0.5;
      return [
        ["a", `M${-r} 0A${r} ${r} 0 1 0 ${r} 0A${r} ${r} 0 1 0 ${-r} 0Z`],
        ["i", `M${-ri} 0A${ri} ${ri} 0 1 0 ${ri} 0A${ri} ${ri} 0 1 0 ${-ri} 0Z`],
      ];
    },
  };

  /* ---------- the library ----------
     Each ring: t = shape, n = how many round the ring, r0 / r1 = inner and outer radius
     (the mandala is 1000 across), off = turn by half a step, f = how wide each shape is
     (1 = touching), band: false = no ground of its own (it sits on the ring before it). */
  const MANDALAS = [
    { id: "didi", name: "for Didi", rings: [
      { t: "disc", r: 46 },
      { t: "heart", n: 8, r0: 46, r1: 132, f: 0.82 },
      { t: "leaf", n: 16, r0: 132, r1: 236, f: 0.9 },
      { t: "dot", n: 16, r0: 214, r1: 262, off: 0.5, f: 0.42, band: false },
      { t: "heart", n: 16, r0: 236, r1: 304, off: 0.5, f: 0.86 },
      { t: "tear", n: 24, r0: 304, r1: 376, f: 0.9 },
      { t: "scallop", n: 32, r0: 376, r1: 436, f: 1 },
      { t: "dot", n: 32, r0: 436, r1: 470, off: 0.5, f: 0.6 },
    ] },
    // folk art: big leafy petals on a green star, onion-dome tiles with buds, sparkles between
    { id: "folk", name: "folk art", rings: [
      { t: "disc", r: 44 },
      { t: "lotus", n: 8, r0: 44, r1: 300, off: 0.5, f: 0.98 },
      { t: "folk", n: 8, r0: 44, r1: 284, f: 0.98, band: false },
      { t: "dot", n: 16, r0: 300, r1: 326, off: 0.5, f: 0.4 },
      { t: "ogee", n: 8, r0: 326, r1: 446, f: 0.9 },
      { t: "sparkle", n: 8, r0: 346, r1: 426, off: 0.5, f: 0.4, band: false },
      { t: "drop", n: 16, r0: 446, r1: 482, f: 0.36 },
    ] },
    // pichwai: orange lotuses and green vines, like a painted page
    { id: "pichwai", name: "pichwai lotus", rings: [
      { t: "disc", r: 34 },
      { t: "bloom", n: 6, r0: 34, r1: 196, f: 0.95 },
      { t: "dot", n: 12, r0: 196, r1: 224, off: 0.5, f: 0.55 },
      { t: "sprig", n: 12, r0: 224, r1: 330, f: 0.9 },
      { t: "bloom", n: 12, r0: 230, r1: 330, off: 0.5, f: 0.7, band: false },
      { t: "bloom", n: 18, r0: 330, r1: 420, f: 0.98 },
      { t: "scallop", n: 36, r0: 420, r1: 456, f: 1 },
      { t: "dot", n: 36, r0: 456, r1: 480, off: 0.5, f: 0.6 },
    ] },
    // ink: a sunflower in the middle, then layer on layer of fine petals
    { id: "ink", name: "ink sunflower", rings: [
      { t: "disc", r: 36 },
      { t: "petal", n: 24, r0: 36, r1: 140, f: 0.92 },
      { t: "dot", n: 24, r0: 140, r1: 166, off: 0.5, f: 0.6 },
      { t: "tear", n: 12, r0: 166, r1: 226, f: 0.7 },
      { t: "dot", n: 12, r0: 172, r1: 206, off: 0.5, f: 0.4, band: false },
      { t: "folk", n: 16, r0: 226, r1: 350, f: 0.98 },
      { t: "lotus", n: 16, r0: 350, r1: 448, off: 0.5, f: 0.98 },
      { t: "dot", n: 32, r0: 448, r1: 478, f: 0.5 },
    ] },
    // the colouring book: layered lotus petals and a border of little hoops
    { id: "bloom", name: "colouring book", rings: [
      { t: "disc", r: 66 },
      { t: "dot", n: 12, r0: 66, r1: 96, f: 0.86 },
      { t: "lotus", n: 8, r0: 96, r1: 214, f: 0.96 },
      { t: "lotus", n: 8, r0: 96, r1: 190, off: 0.5, f: 0.7, band: false },
      { t: "lotus", n: 8, r0: 214, r1: 336, off: 0.5, f: 0.98 },
      { t: "tear", n: 8, r0: 236, r1: 330, f: 0.42, band: false },
      { t: "petal", n: 16, r0: 336, r1: 402, f: 0.9 },
      { t: "hoop", n: 30, r0: 410, r1: 478, f: 0.92 },
    ] },
    { id: "lotus", name: "lotus", rings: [
      { t: "disc", r: 40 },
      { t: "lotus", n: 8, r0: 40, r1: 160, off: 0.5, f: 0.95 },
      { t: "lotus", n: 8, r0: 40, r1: 140, f: 0.9, band: false },
      { t: "dot", n: 24, r0: 160, r1: 190, f: 0.7 },
      { t: "lotus", n: 16, r0: 190, r1: 300, f: 0.95 },
      { t: "tear", n: 16, r0: 210, r1: 300, off: 0.5, f: 0.5, band: false },
      { t: "petal", n: 32, r0: 300, r1: 380, f: 0.9 },
      { t: "scallop", n: 24, r0: 380, r1: 440, f: 1 },
      { t: "dot", n: 48, r0: 440, r1: 470, f: 0.6 },
    ] },
    { id: "marigold", name: "marigold", rings: [
      { t: "disc", r: 34 },
      { t: "petal", n: 12, r0: 34, r1: 108, f: 0.95 },
      { t: "leaf", n: 18, r0: 108, r1: 182, off: 0.5, f: 0.95 },
      { t: "petal", n: 24, r0: 182, r1: 254, f: 0.95 },
      { t: "dot", n: 24, r0: 254, r1: 282, off: 0.5, f: 0.6 },
      { t: "petal", n: 36, r0: 282, r1: 352, f: 0.95 },
      { t: "lotus", n: 36, r0: 352, r1: 420, off: 0.5, f: 0.98 },
      { t: "scallop", n: 48, r0: 420, r1: 468, f: 1 },
    ] },
    { id: "rangoli", name: "rangoli", rings: [
      { t: "disc", r: 50 },
      { t: "kite", n: 8, r0: 50, r1: 156, f: 0.95 },
      { t: "spike", n: 16, r0: 156, r1: 220, f: 0.9 },
      { t: "dot", n: 16, r0: 220, r1: 252, off: 0.5, f: 0.6 },
      { t: "diamond", n: 16, r0: 252, r1: 338, f: 0.9 },
      { t: "dot", n: 16, r0: 270, r1: 320, off: 0.5, f: 0.36, band: false },
      { t: "arch", n: 24, r0: 338, r1: 414, f: 0.95 },
      { t: "dot", n: 48, r0: 414, r1: 440, f: 0.66 },
      { t: "scallop", n: 24, r0: 440, r1: 476, f: 1 },
    ] },
    { id: "jasmine", name: "jasmine", rings: [
      { t: "disc", r: 30 },
      { t: "tear", n: 6, r0: 30, r1: 150, f: 0.92 },
      { t: "petal", n: 6, r0: 70, r1: 150, off: 0.5, f: 0.6, band: false },
      { t: "leaf", n: 12, r0: 150, r1: 250, f: 0.9 },
      { t: "dot", n: 12, r0: 150, r1: 200, off: 0.5, f: 0.5, band: false },
      { t: "lotus", n: 12, r0: 250, r1: 346, off: 0.5, f: 0.95 },
      { t: "petal", n: 24, r0: 346, r1: 420, f: 0.9 },
      { t: "dot", n: 24, r0: 420, r1: 452, off: 0.5, f: 0.7 },
      { t: "scallop", n: 48, r0: 452, r1: 478, f: 1 },
    ] },
    { id: "window", name: "rose window", rings: [
      { t: "disc", r: 60 },
      { t: "arch", n: 12, r0: 60, r1: 176, f: 0.92 },
      { t: "dot", n: 12, r0: 176, r1: 214, f: 0.7 },
      { t: "arch", n: 24, r0: 214, r1: 320, off: 0.5, f: 0.92 },
      { t: "kite", n: 24, r0: 320, r1: 400, f: 0.9 },
      { t: "scallop", n: 36, r0: 400, r1: 452, f: 1 },
      { t: "dot", n: 36, r0: 452, r1: 478, off: 0.5, f: 0.6 },
    ] },
    { id: "peacock", name: "peacock", rings: [
      { t: "disc", r: 40 },
      { t: "eye", n: 10, r0: 40, r1: 176, f: 0.95 },
      { t: "dot", n: 20, r0: 176, r1: 204, f: 0.7 },
      { t: "eye", n: 20, r0: 204, r1: 334, off: 0.5, f: 0.95 },
      { t: "leaf", n: 40, r0: 334, r1: 418, f: 0.9 },
      { t: "dot", n: 40, r0: 418, r1: 450, off: 0.5, f: 0.66 },
      { t: "scallop", n: 40, r0: 450, r1: 478, f: 1 },
    ] },
    { id: "mehendi", name: "mehendi", rings: [
      { t: "disc", r: 36 },
      { t: "petal", n: 8, r0: 36, r1: 124, f: 0.95 },
      { t: "dot", n: 16, r0: 124, r1: 154, f: 0.7 },
      { t: "paisley", n: 10, r0: 154, r1: 296, f: 0.96 },
      { t: "leaf", n: 20, r0: 296, r1: 362, off: 0.5, f: 0.9 },
      { t: "paisley", n: 20, r0: 362, r1: 452, off: 0.5, f: 0.98 },
      { t: "dot", n: 40, r0: 452, r1: 478, f: 0.66 },
    ] },
    { id: "diya", name: "diya", rings: [
      { t: "disc", r: 44 },
      { t: "tear", n: 8, r0: 44, r1: 168, f: 0.85 },
      { t: "heart", n: 8, r0: 90, r1: 168, off: 0.5, f: 0.55, band: false },
      { t: "drop", n: 16, r0: 168, r1: 250, f: 0.9 },
      { t: "lotus", n: 16, r0: 250, r1: 344, off: 0.5, f: 0.95 },
      { t: "spike", n: 32, r0: 344, r1: 404, f: 0.95 },
      { t: "dot", n: 32, r0: 404, r1: 436, off: 0.5, f: 0.66 },
      { t: "scallop", n: 32, r0: 436, r1: 476, f: 1 },
    ] },
  ];

  /* ---------- drawing a mandala ---------- */
  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }
  const ringPath = (r0, r1) =>
    `M${r1} 0A${r1} ${r1} 0 1 1 ${-r1} 0A${r1} ${r1} 0 1 1 ${r1} 0Z` +
    (r0 > 0 ? `M${r0} 0A${r0} ${r0} 0 1 0 ${-r0} 0A${r0} ${r0} 0 1 0 ${r0} 0Z` : "");

  // draws the mandala into a <g>. Every piece is a path with data-id (ring.part.k) and data-ring (ring.part).
  function draw(m) {
    const g = svgEl("g", { class: "md" });
    m.rings.forEach((r, ri) => {
      if (r.t === "disc") {
        g.appendChild(svgEl("path", { d: ringPath(0, r.r), "data-id": ri + ".c.0", "data-ring": ri + ".c" }));
      } else if (r.band !== false) {
        g.appendChild(svgEl("path", { d: ringPath(r.r0, r.r1), "fill-rule": "evenodd", "data-id": ri + ".g.0", "data-ring": ri + ".g" }));
      }
    });
    m.rings.forEach((r, ri) => {
      if (r.t === "disc") return;
      const make = SHAPES[r.t];
      if (!make) return;
      const rm = (r.r0 + r.r1) / 2;
      const w = (Math.PI * rm / r.n) * (r.f || 0.9);
      const parts = make(w, r.r1 - r.r0);
      for (let k = 0; k < r.n; k++) {
        const a = n2(((k + (r.off || 0)) * 360) / r.n);
        const tf = `rotate(${a}) translate(0 ${n2(-rm)})`;
        parts.forEach(([part, d]) => {
          g.appendChild(svgEl("path", { d, transform: tf, "data-id": `${ri}.${part}.${k}`, "data-ring": `${ri}.${part}`, "data-n": r.n }));
        });
      }
    });
    // a fine outer line to finish the edge
    const R = Math.max(...m.rings.map((r) => (r.t === "disc" ? r.r : r.r1)));
    g.appendChild(svgEl("circle", { r: R + 6, class: "md-rim" }));
    return g;
  }

  // gold leaf: warm gold with flecks, shared by every mandala on the page
  function goldDefs() {
    const svg = svgEl("svg", { width: "0", height: "0", "aria-hidden": "true", style: "position:absolute;width:0;height:0" });
    svg.innerHTML =
      '<defs><pattern id="gold-leaf" patternUnits="userSpaceOnUse" width="90" height="90">' +
      '<rect width="90" height="90" fill="#c99d45"/>' +
      '<path d="M0 0h46l-8 30-38 6z" fill="#d9b25c"/><path d="M90 40l-34 6 10 44h24z" fill="#b8893a"/>' +
      '<path d="M30 54l22-4 6 22-26 6z" fill="#e4c271"/><path d="M50 0h40v26l-30 4z" fill="#bf9240"/>' +
      '<circle cx="18" cy="70" r="2.2" fill="#f4dc95"/><circle cx="64" cy="16" r="1.6" fill="#f7e3a6"/>' +
      '<circle cx="74" cy="62" r="1.4" fill="#fbe9b3"/><circle cx="38" cy="22" r="1.2" fill="#a77b2e"/>' +
      '<circle cx="8" cy="40" r="1.3" fill="#f4dc95"/><circle cx="52" cy="84" r="1.5" fill="#a77b2e"/>' +
      "</pattern></defs>";
    return svg;
  }
  const fillOf = (v) => (v === GOLD ? "url(#gold-leaf)" : v || "");

  /* ---------- kept in this browser ---------- */
  const STORE = "didi-mandalas-v1";
  const keep = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* a private window: it lasts until she leaves */ } },
  };
  let saved = keep.get(STORE, {}) || {};
  let saveTimer = 0;
  const persist = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => keep.set(STORE, saved), 300); };

  // a little seeded random, so a mandala's sample colours on the shelf are the same every visit
  function seeded(seed) {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  }
  // colour a whole mandala from a story: light grounds under deeper shapes, a touch of gold
  function colourFrom(m, story, rand) {
    const keys = [];
    m.rings.forEach((r, ri) => {
      if (r.t === "disc") keys.push(ri + ".c");
      else if (r.band !== false) keys.push(ri + ".g");
    });
    m.rings.forEach((r, ri) => {
      if (r.t === "disc" || !SHAPES[r.t]) return;
      SHAPES[r.t](10, 10).forEach(([part]) => keys.push(`${ri}.${part}`));
    });
    const light = story.c.slice(0, 2).concat(story.c[5]);
    const deep = story.c.slice(1, 5).concat(story.c[6]);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const out = {};
    let last = "";
    keys.forEach((key) => {
      const ground = /\.(g|c)$/.test(key);
      let c = ground ? pick(light) : rand() < 0.12 ? GOLD : pick(deep);
      if (c === last) c = ground ? pick(light) : pick(deep);
      last = c;
      out[key] = c;
    });
    return out; // by ring
  }
  function ringFillsToPieces(g, byRing) {
    const fills = {};
    $$("path[data-ring]", g).forEach((p) => { if (byRing[p.dataset.ring]) fills[p.dataset.id] = byRing[p.dataset.ring]; });
    return fills;
  }

  function setupStudio() {
    const studio = $("#studio");
    const svg = $("#mandala");
    const paperEl = $("#paper");
    const pad = $("#pad");
    const guides = $("#pad-guides");
    const grid = $("#lib-grid");
    const potsHost = $("#pots");
    const storiesHost = $("#stories");
    const nameEl = $("#paper-name");
    const hung = $("#hung");
    const hungLine = $("#hung-line");
    if (!svg || !grid || !potsHost || !studio) return;
    document.body.appendChild(goldDefs());

    let current = null;          // the mandala on the board, or "draw"
    let story = STORIES.find((x) => x.id === keep.get(STORE + "-story", "jaipur")) || STORIES[0];
    let paint = story.c[3];
    let wholeRing = true;
    let paper = keep.get(STORE + "-paper", "cream");
    if (!PAPERS[paper]) paper = "cream";
    const undo = [];
    const thumbs = {};

    /* ---------- the papers ---------- */
    function setPaper(id) {
      paper = id;
      paperEl.dataset.paper = id;
      paperEl.style.setProperty("--ground", PAPERS[id].ground);
      paperEl.style.setProperty("--line", PAPERS[id].line);
      $$(".paper-dot").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.paper === id)));
      keep.set(STORE + "-paper", id);
      doodle.repaper();
    }
    const papersHost = $("#papers");
    Object.keys(PAPERS).forEach((id) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "paper-dot paper-dot--" + id;
      b.dataset.paper = id;
      b.title = PAPERS[id].name;
      b.setAttribute("aria-label", PAPERS[id].name);
      b.addEventListener("click", () => setPaper(id));
      papersHost.appendChild(b);
    });

    /* ---------- colour stories and the paints ---------- */
    function buildPots() {
      potsHost.replaceChildren();
      const list = story.c.map((c, i) => [story.name + " " + (i + 1), c]).concat([["gold leaf", GOLD], ["rubber: back to bare paper", RUB]]);
      list.forEach(([name, col]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pot" + (col === GOLD ? " pot--gold" : col === RUB ? " pot--rub" : "");
        if (col && col !== GOLD) b.style.setProperty("--c", col);
        b.title = name;
        b.setAttribute("aria-label", name);
        b.setAttribute("aria-pressed", String(col === paint));
        b.addEventListener("click", () => {
          paint = col;
          $$(".pot", potsHost).forEach((p) => p.setAttribute("aria-pressed", String(p === b)));
          doodle.setColour(col);
        });
        potsHost.appendChild(b);
      });
    }
    STORIES.forEach((st) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "story";
      b.dataset.story = st.id;
      b.setAttribute("aria-label", "colour story: " + st.name);
      const sw = document.createElement("span");
      sw.className = "story-sw";
      st.c.slice(1, 6).forEach((c) => { const i = document.createElement("i"); i.style.background = c; sw.appendChild(i); });
      const nm = document.createElement("span");
      nm.className = "story-name";
      nm.textContent = st.name;
      b.append(sw, nm);
      b.addEventListener("click", () => {
        story = st;
        keep.set(STORE + "-story", st.id);
        $$(".story", storiesHost).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        if (paint !== GOLD && paint !== RUB) paint = st.c[3];
        buildPots();
        doodle.setColour(paint);
      });
      b.setAttribute("aria-pressed", String(st === story));
      storiesHost.appendChild(b);
    });
    buildPots();

    /* ---------- the library shelf ---------- */
    function paintAll(root, fills) {
      $$("path[data-id]", root).forEach((p) => { p.style.fill = fillOf(fills[p.dataset.id]); });
    }
    function sampleFor(m, g) {
      const rand = seeded(m.id);
      const st = STORIES[Math.floor(rand() * STORIES.length)];
      return ringFillsToPieces(g, colourFrom(m, st, rand));
    }
    function refreshThumb(id) {
      const m = MANDALAS.find((x) => x.id === id);
      const t = thumbs[id];
      if (!m || !t) return;
      const mine = saved[id] && Object.keys(saved[id]).length;
      paintAll(t, mine ? saved[id] : sampleFor(m, t));
      t.parentNode.classList.toggle("is-mine", !!mine);
    }
    MANDALAS.forEach((m) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lib-item";
      b.setAttribute("aria-label", "colour the " + m.name + " mandala");
      const t = svgEl("svg", { viewBox: "-500 -500 1000 1000", class: "lib-art", "aria-hidden": "true" });
      t.appendChild(draw(m));
      thumbs[m.id] = t;
      const nm = document.createElement("span");
      nm.className = "lib-name";
      nm.textContent = m.name;
      b.append(t, nm);
      b.addEventListener("click", () => open(m.id));
      grid.appendChild(b);
      refreshThumb(m.id);
    });
    const drawBtn = document.createElement("button");
    drawBtn.type = "button";
    drawBtn.className = "lib-item lib-item--draw";
    drawBtn.setAttribute("aria-label", "draw your own mandala");
    drawBtn.innerHTML =
      '<svg class="lib-art" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="46"/>' +
      [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path transform="rotate(${a})" d="M0-8C6-16 4-28 0-36C-4-28-6-16 0-8Z"/>`).join("") +
      '<circle r="6" class="dc"/></svg><span class="lib-name">draw your own</span>';
    drawBtn.addEventListener("click", () => open("draw"));
    grid.appendChild(drawBtn);

    function markShelf(id) {
      $$(".lib-item", grid).forEach((b, i) => {
        const on = i < MANDALAS.length ? MANDALAS[i].id === id : id === "draw";
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
    }

    /* ---------- open a mandala, or the drawing page ---------- */
    function open(id) {
      if (id === current) return;
      current = id;
      undo.length = 0;
      markShelf(id);
      const drawing = id === "draw";
      studio.classList.toggle("is-draw", drawing);
      svg.hidden = drawing;
      pad.hidden = !drawing;
      guides.hidden = !drawing;
      paperEl.classList.remove("is-spinning", "is-done");
      if (drawing) {
        nameEl.textContent = "your own";
        doodle.show();
      } else {
        const m = MANDALAS.find((x) => x.id === id) || MANDALAS[0];
        nameEl.textContent = m.name;
        svg.replaceChildren(draw(m));
        paintAll(svg, saved[m.id] || {});
      }
      keep.set(STORE + "-last", id);
    }

    /* ---------- filling: the colour runs round the ring from the tapped piece ---------- */
    let celebrated = {};
    function fill(pieces, from) {
      const m = current;
      if (!m || m === "draw") return;
      const fills = (saved[m] = saved[m] || {});
      const step = [];
      const k0 = from ? Number(from.dataset.id.split(".")[2]) : 0;
      let longest = 0;
      pieces.forEach((p) => {
        const id = p.dataset.id;
        const before = fills[id] || RUB;
        if (before === paint) return;
        step.push([id, before]);
        if (paint) fills[id] = paint; else delete fills[id];
        const n = Number(p.dataset.n || 1);
        const k = Number(id.split(".")[2]);
        const d = Math.min(Math.abs(k - k0), n - Math.abs(k - k0));
        const delay = reduce || pieces.length === 1 ? 0 : Math.round(d * Math.min(34, 520 / n));
        longest = Math.max(longest, delay);
        p.style.transitionDelay = delay + "ms";
        p.style.fill = fillOf(paint);
      });
      setTimeout(() => pieces.forEach((p) => { p.style.transitionDelay = ""; }), longest + 400);
      if (step.length) {
        undo.push(step);
        if (undo.length > 80) undo.shift();
        persist();
        refreshThumb(m);
        checkDone(longest + 350);
      }
    }
    svg.addEventListener("click", (e) => {
      const p = e.target.closest("path[data-id]");
      if (!p) return;
      fill(wholeRing ? $$(`path[data-ring="${p.dataset.ring}"]`, svg) : [p], p);
    });
    svg.addEventListener("pointerover", (e) => {
      if (e.pointerType !== "mouse") return;
      const p = e.target.closest("path[data-id]");
      $$(".is-hot", svg).forEach((x) => x.classList.remove("is-hot"));
      if (!p) return;
      (wholeRing ? $$(`path[data-ring="${p.dataset.ring}"]`, svg) : [p]).forEach((x) => x.classList.add("is-hot"));
    });
    svg.addEventListener("pointerleave", () => $$(".is-hot", svg).forEach((x) => x.classList.remove("is-hot")));

    // every piece coloured: it spins once, and she can hang it on the wall
    function checkDone(after) {
      const fills = saved[current] || {};
      const all = $$("path[data-id]", svg);
      const done = all.length && all.every((p) => fills[p.dataset.id]);
      paperEl.classList.toggle("is-done", !!done);
      if (done && !celebrated[current]) {
        celebrated[current] = true;
        setTimeout(() => spin(), after || 0);
      }
    }

    function undoStep() {
      if (current === "draw") { doodle.undo(); return; }
      const step = undo.pop();
      if (!step) return;
      const fills = (saved[current] = saved[current] || {});
      step.forEach(([id, before]) => {
        if (before) fills[id] = before; else delete fills[id];
        const p = svg.querySelector(`[data-id="${id}"]`);
        if (p) p.style.fill = fillOf(before);
      });
      persist();
      refreshThumb(current);
      checkDone();
    }

    // colour it for me, from the colour story she has picked
    function surprise() {
      if (current === "draw") return;
      const m = MANDALAS.find((x) => x.id === current);
      const fills = (saved[current] = saved[current] || {});
      const next = ringFillsToPieces(svg, colourFrom(m, story, Math.random));
      const step = [];
      $$("path[data-id]", svg).forEach((p, i) => {
        const id = p.dataset.id;
        step.push([id, fills[id] || RUB]);
        fills[id] = next[id];
        const ring = Number(id.split(".")[0]);
        p.style.transitionDelay = reduce ? "" : ring * 70 + "ms";
        p.style.fill = fillOf(next[id]);
      });
      setTimeout(() => $$("path[data-id]", svg).forEach((p) => { p.style.transitionDelay = ""; }), 1200);
      undo.push(step);
      persist();
      refreshThumb(current);
      checkDone(900);
    }

    function startOver() {
      if (current === "draw") { doodle.clear(); return; }
      const fills = saved[current] || {};
      const step = Object.keys(fills).map((id) => [id, fills[id]]);
      if (!step.length) return;
      undo.push(step);
      saved[current] = {};
      paintAll(svg, {});
      persist();
      refreshThumb(current);
      celebrated[current] = false;
      checkDone();
    }

    function spin() {
      if (reduce) return;
      paperEl.classList.remove("is-spinning");
      void paperEl.offsetWidth;
      paperEl.classList.add("is-spinning");
    }
    paperEl.addEventListener("animationend", () => paperEl.classList.remove("is-spinning"));

    /* ---------- a picture of the page, for saving and for the wall ---------- */
    function picture(size, cb) {
      if (current === "draw") { cb(doodle.canvas(size)); return; }
      const m = MANDALAS.find((x) => x.id === current);
      const P = PAPERS[paper];
      const out = svgEl("svg", { xmlns: NS, viewBox: "-520 -520 1040 1040", width: String(size), height: String(size) });
      out.appendChild(goldDefs().firstChild);
      out.appendChild(svgEl("rect", { x: "-520", y: "-520", width: "1040", height: "1040", fill: P.ground }));
      const g = draw(m);
      const fills = saved[current] || {};
      $$("path", g).forEach((p) => {
        p.setAttribute("fill", fillOf(fills[p.dataset.id]) || P.ground);
        p.setAttribute("stroke", P.line);
        p.setAttribute("stroke-width", "2.6");
        p.setAttribute("stroke-linejoin", "round");
      });
      $$("circle", g).forEach((c) => { c.setAttribute("fill", "none"); c.setAttribute("stroke", P.line); c.setAttribute("stroke-width", "2"); });
      out.appendChild(g);
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(out)], { type: "image/svg+xml" }));
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = size;
        cv.getContext("2d").drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        cb(cv);
      };
      img.src = url;
    }
    function saveIt() {
      picture(1600, (cv) => download(cv, "didi-" + (current === "draw" ? "mandala-of-her-own" : "mandala-" + current) + ".png"));
    }

    /* ---------- the wall: finished mandalas hang on a string ---------- */
    const WALL = STORE + "-wall";
    function showWall() {
      const list = keep.get(WALL, []) || [];
      hungLine.replaceChildren();
      hung.hidden = !list.length;
      list.forEach((it, i) => {
        const card = document.createElement("figure");
        card.className = "hung-card";
        card.style.setProperty("--tilt", (i % 2 ? 3 : -3) + (i % 3) + "deg");
        const img = new Image();
        img.src = it.src;
        img.alt = "a mandala she coloured";
        const peg = document.createElement("i");
        peg.className = "peg";
        const x = document.createElement("button");
        x.type = "button";
        x.className = "hung-x";
        x.setAttribute("aria-label", "take it down");
        x.textContent = "×";
        x.addEventListener("click", () => {
          const l = keep.get(WALL, []) || [];
          l.splice(i, 1);
          keep.set(WALL, l);
          showWall();
        });
        card.append(peg, img, x);
        hungLine.appendChild(card);
      });
    }
    function hangIt() {
      picture(320, (cv) => {
        let src = "";
        try { src = cv.toDataURL("image/jpeg", 0.86); } catch (e) { return; }
        const list = keep.get(WALL, []) || [];
        list.unshift({ id: current, src });
        keep.set(WALL, list.slice(0, 5));
        showWall();
        const first = $(".hung-card", hungLine);
        if (first && first.animate && !reduce) first.animate([{ transform: "translateY(-30px) rotate(-12deg)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 600, easing: "cubic-bezier(.2,1.4,.4,1)" });
      });
    }

    /* ---------- the tools ---------- */
    $$(".seg[data-fill]").forEach((b) => {
      b.addEventListener("click", () => {
        wholeRing = b.dataset.fill === "ring";
        $$(".seg[data-fill]").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
    $("#st-undo").addEventListener("click", undoStep);
    $("#st-surprise").addEventListener("click", surprise);
    $("#st-spin").addEventListener("click", spin);
    $("#st-clear").addEventListener("click", startOver);
    $("#st-save").addEventListener("click", saveIt);
    $("#st-hang").addEventListener("click", hangIt);

    /* ---------- draw your own: every stroke is repeated round the middle ---------- */
    const doodle = (function () {
      const ctx = pad.getContext("2d");
      const S = 1200;
      pad.width = S;
      pad.height = S;
      let colour = paint;
      let size = 10;
      let folds = 8;
      let mirror = true;
      let ready = false;
      const snaps = [];
      const ground = () => PAPERS[paper].ground;
      const ink = () => (colour === GOLD ? "#c99d45" : colour || ground());
      const fresh = () => { ctx.fillStyle = ground(); ctx.fillRect(0, 0, S, S); };
      function drawGuides() {
        guides.replaceChildren();
        for (let i = 0; i < folds; i++) {
          guides.appendChild(svgEl("line", { x1: 0, y1: 0, x2: 0, y2: -480, transform: `rotate(${(i * 360) / folds})` }));
        }
        [160, 320, 470].forEach((r) => guides.appendChild(svgEl("circle", { r })));
      }
      const sizeHost = $("#sizes");
      [5, 10, 22].forEach((px, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "size-dot";
        const dot = document.createElement("span");
        dot.style.width = dot.style.height = 5 + i * 5 + "px";
        b.appendChild(dot);
        b.setAttribute("aria-label", "brush size " + (i + 1));
        b.setAttribute("aria-pressed", String(px === size));
        b.addEventListener("click", () => {
          size = px;
          $$(".size-dot", sizeHost).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        });
        sizeHost.appendChild(b);
      });
      $$(".seg[data-folds]").forEach((b) => {
        b.addEventListener("click", () => {
          folds = Number(b.dataset.folds);
          $$(".seg[data-folds]").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
          drawGuides();
        });
      });
      // one segment, drawn in every slice (and mirrored, so it reads like a mandala)
      function seg(a, b) {
        ctx.strokeStyle = ink();
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 0; i < folds; i++) {
          for (const flip of mirror ? [1, -1] : [1]) {
            ctx.save();
            ctx.translate(S / 2, S / 2);
            ctx.rotate((i * 2 * Math.PI) / folds);
            ctx.scale(flip, 1);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      let last = null;
      const at = (e) => {
        const r = pad.getBoundingClientRect();
        return { x: (e.clientX - r.left) * (S / r.width) - S / 2, y: (e.clientY - r.top) * (S / r.height) - S / 2 };
      };
      pad.addEventListener("pointerdown", (e) => {
        pad.setPointerCapture(e.pointerId);
        try { snaps.push(ctx.getImageData(0, 0, S, S)); } catch (err) { /* fine */ }
        if (snaps.length > 20) snaps.shift();
        last = at(e);
        seg(last, { x: last.x + 0.1, y: last.y + 0.1 });
      });
      pad.addEventListener("pointermove", (e) => {
        if (!last) return;
        const p = at(e);
        seg(last, p);
        last = p;
      });
      const stop = () => { last = null; };
      pad.addEventListener("pointerup", stop);
      pad.addEventListener("pointercancel", stop);
      return {
        show() { if (!ready) { fresh(); drawGuides(); ready = true; } },
        setColour(c) { colour = c; },
        undo() { const s = snaps.pop(); if (s) ctx.putImageData(s, 0, 0); },
        clear() { try { snaps.push(ctx.getImageData(0, 0, S, S)); } catch (err) { /* fine */ } fresh(); },
        repaper() { if (ready) { try { snaps.push(ctx.getImageData(0, 0, S, S)); } catch (err) { /* fine */ } fresh(); } },
        canvas(sz) { const cv = document.createElement("canvas"); cv.width = cv.height = sz; cv.getContext("2d").drawImage(pad, 0, 0, sz, sz); return cv; },
      };
    })();

    setPaper(paper);
    showWall();
    let first = keep.get(STORE + "-last", MANDALAS[0].id);
    if (first !== "draw" && !MANDALAS.some((m) => m.id === first)) first = MANDALAS[0].id;
    open(first);
  }

  function download(canvas, name) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.download = name;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  }

  /* ---------- painted mandalas: finished ones hung round the house as decoration ----------
     <span class="painted-mandala" data-mandala="folk" data-story="folk"></span> anywhere in the
     page gets that mandala, painted in that colour story, with a crayon edge. */
  function paintHouse() {
    const hosts = $$("[data-mandala]");
    if (!hosts.length) return;
    const defs = svgEl("svg", { width: "0", height: "0", "aria-hidden": "true", style: "position:absolute;width:0;height:0" });
    defs.innerHTML =
      '<defs><filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>' +
      "</filter></defs>";
    document.body.appendChild(defs);
    hosts.forEach((host) => {
      const m = MANDALAS.find((x) => x.id === host.dataset.mandala) || MANDALAS[0];
      const st = STORIES.find((x) => x.id === host.dataset.story) || STORIES[0];
      const svg = svgEl("svg", { viewBox: "-500 -500 1000 1000", "aria-hidden": "true", focusable: "false" });
      const g = draw(m);
      const fills = ringFillsToPieces(g, colourFrom(m, st, seeded(m.id + st.id)));
      $$("path[data-id]", g).forEach((p) => {
        const f = fills[p.dataset.id];
        p.setAttribute("fill", !f || f === GOLD ? st.c[4] : f);
      });
      g.setAttribute("filter", "url(#crayon)");
      g.setAttribute("stroke", host.dataset.line || "#3d4f63");
      svg.appendChild(g);
      host.appendChild(svg);
    });
  }

  window.DIDI_STUDIO = { MANDALAS, draw };
  (window.DIDI_READY || Promise.resolve()).then(() => { paintHouse(); setupStudio(); });
})();
