// Gera a página para publicar no claude.ai (Artifact): o claude.ai já coloca
// doctype, <head> e viewport, então aqui ficam só o título, os estilos e o corpo.
// Uso: node ferramentas/gerar-artifact.js <arquivo-de-saida.html>
const fs = require('fs');
const path = require('path');

const saida = process.argv[2];
if (!saida) { console.error('Informe o arquivo de saída.'); process.exit(1); }
let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
html = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?html[^>]*>\s*/gi, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<\/?body>\s*/gi, '')
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '');
fs.writeFileSync(saida, html.trim() + '\n');
console.log('Página gerada em', saida);
