/* Músicas por ambiente: as FAIXAS (só dados; nada de DOM, canvas ou áudio no carregamento).
   O formato de uma faixa e a API estão no cabeçalho de js/sistemas/musicas.js, que carrega depois deste
   e publica as faixas em Reino.Musicas.faixas. Quem toca é o motor de js/sistemas/som-musica.js. */
var Reino = window.Reino = window.Reino || {};
(function () {
  /* ================= AS FAIXAS ================= */
  var F = {};

  // Mapa: alegre, flauta e violão
  F.mapa = {
    nome: 'Campos do Reino', bpm: 104, compasso: 4, tom: 'D', modo: 'maior', volume: 0.6,
    timbres: { melodia: 'flauta', melodia2: 'sininhos', harmonia: 'violao', baixo: 'baixo-macio' },
    secoes: {
      A: { acordes: '1 | 5 | 6 | 4', harmonia: 'dedilhado', baixo: 'raiz-quinta', percussao: 'b.c.a.c.',
        melodia: '3 5 5:1.5 6:.5 | 5 4:.5 3:.5 2:2 | 1 3 6:1.5 5:.5 | 4:1.5 3:.5 2 1' },
      A2: { de: 'A', acordes: '1 | 5 | 4 5 | 1',
        melodia: "3 5 1':1.5 7:.5 | 6 5 2:2 | 4 6 5 7, | 1:3 0" },
      B: { acordes: '4 | 1 | 4 | 5', harmonia: 'batida', baixo: 'raiz', percussao: 'b.cca.c.',
        melodia: "6:1.5 5:.5 4 6 | 5:2 3 1 | 6 1' 7 6 | 5:3 0",
        melodia2: "0:2 1':1 0 | 0:2 5:1 0 | 0:2 3':1 0 | 0:2 2':1 0" },
      C: { acordes: '6 | 3 | 4 | 5', harmonia: 'dedilhado', baixo: 'raiz-quinta', percussao: 'b.c.a.c.',
        melodia: "1':1 7:.5 6:.5 3:2 | 5 3 7,:2 | 4 6 1' 6 | 5 7 2' 7" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Nadando no lago: aquático, arpejos com eco e sininhos
  F.lago = {
    nome: 'Lago Cintilante', bpm: 80, compasso: 4, tom: 'E', modo: 'maior', volume: 0.9,
    timbres: { melodia: 'sininhos', harmonia: 'harpa-agua', baixo: 'baixo-macio' },
    mix: { melodia: 0.42, harmonia: 0.24, baixo: 0.34 },
    eco: { tempo: 0.75, retorno: 0.38, mistura: 0.4 },
    secoes: {
      A: { acordes: '1 | 6 | 4 | 5', harmonia: 'arpejo', baixo: 'raiz', percussao: '',
        melodia: "5:2 3 5 | 6:3 0 | 1':2 6 4 | 5:4" },
      A2: { de: 'A', melodia: "3':2 2' 1' | 1':3 0 | 6:2 1' 4' | 2':4" },
      B: { acordes: '4 | 5 | 3 | 6', harmonia: 'arpejo', baixo: 'raiz', percussao: '',
        melodia: "4:1.5 6:.5 1':2 | 7:1.5 5:.5 2':2 | 3':2 7:2 | 1':4" },
      C: { acordes: '2 | 5 | 1 | 5', harmonia: 'arpejo', baixo: 'raiz', percussao: '',
        melodia: "2' 1' 6:2 | 7:2 5:2 | 3 5 1' 3' | 2':3 0" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Museu: caixinha de música, calmo (valsa)
  F.museu = {
    nome: 'Valsinha das Memórias', bpm: 96, compasso: 3, tom: 'F', modo: 'maior', volume: 1,
    timbres: { melodia: 'caixinha', harmonia: 'caixinha', baixo: 'caixinha-grave' },
    mix: { melodia: 0.5, harmonia: 0.22, baixo: 0.34 },
    eco: { tempo: 0.5, retorno: 0.2, mistura: 0.18 },
    secoes: {
      A: { acordes: '1 | 4 | 5 | 1', harmonia: 'valsa', baixo: 'valsa', percussao: '',
        melodia: '5:2 3 | 4:2 6 | 5 4 2 | 3:2 5,' },
      A2: { de: 'A', melodia: "5:2 1' | 6:2 4 | 2 3 4 | 1:3" },
      B: { acordes: '6 | 2 | 5 | 1', harmonia: 'valsa', baixo: 'valsa', percussao: '',
        melodia: "1':2 7 | 6:2 4 | 5 7, 2 | 3:3" },
      C: { acordes: '4 | 1 | 2 | 5', harmonia: 'valsa', baixo: 'valsa', percussao: '',
        melodia: "6 1' 6 | 5:2 3 | 4 2 6, | 7,:2 2" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Torre do Relógio: tique-taque, xilofone e sino
  F.torre = {
    nome: 'Tique-Taque da Torre', bpm: 96, compasso: 4, tom: 'C', modo: 'maior', volume: 1.4,
    timbres: { melodia: 'xilofone', harmonia: 'sino', baixo: 'baixo-pluck' },
    mix: { melodia: 0.5, harmonia: 0.3, baixo: 0.38, percussao: 0.34 },
    secoes: {
      A: { acordes: '1 | 6 | 2 | 5', harmonia: 'sino', baixo: 'raiz-quinta', percussao: 't.k.t.k.',
        melodia: "1:.5 3:.5 5:.5 3:.5 1' 5 | 6:.5 5:.5 3:.5 1:.5 6,:2 | 2:.5 4:.5 6:.5 4:.5 2 1:.5 2:.5 | 7, 2 5:2" },
      A2: { de: 'A', acordes: '1 | 6 | 4 | 5',
        melodia: "3:.5 5:.5 1':.5 5:.5 3 1 | 6,:.5 1:.5 3:.5 6:.5 5:2 | 4:.5 6:.5 1':.5 6:.5 4 3 | 2:3 0" },
      B: { acordes: '4 | 5 | 3 | 6', harmonia: 'sino', baixo: 'raiz', percussao: 't.k.t.kt',
        melodia: "6 1' 6:.5 5:.5 4 | 5 7 2':2 | 3' 2':.5 1':.5 7 5 | 6:2 3:2" },
      C: { acordes: '2 | 5 | 1 | 5', harmonia: 'sino', baixo: 'raiz-quinta', percussao: 't.k.t.k.',
        melodia: "4:.5 2:.5 4:.5 6:.5 2':2 | 7:.5 5:.5 2:.5 5:.5 7:2 | 1':.5 5:.5 3:.5 5:.5 1' 3' | 2' 7 5 0" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Casa das Palavras (Português): cozinha alegre, ukulele
  var PORTUGUES_SECOES = {
    A: { acordes: '1 | 4 | 5 | 1', harmonia: 'batida', baixo: 'raiz-quinta', percussao: 'b.c.a.c.',
      melodia: "1:.5 2:.5 3:.5 5:.5 5 3 | 4:.5 4:.5 6:.5 4:.5 1':2 | 7:.5 6:.5 5:.5 4:.5 2 7, | 1 3 5 0" },
    A2: { de: 'A', acordes: '1 | 4 | 5 | 6',
      melodia: "3:.5 3:.5 5:.5 3:.5 1' 5 | 6:.5 1':.5 6:.5 4:.5 1:2 | 2:.5 4:.5 7:.5 4:.5 5 2 | 3:3 0" },
    B: { acordes: '4 | 5 | 3 | 6', harmonia: 'batida', baixo: 'raiz', percussao: 'b.cca.c.',
      melodia: "1':1.5 6:.5 4 6 | 7:1.5 5:.5 2:2 | 5:.5 7:.5 5:.5 3:.5 7,:2 | 6, 1 3 6" },
    C: { acordes: '2 | 5 | 1 | 5', harmonia: 'batida', baixo: 'raiz-quinta', percussao: 'b.c.a.c.',
      melodia: "6:.5 4:.5 2:.5 4:.5 6 1' | 7 5:.5 7:.5 2':2 | 1':.5 7:.5 1':.5 5:.5 3 1 | 2 5, 7, 2" },
  };
  F.portugues = {
    nome: 'Cozinha das Palavras', bpm: 112, compasso: 4, tom: 'G', modo: 'maior', volume: 1.1,
    timbres: { melodia: 'marimba', harmonia: 'ukulele', baixo: 'baixo-pluck' },
    mix: { melodia: 0.55, harmonia: 0.22 },
    secoes: PORTUGUES_SECOES,
    ordem: ['A', 'A2', 'B', 'C'],
  };
  // ala da Antártida (cômodo 'porto'): a mesma cantiga, mais devagar, gelada (celesta e pad frio)
  F['portugues-gelo'] = {
    nome: 'Cozinha Gelada', bpm: 92, compasso: 4, tom: 'G', modo: 'maior', volume: 0.9,
    timbres: { melodia: 'sininhos', harmonia: 'pad-frio', baixo: 'baixo-macio' },
    mix: { melodia: 0.4, harmonia: 0.2, baixo: 0.32, percussao: 0.22 },
    eco: { tempo: 0.75, retorno: 0.3, mistura: 0.3 },
    secoes: {
      A: { de: 'A', harmonia: 'bloco', baixo: 'raiz', percussao: '....s...' },
      A2: { de: 'A2', harmonia: 'bloco', baixo: 'raiz', percussao: '....s...' },
      B: { de: 'B', harmonia: 'bloco', baixo: 'raiz', percussao: 's.......' },
      C: { de: 'C', harmonia: 'bloco', baixo: 'raiz', percussao: '....s...' },
    },
    base: PORTUGUES_SECOES,
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Castelo: medieval, nobre e calmo (dórico)
  F.castelo = {
    nome: 'Salão do Trono', bpm: 84, compasso: 4, tom: 'D', modo: 'dorico', volume: 0.75,
    timbres: { melodia: 'flauta', melodia2: 'cordas', harmonia: 'alaude', baixo: 'cordas-baixo' },
    mix: { melodia: 0.5, melodia2: 0.22, harmonia: 0.26, baixo: 0.34, percussao: 0.3 },
    secoes: {
      A: { acordes: '1 | 7 | 1 | 4', harmonia: 'dedilhado', baixo: 'raiz', percussao: 'm.....m.',
        melodia: '1 2 3:1.5 4:.5 | 2:1.5 3:.5 2 7, | 1 3 5 6 | 6:3 0' },
      A2: { de: 'A', acordes: '1 | 7 | 4 | 5',
        melodia: '5 6 5 3 | 2 3 7,:2 | 6, 2 4:1.5 2:.5 | 5:3 0' },
      B: { acordes: '3 | 7 | 4 | 1', harmonia: 'dedilhado', baixo: 'raiz', percussao: 'm...m.m.',
        melodia: "3':2 7 5 | 2':1.5 1':.5 7:2 | 6 5 4 2 | 3:2 1:2",
        melodia2: "1':4 | 7:4 | 6:4 | 5:4" },
      C: { acordes: '4 | 3 | 7 | 5', harmonia: 'dedilhado', baixo: 'raiz', percussao: 'm.....m.',
        melodia: "6 4 6 1' | 7:2 5 3 | 2' 1' 7 2 | 5:2 3 2" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Escola: leve e concentrada
  F.escola = {
    nome: 'Hora da Lição', bpm: 92, compasso: 4, tom: 'C', modo: 'maior', volume: 0.8,
    timbres: { melodia: 'piano-suave', harmonia: 'piano-suave', baixo: 'baixo-macio' },
    mix: { melodia: 0.5, harmonia: 0.2, baixo: 0.32, percussao: 0.2 },
    secoes: {
      A: { acordes: '1 | 3 | 4 | 5', harmonia: 'arpejo-lento', baixo: 'raiz', percussao: '..h...h.',
        melodia: '3:2 5 3 | 5:2 3 7, | 1 4 6:2 | 5:3 0' },
      A2: { de: 'A', acordes: '1 | 3 | 4 | 1',
        melodia: "5:2 1' 5 | 3:2 7:2 | 6 4 1':2 | 1':3 0" },
      B: { acordes: '6 | 2 | 5 | 1', harmonia: 'arpejo-lento', baixo: 'raiz', percussao: '..h...h.',
        melodia: '6:2 5 3 | 4:2 2 6, | 7, 2 5:2 | 3:3 0' },
      C: { acordes: '4 | 5 | 6 | 5', harmonia: 'arpejo-lento', baixo: 'raiz', percussao: '..h...hh',
        melodia: "4 6 1':2 | 7:2 5 2 | 1' 7 6 3 | 2:3 0" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Estábulo: campestre, trote
  F.estabulo = {
    nome: 'Trote no Campo', bpm: 116, compasso: 4, tom: 'F', modo: 'maior', volume: 1.4,
    timbres: { melodia: 'sanfona', harmonia: 'violao', baixo: 'baixo-pluck' },
    mix: { melodia: 0.42, harmonia: 0.2, baixo: 0.4, percussao: 0.34 },
    secoes: {
      A: { acordes: '1 | 1 | 4 | 5', harmonia: 'batida', baixo: 'trote', percussao: 'r.qqr.q.',
        melodia: '5 5:.5 6:.5 5 3 | 1 3 5:2 | 6 6:.5 5:.5 4 6 | 5:3 0' },
      A2: { de: 'A', acordes: '1 | 1 | 4 5 | 1',
        melodia: "5 5:.5 6:.5 5 1' | 7 6 5:2 | 4 6 2 7, | 1:3 0" },
      B: { acordes: '4 | 1 | 2 | 5', harmonia: 'batida', baixo: 'trote', percussao: 'r.qqr.qq',
        melodia: "1':1.5 1':.5 6 4 | 5:1.5 5:.5 3 1 | 2 4 6 4 | 5 6 7 2'" },
      C: { acordes: '6 | 3 | 4 | 5', harmonia: 'batida', baixo: 'trote', percussao: 'r.qqr.q.',
        melodia: "1' 6 3 6 | 7:2 5:2 | 6 4 1 4 | 2 5, 7, 2" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Loja das Fadas: mágica, harpa e sininhos
  F.loja = {
    nome: 'Pó de Fada', bpm: 88, compasso: 4, tom: 'Bb', modo: 'maior', volume: 0.92,
    timbres: { melodia: 'celesta', melodia2: 'sininhos', harmonia: 'harpa', baixo: 'baixo-macio' },
    mix: { melodia: 0.46, melodia2: 0.26, harmonia: 0.24, baixo: 0.32, percussao: 0.2 },
    eco: { tempo: 0.5, retorno: 0.28, mistura: 0.24 },
    secoes: {
      A: { acordes: '1 | 3 | 4 | 4m', harmonia: 'arpejo', baixo: 'raiz', percussao: '......s.',
        melodia: "5:1.5 3:.5 1':2 | 7 5 3:2 | 6 1' 4':1.5 3':.5 | 1':3 0" },
      A2: { de: 'A', acordes: '1 | 6 | 2 | 5',
        melodia: "3':1.5 2':.5 1' 5 | 6:2 3 1 | 4 6 2':1.5 1':.5 | 7:3 0" },
      B: { acordes: '6 | 4 | 1 | 5', harmonia: 'arpejo', baixo: 'raiz', percussao: '..s.....',
        melodia: "3':2 1' 6 | 1':2 6 4 | 5 3 1' 5 | 2':2 7:2",
        melodia2: "0 5'':1 0:2 | 0 4'':1 0:2 | 0 3'':1 0:2 | 0 2'':1 0:2" },
      C: { acordes: '4 | 4m | 1 | 5', harmonia: 'arpejo', baixo: 'raiz', percussao: '......s.',
        melodia: "4':1.5 3':.5 1' 6 | b6 4 1':2 | 3' 5' 3' 1' | 2':3 0" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Baú: aventura de tesouro (lá menor)
  F.bau = {
    nome: 'Caça ao Tesouro', bpm: 100, compasso: 4, tom: 'A', modo: 'menor', volume: 1.3,
    timbres: { melodia: 'trompa', melodia2: 'xilofone', harmonia: 'pizz', baixo: 'baixo-pluck' },
    mix: { melodia: 0.46, melodia2: 0.3, harmonia: 0.24, baixo: 0.4, percussao: 0.34 },
    secoes: {
      A: { acordes: '1 | 6 | 7 | 5M', harmonia: 'pizz', baixo: 'passeio', percussao: 'm.c.mmc.',
        melodia: '1 3 5:1.5 3:.5 | 6 5 3:2 | 2 4 7:1.5 6:.5 | 5:2 #7, 2' },
      A2: { de: 'A', acordes: '1 | 6 | 4 | 5M',
        melodia: "5 3 1':1.5 7:.5 | 1' 6 3:2 | 4 6 1' 6 | #7:3 0" },
      B: { acordes: '6 | 3 | 7 | 1', harmonia: 'pizz', baixo: 'passeio', percussao: 'm.ccm.c.',
        melodia: "1':2 6 3 | 5:1.5 3:.5 1:2 | 2 4 5 7 | 1':2 5:2",
        melodia2: "0:3 3':.5 1':.5 | 0:3 5:.5 3:.5 | 0:3 7:.5 5:.5 | 0:3 1':.5 5:.5" },
      C: { acordes: '4 | 1 | 6 | 5M', harmonia: 'pizz', baixo: 'passeio', percussao: 'm.c.mmc.',
        melodia: "4 6 1' 2' | 3':2 1' 5 | 6 1' 3' 1' | #7:2 5 2" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Pet Shop: fofinha e saltitante
  F.petshop = {
    nome: 'Patinhas Saltitantes', bpm: 120, compasso: 4, tom: 'D', modo: 'maior', volume: 1,
    timbres: { melodia: 'marimba', harmonia: 'pizz', baixo: 'baixo-pluck' },
    mix: { melodia: 0.55, harmonia: 0.22, baixo: 0.4, percussao: 0.3 },
    secoes: {
      A: { acordes: '1 | 6 | 2 | 5', harmonia: 'saltito', baixo: 'raiz-quinta', percussao: 'c.acc.a.',
        melodia: "1:.5 3:.5 5 6:.5 5:.5 3 | 6,:.5 1:.5 3 1 6, | 2:.5 4:.5 6 4:.5 6:.5 1' | 7:.5 5:.5 2 5:2" },
      A2: { de: 'A', acordes: '1 | 6 | 4 | 5',
        melodia: "5:.5 3:.5 1' 7:.5 6:.5 5 | 6:.5 5:.5 3 1 3 | 4:.5 6:.5 1' 6:.5 4:.5 1 | 2 5,:.5 7,:.5 2:2" },
      B: { acordes: '4 | 5 | 3 | 6', harmonia: 'saltito', baixo: 'raiz-quinta', percussao: 'c.acc.ac',
        melodia: "6 6:.5 1':.5 6 4 | 7 7:.5 2':.5 7 5 | 5 7:.5 5:.5 3 7, | 6, 1:.5 3:.5 6:2" },
      C: { acordes: '2 | 5 | 1 | 5', harmonia: 'saltito', baixo: 'raiz-quinta', percussao: 'c.acc.a.',
        melodia: "4:.5 6:.5 2' 1':.5 6:.5 4 | 5:.5 7:.5 2' 7:.5 5:.5 2 | 3:.5 5:.5 1' 3' 1' | 7:.5 6:.5 5:.5 4:.5 2:2" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Observatório: espacial, pads longos e brilhos
  F.observatorio = {
    nome: 'Poeira de Estrelas', bpm: 72, compasso: 4, tom: 'D', modo: 'maior', volume: 0.95,
    timbres: { melodia: 'brilho', harmonia: 'pad', baixo: 'pad-baixo' },
    mix: { melodia: 0.42, harmonia: 0.2, baixo: 0.3, percussao: 0.2 },
    eco: { tempo: 0.75, retorno: 0.42, mistura: 0.42 },
    secoes: {
      A: { acordes: '1 | 2M | 1 | 2M', harmonia: 'bloco', baixo: 'raiz', percussao: '....s...',
        melodia: "5:2 3':2 | 2':3 0 | 3 5 1':2 | #4':2 2':2" },
      A2: { de: 'A', acordes: '6 | 4 | 1 | 5',
        melodia: "3':2 1':2 | 6:2 4 1' | 5:3 3 | 2:4" },
      B: { acordes: '4 | 5 | 3 | 6', harmonia: 'bloco', baixo: 'raiz', percussao: 's.......',
        melodia: "1':3 6 | 2':2 7:2 | 7:2 5:2 | 3':4",
        melodia2: "0:2 5':1 0 | 0:3 4':1 | 0:2 3':1 0 | 0:3 2':1" },
      C: { acordes: '2 | 2M | 4 | 5', harmonia: 'bloco', baixo: 'raiz', percussao: '....s...',
        melodia: "4:2 6:2 | #4 6 2':2 | 1':2 6 4 | 5:3 0" },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // Salas de estudo: bem suave
  F.sala = {
    nome: 'Estudando com Calma', bpm: 76, compasso: 4, tom: 'F', modo: 'maior', volume: 0.85,
    timbres: { melodia: 'piano-suave', harmonia: 'pad-frio', baixo: 'baixo-macio' },
    mix: { melodia: 0.4, harmonia: 0.16, baixo: 0.28 },
    secoes: {
      A: { acordes: '1 | 4 | 6 | 5', harmonia: 'bloco', baixo: 'raiz', percussao: '',
        melodia: '3:2 2 1 | 6,:2 1:2 | 3:3 1 | 2:4' },
      A2: { de: 'A', acordes: '1 | 4 | 2 | 5',
        melodia: '5:2 3 5 | 6:3 4 | 4:2 2:2 | 5,:2 7,:2' },
      B: { acordes: '6 | 3 | 4 | 1', harmonia: 'bloco', baixo: 'raiz', percussao: '',
        melodia: "1':2 6:2 | 5:2 3:2 | 4 6 1':2 | 5:3 0" },
      C: { acordes: '2 | 5 | 3 6 | 4 5', harmonia: 'bloco', baixo: 'raiz', percussao: '',
        melodia: '6:2 4:2 | 2:2 7, 2 | 3:2 1:2 | 6,:2 7,:2' },
    },
    ordem: ['A', 'A2', 'B', 'C'],
  };

  // para js/sistemas/musicas.js (interno)
  Reino._musicas = { faixas: F };
})();
