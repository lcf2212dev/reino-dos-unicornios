// Teste de NAVEGADOR do "Jogar com amigos" (Chromium, servidor de TESTE + um proxy só do teste com /api/juntos e
// /api/presenca em memória: servidor-presenca.js; docs/contratos/juntos.md §10). O caminho do PKXD, com contas
// sintéticas e save sintético no servidor de teste:
// - a ana cria um servidor e recebe um código e um link de convite;
// - a bia entra pelo LINK (?servidor=CODE) e o caio, sem link nem código, fica sozinho (como sempre foi);
// - ana e bia se veem pelo nome, a posição de uma chega na outra, o aceno aparece e a tela mostra o código;
// - a bia fecha o jogo e some da tela da ana; o caio nunca viu ninguém.
// O servidor de casa (intocável) não tem as rotas: o proxy existe só aqui. Nada toca no save real nem no banco da Vercel.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/juntos.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('node:assert');
const { iniciar } = require('../servidor-teste');
const { iniciarPresenca } = require('../servidor-presenca');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const SENHA = 'abc123';
const esperar = (page, fn, arg, ms) => page.waitForFunction(fn, arg, { timeout: ms || 30000 });
const noJogo = (page, login) => esperar(page, (l) => window.Reino && Reino.Progresso && Reino.Progresso.estado() &&
  Reino.Jogadores.atual() === l && !!document.querySelector('#hud') && !document.querySelector('#hud').hidden, login, 40000);
const euVejo = (page, login) => esperar(page, (l) => !!Reino.Juntos && Reino.Juntos.todos().some((j) => j.login === l), login, 30000);
const euNaoVejo = (page, login) => esperar(page, (l) => !!Reino.Juntos && !Reino.Juntos.todos().some((j) => j.login === l), login, 30000);

async function entrar(page, login) {
  await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 40000 });
  await page.click('.tela-inicio .btn-comecar');
  await page.waitForSelector('#jogador-entrar-login', { timeout: 30000 });
  await page.fill('#jogador-entrar-login', login);
  await page.fill('#jogador-entrar-senha', SENHA);
  await page.press('#jogador-entrar-senha', 'Enter');
  await noJogo(page, login);
}
const api = (s, u, o) => fetch(s.url + u, o);
const postar = (s, u, corpo) => api(s, u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });

