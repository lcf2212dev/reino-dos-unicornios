/* Parquinho: a tela do que falta (docs/contratos/parquinho.md). Só lê o progresso (Reino.Parquinho).
   UI.telaParquinho('portal')   o portal da praça ainda dormindo (pisou ou tocou nele): falta a fase 1
   UI.telaParquinho('presente') um presente do parque (brinquedo da fase 2): falta completar todas as matérias
   Texto só na tela (sem voz); a lista mostra as matérias que contam, com ✓ nas completas e ⭐ em Matemática e
   Língua Portuguesa (uma delas precisa estar entre as completas para o portal acordar). */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;

  UI.telaParquinho = function (tipo) {
    var Pq = Reino.Parquinho, f = Pq.falta(), portal = tipo !== 'presente';
    var pn = UI.painel('parquinho', portal ? '🌀 Portal do Parquinho' : '🎁 Surpresa no Parquinho', { estreito: true, curto: portal ? '🌀 Portal' : '🎁 Surpresa' });
    var c = pn.conteudo, frases;
    if (portal && f.fase >= 1) frases = [el('p.parquinho-titulo', 'O portal está acordado! ✨'), el('p', 'Entre nele para ir ao Parquinho.')];
    else if (portal) {
      frases = [el('p.parquinho-titulo', 'O portal está dormindo. 💤'),
        el('p', U.colado('Ele acorda quando você completar ' + f.precisa + ' matérias.')),
        el('p', 'Uma delas precisa ser Matemática ou Língua Portuguesa\u00a0⭐'),
        el('p.parquinho-conta', U.colado('Matérias completas: ' + Math.min(f.completas, f.precisa) + ' de ' + f.precisa))];
      if (f.completas >= f.precisa && !f.chave) frases.push(el('p.parquinho-conta', 'Agora só falta uma\u00a0⭐'));
    } else {
      frases = [el('p.parquinho-titulo', 'Brinquedos novos embrulhados! 🎁'),
        el('p', 'Eles abrem quando você completar todas as matérias.'),
        el('p.parquinho-conta', U.colado('Matérias completas: ' + f.completas + ' de ' + f.total))];
    }
    c.appendChild(el('div.parquinho-frases', frases));
    var feitas = Pq.completas().map(function (m) { return m.id; });
    var lista = el('ul.parquinho-lista');
    Pq.contam().forEach(function (m) {
      var pronta = feitas.indexOf(m.id) >= 0;
      lista.appendChild(el('li.parquinho-materia' + (pronta ? '.completa' : ''),
        el('span', (m.emoji ? m.emoji + ' ' : '') + m.nome + (portal && Pq.ehChave(m) ? '\u00a0⭐' : '')),
        el('span.parquinho-marca', pronta ? '✓' : 'falta')));
    });
    c.appendChild(lista);
    return pn;
  };
})();
