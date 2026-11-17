/nova-feature

# 1. Nome
bosques-visual

# 2. Tipo
[x] Ajuste ou correção de algo que já existe (passe de arte dos 3 bosques de dentro do Bosque)

# 3. O que eu quero
Melhorar visualmente os 3 últimos bosques criados — Bosque do Orvalho (Nv 25), Bosque da Neblina (Nv 30) e
Bosque da Lua Cheia (Nv 35): chão, parede/copas, céu (fundo), árvores, enfeites, atmosfera e os 4 monstros de cada
um. Cada bosque tem de ficar mais bonito, mais rico e mais próprio (não um recolor do Bosque dos Fantasmas nem um do
outro), mantendo o estilo pixel art do jogo.

# 4. Por que
Os três nasceram iguais na estrutura (mesmo kit do Bosque emprestado, mesma distribuição de enfeites, pouca
atmosfera própria) e ficaram chapados e repetitivos. O lugar é o próximo desafio dela: precisa dar vontade de entrar.

# 5. Como a Mariana usa, passo a passo
1. Entra no Bosque dos Fantasmas e vê os 3 portais, como hoje.
2. Entra em cada floresta: o caminho, a volta, a luta, a pergunta e o baú são os de sempre.
3. O que muda é só o que ela vê: a floresta de cada portal fica distinta e mais bonita, do nascer do sol (Orvalho),
   à névoa fria (Neblina), à noite de lua cheia (Lua Cheia).

# 6. Onde fica no reino
`jogo/js/interiores/orvalho/**`, `jogo/js/interiores/neblina/**` e `jogo/js/interiores/lua/**` (objetos, inimigos e
layout de cada uma). Nada de lugar novo no mapa, nada de mudança de motor, save, config, falas ou UI.

# 7. Material
Nenhum (pedido em texto).

# 8. Personagens e falas
Ninguém novo. Nenhuma fala nova: os objetos interativos continuam com os mesmos textos do Bosque (`falas.js` não muda).

# 9. Prêmios
Os de sempre, nada muda.

# 10. Números que eu quero poder mudar depois
Nenhum número novo: `config.arenas.<id>` fica intocado.

# 11. O que NÃO pode mudar
Contrato das arenas de dentro do Bosque (`arenas.md` §8): id, lugar 'bosque', entrada false, 56 × 44, cômodo, spawn
(28,39), sem tapete de saída, escada de volta em (28,40), objeto `<id>-portal-volta`, 4 tipos de inimigo com ids
`<id>-facil|medio|dificil|voador` (molde ≤ 17 × 20, K `#3a2446`) e a chamada de `B.portalNovo`. O progresso, o banco
da Vercel, os saves, o servidor de casa, o Docker e o artifact ficam intocados. `falas.js`, `config.js`, manifesto,
UI, docs, motor e as pastas de outros prédios: sem tocar.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook

# 13. Pronto quando (o que eu vou conferir)
- [ ] Os 3 bosques têm chão, copas/parede, fundo/céu e enfeites próprios, com paleta e atmosfera distintas.
- [ ] Nenhum clone em fila: árvores/arbustos/enfeites com variantes e agrupamentos; clareiras com respiro.
- [ ] A chegada (spawn + portal de volta) de cada um é um cartão de visita: moldura, chão e luz na volta do portal.
- [ ] Os 4 monstros de cada bosque continuam os mesmos ids, agora com contraste e leitura melhores.
- [ ] `npm run validar` verde e `npm test` verde; `npm run e2e` só muda as cenas dos 3 bosques.
- [ ] Funciona no celular, no tablet e no notebook.

# 14. Decisões (decidido pelo Claude)
- Passe de arte nos 3 em paralelo, cada um com a sua paleta, o seu kit de objetos e o seu enquadramento.
- Fundo/céu desenhado para a faixa que aparece de verdade em jogo (a borda de baixo da arena e as lascas laterais),
  com o luar/raios de sol/sol da manhã visíveis nela.
- Sem objeto de fala nova, sem número novo e sem arquivo novo: o passe cabe nos 3 arquivos de arte de cada pasta.

# 15. Até onde ir
Padrão: worktree, testes, commit, integrar na main, push e conferir a Vercel.
