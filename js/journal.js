/* ============================================================
   journal.js: the photo journal, as an open book.

   Two facing pages lie open with the spine between them. A turn
   lifts one half-page off the spine and swings it over, the way a
   real page turns: the page you are leaving is on its front, the
   next page is on its back, and the page underneath is already the
   one that follows. The spread is only updated once the turn ends.

   Each photo page breaks its photo into pieces: the print itself, a
   round detail cut from the same photo, and a pencil sketch of it
   that draws in when the page arrives. The pieces are placed by a
   seed, so a page looks the same on every visit.

   Next / Previous, the arrow keys, a tap on a page, and a swipe all
   turn the book. A turn cannot start while another is running.
   On a phone the book shows one page at a time.

   Called from app.js as setupJournal().
   ============================================================ */
(function () {
  "use strict";

  const TURN_MS = 780;
  const EASE = "cubic-bezier(0.45, 0.02, 0.2, 1)";
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

  /* ---------- the pieces on a photo page ---------- */
  const CORNERS = ["tl", "tr", "bl", "br"];
  const OPPOSITE = { tl: "br", br: "tl", tr: "bl", bl: "tr" };
  const SIDES = ["l", "r"];
  const STICKERS = ["star", "sparkle", "flower", "heart", "moon", "bow", "cherry", "leaf"];
  // the words on the sticky notes: edit these to say what you like
  const NOTES = ["always", "remember this", "love you", "our trip"];
  // a stamp appears on a page whose caption names one of these places
  const PLACES = ["Goa", "Manali", "Jaipur", "Shimla", "Mysore"];

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

  // a photo for a page: its own file. If that file is not saved yet, the photo is left off the page
  // and the caption stands alone, so no page ever shows a photo of someone it does not belong to.
  function loadPhoto(img, it) {
    img.draggable = false;
    img.decoding = "async";
    img.src = it.src;
    img.onerror = () => {
      if (img.dataset.fell) return;
      img.dataset.fell = "1";
      const stage = img.closest(".bk-stage");
      if (stage) stage.classList.add("is-missing");
    };
  }

  // a round detail cut from the same photo: zoomed in, with a white cut edge
  function cutOut(R, it, at) {
    const cut = el("figure", "bk-cut bk-deco at-" + at);
    const img = el("img");
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    loadPhoto(img, it);
    cut.appendChild(img);
    cut.style.setProperty("--zoom", (1.9 + R() * 0.8).toFixed(2));
    cut.style.setProperty("--ox", Math.round(30 + R() * 40) + "%");
    cut.style.setProperty("--oy", Math.round(30 + R() * 40) + "%");
    cut.style.setProperty("--rot", tilt(R, 6));
    return cut;
  }

  // the same photo drawn in pencil. Two copies: the photo in grey, and the photo inverted and
  // blurred over it in colour-dodge, which leaves only the lines of a pencil sketch
  function pencilSketch(R, it, at) {
    const sk = el("figure", "bk-sketch bk-deco at-" + at);
    const base = el("img");
    const lines = el("img", "bk-lines");
    base.alt = "";
    lines.alt = "";
    base.setAttribute("aria-hidden", "true");
    lines.setAttribute("aria-hidden", "true");
    loadPhoto(base, it);
    loadPhoto(lines, it);
    sk.append(base, lines);
    sk.style.setProperty("--rot", tilt(R, 5));
    return sk;
  }

  // lay the pieces over the print: a detail cut round, a pencil sketch, tape, a sticker, a stamp, a note.
  // Each page takes some of them, by its own seed.
  function dress(stage, it, R) {
    const corner = pick(R, CORNERS);
    if (R() < 0.6) stage.appendChild(cutOut(R, it, corner));
    if (R() < 0.5) stage.appendChild(pencilSketch(R, it, OPPOSITE[corner]));
    const tape = el("span", "bk-tape bk-deco at-" + pick(R, ["tl", "tr"]));
    tape.style.setProperty("--rot", tilt(R, 26));
    stage.appendChild(tape);
    if (R() < 0.4 && window.DIDI_ART) {
      const sticker = window.DIDI_ART.sticker(pick(R, STICKERS), "bk-sticker bk-deco at-" + pick(R, SIDES));
      sticker.style.setProperty("--rot", tilt(R, 14));
      stage.appendChild(sticker);
    }
    const where = PLACES.find((p) => it.caption.includes(p));
    if (where && R() < 0.45) {
      const stamp = el("span", "bk-stamp bk-deco at-" + pick(R, ["l", "r", "tr"]), where);
      stamp.style.setProperty("--rot", tilt(R, 12));
      stage.appendChild(stamp);
    }
    if (R() < 0.2) {
      const note = el("span", "bk-post bk-deco at-" + pick(R, ["tl", "tr"]) + (R() < 0.5 ? " is-pink" : ""), pick(R, NOTES));
      note.style.setProperty("--rot", tilt(R, 8));
      stage.appendChild(note);
    }
  }

  window.setupJournal = function setupJournal() {
    const D = window.DIDI || {};
    const book = document.getElementById("bk");
    const spread = document.getElementById("bk-spread");
    const leftHalf = document.getElementById("bk-left");
    const rightHalf = document.getElementById("bk-right");
    const castL = book ? book.querySelector(".bk-cast-l") : null;
    const castR = book ? book.querySelector(".bk-cast-r") : null;
    const leaf = document.getElementById("bk-leaf");
    const segIn = document.getElementById("bk-seg-in");
    const segOut = document.getElementById("bk-seg-out");
    const frontIn = document.getElementById("bk-front-in");
    const frontOut = document.getElementById("bk-front-out");
    const backIn = document.getElementById("bk-back-in");
    const backOut = document.getElementById("bk-back-out");
    const prevBtn = document.getElementById("book-prev");
    const nextBtn = document.getElementById("book-next");
    const countEl = document.getElementById("book-pages");
    if (!book || !spread || !leaf || !segIn || !segOut || !frontIn || !frontOut || !backIn || !backOut) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 860px)");
    const single = () => phone.matches;
    const stepOf = () => (single() ? 1 : 2);

    // The pages in order. A photo that is not saved yet leaves its page without a photo.
    const pages = (D.journal || []).map((p, k) => ({
      src: p.src,
      caption: p.caption || "",
      date: p.date || "",
      note: p.note || "",
      n: k + 1,
    }));
    if (D.journalEnd) pages.push({ end: true, title: D.journalEnd.title, text: D.journalEnd.text, n: pages.length + 1 });
    const N = pages.length;
    if (!N) return;

    // r is the index of the right-hand page. A spread shows r-1 (left) and r (right).
    // On a phone r is the one page shown.
    let r = single() ? 0 : 1;
    let busy = false;

    const canNext = () => r + stepOf() <= N - 1;
    const canPrev = () => r - stepOf() >= (single() ? 0 : 1);

    function updateControls() {
      prevBtn.disabled = busy || !canPrev();
      nextBtn.disabled = busy || !canNext();
    }

    // one page's content, with its page number
    function pageEl(i, side) {
      const it = pages[i];
      const page = el("article", "bk-page bk-page--" + side);
      page.setAttribute("aria-label", "page " + it.n + " of " + N);
      if (it.end) {
        const wrap = el("div", "bk-end");
        wrap.append(el("h3", null, it.title), el("p", null, it.text));
        page.appendChild(wrap);
      } else {
        // each print sits a little off straight, and differently on every page
        const R = rng(it.n * 7919 + 17);
        const stage = el("div", "bk-stage");
        const fig = el("figure", "bk-photo");
        fig.style.setProperty("--tilt", (R() * 3.6 - 1.8).toFixed(2) + "deg");
        fig.style.setProperty("--dx", (R() * 8 - 4).toFixed(1) + "px");
        fig.style.setProperty("--dy", (R() * 6 - 3).toFixed(1) + "px");
        const img = el("img");
        img.alt = it.caption;
        loadPhoto(img, it);
        fig.appendChild(img);
        stage.appendChild(fig);
        dress(stage, it, R);
        page.appendChild(stage);
        if (it.date) page.appendChild(el("p", "bk-date", fmtDate(it.date)));
        page.appendChild(el("p", "bk-cap", it.caption));
        if (it.note) page.appendChild(el("p", "bk-note", it.note));
      }
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
        countEl.textContent = "pages " + r + "–" + (r + 1) + " of " + N;
      }
      updateControls();
    }

    // one half-page turn. dir is +1 (forward) or -1 (back).
    function turn(dir) {
      if (busy) return;
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

      leaf.classList.add("is-on");
      // the fold: the inner half lifts off the spine, and the outer half curls over at the crease
      // (it leads a little), so the back of the page shows through the fold. Flat at both ends.
      const inKeys = fwd
        ? [{ transform: "translateZ(0px) rotateY(0deg)" }, { transform: "translateZ(40px) rotateY(-70deg)", offset: 0.5 }, { transform: "translateZ(0px) rotateY(-180deg)" }]
        : [{ transform: "translateZ(0px) rotateY(-180deg)" }, { transform: "translateZ(40px) rotateY(-70deg)", offset: 0.5 }, { transform: "translateZ(0px) rotateY(0deg)" }];
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

    // arrow keys, while the book is on screen and not typing
    document.addEventListener("keydown", (e) => {
      const box = book.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
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
      render();
    });

    render();
  };
})();
