/* Vila Arco-Íris: a faixa "Peças épicas" no alto da aba Comprar das lojas de peças (docs/contratos/cursiva.md §6).
   As peças `cursiva: true` da loja (Reino.VilaLojas.conquistas; conteudo/itens/pluma.js) não têm preço nem entram no
   carrinho: cada cartão traz o desenho, o nome, "Épico", os atributos e o botão "✏ Escrever N frases"
   (config.cursiva.frasesPorPeca), que sorteia as frases (Cursiva.sortearFrases), abre UI.telaCursiva e, com todas
   prontas, dá a peça (VilaLojas.conquistar), sem gastar estrela. Quem já tem a peça vê o cartão dela encolhido, com
   "Você já tem! ✨" no lugar do botão. Fechou no meio: as frases e o ponto onde parou ficam guardados, por peça (até
   recarregar o jogo), e o botão vira "✏ Continuar a escrever". O botão não se desliga com a tela de escrever aberta
   (quem impede abrir duas é `ocupado`): assim o Esc devolve o foco do teclado a ele.
   Cria o interno Reino._vilaEpicas (só ui/vila-loja.js usa):
     faixa(lojaId, { tela, recado }) → { el, repintar() } | null (loja sem peça épica ou jogo sem a letra cursiva)
   Só texto na tela (sem voz nova). Estilos: css/ui-vila.css. */
(function () {
  var R = window.Reino, U = R.util, el = U.el, UI = R.UI;
  var NOMES = { dano: 'Força', defesa: 'Proteção', vida: 'Vida', velocidade: 'Rapidez', sorte: 'Sorte' };
  var escritas = {};   // { <id da peça>: { frases, estado } } das frases começadas e não terminadas (só na memória)

  function icone(chave, px) {
    var c = PA.iconeEmoji(chave, 2), lado = c.width * PA.escalaNitida(px, c.width);
    c.classList.add('pixel');
    c.style.width = lado + 'px';
    c.style.height = (c.height * lado / c.width) + 'px';
    c.setAttribute('aria-hidden', 'true');
    return c;
  }
  function atributos(def) {
    var b = (def && def.bonus) || {};
    return Object.keys(NOMES).filter(function (k) { return b[k]; }).map(function (k) {
      var pct = k === 'velocidade' || k === 'sorte';
      return NOMES[k] + ' +' + (pct ? Math.round(b[k] * 100) + '%' : b[k]);
    });
  }
  // "a Espada da Pluma", "o Elmo da Pluma", "as Botas da Pluma" (plural: "Estão na sua mochila.")
  function comArtigo(def) { return (def.artigo ? def.artigo + ' ' : '') + def.nome; }
  function plural(def) { return def.artigo === 'as' || def.artigo === 'os'; }
  function frases(n) { return n === 1 ? '1 frase' : n + ' frases'; }

  function faixa(lojaId, op) {
    var V = R.VilaLojas, C = R.Cursiva;
    if (!V || !V.conquistas || !UI.telaCursiva || !C || !C.frases().length) return null;
    var pecas = V.conquistas(lojaId), n = V.frasesPorPeca(), cartoes = {}, ocupado = false;
    if (!pecas.length) return null;

    function escrever(d) {
      if (ocupado) return;
      R.Som.tocar('toque');
      if (!escritas[d.id]) escritas[d.id] = { frases: C.sortearFrases(n), estado: {} };
      var esta = escritas[d.id];
      ocupado = true;
      UI.telaCursiva({ frases: esta.frases, estado: esta.estado, titulo: 'Letra cursiva', premio: 'Pegar ' + comArtigo(d) }).then(function (ok) {
        ocupado = false;
        if (!ok) { repintar(); return; }
        var r = V.conquistar(lojaId, d.id);
        // deu a peça (ou ela já tinha uma: 'ja-tem'): as frases se gastam; outro erro: as frases prontas continuam guardadas
        if ((r.ok || r.motivo === 'ja-tem') && escritas[d.id] === esta) delete escritas[d.id];
        if (!op.tela.isConnected) return;
        if (!r.ok) {
          R.Som.tocar('erro');
          op.recado(r.motivo === 'ja-tem' ? 'Você já tem ' + comArtigo(d) + '! ✨' : 'Ops! Algo mudou. Tente de novo.');
          repintar();
          return;
        }
        R.Som.tocar('estrela');
        op.recado('Você conquistou ' + comArtigo(d) + '! ✨ ' + (r.onde === 'bau'
          ? 'A mochila encheu: ' + (plural(d) ? 'foram' : 'foi') + ' para o baú.'
          : (plural(d) ? 'Estão' : 'Está') + ' na sua mochila.'));
        if (UI.atualizarHUD) UI.atualizarHUD();
        repintar();
        // conquista: nível 1, sem confete (a festa das frases já foi na tela de escrever), o brilho no cartão (arte.md §16)
        UI.festa(1, { som: false, item: cartoes[d.id].cartao });
        // o botão dela sumiu: pelo teclado, o foco vai para a próxima peça (ou para o ✕ da loja), não para o nada
        if (UI.porTeclado && UI.porTeclado()) {
          var prox = caixa.querySelector('.vila-epica-escrever:not([hidden])') || op.tela.querySelector('.btn-fechar');
          if (prox) prox.focus();
        }
      });
    }

    var lista = el('div.vila-epicas-lista', pecas.map(function (o) {
      var d = o.def;
      var botao = el('button.btn-secundario.vila-epica-escrever', { type: 'button', 'data-foco': 'epica:' + d.id });
      var tem = el('span.vila-epica-tem', { hidden: true }, 'Você já tem! ✨');
      botao.addEventListener('click', function () { escrever(d); });
      var acao = el('div.vila-epica-acao', botao);
      var cartao = el('div.vila-cartao.vila-epica.rar-epico', { 'data-id': d.id },
        el('span.vila-cartao-desenho', icone(d.icone || 'item:' + d.id, 48)),
        el('div.vila-epica-texto',
          el('b.vila-cartao-nome', U.colado(d.nome)),
          el('span.vila-cartao-rar', R.ItensCatalogo.NOMES_RARIDADE[d.raridade] || ''),
          el('span.vila-cartao-atrib', atributos(d).map(function (t) { return el('span', t); })),
          tem),
        acao);
      cartoes[d.id] = { cartao: cartao, botao: botao, acao: acao, tem: tem };
      return cartao;
    }));
    var caixa = el('section.vila-epicas', { 'aria-label': 'Peças épicas' },
      el('h3.vila-epicas-titulo', '✏ Peças épicas'),
      el('p.vila-epicas-dica', 'Não se compram: conquiste escrevendo ' + frases(n) + ' em letra cursiva!'),
      lista);

    function repintar() {
      V.conquistas(lojaId).forEach(function (o) {
        var c = cartoes[o.id];
        if (!c) return;
        c.tem.hidden = !o.tem;
        c.botao.hidden = c.acao.hidden = o.tem;
        c.cartao.classList.toggle('vila-epica-ganha', o.tem);
        U.preencher(c.botao, escritas[o.id] ? '✏ Continuar a escrever' : '✏ Escrever ' + frases(n));
      });
    }
    repintar();
    return { el: caixa, repintar: repintar };
  }

  R._vilaEpicas = { faixa: faixa };
})();
