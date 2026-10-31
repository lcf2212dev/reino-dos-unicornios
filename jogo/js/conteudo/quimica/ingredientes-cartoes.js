/* Laboratório de Química: produtos que só chegam com um cartão de experiência (cartao: true; docs/contratos/quimica.md §3).
   Mesmo formato de ingredientes.js; ficam presos no baú até o cartão que os usa pela 1ª vez (receitas-cartoes.js).
   Fontes: https://www.rsc.org/learn-chemistry e https://periodic-table.rsc.org/ (Mg, Ar, Ne). */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.ingredientes.push(
    { id: 'curcuma', nome: 'Cúrcuma', cor: '#f2b705', tipo: 'po', cartao: true, fala: 'A cúrcuma é bem amarela.' },
    { id: 'casca-ovo', nome: 'Casca de ovo', cor: '#fbf3e4', tipo: 'po', grupo: 'reagentes', cartao: true,
      formula: 'CaCO₃', forma: 'Pó moído', fala: 'A casca de ovo tem calcário.' },
    { id: 'batata', nome: 'Suco de batata', cor: '#efe3b8', tipo: 'liquido', cartao: true, fala: 'A batata tem enzimas.' },
    { id: 'mel', nome: 'Mel', cor: '#e0a030', tipo: 'liquido', cartao: true, fala: 'O mel é grosso e doce.' },
    { id: 'sabao', nome: 'Sabão', cor: '#bfe8ff', tipo: 'liquido', cartao: true, fala: 'O sabão abraça a gordura.' },
    { id: 'vitamina-c', nome: 'Vitamina C', cor: '#fff1c2', tipo: 'po', grupo: 'reagentes', cartao: true,
      formula: 'C₆H₈O₆', forma: 'Pó', fala: 'A vitamina C é um ácido.' },
    { id: 'cha', nome: 'Chá preto', cor: '#9a5a2a', tipo: 'liquido', cartao: true, fala: 'Um chá preto bem fraquinho.' },
    { id: 'beterraba', nome: 'Suco de beterraba', cor: '#b0174f', tipo: 'liquido', cartao: true, fala: 'A beterraba pinta de vermelho.' },
    { id: 'magnesio', nome: 'Magnésio', cor: '#d9dde3', tipo: 'po', grupo: 'elementos', cartao: true,
      formula: 'Mg', forma: 'Fita de metal', fala: 'O magnésio é um metal leve.' },
    { id: 'alcool', nome: 'Álcool', cor: '#f2f8ff', tipo: 'liquido', grupo: 'reagentes', cartao: true,
      formula: 'C₂H₅OH', forma: 'Líquido', fala: 'O álcool é mais leve.' },
    { id: 'tinta', nome: 'Tinta de caneta', cor: '#2b2b44', tipo: 'liquido', cartao: true, fala: 'Tinta preta de canetinha.' },
    { id: 'argonio', nome: 'Argônio', cor: '#9fd0c8', tipo: 'gas', grupo: 'gases', cartao: true,
      formula: 'Ar', forma: 'Gás', fala: 'O argônio é um gás nobre.' },
    { id: 'neonio', nome: 'Neônio', cor: '#ff7b6b', tipo: 'gas', grupo: 'gases', cartao: true,
      formula: 'Ne', forma: 'Gás', fala: 'O neônio brilha nas placas.' }
  );
})();
