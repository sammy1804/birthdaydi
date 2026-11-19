/* ============================================================
   journal.js: the photo journal, as an open book.

   Two facing pages lie open, tilted up from the spine. Behind them
   the other pages fan out to both sides: the ones already read on
   the left, the ones to come on the right, each showing a sliver of
   its own photo. A turn lifts one half-page off the spine and folds
   it over, the way a real page turns: the page you are leaving is on
   its front, the next page is on its back, and the page underneath
   is already the one that follows.

   A page is one of three kinds:
     a photo page    one photo, with pieces cut from it laid on top.
                     Some run the photo to every edge.
     a collage page  two to four photos laid out together.
     a written page  a memory whose photo is not saved yet: its words
                     fill the page in handwriting.
   The pieces are placed by a seed, so a page looks the same on every visit.

   The book starts closed. It opens when the house script calls
   DIDI_JOURNAL.open(), or when the cover is tapped.

   Next / Previous, the arrow keys, a tap on a page, and a swipe all
   turn the book. A turn cannot start while another is running.
   On a phone the book shows one page at a time.

   Called from house.js as setupJournal().
   ============================================================ */
(function () {
  "use strict";

  const TURN_MS = 780;
  const EASE = "cubic-bezier(0.45, 0.02, 0.2, 1)";
  const TILT = 7; // how far each open page tilts up from the spine, in degrees (--tilt in journal.css)
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function fmtDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso; // a date written in words, such as "during covid"
    return d + " " + MONTHS[m - 1] + " " + y;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- the pieces on a page ---------- */
  const CORNERS = ["tl", "tr", "bl", "br"];
  const OPPOSITE = { tl: "br", br: "tl", tr: "bl", bl: "tr" };
  const SIDES = ["l", "r"];
  const STICKERS = ["star", "sparkle", "flower", "heart", "moon", "bow", "cherry", "leaf"];
  const TAPES = ["", "", " is-rose", " is-sage"];
  // the words on the sticky notes: edit these to say what you like
  const NOTES = ["always", "remember this", "love you", "our trip"];

  // how the photos of a collage page are laid out: each is [left, top, width, height, tilt],
  // in percent of the page's photo area. A page picks one of the layouts for its count.
  const LAYOUTS = {
    2: [
      [[0, 1, 66, 56, -3], [34, 43, 66, 56, 2.5]],
      [[30, 0, 70, 52, 2.2], [0, 45, 68, 54, -2.6]],
    ],
    3: [
      [[2, 0, 96, 50, -1.2], [0, 53, 47, 46, -3], [51, 55, 49, 44, 2.6]],
      [[0, 0, 57, 60, -2.4], [51, 7, 49, 44, 3], [14, 57, 72, 43, 1.2]],
    ],
    4: [
      [[0, 0, 48, 47, -2.5], [52, 3, 48, 46, 2], [3, 52, 47, 47, 1.8], [51, 53, 49, 46, -2.2]],
      [[0, 3, 58, 44, -2], [56, 0, 44, 52, 2.6], [0, 50, 44, 50, 2], [42, 55, 58, 44, -1.5]],
    ],
  };

  // a small seeded random, so a page keeps the same pieces on every visit
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
  const tilt = (R, deg) => (R() * 2 * deg - deg).toFixed(1) + "deg";

  // which photo files are saved, and which are not yet. Checked once, when the book is set up.
  const missing = new Set();

  // a page's photo can also be a short video (.mp4 or .webm): it plays muted, on a loop
  const isClip = (src) => /\.(mp4|webm|m4v)(\?.*)?$/i.test(src || "");

  function photoImg(src, alt, onFail) {
    if (isClip(src)) {
      const v = el("video");
      v.muted = true;
      v.loop = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "auto";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      if (alt) v.setAttribute("aria-label", alt);
      v.onerror = () => {
        missing.add(src);
        if (onFail) onFail();
      };
      v.src = src;
      return v;
    }
    const img = el("img");
    img.alt = alt || "";
    img.draggable = false;
    img.decoding = "async";
    img.onerror = () => {
      missing.add(src);
      if (onFail) onFail();
    };
    img.src = src;
    return img;
  }

  // a round detail cut from a photo: zoomed in, with a white cut edge
  function cutOut(R, src, at) {
    const cut = el("figure", "bk-cut bk-deco at-" + at);
    const img = photoImg(src, "");
    img.setAttribute("aria-hidden", "true");
    cut.appendChild(img);
    cut.style.setProperty("--zoom", (1.9 + R() * 0.8).toFixed(2));
    cut.style.setProperty("--ox", Math.round(30 + R() * 40) + "%");
    cut.style.setProperty("--oy", Math.round(26 + R() * 30) + "%");
    cut.style.setProperty("--rot", tilt(R, 6));
    return cut;
  }

  // a sticker cut out of a photo: a PNG of just her, with a white die-cut edge
  function dieCut(R, src, at) {
    const cut = el("figure", "bk-diecut bk-deco at-" + at);
    const img = photoImg(src, "", () => cut.remove());
    img.setAttribute("aria-hidden", "true");
    cut.appendChild(img);
    cut.style.setProperty("--rot", tilt(R, 5));
    return cut;
  }

  // the same photo drawn in pencil. Two copies: the photo in grey, and the photo inverted and
  // blurred over it in colour-dodge, which leaves only the lines of a pencil sketch
  function pencilSketch(R, src, at) {
    const sk = el("figure", "bk-sketch bk-deco at-" + at);
    const base = photoImg(src, "");
    const lines = photoImg(src, "");
    lines.className = "bk-lines";
    base.setAttribute("aria-hidden", "true");
    lines.setAttribute("aria-hidden", "true");
    sk.append(base, lines);
    sk.style.setProperty("--rot", tilt(R, 5));
    return sk;
  }

  function tape(R, at) {
    const t = el("span", "bk-tape bk-deco at-" + at + pick(R, TAPES));
    t.style.setProperty("--rot", tilt(R, 26));
    return t;
  }

  function stamp(R, word, at) {
    const s = el("span", "bk-stamp bk-deco at-" + at + (word.length > 6 ? " is-long" : ""), word);
    s.style.setProperty("--rot", tilt(R, 12));
    return s;
  }

  // lay the paper pieces over a page's photos. Each page takes some of them, by its own seed.
  function dress(stage, it, R, kind) {
    const src = it.srcs[0];
    const corner = pick(R, CORNERS);
    if (kind === "collage") {
      stage.appendChild(tape(R, pick(R, ["tl", "tr"])));
      if (R() < 0.5) stage.appendChild(tape(R, pick(R, ["bl", "br"])));
    } else {
      // the round cut-out and the pencil sketch are made from a still photo, never from a clip
      if (it.cut) stage.appendChild(dieCut(R, it.cut, pick(R, ["bl", "br"])));
      else if (R() < 0.62 && !isClip(src)) stage.appendChild(cutOut(R, src, kind === "bleed" ? pick(R, ["tl", "tr"]) : corner));
      if (kind === "print") {
        if (R() < 0.5 && !isClip(src)) stage.appendChild(pencilSketch(R, src, OPPOSITE[corner]));
        stage.appendChild(tape(R, pick(R, ["tl", "tr"])));
      }
    }
    // a hand-drawn doodle, once the doodles are saved (pages without them look exactly as before)
    const doodles = window.DIDI_ART && window.DIDI_ART.doodles ? window.DIDI_ART.doodles() : [];
    if (doodles.length && R() < (kind === "collage" ? 0.6 : 0.5)) {
      const d = el("img", "bk-doodle bk-deco at-" + pick(R, ["tl", "tr", "bl", "br", "l", "r"]));
      d.src = pick(R, doodles);
      d.alt = "";
      d.setAttribute("aria-hidden", "true");
      d.style.setProperty("--rot", tilt(R, 12));
      stage.appendChild(d);
    }
    let side = "";
    if (R() < (kind === "collage" ? 0.75 : 0.45) && window.DIDI_ART) {
      const name = pick(R, STICKERS);
      side = pick(R, SIDES);
      const sticker = window.DIDI_ART.sticker(name, "bk-sticker bk-deco at-" + side);
      sticker.style.setProperty("--rot", tilt(R, 14));
      stage.appendChild(sticker);
    }
    if (it.place && (kind === "collage" || R() < 0.6)) stage.appendChild(stamp(R, it.place, pick(R, ["tr", "br", "bl"])));
    if (R() < 0.2) {
      const note = el("span", "bk-post bk-deco at-" + pick(R, ["tl", "tr"]) + (R() < 0.5 ? " is-pink" : ""), pick(R, NOTES));
      note.style.setProperty("--rot", tilt(R, 8));
      stage.appendChild(note);
    }
    // one of this trip's stickers, on the side the other sticker left free. It comes last,
    // so a page whose trip stickers aren't saved yet keeps exactly the pieces it had.
    const trip = tripStickers(it);
    if (trip.length) {
      const at = side === "l" ? "r" : side === "r" ? "l" : pick(R, SIDES);
      const s = window.DIDI_ART.sticker(pick(R, trip), "bk-sticker is-trip bk-deco at-" + at);
      s.style.setProperty("--rot", tilt(R, 12));
      stage.appendChild(s);
    }
  }

  // the trip stickers a page can use: its own, or its place's, and only the ones that are saved
  function tripStickers(it) {
    const art = window.DIDI_ART;
    return art && art.hasSticker ? (it.stickers || []).filter(art.hasSticker) : [];
  }

  window.setupJournal = function setupJournal() {
    const D = window.DIDI || {};
    const book = document.getElementById("bk");
    const spread = document.getElementById("bk-spread");
    const leftHalf = document.getElementById("bk-left");
    const rightHalf = document.getElementById("bk-right");
    const fanL = document.getElementById("bk-fan-l");
    const fanR = document.getElementById("bk-fan-r");
    const castL = book ? book.querySelector(".bk-cast-l") : null;
    const castR = book ? book.querySelector(".bk-cast-r") : null;
    const leaf = document.getElementById("bk-leaf");
    const segIn = document.getElementById("bk-seg-in");
    const segOut = document.getElementById("bk-seg-out");
    const frontIn = document.getElementById("bk-front-in");
    const frontOut = document.getElementById("bk-front-out");
    const backIn = document.getElementById("bk-back-in");
    const backOut = document.getElementById("bk-back-out");
    const cover = document.getElementById("bk-cover");
    const prevBtn = document.getElementById("book-prev");
    const nextBtn = document.getElementById("book-next");
    const countEl = document.getElementById("book-pages");
    if (!book || !spread || !leaf || !segIn || !segOut || !frontIn || !frontOut || !backIn || !backOut) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 860px)");
    const single = () => phone.matches;
    const stepOf = () => (single() ? 1 : 2);

    // The pages in order. Every page carries a list of photos, even when it has only one.
    const pages = (D.journal || []).map((p, k) => ({
      srcs: (p.srcs && p.srcs.length ? p.srcs : p.src ? [p.src] : []).slice(0, 4),
      caption: p.caption || "",
      place: p.place || "",
      date: p.date || "",
      note: p.note || "",
      sign: p.sign || "",
      cut: p.cut || "",
      stickers: p.stickers || (D.tripStickers || {})[p.place] || [],
      n: k + 1,
    }));
    if (D.journalEnd) pages.push({ end: true, title: D.journalEnd.title, text: D.journalEnd.text, srcs: [], n: pages.length + 1 });
    const N = pages.length;
    if (!N) return;

    const total = document.getElementById("jr-count");
    if (total) total.textContent = N + " pages";
    const coverSub = document.getElementById("bk-cover-sub");
    if (coverSub) coverSub.textContent = N + " pages";
    const coverPhoto = document.getElementById("bk-cover-photo");
    if (coverPhoto) {
      const src = D.journalCover || (pages.find((p) => p.srcs.length) || { srcs: [] }).srcs[0];
      if (src) coverPhoto.style.backgroundImage = 'url("' + src + '")';
      else coverPhoto.remove();
    }

    // r is the index of the right-hand page. A spread shows r-1 (left) and r (right).
    // On a phone r is the one page shown.
    let r = single() ? 0 : 1;
    let busy = false;

    const last = () => (single() || N % 2 === 0 ? N - 1 : N); // an odd book ends on a blank right-hand page
    const canNext = () => r + stepOf() <= last();
    const canPrev = () => r - stepOf() >= (single() ? 0 : 1);

    function updateControls() {
      prevBtn.disabled = busy || !canPrev();
      nextBtn.disabled = busy || !canNext();
    }

    // one page's content
    function pageEl(i, side) {
      const it = pages[i];
      const page = el("article", "bk-page bk-page--" + side);
      if (!it) return page; // the blank page that closes an odd book
      page.setAttribute("aria-label", "page " + it.n + " of " + N);
      if (it.end) {
        const wrap = el("div", "bk-end");
        wrap.append(el("h3", null, it.title), el("p", null, it.text));
        page.appendChild(wrap);
        return page;
      }

      const R = rng(it.n * 7919 + 17);
      const paper = Math.floor(R() * 5);
      if (paper) page.classList.add("pp-" + paper);

      const words = el("div", "bk-words");
      if (it.date) words.appendChild(el("p", "bk-date", fmtDate(it.date)));
      if (it.caption) words.appendChild(el("p", "bk-cap", it.caption));
      if (it.note) words.appendChild(el("p", "bk-note", it.note));
      if (it.sign) words.appendChild(el("p", "bk-sign", it.sign));

      const have = it.srcs.filter((s) => !missing.has(s));
      const written = () => {
        page.classList.remove("is-bleed");
        page.classList.add("is-written");
        if (it.place && !page.querySelector(".bk-stamp-w")) page.appendChild(el("span", "bk-stamp bk-stamp-w" + (it.place.length > 6 ? " is-long" : ""), it.place));
        // a trip sticker in the bottom corner, picked by page number so it never changes
        const trip = tripStickers(it);
        if (trip.length && !page.querySelector(".bk-trip-w")) {
          page.appendChild(window.DIDI_ART.sticker(trip[it.n % trip.length], "bk-sticker is-trip bk-trip-w"));
        }
      };

      if (!have.length) {
        written();
      } else {
        const stage = el("div", "bk-stage");
        let kind;
        if (have.length > 1) {
          // a collage: the photos together, each a print with its own tilt
          kind = "collage";
          const layout = pick(R, LAYOUTS[have.length]);
          have.forEach((src, k) => {
            const [x, y, w, h, t] = layout[k];
            const fig = el("figure", "bk-print" + (R() < 0.35 ? " is-polaroid" : ""));
            fig.style.setProperty("--x", x + "%");
            fig.style.setProperty("--y", y + "%");
            fig.style.setProperty("--w", w + "%");
            fig.style.setProperty("--h", h + "%");
            fig.style.setProperty("--rt", (t + R() * 1.4 - 0.7).toFixed(2) + "deg");
            fig.style.setProperty("--z", String(k + 1));
            fig.style.setProperty("--bw", "5px");
            fig.appendChild(photoImg(src, "", () => fig.classList.add("is-gone")));
            stage.appendChild(fig);
          });
        } else {
          // one photo: it runs to every edge on some pages, and sits as a print on the others.
          // A long note needs the paper, so those pages are always prints.
          kind = it.note.length < 90 && R() < 0.45 ? "bleed" : "print";
          if (kind === "bleed") page.classList.add("is-bleed");
          const fig = el("figure", "bk-print");
          fig.style.setProperty("--rt", (R() * 3.6 - 1.8).toFixed(2) + "deg");
          fig.appendChild(photoImg(have[0], it.caption, written));
          stage.appendChild(fig);
        }
        dress(stage, it, R, kind);
        page.appendChild(stage);
      }
      if (words.childNodes.length) page.appendChild(words);
      return page;
    }

    // a face of the turning leaf: the page, shifted so the face shows one half of it
    // (shift 0 is the half by the spine, -100 the outer half), and a shade that darkens as it turns
    function setFace(face, i, side, shift) {
      const shade = el("span", "bk-shade");
      const sheet = el("div", "bk-sheet");
      sheet.style.left = shift + "%";
      sheet.appendChild(pageEl(i, side));
      face.replaceChildren(sheet, shade);
      return shade;
    }

    /* ---------- the pages fanned out behind the spread ---------- */
    const fanNodes = { l: new Map(), r: new Map() };
    const fanMax = () => (single() ? 4 : 6);

    function syncFan(host, map, list) {
      if (!host) return;
      const keep = new Set(list);
      map.forEach((node, idx) => {
        if (keep.has(idx)) return;
        node.classList.add("is-out");
        map.delete(idx);
        setTimeout(() => node.remove(), 460);
      });
      list.forEach((idx, slot) => {
        let node = map.get(idx);
        if (!node) {
          node = el("span", "bk-fp");
          const it = pages[idx];
          const src = it ? it.srcs.find((s) => !missing.has(s) && !isClip(s)) : null;
          if (src) node.style.backgroundImage = 'url("' + src + '")';
          host.appendChild(node);
          map.set(idx, node);
        }
        node.style.setProperty("--i", String(slot + 1));
      });
    }

    // the pages already read fan out to the left, the ones to come to the right
    function fans(rr) {
      const step = stepOf();
      const left = [];
      const right = [];
      for (let k = single() ? rr - 1 : rr - 1 - step; k >= 0 && left.length < fanMax(); k -= step) left.push(k);
      for (let k = rr + step; k <= last() && right.length < fanMax(); k += step) right.push(k);
      syncFan(fanL, fanNodes.l, left);
      syncFan(fanR, fanNodes.r, right);
    }

    // show the current spread (or page) from the state, with no motion
    function render() {
      book.classList.toggle("is-single", single());
      if (single()) {
        leftHalf.replaceChildren();
        rightHalf.replaceChildren(pageEl(r, "single"));
        countEl.textContent = "page " + (r + 1) + " of " + N;
      } else {
        leftHalf.replaceChildren(pageEl(r - 1, "left"));
        rightHalf.replaceChildren(pageEl(r, "right"));
        countEl.textContent = "pages " + r + "–" + Math.min(r + 1, N) + " of " + N;
      }
      fans(r);
      updateControls();
    }

    // one half-page turn. dir is +1 (forward) or -1 (back).
    function turn(dir) {
      if (busy || book.classList.contains("is-closed")) return;
      if (dir > 0 && !canNext()) return;
      if (dir < 0 && !canPrev()) return;
      const isSingle = single();
      const newR = r + dir * stepOf();
      busy = true;
      updateControls();

      if (reduce) {
        // no fold: a short fade of the spread to the new pages
        r = newR;
        render();
        spread.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 240, easing: "ease-out" });
        busy = false;
        updateControls();
        return;
      }

      const fwd = dir > 0;
      const sideFront = isSingle ? "single" : "right";
      const sideBack = isSingle ? "single" : "left";
      let shadeFI, shadeFO, shadeBI, shadeBO;

      // each face shows one half of its page: the half by the spine (in), the outer half (out).
      // the front is the page we leave (forward) or land on (back); the back is the page on the far side.
      if (fwd) {
        shadeFI = setFace(frontIn, r, sideFront, 0);
        shadeFO = setFace(frontOut, r, sideFront, -100);
        shadeBI = setFace(backIn, r + 1, sideBack, -100);
        shadeBO = setFace(backOut, r + 1, sideBack, 0);
        // the right-hand page underneath becomes the one after the turn
        rightHalf.replaceChildren(pageEl(newR, sideFront));
      } else {
        // the leaf starts on the left, carrying the page we are on now (back),
        // and lands on the right with the page we are going to (front)
        const behind = isSingle ? r : r - 1;
        shadeFI = setFace(frontIn, newR, sideFront, 0);
        shadeFO = setFace(frontOut, newR, sideFront, -100);
        shadeBI = setFace(backIn, behind, sideBack, -100);
        shadeBO = setFace(backOut, behind, sideBack, 0);
        if (!isSingle) leftHalf.replaceChildren(pageEl(newR - 1, "left"));
      }
      // the fanned pages shift along as the leaf goes over
      fans(newR);

      leaf.classList.add("is-on");
      // the fold: the inner half lifts off the spine, and the outer half curls over at the crease
      // (it leads a little), so the back of the page shows through the fold. The leaf starts and
      // lands at the same tilt as the open pages, so nothing jumps at either end.
      const T = isSingle ? 0 : TILT;
      const flatR = "translateZ(0px) rotateY(" + -T + "deg)";
      const flatL = "translateZ(0px) rotateY(" + -(180 - T) + "deg)";
      const mid = { transform: "translateZ(40px) rotateY(-70deg)", offset: 0.5 };
      const inKeys = fwd ? [{ transform: flatR }, mid, { transform: flatL }] : [{ transform: flatL }, mid, { transform: flatR }];
      const outKeys = [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-50deg)", offset: 0.5 }, { transform: "rotateY(0deg)" }];
      const segAnim = segIn.animate(inKeys, { duration: TURN_MS, easing: EASE, fill: "forwards" });
      const outAnim = segOut.animate(outKeys, { duration: TURN_MS, easing: EASE, fill: "forwards" });

      const anims = [
        segAnim,
        outAnim,
        // the pages facing you darken as they turn away, the pages landing on the far side darken as they come down
        shadeFI.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: TURN_MS, easing: "linear", fill: "forwards" }),
        shadeFO.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: TURN_MS, easing: "linear", fill: "forwards" }),
        shadeBI.animate([{ opacity: 0.45 }, { opacity: 0 }], { duration: TURN_MS, easing: "linear", fill: "forwards" }),
        shadeBO.animate([{ opacity: 0.45 }, { opacity: 0 }], { duration: TURN_MS, easing: "linear", fill: "forwards" }),
      ];
      // shadows the turning page casts on the pages beneath it
      if (fwd) {
        anims.push(castR.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: TURN_MS * 0.7, easing: "ease-out", fill: "forwards" }));
        if (castL) anims.push(castL.animate([{ opacity: 0 }, { opacity: 0.4, offset: 0.6 }, { opacity: 0 }], { duration: TURN_MS, easing: "ease-in-out", fill: "forwards" }));
      } else {
        if (castL) anims.push(castL.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: TURN_MS * 0.7, easing: "ease-out", fill: "forwards" }));
        anims.push(castR.animate([{ opacity: 0 }, { opacity: 0.4, offset: 0.6 }, { opacity: 0 }], { duration: TURN_MS, easing: "ease-in-out", fill: "forwards" }));
      }

      segAnim.onfinish = () => {
        anims.forEach((a) => a.cancel());
        leaf.classList.remove("is-on");
        r = newR;
        busy = false;
        render();
      };
    }

    prevBtn.addEventListener("click", () => turn(-1));
    nextBtn.addEventListener("click", () => turn(1));

    // arrow keys, while the book is the thing on screen and nobody is typing
    const onStage = () => {
      const scene = book.closest(".scene");
      return scene ? scene.classList.contains("is-here") : true;
    };
    document.addEventListener("keydown", (e) => {
      if (!onStage()) return;
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") turn(1);
      else if (e.key === "ArrowLeft") turn(-1);
    });

    // a tap on the right half turns forward, on the left half back; a swipe turns the way it moves
    let downX = null;
    spread.addEventListener("pointerdown", (e) => {
      downX = e.clientX;
    });
    spread.addEventListener("pointerup", (e) => {
      if (downX === null) return;
      const dx = e.clientX - downX;
      downX = null;
      if (book.classList.contains("is-closed")) return;
      if (dx < -40) turn(1);
      else if (dx > 40) turn(-1);
      else if (Math.abs(dx) < 8) {
        const box = spread.getBoundingClientRect();
        turn(e.clientX > box.left + box.width / 2 ? 1 : -1);
      }
    });
    spread.addEventListener("pointercancel", () => {
      downX = null;
    });

    // switching between a wide screen and a phone keeps the same page in view
    phone.addEventListener("change", () => {
      if (busy) return;
      if (!single() && r % 2 === 0) r = Math.max(1, r - 1);
      fanNodes.l.forEach((n) => n.remove());
      fanNodes.r.forEach((n) => n.remove());
      fanNodes.l.clear();
      fanNodes.r.clear();
      render();
    });

    /* ---------- the cover ---------- */
    const open = () => book.classList.remove("is-closed");
    if (cover) {
      book.classList.add("is-closed");
      cover.addEventListener("click", open);
    }
    window.DIDI_JOURNAL = { open, isOpen: () => !book.classList.contains("is-closed") };

    // find out which photos are saved before the first page is drawn, so a page whose photo
    // is still to come is a written page from the start
    const all = [];
    pages.forEach((p) => p.srcs.forEach((s) => { if (!all.includes(s)) all.push(s); }));
    let left = all.length;
    const settle = () => {
      left -= 1;
      if (left <= 0 && !busy) render();
    };
    // Only ask whether each file is there (a HEAD request carries no picture), so opening the
    // house doesn't download every photo in the book. A page's photos load when it is drawn.
    // Where HEAD can't be used (the site opened as a file), the old way: load it and see.
    function loadProbe(src, ok, fail) {
      if (isClip(src)) {
        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.muted = true;
        probe.onloadedmetadata = ok;
        probe.onerror = fail;
        setTimeout(ok, 6000); // a slow connection: draw the page anyway, the clip arrives when it can
        probe.src = src;
      } else {
        const probe = new Image();
        probe.onload = ok;
        probe.onerror = fail;
        probe.src = src;
      }
    }
    const canHead = /^https?:$/.test(location.protocol) && "fetch" in window;
    all.forEach((src) => {
      let done = false;
      const ok = () => { if (!done) { done = true; settle(); } };
      const fail = () => { if (!done) { done = true; missing.add(src); settle(); } };
      if (!canHead) return loadProbe(src, ok, fail);
      fetch(src, { method: "HEAD" })
        .then((r) => (r.ok ? ok() : r.status === 404 ? fail() : loadProbe(src, ok, fail)))
        .catch(() => loadProbe(src, ok, fail));
    });

    render();
  };
})();
