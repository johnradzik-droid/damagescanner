import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function writePNG(filePath, width, height, paint) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = paint(x, y, width, height);
      const o = row + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, png);
}

function inRoundRect(px, py, x, y, w, h, r) {
  if (px < x || py < y || px > x + w || py > y + h) return false;
  const lx = px - x;
  const ly = py - y;
  if (lx < r && ly < r) return (lx - r) ** 2 + (ly - r) ** 2 <= r * r;
  if (lx > w - r && ly < r) return (lx - (w - r)) ** 2 + (ly - r) ** 2 <= r * r;
  if (lx < r && ly > h - r) return (lx - r) ** 2 + (ly - (h - r)) ** 2 <= r * r;
  if (lx > w - r && ly > h - r) return (lx - (w - r)) ** 2 + (ly - (h - r)) ** 2 <= r * r;
  return true;
}

function paint(x, y, size) {
  const pad = Math.round(size * 0.08);
  const rr = Math.round(size * 0.18);
  if (!inRoundRect(x, y, pad, pad, size - pad * 2, size - pad * 2, rr)) {
    return [12, 12, 12, 255];
  }
  // gold tile
  const gold = [255, 225, 74];
  // simple car body
  const cx = size / 2;
  const cy = size / 2 + size * 0.04;
  const bodyW = size * 0.52;
  const bodyH = size * 0.28;
  const inBody =
    x > cx - bodyW / 2 &&
    x < cx + bodyW / 2 &&
    y > cy - bodyH / 2 &&
    y < cy + bodyH / 2;
  const roof =
    x > cx - bodyW * 0.28 &&
    x < cx + bodyW * 0.28 &&
    y > cy - bodyH * 0.95 &&
    y < cy - bodyH * 0.1;
  const wheelY = cy + bodyH / 2 - size * 0.02;
  const wheelR = size * 0.07;
  const leftWheel = (x - (cx - bodyW * 0.28)) ** 2 + (y - wheelY) ** 2 <= wheelR * wheelR;
  const rightWheel = (x - (cx + bodyW * 0.28)) ** 2 + (y - wheelY) ** 2 <= wheelR * wheelR;
  if (inBody || roof || leftWheel || rightWheel) return [12, 12, 12, 255];
  return [...gold, 255];
}

const dir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(dir, { recursive: true });
for (const size of [32, 180, 192, 512]) {
  const name =
    size === 32
      ? "favicon-32.png"
      : size === 180
        ? "apple-touch-icon.png"
        : `icon-${size}.png`;
  writePNG(path.join(dir, name), size, size, (x, y, w) => paint(x, y, w));
}
fs.copyFileSync(path.join(dir, "favicon-32.png"), path.join(process.cwd(), "app", "icon.png"));
console.log("wrote icons");
