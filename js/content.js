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

   NOTE: the letter, memories, songs, affirmations and wishes are
   placeholder copy in [brackets] or plain lines. Swap them for real
   things before she sees it. Keep them kind: this site is a pampering.
   ============================================================ */
window.DIDI = {
  assets: {
    cover: "assets/cover/painting.jpg",          // painted backdrop for the invitation
    paper: "assets/textures/paper.jpg",          // seamless cream paper
    vanityBg: "assets/vanity/backdrop.jpg",      // the mirror's backdrop: clouds and satin, portrait
    mirrorFrame: "assets/frames/oval.png",       // the gilt oval frame of the vanity mirror, transparent centre
    doorOpen: "assets/cover/door-open.jpg",     // the same cottage with its door swung open (the way in)
    innerHall: "assets/rooms/inside-hall.jpg",  // the hallway just inside the front door
    frontDoor: "assets/dream-house.jpg",          // the painted front door, shown on the welcome door
    doorLeaf: "assets/cover/door-leaf.png",     // one front door leaf, transparent (the exit door)      // an ornate gold frame, transparent, empty centre (optional)
    kraft: "assets/textures/kraft.jpg",          // seamless kraft paper for name tags
    wallpaper: "assets/textures/wallpaper.jpg",  // seamless dark pattern for the library
    stickers: {                                  // die-cut stickers, transparent PNG
      star: "assets/stickers/star.png",
      sparkle: "assets/stickers/sparkle.png",
      flower: "assets/stickers/flower.png",
      heart: "assets/stickers/heart.png",
      moon: "assets/stickers/moon.png",
      bow: "assets/stickers/bow.png",
      cherry: "assets/stickers/cherry.png",
      leaf: "assets/stickers/leaf.png",
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

  // Hallway film strip, in order. Six frames to start.
  photos: [
    { src: "assets/clips/clip-01.mp4", caption: "clip 01, add the story" },
    { src: "assets/clips/clip-08.mp4", caption: "clip 02, add the story" },
    { src: "assets/clips/clip-04.mp4", caption: "clip 03, add the story" },
    { src: "assets/photos/chat/photo-21.jpg", caption: "photo 04, add the story" },
    { src: "assets/photos/chat/photo-16.jpg", caption: "photo 05, add the story" },
    { src: "assets/photos/chat/photo-24.jpg", caption: "photo 06, add the story" },
    { src: "assets/photos/chat/photo-19.jpg", caption: "photo 07, add the story" },
    { src: "assets/photos/chat/photo-18.jpg", caption: "photo 08, add the story" },
    { src: "assets/photos/chat/photo-23.jpg", caption: "photo 09, add the story" },
    { src: "assets/photos/didi/didi-01.jpg", caption: "photo 10, add the story" },
    { src: "assets/clips/clip-07.mp4", caption: "clip 11, add the story" },
    { src: "assets/photos/chat/photo-12.jpg", caption: "photo 12, add the story" },
    { src: "assets/photos/chat/photo-05.jpg", caption: "photo 13, add the story" },
    { src: "assets/photos/chat/photo-01.jpg", caption: "photo 14, add the story" },
    { src: "assets/photos/chat/photo-04.jpg", caption: "photo 15, add the story" },
    { src: "assets/photos/chat/photo-13.jpg", caption: "photo 16, add the story" },
    { src: "assets/photos/chat/photo-06.jpg", caption: "photo 17, add the story" },
    { src: "assets/photos/chat/photo-03.jpg", caption: "photo 18, add the story" },
    { src: "assets/photos/chat/photo-08.jpg", caption: "photo 19, add the story" },
    { src: "assets/photos/chat/photo-11.jpg", caption: "photo 20, add the story" },
    { src: "assets/photos/chat/photo-14.jpg", caption: "photo 21, add the story" },
    { src: "assets/photos/chat/photo-22.jpg", caption: "photo 22, add the story" },
    { src: "assets/photos/chat/photo-02.jpg", caption: "photo 23, add the story" },
    { src: "assets/photos/chat/photo-07.jpg", caption: "photo 24, add the story" },
    { src: "assets/photos/chat/photo-09.jpg", caption: "photo 25, add the story" },
    { src: "assets/photos/chat/photo-17.jpg", caption: "photo 26, add the story" },
    { src: "assets/photos/chat/photo-20.jpg", caption: "photo 27, add the story" },
    { src: "assets/photos/chat/photo-15.jpg", caption: "photo 28, add the story" },
    { src: "assets/clips/clip-06.mp4", caption: "clip 29, add the story" },
    { src: "assets/clips/clip-05.mp4", caption: "clip 30, add the story" },
    { src: "assets/clips/clip-02.mp4", caption: "clip 31, add the story" },
    { src: "assets/photos/chat/photo-10.jpg", caption: "photo 32, add the story" },
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

  // The living room: songs on a record. Korean romance to start.
  // Put the real song titles in the tracks; add a link later if you like.
  record: {
    label: "Korean romance",
    title: "Songs on repeat",
    centerSrc: "assets/photos/didi/didi-face.jpg",
    note: "play it loud",
    stickers: ["star", "sparkle", "flower", "heart", "moon", "bow", "cherry", "leaf"],
    tracks: [
      "[song 01: add a Korean romance favourite]",
      "[song 02: add a Korean romance favourite]",
      "[song 03: add a Korean romance favourite]",
      "[song 04: add a Korean romance favourite]",
      "[song 05: add a Korean romance favourite]",
      "[song 06: add a Korean romance favourite]",
    ],
  },

  // A few of the names she called you: a small strip, not a feature.
  names: [
    { name: "Nonu" },
    { name: "[name #2]" },
    { name: "[name #3]" },
    { name: "[name #4]" },
  ],

  // The journal: photo pages, in order, two to a spread. Each card has a photo (src: a file in
  // assets/journal/), a caption, and optionally a date and a note. A card whose photo is not
  // saved yet shows flat, with its caption under the stack.
  journal: [
    { src: "assets/journal/people/people-01.jpg", caption: "Mom in the middle, the two of us on either side" },
    { src: "assets/journal/people/people-02.jpg", caption: "You, under the tree" },
    { src: "assets/journal/people/people-03.jpg", caption: "You, by the tree" },
    { src: "assets/journal/people/people-04.jpg", caption: "With Dadi" },
    { src: "assets/journal/people/people-05.jpg", caption: "Me and Mom" },
    { src: "assets/journal/people/people-06.jpg", caption: "With Jiju" },
    { src: "assets/journal/goa/goa-01.jpg", caption: "Goa, our first family trip", note: "Sorry that I went to the office. I was not there with you on the last day of our trip, so I'm sorry. But for everything, I love you so much. She gives me a lot, and I want to give it back. I just love her so much." },
    ...Array.from({ length: 19 }, (_, k) => ({ src: "assets/journal/goa/goa-" + String(k + 2).padStart(2, "0") + ".jpg", caption: "Goa, our first family trip" })),
    { src: "assets/journal/manali/manali-01.jpg", caption: "Our first trip, Manali", date: "during covid", note: "The college trip: my friend, you, our other cousin and me. We stayed in hostels, and that's where we opened up." },
    { src: "assets/journal/jaipur/jaipur-01.jpg", caption: "Manali with our cousin, then Jaipur", note: "We stayed somewhere a little haunted and had the most fun." },
    { src: "assets/journal/shimla/shimla-01.jpg", caption: "Shimla, then Nani's house", note: "So many memories from those days, and every one of them is a good one." },
    { src: "assets/journal/wedding/wedding-01.jpg", caption: "The wedding, and the memories around it" },
    { src: "assets/journal/mysore/mysore-01.jpg", caption: "Mysore, when you and Jiju came to Bangalore" },
  ],

  // The last page of the book: a line in her own words, not a photo.
  journalEnd: {
    title: "for a bad day",
    text: "You are very pretty. You are the most beautiful.",
  },

  // Library: the trip quiz. `a` is the index of the right option; `note` shows after the answer.
  quiz: [
    { q: "Where did we go on our very first trip together?", options: ["Goa", "Manali", "Jaipur", "Shimla"], a: 1, note: "The college trip. Hostels, and that's where we opened up." },
    { q: "How many of us went on that first trip?", options: ["Two", "Three", "Four", "Five"], a: 2, note: "Me, my friend, you and our other cousin." },
    { q: "Which city had a stay that was a little haunted?", options: ["Shimla", "Jaipur", "Mysore", "Goa"], a: 1, note: "Spooky stay, crazy fun." },
    { q: "After Shimla, where did we go?", options: ["Goa", "Mysore", "Nani's house", "Manali"], a: 2, note: "Shimla, then Nani's house, with lots of memories." },
    { q: "Our first family trip was to which place?", options: ["Mysore", "Goa", "Jaipur", "Manali"], a: 1, note: "The whole family, and crazy fun." },
    { q: "Who was NOT on the family trip to Goa?", options: ["Mom", "Jiju", "Our other cousin", "Dad"], a: 2, note: "It was just the family that time." },
    { q: "When you and Jiju came to Bangalore, where did we go?", options: ["Mysore", "Goa", "Shimla", "Jaipur"], a: 0, note: "Mysore, and it was crazy fun again." },
  ],

  // Library: put our trips in order. The first line is the earliest.
  tripOrder: [
    "Our first trip: Manali",
    "Manali with our cousin, then Jaipur",
    "Shimla, then Nani's house",
    "Goa, our first family trip",
    "Mysore, with you and Jiju",
  ],


  // Library: memory match. Each sticker becomes a pair.
  memoryTiles: ["star", "heart", "moon", "flower", "bow", "sparkle", "cherry", "leaf"],

  // Studio: creative prompts.
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
  cake: {
    wish: "May you always know how beautiful you are.",
  },
};
