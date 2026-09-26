/* Elenco dos NPCs: nome, voz e parâmetros do sprite de cada personagem (só dados, sem DOM).
   Os prédios reaproveitam daqui o sprite e a voz. O gerador de sprites está em npcs*.js.
   Papéis opcionais, lidos pelos prédios com N.doElenco:
     paraMateria: id da matéria cujo treino o cavaleiro dá no Castelo (castelo/castelo.js)
     paraProva:   id da prova bimestral que a professora aplica na Escola (escola/escola.js) */
(function () {
  var N = window.Reino.NPCs;


  /* ================= ELENCO =================
     Parâmetros propostos para cada personagem (os prédios reaproveitam: sprite e voz).
     Cada entrada é um PersonagemElenco (jogo/ferramentas/testes/tipos-jogo.d.ts). */
  N.ELENCO = {
    // Museu das Memórias (História)
    memoria: { nome: 'Dona Memória', voz: 'npc-memoria', sprite: { idade: 'idoso', pele: '#f1c7a5', cabelo: '#e4e0ec', penteado: 'coque', roupa: '#9b6bd6', roupa2: '#6b4a9a', perna: 'saia', oculos: true, colar: true, cor2: '#ff9cc6', cracha: true } },
    antonio: { nome: 'Seu Antônio', voz: 'npc-antonio', sprite: { idade: 'idoso', pele: '#e0ac86', cabelo: '#d8d4e0', penteado: 'careca', bigode: true, roupa: '#7aa37a', roupa2: '#6b5a4a', bengala: true, carta: true, colete: '#a86b4a' } },
    chico: { nome: 'Carteiro Chico', voz: 'npc-chico', sprite: { pele: '#a86b4a', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'bone', chapeuCor: '#2f6fd6', cor2: '#ffd34d', roupa: '#8fd0ff', roupa2: '#2f4f8a', bolsa: true, bolsaCor: '#c9733a' } },
    taina: { nome: 'Guia Tainá', voz: 'npc-taina', sprite: { pele: '#c68a5e', cabelo: '#1f1414', penteado: 'chanel', roupa: '#39c5bb', roupa2: '#2d6b66', cracha: true, cor2: '#ff9d2e', colar: '#ff6b8a' } },
    contadeira: { nome: 'Vovó Contadeira', voz: 'npc-contadeira', sprite: { idade: 'idoso', pele: '#7a4a32', cabelo: '#e4e0ec', penteado: 'coque', chapeu: 'turbante', chapeuCor: '#ff9d2e', cor2: '#39a860', roupa: '#e0433f', roupa2: '#ffb020', perna: 'vestido', estampa: 'bolinhas', colar: '#ffe066' } },
    nina: { nome: 'Restauradora Nina', voz: 'npc-nina', sprite: { pele: '#ffe0c7', cabelo: '#c2532b', penteado: 'rabo', roupa: '#ffd1e6', roupa2: '#4a5a8a', avental: true, aventalCor: '#c9a27a', pincel: true, oculos: true, cor2: '#5fb4ff' } },
    // Torre do Relógio (Inglês)
    ponteiro: { nome: 'Relojoeiro Seu Ponteiro', voz: 'npc-ponteiro', sprite: { idade: 'idoso', pele: '#f1c7a5', cabelo: '#cfc8d8', penteado: 'careca', bigode: true, oculos: true, oculosCor: '#b8651a', roupa: '#f4f2fa', colete: '#8a3b3b', corrente: true, roupa2: '#3a3a5a', gravata: '#2f6fd6' } },
    ben: { nome: '«Coach Ben»', voz: 'npc-ben', sprite: { pele: '#7a4a32', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'bone', chapeuCor: '#e0433f', cor2: '#ffffff', roupa: '#ff9d2e', estampa: 'listras', roupa2: '#2f4f8a', perna: 'short', apito: true, sapato: '#f4f2fa' } },
    stella: { nome: '«Miss Stella»', voz: 'npc-stella', sprite: { pele: '#d9a07a', cabelo: '#2b1b17', penteado: 'black', roupa: '#5a6ad0', roupa2: '#2a2f66', perna: 'saia', capa: true, capaCor: '#1f2a5a', capaEstrelas: true, presilha: true, cor2: '#ffe066' } },
    smile: { nome: '«Doctor Smile»', voz: 'npc-smile', sprite: { pele: '#ffe0c7', cabelo: '#e8c16a', penteado: 'espetado', jaleco: true, roupa: '#5fb4ff', roupa2: '#5f6a84', espelhoTesta: true } },
    moon: { nome: '«Miss Moon»', voz: 'npc-moon', sprite: { pele: '#a86b4a', cabelo: '#3a2320', penteado: 'trancas', chapeu: 'gorro', chapeuCor: '#7c5cff', roupa: '#9b7bff', roupa2: '#7c5cff', perna: 'vestido', estampa: 'estrelas', cor2: '#ffe066' } },
    joy: { nome: '«Mister Joy»', voz: 'npc-joy', sprite: { pele: '#d9a07a', cabelo: '#5a3825', penteado: 'cacheado', chapeu: 'cartola', chapeuCor: '#ff4f9a', cor2: '#ffd34d', roupa: '#ffd34d', roupa2: '#6b3fc4', gravata: '#ff4f9a', violao: true } },
    // Castelo da Medalha
    serena: { nome: 'Princesa Serena', voz: 'npc-serena', sprite: { pele: '#ffe0c7', cabelo: '#f2c14e', penteado: 'longo', chapeu: 'coroa', roupa: '#ffb3d9', roupa2: '#ff8ac4', perna: 'vestido', colar: true, cor2: '#b58cff' } },
    aurora: { nome: 'Cavaleira Aurora', voz: 'npc-aurora', paraMateria: 'historia', sprite: { pele: '#d9a07a', cabelo: '#a0673a', penteado: 'rabo', chapeu: 'elmo', cor2: '#ff6b8a', armadura: true, roupa: '#ff7eb6' } },
    oliver: { nome: '«Sir Oliver»', voz: 'npc-oliver', paraMateria: 'ingles', sprite: { pele: '#f1c7a5', cabelo: '#c2532b', penteado: 'curto', bigode: true, chapeu: 'elmo', cor2: '#5fb4ff', armadura: true, roupa: '#2f6fd6', capa: true, capaCor: '#c9365a' } },
    // Escola do Reino
    margarida: { nome: 'Diretora Margarida', voz: 'npc-margarida', sprite: { pele: '#d9a07a', cabelo: '#6b5a66', penteado: 'coque', oculos: true, flor: true, roupa: '#39a860', roupa2: '#2d6b4a', perna: 'saia', cor2: '#ffd34d', colar: true } },
    helena: { nome: 'Professora Helena', voz: 'npc-helena', paraProva: 'historia-3bim', sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', roupa: '#ff9d2e', roupa2: '#6b4a9a', perna: 'saia', livro: '#5fb4ff', cor2: '#5fb4ff', oculos: true, oculosCor: '#c9365a' } },
    emma: { nome: '«Teacher Emma»', voz: 'npc-emma', paraProva: 'ingles-3bim', sprite: { pele: '#ffe0c7', cabelo: '#a0673a', penteado: 'longo', chapeu: 'boina', chapeuCor: '#d63d63', cachecol: true, cachecolCor: '#2f4f8a', roupa: '#8fd0ff', roupa2: '#2f4f8a', perna: 'saia', livro: '#d63d63' } },
    // Estábulo, Loja e Baú
    feno: { nome: 'Seu Feno', voz: 'npc-feno', sprite: { pele: '#e0ac86', cabelo: '#a0673a', penteado: 'curto', barba: true, chapeu: 'palha', roupa: '#e0433f', estampa: 'xadrez', roupa2: '#4a6fb0', jardineira: true, cor2: '#ffd34d' } },
    petala: { nome: 'Fada Pétala', voz: 'npc-petala', sprite: { base: 'fada', pele: '#ffe0c7', cabelo: '#ff9cc6', penteado: 'rabos', chapeu: 'flores', roupa: '#b58cff', roupa2: '#ff9cc6', varinha: true, cor2: '#ffe066' } },
    tostao: { nome: 'Dragãozinho Tostão', voz: 'npc-tostao', sprite: { base: 'dragao', corpo: '#f0a04a', barriga: '#fff0c4', asa: '#ff7a3d', moeda: true } },
    // Pet Shop
    aveia: { nome: 'Dona Aveia', voz: 'npc-aveia', sprite: { pele: '#e0ac86', cabelo: '#c2532b', penteado: 'rabos', chapeu: 'lenco', chapeuCor: '#ff9cc6', roupa: '#8fd08f', roupa2: '#4a7a4a', perna: 'saia', avental: true, aventalCor: '#fff1d0', cor2: '#ff8a3d', colar: '#ffd34d' } },
    // Observatório (o Cosmo usa a base 'robo', registrada pelo Observatório com N.registrarBase)
    vega: { nome: 'Doutora Vega', voz: 'npc-vega', sprite: { pele: '#a86b4a', cabelo: '#3a2320', penteado: 'coque', jaleco: true, roupa: '#5a6ad0', roupa2: '#2a2f66', oculos: true, oculosCor: '#ffd34d', presilha: true, cor2: '#ffe066' } },
    cosmo: { nome: 'Robô Cosmo', voz: 'npc-cosmo', sprite: { base: 'robo', corpo: '#b8c4d8', detalhe: '#5fb4ff', antena: '#ff5c8a' } },
    // Casa das Palavras (Português). Opções novas do gerador: chapeu 'chef', 'quepe', 'pescador', 'festa' e 'faixa',
    // penteado 'cachos', nariz, palhaco, gola, sapatoes, regador, livroAberto, lapis; na armadura, emblema: 'A'
    palavrinha: { nome: 'Dona Palavrinha', voz: 'npc-palavrinha', sprite: { idade: 'idoso', pele: '#c68a5e', cabelo: '#d8d4e0', penteado: 'black', chapeu: 'faixa', chapeuCor: '#c9365a', lapis: true, roupa: '#ff8ac4', roupa2: '#c9365a', perna: 'saia', livroAberto: '#39a860', cor2: '#ffd34d' } },
    manu: { nome: 'Chef Manu', voz: 'npc-manu', sprite: { pele: '#f1c7a5', cabelo: '#2b1b17', penteado: 'rabo', chapeu: 'chef', roupa: '#f4f2fa', roupa2: '#3a3a5a', avental: true, aventalCor: '#ff6b8a', cor2: '#e0433f' } },
    heitor: { nome: 'Jardineiro Heitor', voz: 'npc-heitor', sprite: { pele: '#7a4a32', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'pescador', chapeuCor: '#7cc15a', roupa: '#ffb347', roupa2: '#8a5a3a', avental: true, aventalCor: '#2e8b57', regador: true, regadorCor: '#5fb4ff', cor2: '#ffd34d' } },
    chocalho: { nome: 'Palhaço Chocalho', voz: 'npc-chocalho', sprite: { pele: '#f5c9a3', cabelo: '#3fc98a', penteado: 'cachos', chapeu: 'festa', chapeuCor: '#9b5cff', cor2: '#ffd34d', palhaco: true, gola: '#ffe066', roupa: '#ff6b8a', estampa: 'listras', roupa2: '#9b5cff', sapato: '#3fc98a', sapatoes: true } },
    brisa: { nome: 'Capitã Brisa', voz: 'npc-brisa', sprite: { pele: '#d9a07a', cabelo: '#5a3825', penteado: 'trancas', chapeu: 'quepe', chapeuCor: '#f4f2fa', roupa: '#2f6fd6', roupa2: '#2a2f66', cachecol: true, cachecolCor: '#e0433f', cor2: '#ffd34d' } },
    carlos: { nome: 'Seu Carlos do Carrossel', voz: 'npc-carlos', sprite: { idade: 'idoso', pele: '#e0ac86', cabelo: '#d8d4e0', penteado: 'careca', bigode: true, chapeu: 'boina', chapeuCor: '#c9365a', roupa: '#fff1d0', colete: '#c9365a', roupa2: '#3a3a5a', gravata: '#ffd34d' } },
    // Castelo (treino de Português) e Escola (prova de Português)
    clara: { nome: 'Cavaleira Clara', voz: 'npc-clara', paraMateria: 'portugues', sprite: { pele: '#a86b4a', cabelo: '#2b1b17', penteado: 'black', chapeu: 'elmo', cor2: '#39a860', armadura: true, roupa: '#39a860', emblema: 'A', capa: true, capaCor: '#ffd34d' } },
    lucia: { nome: 'Professora Lúcia', voz: 'npc-lucia', paraProva: 'portugues-3bim', sprite: { pele: '#ffe0c7', cabelo: '#2b1b17', penteado: 'longo', oculos: true, roupa: '#e0433f', roupa2: '#3a3a5a', perna: 'saia', livro: '#ffd34d', cor2: '#ffd34d', colar: '#39c5bb' } },
  };

  // personagens de Reino.registrarPersonagem (provas e prédios) entram depois dos de cima
  var registrados = window.Reino.personagens || {};
  Object.keys(registrados).forEach(function (id) {
    if (N.ELENCO[id]) throw new Error('registrarPersonagem: id repetido com o elenco "' + id + '"');
    N.ELENCO[id] = registrados[id];
  });

  // id do primeiro personagem do elenco (na ordem acima) cujos campos batem com o filtro, ou null
  // (campo ausente no personagem não bate, nem com filtro undefined).
  // Ex.: N.doElenco({ paraMateria: 'historia' }) → 'aurora'; N.doElenco({ paraProva: 'ingles-3bim' }) → 'emma'
  /** @param {Partial<PersonagemElenco>} filtro @returns {string | null} */
  N.doElenco = function (filtro) {
    var ids = Object.keys(N.ELENCO);
    for (var i = 0; i < ids.length; i++) {
      var e = N.ELENCO[ids[i]];
      if (Object.keys(filtro).every(function (k) { return e[k] !== undefined && e[k] === filtro[k]; })) return ids[i];
    }
    return null;
  };
})();
