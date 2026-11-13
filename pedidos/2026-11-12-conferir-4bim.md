# 2026-11-12 — Conferir todas as questões do 4º bimestre

Pedido: "Verifique todas as questões do quarto bimestre, de modo a se certificar de que todas elas estão sem quebras
de layout, e com o conteúdo correto."

Tipo: ajuste ou correção de algo que já existe. Tamanho G (837 questões e 466 cartas em 6 matérias; conteúdo + CSS).

## O que é
- **Layout:** cada questão das 6 matérias do 4º bimestre (`matematica4`, `portugues4`, `ingles4`, `historia4`,
  `geografia4`, `ciencias4`) na tela real, no celular, no tablet e no notebook: na sala (missão, em branco, com a
  resposta certa posta e com o retorno aberto) e sozinha ("Hora da pergunta!", com o "Leia antes"). Nada cortado,
  vazando do cartão, sobreposto, coberto pelo rodapé, com palavra partida no meio ou com marcação aparecendo.
- **Conteúdo:** cada questão contra o livro da escola (`matérias/4 Bimestre/<matéria>/`, PDF e `INVENTARIO.md`):
  enunciado e dados iguais aos do livro, gabarito certo (resolvido de novo, não copiado), só uma resposta certa
  quando é de escolha, respostas digitadas que aceitam o que uma criança escreveria, explicação que bate com a
  resposta, português correto, figura e apoio que a pergunta cita presentes na tela.
- O que estiver errado é corrigido; o resto não muda.

## Onde aparece
Nas salas de livro das 6 matérias e em todo lugar onde a pergunta sai sozinha (Bosque e arenas, Vila, surpresa,
viagem).

## O que NÃO pode mudar
- Ids de matéria, sala, desafio, carta e `origem` (o save e o inventário usam).
- A redação das cartas do livro (palavra por palavra do livro), salvo erro de cópia comprovado na página.
- Dinheiro, estrelas, etapas, prêmios, vozes que não mudaram de texto.

## Pronto quando
- [ ] A varredura de layout roda nas 837 questões, nos 3 tamanhos, na sala e sozinha, sem defeito aberto.
- [ ] Cada questão foi lida contra a página do livro por uma frente e os defeitos têm correção conferida por outro agente.
- [ ] `npm test` e `npm run e2e` verdes; vozes das falas que mudaram gravadas e conferidas.
- [ ] Relatório com a lista do que foi corrigido (questão, o que estava errado, como ficou).

## Decidido pelo Claude
- A conferência cobre também as cartas ("Leia antes") quando a questão depende delas.
- A varredura de layout vira ferramenta do repositório (`npm run varredura`), para repetir depois de cada matéria nova.
- Frentes de conteúdo por matéria e capítulo (11), cada uma com um conferente; layout numa frente só.
