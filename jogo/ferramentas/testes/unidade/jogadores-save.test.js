// Jogadores no aparelho e no claude.ai (docs/contratos/save-e-mescla.md §12), num vm com localStorage de mentira e
// saves 100% sintéticos:
// - a Mariana continua em 'mariana-reino-v1' (+ '-novidades'); outro jogador em 'reino-v1-<login>' (+ '-novidades'),
//   sem tocar nas chaves dela; o evento storage da chave dela não mexe no jogo de outro jogador;
// - quem joga sem perguntar (decidirSemTela): congelado, lembrado, aparelho da Mariana, aparelho novo;
// - campo perfil: padrão por jogador, nada gravado no carregamento, definirPerfil carimba e avisa, mescla pelo `em`;
// - contas só no aparelho (file:): criar, repetido, senha, entrar lembrado e com senha, conta estragada;
// - claude.ai: doc progresso/<login> e conta em jogadores/<login>; a Mariana em progresso/mariana, sem conta.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/jogadores-save.test.js   (tudo: npm test)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const PASTA_JS = path.join(__dirname, '..', '..', '..', 'js');
const ARQS = ['sistemas/progresso-campos.js', 'sistemas/jogadores.js'].map((a) => path.join(PASTA_JS, a));
function jogo(op = {}) {
  const j = montar(op);
  ARQS.forEach((a) => vm.runInContext(fs.readFileSync(a, 'utf8'), j.ctx, { filename: a }));
  return j;
}
const save = (estrelas) => { const s = saveHoje(); s.estrelas.ganhas = estrelas; return s; };

test('a Mariana continua em mariana-reino-v1; outro jogador só em reino-v1-<login>', () => {
  const loja = {};
  const m = jogo({ loja, save: save(10) });
  m.R.Jogadores.usar('mariana');
  m.P.carregar();
  assert.strictEqual(m.P.estado().estrelas.ganhas, 10);
  assert.strictEqual(m.P.chaveSave(), 'mariana-reino-v1');
  assert.deepStrictEqual(Object.keys(m.gravacoes), [], 'carregar não grava nada (nem o perfil novo)');
  assert.deepStrictEqual(copia(m.P.estado().perfil), { nome: 'Mariana', sexo: 'menina', em: 0 });
  m.P.salvar();
  assert.deepStrictEqual(Object.keys(m.gravacoes).sort(), ['mariana-reino-v1', 'mariana-reino-v1-novidades']);
  assert.strictEqual(JSON.parse(loja['mariana-reino-v1']).perfil.nome, 'Mariana', 'o save dela ganha o perfil quando o jogo grava');
  const daMariana = loja['mariana-reino-v1'], copiaDela = loja['mariana-reino-v1-novidades'];

  const j = jogo({ loja });
  loja['reino-v1-joao'] = JSON.stringify(save(3));
  j.R.Jogadores.usar('joao');
  j.P.carregar();
  assert.strictEqual(j.P.estado().estrelas.ganhas, 3, 'leu o save dele');
  assert.deepStrictEqual(copia(j.P.estado().perfil), { nome: '', sexo: 'menina', em: 0 });
  j.P.estado().estrelas.ganhas = 50;
  j.P.salvar();
  assert.deepStrictEqual(Object.keys(j.gravacoes).sort(), ['reino-v1-joao', 'reino-v1-joao-novidades']);
  assert.strictEqual(loja['mariana-reino-v1'], daMariana, 'o save da Mariana ficou igual');
  assert.strictEqual(loja['mariana-reino-v1-novidades'], copiaDela, 'e a cópia dela também');
  // outra aba gravou a chave da Mariana: o jogo do joão não junta nada dela
  const outra = save(777);
  j.ouvintes['win:storage'].forEach((fn) => fn({ key: 'mariana-reino-v1', newValue: JSON.stringify(outra) }));
  assert.strictEqual(j.P.estado().estrelas.ganhas, 50);
  // e o da própria chave junta, como sempre
  const dele = JSON.parse(loja['reino-v1-joao']); dele.estrelas.ganhas = 60; dele.atualizado += 5000;
  j.ouvintes['win:storage'].forEach((fn) => fn({ key: 'reino-v1-joao', newValue: JSON.stringify(dele) }));
  assert.strictEqual(j.P.estado().estrelas.ganhas, 60);
  // aparelho novo da Mariana: estado novo com o nome dela
  const n = jogo();
  n.R.Jogadores.usar('mariana');
  assert.strictEqual(n.P.carregar().perfil.nome, 'Mariana');
});

