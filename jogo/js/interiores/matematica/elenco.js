/* Torre dos Números: quem mora lá (nome, sprite e voz; vozes diferentes entre si). Na Matemática do Dia a Dia
   (4º bimestre) a Professora Isa é a guia do saguão e os outros seis são os anfitriões dos andares (as galerias e o
   ateliê de cada capítulo); o lugar de cada um fica no layout (matematica/matematica.js e ma-andares.js) e as falas
   em matematica/falas.js. A versão do 3º bimestre (elenco do interior padrão e as falas de lá) está em
   arquivo/terceiro-bimestre/jogo/js/interiores/matematica/elenco.js. */
(function () {
  var R = window.Reino;

  /* ---------- personagens (vozes diferentes entre si) ---------- */
  // guia do saguão: professora com o livro dos números
  R.registrarPersonagem({ id: 'mat-isa', nome: 'Professora Isa',
    sprite: { pele: '#a86b4a', cabelo: '#2b1b17', penteado: 'coque', oculos: true, livro: '#ffd34d', cracha: true,
      roupa: '#3f7fe0', roupa2: '#2a5bb0', perna: 'saia', cor2: '#ffd34d' },
    perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+2%', tom: '-4Hz' } });
  // ateliê do capítulo 10, o dinheiro (criança com a agenda aberta: a lista de compras)
  R.registrarPersonagem({ id: 'mat-cecilia', nome: 'Cecília dos Dias',
    sprite: { idade: 'crianca', pele: '#ffe0c7', cabelo: '#c2532b', penteado: 'rabos', livroAberto: '#e0433f', presilha: true,
      roupa: '#ff9d2e', perna: 'vestido', cor2: '#5fb4ff' },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+10%', tom: '+28Hz' } });
  // galerias do capítulo 10, o dinheiro (de colete e relógio de bolso, como o dono do mercadinho)
  R.registrarPersonagem({ id: 'mat-otavio', nome: 'Seu Otávio das Horas',
    sprite: { pele: '#e0ac86', cabelo: '#5a3825', penteado: 'curto', bigode: true, oculos: true, colete: '#2f6fd6', corrente: true,
      roupa: '#f4f2fa', roupa2: '#3a3a5a' },
    perfil: { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '-6%', tom: '-14Hz' } });
  // ateliê do capítulo 12, a estatística (criança mágica: cartola e varinha)
  R.registrarPersonagem({ id: 'mat-tito', nome: 'Mágico Tito',
    sprite: { idade: 'crianca', pele: '#7a4a32', cabelo: '#1f1414', penteado: 'cacheado', chapeu: 'cartola', chapeuCor: '#7c5cff',
      varinha: true, capa: true, capaCor: '#7c5cff', capaEstrelas: true, roupa: '#ffd34d', perna: 'short' },
    perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '+4%', tom: '+34Hz' } });
  // galerias do capítulo 11, as partes iguais (confeiteira que reparte o bolo)
  R.registrarPersonagem({ id: 'mat-lara', nome: 'Confeiteira Lara',
    sprite: { pele: '#f1c7a5', cabelo: '#e8c16a', penteado: 'rabo', chapeu: 'chef', avental: true, aventalCor: '#ff8ac4',
      roupa: '#f4f2fa', roupa2: '#ff8ac4', perna: 'saia' },
    perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+4%', tom: '+6Hz' } });
  // ateliê do capítulo 11, as partes iguais (palhacinha: nariz e chapéu de festa)
  R.registrarPersonagem({ id: 'mat-zuzu', nome: 'Palhacinha Zuzu',
    sprite: { idade: 'crianca', pele: '#d9a07a', cabelo: '#5a3825', penteado: 'trancas', chapeu: 'festa', chapeuCor: '#39a860',
      estampa: 'bolinhas', nariz: true, roupa: '#ff4f9a', perna: 'saia', cor2: '#ffd34d' },
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+10%', tom: '+26Hz' } });
  // galerias do capítulo 12, a estatística (professor com lápis: anota a pesquisa)
  R.registrarPersonagem({ id: 'mat-tadeu', nome: 'Professor Tadeu',
    sprite: { pele: '#c68a5e', cabelo: '#6b5a66', penteado: 'careca', barba: true, oculos: true, lapis: true, gravata: '#ffd34d',
      roupa: '#39a860', roupa2: '#2d6b4a' },
    perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '-6%', tom: '-10Hz' } });
})();
