/nova-feature

# 1. Nome
tempo-celular

# 2. Tipo
[x] Mecânica nova

# 3. O que eu quero
A Mariana tem 30 minutos de celular por dia. Cada sala concluída dá mais 5 minutos de tempo de celular,
independente do tempo gasto na sala. Sem teto: quanto mais salas, mais tempo. Ela usa o tempo como quiser.

# 4. Por que
Um prêmio concreto e imediato por cada sala: dá vontade de fazer a próxima.

# 5. Como a Mariana usa
1. No fim de uma sala feita pela 1ª vez, na lista de prêmios: "⏳ +5 minutos de celular!".
2. No Baú do Tesouro (o 🪙 do HUD ou o menu Lugares), o quadro "⏳ Tempo de celular": quanto tem guardado.
3. Toca em "Usar tempo", escolhe quantos minutos (de 5 em 5, até o que tem) e confirma.
4. Aparece a tela para mostrar aos pais: "Mariana vai usar N minutos de celular!"; o saldo desce.
   A Área dos Pais mostra o ganho, o usado, o que sobra e os últimos usos.

# 6. Onde fica
Baú do Tesouro (ui/bau.js) e a tela de fim de sala. Como acha: o prêmio no fim da sala aponta para o Baú.

# 9. Prêmios
5 minutos por sala feita pela 1ª vez (acertando ou não: já é caminho por persistência; nada premia pressa).

# 10. Números (jogo/js/nucleo/config.js, `tempoCelular`)
- minutosPorSala: 5
- desde: '2026-11-01' (salas feitas antes não contam; decidido pelo Claude)
- passo: 5 (de quantos em quantos minutos ela escolhe)

# 11. O que NÃO pode mudar
Moedas, cartões, móveis e o save de hoje. O tempo ganho é DERIVADO das salas feitas; só os usos ficam no save
(campo novo `tempoUsos`, por `registrarCampo`).

# 12. Aparelhos
celular, tablet, notebook. Sem recurso do aparelho: o jogo não controla o celular, só conta o tempo.

# 13. Pronto quando
- [ ] Sala nova feita (desde 01/11) mostra "+5 minutos de celular" no fim; refazer a sala não dá de novo.
- [ ] O Baú mostra o tempo guardado e deixa usar de 5 em 5, com confirmação; o saldo nunca fica negativo.
- [ ] Dois aparelhos usando tempo ao mesmo tempo: os dois usos ficam (nada some na mescla).
- [ ] A Área dos Pais mostra ganho, usado e o que sobra.

# 14. Decisões (decidido pelo Claude)
- Contam as salas feitas pela 1ª vez a partir de 01/11/2026 (o dia do pedido), de qualquer matéria; prova não é sala.
- Sem teto e sem prazo: o tempo fica guardado até ela usar.
- Ela mesma usa, sem PIN (o pedido diz "utiliza como quiser"), com uma tela de confirmação contra toque sem querer.
- Novo ciclo zera os usos junto com as salas (como as moedas e o `pago`); "Apagar tudo" zera tudo.
- Ícone ⏳ (já desenhado). Sem fala nova (sem voz nova).
