/* Falas do Claude no Bosque dos Fantasmas (docs/contratos/bosque.md §6): a espada, o fantasma vencido, a pergunta,
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
  R.registrarModulo({ id: 'bosque-falas', falas: function () {
    var lista = [].concat(F.espada, F.vencido, F.acerto, F.erro, F.nivel,
      [F.ponto.forca, F.ponto.vida, F.ponto.velocidade], F.semCasa, F.desmaio);
    return lista.map(function (t) { return { texto: t, voz: 'claude', pacote: 'interior-bosque' }; });
  } });
})();
