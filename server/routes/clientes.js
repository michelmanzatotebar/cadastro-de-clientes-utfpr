const express = require('express');
const router = express.Router();
const db = require('../data/db');

function filiaisValidas(idsFiliais) {
  const filiais = db.lerArquivo('filiais.json');
  const idsExistentes = filiais.map(function(f) { return f.id; });
  return idsFiliais.every(function(id) { return idsExistentes.includes(id); });
}

router.get('/', function(req, res) {
  const clientes = db.lerArquivo('clientes.json');
  res.json(clientes);
});

router.post('/', function(req, res) {
  const idsFiliais = req.body.filiais || [];

  if (!filiaisValidas(idsFiliais)) {
    return res.status(400).json({ erro: 'Uma ou mais filiais informadas não existem' });
  }

  const clientes = db.lerArquivo('clientes.json');

  const novoCliente = {
    id: Date.now().toString(),
    nome: req.body.nome,
    idade: req.body.idade,
    email: req.body.email,
    sexo: req.body.sexo,
    telefone: req.body.telefone,
    logradouro: req.body.logradouro,
    filiais: idsFiliais
  };

  clientes.push(novoCliente);
  db.salvarArquivo('clientes.json', clientes);
  res.status(201).json(novoCliente);
});

router.put('/:id', function(req, res) {
  const clientes = db.lerArquivo('clientes.json');
  const index = clientes.findIndex(function(c) { return c.id === req.params.id; });

  if (index === -1) {
    return res.status(404).json({ erro: 'Cliente não encontrado' });
  }

  if (req.body.filiais && !filiaisValidas(req.body.filiais)) {
    return res.status(400).json({ erro: 'Uma ou mais filiais informadas não existem' });
  }

  clientes[index] = Object.assign(clientes[index], req.body);
  db.salvarArquivo('clientes.json', clientes);
  res.json(clientes[index]);
});

router.delete('/:id', function(req, res) {
  const clientes = db.lerArquivo('clientes.json');
  const filtrados = clientes.filter(function(c) { return c.id !== req.params.id; });

  if (filtrados.length === clientes.length) {
    return res.status(404).json({ erro: 'Cliente não encontrado' });
  }

  db.salvarArquivo('clientes.json', filtrados);
  res.status(204).send();
});

module.exports = router;