# Moedas, cofre da praça e cartões de experiência

Pedido do Leandro (31/10/2026), em texto livre:

> Vamos trocar o sistema de recompensas do jogo. Em vez de Robux, será Moedas. Cada matéria completa dará 50 moedas.
> Faça a conversão do que a Mariana já tem em Robux, para moedas. 20 robux = 2 moedas.
> Coloque um cofre na praça central, tipo um pote, que vai se enchendo conforme as moedas que ela ganha. O pote ficará
> cheio quando ela completar todas as matérias, que será 300 moedas (50 de cada matéria). O pote tem que ter destaque,
> ser brilhante.
> A cada sala completada, de qualquer matéria, além de ganhar um item se não errar nada, também ganhará um novo cartão
> de uma nova experiência para fazer no laboratório.
> Ao completar a sala, faça um barulho de moeda caindo, tipo um plim, e uma animação das moedinhas sendo colocadas onde
> ficava os Robux, que serão moedas agora. E também uma tela com um baú para abrir, com o card novo de experiência. Se a
> experiência contiver um produto químico que ainda não existe no laboratório, ele também sairá do baú.

## 1. Moedas no lugar dos Robux
- `config.valorPorMateria` 500 → 50; cada sala vale `floor(50 / salas)` moedas e a sobra é bônus (5 salas: 10; 6: 8 + 2;
  13: 3 + 11; 25: 2). Conversão: o dinheiro é derivado das salas feitas, então o que ela já tem vira exatamente
  Robux ÷ 10 (20 Robux = 2 moedas), sem mexer no save (decidido pelo Claude).
- Pagamentos dos pais: o save continua em reais; a tela fala em moedas (R$ 1 = 2,5 moedas; R$ 20 = 50). A medalha da
  escola: 2.500 Robux → 250 moedas.
- Símbolo: 🪙 (o ícone de moeda que já existe) no HUD, nos chips e nas telas.

## 2. Cofre da praça
- Pote de vidro dourado e brilhante na praça central, no lugar do canteiro de baixo à esquerda (22, 24, 3×3), à vista
  de onde ela aparece. Enche com as moedas do bimestre ativo (`P.dinheiroBimestre`), cheio em 300
  (`config.cofre.cheio`: 6 matérias × 50) (decidido pelo Claude: o 3º bimestre já arquivado não conta, senão o pote
  começaria cheio).
- Como ela acha: está na praça, ao lado de onde o jogo começa; tocar nele abre a tela do cofre.

## 3. Cartões de experiência do Laboratório
- Cada sala feita pela 1ª vez (desde 05/10/2026, começo do 4º bimestre; `config.cartoes.desde`) dá o próximo cartão:
  uma receita NOVA da bancada da Química, que fica escrita no caderno ("Experimente!"). Derivado das salas feitas
  (sem campo novo no save) (decidido pelo Claude). As salas do 4º bimestre já feitas dão os cartões delas na hora.
- Receita de cartão com produto químico novo: o produto só aparece na bancada depois do cartão, e sai do baú junto.
- Quando os cartões acabarem, a sala não mostra baú (dá para acrescentar mais receitas só com dados).

## 4. Fim da sala
- "Plim" de moeda, moedinhas voando para o 🪙 do HUD (o número sobe moeda a moeda), depois o baú para abrir com o
  cartão novo (e os produtos novos). Sem Animações: os mesmos passos, parados.
