/* ============================================================
   rooms.js: the house as a 3D space.

   Scrolling is not the only way to move here. The page is one
   house, so each room comes toward you in depth as you reach it,
   the front door walks you in from the cover, and inside each room
   the pieces sit at different depths: when the pointer moves, the
   near pieces slide more than the far ones, and the cards tilt
   toward the pointer. The hallway's frames turn as you pass them,
   the way walls turn past you in a corridor.

   Runs after app.js. Every effect is off for reduced motion, and the
   pointer effects are off on touch screens (they have no pointer).
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // each room, and how far it sits back in depth before you reach it
  // how far each room starts back in depth. Rooms come straight on: no tilt, no curve.
  const ROOMS = {
    welcome: { z: -520 },   // the front door: you walk in from the cover
    reel: { z: -260 },
    vanity: { z: -260 },
    record: { z: -260 },
    book: { z: -700, s: 0.6 },   // the photo library: you walk in from the hallway
    library: { z: -260 },
    studio: { z: -260 },
    rooftop: { z: -320 },
    cake: { z: -260 },
  };

  // pieces that sit at a depth in their room (depth 1 is the nearest; the pointer moves them most)
  const FLOATERS = [
    ["#welcome .welcome-head", 0.5],
    ["#welcome .letter", 1.1],
    ["#reel .disc-wrap", 1.0],
    ["#reel .slide-card", 0.7],
    ["#vanity .vanity-copy", 0.5],
    ["#vanity .sconces", 0.4],
    ["#record .kraft-note", 1.6],
    ["#record .tracks", 0.4],
    ["#studio .slip", 1.0],
    ["#rooftop .rooftop-head", 0.5],
    ["#rooftop .wish-card", 1.4],
    ["#cake .cake-copy", 0.5],
    ["#cake .cake-svg", 1.2],
  ];

  // cards that lean toward the pointer, by how far (degrees)
  const TILTS = [
    ["#welcome .letter", 4],
    ["#reel .slide-card", 5],
    ["#vanity .mirror", 6],
    ["#record .vinyl", 5],
    ["#book .bk", 2.5],
    ["#library .game", 4],
    ["#rooftop .wish-card", 4],
    ["#cake .cake-svg", 3],
  ];

  window.DIDI_READY.then(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (reduce || !gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. walking in. Each room has its own perspective (set on the room, not on <main>),
    //    so a room that is far back does not drift toward the middle of the whole page. Each room comes forward out of depth as its top reaches the
    //    bottom of the screen, and settles flat by the time it is in view.
    // Each room is one timeline across its scroll: it comes forward out of depth as it enters, and
    // sinks back into depth as it leaves, so you pass through the house rather than past a page.
    Object.keys(ROOMS).forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const cfg = ROOMS[id];
      gsap.set(sec, { transformPerspective: 1600 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true },
      });
      // the timeline runs from the room's top reaching the bottom of the screen to its bottom
      // leaving the top. The entry and the exit each take about 60% of the screen's height.
      const span = sec.offsetHeight + window.innerHeight;
      const e = Math.min(0.5, (window.innerHeight * 0.6) / span);
      // the room comes forward straight on: a little smaller and faded at first, then whole
      tl.fromTo(
        sec,
        { z: cfg.z, scale: cfg.s || 0.94, opacity: 0.35 },
        { z: 0, scale: 1, opacity: 1, duration: e, ease: "none" },
        0
      );
      // and it eases back as it leaves, still straight on
      tl.to(
        sec,
        { z: cfg.z * 0.5, scale: 0.97, opacity: 0.4, duration: e, ease: "none" },
        1 - e
      );
    });

    // the invitation's cover: as you pass through its door, the cover moves toward you and falls away
    const coverBox = document.querySelector(".cover-sticky");
    if (coverBox) {
      gsap.to(coverBox, {
        z: 320,
        scale: 1.08,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: "#cover", start: "bottom 85%", end: "bottom 30%", scrub: true },
      });
    }

    // 2. depth inside each room. Near pieces are pushed toward you; far ones sit back.
    const floaters = [];
    if (fine) {
      FLOATERS.forEach(([sel, depth]) => {
        document.querySelectorAll(sel).forEach((el) => {
          gsap.set(el, { z: depth * 36, transformPerspective: 1400 });
          floaters.push({
            depth,
            x: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
          });
        });
      });
      window.addEventListener(
        "pointermove",
        (e) => {
          const mx = e.clientX / window.innerWidth - 0.5;
          const my = e.clientY / window.innerHeight - 0.5;
          floaters.forEach((f) => {
            f.x(-mx * f.depth * 24);
            f.y(-my * f.depth * 18);
          });
        },
        { passive: true }
      );
    }

    // 3. cards lean toward the pointer
    if (fine) {
      TILTS.forEach(([sel, max]) => {
        document.querySelectorAll(sel).forEach((el) => {
          gsap.set(el, { transformPerspective: 1200, transformOrigin: "50% 50%" });
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3.out" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3.out" });
          el.addEventListener("pointermove", (e) => {
            const b = el.getBoundingClientRect();
            const px = (e.clientX - b.left) / b.width - 0.5;
            const py = (e.clientY - b.top) / b.height - 0.5;
            ry(px * max * 2);
            rx(-py * max * 2);
          });
          el.addEventListener("pointerleave", () => {
            rx(0);
            ry(0);
          });
        });
      });
    }

    // 4. the wall: the frames are placed at random across the wall, not in rows or columns. Each frame takes
    //    one of the shapes, and sits where it fits best among the frames already placed, so there are no big
    //    empty gaps. The layout is seeded, so it looks the same on every visit.
    const hallTrack = document.getElementById("hall-track");
    const hallPin = document.getElementById("hall-pin");
    const hallFrames = hallTrack ? Array.from(hallTrack.querySelectorAll(".frame")) : [];
    const HALL_SHAPES = [
      { cls: "s-rect", size: 1.0, fixed: 0.8 },     // cream and gold rectangle
      { cls: "s-oval", size: 1.1, fixed: 0.8 },     // gilt oval
      { cls: "s-blue", size: 1.05, fixed: 0.8 },    // blue and gold rectangle
      { cls: "s-circle", size: 1.0, fixed: 1 },     // gilt round
      { cls: "s-gold", size: 1.05, fixed: 1 },      // gold square
      { cls: "s-arch", size: 1.1, fixed: 0.8 },     // gilt arch
      { cls: "s-square", size: 1.1, fixed: 0.914 }, // the vanity's gilt frame
      { cls: "s-rect", size: 0.95, fixed: 0.8 },
      { cls: "s-circle", size: 0.9, fixed: 1 },
      { cls: "s-blue", size: 1.0, fixed: 0.8 },
    ];
    hallFrames.forEach((f, i) => {
      const sh = HALL_SHAPES[(i * 3 + 3) % HALL_SHAPES.length];
      f.classList.add(sh.cls);
      f.style.setProperty("--hs", sh.size);
      f.style.setProperty("--fixed-ar", sh.fixed);
    });
    let hallSeed = 20260514;
    const hallRand = () => {
      hallSeed = (hallSeed * 16807) % 2147483647;
      return hallSeed / 2147483647;
    };
    function placeWall() {
      if (!hallTrack || !hallPin) return;
      const H = hallPin.clientHeight;
      hallSeed = 20260514;
      const placed = [];
      let cursor = 40;
      hallFrames.forEach((f) => {
        const w = f.offsetWidth;
        const h = f.offsetHeight;
        cursor += w * (0.3 + hallRand() * 0.35);
        let bestY = 0;
        let bestScore = -Infinity;
        for (let c = 0; c < 14; c++) {
          const y = hallRand() * Math.max(0, H - h);
          let score = Infinity;
          for (const p of placed) {
            const dx = Math.abs(cursor + w / 2 - (p.x + p.w / 2)) - (w / 2 + p.w / 2);
            const dy = Math.abs(y + h / 2 - (p.y + p.h / 2)) - (h / 2 + p.h / 2);
            score = Math.min(score, Math.max(dx, dy));
          }
          if (score > bestScore) {
            bestScore = score;
            bestY = y;
          }
        }
        placed.push({ x: cursor, y: bestY, w, h });
        f.style.left = cursor + "px";
        f.style.top = bestY + "px";
      });
      hallTrack.style.width = Math.ceil(cursor + 260) + "px";
    }
    placeWall();

    // the media's own shape is not used: each frame keeps its true proportions and the photo or video fills it
    window.addEventListener("resize", () => {
      placeWall();
      ScrollTrigger.refresh();
    });
  });
})();
