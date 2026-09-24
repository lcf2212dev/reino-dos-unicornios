/* Fome e sede dos unicórnios (Reino.Cuidados) — CONTRATOS-NOVIDADES.md, seção 2.
   Cada unicórnio chocado tem fome e sede de 0 a 100 (100 = satisfeito; sem registro = 100/100).
   Só a montaria gasta, e só com o jogo aberto e ela jogando (aba visível e toque/tecla nos
   últimos minutos). Com fome OU sede abaixo de 25, ela anda mais devagar até comer ou beber.
   Nada aqui toca em DOM, Progresso ou Cena no carregamento: ferramentas/listar-falas.js carrega
   este arquivo num vm sem DOM. Tudo isso só acontece dentro das funções. */
(function () {
  var C = {};

  function cfg() { return Reino.config.cuidados; }
  function P() { return Reino.Progresso; }
  // a mescla com outro aparelho troca o objeto inteiro: sempre ler de novo
  function est() { return Reino.Progresso.estado(); }
  function agora() { return Date.now(); }
  function emitir() { if (Reino.util && Reino.util.emit) Reino.util.emit('cuidados', C.depurar()); }

  /* ---------- o que se fala ---------- */
  // frases de 3+ palavras, sem nome digitado (é "Seu unicórnio"), emoji só com ícone em pixel
  C.frases = {
    lembreteFome: 'Seu unicórnio está com fome. A Pet Shop tem comidinha gostosa! 🍎',
    lembreteSede: 'Seu unicórnio está com sede. Tem água fresquinha na Pet Shop! 💧',
    lembreteAmbos: 'Seu unicórnio está com fome e sede. Vamos até a Pet Shop? 🍎💧',
    faltamEstrelas: 'Ainda faltam estrelas para essa comidinha. Cada acerto de primeira vale uma estrela! ⭐',
    guardado: 'Guardei a comidinha na despensa do Estábulo! 💛',
    comeu: 'Que comidinha mais gostosa! 💛',
    cheio: 'Seu unicórnio está de barriga cheia agora.',
    bebeu: 'Que água fresquinha e gostosa! 💧',
    semSede: 'Seu unicórnio não está com sede agora.',
    despensaVazia: 'A despensa está vazia. A Dona Aveia vende comidinhas na Pet Shop! 🌾',
  };
  var DO_UNICORNIO = { comeu: true, bebeu: true };
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
  function registroParaMudar(id) {
    var e = est();
    if (!e.cuidados) e.cuidados = {};
    if (!e.cuidados[id]) e.cuidados[id] = { fome: 100, sede: 100, em: agora() };
    return e.cuidados[id];
  }

  C.niveis = function (uniId) {
    var r = registro(uniId || montaria());
    return { fome: r ? limitar(r.fome) : 100, sede: r ? limitar(r.sede) : 100 };
  };
  C.baixo = function (uniId) {
    var n = C.niveis(uniId), b = cfg().baixo;
    return { fome: n.fome < b, sede: n.sede < b };
  };
  // sede baixa tem prioridade (é a que acaba primeiro)
  C.icone = function (uniId) {
    var b = C.baixo(uniId);
    return b.sede ? '💧' : b.fome ? '🍎' : null;
  };
  C.iconeMontaria = function () { return C.icone(montaria()); };
  function montariaBaixa() { var b = C.baixo(montaria()); return b.fome || b.sede; }
  // chamada a cada quadro pelo Jogador: só leituras baratas
  C.fatorVelocidade = function () { return montariaBaixa() ? cfg().fatorLento : 1; };

  /* ---------- despensa ---------- */
  C.comidas = function () { return Reino.config.comidas; };
  function comida(id) { return Reino.config.comidas.find(function (c) { return c.id === id; }) || null; }
  C.quantidade = function (comidaId) {
    var d = (est().despensa || {})[comidaId];
    return d ? Math.max(0, (d.compradas || 0) - (d.usadas || 0)) : 0;
  };
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
    var antes = { fome: limitar(r.fome), sede: limitar(r.sede) };
    var eraBaixo = antes.fome < cfg().baixo || antes.sede < cfg().baixo;
    // resto de conta com decimais (ex.: 6e-12) vira zero de verdade
    function aoZero(v) { return v < 1e-6 ? 0 : v; }
    var fome = aoZero(Math.max(0, antes.fome - ms / (cfg().minutosFome * 60000) * 100));
    var sede = aoZero(Math.max(0, antes.sede - ms / (cfg().minutosSede * 60000) * 100));
    var mudou = (antes.fome - fome) + (antes.sede - sede);
    if (mudou <= 0) return;
    r.fome = fome; r.sede = sede; r.em = agora();
    pendente += mudou;
    var ficouBaixo = r.fome < cfg().baixo || r.sede < cfg().baixo;
    var pontoInteiro = Math.floor(antes.fome) !== Math.floor(r.fome) || Math.floor(antes.sede) !== Math.floor(r.sede);
    // cruzou o 25: grava na hora (as baias e a placa da Pet Shop se redesenham)
    if (eraBaixo !== ficouBaixo || pendente >= cfg().gravarPontos || agora() - ultimaGravacao >= cfg().gravarMs) gravar();
    if (pontoInteiro || eraBaixo !== ficouBaixo) emitir();
  }

  C.avancar = function (ms) {
    gastar(Number(ms) || 0);
    return C.depurar();
  };

  /* ---------- comer, beber, comprar ---------- */
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
  function satisfazer(uniId, campo, novo) {
    var r = registroParaMudar(uniId);
    var antes = limitar(r[campo]);
    r.fome = limitar(r.fome); r.sede = limitar(r.sede);
    r[campo] = Math.min(100, novo);
    r.em = agora();
    gravar();
    emitir();
    return { ok: true, antes: antes, depois: r[campo] };
  }
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
  C.beber = function (uniId) {
    uniId = uniId || montaria();
    if (!chocado(uniId)) return { ok: false, motivo: 'sem-uni' };
    if (C.niveis(uniId).sede >= 99.5) return { ok: false, motivo: 'cheio' };
    return satisfazer(uniId, 'sede', 100);
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
    if (!b.fome && !b.sede) return;
    if (!chocado(montaria()) || !livre()) return;
    // dentro da Pet Shop ela já chegou: o lembrete espera ela sair
    var aqui = Reino.Cena && Reino.Cena.atual ? Reino.Cena.atual() : null;
    if (aqui && aqui.lugarId === 'petshop') return;
    ultimoLembrete = agora();
    var chave = b.fome && b.sede ? 'lembreteAmbos' : b.sede ? 'lembreteSede' : 'lembreteFome';
    Reino.Claude.falar(C.frases[chave], { tempo: 6000 });
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
    Reino.util.on('progresso', function () { pendente = 0; ultimaGravacao = agora(); });
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
    return { montaria: id, fome: n.fome, sede: n.sede, fator: C.fatorVelocidade(), icone: C.icone(id), ativo: C.ativo(), despensa: despensa, todos: todos };
  };

  Reino.Cuidados = C;
})();
