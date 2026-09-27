// Teste de NAVEGADOR (Chromium, servidor de TESTE com banco novo em /tmp, saves sintéticos, SEM congelar: é o jogo de
// verdade; docs/contratos/save-e-mescla.md §12). Ninguém entra sem senha:
// - aparelho com o save da Mariana: abertura → "Entrar no Reino" com o login dela preenchido; senha errada não entra e
//   nada é lido para jogar nem gravado na chave dela; senha certa entra no progresso dela; "Sair" deixa o login em branco;
// - aparelho novo: criar conta → primeira vez com o nome dele; "Trocar jogador" para a Mariana com a senha (não pede
//   duas vezes) e de volta; outro aparelho entra no dele pelo cartão "No reino", com senha, e recebe o dele do servidor;
//   a linha da Mariana no banco não muda.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/jogadores.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const SENHA = 'unicorlice77';
const esperar = (page, fn, arg) => page.waitForFunction(fn, arg, { timeout: 30000 });
const noJogo = (page, login) => esperar(page, (l) => window.Reino && Reino.Progresso && Reino.Progresso.estado() && Reino.Jogadores.atual() === l && !!document.querySelector('#hud') && !document.querySelector('#hud').hidden, login);
// abertura → toque em "Entrar no Reino" → tela de login (foco na senha quando o login vem preenchido)
async function ateOLogin(page) {
  await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 30000 });
  await page.click('.tela-inicio .btn-comecar');
  await page.waitForSelector('.tela-jogadores #jogador-entrar-senha', { timeout: 30000 });
}
// pelo teclado (um clique logo depois de trocar de tela cai na guarda do toque fantasma, ui/base.js)
async function digitarSenha(page, senha) {
  await page.fill('#jogador-entrar-senha', senha);
  await page.press('#jogador-entrar-senha', 'Enter');
}

