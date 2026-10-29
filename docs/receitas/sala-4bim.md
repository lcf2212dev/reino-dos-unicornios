# Receita: sala nova do 4º bimestre

Para que serve: pôr uma seção do livro da escola numa matéria do 4º bimestre (hoje `portugues4`) como sala de livro
(`ordem: 'livro'`). Regras: `docs/contratos/quarto-bimestre.md` §3, §4, §6 e §12. Matéria do 3º bimestre
(`arquivada: true`) não ganha sala (`bimestres.md`): o gerador recusa.

## Passo a passo
1. Leia a seção no inventário (`matérias/4 Bimestre/<matéria>/INVENTARIO.md`): páginas, questões e o id de cada uma
   (`APR-12-q3`, `ATI-05-q2`). O que está escrito à mão é da Mariana, nunca gabarito (`conteudo.md` §6).
2. Gere o esqueleto (o id diz capítulo e livro: `lp12a7` = capítulo 12, Aprendizagem, 7ª seção; `t` = Atividades):
   ```
   npm run novo -- sala portugues4 lp12a7 --seco
   npm run novo -- sala portugues4 lp12a7          # outro id: --capitulo N --livro aprendizagem|atividades
   ```
   Cria `<m>/<sala>.js` no lugar certo do manifesto (a ordem do livro; outra: `--depois-de <sala>`), a carta
   `<sala>-c1` no `livro-<cap><a|t>.js`, 1 comum e 1 raro no `unicornios-<cap>.js` e o index. Capítulo novo: os dois
   arquivos nascem e entram depois dos do capítulo anterior.
3. Troque cada `(preencher)` (os validadores recusam):
   - sala: `nome`, `emoji`, `paginas`, `intro`; os desafios na ordem do livro, cada um com `origem` e `pagina`, no
     tipo que imita o livro (§12). Modelo pronto: `portugues4/lp12a6.js`.
   - cartas: uma por página, o texto do livro palavra por palavra (§4); troque o id `<sala>-c1` pelo da página
     (`lp-a81`) na carta, em `cartas` e no `livro` dos desafios.
   - unicórnios: id `lp-<nome>` como os vizinhos, nome, frase e cores (o nome não repete nome de NPC).
   - prêmio da trilha perfeita (Português, §14): `Reino.registrarPremioTrilha` da sala em `premios-trilha-<cap>.js`
     (acessório, elemento e experiência da tabela §14.4; o gerador não cria, o checklist lembra).
4. Emoji sem desenho: ícone por `Reino.registrarIcones` no `icones-<cap>.js` da matéria (`jogo/js/CLAUDE.md`, Arte).
5. Prédio: a estação e o pedestal da sala aparecem sozinhos no capítulo (§7). Se o capítulo não couber (o 12 já
   tem os 8 pedestais da fileira), o `validar-conteudo` e o `validar-interiores` param com exceção citando o
   arquivo do prédio que precisa crescer (ex.: `portugues/lp-tesouros.js`, FILEIRAS); capítulo novo pede o
   cômodo dele em `portugues/portugues.js`. Faça isso antes de validar (receita `predio-novo.md`).
6. Vozes: `npm run vozes` (pacotes `<m>-<sala>` e `<m>-livro-<cap>`).

## Conferir
```
node jogo/ferramentas/validar/validar-conteudo.js
node jogo/ferramentas/validar/cobertura-4bim.js portugues4
node jogo/ferramentas/validar/etapas-4bim.js --tabela
npm run unidade -- --so quarto-bimestre
npm run ver -- --tela sala:lp12a7 --nome lp12a7
npm test
```
No `npm run e2e`: mudam os dados da matéria (`materias`, `vozes`), a Casa das Palavras e a tela da matéria.
