# Pictures for Didi's house

Every picture below has its own complete prompt. Copy the grey box exactly as it is and paste it into ChatGPT: nothing to fill in, nothing to combine. Then save the picture at the path shown, with exactly that name.

The site looks for each picture every time it loads and uses it if it is there. Until then the room keeps its current look, so you can add these one at a time, in any order, and nothing breaks.

## How to make them in ChatGPT

- **Shape.** Each picture says square, landscape or portrait. Pick that shape in ChatGPT before you send the prompt.
- **Transparent pictures (.png).** If one comes back on a white background, remove the white with remove.bg and save it as PNG.
- **Crop tight.** A transparent picture should be cropped close around the object, with no empty margin. If that is fiddly, send them to me and I'll trim them.
- **Textures that repeat (marked "seamless").** If a seam shows where it repeats, send it to me and I'll fix the edges.
- **Two looks.** The journal is **cute**: chubby stickers in sweet pastels, patterned washi tape, wobbly pen doodles. The rest of the house is **painted**: soft oil on canvas, warm light, cream, oxblood red, olive green, antique gold. Each prompt already carries its look.
- **Make a set in one chat.** For the stickers and the doodles, paste their prompts one after another in the same ChatGPT chat. They come out more alike that way.

---

# Still to make

**Start here if you only make a few:** the sparkle and leaf stickers (they finish the set round the record), then the Himachal stickers, the disco ball and the marigold.

| Group | How many | Where it shows |
| --- | --- | --- |
| Journal: stickers | 2 | the journal, plus the invitation, the record and the rooftop |
| Journal: trip stickers | 4 | each trip's own pages |
| Journal: doodles | 9 | drawn over the journal's pages |
| Journal: cover cloth | 1 | the closed book |
| Journal: photos (from you) | 5 | the five pages that are handwritten for now |
| The rest of the house | 7 | games, studio, outside at night |

---

## The journal: the cute kit

The photos are yours. Everything around them (the tape holding them down, the stickers, the doodles in the margins) should feel like a scrapbook made by a little sister: soft, sweet and a bit silly.

### Stickers

These are on every journal page, and also on the invitation, round the record and on the rooftop. They are drawn by the site for now.

#### Sparkle
Save as `assets/stickers/sparkle.png` · square · transparent

```text
A cute puffy die-cut sticker of a soft gold four-point sparkle with two tiny sparkles beside it: a chubby rounded shape, hand-painted in gouache with a soft glossy highlight, in sweet pastel colours, with a thick white border all the way round the whole group. Centred, front view, flat even light. Transparent background. No shadow, no text, no watermark.
```

#### Leaf
Save as `assets/stickers/leaf.png` · square · transparent

```text
A cute puffy die-cut sticker of a single sage green leaf with a pale vein, curling a little at the tip: a chubby rounded shape, hand-painted in gouache with a soft glossy highlight, in sweet pastel colours, with a thick white border all the way round. Centred, front view, flat even light. Transparent background. No shadow, no text, no watermark.
```

### Trip stickers

