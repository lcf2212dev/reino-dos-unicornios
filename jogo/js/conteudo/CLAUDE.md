# jogo/js/conteudo — regras locais

Contratos: `docs/contratos/conteudo.md`, `docs/contratos/loja.md` (`loja-itens.js`),
`docs/contratos/som-musica-e-voz.md` §4–§5. Receitas: `docs/receitas/materia-nova.md`, `prova-nova.md`,
`enfeite-novo.md`, `sala-4bim.md` (sala nova do 4º bimestre: `npm run novo -- sala <m> <id>`).

## O que mora aqui (só DADOS, todos `node: true`)
- `materias/registro.js` — `Reino.registrarSala`, `registrarLivro`, `salasDa`, `livroDa`. Carrega antes das matérias.
- `materias/<m>/<sala>.js` — UMA sala por arquivo: `Reino.registrarSala('<m>', { id, nome, emoji, paginas, intro, desafios })`.
- `materias/<m>/livro.js` — `Reino.registrarLivro('<m>', [...])`.
- `materias/<m>/<m>.js` — `Reino.registrarMateria({ …, salas: Reino.salasDa('<m>'), livro: Reino.livroDa('<m>'), unicornios })`.
- `provas/<matéria>-<bimestre>.js` — `Reino.registrarProva({ … })`.
- `loja-itens.js` — a única lista de enfeites e prêmios da Loja.

## Registro e manifesto
- Sala nova: `npm run novo -- sala <m> <id>`. Matéria do 4º bimestre: sala de livro na ordem do livro
  (`sala-4bim.md`); matéria extra fora da temporada (`materia-nova.md`): sala sorteada antes do `livro.js`;
  `arquivada: true`: nunca (o gerador recusa). A ordem das salas é a do manifesto.
- Prova nova: linha no manifesto, grupo `'provas'`. Depois, `npm run index`.

## Texto e voz
- As vozes são achadas pelo TEXTO EXATO. Mudou uma vírgula: grava de novo (`npm run vozes`).
- Inglês entre «». Letras sozinhas em MAIÚSCULAS são lidas pelo nome (Português).
- Texto para 7 anos, pt-BR correto, com as palavras da apostila.
- Sala de livro (4º bimestre): as questões do livro, na ordem, até `config.desafiosSalaLivro` (`quarto-bimestre.md` §3).
  Sala sorteada (formato antigo): pelo menos 12 desafios, 6 ou mais de `escolha`, `vf` ou `varias`.
- Salas e provas que já existem não mudam quando entra um campo novo.
- Estilo: igual aos arquivos existentes (4 espaços na sala, 8 nos desafios).

## Antes de entregar
- Skill `validar-tudo`; aqui, o rápido primeiro: `npm run validar` e `npm run e2e -- --so-dados`.
