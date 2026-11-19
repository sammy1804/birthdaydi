The photos and clips for the hallway wall, the gate, the reel and the record.

  chat/   the photos on the hallway wall
  didi/   photos of her: the mirror, the record, and the squares of the gate that show her
  real/   photos without her in them: the other squares of the gate
  ../clips/  the short videos on the hallway wall

To add one to the wall, save it here and add a line to "photos" in js/content.js:

  photos: [
    { src: "assets/photos/chat/photo-25.jpg", caption: "a few words about it" },
    ...
  ]

Each one hangs in a frame. The frame crops the photo to fit, so any shape works;
portrait photos and videos fill the frames best. A caption is optional.
