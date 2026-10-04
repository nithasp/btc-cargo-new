import { isTooSimilar, isValidEmail, isValidUsername, passwordProblems } from '../../schemas/auth.schema';
import { pageSchema } from '../../schemas/common.schema';
import { hashPassword, verifyPassword } from '../../services/password.service';
import { detectFileType } from '../../utils/fileType';
import { escapeHtml, formatMoney, odooDateTime, round2 } from '../../utils/format';
import { toPagination } from '../../utils/pagination';
import { toFieldErrors } from '../../utils/validation';
import { userUpdateSchema } from '../../schemas/user.schema';

describe('Rules', () => {
  describe('registration', () => {
    it('accepts the username characters Django does and nothing else', () => {
      expect(isValidUsername('som.chai_99@x+y-z')).toBe(true);
      expect(isValidUsername('has space')).toBe(false);
      expect(isValidUsername('emoji😀')).toBe(false);
      expect(isValidUsername('')).toBe(false);
    });

    it('recognises an e-mail address', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
      expect(isValidEmail('a@b')).toBe(false);
      expect(isValidEmail('a b@c.co')).toBe(false);
    });

    it('names each weakness of a password', () => {
      expect(passwordProblems('Str0ng!pass')).toEqual([]);
      expect(passwordProblems('abc')[0]).toContain('short');
      expect(passwordProblems('12345678').join(' ')).toContain('numeric');
      expect(passwordProblems('PASSWORD')[0]).toContain('common');
    });

    it('spots a password built from the username', () => {
      expect(isTooSimilar('somchai2024', 'somchai')).toBe(true);
      expect(isTooSimilar('SOMCHAI', 'somchai')).toBe(true);
      expect(isTooSimilar('Str0ng!pass', 'somchai')).toBe(false);
      expect(isTooSimilar('abcdefgh', 'abc')).toBe(false);
    });
  });

  describe('passwords', () => {
    it('are hashed with a salt and verified against the hash', async () => {
      const first = await hashPassword('Str0ng!pass');
      const second = await hashPassword('Str0ng!pass');

      expect(first).not.toBe(second);
      expect(first).not.toContain('Str0ng');
      expect(await verifyPassword('Str0ng!pass', first)).toBe(true);
      expect(await verifyPassword('str0ng!pass', first)).toBe(false);
    });
  });

  describe('file type detection', () => {
    it('reads the type from the leading bytes', () => {
      const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(12)]);
      const pdf = Buffer.from('%PDF-1.7 some content');
      const webp = Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1');

      expect(detectFileType(jpeg)).toEqual({ ext: 'jpg', mime: 'image/jpeg' });
      expect(detectFileType(pdf)?.mime).toBe('application/pdf');
      expect(detectFileType(webp)?.mime).toBe('image/webp');
      expect(detectFileType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
      expect(detectFileType(Buffer.from('tiny'))).toBeNull();
    });
  });

  describe('formatting', () => {
    it('writes timestamps as naive UTC, the form the frontend shifts by seven hours', () => {
      expect(odooDateTime(new Date('2026-10-03T08:15:30.123Z'))).toBe('2026-10-03 08:15:30');
      expect(odooDateTime(null)).toBeNull();
    });

    it('formats and rounds money', () => {
      expect(formatMoney(1234567.5)).toBe('1,234,567.50');
      expect(round2(1.005)).toBe(1.01);
      expect(round2(10.004)).toBe(10);
    });

    it('escapes text placed into a report page', () => {
      expect(escapeHtml('<script>alert("x")</script>')).toBe(
        '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
      );
      expect(escapeHtml(null)).toBe('');
    });
  });

  describe('pagination', () => {
    it('defaults, bounds and converts page parameters', () => {
      expect(pageSchema.parse({})).toEqual({ page: 1, pageSize: 10, limit: 10, offset: 0 });
      expect(pageSchema.parse({ page: '3', pageSize: '20' })).toEqual({
        page: 3,
        pageSize: 20,
        limit: 20,
        offset: 40,
      });
      expect(pageSchema.safeParse({ pageSize: '101' }).success).toBe(false);
      expect(pageSchema.safeParse({ page: '-1' }).success).toBe(false);
      expect(pageSchema.safeParse({ page: '1.5' }).success).toBe(false);
    });

    it('always reports at least one page', () => {
      const page = pageSchema.parse({});
      expect(toPagination(page, 0)).toEqual({ page: 1, pageSize: 10, startPage: 1, endPage: 1, records: 0 });
      expect(toPagination(page, 21).endPage).toBe(3);
    });
  });

  describe('field errors', () => {
    it('nest the way a nested form is reported', () => {
      const result = userUpdateSchema.safeParse({
        first_name: 5,
        extendeduser: { birthDate: 'x', has_consent: 'yes' },
      });
      expect(result.success).toBe(false);
      if (result.success) return;

      const errors = toFieldErrors(result.error);
      expect(Array.isArray(errors.first_name)).toBe(true);
      expect((errors.extendeduser as Record<string, string[]>).birthDate?.length).toBe(1);
      expect((errors.extendeduser as Record<string, string[]>).has_consent).toBeDefined();
    });
  });
});
