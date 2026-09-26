// Cópias reduzidas do material de uma matéria ou prova (prints e fotos) para os agentes lerem sem gastar:
//   node jogo/ferramentas/fluxo/material.js <Pasta> [--lado 1100] [--folha]      (npm run material -- <Pasta>)
// Lê <Pasta> da árvore principal (recursivo; se não existir lá, da worktree atual; ou um caminho absoluto) e grava
// em /tmp/reino-testes/material/<pasta sem acento>/. <Pasta> é o nome da matéria em matérias/ ("Geografia",
// "ciências/Revisão") ou um caminho a partir da raiz; a pasta de saída é o caminho abaixo de matérias/
// ("ciencias-revisao"):
//   NN-<nome>.jpg   magick <arq> -auto-orient -resize <lado>x<lado>> -quality 82 (HEIC também; plano B:
//                   heif-convert), na ordem da data EXIF e, sem data, do nome
//   indice.txt      número, original, dimensões (original → reduzida), KB (original → reduzida), data EXIF
//   folha-NN.jpg    com --folha: folhas de contato (magick montage, 12 por página, com o número de cada foto)
// Nunca mexe no original. Arquivo que não é imagem entra no índice como "ignorado".
const fs = require('fs');
const path = require('path');
const C = require('./comum');

const IMAGEM = /\.(jpe?g|png|heic|heif|webp|gif|bmp|tiff?|avif)$/i;
const HEIC = /\.(heic|heif)$/i;
const POR_FOLHA = 12;
const AJUDA = `Uso: node jogo/ferramentas/fluxo/material.js <Pasta> [--lado 1100] [--folha]
  <Pasta>   matéria em matérias/ (ex.: Ciências, ciências/Revisão), caminho a partir da raiz ou caminho absoluto
  --lado    maior lado das cópias, em px (padrão 1100; só reduz, nunca amplia)
  --folha   também folhas de contato com 12 fotos cada (folha-01.jpg…)`;

function conferirMagick() {
  if (!C.rodar('magick', ['-version']).ok) {
    throw new Error('ImageMagick 7 (comando magick) não encontrado: instale o pacote imagemagick (com suporte a HEIC/libheif)');
  }
}

// pasta de origem: a da árvore principal, senão a da worktree atual, ou um caminho absoluto;
// nome: o da pasta de saída (o caminho abaixo de matérias/, ou o último pedaço do caminho absoluto)
function origem(nome, cwd) {
  let r = null;
  try { r = C.raizes(cwd); } catch (e) { /* fora de um repositório git */ }
  if (path.isAbsolute(nome) || !r) {
    const abs = path.resolve(cwd, nome);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) throw new Error(`pasta de material não encontrada: ${abs}`);
    return { abs, nome: path.basename(abs) };
  }
  for (const arvore of [r.principal, r.repo]) {
    const rel = C.pastaMaterial(arvore, nome);
    if (rel) return { abs: path.join(arvore, rel), nome: rel.replace(new RegExp(`^${C.PASTA_MATERIAS}/`), '') };
  }
  throw new Error(`pasta de material não encontrada: ${nome} (nem em ${r.principal}/${C.PASTA_MATERIAS}/ nem na worktree atual)`);
}

function listar(raiz, rel = '') {
  return fs.readdirSync(path.join(raiz, rel), { withFileTypes: true })
    .filter((e) => !e.name.startsWith('.'))
    .flatMap((e) => {
      const r = rel ? `${rel}/${e.name}` : e.name;
      return e.isDirectory() ? listar(raiz, r) : e.isFile() ? [r] : [];
    });
}

// largura, altura e data EXIF (primeiro quadro); null se o magick não lê
function medir(arq) {
  const r = C.rodar('magick', ['identify', '-format', '%w %h|%[EXIF:DateTimeOriginal]\n', arq + '[0]']);
  if (!r.ok) return null;
  const [dim, data] = r.saida.split('\n')[0].split('|');
  const [w, h] = dim.trim().split(/\s+/).map(Number);
  return { w, h, data: (data || '').trim() };
}

const kb = (arq) => Math.max(1, Math.round(fs.statSync(arq).size / 1024));

function reduzir(arq, destino, lado, pastaHeif) {
  const args = [arq + '[0]', '-auto-orient', '-resize', `${lado}x${lado}>`, '-background', 'white', '-flatten', '-quality', '82', destino];
  let r = C.rodar('magick', args);
  if (r.ok) return 'magick';
  if (HEIC.test(arq) && C.rodar('heif-convert', ['--help']).status !== null) {
    // plano B: heif-convert para um JPEG grande (fica em heif/, sem apagar) e o magick reduz esse
    fs.mkdirSync(pastaHeif, { recursive: true });
    const meio = path.join(pastaHeif, path.basename(destino));
    const h = C.rodar('heif-convert', ['-q', '95', arq, meio]);
    if (h.ok) {
      r = C.rodar('magick', [meio, ...args.slice(1)]);
      if (r.ok) return 'heif-convert + magick';
    }
  }
  throw new Error(`não consegui converter ${arq}:\n${(r.erro || r.saida).trim()}`);
}

