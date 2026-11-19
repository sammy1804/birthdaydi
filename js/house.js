/* ============================================================
   house.js: the walk through the house.

   The page is one fixed stage. Scrolling does not move a page: it
   plays one long timeline (GSAP + ScrollTrigger) that walks you from
   room to room. You come up to the house and its front door swings
   open; you walk in; the hallway wall slides past; doors open onto
   the next room; you step through the mirror and through the reel's
   viewer; you climb to the rooftop. Between rooms the walk finishes
   itself, so you always come to rest in a room, never half-way
   through a doorway.

   This file also fills the rooms from content.js and runs the gate,
   the mirror, the record, the reel, the game table, the wishes and
   the candle. The journal is in journal.js, the games in games.js.

   For checking a room directly: add ?gate=0&room=vanity to the address.
   ============================================================ */
(function () {
  "use strict";

  const D = window.DIDI || {};
  const art = window.DIDI_ART;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasGSAP = !!(gsap && ScrollTrigger);
  const pad = (n) => String(n).padStart(2, "0");
  const root = document.documentElement;
  const house = document.getElementById("house");
  const walk = document.getElementById("walk");
  const params = new URLSearchParams(window.location.search);

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function setText(id, value) {
    const node = document.getElementById(id);
    if (node && value != null) node.textContent = value;
  }

  // Unfinished lines never show: anything still in [brackets], and any caption that still
  // says "add the story" or "add a memory", is left off the site until it is replaced.
  const unfinished = (s) => !s || /\[[^\]]*\]/.test(s) || /\badd (the story|a memory)\b/i.test(s);
  const real = (s) => (unfinished(s) ? "" : s);

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
      v.preload = "metadata";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      if (alt) v.setAttribute("aria-label", alt);
      return v;
    }
    const img = document.createElement("img");
    img.className = "media";
    img.loading = "lazy"; // the hallway wall's far frames wait until they are about to come into view
    img.decoding = "async";
    img.src = src;
    img.alt = alt || "";
    img.draggable = false;
    return img;
  }

  // Videos play only while they are on screen, in the room you are in.
  let videoWatch = null;
  function watchVideos() {
    const videos = $$("video", house);
    if (!videos.length || !("IntersectionObserver" in window)) return;
    videoWatch = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.dataset.inview = e.isIntersecting ? "1" : "";
        });
        syncVideos();
      },
      { threshold: 0.15 }
    );
    videos.forEach((v) => videoWatch.observe(v));
  }
  function syncVideos() {
    $$("video", house).forEach((v) => {
      const scene = v.closest(".scene");
      // a video the watcher never saw (the journal draws its clips page by page) plays whenever
      // its room is the one you are in
      const seen = v.dataset.inview !== undefined;
      const on = scene && scene.classList.contains("is-here") && (v.dataset.inview === "1" || !videoWatch || !seen);
      if (on) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  function doodle(stickerName, label) {
    const d = el("span", "doodle");
    d.appendChild(art.sticker(stickerName));
    d.appendChild(el("span", "doodle-label", label));
    return d;
  }

  /* ============================================================
     1. FILL THE ROOMS
     ============================================================ */

  // the shapes of frame on the hallway wall, and how big each hangs
  const FRAME_SHAPES = [
    { cls: "f-cream", size: 1.0 },
    { cls: "f-oval", size: 1.14 },
    { cls: "f-blue", size: 0.76 },
    { cls: "f-round", size: 0.9 },
    { cls: "f-gold", size: 0.66 },
    { cls: "f-arch", size: 1.16 },
    { cls: "f-shell", size: 0.86 },
    { cls: "f-cream", size: 1.06 },
    { cls: "f-round", size: 0.68 },
    { cls: "f-blue", size: 0.94 },
  ];

  const doors = {};

  function makeDoor(host) {
    const hole = el("div", "door-hole");
    const leaf = el("div", "door-leaf");
    if (art.has("doorLeaf")) {
      const img = new Image();
      img.src = D.assets.doorLeaf;
      img.alt = "";
      img.draggable = false;
      leaf.appendChild(img);
    }
    const shade = el("span", "door-leaf-shade");
    leaf.appendChild(shade);
    const dim = el("div", "door-dim");
    hole.append(el("div", "door-beyond beyond--" + host.dataset.beyond), dim, leaf);
    const frame = el("div", "door-frame");
    frame.appendChild(hole);
    host.append(el("span", "door-plaque", host.dataset.label), frame);
    doors[host.id] = { host, hole, leaf, shade, dim };
  }

  function fillOutside() {
    setText("hero-kicker", D.hero.kicker);
    setText("hero-name", D.hero.name);
    setText("hero-sub", D.hero.sub);
    setText("arc-label", D.hero.arc);
    setText("stamp-big", D.hero.stamp.big);
    setText("stamp-small", D.hero.stamp.small);
    $("#deco-a").appendChild(art.sticker("sparkle"));
    $("#deco-b").appendChild(art.sticker("star"));
    // the house with its door open is the picture; the closed door hangs over the doorway
    const img = $("#house-img");
    img.src = art.has("doorOpen") ? D.assets.doorOpen : D.dreamHouse;
    img.alt = D.dreamHouseAlt || "";
  }

  function fillEntrance() {
    if (art.has("innerHall")) $("#hall-img").src = D.assets.innerHall;
    else $("#hall-bg").remove();
    setText("letter-greeting", D.letter.greeting);
    const body = $("#letter-body");
    D.letter.paragraphs.forEach((t) => body.appendChild(el("p", null, t)));
    setText("letter-sign", D.letter.signature);
  }

  function fillHallway() {
    const host = $("#wall-frames");
    (D.photos || []).forEach((p, i) => {
      if (!p.src) return;
      const sh = FRAME_SHAPES[(i * 3 + 3) % FRAME_SHAPES.length];
      const fig = el("figure", "wframe " + sh.cls);
      fig.style.setProperty("--hs", String(sh.size));
      const photo = el("div", "photo");
      const caption = real(p.caption);
      const media = mediaEl(p.src, caption);
      // pos ("20% 50%") picks which part of a wide photo the frame shows, so she isn't cropped out
      if (p.pos) media.style.objectPosition = p.pos;
      photo.appendChild(media);
      fig.appendChild(photo);
      if (caption) fig.appendChild(el("figcaption", null, caption));
      host.appendChild(fig);
    });
  }

  // the wall: the frames are packed from the left, each one taking the first space it fits,
  // at one of several heights. Big and small frames tuck in around each other, so the wall
  // reads as two or three loose rows with no big gaps. Seeded, so it is the same on every visit.
  function placeWall(W) {
    const track = $("#wall-track");
    const host = $("#wall-frames");
    const title = $(".wall-title");
    const frames = $$(".wframe", host);
    const HH = host.clientHeight;
    const gap = Math.max(16, W * 0.02);
    const start = Math.max(title.offsetLeft + title.offsetWidth + gap * 2.4, W * (W < 760 ? 0.92 : 0.47));
    let seed = 20260514;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const placed = [];
    let right = start;
    frames.forEach((f) => {
      const w = f.offsetWidth;
      const h = f.offsetHeight;
      const room = Math.max(0, HH - h);
      let best = null;
      const tries = 7;
      for (let c = 0; c < tries; c++) {
        const y = Math.max(0, Math.min(room, (room * c) / (tries - 1) + (rand() - 0.5) * 26));
        let x = start;
        let moved = true;
        while (moved) {
          moved = false;
          for (const p of placed) {
            if (x < p.x + p.w + gap && x + w + gap > p.x && y < p.y + p.h + gap && y + h + gap > p.y) {
              x = p.x + p.w + gap;
              moved = true;
            }
          }
        }
        const score = x + rand() * w * 0.3;
        if (!best || score < best.score) best = { x, y, score };
      }
      placed.push({ x: best.x, y: best.y, w, h });
      f.style.left = Math.round(best.x) + "px";
      f.style.top = Math.round(best.y) + "px";
      right = Math.max(right, best.x + w);
    });
    // the door at the end of the wall, in the middle of the stage when you reach it
    const door = doors["door-vanity"].host;
    const doorLeft = right + Math.max(W * 0.18, 130);
    door.style.left = Math.round(doorLeft) + "px";
    const trackW = Math.round(doorLeft + door.offsetWidth / 2 + W / 2);
    track.style.width = trackW + "px";
    return trackW;
  }

  /* ---------- the vanity mirror: one kind thing per tap ---------- */
  function setupMirror() {
    const mirror = $("#mirror");
    const text = $("#mirror-text");
    const count = $("#mirror-count");
    const list = (D.affirmations || []).map(real).filter(Boolean);
    if (!list.length) return;

    // the glass: the kind things run up through it again and again.
    // Two identical halves, so the loop joins up without a gap.
    const run = $("#mirror-run");
    const half = () => {
      const h = el("span", "run-half");
      for (let k = 0; k < 4; k++) {
        const g = el("span", "run-group");
        list.forEach((s) => g.appendChild(el("span", "run-line", s)));
        h.appendChild(g);
      }
      return h;
    };
    run.append(half(), half());
    run.style.setProperty("--run", Math.max(16, list.length * 9) + "s");

    const M = D.mirror || {};
    const faceSrc = M.src;
    if (faceSrc) {
      const face = $("#mirror-face");
      face.style.backgroundImage = 'url("' + faceSrc + '")';
      if (M.zoom) face.style.backgroundSize = Math.round(M.zoom * 100) + "% auto";
      if (M.x != null || M.y != null) face.style.backgroundPosition = (M.x != null ? M.x : 50) + "% " + (M.y != null ? M.y : 24) + "%";
    }

    let idx = -1;
    let taps = 0;
    mirror.addEventListener("click", () => {
      idx = (idx + 1) % list.length;
      taps += 1;
      const line = list[idx];
      text.textContent = line;
      count.textContent = "kind thing " + taps;
      if (faceSrc) mirror.classList.add("has-face");
      if (hasGSAP && !reduce) gsap.fromTo(text, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
    });
  }

  /* ---------- the living room's player: Spotify's own, one song at a time ---------- */
  // The track id in a song's Spotify link (open.spotify.com/track/... or spotify:track:...).
  function spotifyTrack(t) {
    const m = /track[/:]([A-Za-z0-9]{22})/.exec((t && typeof t === "object" && t.link) || "");
    return m ? m[1] : "";
  }

  // Spotify's embed script lets a tap on a song start it straight away, and says when the song
  // plays or stops. It is fetched on the first tap. If it can't load, the plain embed is used and
  // she presses play inside it.
  let spotifyApi = null;
  function loadSpotify() {
    if (!spotifyApi) {
      spotifyApi = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Spotify took too long")), 8000);
        window.onSpotifyIframeApiReady = (api) => { clearTimeout(timer); resolve(api); };
        const s = document.createElement("script");
        s.src = "https://open.spotify.com/embed/iframe-api/v1";
        s.async = true;
        s.onerror = () => { clearTimeout(timer); reject(new Error("Spotify did not load")); };
        document.head.appendChild(s);
      });
    }
    return spotifyApi;
  }

  // rows: [{ li, id }] in playlist order. play(row) opens that song's player in its row, closing
  // any other; a song that plays to its end hands over to the next one.
  function songPlayer(rows) {
    const living = $("#living");
    const vinyl = $("#vinyl");
    let open = null;
    let controller = null;
    let playing = false;

    // the record spins faster while a song plays, carrying on from wherever it is in its turn
    function setPlaying(on) {
      if (on === playing) return;
      playing = on;
      if (living) living.classList.toggle("is-playing", on);
      const spin = vinyl && vinyl.getAnimations ? vinyl.getAnimations().find((a) => a.animationName === "spin") : null;
      if (spin && spin.updatePlaybackRate) spin.updatePlaybackRate(on ? 5 : 1);
    }

    function close() {
      if (controller) {
        try { controller.destroy(); } catch (e) { /* already gone */ }
        controller = null;
      }
      if (open) {
        open.li.classList.remove("is-open");
        const host = open.li.querySelector(".track-player");
        if (host) host.remove();
      }
      open = null;
      setPlaying(false);
    }

    function plainEmbed(slot, id) {
      const f = document.createElement("iframe");
      f.src = "https://open.spotify.com/embed/track/" + id + "?utm_source=generator";
      f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      f.title = "Spotify player";
      slot.replaceWith(f);
    }

    function play(row) {
      if (open === row) {
        if (controller) controller.togglePlay();
        return;
      }
      close();
      open = row;
      const host = el("div", "track-player");
      const slot = el("div");
      host.appendChild(slot);
      row.li.appendChild(host);
      row.li.classList.add("is-open");

      loadSpotify().then((api) => {
        if (open !== row) return;
        api.createController(slot, { uri: "spotify:track:" + row.id, width: "100%", height: 80 }, (c) => {
          if (open !== row) { c.destroy(); return; }
          controller = c;
          let ended = false;
          c.addListener("ready", () => c.play());
          // Spotify reports the position every second, in milliseconds. At the end of a song (or of
          // a 30-second preview) it doesn't say paused: the position just reaches the duration and
          // the updates stop, the last one sent twice.
          c.addListener("playback_update", (e) => {
            if (open !== row) return;
            const d = (e && e.data) || {};
            const atEnd = d.duration > 0 && d.position >= d.duration - 300;
            setPlaying(!d.isPaused && !atEnd);
            if (!atEnd) ended = false;
            else if (!ended) {
              ended = true;
              const i = rows.indexOf(row);
              if (i >= 0 && i < rows.length - 1) play(rows[i + 1]);
            }
          });
        });
      }).catch(() => {
        if (open === row) plainEmbed(slot, row.id);
      });
    }

    return { play, close };
  }

  /* ---------- the living room: songs on a record ---------- */
  function fillLiving() {
    const Rc = D.record;
    if (!Rc) return;
    setText("record-label", Rc.label);
    setText("vinyl-title", Rc.title);

    const note = $("#kraft-note");
    note.textContent = Rc.note || "";
    if (!Rc.note) note.remove();

    const label = $("#vinyl-label");
    label.appendChild(Rc.centerSrc ? mediaEl(Rc.centerSrc, "") : doodle("star", "side a"));

    const list = $("#tracks");
    // a song is a title, or { title, by, link }; the artist sits small under the title.
    // A song with a Spotify track link plays right here: a tap swaps its row for Spotify's player.
    // A song without one opens a Spotify search for it in a new tab.
    const rows = [];
    const player = songPlayer(rows);
    (Rc.tracks || []).forEach((t) => {
      const title = real(typeof t === "string" ? t : t && t.title);
      if (!title) return;
      const by = typeof t === "object" ? real(t.by || "") : "";
      const id = spotifyTrack(t);
      const words = el("span", "track", title);
      if (by) words.appendChild(el("span", "track-by", by));
      const link = el("a", "track-link");
      const query = (by ? title + " " + by : title).replace(/&/g, " ").replace(/\s+/g, " ").trim();
      link.href = id ? "https://open.spotify.com/track/" + id : "https://open.spotify.com/search/" + encodeURIComponent(query);
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", "Play " + title + (by ? " by " + by : "") + (id ? "" : " on Spotify (opens in a new tab)"));
      const play = el("span", "track-play");
      play.setAttribute("aria-hidden", "true");
      play.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 7.8 L16.4 12 L10 16.2 Z" fill="currentColor"/></svg>';
      link.append(words, play);
      const li = el("li");
      li.appendChild(link);
      list.appendChild(li);
      if (id) {
        const row = { li, id };
        rows.push(row);
        link.addEventListener("click", (e) => {
          e.preventDefault();
          player.play(row);
        });
      }
    });

    // stickers sit round the lower rim, clear of the title arc at the top
    const stick = $("#stickers");
    const items = Rc.stickers || [];
    items.forEach((name, i) => {
      const s = art.sticker(name);
      const t = items.length > 1 ? i / (items.length - 1) : 0;
      const a = (96 + t * 168) * (Math.PI / 180); // clockwise from the top
      const r = 41.5; // percent of the stage
      s.style.left = (50 + r * Math.sin(a)).toFixed(2) + "%";
      s.style.top = (50 - r * Math.cos(a)).toFixed(2) + "%";
      s.style.setProperty("--rot", (i % 2 ? 1 : -1) * (8 + ((i * 7) % 14)) + "deg");
      stick.appendChild(s);
    });

    // a few of the names, as small tags
    const names = (D.names || []).map((n) => real(n.name)).filter(Boolean);
    const strip = $("#names-strip");
    if (!names.length) strip.remove();
    else {
      if (names.length === 1) setText("names-label", "and the name she called me");
      const host = $("#names");
      names.forEach((name, i) => {
        const wrap = el("div", "tag-wrap");
        wrap.style.setProperty("--r", (i % 2 ? 1 : -1) * (2 + (i % 3) * 1.6) + "deg");
        wrap.appendChild(el("div", "tag", name));
        host.appendChild(wrap);
      });
    }

    // the film strip: a few stills in black and white
    const film = $("#filmstrip");
    const stills = ((D.reel && D.reel.slots) || []).concat(D.photos || []).map((p) => p.src).filter((s) => s && !isVideo(s));
    Array.from(new Set(stills)).slice(0, 6).forEach((src) => {
      const fig = el("figure");
      const img = new Image();
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      fig.appendChild(img);
      film.appendChild(fig);
    });
  }

  /* ---------- the reel: a viewmaster disc of slides ---------- */
  function setupReel() {
    const R = D.reel;
    if (!R) return;
    setText("reel-label", R.label);
    setText("reel-title", R.title);
    setText("reel-notes", real(R.notes));

    const disc = $("#disc");
    for (let k = 0; k < 12; k++) {
      const n = el("span", "notch");
      const a = k * 30 + 15;
      const rad = (a * Math.PI) / 180;
      n.style.left = (50 + 47.6 * Math.sin(rad)).toFixed(2) + "%";
      n.style.top = (50 - 47.6 * Math.cos(rad)).toFixed(2) + "%";
      n.style.setProperty("--a", a + "deg");
      disc.appendChild(n);
    }

    // twelve windows round the rim: her slides first, then photos from the wall to fill the disc
    const slides = (R.slots || []).filter((s) => s.src);
    const used = new Set(slides.map((s) => s.src));
    (D.photos || []).forEach((p) => {
      if (slides.length < 12 && p.src && !isVideo(p.src) && !used.has(p.src)) {
        used.add(p.src);
        slides.push({ src: p.src, caption: p.caption });
      }
    });
    const n = slides.length;
    if (!n) return;

    const ring = $("#disc-ring");
    const no = $("#slide-no");
    const caption = $("#slide-caption");
    const viewer = $("#viewer-media");
    let turn = 0;
    let current = -1;

    const buttons = slides.map((s, i) => {
      const a = (i * 360) / n;
      const rad = (a * Math.PI) / 180;
      const b = el("button", "slot");
      b.type = "button";
      b.style.left = (50 + 38.2 * Math.sin(rad)).toFixed(2) + "%";
      b.style.top = (50 - 38.2 * Math.cos(rad)).toFixed(2) + "%";
      b.style.setProperty("--a", a.toFixed(2) + "deg");
      b.setAttribute("aria-label", "slide " + (i + 1) + " of " + n);
      const m = el("span", "slot-media");
      m.appendChild(mediaEl(s.src, ""));
      b.appendChild(m);
      b.addEventListener("click", () => select(i));
      const num = el("span", "slot-no", String(i + 1));
      num.style.left = (50 + 26.8 * Math.sin(rad)).toFixed(2) + "%";
      num.style.top = (50 - 26.8 * Math.cos(rad)).toFixed(2) + "%";
      num.style.setProperty("--a", a.toFixed(2) + "deg");
      ring.append(b, num);
      return b;
    });

    // choosing a slide turns the disc, the short way round, until that slide is at the top
    function select(i) {
      if (i === current) return;
      const target = -(i * 360) / n;
      let delta = (target - turn) % 360;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      turn += delta;
      ring.style.rotate = turn.toFixed(2) + "deg";
      current = i;
      buttons.forEach((b, k) => b.classList.toggle("is-on", k === i));
      no.textContent = "slide " + pad(i + 1) + " of " + pad(n);
      caption.textContent = real(slides[i].caption);
      viewer.replaceChildren(mediaEl(slides[i].src, real(slides[i].caption)));
    }
    select(0);
  }

  /* ---------- the game table ---------- */
  function setupGames() {
    $("#toy-mem-face").appendChild(art.sticker("heart"));
    // a painted object in place of the drawn one, once its picture is saved
    [["toy--find", "toyTorch"], ["toy--spot", "toySpot"], ["toy--memory", "toyMemory"], ["toy--odd", "toyQuiz"], ["toy--candles", "toyCandles"]].forEach(([cls, key]) => {
      art.onArt(key, (src) => {
        const box = $("." + cls + " .toy-art");
        if (!box || box.classList.contains("has-img")) return;
        const img = new Image();
        img.src = src;
        img.alt = "";
        box.classList.add("has-img");
        box.appendChild(img);
      });
    });
    const tiles = $("#toy-puzzle");
    tiles.style.setProperty("--img", 'url("' + new URL(D.dreamHouse, document.baseURI).href + '")');
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((k) => {
      const s = el("span", k === 8 ? "blank" : "");
      if (k < 8) s.style.backgroundPosition = (k % 3) * 50 + "% " + Math.floor(k / 3) * 50 + "%";
      tiles.appendChild(s);
    });

    // a few of the wall's photos, framed above the table
    const stills = (D.photos || []).map((p) => p.src).filter((s) => s && !isVideo(s));
    $$("#games-wall .photo").forEach((slot, k) => {
      const src = stills[(k * 5 + 4) % Math.max(1, stills.length)];
      if (src) slot.appendChild(mediaEl(src, ""));
      else slot.parentNode.remove();
    });

    const sheet = $("#sheet");
    const sheetCard = $(".sheet-card", sheet);
    const games = $$(".game", sheet);
    let opener = null;
    const close = () => {
      if (sheet.hidden) return;
      sheet.hidden = true;
      root.classList.remove("is-locked");
      if (opener) opener.focus({ preventScroll: true });
    };
    $$(".toy").forEach((toy) => {
      toy.addEventListener("click", () => {
        opener = toy;
        games.forEach((g) => { g.hidden = g.id !== toy.dataset.game; });
        sheetCard.classList.toggle("is-wide", toy.dataset.wide === "1");
        sheetCard.scrollTop = 0;
        sheet.hidden = false;
        root.classList.add("is-locked");
        $("#sheet-close").focus({ preventScroll: true });
        // the game that opened may want to set itself up (the crossword puts the cursor in)
        document.dispatchEvent(new CustomEvent("didi:game", { detail: toy.dataset.game }));
      });
    });
    $("#sheet-close").addEventListener("click", close);
    sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---------- the rooftop: wishes, and the candle ---------- */
  const WISH_SPOTS = [
    [12, 42], [28, 22], [46, 46], [62, 24],
    [80, 40], [20, 76], [52, 74], [71, 52],
  ];

  function setupRooftop() {
    $("#sky-lights").appendChild(art.decor("lights"));
    const sky = $("#sky");
    const card = $("#wish-card");
    const text = $("#wish-text");
    const wishes = (D.wishes || []).map(real).filter(Boolean).slice(0, WISH_SPOTS.length);
    const stars = wishes.map((_, i) => {
      const b = el("button", "wish-star");
      b.type = "button";
      b.style.left = WISH_SPOTS[i][0] + "%";
      b.style.top = WISH_SPOTS[i][1] + "%";
      b.setAttribute("aria-label", "wish " + (i + 1) + " of " + wishes.length);
      b.appendChild(art.sticker(i % 3 === 1 ? "star" : "sparkle"));
      b.addEventListener("click", () => {
        stars.forEach((s, k) => s.classList.toggle("is-on", k === i));
        text.textContent = wishes[i];
        card.classList.remove("pop");
        void card.offsetWidth; // restart the pop
        card.classList.add("pop");
      });
      sky.insertBefore(b, card);
      return b;
    });
  }

  function setupCake() {
    const stage = $("#cake-stage");
    const cakeEl = art.cake();
    stage.appendChild(cakeEl);
    const flameHit = cakeEl.querySelector(".candle-hit");
    const msg = $("#cake-msg");
    const micBtn = $("#cake-mic");
    const tapBtn = $("#cake-tap");
    const wish = $("#cake-wish");
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
      // the candle goes out and the evening comes in
      $("#rooftop").classList.add("is-night");
      $("#wish-card").classList.remove("pop");
      wish.classList.add("is-on");
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

  function fillGoodbye() {
    setText("exit-sign", D.letter.signature);
    $("#bye-img").src = art.has("doorOpen") ? D.assets.doorOpen : D.dreamHouse;
    art.onArt("houseNight", (src) => { $("#bye-img").src = src; });
  }

  /* ============================================================
     2. THE GATE: select all squares with birthday girl
     ============================================================ */
  function shake(node) {
    if (reduce || !node.animate) return;
    node.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-5px)" }, { transform: "translateX(0)" }],
      { duration: 320 }
    );
  }

  function setupGate(onOpen) {
    const gate = $("#gate");
    const G = D.gate;
    if (!gate || !G || !G.tiles || !G.tiles.length || params.get("gate") === "0") {
      if (gate) gate.remove();
      onOpen();
      return;
    }
    root.classList.add("is-gated");
    setText("gate-title", G.prompt);
    setText("gate-hint", G.hint);

    const grid = $("#gate-grid");
    const msg = $("#gate-msg");
    grid.style.gridTemplateColumns = "repeat(" + Math.round(Math.sqrt(G.tiles.length)) + ", 1fr)";
    const correct = G.tiles.reduce((acc, t, i) => (t.correct ? acc.concat(i) : acc), []);

    const picks = G.tiles.map((t, i) => {
      const b = el("button", "pick");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "square " + (i + 1));
      const m = el("span", "pick-media");
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
      root.classList.remove("is-gated");
      setTimeout(() => { gate.style.display = "none"; }, 900);
      onOpen();
    };
    $("#gate-verify").addEventListener("click", () => {
      const picked = picks.reduce((acc, b, i) => (b.getAttribute("aria-pressed") === "true" ? acc.concat(i) : acc), []);
      const exact = picked.length === correct.length && picked.every((i) => correct.includes(i));
      if (exact) {
        msg.textContent = "verified. happy birthday, birthday girl.";
        msg.className = "gate-msg good";
        setTimeout(open, 700);
      } else {
        msg.textContent = picked.length ? "not quite. look again." : "pick the squares, or click skip.";
        msg.className = "gate-msg bad";
        shake($("#gate-card"));
      }
    });
    $("#gate-skip").addEventListener("click", open);
    setTimeout(() => gate.classList.add("is-ready"), 1600);
  }

  /* ============================================================
     3. THE WALK
     ============================================================ */
  const S = {}; // the scenes: { el, cam }
  $$(".scene", house).forEach((node) => { S[node.id] = { el: node, cam: $(".cam", node) }; });
  const order = Object.keys(S);

  let W = 0;
  let H = 0;
  let tl = null;
  let st = null;
  let total = 1;
  let rests = []; // where the walk comes to rest: { id, a, b } in timeline time
  let marks = []; // when each room becomes the room you are in: { id, at }
  let here = "";
  let holdStill = false; // for checking: stops the walk finishing itself between rooms
  const touched = new Set();
  const T = (target) => {
    (Array.isArray(target) ? target : [target]).forEach((n) => n && touched.add(n));
    return target;
  };

  // size a picture's box so it covers the stage, keeping (fx, fy) of the picture as near the middle as it can
  function coverBox(node, ar, fx, fy) {
    let w = W;
    let h = W / ar;
    if (h < H) { h = H; w = H * ar; }
    const left = Math.min(0, Math.max(W - w, W / 2 - fx * w));
    const top = Math.min(0, Math.max(H - h, H / 2 - fy * h));
    Object.assign(node.style, { width: w + "px", height: h + "px", left: left + "px", top: top + "px" });
    return { w, h, left, top };
  }

  // where a piece is on the stage. A piece that has not arrived yet sits 24px low; allow for that.
  function stageRect(node) {
    const hb = house.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const scene = node.closest(".scene");
    const lift = node.closest(".arrive") && scene && !scene.classList.contains("has-arrived") ? 24 : 0;
    return { x: r.left - hb.left, y: r.top - hb.top - lift, w: r.width, h: r.height };
  }

  function build() {
    const keep = st ? st.progress : 0;
    if (st) st.kill();
    if (tl) tl.kill();
    if (touched.size) gsap.set(Array.from(touched), { clearProps: "transform,opacity,visibility,clipPath,transformOrigin" });
    touched.clear();

    W = house.clientWidth;
    H = house.clientHeight;
    house.style.setProperty("--sw", W + "px");
    house.style.setProperty("--sh", H + "px");
    const U = Math.round(H * 0.9); // how far you scroll for one unit of the walk

    tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    rests = [];
    marks = [];
    let t = 0;
    const rest = (id, dur) => { rests.push({ id, a: t, b: t + dur }); t += dur; };
    const mark = (id, at) => marks.push({ id, at });

    gsap.set(T(order.map((id) => S[id].el)), { autoAlpha: 0 });
    gsap.set(S.outside.el, { autoAlpha: 1 });

    // a room comes up out of the dark as you step into it
    const enter = (id, at, dur, scale) => {
      tl.set(T(S[id].el), { autoAlpha: 1 }, at);
      tl.fromTo(T(S[id].cam), { opacity: 0, scale: reduce ? 1 : scale || 1.1 }, { opacity: 1, scale: 1, duration: dur, ease: "power1.out", immediateRender: false }, at);
    };
    // the plain way from one room to the next, for reduced motion
    const fade = (fromId, toId) => {
      tl.to(T(S[fromId].cam), { opacity: 0, duration: 0.4 }, t);
      enter(toId, t + 0.2, 0.36, 1);
      tl.set(T(S[fromId].el), { autoAlpha: 0 }, t + 0.58);
      mark(toId, t + 0.3);
      t += 0.6;
    };
    // walk through an opening: the room grows around it until the opening is the whole stage,
    // and the next room comes up inside it
    const through = (fromId, toId, rect, spread) => {
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + rect.h / 2;
      const K = Math.max(W / rect.w, H / rect.h) * spread;
      tl.to(T(S[fromId].cam), { scale: K, x: W / 2 - cx, y: H / 2 - cy, transformOrigin: cx + "px " + cy + "px", duration: 0.9, ease: "power2.in" }, t);
      enter(toId, t + 0.56, 0.3, 1.1);
      tl.set(T(S[fromId].el), { autoAlpha: 0 }, t + 0.88);
      mark(toId, t + 0.66);
      t += 0.9;
    };
    // a door swings open, then you walk through it. panX is how far the room has slid to bring the door in.
    const door = (fromId, toId, d, panX) => {
      if (reduce) return fade(fromId, toId);
      const r = stageRect(d.hole);
      r.x += panX;
      tl.to(T(d.leaf), { rotationY: 82, duration: 0.5, ease: "power1.inOut" }, t);
      tl.to(T(d.shade), { opacity: 0.6, duration: 0.5 }, t);
      tl.to(T(d.dim), { opacity: 0.25, duration: 0.5 }, t);
      t += 0.5;
      tl.to(d.dim, { opacity: 0, duration: 0.5 }, t);
      through(fromId, toId, r, 1.08);
    };

    /* ---- outside: up to the house, the front door opens, in you go ---- */
    const houseCam = $("#house-cam");
    const houseWindow = $("#house-window");
    const box = coverBox(houseCam, 1.5, 0.5, 0.52);
    $(".house-door").style.perspective = Math.round(box.w * 0.1523 * 4.2) + "px";
    const slot = stageRect($("#arch-slot"));
    const O = { x: 0.4785 * box.w, y: 0.586 * box.h }; // the doorway: everything grows from here
    const s0 = slot.w / (0.56 * box.w);
    const dx0 = slot.x + slot.w / 2 - box.left - O.x - s0 * (0.51 * box.w - O.x);
    const dy0 = slot.y + slot.h / 2 - box.top - O.y - s0 * (0.5 * box.h - O.y);
    const archClip = "inset(" + slot.y.toFixed(1) + "px " + (W - slot.x - slot.w).toFixed(1) + "px " + (H - slot.y - slot.h).toFixed(1) + "px " + slot.x.toFixed(1) + "px round " + (slot.w / 2).toFixed(1) + "px " + (slot.w / 2).toFixed(1) + "px 0px 0px)";
    const fullClip = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";

    // the words that curve over the arch
    const arc = $("#arc");
    const padA = 34;
    const Rr = slot.w / 2 + 14;
    arc.setAttribute("viewBox", "0 0 " + (slot.w + padA * 2) + " " + (slot.h + padA * 2));
    Object.assign(arc.style, { left: -padA + "px", top: -padA + "px", width: slot.w + padA * 2 + "px", height: slot.h + padA * 2 + "px" });
    $("#arc-path").setAttribute("d", "M " + (padA + slot.w / 2 - Rr) + " " + (padA + slot.w / 2) + " A " + Rr + " " + Rr + " 0 0 1 " + (padA + slot.w / 2 + Rr) + " " + (padA + slot.w / 2));

    mark("outside", 0);
    gsap.set(T(houseWindow), { clipPath: archClip });
    gsap.set(T(houseCam), { scale: s0, x: dx0, y: dy0, transformOrigin: O.x + "px " + O.y + "px" });
    rest("outside", 0.25);
    if (reduce) {
      fade("outside", "entrance");
    } else {
      tl.to(T([$("#invite"), $("#stamp"), $("#deco-a"), $("#deco-b")]), { opacity: 0, duration: 0.3 }, t);
      tl.to(houseWindow, { clipPath: fullClip, duration: 1, ease: "power1.inOut" }, t);
      tl.to(houseCam, { scale: 1, x: 0, y: 0, duration: 1, ease: "power1.inOut" }, t);
      tl.to(T($(".outside-bg")), { scale: 1.2, duration: 1 }, t);
      t += 1;
      const leaf = $("#house-leaf");
      if (art.has("doorOpen") && art.has("frontDoor")) {
        tl.to(T(leaf), { rotationY: -72, duration: 0.6, ease: "power1.inOut" }, t);
        tl.to(T($("#house-leaf-shade")), { opacity: 0.55, duration: 0.6 }, t);
        tl.to(leaf, { autoAlpha: 0, duration: 0.08 }, t + 0.54);
        t += 0.62;
      }
      tl.to(houseCam, { scale: 7, duration: 0.9, ease: "power2.in" }, t);
      tl.to(T($("#house-dark")), { opacity: 0.92, duration: 0.5, ease: "power1.in" }, t + 0.28);
      enter("entrance", t + 0.5, 0.36, 1.14);
      tl.set(S.outside.el, { autoAlpha: 0 }, t + 0.88);
      mark("entrance", t + 0.6);
      t += 0.9;
    }

    /* ---- the front hall: the letter, then on down the hall ---- */
    const hallBg = $("#hall-bg");
    if (hallBg) coverBox(hallBg, 1199 / 1312, 0.66, 0.42);
    rest("entrance", 0.45);
    if (reduce) {
      fade("entrance", "hallway");
    } else {
      tl.to(T($("#hall-front")), { opacity: 0, y: H * 0.07, duration: 0.34, ease: "power1.in" }, t);
      if (hallBg) tl.to(T(hallBg), { scale: 2.6, transformOrigin: "74.2% 33%", duration: 0.9, ease: "power2.in" }, t);
      enter("hallway", t + 0.5, 0.36, 1.06);
      tl.set(S.entrance.el, { autoAlpha: 0 }, t + 0.88);
      mark("hallway", t + 0.6);
      t += 0.9;
    }

    /* ---- the hallway: the wall slides past, to the door at its end ---- */
    const track = $("#wall-track");
    const panDist = Math.max(0, placeWall(W) - W);
    const wallStart = t;
    t += 0.25;
    tl.to(T(track), { x: -panDist, duration: panDist / U }, t);
    t += panDist / U + 0.15;
    rests.push({ id: "hallway", a: wallStart, b: t });
    door("hallway", "vanity", doors["door-vanity"], -panDist);

    /* ---- the vanity: then through the looking glass ---- */
    rest("vanity", 0.5);
    if (reduce) {
      fade("vanity", "living");
    } else {
      tl.to(T($("#mirror-beyond")), { opacity: 1, duration: 0.4 }, t + 0.04);
      through("vanity", "living", stageRect($("#mirror-glass")), 1.5);
    }

    /* ---- the living room: then across the room to the reel ---- */
    rest("living", 0.5);
    if (reduce) {
      fade("living", "reel");
    } else {
      tl.set(T(S.reel.el), { autoAlpha: 1 }, t);
      tl.fromTo(T(S.reel.cam), { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: "power1.inOut", immediateRender: false }, t);
      tl.to(S.living.cam, { xPercent: -100, duration: 0.9, ease: "power1.inOut" }, t);
      tl.set(S.living.el, { autoAlpha: 0 }, t + 0.89);
      mark("reel", t + 0.45);
      t += 0.9;
    }

    /* ---- the reel: then in through the viewer ---- */
    rest("reel", 0.5);
    if (reduce) {
      fade("reel", "study");
    } else {
      tl.to(T($("#viewer-beyond")), { opacity: 1, duration: 0.4 }, t + 0.04);
      through("reel", "study", stageRect($("#viewer-slide")), 1.3);
    }

    /* ---- the study and the game table: each has its door off to the right ---- */
    [["study", "games", "door-games"], ["games", "studio", "door-studio"]].forEach(([fromId, toId, doorId]) => {
      rest(fromId, 0.5);
      const pan = $("#" + fromId + "-pan");
      const dz = Math.max(0, pan.offsetWidth - W);
      if (!reduce) {
        tl.to(T(pan), { x: -dz, duration: 0.6, ease: "power1.inOut" }, t);
        t += 0.6;
      }
      door(fromId, toId, doors[doorId], -dz);
    });

    /* ---- the studio: then up to the rooftop ---- */
    rest("studio", 0.5);
    if (reduce) {
      fade("studio", "rooftop");
    } else {
      tl.set(T(S.rooftop.el), { autoAlpha: 1 }, t);
      tl.fromTo(T(S.rooftop.cam), { yPercent: -100 }, { yPercent: 0, duration: 1, ease: "power1.inOut", immediateRender: false }, t);
      tl.to(S.studio.cam, { yPercent: 100, duration: 1, ease: "power1.inOut" }, t);
      tl.set(S.studio.el, { autoAlpha: 0 }, t + 0.99);
      mark("rooftop", t + 0.5);
      t += 1;
    }

    /* ---- the rooftop: then back down, to the house with its door open ---- */
    const byeBg = $("#bye-bg");
    coverBox(byeBg, 1.5, 0.5, 0.56);
    rest("rooftop", 0.55);
    tl.to(T(S.rooftop.cam), { opacity: 0, scale: reduce ? 1 : 1.06, duration: 0.5 }, t);
    enter("goodbye", t + 0.3, 0.56, 1.1);
    tl.set(S.rooftop.el, { autoAlpha: 0 }, t + 0.88);
    mark("goodbye", t + 0.5);
    t += 0.9;
    rest("goodbye", 0.4);

    total = t;
    // the last room's rest has nothing moving in it, so pad the timeline to the full length of
    // the walk. Otherwise the scroll and the timeline would run at slightly different rates.
    if (tl.duration() < total) tl.to({}, { duration: total - tl.duration() }, tl.duration());
    tl.eventCallback("onUpdate", sync);

    // the length of the walk is what the page scrolls
    const len = Math.round(total * U);
    walk.style.height = len + window.innerHeight + "px";

    // between rooms the walk finishes itself: on to the next room if you are well into the
    // walk, back to the last one if you only nudged
    const zones = rests.map((r) => ({ a: r.a / total, b: r.b / total }));
    const snapTo = (p, self) => {
      if (holdStill) return p;
      for (const z of zones) if (p >= z.a - 0.0004 && p <= z.b + 0.0004) return p;
      let prev = zones[0];
      let next = zones[zones.length - 1];
      for (let i = 0; i < zones.length - 1; i++) {
        if (p > zones[i].b && p < zones[i + 1].a) { prev = zones[i]; next = zones[i + 1]; break; }
      }
      const f = (p - prev.b) / Math.max(0.0001, next.a - prev.b);
      const dir = self && self.direction < 0 ? -1 : 1;
      if (dir > 0) return f > 0.14 ? next.a : prev.b;
      return f < 0.86 ? prev.b : next.a;
    };

    st = ScrollTrigger.create({
      animation: tl,
      start: 0,
      end: () => len,
      scrub: reduce ? true : 0.9,
      snap: { snapTo, inertia: false, duration: { min: 0.35, max: 1.4 }, delay: 0.1, ease: "power2.inOut" },
    });
    if (keep > 0) window.scrollTo(0, keep * len);
    ScrollTrigger.update();
    sync();
  }

  /* ---------- which room you are in ---------- */
  const where = $("#where span");
  const roomButtons = {};

  function sync() {
    if (!tl) return;
    const now = tl.time();
    let id = marks.length ? marks[0].id : "outside";
    for (const m of marks) if (now >= m.at) id = m.id;
    if (id !== here) setRoom(id);
  }

  function setRoom(id) {
    here = id;
    order.forEach((k) => S[k].el.classList.toggle("is-here", k === id));
    const scene = S[id].el;
    if (!root.classList.contains("is-gated")) scene.classList.add("has-arrived");
    if (where) where.textContent = scene.dataset.where || "";
    Object.keys(roomButtons).forEach((k) => roomButtons[k].classList.toggle("is-here", k === id));
    $("#walk-ui").classList.toggle("is-end", id === order[order.length - 1]);
    syncVideos();
    // the journal opens when you reach it
    if (id === "study" && window.DIDI_JOURNAL && !window.DIDI_JOURNAL.isOpen()) setTimeout(() => { if (here === "study") window.DIDI_JOURNAL.open(); }, 900);
  }

  /* ---------- walking on, and jumping across the house ---------- */
  let glide = null;
  const stopGlide = () => { if (glide) { glide.kill(); glide = null; } };
  const yOf = (time) => (time / total) * ScrollTrigger.maxScroll(window);

  function glideTo(time) {
    stopGlide();
    const from = window.scrollY;
    const to = yOf(time);
    const units = Math.abs(time - (st ? st.progress * total : 0));
    const o = { y: from };
    glide = gsap.to(o, {
      y: to,
      duration: reduce ? 0.01 : Math.min(9, Math.max(1.3, units * 1.2)),
      ease: "power1.inOut",
      onUpdate: () => window.scrollTo(0, o.y),
      onComplete: () => { glide = null; },
    });
  }

  let blinkEl = null;
  function jumpTo(time) {
    stopGlide();
    if (!blinkEl) {
      blinkEl = el("div", "blink");
      document.body.appendChild(blinkEl);
    }
    blinkEl.classList.add("is-on");
    setTimeout(() => {
      window.scrollTo(0, yOf(time));
      ScrollTrigger.update();
      const tw = st && st.getTween && st.getTween();
      if (tw) tw.progress(1);
      tl.time(time);
      sync();
      setTimeout(() => blinkEl.classList.remove("is-on"), 220);
    }, reduce ? 0 : 330);
  }

  const restOf = (id) => rests.find((r) => r.id === id);
  // the moment you have fully arrived in a room
  const arrival = (id) => {
    const r = restOf(id);
    return r ? Math.min(r.a + 0.01, r.b) : 0;
  };
  function walkOn(dir) {
    const now = st ? st.progress * total : 0;
    if (dir > 0) {
      const next = rests.find((r) => r.a > now + 0.03);
      if (next) glideTo(next.a);
    } else {
      const back = rests.slice().reverse().find((r) => r.a < now - 0.03);
      if (back) glideTo(back.a);
    }
  }

  function setupWalkUi() {
    $("#walk-next").addEventListener("click", () => walkOn(1));
    $("#come-in").addEventListener("click", () => walkOn(1));
    $("#replay").addEventListener("click", () => jumpTo(0));

    const card = $("#rooms-card");
    const mapBtn = $("#walk-map");
    const list = $("#rooms-list");
    order.forEach((id) => {
      const li = el("li");
      const b = el("button", null, S[id].el.dataset.room || id);
      b.type = "button";
      b.addEventListener("click", () => {
        card.hidden = true;
        mapBtn.setAttribute("aria-expanded", "false");
        if (restOf(id)) jumpTo(arrival(id));
      });
      roomButtons[id] = b;
      li.appendChild(b);
      list.appendChild(li);
    });
    mapBtn.addEventListener("click", () => {
      card.hidden = !card.hidden;
      mapBtn.setAttribute("aria-expanded", String(!card.hidden));
    });
    document.addEventListener("click", (e) => {
      if (!card.hidden && !card.contains(e.target) && !mapBtn.contains(e.target)) {
        card.hidden = true;
        mapBtn.setAttribute("aria-expanded", "false");
      }
    });

    // your own scrolling always wins over a walk that is under way
    ["wheel", "touchstart"].forEach((type) => window.addEventListener(type, stopGlide, { passive: true }));
    document.addEventListener("keydown", (e) => {
      if (root.classList.contains("is-gated") || root.classList.contains("is-locked")) return;
      const tag = e.target && e.target.tagName;
      if (tag && /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(tag) && e.key !== "PageDown" && e.key !== "PageUp") return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); walkOn(1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); walkOn(-1); }
    });
  }

  /* ---------- depth: the room shifts a little with the pointer ---------- */
  // Each piece is moved on its own. (Setting a value on the whole house instead made the browser
  // re-check every element in every room on each frame, about 40 ms a frame: the site hung
  // whenever the mouse moved.)
  function setupDepth() {
    if (!fine || reduce) return;
    // how far each depth moves, in px, for a pointer at the very edge: [across, down]
    const DEPTH = { p1: [-5, -4], p2: [-11, -8], p3: [-18, -13] };
    const pieces = $$(".p1, .p2, .p3", house).map((el) => {
      const d = DEPTH[["p1", "p2", "p3"].find((c) => el.classList.contains(c))];
      return { el, dx: d[0], dy: d[1] };
    });
    if (!pieces.length) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      for (const p of pieces) p.el.style.translate = (x * p.dx).toFixed(2) + "px " + (y * p.dy).toFixed(2) + "px";
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }

  /* ============================================================
     4. START
     ============================================================ */
  function init() {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    $$(".doorway").forEach(makeDoor);
    fillOutside();
    fillEntrance();
    fillHallway();
    setupMirror();
    fillLiving();
    setupReel();
    if (window.setupJournal) window.setupJournal();
    setupGames();
    setupRooftop();
    setupCake();
    fillGoodbye();
    watchVideos();

    if (!hasGSAP) {
      // without the animation library the walk cannot run: show the first room and say so
      console.warn("GSAP did not load, so the walk through the house cannot run.");
      setupGate(() => S.outside.el.classList.add("has-arrived", "is-here"));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    build();
    setupWalkUi();
    setRoom(here || "outside");
    setupDepth();

    // rebuild the walk when the stage really changes size (not when a phone's address bar hides)
    let lastW = W;
    let lastH = H;
    let timer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = house.clientWidth;
        const h = house.clientHeight;
        if (w === lastW && Math.abs(h - lastH) < 130) return;
        lastW = w;
        lastH = h;
        build();
      }, 220);
    });
    // the fonts change the invitation's measurements, so build again once they are in
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!st || st.progress < 0.01) build(); });
    window.addEventListener("load", () => { if (!st || st.progress < 0.01) build(); });

    // the gate opens onto a ready house, then the invitation's words come in
    setupGate(() => {
      S[here || "outside"].el.classList.add("has-arrived");
      if (!reduce) {
        gsap.from(".kicker, .hero-name, .hero-sub, .come-in", { y: 26, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.14 });
        gsap.from(".stamp, .deco", { opacity: 0, scale: 0.8, duration: 0.9, ease: "back.out(1.6)", stagger: 0.12, delay: 0.5 });
      }
      const want = params.get("room");
      if (want && restOf(want)) setTimeout(() => jumpTo(arrival(want) + (parseFloat(params.get("at")) || 0)), 60);
    });

    // for checking: DIDI_HOUSE.go("vanity"), DIDI_HOUSE.at(12.5)
    window.DIDI_HOUSE = {
      go: (id) => { if (restOf(id)) jumpTo(arrival(id)); },
      at: (time) => jumpTo(time),
      next: () => walkOn(1),
      hold: (on) => { holdStill = on !== false; },
      info: () => ({ total, here, time: tl.time(), rests: rests.map((r) => [r.id, +r.a.toFixed(2), +r.b.toFixed(2)]) }),
    };
  }

  window.DIDI_READY.then(init);
})();
