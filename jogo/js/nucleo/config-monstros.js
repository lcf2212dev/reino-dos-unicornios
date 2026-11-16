/* Treinadores de Monstros (docs/contratos/monstros.md): os números da MonsterBall, da captura, do monstro que segue a
   Mariana e da ajuda dele na luta. Reino.config.monstros. Só dados (node: true), logo depois do config-vila.js. */
(function () {
  var R = window.Reino;
  R.config = R.config || {};
  R.config.monstros = {
    precoBola: 50,            // cada MonsterBall custa 50 estrelas na loja dos Treinadores (pedido)
    maxCarrinho: 10,          // quantas MonsterBalls cabem no carrinho de uma compra
    chanceCaptura: 0.4,       // chance de a MonsterBall pegar o monstro (pedido: 40%)
    precoMini: 25,            // cada Mini MonsterBall custa 25 estrelas (pedido do Leandro, 16/11)
    chanceMini: 0.2,          // chance de a Mini MonsterBall pegar o monstro (pedido: 20%)
    precoSuper: 125,          // cada Super MonsterBall custa 125 estrelas (pedido do Leandro, 16/11)
    chanceSuper: 1,           // chance de a Super MonsterBall pegar o monstro (pedido: 100%, pega sempre)
    // desconto nas bolas pelas salas feitas desta matéria (pedido do Leandro, 16/11: a Matemática do Dia a Dia): com
    // 5 salas, 10% mais baratas; com 16, 25%; com as 32, 50%. Vale a maior faixa alcançada; o preço arredonda (mínimo 1)
    desconto: { materia: 'matematica4', faixas: [{ salas: 5, desconto: 0.1 }, { salas: 16, desconto: 0.25 }, { salas: 32, desconto: 0.5 }] },
    alcanceBola: 56,          // distância (px) do monstro mais perto em que dá para jogar a bola
    recargaBolaMs: 1500,      // espera entre duas bolas jogadas
    bolaVooMs: 450,           // a bola voando até o monstro
    bolaBalancoMs: 1100,      // a bola balançando no chão antes do "Pegou!" ou do "Escapou!"
    distancia: 30,            // o monstro equipado anda atrás dela a esta distância (px), como o ET (viagem.companheiroDistancia)
    ajuda: {                  // o monstro equipado ataca os inimigos da arena junto com ela
      alcance: 72,            // distância (px) dela em que ele procura um inimigo para atacar
      recargaMs: 1400,        // espera entre dois ataques dele
      pulo: 22,               // até onde ele pula na direção do inimigo no ataque (px)
      // o dano dele = fração do dano da espada dela (mínimo 1), pelo tipo do monstro capturado
      fator: { facil: 0.3, medio: 0.4, dificil: 0.5, voador: 0.45, mosca: 0.45 },
      bonusNivel: 0.005,      // +0,5% de fração por nível recomendado da arena de onde ele veio (Lua, Nv 35: +17,5%)
    },
  };
})();
