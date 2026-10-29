// O e2e na integração (integrar.js): poda do /tmp no começo, resumo e lista de diferenças da execução, conferência
// do --esperado e a base aceita (`e2e.js --aceitar`: base `@` no último commit da integração, sem commit à parte).
const fs = require('fs');
const path = require('path');
const C = require('./comum');
const G = require('./integrar-git');

const E2E = 'jogo/ferramentas/testes/e2e.js';
const BASE_E2E = 'jogo/ferramentas/testes/base-referencia.txt';

// e2e.js --podar (o /tmp é RAM): só o que está parado há mais de 1 h; sem e2e.js no repositório, nada
function podar(repo, log) {
  const arq = path.join(repo, E2E);
  if (!fs.existsSync(arq)) return;
  const r = C.rodar(process.execPath, [arq, '--podar'], { cwd: repo });
  const ultima = (r.saida + '\n' + r.erro).trim().split('\n').filter((l) => l.trim()).pop() || '';
  log(r.ok ? `• e2e --podar: ${ultima.trim()}` : `⚠ e2e --podar falhou: ${ultima.trim()}`);
}

// resumo.json da execução: na pasta da captura que o e2e mostra no fim ("  Atual: <pasta>/atual"); nunca o mais
// novo de qualquer e2e-* do /tmp (pode ser de outra worktree). null se não houver.
function resumo(arqSaida) {
  const txt = arqSaida && fs.existsSync(arqSaida) ? fs.readFileSync(arqSaida, 'utf8') : '';
  const m = /^ {2}Atual: (\S.*)$/m.exec(txt);
  if (!m) return null;
  const arq = path.join(path.resolve(m[1].trim(), '..'), 'resumo.json');
  return fs.existsSync(arq) ? arq : null;
}

// tudo o que o e2e achou diferente: imagens (do resumo.json e das linhas "<f>: N pixels diferentes") como
// "<tamanho>/<nome>" e o que não é imagem comparada (falta, novo, conteúdo diferente, erros de console,
// desempenho, referência vazia). `total` = o "✘ N diferença(s)" do e2e (null se ele não disse).
function diferencas(arqSaida, arqResumo) {
  const itens = new Set();
  if (arqResumo && fs.existsSync(arqResumo)) {
    const r = JSON.parse(fs.readFileSync(arqResumo, 'utf8'));
    Object.entries(r.porTamanho || {}).forEach(([tm, t]) => Object.values(t.nomes || {}).forEach((ns) => ns.forEach((n) => itens.add(`${tm}/${n}`))));
  }
  const img = (f) => { const m = /^imagens\/([^/]+)\/(.+)\.png$/.exec(f); return m ? `${m[1]}/${m[2]}` : f; };
  const txt = arqSaida && fs.existsSync(arqSaida) ? fs.readFileSync(arqSaida, 'utf8') : '';
  let total = null;
  txt.split('\n').forEach((l) => {
    let m;
    if ((m = /^✘ (\d+) diferença\(s\) em \d+ arquivos/.exec(l))) total = Number(m[1]);
    else if ((m = /^ {2}falta (\S.*)$/.exec(l)) || (m = /^ {2}novo \(não existe na referência\): (\S.*)$/.exec(l))) itens.add(img(m[1].trim()));
    else if ((m = /^ {2}(imagens\/\S+\.png): /.exec(l))) itens.add(img(m[1]));
    else if ((m = /^ {2}(\S+): conteúdo diferente/.exec(l))) itens.add(m[1]);
    else if (/^ {2}erros de console diferentes/.test(l)) itens.add('erros.txt');
    else if ((m = /^ {2}desempenho (\S+):/.exec(l))) itens.add(`desempenho ${m[1]}`);
    else if (/^ {2}(referência vazia|nenhuma imagem da referência casa)/.test(l)) itens.add('referência vazia');
  });
  return { itens: [...itens], total };
}

// --esperado: com e2e diferente, cada diferença tem de casar com o regex (nome da imagem sem .png, ou
// <tamanho>/<nome>, ou o caminho do arquivo), e o que foi lido tem de bater com o total que o e2e contou (ele só
// imprime as 200 primeiras falhas). Devolve { ok, total, fora }.
function conferirEsperado(regex, conf) {
  if (conf.e2e !== false) return { ok: true, total: 0, fora: [] };
  const d = diferencas(conf.e2eSaida, conf.resumo);
  if (d.total === null) return { ok: false, total: 0, fora: [`(o e2e falhou sem dizer quantas diferenças: veja ${conf.e2eSaida})`] };
  if (d.itens.length !== d.total) return { ok: false, total: d.total, fora: [`(o e2e contou ${d.total} diferença(s) e só ${d.itens.length} puderam ser lidas: veja ${conf.e2eSaida})`] };
  const fora = d.itens.filter((i) => !regex.test(i) && !regex.test(path.basename(i)));
  return { ok: !fora.length, total: d.total, fora };
}

const temAceitar = (integ) => {
  const arq = path.join(integ, E2E);
  return fs.existsSync(arq) && fs.readFileSync(arq, 'utf8').includes('--aceitar');
};

// --trocar-base: `e2e.js --aceitar "<descrição>"` grava a base `@` (o commit que mudou o base-referencia.txt por
// último) e o arquivo entra no ÚLTIMO commit da integração (--amend: a branch ainda não está na main). Sem o
// --aceitar no e2e.js (versão antiga), cai no commit à parte "base do e2e em <hash>".
function aceitarBase(integ, descricao, main, log) {
  if (!descricao || /[\r\n#]/.test(descricao)) throw new Error('--trocar-base: descrição de uma linha, sem "#"');
  if (G.mudancas(integ).length) throw new Error('--trocar-base: a integração tem mudanças sem commit (use --commit)');
  if (!temAceitar(integ)) {
    log(`⚠ ${E2E} sem --aceitar: base num commit à parte (como antes)`);
    const t = G.trocarBase(integ, descricao, log);
    log(`✔ base do e2e em ${t.curto}: commit ${t.commit}`);
    return { ...t, blob: C.git(integ, 'rev-parse', `HEAD:${BASE_E2E}`) };
  }
  const nao = G.naoEmendar(integ, main);
  if (nao) throw new Error(`--trocar-base: ${nao}`);
  const r = C.rodar(process.execPath, [E2E, '--aceitar', descricao], { cwd: integ });
  if (!r.ok) throw new Error(`e2e.js --aceitar falhou:\n${(r.erro || r.saida).trim()}`);
  const blob = () => C.git(integ, 'rev-parse', `HEAD:${BASE_E2E}`);
  if (C.gitOk(integ, 'diff', '--quiet', '--', BASE_E2E)) { log('• base do e2e: já era essa'); return { aceita: true, commit: null, blob: blob() }; }
  C.git(integ, 'add', '--', BASE_E2E);
  C.git(integ, 'commit', '-q', '--amend', '--no-edit', '--no-verify');
  const assunto = C.git(integ, 'log', '-1', '--format=%s');
  const commit = C.git(integ, 'rev-parse', '--short', 'HEAD');
  log(`✔ base do e2e = @ (${descricao}), no último commit da integração (${commit} ${assunto})`);
  return { aceita: true, commit, blob: blob() };
}

module.exports = { E2E, BASE_E2E, podar, resumo, diferencas, conferirEsperado, aceitarBase };