function gerarMaterial(argv, cwd = process.cwd()) {
  const op = C.lerArgs(argv, { booleanas: ['folha', 'ajuda'] });
  if (op.ajuda || !op._.length) return { ajuda: AJUDA };
  const lado = Number(op.lado || 1100);
  if (!Number.isInteger(lado) || lado < 100 || lado > 8000) throw new Error(`--lado inválido: ${op.lado}`);
  conferirMagick();
  const o = origem(op._[0].replace(/\/+$/, ''), cwd);
  const de = o.abs;
  const para = path.join(C.PASTA_TESTES, 'material', C.slug(o.nome));
  fs.mkdirSync(para, { recursive: true });

  const todos = listar(de);
  const imgs = todos.filter((f) => IMAGEM.test(f)).map((f) => ({ rel: f, abs: path.join(de, f), med: medir(path.join(de, f)) }));
  const ignorados = todos.filter((f) => !IMAGEM.test(f));
  // ordem: data EXIF (as sem data no fim), depois o nome com números em ordem natural
  imgs.sort((a, b) => {
    const da = (a.med && a.med.data) || '~'; const db = (b.med && b.med.data) || '~';
    return da < db ? -1 : da > db ? 1 : a.rel.localeCompare(b.rel, 'pt', { numeric: true });
  });
  const casas = Math.max(2, String(imgs.length).length);
  const linhas = [`# ${de} → ${para} (lado ${lado}px, ${imgs.length} imagem(ns))`,
    '# número | original | dimensões original → reduzida | KB original → reduzida | data EXIF'];
  const saidas = [];
  imgs.forEach((im, i) => {
    const n = String(i + 1).padStart(casas, '0');
    const nome = `${n}-${C.slug(im.rel.replace(/\.[^.]+$/, ''))}.jpg`;
    const destino = path.join(para, nome);
    reduzir(im.abs, destino, lado, path.join(para, 'heif'));
    const red = medir(destino) || { w: '?', h: '?' };
    const orig = im.med ? `${im.med.w}x${im.med.h}` : '?';
    linhas.push(`${n} | ${im.rel} | ${orig} → ${red.w}x${red.h} | ${kb(im.abs)} → ${kb(destino)} | ${(im.med && im.med.data) || 'sem data'}`);
    saidas.push({ n, nome, destino });
  });
  ignorados.forEach((f) => linhas.push(`-- | ${f} | ignorado (não é imagem; leia o original)`));

  const folhas = [];
  if (op.folha) {
    for (let i = 0; i < saidas.length; i += POR_FOLHA) {
      const grupo = saidas.slice(i, i + POR_FOLHA);
      const folha = path.join(para, `folha-${String(folhas.length + 1).padStart(2, '0')}.jpg`);
      const args = ['montage'];
      grupo.forEach((s) => args.push('-label', s.n, s.destino));
      args.push('-tile', '4x3', '-geometry', '360x360+6+6', '-pointsize', '18', '-quality', '82', folha);
      const r = C.rodar('magick', args);
      if (!r.ok) throw new Error(`magick montage falhou:\n${r.erro.trim()}`);
      folhas.push(folha);
    }
    folhas.forEach((f, i) => linhas.push(`# folha ${i + 1}: ${f}`));
  }
  const indice = path.join(para, 'indice.txt');
  fs.writeFileSync(indice, linhas.join('\n') + '\n');
  const texto = [`✔ ${saidas.length} imagem(ns) reduzida(s) em ${para}`,
    `• índice: ${indice}`,
    ...(ignorados.length ? [`• ${ignorados.length} arquivo(s) que não são imagem (no índice)`] : []),
    ...(folhas.length ? [`• ${folhas.length} folha(s) de contato: ${folhas.join(', ')}`] : []),
    'Leia só as reduzidas (e as folhas, para achar a foto certa).'].join('\n');
  return { para, indice, saidas, folhas, ignorados, texto };
}

if (require.main === module) {
  try {
    const r = gerarMaterial(process.argv.slice(2));
    console.log(r.ajuda || r.texto);
  } catch (e) {
    console.error('✘ ' + e.message);
    process.exit(1);
  }
}

module.exports = { gerarMaterial };
