// Aceite do 4º bimestre (Língua Portuguesa), parte 2: TODAS as questões, uma a uma, na tela real da missão
// (Reino.Missao.iniciar com a sala de verdade, intro e cartas do resumo; um capítulo por teste). Cada questão começa em
// branco, como ela vê (sem valor inicial: nada marcado, Conferir desligado); recebe pela tela uma resposta errada de
// verdade (a que a tela produziria: outro índice, par trocado, ordem trocada, palavra errada, marca errada, grupo trocado,
// texto sem as palavras pedidas, V/F invertido, desenho sem o pedido) e dá "Quase!"; depois do "Tentar de novo" é
// consertada NO MESMO controle até a certa (exemplos.certa) e dá "Isso!", na ordem do livro, etapa por etapa (trilha
// "Começar", cartas e questões da etapa, "Próxima etapa ▶"), até "Terminar a sala" (a sala conta como feita). Só as livres (pessoais: qualquer resposta vale) não têm errada: a contagem sai no teste.
// Toques pelo DOM (rápido; toque e teclado de verdade: quarto-bimestre-recuperacao). Sem erro de console.
// As salas vêm de Reino.materia('portugues4').salas (capítulo sem salas: pulado, com aviso).
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1); celular.
// Uma parte por capítulo (este é o Cap. 10; -cap11 e -cap12 ao lado), o código em quarto-bimestre-questoes-comum.js.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-questoes
const { test } = require('node:test');
test(...require('./quarto-bimestre-questoes-comum').capitulo(10));