test('usarJogador só antes de carregar e só com login válido', () => {
  const j = jogo();
  ['', 'A', 'João', 'x'.repeat(21), '../x', null].forEach((l) => assert.throws(() => j.P.usarJogador(l), /login inválido/, String(l)));
  j.P.usarJogador('ana');
  j.P.carregar();
  assert.throws(() => j.P.usarJogador('mariana'), /antes de P.carregar/);
  assert.strictEqual(j.P.jogador(), 'ana');
  // sem ninguém escolher, é a Mariana (as ferramentas e os testes antigos carregam direto)
  const m = jogo({ save: save(4) });
  assert.strictEqual(m.P.carregar().estrelas.ganhas, 4);
  assert.strictEqual(m.R.Jogadores.atual(), 'mariana');
  assert.ok(m.R.Jogadores.ehMariana());
});

test('quem joga sem perguntar: congelado, lembrado, aparelho da Mariana, aparelho novo', () => {
  const J = (loja, op = {}) => { const j = jogo({ loja, ...op }); if (op.congelado) j.R.congelado = true; return j.R.Jogadores.decidirSemTela(); };
  assert.strictEqual(J({}), null, 'aparelho novo: pergunta');
  assert.strictEqual(J({ 'mariana-reino-v1': JSON.stringify(save(1)) }), 'mariana', 'aparelho da Mariana: entra nela');
  const contas = JSON.stringify({ joao: { senha: 'abc', criado: 1 } });
  assert.strictEqual(J({ 'mariana-reino-v1': '{}', 'reino-jogador-atual': 'joao', 'reino-jogadores': contas }), 'joao');
  assert.strictEqual(J({ 'reino-jogador-atual': 'mariana' }), 'mariana');
  assert.strictEqual(J({ 'mariana-reino-v1': '{}', 'reino-jogador-atual': 'joao' }), null, 'lembrado sem conta: pergunta (nunca cai na Mariana)');
  assert.strictEqual(J({ 'mariana-reino-v1': '{}', 'reino-jogador-atual': '__proto__', 'reino-jogadores': '{"__proto__":{"senha":"x"}}' }), null);
  assert.strictEqual(J({ 'reino-jogador-atual': 'joao', 'reino-jogadores': contas }, { congelado: true }), 'mariana', 'congelado: sempre a Mariana');
  assert.strictEqual(J(null, { semArmazenamento: true }), 'mariana', 'sem armazenamento: como sempre');
});

test('perfil: padrão por jogador, definirPerfil carimba e avisa, nome vazio mostra o login, mescla pelo em', () => {
  const j = jogo();
  j.R.Jogadores.usar('ana');
  j.P.carregar();
  assert.deepStrictEqual(copia(j.R.Jogadores.perfil()), { nome: 'Ana', sexo: 'menina' });
  const avisos = [];
  j.R.util.on(j.R.EVENTOS.PERFIL, (p) => avisos.push(copia(p)));
  j.R.Jogadores.definirPerfil({ nome: '  Aninha  ', sexo: 'menino' });
  assert.deepStrictEqual(avisos, [{ nome: 'Aninha', sexo: 'menino' }]);
  const p1 = copia(j.P.estado().perfil);
  assert.strictEqual(p1.em, j.relogio.agora);
  assert.strictEqual(JSON.parse(j.guardado['reino-v1-ana']).perfil.nome, 'Aninha', 'gravou');
  j.R.Jogadores.definirPerfil({ nome: 'Ana', sexo: 'estragado' });   // mesmo instante: carimbo + 1; sexo inválido fica o de antes
  assert.deepStrictEqual(copia(j.P.estado().perfil), { nome: 'Ana', sexo: 'menino', em: p1.em + 1 });
  // mescla: vale o em maior, em qualquer ordem
  const a = save(1), b = save(1);
  a.perfil = { nome: 'Velho', sexo: 'menina', em: 5 }; a.atualizado = 9e12;
  b.perfil = { nome: 'Novo', sexo: 'menino', em: 6 };
  assert.strictEqual(j.P.mesclar(a, b).perfil.nome, 'Novo');
  assert.strictEqual(j.P.mesclar(b, a).perfil.nome, 'Novo');
  // lado sem o campo (aparelho antigo) não apaga
  delete b.perfil;
  assert.strictEqual(j.P.mesclar(b, a).perfil.nome, 'Velho');
  assert.ok(j.P.camposRegistrados().includes('perfil'));
});

