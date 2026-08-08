const request = require('supertest');
const app = require('../app');

describe('Rotas de Cliente', () => {
  let clienteId;

  test('GET /api/clientes deve retornar uma lista', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/clientes deve criar um cliente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({
        nome: 'Cliente Teste',
        idade: 30,
        email: 'teste@email.com',
        sexo: true,
        telefone: 11999999999,
        logradouro: 'Rua Teste'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nome).toBe('Cliente Teste');
    clienteId = res.body.id;
  });

  test('PUT /api/clientes/:id deve editar o cliente', async () => {
    const res = await request(app)
      .put(`/api/clientes/${clienteId}`)
      .send({ nome: 'Cliente Editado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe('Cliente Editado');
  });

  test('DELETE /api/clientes/:id deve remover o cliente', async () => {
    const res = await request(app).delete(`/api/clientes/${clienteId}`);
    expect(res.statusCode).toBe(204);
  });
});