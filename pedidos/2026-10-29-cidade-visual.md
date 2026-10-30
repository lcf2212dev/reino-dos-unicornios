/nova-feature

# 1. Nome
cidade visual

# 2. Tipo
[x] Ajuste ou correção de algo que já existe (visual da cidade e dos prédios de fora)
[x] Mecânica nova (vida animada no mapa: só desenho, sem prêmio)

# 3. O que eu quero
Melhorar substancialmente o visual da cidade e das construções.
(decidido pelo Claude) "Construções" = o desenho de fora dos prédios no mapa (as fachadas); os interiores ficam
como estão. Nada muda de lugar: mesmas ruas, praça, lago, prédios, portas, colisões e enfeites sorteados.

# 4. Por que
Dar vontade de passear pelo reino entre uma sala e outra: uma cidade mais caprichada, com profundidade e vida,
onde cada prédio se reconhece de longe.

# 5. Como a Mariana usa, passo a passo
1. Ela abre o jogo e aparece na praça, como sempre.
2. O chão tem textura (grama em tons, pedras das avenidas com luz e sombra, meio-fio com volume, cruzamentos
   desenhados), a praça é um mosaico, e fonte, coreto, postes, bancos e canteiros estão mais detalhados.
3. Cada prédio tem mais volume e detalhe (base de pedra, sombra do beiral, telhas em fileiras, janelas com
   reflexo, floreiras), mantendo a cara e a cor da matéria de sempre.
4. Árvores com copas em volumes e espécies variadas; o lago com margem, juncos e vitórias-régias floridas.
5. Com Animações ligadas, borboletas, passarinhos e pequenos movimentos dão vida; com Animações desligadas,
   nada se mexe.
Prêmio: nenhum (só visual).

# 6. Onde fica no reino
O mapa inteiro. Como ela acha: é o mapa onde ela já anda.

# 8. Personagens e falas
Nenhum personagem e nenhuma fala nova.

# 9. Prêmios
nenhum

# 10. Números que eu quero poder mudar depois
(decidido pelo Claude) Quantos bichinhos voam ao mesmo tempo e de quanto em quanto tempo passam: em
`jogo/js/nucleo/config.js`, se a frente da vida precisar.

# 11. O que NÃO pode mudar
- Colisões, portas, rects dos lugares, caminhos, sorteio dos enfeites e das flores (`rng(4242)`), lugar onde ela aparece.
- Interiores (as imagens interior-*, comodo-*, npc-*, sala-*, prova-*, desafio-* e treino-* do e2e ficam idênticas).
- Cor da matéria no telhado (`docs/contratos/arte.md` §22) e a identidade de cada prédio.
- Regras de pixel art (`docs/contratos/arte.md` §1–§15): contorno `#3a2446`, luz de cima e da esquerda, sombra de
  chão reta, nada de degradê liso, `arc`, `ellipse` lisa nem `shadowBlur`.
- Desempenho: o estático continua pré-renderizado (nada de canvas novo por quadro).

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook

# 13. Pronto quando
- [ ] grama com textura em tons (sem a grade à mostra), avenidas de pedra com luz e sombra por pedra, meio-fio com
      volume e cruzamentos com desenho próprio
- [ ] praça em mosaico; fonte, coreto, canteiros, postes, bancos e cercas mais detalhados
- [ ] todos os prédios de fora com mais volume e detalhe, cada um com a mesma cara, cor e porta
- [ ] árvores com volumes de luz e sombra e espécies variadas; lago com margem, juncos e flores
- [ ] com Animações ligadas, vida no mapa (borboletas, passarinhos, brilhos); desligadas, tudo parado
- [ ] no e2e só mudam as imagens que mostram o mapa (mapa*, telas sobre o mapa e a abertura com o castelo)
- [ ] celular, tablet e notebook; `npm test` e `npm run e2e` verdes

# 14. Decisões
(decidido pelo Claude) Pedido G, 7 frentes em paralelo (plano `pedidos/2026-10-29-cidade-visual.plano.json`):
chão, praça e peças da rua, fachadas comuns + prédios de `predios.js`, prédios de `predios-2.js` + 3 `fora.js`,
os outros 6 `fora.js`, árvores e lago, vida animada.

# 15. Até onde ir
Padrão: construir, testar, pôr na main e mandar para o GitHub (a Vercel publica sozinha).