test('contas só no aparelho (file:): criar, repetido, senha, entrar lembrado e com senha', async () => {
  const loja = {};
  const j = jogo({ loja });
  const J = j.R.Jogadores;
  assert.deepStrictEqual(copia(await J.criar('Joao', 'abc')), { erro: 'login' });
  assert.deepStrictEqual(copia(await J.criar('mariana', 'abc')), { erro: 'existe' });
  assert.deepStrictEqual(copia(await J.criar('joao', 'ab')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await J.criar('__proto__', 'abc')), { erro: 'login' });
  assert.deepStrictEqual(copia(await J.criar('joao', 'abc')), { ok: true });
  assert.strictEqual(loja['reino-jogador-atual'], 'joao', 'criou e ficou lembrado');
  assert.deepStrictEqual(copia(await J.criar('joao', 'xyz')), { erro: 'existe' });
  assert.deepStrictEqual(copia(await J.listar()), ['mariana', 'joao']);
  assert.ok(J.lembrado('joao') && !J.lembrado('mariana') && !J.lembrado('ana'), 'a Mariana não é lembrada num aparelho sem ela');
  // outro aparelho (loja nova) não conhece: pede a senha e não acha
  const k = jogo({ loja: {} });
  assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('joao', 'abc')), { erro: 'naoExiste' });
  // neste: lembrado entra sem senha; com senha, confere
  assert.deepStrictEqual(copia(await J.entrar('joao')), { ok: true });
  assert.deepStrictEqual(copia(await J.entrar('joao', 'errada')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await J.entrar('mariana')), { erro: 'senha' }, 'fora do aparelho dela, a Mariana pede a senha');
  assert.deepStrictEqual(copia(await J.entrar('mariana', 'unicorlice77')), { ok: true });
  assert.strictEqual(loja['reino-jogador-atual'], 'mariana');
  assert.ok(J.lembrado('mariana'), 'depois de entrar, este aparelho lembra dela');
  assert.strictEqual(loja['mariana-reino-v1'], undefined, 'entrar não cria save');
  // contas estragadas não quebram
  const e = jogo({ loja: { 'reino-jogadores': '{"__proto__":{"senha":"x"},"ok":{"senha":1},"bia":{"senha":"sol"},"mariana":{"senha":"x"}}' } });
  assert.deepStrictEqual(copia(e.R.Jogadores.listarLocais()), ['mariana', 'bia']);
  assert.strictEqual({}.senha, undefined, 'protótipo limpo');
  const f = jogo({ loja: { 'reino-jogadores': 'não é json' } });
  assert.deepStrictEqual(copia(f.R.Jogadores.listarLocais()), ['mariana']);
});

// claude.ai de mentira: db com docs em memória (o que o jogo pediu fica anotado)
function artifact(j, docs) {
  const pedidos = [];
  const ref = (p) => ({
    get: () => { pedidos.push('get ' + p); return Promise.resolve({ exists: p in docs, data: () => (p in docs ? copia(docs[p]) : undefined) }); },
    set: (d) => { pedidos.push('set ' + p); docs[p] = copia(d); return Promise.resolve(); },
    onSnapshot: () => {},
  });
  j.ctx.claude = { use: () => Promise.resolve({ doc: ref, collection: (c) => ({ get: () => Promise.resolve({ docs: Object.keys(docs).filter((k) => k.startsWith(c + '/')).map((k) => ({ id: k.slice(c.length + 1) })) }) }) }) };
  return pedidos;
}

