// Testes de unidade: os presentes do jogo (conteudo/presentes.js, sistemas/presentes.js; pedido 2026-10-28-presente-medalhas).
// O presente 'medalhas-2026' (2 acessórios Ultra Lendários) é só da Mariana; abrir grava `presentes[id]` e põe os dois
// em `loja`, uma vez (idempotente); o Novo ciclo mantém; a mescla junta (o menor `em`, nada some) e a versão antiga
// (sem o campo) não apaga os acessórios; a Loja os vê como Ultra Lendário (L.ultras, L.item, L.estadoPremio).
// O jogo inteiro (os `node: true` do manifesto) num vm com localStorage e relógio de mentira (ajudantes/jogo-save.js).
// Saves 100% sintéticos; nada toca no save real nem na rede.
// Rodar (da raiz): npm run unidade -- --so presentes
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const ID = 'medalhas-2026', PRATA = 'ultra-medalha-prata-2bim', OURO = 'ultra-medalha-ouro-3bim';
const igual = (a, b, m) => assert.deepStrictEqual(copia(a), copia(b), m);

// o jogo inteiro no vm (cada teste com o seu), com o jogador escolhido antes do carregar
function carregado(opcoes = {}) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar(Object.assign({ agora: 1790000000000, save: saveHoje() }, opcoes)); } finally { Jogo.scripts = orig; }
  if (opcoes.jogador) j.P.usarJogador(opcoes.jogador);
  j.P.carregar();
  return j;
}
const pendentes = (j) => j.P.presentesPendentes().map((d) => d.id);

test('o presente: 2 acessórios Ultra Lendários com ícone e desenho no pescoço', () => {
  const j = carregado();
  const def = j.R.presente(ID);
  igual(def.acessorios.map((a) => [a.id, a.nome, a.raridade]), [
    [PRATA, 'Medalha de Prata do 2º Bimestre', 'ultra'], [OURO, 'Medalha de Ouro do 3º Bimestre', 'ultra']]);
  def.acessorios.forEach((a) => {
    assert.ok(j.ctx.ICONES['acessorio:' + a.id], 'ícone de ' + a.id);
    assert.strictEqual(j.R.desenhosAcessorios[a.id].ancora, 'pescoco');
    assert.strictEqual(j.R.conferirIcone(a.icone).length, 0);
    (a.falas || []).forEach((f) => assert.ok(f.length <= 30 && f.split(' ').length >= 3, 'fala: ' + f));
  });
  assert.throws(() => j.R.registrarPresente({ id: ID, para: 'mariana', acessorios: def.acessorios }), /repetido/);
});

test('pendente só para a Mariana; outro jogador não vê nem abre', () => {
  const m = carregado();
  igual(pendentes(m), [ID]);
  igual(m.P.estado().presentes, {});
  const o = carregado({ jogador: 'ana' });
  igual(pendentes(o), []);
  assert.strictEqual(o.P.abrirPresente(ID), false);
  assert.ok(!o.P.estado().loja[PRATA] && !o.P.estado().loja[OURO]);
});

test('abrir grava presentes[id] e os dois na loja, salva; de novo não muda o carimbo; não fica pendente', () => {
  const j = carregado();
  const antes = j.contagem.salvar;
  assert.strictEqual(j.P.abrirPresente(ID), true);
  assert.ok(j.contagem.salvar > antes, 'salvou');
  const lido = j.lido();
  assert.strictEqual(lido.presentes[ID], 1790000000000);
  assert.strictEqual(lido.loja[PRATA], true);
  assert.strictEqual(lido.loja[OURO], true);
  igual(pendentes(j), []);
  j.relogio.agora += 5000;
  assert.strictEqual(j.P.abrirPresente(ID), false);
  assert.strictEqual(j.P.estado().presentes[ID], 1790000000000, 'o carimbo é o da 1ª vez');
  assert.strictEqual(j.P.abrirPresente('nao-existe'), false);
  // abrir de novo no aparelho (o que ficou gravado): continua aberto
  const k = carregado({ loja: j.guardado });
  igual(pendentes(k), []);
});

test('Novo ciclo mantém o presente e os acessórios', () => {
  const j = carregado();
  j.P.abrirPresente(ID);
  j.P.novoCiclo();
  assert.strictEqual(j.P.estado().presentes[ID], 1790000000000);
  igual(pendentes(j), []);
  assert.strictEqual(j.P.estado().loja[OURO], true);
});

test('mescla: o menor em, nada some; o lado sem o campo (versão antiga) não apaga o presente nem a loja', () => {
  const j = carregado();
  j.P.abrirPresente(ID);
  const a = copia(j.P.estado());
  const b = copia(a); b.presentes = { [ID]: 1700000000000, outro: 5 };
  const ab = j.P.mesclar(a, b), ba = j.P.mesclar(b, a);
  igual(ab.presentes, { [ID]: 1700000000000, outro: 5 });
  igual(ba.presentes, ab.presentes);
  const antigo = copia(a); delete antigo.presentes; delete antigo.loja[PRATA]; delete antigo.loja[OURO];
  antigo.atualizado = a.atualizado + 1000;   // o antigo é o mais recente
  const m = j.P.mesclar(antigo, a);
  assert.strictEqual(m.presentes[ID], 1790000000000);
  assert.ok(m.loja[PRATA] && m.loja[OURO]);
});

test('Loja: Ultra Lendário fora de premios(), bloqueado sem o presente, ganho depois; L.item veste no pescoço', () => {
  const j = carregado();
  const L = j.R.LojaItens;
  assert.ok(!L.premios().some((p) => p.raridade === 'ultra'), 'premios() continua só Escola e trilha');
  const us = L.ultras();
  igual(us.map((u) => [u.id, u.raridade, u.origem, u.preco]), [[PRATA, 'ultra', 'presente', 0], [OURO, 'ultra', 'presente', 0]]);
  assert.strictEqual(L.estadoPremio(us[1], j.P), 'bloqueado');
  j.P.abrirPresente(ID);
  assert.strictEqual(L.estadoPremio(us[1], j.P), 'ganho');
  const it = L.item(OURO);
  igual([it.id, it.raridade, it.origem, it.icone, it.premio], [OURO, 'ultra', 'presente', 'acessorio:' + OURO, true]);
  igual(L.ULTRA, { nome: 'Ultra Lendário', emoji: '💎' });
});

test('falas do baú no pacote geral (módulo presentes), até 30 letras e 3 palavras ou mais', () => {
  const j = carregado();
  const mod = j.R.modulo('presentes');
  const textos = mod.falas().map((f) => f.texto);
  assert.ok(textos.includes('Mariana, chegou um presente!') && textos.includes('Uma medalha de prata!'));
  textos.forEach((t) => assert.ok(t.length <= 30 && t.split(' ').length >= 3, t));
});
