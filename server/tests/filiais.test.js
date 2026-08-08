const request = require('supertest');
const app = require('../app');

describe('Rotas de Filial', () => {
  let filialId;

  test('GET /api/filiais deve retornar uma lista', async () => {
    const res = await request(app).get('/api/filiais');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/filiais deve criar uma filial', async () => {
    const res = await request(app)
      .post('/api/filiais')
      .send({
        nomeFilial: 'Filial Teste',
        logradouro: 'Rua X',
        emailFilial: 'filial@teste.com',
        telefone: 1133334444
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nomeFilial).toBe('Filial Teste');
    filialId = res.body.id;
  });

  test('PATCH /api/filiais/:id/status deve alterar o status', async () => {
    const res = await request(app)
      .patch(`/api/filiais/${filialId}/status`)
      .send({ status: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(false);
  });

  test('DELETE /api/filiais/:id deve remover a filial', async () => {
    const res = await request(app).delete(`/api/filiais/${filialId}`);
    expect(res.statusCode).toBe(204);
  });
});