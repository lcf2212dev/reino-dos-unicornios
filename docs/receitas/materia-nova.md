# Receita: matéria nova

Para que serve: pôr uma matéria nova no reino (ex.: Geografia), com salas, livro, unicórnios e um lugar no
mapa. Regras: `docs/contratos/conteudo.md` §2–§4. Fluxo do Leandro: `COMO-USAR.md` ("Nova matéria").

## Quando usar
- O Leandro salvou as fotos da apostila numa pasta da raiz (`<Matéria>/`) e pediu a matéria.
- Só uma sala nova numa matéria que existe: `npm run novo -- sala <m> <idSala>` e o passo 2.

## Comece pelo gerador
```
npm run novo -- materia <m> --nome "Geografia" --emoji 🌍 --salas 5 --prefixo g --seco
npm run novo -- materia <m> --nome "Geografia" --emoji 🌍 --salas 5 --prefixo g
npm run novo -- sala <m> <idSala>           # só uma sala nova numa matéria que existe
```
Cria as salas, `livro.js` e `<m>.js` no formato de `historia/`, as linhas do manifesto (salas antes do livro) e o
index. À mão: o conteúdo da apostila (todo `(preencher)`; os validadores recusam), ícones e vozes.

## Checklist de arquivos
| Arquivo | O que é |
|---|---|
| `jogo/js/conteudo/materias/<m>/<m>1.js` … | uma sala por arquivo: `Reino.registrarSala('<m>', { … })` |
| `jogo/js/conteudo/materias/<m>/livro.js` | `Reino.registrarLivro('<m>', [cartas])` |
| `jogo/js/conteudo/materias/<m>/<m>.js` | `Reino.registrarMateria({ id, nome, emoji, lugar, guia, salas: Reino.salasDa('<m>'), livro: Reino.livroDa('<m>'), unicornios })` |
| `jogo/js/manifesto.js` | as linhas (grupo `'materias'`, `node: true`), depois do Português |
| `jogo/index.html` | GERADO: `npm run index` |
| `jogo/js/arte/icones/<lote>.js` | desenho de todo emoji novo (lote novo = arquivo novo + linha no manifesto, grupo `'icones'`) |
| (opcional) prédio próprio | `predio-novo.md`; sem ele entra o interior padrão (`jogo/js/interiores/padrao.js`) |
| (opcional) cavaleiro do treino | `personagem-novo.md` com `paraMateria: '<m>'` |

Automático (não mexa): ala no Castelo, baias no Estábulo, interior padrão, pergunta surpresa, dinheiro
(`Reino.config.valorPorMateria` dividido entre as salas), menu Lugares.

## Passo a passo
1. Leia a apostila pelas fotos (converta para JPEG em `/tmp`; o que está escrito à mão é da Mariana e
   NUNCA é gabarito: `docs/contratos/conteudo.md` §7).
2. Salas: copie o formato de `jogo/js/conteudo/materias/historia/h1.js` (4 espaços na sala, 8 nos desafios).
   - ids das salas ÚNICOS no jogo todo (o save guarda `salas[<id da sala>]`): use prefixo da matéria (`g1`…).
   - ids dos desafios únicos (`g1-01`…). Todo desafio tem `livro` (id de uma carta) e `explica`.
   - ≥ 12 desafios por sala, ≥ 6 de `escolha`/`vf`/`varias` (a surpresa e o treino usam só esses).