test('claude.ai: outro jogador em progresso/<login> com a conta em jogadores/<login>; a Mariana em progresso/mariana', async () => {
  const docMariana = { estado: save(11), atualizado: 1 };
  const docs = { 'progresso/mariana': docMariana };
  const j = jogo();
  const pedidos = artifact(j, docs);
  assert.deepStrictEqual(copia(await j.R.Jogadores.criar('bia', 'sol')), { ok: true });
  assert.deepStrictEqual(copia(docs['jogadores/bia']).senha, 'sol');
  assert.deepStrictEqual(copia(await j.R.Jogadores.criar('bia', 'lua')), { erro: 'existe' }, 'já lembrada neste aparelho');
  const k = jogo();
  artifact(k, docs);
  assert.deepStrictEqual(copia(await k.R.Jogadores.criar('bia', 'lua')), { erro: 'existe' }, 'o banco recusa');
  assert.deepStrictEqual(copia(await k.R.Jogadores.listar()), ['mariana', 'bia']);
  assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('bia', 'lua')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('bia', 'sol')), { ok: true });
  j.guardado['reino-v1-bia'] = JSON.stringify(save(5));
  j.R.Jogadores.usar('bia');
  j.P.carregar();
  await j.P.iniciarNuvem();
  assert.strictEqual(docs['progresso/bia'].estado.estrelas.ganhas, 5);
  assert.ok(!pedidos.some((p) => p === 'set progresso/mariana'), 'nunca grava o doc da Mariana');
  assert.deepStrictEqual(docs['progresso/mariana'], docMariana);
  // a Mariana: progresso/mariana, sem passar pelas contas
  const m = jogo({ save: save(12) });
  const pm = artifact(m, docs);
  m.R.Jogadores.usar('mariana');
  m.P.carregar();
  await m.P.iniciarNuvem();
  assert.ok(pm.includes('get progresso/mariana') && !pm.some((p) => /jogadores\//.test(p)), pm.join(', '));
});

test('fotos: a Mariana no banco de sempre (com as fotos de hoje), os outros num banco só deles', () => {
  const arq = path.join(PASTA_JS, 'sistemas/fotos.js');
  const bancoDe = (login) => {
    const j = jogo();
    if (login) j.R.Jogadores.usar(login);
    j.R.Desenho = { K: '#3a2446' };
    vm.runInContext(fs.readFileSync(arq, 'utf8'), j.ctx, { filename: arq });
    return j.R._fotos.cfg().banco;
  };
  assert.strictEqual(bancoDe(null), 'reino-fotos');
  assert.strictEqual(bancoDe('mariana'), 'reino-fotos');
  assert.strictEqual(bancoDe('joao'), 'reino-fotos-joao');
});

test('enviarAgora cumpre mesmo quando o banco revoga no meio (com envio pendente)', async () => {
  const j = jogo({ save: save(3), timersReais: true });
  let falhar = null;
  j.ctx.claude = { use: () => Promise.resolve({ doc: () => ({
    get: () => Promise.resolve({ exists: false, data: () => null }),
    set: () => new Promise((ok, erro) => { falhar = () => erro({ code: 'revoked' }); }),
    onSnapshot: () => {},
  }) }) };
  j.P.carregar();
  await j.P.iniciarNuvem();   // comecou: já sai um envio (fica gravando)
  const espera = j.P.enviarAgora();   // pendente atrás dele
  let cumpriu = false;
  espera.then(() => { cumpriu = true; });
  falhar();
  await new Promise((r) => setTimeout(r, 50));
  assert.ok(cumpriu, 'não ficou esperando à toa');
});

