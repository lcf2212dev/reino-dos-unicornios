/* Músicas por ambiente (só DADOS e funções puras: nada de DOM, canvas ou áudio no carregamento).
   Quem toca é o motor de js/sistemas/som.js; ferramentas/testes/testar-musicas.js carrega este arquivo num vm (Node).

   ---------- Formato de uma faixa (Reino.Musicas.faixas[id]) ----------
   {
     nome: 'Campos do Reino',
     bpm: 104,                 // batidas por minuto
     compasso: 4,              // batidas por compasso (4 = 4/4, 3 = valsa)
     tom: 'D',                 // tônica: C, C#, Db, D, … B
     modo: 'maior',            // 'maior' | 'menor' | 'dorico'
     volume: 1,                // ganho da faixa (acerta o volume entre as faixas)
     timbres: { melodia, melodia2?, harmonia, baixo },   // instrumento de cada parte (nomes em js/sistemas/som.js)
     mix: { melodia, melodia2, harmonia, baixo, percussao },  // volume de cada parte (opcional)
     eco: { tempo, retorno, mistura } | null,  // eco com DelayNode (tempo em batidas)
     secoes: { A: secao, B: secao, … },
     ordem: ['A', 'A2', 'B', 'C'],             // um loop inteiro (o fim emenda no começo)
     base: { A: secao, … },                     // opcional: seções de outra faixa (a mesma cantiga com outro
                                               // arranjo); uma seção com `de` igual ao próprio nome herda dela
   }
   secao = {
     de: 'A',                  // opcional: herda os campos da seção A e troca só os que vierem aqui
     acordes: '1 | 5 | 6 | 4', // um compasso por "|"; dois acordes no compasso: '4 5' (dividem o tempo)
                               // grau da escala (1–7), com b/# antes, e depois M (maior), m (menor), 7 (sétima)
     melodia: '3 5:1.5 6:.5 | …',   // notas por grau: [b|#]grau[' sobe oitava | , desce][:duração em batidas]
                                    // 0 = pausa; duração padrão 1. Cada compasso soma `compasso` batidas.
     melodia2: '…',            // opcional: segunda voz (enfeite), mesma notação
     harmonia: 'dedilhado',    // padrão do acompanhamento (PADROES_HARMONIA)
     baixo: 'raiz-quinta',     // padrão do baixo (PADROES_BAIXO)
     percussao: 'b.c.a.c.',    // um caractere por colcheia do compasso (PERCUSSAO), '.' = nada; '' = sem
     timbres: { … },           // opcional: troca instrumentos só nesta seção
     oitava: 0,                // opcional: desloca a melodia em oitavas
   }

   ---------- API ----------
   Reino.Musicas.expandir(id) → [{ t, dur, freq, parte, vol, onda }] ordenado por t (segundos, um loop)
     parte: 'melodia' | 'harmonia' | 'baixo' | 'percussao'
     onda:  nome do timbre (instrumento) em js/sistemas/som.js; na percussão, o tipo do toque (feito com ruído),
            e `freq` é a frequência central do filtro.
   Reino.Musicas.duracao(id) → segundos de um loop
   Reino.Musicas.secao(id, nome) → a seção com a herança (`de`) resolvida
   Reino.Musicas.compassos(id) → [{ secao, t, batidas, melodia, melodia2, … }] (batidas somadas em cada
     compasso, para ferramentas/testes/testar-musicas.js conferir)
*/
var Reino = window.Reino = window.Reino || {};
(function () {
  var M = {};

  var ESCALAS = { maior: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], dorico: [0, 2, 3, 5, 7, 9, 10] };
  var TONS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

  // percussão leve (ruído filtrado): um caractere por colcheia
  var PERCUSSAO = {
    b: { onda: 'bumbo', freq: 90, vol: 0.5 },
    c: { onda: 'chocalho', freq: 5200, vol: 0.32 },
    h: { onda: 'chimbal', freq: 8000, vol: 0.22 },
    a: { onda: 'aro', freq: 2400, vol: 0.3 },
    t: { onda: 'tique', freq: 3400, vol: 0.36 },
    k: { onda: 'taque', freq: 1900, vol: 0.36 },
    r: { onda: 'casco', freq: 1500, vol: 0.4 },
    q: { onda: 'casco', freq: 950, vol: 0.4 },
    m: { onda: 'tambor', freq: 220, vol: 0.45 },
    s: { onda: 'brilho', freq: 9000, vol: 0.16 },
  };

  var MIX = { melodia: 0.55, melodia2: 0.35, harmonia: 0.26, baixo: 0.42, percussao: 0.3 };

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

  M.faixas = F;

  /* ================= EXPANSÃO (dados → notas com tempo em segundos) ================= */
  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function arred(x) { return Math.round(x * 1e6) / 1e6; }

  // seção com a herança de `de` resolvida (a faixa pode ter `base`: seções de outra faixa)
  function secao(fx, nome) {
    var s = fx.secoes[nome] || (fx.base && fx.base[nome]);
    if (!s) throw new Error('seção inexistente: ' + nome);
    if (!s.de) return s;
    var pai;
    if (s.de === nome) {
      if (!fx.base || !fx.base[nome] || fx.base[nome] === s) throw new Error('seção herda dela mesma: ' + nome);
      pai = secao({ secoes: fx.base }, nome);
    } else pai = secao(fx, s.de);
    var r = {};
    Object.keys(pai).forEach(function (k) { r[k] = pai[k]; });
    Object.keys(s).forEach(function (k) { if (k !== 'de') r[k] = s[k]; });
    return r;
  }
  M.secao = function (id, nome) { return secao(M.faixas[id], nome); };

  // tônica em MIDI para a melodia (tônica entre Fá#4 e Fá5)
  function baseMelodia(fx) {
    var pc = TONS[fx.tom];
    if (pc === undefined) throw new Error('tom desconhecido: ' + fx.tom);
    return 72 + pc - (pc >= 6 ? 12 : 0);
  }
  function escala(fx) {
    var e = ESCALAS[fx.modo || 'maior'];
    if (!e) throw new Error('modo desconhecido: ' + fx.modo);
    return e;
  }
  // grau (1..7, podendo passar de 7) → semitons acima da tônica
  function semitons(esc, grau) {
    var g = grau - 1, oit = Math.floor(g / 7);
    return esc[((g % 7) + 7) % 7] + 12 * oit;
  }

  // "[b|#]grau[''/,][:dur]" → { midi|null, dur }
  var RE_NOTA = /^([b#]?)([0-7])([',]*)(?::([\d.]+))?$/;
  function lerLinha(fx, texto, base) {
    var esc = escala(fx), compassos = [];
    String(texto || '').split('|').forEach(function (c) {
      var notas = [];
      c.trim().split(/\s+/).filter(Boolean).forEach(function (tok) {
        var m = RE_NOTA.exec(tok);
        if (!m) throw new Error('nota inválida: "' + tok + '"');
        var dur = m[4] ? parseFloat(m[4]) : 1, grau = +m[2];
        if (!(dur > 0)) throw new Error('duração inválida: "' + tok + '"');
        if (grau === 0) { notas.push({ midi: null, dur: dur }); return; }
        var oit = 0;
        for (var i = 0; i < m[3].length; i++) oit += m[3][i] === "'" ? 1 : -1;
        var ac = m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0;
        notas.push({ midi: base + semitons(esc, grau) + ac + 12 * oit, dur: dur });
      });
      compassos.push(notas);
    });
    return compassos;
  }

  // "[b|#]grau[M|m][7]" → notas do acorde (semitons acima da tônica, fundamental primeiro)
  var RE_ACORDE = /^([b#]?)([1-7])(M|m)?(7)?$/;
  function lerAcorde(fx, tok) {
    var m = RE_ACORDE.exec(tok);
    if (!m) throw new Error('acorde inválido: "' + tok + '"');
    var esc = escala(fx), g = +m[2], ac = m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0;
    var raiz = semitons(esc, g) + ac;
    var terca = m[3] === 'M' ? raiz + 4 : m[3] === 'm' ? raiz + 3 : semitons(esc, g + 2) + ac;
    var quinta = m[3] ? raiz + 7 : semitons(esc, g + 4) + ac;
    var notas = [raiz, terca, quinta];
    if (m[4]) notas.push(m[3] ? raiz + 10 : semitons(esc, g + 6) + ac);
    return notas;
  }
  function lerAcordes(fx, texto) {
    return String(texto).split('|').map(function (c) {
      return c.trim().split(/\s+/).filter(Boolean).map(function (tok) { return lerAcorde(fx, tok); });
    });
  }
  // põe cada nota do acorde perto de `centro` (posição fechada) e ordena
  function voicing(notas, tonica, centro) {
    return notas.map(function (s) {
      var n = tonica + s;
      while (n < centro - 4) n += 12;
      while (n >= centro + 8) n -= 12;
      return n;
    }).sort(function (a, b) { return a - b; });
  }
  function raizPerto(nota, tonica, centro) {
    var n = tonica + nota;
    while (n < centro - 5) n += 12;
    while (n >= centro + 7) n -= 12;
    return n;
  }

  /* Padrões do acompanhamento: (acorde em MIDI, batidas do trecho, compasso) → [{ b, dur, midi, vol }] */
  var PADROES_HARMONIA = {
    bloco: function (a, n) { return a.map(function (m) { return { b: 0, dur: n, midi: m, vol: 0.7 }; }); },
    arpejo: function (a, n) {
      var seq = [a[0], a[1], a[2], a[0] + 12, a[2], a[1]], r = [];
      for (var i = 0; i < n * 2; i++) r.push({ b: i / 2, dur: 1.5, midi: seq[i % seq.length], vol: i % 2 ? 0.75 : 0.95 });
      return r;
    },
    'arpejo-lento': function (a, n) {
      var seq = [a[0], a[2], a[1] + 12, a[2]], r = [];
      for (var i = 0; i < n; i++) r.push({ b: i, dur: 1.6, midi: seq[i % seq.length], vol: i ? 0.7 : 0.9 });
      return r;
    },
    dedilhado: function (a, n) {
      var seq = [a[0] - 12, a[2], a[1] + 12, a[2], a[0], a[2], a[1] + 12, a[2]], r = [];
      for (var i = 0; i < n * 2; i++) r.push({ b: i / 2, dur: 1, midi: seq[i % seq.length], vol: i % 2 ? 0.7 : 0.9 });
      return r;
    },
    // ukulele/violão batido: acorde nas colcheias x.xx.xx. (as notas escorregam 15 ms, como a palheta)
    batida: function (a, n) {
      var marca = n % 3 === 0 ? 'x.xx.x' : 'x.xx.xx.', r = [];
      for (var i = 0; i < n * 2; i++) {
        if (marca[i % marca.length] !== 'x') continue;
        a.forEach(function (m, j) { r.push({ b: i / 2 + j * 0.03, dur: 0.45, midi: m, vol: (i % 2 ? 0.55 : 0.75) - j * 0.05 }); });
      }
      return r;
    },
    valsa: function (a, n) {
      var r = [];
      for (var i = 1; i < n; i++) a.forEach(function (m) { r.push({ b: i, dur: 0.8, midi: m + 12, vol: i === 1 ? 0.6 : 0.5 }); });
      return r;
    },
    saltito: function (a, n) {
      var r = [];
      for (var i = 0; i < n; i++) [a[1], a[2]].forEach(function (m) { r.push({ b: i + 0.5, dur: 0.3, midi: m, vol: 0.7 }); });
      return r;
    },
    pizz: function (a, n) {
      var seq = [a[0], a[2], a[1] + 12, a[2]], r = [];
      for (var i = 0; i < n * 2; i++) r.push({ b: i / 2, dur: 0.3, midi: seq[i % seq.length], vol: i % 2 ? 0.55 : 0.8 });
      return r;
    },
    // sino: fundamental e terça no começo do trecho, bem compridos
    sino: function (a, n) { return [{ b: 0, dur: n, midi: a[0] + 12, vol: 0.8 }, { b: 0.02, dur: n, midi: a[1] + 12, vol: 0.45 }]; },
  };
  /* Padrões do baixo: (fundamental em MIDI, batidas do trecho) → [{ b, dur, midi, vol }] */
  var PADROES_BAIXO = {
    raiz: function (r, n) { return [{ b: 0, dur: n, midi: r, vol: 0.9 }]; },
    'raiz-quinta': function (r, n) {
      if (n < 2) return [{ b: 0, dur: n, midi: r, vol: 0.9 }];
      return [{ b: 0, dur: n / 2, midi: r, vol: 0.9 }, { b: n / 2, dur: n / 2, midi: r - 5, vol: 0.75 }];
    },
    valsa: function (r) { return [{ b: 0, dur: 1, midi: r, vol: 0.9 }]; },
    trote: function (r, n) {
      var x = [];
      for (var i = 0; i < n; i++) x.push({ b: i, dur: 0.6, midi: i % 2 ? r - 5 : r, vol: i % 2 ? 0.7 : 0.9 });
      return x;
    },
    passeio: function (r, n, a) {
      var seq = [r, r + (a[1] - a[0]), r + (a[2] - a[0]), r + (a[1] - a[0])], x = [];
      for (var i = 0; i < n; i++) x.push({ b: i, dur: 0.9, midi: seq[i % 4], vol: i ? 0.75 : 0.9 });
      return x;
    },
  };
  M.PADROES_HARMONIA = Object.keys(PADROES_HARMONIA);
  M.PADROES_BAIXO = Object.keys(PADROES_BAIXO);
  M.PERCUSSAO = PERCUSSAO;

  var cache = {};
  M.expandir = function (id) {
    if (cache[id]) return cache[id].map(function (e) { return Object.assign({}, e); });
    var fx = M.faixas[id];
    if (!fx) throw new Error('faixa inexistente: ' + id);
    var seg = 60 / fx.bpm, nb = fx.compasso || 4, tonMel = baseMelodia(fx);
    var tonica = tonMel - 12;            // referência dos acordes
    var mix = Object.assign({}, MIX, fx.mix || {});
    var ev = [], b0 = 0;                 // b0 = batida onde começa o compasso
    function por(b, dur, midi, parte, vol, onda) {
      ev.push({ t: arred(b * seg), dur: arred(dur * seg), freq: arred(midiHz(midi)), parte: parte === 'melodia2' ? 'melodia' : parte, vol: arred(vol), onda: onda });
    }
    fx.ordem.forEach(function (nome) {
      var s = secao(fx, nome), tim = Object.assign({}, fx.timbres, s.timbres || {});
      var oit = 12 * (s.oitava || 0);
      var acordes = lerAcordes(fx, s.acordes);
      var linhas = { melodia: lerLinha(fx, s.melodia, tonMel + oit) };
      if (s.melodia2) linhas.melodia2 = lerLinha(fx, s.melodia2, tonMel);
      var perc = s.percussao || '';
      acordes.forEach(function (acs, ci) {
        var bc = b0 + ci * nb, fatia = nb / acs.length;
        acs.forEach(function (ac, ai) {
          var bi = bc + ai * fatia;
          var ph = PADROES_HARMONIA[s.harmonia], pb = PADROES_BAIXO[s.baixo];
          if (!ph) throw new Error('harmonia desconhecida: ' + s.harmonia);
          if (!pb) throw new Error('baixo desconhecido: ' + s.baixo);
          var voz = voicing(ac, tonica, tonica + 2);
          ph(voz, fatia, nb).forEach(function (n) { por(bi + n.b, n.dur, n.midi, 'harmonia', n.vol * mix.harmonia, tim.harmonia); });
          var raiz = raizPerto(ac[0], tonica - 12, tonica - 12);
          pb(raiz, fatia, voz).forEach(function (n) { por(bi + n.b, n.dur, n.midi, 'baixo', n.vol * mix.baixo, tim.baixo); });
        });
        Object.keys(linhas).forEach(function (parte) {
          var notas = linhas[parte][ci] || [], b = bc;
          notas.forEach(function (n, i) {
            // tempo forte um pouquinho mais alto, as outras mais macias (fraseado)
            var forte = (b - bc) % 1 === 0 ? 1 : 0.85;
            if (n.midi !== null) por(b, n.dur, n.midi, parte, mix[parte] * forte * (i === 0 ? 1 : 0.94), tim[parte]);
            b += n.dur;
          });
        });
        if (perc) {
          var passo = nb / perc.length;
          for (var i = 0; i < perc.length; i++) {
            var p = PERCUSSAO[perc[i]];
            if (p) ev.push({ t: arred((bc + i * passo) * seg), dur: arred(0.25 * seg), freq: p.freq, parte: 'percussao', vol: arred(p.vol * mix.percussao * (i === 0 ? 1.1 : 1)), onda: p.onda });
          }
        }
      });
      b0 += acordes.length * nb;
    });
    ev.sort(function (a, b) { return a.t - b.t || (a.parte < b.parte ? -1 : a.parte > b.parte ? 1 : a.freq - b.freq); });
    cache[id] = ev;
    return ev.map(function (e) { return Object.assign({}, e); });
  };

  M.duracao = function (id) {
    var fx = M.faixas[id];
    if (!fx) throw new Error('faixa inexistente: ' + id);
    var total = 0;
    fx.ordem.forEach(function (nome) { total += lerAcordes(fx, secao(fx, nome).acordes).length * (fx.compasso || 4); });
    return arred(total * 60 / fx.bpm);
  };

  // compassos de uma faixa (para a ferramenta conferir a soma das batidas de cada compasso)
  M.compassos = function (id) {
    var fx = M.faixas[id], nb = fx.compasso || 4, r = [], t = 0;
    fx.ordem.forEach(function (nome) {
      var s = secao(fx, nome), ac = lerAcordes(fx, s.acordes);
      var mel = lerLinha(fx, s.melodia, 0), mel2 = s.melodia2 ? lerLinha(fx, s.melodia2, 0) : null;
      ac.forEach(function (a, i) {
        var soma = function (l) { return l ? (l[i] || []).reduce(function (x, n) { return x + n.dur; }, 0) : null; };
        r.push({ secao: nome, t: arred(t * 60 / fx.bpm), batidas: nb, melodia: soma(mel), melodia2: soma(mel2), linhasMel: mel.length, linhasAc: ac.length, linhasMel2: mel2 ? mel2.length : null });
        t += nb;
      });
    });
    return r;
  };

  Reino.Musicas = M;
})();