test('jogadores: todo mundo entra com senha, cada um no seu progresso; a Mariana no dela, intacto', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  const api = (u, o) => fetch(servidor.url + u, o);
  try {
    // um save sintético completo, gerado pelo próprio jogo (congelado: entra direto como Mariana)
    const g = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperar(g.page, () => window.Reino && Reino.materias && Reino.Progresso && Reino.Progresso.estado());
    assert.strictEqual(await g.page.evaluate(() => Reino.Jogadores.atual()), 'mariana', 'congelado: direto na Mariana');
    const save = (await g.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await g.context.close();
    await api('api/progresso', { method: 'PUT', body: JSON.stringify({ estado: save, atualizado: save.atualizado }) });
    const linhaMariana = await (await api('api/progresso')).text();

    // 1) aparelho com o save da Mariana: abertura e depois o login, com o login dela preenchido
    const m = await abrir({ browser, url: servidor.url, save, query: '?debug=1' });
    const textoSalvo = JSON.stringify(save);
    await m.page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 30000 });
    assert.strictEqual(await m.page.evaluate(() => Reino.Progresso.estado()), null, 'a abertura não carrega save nenhum');
    await ateOLogin(m.page);
    await esperar(m.page, () => document.activeElement && document.activeElement.id === 'jogador-entrar-senha');
    assert.deepStrictEqual(await m.page.evaluate(() => ({
      login: document.querySelector('#jogador-entrar-login').value, foco: document.activeElement && document.activeElement.id,
      destaque: document.querySelector('.jogadores-cartao[data-login="mariana"]').getAttribute('aria-current'), estado: Reino.Progresso.estado(),
    })), { login: 'mariana', foco: 'jogador-entrar-senha', destaque: 'true', estado: null });
    // senha errada: não entra, nada carregado, a chave dela byte a byte igual
    await digitarSenha(m.page, 'errada');
    await m.page.waitForSelector('#jogadores-painel-entrar .jogadores-erro:not([hidden])');
    assert.deepStrictEqual(await m.page.evaluate(() => ({ estado: Reino.Progresso.estado(), save: localStorage.getItem('mariana-reino-v1'), atual: localStorage.getItem('reino-jogador-atual') })),
      { estado: null, save: textoSalvo, atual: null }, 'senha errada: nada lido para jogar, nada gravado');
    // senha certa: o progresso dela
    await digitarSenha(m.page, SENHA);
    await noJogo(m.page, 'mariana');
    const dela = await m.page.evaluate(() => { var e = Reino.Progresso.estado(); return { chave: Reino.Progresso.chaveSave(), salas: e.salas, unis: e.unis, estrelas: e.estrelas, provas: e.provas, loja: e.loja }; });
    // as conquistas dela, iguais às do save (o carregar de sempre só ACRESCENTA ovos que as regras de persistência já devem)
    assert.deepStrictEqual({ chave: dela.chave, salas: dela.salas, estrelas: dela.estrelas, provas: dela.provas, loja: dela.loja },
      { chave: 'mariana-reino-v1', salas: save.salas, estrelas: save.estrelas, provas: save.provas, loja: save.loja }, 'as conquistas dela');
    Object.keys(save.unis).forEach((k) => assert.deepStrictEqual(dela.unis[k], save.unis[k], 'unicórnio ' + k));
    // "Sair": guarda; o próximo carregamento pede login com ele em branco (o save fica)
    await m.page.evaluate(() => { Reino.UI.fecharTodas(); Reino.UI.sairDoJogador(); });
    await ateOLogin(m.page);
    assert.deepStrictEqual(await m.page.evaluate(() => ({ login: document.querySelector('#jogador-entrar-login').value, atual: localStorage.getItem('reino-jogador-atual'), save: JSON.parse(localStorage.getItem('mariana-reino-v1')).estrelas.ganhas })),
      { login: '', atual: ':saiu', save: save.estrelas.ganhas }, 'saiu sem apagar o save dela');
    await m.page.click('.jogadores-cartao[data-login="mariana"]');   // atalho: preenche o login e foca a senha
    assert.strictEqual(await m.page.inputValue('#jogador-entrar-login'), 'mariana');
    assert.strictEqual(await m.page.evaluate(() => document.activeElement.id), 'jogador-entrar-senha');
    await digitarSenha(m.page, SENHA);
    await noJogo(m.page, 'mariana');
    assert.strictEqual(await m.page.evaluate(() => Reino.Progresso.estado().estrelas.ganhas), save.estrelas.ganhas);
    assert.deepStrictEqual(m.page.__erros, []);
    await m.context.close();

    // 2) aparelho novo: criar conta
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1' });
    await ateOLogin(a.page);
    assert.strictEqual(await a.page.inputValue('#jogador-entrar-login'), '', 'aparelho novo: login em branco');
    await a.page.click('#jogadores-aba-criar');
    await a.page.fill('#jogador-login', 'Léo 1');   // vira "leo1" enquanto digita
    assert.strictEqual(await a.page.inputValue('#jogador-login'), 'leo1');
    await a.page.fill('#jogador-senha1', 'abc');
    await a.page.fill('#jogador-senha2', 'abd');
    await a.page.press('#jogador-senha2', 'Enter');
    await a.page.waitForSelector('#jogadores-painel-criar .jogadores-erro:not([hidden])');
    await a.page.fill('#jogador-senha2', 'abc');
    await a.page.press('#jogador-senha2', 'Enter');
    await esperar(a.page, () => { var t = document.querySelector('.tela-inicio'); return t && /Oi, Leo1!/.test(t.textContent); });
    assert.deepStrictEqual(await a.page.evaluate(() => ({ atual: Reino.Jogadores.atual(), chave: Reino.Progresso.chaveSave(), lembrado: localStorage.getItem('reino-jogador-atual') })),
      { atual: 'leo1', chave: 'reino-v1-leo1', lembrado: 'leo1' });
    // ele joga (sintético) e troca LOGO para a Mariana, com a senha dela (o servidor recebe o dele antes do reload)
    await a.page.evaluate(() => { var e = Reino.Progresso.estado(); e.comecou = true; e.estrelas.ganhas = 7; Reino.Progresso.salvar(); });
    await a.page.evaluate(() => { Reino.UI.fecharTodas(); Reino.UI.trocarJogador(); });
    await a.page.click('.tela-jogadores .jogadores-cartao[data-login="mariana"]');
    await digitarSenha(a.page, 'errada');
    await a.page.waitForSelector('#jogadores-painel-entrar .jogadores-erro:not([hidden])');
    await digitarSenha(a.page, SENHA);
    await noJogo(a.page, 'mariana');   // recarregou direto nela: a senha não é pedida duas vezes
    // a música (ligada nos ajustes) espera o 1º toque ou tecla desta página nova
    await a.page.evaluate(() => { Reino.Progresso.estado().ajustes.musica = true; });
    assert.strictEqual(await a.page.evaluate(() => Reino.Som.musicaAtual().ligada), false);
    await a.page.keyboard.press('Shift');
    await esperar(a.page, () => Reino.Som.musicaAtual().ligada === true);
    assert.strictEqual((await (await api('api/progresso/leo1')).json()).estado.estrelas.ganhas, 7, 'o servidor recebeu o PUT antes do reload');
    const naMariana = await a.page.evaluate(() => ({ estrelas: Reino.Progresso.estado().estrelas.ganhas, dele: JSON.parse(localStorage.getItem('reino-v1-leo1')).estrelas.ganhas }));
    assert.deepStrictEqual(naMariana, { estrelas: save.estrelas.ganhas, dele: 7 }, 'a Mariana com o progresso dela (do servidor) e o dele guardado');
    // recarregar a página: pede a senha de novo (o atalho do Trocar vale uma vez só)
    await a.page.reload();
    await ateOLogin(a.page);
    assert.strictEqual(await a.page.inputValue('#jogador-entrar-login'), 'mariana');
    await a.page.click('.jogadores-cartao[data-login="leo1"]');
    await digitarSenha(a.page, 'abc');
    await noJogo(a.page, 'leo1');
    assert.strictEqual(await a.page.evaluate(() => Reino.Progresso.estado().estrelas.ganhas), 7);
    assert.deepStrictEqual(a.page.__erros, []);
    await a.context.close();

    // 3) outro aparelho: o leo1 vem do servidor ("No reino"), com senha
    const b = await abrir({ browser, url: servidor.url, query: '?debug=1' });
    await ateOLogin(b.page);
    await b.page.waitForSelector('.jogadores-cartao[data-login="leo1"]', { timeout: 30000 });
    await b.page.click('.jogadores-cartao[data-login="leo1"]');
    assert.strictEqual(await b.page.inputValue('#jogador-entrar-login'), 'leo1');
    await digitarSenha(b.page, 'errada');
    await b.page.waitForSelector('#jogadores-painel-entrar .jogadores-erro:not([hidden])');
    await digitarSenha(b.page, 'abc');
    await esperar(b.page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado() && Reino.Progresso.estado().estrelas.ganhas === 7);
    assert.strictEqual(await b.page.evaluate(() => localStorage.getItem('mariana-reino-v1')), null, 'nada na chave da Mariana');
    assert.deepStrictEqual(b.page.__erros, []);
    await b.context.close();

    // o banco: a linha da Mariana só mudou pelo aparelho dela (as conquistas continuam as dela)
    const agora = JSON.parse(await (await api('api/progresso')).text());
    assert.strictEqual(agora.estado.estrelas.ganhas, JSON.parse(linhaMariana).estado.estrelas.ganhas);
    assert.ok(!agora.estado.perfil || agora.estado.perfil.nome === 'Mariana', 'o perfil na linha dela é o dela');
  } finally {
    await browser.close();
    servidor.parar();
  }
});
