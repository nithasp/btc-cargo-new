import jwt from 'jsonwebtoken';
import { config } from '../../config';
import pool from '../../database';
import { seedDemo } from '../../seeds/demo';
import { signReportToken } from '../../services/token.service';
import {
  api,
  clientFor,
  ensureReferenceData,
  ORIGIN,
  refreshCookieOf,
  registerUser,
  uniqueName,
} from '../support/api';

describe('Authentication', () => {
  beforeAll(ensureReferenceData);

  describe('POST /api/registration/', () => {
    it('answers 201 with a key and sets the refresh token as an HttpOnly cookie', async () => {
      const username = uniqueName('reg');
      const res = await api.post('/api/registration/').send({
        username,
        email: `${username}@mail.test`,
        password1: 'Str0ng!pass',
        password2: 'Str0ng!pass',
        extendeduser: { referralCode: 'ANYCODE' },
      });

      expect(res.status).toBe(201);
      expect(typeof res.body.key).toBe('string');
      expect(Object.keys(res.body)).toEqual(['key']);

      const cookie = (res.headers['set-cookie'] as unknown as string[])[0] ?? '';
      expect(cookie).toContain('refreshToken=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Path=/api/auth');
    });

    it('never lets a client make itself staff', async () => {
      const username = uniqueName('staff');
      const res = await api.post('/api/registration/').send({
        username,
        email: `${username}@mail.test`,
        password1: 'Str0ng!pass',
        password2: 'Str0ng!pass',
        is_staff: true,
        role: 'admin',
      });
      const me = await clientFor(res.body.key).get('/api/user/');
      expect(me.body.is_staff).toBe(false);
    });

    it('reports each problem with the wording the register page looks for', async () => {
      const taken = await registerUser();

      const duplicate = await api.post('/api/registration/').send({
        username: taken.username.toUpperCase(),
        email: `${taken.username}@mail.test`,
        password1: '12345678',
        password2: '12345678',
      });
      expect(duplicate.status).toBe(400);
      expect(duplicate.body.username[0]).toContain('exists');
      expect(duplicate.body.email).toBeDefined();
      expect(duplicate.body.password1.join(' ')).toContain('numeric');
      expect(duplicate.body.password1.join(' ')).toContain('common');

      const invalid = await api.post('/api/registration/').send({
        username: 'bad name!',
        email: 'not-an-email',
        password1: 'short',
        password2: 'short',
      });
      expect(invalid.body.username[0]).toContain('valid');
      expect(invalid.body.email).toBeDefined();
      expect(invalid.body.password1[0]).toContain('short');

      const username = uniqueName('sim');
      const similar = await api.post('/api/registration/').send({
        username,
        email: `${username}@mail.test`,
        password1: `${username}!9`,
        password2: `${username}!9`,
      });
      expect(similar.body.non_field_errors).toBeDefined();

      const missing = await api.post('/api/registration/').send({});
      expect(missing.status).toBe(400);
      expect(missing.body.username).toEqual(['This field is required.']);
    });
  });

  describe('POST /api/login/', () => {
    it('accepts the right password, in any letter case of the username', async () => {
      const user = await registerUser();
      const res = await api
        .post('/api/login/')
        .send({ username: user.username.toUpperCase(), password: user.password });
      expect(res.status).toBe(200);
      expect(typeof res.body.key).toBe('string');
    });

    it('answers a wrong password and an unknown account the same way', async () => {
      const user = await registerUser();
      const wrong = await api
        .post('/api/login/')
        .send({ username: user.username, password: 'nope-nope-nope' });
      const unknown = await api
        .post('/api/login/')
        .send({ username: uniqueName('ghost'), password: 'nope-nope-nope' });

      expect(wrong.status).toBe(400);
      expect(unknown.status).toBe(400);
      expect(wrong.body).toEqual(unknown.body);
      expect(wrong.body.non_field_errors).toBeDefined();
    });
  });

  describe('POST /api/auth/demo/', () => {
    const setRole = (role: string) =>
      pool.query('UPDATE users SET role = $1 WHERE username = $2', [role, config.demo.username]);

    beforeAll(async () => {
      await seedDemo(pool);
    });

    it('signs a visitor in as the seeded demo account with an ordinary session', async () => {
      const res = await api.post('/api/auth/demo/').set('Origin', ORIGIN);

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(['key']);

      const cookie = (res.headers['set-cookie'] as unknown as string[])[0] ?? '';
      expect(cookie).toContain('refreshToken=');
      expect(cookie).toContain('HttpOnly');

      const me = await clientFor(res.body.key).get('/api/user/');
      expect(me.body.username).toBe(config.demo.username);
      expect(me.body.is_staff).toBe(false);

      const renewed = await api
        .post('/api/auth/refresh/')
        .set('Cookie', refreshCookieOf(res))
        .set('Origin', ORIGIN);
      expect(renewed.status).toBe(200);
    });

    it('signs in as the demo account whatever account the request names', async () => {
      const other = await registerUser();
      const res = await api
        .post('/api/auth/demo/')
        .send({ username: other.username, userId: other.id, role: 'admin' });

      const me = await clientFor(res.body.key).get('/api/user/');
      expect(me.body.username).toBe(config.demo.username);
      expect(me.body.is_staff).toBe(false);
    });

    it('is refused from an origin that is not allowed', async () => {
      const res = await api.post('/api/auth/demo/').set('Origin', 'https://evil.example');
      expect(res.status).toBe(403);
      expect(res.headers['set-cookie']).toBeUndefined();
    });

    it('answers 404 once demo access is switched off', async () => {
      config.demo.loginEnabled = false;
      try {
        const res = await api.post('/api/auth/demo/');
        expect(res.status).toBe(404);
        expect(res.body.code).toBe('not_found');
        expect(res.headers['set-cookie']).toBeUndefined();
      } finally {
        config.demo.loginEnabled = true;
      }
    });

    it('never hands out a staff session', async () => {
      await setRole('admin');
      try {
        const res = await api.post('/api/auth/demo/');
        expect(res.status).toBe(404);
        expect(res.headers['set-cookie']).toBeUndefined();
      } finally {
        await setRole('customer');
      }
    });
  });

  describe('access token', () => {
    it('is accepted with the "Token" scheme the frontend sends, and with "Bearer"', async () => {
      const user = await registerUser();
      const asToken = await api.get('/api/user/').set('Authorization', `Token ${user.key}`);
      const asBearer = await api.get('/api/user/').set('Authorization', `Bearer ${user.key}`);
      expect(asToken.status).toBe(200);
      expect(asBearer.status).toBe(200);
    });

    it('is rejected when missing, malformed, expired or signed with another algorithm', async () => {
      const user = await registerUser();

      const none = await api.get('/api/user/');
      expect(none.status).toBe(401);
      expect(none.body.code).toBe('no_token');
      expect(typeof none.body.detail).toBe('string');

      const garbage = await api.get('/api/user/').set('Authorization', 'Token not-a-jwt');
      expect(garbage.body.code).toBe('token_invalid');

      const expired = jwt.sign({ userId: user.id, role: 'customer' }, config.tokenSecret, {
        algorithm: 'HS256',
        audience: 'btc-cargo:access',
        expiresIn: -10,
      });
      const old = await api.get('/api/user/').set('Authorization', `Token ${expired}`);
      expect(old.status).toBe(401);
      expect(old.body.code).toBe('token_expired');

      const unsigned = jwt.sign({ userId: user.id, role: 'admin' }, '', { algorithm: 'none' });
      const forged = await api.get('/api/user/').set('Authorization', `Token ${unsigned}`);
      expect(forged.status).toBe(401);
    });

    it('cannot be replaced by a report link token', async () => {
      const user = await registerUser();
      const res = await api
        .get('/api/user/')
        .set('Authorization', `Token ${signReportToken(user.id, 'aff_report_1')}`);
      expect(res.status).toBe(401);
    });
  });

  describe('refresh token', () => {
    it('rotates on every use and returns a new key', async () => {
      const user = await registerUser();

      const first = await api.post('/api/auth/refresh/').set('Cookie', user.cookie).set('Origin', ORIGIN);
      expect(first.status).toBe(200);
      expect(typeof first.body.key).toBe('string');

      const rotated = refreshCookieOf(first);
      expect(rotated).not.toBe(user.cookie);

      const me = await clientFor(first.body.key).get('/api/user/');
      expect(me.body.id).toBe(user.id);
    });

    it('revokes the whole session when a rotated token is presented again', async () => {
      const user = await registerUser();
      const first = await api.post('/api/auth/refresh/').set('Cookie', user.cookie);
      const rotated = refreshCookieOf(first);

      await pool.query(
        "UPDATE refresh_tokens SET used_at = NOW() - INTERVAL '1 minute' WHERE user_id = $1 AND used_at IS NOT NULL",
        [user.id],
      );

      const replay = await api.post('/api/auth/refresh/').set('Cookie', user.cookie);
      expect(replay.status).toBe(401);

      const afterwards = await api.post('/api/auth/refresh/').set('Cookie', rotated);
      expect(afterwards.status).toBe(401);
    });

    it('is refused without a cookie and from an origin that is not allowed', async () => {
      const user = await registerUser();

      const missing = await api.post('/api/auth/refresh/');
      expect(missing.status).toBe(401);

      const foreign = await api
        .post('/api/auth/refresh/')
        .set('Cookie', user.cookie)
        .set('Origin', 'https://evil.example');
      expect(foreign.status).toBe(403);
    });

    it('stops working after logout, and after logout-all', async () => {
      const user = await registerUser();
      await api.post('/api/auth/logout/').set('Cookie', user.cookie).expect(200);
      await api.post('/api/auth/refresh/').set('Cookie', user.cookie).expect(401);

      const again = await api.post('/api/login/').send({ username: user.username, password: user.password });
      const cookie = refreshCookieOf(again);
      await clientFor(again.body.key).post('/api/auth/logout-all/').expect(200);
      await api.post('/api/auth/refresh/').set('Cookie', cookie).expect(401);
    });
  });

  describe('social sign-in', () => {
    it('answers 503 for a provider that has no keys configured', async () => {
      for (const provider of ['google', 'facebook', 'line']) {
        const res = await api.post(`/api/auth/${provider}`).send({ access_token: 'token', id_token: 'id' });
        expect(res.status).toBe(503);
        expect(res.body.code).toBe('not_configured');
      }
    });

    it('requires an access token', async () => {
      const res = await api.post('/api/auth/google').send({});
      expect(res.status).toBe(400);
      expect(res.body.access_token).toBeDefined();
    });
  });
});
