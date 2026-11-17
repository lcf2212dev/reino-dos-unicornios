/* Letra cursiva (docs/contratos/cursiva.md): os números da escrita cursiva na loja da Treinadora Kiara.
   Reino.config.cursiva. Só dados (node: true), logo depois do config-monstros.js. */
(function () {
  var R = window.Reino;
  R.config = R.config || {};
  R.config.cursiva = {
    frasesPorBola: 2,       // quantas frases ela escreve para ganhar 1 bola (pedido do Leandro, 17/11: 2 frases)
    bola: 'bola-monster',   // a bola que ganha: a MonsterBall, 40% de chance (pedido)
    inclinacao: 0.15,       // quanto a letra deita para a direita (0 = em pé)
    tolerancia: 0.3,        // até onde o dedo pode sair do caminho e ainda pintar (em x-altura: 1 = altura do "a");
                            // longe 2,2 × isto da ponta, solta. Não é o que deixa fácil ou difícil: quem decide é o
                            // dedo estar no pedaço certo e no sentido certo (sistemas/cursiva.js). Mais de 0,4: o
                            // dedo do lado errado de uma laçada fina não solta, e girar o e ao contrário fica mais fácil
    toleranciaPx: 14,       // ... e nunca menos que isto em px da tela (letra pequena no celular, dedo grosso)
    toleranciaMax: 0.38,    // ... nem mais que isto (acima, rabiscar sobe-e-desce por cima da palavra já pinta)
    pegar: 0.5,             // quão perto da bolinha verde o dedo encosta para começar (em x-altura)
    pegarPx: 22,            // ... e nunca menos que isto em px da tela
    contra: 0.35,           // quanto o dedo anda sem pintar até a setinha ficar vermelha ("Por aí não!"), em x-altura
    passadaPx: 6,           // o dedo só conta depois de andar isto em px da tela (o toque treme ~1 px: com menos, girar o
                            // e ao contrário bem devagar acaba pintando nas palavras compridas do celular)
    espaco: 0.9,            // o espaço entre as palavras da frase (em x-altura)
    xAlturaMax: 40,         // a letra maior que a tela de escrever desenha (x-altura em px de arte; 1 px de arte = 2 px)
    esperaPalavraMs: 700,   // a palavra pronta fica na tela antes de passar para a próxima
  };
})();
