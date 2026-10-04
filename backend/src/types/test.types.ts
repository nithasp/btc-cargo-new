import supertest from 'supertest';

export interface TestUser {
  id: number;
  username: string;
  password: string;
  key: string;
  cookie: string;
  get(url: string): supertest.Test;
  post(url: string, body?: object): supertest.Test;
  put(url: string, body?: object): supertest.Test;
  delete(url: string): supertest.Test;
  upload(type?: string, file?: Buffer, name?: string): supertest.Test;
}
