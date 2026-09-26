/* Músicas por ambiente (só DADOS e funções puras: nada de DOM, canvas ou áudio no carregamento).
   As faixas (dados) estão em js/sistemas/musicas-faixas.js; aqui ficam o formato, a API e a expansão em notas.
   Quem toca é o motor de js/sistemas/som-musica.js; ferramentas/testes/testar-musicas.js carrega os dois num vm (Node).

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
   Tipos (Musica, SecaoMusica, NotaMusica, MusicasApi): jogo/ferramentas/testes/tipos-jogo.d.ts.
*/
/** @type {ReinoGlobal} */
var Reino = window.Reino = window.Reino || {};
(function () {
  /** @type {MusicasApi} */
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

  // as faixas (dados) estão em js/sistemas/musicas-faixas.js, carregado antes deste
  M.faixas = Reino._musicas.faixas;

  /* ================= EXPANSÃO (dados → notas com tempo em segundos) ================= */
  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function arred(x) { return Math.round(x * 1e6) / 1e6; }

  // seção com a herança de `de` resolvida (a faixa pode ter `base`: seções de outra faixa)
  /** @param {{ secoes: Object<string, SecaoMusica>, base?: Object<string, SecaoMusica> }} fx @param {string} nome
      @returns {SecaoMusica} */
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
  /** @param {Musica} fx @param {string} texto @param {number} base @returns {{ midi: number | null, dur: number }[][]} */
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
