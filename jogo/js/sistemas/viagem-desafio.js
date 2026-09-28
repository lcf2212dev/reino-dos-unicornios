/* Viagem de foguete (parte 3): o desafio do ET — a ação `viagem-desafio` ({ materia }) de um ET com um problema
   abre o painel com perguntas da matéria do planeta; ajudar até o fim faz dele um amigo (campo `etsAmigos`).
   Contrato: docs/contratos/viagem.md §6.1. O painel: ui/et-desafio.js (Reino.UI.telaDesafioET).
   Falas do ET no desafio: aqui (falas()), na voz do ET (`npc-<id>`), pacote do Observatório.
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var V = R.Viagem = R.Viagem || {};
  var PACOTE = 'interior-observatorio';
  function cfg() { return R.config.viagem; }

  /* ================= NO SAVE ================= */
  // etsAmigos: { <npcId>: true }, o ET que ela ajudou até o fim; só cresce
  R.Progresso.registrarCampo('etsAmigos', {
    padrao: function () { return {}; },
    mesclar: 'uniao',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ 'marte-rubi': true }, { 'marte-rubi': true, 'saturno-sky': true }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }
  function salvar() { try { R.Progresso.salvar(); } catch (e) { /* sem save (teste) */ } }

  V.amigos = function () {
    var est = estado(), a = est && est.etsAmigos, r = {};
    if (a) Object.keys(a).forEach(function (k) { if (a[k] === true) r[k] = true; });
    return r;
  };
  V.ehAmigo = function (id) { return !!V.amigos()[id]; };
  // true = amigo novo
  V.fazerAmigo = function (id) {
    var est = estado();
    if (!est || !id || V.ehAmigo(id)) return false;
    est.etsAmigos = est.etsAmigos || {};
    est.etsAmigos[id] = true;
    salvar();
    return true;
  };

  /* ================= O DESAFIO ================= */
  var vezes = {};   // desafios começados nesta sessão, por ET: cada vez, outra chave de sorteio
  // as perguntas: Reino.Viagem.perguntas (§4.1) quando existir; senão, 'escolha'/'vf' das salas, num sorteio pela chave
  function sortear(materia, n, chave) {
    var m = R.materia && R.materia(materia), lista = [];
    if (!m) return [];
    (m.salas || []).forEach(function (s) {
      (s.desafios || []).forEach(function (d) {
        if (d.tipo === 'escolha' || d.tipo === 'vf') lista.push({ id: d.id, materia: m.id, sala: s.id, desafio: d });
      });
    });
    var h = 0, s = String(chave);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    function rnd() { h = (h * 1103515245 + 12345) >>> 0; return h / 4294967296; }
    for (var j = lista.length - 1; j > 0; j--) { var k = Math.floor(rnd() * (j + 1)), t = lista[j]; lista[j] = lista[k]; lista[k] = t; }
    return lista.slice(0, n);
  }
  function perguntasDoET(npcId, materia) {
    var n = cfg().desafioPerguntas, vez = vezes[npcId] = (vezes[npcId] || 0) + 1;
    var chave = 'et-' + npcId + '-' + (V.ehAmigo(npcId) ? 'amigo-' : '') + vez;
    var l = typeof V.perguntas === 'function' ? V.perguntas(materia, n, chave) : null;
    l = (l && l.length ? l : sortear(materia, n, chave)).filter(function (p) { return p && p.desafio; });
    return l;
  }

  // começa um desafio: { npcId, materia, perguntas, amigoAntes, vez, estrelas }
  function comecar(npcId, materia) {
    return { npcId: npcId, materia: materia, amigoAntes: V.ehAmigo(npcId), perguntas: perguntasDoET(npcId, materia), estrelas: 0, certas: 0 };
  }
  // uma resposta conferida (cada pergunta é respondida uma vez: acerto = de primeira): Aura e estrela
  function conferir(d, ok) {
    if (R.Aura && R.Aura.contar) R.Aura.contar(ok);
    if (!ok) return 0;
    var n = cfg().estrelasPorAcertoET;
    d.certas++;
    d.estrelas += n;
    try { R.Progresso.ganharEstrelas(n); } catch (e) { /* sem save (teste) */ }
    salvar();
    return n;
  }
  // terminou (acertando ou não): vira amigo; devolve true se é amigo novo
  function terminar(d) { return V.fazerAmigo(d.npcId); }

  /* ================= FALAS ================= */
  // por ET (texto exato = voz do ET; até 30 letras por página); `de novo`: quando já é amigo
  var FRASES = {
    'marte-rubi': {
      abertura: ['Minha nave quebrou!', 'Cada conta conserta uma peça.', 'Vamos fazer as contas?'],
      aberturaDeNovo: ['Oi de novo, {amiga|amigo}!', 'Mais peças para consertar!'],
      acerto: ['Isso! A peça ficou nova!', 'Conta certinha! Obrigada!', 'Uau! A nave já faz vrum!'],
      erro: ['Ops! Veja a conta certa.', 'Quase! Olhe como se faz.'],
      fim: ['A minha nave voa de novo!', 'Você é {uma ótima amiga|um ótimo amigo}!', 'Agora somos {amigas|amigos}!'],
      fimDeNovo: ['A nave ficou ainda melhor!', 'Obrigada de novo, {amiga|amigo}!'],
    },
    'saturno-sky': {
      abertura: ['«Hello»! Que bom te ver!', 'Vamos praticar inglês?', 'Me ajude com as palavras!'],
      aberturaDeNovo: ['«Hello» de novo, {amiga|amigo}!', 'Mais inglês para praticar!'],
      acerto: ['«Great»! Muito bem!', '«Yes»! Está certinho!', '«Wow»! Você sabe inglês!'],
      erro: ['«Oops»! Veja a certa.', 'Quase! Olhe esta palavra.'],
      fim: ['«Thank you», {amiga|amigo}!', 'Você é {uma ótima amiga|um ótimo amigo}!', 'Agora somos {amigas|amigos}!'],
      fimDeNovo: ['«Great job»! Você foi demais!', '«See you»! Volte sempre!'],
    },
    'jupiter-tinta': {
      abertura: ['Minha carta perdeu as letras!', 'Cada palavra volta ao papel.', 'Vamos escrever {juntas|juntos}?'],
      aberturaDeNovo: ['Oi de novo, {amiga|amigo}!', 'Tenho outra carta para você!'],
      acerto: ['Isso! A palavra voltou!', 'Muito bem escrito! Obrigada!', 'Uau! A carta está bonita!'],
      erro: ['Ops! Veja a palavra certa.', 'Quase! Olhe como se escreve.'],
      fim: ['A minha carta ficou pronta!', 'Você é {uma ótima amiga|um ótimo amigo}!', 'Agora somos {amigas|amigos}!'],
      fimDeNovo: ['A carta ficou ainda melhor!', 'Obrigada de novo, {amiga|amigo}!'],
    },
    'venus-mapi': {
      abertura: ['Eu me perdi em Vênus!', 'Cada acerto mostra o caminho.', 'Vamos olhar o mapa?'],
      aberturaDeNovo: ['Oi de novo, {amiga|amigo}!', 'Vamos achar outro caminho!'],
      acerto: ['Isso! Achei o caminho!', 'Isso mesmo! Obrigada!', 'Uau! O mapa ficou claro!'],
      erro: ['Ops! Veja a resposta certa.', 'Quase! Vamos olhar o mapa.'],
      fim: ['Agora sei voltar para casa!', 'Você é {uma ótima amiga|um ótimo amigo}!', 'Agora somos {amigas|amigos}!'],
      fimDeNovo: ['Mais um caminho descoberto!', 'Obrigada de novo, {amiga|amigo}!'],
    },
    'netuno-gota': {
      abertura: ['Tenho umas experiências aqui!', 'Me ajude a descobrir tudo.', 'Vamos fazer ciência?'],
      aberturaDeNovo: ['Oi de novo, cientista!', 'Mais experiências para fazer!'],
      acerto: ['Isso! A experiência deu certo!', 'Você descobriu certinho!', 'Uau! Você pensa muito bem!'],
      erro: ['Ops! Veja a resposta certa.', 'Quase! Olhe o que acontece.'],
      fim: ['Descobrimos tudo {juntas|juntos}!', 'Você é {uma ótima amiga|um ótimo amigo}!', 'Agora somos {amigas|amigos}!'],
      fimDeNovo: ['Que experiências legais!', 'Obrigada de novo, {amiga|amigo}!'],
    },
    'netuno-memo': {
      abertura: ['Eu esqueci umas lembranças!', 'Me ajude a lembrar do passado.', 'Vamos contar histórias?'],
      aberturaDeNovo: ['Oi de novo, {amiga|amigo}!', 'Tenho mais histórias antigas!'],
      acerto: ['Isso! Agora eu me lembro!', 'Isso mesmo! Obrigado!', 'Uau! Você sabe história!'],
      erro: ['Ops! Veja a resposta certa.', 'Quase! Olhe como foi.'],
      fim: ['Agora eu lembro de tudo!', 'Você é {uma ótima amiga|um ótimo amigo}!', 'Agora somos {amigas|amigos}!'],
      fimDeNovo: ['Que histórias bonitas!', 'Obrigado de novo, {amiga|amigo}!'],
    },
  };
  var PADRAO = FRASES['marte-rubi'];
  function frasesDe(npcId) { return FRASES[npcId] || PADRAO; }
  function vozDe(npcId) { return 'npc-' + (FRASES[npcId] ? npcId : 'marte-rubi'); }

  function falas() {
    var t = [];
    Object.keys(FRASES).forEach(function (id) {
      var F = FRASES[id];
      Object.keys(F).forEach(function (k) { F[k].forEach(function (x) { t.push({ texto: x, voz: 'npc-' + id, pacote: PACOTE }); }); });
    });
    return t;
  }

  // para o painel (ui/et-desafio.js) e os testes
  R._viagemDesafio = { comecar: comecar, conferir: conferir, terminar: terminar, sortear: sortear,
    frases: frasesDe, voz: vozDe, FRASES: FRASES };

  // ação do ET: abre o painel com o NPC (ctx.npc) e a matéria
  function viagemDesafio(acao, ctx) {
    var npc = (ctx && ctx.npc) || null;
    if (R.UI && R.UI.telaDesafioET) return Promise.resolve(R.UI.telaDesafioET(npc, acao && acao.materia));
    return Promise.resolve();
  }

  R.registrarModulo({
    id: 'viagem-desafio',
    acoes: { 'viagem-desafio': viagemDesafio },
    falas: falas,
    depurar: function () { return { amigos: V.amigos(), vezes: vezes }; },
  });
})();
