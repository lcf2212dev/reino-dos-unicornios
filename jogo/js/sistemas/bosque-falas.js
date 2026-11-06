/* Falas do Claude no Bosque dos Fantasmas e nas outras arenas (docs/contratos/bosque.md §6, arenas.md): a espada, o fantasma vencido, a pergunta,
   o nível novo, o ponto, o móvel guardado e o desmaio. Só dados (sem DOM), para carregar também no Node
   (listar-falas.js grava as vozes, pacote interior-bosque, voz do Claude). Lista = páginas faladas em ordem;
   `acerto` = uma das duas, sorteada. Nada de número na fala (a voz é achada pelo texto exato). */
(function () {
  var R = window.Reino;
  R.BosqueFalas = {
    espada: ['Você ganhou uma espada!', 'Ela tem a magia do Reino.', 'Vença os fantasmas fofinhos!'],
    vencido: ['Você venceu o fantasma!', 'Responda e ganhe uma estrela!'],
    acerto: ['Isso mesmo, muito bem!', 'Você acertou, que beleza!'],
    erro: ['Quase, veja a resposta certa.', 'O fantasma volta depois.', 'Depois você tenta de novo!'],
    nivel: ['Você subiu de nível!', 'Escolha onde pôr o seu ponto.'],
    ponto: { forca: 'Sua espada ficou mais forte!', vida: 'Agora você tem mais vida!', velocidade: 'Agora você anda mais rápido!' },
    semCasa: ['Tem um móvel para a sua casa!', 'Ele fica guardado para você.'],
    desmaio: ['Ufa, vamos descansar um pouco.', 'Voltamos ao começo do bosque.', 'Você não perdeu nada, viu?'],
  };
  var F = R.BosqueFalas;
  /* Nas outras arenas (arenas.md) o Claude não fala de fantasma nem de bosque: as mesmas frases já gravadas, sem as
     que falam deles (nenhuma voz nova). As chaves que não estão aqui (acerto, nivel, ponto) são as mesmas. */
  F.arena = {
    espada: [F.espada[0], F.espada[1]],
    vencido: [F.vencido[1]],
    erro: [F.erro[0], F.erro[2]],
    desmaio: [F.desmaio[0], F.desmaio[2]],
  };
  /** as falas da chave na arena (padrão: a de agora; o Bosque e fora de arena: as de sempre) */
  F.de = function (chave, arena) {
    if (arena === undefined) arena = R.Bosque && R.Bosque.arenaAtual ? R.Bosque.arenaAtual() : null;
    return arena && arena !== 'bosque' && F.arena[chave] ? F.arena[chave] : F[chave];
  };
  // as do Claude numa arena com pacote próprio: as mesmas frases (o áudio é o mesmo, achado pelo texto exato)
  function falasArena(pacote) {
    var a = F.arena;
    return [].concat(a.espada, a.vencido, F.acerto, a.erro, F.nivel, [F.ponto.forca, F.ponto.vida, F.ponto.velocidade], a.desmaio)
      .map(function (t) { return { texto: t, voz: 'claude', pacote: pacote }; });
  }
  R.registrarModulo({ id: 'bosque-falas', falas: function () {
    var lista = [].concat(F.espada, F.vencido, F.acerto, F.erro, F.nivel,
      [F.ponto.forca, F.ponto.vida, F.ponto.velocidade], F.semCasa, F.desmaio);
    var todas = lista.map(function (t) { return { texto: t, voz: 'claude', pacote: 'interior-bosque' }; }), vistos = { 'interior-bosque': 1 };
    // cada arena com pacote de voz próprio (o do interior dela) leva as falas do Claude da arena
    (R.arenas || []).forEach(function (a) {
      var d = R.Interiores && R.Interiores.def(a.id), pac = d && d.pacote;
      if (!pac || vistos[pac]) return;
      vistos[pac] = 1;
      todas = todas.concat(falasArena(pac));
    });
    return todas;
  } });
})();