Each trip's pages get one of their own trip's stickers, in the margin across from the other sticker. On a page that is still handwritten (its photo isn't in yet), it sits in the bottom corner.

#### The wedding: marigold
Save as `assets/stickers/trip-marigold.png` · square · transparent

```text
A cute puffy die-cut sticker of a round ruffled marigold flower in warm orange-yellow with two loose petals beside it: a chubby rounded shape, hand-painted in gouache with a soft glossy highlight, in sweet pastel colours, with a thick white border all the way round. Centred, front view, flat even light. Transparent background. No shadow, no text, no watermark.
```

#### Himachal: little waterfall
Save as `assets/stickers/trip-waterfall.png` · square · transparent

```text
A cute puffy die-cut sticker of a little waterfall tumbling down three round grey rocks into a small pool, with soft white splashes and a tiny green fern at the side: a chubby rounded shape, hand-painted in gouache with a soft glossy highlight, in sweet pastel colours, with a thick white border all the way round. Centred, front view, flat even light. Transparent background. No shadow, no text, no watermark.
```

#### Himachal: pink beanie
Save as `assets/stickers/trip-beanie.png` · square · transparent

```text
A cute puffy die-cut sticker of a fluffy knitted beanie hat in bubblegum pink with a round pompom on top and a folded ribbed brim: a chubby rounded shape, hand-painted in gouache with a soft glossy highlight, in sweet pastel colours, with a thick white border all the way round. Centred, front view, flat even light. Transparent background. No shadow, no logo, no text, no watermark.
```

#### Kasol: disco ball (the rave that wasn't)
Save as `assets/stickers/trip-discoball.png` · square · transparent

```text
A cute puffy die-cut sticker of a small round disco ball made of little silver mirror squares that reflect pink, violet and blue light, hanging from a short string, with two tiny sparkles beside it: a chubby rounded shape, hand-painted in gouache with a soft glossy highlight, in sweet pastel colours, with a thick white border all the way round. Centred, front view, flat even light. Transparent background. No shadow, no text, no watermark.
```

To change which stickers a trip uses, edit `tripStickers` in `js/content.js`. To give a page without a place its own stickers, add `stickers: ["rings", "marigold"]` to that page, as the wedding page has.

### Doodles

Like the doodles in the journal you sent as a reference. They are drawn over the pages and the photos in ink.

#### Heart
Save as `assets/stickers/doodle-heart.png` · square · transparent

```text
A single cute hand-drawn doodle of a scribbly heart drawn with a double line and three tiny motion lines beside it, in cherry red, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Sparkles
Save as `assets/stickers/doodle-sparkles.png` · square · transparent

```text
A single cute hand-drawn doodle of three four-point sparkles of different sizes, in gold, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Daisies
Save as `assets/stickers/doodle-daisies.png` · square · transparent

```text
A single cute hand-drawn doodle of three little daisies with round centres, their petals outlined in sage green, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Arrow
Save as `assets/stickers/doodle-arrow.png` · square · transparent

```text
A single cute hand-drawn doodle of a curly looping arrow with a tiny heart at its tail, in deep blue, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Palm tree
Save as `assets/stickers/doodle-palm.png` · square · transparent

```text
A single cute hand-drawn doodle of a little palm tree with a curved trunk, in olive green, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Bow
Save as `assets/stickers/doodle-bow.png` · square · transparent

```text
A single cute hand-drawn doodle of a ribbon bow with long wavy tails, in dusty rose, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Strawberry
Save as `assets/stickers/doodle-strawberry.png` · square · transparent

```text
A single cute hand-drawn doodle of a strawberry with little seed dots and a leafy top, in red and green, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Camera
Save as `assets/stickers/doodle-camera.png` · square · transparent

```text
A single cute hand-drawn doodle of a small camera with a heart-shaped flash spark coming from it, in deep blue, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

#### Paper plane
Save as `assets/stickers/doodle-plane.png` · square · transparent

```text
A single cute hand-drawn doodle of a paper plane with a dotted looping trail behind it, in deep blue, drawn in thick gel-pen marker, loose and a little wobbly, as if drawn quickly in the margin of a scrapbook. Transparent background. No outline, no shadow, no text, no watermark.
```

### Cover cloth

#### Cherry-red cloth with tiny hearts
Save as `assets/textures/bookcloth.jpg` · square · seamless

```text
Seamless tileable texture of deep cherry-red bookbinding linen seen from directly above, with a tiny scattered print of little hearts and dots in a slightly lighter red, a fine woven texture and a soft sheen, flat even light. No creases, no edges, no text, no watermark.
```

Keep the red deep: the cover's title is cream, and it needs the dark cloth behind it to be read.

### Photos for five pages (from you)

These pages are handwritten for now. Each turns into a photo page as soon as its photo is saved. One photo each is enough. Two to four make a collage page: name them `-01`, `-02` and so on, and tell me, and I'll lay them out.

| Save as | The page |
| --- | --- |
| `assets/journal/manali/manali-01.jpg` | Our first trip, Manali |
| `assets/journal/jaipur/jaipur-01.jpg` | Manali with our cousin, then Jaipur |
| `assets/journal/shimla/shimla-01.jpg` | Shimla, then Nani's house |
| `assets/journal/wedding/wedding-01.jpg` | The wedding |
| `assets/journal/mysore/mysore-01.jpg` | Mysore, when you and Jiju came to Bangalore |

Phone photos are fine. Videos work too (.mp4).

### Cut-outs of her (optional)

In your journal reference, people are cut out of their photos as stickers. Take a photo where she is clear against the background, remove the background (remove.bg, or "lift subject" on your phone), and save it in `assets/journal/cutouts/`. Then add `cut: "assets/journal/cutouts/your-file.png"` to that page in `js/content.js`, or send it to me. The site adds the white edge and the shadow.

---

## The rest of the house (the painted look)

#### The game table: the tablecloth
Save as `assets/textures/tablecloth.jpg` · square · seamless

```text
Seamless tileable texture of a cream linen tablecloth seen from directly above: a fine natural weave with a faint woven self-pattern, flat even light. No folds, no shadows, no edges, no text, no watermark.
```

#### The game table: the torch (find Didi)
Save as `assets/games/torch.png` · square · transparent

```text
An old brass torch (flashlight) lying diagonally across a small instant photo, its round glass end pointing at the photo, a soft circle of warm light falling on the middle of the picture while the rest of the photo is in shadow. Seen from above at a slight angle, painted in soft oil with warm light, worn brass, cream photo border. Transparent background. The photo shows no recognisable face, no text, no watermark.
```

#### The game table: two photos (spot the difference)
Save as `assets/games/two-photos.png` · square · transparent

```text
Two small instant photos lying side by side, slightly overlapping and askew, showing the same blurry cosy room, with a loose hand-drawn red pencil circle around one corner of the right-hand photo, and a short red pencil lying next to them. Seen from above, painted in soft oil with warm light, cream photo borders. Transparent background. No faces, no text, no watermark.
```

#### The game table: the little cake (save the candles)
Save as `assets/games/candles.png` · square · transparent

```text
A small round cake on a cream plate, white frosting with one thin oxblood red ribbon of icing around the middle, with four thin striped birthday candles on top: three lit with small warm flames, one just blown out with a curl of grey smoke. Seen from the front at a slight angle from above, painted in soft oil with warm light. Transparent background. No text, no watermark.
```

You don't need `crossword.png` or `letters.png`: those games are put away for now.

#### The game table: the back of the memory cards
Save as `assets/games/card-back.jpg` · portrait

```text
The back of a vintage playing card, straight-on and filling the whole frame: a fine olive green and cream diamond lattice with a small gold rosette in the centre and a thin cream border, printed-paper texture, flat even light. No text, no numbers, no watermark.
```

#### The studio: art supplies in the corner
Save as `assets/studio/supplies.png` · square · transparent

```text
A small still life of art supplies grouped tightly together, front view: a glass jar of used paintbrushes, a dented tin watercolour palette with half-used colours, a few coloured pencils and a folded paint rag. Painted in soft oil with warm light from the left, muted cream, olive, oxblood and gold. Transparent background, nothing else in frame. No text, no watermark.
```

#### Outside again: the house at night
Save as `assets/cover/house-night.jpg` · landscape

**Attach `assets/cover/door-open.jpg` to the chat first**, then send:

```text
Use the attached painting. Keep the cottage, the open red door, the garden, the path and the composition exactly the same, but make it a warm summer night: a deep blue sky with a few stars, the windows and the open doorway glowing gold from inside, the lantern lit, soft moonlight on the roof and the flowers. Same soft oil-paint style. No text, no watermark.
```

---

# Already in place

You do not need to redo these.

| File | Where it is used |
| --- | --- |
| `assets/cover/painting.jpg` | Behind the invitation (and behind the reel, until its own painting is saved) |
| `assets/dream-house.jpg` | The house with its door closed |
| `assets/cover/door-open.jpg` | The same house with its door open: what the door swings open onto |
| `assets/cover/door-leaf.webp` | The red door between rooms |
| `assets/rooms/inside-hall.jpg` | The front hall, behind the letter |
| `assets/hall/envelope.webp`, `seal.webp` | The envelope and the wax seal in the front hall |
| `assets/frames/*.webp`, `assets/vanity/frame.webp` | The frames on the hallway wall and the game table's wall |
| `assets/frames/oval.webp` | The vanity mirror |
| `assets/vanity/backdrop.jpg` | The vanity's clouds and satin |
| `assets/textures/damask-red.jpg`, `assets/vanity/cloud.webp` | The vanity's red panel and its drifting cloud |
| `assets/rooms/living-wall.jpg` | The living room's red wall |
| `assets/rooms/studio-wall.jpg` | The studio's sunlit wall |
| `assets/rooftop/sky.jpg`, `sky-night.jpg` | The rooftop sky, before and after the candle goes out |
| `assets/cake/cake.webp` | The cake on the rooftop (the flame's place is set in `js/content.js`, `cake.flame`) |
| `assets/textures/paper.jpg`, `kraft.jpg`, `wallpaper.jpg` | Paper, kraft and wallpaper throughout |
| `assets/games/quiz.webp`, `memory.webp` | The odd one out (the index cards) and memory on the table |
| `assets/games/tickets.webp` | The trip tickets (for a game that is put away for now) |
| `assets/journal/tape-cream.webp`, `tape-rose.webp`, `tape-sage.webp` | The washi tape on the journal's photos (the cream one also on the letter and the studio's slip) |
| `assets/stickers/star.webp`, `moon.webp`, `heart.webp`, `bow.webp`, `flower.webp`, `cherry.webp` | The stickers on the journal, round the record, on the invitation and the rooftop |
| `assets/stickers/trip-*.webp` (shell, coconut, sunnies, mountain, noodles, ghost, elephant, train, pine, jasmine) | Each trip's own sticker in the journal; the noodles and the ghost also sit on the K-drama and "when I was little" pages |
| `assets/stickers/trip-dosa.webp`, `trip-rings.webp`, `trip-bridge.webp`, `doodle-sun.webp` | Mysore's dosa, the wedding's rings, Kasol's scary bridge, and the sun doodle in the journal |
| `assets/cover/key.webp` | The brass key over "come in" |
| `assets/textures/plaster.jpg` | The hallway's plaster wall |
| `assets/vanity/table.webp` | The perfume, pearls, lipstick and bow at the foot of the mirror (lifted off its peach background) |
| `assets/record/vinyl.webp` | The record in the living room |
| `assets/rooms/reel-painting.jpg` | The Goa painting behind the reel |
| `assets/originals/full/` | Full-size copies of every photo and painting that was made lighter for the site |
| `assets/originals/` | Your full-size originals of the stickers and tapes. The site uses the smaller copies; keep these in case one needs redoing |

`dream-house.jpg` and `cover/door-open.jpg` must stay the same painting with only the door changed. If you ever redo one, redo both together, or the door won't line up when it swings.

A new frame for the wall needs its opening measured before it can hold a photo, so send it to me.

## The prompts that made them

Kept here in case you ever want to redo one.

<details>
<summary>Show the prompts</summary>

#### The cake
Save as `assets/cake/cake.webp` · portrait · transparent

```text
A three-tier birthday cake on a low cream cake stand, front view, centred, the whole cake and stand in frame. Painted in soft oil on textured canvas with warm golden light from the left. Cream frosting with scalloped piping, a few small oxblood-red sugar roses and touches of gold leaf, one tall thin cream candle in the top tier with its wick unlit. Transparent background. No flame, no text, no watermark, no signature.
```
The site draws the flame itself, so the candle must be unlit. A new cake needs the flame's place set again in `cake.flame`.

#### The studio wall
Save as `assets/rooms/studio-wall.jpg` · landscape

```text
A plain plaster wall in a small artist's studio, seen straight on and filling the frame, painted in soft oil on textured canvas. Warm late-afternoon sun falls across it from a window out of frame on the left, leaving a soft diagonal patch of light and the faint shadow of window bars. Creamy off-white plaster with a few faint old paint smudges and pin holes. Nothing on the wall, no furniture, no floor, no people, no text, no watermark.
```

#### The index cards
Save as `assets/games/quiz.png` · square · transparent

```text
A small stack of five vintage lined index cards, slightly fanned and askew, held together at the top by a silver paper clip, the top card blank. Seen from above at a slight angle, painted in soft oil with warm light, cream paper with faint blue lines. Transparent background. No writing on the cards, no text, no watermark.
```

#### The memory cards
Save as `assets/games/memory.png` · square · transparent

```text
Three vintage playing cards fanned out, two face down showing an olive green back with a fine cream diamond pattern, one face up, blank cream with a single small red heart in the centre. Seen from above, painted in soft oil with warm light. Transparent background. No numbers, no letters, no text, no watermark.
```

#### The trip tickets
Save as `assets/games/tickets.webp` · square · transparent

```text
Three old kraft-paper train ticket stubs overlapping at slight angles, torn perforated edges, faded stamped ink marks, a little worn at the corners. Seen from above, painted in soft oil with warm light, kraft brown and cream. Transparent background. No readable words or numbers, no watermark.
```

#### The living room's red wall
Save as `assets/rooms/living-wall.jpg` · landscape

```text
A deep crimson red wall seen straight on and filling the frame, like red poster paper that was crumpled and smoothed flat again: gentle creases, a faint mottled texture, slightly darker toward the edges, flat warm light. Nothing on it, no objects, no text, no watermark.
```

#### The night sky
Save as `assets/rooftop/sky-night.jpg` · landscape

```text
A night sky at the end of a summer evening, painted in soft oil on textured canvas. Deep indigo at the top fading to dusky plum, with a last thin band of warm rose along the bottom edge, a slim crescent moon high on the right, a scatter of small faint stars and a few soft dark clouds. Sky only: no buildings, no trees, no people, no text, no watermark.
```

#### The hall, with a red door
Save as `assets/rooms/inside-hall.jpg` · portrait. Attach the old hall painting first.

```text
Use the attached painting. Keep everything exactly the same: the composition, the light, the plain wall on the left, the runner, the arch, the table with roses and the framed landscape. Only repaint the open door on the far left in deep oxblood red, with the same brass knob and letterbox. Same soft oil-paint style. No text, no watermark.
```

#### The envelope
Save as `assets/hall/envelope.png` · landscape · transparent

```text
An opened vintage kraft paper envelope seen from the back, lying flat, its triangular flap folded open upward, empty, with slightly worn corners and soft creases. Painted in soft oil with warm light from the left, kraft brown. Transparent background. No wax seal, no stamp, no writing, no watermark.
```

#### The wax seal
Save as `assets/hall/seal.png` · square · transparent

```text
A single round wax seal in deep oxblood red seen from directly above: a thick, slightly irregular puddle of wax with soft rounded edges and a glossy surface, the centre left smooth and blank. Transparent background. No letter, no monogram, no text, no watermark.
```

#### The red damask
Save as `assets/textures/damask-red.jpg` · square · seamless

```text
Seamless tileable deep crimson damask wallpaper: an embossed baroque floral pattern in a slightly lighter crimson, the look of flocked velvet wallpaper, flat even light, straight-on. No shading, no vignette, no text, no watermark.
```

#### The drifting cloud
Save as `assets/vanity/cloud.png` · landscape · transparent

```text
A single soft cumulus cloud lit from below by warm peach sunset light, painterly, with fluffy rounded edges that fade softly to nothing. Transparent background. No sky, no text, no watermark.
```

</details>

---

# Words you supply

All in `js/content.js`. Anything still in [brackets], and any caption that still says "add the story" or "add a memory", stays hidden until you replace it.

- `record.tracks`: more of her songs. Four are in; add each as `{ title: "Song", by: "Artist", link: "the Spotify share link" }`. With a link the song plays right in the living room.
- `affirmations`: two more kind lines for the mirror
- `names`: the other names she called you
- `photos`: a caption for each frame on the wall (optional)
- `reel.slots` and `reel.notes`: a caption for each slide, and a line for the disc
