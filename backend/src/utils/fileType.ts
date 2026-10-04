import { DetectedFile } from '../types/upload.types';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'mif1', 'msf1']);

const ascii = (buffer: Buffer, start: number, end: number): string =>
  buffer.subarray(start, end).toString('latin1');

// The type is read from the file's own leading bytes: the name and the Content-Type a client sends
// are both attacker-controlled, and trusting them would let an HTML or script file be stored and
// later served as if it were an image (OWASP unrestricted file upload)
export function detectFileType(buffer: Buffer): DetectedFile | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (buffer.subarray(0, 8).equals(PNG)) return { ext: 'png', mime: 'image/png' };

  const head = ascii(buffer, 0, 6);
  if (head === 'GIF87a' || head === 'GIF89a') return { ext: 'gif', mime: 'image/gif' };
  if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  if (ascii(buffer, 4, 8) === 'ftyp' && HEIC_BRANDS.has(ascii(buffer, 8, 12))) {
    return { ext: 'heic', mime: 'image/heic' };
  }
  if (ascii(buffer, 0, 5) === '%PDF-') return { ext: 'pdf', mime: 'application/pdf' };

  return null;
}
