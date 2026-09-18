const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app/src/server');

describe('API - exemple de test', () => {
  it('GET /api/health doit retourner 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('ok');
  });
});
