/* ============================================================
   CONTENT. This is the only file you need to edit to make it hers.

   ASSETS: drop a file at the path below and the site uses it.
   Missing files fall back to the drawn version, so nothing breaks.
   The prompts for each asset are in assets/ASSET-PROMPTS.md.

   MEDIA: every photo slot takes an image OR a video.
     - images: .jpg, .png, .webp
     - videos: .mp4 or .webm (.mov often won't play in Chrome)
   Videos loop silently and only play while on screen.
   An empty "" src shows a drawn sticker card until the file is in.

   UNFINISHED LINES NEVER SHOW. Anything still written in [brackets],
   and any caption that still says "add the story" or "add a memory",
   is left off the site until you replace it. So the site is always
   safe to share; it just gets fuller as you fill these in:
     - affirmations   two more kind lines for the mirror
     - record.tracks  her songs (four in, more to come)
     - names          the other names she called you
     - photos         a caption for each frame on the wall (optional)
     - reel           a caption for each slide, and the disc's notes

   Keep the words kind: this site is a pampering.
   ============================================================ */
window.DIDI = {
  assets: {
    cover: "assets/cover/painting.jpg",          // painted backdrop for the invitation
    paper: "assets/textures/paper.jpg",          // seamless cream paper
    vanityBg: "assets/vanity/backdrop.jpg",      // the mirror's backdrop: clouds and satin, portrait
    mirrorFrame: "assets/frames/oval.webp",       // the gilt oval frame of the vanity mirror, transparent centre
    doorOpen: "assets/cover/door-open.jpg",     // the same cottage with its door swung open (the way in)
    innerHall: "assets/rooms/inside-hall.jpg",  // the hallway just inside the front door
    frontDoor: "assets/dream-house.jpg",          // the painted front door, shown on the welcome door
    doorLeaf: "assets/cover/door-leaf.webp",     // one front door leaf, transparent (the exit door)
    kraft: "assets/textures/kraft.jpg",          // seamless kraft paper for name tags
    wallpaper: "assets/textures/wallpaper.jpg",  // seamless dark pattern for the game room
    cake: "assets/cake/cake.webp",                // a painted birthday cake, transparent, candle unlit (optional)
    damask: "assets/textures/damask-red.jpg",    // seamless red damask for the vanity's panel (optional)
    cloud: "assets/vanity/cloud.webp",            // one soft cloud, transparent, that drifts across the vanity (optional)

    // More optional art. Each one replaces a drawn or plain piece once its file is saved;
    // until then the room keeps its current look. Prompts for all of them: assets/ASSET-PROMPTS.md
    key: "assets/cover/key.webp",                 // outside: the brass key over "come in"
    envelope: "assets/hall/envelope.webp",        // front hall: the envelope the letter came in
    seal: "assets/hall/seal.webp",                // front hall: the wax seal (the N is added by the site)
    plaster: "assets/textures/plaster.jpg",      // hallway: the plaster wall
    vanityProps: "assets/vanity/table.webp",      // vanity: perfume, pearls and a ribbon at the foot of the mirror
    livingWall: "assets/rooms/living-wall.jpg",  // living room: the red wall
    vinyl: "assets/record/vinyl.webp",            // living room: the record itself
    reelBg: "assets/rooms/reel-painting.jpg",    // reel: the painting behind the disc
    coverCloth: "assets/textures/bookcloth.jpg", // journal: the cloth on its cover
    tapeCream: "assets/journal/tape-cream.webp",  // journal (and the letter): washi tape
    tapeRose: "assets/journal/tape-rose.webp",
    tapeSage: "assets/journal/tape-sage.webp",
    tablecloth: "assets/textures/tablecloth.jpg", // game table: the cloth
    toyQuiz: "assets/games/quiz.webp",            // game table: the index cards (now the odd one out)
    toyMemory: "assets/games/memory.webp",        // game table: the memory cards
    toyTickets: "assets/games/tickets.webp",      // game table: the trip tickets
    toyCross: "assets/games/crossword.png",      // game table: the little crossword
    toyWords: "assets/games/letters.png",        // game table: the letter tiles (put away for now)
    toyTorch: "assets/games/torch.png",          // game table: the torch, for find Didi
    toySpot: "assets/games/two-photos.png",      // game table: two photos, for spot the difference
    toyCandles: "assets/games/candles.png",      // game table: the little cake, for save the candles
    cardBack: "assets/games/card-back.jpg",      // memory game: the back of every card
    studioWall: "assets/rooms/studio-wall.jpg",  // studio: the sunlit wall
    studioProps: "assets/studio/supplies.png",   // studio: brushes, paints and pencils in the corner
    skyNight: "assets/rooftop/sky-night.jpg",    // rooftop: the sky after the candle goes out
    houseNight: "assets/cover/house-night.jpg",  // outside again: the house at night
    // journal: hand-drawn doodles scattered over the pages
    doodles: [
      "assets/stickers/doodle-sun.webp",
      "assets/stickers/doodle-daisies.png",
      "assets/stickers/doodle-heart.png",
      "assets/stickers/doodle-arrow.png",
      "assets/stickers/doodle-sparkles.png",
      "assets/stickers/doodle-palm.png",
      "assets/stickers/doodle-bow.png",
      "assets/stickers/doodle-strawberry.png",
      "assets/stickers/doodle-camera.png",
      "assets/stickers/doodle-plane.png",
    ],
    stickers: {                                // die-cut stickers, transparent PNG
      star: "assets/stickers/star.webp",
      sparkle: "assets/stickers/sparkle.png",
      flower: "assets/stickers/flower.webp",
      heart: "assets/stickers/heart.webp",
      moon: "assets/stickers/moon.webp",
      bow: "assets/stickers/bow.webp",
      cherry: "assets/stickers/cherry.webp",
      leaf: "assets/stickers/leaf.png",
      // trip stickers for the journal (see tripStickers below). Each shows only once it's saved.
      shell: "assets/stickers/trip-shell.webp",
      coconut: "assets/stickers/trip-coconut.webp",
      sunnies: "assets/stickers/trip-sunnies.webp",
      mountain: "assets/stickers/trip-mountain.webp",
      noodles: "assets/stickers/trip-noodles.webp",
      ghost: "assets/stickers/trip-ghost.webp",
      elephant: "assets/stickers/trip-elephant.webp",
      train: "assets/stickers/trip-train.webp",
      pine: "assets/stickers/trip-pine.webp",
      jasmine: "assets/stickers/trip-jasmine.webp",
      dosa: "assets/stickers/trip-dosa.webp",
      rings: "assets/stickers/trip-rings.webp",
      marigold: "assets/stickers/trip-marigold.png",
      waterfall: "assets/stickers/trip-waterfall.png",
      beanie: "assets/stickers/trip-beanie.png",
      bridge: "assets/stickers/trip-bridge.webp",
      discoball: "assets/stickers/trip-discoball.png",
    },
  },

  hero: {
    kicker: "you're invited to",
    name: "Didi",
    sub: "Shweta's birthday. The big sister with the biggest ideas.",
    arc: "happy birthday · a house built for you ·",
    stamp: { big: "come in", small: "you're expected" },
  },

  dreamHouse: "assets/dream-house.jpg",   // her dream house: a painted image or a photo (falls back to the drawing)
  dreamHouseAlt: "Didi's dream house",

  // The loading gate: "select all squares with birthday girl".
  // Set correct: true on every square that shows her, then they verify.
  // Use src (photo or video) for real tiles. The sticker is only a stand-in.
  gate: {
    prompt: "birthday girl",
    hint: "If there are none, click skip.",
    // the squares that show her are crops of her own photo (assets/photos/didi). The others are
    // real photos without her in them. Set correct: true only on the squares that show her.
    tiles: [
      { src: "assets/photos/real/r09-hammock.jpg" },
      { src: "assets/photos/didi/didi-gate-1.jpg", correct: true },
      { src: "assets/photos/real/r03-street.jpg" },
      { src: "assets/photos/real/r10-cafe.jpg" },
      { src: "assets/photos/didi/didi-gate-2.jpg", correct: true },
      { src: "assets/photos/real/r13-bread.jpg" },
      { src: "assets/photos/real/r11-bar.jpg" },
      { src: "assets/photos/real/r15-fruit.jpg" },
      { src: "assets/photos/didi/didi-gate-3.jpg", correct: true },
    ],
  },

  // The front door letter.
  letter: {
    greeting: "Dear Didi,",
    paragraphs: [
      "This house is yours, and nobody is going to rush you through it. You have spent so long making everyone else feel at home that I wanted one place where you get looked after.",
      "You are very pretty. You are the most beautiful. I need you to hear that from me, especially on the days you don't believe it yet.",
      "So walk slowly. There are songs in the living room, a book of little memories, a mirror that only says kind things, and a candle that is waiting for you. Take your time.",
    ],
    signature: "your Nonu",
  },

  // The vanity mirror: one kind thing for every tap. Replace the brackets.
  affirmations: [
    "You are very pretty.",
    "You are the most beautiful.",
    "[add a thing you've always noticed about her]",
    "[add the way she makes a room feel lighter]",
  ],

  // The photo of her that appears in the mirror's glass after the first tap. "" for a plain glass.
  // zoom, x and y frame her face: zoom 1 fits the photo to the glass, and x / y (0 to 100)
  // slide the photo across and down behind it.
  mirror: { src: "assets/photos/didi/didi-01.jpg", zoom: 1.5, x: 50, y: 71 },

  // The hallway wall, in order. Each one hangs in a frame; photos and videos both work.
  photos: [
    { src: "assets/photos/chat/photo-21.jpg", caption: "photo 04, add the story" },
    { src: "assets/photos/chat/photo-16.jpg", caption: "photo 05, add the story" },
    { src: "assets/photos/chat/photo-24.jpg", caption: "photo 06, add the story" },
    { src: "assets/journal/wedding/wedding-04.jpg" },
    { src: "assets/journal/himachal/himachal-clip-01.mp4" },
    { src: "assets/photos/chat/photo-19.jpg", caption: "photo 07, add the story" },
    { src: "assets/photos/chat/photo-18.jpg", caption: "photo 08, add the story" },
    { src: "assets/photos/chat/photo-23.jpg", caption: "photo 09, add the story" },
    { src: "assets/photos/didi/didi-01.jpg", caption: "photo 10, add the story" },
    { src: "assets/photos/chat/photo-12.jpg", caption: "photo 12, add the story" },
    { src: "assets/journal/moments/moments-01.jpg" },
    { src: "assets/photos/chat/photo-05.jpg", caption: "photo 13, add the story" },
    { src: "assets/photos/chat/photo-01.jpg", caption: "photo 14, add the story" },
    { src: "assets/photos/chat/photo-04.jpg", caption: "photo 15, add the story" },
    { src: "assets/photos/chat/photo-13.jpg", caption: "photo 16, add the story" },
    { src: "assets/clips/clip-11.mp4" },
    { src: "assets/photos/chat/photo-06.jpg", pos: "0% 45%", caption: "photo 17, add the story" },
    { src: "assets/photos/chat/photo-03.jpg", caption: "photo 18, add the story" },
    { src: "assets/photos/chat/photo-08.jpg", caption: "photo 19, add the story" },
    { src: "assets/photos/chat/photo-11.jpg", caption: "photo 20, add the story" },
    { src: "assets/photos/chat/photo-14.jpg", caption: "photo 21, add the story" },
    { src: "assets/journal/wedding/wedding-06.jpg" },
    { src: "assets/journal/moments/moments-clip-02.mp4" },
    { src: "assets/photos/chat/photo-22.jpg", caption: "photo 22, add the story" },
    { src: "assets/photos/chat/photo-02.jpg", caption: "photo 23, add the story" },
    { src: "assets/photos/chat/photo-07.jpg", caption: "photo 24, add the story" },
    { src: "assets/photos/chat/photo-09.jpg", caption: "photo 25, add the story" },
    { src: "assets/photos/chat/photo-17.jpg", caption: "photo 26, add the story" },
    { src: "assets/journal/moments/moments-02.jpg" },
    { src: "assets/photos/chat/photo-20.jpg", caption: "photo 27, add the story" },
    { src: "assets/photos/chat/photo-15.jpg", caption: "photo 28, add the story" },
    { src: "assets/photos/chat/photo-10.jpg", caption: "photo 32, add the story" },
    { src: "assets/photos/didi/didi-02.jpg" },
    { src: "assets/photos/us/us-01.jpg" },
    { src: "assets/photos/didi/didi-03.jpg" },
    { src: "assets/journal/goa/goa-22.jpg" },
    { src: "assets/photos/didi/didi-04.jpg" },
    { src: "assets/photos/us/us-02.jpg" },
    { src: "assets/journal/wedding/wedding-03.jpg" },
    { src: "assets/journal/wedding/wedding-clip-03.mp4" },
    { src: "assets/journal/wedding/wedding-05.jpg" },
    { src: "assets/journal/himachal/himachal-10.jpg" },
    { src: "assets/photos/didi/didi-05.jpg" },
    { src: "assets/journal/goa/goa-25.jpg" },
    { src: "assets/photos/us/us-03.jpg" },
    { src: "assets/photos/didi/didi-06.jpg" },
  ],

  // The reel: a viewmaster-style disc. Eight slides, around the rim.
  reel: {
    label: "Disc 1",
    title: "Didi, in frames",
    notes: "includes [the cafes, the songs, the things she loves]",
    slots: [
      { src: "assets/photos/chat/photo-07.jpg", caption: "slide 01, add a memory" },
      { src: "assets/photos/didi/didi-01.jpg", caption: "slide 02, add a memory" },
      { src: "assets/photos/chat/photo-22.jpg", caption: "slide 03, add a memory" },
      { src: "assets/photos/chat/photo-01.jpg", caption: "slide 04, add a memory" },
      { src: "assets/photos/chat/photo-17.jpg", caption: "slide 05, add a memory" },
      { src: "assets/photos/chat/photo-16.jpg", caption: "slide 06, add a memory" },
      { src: "assets/photos/chat/photo-20.jpg", caption: "slide 07, add a memory" },
      { src: "assets/photos/chat/photo-04.jpg", caption: "slide 08, add a memory" },
    ],
  },

  // The living room: songs on a record. K-drama and Taylor, in her order.
  // Each song is { title, by }. Add more any time; a line still in [brackets] stays hidden.
  // A song with a Spotify link plays right here, in Spotify's own player, when she taps it
  // (the whole song if she's logged in to Spotify on that browser, a 30-second preview if not).
  // To add one: in Spotify, Share > Copy Song Link, and paste it as the link.
  // A song without a link opens a Spotify search for it in a new tab instead.
  record: {
    label: "K-drama & Taylor",
    title: "Songs on repeat",
    centerSrc: "assets/photos/didi/didi-face.jpg",
    note: "play it loud",
    stickers: ["star", "sparkle", "flower", "heart", "moon", "bow", "cherry", "leaf"],
    tracks: [
      { title: "Stay With Me", by: "Chanyeol & Punch", link: "https://open.spotify.com/track/1HYzRuWjmS9LXCkdVHi25K" },
      { title: "Teardrops on My Guitar", by: "Taylor Swift", link: "https://open.spotify.com/track/0tYRG6rPpwX8Ci6lFTQ9YW" },
      { title: "You Belong With Me", by: "Taylor Swift", link: "https://open.spotify.com/track/1qrpoAMXodY6895hGKoUpA" }, // Taylor's Version
      { title: "Love Story", by: "Taylor Swift", link: "https://open.spotify.com/track/3CeCwYWvdfXbZLXFhBrbnf" },        // Taylor's Version
      "[song 05: add another favourite]",
      "[song 06: add another favourite]",
    ],
  },

  // A few of the names she called you: a small strip, not a feature.
  names: [
    { name: "Nonu" },
    { name: "[name #2]" },
    { name: "[name #3]" },
    { name: "[name #4]" },
  ],

  // The journal: its pages, in order, two to a spread.
  //   src      one photo. The page is that photo, with pieces cut from it laid on top.
  //   srcs     two, three or four photos. They are laid out together as a collage.
  //            A photo can also be a short video (.mp4): it plays muted, on a loop.
  //   caption  a line under the photos, from you to her. Not who is in them: what she means.
  //   place    a word for the rubber stamp, such as "Goa"
  //   date     a date, or words such as "during covid"
  //   note     a few sentences in your own words
  //   sign     a signature at the bottom of the page, in script (for the letter)
  //   cut      a PNG of just her with the background removed. It becomes a die-cut sticker
  //            on the page (see ASSET-PROMPTS.md for how to make one).
  //   stickers the trip stickers for this page, by name. Pages with a place get their trip's
  //            stickers from tripStickers on their own, so this is only for pages without one.
  // A page whose photo is not saved yet becomes a written page: its words fill it in handwriting,
  // and the photo appears on its own once the file is in place.
  journal: [
    { src: "assets/journal/people/people-01.jpg", caption: "The first person I could ever call my person." },
    { src: "assets/journal/people/people-02.jpg", caption: "You're everything to me." },
    { src: "assets/journal/people/people-03.jpg", caption: "The one I love, the one I adore, the one I look after." },
    { src: "assets/journal/people/people-04.jpg", caption: "You'd do anything for me, and I'd do anything for you." },
    { src: "assets/journal/people/people-05.jpg", caption: "I know you love me more. I'm still trying to catch up." },
    { src: "assets/journal/wedding/wedding-04.jpg", caption: "Married, and still my person. That never changes." },
    { caption: "When I was little", note: "You used to scare me with your eye-rolling and all of it. It was so much fun. I still remember those days.", stickers: ["ghost"] },
    { srcs: ["assets/journal/you/you-01.jpg", "assets/journal/you/you-clip-02.mp4", "assets/journal/you/you-03.jpg"], caption: "Even when I don't show it, you matter more than anything." },
    { srcs: ["assets/journal/you/you-04.jpg", "assets/journal/you/you-clip-03.mp4", "assets/journal/you/you-05.jpg", "assets/journal/you/you-02.jpg"], caption: "If you ever want to kill someone, I'm there. No questions asked." },
    { srcs: ["assets/journal/you/you-06.jpg", "assets/journal/you/you-clip-01.mp4", "assets/journal/you/you-07.jpg"], caption: "The one who'd take my photos even on her own wedding day." },
    // two memories with no photo: they are written in, with a sticker in the corner
    { caption: "Our K‑drama nights", note: "We watched so many K-dramas together. You taught me 안녕하세요, 잘 지내셨어 and 월요일 안녕. All that binge-watching, and trying to eat ramen even when we didn't have any. I had the best time with you.", stickers: ["noodles"] },
    { src: "assets/journal/goa/goa-01.jpg", caption: "Goa, our first family trip", place: "Goa", note: "Sorry that I went to the office. I was not there with you on the last day of our trip, so I'm sorry. But for everything, I love you so much. She gives me a lot, and I want to give it back. I just love her so much." },
    { srcs: ["assets/journal/goa/goa-02.jpg", "assets/journal/goa/goa-03.jpg", "assets/journal/goa/goa-04.jpg"], place: "Goa" },
    { srcs: ["assets/journal/goa/goa-05.jpg", "assets/journal/goa/goa-06.jpg", "assets/journal/goa/goa-07.jpg", "assets/journal/goa/goa-11.jpg"], place: "Goa" },
    { srcs: ["assets/journal/goa/goa-12.jpg", "assets/journal/goa/goa-13.jpg"], place: "Goa" },
    { srcs: ["assets/journal/goa/goa-14.jpg", "assets/journal/goa/goa-15.jpg", "assets/journal/goa/goa-16.jpg"], place: "Goa" },
    { srcs: ["assets/journal/goa/goa-17.jpg", "assets/journal/goa/goa-18.jpg", "assets/journal/goa/goa-19.jpg", "assets/journal/goa/goa-20.jpg"], place: "Goa" },
    { srcs: ["assets/journal/goa/goa-22.jpg", "assets/journal/goa/goa-23.jpg", "assets/journal/goa/goa-24.jpg"], place: "Goa" },
    { srcs: ["assets/journal/goa/goa-25.jpg", "assets/journal/goa/goa-21.jpg"], place: "Goa" },
    // Himachal, then Kasol. More photos from this trip are saved in assets/journal/himachal
    // (05 to 09), ready for another page.
    { srcs: ["assets/journal/himachal/himachal-01.jpg", "assets/journal/himachal/himachal-02.jpg", "assets/journal/himachal/himachal-03.jpg", "assets/journal/himachal/himachal-04.jpg"], caption: "Himachal, all of us together", place: "Himachal" },
    { srcs: ["assets/journal/himachal/himachal-clip-01.mp4", "assets/journal/himachal/himachal-10.jpg"], caption: "Back in the mountains, dupatta flying, then bundled up in the snow", place: "Himachal" },
    { srcs: ["assets/journal/kasol/kasol-01.jpg", "assets/journal/kasol/kasol-02.jpg", "assets/journal/kasol/kasol-03.jpg"], caption: "Then Kasol, and the night we went looking for a rave", place: "Kasol", note: "The night hike to find the rave party, which was not exactly a rave. Finding it was the fun part, and crossing that bridge, where I was the only one scared." },
    { srcs: ["assets/photos/didi/didi-02.jpg", "assets/photos/didi/didi-03.jpg", "assets/photos/didi/didi-04.jpg"], caption: "You'll always be there for me, and I'll always be there for you." },
    { srcs: ["assets/photos/didi/didi-05.jpg", "assets/photos/us/us-01.jpg", "assets/photos/us/us-02.jpg", "assets/photos/didi/didi-06.jpg"], caption: "I'll keep looking after you. Always." },
    { src: "assets/journal/manali/manali-01.jpg", caption: "Our first trip, Manali", place: "Manali", date: "during covid", note: "The college trip: my friend, you, our other cousin and me. We stayed in hostels, and that's where we opened up." },
    { src: "assets/journal/jaipur/jaipur-01.jpg", caption: "Then Jaipur, a little haunted", place: "Jaipur", note: "We stayed somewhere a little haunted and had the most fun." },
    { src: "assets/journal/shimla/shimla-01.jpg", caption: "Shimla, then Nani's house", place: "Shimla", note: "So many memories from those days, and every one of them is a good one." },
    { src: "assets/journal/wedding/wedding-01.jpg", caption: "Your wedding day, with all of us around you", stickers: ["rings", "marigold"] },
    { src: "assets/journal/wedding/wedding-03.jpg", caption: "Shweta and Utsav, stitched in thread", stickers: ["rings", "marigold"] },
    { srcs: ["assets/journal/wedding/wedding-clip-03.mp4", "assets/journal/wedding/wedding-06.jpg", "assets/journal/wedding/wedding-clip-06.mp4"], caption: "The flowers, the kaleere, and you walking in like you owned the place" },
    { srcs: ["assets/journal/wedding/wedding-02.jpg", "assets/journal/wedding/wedding-05.jpg", "assets/journal/wedding/wedding-clip-02.mp4"], caption: "The bride-to-be, the girls on the rooftop, and all of us squeezed into one selfie", stickers: ["rings"] },
    { srcs: ["assets/journal/wedding/wedding-clip-04.mp4", "assets/journal/wedding/wedding-clip-05.mp4"], caption: "All dressed up, and still the prettiest in the room" },
    { srcs: ["assets/journal/moments/moments-01.jpg", "assets/journal/moments/moments-02.jpg"], caption: "That face, and that hug. Both are mine." },
    { srcs: ["assets/journal/moments/moments-clip-02.mp4", "assets/journal/moments/moments-clip-01.mp4", "assets/journal/moments/moments-clip-03.mp4"], caption: "Just you, being you." },
    { src: "assets/journal/mysore/mysore-01.jpg", caption: "Mysore, when you came to Bangalore", place: "Mysore" },

    // The letter: the last pages of the book, in my own words, for her to keep.
    { caption: "Didi,", note: "You're everything to me. You're the person who took my photos even on your own wedding day. You can do anything for me, and I can do anything for you." },
    { note: "I know I don't do as much as you do, and I know you love me more. But I'm always trying to love you the way you love me. You will always be there for me, and I want to be there for you too, whatever happens. Even if you want to kill someone, I'm there." },
    { note: "Even if I don't show it, even when I can't do much, you matter more than anything. You're the one I love, I adore and I look after, and I'll keep looking after you. Married, kids, it doesn't matter. You're my person in the whole world. The first one I could ever call mine.", sign: "your Nonu" },
  ],

  // Cute stickers for each trip: every page with that place gets one of them.
  // The names are the sticker files in assets.stickers; each appears once its PNG is saved.
  tripStickers: {
    Goa: ["shell", "coconut", "sunnies"],
    Manali: ["mountain", "noodles"],
    Jaipur: ["ghost", "elephant"],
    Shimla: ["train", "pine"],
    Mysore: ["jasmine", "dosa"],
    Himachal: ["waterfall", "beanie"],
    Kasol: ["bridge", "discoball"],
  },

  // The last page of the book: a line in her own words, not a photo.
  journalEnd: {
    title: "for a bad day",
    text: "You are very pretty. You are the most beautiful.",
  },

  // The photo on the journal's cover, before it opens.
  journalCover: "assets/journal/people/people-02.jpg",

  // ---------------- THE GAME TABLE ----------------
  // Seven games. Nothing here asks about our trips for now: those games are put away below,
  // ready for when the real answers are written in.

  // 01. Find Didi: the lights are off and she has a torch. In each photo she taps her own face.
  //     x and y (0 to 100) are the middle of her face across and down the photo; r is how big
  //     it is, as a share of the photo's width. These were placed by hand, photo by photo.
  findDidi: [
    { src: "assets/photos/us/us-01.jpg", x: 55.7, y: 57.8, r: 4.5 },
    { src: "assets/journal/goa/goa-25.jpg", x: 63.4, y: 55.2, r: 5.5 },
    { src: "assets/journal/goa/goa-19.jpg", x: 64.6, y: 41.4, r: 7 },
    { src: "assets/journal/goa/goa-22.jpg", x: 39, y: 55, r: 8 },
    { src: "assets/journal/goa/goa-23.jpg", x: 60.0, y: 56.4, r: 7 },
    { src: "assets/photos/us/us-02.jpg", x: 37.5, y: 53.3, r: 6 },
    { src: "assets/journal/goa/goa-21.jpg", x: 44.8, y: 52.4, r: 9 },
    { src: "assets/journal/goa/goa-24.jpg", x: 50.2, y: 57.0, r: 7 },
    { src: "assets/journal/people/people-02.jpg", x: 66.2, y: 59.9, r: 6.5 },
    { src: "assets/journal/people/people-03.jpg", x: 40, y: 40, r: 6 },
    { src: "assets/journal/people/people-04.jpg", x: 49.4, y: 58.8, r: 9 },
    { src: "assets/journal/goa/goa-13.jpg", x: 57, y: 61, r: 7 },
    { src: "assets/journal/goa/goa-20.jpg", x: 53.3, y: 47.9, r: 5 },
    { src: "assets/journal/goa/goa-15.jpg", x: 53.0, y: 37.6, r: 5 },
    { src: "assets/journal/people/people-01.jpg", x: 21, y: 49, r: 7 },
    { src: "assets/journal/wedding/wedding-01.jpg", x: 61.5, y: 28.5, r: 4 },
    { src: "assets/journal/wedding/wedding-02.jpg", x: 47, y: 34, r: 3.5 },
    { src: "assets/journal/wedding/wedding-04.jpg", x: 87, y: 52.5, r: 6 },
  ],

  // 02. Spot the difference: the second picture of each pair has five things changed.
  //     Each difference is [x, y, r]: where it is (0 to 100) and how near a tap has to be.
  spot: [
    { a: "assets/games/spot/s1-a.jpg", b: "assets/games/spot/s1-b.jpg", diffs: [[46,  49.5,  8.5],  [17,  91,  9.6],  [22.5,  55.5,  4.5],  [21,  27,  25.2],  [9,  70,  4.7]] },
    { a: "assets/games/spot/s2-a.jpg", b: "assets/games/spot/s2-b.jpg", diffs: [[52.4,  43.6,  3.9],  [4.5,  88,  9.0],  [93.5,  81,  9.0],  [41.8,  86.4,  4.5],  [52,  27.5,  20.5]] },
    { a: "assets/games/spot/s3-a.jpg", b: "assets/games/spot/s3-b.jpg", diffs: [[28.5,  7,  10.2],  [18.5,  94.5,  19.5],  [78,  82.5,  9.0],  [47,  2.6,  5.2],  [90,  60,  4.9]] },
    { a: "assets/games/spot/s4-a.jpg", b: "assets/games/spot/s4-b.jpg", diffs: [[21,  9,  8.4],  [80,  25.3,  5.8],  [43.5,  41,  4.8],  [94.5,  33,  11.5],  [70,  27,  4.7]] },
  ],

  // 03. Memory: a new eight of these every time the cards are shuffled.
  memoryPhotos: [
    "assets/photos/didi/didi-02.jpg",
    "assets/photos/didi/didi-03.jpg",
    "assets/photos/didi/didi-04.jpg",
    "assets/photos/didi/didi-05.jpg",
    "assets/photos/didi/didi-06.jpg",
    "assets/photos/didi/didi-01.jpg",
    "assets/photos/us/us-01.jpg",
    "assets/photos/us/us-02.jpg",
    "assets/journal/goa/goa-15.jpg",
    "assets/journal/goa/goa-19.jpg",
    "assets/journal/goa/goa-22.jpg",
    "assets/journal/goa/goa-25.jpg",
    "assets/journal/goa/goa-18.jpg",
    "assets/journal/people/people-03.jpg",
    "assets/journal/goa/goa-20.jpg",
    "assets/journal/wedding/wedding-01.jpg",
    "assets/journal/wedding/wedding-02.jpg",
    "assets/journal/moments/moments-01.jpg",
    "assets/journal/moments/moments-02.jpg",
    "assets/journal/wedding/wedding-04.jpg",
    "assets/journal/wedding/wedding-06.jpg",
  ],
  // if the photos cannot load, the cards use these stickers instead
  memoryTiles: ["star", "heart", "moon", "flower", "bow", "sparkle", "cherry", "leaf"],

  // 04. In pieces: the pictures she can choose to put back together (cut square from the middle).
  puzzlePictures: [
    { src: "assets/dream-house.jpg", name: "the dream house" },
    { src: "assets/photos/didi/didi-04.jpg", name: "a photo" },
    { src: "assets/journal/goa/goa-15.jpg", name: "a photo" },
    { src: "assets/journal/goa/goa-22.jpg", name: "a photo" },
    { src: "assets/journal/wedding/wedding-01.jpg", name: "the family" },
    { src: "assets/journal/moments/moments-02.jpg", name: "the hug" },
    { src: "assets/journal/wedding/wedding-03.jpg", name: "the keepsake" },
  ],

  // 05. The odd one out: everyday things, one doesn't belong. `odd` is its place in the list
  //     (counting from 0), and `why` is said after she picks.
  oddOneOut: [
    { items: ["Rajma", "Chole", "Kadhi", "Gulab jamun"], odd: 3, why: "The only one that doesn't want rice with it." },
    { items: ["Pressure cooker", "Kettle", "Tawa", "Dupatta"], odd: 3, why: "You can't cook in a dupatta. You can lose one in the kitchen, though." },
    { items: ["Jhumka", "Bangle", "Bindi", "Phone charger"], odd: 3, why: "The only one you can't wear. The only one everyone borrows." },
    { items: ["Chai", "Coffee", "Cold coffee", "Nimbu pani"], odd: 3, why: "The only one that won't keep you up at night." },
    { items: ["Monday", "Tuesday", "Sunday", "Thursday"], odd: 2, why: "The only one with a lie-in." },
    { items: ["Samosa", "Pakora", "Jalebi", "Vada"], odd: 2, why: "The only sweet one in a plate of fried things." },
    { items: ["Mehendi", "Haldi", "Sangeet", "Board exam"], odd: 3, why: "The only one nobody dances at." },
    { items: ["Rose", "Marigold", "Jasmine", "Mango"], odd: 3, why: "The only one you'd eat. Hopefully." },
    { items: ["Goa", "Manali", "Shimla", "Mussoorie"], odd: 0, why: "The only one with a beach." },
    { items: ["Saree", "Lehenga", "Kurta", "Raincoat"], odd: 3, why: "The only one that's waterproof." },
    { items: ["Remote", "Phone", "Laptop", "Pillow"], odd: 3, why: "The only one that never needs charging." },
    { items: ["Pani puri", "Bhel puri", "Sev puri", "Kulfi"], odd: 3, why: "The only one that isn't from the chaat stall." },
    { items: ["Diwali", "Holi", "Rakhi", "Tax day"], odd: 3, why: "The only one with no sweets." },
    { items: ["Cricket", "Kabaddi", "Ludo", "Kho-kho"], odd: 2, why: "The only one you can play sitting down." },
    { items: ["Umbrella", "Raincoat", "Sunglasses", "Gumboots"], odd: 2, why: "The only one for the sun, not the rain." },
    { items: ["Kajal", "Lipstick", "Blush", "Toothpaste"], odd: 3, why: "The only one that doesn't live on the vanity." },
  ],

  // 06. Save the candles: guess the word a letter at a time. A wrong letter blows a candle out.
  candleWords: [
    { word: "PRESSURE COOKER", hint: "it whistles three times" },
    { word: "CHAI", hint: "the answer to every question" },
    { word: "GOLGAPPA", hint: "one more, bhaiya" },
    { word: "DUPATTA", hint: "always slipping off one shoulder" },
    { word: "SUNGLASSES", hint: "the Goa look" },
    { word: "JHUMKA", hint: "they swing when you laugh" },
    { word: "MEHENDI", hint: "orange first, then deep brown" },
    { word: "REMOTE", hint: "lost in the sofa, again" },
    { word: "UMBRELLA", hint: "the monsoon's best friend" },
    { word: "PILLOW", hint: "five more minutes" },
    { word: "LUDO", hint: "a dice and four colours" },
    { word: "MANGO", hint: "the king of summer" },
    { word: "RANGOLI", hint: "colours on the floor at Diwali" },
    { word: "SELFIE", hint: "one more, I blinked" },
    { word: "BEACH", hint: "sand in everything" },
    { word: "BIRTHDAY GIRL", hint: "you, today" },
  ],

  // 07. The treasure hunt: a riddle at a time. Each answer she solves turns up a photo, and the
  //     last one opens the treasure. `answer` is what she types; `also` are other answers that
  //     count. Spaces, capitals and a "the" in front don't matter. `hint` is offered if she asks.
  //     `photo` turns up when it's solved, and `found` is said with it.
  hunt: {
    riddles: [
      { riddle: "I have a face but never a smile of my own. I only smile when you do, and in this house I only say kind things.", answer: "mirror", hint: "You walked past me at the vanity.", photo: "assets/photos/didi/didi-01.jpg", found: "The mirror was right. You are the prettiest." },
      { riddle: "Orange on the first day, deep brown by the second. I sit on a bride's hands, and the darker I get, the more you're loved.", answer: "mehendi", also: ["mehndi", "henna"], hint: "Before every wedding, the aunties sit you down for me.", photo: "assets/journal/wedding/wedding-02.jpg", found: "The bride-to-be, and the girls who stayed up with her." },
      { riddle: "I whistle three times but I'm not a referee. Every kitchen in the country has me, and somebody is always counting my calls.", answer: "pressure cooker", also: ["cooker"], hint: "Dal, rajma and chole all go into me.", photo: "assets/photos/us/us-01.jpg", found: "Found: the sound of every home we've ever had." },
      { riddle: "The more of me you take, the more you leave behind. We left a lot of me on every trip.", answer: "footsteps", also: ["steps", "footprints", "footstep"], hint: "Look down while you walk.", photo: "assets/journal/goa/goa-22.jpg", found: "Every trip, side by side." },
      { riddle: "Everyone takes one more, because somebody always blinked. I'm taken at every wedding, every trip and every dinner.", answer: "selfie", also: ["photo", "picture", "photograph"], hint: "Hold the phone out, and smile.", photo: "assets/journal/moments/moments-01.jpg", found: "And this one. The pout of the century." },
      { riddle: "I can be broken without anyone touching me, and kept without a box. I'm the thing you made me when you said you'd always be there.", answer: "promise", also: ["a promise"], hint: "Pinky ____.", photo: "assets/journal/moments/moments-02.jpg", found: "Kept. Every single one." },
      { riddle: "I'm lit once a year just for you, I melt while you make a wish, and then you blow me out.", answer: "candle", also: ["candles", "birthday candle"], hint: "Look on top of the cake.", photo: "assets/journal/people/people-02.jpg", found: "Save the wish. It's waiting on the rooftop." },
      { riddle: "Everyone has one, nobody can lose it, and every year you get another. Today is yours.", answer: "birthday", also: ["bday", "birth day"], hint: "Happy ________, Didi.", photo: "assets/journal/wedding/wedding-01.jpg", found: "The last clue. The treasure is open." },
    ],
    // what's inside the treasure chest at the end
    treasure: {
      title: "You found the treasure",
      note: "It was never in the box. It was every one of these, and it's you. Happy birthday, Didi.",
    },
  },

  // ---------- put away for now ----------
  // These games ask about our trips and family. They are off the table until the answers are
  // checked; their pieces are kept in index.html (inside <template id="games-put-away">).
  // 01. The trip quiz. `a` is the index of the right option; `note` shows after the answer.
  // `place` links a question to a trip: once that trip's photo is in the journal, it shows here too.
  quiz: [
    { q: "Where did we go on our very first trip together?", options: ["Goa", "Manali", "Jaipur", "Shimla"], a: 1, place: "Manali", note: "The college trip. Hostels, and that's where we opened up." },
    { q: "How many of us went on that first trip?", options: ["Two", "Three", "Four", "Five"], a: 2, place: "Manali", note: "Me, my friend, you and our other cousin." },
    { q: "Which city had a stay that was a little haunted?", options: ["Shimla", "Jaipur", "Mysore", "Goa"], a: 1, place: "Jaipur", note: "Spooky stay, crazy fun." },
    { q: "After Shimla, where did we go?", options: ["Goa", "Mysore", "Nani's house", "Manali"], a: 2, place: "Shimla", note: "Shimla, then Nani's house, with lots of memories." },
    { q: "Our first family trip was to which place?", options: ["Mysore", "Goa", "Jaipur", "Manali"], a: 1, place: "Goa", note: "The whole family, and crazy fun." },
    { q: "Who was NOT on the family trip to Goa?", options: ["Mom", "Jiju", "Our other cousin", "Dad"], a: 2, place: "Goa", note: "It was just the family that time." },
    { q: "When you and Jiju came to Bangalore, where did we go?", options: ["Mysore", "Goa", "Shimla", "Jaipur"], a: 0, place: "Mysore", note: "Mysore, and it was crazy fun again." },
  ],

  // 03. Put our trips in order: the first one is the earliest. Each is a stop on the train's route.
  tripOrder: [
    { place: "Manali", line: "Our first trip, the college one" },
    { place: "Jaipur", line: "Manali with our cousin, then Jaipur" },
    { place: "Shimla", line: "Shimla, then Nani's house" },
    { place: "Goa", line: "Our first family trip" },
    { place: "Mysore", line: "When you and Jiju came to Bangalore" },
  ],

  // 05. The little crossword. Answers are letters only (no spaces); the site lays out the grid.
  crossword: [
    { answer: "MANALI", clue: "Our very first trip together, the college one" },
    { answer: "JAIPUR", clue: "The city with the stay that was a little haunted" },
    { answer: "SHIMLA", clue: "The hills, right before Nani's house" },
    { answer: "MYSORE", clue: "Where we went when you and Jiju came to Bangalore" },
    { answer: "GOA", clue: "Our first trip as a whole family" },
    { answer: "NANI", clue: "Whose house we went to after Shimla" },
    { answer: "DADI", clue: "She's in one of the photos with you, Dad's mother" },
    { answer: "JIJU", clue: "He came along to Bangalore with you" },
    { answer: "NONU", clue: "What you call me" },
    { answer: "MIRROR", clue: "The thing in this house that only says kind things" },
    { answer: "CAKE", clue: "Its candle is waiting for you on the rooftop" },
  ],

  // 06. Untangle: the letters are mixed up; she taps them back into the word. Spaces are allowed.
  untangle: [
    { word: "DIDI", hint: "who this house is for" },
    { word: "DREAM HOUSE", hint: "the one you have always loved" },
    { word: "BIRTHDAY GIRL", hint: "you, today" },
    { word: "JOURNAL", hint: "the book of little memories" },
    { word: "ROOFTOP", hint: "where the stars and the cake are" },
    { word: "MANDALA", hint: "colour one in the studio" },
    { word: "KOREAN ROMANCE", hint: "the songs on repeat" },
    { word: "WISH", hint: "make one when the candle goes out" },
  ],

  // ---------------- THE STUDIO ----------------

  // Prompts for the blank page in the studio's library.
  prompts: [
    "Draw the room in your dream house that has no walls.",
    "Sketch the view from your balcony at 6am.",
    "Doodle a chair that someone would never want to leave.",
    "Draw the garden if it could talk. What would it say?",
    "A door you'd paint bright blue. What's behind it?",
  ],

  // Rooftop: one wish per sparkle (up to eight).
  wishes: [
    "May every room you build be full of light.",
    "May your sketchbook never run out of pages.",
    "May the hardest riddle be the one you enjoy most.",
    "May the people you love always find their way back to your door.",
    "May the ideas keep coming faster than you can draw them.",
    "May you never stop being the one who sees the good in things.",
    "May your dream house turn out even better than the one in your head.",
    "May I always be the one who gets to say: I'm proud of you, Didi.",
  ],

  // The cake: the wish she gets when the candle goes out.
  // flame: where the candle's wick is on the painted cake (assets.cake), as a percent
  // from its left (x) and top (y) edges, and how wide the flame is (w). Set for the cake in assets/cake.
  cake: {
    wish: "May you always know how beautiful you are.",
    flame: { x: 50.9, y: 3.1, w: 5.4 },
  },
};
