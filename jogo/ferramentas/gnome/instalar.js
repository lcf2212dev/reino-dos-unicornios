#!/usr/bin/env node
// Instala a extensão do painel e o app do dock "Mariana no Reino" para o usuário (a extensão só monta, com --saida).
// Gera nomes.json (salas, matérias, provas, unicórnios) dos dados do jogo, copia a extensão e a liga.
// Uso: npm run gnome [-- --saida <pasta>] [-- --sem-ligar]
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const Jogo = require('../jogo-no-node');

const UUID = 'reino-acompanhamento@lcf2212.dev';
const APP_ID = 'br.dev.lcf2212.ReinoAcompanhamento';
const args = process.argv.slice(2);
if (args.includes('--ajuda')) {
  console.log('Uso: npm run gnome [-- --saida <pasta>] [-- --sem-ligar]\n  Monta e instala a extensão do painel e o app do dock de acompanhamento (só leem o progresso).');
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

/** App do dock (janela GTK4): main.js + resumo.js + nomes.json numa pasta, e o .desktop com o ícone do jogo. */
function montarApp(pasta, aplicativos, icones) {
  fs.mkdirSync(pasta, { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'app', 'main.js'), path.join(pasta, 'main.js'));
  fs.copyFileSync(path.join(__dirname, 'extensao', 'resumo.js'), path.join(pasta, 'resumo.js'));
  fs.writeFileSync(path.join(pasta, 'nomes.json'), JSON.stringify(nomes()));
  fs.mkdirSync(icones, { recursive: true });
  fs.copyFileSync(path.join(__dirname, '../../../vercel/pwa/icone-512.png'), path.join(icones, APP_ID + '.png'));
  try { execFileSync('gtk-update-icon-cache', ['-q', '-t', '-f', path.join(icones, '../../')], { stdio: 'ignore' }); } catch (e) { /* sem cache: o tema acha o ícone sozinho */ }
  fs.mkdirSync(aplicativos, { recursive: true });
  fs.writeFileSync(path.join(aplicativos, APP_ID + '.desktop'), [
    '[Desktop Entry]', 'Type=Application', 'Name=Mariana no Reino', 'Comment=O que a Mariana fez no Reino dos Unicórnios, dia a dia',
    'Exec=gjs -m ' + path.join(pasta, 'main.js'), 'Icon=' + APP_ID, 'Terminal=false', 'Categories=Education;', 'StartupWMClass=' + APP_ID, '',
  ].join('\n'));
}

if (require.main === module) {
  const i = args.indexOf('--saida');
  if (i >= 0 && !args[i + 1]) { console.error('--saida precisa de uma pasta'); process.exit(1); }
  const destino = i >= 0 ? path.resolve(args[i + 1]) : path.join(os.homedir(), '.local/share/gnome-shell/extensions', UUID);
  montar(destino);
  console.log('Extensão montada em ' + destino);
  if (i < 0) {
    const dados = path.join(os.homedir(), '.local/share');
    montarApp(path.join(dados, 'reino-acompanhamento/app'), path.join(dados, 'applications'), path.join(dados, 'icons/hicolor/512x512/apps'));
    console.log('App do dock instalado (' + APP_ID + '.desktop)');
    if (!args.includes('--sem-ligar')) {
      try {
        const fav = execFileSync('gsettings', ['get', 'org.gnome.shell', 'favorite-apps'], { encoding: 'utf8' }).trim();
        const d = APP_ID + '.desktop';
        if (!fav.includes("'" + d + "'")) {
          execFileSync('gsettings', ['set', 'org.gnome.shell', 'favorite-apps', fav.replace(/\]$/, (fav === '@as []' ? '' : ", ") + "'" + d + "']").replace('@as [', '[')]);
          console.log('Fixado no dock.');
        }
      } catch (e) { console.log('Não fixei no dock: ' + e.message); }
    }
  }
  if (i < 0 && !args.includes('--sem-ligar')) {
    try { execFileSync('gnome-extensions', ['enable', UUID], { stdio: 'inherit' }); console.log('Ligada.'); } catch (e) {
      console.log('Ainda não ligou (o GNOME só vê extensão nova depois de sair e entrar na sessão). Depois: gnome-extensions enable ' + UUID);
    }
  }
}

module.exports = { nomes, montar, montarApp, UUID, APP_ID };
