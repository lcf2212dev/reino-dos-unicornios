/* Itens (docs/contratos/itens.md §13): as peças comuns das telas da Mochila e do Baú de Guardados e o cartão de um
   item. Cria o interno Reino._itensTelas (só ui/mochila.js e ui/guardados.js usam), que guarda:
     icone(chave, px)            canvas nítido do ícone (item:<id> ou o emoji da comida), 32 ou 64 px
     atributos(def)              ['Força +2', 'Rapidez +5%', …]
     espaco(grupo, aoTocar)      botão de um espaço ({ id, def, uids, qtd }): ícone, faixa da raridade, número da pilha
     espacoVazio()               o espaço livre da grade
     nomeVestido(slot)           o nome do que está no slot ('Vazio'; espada vazia: 'Espada do Bosque')
     cartao({ uid } | { slot })  → Promise: o cartão do item (painel estreito por cima), com os botões que valem
   Reino.Itens (sistemas/itens.js) grava e emite EVENTOS.ITENS; as telas se repintam por esse evento. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, R = Reino._ui;
  var NOMES = { dano: 'Força', defesa: 'Proteção', vida: 'Vida', velocidade: 'Rapidez', sorte: 'Sorte' };
  var SLOT_NOME = { espada: 'Espada', escudo: 'Escudo', cabeca: 'Cabeça', armadura: 'Armadura', calca: 'Calça', botas: 'Botas' };
  var TEXTOS = {
    pequena: 'Cura um pouco da vida.', grande: 'Enche toda a vida.', comida: 'Enche a barriga do unicórnio.',
    'fora-arena': 'Use a poção numa arena, quando a vida baixar.', 'vida-cheia': 'Sua vida já está cheia!',
    'sem-uni': 'Você ainda não tem um unicórnio.', cheia: 'Mochila cheia! Foi para o baú da casa.',
    bola: 'Jogue numa arena, perto de um monstro, para tentar pegar ele!',
    'bola-mini': 'A Mini MonsterBall é pequenina: às vezes pega o monstro. Jogue numa arena, perto de um monstro.',
    'bola-super': 'A Super MonsterBall pega o monstro sempre! Jogue numa arena, perto de um monstro.', 'bola-usar': 'Use na arena, perto de um monstro: toque no botão da bola.',
  };

  function It() { return Reino.Itens; }
  function icone(chave, px) {
    var c = PA.iconeEmoji(chave, 2), lado = c.width * PA.escalaNitida(px || 32, c.width);
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
  function rar(def) { return def && def.raridade ? '.rar-' + def.raridade : '.rar-comum'; }
  function espaco(g, aoTocar) {
    var rotulo = g.def.nome + (g.qtd > 1 ? ' (' + g.qtd + ')' : '');
    var b = el('button.itens-espaco' + rar(g.def), { type: 'button', 'aria-label': rotulo, title: rotulo, 'data-id': g.id, 'data-foco': g.id + ':' + g.uids[0] },
      icone(g.def.icone, 32), g.qtd > 1 ? el('span.itens-qtd', String(g.qtd)) : null);
    b.addEventListener('click', function () { aoTocar(g, b); });
    return b;
  }
  function espacoVazio() { return el('span.itens-espaco.itens-livre', { 'aria-hidden': 'true' }); }
  function temEspadaBosque() { return !!(Reino.Bosque && Reino.Bosque.temEspada && Reino.Bosque.temEspada()); }
  function nomeVestido(slot) {
    var v = It().vestido()[slot];
    if (v) return v.def.nome;
    return slot === 'espada' && temEspadaBosque() ? 'Espada do Bosque' : 'Vazio';
  }

  // o que o cartão mostra agora: a pilha da mochila que tem o uid, ou o vestido do slot (null: sumiu)
  function achar(alvo) {
    var I = It();
    if (alvo.slot) { var v = I.vestido()[alvo.slot]; return v ? { vestido: true, slot: alvo.slot, id: v.id, def: v.def, uids: [v.uid], qtd: 1 } : null; }
    var g = I.mochila().find(function (s) { return s.uids.indexOf(alvo.uid) >= 0; });
    return g ? { vestido: false, slot: g.def.slot || null, id: g.id, def: g.def, uids: g.uids, qtd: g.qtd } : null;
  }

  // "Jogar fora": pergunta antes (guarda de toque nos botões que apagam, ui.md §5) → 'um' | 'todas' | null
  function perguntarJogar(it) {
    var nao = { rotulo: 'Agora não', valor: null, seguro: true };
    if (it.qtd > 1) {
      return UI.escolher('Jogar fora ' + it.def.nome + '?', [
        { rotulo: 'Jogar fora 1', valor: 'um', gasta: true }, { rotulo: 'Jogar fora todas', valor: 'todas', gasta: true }, nao]);
    }
    return UI.escolher('Jogar fora ' + it.def.nome + '?', [{ rotulo: 'Jogar fora', valor: 'um', gasta: true }, nao]);
  }

  /** o cartão de um item da mochila ({ uid }) ou do que está vestido ({ slot }). @returns {Promise<void>} */
  function cartao(alvo) {
    var it = achar(alvo);
    if (!it) return Promise.resolve();
    return new Promise(function (resolver) {
      var d = it.def;
      var pn = UI.painel('mochila-item', d.nome, { estreito: true, icone: d.icone, aoFechar: function () { resolver(); } });
      var msg = el('p.mitem-msg', { hidden: true });
      var info = el('div.mitem-info',
        el('span.mitem-moldura' + rar(d), icone(d.icone, 64)),
        el('div.mitem-texto',
          d.raridade ? el('b.mitem-raridade' + rar(d), Reino.ItensCatalogo.NOMES_RARIDADE[d.raridade]) : null,
          el('ul.mitem-atributos', atributos(d).map(function (t) { return el('li', t); })),
          d.tipo === 'pocao' ? el('p', TEXTOS[d.cura === 'grande' ? 'grande' : 'pequena']) : null,
          d.tipo === 'comida' ? el('p', TEXTOS.comida) : null,
          d.tipo === 'bola' ? el('p', TEXTOS[d.id] || TEXTOS.bola) : null,
          it.qtd > 1 ? el('p.mitem-qtd', 'Você tem ' + it.qtd + '.') : null,
          it.vestido ? el('p.mitem-agora', 'Vestido agora.') : null,
          !it.vestido && d.slot ? el('p.mitem-agora', 'Agora: ', U.colado(nomeVestido(d.slot))) : null));
      var botoes = el('footer.rodape-acao.mitem-botoes');
      function botao(rotulo, principal, fn, chave) {
        var b = el('button.btn-grande' + (principal ? '.btn-principal' : '.btn-secundario'), { type: 'button', 'data-acao': chave }, rotulo);
        b.addEventListener('click', function () { fn(b); });
        if (principal) botoes.appendChild(b); else botoes.insertBefore(b, botoes.firstChild);   // o principal à direita (arte.md §20)
      }
      function fechar() { if (pn.tela.isConnected) UI.fecharTela(pn.tela); resolver(); }
      function aviso(t) { msg.textContent = t; msg.hidden = false; Reino.Som.tocar('erro'); }
      if (it.vestido) botao('Tirar', true, function () {
        var r = It().tirar(it.slot);
        Reino.Som.tocar('selecionar');
        if (r.ok && r.onde === 'bau') UI.avisoItem({ icone: d.icone, texto: TEXTOS.cheia, raridade: d.raridade });
        fechar();
      }, 'tirar');
      else if (d.slot) botao('Vestir', true, function () { if (It().vestir(it.uids[0])) Reino.Som.tocar('selecionar'); fechar(); }, 'vestir');
      else if (d.tipo === 'pocao') botao('Usar', true, function () {
        var r = It().usar(it.uids[0]);
        if (r.ok) { Reino.Som.tocar('selecionar'); fechar(); } else aviso(TEXTOS[r.motivo] || TEXTOS['fora-arena']);
      }, 'usar');
      else if (d.tipo === 'bola') botao('Usar', true, function () { aviso(TEXTOS['bola-usar']); }, 'usar');   // quem joga é o botão da arena
      else if (d.tipo === 'comida') botao('Dar ao unicórnio', true, function () {
        var r = It().usar(it.uids[0]), uni = Reino.Progresso.montaria();
        if (r.ok) { Reino.Som.tocar('nhac'); fechar(); R.falarCuidado('comeu', uni); }
        else if (r.motivo === 'cheio') R.falarCuidado('cheio', uni);
        else aviso(TEXTOS['sem-uni']);
      }, 'dar');
      botao('Jogar fora', false, function () {
        perguntarJogar(it).then(function (v) {
          if (!v) return;
          var agora = achar(alvo);   // relê: a nuvem pode ter mexido com a pergunta aberta
          if (!agora) { fechar(); return; }
          It().jogarFora(v === 'todas' ? agora.uids : agora.uids[agora.uids.length - 1]);
          Reino.Som.tocar('toque');
          fechar();
        });
      }, 'jogar');
      pn.tela.classList.add('tela-mochila-item');
      pn.conteudo.appendChild(info);
      pn.conteudo.appendChild(msg);
      pn.card.appendChild(botoes);
    });
  }

  Reino._itensTelas = { icone: icone, atributos: atributos, espaco: espaco, espacoVazio: espacoVazio, nomeVestido: nomeVestido,
    cartao: cartao, SLOT_NOME: SLOT_NOME, temEspadaBosque: temEspadaBosque };
})();
