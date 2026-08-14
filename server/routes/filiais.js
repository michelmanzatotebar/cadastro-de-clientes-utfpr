const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/', function(req, res) {
  const filiais = db.lerArquivo('filiais.json');
  res.json(filiais);
});

router.post('/', function(req, res) {
  const filiais = db.lerArquivo('filiais.json');

  const novaFilial = {
    id: Date.now().toString(),
    nomeFilial: req.body.nomeFilial,
    logradouro: req.body.logradouro,
    emailFilial: req.body.emailFilial,
    status: true,
    telefone: req.body.telefone
  };

  filiais.push(novaFilial);
  db.salvarArquivo('filiais.json', filiais);
  res.status(201).json(novaFilial);
});

router.put('/:id', function(req, res) {
  const filiais = db.lerArquivo('filiais.json');
  const index = filiais.findIndex(function(f) { return f.id === req.params.id; });

  if (index === -1) {
    return res.status(404).json({ erro: 'Filial não encontrada' });
  }

  filiais[index] = Object.assign(filiais[index], req.body);
  db.salvarArquivo('filiais.json', filiais);
  res.json(filiais[index]);
});

router.patch('/:id/status', function(req, res) {
  const filiais = db.lerArquivo('filiais.json');
  const index = filiais.findIndex(function(f) { return f.id === req.params.id; });

  if (index === -1) {
    return res.status(404).json({ erro: 'Filial não encontrada' });
  }

  filiais[index].status = req.body.status;
  db.salvarArquivo('filiais.json', filiais);
  res.json(filiais[index]);
});

router.delete('/:id', function(req, res) {
  const filiais = db.lerArquivo('filiais.json');
  const filtradas = filiais.filter(function(f) { return f.id !== req.params.id; });

  if (filtradas.length === filiais.length) {
    return res.status(404).json({ erro: 'Filial não encontrada' });
  }

  const clientes = db.lerArquivo('clientes.json');
  clientes.forEach(function(cliente) {
    cliente.filiais = (cliente.filiais || []).filter(function(id) { return id !== req.params.id; });
  });
  db.salvarArquivo('clientes.json', clientes);

  db.salvarArquivo('filiais.json', filtradas);
  res.status(204).send();
});

module.exports = router;
