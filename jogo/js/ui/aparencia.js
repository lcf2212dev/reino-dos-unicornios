/* Criação de personagem: "Crie seu personagem" (primeira vez) e "Meu personagem" (Ajustes). Nome, menina ou menino,
   pele, cor e corte do cabelo, modelo e cor da roupa e o laço (opcional), com a prévia grande girando pelas vistas.
   Grava a aparência (aparencia: cores + corte/modelo/semLaco, save-e-mescla.md §4.6) no Pronto e o nome e o sexo
   no perfil (Reino.Jogadores.definirPerfil; sem ele, só a aparência). Menino/Menina troca o visual pelo padrão do
   sexo (PA.VISUAL_SEXO) e volta ao que era ao desfazer. Estilos: css/ui-personagem.css. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var UI = Reino.UI, R = Reino._ui;
  var painel = R.painel, aparencia = R.aparencia, est = R.est;

  var NOME_MAX = 12;
  // a volta da prévia: 8 direções (as da esquerda são as da direita espelhadas)
  var VOLTA = [['frente'], ['diagFrente'], ['lado'], ['diagCostas'], ['costas'], ['diagCostas', 1], ['lado', 1], ['diagFrente', 1]];
  var PASSO_MS = 170, PASSOS_POR_VISTA = 6;
  var VISUAL = ['corte', 'modelo', 'semLaco'];
  var SEXOS = [['menina', '👧 Menina'], ['menino', '👦 Menino']];

  function animar() { return est().ajustes.animacoes !== false && !U.reduzMovimentoSistema; }
  // as opções com as do sexo escolhido primeiro (a ordem de cada grupo fica a de sempre)
  function ordenar(lista, sexo) {
    return lista.filter(function (o) { return (o.sexo || 'menina') === sexo; }).concat(lista.filter(function (o) { return (o.sexo || 'menina') !== sexo; }));
  }
  // um pedaço do sprite (linhas de..ate: a cabeça no corte, o corpo na roupa), num canvas só dele
  function recorte(spr, de, ate, escala) {
    var h = Math.min(ate, spr.h) - de, c = PA.novoCanvas(spr.w, h);
    c.getContext('2d').drawImage(spr.canvas, 0, de, spr.w, h, 0, 0, spr.w, h);
    c.className = 'pixel';
    c.style.width = (c.width * escala) + 'px'; c.style.height = (c.height * escala) + 'px';
    return c;
  }
  function copiaVisual(ap) { var o = {}; VISUAL.forEach(function (k) { if (k in ap) o[k] = ap[k]; }); return o; }
  function porVisual(ap, v) { VISUAL.forEach(function (k) { if (k in v) ap[k] = v[k]; else delete ap[k]; }); }

  /** Abre a criação. primeiraVez: sem ✕ (só sai pelo Pronto). @param {boolean} [primeiraVez] @returns {Promise<void>} */
  UI.telaAparencia = function (primeiraVez) {
    return new Promise(function (resolver) {
      var G = Reino.Genero, J = Reino.Jogadores, perfil = G.perfil();
      var rascunho = { nome: perfil.nome, sexo: perfil.sexo };
      // o visual de cada sexo, para o Menino/Menina ir e voltar sem perder o que ela tinha (lido na hora)
      var guardado = {};
      guardado[rascunho.sexo] = copiaVisual(aparencia());
      var pn = painel('aparencia', primeiraVez ? '✨ Crie seu personagem' : '🪞 Meu personagem', { semFechar: !!primeiraVez, aoFechar: concluir });
      var relogio = null, passo = 0, volta = 0;

      // ---------- prévia ----------
      var tela = PA.novoCanvas(1, 1);
      tela.className = 'pixel criar-sprite';
      var palco = el('button.criar-palco', { type: 'button', 'aria-label': 'Girar o personagem' }, el('span.criar-chao'), tela);
      var plaquinha = el('div.criar-plaquinha');
      palco.addEventListener('click', function () { volta = (volta + 1) % VOLTA.length; passo = 0; desenhar(); });
      function prova() { return Object.assign({}, aparencia(), { sexo: rascunho.sexo }); }
      function desenhar() {
        var v = VOLTA[volta], andando = relogio !== null;
        var spr = PA.mariana(prova(), false, andando ? [1, 0, 2, 0][passo % 4] : 0, { vista: v[0] });
        var escala = window.innerWidth < 480 ? 7 : 9;
        if (tela.width !== spr.w || tela.height !== spr.h) { tela.width = spr.w; tela.height = spr.h; }
        var c = tela.getContext('2d');
        c.clearRect(0, 0, spr.w, spr.h); c.drawImage(spr.canvas, 0, 0);
        tela.style.width = (spr.w * escala) + 'px'; tela.style.height = (spr.h * escala) + 'px';
        tela.style.transform = v[1] ? 'scaleX(-1)' : '';
        U.preencher(plaquinha, (nome.value.trim() || rascunho.nome).slice(0, NOME_MAX));
      }
      function girar() {
        // a tela saiu sem passar pelo Pronto nem pelo ✕ (UI.limpar): o relógio para sozinho
        if (!document.body.contains(tela)) { parar(); return; }
        passo++;
        if (passo % PASSOS_POR_VISTA === 0) volta = (volta + 1) % VOLTA.length;
        desenhar();
      }
      function parar() { if (relogio !== null) clearInterval(relogio); relogio = null; }

      // ---------- nome e sexo ----------
      var nome = el('input#campo-nome-jogador.campo-nome.criar-nome', { type: 'text', maxlength: NOME_MAX, value: rascunho.nome,
        autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Nome', placeholder: 'Seu nome' });
      nome.addEventListener('input', function () { U.preencher(plaquinha, (nome.value.trim() || rascunho.nome).slice(0, NOME_MAX)); });
      nome.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); var b = U.$('.criar-sexo-btn', pn.tela); if (b) b.focus(); } });
      var sexo = el('div.criar-sexo', { role: 'group', 'aria-label': 'Menina ou menino' });
      SEXOS.forEach(function (s) {
        var b = el('button.criar-sexo-btn', { type: 'button', 'aria-pressed': String(rascunho.sexo === s[0]) }, s[1]);
        b.addEventListener('click', function () { escolherSexo(s[0]); });
        sexo.appendChild(b);
      });
      function escolherSexo(s) {
        if (s === rascunho.sexo) return;
        var ap = aparencia();
        guardado[rascunho.sexo] = copiaVisual(ap);
        rascunho.sexo = s;
        if (guardado[s]) porVisual(ap, guardado[s]);
        else { var pad = PA.VISUAL_SEXO[s]; porVisual(ap, { corte: pad.corte, modelo: pad.modelo, semLaco: !pad.laco }); }
        Reino.Som.tocar('selecionar');
        U.$$('button', sexo).forEach(function (x, i) { x.setAttribute('aria-pressed', String(SEXOS[i][0] === s)); });
        montarOpcoes(); marcar(); desenhar();
      }

      // ---------- cores ----------
      function linhaCores(rotulo, campo, comSem) {
        var linha = el('div.linha-cores', { role: 'group', 'aria-label': rotulo }, el('span.rotulo-cor', rotulo));
        if (comSem) {
          var sem = el('button.bolinha-cor.bolinha-sem', { type: 'button', 'aria-label': 'Sem laço', 'data-sem': '1' });
          sem.addEventListener('click', function () { aparencia().semLaco = true; Reino.Som.tocar('selecionar'); marcar(); desenhar(); });
          linha.appendChild(sem);
        }
        PA.OPCOES_APARENCIA[campo].forEach(function (cor) {
          var b = el('button.bolinha-cor', { type: 'button', 'aria-label': rotulo + ' ' + cor, 'data-cor': cor, style: { background: cor } });
          b.addEventListener('click', function () {
            var ap = aparencia();
            ap[campo] = cor;
            // o laço volta ao escolher uma cor (sem gravar semLaco se ela já estava com laço: o save fica igual)
            if (comSem && !PA.visualMariana(prova()).laco) ap.semLaco = false;
            Reino.Som.tocar('selecionar'); marcar(); desenhar();
          });
          linha.appendChild(b);
        });
        linha._campo = campo;
        return linha;
      }
      var linhas = [linhaCores('Pele', 'pele'), linhaCores('Cabelo', 'cabelo')];
      var linhaRoupa = linhaCores('Cor da roupa', 'roupa'), linhaLaco = linhaCores('Laço', 'laco', true);
      linhas.push(linhaRoupa, linhaLaco);

      // ---------- corte e roupa ----------
      var grupoCorte = el('div.criar-opcoes', { role: 'group', 'aria-label': 'Corte de cabelo' });
      var grupoRoupa = el('div.criar-opcoes', { role: 'group', 'aria-label': 'Roupa' });
      function montarOpcoes() {
        [[grupoCorte, PA.CORTES, 'corte', 0, 11], [grupoRoupa, PA.MODELOS, 'modelo', 4, 99]].forEach(function (g) {
          g[0].innerHTML = '';
          ordenar(g[1], rascunho.sexo).forEach(function (o) {
            var ap = prova();
            ap[g[2]] = o.id;
            var b = el('button.criar-opcao', { type: 'button', 'data-id': o.id },
              el('span.criar-retrato', recorte(PA.mariana(ap, false, 0, { vista: 'frente' }), g[3], g[4], 3)),
              el('span.criar-opcao-nome', R.hifenizar(o.nome)));
            b.addEventListener('click', function () { aparencia()[g[2]] = o.id; Reino.Som.tocar('selecionar'); marcar(); desenhar(); });
            g[0].appendChild(b);
          });
        });
      }
      // os retratos mudam com as cores; o marcado segue a aparência (lida na hora)
      function marcar() {
        var ap = aparencia(), vis = PA.visualMariana(prova());
        linhas.forEach(function (l) {
          U.$$('button', l).forEach(function (b) {
            var sim = b.dataset.sem ? !vis.laco : (b.dataset.cor === ap[l._campo] && (l !== linhaLaco || vis.laco));
            b.setAttribute('aria-pressed', String(sim));
          });
        });
        [[grupoCorte, 'corte'], [grupoRoupa, 'modelo']].forEach(function (g) {
          U.$$('button', g[0]).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === vis[g[1]])); });
        });
      }
      function recolorir() { montarOpcoes(); marcar(); }
      linhas.forEach(function (l) { l.addEventListener('click', function (e) { if (e.target.closest('button')) recolorir(); }); });

      function rotulo(t, alvo) { return el('div.criar-grupo', el('span.rotulo-cor', t), alvo); }
      var campos = el('div.criar-campos',
        el('label.criar-linha-nome', el('span.rotulo-cor', 'Nome'), nome),
        rotulo('Sou', sexo),
        linhas[0], linhas[1],
        rotulo('Corte', grupoCorte),
        rotulo('Roupa', grupoRoupa),
        linhaRoupa, linhaLaco);
      pn.card.classList.add('painel-criar');
      var ok = el('button.btn-grande.btn-principal', { type: 'button' }, 'Pronto! ✨');
      // o Pronto vem depois dos campos (Tab), mas fica embaixo da vitrine a partir do tablet (css)
      pn.conteudo.appendChild(el('div.criar', el('div.criar-vitrine', palco, plaquinha), campos, el('div.intro-botoes.criar-botoes', ok)));
      ok.addEventListener('click', function () { UI.fecharTela(pn.tela); concluir(); });
      // Pronto e ✕ guardam o que foi escolhido (como o Salão): nome e sexo no perfil, aparência no save
      function concluir() {
        parar();
        var n = nome.value.replace(/\s+/g, ' ').trim().slice(0, NOME_MAX) || rascunho.nome;
        if (J && J.definirPerfil && (n !== perfil.nome || rascunho.sexo !== perfil.sexo)) {
          try { J.definirPerfil({ nome: n, sexo: rascunho.sexo }); } catch (e) { /* o perfil é de outra parte: a aparência grava igual */ }
        }
        P.salvar();
        resolver();
      }

      montarOpcoes(); marcar(); desenhar();
      if (animar()) relogio = setInterval(girar, PASSO_MS);
      // o escolhido à vista nas fileiras que rolam de lado
      setTimeout(function () {
        U.$$('.criar-opcao[aria-pressed="true"]', pn.tela).forEach(function (b) {
          var f = b.parentNode; f.scrollLeft = Math.max(0, b.offsetLeft - f.offsetLeft - 8);
        });
      }, 0);
    });
  };
})();
