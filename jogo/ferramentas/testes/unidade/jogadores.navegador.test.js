// Teste de NAVEGADOR (Chromium, servidor de TESTE com banco novo em /tmp, saves sintéticos, SEM congelar: é o jogo de
// verdade escolhendo o jogador; docs/contratos/save-e-mescla.md §12):
// - aparelho da Mariana (save na chave dela, nada lembrado): nenhuma tela antes da abertura, entra nela;
// - aparelho novo: "Quem vai jogar?" → criar jogador → o jogo segue a primeira vez (boas-vindas com o nome dele);
//   trocar para a Mariana e voltar: cada um com o seu progresso; outro aparelho entra nele com senha e recebe o dele
//   do servidor; a linha da Mariana no banco não muda.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/jogadores.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const esperar = (page, fn, arg) => page.waitForFunction(fn, arg, { timeout: 30000 });
const telaInicial = (page) => esperar(page, () => !!(document.querySelector('.tela-inicio .btn-comecar') || document.querySelector('.tela-jogadores .jogadores-cartao')));

test('jogadores: aparelho da Mariana entra direto; criar, trocar e entrar com senha, cada um com o seu progresso', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  const api = (u, o) => fetch(servidor.url + u, o);
  try {
    // um save sintético completo, gerado pelo próprio jogo (congelado: entra direto como Mariana)
    const g = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperar(g.page, () => window.Reino && Reino.materias && Reino.Progresso && Reino.Progresso.estado());
    assert.strictEqual(await g.page.evaluate(() => Reino.Jogadores.atual()), 'mariana');
    const save = (await g.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await g.context.close();
    await api('api/progresso', { method: 'PUT', body: JSON.stringify({ estado: save, atualizado: save.atualizado }) });
    const linhaMariana = await (await api('api/progresso')).text();

    // 1) aparelho da Mariana: nenhuma tela de jogador, a abertura de sempre
    const m = await abrir({ browser, url: servidor.url, save, query: '?debug=1' });
    await telaInicial(m.page);
    assert.deepStrictEqual(await m.page.evaluate(() => ({ jogadores: !!document.querySelector('.tela-jogadores'), atual: Reino.Jogadores.atual(), chave: Reino.Progresso.chaveSave(), nome: Reino.Jogadores.perfil().nome, lembrado: localStorage.getItem('reino-jogador-atual') })),
      { jogadores: false, atual: 'mariana', chave: 'mariana-reino-v1', nome: 'Mariana', lembrado: null });
    // "Sair" no aparelho dela: guarda, e o próximo carregamento pede login (o save fica)
    await m.page.evaluate(() => { Reino.UI.fecharTodas(); Reino.UI.sairDoJogador(); });
    await m.page.waitForSelector('.tela-jogadores .jogadores-cartao[data-login="mariana"] .jogadores-cadeado', { timeout: 30000 });
    const saiu = await m.page.evaluate(() => ({ atual: localStorage.getItem('reino-jogador-atual'), save: JSON.parse(localStorage.getItem('mariana-reino-v1')).estrelas.ganhas }));
    assert.deepStrictEqual(saiu, { atual: ':saiu', save: save.estrelas.ganhas }, 'saiu sem apagar o save dela');
    await m.page.click('.jogadores-cartao[data-login="mariana"]');   // abre o Entrar com o login dela
    assert.strictEqual(await m.page.inputValue('#jogador-entrar-login'), 'mariana');
    await m.page.fill('#jogador-entrar-senha', 'unicorlice77');
    await m.page.press('#jogador-entrar-senha', 'Enter');
    await telaInicial(m.page);
    await esperar(m.page, () => document.querySelector('.tela-inicio .btn-comecar') && Reino.Jogadores.atual() === 'mariana' && Reino.Progresso.estado());
    assert.strictEqual(await m.page.evaluate(() => Reino.Progresso.estado().estrelas.ganhas), save.estrelas.ganhas);
    assert.deepStrictEqual(m.page.__erros, []);
    await m.context.close();

    // 2) aparelho novo: Quem vai jogar? → Criar jogador
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1' });
    await a.page.waitForSelector('.tela-jogadores .jogadores-cartao[data-login="mariana"]', { timeout: 30000 });
    await a.page.click('#jogadores-aba-criar');
    await a.page.fill('#jogador-login', 'Léo 1');   // vira "leo1" enquanto digita
    assert.strictEqual(await a.page.inputValue('#jogador-login'), 'leo1');
    await a.page.fill('#jogador-senha1', 'abc');
    await a.page.fill('#jogador-senha2', 'abd');
    await a.page.click('.jogadores-criar');
    await a.page.waitForSelector('#jogadores-painel-criar .jogadores-erro:not([hidden])');
    await a.page.fill('#jogador-senha2', 'abc');
    await a.page.press('#jogador-senha2', 'Enter');
    // segue a primeira vez de hoje: boas-vindas com o nome dele
    await esperar(a.page, () => { var t = document.querySelector('.tela-inicio'); return t && /Oi, Leo1!/.test(t.textContent); });
    assert.deepStrictEqual(await a.page.evaluate(() => ({ atual: Reino.Jogadores.atual(), chave: Reino.Progresso.chaveSave(), lembrado: localStorage.getItem('reino-jogador-atual') })),
      { atual: 'leo1', chave: 'reino-v1-leo1', lembrado: 'leo1' });
    assert.strictEqual((await api('api/jogadores/entrar', { method: 'POST', body: JSON.stringify({ login: 'leo1', senha: 'abc' }) })).status, 200, 'a conta nasceu no servidor');
    // ele joga (sintético): começou e ganhou 7 estrelas, e troca LOGO (antes do envio atrasado de 1,8 s)
    await a.page.evaluate(() => { var e = Reino.Progresso.estado(); e.comecou = true; e.estrelas.ganhas = 7; Reino.Progresso.salvar(); });
    // trocar para a Mariana (aparelho sem ela: pede a senha, conferida no banco) → "Guardando...", envia já e recarrega nela
    await a.page.evaluate(() => { Reino.UI.fecharTodas(); Reino.UI.trocarJogador(); });
    await a.page.click('.tela-jogadores .jogadores-cartao[data-login="mariana"]');
    // pelo teclado (o toque logo depois de trocar de tela cai na guarda do toque fantasma, ui/base.js)
    await a.page.fill('#jogador-entrar-senha', 'errada');
    await a.page.press('#jogador-entrar-senha', 'Enter');
    await a.page.waitForSelector('#jogadores-painel-entrar .jogadores-erro:not([hidden])');
    await a.page.fill('#jogador-entrar-senha', 'unicorlice77');
    await a.page.press('#jogador-entrar-senha', 'Enter');
    await esperar(a.page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado() && Reino.Jogadores.atual() === 'mariana');
    const recebido = await (await api('api/progresso/leo1')).json();
    assert.strictEqual(recebido.estado.estrelas.ganhas, 7, 'o servidor recebeu o PUT antes do reload');
    await telaInicial(a.page);
    const naMariana = await a.page.evaluate(() => ({ estrelas: Reino.Progresso.estado().estrelas.ganhas, dele: JSON.parse(localStorage.getItem('reino-v1-leo1')).estrelas.ganhas }));
    assert.strictEqual(naMariana.estrelas, save.estrelas.ganhas, 'a Mariana com o progresso dela (do servidor)');
    assert.strictEqual(naMariana.dele, 7, 'e o dele guardado no aparelho');
    // e de volta para ele (lembrado neste aparelho: sem senha)
    await a.page.evaluate(() => { Reino.UI.fecharTodas(); Reino.UI.trocarJogador(); });
    await a.page.waitForSelector('.tela-jogadores .jogadores-cartao[data-login="leo1"]');
    assert.strictEqual(await a.page.$('.jogadores-cartao[data-login="leo1"] .jogadores-cadeado'), null, 'lembrado: sem cadeado');
    await a.page.click('.tela-jogadores .jogadores-cartao[data-login="leo1"]');
    await a.page.waitForLoadState('load');
    await esperar(a.page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado() && Reino.Jogadores.atual() === 'leo1');
    assert.strictEqual(await a.page.evaluate(() => Reino.Progresso.estado().estrelas.ganhas), 7);
    assert.deepStrictEqual(a.page.__erros, []);
    await a.context.close();

    // 3) outro aparelho: o leo1 vem do servidor, com senha
    const b = await abrir({ browser, url: servidor.url, query: '?debug=1' });
    await b.page.waitForSelector('.tela-jogadores .jogadores-cartao[data-login="leo1"] .jogadores-cadeado', { timeout: 30000 });
    await b.page.click('.jogadores-cartao[data-login="leo1"]');
    assert.strictEqual(await b.page.inputValue('#jogador-entrar-login'), 'leo1');
    await b.page.fill('#jogador-entrar-senha', 'errada');
    await b.page.press('#jogador-entrar-senha', 'Enter');
    await b.page.waitForSelector('#jogadores-painel-entrar .jogadores-erro:not([hidden])');
    await b.page.fill('#jogador-entrar-senha', 'abc');
    await b.page.click('.jogadores-entrar');
    await esperar(b.page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado() && Reino.Progresso.estado().estrelas.ganhas === 7);
    assert.strictEqual(await b.page.evaluate(() => localStorage.getItem('mariana-reino-v1')), null, 'nada na chave da Mariana');
    assert.deepStrictEqual(b.page.__erros, []);
    await b.context.close();

    // o banco: a linha da Mariana só mudou pelo aparelho dela (a Mariana do passo 2 pode ter gravado o que já era dela)
    const agora = JSON.parse(await (await api('api/progresso')).text());
    assert.strictEqual(agora.estado.estrelas.ganhas, JSON.parse(linhaMariana).estado.estrelas.ganhas);
    assert.ok(!agora.estado.perfil || agora.estado.perfil.nome === 'Mariana', 'o perfil na linha dela é o dela');
  } finally {
    await browser.close();
    servidor.parar();
  }
});
