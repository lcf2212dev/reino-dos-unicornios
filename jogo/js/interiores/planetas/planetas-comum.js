/* Planetas (viagem de foguete), o que todos dividem: o céu aberto em volta (fundo 'espaco'), o chão e o horizonte
   de cada planeta. Os planetas são interiores do Observatório (lugar 'observatorio', sem entrada), alcançados só
   pelo foguete do Hangar (ação `viagem`; docs/contratos/viagem.md).
   CONTRATO (onda 0): desenho provisório; a frente do cenário da Lua o refaz.
   No carregamento só registra funções: nada de DOM, canvas nem PA aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret;

  // céu preto com estrelas fixas (sorteio com semente: sai sempre igual)
  I.FUNDOS.espaco = { cor: '#0b0820', desenhar: function (ctx, w, h) {
    var rng = R.Desenho.rng(7);
    for (var i = 0; i < (w * h) / 900; i++) ret(ctx, Math.floor(rng() * w), Math.floor(rng() * h), 1, 1, rng() < 0.2 ? '#fff3a0' : '#ffffff');
  } };

  // chão da Lua: rocha cinza clara
  I.PISOS['lua-rocha'] = { cores: { piso: '#c9c9d6', piso2: '#b8b8c8', detalhe: '#9d9db2' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, (tx + ty) % 2 ? p.piso : p.piso2);
      if ((tx * 7 + ty * 3) % 5 === 0) ret(ctx, px + 5, py + 6, 3, 2, p.detalhe);
    } };
  // horizonte: o céu (as 2 fileiras de "parede" do cômodo)
  I.PAREDES['planeta-horizonte'] = { cores: { parede: '#0b0820', parede2: '#1a1440', rodape: '#9d9db2', detalhe: '#ffffff' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      ret(ctx, px, py + 28, 16, 4, p.rodape);
      if (tx % 3 === 0) ret(ctx, px + 7, py + 9, 1, 1, p.detalhe);
    } };
})();
