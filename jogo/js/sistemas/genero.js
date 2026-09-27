/* Nome e gênero de quem joga nas falas. Marcador no texto: {feminino|masculino} (ex.: 'Coisa de {campeã|campeão}!',
   '{Toda campeã|Todo campeão} erra.'); {nome} vira o nome do jogador. Um lugar só resolve os dois (Reino.Genero),
   chamado onde a fala vira texto (Claude.frase, falas dos NPCs, surpresa, Reino.Falas). A lista de gravação
   (Falas.todas) leva AS DUAS versões (Genero.versoes; com {nome}, só a da Mariana): a voz é achada pelo texto
   (docs/decisoes/vozes-pelo-texto.md), então outro nome aparece sem voz, e a versão do gênero de quem joga toca.
   Perfil: Reino.Jogadores.perfil() ({ nome, sexo }), lido na hora; sem ele = Reino.config.nomeJogadora, menina. */
(function () {
  var Reino = window.Reino;
  var G = {};
  var MARCA = /\{([^{}|]*)\|([^{}|]*)\}/g;

  /** O perfil de quem joga agora. @returns {{ nome: string, sexo: string }} */
  G.perfil = function () {
    var J = Reino.Jogadores, p = null;
    try { p = J && J.perfil ? J.perfil() : null; } catch (e) { p = null; }
    var nome = p && typeof p.nome === 'string' && p.nome.trim() ? p.nome.trim() : Reino.config.nomeJogadora;
    return { nome: nome, sexo: p && p.sexo === 'menino' ? 'menino' : 'menina' };
  };
  G.nome = function () { return G.perfil().nome; };
  G.sexo = function () { return G.perfil().sexo; };

  /** Troca os marcadores {a|b} pela forma do sexo (padrão: o de quem joga). @param {string} texto @param {string} [sexo] */
  G.genero = function (texto, sexo) {
    var s = String(texto == null ? '' : texto);
    if (s.indexOf('|') < 0) return s;
    var menino = (sexo || G.sexo()) === 'menino';
    return s.replace(MARCA, function (m, a, b) { return menino ? b : a; });
  };
  /** A fala pronta para a tela: gênero e {nome} de quem joga. @param {string} texto */
  G.texto = function (texto) {
    var p = G.perfil();
    return G.genero(texto, p.sexo).replace(/\{nome\}/g, p.nome);
  };
  /** As versões a gravar (a feminina primeiro; uma só se não houver marcador), com o nome da Mariana. Com {nome}, só
      a feminina: a voz só toca com o nome da Mariana ("o Mariana chegou" nunca aparece). @param {string} texto */
  G.versoes = function (texto) {
    var cru = String(texto == null ? '' : texto), s = cru.replace(/\{nome\}/g, Reino.config.nomeJogadora);
    var a = G.genero(s, 'menina'), b = G.genero(s, 'menino');
    return a === b || cru.indexOf('{nome}') >= 0 ? [a] : [a, b];
  };

  Reino.Genero = G;
})();
