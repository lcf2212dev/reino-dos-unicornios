# 1. Nome
bosque: pergunta a cada 10, nível a cada 30, baú de item da casa e mosca

# 2. Tipo
[x] Ajuste de mecânica existente (Bosque dos Fantasmas)
[x] Inimigo novo (mosca feia)
[x] Prêmio (móvel da casa) em tela de baú

# 3. O que eu quero
1. A pergunta do Bosque só aparece depois de matar 10 inimigos (e de novo a cada 10).
2. Para subir de nível, matar 30 inimigos.
3. Ao subir de nível, continuar ganhando um acessório novo para a casa.
4. Depois de matar 10 inimigos e responder a pergunta certa, ganhar também um item para a casa.
5. Nos dois prêmios (pergunta certa e nível), abrir uma tela em overlay com um baú que ela toca para receber
   um item de casa surpresa.
6. Deixar os inimigos um pouco mais difíceis de matar.
7. Adicionar a mosca feia, um pouco mais difícil que o fantasma difícil, que conta como 2 inimigos mortos.

# 5. Como a Mariana usa
1. Entra no Bosque pelo portal e luta como hoje.
2. Cada fantasma/mosca vencido conta para o placar de inimigos mortos (a mosca conta 2).
3. Ao chegar a 10, 20, 30... inimigos mortos, abre a pergunta. Certa: estrela, como hoje, e um baú com um móvel
   surpresa para a casa; errada: nada se perde e o baú não aparece.
4. Ao chegar a 30, 60, 90... abre o nível: o ponto de Força/Vida/Velocidade continua, e um baú com um móvel
   surpresa para a casa.
5. O baú é uma tela cheia sobre o jogo: toca nele, a tampa abre e o móvel aparece; "Fechar" volta ao Bosque.

# 6. Onde fica no reino
Bosque dos Fantasmas, portal à direita da Minha Casa (lugar `bosque`). Nada novo no mapa.

# 8. Personagens e falas
Nenhum NPC novo e nenhuma fala nova: o baú usa texto na tela e os sons que já existem. A mosca não fala.

# 9. Prêmios
- Pergunta certa: 1 estrela (como hoje) + 1 móvel surpresa para a casa, no baú.
- Nível: 1 ponto de habilidade (como hoje) + 1 móvel surpresa para a casa, no baú.
- Sem casa: o móvel fica guardado e aparece quando ela ganhar a casa.
- Nada se perde: o móvel é gravado antes do baú abrir; fechar o jogo no meio não perde o prêmio.
- Com todos os móveis: ganha mais um igual ("Mais um!"), para o baú nunca vir vazio.

# 10. Números que eu quero poder mudar depois (`config.fantasmas`)
- `perguntasPorBloco`: 10 inimigos mortos por pergunta.
- `mortosPorNivel`: 30 inimigos mortos por nível.
- `tipos.<tipo>.vida/forca/velocidade/mortos`: vida, dano por toque, velocidade e quantos inimigos mortos conta.
- `quantos.mosca` e `zonas.mosca`.
- O resto (jogador, tempos, zona segura) continua como está.

# 11. O que NÃO pode mudar
- O save da Mariana e dos outros jogadores não se perde nem regride: o nível que já tinham é mantido na migração.
- A espada, o ataque por alvo, o cursor, a dica, o desmaio, os pontos, as estrelas, a Aura e o portal: como hoje.
- Fora do Bosque, nada de vida, espada, placar ou baú de móvel.
- Nenhuma tela nova fora do Bosque.

# 12. Aparelhos
celular (toque), tablet, notebook (mouse e teclado).

# 13. Pronto quando
- [ ] a pergunta só abre a cada 10 inimigos mortos; antes disso, vencer um inimigo só conta o placar
- [ ] o nível sobe a cada 30 inimigos mortos (máx. 1000), com o ponto de habilidade de hoje
- [ ] pergunta certa: estrela + baú com móvel surpresa; errada: sem baú
- [ ] nível novo: ponto + baú com móvel surpresa
- [ ] o baú é uma tela em overlay, abre com toque e mostra o móvel com o desenho da casa
- [ ] a mosca feia aparece no Bosque, é mais difícil e conta 2 inimigos mortos
- [ ] os fantasmas estão um pouco mais difíceis de matar, sem ficar injusto
- [ ] save antigo mantém o nível e não abre uma fila de baús retroativos
- [ ] HUD e painel mostram o placar de inimigos e a próxima pergunta
- [ ] celular, tablet e notebook; teclado e leitor de tela como as outras telas

# 14. Decisões (decidido pelo Claude)
- "A cada 10 inimigos" = uma pergunta a cada bloco de 10 inimigos mortos, para sempre; a mosca vale 2.
- A pergunta certa continua dando 1 estrela e a Aura; o XP do nível agora é o placar de inimigos, não os acertos.
- O nível antigo (1 + acertos/10) é mantido na 1ª carga do save novo; a partir daí, 30 inimigos por nível.
- O móvel do nível deixa de ser escolhido numa lista e passa a ser surpresa no baú; a chave `bosque:<nível>`
  continua sendo a mesma, e as chaves antigas ainda pendentes continuam valendo.
- O móvel da pergunta usa a chave `bosque:p<bloco>` (bloco = 1, 2, 3...), fora do sorteio das salas.
- Sorteio do móvel: determinístico pela chave (como o resto do jogo), sempre entre os que ela ainda não tem;
  com todos, mais um igual.
- A dificuldade sobe pela vida dos inimigos (4/6/9/12) e pela força/velocidade; o jogador continua com a espada
  e a recarga de hoje.
- Tamanho: M (uma frente; mexe em save, combate, telas e testes).