3. Livro: `livro.js` como `jogo/js/conteudo/materias/historia/livro.js` (ids fixos; o livro de cada desafio aponta para eles).
4. Matéria `<m>.js` como `jogo/js/conteudo/materias/historia/historia.js`:
   - `lugar: { nome, sprite, rect, porCima: true, cores, placa }`. Clareira livre hoje: `rect: { x: 23, y: 4, w: 5, h: 5 }`.
   - `porCima: true` é obrigatório: o lugar entra depois do sorteio das árvores e flores (`Math.random` em
     ordem); sem ele o reino inteiro muda de lugar.
   - `sprite`: sem desenho próprio usa a torre padrão; desenho próprio = `Mapa.PREDIOS.<sprite>` (`predio-novo.md` passo 5).
   - `unicornios`: 1 comum + 1 raro por sala (`sala`), 2 épicos (`treino: 'ouro'` e `'perfeito'`, com `asa`),
     1 lendário (`materiaCompleta: true`, com `asa`). ids únicos com prefixo (`g-…`), nomes que não repetem.
5. Manifesto: salas na ordem, depois `livro.js`, depois `<m>.js` (a ordem das salas é a do manifesto). Rode `npm run index`.
6. Ícones: `npm run validar` avisa "emojis sem pixel art"; desenhe cada um (`docs/contratos/README.md` §2.5).
7. Vozes: todo enunciado, opção, explicação e carta do livro é falado (pacotes `<m>-<sala>`, `<m>-livro`,
   `<m>-extra`, `interior-padrao-<m>`): `fala-nova-e-vozes.md`.

## Validadores
```
node jogo/ferramentas/validar/validar-conteudo.js --materia /tmp/<voce>/g1.js   # uma sala, sem tocar no jogo
npm run validar
npm run unidade
npm run tamanho       # conteúdo é dado: até 800 linhas por arquivo
node jogo/ferramentas/vozes/listar-falas.js
npm test
npm run e2e           # esperado: dados de conteúdo/mapa/interiores mudam; mapa ganha o prédio
```

Referências (na worktree; precisam do git): em `npm test`, o passo *referências de dados* mostra a diferença
esperada abaixo; os outros passos têm que sair ✔. Diferenças esperadas no `npm run e2e`:
- dados: `falas`, `materias`, `mapa` (lugar novo), `interiores` (interior padrão, ala do Castelo, baias),
  `loja` (unicórnios da matéria), `npcs-status` e `vozes` (pacotes novos);
- imagens: o mapa onde o prédio aparece, a tela `lugares`, `castelo`, `plano`, `estabulo`, a Escola e os interiores
  gerados; e QUASE TODAS as outras, só no canto do HUD: o dinheiro total muda (o valor da matéria entra no total).
  Confira que a diferença dessas é só o número do HUD (a imagem de diferença do e2e mostra onde mudou).
A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
depois do commit da mudança; não edite esse arquivo na tarefa. Qualquer diferença fora da lista acima é defeito.

Conferir no jogo (fotos em `/tmp/reino-testes/ver/<nome>/`):
```
npm run ver -- --ir materia:<m> --nome <m>                   # o prédio por dentro
npm run ver -- --tela materia:<m> --tamanhos celular         # a tela da matéria
npm run ver -- --tela sala:<sala> --passos 'tocar:.intro-botoes .btn-principal;esperar:600'
npm run ver -- --tela livro:<m>                              # o livro
```
Em script: `abrirCenario()` de `jogo/ferramentas/testes/cenario.js`.

## Armadilhas
- A matéria pede um jeito novo de perguntar (ex.: conta armada em Matemática)? Tipo novo num arquivo: `desafio-novo.md`.
- Sem `porCima: true` (ou sem `rect` numa clareira) a matéria muda o sorteio do mapa inteiro.
- Id de sala repetido entre matérias mistura o progresso no save.
- Arquivo fora do manifesto não carrega (e `node jogo/ferramentas/gerar-index.js --conferir` acusa).
- Sala é `node: true`: nada de DOM, `PA` ou `Reino.Progresso` no arquivo (só dados).
- Letras sozinhas em MAIÚSCULAS são lidas pelo nome só nos pacotes de Português (`jogo/ferramentas/vozes/listar-falas.js`).
- Ligar: palavra mais comprida da esquerda + da direita ≤ 24 letras (o validador avisa).
- Voz: texto mudou uma vírgula = gravação nova.
