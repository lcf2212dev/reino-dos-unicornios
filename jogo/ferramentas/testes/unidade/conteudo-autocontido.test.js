// Conteúdo autocontido: prova com acessórios inline (desenho + ícone no próprio arquivo) e personagem
// com voz num registro só (Reino.registrarPersonagem). Nada do jogo de verdade muda: a prova de mentira
// entra numa cópia em /tmp/reino-testes/ (js sem voz e ferramentas sem gerado).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/conteudo-autocontido.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');

const jogo = Jogo.raiz;
const tmp = path.join('/tmp/reino-testes', 'autocontido-' + crypto.createHash('md5').update(jogo).digest('hex').slice(0, 8));

const ICONE = { n: 'Estrela de Mentira (lendário)', p: { k: '#3a2446', y: '#ffd34d' },
  d: Array.from({ length: 16 }, (_, i) => (i === 0 || i === 15 ? '.'.repeat(16) : '.k' + 'y'.repeat(12) + 'k.')) };
const DESENHO = { linhas: ['.k.', 'kyk', '.k.'], paleta: { k: '#3a2446', y: '#ffd34d' }, ancora: 'cabeca', dx: -1, dy: -2 };
function acessorio(id, nome) { return { id, nome, desenho: DESENHO, icone: Object.assign({}, ICONE, { n: nome }) }; }

// texto de um arquivo de prova de mentira (História), com a professora registrada no próprio arquivo
function provaDeMentira(ajuste = (p) => p) {
  const prova = ajuste({
    id: 'mentira-9bim', materiaId: 'historia', nome: 'Prova de Mentira', bimestre: '9º bimestre', emoji: '📜',
    acessorios: { lendario: acessorio('mentira-lend', 'Estrela Lendária'), raro: acessorio('mentira-raro', 'Estrela Rara'), comum: acessorio('mentira-comum', 'Estrela Comum') },
    questoes: [{ id: 'mt9-01', tipo: 'vf', livro: 'documentos', pergunta: 'A fotografia antiga conta história?', certa: true,
      explica: 'Sim! Uma fotografia antiga mostra como as pessoas eram.' }],
  });
  const prof = { id: 'mentirinha', nome: 'Professora Mentirinha', paraProva: 'mentira-9bim',
    sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', roupa: '#ff9d2e', roupa2: '#6b4a9a', perna: 'saia' },
    perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '-5%', tom: '+4Hz' } };
  return `Reino.registrarPersonagem(${JSON.stringify(prof)});\nReino.registrarProva(${JSON.stringify(prova)});\n`;
}

// cópia do jogo com a prova de mentira no manifesto (grupo provas)
function copiaComProva(nome, texto) {
  const destino = path.join(tmp, nome, 'jogo');
  const fora = [path.join(jogo, 'js', 'voz'), path.join(jogo, 'ferramentas', 'gerado')];
  ['js', 'ferramentas'].forEach((p) => fs.cpSync(path.join(jogo, p), path.join(destino, p), {
    recursive: true, force: true, filter: (src) => !fora.some((f) => src === f || src.startsWith(f + path.sep)),
  }));
  fs.writeFileSync(path.join(destino, 'js/conteudo/provas/mentira-9bim.js'), texto);
  const man = path.join(destino, 'js/manifesto.js');
  const ancora = "{ js: 'js/conteudo/provas/portugues-3bim.js', grupo: 'provas', node: true },";
  const t = fs.readFileSync(man, 'utf8');
  assert.ok(t.includes(ancora), 'âncora do manifesto sumiu (atualize o teste)');
  fs.writeFileSync(man, t.replace(ancora, ancora + "\n      { js: 'js/conteudo/provas/mentira-9bim.js', grupo: 'provas', node: true },"));
  return destino;
}
function validar(dir) {
  const r = spawnSync(process.execPath, ['ferramentas/validar/validar-conteudo.js', '--detalhes'], { cwd: dir, encoding: 'utf8' });
  return { status: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}

test('prova com acessórios inline passa no validar-conteudo', () => {
  const r = validar(copiaComProva('ok', provaDeMentira()));
  assert.strictEqual(r.status, 0, r.saida);
  assert.match(r.saida, /Prova de Mentira/);
});

test('validar-conteudo acusa desenho inline torto (linha curta, letra sem cor, âncora errada)', () => {
  const r = validar(copiaComProva('torto', provaDeMentira((p) => {
    p.acessorios.raro.desenho = { linhas: ['.k.', 'kz'], paleta: { k: '#000' }, ancora: 'nariz', dx: 0, dy: 0 };
    return p;
  })));
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /mentira-raro \(desenho\): linhas de tamanhos diferentes/);
  assert.match(r.saida, /mentira-raro \(desenho\): letras sem cor na paleta: z/);
  assert.match(r.saida, /mentira-raro: âncora do desenho inválida/);
});

// no vm: nucleo + ícones + a prova de mentira + NPCs e elenco
function carregarComProva(texto) {
  const ctx = Jogo.contexto({ console });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['icones', 'arte'] }));
  vm.runInContext(texto, ctx, { filename: 'mentira-9bim.js' });
  Jogo.carregar(ctx, Jogo.scripts({ grupos: ['personagens'] }).filter((s) => /npcs|elenco/.test(s.js)));
  return ctx;
}

test('registrarProva põe o ícone em ICONES e guarda o desenho', () => {
  const ctx = carregarComProva(provaDeMentira());
  assert.strictEqual(ctx.ICONES['acessorio:mentira-lend'].n, 'Estrela Lendária');
  assert.strictEqual(JSON.stringify(ctx.Reino.desenhosAcessorios['mentira-comum']), JSON.stringify(DESENHO));
});

test('personagem registrado entra no elenco (depois dos de hoje) com o perfil em config.vozes', () => {
  const ctx = carregarComProva(provaDeMentira());
  const N = ctx.Reino.NPCs;
  const ids = Object.keys(N.ELENCO);
  assert.strictEqual(ids[ids.length - 1], 'mentirinha');
  assert.strictEqual(N.ELENCO.mentirinha.voz, 'npc-mentirinha');
  assert.strictEqual(N.doElenco({ paraProva: 'mentira-9bim' }), 'mentirinha');
  assert.strictEqual(ctx.Reino.config.vozes['npc-mentirinha'].tom, '+4Hz');
  // quem registra depois do elenco entra direto
  ctx.Reino.registrarPersonagem({ id: 'tardio', nome: 'Seu Tardio', sprite: {}, perfil: { voz: 'pt-BR-AntonioNeural', velocidade: '+0%', tom: '+0Hz' } });
  assert.ok(N.ELENCO.tardio);
  assert.ok(ctx.Reino.config.vozes['npc-tardio']);
});

test('id repetido falha: entre registrados, com o elenco de hoje e registrado antes do elenco', () => {
  const ctx = carregarComProva(provaDeMentira());
  assert.throws(() => ctx.Reino.registrarPersonagem({ id: 'mentirinha', nome: 'X', sprite: {} }), /id repetido "mentirinha"/);
  assert.throws(() => ctx.Reino.registrarPersonagem({ id: 'helena', nome: 'X', sprite: {} }), /id repetido "helena"/);
  assert.throws(() => carregarComProva(provaDeMentira().replace('"id":"mentirinha"', '"id":"lucia"')), /id repetido com o elenco "lucia"/);
});
