/* Observatório por dentro, parte 5 de 6: as ações `curiosidade` e `piada` (Doutora Vega, Robô Cosmo e
   objetos, no balão modal) e o painel do telescópio; R.ObservatorioInterior.
   Conta com Reino.ObservatorioCenas (observatorio/cenas.js) e Reino.Observatorio (observatorio/falas.js),
   com reservas para quando ainda não existem. Só registra funções no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = '#3a2446';
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  var CEU = S.CEU, LILAS = S.LILAS, falas = S.falas, v = S.v, ESTRELA = S.ESTRELA, sorte = S.sorte,
      desenharPlaneta = S.desenharPlaneta;

  /* ================= CURIOSIDADES (ação `curiosidade`) e PIADAS (ação `piada`) ================= */
  var RESERVA_CURIOSIDADE = 'O céu tem muitos segredos!';
  var RESERVA_PIADA = 'Meus parafusos estão felizes!';
  var CONTINUAR = { texto: 'Continuar →', valor: 'mais', principal: true };
  var FIM_CURIOSIDADE = [{ texto: 'Outra curiosidade! ✨', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];
  var FIM_PIADA = [{ texto: 'Mais uma! 🤖', valor: 'outra', principal: true }, { texto: 'Tchau! 💛', valor: 'tchau' }];
  // temas das cenas do telescópio que não têm o mesmo nome de um tema de curiosidade
  var TEMA_DA_CENA = {
    cruzeiro: 'constelacoes', 'cruzeiro-do-sul': 'constelacoes', 'tres-marias': 'constelacoes', orion: 'constelacoes',
    escorpiao: 'constelacoes', constelacao: 'constelacoes', cometa: 'cometas', 'estrela-cadente': 'cometas', meteoro: 'cometas',
    galaxia: 'galaxias', 'via-lactea': 'galaxias', andromeda: 'galaxias', nebulosa: 'estrelas', estrela: 'estrelas',
    aglomerado: 'estrelas', pleiades: 'estrelas', 'sete-estrelo': 'estrelas', eclipse: 'lua', 'lua-cheia': 'lua', crateras: 'lua', foguete: 'foguetes', astronauta: 'astronautas',
    'estacao-espacial': 'astronautas', satelite: 'foguetes',
  };
  var NOME_DA_CENA = {
    lua: 'A Lua', saturno: 'Saturno', cruzeiro: 'O Cruzeiro do Sul', 'cruzeiro-do-sul': 'O Cruzeiro do Sul', jupiter: 'Júpiter',
    marte: 'Marte', venus: 'Vênus', mercurio: 'Mercúrio', terra: 'A Terra', urano: 'Urano', netuno: 'Netuno', plutao: 'Plutão',
    sol: 'O Sol', cometa: 'Um cometa', cometas: 'Um cometa', galaxia: 'Uma galáxia', galaxias: 'Uma galáxia', 'via-lactea': 'A Via Láctea',
    'tres-marias': 'As Três Marias', orion: 'Órion', estrelas: 'As estrelas', nebulosa: 'Uma nebulosa', constelacoes: 'Constelações', pleiades: 'As Plêiades',
  };

  function temasCuriosidade() {
    var O = R.Observatorio;
    try { if (O && O.temas) return O.temas() || []; } catch (e) {}
    var cs = falas().curiosidades || [];
    return cs.map(function (c) { return c.tema; }).filter(function (t, i, a) { return t && a.indexOf(t) === i; });
  }
  // tema de curiosidade para uma cena do telescópio (null = nenhuma curiosidade combina)
  function temaDaCena(cena) {
    var temas = temasCuriosidade();
    if (temas.indexOf(cena) >= 0) return cena;
    var m = TEMA_DA_CENA[cena];
    if (m && temas.indexOf(m) >= 0) return m;
    return null;
  }
  function curiosidadeDe(tema) {
    var O = R.Observatorio;
    if (O && O.curiosidade) {
      try {
        var c = O.curiosidade(tema);
        if ((!c || !c.paginas || !c.paginas.length) && tema !== 'todas') c = O.curiosidade('todas');
        if (c && c.paginas && c.paginas.length) return c;
      } catch (e) { if (window.console) console.error(e); }
    }
    return { id: 'reserva', tema: tema, paginas: [RESERVA_CURIOSIDADE] };
  }
  function piadaDe() {
    var O = R.Observatorio;
    if (O && O.piada) {
      try { var p = O.piada(); if (p && p.paginas && p.paginas.length) return p; } catch (e) { if (window.console) console.error(e); }
    }
    return { id: 'reserva', paginas: [RESERVA_PIADA] };
  }
  // páginas no balão modal: "Continuar →" entre elas; a última com os botões do fim
  function falarPaginas(pags, quem, voz, botoesFim) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar) return Promise.resolve(null);
    function prox(v) {
      if (v === null || v === undefined || v === 'tchau') return v === undefined ? null : v;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: quem, modal: true, voz: voz, fala: [pg], botoes: ultima ? botoesFim : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }
  // retrato de um objeto do Observatório para o balão (o planeta grande; os outros, o próprio desenho)
  var retratos = {};
  function retratoDe(o) {
    if (!o) return null;
    var k = o.tipo + ':' + (v(o, 'id', '') || o.chave || '');
    if (retratos[k]) return retratos[k];
    var c = document.createElement('canvas'), cx;
    if (o.tipo === 'observatorio-planeta' || o.tipo === 'observatorio-sol') {
      var id = o.tipo === 'observatorio-sol' ? 'sol' : v(o, 'id', 'terra');
      // 24×24 como os retratos dos NPCs: o balão amplia 3× (inteiro, nítido); raios que cabem com anel e raios
      var raio = id === 'sol' ? 7 : id === 'saturno' ? 4 : id === 'jupiter' ? 9 : id === 'plutao' ? 5 : 8;
      c.width = 24; c.height = 24;
      cx = c.getContext('2d');
      desenharPlaneta(cx, id, 12, 12, raio);
    } else {
      var lib = I.OBJETOS[o.tipo] || {};
      var w = (o.w || lib.w || 1) * T, h = (o.h || lib.h || 1) * T, topo = o.topo !== undefined ? o.topo : (lib.topo || 0);
      c.width = w + 4; c.height = topo + h + 4;
      cx = c.getContext('2d');
      cx.save(); cx.translate(2 - o.x * T, 2 + topo - o.y * T);
      if (lib.desenhar) lib.desenhar(cx, o.x * T, o.y * T, o, R.Progresso);
      if (lib.anim) lib.anim(cx, o.x * T, o.y * T, 0, o);
      cx.restore();
    }
    retratos[k] = c;
    return c;
  }
  function npcDoInterior(ctx, id) {
    var def = (ctx && ctx.interior) || (I.def && I.def('observatorio')) || {};
    return (def.npcs || []).find(function (n) { return n.id === id; }) || null;
  }
  function quemNpc(ctx, id, vozPadrao) {
    var n = npcDoInterior(ctx, id), e = ELENCO[id] || {}, N = R.NPCs;
    var retrato = null;
    try { if (n && N && N.retrato) retrato = [N.retrato(n, 0), N.retrato(n, 1)]; } catch (err) { retrato = null; }
    return { nome: (n && n.nome) || e.nome || id, retrato: retrato, voz: vozPadrao };
  }
  // quem conta a curiosidade: o objeto tocado (planeta, peça da galeria) ou a Doutora Vega
  function quemConta(ctx) {
    var o = ctx && ctx.objeto;
    if (o) {
      var retrato = null;
      try { retrato = retratoDe(o); } catch (e) { retrato = null; }
      // no balão, o nome curto do Plutão ("Plutão, o planeta-anão" quebrava em 3 linhas no desktop;
      // a curiosidade já conta que ele é planeta-anão)
      var nome = o.nome || 'Observatório';
      if (v(o, 'id', '') === 'plutao') nome = (falas().nomesTemas && falas().nomesTemas.plutao) || 'Plutão';
      return { nome: nome, retrato: retrato, voz: 'npc-vega' };
    }
    return quemNpc(ctx, 'vega', 'npc-vega');
  }

  function contarCuriosidade(acao, ctx) {
    if (acao && acao.tema === 'telescopio') return abrirTelescopio(ctx);
    var tema = (acao && acao.tema) || 'todas', quem = quemConta(ctx);
    function uma() {
      var c = curiosidadeDe(tema);
      if (R.Som && R.Som.tocar) { try { R.Som.tocar('selecionar'); } catch (e) {} }
      return falarPaginas(c.paginas, quem, 'npc-vega', FIM_CURIOSIDADE).then(function (v2) { return v2 === 'outra' ? uma() : v2; });
    }
    return uma();
  }
  function contarPiada(acao, ctx) {
    var quem = quemNpc(ctx, 'cosmo', 'npc-cosmo');
    function uma() {
      var p = piadaDe();
      return falarPaginas(p.paginas, quem, 'npc-cosmo', FIM_PIADA).then(function (v2) { return v2 === 'outra' ? uma() : v2; });
    }
    return uma();
  }

  /* ---------- o painel do telescópio ---------- */
  function animacoesLigadas() {
    try {
      var e = R.Progresso && R.Progresso.estado && R.Progresso.estado();
      return !!(e && e.ajustes && e.ajustes.animacoes) && !(R.util && R.util.reduzMovimentoSistema);
    } catch (err) { return false; }
  }
  // cena de reserva (sem o observatorio/cenas.js): céu redondo com a Lua e estrelas
  function cenaReserva() {
    var c = document.createElement('canvas');
    c.width = 160; c.height = 112;
    var x = c.getContext('2d');
    ret(x, 0, 0, 160, 112, '#0a0d24');
    circulo(x, 80, 56, 52, K); circulo(x, 80, 56, 50, CEU);
    for (var i = 0; i < 40; i++) {
      var sx = 80 + Math.round((sorte(i, 1, 3) - 0.5) * 90), sy = 56 + Math.round((sorte(1, i, 5) - 0.5) * 90);
      if ((sx - 80) * (sx - 80) + (sy - 56) * (sy - 56) < 46 * 46) ret(x, sx, sy, 1, 1, i % 5 ? LILAS : ESTRELA);
    }
    circulo(x, 92, 46, 14, '#e8e4d8'); circulo(x, 87, 43, 3, '#c8c2b4'); circulo(x, 96, 52, 2, '#c8c2b4'); circulo(x, 97, 40, 2, '#c8c2b4');
    return c;
  }
  var ultimaCena = null;
  function sortearCena() {
    var OC = R.ObservatorioCenas, temas = [];
    try { if (OC && OC.temas && OC.cena) temas = (OC.temas() || []).slice(); } catch (e) { temas = []; }
    var comCuriosidade = temas.filter(function (t) { return !!temaDaCena(t); });
    var lista = comCuriosidade.length ? comCuriosidade : temas;
    if (lista.length > 1 && ultimaCena) lista = lista.filter(function (t) { return t !== ultimaCena; });
    var cena = lista.length ? lista[Math.floor(Math.random() * lista.length)] : null;
    ultimaCena = cena;
    return cena;
  }
  function desenharCena(tela, cena, t) {
    var OC = R.ObservatorioCenas, img = null;
    if (cena && OC && OC.cena) { try { img = OC.cena(cena, t); } catch (e) { if (window.console) console.error(e); img = null; } }
    if (!img) img = cenaReserva();
    img = img.canvas || img;
    var x = tela.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, tela.width, tela.height);
    x.drawImage(img, 0, 0, tela.width, tela.height);
  }
  function el(tag, estilo, texto) {
    var e = document.createElement(tag);
    if (estilo) e.setAttribute('style', estilo);
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function abrirTelescopio(ctx) {
    var UI = R.UI;
    if (!UI || !UI.painel || typeof document === 'undefined') return contarCuriosidade({ tipo: 'curiosidade', tema: 'estrelas' }, {});
    var p = UI.painel('telescopio', '🔭 Telescópio', { aoFechar: function () { parar(); } });
    // cena ampliada em pixels inteiros, cabendo na largura e na altura da tela
    // (a conta é em pixels do aparelho: no celular com dpr 3 a cena sai 5× ou 6×, sempre inteira)
    var dpr = window.devicePixelRatio || 1;
    var largura = Math.min(window.innerWidth - 56, 700), altura = window.innerHeight - 330;
    var k = Math.max(Math.ceil(dpr), Math.min(Math.round(4 * dpr), Math.floor(largura * dpr / 160), Math.floor(altura * dpr / 112)));
    var tela = el('canvas', 'display:block;margin:0 auto;width:' + (160 * k / dpr) + 'px;height:' + (112 * k / dpr) + 'px;image-rendering:pixelated;image-rendering:crisp-edges;border-radius:12px;');
    tela.width = 160; tela.height = 112;
    tela.className = 'telescopio-cena';
    var nome = el('h3', 'margin:12px 0 4px;text-align:center;font-size:1.15em;');
    var texto = el('p', 'margin:4px auto 0;max-width:34em;text-align:center;font-size:1.15em;line-height:1.45;');
    texto.className = 'telescopio-texto';
    var ouvir = el('button', null, '🔊 Ouvir');
    ouvir.type = 'button'; ouvir.className = 'btn-grande btn-secundario';
    var denovo = el('button', null, 'Olhar de novo 🔭');
    denovo.type = 'button'; denovo.className = 'btn-grande btn-principal';
    var botoes = el('div', null); botoes.className = 'intro-botoes';
    botoes.appendChild(ouvir); botoes.appendChild(denovo);
    p.conteudo.appendChild(tela); p.conteudo.appendChild(nome); p.conteudo.appendChild(texto); p.conteudo.appendChild(botoes);

    var paginas = [], cenaAtual = null, timer = null;
    function falar() {
      if (!paginas.length || !R.Som || !R.Som.falar) return;
      try { R.Som.calar && R.Som.calar(); R.Som.falar(paginas.slice(), { voz: 'npc-vega' }); } catch (e) { if (window.console) console.error(e); }
    }
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    function olhar() {
      cenaAtual = sortearCena();
      var tema = cenaAtual ? (temaDaCena(cenaAtual) || 'todas') : 'estrelas';
      var c = curiosidadeDe(tema);
      paginas = c.paginas.slice();
      nome.textContent = (cenaAtual && NOME_DA_CENA[cenaAtual]) || (cenaAtual ? cenaAtual.charAt(0).toUpperCase() + cenaAtual.slice(1) : 'O céu da noite');
      texto.textContent = paginas.join(' ');
      desenharCena(tela, cenaAtual, 0);
      if (R.Som && R.Som.tocar) { try { R.Som.tocar('selecionar'); } catch (e) {} }
      falar();
    }
    ouvir.addEventListener('click', function () { falar(); });
    denovo.addEventListener('click', function () { olhar(); });
    olhar();
    // animação leve da cena (5 quadros por segundo), só com as animações ligadas e o painel aberto
    if (animacoesLigadas()) {
      timer = setInterval(function () {
        if (!p.tela.parentNode) { parar(); return; }
        desenharCena(tela, cenaAtual, performance.now());
      }, 200);
    }
    // preventScroll: no celular o foco não pode rolar o painel (o topo da cena ficava sob o cabeçalho)
    setTimeout(function () { try { denovo.focus({ preventScroll: true }); } catch (e) {} }, 30);
    // o NPC/objeto espera o painel fechar
    return new Promise(function (resolver) {
      var espera = setInterval(function () {
        if (p.tela.parentNode) return;
        clearInterval(espera); parar(); resolver(null);
      }, 150);
    });
  }

  if (R.NPCs && R.NPCs.registrarAcao) {
    R.NPCs.registrarAcao('curiosidade', contarCuriosidade);
    R.NPCs.registrarAcao('piada', contarPiada);
  }
  R.ObservatorioInterior = { retratoDe: retratoDe, abrirTelescopio: abrirTelescopio, temaDaCena: temaDaCena };

})();
