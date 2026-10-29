// Aceite do 4º bimestre (Língua Portuguesa), parte 3: salas inteiras jogadas pela interface, como a criança joga. Na Casa
// das Palavras (no andar da estação), toca a estação e o "Ok!" do balão; a trilha das etapas ("Começar"), e em cada
// etapa as cartas dela ("Continuar →") e cada questão respondida só com toques e digitação na tela, a tabela e o desenho
// também (prancheta: cor, ferramenta, ponto e arraste), com calma (espera o tempo de leitura antes do "Conferir"),
// "Continuar" e "Terminar"; entre as etapas, "Próxima etapa ▶"; tudo certo de primeira: a festa da trilha perfeita
// (3 cartões, o acessório na loja); no fim, a sala conta como no 3º bimestre (P.concluirSala, com a soma das etapas):
// o dinheiro da sala no baú e no HUD, as estrelas (acertos de primeira + 3 da calma), o ovo comum e o raro (perfeita e
// com calma), chocados pela tela do ovo.
// Por capítulo, as salas que juntas têm todos os tipos de questão dele (separar e montar a frase incluídos): Cap. 10 no
// celular (toque), 11 no tablet (toque), 12 no notebook (clique); capítulo sem salas: pulado, com aviso.
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1). Sem erro de console.
// Uma parte por capítulo (este é o Cap. 10; -cap11 e -cap12 ao lado), o código em quarto-bimestre-sala-inteira-comum.js.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-sala-inteira
const { test } = require('node:test');
test(...require('./quarto-bimestre-sala-inteira-comum').capitulo(10, 'celular'));
