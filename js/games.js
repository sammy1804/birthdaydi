/* ============================================================
   games.js: the seven games on the game table.

     find Didi             the lights are off; with a torch she finds herself in our photos
     spot the difference   five things changed in the second picture
     memory                pairs of her own photos, a new eight every shuffle
     in pieces             a sliding puzzle: two sizes, four pictures, a peek
     the odd one out       four everyday things, one doesn't belong
     save the candles      guess the word; each wrong letter blows out a candle
     the treasure hunt     a riddle at a time; each answer turns up a photo, the last opens the chest

   Put away for now (their pieces wait in <template id="games-put-away">, and the code
   below does nothing while they are off the table): the trip quiz, the trips in order,
   the crossword and untangle. They ask about our trips, so they come back once the
   answers are checked.

   All the words and pictures come from js/content.js. No timers,
   no accounts; best scores are kept in this browser.
   ============================================================ */
(function () {
  "use strict";

  const D = window.DIDI || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const art = () => window.DIDI_ART;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const nudge = (node) => {
    if (reduce || !node || !node.animate) return;
    node.animate([{ transform: "translateX(0)" }, { transform: "translateX(-7px)" }, { transform: "translateX(7px)" }, { transform: "translateX(-4px)" }, { transform: "translateX(0)" }], { duration: 300 });
  };
  const pop = (node) => {
    if (reduce || !node || !node.animate) return;
    node.animate([{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1.12)", opacity: 1, offset: 0.6 }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
  };
  const best = {
    get(k) { try { return Number(localStorage.getItem("didi-best-" + k)) || 0; } catch (e) { return 0; } },
    set(k, v) { try { localStorage.setItem("didi-best-" + k, String(v)); } catch (e) { /* fine */ } },
  };
  const loads = (src) => new Promise((res) => {
    if (!src) { res(false); return; }
    const i = new Image();
    i.onload = () => res(true);
    i.onerror = () => res(false);
    i.src = src;
  });
  const sticker = (name, cls) => (art() ? art().sticker(name, cls) : el("span", cls));

  // the first saved photo from the journal for a place, if there is one
  async function photoFor(place) {
    if (!place) return null;
    const pages = (D.journal || []).filter((p) => p.place === place || (p.caption || "").includes(place));
    for (const p of pages) {
      const src = (p.srcs && p.srcs[0]) || p.src;
      if (await loads(src)) return src;
    }
    return null;
  }

  /* ============================================================
     FIND DIDI: the lights are off. A torch, and her own face to find
     ============================================================ */
  function findDidi() {
    const all = (D.findDidi || []).filter((x) => x.src);
    const stage = $("#fd-stage");
    if (!all.length || !stage) return;
    const img = $("#fd-photo");
    const ring = $("#fd-ring");
    const msg = $("#fd-msg");
    const next = $("#fd-next");
    const lights = $("#fd-lights");
    const countEl = $("#fd-count");
    const foundEl = $("#fd-found");
    const ROUND = Math.min(10, all.length);
    const NOPE = ["not you.", "that's someone else.", "nope, keep looking.", "close. not quite.", "hmm, no.", "try again, the torch is yours."];
    const YES = ["there you are.", "found you, pretty.", "that's the one.", "spotted.", "hello, you.", "easy, right?"];
    const any = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let order = [];
    let pos = 0;
    let found = 0;
    let wrong = 0;
    let done = false;
    let torch = 0.2; // the torch's size, as a share of the photo's width

    const sizeTorch = () => stage.style.setProperty("--trpx", Math.round(stage.clientWidth * torch) + "px");
    if (window.ResizeObserver) new ResizeObserver(sizeTorch).observe(stage);
    const aim = (x, y) => {
      stage.style.setProperty("--tx", x + "%");
      stage.style.setProperty("--ty", y + "%");
    };
    const at = (e) => {
      const r = stage.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
    };

    function start() {
      order = shuffle(all).slice(0, ROUND);
      pos = 0;
      found = 0;
      wrong = 0;
      show();
    }
    function show() {
      const r = order[pos];
      done = false;
      torch = 0.2;
      sizeTorch();
      stage.classList.remove("is-lit");
      ring.hidden = true;
      $$(".fd-miss", stage).forEach((n) => n.remove());
      msg.textContent = "";
      msg.className = "msg";
      next.disabled = true;
      next.textContent = "Next photo";
      lights.disabled = false;
      countEl.textContent = "photo " + (pos + 1) + " of " + order.length;
      foundEl.textContent = String(found);
      img.onload = () => {
        stage.style.setProperty("--ar", (img.naturalWidth / img.naturalHeight).toFixed(4));
        sizeTorch();
      };
      img.src = r.src;
      aim(50, 50);
    }
    function reveal() {
      const r = order[pos];
      done = true;
      stage.classList.add("is-lit");
      ring.style.left = r.x + "%";
      ring.style.top = r.y + "%";
      ring.style.width = r.r * 2.7 + "%";
      ring.hidden = false;
      pop(ring);
      lights.disabled = true;
      next.disabled = false;
      if (pos === order.length - 1) next.textContent = "See how I did";
    }
    function guess(p) {
      const r = order[pos];
      const ar = stage.clientWidth / stage.clientHeight;
      const d = Math.hypot(p.x - r.x, (p.y - r.y) / ar);
      if (d <= r.r * 1.35 + 1.5) {
        found += 1;
        foundEl.textContent = String(found);
        reveal();
        msg.textContent = any(YES);
        msg.className = "msg good";
        return;
      }
      wrong += 1;
      const mark = el("span", "fd-miss", "x");
      mark.style.left = p.x + "%";
      mark.style.top = p.y + "%";
      stage.appendChild(mark);
      setTimeout(() => mark.remove(), 1400);
      msg.textContent = any(NOPE);
      msg.className = "msg bad";
      // after a couple of wrong taps the torch gets bigger
      if (wrong % 2 === 0 && torch < 0.34) {
        torch += 0.05;
        sizeTorch();
      }
    }

    let down = null;
    stage.addEventListener("pointerdown", (e) => {
      down = { x: e.clientX, y: e.clientY };
      const p = at(e);
      aim(p.x, p.y);
      if (e.pointerType !== "mouse") stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      const p = at(e);
      aim(Math.max(0, Math.min(100, p.x)), Math.max(0, Math.min(100, p.y)));
    });
    stage.addEventListener("pointerup", (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (done) return;
      // on a phone, a drag moves the torch and a tap is a guess
      if (e.pointerType !== "mouse" && moved > 14) return;
      guess(at(e));
    });
    stage.addEventListener("pointercancel", () => { down = null; });

    lights.addEventListener("click", () => {
      if (done) return;
      reveal();
      msg.textContent = "there you were, all along.";
      msg.className = "msg";
    });
    next.addEventListener("click", () => {
      if (pos < order.length - 1) {
        pos += 1;
        show();
        return;
      }
      if (next.textContent === "Play again") { start(); return; }
      // the end: how she did
      done = true;
      msg.textContent = "You found yourself in " + found + " of " + order.length + " photos" + (wrong ? ", with " + wrong + " wrong " + (wrong === 1 ? "tap." : "taps.") : ", and never tapped anyone else.");
      msg.className = "msg good";
      next.textContent = "Play again";
    });
    start();
  }

  /* ============================================================
     SPOT THE DIFFERENCE: five things changed in the second picture
     ============================================================ */
  function spotDiff() {
    const list = (D.spot || []).filter((x) => x.a && x.b && x.diffs);
    const pair = $("#sp-pair");
    if (!list.length || !pair) return;
    const imgA = $("#sp-a");
    const imgB = $("#sp-b");
    const marks = $$(".sp-marks", pair);
    const msg = $("#sp-msg");
    const next = $("#sp-next");
    const hint = $("#sp-hint");
    const countEl = $("#sp-count");
    const foundEl = $("#sp-found");
    const totalEl = $("#sp-total");
    let order = shuffle(list);
    let pos = 0;
    const got = new Set();

    function ringAt(i, cls) {
      const [x, y, r] = order[pos].diffs[i];
      return marks.map((svg) => {
        const e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        e.setAttribute("cx", x);
        e.setAttribute("cy", y * 1.25);
        e.setAttribute("rx", Math.max(3.2, r * 0.82));
        e.setAttribute("ry", Math.max(3.2, r * 0.82) * 0.9);
        e.setAttribute("transform", "rotate(" + (Math.random() * 30 - 15).toFixed(1) + " " + x + " " + y * 1.25 + ")");
        e.setAttribute("pathLength", "1");
        e.setAttribute("class", cls);
        svg.appendChild(e);
        return e;
      });
    }
    function show() {
      const r = order[pos];
      got.clear();
      marks.forEach((m) => m.replaceChildren());
      imgA.src = r.a;
      imgB.src = r.b;
      countEl.textContent = "picture " + (pos + 1) + " of " + order.length;
      foundEl.textContent = "0";
      totalEl.textContent = String(r.diffs.length);
      msg.textContent = "";
      msg.className = "msg";
      next.disabled = true;
      next.textContent = "Next picture";
      hint.disabled = false;
    }
    pair.addEventListener("click", (e) => {
      const pic = e.target.closest(".sp-pic");
      if (!pic) return;
      const r = order[pos];
      if (got.size === r.diffs.length) return;
      const b = pic.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width) * 100;
      const y = ((e.clientY - b.top) / b.height) * 100;
      const ar = b.width / b.height;
      let hit = -1;
      let near = Infinity;
      r.diffs.forEach(([dx, dy, rr], i) => {
        const d = Math.hypot(x - dx, (y - dy) / ar);
        if (d <= rr + 2 && d < near) { near = d; hit = i; }
      });
      if (hit >= 0 && got.has(hit)) return;
      if (hit >= 0) {
        got.add(hit);
        ringAt(hit, "is-found");
        foundEl.textContent = String(got.size);
        if (got.size === r.diffs.length) {
          msg.textContent = "all " + r.diffs.length + "! sharp eyes.";
          msg.className = "msg good";
          hint.disabled = true;
          next.disabled = false;
          next.textContent = pos === order.length - 1 ? "Play again" : "Next picture";
        } else {
          msg.textContent = ["one!", "yes, that's one.", "good eye.", "there's another."][got.size % 4];
          msg.className = "msg good";
        }
        return;
      }
      const m = el("span", "sp-miss", "x");
      m.style.left = x + "%";
      m.style.top = y + "%";
      pic.appendChild(m);
      setTimeout(() => m.remove(), 1200);
      msg.textContent = "not there.";
      msg.className = "msg bad";
    });
    hint.addEventListener("click", () => {
      const r = order[pos];
      const left = r.diffs.map((d, i) => i).filter((i) => !got.has(i));
      if (!left.length) return;
      const rings = ringAt(left[Math.floor(Math.random() * left.length)], "is-hint");
      setTimeout(() => rings.forEach((x) => x.remove()), 1700);
    });
    next.addEventListener("click", () => {
      if (pos < order.length - 1) pos += 1;
      else { order = shuffle(list); pos = 0; }
      show();
    });
    show();
  }

  /* ============================================================
     THE ODD ONE OUT: four everyday things, one doesn't belong
     ============================================================ */
  function oddOneOut() {
    const all = (D.oddOneOut || []).filter((x) => x.items && x.items.length >= 3);
    const grid = $("#odd-grid");
    if (!all.length || !grid) return;
    const why = $("#odd-why");
    const msg = $("#odd-msg");
    const next = $("#odd-next");
    const countEl = $("#odd-count");
    const scoreEl = $("#odd-score");
    const ROUND = Math.min(10, all.length);
    let order = [];
    let pos = 0;
    let score = 0;
    let first = true;
    let solved = false;

    function start() {
      order = shuffle(all).slice(0, ROUND);
      pos = 0;
      score = 0;
      show();
    }
    function show() {
      const r = order[pos];
      solved = false;
      first = true;
      grid.replaceChildren();
      shuffle(r.items.map((x, i) => i)).forEach((i, k) => {
        const b = el("button", "odd-chit");
        b.type = "button";
        b.style.setProperty("--tilt", ((k % 2 ? 1 : -1) * (0.8 + Math.random() * 2.4)).toFixed(1) + "deg");
        b.append(el("span", "odd-word", r.items[i]));
        b.addEventListener("click", () => pick(b, i));
        grid.appendChild(b);
      });
      why.textContent = "";
      msg.textContent = "";
      msg.className = "msg";
      countEl.textContent = (pos + 1) + " of " + order.length;
      scoreEl.textContent = String(score);
      next.disabled = true;
      next.textContent = pos === order.length - 1 ? "See how I did" : "Next four";
    }
    function pick(b, i) {
      if (solved || b.classList.contains("is-wrong")) return;
      const r = order[pos];
      if (i === r.odd) {
        solved = true;
        if (first) score += 1;
        scoreEl.textContent = String(score);
        b.classList.add("is-right");
        $$(".odd-chit", grid).forEach((x) => { if (x !== b) x.classList.add("is-dim"); });
        pop(b);
        why.textContent = r.why || "";
        msg.textContent = first ? ["yes!", "obviously.", "too easy for you.", "correct, as always."][Math.floor(Math.random() * 4)] : "got it.";
        msg.className = "msg good";
        next.disabled = false;
        return;
      }
      first = false;
      b.classList.add("is-wrong");
      nudge(b);
      msg.textContent = "that one belongs. try another.";
      msg.className = "msg bad";
    }
    next.addEventListener("click", () => {
      if (next.textContent === "Play again") { start(); return; }
      if (pos < order.length - 1) { pos += 1; show(); return; }
      grid.replaceChildren();
      why.textContent = "";
      msg.textContent = score + " of " + order.length + " on the first try." + (score >= order.length - 1 ? " nothing gets past you." : score >= order.length / 2 ? " not bad at all." : " the chai was a trick question.");
      msg.className = "msg good";
      next.textContent = "Play again";
    });
    start();
  }

  /* ============================================================
     SAVE THE CANDLES: guess the word; a wrong letter blows one out
     ============================================================ */
  function candles() {
    const words = (D.candleWords || []).filter((w) => w.word);
    const host = $("#cd-candles");
    if (!words.length || !host) return;
    const cake = $("#cd-cake");
    const wordEl = $("#cd-word");
    const hintEl = $("#cd-hint");
    const keysEl = $("#cd-keys");
    const msg = $("#cd-msg");
    const next = $("#cd-next");
    const countEl = $("#cd-count");
    const savedEl = $("#cd-saved");
    const N = 7;
    const sticks = [];
    for (let i = 0; i < N; i++) {
      const c = el("span", "cd-candle");
      c.style.setProperty("--i", String(i));
      c.append(el("i", "cd-flame"), el("i", "cd-smoke"));
      host.appendChild(c);
      sticks.push(c);
    }
    const keys = {};
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach((ch, k) => {
      if (k === 10 || k === 19) keysEl.appendChild(el("span", "cd-break"));
      const b = el("button", "cd-key", ch);
      b.type = "button";
      b.addEventListener("click", () => guess(ch));
      keysEl.appendChild(b);
      keys[ch] = b;
    });
    let order = shuffle(words);
    let pos = 0;
    let saved = 0;
    let lit = N;
    let over = false;
    let word = "";
    const tried = new Set();
    let slots = [];

    function show() {
      word = order[pos].word.toUpperCase();
      tried.clear();
      lit = N;
      over = false;
      sticks.forEach((c) => c.classList.remove("is-out"));
      cake.classList.remove("is-won", "is-lost");
      Object.values(keys).forEach((b) => { b.className = "cd-key"; b.disabled = false; });
      wordEl.replaceChildren();
      slots = [];
      word.split(" ").forEach((part) => {
        const g = el("span", "cd-group");
        part.split("").forEach((ch) => {
          const s = el("span", "cd-slot");
          s.dataset.ch = ch;
          g.appendChild(s);
          slots.push(s);
        });
        wordEl.appendChild(g);
      });
      hintEl.textContent = order[pos].hint || "";
      countEl.textContent = "word " + (pos + 1) + " of " + order.length;
      savedEl.textContent = String(saved);
      msg.textContent = "";
      msg.className = "msg";
      next.disabled = true;
    }
    function guess(ch) {
      if (over || tried.has(ch) || !keys[ch]) return;
      tried.add(ch);
      const b = keys[ch];
      b.disabled = true;
      const hits = slots.filter((s) => s.dataset.ch === ch);
      if (hits.length) {
        b.classList.add("is-in");
        hits.forEach((s) => { s.textContent = ch; s.classList.add("is-on"); pop(s); });
        if (slots.every((s) => s.textContent)) {
          over = true;
          saved += 1;
          savedEl.textContent = String(saved);
          cake.classList.add("is-won");
          msg.textContent = lit === N ? "not one candle lost. make a wish." : lit + (lit === 1 ? " candle" : " candles") + " still burning. make a wish.";
          msg.className = "msg good";
          next.disabled = false;
        }
        return;
      }
      b.classList.add("is-out");
      lit -= 1;
      const c = sticks[lit];
      c.classList.add("is-out");
      if (lit === 0) {
        over = true;
        cake.classList.add("is-lost");
        slots.forEach((s) => { if (!s.textContent) { s.textContent = s.dataset.ch; s.classList.add("is-missed"); } });
        msg.textContent = "all out! it was " + word.toLowerCase() + ". we'll relight them.";
        msg.className = "msg bad";
        next.disabled = false;
      }
    }
    next.addEventListener("click", () => {
      pos += 1;
      if (pos >= order.length) { order = shuffle(words); pos = 0; }
      show();
    });
    document.addEventListener("keydown", (e) => {
      if ($("#sheet").hidden || $("#game-candles").hidden || e.metaKey || e.ctrlKey || e.altKey) return;
      const ch = (e.key || "").toUpperCase();
      if (/^[A-Z]$/.test(ch)) guess(ch);
      else if (e.key === "Enter" && !next.disabled) next.click();
    });
    show();
  }

  /* ---------- the drawn toys on the table that show a photo ---------- */
  function toyPhotos() {
    const f = $("#toy-find-photo");
    const src = (D.findDidi || [])[0] && D.findDidi[0].src;
    if (f && src) f.style.backgroundImage = 'url("' + new URL(src, document.baseURI).href + '")';
    const s = (D.spot || [])[0];
    $$(".toy--spot .pola").forEach((p, i) => {
      if (s) p.style.backgroundImage = 'url("' + new URL(i ? s.b : s.a, document.baseURI).href + '")';
    });
  }

  /* ============================================================
     01. OUR TRIPS, THE QUIZ
     ============================================================ */
  function tripQuiz() {
    const list = D.quiz || [];
    if (!list.length || !$("#game-quiz")) return;
    const q = $("#quiz-q");
    const count = $("#quiz-count");
    const opts = $("#quiz-options");
    const msg = $("#quiz-msg");
    const next = $("#quiz-next");
    const stars = $("#quiz-stars");
    const card = $("#quiz-card");
    const reveal = $("#quiz-reveal");
    const photo = $("#quiz-photo");
    const note = $("#quiz-note");
    const cert = $("#quiz-cert");
    const LETTERS = ["A", "B", "C", "D", "E", "F"];

    let pos = 0;
    let points = 0;
    let firstTry = true;
    let answered = false;
    const slots = list.map(() => {
      const li = el("li", "qstar");
      stars.appendChild(li);
      return li;
    });

    function show() {
      const r = list[pos];
      cert.hidden = true;
      card.hidden = false;
      reveal.hidden = true;
      q.textContent = r.q;
      count.textContent = "question " + (pos + 1) + " of " + list.length;
      msg.textContent = "";
      msg.className = "msg";
      answered = false;
      firstTry = true;
      next.textContent = pos === list.length - 1 ? "See how I did" : "Next question";
      next.disabled = true;
      slots.forEach((s, i) => s.classList.toggle("is-now", i === pos));
      opts.replaceChildren();
      r.options.forEach((text, i) => {
        const b = el("button", "quiz-opt");
        b.type = "button";
        b.append(el("span", "quiz-letter", LETTERS[i]), el("span", "quiz-text", text));
        b.addEventListener("click", () => pick(b, i));
        opts.appendChild(b);
      });
      if (!reduce && card.animate) card.animate([{ opacity: 0, transform: "translateY(10px) rotate(-1deg)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "ease-out" });
    }

    async function pick(btn, i) {
      if (answered || btn.disabled) return;
      const r = list[pos];
      if (i !== r.a) {
        firstTry = false;
        btn.classList.add("is-wrong");
        btn.disabled = true;
        msg.textContent = "not that one. try again.";
        msg.className = "msg bad";
        nudge(btn);
        return;
      }
      answered = true;
      btn.classList.add("is-right");
      $$(".quiz-opt", opts).forEach((x) => (x.disabled = true));
      const slot = slots[pos];
      slot.classList.remove("is-now");
      if (firstTry) {
        points += 1;
        slot.classList.add("is-gold");
        slot.replaceChildren(sticker("star", "qstar-sticker"));
        pop(slot);
        msg.textContent = "yes! first try.";
      } else {
        slot.classList.add("is-tried");
        msg.textContent = "yes, that's the one.";
      }
      msg.className = "msg good";
      next.disabled = false;
      // the memory behind the answer: the trip's photo if it is in the journal, else a note
      note.textContent = r.note || "";
      photo.replaceChildren();
      reveal.hidden = !r.note;
      reveal.classList.remove("has-photo");
      const src = await photoFor(r.place);
      if (src && answered && list[pos] === r) {
        const img = el("img");
        img.src = src;
        img.alt = r.place || "";
        photo.appendChild(img);
        reveal.classList.add("has-photo");
        reveal.hidden = false;
      }
      if (!reveal.hidden && !reduce && reveal.animate) reveal.animate([{ opacity: 0, transform: "translateY(14px) rotate(2deg)" }, { opacity: 1, transform: "none" }], { duration: 480, easing: "ease-out" });
    }

    function finish() {
      card.hidden = true;
      reveal.hidden = true;
      msg.textContent = "";
      count.textContent = "the end";
      slots.forEach((s) => s.classList.remove("is-now"));
      const line =
        points === list.length ? "a perfect score. you were there for all of it."
          : points >= list.length - 2 ? "you remember nearly everything. of course you do."
          : points >= list.length / 2 ? "you remember most of it. nicely done."
          : "a few of these need new memories. let's go and make some.";
      $("#cert-score").textContent = points + " of " + list.length + ", first try";
      $("#cert-line").textContent = line;
      $("#cert-sign").textContent = (D.letter && D.letter.signature) || "";
      const certStars = $("#cert-stars");
      certStars.replaceChildren();
      for (let k = 0; k < points; k++) certStars.appendChild(sticker("star", "cert-star"));
      cert.hidden = false;
      pop(cert);
      next.textContent = "Play again";
      next.disabled = false;
      if (points > best.get("quiz")) best.set("quiz", points);
    }

    next.addEventListener("click", () => {
      if (!cert.hidden) {
        pos = 0;
        points = 0;
        slots.forEach((s) => { s.className = "qstar"; s.replaceChildren(); });
        show();
      } else if (pos === list.length - 1) {
        finish();
      } else {
        pos += 1;
        show();
      }
    });
    show();
  }

  /* ============================================================
     02. MEMORY: pairs of your own photos
     ============================================================ */
  async function memory() {
    const grid = $("#mem-grid");
    if (!grid) return;
    const movesEl = $("#mem-moves");
    const pairsEl = $("#mem-pairs");
    const totalEl = $("#mem-total");
    const bestEl = $("#mem-best");
    const msg = $("#mem-msg");

    // the photos that load; each shuffle deals a new eight of them (stickers fill any gap)
    const pool = D.memoryPhotos || [];
    const ok = await Promise.all(pool.map(loads));
    const good = pool.filter((src, i) => ok[i]);
    let faces = [];
    function deal() {
      const stickers = (D.memoryTiles || []).slice();
      faces = shuffle(good).slice(0, 8).map((src) => ({ src }));
      while (faces.length < 8 && stickers.length) faces.push({ sticker: stickers.shift() });
      totalEl.textContent = String(faces.length);
    }

    let open = null;
    let busy = false;
    let moves = 0;
    let matched = 0;
    let timer = 0;

    function showBest() {
      const b = best.get("memory");
      bestEl.textContent = b ? "your best: " + b + " moves" : "";
    }

    function build() {
      clearTimeout(timer);
      deal();
      grid.replaceChildren();
      open = null;
      busy = false;
      moves = 0;
      matched = 0;
      movesEl.textContent = "0";
      pairsEl.textContent = "0";
      msg.textContent = "";
      msg.className = "msg";
      grid.classList.remove("is-won");
      showBest();
      shuffle(faces.map((f, i) => i).concat(faces.map((f, i) => i))).forEach((k) => {
        const f = faces[k];
        const c = el("button", "mem-card");
        c.type = "button";
        c.dataset.k = String(k);
        c.setAttribute("aria-label", "a card, face down");
        const inner = el("span", "mem-inner");
        const back = el("span", "mem-face mem-back");
        const front = el("span", "mem-face mem-front");
        if (f.src) {
          const img = el("img");
          img.src = f.src;
          img.alt = "";
          img.draggable = false;
          front.appendChild(img);
        } else {
          front.appendChild(sticker(f.sticker, "mem-sticker"));
        }
        inner.append(back, front);
        c.appendChild(inner);
        c.addEventListener("click", () => flip(c));
        grid.appendChild(c);
      });
    }

    function flip(c) {
      if (busy || c.classList.contains("is-open") || c.classList.contains("is-matched")) return;
      c.classList.add("is-open");
      c.setAttribute("aria-label", "a card, face up");
      if (!open) { open = c; return; }
      const a = open;
      open = null;
      moves += 1;
      movesEl.textContent = String(moves);
      if (a.dataset.k === c.dataset.k) {
        [a, c].forEach((x) => {
          x.classList.add("is-matched");
          const s = sticker(x === a ? "heart" : "star", "mem-badge");
          x.appendChild(s);
          pop(s);
        });
        matched += 1;
        pairsEl.textContent = String(matched);
        if (matched === faces.length) {
          const b = best.get("memory");
          if (!b || moves < b) best.set("memory", moves);
          msg.textContent = "all the pairs, in " + moves + " moves." + (!b || moves < b ? " your best yet." : "");
          msg.className = "msg good";
          grid.classList.add("is-won");
          showBest();
        }
      } else {
        busy = true;
        timer = setTimeout(() => {
          a.classList.remove("is-open");
          c.classList.remove("is-open");
          busy = false;
        }, 900);
      }
    }

    $("#mem-reset").addEventListener("click", build);
    build();
  }

  /* ============================================================
     03. PUT OUR TRIPS IN ORDER: the train rides the route
     ============================================================ */
  const TRAIN =
    '<svg viewBox="0 0 70 44" aria-hidden="true">' +
    '<path d="M8 33V19h22v-9h9v9h12l7 9v5z" fill="#6b1d26"/>' +
    '<rect x="11" y="22" width="15" height="7" rx="1" fill="#f3e3bf"/>' +
    '<path d="M41 11h6v8h-6z" fill="#2b2320"/>' +
    '<path d="M4 33h56v3H4z" fill="#2b2320"/>' +
    '<g fill="#2b2320"><circle cx="16" cy="38" r="5"/><circle cx="31" cy="38" r="5"/><circle cx="48" cy="38" r="5"/></g>' +
    '<g fill="#c9a04f"><circle cx="16" cy="38" r="2"/><circle cx="31" cy="38" r="2"/><circle cx="48" cy="38" r="2"/></g>' +
    "</svg>";

  function tripOrder() {
    const trips = (D.tripOrder || []).map((t) => (typeof t === "string" ? { place: t, line: "" } : t));
    if (!trips.length || !$("#route")) return;
    const route = $("#route");
    const pool = $("#order-pool");
    const msg = $("#order-msg");
    const n = trips.length;
    const xAt = (i) => (n === 1 ? 50 : 6 + (i * 88) / (n - 1));

    // the line, the stations and the train
    route.replaceChildren(el("span", "route-line"));
    const stations = trips.map((t, i) => {
      const s = el("span", "station");
      s.style.left = xAt(i) + "%";
      s.append(el("span", "station-dot"), el("span", "station-name", "?"));
      route.appendChild(s);
      return s;
    });
    const train = el("span", "train");
    train.innerHTML = TRAIN;
    const puff = el("span", "puff");
    train.appendChild(puff);
    route.appendChild(train);

    let placed = 0;
    function moveTrain(i) {
      // before the first pick it waits at the first station
      train.style.left = xAt(Math.max(i, 0)) + "%";
      puff.classList.remove("is-on");
      void puff.offsetWidth;
      puff.classList.add("is-on");
    }

    function start() {
      placed = 0;
      msg.textContent = "Which trip came first?";
      msg.className = "msg";
      stations.forEach((s) => {
        s.classList.remove("is-reached");
        $(".station-name", s).textContent = "?";
      });
      moveTrain(-1);
      pool.replaceChildren();
      shuffle(trips.map((_, i) => i)).forEach((idx) => {
        const t = trips[idx];
        const b = el("button", "tticket");
        b.type = "button";
        b.append(el("span", "tticket-place", t.place), el("span", "tticket-line", t.line || ""));
        b.style.setProperty("--tilt", (Math.random() * 4 - 2).toFixed(1) + "deg");
        b.addEventListener("click", () => tap(b, idx));
        pool.appendChild(b);
      });
    }

    function tap(btn, idx) {
      if (idx !== placed) {
        msg.textContent = "not yet. think about when it happened.";
        msg.className = "msg bad";
        nudge(btn);
        return;
      }
      btn.classList.add("is-punched");
      btn.disabled = true;
      const s = stations[idx];
      $(".station-name", s).textContent = trips[idx].place;
      s.classList.add("is-reached");
      moveTrain(idx);
      placed += 1;
      setTimeout(() => btn.remove(), reduce ? 0 : 420);
      if (placed === n) {
        msg.textContent = "yes! that's our story, in order.";
        msg.className = "msg good";
        route.classList.add("is-done");
      } else {
        msg.textContent = "yes! all aboard. what came next?";
        msg.className = "msg good";
      }
    }

    $("#order-reset").addEventListener("click", () => { route.classList.remove("is-done"); start(); });
    start();
  }

  /* ============================================================
     04. THE HOUSE, IN PIECES: a sliding puzzle
     ============================================================ */
  function puzzle() {
    const board = $("#puzzle");
    if (!board) return;
    const movesEl = $("#puz-moves");
    const msg = $("#puz-msg");
    const peek = $("#puz-peek");
    const pics = (D.puzzlePictures && D.puzzlePictures.length ? D.puzzlePictures : [{ src: D.dreamHouse, name: "the dream house" }]);
    let N = 3;
    let picIndex = 0;
    let image = "";
    let tiles = []; // tiles[cell] = piece number, 0 is the gap
    let els = [];
    let moves = 0;
    let won = false;

    // a square crop of the picture, so the pieces are not stretched
    function squareOf(src) {
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => {
          try {
            const s = Math.min(img.naturalWidth, img.naturalHeight);
            const cv = document.createElement("canvas");
            cv.width = cv.height = Math.min(900, s);
            cv.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, cv.width, cv.height);
            res(cv.toDataURL("image/jpeg", 0.88));
          } catch (e) {
            res(new URL(src, document.baseURI).href); // opened from a file: the browser will not crop it, so use it as it is
          }
        };
        img.onerror = () => res(new URL(D.dreamHouse, document.baseURI).href);
        img.src = src;
      });
    }

    const solved = () => tiles.every((v, k) => v === (k === N * N - 1 ? 0 : k + 1));
    const nbrs = (k) => {
      const r = Math.floor(k / N);
      const c = k % N;
      const o = [];
      if (r > 0) o.push(k - N);
      if (r < N - 1) o.push(k + N);
      if (c > 0) o.push(k - 1);
      if (c < N - 1) o.push(k + 1);
      return o;
    };

    function layout() {
      els.forEach((t) => {
        const cell = tiles.indexOf(Number(t.dataset.v));
        t.style.transform = `translate(${(cell % N) * 100}%, ${Math.floor(cell / N) * 100}%)`;
      });
    }

    function render() {
      $$(".tile", board).forEach((t) => t.remove());
      board.style.setProperty("--n", N);
      board.style.setProperty("--img", `url("${image}")`);
      peek.style.backgroundImage = `url("${image}")`;
      els = [];
      for (let v = 1; v < N * N; v++) {
        const t = el("button", "tile");
        t.type = "button";
        t.dataset.v = String(v);
        const hr = Math.floor((v - 1) / N);
        const hc = (v - 1) % N;
        t.style.backgroundPosition = `${(hc * 100) / (N - 1)}% ${(hr * 100) / (N - 1)}%`;
        t.setAttribute("aria-label", "piece " + v);
        t.addEventListener("click", () => slideFrom(tiles.indexOf(v)));
        board.insertBefore(t, peek);
        els.push(t);
      }
      layout();
    }

    // tapping a piece in line with the gap slides it (and any between) into the gap
    function slideFrom(cell) {
      if (won) return;
      const gap = tiles.indexOf(0);
      const r = Math.floor(cell / N), c = cell % N, gr = Math.floor(gap / N), gc = gap % N;
      if (r !== gr && c !== gc) { nudge(els[tiles[cell] - 1]); return; }
      const step = r === gr ? (c < gc ? -1 : 1) : (r < gr ? -N : N);
      let g = gap;
      while (g !== cell) {
        const from = g + step;
        tiles[g] = tiles[from];
        tiles[from] = 0;
        g = from;
        moves += 1;
      }
      movesEl.textContent = String(moves);
      layout();
      if (solved()) win();
    }

    function win() {
      won = true;
      board.classList.add("is-won");
      const key = "puzzle" + N;
      const b = best.get(key);
      if (!b || moves < b) best.set(key, moves);
      msg.textContent = "the whole picture, back together, in " + moves + " moves." + (!b || moves < b ? " your best yet." : "");
      msg.className = "msg good";
    }

    function scramble() {
      tiles = [];
      for (let k = 0; k < N * N - 1; k++) tiles.push(k + 1);
      tiles.push(0);
      let gap = N * N - 1;
      let prev = -1;
      do {
        for (let k = 0; k < N * N * 40; k++) {
          const opts = nbrs(gap).filter((x) => x !== prev);
          const nx = opts[Math.floor(Math.random() * opts.length)];
          tiles[gap] = tiles[nx];
          tiles[nx] = 0;
          prev = gap;
          gap = nx;
        }
      } while (solved());
      moves = 0;
      won = false;
      board.classList.remove("is-won");
      movesEl.textContent = "0";
      const b = best.get("puzzle" + N);
      msg.textContent = b ? "your best at this size: " + b + " moves" : "";
      msg.className = "msg";
      render();
    }

    async function setPicture(i) {
      picIndex = i;
      $$(".puz-pic").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
      image = await squareOf(pics[i].src);
      scramble();
    }

    // the choices: the size, and the picture
    $$("#puz-size .seg").forEach((b) => {
      b.addEventListener("click", () => {
        N = Number(b.dataset.n);
        $$("#puz-size .seg").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        scramble();
      });
    });
    const picHost = $("#puz-pics");
    pics.forEach((p, i) => {
      const b = el("button", "puz-pic");
      b.type = "button";
      b.setAttribute("aria-label", "puzzle of " + p.name);
      b.title = p.name;
      b.style.backgroundImage = `url("${new URL(p.src, document.baseURI).href}")`;
      b.addEventListener("click", () => setPicture(i));
      picHost.appendChild(b);
    });

    // hold to peek at the whole picture
    const btn = $("#puz-peek-btn");
    const on = (e) => { e.preventDefault(); board.classList.add("is-peek"); };
    const off = () => board.classList.remove("is-peek");
    btn.addEventListener("pointerdown", on);
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => btn.addEventListener(t, off));
    btn.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") board.classList.add("is-peek"); });
    btn.addEventListener("keyup", off);

    // the arrow keys move a piece into the gap
    document.addEventListener("keydown", (e) => {
      if ($("#game-puzzle").hidden || won) return;
      const gap = tiles.indexOf(0);
      const r = Math.floor(gap / N), c = gap % N;
      const map = { ArrowUp: r < N - 1 ? gap + N : -1, ArrowDown: r > 0 ? gap - N : -1, ArrowLeft: c < N - 1 ? gap + 1 : -1, ArrowRight: c > 0 ? gap - 1 : -1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      if (map[e.key] >= 0) slideFrom(map[e.key]);
    });

    $("#puz-shuffle").addEventListener("click", scramble);
    setPicture(0);
  }

  /* ============================================================
     05. THE LITTLE CROSSWORD
     ============================================================ */
  // lays the words out on a grid, each new word crossing one already placed
  function layoutCrossword(entries, maxSide) {
    const words = entries
      .map((e, i) => ({ ...e, answer: (e.answer || "").toUpperCase().replace(/[^A-Z]/g, ""), i }))
      .filter((e) => e.answer.length > 1)
      .sort((a, b) => b.answer.length - a.answer.length);
    const cells = new Map(); // "x,y" -> { ch, a: across word, d: down word }
    const placed = [];
    const key = (x, y) => x + "," + y;
    const bounds = () => {
      let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
      cells.forEach((_, k) => {
        const [x, y] = k.split(",").map(Number);
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      });
      return { x0, y0, x1, y1 };
    };
    function fits(w, x, y, dir) {
      const dx = dir === "a" ? 1 : 0, dy = dir === "a" ? 0 : 1;
      if (cells.has(key(x - dx, y - dy)) || cells.has(key(x + dx * w.length, y + dy * w.length))) return -1;
      let cross = 0;
      for (let i = 0; i < w.length; i++) {
        const cx = x + dx * i, cy = y + dy * i;
        const c = cells.get(key(cx, cy));
        if (c) {
          if (c.ch !== w[i] || c[dir] != null) return -1;
          cross += 1;
        } else if (cells.has(key(cx + dy, cy + dx)) || cells.has(key(cx - dy, cy - dx))) {
          return -1;
        }
      }
      return cross;
    }
    function put(w, x, y, dir) {
      const dx = dir === "a" ? 1 : 0, dy = dir === "a" ? 0 : 1;
      const p = { ...w, x, y, dir };
      for (let i = 0; i < w.answer.length; i++) {
        const k = key(x + dx * i, y + dy * i);
        const c = cells.get(k) || { ch: w.answer[i] };
        c[dir] = placed.length;
        cells.set(k, c);
      }
      placed.push(p);
    }
    const left = [];
    words.forEach((w, n) => {
      if (n === 0) { put(w, 0, 0, "a"); return; }
      let bestPos = null;
      cells.forEach((c, k) => {
        const [cx, cy] = k.split(",").map(Number);
        for (let i = 0; i < w.answer.length; i++) {
          if (w.answer[i] !== c.ch) continue;
          ["a", "d"].forEach((dir) => {
            const x = dir === "a" ? cx - i : cx;
            const y = dir === "a" ? cy : cy - i;
            const cross = fits(w.answer, x, y, dir);
            if (cross < 1) return;
            const b = bounds();
            const nx0 = Math.min(b.x0, x), ny0 = Math.min(b.y0, y);
            const nx1 = Math.max(b.x1, x + (dir === "a" ? w.answer.length - 1 : 0));
            const ny1 = Math.max(b.y1, y + (dir === "d" ? w.answer.length - 1 : 0));
            const W = nx1 - nx0 + 1, H = ny1 - ny0 + 1;
            if (W > maxSide || H > maxSide) return;
            const score = cross * 100 - W * H - Math.abs(W - H) * 4;
            if (!bestPos || score > bestPos.score) bestPos = { x, y, dir, score };
          });
        }
      });
      if (bestPos) put(w, bestPos.x, bestPos.y, bestPos.dir);
      else left.push(w);
    });
    // a second pass for the words that did not fit the first time
    left.forEach((w) => {
      let bestPos = null;
      cells.forEach((c, k) => {
        const [cx, cy] = k.split(",").map(Number);
        for (let i = 0; i < w.answer.length; i++) {
          if (w.answer[i] !== c.ch) continue;
          ["a", "d"].forEach((dir) => {
            const x = dir === "a" ? cx - i : cx;
            const y = dir === "a" ? cy : cy - i;
            const cross = fits(w.answer, x, y, dir);
            if (cross >= 1 && (!bestPos || cross > bestPos.cross)) bestPos = { x, y, dir, cross };
          });
        }
      });
      if (bestPos) put(w, bestPos.x, bestPos.y, bestPos.dir);
    });
    const b = bounds();
    placed.forEach((p) => { p.x -= b.x0; p.y -= b.y0; });
    // number the squares that start a word, in reading order
    const starts = new Map();
    placed.slice().sort((p, q) => p.y - q.y || p.x - q.x).forEach((p) => {
      const k = key(p.x, p.y);
      if (!starts.has(k)) starts.set(k, starts.size + 1);
      p.num = starts.get(k);
    });
    return { words: placed, W: b.x1 - b.x0 + 1, H: b.y1 - b.y0 + 1 };
  }

  function crossword() {
    const gridEl = $("#cw-grid");
    if (!gridEl || !(D.crossword || []).length) return;
    const { words, W, H } = layoutCrossword(D.crossword, 12);
    const msg = $("#cw-msg");
    const currentEl = $("#cw-current");
    const STORE = "didi-cw-" + words.map((w) => w.answer).sort().join("").length;
    const cells = {}; // "x,y" -> { ch, input, box, words: [index] }
    gridEl.style.setProperty("--cw-w", W);
    gridEl.style.setProperty("--cw-h", H);

    words.forEach((w, wi) => {
      for (let i = 0; i < w.answer.length; i++) {
        const x = w.x + (w.dir === "a" ? i : 0);
        const y = w.y + (w.dir === "d" ? i : 0);
        const k = x + "," + y;
        if (!cells[k]) cells[k] = { ch: w.answer[i], x, y, words: [] };
        cells[k].words.push(wi);
      }
    });
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = cells[x + "," + y];
        if (!c) { gridEl.appendChild(el("span", "cw-empty")); continue; }
        const box = el("label", "cw-cell");
        const startNum = words.find((w) => w.x === x && w.y === y);
        if (startNum) box.appendChild(el("span", "cw-num", String(startNum.num)));
        const input = el("input");
        input.type = "text";
        input.autocomplete = "off";
        input.setAttribute("autocapitalize", "characters");
        input.setAttribute("autocorrect", "off");
        input.spellcheck = false;
        input.setAttribute("aria-label", "square");
        box.appendChild(input);
        gridEl.appendChild(box);
        c.input = input;
        c.box = box;
      }
    }

    // the clues
    const lists = { a: $("#cw-across"), d: $("#cw-down") };
    words.slice().sort((p, q) => p.num - q.num).forEach((w) => {
      const li = el("li", "cw-clue");
      li.append(el("b", null, String(w.num)), el("span", null, w.clue + " (" + w.answer.length + ")"));
      li.addEventListener("click", () => select(cellAt(w, 0), w.dir));
      lists[w.dir].appendChild(li);
      w.li = li;
    });

    const cellAt = (w, i) => cells[(w.x + (w.dir === "a" ? i : 0)) + "," + (w.y + (w.dir === "d" ? i : 0))];
    const cellsOf = (w) => Array.from({ length: w.answer.length }, (_, i) => cellAt(w, i));
    let active = null;
    let dir = "a";
    const wordOf = (c, d) => {
      const wi = c.words.find((i) => words[i].dir === d);
      return wi == null ? null : words[wi];
    };

    function select(c, d) {
      if (!c) return;
      if (!wordOf(c, d)) d = d === "a" ? "d" : "a";
      active = c;
      dir = d;
      Object.values(cells).forEach((x) => x.box.classList.remove("is-word", "is-active"));
      const w = wordOf(c, d);
      if (w) {
        cellsOf(w).forEach((x) => x.box.classList.add("is-word"));
        currentEl.textContent = w.num + (w.dir === "a" ? " across: " : " down: ") + w.clue;
        words.forEach((x) => x.li.classList.toggle("is-on", x === w));
      }
      c.box.classList.add("is-active");
      c.input.focus({ preventScroll: true });
    }

    function move(by) {
      const w = wordOf(active, dir);
      if (!w) return;
      const list = cellsOf(w);
      const i = list.indexOf(active) + by;
      if (i >= 0 && i < list.length) select(list[i], dir);
    }

    function check() {
      let all = true;
      words.forEach((w) => {
        const done = cellsOf(w).every((c) => c.input.value === c.ch);
        if (done && !w.li.classList.contains("is-done")) cellsOf(w).forEach((c) => pop(c.box));
        w.li.classList.toggle("is-done", done);
        cellsOf(w).forEach((c) => c.box.classList.toggle("is-done", c.words.some((wi) => cellsOf(words[wi]).every((x) => x.input.value === x.ch))));
        if (!done) all = false;
      });
      if (all) {
        msg.textContent = "every word, filled in. you're brilliant.";
        msg.className = "msg good";
      }
      try {
        const vals = {};
        Object.keys(cells).forEach((k) => { if (cells[k].input.value) vals[k] = cells[k].input.value; });
        localStorage.setItem(STORE, JSON.stringify(vals));
      } catch (e) { /* fine */ }
    }

    Object.values(cells).forEach((c) => {
      c.input.addEventListener("focus", () => { if (active !== c) select(c, wordOf(c, dir) ? dir : dir === "a" ? "d" : "a"); });
      c.input.addEventListener("mousedown", (e) => {
        if (active === c && c.words.length > 1) { e.preventDefault(); select(c, dir === "a" ? "d" : "a"); }
      });
      c.input.addEventListener("input", () => {
        let v = (c.input.value || "").toUpperCase().replace(/[^A-Z]/g, "");
        const old = c.old || "";
        // typing over a letter leaves both in the box: keep only the new one
        if (old && v.length > 1) {
          if (v.startsWith(old)) v = v.slice(old.length);
          else if (v.endsWith(old)) v = v.slice(0, -old.length);
        }
        c.box.classList.remove("is-wrong");
        if (!v) { c.input.value = ""; c.old = ""; check(); return; }
        // one key, or a whole word pasted in: lay the letters along the word
        const w = wordOf(c, dir);
        const list = w ? cellsOf(w) : [c];
        let i = list.indexOf(c);
        for (const ch of v) {
          if (i >= list.length) break;
          list[i].input.value = ch;
          list[i].old = ch;
          list[i].box.classList.remove("is-wrong");
          i += 1;
        }
        select(list[Math.min(i, list.length - 1)], dir);
        check();
      });
      c.input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !c.input.value) { e.preventDefault(); move(-1); if (active) { active.input.value = ""; active.old = ""; check(); } }
        else if (e.key === "ArrowRight") { e.preventDefault(); dir === "a" ? move(1) : select(cells[(c.x + 1) + "," + c.y], "a"); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); dir === "a" ? move(-1) : select(cells[(c.x - 1) + "," + c.y], "a"); }
        else if (e.key === "ArrowDown") { e.preventDefault(); dir === "d" ? move(1) : select(cells[c.x + "," + (c.y + 1)], "d"); }
        else if (e.key === "ArrowUp") { e.preventDefault(); dir === "d" ? move(-1) : select(cells[c.x + "," + (c.y - 1)], "d"); }
      });
    });

    $("#cw-hint").addEventListener("click", () => {
      const w = active ? wordOf(active, dir) : words[0];
      const c = cellsOf(w).find((x) => x.input.value !== x.ch);
      if (!c) return;
      c.input.value = c.ch;
      c.old = c.ch;
      c.box.classList.add("is-hinted");
      select(c, w.dir);
      check();
    });
    $("#cw-check").addEventListener("click", () => {
      let wrong = 0;
      Object.values(cells).forEach((c) => {
        const bad = c.input.value && c.input.value !== c.ch;
        c.box.classList.toggle("is-wrong", !!bad);
        if (bad) wrong += 1;
      });
      if (!msg.classList.contains("good") || wrong) {
        msg.textContent = wrong ? wrong + (wrong === 1 ? " square isn't" : " squares aren't") + " right yet." : "everything you've filled in is right.";
        msg.className = wrong ? "msg bad" : "msg good";
      }
    });
    $("#cw-reset").addEventListener("click", () => {
      Object.values(cells).forEach((c) => { c.input.value = ""; c.old = ""; c.box.classList.remove("is-wrong", "is-hinted"); });
      msg.textContent = "";
      msg.className = "msg";
      check();
      select(cellAt(words[0], 0), words[0].dir);
    });

    try {
      const vals = JSON.parse(localStorage.getItem(STORE) || "{}");
      Object.keys(vals).forEach((k) => { if (cells[k]) { cells[k].input.value = vals[k]; cells[k].old = vals[k]; } });
    } catch (e) { /* fine */ }
    check();
    // pick the first word without moving the focus while the game is closed
    active = cellAt(words[0], 0);
    dir = words[0].dir;
    document.addEventListener("didi:game", (e) => {
      if (e.detail === "game-cross" && window.matchMedia("(pointer: fine)").matches) select(active, dir);
    });
  }

  /* ============================================================
     06. UNTANGLE: letter tiles
     ============================================================ */
  function untangle() {
    const list = (D.untangle || []).filter((x) => x.word);
    if (!list.length || !$("#un-slots")) return;
    const slotsEl = $("#un-slots");
    const poolEl = $("#un-pool");
    const hint = $("#un-hint");
    const count = $("#un-count");
    const msg = $("#un-msg");
    const next = $("#un-next");
    let pos = 0;
    let score = 0;
    let solved = false;
    let shown = false;
    let slots = [];
    let tiles = [];

    function mix(word) {
      const letters = word.replace(/ /g, "").split("");
      let s;
      let guard = 0;
      do { s = shuffle(letters); guard++; } while (s.join("") === letters.join("") && guard < 20);
      return s;
    }

    function show() {
      const w = list[pos].word.toUpperCase();
      solved = false;
      shown = false;
      hint.textContent = list[pos].hint || "";
      count.textContent = "word " + (pos + 1) + " of " + list.length + "  ·  " + score + " untangled";
      msg.textContent = "";
      msg.className = "msg";
      next.disabled = true;
      next.textContent = pos === list.length - 1 ? "Finish" : "Next word";
      slotsEl.replaceChildren();
      slotsEl.classList.remove("is-right", "is-wrong");
      slots = [];
      w.split(" ").forEach((part, pi) => {
        const group = el("span", "un-word");
        part.split("").forEach((ch) => {
          const s = el("button", "un-slot");
          s.type = "button";
          s.dataset.ch = ch;
          s.setAttribute("aria-label", "empty square");
          s.addEventListener("click", () => back(s));
          group.appendChild(s);
          slots.push(s);
        });
        slotsEl.appendChild(group);
      });
      poolEl.replaceChildren();
      tiles = mix(w).map((ch) => {
        const t = el("button", "ltile ltile--big", ch);
        t.type = "button";
        t.style.setProperty("--tilt", (Math.random() * 8 - 4).toFixed(1) + "deg");
        t.addEventListener("click", () => place(t));
        poolEl.appendChild(t);
        return t;
      });
    }

    function place(t) {
      if (solved || t.classList.contains("is-used")) return;
      const s = slots.find((x) => !x.dataset.tile);
      if (!s) return;
      s.textContent = t.textContent;
      s.dataset.tile = String(tiles.indexOf(t));
      s.classList.add("is-filled");
      s.setAttribute("aria-label", t.textContent);
      t.classList.add("is-used");
      pop(s);
      if (slots.every((x) => x.dataset.tile)) judge();
    }

    function back(s) {
      if (solved || !s.dataset.tile) return;
      tiles[Number(s.dataset.tile)].classList.remove("is-used");
      delete s.dataset.tile;
      s.textContent = "";
      s.classList.remove("is-filled");
      s.setAttribute("aria-label", "empty square");
      slotsEl.classList.remove("is-wrong");
      msg.textContent = "";
    }

    function judge() {
      const right = slots.every((s) => s.textContent === s.dataset.ch);
      if (right) {
        solved = true;
        if (!shown) score += 1;
        slotsEl.classList.add("is-right");
        msg.textContent = shown ? "there it is." : "yes! " + list[pos].word.toLowerCase() + ".";
        msg.className = "msg good";
        next.disabled = false;
        count.textContent = "word " + (pos + 1) + " of " + list.length + "  ·  " + score + " untangled";
      } else {
        slotsEl.classList.add("is-wrong");
        nudge(slotsEl);
        msg.textContent = "not quite. tap a letter to send it back.";
        msg.className = "msg bad";
      }
    }

    function reveal() {
      if (solved) return;
      shown = true;
      slots.forEach((s) => back(s));
      slots.forEach((s) => {
        const t = tiles.find((x) => !x.classList.contains("is-used") && x.textContent === s.dataset.ch);
        if (t) place(t);
      });
    }

    function finish() {
      slotsEl.replaceChildren();
      poolEl.replaceChildren();
      hint.textContent = "";
      count.textContent = "the end";
      msg.textContent = "you untangled " + score + " of " + list.length + "." + (score === list.length ? " every single one." : "");
      msg.className = "msg good";
      next.textContent = "Play again";
      next.disabled = false;
      pos = -1;
      if (score > best.get("untangle")) best.set("untangle", score);
    }

    next.addEventListener("click", () => {
      if (pos === -1) { pos = 0; score = 0; show(); return; }
      if (pos === list.length - 1) { finish(); return; }
      pos += 1;
      show();
    });
    $("#un-shuffle").addEventListener("click", () => {
      if (solved || pos < 0) return;
      slots.forEach((s) => back(s));
      const order = shuffle(tiles);
      order.forEach((t) => poolEl.appendChild(t));
    });
    $("#un-skip").addEventListener("click", reveal);
    // on a keyboard, typing a letter picks that tile
    document.addEventListener("keydown", (e) => {
      if ($("#game-words").hidden || e.metaKey || e.ctrlKey) return;
      if (e.key === "Backspace") {
        const last = slots.slice().reverse().find((s) => s.dataset.tile);
        if (last) back(last);
        return;
      }
      const ch = (e.key || "").toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return;
      const t = tiles.find((x) => !x.classList.contains("is-used") && x.textContent === ch);
      if (t) place(t);
    });
    show();
  }

  /* ---------- the little drawn crossword on the table ---------- */
  function toyCrossword() {
    const host = $("#toy-cross");
    if (!host) return;
    const black = [3, 6, 8, 12, 16, 18, 21];
    const letters = { 0: "N", 1: "O", 2: "N", 5: "A", 10: "N", 11: "A", 15: "I" };
    for (let i = 0; i < 25; i++) {
      const c = el("span", black.includes(i) ? "is-black" : "", letters[i] || "");
      host.appendChild(c);
    }
  }

  /* ============================================================
     THE TREASURE HUNT: a riddle at a time; each answer turns up a
     photo, and the last one opens the chest
     ============================================================ */
  function hunt() {
    const H = D.hunt || {};
    const all = (H.riddles || []).filter((r) => r.riddle && r.answer);
    const play = $("#hu-play");
    if (!all.length || !play) return;
    const trail = $("#hu-trail");
    const countEl = $("#hu-count");
    const foundEl = $("#hu-found");
    const numEl = $("#hu-num");
    const riddleEl = $("#hu-riddle");
    const blanks = $("#hu-blanks");
    const hintText = $("#hu-hint-text");
    const clue = $("#hu-clue");
    const foundCard = $("#hu-found-card");
    const photo = $("#hu-photo");
    const foundLine = $("#hu-found-line");
    const form = $("#hu-form");
    const input = $("#hu-input");
    const msg = $("#hu-msg");
    const hintBtn = $("#hu-hint");
    const next = $("#hu-next");
    const end = $("#hu-end");
    const KEY = "didi-hunt-v1";

    // spaces, capitals, punctuation and a "the" or "a" in front don't matter
    const norm = (s) => String(s || "").toLowerCase().replace(/^\s*(the|a|an|my)\s+/, "").replace(/[^a-z]/g, "");
    // one letter off still counts on longer words
    function close(a, b) {
      if (a === b) return true;
      if (b.length >= 5 && a.length <= b.length + 8 && a.includes(b)) return true; // "pinky promise"
      if (b.length < 6 || Math.abs(a.length - b.length) > 1) return false;
      const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
      for (let j = 1; j <= b.length; j++) d[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
      }
      return d[a.length][b.length] <= 1;
    }
    const answers = (r) => [r.answer].concat(r.also || []).map(norm).filter(Boolean);

    let pos = 0;
    let hints = 0;
    let solved = false;
    try { pos = Math.min(all.length, Number(localStorage.getItem(KEY)) || 0); } catch (e) { pos = 0; }
    const remember = () => { try { localStorage.setItem(KEY, String(pos)); } catch (e) { /* fine */ } };

    function drawTrail() {
      trail.replaceChildren();
      all.forEach((r, i) => {
        const li = el("li", "hu-step" + (i < pos ? " is-done" : i === pos ? " is-here" : ""));
        li.setAttribute("aria-label", i < pos ? "clue " + (i + 1) + ", solved" : "clue " + (i + 1));
        trail.appendChild(li);
      });
      const x = el("li", "hu-step hu-step--x" + (pos >= all.length ? " is-done" : ""));
      x.setAttribute("aria-label", "the treasure");
      trail.appendChild(x);
      foundEl.textContent = String(Math.min(pos, all.length));
    }
    function drawBlanks(r, shown) {
      blanks.replaceChildren();
      const word = r.answer.toUpperCase();
      let letter = 0;
      word.split(" ").forEach((w) => {
        const g = el("span", "hu-word");
        for (const ch of w) {
          const isLetter = /[A-Z]/.test(ch);
          g.appendChild(el("span", "hu-slot", isLetter && letter < shown ? ch : isLetter ? "" : ch));
          if (isLetter) letter += 1;
        }
        blanks.appendChild(g);
      });
    }
    function show() {
      if (pos >= all.length) { finish(); return; }
      const r = all[pos];
      solved = false;
      hints = 0;
      play.hidden = false;
      end.hidden = true;
      clue.hidden = false;
      foundCard.hidden = true;
      form.hidden = false;
      numEl.textContent = "clue " + (pos + 1);
      riddleEl.textContent = r.riddle;
      hintText.textContent = "";
      drawBlanks(r, 0);
      input.value = "";
      input.disabled = false;
      msg.textContent = "";
      msg.className = "msg";
      hintBtn.disabled = false;
      hintBtn.textContent = "A hint, please";
      next.disabled = true;
      next.textContent = pos === all.length - 1 ? "Open the treasure" : "Next clue";
      countEl.textContent = (pos + 1) + " of " + all.length;
      drawTrail();
    }
    function solve(gaveUp) {
      const r = all[pos];
      const n = pos + 1;
      solved = true;
      input.disabled = true;
      hintBtn.disabled = true;
      form.hidden = true;
      drawBlanks(r, 99);
      msg.textContent = gaveUp ? "it was " + r.answer + ". you'd have got it." : ["yes!", "you got it.", "of course you did.", "too easy for you."][Math.floor(Math.random() * 4)];
      msg.className = "msg good";
      const reveal = () => {
        clue.hidden = true;
        foundCard.hidden = false;
        foundLine.textContent = r.found || "";
        pop(foundCard);
      };
      if (r.photo) {
        loads(r.photo).then((ok) => {
          if (ok) { photo.src = r.photo; photo.alt = "A photo, found with clue " + n; setTimeout(reveal, reduce ? 0 : 650); }
        });
      }
      pos += 1;
      remember();
      drawTrail();
      next.disabled = false;
      next.focus({ preventScroll: true });
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (solved) return;
      const r = all[pos];
      const said = norm(input.value);
      if (!said) { nudge(input); return; }
      if (answers(r).some((a) => close(said, a))) { solve(false); return; }
      nudge(form);
      msg.textContent = ["not quite. read it once more.", "close your eyes and think.", "no, but you're on the trail.", "try another word."][Math.floor(Math.random() * 4)];
      msg.className = "msg bad";
      input.select();
    });
    hintBtn.addEventListener("click", () => {
      if (solved) return;
      const r = all[pos];
      hints += 1;
      if (hints === 1) {
        hintText.textContent = r.hint || "Look at how many letters it has.";
        hintBtn.textContent = "Another hint";
      } else if (hints === 2) {
        drawBlanks(r, 1);
        hintText.textContent = (r.hint ? r.hint + " " : "") + "It starts with " + r.answer.charAt(0).toUpperCase() + ".";
        hintBtn.textContent = "Just tell me";
      } else {
        solve(true);
      }
      input.focus({ preventScroll: true });
    });
    next.addEventListener("click", show);

    function finish() {
      const T = H.treasure || {};
      play.hidden = true;
      end.hidden = false;
      $("#hu-t-title").textContent = T.title || "You found the treasure";
      $("#hu-t-note").textContent = T.note || "";
      const fan = $("#hu-fan");
      fan.replaceChildren();
      const pics = all.map((r) => r.photo).filter(Boolean);
      pics.forEach((src, i) => {
        const im = el("img", "hu-fan-pic");
        im.alt = "";
        im.draggable = false;
        im.style.setProperty("--i", String(i - (pics.length - 1) / 2));
        im.onerror = () => im.remove();
        im.src = src;
        fan.appendChild(im);
      });
      countEl.textContent = all.length + " of " + all.length;
      drawTrail();
      end.classList.remove("is-open");
      requestAnimationFrame(() => requestAnimationFrame(() => end.classList.add("is-open")));
    }
    $("#hu-again").addEventListener("click", () => { pos = 0; remember(); show(); });
    document.addEventListener("didi:game", (e) => {
      if (e.detail === "game-hunt" && pos >= all.length) finish();
    });
    show();
  }

  function init() {
    hunt();
    findDidi();
    spotDiff();
    memory();
    puzzle();
    oddOneOut();
    candles();
    toyPhotos();
    // put away for now: each of these does nothing while its pieces are off the table
    tripQuiz();
    tripOrder();
    crossword();
    untangle();
    toyCrossword();
  }

  (window.DIDI_READY || Promise.resolve()).then(init);
})();
