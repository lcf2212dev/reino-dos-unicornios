/* Sinais de "sem internet" na Área dos pais (D11-05 e D11-13):
   - nuvem: ouve Reino.EVENTOS.NUVEM (sistemas/progresso-nuvem.js); em 'erro' e 'local' a nota ganha a nuvem riscada.
   - app guardado: o service worker da Vercel (vercel/pwa/sw.js) conta quanto do jogo já guardou para jogar sem rede
     ({ reino: 'guardando', feitos, total } e { reino: 'guardado', total }); sem service worker (servidor de teste,
     navegador sem suporte), a nota não aparece.
   As notas ficam vivas: mudam na hora enquanto a Área dos pais está aberta. UI.notaNuvem(), UI.notaSemInternet(). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS, UI = Reino.UI;

  // nuvem riscada (a ☁ de natureza.js com um risco vermelho de contorno #3a2446)
  Reino.registrarIcones({
    'nuvem-riscada': { n: 'nuvem riscada', p: { k: '#3a2446', U: '#ffffff', u: '#f4f0ff', w: '#ffffff', '#': '#c9c4e8', r: '#d63d63' }, d: [
      '................',
      '.kkk............',
      'krrk............',
      '.krrk...........',
      '..krrk.kkk......',
      '...krrkUUUk.....',
      '...kkrrkuwUk....',
      '..kUUkrrku#kk...',
      '.kUuuukrrkuUUk..',
      'kUuuwuukrrkuuUk.',
      'kUuuuuuukrrkuuUk',
      'k#uuuuuuukrrku#k',
      '.k########krrkk.',
      '..kkkkkkkkkkrrk.',
      '............krrk',
      '.............kkk',
    ] },
  });

  function icone(chave) { return window.PA && PA.iconeTexto ? PA.iconeTexto(chave) : ''; }
  // cada nota viva: { no, desenhar }; as que saíram da página caem na próxima atualização
  var vivas = [];
  function atualizar() {
    vivas = vivas.filter(function (v) { return v.no.isConnected; });
    vivas.forEach(function (v) { v.no.textContent = ''; v.desenhar(v.no); });
  }
  function nota(desenhar) {
    var no = el('p.pais-nota');
    desenhar(no);
    vivas.push({ no: no, desenhar: desenhar });
    return no;
  }
  function escrever(no, ic, texto) {
    if (ic) no.appendChild(ic);
    no.appendChild(el('span', (ic ? ' ' : '') + texto));
  }

  /* ---------- nuvem ---------- */
  var nuvem = null;   // último status do evento; antes dele, o do Progresso
  U.on(EV.NUVEM, function (s) { nuvem = s; atualizar(); });
  function desenharNuvem(no) {
    var s = nuvem || P.statusNuvem();
    if (s === 'erro') escrever(no, icone('nuvem-riscada'), 'Não conseguimos enviar o progresso agora. O jogo tenta de novo sozinho.');
    else if (s === 'local') escrever(no, icone('nuvem-riscada'), 'O progresso está salvo só neste aparelho. Ele é enviado quando a internet voltar.');
    else escrever(no, null, '☁️ O progresso está sincronizado com o banco do Reino.');
  }
  UI.notaNuvem = function () { return nota(desenharNuvem); };

  /* ---------- jogo guardado para jogar sem internet ---------- */
  // pronto: a versão que serve a aba está inteira no cache; novo: { feitos, total, falhou } da que está baixando
  var app = { soube: false, pronto: false, novo: null };
  var sw = 'serviceWorker' in navigator ? navigator.serviceWorker : null;
  function receber(m) {
    if (!m || (m.reino !== 'guardando' && m.reino !== 'guardado')) return;
    app.soube = true;
    if (m.reino === 'guardado') { app.pronto = true; app.novo = null; }
    else {
      // o ativo incompleto manda a contagem dele (vale mais que a de uma instalação antiga que falhou)
      if (m.fase === 'ativo') app.pronto = false;
      app.novo = { feitos: m.feitos, total: m.total, falhou: !!m.falhou };
    }
    atualizar();
  }
  function perguntar() {
    if (!sw || !sw.getRegistration) return;
    sw.getRegistration().then(function (r) {
      if (r && r.active) r.active.postMessage({ reino: 'como-esta' });
    }).catch(function () {});
  }
  if (sw) {
    sw.addEventListener('message', function (e) { receber(e.data); });
    perguntar();
  }
  function desenharApp(no) {
    var n = app.novo;
    if (n && !app.pronto) {
      escrever(no, icone('⏳'), 'Guardando o jogo para jogar sem internet… ' + n.feitos + ' de ' + n.total + '.'
        + (n.falhou ? ' O resto vem na próxima vez que abrir com internet.' : ''));
    } else if (app.pronto) {
      escrever(no, icone('✔'), 'Pronto para jogar sem internet.'
        + (n ? ' Guardando a versão nova… ' + n.feitos + ' de ' + n.total + '.'
          + (n.falhou ? ' A versão nova vem na próxima vez que abrir com internet.' : '') : ''));
    }
    no.hidden = !no.firstChild;   // nada a dizer: sem nota vazia
  }
  UI.notaSemInternet = function () { perguntar(); return nota(desenharApp); };
})();