test('juntos: a ana cria o servidor, a bia entra pelo convite, o caio fica sozinho', async () => {
  const servidor = await iniciar();
  const proxy = await iniciarPresenca(servidor.url);
  const browser = await lancar();
  try {
    // contas sintéticas no servidor de TESTE e um save sintético completo para cada uma (entram direto no mapa)
    for (const login of ['ana', 'bia', 'caio']) assert.strictEqual((await postar(servidor, 'api/jogadores', { login: login, senha: SENHA })).status, 201);
    const g = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperar(g.page, () => window.Reino && Reino.materias && Reino.Progresso && Reino.Progresso.estado());
    const save = (await g.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await g.context.close();
    for (const login of ['ana', 'bia', 'caio']) {
      const r = await api(servidor, 'api/progresso/' + login, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: save, atualizado: save.atualizado }) });
      assert.ok(r.ok, 'save sintético de ' + login + ': ' + r.status);
    }

    // a ana entra e cria o servidor (o caminho da tela: J.criar é o mesmo botão "Criar servidor")
    const a = await abrir({ browser, url: proxy.url, query: '?debug=1' });
    await entrar(a.page, 'ana');
    assert.strictEqual(await a.page.evaluate(() => document.querySelector('#hud .btn-juntos').hidden), false, 'o 👥 está sempre à mão');
    assert.strictEqual(await a.page.evaluate(() => Reino.Juntos.servidor()), null, 'ainda sozinha');
    // o caminho da tela: 👥 → "Criar servidor" → o painel passa a mostrar o código (sem fechar e abrir)
    await a.page.evaluate(() => Reino.UI.abrirJuntos());
    await a.page.waitForSelector('.tela-juntos .juntos-acao button');
    await a.page.click('.tela-juntos .juntos-acao button');
    await a.page.waitForSelector('.tela-juntos .juntos-codigo-grande', { timeout: 20000 });
    const codigo = await a.page.evaluate(() => document.querySelector('.tela-juntos .juntos-codigo-grande').textContent);
    await a.page.evaluate(() => Reino.UI.fecharTodas());
    assert.ok(/^[A-HJ-NP-Z2-9]{4}$/.test(codigo), 'código de 4 letras: ' + codigo);
    assert.strictEqual(await a.page.evaluate(() => localStorage.getItem('reino-juntos-servidor')), codigo, 'o servidor fica lembrado');
    assert.strictEqual(await a.page.evaluate(() => Reino.Juntos.dono()), true, 'quem criou é o dono');

    // a bia entra pelo LINK do convite (o mesmo que o botão copia) e cai dentro do servidor
    const b = await abrir({ browser, url: proxy.url, query: '?debug=1&servidor=' + codigo });
    await entrar(b.page, 'bia');
    await euVejo(a.page, 'bia');
    await euVejo(b.page, 'ana');
    assert.deepStrictEqual(await a.page.evaluate(() => ({ total: Reino.Juntos.total(), naSala: Reino.Juntos.outros().map((j) => j.nome), sala: Reino.Juntos.salaAtual() })),
      { total: 1, naSala: ['Bia'], sala: 'mapa' });
    assert.strictEqual(await b.page.evaluate(() => Reino.Juntos.dono()), false, 'quem entra não é o dono');
    // o caio NÃO entrou em servidor nenhum: fica sozinho, como sempre foi (e sem um pedido de presença)
    const c = await abrir({ browser, url: proxy.url, query: '?debug=1' });
    await entrar(c.page, 'caio');
    assert.deepStrictEqual(await c.page.evaluate(() => ({ pode: Reino.Juntos.pode(), ligado: Reino.Juntos.ligado(), servidor: Reino.Juntos.servidor(), total: Reino.Juntos.total() })),
      { pode: true, ligado: false, servidor: null, total: 0 });

    // a posição que chega é a de verdade: a ana anda e a bia recebe
    await a.page.evaluate(() => { Jogador.posicionar(30, 20); });
    await esperar(b.page, () => { const j = Reino.Juntos.todos().find((x) => x.login === 'ana'); return j && Math.abs(j.x - (30 * 16 + 8)) < 2 && Math.abs(j.y - (20 * 16 + 12)) < 2; }, null, 15000);
    // e o desenho entra na camada do módulo (item por Y, como tudo no quadro)
    assert.strictEqual(await b.page.evaluate(() => Reino.JuntosDesenho.itensDesenho({}, performance.now(), true).length), 1);

    // o aceno da bia chega na ana (o balão sai do relógio do servidor)
    await b.page.evaluate(() => Reino.Juntos.acenar());
    await esperar(a.page, () => { const j = Reino.Juntos.todos().find((x) => x.login === 'bia'); return j && j.aceno > 0; }, null, 15000);

    // a tela mostra o código do servidor e quem está dentro
    await a.page.evaluate(() => Reino.UI.abrirJuntos());
    await a.page.waitForSelector('.tela-juntos .juntos-linha');
    const tela = await a.page.evaluate(() => ({
      codigo: (document.querySelector('.tela-juntos .juntos-codigo-grande') || {}).textContent,
      nomes: [...document.querySelectorAll('.tela-juntos .juntos-nome')].map((n) => n.textContent),
      link: (document.querySelector('.tela-juntos .juntos-link') || {}).textContent,
      recados: document.querySelectorAll('.tela-juntos .juntos-recados .btn-pequeno').length,
    }));
    assert.strictEqual(tela.codigo, codigo);
    assert.deepStrictEqual(tela.nomes, ['Bia']);
    assert.ok(tela.link && tela.link.indexOf('?servidor=' + codigo) > 0, 'o link do convite: ' + tela.link);
    assert.ok(tela.recados >= 4, 'os recados prontos');
    await a.page.evaluate(() => Reino.UI.fecharTodas());

    // a bia fecha o jogo: o pagehide manda saiu: true e a ana deixa de vê-la na hora (sem esperar o TTL)
    await b.page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });
    await esperar(b.page, () => !Reino.Juntos.ligado());
    assert.ok(proxy.saiu >= 1, 'o pagehide mandou saiu: true (não dependeu do TTL)');
    await b.context.close();
    await euNaoVejo(a.page, 'bia');
    assert.deepStrictEqual(a.page.__erros, []);
    assert.deepStrictEqual(b.page.__erros, []);
    assert.deepStrictEqual(c.page.__erros, []);
  } finally {
    // o Chromium aberto segura o processo do teste: fecha TUDO antes de derrubar servidor e proxy
    try { await browser.close(); } catch (e) { /* já fechou */ }
    await proxy.parar();
    await servidor.parar();
  }
});
