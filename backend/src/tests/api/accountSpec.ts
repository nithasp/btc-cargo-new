import { TestUser } from '../../types/test.types';
import { ADDRESS, api, ensureReferenceData, registerUser } from '../support/api';

describe('Account', () => {
  let user: TestUser;
  let other: TestUser;

  beforeAll(async () => {
    await ensureReferenceData();
    user = await registerUser('REFCODE1');
    other = await registerUser();
  });

  describe('GET /api/user/', () => {
    it('returns the shape the frontend reads, with empty strings rather than nulls for names', async () => {
      const fresh = await registerUser('REFCODE1');
      const res = await fresh.get('/api/user/');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(fresh.id);
      expect(res.body.username).toBe(fresh.username);
      expect(res.body.first_name).toBe('');
      expect(res.body.last_name).toBe('');
      expect(res.body.is_staff).toBe(false);
      expect(res.body.socials).toEqual({ google: null, facebook: null, line: null });
      expect(res.body.extendeduser.referralCode).toBe('REFCODE1');
      expect(res.body.extendeduser.has_consent).toBe(false);
      expect(res.body.extendeduser.line_notify).toBe(false);
      expect(res.body.password).toBeUndefined();
    });
  });

  describe('PUT /api/user/', () => {
    it('updates the profile and accepts the whole user object echoed back', async () => {
      const current = (await user.get('/api/user/')).body;
      const res = await user.put('/api/user/', {
        ...current,
        first_name: 'Somchai',
        last_name: 'Jaidee',
        extendeduser: {
          ...current.extendeduser,
          birthDate: '1990-12-31',
          telephone: '0811111111',
          has_consent: true,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.first_name).toBe('Somchai');
      expect(res.body.extendeduser.birthDate).toBe('1990-12-31');
      expect(res.body.extendeduser.telephone).toBe('0811111111');
      expect(res.body.extendeduser.has_consent).toBe(true);
    });

    it('ignores every read-only field', async () => {
      const res = await user.put('/api/user/', {
        id: other.id,
        username: 'hijacked',
        email: 'hijacked@mail.test',
        is_staff: true,
        role: 'admin',
        extendeduser: { referralCode: 'CHANGED', line_notify: true },
      });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
      expect(res.body.username).toBe(user.username);
      expect(res.body.is_staff).toBe(false);
      expect(res.body.extendeduser.referralCode).toBe('REFCODE1');
      expect(res.body.extendeduser.line_notify).toBe(false);
    });

    it('rejects a date that is not a real YYYY-MM-DD date', async () => {
      for (const birthDate of ['Date Invalid', '2024-02-31', '31-12-1990']) {
        const res = await user.put('/api/user/', { extendeduser: { birthDate } });
        expect(res.status).toBe(400);
        expect(res.body.extendeduser.birthDate).toBeDefined();
      }
    });

    it("refuses another user's address as the default address", async () => {
      const theirs = await other.post('/api/address/', ADDRESS).expect(201);
      const res = await user.put('/api/user/', { extendeduser: { shippingAddressId: theirs.body.id } });

      expect(res.status).toBe(400);
      expect(res.body.extendeduser.shippingAddressId).toBeDefined();
    });
  });

  describe('/api/address/', () => {
    it("creates, lists, updates and deletes the caller's addresses", async () => {
      const created = await user.post('/api/address/', { ...ADDRESS, user: other.id });
      expect(created.status).toBe(201);
      expect(created.body.user).toBe(user.id);

      const listed = await user.get('/api/address/');
      expect(listed.body.map((address: { id: number }) => address.id)).toContain(created.body.id);

      const updated = await user.put(`/api/address/${created.body.id}/`, {
        ...created.body,
        name: 'Office',
        is_juristic: true,
        vat: '0105500000000',
      });
      expect(updated.body.name).toBe('Office');
      expect(updated.body.is_juristic).toBe(true);

      await user.put('/api/user/', { extendeduser: { billingAddressId: created.body.id } }).expect(200);
      await user.delete(`/api/address/${created.body.id}/`).expect(204);

      const me = await user.get('/api/user/');
      expect(me.body.extendeduser.billingAddressId).toBeNull();
    });

    it('fills in the optional fields the form may leave out', async () => {
      const res = await user.post('/api/address/', {
        name: 'Home',
        person: 'A',
        address: '1 Road',
        district: '104101',
      });
      expect(res.status).toBe(201);
      expect(res.body.telephone).toBe('');
      expect(res.body.is_juristic).toBe(false);
      expect(res.body.vat).toBe('');
    });

    it('reports missing or malformed fields per field', async () => {
      const res = await user.post('/api/address/', { name: '', district: 'abc' });
      expect(res.status).toBe(400);
      expect(res.body.name).toBeDefined();
      expect(res.body.person).toEqual(['This field is required.']);
      expect(res.body.district).toBeDefined();
    });

    it("hides another user's address behind a 404", async () => {
      const mine = await user.post('/api/address/', ADDRESS).expect(201);
      const path = `/api/address/${mine.body.id}/`;

      expect((await other.get(path)).status).toBe(404);
      expect((await other.put(path, { name: 'Stolen' })).status).toBe(404);
      expect((await other.delete(path)).status).toBe(404);
      expect((await other.get('/api/address/')).body.some((a: { id: number }) => a.id === mine.body.id)).toBe(
        false,
      );
      expect((await api.get(path)).status).toBe(401);
    });
  });

  describe('LINE Notify', () => {
    it('reports the retired service and still lets a user switch it off', async () => {
      expect((await user.get('/api/line_notify/link/')).status).toBe(410);
      const res = await user.post('/api/line_notify/revoke/');
      expect(res.body).toEqual({ success: true });
    });
  });
});
