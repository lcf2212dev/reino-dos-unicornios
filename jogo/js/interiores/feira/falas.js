/* Falas da Feira: dados.js vem antes. Extras guardam o texto exato narrado na UI,
   sempre com a narradora existente. Nenhum personagem ou perfil novo. */
(function () {
  var R = window.Reino;
  var extras = [];
  var vistos = {};
  function adicionar(texto) {
    if (!texto || vistos[texto]) return;
    vistos[texto] = true;
    extras.push({ texto: texto, voz: 'narradora' });
  }
  var objetos = {
    boasvindas: ['Chegou a Feira de Ciências!', 'Vamos brincar de descobrir!', 'Aqui usamos peças e desenhos.'],
    passaporte: ['Guarde aqui suas descobertas!', 'Vale brincar de novo.', 'O passaporte dura esta visita.'],
    jardim: ['O jardim está esperando!', 'Vamos cuidar de cada detalhe.'],
    teia: ['Tudo se encontra na natureza.', 'Vamos acompanhar essas cenas.'],
    parcerias: ['Cada encontro conta algo.', 'Vamos seguir suas pistas!'],
    habitats: ['Há muitos jeitos de viver.', 'Vamos visitar os ambientes!'],
    observatorio: ['Olhe com calma e descubra!', 'Desenhe o que você observou.'],
  };
  Object.keys(objetos).forEach(function (id) { objetos[id].forEach(adicionar); });
  R.FeiraCiencias.salas.forEach(function (sala) {
    adicionar(sala.chamada);
    sala.missoes.forEach(function (missao) {
      ['convite', 'dica', 'descoberta'].forEach(function (campo) { missao[campo].forEach(adicionar); });
    });
  });
  R.falasDoPredio('feira', { objetos: objetos, extras: extras });
})();
