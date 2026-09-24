/* Mariana e o Reino dos Unicórnios — configuração e utilidades comuns.
   Scripts clássicos (sem módulos) para funcionar abrindo o arquivo direto. */
window.Reino = window.Reino || {};

Reino.config = {
  nomeJogadora: 'Mariana',
  valorPorMateria: 20,        // R$ por matéria revisada, dividido entre as salas
  medalhaEscolaValor: 100,    // prêmio da medalha de ouro da prova real
  pinPais: '2026',            // troque aqui o PIN da Área dos Pais
  desafiosPorSala: 6,
  perguntasTreino: 10,
  // provas bimestrais (Escola do Reino): o acessório só vem com esta nota ou mais.
  // 10 = acertar tudo. Tentativa 1 → lendário, 2 → raro, depois → comum.
  notaSucessoProva: 10,
  // caminho da persistência: jogar várias vezes também faz nascer o raro/épico
  persistencia: { sala: 3, treinoOuro: 3, treinoPerfeito: 5 },
  chaveSave: 'mariana-reino-v1',
  // vozes naturais (gravadas por ferramentas/gerar-vozes.py)
  vozes: {
    claude: { voz: 'pt-BR-AntonioNeural', velocidade: '-5%', tom: '+0Hz' },
    narradora: { voz: 'pt-BR-FranciscaNeural', velocidade: '-8%', tom: '+0Hz' },
    unicornio: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+0%', tom: '+25Hz' },
    // trechos «em inglês»: inglês britânico (como a apostila), claro e um pouco devagar
    ingles: { voz: 'en-GB-SoniaNeural', velocidade: '-15%', tom: '+0Hz' },

    /* Personagens das construções (js/npcs.js): um perfil por personagem, 'npc-<id>'.
       Cada um com voz/velocidade/tom diferentes para ser reconhecido de ouvido.
       `ingles`: perfil dos trechos «em inglês» dessa personagem (padrão: 'ingles'). */
    // Museu das Memórias (História)
    'npc-memoria': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-16%', tom: '-12Hz' }, // curadora idosa, calma (diferente da narradora dos objetos)
    'npc-antonio': { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '-14%', tom: '-12Hz' },   // senhor das cartas: devagar, de avô
    'npc-chico': { voz: 'pt-BR-AntonioNeural', velocidade: '+12%', tom: '+16Hz' },             // carteiro animado (voz nativa: as multilíngues embolavam as frases curtas)
    'npc-taina': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+6%', tom: '+6Hz' },    // guia jovem e alegre
    'npc-contadeira': { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-18%', tom: '-12Hz' }, // griô: devagar, voz de contar história
    'npc-nina': { voz: 'en-US-AvaMultilingualNeural', velocidade: '+6%', tom: '+12Hz' },         // restauradora curiosa e leve
    // Torre do Relógio (Inglês)
    'npc-ponteiro': { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '-10%', tom: '-6Hz' }, // relojoeiro caprichoso, sotaque de avô italiano
    'npc-ben': { voz: 'en-US-AndrewMultilingualNeural', velocidade: '+6%', tom: '+4Hz', ingles: 'npc-ben-en' },     // técnico esportivo, energia
    'npc-ben-en': { voz: 'en-US-AndrewMultilingualNeural', velocidade: '-4%', tom: '+4Hz' },
    'npc-stella': { voz: 'en-US-AvaMultilingualNeural', velocidade: '+0%', tom: '+6Hz', ingles: 'npc-stella-en' },  // astrônoma encantada
    'npc-stella-en': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-10%', tom: '+6Hz' },
    'npc-smile': { voz: 'en-US-BrianMultilingualNeural', velocidade: '+0%', tom: '+8Hz', ingles: 'npc-smile-en' },  // dentista sorridente
    'npc-smile-en': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-10%', tom: '+8Hz' },
    'npc-moon': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-15%', tom: '-8Hz', ingles: 'npc-moon-en' },     // voz de boa-noite, bem calminha
    'npc-moon-en': { voz: 'en-US-AvaMultilingualNeural', velocidade: '-20%', tom: '-8Hz' },
    'npc-joy': { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '+4%', tom: '+10Hz', ingles: 'npc-joy-en' },   // músico feliz
    'npc-joy-en': { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '-6%', tom: '+10Hz' },
    // Castelo da Medalha
    'npc-serena': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-6%', tom: '+10Hz' },  // princesa gentil e elegante
    'npc-aurora': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+4%', tom: '-10Hz' }, // cavaleira firme e corajosa
    'npc-oliver': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-12%', tom: '-12Hz', ingles: 'npc-oliver-en' }, // cavaleiro nobre, grave
    'npc-oliver-en': { voz: 'en-US-BrianMultilingualNeural', velocidade: '-20%', tom: '-12Hz' },
    // Escola do Reino
    'npc-margarida': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '-12%', tom: '-8Hz' },    // diretora serena e firme
    'npc-helena': { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+6%', tom: '-6Hz' },   // professora clara e animada
    'npc-emma': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '-3%', tom: '+2Hz', ingles: 'npc-emma-en' },      // professora de inglês
    'npc-emma-en': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '-12%', tom: '+2Hz' },
    // Estábulo, Loja e Baú
    'npc-feno': { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '-8%', tom: '-14Hz' },     // tratador tranquilo, voz grave
    'npc-petala': { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+8%', tom: '+30Hz' },       // fada: aguda e rápida
    'npc-tostao': { voz: 'ko-KR-HyunsuMultilingualNeural', velocidade: '+10%', tom: '+22Hz' },    // dragãozinho: agudo e engraçado
    // interior de teste da Fase 1 (js/interiores/teste.js)
    'npc-teste-guia': { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '+4%', tom: '+8Hz' },
    'npc-teste-sala': { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '-4%', tom: '+12Hz' },
  },
};

