/* Ícones do jogo em pixel art 16x16, desenhados à mão.
   Cada um: n = nome, p = paleta {letra: cor}, d = 16 linhas de 16 letras ('.' = transparente).
   O contorno já faz parte do desenho. Emoji sem desenho aqui vira pixel automaticamente (pixelart-icones.js).
   Este arquivo só cria window.ICONES; os desenhos estão nos lotes por tema (js/arte/icones/<lote>.js),
   que se somam a ele na ordem do manifesto (a ordem das chaves é a de sempre: a prévia lista nela).
   Ícone novo: no lote do tema (ou no fim do último), no formato dos outros; ou, de uma feature na própria
   pasta (ex.: o 🥐 da Padaria), Reino.registrarIcones({ '🥐': { n, p, d } }) — sem editar os lotes.
   Contrato: docs/contratos/README.md §2.5. */
window.ICONES = {};
window.Reino = window.Reino || {};

// o que está errado no formato de um ícone ([] = certo); o validar-conteudo usa o mesmo nos acessórios
/** @param {any} ic @returns {string[]} */
Reino.conferirIcone = function (ic) {
  if (!ic || typeof ic !== 'object') return ['não é um desenho { n, p, d }'];
  var erros = [];
  if (typeof ic.n !== 'string' || !ic.n.trim()) erros.push('sem nome (n)');
  if (!ic.p || typeof ic.p !== 'object') erros.push('sem paleta (p)');
  var d = ic.d;
  if (!Array.isArray(d) || d.length !== 16) { erros.push('linhas faltando (precisa de 16)'); return erros; }
  if (!d.every(function (l) { return typeof l === 'string' && l.length === 16; })) erros.push('linhas de tamanhos diferentes (todas com 16)');
  var falta = [];
  d.join('').split('').forEach(function (c) { if (c !== '.' && !(ic.p && ic.p[c]) && falta.indexOf(c) < 0) falta.push(c); });
  if (falta.length) erros.push('letras sem cor na paleta: ' + falta.join(' '));
  return erros;
};

// desenhos de uma feature, na pasta dela: { '<emoji ou chave>': { n, p, d } }. A chave vai sem o ️
// (como o jogo procura). Chave que já existe ou desenho torto: erro na hora (o jogo não sobe calado)
/** @param {{ [chave: string]: any }} desenhos */
Reino.registrarIcones = function (desenhos) {
  Object.keys(desenhos || {}).forEach(function (k) {
    var chave = k.replace(/️/g, '');
    if (window.ICONES[chave]) throw new Error('registrarIcones: o ícone "' + chave + '" já existe (em js/arte/icones/ ou registrado antes)');
    var erros = Reino.conferirIcone(desenhos[k]);
    if (erros.length) throw new Error('registrarIcones: ícone "' + chave + '": ' + erros.join('; '));
    window.ICONES[chave] = desenhos[k];
  });
};
