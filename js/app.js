/* ============================================================
   app.js: fills the page from content.js, runs the loading gate,
   the vanity mirror, the memory book, the candle, the decor, and the
   scroll choreography (GSAP + ScrollTrigger). The page still works if
   GSAP fails to load: only the motion is lost.
   ============================================================ */
(function () {
  "use strict";

  const D = window.DIDI || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const pad = (n) => String(n).padStart(2, "0");
  const art = window.DIDI_ART;

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node && value != null) node.textContent = value;
  }

  /* ---------- media: one helper for photos and videos ---------- */
  const VIDEO_RE = /\.(mp4|webm|m4v|mov)(\?.*)?$/i;
  const isVideo = (src) => VIDEO_RE.test(src || "");

  function mediaEl(src, alt) {
    if (isVideo(src)) {
      const v = document.createElement("video");
      v.className = "media";
      v.src = src;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("aria-label", alt || "");
      return v;
    }
    const img = document.createElement("img");
    img.className = "media";
    img.src = src;
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  // Videos play only while they're on screen, to keep the page light.
  let videoWatch = null;
  function watchVideos(root) {
    const videos = $$("video", root);
    if (!videos.length) return;
    const play = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (!("IntersectionObserver" in window)) {
      videos.forEach(play);
      return;
    }
    if (!videoWatch) {
      videoWatch = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) play(e.target);
          else e.target.pause();
        });
      }, { threshold: 0.2 });
    }
    videos.forEach((v) => videoWatch.observe(v));
  }

  // Stand-in for an empty slot: a sticker and a small label on paper.
  function doodle(stickerName, label) {
    const d = document.createElement("span");
    d.className = "doodle";
    d.appendChild(art.sticker(stickerName));
    const l = document.createElement("span");
    l.className = "doodle-label";
    l.textContent = label;
    d.appendChild(l);
    return d;
  }

  // Drawn decor (plants, lamps, lights, vases) goes into any [data-decor] slot.
  function fillDecor() {
    $$("[data-decor]").forEach((el) => el.appendChild(art.decor(el.dataset.decor)));
  }

  /* ---------- 1. put the words and media on the page ---------- */
  function fillContent() {
    const invite = $(".invite");
    if (invite) invite.textContent = D.hero.kicker;
    setText("hero-name", D.hero.name);
    setText("hero-sub", D.hero.sub);
    setText("arc-label", D.hero.arc);
    setText("stamp-big", D.hero.stamp.big);
    setText("stamp-small", D.hero.stamp.small);

    document.getElementById("deco-a").appendChild(art.sticker("sparkle"));
    document.getElementById("deco-b").appendChild(art.sticker("star"));

    const house = document.getElementById("dream-house-img");
    house.src = D.dreamHouse;
    house.alt = D.dreamHouseAlt || "";

    setText("letter-greeting", D.letter.greeting);
    const body = document.getElementById("letter-body");
    D.letter.paragraphs.forEach((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      body.appendChild(p);
    });
    setText("letter-sign", D.letter.signature);
    setText("exit-sign", D.letter.signature);

    // hallway film strip
    const track = document.getElementById("hall-track");
    D.photos.forEach((p, i) => {
      const frame = document.createElement("figure");
      frame.className = "frame";

      const no = document.createElement("span");
      no.className = "frame-no";
      no.textContent = "frame " + pad(i + 1);

      const photo = document.createElement("div");
      photo.className = "photo";
      photo.appendChild(p.src ? mediaEl(p.src, p.caption) : doodle("flower", "photo " + pad(i + 1)));

      const cap = document.createElement("figcaption");
      cap.textContent = p.caption || "";
      frame.append(no, photo, cap);
      track.appendChild(frame);
    });

    // a few of the names, as small tags on strings
    const names = document.getElementById("names");
    (D.names || []).forEach((n, i) => {
      const wrap = document.createElement("div");
      wrap.className = "tag-wrap";
      wrap.dataset.r = String((i % 2 ? 1 : -1) * (2 + (i % 3) * 1.6));

      const tag = document.createElement("div");
      tag.className = "tag";
      const name = document.createElement("span");
      name.className = "tag-name";
      name.textContent = n.name;
      tag.appendChild(name);
      wrap.appendChild(tag);
      names.appendChild(wrap);
    });
  }

  /* ---------- 2. the loading gate: select all squares with birthday girl ---------- */
  function shake(node) {
    if (reduce || !node.animate) return;
    node.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 320 }
    );
  }

  function setupGate(onOpen) {
    const gate = document.getElementById("gate");
    const G = D.gate;

    if (!gate || !G || !G.tiles || !G.tiles.length) {
      if (gate) gate.remove();
      onOpen();
      return;
    }

    document.documentElement.classList.add("is-gated");
    setText("gate-title", G.prompt);
    setText("gate-hint", G.hint);

    const grid = document.getElementById("gate-grid");
    const msg = document.getElementById("gate-msg");
    const card = document.getElementById("gate-card");
    grid.style.gridTemplateColumns = "repeat(" + Math.round(Math.sqrt(G.tiles.length)) + ", 1fr)";

    const correct = G.tiles.reduce((acc, t, i) => (t.correct ? acc.concat(i) : acc), []);

    const picks = G.tiles.map((t, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pick";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "square " + (i + 1));

      const m = document.createElement("span");
      m.className = "pick-media";
      m.appendChild(t.src ? mediaEl(t.src, "") : art.sticker(t.sticker || "star"));
      b.appendChild(m);

      b.addEventListener("click", () => {
        const on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", String(on));
        b.classList.toggle("is-on", on);
        msg.textContent = "";
        msg.className = "gate-msg";
      });
      grid.appendChild(b);
      return b;
    });

    let done = false;
    const open = () => {
      if (done) return;
      done = true;
      gate.classList.add("is-open");
      document.documentElement.classList.remove("is-gated");
      setTimeout(() => { gate.style.display = "none"; }, 900);
      if (hasGSAP) window.ScrollTrigger.refresh();
      onOpen();
    };

    document.getElementById("gate-verify").addEventListener("click", () => {
      const picked = picks.reduce((acc, b, i) => (b.getAttribute("aria-pressed") === "true" ? acc.concat(i) : acc), []);
      const exact = picked.length === correct.length && picked.every((i) => correct.includes(i));
      if (exact) {
        msg.textContent = "verified. happy birthday, birthday girl.";
        msg.className = "gate-msg good";
        setTimeout(open, 700);
      } else {
        msg.textContent = picked.length ? "not quite. look again." : "pick the squares, or click skip.";
        msg.className = "gate-msg bad";
        shake(card);
      }
    });
    document.getElementById("gate-skip").addEventListener("click", open);

    // a short loading stage, then the card
    setTimeout(() => gate.classList.add("is-ready"), 1600);
  }

  /* ---------- 3. the reel: a viewmaster disc of slides ---------- */
  function reel() {
    const R = D.reel;
    if (!R) return;
    setText("reel-label", R.label);
    setText("reel-title", R.title);
    setText("reel-notes", R.notes);

    // notches cut into the rim
    const disc = document.getElementById("disc");
    for (let k = 0; k < 12; k++) {
      const n = document.createElement("span");
      n.className = "notch";
      n.style.setProperty("--a", k * 30 + "deg");
      disc.appendChild(n);
    }

    const ring = document.getElementById("disc-ring");
    const slides = R.slots || [];
    const n = slides.length || 1;
    const no = document.getElementById("slide-no");
    const caption = document.getElementById("slide-caption");

    const buttons = slides.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.style.setProperty("--a", (i * 360 / n).toFixed(2) + "deg");
      b.setAttribute("aria-label", "slide " + (i + 1) + " of " + n);
      const m = document.createElement("span");
      m.className = "slot-media";
      m.appendChild(s.src ? mediaEl(s.src, s.caption) : doodle("flower", pad(i + 1)));
      b.appendChild(m);
      b.addEventListener("click", () => select(i));
      ring.appendChild(b);
      return b;
    });

    function select(i) {
      buttons.forEach((b, k) => b.classList.toggle("is-on", k === i));
      no.textContent = "slide " + pad(i + 1) + " of " + pad(n);
      caption.textContent = slides[i].caption || "";
    }
    if (buttons.length) select(0);
  }

  /* ---------- 4. the living room: songs on a record ---------- */
  function record() {
    const Rc = D.record;
    if (!Rc) return;
    setText("record-label", Rc.label);
    setText("record-title", Rc.title);
    setText("vinyl-title", Rc.title);
    setText("kraft-note", Rc.note);

    const label = document.getElementById("vinyl-label");
    label.appendChild(Rc.centerSrc ? mediaEl(Rc.centerSrc, "") : doodle("star", "side a"));

    const list = document.getElementById("tracks");
    (Rc.tracks || []).forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      list.appendChild(li);
    });

    // stickers sit on the lower rim, clear of the title arc at the top
    const stick = document.getElementById("stickers");
    const items = Rc.stickers || [];
    items.forEach((name, i) => {
      const s = art.sticker(name);
      const t = items.length > 1 ? i / (items.length - 1) : 0;
      const a = (70 + t * 220) * (Math.PI / 180); // from 70deg to 290deg, clockwise from top
      const r = 42; // percent of the stage
      s.style.left = (50 + r * Math.sin(a)).toFixed(2) + "%";
      s.style.top = (50 - r * Math.cos(a)).toFixed(2) + "%";
      s.style.setProperty("--rot", ((i % 2 ? 1 : -1) * (8 + ((i * 7) % 14))) + "deg");
      stick.appendChild(s);
    });
  }

  /* ---------- 5. the vanity mirror: one kind thing per tap ---------- */
  function setupMirror() {
    const mirror = document.getElementById("mirror");
    const text = document.getElementById("mirror-text");
    const count = document.getElementById("mirror-count");
    const list = (D.affirmations || []).filter(Boolean);
    if (!list.length) return;

    // the glass: the kind things run up through it again and again.
    // Two identical halves, so the loop joins up without a gap.
    const run = document.getElementById("mirror-run");
    if (run) {
      const half = () => {
        const h = document.createElement("span");
        h.className = "run-half";
        for (let k = 0; k < 3; k++) {
          const g = document.createElement("span");
          g.className = "run-group";
          list.forEach((s) => {
            const line = document.createElement("span");
            line.className = "run-line";
            line.textContent = s;
            g.appendChild(line);
          });
          h.appendChild(g);
        }
        return h;
      };
      run.append(half(), half());
      run.style.setProperty("--run", Math.max(14, list.length * 6) + "s");
    }

    // the bulbs sit above the frame in the page; only the words change here

    let idx = -1;
    let taps = 0;
    mirror.addEventListener("click", () => {
      idx = (idx + 1) % list.length;
      taps += 1;
      text.textContent = list[idx];
      count.textContent = "kind thing " + taps;
      if (hasGSAP && !reduce) {
        window.gsap.fromTo(text, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      }
    });
  }

  /* ---------- 7. the cake: blow out the candle ---------- */
  function setupCake() {
    const stage = document.getElementById("cake-stage");
    const cakeEl = art.cake();
    stage.appendChild(cakeEl);
    const flameHit = cakeEl.querySelector(".candle-hit");
    const msg = document.getElementById("cake-msg");
    const micBtn = document.getElementById("cake-mic");
    const tapBtn = document.getElementById("cake-tap");
    const wish = document.getElementById("cake-wish");
    setText("cake-wish-text", D.cake.wish);

    let blown = false;
    let pending = false;
    let stream = null;
    let audioCtx = null;
    let rafId = 0;

    function stopMic() {
      cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx && audioCtx.close) audioCtx.close();
      stream = null;
      audioCtx = null;
    }

    function blowOut(how) {
      if (blown) return;
      blown = true;
      stopMic();
      cakeEl.classList.add("is-blown");
      micBtn.disabled = true;
      tapBtn.disabled = true;
      msg.textContent = how === "mic" ? "you blew it out. make a wish." : "the candle's out. make a wish.";
      wish.classList.add("is-on");
      if (hasGSAP && !reduce) {
        window.gsap.fromTo(wish, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: "power2.out" });
      }
    }

    // listens for a sustained loud breath; nothing is recorded or sent anywhere
    function listen() {
      if (blown || stream || pending) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = "this browser can't listen. tap the candle instead.";
        return;
      }
      pending = true;
      msg.textContent = "listening. nothing is recorded; the mic only listens for a blow.";
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((s) => {
          pending = false;
          if (blown) { s.getTracks().forEach((t) => t.stop()); return; }
          stream = s;
          micBtn.textContent = "listening";
          const Ctx = window.AudioContext || window.webkitAudioContext;
          audioCtx = new Ctx();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);
          const buf = new Uint8Array(analyser.fftSize);
          const THRESH = 0.22;
          let since = 0;
          const loop = (t) => {
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
              const v = (buf[i] - 128) / 128;
              sum += v * v;
            }
            const level = Math.sqrt(sum / buf.length);
            if (level > THRESH) {
              if (!since) since = t;
              if (t - since > 300) { blowOut("mic"); return; }
            } else {
              since = 0;
            }
            rafId = requestAnimationFrame(loop);
          };
          rafId = requestAnimationFrame(loop);
        })
        .catch(() => {
          pending = false;
          msg.textContent = "the mic was blocked. tap the candle instead.";
        });
    }

    micBtn.addEventListener("click", listen);
    tapBtn.addEventListener("click", () => blowOut("tap"));
    if (flameHit) flameHit.addEventListener("click", () => blowOut("tap"));
  }

  /* ---------- 8. the rooftop wishes ---------- */
  const WISH_SPOTS = [
    [14, 24], [32, 14], [52, 32], [72, 16],
    [87, 34], [24, 56], [56, 60], [78, 66],
  ];

  function buildWishStars() {
    const sky = document.getElementById("sky");
    const card = document.getElementById("wish-card");
    const text = document.getElementById("wish-text");
    const wishes = (D.wishes || []).slice(0, WISH_SPOTS.length);

    const stars = wishes.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "wish-star";
      b.style.left = WISH_SPOTS[i][0] + "%";
      b.style.top = WISH_SPOTS[i][1] + "%";
      b.setAttribute("aria-label", "wish " + (i + 1) + " of " + wishes.length);
      b.appendChild(art.sticker("sparkle"));
      b.addEventListener("click", () => showWish(i));
      sky.insertBefore(b, card);
      return b;
    });

    function showWish(i) {
      stars.forEach((s, k) => s.classList.toggle("is-on", k === i));
      text.textContent = wishes[i];
      card.classList.remove("pop");
      void card.offsetWidth; // restart the pop animation
      card.classList.add("pop");
    }
  }

  /* ---------- 9. the invitation's intro, played once the gate opens ---------- */
  function introCover() {
    if (!hasGSAP || reduce) return;
    window.gsap.from(".invite, .arch-stack, .hero-sub, .details", {
      y: 26,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.14,
    });
  }

  /* ---------- 10. scroll choreography ---------- */
  function animate() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // A pin adds spacing below itself, so it must be created before the
    // other triggers, or they measure the page before the space exists.
    if (!reduce) {
      const track = document.getElementById("hall-track");
      const pin = document.getElementById("hall-pin");
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }

    // progress bar across the top
    gsap.to("#progress-bar", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });

    if (!reduce) {
      // invitation: the arch grows toward you and the words fall away.
      // The door of the painted house is the origin, so the zoom goes through the door.
      gsap.set(".dream-house", { transformOrigin: "50% 62%" });
      gsap
        .timeline({ scrollTrigger: { trigger: "#cover", start: "top top", end: "bottom bottom", scrub: 0.6 } })
        .to(".dream-house", { scale: 6.5, ease: "none", duration: 0.6 }, 0.3)
        .to(".invite, .hero-name, .hero-sub, .details", { opacity: 0, duration: 0.3, ease: "none" }, 0)
        .to(".cover-deco, .stamp", { opacity: 0, duration: 0.3, ease: "none" }, 0);

      // the doorway opens: the open door is revealed from the door itself as you reach the cover
      gsap.to(".dream-house-open", {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: { trigger: "#cover", start: "top top", end: () => "+=" + Math.round(window.innerHeight * 0.45), scrub: true },
      });

      // every room opens like an iris as it comes into view
      gsap.utils.toArray("[data-reveal]").forEach((sec) => {
        gsap.fromTo(
          sec,
          { clipPath: "inset(40vh 22vw 0vh 22vw round 30vw 30vw 0vw 0vw)" },
          {
            clipPath: "inset(0vh 0vw 0vh 0vw round 0vw 0vw 0vw 0vw)",
            ease: "none",
            scrollTrigger: { trigger: sec, start: "top bottom", end: "top 30%", scrub: true },
          }
        );
      });

      // entrance: the lights twinkle in, then the letter settles
      gsap.from(".welcome .letter", {
        y: 40,
        opacity: 0,
        rotation: -3,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".entry-grid", start: "top 80%", once: true },
      });

      // reel: the disc arrives, then turns as you scroll past it
      gsap.from(".disc-wrap", {
        scale: 0.8,
        opacity: 0,
        duration: 1.1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: "#reel", start: "top 75%", once: true },
      });
      gsap.to("#disc-ring", {
        rotation: 200,
        ease: "none",
        scrollTrigger: { trigger: "#reel", start: "top bottom", end: "bottom top", scrub: true },
      });

      // vanity: the bulbs of the mirror light up in turn
      gsap.from(".sconces span", {
        opacity: 0,
        scale: 0.2,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.05,
        scrollTrigger: { trigger: "#mirror", start: "top 80%", once: true },
      });

      // living room: the record spins with the scroll, the stickers stay put
      gsap.to("#vinyl", {
        rotation: 540,
        ease: "none",
        scrollTrigger: { trigger: "#record", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from(".stickers .sticker", {
        scale: 0,
        duration: 0.6,
        ease: "back.out(2)",
        stagger: 0.08,
        scrollTrigger: { trigger: "#record", start: "top 70%", once: true },
      });
      gsap.from(".kraft-note", {
        rotation: -18,
        opacity: 0,
        duration: 0.9,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: "#record", start: "top 60%", once: true },
      });
      gsap.from(".tag-wrap", {
        opacity: 0,
        y: -30,
        duration: 0.9,
        ease: "back.out(1.4)",
        stagger: 0.12,
        scrollTrigger: { trigger: ".names-strip", start: "top 85%", once: true },
      });

      // book: the cover lifts in
      gsap.from(".book", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "#book", start: "top 70%", once: true },
      });

      // library: cards rise in
      gsap.from(".game", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: ".games", start: "top 85%", once: true },
      });

      // studio: the slip and the pad arrive together
      gsap.from(".studio .slip, .studio .toolbar, #pad", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".studio-head", start: "top 85%", once: true },
      });

      // rooftop: the sparkles pop in
      gsap.from(".wish-star .sticker", {
        scale: 0,
        duration: 0.8,
        ease: "back.out(2)",
        stagger: 0.12,
        scrollTrigger: { trigger: "#sky", start: "top 80%", once: true },
      });

      // cake: the candle lights up as you arrive
      gsap.from("#cake .cake-svg", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "#cake", start: "top 70%", once: true },
      });

      // exit: the door swings open, the room lights up, and she walks in.
      // The section pins while you scroll; the words come back once you are inside.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: "#exit", start: "top top", end: "+=130%", pin: true, scrub: 0.8, anticipatePin: 1 },
        })
        .to("#exit-copy", { opacity: 0, y: -24, duration: 0.25 }, 0)
        .to("#door-leaf", { rotationY: 80, duration: 1, ease: "power1.inOut" }, 0.1)
        .to("#door-art", { scale: 2.6, duration: 0.9, ease: "power2.in" }, 0.25)
        .to("#exit-glow", { opacity: 1, duration: 0.6 }, 0.5)
        .to("#exit-copy", { opacity: 1, y: 0, duration: 0.4 }, 1.25);
    }

    // depth: the pieces nearer the window move faster than the walls
    const DEPTH = {
      "dec--plant-hall": 0.22,
      "dec--lamp": 0.3,
      "dec--plant-living": 0.18,
      "dec--lights-hall": 0.08,
      "dec--lights-sky": 0.08,
      "dec--fern-l": 0.2,
      "dec--fern-r": 0.2,
      "dec--lantern-l": 0.28,
      "dec--lantern-r": 0.28,
      "dec--vase": 0.2,
      "dec--mirror-vase": 0.2,
    };
    if (!reduce) {
      $$(".dec").forEach((el) => {
        const key = Object.keys(DEPTH).find((k) => el.classList.contains(k));
        if (!key) return;
        gsap.to(el, {
          y: -DEPTH[key] * 180,
          ease: "none",
          scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }

    // where you are: a small label that changes as you walk through the rooms
    const where = document.getElementById("where");
    const ROOMS = {
      cover: "outside, by the house",
      welcome: "the front door",
      hallway: "the hallway",
      reel: "the reel",
      vanity: "the vanity",
      record: "the living room",
      book: "the journal",
      library: "the library",
      studio: "the studio",
      rooftop: "the rooftop",
      cake: "the cake",
      exit: "the door",
    };
    Object.keys(ROOMS).forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec || !where) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) where.querySelector("span").textContent = ROOMS[id];
        },
      });
    });

    // highlight the room you're in (created last so it measures the final layout)
    $$(".rooms a").forEach((a) => {
      const sec = document.getElementById(a.getAttribute("href").slice(1));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => a.classList.toggle("active", self.isActive),
      });
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  function init() {
    fillContent();
    fillDecor();
    reel();
    record();
    setupMirror();
    setupJournal();
    setupCake();
    buildWishStars();
    watchVideos(document);

    if (reduce) {
      document.getElementById("hall-pin").classList.add("no-pin");
    }

    document.getElementById("replay").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

    if (hasGSAP) {
      animate();
    } else {
      console.warn("GSAP did not load. The page still works without the scroll effects.");
      document.getElementById("hall-pin").classList.add("no-pin");
    }

    // the gate opens onto a ready page, then the invitation's intro plays
    setupGate(introCover);
  }

  window.DIDI_READY.then(init);
})();
