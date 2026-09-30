/* Torre dos Números (Matemática): o elenco próprio do interior padrão (interiores/padrao.js lê
   Reino._predios.matematica.elenco). Guia e um monitor por sala, com nome e acessório do tema da sala;
   ids, lugares e ações continuam os do padrão. Falas até 30 letras, frases de 3 ou mais palavras. */
(function () {
  var R = window.Reino;
  var S = (R._predios = R._predios || {}).matematica = (R._predios.matematica || {});

  /* ---------- personagens (vozes diferentes entre si) ---------- */
  // guia do hall: professora com o livro dos números
  R.registrarPersonagem({ id: 'mat-isa', nome: 'Professora Isa',
    sprite: { pele: '#a86b4a', cabelo: '#2b1b17', penteado: 'coque', oculos: true, livro: '#ffd34d', cracha: true,
      roupa: '#3f7fe0', roupa2: '#2a5bb0', perna: 'saia', cor2: '#ffd34d' },
    perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+2%', tom: '-4Hz' } });
  // sala m1: O Calendário (criança com a agenda aberta)
  R.registrarPersonagem({ id: 'mat-cecilia', nome: 'Cecília dos Dias',
    sprite: { idade: 'crianca', pele: '#ffe0c7', cabelo: '#c2532b', penteado: 'rabos', livroAberto: '#e0433f', presilha: true,
      roupa: '#ff9d2e', perna: 'vestido', cor2: '#5fb4ff' },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+10%', tom: '+28Hz' } });
  // sala m2: As Horas (relógio de bolso na corrente)
  R.registrarPersonagem({ id: 'mat-otavio', nome: 'Seu Otávio das Horas',
    sprite: { pele: '#e0ac86', cabelo: '#5a3825', penteado: 'curto', bigode: true, oculos: true, colete: '#2f6fd6', corrente: true,
      roupa: '#f4f2fa', roupa2: '#3a3a5a' },
    perfil: { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '-6%', tom: '-14Hz' } });
  // sala m3: Chances (criança mágica: cartola e varinha)
  R.registrarPersonagem({ id: 'mat-tito', nome: 'Mágico Tito',
    sprite: { idade: 'crianca', pele: '#7a4a32', cabelo: '#1f1414', penteado: 'cacheado', chapeu: 'cartola', chapeuCor: '#7c5cff',
      varinha: true, capa: true, capaCor: '#7c5cff', capaEstrelas: true, roupa: '#ffd34d', perna: 'short' },
    perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '+4%', tom: '+34Hz' } });
  // sala m4: Parcelas Iguais (confeiteira que monta pratos iguais)
  R.registrarPersonagem({ id: 'mat-lara', nome: 'Confeiteira Lara',
    sprite: { pele: '#f1c7a5', cabelo: '#e8c16a', penteado: 'rabo', chapeu: 'chef', avental: true, aventalCor: '#ff8ac4',
      roupa: '#f4f2fa', roupa2: '#ff8ac4', perna: 'saia' },
    perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+4%', tom: '+6Hz' } });
  // sala m5: Dobro e Triplo (palhacinha: nariz e chapéu de festa)
  R.registrarPersonagem({ id: 'mat-zuzu', nome: 'Palhacinha Zuzu',
    sprite: { idade: 'crianca', pele: '#d9a07a', cabelo: '#5a3825', penteado: 'trancas', chapeu: 'festa', chapeuCor: '#39a860',
      estampa: 'bolinhas', nariz: true, roupa: '#ff4f9a', perna: 'saia', cor2: '#ffd34d' },
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+10%', tom: '+26Hz' } });
  // sala m6: Tabuadas do 4 e do 5 (professor com lápis)
  R.registrarPersonagem({ id: 'mat-tadeu', nome: 'Professor Tadeu',
    sprite: { pele: '#c68a5e', cabelo: '#6b5a66', penteado: 'careca', barba: true, oculos: true, lapis: true, gravata: '#ffd34d',
      roupa: '#39a860', roupa2: '#2d6b4a' },
    perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '-6%', tom: '-10Hz' } });

  S.elenco = { guia: 'mat-isa', salas: { m1: 'mat-cecilia', m2: 'mat-otavio', m3: 'mat-tito', m4: 'mat-lara', m5: 'mat-zuzu', m6: 'mat-tadeu' } };

  /* ---------- falas (por cima das do padrão; nova/feita/depois ficam as de sempre) ---------- */
  R.falasDoPredio('padrao-matematica', {
    npcs: {
      'guia-matematica': { oi: ['Oi! Eu sou a Professora Isa.', 'Os números moram aqui! 🌟', 'Cada sala tem um ajudante.'] },
      'sala-matematica-m1': { oi: ['Oi! Eu sou a Cecília! 📅', 'Eu conto os dias do mês.', 'Vamos ver o calendário?'] },
      'sala-matematica-m2': { oi: ['Olá! Eu sou o Seu Otávio. ⏰', 'Meu relógio nunca atrasa!', 'Vamos aprender as horas?'] },
      'sala-matematica-m3': { oi: ['Oi! Eu sou o Mágico Tito! 🎲', 'Será que vai sair o seis?', 'Vamos pensar nas chances?'] },
      'sala-matematica-m4': { oi: ['Oi! Eu sou a Confeiteira Lara.', 'Cada prato com o mesmo tanto.', 'Vamos somar grupinhos iguais?'] },
      'sala-matematica-m5': { oi: ['Oi! Eu sou a Palhacinha Zuzu.', 'Dobro é duas vezes! ✌️', 'Triplo é três vezes o mesmo.'] },
      'sala-matematica-m6': { oi: ['Olá! Eu sou o Professor Tadeu.', 'Adoro a tabuada do 4 e do 5!', 'Vamos pular de cinco em cinco?'] },
    },
  });
})();
