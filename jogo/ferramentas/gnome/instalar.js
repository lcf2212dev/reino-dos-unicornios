#!/usr/bin/env node
// Instala a extensão do GNOME "Reino dos Unicórnios: acompanhamento" para o usuário (ou só monta, com --saida).
// Gera nomes.json (salas, matérias, provas, unicórnios) dos dados do jogo, copia a extensão e a liga.
// Uso: npm run gnome [-- --saida <pasta>] [-- --sem-ligar]
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const Jogo = require('../jogo-no-node');

const UUID = 'reino-acompanhamento@lcf2212.dev';
const args = process.argv.slice(2);
if (args.includes('--ajuda')) {
  console.log('Uso: npm run gnome [-- --saida <pasta>] [-- --sem-ligar]\n  Monta e instala a extensão do GNOME de acompanhamento (só lê o progresso).');
  process.exit(0);
}

function nomes() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const R = ctx.Reino;
  const n = { materias: {}, salas: {}, provas: {}, unis: {} };
  R.materias.forEach((m) => {
    n.materias[m.id] = m.nome;
    m.salas.forEach((s) => { n.salas[s.id] = { nome: s.nome, materia: m.id }; });
  });
  R.provas.forEach((p) => { n.provas[p.id] = p.nome; });
  R.Unicornios.todos('lilas').forEach((u) => { n.unis[u.id] = u.nome; });
  return n;
}

function montar(destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const f of ['metadata.json', 'extension.js', 'resumo.js']) fs.copyFileSync(path.join(__dirname, 'extensao', f), path.join(destino, f));
  fs.writeFileSync(path.join(destino, 'nomes.json'), JSON.stringify(nomes()));
}

if (require.main === module) {
  const i = args.indexOf('--saida');
  if (i >= 0 && !args[i + 1]) { console.error('--saida precisa de uma pasta'); process.exit(1); }
  const destino = i >= 0 ? path.resolve(args[i + 1]) : path.join(os.homedir(), '.local/share/gnome-shell/extensions', UUID);
  montar(destino);
  console.log('Extensão montada em ' + destino);
  if (i < 0 && !args.includes('--sem-ligar')) {
    try { execFileSync('gnome-extensions', ['enable', UUID], { stdio: 'inherit' }); console.log('Ligada.'); } catch (e) {
      console.log('Ainda não ligou (o GNOME só vê extensão nova depois de sair e entrar na sessão). Depois: gnome-extensions enable ' + UUID);
    }
  }
}

module.exports = { nomes, montar, UUID };
