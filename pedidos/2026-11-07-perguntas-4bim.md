# 2026-11-07 — Perguntas estranhas do 4º bimestre

Pedido: "Algumas perguntas do quarto bimestre estão muito estranhas. Identifique e arrume." (print: "Hora da pergunta!"
nas Dunas com ma12t2-07 e o "Leia antes" da p. 16, "Pinte as colunas do gráfico… da atividade anterior").
Tamanho M (conteúdo das 6 matérias + 1 campo novo).

Causa: a pergunta sorteada sozinha (Bosque/arenas, Vila, surpresa, viagem) mostra a carta `livro` inteira, sem as
questões de antes. Muitas cartas só mandam pintar/recortar ou resumem a página; muitos enunciados citam "a atividade
anterior", "essa situação", "a página anterior", "converse com os colegas", "pinte".

Feito:
- Campo `avulsa` do desafio (`quarto-bimestre.md` §12.1): `{ carta }` troca o "Leia antes" quando sozinha;
  `false` deixa só na sala. `Reino.avulsa`/`Reino.cartaAvulsa`; validar-conteudo confere; teste em bosque-regras.
- Auditoria das ~840 perguntas (8 frentes): cartas trocadas, apoios com os dados que faltavam, enunciados que
  se sustentam sozinhos, ordens impossíveis (pintar, recortar, conversar) trocadas pelo que a tela pede, respostas
  por extenso aceitas, português corrigido. Cartas do livro intactas.
## Decidido pelo Claude
- Rótulo "a)" no começo do enunciado fica (é do livro e não confunde).
- Erros do próprio livro no enunciado do desafio corrigidos ("algodões-doces", "junto aos colegas", "a frase que se repete");
  nas cartas, mantidos.
