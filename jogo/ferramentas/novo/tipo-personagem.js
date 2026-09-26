// Tipo `personagem` do `npm run novo`: um NPC novo num interior, com Reino.registrarPersonagem({ …, predio, x, y, acao })
// e as falas dele (Reino.FALAS_INTERIORES.<chave>.npcs.<id>) num personagens.js, sem editar os arquivos que já existem.
// --predio é o id do INTERIOR ('petshop', 'torre-1', 'padrao-geografia'). Onde mora o personagens.js:
//   prédio com pasta: jogo/js/interiores/<pasta>/personagens.js, depois do falas.js e antes do <pasta>.js;
//   interior padrão de matéria: jogo/js/conteudo/materias/<m>/personagens.js, antes do <m>.js (o padrao.js vem depois).
// Prédio do esqueleto (tem VAGAS): sem x/y ele escolhe. Prédio antigo: sem x/y, o gerador acha um chão livre alcançável.
// Contrato: docs/contratos/npcs-e-dialogo.md §5 item 4.
const fs = require('fs');
const path = require('path');
const Vozes = require('./vozes');

const novo = () => require('./novo');   // na hora: novo.js também carrega este arquivo
const perfilChave = Vozes.chave;

// onde o interior mora: pasta, arquivo, chave das falas, linha do manifesto e o texto do layout
function lugarDoInterior(raiz, R, idInt) {
  const def = (R.interiores || []).find((d) => d.id === idInt);
  if (!def) throw new Error(`personagem: o interior "${idInt}" não existe (${(R.interiores || []).map((d) => d.id).join(', ')})`);
  const pm = /^padrao-(.+)$/.exec(idInt);
  if (pm) {
    const dir = `js/conteudo/materias/${pm[1]}`;
    return { def, arq: `jogo/${dir}/personagens.js`, falas: idInt, onde: { antesDe: `${dir}/${pm[1]}.js`, grupo: 'materias' }, texto: '' };
  }
  const pasta = [idInt, def.lugar, idInt.replace(/-\d+$/, '')].find((p) => p && fs.existsSync(path.join(raiz, `jogo/js/interiores/${p}/falas.js`)));
  if (!pasta) throw new Error(`personagem: não achei a pasta de "${idInt}" em jogo/js/interiores/ (com falas.js)`);
  const js = path.join(raiz, `jogo/js/interiores/${pasta}/${pasta}.js`);
  const texto = fs.existsSync(js) ? fs.readFileSync(js, 'utf8') : '';
  return { def, pasta, arq: `jogo/js/interiores/${pasta}/personagens.js`, falas: pasta, texto,
    onde: { depoisDe: `js/interiores/${pasta}/falas.js`, grupo: 'interiores' } };
}

// chão livre alcançável para um prédio sem VAGAS: o mais perto da entrada com os 8 vizinhos livres (não fecha passagem)
function chaoLivre(R, def) {
  const g = R.Interiores.grade(def);
  const livre = (x, y) => g.dentro(x, y) && g.chao[y][x] && !g.solido[y][x];
  const proibido = (x, y) => [def.saida, def.spawn].some((p) => p && p.x === x && p.y === y) || (def.escadas || []).some((e) => e.x === x && e.y === y);
  const chegada = (R.interiores || []).flatMap((d) => (d.escadas || []).map((e, i) => (e.para === def.id ? R.Interiores.chegadaDaEscada(d.id, i) : null)).filter(Boolean))[0];
  let ini = def.spawn || chegada;
  for (let y = 0; y < g.h && !ini; y++) for (let x = 0; x < g.w && !ini; x++) if (livre(x, y)) ini = { x, y };
  if (!ini) return null;
  const visto = new Set([ini.x + ',' + ini.y]), fila = [ini];
  while (fila.length) {
    const t = fila.shift();
    const folga = [-1, 0, 1].every((dy) => [-1, 0, 1].every((dx) => livre(t.x + dx, t.y + dy)));
    if (folga && !proibido(t.x, t.y) && Math.abs(t.x - ini.x) + Math.abs(t.y - ini.y) >= 2) return t;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const n = { x: t.x + dx, y: t.y + dy }, k = n.x + ',' + n.y;
      if (!visto.has(k) && livre(n.x, n.y)) { visto.add(k); fila.push(n); }
    });
  }
  return null;
}

