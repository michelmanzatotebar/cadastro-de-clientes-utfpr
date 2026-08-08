const fs = require('fs');
const path = require('path');

function lerArquivo(nomeArquivo) {
  const caminho = path.join(__dirname, nomeArquivo);
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(conteudo);
}

function salvarArquivo(nomeArquivo, dados) {
  const caminho = path.join(__dirname, nomeArquivo);
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

module.exports = { lerArquivo, salvarArquivo };