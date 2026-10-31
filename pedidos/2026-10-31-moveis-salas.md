/nova-feature

# 1. Nome
moveis-salas

# 2. Tipo
[x] Mecânica nova   [x] Enfeite ou prêmio   [x] Ajuste de algo que já existe (casa)

# 3. O que eu quero
Os kits por matéria completa continuam iguais. Além deles, a cada SALA completada (das matérias do 4º bimestre em
diante: Língua Portuguesa e Inglês) aparece uma tela com 5 móveis sorteados para a casa e o jogador escolhe 1.
Móveis novos, divididos entre os cômodos. Quem já tem salas feitas escolhe ao entrar no Reino, uma tela por sala,
uma vez só.

# 4. Por que
Cada sala vira um presente visível na casa: dá vontade de fazer a próxima.

# 5. Como a Mariana usa
1. Ao entrar no Reino (depois do baú da casa) ou no fim de uma sala nova: tela "Escolha um móvel!" com o nome da sala.
2. Toca num dos 5 cartões (desenho do móvel, nome e o cômodo onde combina).
3. Festa, "Móvel novo na sua casa!"; vem a próxima sala que ainda falta, até acabar.
4. O móvel aparece no modo decorar, na aba do cômodo dele, para pôr onde quiser.

# 6. Onde fica
Telas por cima do mapa; os móveis na Minha Casa (modo decorar). Como acha: aparece sozinha.

# 9. Prêmios
1 móvel por sala feita pela primeira vez (já é caminho por persistência: sala feita conta, com ou sem erro).

# 10. Números
config.casa.moveisOpcoes = 5 (quantos móveis a tela sorteia).

# 11. O que NÃO pode mudar
Kits por matéria; save antigo (sem o campo novo) abre igual e ganha as escolhas pendentes; nada some.

## Decidido pelo Claude
- Língua Portuguesa do 4º bimestre tem 25 salas (não 20) e Inglês 13: são 38 salas, então 38 móveis novos (um por
  sala, para todas poderem dar um móvel diferente).
- Contam as salas das matérias que dão kit (bimestre >= config.casa.desdeBimestre); as do 3º, arquivadas, não.
- Os 5 sorteados são fixos por sala (sorteio com semente da sala e do dia em que a casa chegou): fechar e abrir
  mostra os mesmos 5. Os que ela ainda não tem vêm primeiro; quando faltam menos de 5 novos, completa com repetidos
  (ganha mais um igual).
- Botão "Depois": a sala fica pendente e volta no próximo login, no fim da próxima sala ou na caixa de mudança.
- Só depois de ganhar a casa (baú aberto).
- No modo decorar as abas passam a ser por cômodo: a aba do kit traz também os móveis das salas daquele cômodo.
