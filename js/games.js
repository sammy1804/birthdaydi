/* ============================================================
   games.js: the library games and the studio doodle pad.
   No timers, no accounts. Everything runs in the page.
   ============================================================ */
(function () {
  "use strict";

  const D = window.DIDI || {};
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // forgiving comparison: ignores case, punctuation and a leading "a/an/the"
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/[’'".,!?-]/g, "")
      .replace(/^(a|an|the)\s+/, "")
      .replace(/\s+/g, " ")
      .trim();

  const nudge = (node) => {
    if (reduce || !node || !node.animate) return;
    node.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 260 }
    );
  };

  /* ---------- 01. trip quiz: four answers, and a memory after each one ---------- */
  function tripQuiz() {
    const list = D.quiz || [];
    if (!list.length) return;

    const q = $("#quiz-q");
    const count = $("#quiz-count");
    const score = $("#quiz-score");
    const opts = $("#quiz-options");
    const msg = $("#quiz-msg");
    const next = $("#quiz-next");

    let pos = 0;
    let points = 0; // a question counts only if it is right on the first try
    let answered = false;
    let firstTry = true;
    let ended = false;

    function show() {
      const r = list[pos];
      q.textContent = r.q;
      count.textContent = "question " + (pos + 1) + " of " + list.length;
      score.textContent = String(points);
      msg.textContent = "";
      msg.className = "msg";
      answered = false;
      firstTry = true;
      next.textContent = pos === list.length - 1 ? "See my score" : "Next question";
      next.disabled = true;
      opts.innerHTML = "";
      r.options.forEach((text, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quiz-opt";
        b.textContent = text;
        b.addEventListener("click", () => pick(b, i));
        opts.appendChild(b);
      });
    }

    function pick(btn, i) {
      if (answered || btn.disabled) return;
      const r = list[pos];
      if (i === r.a) {
        answered = true;
        btn.classList.add("is-right");
        Array.from(opts.children).forEach((x) => (x.disabled = true));
        if (firstTry) points += 1;
        score.textContent = String(points);
        msg.textContent = "yes! " + r.note;
        msg.className = "msg good";
        next.disabled = false;
      } else {
        firstTry = false;
        btn.classList.add("is-wrong");
        btn.disabled = true;
        msg.textContent = "not that one. try another.";
        msg.className = "msg bad";
        nudge(btn);
      }
    }

    function finish() {
      ended = true;
      opts.innerHTML = "";
      q.textContent = "You got " + points + " of " + list.length + " on the first try.";
      count.textContent = "the end";
      score.textContent = String(points);
      msg.className = "msg good";
      msg.textContent =
        points === list.length
          ? "a perfect score. you were there for all of it."
          : points >= list.length / 2
          ? "you remember most of it. nicely done."
          : "a few of these need new memories. let's make some.";
      next.textContent = "Play again";
      next.disabled = false;
    }

    next.addEventListener("click", () => {
      if (ended) {
        ended = false;
        pos = 0;
        points = 0;
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

  /* ---------- 02. memory: find the pairs ---------- */
  function memory() {
    const tiles = D.memoryTiles || [];
    if (!tiles.length) return;

    const grid = $("#mem-grid");
    const movesEl = $("#mem-moves");
    const pairsEl = $("#mem-pairs");
    const totalEl = $("#mem-total");
    const msg = $("#mem-msg");
    const resetBtn = $("#mem-reset");

    totalEl.textContent = String(tiles.length);

    let openCard = null;
    let busy = false;
    let moves = 0;
    let matched = 0;
    let timer = null;

    function build() {
      clearTimeout(timer);
      grid.innerHTML = "";
      openCard = null;
      busy = false;
      moves = 0;
      matched = 0;
      movesEl.textContent = "0";
      pairsEl.textContent = "0";
      msg.textContent = "";
      msg.className = "msg";

      shuffle(tiles.concat(tiles)).forEach((symbol) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "mem-card";
        card.dataset.symbol = symbol;
        card.setAttribute("aria-label", "hidden card");

        const inner = document.createElement("span");
        inner.className = "mem-inner";

        const back = document.createElement("span");
        back.className = "mem-face mem-back";
        back.setAttribute("aria-hidden", "true");
        // the back is pattern only, styled in CSS

        const front = document.createElement("span");
        front.className = "mem-face mem-front";
        front.setAttribute("aria-hidden", "true");
        front.appendChild(window.DIDI_ART.sticker(symbol, "mem-sticker"));

        inner.append(back, front);
        card.appendChild(inner);
        card.addEventListener("click", () => flip(card));
        grid.appendChild(card);
      });
    }

    function flip(card) {
      if (busy) return;
      if (card.classList.contains("is-open") || card.classList.contains("is-matched")) return;

      card.classList.add("is-open");
      if (!openCard) {
        openCard = card;
        return;
      }

      const first = openCard;
      openCard = null;
      moves += 1;
      movesEl.textContent = String(moves);

      if (first.dataset.symbol === card.dataset.symbol) {
        first.classList.add("is-matched");
        card.classList.add("is-matched");
        matched += 1;
        pairsEl.textContent = String(matched);
        if (matched === tiles.length) {
          msg.textContent = "all the pairs! brilliant.";
          msg.className = "msg good";
        }
      } else {
        busy = true;
        timer = setTimeout(() => {
          first.classList.remove("is-open");
          card.classList.remove("is-open");
          busy = false;
        }, 850);
      }
    }

    resetBtn.addEventListener("click", build);
    build();
  }

  /* ---------- 03. put our trips in order: tap from the first to the latest ---------- */
  function tripOrder() {
    const steps = D.tripOrder || [];
    if (!steps.length) return;

    const pool = $("#order-pool");
    const done = $("#order-done");
    const msg = $("#order-msg");
    const reset = $("#order-reset");

    let placed = 0;

    function start() {
      placed = 0;
      done.innerHTML = "";
      pool.innerHTML = "";
      msg.textContent = "";
      msg.className = "msg";
      shuffle(steps.map((_, i) => i)).forEach((idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = steps[idx];
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
      const li = document.createElement("li");
      li.textContent = steps[idx];
      done.appendChild(li);
      btn.remove();
      placed += 1;
      msg.className = "msg good";
      msg.textContent =
        placed === steps.length ? "yes! that's our story, in order." : "yes! what came next?";
    }

    reset.addEventListener("click", start);
    start();
  }

  /* ---------- 04. the house, in pieces: sliding puzzle ---------- */
  function puzzle() {
    const board = $("#puzzle");
    if (!board) return;
    const movesEl = $("#puz-moves");
    const msg = $("#puz-msg");
    const shuffleBtn = $("#puz-shuffle");

    // absolute URL: a relative url() inside a custom property resolves from the stylesheet, not the page
    const houseSrc = new URL(D.dreamHouse, document.baseURI).href;
    board.style.setProperty("--img", 'url("' + houseSrc + '")');

    const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 is the empty square
    let tiles = SOLVED.slice();
    let moves = 0;
    let won = false;

    const neighbors = (idx) => {
      const r = Math.floor(idx / 3);
      const c = idx % 3;
      const out = [];
      if (r > 0) out.push(idx - 3);
      if (r < 2) out.push(idx + 3);
      if (c > 0) out.push(idx - 1);
      if (c < 2) out.push(idx + 1);
      return out;
    };

    const isSolved = () => tiles.every((v, k) => v === SOLVED[k]);

    // walk backwards from the solved board, so every shuffle is solvable
    function scramble() {
      do {
        tiles = SOLVED.slice();
        let blank = 8;
        let prev = -1;
        for (let k = 0; k < 200; k++) {
          const options = neighbors(blank).filter((n) => n !== prev);
          const n = options[Math.floor(Math.random() * options.length)];
          tiles[blank] = tiles[n];
          tiles[n] = 0;
          prev = blank;
          blank = n;
        }
      } while (isSolved());
      moves = 0;
      won = false;
      movesEl.textContent = "0";
      msg.textContent = "";
      msg.className = "msg";
      render();
    }

    function render() {
      board.innerHTML = "";
      tiles.forEach((v, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        if (v === 0) {
          b.className = "tile blank";
          b.disabled = true;
          b.tabIndex = -1;
        } else {
          b.className = "tile";
          const home = v - 1;
          const r = Math.floor(home / 3);
          const c = home % 3;
          b.style.backgroundPosition = c * 50 + "% " + r * 50 + "%";
          b.setAttribute("aria-label", "piece " + v);
          b.addEventListener("click", () => slide(idx));
        }
        board.appendChild(b);
      });
    }

    function slide(idx) {
      if (won) return;
      const empty = tiles.indexOf(0);
      if (!neighbors(idx).includes(empty)) {
        nudge(board.children[idx]);
        return;
      }
      tiles[empty] = tiles[idx];
      tiles[idx] = 0;
      moves += 1;
      movesEl.textContent = String(moves);
      render();
      if (isSolved()) {
        won = true;
        msg.textContent = "the whole house, back together.";
        msg.className = "msg good";
      }
    }

    shuffleBtn.addEventListener("click", scramble);
    scramble();
  }

  /* ---------- studio: doodle pad ---------- */
  function doodle() {
    const cv = $("#pad");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = 1200;
    const H = 900;
    cv.width = W;
    cv.height = H;

    const PAPER = "#fffaf1";
    const colors = [
      { c: "#241a33", name: "ink" },
      { c: "#e0557a", name: "rose" },
      { c: "#f0b429", name: "marigold" },
      { c: "#4f8fd6", name: "sky blue" },
      { c: "#5a9e6f", name: "sage" },
      { c: "#8a3b8f", name: "plum" },
    ];
    const sizes = [8, 18, 36];

    let color = colors[0].c;
    let size = sizes[1];

    const paper = () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
    };
    paper();

    const swatchHost = $("#swatches");
    const swatchBtns = colors.map((item, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "swatch";
      b.style.background = item.c;
      b.setAttribute("aria-label", item.name);
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => {
        color = item.c;
        swatchBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      swatchHost.appendChild(b);
      return b;
    });

    const sizeHost = $("#sizes");
    const sizeBtns = sizes.map((px, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "size-dot";
      const dot = document.createElement("span");
      dot.style.width = dot.style.height = 6 + i * 6 + "px";
      b.appendChild(dot);
      b.setAttribute("aria-label", "brush size " + (i + 1));
      b.setAttribute("aria-pressed", String(px === size));
      b.addEventListener("click", () => {
        size = px;
        sizeBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      sizeHost.appendChild(b);
      return b;
    });

    let drawing = false;
    let last = null;

    const toCanvas = (e) => {
      const r = cv.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (W / r.width),
        y: (e.clientY - r.top) * (H / r.height),
      };
    };

    cv.addEventListener("pointerdown", (e) => {
      drawing = true;
      cv.setPointerCapture(e.pointerId);
      last = toCanvas(e);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(last.x, last.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    cv.addEventListener("pointermove", (e) => {
      if (!drawing) return;
      const p = toCanvas(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    });

    const stop = () => {
      drawing = false;
      last = null;
    };
    cv.addEventListener("pointerup", stop);
    cv.addEventListener("pointercancel", stop);

    $("#pad-clear").addEventListener("click", paper);

    $("#pad-save").addEventListener("click", () => {
      const a = document.createElement("a");
      a.download = "didi-doodle.png";
      a.href = cv.toDataURL("image/png");
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  /* ---------- studio: creative prompts ---------- */
  function prompts() {
    const list = D.prompts || [];
    if (!list.length) return;
    const out = $("#prompt-text");
    let last = -1;

    function next() {
      let n;
      do {
        n = Math.floor(Math.random() * list.length);
      } while (n === last && list.length > 1);
      last = n;
      out.textContent = list[n];
    }

    $("#prompt-next").addEventListener("click", next);
    next();
  }

  function init() {
    tripQuiz();
    tripOrder();
    memory();
    puzzle();
    doodle();
    prompts();
  }

  // wait for the asset check, so stickers and textures are ready
  window.DIDI_READY.then(init);
})();
