// Aceite do 4º bimestre (Língua Portuguesa), parte 1: a Casa das Palavras, no jogo de verdade, nos 3 tamanhos
// (docs/contratos/quarto-bimestre.md §7, §14.3). Do mapa: toca a porta da casa e chega ao saguão; anda pelos 7 cômodos
// do térreo, sobe a escada do saguão e anda pelos 5 do 1º andar (uma foto de cada em /tmp/reino-testes/aceite-4bim/;
// foto não reprova); cada estação abre a missão da sala certa por toque (celular e tablet) ou clique (notebook), a 1ª
// pelo teclado; os 2 púlpitos abrem o livro na aba certa; os NPCs guias (a guia no saguão, o anfitrião de cada galeria
// e de cada ateliê) falam com o nome e a apresentação deles; a Galeria dos Tesouros tem um pedestal por sala, e ele
// fala; desce a escada e sai pelo tapete do saguão na frente da porta; o menu Lugares tem UMA linha da Casa das Palavras, a 1ª, com as salas da
// Língua Portuguesa (sem "Novo!" depois da visita), e o "Ir" dela entra no saguão. O Museu fica sem escada. Sem erro de
// console. As salas vêm de Reino.materia('portugues4').salas (as que existirem).
// Servidor e banco de TESTE novos (cenario.js); save sintético; congelado (?congelar=1).
// Uma parte por tamanho (este é o celular; -tablet e -notebook ao lado), o código em quarto-bimestre-ala-comum.js.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-ala
const { test } = require('node:test');
test(...require('./quarto-bimestre-ala-comum').tamanhoAla('celular'));