// o jogo da cópia inteiro (node: true): elenco, registrados, vozes e as vozes já usadas no interior
function dados(raiz, idInt, g) {
  const Jogo = require(path.join(raiz, 'jogo/ferramentas/jogo-no-node.js'));
  const R = Jogo.carregar(Jogo.contexto({ console, Math, Date }), Jogo.ordemDosPredios(Jogo.scripts())).Reino;
  const V = R.config.vozes;
  const L = lugarDoInterior(raiz, R, idInt);
  const usadas = new Set();
  (R.interiores || []).filter((d) => d.id === idInt || d.lugar === L.def.lugar).forEach((d) => (d.npcs || []).forEach((n) => { if (V[n.voz]) usadas.add(perfilChave(V[n.voz])); }));
  const txt = fs.existsSync(path.join(raiz, L.arq)) ? fs.readFileSync(path.join(raiz, L.arq), 'utf8') : '';
  for (const m of txt.matchAll(/registrarPersonagem\(\{\s*id:\s*'([^']+)'/g)) if (V['npc-' + m[1]]) usadas.add(perfilChave(V['npc-' + m[1]]));
  // o esqueleto do `npm run novo -- predio` tem VAGAS; os antigos só aceitam x/y
  const vagas = /personagensDoPredio/.test(L.texto) && /\bVAGAS\b/.test(L.texto);
  // a Torre desenha em x - 1, y - 1 (npc(p.id, p.x - 1, p.y - 1)): o x/y do registro leva essa folga
  const desloc = +((/p\.x\s*-\s*(\d+)/.exec(L.texto) || [])[1] || 0);
  return { R, V, L, Jogo, livre: Vozes.escolher(V, usadas, g), existe: !!txt, vagas, desloc };
}

// --tambem: a pessoa já registrada precisa carregar antes do layout do interior novo (no navegador e nas ferramentas,
// que carregam os prédios em ordem alfabética), senão o npc() não acha sprite, nome e voz no ELENCO
function conferirOrdem(raiz, d, id) {
  const achado = d.Jogo.manifesto.scripts.find((s) => new RegExp(`registrarPersonagem\\(\\{\\s*id:\\s*'${id}'`).test(fs.readFileSync(path.join(raiz, 'jogo', s.js), 'utf8')));
  if (!achado) return 'o elenco';   // do elenco.js: carrega antes de todo prédio
  const layout = d.L.pasta ? `js/interiores/${d.L.pasta}/${d.L.pasta}.js` : 'js/interiores/padrao.js';
  const ordens = [d.Jogo.manifesto.scripts, d.Jogo.ordemDosPredios(d.Jogo.manifesto.scripts)].map((l) => l.map((s) => s.js));
  if (ordens.some((o) => o.indexOf(achado.js) > o.indexOf(layout))) {
    throw new Error(`personagem --tambem: ${id} é registrado em ${achado.js}, que carrega depois de ${layout}; registre-o primeiro no prédio que carrega antes (ordem do manifesto e alfabética das pastas) e use --tambem no outro`);
  }
  return achado.js;
}

// --acao: guia (padrão do interior), um nome de ação (sorvete → { tipo: 'sorvete' }) ou um JSON
function acaoDe(a, p) {
  if (!a) return null;
  if (a === 'guia') return { tipo: 'guia', lugar: p };
  if (/^[a-zA-Z][\w-]*$/.test(a)) return { tipo: a };
  try { const o = JSON.parse(a); if (o && o.tipo) return o; } catch (e) { /* cai no erro abaixo */ }
  throw new Error('personagem: --acao guia, um nome de ação (ex.: sorvete) ou um JSON com tipo ({"tipo":"tela","tela":"loja"})');
}

module.exports = {
  ajuda: 'personagem <id> --predio <interior> [--tambem (a mesma pessoa em mais um interior)] [--nome "Seu Trigo"] [--voz feminina|masculina] [--x 5 --y 6] [--acao guia|sorvete|\'{"tipo":"tela","tela":"loja"}\']',
  cria: 'personagens.js do interior (ou acrescenta nele): Reino.registrarPersonagem com predio/x/y, voz ainda não usada ali e as falas (preencher)',
  conferir(id, op, ex, raiz) {
    const p = op.predio;
    if (!p || !/^[a-z0-9-]+$/.test(p)) throw new Error('personagem: falta --predio <id do interior> (ex.: petshop, torre-1, padrao-geografia)');
    if ((op.x === undefined) !== (op.y === undefined)) throw new Error('personagem: --x e --y juntos');
    ['x', 'y'].forEach((k) => { if (op[k] !== undefined && !/^\d+$/.test(op[k])) throw new Error(`personagem: --${k} é um tile (inteiro ≥ 0)`); });
    op.generoVoz = op.tambem ? { g: null, aviso: '' } : Vozes.generoPedido(op, op.nome);
    const d = op.dadosPersonagem = dados(raiz, p, op.generoVoz.g);
    const existe = (d.R.NPCs && d.R.NPCs.ELENCO && d.R.NPCs.ELENCO[id]) || d.R.personagens[id] || d.V['npc-' + id];
    if (op.tambem) {
      // a mesma pessoa em mais um interior: sem voz nova
      if (!existe) throw new Error(`personagem --tambem: "${id}" não existe (crie antes: npm run novo -- personagem ${id} --predio <p>)`);
      if ((d.L.def.npcs || []).some((n) => n.id === id)) throw new Error(`personagem --tambem: ${id} já está em ${p}`);
      op.origem = conferirOrdem(raiz, d, id);
      d.livre = d.R.NPCs.ELENCO[id] ? d.R.NPCs.ELENCO[id].voz : 'npc-' + id;
    } else if (existe) throw new Error(`personagem: "${id}" já existe (para pôr a mesma pessoa em outro interior: --tambem)`);
    op.acaoObj = acaoDe(op.acao, d.L.def.lugar || p);
    if (!d.livre) throw new Error(`personagem: nenhuma voz ${op.generoVoz.g || ''} de config.vozes livre em ${p}; passe um perfil à mão`);
    // prédio antigo (sem VAGAS): x/y obrigatórios; sem eles, um chão livre alcançável escolhido aqui
    op.xyEscolhido = null;
    if (!d.vagas && op.x === undefined) {
      const t = chaoLivre(d.R, d.L.def);
      if (!t) throw new Error(`personagem: ${p} não tem VAGAS; diga --x/--y (veja a grade: npm run ver -- --previa interiores:${d.L.pasta || p})`);
      op.x = String(t.x + d.desloc); op.y = String(t.y + d.desloc); op.xyEscolhido = t;
    }
  },
  arquivos(id, op) {
    const { V, livre, existe, L } = op.dadosPersonagem, pf = V[livre] || {}, p = op.predio;
    // sem --acao, o interior dá a dele (no esqueleto, a do guia; o 1º toma o lugar do guia de marcador)
    const xyAcao = (op.x !== undefined ? `, x: ${op.x}, y: ${op.y}` : '') + (op.acaoObj ? `, acao: ${novo().literal(op.acaoObj)}` : '');
    const falas = `Reino.FALAS_INTERIORES['${L.falas}'].npcs['${id}'] = {
  oi: ['(preencher) o que diz aqui?'],
  depois: ['(preencher) uma fala curtinha.'],
};
`;
    const lugar = `\n  predio: '${p}'` + (op.x !== undefined ? `, x: ${op.x}, y: ${op.y}` : '') + (op.acaoObj ? `, acao: ${novo().literal(op.acaoObj)}` : '') + ',';
    const bloco = `
// ${id}: ${op.nome || 'quem é (a preencher)'} (esqueleto do \`npm run novo\`; voz ${Vozes.genero(pf) || ''} copiada de ${livre}, que ${p} ainda não usa)
Reino.registrarPersonagem({ id: '${id}', nome: '${novo().aspas(op.nome || '(preencher)')}',
  sprite: { pele: '#e0ac86', cabelo: '#2b1b17', penteado: 'curto', roupa: '#5fb4ff', roupa2: '#2f4a6a', cor2: '#ffd34d' },
  perfil: { voz: '${pf.voz}', velocidade: '${pf.velocidade}', tom: '${pf.tom}' },${lugar}
});
Reino.FALAS_INTERIORES['${L.falas}'].npcs['${id}'] = {
  oi: ['(preencher) quem é você?', '(preencher) o que faz aqui?'],
  depois: ['(preencher) uma fala curtinha.'],
};
`;
    const blocoTambem = `
// ${id} também aqui (registrado em ${op.origem}): mesma voz e sprite; as falas deste interior
Reino.personagemTambemEm('${id}', { predio: '${p}'${xyAcao} });
${falas}`;
    const quem = L.pasta ? `do prédio ${L.pasta}` : `do interior ${p}`;
    const cab = `/* Personagens próprios ${quem} (Reino.registrarPersonagem, docs/contratos/npcs-e-dialogo.md §5) e as falas
   deles em Reino.FALAS_INTERIORES['${L.falas}'].npcs. Carrega ${L.onde.antesDe ? 'antes de ' + L.onde.antesDe : 'depois de ' + L.onde.depoisDe} (manifesto).
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES['${L.falas}'] = Reino.FALAS_INTERIORES['${L.falas}'] || { npcs: {}, objetos: {} };
`;
    const b = op.tambem ? blocoTambem : bloco;
    return [[L.arq, existe ? { acrescentar: b } : cab + b.slice(1)]];
  },
  manifesto(id, op) {
    const L = op.dadosPersonagem.L;
    if (op.dadosPersonagem.existe) return [];
    return { jss: [L.arq.replace(/^jogo\//, '')], onde: L.onde };
  },
  checklist(id, op) {
    const d = op.dadosPersonagem;
    return [
      `falas: troque cada (preencher) em ${d.L.arq} (até 30 letras por página)`,
      op.tambem ? `mesma pessoa de ${op.origem}: sprite, nome e voz vêm de lá; aqui só o lugar e as falas`
        : `sprite e nome de ${id} no mesmo arquivo; voz própria se quiser (hoje copiada de ${d.livre})`,
      op.generoVoz.aviso,
      op.xyEscolhido ? `lugar no interior: escolhi o chão livre (${op.xyEscolhido.x}, ${op.xyEscolhido.y}) da grade de ${op.predio}` +
        (d.desloc ? ` (no registro, x/y + ${d.desloc}: ${op.x}, ${op.y})` : '') + '; mude com --x/--y ou no personagens.js'
        : d.vagas && op.x === undefined ? `lugar no interior: o do guia de marcador (o 1º) ou a próxima vaga livre (VAGAS do ${d.L.pasta}.js)`
          : `lugar no interior: (${op.x}, ${op.y})`,
      `confira com node jogo/ferramentas/validar/validar-interiores.js e npm run ver -- --ir ${d.L.def.lugar || op.predio}`,
      'vozes: npm run vozes',
    ];
  },
  validadores: ['node jogo/ferramentas/validar/validar-interiores.js', 'npm test', 'npm run e2e'],
  ver(id, op) { return `npm run ver -- --ir ${op.dadosPersonagem.L.def.lugar || op.predio} --nome ${id}`; },
};
