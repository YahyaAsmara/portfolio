/* One-off: turn the supplied raster logos into tight white-on-transparent PNGs.
 * - symend.png  : already white on transparent -> just trim the padding
 * - uofc.png    : black lockup on white -> crop to crest, key white out, recolor white
 * Run: node scripts/process-logos.cjs
 */
const Jimp = require('jimp');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'public', 'assets');

function bbox(img, yStart, yEnd, isInk) {
  const W = img.bitmap.width;
  const d = img.bitmap.data;
  let minX = W, minY = img.bitmap.height, maxX = -1, maxY = -1;
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < W; x++) {
      const i = (W * y + x) * 4;
      if (isInk(d[i], d[i + 1], d[i + 2], d[i + 3])) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

// Density-based bbox locked to the dense ink cluster: a row/column only counts
// if its ink density is a fair fraction of the peak row/column. This ignores
// both sparse edge noise and thin frame lines that span the image.
function densityBBox(img, isInk, frac) {
  const W = img.bitmap.width, H = img.bitmap.height, d = img.bitmap.data;
  const col = new Array(W).fill(0), row = new Array(H).fill(0);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (W * y + x) * 4;
      if (isInk(d[i], d[i + 1], d[i + 2], d[i + 3])) { col[x]++; row[y]++; }
    }
  }
  const ct = frac * Math.max(...col), rt = frac * Math.max(...row);
  let minX = 0; while (minX < W && col[minX] < ct) minX++;
  let maxX = W - 1; while (maxX > 0 && col[maxX] < ct) maxX--;
  let minY = 0; while (minY < H && row[minY] < rt) minY++;
  let maxY = H - 1; while (maxY > 0 && row[maxY] < rt) maxY--;
  return { minX, minY, maxX, maxY };
}

// Erode the ink mask by radius r (min-filter), then take the absolute bbox.
// Thin frame lines / speckle (<= 2r px) disappear; thick logo strokes survive.
function erodedBBox(img, isInk, r) {
  const W = img.bitmap.width, H = img.bitmap.height, d = img.bitmap.data;
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (W * y + x) * 4;
      if (isInk(d[i], d[i + 1], d[i + 2], d[i + 3])) mask[y * W + x] = 1;
    }
  }
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = r; y < H - r; y++) {
    for (let x = r; x < W - r; x++) {
      let all = true;
      for (let dy = -r; dy <= r && all; dy++)
        for (let dx = -r; dx <= r; dx++)
          if (!mask[(y + dy) * W + (x + dx)]) { all = false; break; }
      if (all) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

function cropBox(img, bb, pad) {
  const x = Math.max(0, bb.minX - pad);
  const y = Math.max(0, bb.minY - pad);
  const w = Math.min(img.bitmap.width - x, bb.maxX - bb.minX + 1 + 2 * pad);
  const h = Math.min(img.bitmap.height - y, bb.maxY - bb.minY + 1 + 2 * pad);
  return { x, y, w, h };
}

(async () => {
  const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  const ramp = (v, lo, hi) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

  // ---- Symend: pure-white icon over a baked grey checkerboard (squares ~176
  // and ~208-224). Keep only near-pure-white so the whole checker disappears. ----
  const sym = await Jimp.read(path.join(ASSETS, 'symend.png'));
  const sbb = erodedBBox(sym, (r, g, b) => lum(r, g, b) > 245, 3);
  const sc = cropBox(sym, sbb, 18);
  sym.crop(sc.x, sc.y, sc.w, sc.h);
  sym.scan(0, 0, sym.bitmap.width, sym.bitmap.height, (x, y, i) => {
    const d = sym.bitmap.data;
    const alpha = ramp(lum(d[i], d[i + 1], d[i + 2]), 240, 254); // checker -> 0, white -> 1
    d[i] = 255;
    d[i + 1] = 255;
    d[i + 2] = 255;
    d[i + 3] = Math.round(alpha * 255);
  });
  await sym.writeAsync(path.join(ASSETS, 'symend-icon.png'));
  console.log('symend-icon.png', sc);

  // ---- UCalgary: crop crest, key white -> transparent, recolor white ----
  const uc = await Jimp.read(path.join(ASSETS, 'uofc.png'));
  const crestEnd = Math.floor(uc.bitmap.height * 0.55); // exclude the wordmark
  const ubb = bbox(uc, 0, crestEnd, (r, g, b, a) => a > 30 && lum(r, g, b) < 140);
  const ucc = cropBox(uc, ubb, 6);
  uc.crop(ucc.x, ucc.y, ucc.w, ucc.h);
  uc.scan(0, 0, uc.bitmap.width, uc.bitmap.height, (x, y, i) => {
    const d = uc.bitmap.data;
    const ink = 255 - lum(d[i], d[i + 1], d[i + 2]); // white bg -> 0, black ink -> 255
    const alpha = Math.round(ink * (d[i + 3] / 255));
    d[i] = 255;
    d[i + 1] = 255;
    d[i + 2] = 255;
    d[i + 3] = alpha;
  });
  await uc.writeAsync(path.join(ASSETS, 'uofc-crest.png'));
  console.log('uofc-crest.png', ucc);
})();
