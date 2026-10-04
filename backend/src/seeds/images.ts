import zlib from 'zlib';
import { Rgb } from '../types/seed.types';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SIZE = 160;

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const lighten = (color: Rgb, amount: number): Rgb =>
  color.map((channel) => Math.round(channel + (255 - channel) * amount)) as Rgb;

// A small product tile, drawn as a PNG. The frontend's sanitizer accepts base64 PNG data URLs in
// an <img>, but rejects SVG ones, so the seeded catalog carries its pictures in this form.
export function productTile(color: Rgb): string {
  const centre = SIZE / 2;
  const light = lighten(color, 0.45);
  const pale = lighten(color, 0.8);
  const raw = Buffer.alloc((SIZE * 3 + 1) * SIZE);

  for (let y = 0; y < SIZE; y += 1) {
    const row = y * (SIZE * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < SIZE; x += 1) {
      const distance = Math.hypot(x - centre, y - centre);
      const pixel = distance < SIZE * 0.2 ? pale : distance < SIZE * 0.34 ? light : color;
      raw.set(pixel, row + 1 + x * 3);
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header.set([8, 2, 0, 0, 0], 8);

  const png = Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString('base64')}`;
}
