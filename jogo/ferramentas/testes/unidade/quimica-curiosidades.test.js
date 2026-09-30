// Testes de unidade: as curiosidades do 2º andar do Laboratório de Química (js/conteudo/quimica/curiosidades.js) e a
// ação quimica-curiosidade (js/interiores/quimica/curiosidade.js). Contrato: docs/contratos/quimica.md §9.
// Rodar: node --test jogo/ferramentas/testes/unidade/quimica-curiosidades.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Jogo = require('../../jogo-no-node');

const ARQ = path.join(__dirname, '../../../js/conteudo/quimica/curiosidades.js');
const letras = (v) => v.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim().length;
// nada de bicho (pedido): palavras proibidas no texto
const BICHOS = ['abelha', 'vaga-lume', 'vagalume', 'formiga', 'peixe', 'gato', 'cachorro', 'pássaro', 'passarinho',
  'borboleta', 'aranha', 'flamingo', 'polvo', 'baleia', 'cobra', 'sapo', 'inseto', 'bicho', 'animal', 'lagarta',
  'minhoca', 'galinha', 'vaca', 'mosca', 'mosquito', 'besouro', 'caracol', 'água-viva', 'camarão', 'lula'];

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}

test('curiosidades: 45 ou mais, ids únicos, 4+ em cada tema do contrato', () => {
  const Q = carregar().Quimica;
  const cs = Q.curiosidades();
  assert.ok(cs.length >= 45, 'curiosidades: ' + cs.length);
  const ids = cs.map((c) => c.id);
  assert.strictEqual(ids.filter((id, i) => ids.indexOf(id) !== i).join(', '), '', 'ids repetidos');
  Q.TEMAS_CURIOSIDADE.forEach((t) => {
    const n = cs.filter((c) => c.tema === t).length;
    assert.ok(n >= 4, t + ': ' + n + ' curiosidades');
  });
  cs.forEach((c) => assert.ok(Q.TEMAS_CURIOSIDADE.includes(c.tema), c.id + ': tema ' + c.tema));
});

test('curiosidades: 2 a 4 páginas de até 30 letras e 3+ palavras, sem fórmula e sem bicho', () => {
  const ruins = [];
  carregar().Quimica.curiosidades().forEach((c) => {
    if (!Array.isArray(c.paginas) || c.paginas.length < 2 || c.paginas.length > 4) ruins.push(c.id + ': páginas');
    (c.paginas || []).forEach((p) => {
      if (letras(p) > 30) ruins.push(`${c.id}: ${letras(p)} letras: "${p}"`);
      if (p.trim().split(/\s+/).length < 3) ruins.push(`${c.id}: menos de 3 palavras: "${p}"`);
      if (/[A-Z][a-z]?[0-9₀-₉]/.test(p)) ruins.push(`${c.id}: fórmula: "${p}"`);
      const baixo = p.toLowerCase();
      BICHOS.forEach((b) => { if (new RegExp('(^|[^a-zà-ú])' + b + 's?($|[^a-zà-ú])').test(baixo)) ruins.push(`${c.id}: bicho "${b}"`); });
    });
  });
  assert.deepStrictEqual(ruins, []);
});

test('curiosidades: toda entrada tem o comentário // fonte: <instituição> — <URL> logo antes', () => {
  const linhas = fs.readFileSync(ARQ, 'utf8').split('\n');
  const ruins = [];
  let n = 0;
  linhas.forEach((l, i) => {
    if (!/^\s*\{ id: '/.test(l)) return;
    n++;
    const antes = linhas[i - 1] || '';
    if (!/^\s*\/\/ fonte: .+ — https?:\/\/\S+/.test(antes)) ruins.push('linha ' + (i + 1) + ': sem fonte antes');
  });
  assert.ok(n >= 45, 'entradas no arquivo: ' + n);
  assert.deepStrictEqual(ruins, []);
});

test('curiosidades: a ação quimica-curiosidade está registrada, conta na voz do Professor Carbono e tem reserva', async () => {
  const R = carregar();
  assert.ok(R.NPCs.acoes().includes('quimica-curiosidade'), 'ação registrada');
  // balão de mentira: responde 'mais' entre páginas; no fim, 'outra' uma vez e depois 'tchau'
  const ditos = [];
  let outras = 1;
  R.Claude = { falar: (pg, o) => {
    ditos.push({ pg, o });
    const fim = o.botoes.some((b) => b.valor === 'tchau');
    return Promise.resolve(fim ? (outras-- > 0 ? 'outra' : 'tchau') : 'mais');
  } };
  R.Som = { tocar() {} };
  R.Quimica.reiniciarCuriosidades();
  const obj = { tipo: 'estante', x: 1, y: 2, nome: 'Vitrine dos metais' };
  await R.NPCs.executar({ tipo: 'quimica-curiosidade', tema: 'metais' }, { objeto: obj });
  const metais = R.Quimica.curiosidades().filter((c) => c.tema === 'metais').flatMap((c) => c.paginas);
  assert.ok(ditos.length >= 4, 'duas curiosidades contadas');
  ditos.forEach((d) => {
    assert.ok(metais.includes(d.pg), 'página do tema: ' + d.pg);
    assert.strictEqual(d.o.voz, R.Quimica.VOZ_CARBONO);
    assert.strictEqual(d.o.quem.nome, 'Vitrine dos metais');
  });
  const fins = ditos.filter((d) => d.o.botoes.some((b) => b.valor === 'tchau'));
  assert.strictEqual(fins.length, 2);
  assert.strictEqual(fins[0].o.botoes.map((b) => b.texto).join(' | '), 'Outra curiosidade! ✨ | Tchau! 💛');
  // sem objeto, quem conta é o Professor Carbono; curiosidade sem páginas cai na frase de reserva
  ditos.length = 0; outras = 0;
  R.Quimica.curiosidade = () => ({ id: 'vazia', paginas: [] });
  await R.NPCs.executar({ tipo: 'quimica-curiosidade', tema: 'todas' }, {});
  assert.strictEqual(ditos.length, 1);
  assert.strictEqual(ditos[0].o.quem.nome, 'Professor Carbono');
  assert.ok(typeof ditos[0].pg === 'string' && ditos[0].pg.length > 0, 'frase de reserva');
});