Reino.materias = [];
Reino.registrarMateria = function (m) { Reino.materias.push(m); };
Reino.materia = function (id) { return Reino.materias.find(function (m) { return m.id === id; }); };
// provas bimestrais: cada uma em js/provas/<id>.js
Reino.provas = [];
Reino.registrarProva = function (p) { Reino.provas.push(p); };
Reino.prova = function (id) { return Reino.provas.find(function (p) { return p.id === id; }); };

Reino.util = (function () {
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  // el('div.classe#id', {atributos}, filhos...)
  function el(tag, attrs) {
    var partes = tag.split(/(?=[.#])/);
    var node = document.createElement(partes[0] || 'div');
    partes.slice(1).forEach(function (p) {
      if (p[0] === '.') node.classList.add(p.slice(1));
      else if (p[0] === '#') node.id = p.slice(1);
    });
    var filhos = Array.prototype.slice.call(arguments, 2);
    if (attrs && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) {
      filhos.unshift(attrs); attrs = null;
    }
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'on') { Object.keys(v).forEach(function (ev) { node.addEventListener(ev, v[ev]); }); }
        else if (k === 'style' && typeof v === 'object') { Object.assign(node.style, v); }
        else if (k === 'text') { preencher(node, v); }
        else if (k === 'html') { node.innerHTML = v; }
        else if (k in node && typeof v !== 'string') { node[k] = v; }
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    filhos.flat(Infinity).forEach(function (f) {
      if (f === null || f === undefined || f === false) return;
      if (f.nodeType) node.appendChild(f);
      else colocarTexto(node, String(f));
    });
    return node;
  }

  var RE_ICONE = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|[✓✕✔✘←→↑↓▲▼◀▶⌫↙↗])/gu;
  // «inglês» vira <span class="en"> sem os sinais (a voz inglesa lê o mesmo trecho)
  var RE_EN = /«([^«»]*)»/g;
  function semEn(s) { return String(s).replace(/[«»]/g, ''); }
  function colocarTexto(node, s) {
    if (s.indexOf('«') < 0 && s.indexOf('»') < 0) { colocarIcones(node, s); return; }
    RE_EN.lastIndex = 0;
    var ultimo = 0, m;
    while ((m = RE_EN.exec(s))) {
      if (m.index > ultimo) colocarIcones(node, semEn(s.slice(ultimo, m.index)));
      var span = document.createElement('span');
      span.className = 'en'; span.lang = 'en';
      colocarIcones(span, m[1]);
      node.appendChild(span);
      ultimo = RE_EN.lastIndex;
    }
    if (ultimo < s.length) colocarIcones(node, semEn(s.slice(ultimo)));
  }
  function colocarIcones(node, s) {
    RE_ICONE.lastIndex = 0;
    if (!RE_ICONE.test(s) || !window.PA || !PA.iconeEmoji) {
      node.appendChild(document.createTextNode(s));
      return;
    }
    RE_ICONE.lastIndex = 0;
    var ultimo = 0, m;
    while ((m = RE_ICONE.exec(s))) {
      if (m.index > ultimo) node.appendChild(document.createTextNode(s.slice(ultimo, m.index)));
      node.appendChild(PA.iconeTexto(m[0], s.trim() === m[0]));
      ultimo = m.index + m[0].length;
    }
    if (ultimo < s.length) node.appendChild(document.createTextNode(s.slice(ultimo)));
  }
  function preencher(node, s) {
    node.textContent = '';
    colocarTexto(node, String(s));
    return node;
  }

  function embaralhar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sortear(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function reais(v) { return 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
  function reaisCurto(v) { return 'R$' + (Number.isInteger(v) ? v : v.toFixed(2).replace('.', ',')); }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // pequeno barramento de eventos
  var ouvintes = {};
  function on(ev, fn) { (ouvintes[ev] = ouvintes[ev] || []).push(fn); }
  function emit(ev, dado) { (ouvintes[ev] || []).forEach(function (fn) { try { fn(dado); } catch (e) { console.error(e); } }); }

  var reduzMovimento = false;
  try { reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  return { $: $, $$: $$, el: el, preencher: preencher, semEn: semEn, embaralhar: embaralhar, sortear: sortear, clamp: clamp,
    reais: reais, reaisCurto: reaisCurto, copia: copia, esperar: esperar, on: on, emit: emit,
    reduzMovimentoSistema: reduzMovimento };
})();
