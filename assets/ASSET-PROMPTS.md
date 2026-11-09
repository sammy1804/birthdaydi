# Asset prompts for Didi's site

Drop each file at the path shown. The site checks for it on load and uses it when it's there. A missing file keeps the drawn fallback, so you can add these one at a time.

Create the folders first: `assets/cover`, `assets/textures`, `assets/stickers`.

Tips for any image tool:
- Generate at the size listed, or larger.
- For transparent PNGs: generate on a plain white background, then remove it (remove.bg, or Photoshop's Select Subject). Export as PNG.
- Every prompt ends with the same guard: no text, no watermark, no signature.

---

## 1. Cover backdrop: `assets/cover/painting.jpg` (3:2, 2400×1600, JPG)

The biggest single upgrade. It sits behind the invitation.

> A painterly oil-on-canvas pastoral garden scene in the style of 18th-century French rococo painting, muted olive, sage and ochre palette, soft misty trees along a still lake, a few pale-dressed figures dancing far in the background at the edges, faded old varnish, visible brushwork, the centre left calm and empty for overlaid text, no text, no signature, no frame, no watermark.

## 2. Paper texture: `assets/textures/paper.jpg` (2048×2048, seamless, JPG)

> Seamless tileable warm cream laid paper texture, faint fibres and tiny speckles, even flat lighting, top-down scan look, no shadows, no vignette, no lines or pattern, no text, no watermark.

## 3. Kraft texture: `assets/textures/kraft.jpg` (1024×1024, seamless, JPG)

Used on the name tags and the torn note on the record.

> Seamless tileable brown kraft paper texture, fine fibres, light natural mottling, flat scan, no creases, no shadows, no text, no watermark.

## 4. Library wallpaper: `assets/textures/wallpaper.jpg` (1024×1024, seamless, JPG)

> Seamless tileable dark olive green wallpaper with a small, low-contrast botanical damask pattern in a slightly lighter tone, printed-paper texture, flat, no shading, no text, no watermark.

## 5. Dream house: `assets/dream-house.jpg` (1:1, 1200×1200, JPG)

If she has a real photo of her dream house, use that instead. If you want an illustration in the site's palette, use this, then point `dreamHouse` in `js/content.js` to it.

> A small dream house at dusk, square composition, cream walls, deep oxblood roof, warm gold lit windows, an arched door, an olive garden with a stone path, gouache painting look with visible paper texture, the house centred and filling about 80% of the frame, muted palette, no text, no people, no watermark.

## 6–13. Die-cut stickers (600×600, transparent PNG, one per file)

Shared style: a die-cut sticker with a thin white outline, flat vintage illustration, soft drop shadow, centred, transparent background.

**6. `assets/stickers/star.png`**
> A single five-point star die-cut sticker, antique gold (#c9a04f), slightly hand-cut edges, faint highlight, thin white outline, soft drop shadow, transparent background, centred, no text, no watermark.

**7. `assets/stickers/sparkle.png`**
> A four-pointed sparkle die-cut sticker, antique gold (#c9a04f), thin white outline, soft drop shadow, transparent background, centred, no text, no watermark.

**8. `assets/stickers/flower.png`**
> A five-petal flower die-cut sticker, cream petals with a gold centre, thin white outline, soft drop shadow, transparent background, centred, no stem, no text, no watermark.

**9. `assets/stickers/heart.png`**
> A heart die-cut sticker in muted rose red (#b8615a), a soft fold highlight, thin white outline, soft drop shadow, transparent background, centred, no text, no watermark.

**10. `assets/stickers/moon.png`**
> A crescent moon die-cut sticker in antique gold, thin white outline, soft drop shadow, transparent background, centred, no face, no text, no watermark.

**11. `assets/stickers/bow.png`**
> A small ribbon bow die-cut sticker in deep oxblood (#6e1f2a) with a gold knot and two short tails, thin white outline, soft drop shadow, transparent background, centred, no text, no watermark.

**12. `assets/stickers/cherry.png`**
> Two cherries on a stem with one olive leaf, deep red and olive green, thin white outline, soft drop shadow, transparent background, centred, no text, no watermark.

**13. `assets/stickers/leaf.png`**
> A single olive-green leaf with a pale vein, die-cut sticker, thin white outline, soft drop shadow, transparent background, centred, no text, no watermark.

---

## Not assets (you supply these)

- Hallway photos and videos: `js/content.js`, `photos`
- Reel slides: `js/content.js`, `reel.slots`
- Record label photo or video: `js/content.js`, `record.centerSrc`
- Gate squares: `js/content.js`, `gate.tiles` (set `correct: true` on hers)
- Text: the letter, names, captions, tracks, wishes, all in `js/content.js`

---

## Mirror (the vanity)

The vanity is a soft sky of clouds over a satin drape, with the mirror in front. These two images are optional: the page works without them, and drops them in when they are there.

**assets/vanity/backdrop.jpg** (portrait, about 1080 x 1920)
> Soft studio still life, a peach-cream satin drape falling in long folds across the bottom third, fluffy white clouds drifting behind it on a warm beige sky, the centre left open for a mirror, soft diffused light, dreamy and calm, photorealistic. No objects, no text, no people.

**assets/vanity/frame.png** (portrait 3:4, PNG with transparent centre)
> An ornate antique gold baroque mirror frame, front view, perfectly centred, carved scrolls and leaves, a small crest at the top. The centre is empty and transparent, no glass reflection, no shadow on the background, photorealistic, high detail.

**Option B, not built yet:** a gallery wall with a cream damask wall, gold-framed pictures around the edges (some with a pin or a clipped corner), and an oval gold mirror in the middle. Tell me if you want this version instead.

## Journal extras

**assets/journal/cover.jpg** (square, optional): top-down flat lay of a hardbound cover, dusty navy blue linen with a fine woven texture and a thin gold stitched border, no text.

**assets/journal/tape.png** (3:1, transparent PNG): a strip of cream washi tape with a torn, deckled edge, slightly translucent, flat, no shadow.

## Photos for the journal (save them with these exact names)

Saved names are read as-is. A missing file shows a placeholder, so nothing breaks while you add them.

- **assets/journal/people/**: people-01.jpg (the two of us with Mom in the middle), people-02.jpg (you, under the tree), people-03.jpg (you, by the tree), people-04.jpg (with Dadi), people-05.jpg (me and Mom), people-06.jpg (with Jiju).
- **assets/journal/goa/**: goa-01.jpg to goa-20.jpg, in the order you sent them. Four are wired in now (01, 03, 16, 17). The rest can go on later pages.
