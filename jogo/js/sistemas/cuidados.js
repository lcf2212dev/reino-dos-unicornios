/* Fome, sede e banho dos unicórnios (Reino.Cuidados) — docs/contratos/cuidados.md.
   Cada unicórnio chocado tem fome, sede e banho de 0 a 100 (100 = satisfeito/limpinho; sem registro ou
   sem o campo = 100). Só a montaria gasta, e só com o jogo aberto e ela jogando (aba visível e toque/tecla
   nos últimos minutos). Com fome OU sede abaixo de 25, ela anda mais devagar até comer ou beber; sujinho
   (banho abaixo de 25) só ganha o ícone 🛁 e o lembrete, não fica lento.
   Nada aqui toca em DOM, Progresso ou Cena no carregamento: ferramentas/vozes/listar-falas.js carrega
   este arquivo num vm sem DOM. Tudo isso só acontece dentro das funções. */
(function () {
  var C = {};

  function cfg() { return Reino.config.cuidados; }
  function P() { return Reino.Progresso; }
  // a mescla com outro aparelho troca o objeto inteiro: sempre ler de novo
  function est() { return Reino.Progresso.estado(); }
  function agora() { return Date.now(); }
  function emitir() { if (Reino.util && Reino.util.emit) Reino.util.emit(Reino.EVENTOS.CUIDADOS, C.depurar()); }

  /* ---------- o que se fala ---------- */
  // frases de 3+ palavras, sem nome digitado (é "Seu unicórnio"), emoji só com ícone em pixel
  C.frases = {
    lembreteFome: 'Seu unicórnio está com fome. A Pet Shop tem comidinha gostosa! 🍎',
    lembreteSede: 'Seu unicórnio está com sede. Tem água fresquinha na Pet Shop! 💧',
    lembreteDespensa: 'Tem comidinha guardada na despensa! Vamos dar para ele? 🧺',
    lembreteAmbos: 'Seu unicórnio está com fome e sede. Vamos até a Pet Shop? 🍎💧',
    faltamEstrelas: 'Faça uma sala para ganhar estrelas.',
    guardado: 'Guardei na despensa do Estábulo! 💛',
    comeu: 'Que comidinha mais gostosa! 💛',
    cheio: 'Seu unicórnio está de barriga cheia agora.',
    bebeu: 'Que água fresquinha e gostosa! 💧',
    semSede: 'Seu unicórnio não está com sede agora.',
    despensaVazia: 'A despensa está vazia. Vamos comprar comidinha na Pet Shop? 🌾',
    lembreteBanho: 'Seu unicórnio está precisando de um banho. Tem banheira na Pet Shop! 🛁',
    banhou: 'Que banho cheiroso! Agora estou limpinho! ✨',
    jaLimpinho: 'Ele já está limpinho! Pode brincar à vontade. ✨',
  };
  var DO_UNICORNIO = { comeu: true, bebeu: true, banhou: true };
  C.vozDaFrase = function (chave) { return DO_UNICORNIO[chave] ? 'unicornio' : 'claude'; };
  C.falas = function () {
    return Object.keys(C.frases).map(function (k) { return { texto: C.frases[k], voz: C.vozDaFrase(k) }; });
  };

  /* ---------- leitura ---------- */
  function montaria() { return P().montaria(); }
  function chocado(id) { var u = est().unis[id]; return !!(u && u.chocado); }
  function registro(id) { var c = est().cuidados || {}; return c[id] || null; }
  function limitar(v) { return Math.max(0, Math.min(100, typeof v === 'number' && isFinite(v) ? v : 100)); }
  // o registro do unicórnio, criado (100/100) se ainda não existe
  /** @param {string} id @returns {RegCuidado} o registro do save (criado se faltar), pronto para mudar */
  function registroParaMudar(id) {
    var e = est();
    if (!e.cuidados) e.cuidados = {};
    if (!e.cuidados[id]) e.cuidados[id] = { fome: 100, sede: 100, em: agora(), acao: 0 };
    // registro da versão anterior: ganha o carimbo da ação (0 = nenhuma ainda), senão a mescla usa o `em`
    if (!(typeof e.cuidados[id].acao === 'number' && e.cuidados[id].acao >= 0)) e.cuidados[id].acao = 0;
    // um carimbo por campo (comer e beber): o registro que só tem `acao` começa com ele nos dois
    ['acaoFome', 'acaoSede'].forEach(function (c) {
      if (!(typeof e.cuidados[id][c] === 'number' && e.cuidados[id][c] >= 0)) e.cuidados[id][c] = e.cuidados[id].acao;
    });
    return e.cuidados[id];
  }

  // registro sem `banho` (versão de hoje) = limpinho; a leitura não cria o campo
  /** @param {string} uniId @returns {NiveisCuidado} (sem registro = 100) */
  C.niveis = function (uniId) {
    var r = registro(uniId || montaria());
    return { fome: r ? limitar(r.fome) : 100, sede: r ? limitar(r.sede) : 100, banho: r ? limitar(r.banho) : 100 };
  };
  /** @param {string} uniId @returns {{ fome: boolean, sede: boolean, banho: boolean }} abaixo de config.cuidados.baixo */
  C.baixo = function (uniId) {
    var n = C.niveis(uniId), b = cfg().baixo;
    return { fome: n.fome < b, sede: n.sede < b, banho: n.banho < b };
  };
  // sede baixa tem prioridade (é a que acaba primeiro); o banho fica por último (não deixa lento)
  C.icone = function (uniId) {
    var b = C.baixo(uniId);
    return b.sede ? '💧' : b.fome ? '🍎' : b.banho ? '🛁' : null;
  };
  // sujinho: o desenho ganha manchinhas (jogador.js)
  C.sujo = function (uniId) { return C.baixo(uniId).banho; };
  C.iconeMontaria = function () { return C.icone(montaria()); };
  function montariaBaixa() { var b = C.baixo(montaria()); return b.fome || b.sede; }
  // chamada a cada quadro pelo Jogador: só leituras baratas
  // (só fome e sede: sujinho não fica lento)
  C.fatorVelocidade = function () { return montariaBaixa() ? cfg().fatorLento : 1; };

  /* ---------- despensa ---------- */
  C.comidas = function () { return Reino.config.comidas; };
  function comida(id) { return Reino.config.comidas.find(function (c) { return c.id === id; }) || null; }
  /** @param {string} comidaId @returns {number} compradas − usadas */
  C.quantidade = function (comidaId) {
    var d = (est().despensa || {})[comidaId];
    return d ? Math.max(0, (d.compradas || 0) - (d.usadas || 0)) : 0;
  };
  /** @returns {{ comida: Comida, quantidade: number }[]} só as que têm alguma */
  C.despensa = function () {
    return C.comidas().map(function (c) { return { comida: c, quantidade: C.quantidade(c.id) }; })
      .filter(function (x) { return x.quantidade > 0; });
  };
  function contador(comidaId) {
    var e = est();
    if (!e.despensa) e.despensa = {};
    if (!e.despensa[comidaId]) e.despensa[comidaId] = { compradas: 0, usadas: 0 };
    return e.despensa[comidaId];
  }

  /* ---------- gravação (nunca a cada quadro: cada P.salvar() sincroniza) ---------- */
  var pendente = 0;          // pontos de mudança ainda não gravados
  var ultimaGravacao = 0;
  function gravar() {
    pendente = 0; ultimaGravacao = agora();
    P().salvar();            // o evento 'progresso' também zera o pendente (ver iniciar)
  }

  /* ---------- gastar (relógio e avancar) ---------- */
  function gastar(ms) {
    if (!(ms > 0)) return;
    var id = montaria();
    if (!chocado(id)) return;
    var r = registroParaMudar(id);
    var antes = { fome: limitar(r.fome), sede: limitar(r.sede), banho: limitar(r.banho) };
    // cada barra do lado de cima ou de baixo do 25 (a do banho também: cruzar grava e avisa)
    function baixos(v) { return [v.fome < cfg().baixo, v.sede < cfg().baixo, v.banho < cfg().baixo].join(); }
    var eraBaixo = baixos(antes);
    // resto de conta com decimais (ex.: 6e-12) vira zero de verdade
    function aoZero(v) { return v < 1e-6 ? 0 : v; }
    var fome = aoZero(Math.max(0, antes.fome - ms / (cfg().minutosFome * 60000) * 100));
    var sede = aoZero(Math.max(0, antes.sede - ms / (cfg().minutosSede * 60000) * 100));
    var banho = aoZero(Math.max(0, antes.banho - ms / (cfg().minutosBanho * 60000) * 100));
    var mudou = (antes.fome - fome) + (antes.sede - sede) + (antes.banho - banho);
    if (mudou <= 0) return;
    r.fome = fome; r.sede = sede; r.em = agora();   // o gasto não mexe em `acao` nem em `acaoBanho` (ver P.mesclar)
    if (banho !== antes.banho) r.banho = banho;     // limpinho que não mudou continua sem o campo
    pendente += mudou;
    var ficouBaixo = baixos({ fome: r.fome, sede: r.sede, banho: banho });
    var pontoInteiro = Math.floor(antes.fome) !== Math.floor(r.fome) || Math.floor(antes.sede) !== Math.floor(r.sede) ||
      Math.floor(antes.banho) !== Math.floor(banho);
    // cruzou o 25: grava na hora (as baias e os avisos do menu Lugares se redesenham)
    if (eraBaixo !== ficouBaixo || pendente >= cfg().gravarPontos || agora() - ultimaGravacao >= cfg().gravarMs) gravar();
    if (pontoInteiro || eraBaixo !== ficouBaixo) emitir();
  }

  C.avancar = function (ms) {
    gastar(Number(ms) || 0);
    return C.depurar();
  };

  /* ---------- comer, beber, comprar ---------- */
  /** @param {string} comidaId @returns {ResultadoCuidado} */
  C.comprar = function (comidaId) {
    var c = comida(comidaId);
    if (!c) return { ok: false, motivo: 'sem-comida' };
    if (!P().gastarEstrelas(c.preco)) return { ok: false, motivo: 'estrelas', faltam: Math.max(1, c.preco - P().estrelas()) };
    contador(comidaId).compradas += 1;
    gravar();
    emitir();
    return { ok: true };
  };

  // muda fome ou sede de um unicórnio, grava na hora e avisa
  /** @param {string} uniId @param {'fome' | 'sede'} campo @param {number} novo @returns {ResultadoCuidado} */
  function satisfazer(uniId, campo, novo) {
    var r = registroParaMudar(uniId);
    var antes = limitar(r[campo]);
    r.fome = limitar(r.fome); r.sede = limitar(r.sede);   // (o banho fica como está)
    r[campo] = Math.min(100, novo);
    // carimbo da ação, só do campo que mudou (comer não mexe no da sede, beber não mexe no da fome):
    // sempre maior que o anterior (duas ações no mesmo milissegundo não empatam); `acao` = o maior dos dois
    r.em = r.acao = r[campo === 'fome' ? 'acaoFome' : 'acaoSede'] = Math.max(agora(), r.acao + 1);
    gravar();
    emitir();
    return { ok: true, antes: antes, depois: r[campo] };
  }
  /** @param {string} uniId @param {string} comidaId @returns {ResultadoCuidado} */
  C.alimentar = function (uniId, comidaId) {
    uniId = uniId || montaria();
    if (!chocado(uniId)) return { ok: false, motivo: 'sem-uni' };
    var c = comida(comidaId);
    if (!c || C.quantidade(comidaId) <= 0) return { ok: false, motivo: 'sem-comida' };
    var fome = C.niveis(uniId).fome;
    if (fome >= 99.5) return { ok: false, motivo: 'cheio' };
    contador(comidaId).usadas += 1;
    return satisfazer(uniId, 'fome', c.enche ? 100 : fome + c.fome);
  };
  // água é de graça (só o bebedouro da Pet Shop chama)
  /** @param {string} uniId @returns {ResultadoCuidado} */
  C.beber = function (uniId) {
    uniId = uniId || montaria();
    if (!chocado(uniId)) return { ok: false, motivo: 'sem-uni' };
    if (C.niveis(uniId).sede >= 99.5) return { ok: false, motivo: 'cheio' };
    return satisfazer(uniId, 'sede', 100);
  };
  // banho de espuma é de graça (só a banheira da Pet Shop chama, no fim da animação). Carimbo próprio,
  // `acaoBanho`: o `acao` continua sendo só de comer e beber (um aparelho da versão de hoje trata um `acao`
  // novo como comida e água), e por isso aqui ele, `acaoFome` e `acaoSede` não mudam.
  /** @param {string} uniId @returns {ResultadoCuidado} */
  C.banhar = function (uniId) {
    uniId = uniId || montaria();
    if (!chocado(uniId)) return { ok: false, motivo: 'sem-uni' };
    var antes = C.niveis(uniId).banho;
    if (antes >= 99.5) return { ok: false, motivo: 'cheio' };
    var r = registroParaMudar(uniId);
    r.banho = 100;
    r.acaoBanho = Math.max(agora(), (typeof r.acaoBanho === 'number' && r.acaoBanho >= 0 ? r.acaoBanho : 0) + 1);
    r.em = agora();
    gravar();
    emitir();
    return { ok: true, antes: antes, depois: 100 };
  };

  /* ---------- relógio de jogo ativo ---------- */
  var iniciado = false, ultimoToque = 0, ultimoPasso = 0, ultimoLembrete = -Infinity;
  function tocou() { ultimoToque = agora(); }
  C.ativo = function () {
    if (!iniciado) return false;
    if (typeof document !== 'undefined' && document.hidden) return false;
    return agora() - ultimoToque < cfg().semToqueMs;
  };

  // ela está livre: no mapa ou num interior, sem tela, diálogo, transição nem balão aberto
  function livre() {
    var cena = Reino.Cena && Reino.Cena.estado ? Reino.Cena.estado() : 'mapa';
    if (cena !== 'mapa' && cena !== 'interior') return false;
    return !(Reino.Claude && Reino.Claude.aberto && Reino.Claude.aberto());
  }
  function lembrar() {
    if (agora() - ultimoLembrete < cfg().lembreteMs) return;
    var b = C.baixo(montaria());
    if (!b.fome && !b.sede && !b.banho) return;
    if (!chocado(montaria()) || !livre()) return;
    // dentro da Pet Shop ela já chegou: o lembrete espera ela sair
    var aqui = Reino.Cena && Reino.Cena.atual ? Reino.Cena.atual() : null;
    if (aqui && aqui.lugarId === 'petshop') return;
    ultimoLembrete = agora();
    // fome e sede têm prioridade; o banho só lembra quando as duas estão bem
    var chave = b.fome && b.sede ? 'lembreteAmbos' : b.sede ? 'lembreteSede' : b.fome ? 'lembreteFome' : 'lembreteBanho';
    // só com fome e com comida guardada: lembra da despensa (dá para dar no Estábulo ou na Pet Shop)
    if (chave === 'lembreteFome' && C.despensa().length) chave = 'lembreteDespensa';
    // ela está livre (sem balão): o lembrete aparece na hora e fica aberto até a promessa resolver
    var meu = lembreteAberto = {};
    Reino.Claude.falar(C.frases[chave], { tempo: 6000 }).then(function () { if (lembreteAberto === meu) lembreteAberto = null; });
  }
  // abriu uma tela (sala, prova, treino, Loja…) ou entrou na Pet Shop: o lembrete já passou.
  // Fecha o balão e cala a voz dele, para ele não ficar por cima dos botões da tela.
  var lembreteAberto = null;
  function fecharLembrete() {
    if (!lembreteAberto) return;
    lembreteAberto = null;
    if (Reino.Claude && Reino.Claude.aberto && Reino.Claude.aberto()) Reino.Claude.fechar();
  }

  function passo() {
    var t = agora();
    var dt = Math.max(0, Math.min(5000, t - ultimoPasso));   // aba que volta do fundo não dá salto
    ultimoPasso = t;
    if (!C.ativo()) return;
    gastar(dt);
    lembrar();
  }

  C.iniciar = function () {
    tocou();                 // o próprio "Entrar no Reino" conta como toque
    ultimoPasso = agora();
    if (iniciado) return;
    iniciado = true;
    ultimaGravacao = agora();
    var op = { capture: true, passive: true };
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, tocou, op); });
    // qualquer gravação (de qualquer lugar do jogo) já leva a fome e a sede junto
    Reino.util.on(Reino.EVENTOS.PROGRESSO, function () { pendente = 0; ultimaGravacao = agora(); });
    Reino.util.on(Reino.EVENTOS.TELAS, function (n) { if (n > 0) fecharLembrete(); });
    Reino.util.on(Reino.EVENTOS.CENA, function (m) { if (m && m.para === 'petshop') fecharLembrete(); });
    // a aba vai para o fundo: guarda o que ainda não foi gravado
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && pendente > 0) gravar();
      ultimoPasso = agora();
    });
    setInterval(passo, 1000);
  };

  /* ---------- depuração ---------- */
  C.depurar = function () {
    var e = est(), id = montaria(), n = C.niveis(id);
    var despensa = {}, todos = {};
    C.comidas().forEach(function (c) { var q = C.quantidade(c.id); if (q > 0) despensa[c.id] = q; });
    Object.keys(e.unis || {}).forEach(function (u) { if (e.unis[u].chocado) todos[u] = C.niveis(u); });
    return { montaria: id, fome: n.fome, sede: n.sede, banho: n.banho, sujo: n.banho < cfg().baixo, fator: C.fatorVelocidade(), icone: C.icone(id), ativo: C.ativo(), despensa: despensa, todos: todos };
  };

  Reino.Cuidados = C;
  // módulo (js/nucleo/modulos.js); o if é para os testes que carregam só este arquivo
  if (Reino.registrarModulo) Reino.registrarModulo({ id: 'cuidados', iniciar: function () { C.iniciar(); }, falas: function () { return C.falas(); }, depurar: function () { return C.depurar(); } });
})();