test('senha da Mariana: aparelho dela entra direto, os outros conferem config.jogadores.senhaMariana', async () => {
  // aparelho com o save dela: lembrada, entra sem senha (e nada é gravado no save)
  const salvo = JSON.stringify({ v: 1, comecou: true });
  const loja = { 'mariana-reino-v1': salvo };
  const a = jogo({ loja });
  assert.ok(a.R.Jogadores.lembrado('mariana'));
  assert.deepStrictEqual(copia(await a.R.Jogadores.entrar('mariana')), { ok: true });
  assert.strictEqual(loja['mariana-reino-v1'], salvo, 'o save dela não mudou');
  // aparelho sem ela: senha errada recusa, a certa entra
  const b = jogo({ loja: {} });
  assert.strictEqual(b.R.config.jogadores.senhaMariana, 'unicorlice77');
  assert.ok(!b.R.Jogadores.lembrado('mariana'));
  assert.deepStrictEqual(copia(await b.R.Jogadores.entrar('mariana', 'errada')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await b.R.Jogadores.entrar('mariana', '')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await b.R.Jogadores.entrar('mariana', 'unicorlice77')), { ok: true });
  // sem senhaMariana no config: entra direto, como antes
  const c = jogo({ loja: {} });
  c.R.config.jogadores.senhaMariana = '';
  assert.deepStrictEqual(copia(await c.R.Jogadores.entrar('mariana', 'qualquer')), { ok: true });
});

test('senha da Mariana no claude.ai: doc jogadores/mariana (criado com senhaMariana se faltar, nunca por cima)', async () => {
  const docMariana = { estado: save(11), atualizado: 1 };
  const docs = { 'progresso/mariana': docMariana };
  const j = jogo({ loja: {} });
  const pedidos = artifact(j, docs);
  assert.deepStrictEqual(copia(await j.R.Jogadores.entrar('mariana', 'errada')), { erro: 'senha' });
  assert.deepStrictEqual(copia(docs['jogadores/mariana']).senha, 'unicorlice77', 'o jogo criou a conta dela');
  assert.deepStrictEqual(copia(await j.R.Jogadores.entrar('mariana', 'unicorlice77')), { ok: true });
  // doc que já existe com outra senha: vale ele, e ninguém escreve por cima
  docs['jogadores/mariana'] = { login: 'mariana', senha: 'nova', criado: 3 };
  const k = jogo({ loja: {} });
  const pk = artifact(k, docs);
  assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('mariana', 'unicorlice77')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await k.R.Jogadores.entrar('mariana', 'nova')), { ok: true });
  assert.ok(!pk.some((p) => p.startsWith('set ')), 'nada gravado: ' + pk.join(', '));
  assert.deepStrictEqual(docs['progresso/mariana'], docMariana, 'o progresso dela não foi tocado');
  assert.ok(!pedidos.concat(pk).some((p) => /progresso\//.test(p)), 'entrar nem lê o progresso');
});

test('Sair: o aparelho da Mariana pede login no próximo carregamento, sem apagar o save', async () => {
  const salvo = JSON.stringify(save(9));
  const loja = { 'mariana-reino-v1': salvo };
  const j = jogo({ loja });
  let recarregou = 0;
  j.ctx.location = { protocol: 'file:', search: '', reload: () => { recarregou++; } };
  assert.strictEqual(j.R.Jogadores.decidirSemTela(), 'mariana', 'antes de sair: direto nela');
  j.R.Jogadores.usar('mariana');
  j.P.carregar();
  await j.R.Jogadores.sair();
  assert.strictEqual(recarregou, 1);
  assert.strictEqual(loja['reino-jogador-atual'], ':saiu');
  assert.ok(loja['mariana-reino-v1'], 'o save dela continua lá');
  assert.strictEqual(JSON.parse(loja['mariana-reino-v1']).estrelas.ganhas, 9);
  const depois = jogo({ loja });
  assert.strictEqual(depois.R.Jogadores.decidirSemTela(), null, 'depois de sair: tela de login');
  assert.ok(!depois.R.Jogadores.lembrado('mariana'), 'e o cartão dela pede a senha');
  assert.deepStrictEqual(copia(await depois.R.Jogadores.entrar('mariana')), { erro: 'senha' });
  assert.deepStrictEqual(copia(await depois.R.Jogadores.entrar('mariana', 'unicorlice77')), { ok: true });
  assert.strictEqual(loja['reino-jogador-atual'], 'mariana');
  assert.strictEqual(jogo({ loja }).R.Jogadores.decidirSemTela(), 'mariana', 'entrou de novo: volta a entrar direto');
  // congelado (e2e) ignora a marca
  const cong = jogo({ loja: { 'mariana-reino-v1': salvo, 'reino-jogador-atual': ':saiu' } });
  cong.R.congelado = true;
  assert.strictEqual(cong.R.Jogadores.decidirSemTela(), 'mariana');
});
