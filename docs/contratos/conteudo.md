# Contrato: conteúdo (matérias, salas, desafios, livro, provas, treino)

Cobre como as matérias são escritas (uma sala por arquivo), os tipos de desafio e seus campos, o livro,
as provas da escola, o treino, e as regras de conteúdo do Português (fontes da apostila, estilo, validação).
Personagens: `npcs-e-dialogo.md`. Prédios: `interiores.md`. Vozes: `som-musica-e-voz.md`.

## Índice
1. Onde está no código · 2. Matéria, sala e livro · 3. Tipos de desafio e campos · 4. Regras para escrever salas ·
5. Provas e treino · 6. Português: matéria, salas, unicórnios · 7. Português: fontes (apostila) ·
8. Português: prova · 9. Antes de mexer

## 1. Onde está no código
- `jogo/js/conteudo/materias/registro.js` — `Reino.registrarSala`, `registrarLivro`, `salasDa`, `livroDa`.
- `jogo/js/conteudo/materias/<m>/<sala>.js` (uma sala por arquivo), `<m>/livro.js`, `<m>/<m>.js` (a matéria:
  `Reino.registrarMateria({ …, salas: Reino.salasDa('<m>'), livro: Reino.livroDa('<m>'), unicornios, … })`).
- `jogo/js/conteudo/provas/<prova>.js` — provas da escola (dados).
- `jogo/js/atividades/desafios.js` (núcleo: render, `pontuar`, `linhaCerta`, `linhaValor`, `conferir`, `Reino._desafios`)
  + `jogo/js/atividades/desafios/<tipo>.js` (um por tipo; `vf` fica em `escolha.js`, `ordenar`/`frase` em `sequencia.js`).
- `jogo/js/atividades/missao.js` (sala: `Reino.Missao`), `treino.js` (treino do Castelo: `Reino.Prova`),
  `provas.js` (prova da escola: `Reino.Provas`; tempo mínimo de leitura, lista de revisão).
- `css/ui-desafios.css` (estilos dos desafios, texto de apoio, `copiar`).
- `jogo/js/sistemas/falas.js` — o que é lido (enunciados, apoio) e em que pacote.
- Validador: `jogo/ferramentas/validar/validar-conteudo.js`.

## 2. Matéria, sala e livro
1. Sala nova = um arquivo `<m>/<id>.js` com `Reino.registrarSala('<m>', { id, nome, emoji, paginas, intro,
   desafios: [...] })` + uma linha no `jogo/js/manifesto.js` (grupo `'materias'`, `node: true`) depois da
   última sala e antes de `<m>/livro.js` e `<m>/<m>.js`. A ordem das salas é a do manifesto.
2. Livro: `<m>/livro.js` com `Reino.registrarLivro('<m>', [{ id, e, titulo, texto }, …])`.
3. Unicórnios da matéria: no `<m>/<m>.js` (`unicornios: [{ id, nome, raridade, sala | treino | materiaCompleta,
   cores: { corpo, crina: [3 cores], chifre, asa? }, frase }]`).
4. Estilo dos arquivos de sala: igual aos que já existem (ex.: `historia/h1.js`): indentação de 4 espaços na sala,
   8 nos desafios.
   <!-- validar-docs: ignorar -->
5. O Português era montado de `rascunho/` por `ferramentas/montar-portugues.js`: os dois foram removidos (estão no
   histórico do git). Edite direto as salas `portugues/p1.js`…`p5.js`, `livro.js` e `portugues.js`.
   <!-- validar-docs: fim -->

## 3. Tipos de desafio e campos
1. Tipos: escolha, vf, varias, ligar, ordenar, frase, separar, vfLista, completar, copiar, memoria, desenho.
2. Todo desafio de sala tem `livro` (id de uma carta do livro) e `explica`. `pagina` (página da apostila) é só
   informativo: o jogo ignora.
3. Texto de apoio (qualquer desafio ou questão; aditivo: sem ele, tudo igual):
   ```
   apoio: { titulo: 'Salada de frutas',
            partes: [ { titulo: 'Ingredientes:', lista: ['1 banana', …] },
                      { titulo: 'Modo de preparo:', texto: 'Lave bem as frutas. …' } ] }
   ```
   Caixa "texto de apoio" acima do enunciado, sempre visível, com botão "🔊 Ouvir o texto" (narradora, lendo
   `Reino.Falas.segmentosApoio(apoio)`). As falas entram no pacote da prova ou da sala.
4. `completar` (campos aditivos):
   - `colado: true` (no desafio): a lacuna fica dentro da palavra, sem espaços (`PA` + lacuna + `ARINHO`), com a
     lacuna mais curta. A narradora lê só o enunciado.
   - `frases[i].img: 'palavra:cachorro'` + `frases[i].alt: 'cachorro'`: figura de `window.ICONES` antes da
     palavra (desenho que falta: ❓, sem quebrar). Muitos itens com figura ficam numa grade compacta.
   - `frases[i].aceitas: [j, …]`: outros índices de `palavras` também certos, além de `certa` (ex.: CA_O =
     carro ou caro). Vale na pontuação, na conferência e na revisão; a resposta certa mostrada é a de
     `certa`, com "(ou …)" para as aceitas.
5. `copiar`:
   ```
   { tipo: 'copiar', pergunta, itens: [ { letra: 'a', opcoes: ['PASEIO', 'PASSEIO'], certa: 1 }, … ], explica, livro }
   ```
   Cada item: "a) ( ) PASEIO ( ) PASSEIO": ela toca na escrita certa; embaixo, "Resposta:" montada tocando nas
   peças de letras (as letras das duas escritas, sem repetir as comuns além do necessário, embaralhadas;
   tocar numa letra colocada tira). Valor: `[{ escolha: i | null, letras: [índices das peças] }]`. Pronto:
   todo item com escolha e com tantas letras quanto a escrita escolhida. Pontuação: 2 partes por item
   (escolheu a certa; a cópia forma `opcoes[certa]`), em fração, como as outras questões com partes.
6. Campo novo de desafio = aditivo (sem ele, as salas e provas de antes ficam idênticas) + conferência em
   `validar-conteudo.js` + estilos em `css/ui-desafios.css` + tempo mínimo e revisão em `provas.js`.

## 4. Regras para escrever salas
1. Pelo menos 12 desafios, variados; pelo menos 6 de `escolha`, `vf` ou `varias` (a pergunta surpresa e o
   treino do Castelo usam só esses três).
2. Tipos das salas: escolha, vf, varias, ligar, ordenar, frase, separar, completar, memoria.
3. Textos curtos, para uma criança de 7 anos, com as palavras da própria apostila.
4. Adivinhas e ditado viram escolha ou completar; produção de texto vira ordenar passos, montar frase com
   blocos ou identificar partes; nada de "desenhe"/"recorte".
5. Letras sozinhas em MAIÚSCULAS ("usando X ou CH", "a letra H"): a voz lê o nome da letra (`som-musica-e-voz.md` §4).
6. Palavra com lacuna dentro dela (xí__ara): `completar` com `colado: true`.
7. Separação de sílabas: minúsculas com hífen (`bal-de`).
8. Ligar: a palavra mais comprida da coluna da esquerda + a da direita até 24 letras (senão, no celular,
   quebra palavra ou vaza); `validar-conteudo.js` avisa.
9. Emoji: prefira os que já têm desenho (`jogo/ferramentas/previas/icones.html`). Emoji novo: avise quem
   integra (o desenho vai em `jogo/js/arte/icones/<lote>.js`).
10. Nas explicações de verdadeiro ou falso de Português, a resposta falsa começa com "É falso!".
11. Validar sem tocar no jogo: copie o arquivo para `/tmp/<voce>/` e rode
    `node jogo/ferramentas/validar/validar-conteudo.js --materia /tmp/<voce>/p3.js` (uma sala, a matéria
    `portugues.js` ou `/tmp/<voce>/portugues/livro.js`); no fim, sem `--materia`.

## 5. Provas e treino
1. Prova da escola: `Reino.Provas.iniciar(prova, fim)`; só nota 10 dá acessório, a tentativa define o tipo
   (lendário na 1ª, raro na 2ª, comum depois), depois vira treino. Os prêmios podem ser comprados na Loja
   depois de ganhar algum da mesma prova (`loja.md` §3).
2. Treino do Castelo: `Reino.Prova.iniciar(materia, fim)`, só com todas as salas da matéria feitas.
3. As provas de História e de Inglês e as salas de antes ficam idênticas quando um campo novo entra.

## 6. Português: matéria, salas, unicórnios
1. Matéria (`portugues/portugues.js`): `id: 'portugues'`, `nome: 'Português'`, `emoji: '📝'`,
   `nomeLivro: 'Livro das Letras'`.
2. Lugar: `nome: 'Casa das Palavras'`, `artigo: 'a'` (opcional: "até a Casa", "salas da Casa"),
   `sprite: 'palavras'`, `rect: { x: 22, y: 15, w: 5, h: 5 }` (clareira de baixo; na (23,4) a placa do Castelo
   cobria o telhado), `placa: 'acima'` (sem uso: o mapa não tem placas), `porCima: true` (opcional: o lugar
   entra no mapa depois do sorteio dos enfeites, e o resto do reino fica com as mesmas árvores e flores).
3. Salas:

| Sala | Nome | Emoji | Páginas | Fotos | Cartas do livro |
|---|---|---|---|---|---|
| p1 | Receita de Quê? | 🍓 | 30–36, 51–54 (54: questões 1 e 2) | 7459–7462, 7469–7471 | receita, partes-receita, passo-a-passo |
| p2 | O H Silencioso | 🌿 | 37–41, 54 (questão 3) | 7462–7464, 7471 | letra-h |
| p3 | CH, LH, NH e o X | 🐣 | 42–50, 55–56 | 7465–7469, 7471, 7472 | digrafos, x-ou-ch, sons-do-x |
| p4 | Expedição Antártida | 🧊 | 57–68 | 7472–7475, 7477–7479 | relato, tempo-no-relato, som-de-s, ponta-iceberg |
| p5 | L, R e RR | 🎠 | 69–80 | 7479–7485 | silabas, l-r-final, r-rr |

4. Cartas do livro (ids fixos, nesta ordem): `receita`, `partes-receita`, `passo-a-passo`, `letra-h`,
   `digrafos`, `x-ou-ch`, `sons-do-x`, `relato`, `tempo-no-relato`, `som-de-s`, `ponta-iceberg`, `silabas`,
   `l-r-final`, `r-rr`.
5. Unicórnios (ids fixos):

| id | nome | raridade | de onde |
|---|---|---|---|
| p-pitada | Pitada | comum | sala p1 |
| p-receitinha | Receitinha | raro | sala p1 |
| p-hortela | Hortelã | comum | sala p2 |
| p-hibisco | Hibisco | raro | sala p2 |
| p-ninho | Ninho | comum | sala p3 |
| p-xicara | Xícara | raro | sala p3 |
| p-pinguim | Pinguim | comum | sala p4 |
| p-iceberg | Iceberg | raro | sala p4 |
| p-rodinha | Rodinha | comum | sala p5 |
| p-farol | Farol | raro | sala p5 |
| p-douradinha | Douradinha | epico | `treino: 'ouro'` |
| p-caprichosa | Caprichosa | epico | `treino: 'perfeito'` |
| p-rainha-palavras | Rainha das Palavras | lendario | `materiaCompleta: true` |

   Épicos e lendário com `asa` nas cores, como os de Inglês.
6. Na sala p3, NI_O aceita ninho e nicho.

## 7. Português: fontes (apostila)
1. Originais na pasta `Português/` da raiz do repositório (IMG_7459 a 7485) e `Português/Revisão/` (7486 a 7488).
   As fotos da apostila mostram duas páginas lado a lado, deitadas; a 7465 está de cabeça para baixo.
2. Para ler: converta para JPEG (≈1400 px, desvirado) em `/tmp`; para ampliar um trecho (frações da
   largura/altura da original): `uv run --with pillow --with pillow-heif python <script de recorte> <original>
   <saida.jpg> x0 y0 x1 y1`.
3. O que está escrito à mão é da Mariana (ou da professora) e NUNCA é gabarito. Palavra coberta por escrita ou
   pintura (pp. 48, 69, 70, 78): não adivinhe; use só o que está legível.
4. Textos de terceiros (receitas, o relato das irmãs Klink "Chegamos?"/"Os incríveis icebergs"): resuma com
   palavras próprias. Trecho curto da apostila só quando a questão depende dele.
5. Fotos → páginas:

| Foto | Páginas | Foto | Páginas |
|---|---|---|---|
| 7459 | 30–31 | 7472 | 56–57 |
| 7460 | 32–33 | 7473 | 58–59 |
| 7461 | 34–35 | 7474 | 60–61 |
| 7462 | 36–37 | 7475 | 62–63 |
| 7463 | 38–39 (a 39 com a 41 por cima) | 7476 | repetição borrada da 7477: não use |
| 7464 | 40–41 | 7477 | 64–65 |
| 7465 | 42–43 (de cabeça para baixo) | 7478 | 66–67 |
| 7466 | 44–45 | 7479 | 68–69 |
| 7467 | 46–47 | 7480 | 70–71 |
| 7468 | 48–49 | 7481 | 72–73 |
| 7469 | 50–51 | 7482 | 74–75 |
| 7470 | 52–53 | 7483 | 76–77 |
| 7471 | 54–55 | 7484 | 78–79 |
| | | 7485 | 80 |

## 8. Português: prova (`conteudo/provas/portugues-3bim.js`)
1. `id: 'portugues-3bim'`, `materiaId: 'portugues'`, `nome: 'Revisão Bimestral de Português'`,
   `bimestre: '3º bimestre'`, `emoji: '📝'`, questões `pb3-01` a `pb3-12`.
2. Acessórios: lendário `chapeu-chef-arco-iris` "Chapéu de Chef Arco-íris" (slot cabeca), raro
   `cachecol-pinguim` "Cachecol de Pinguim" (pescoco), comum `lacinho-morango` "Lacinho de Morango" (orelha).
3. Figuras da questão 10: `palavra:<nome>` nos ícones (32×32): cachorro, chocolate, chupeta, chave, mochila,
   cachecol, palhaco, milho, folha, olho, coelho, ovelha, ninho, quinhentos, golfinho, dinheiro, pinheiro, aranha.
4. Decisões da leitura da folha (IMG_7486 a 7488):
   - "SALADA DE FRUTAS" (depois de "LEIA O TEXTO:") está escrito à mão, com letra de adulto; o texto impresso
     não traz o título. No jogo o título aparece no texto de apoio (é a resposta da questão 1).
   - Questão 8: a) a d) impressos; e) CA_A, f) _AIA, g) CA_ACO escritos à mão (letra de adulto); h) riscado com
     "REPETIDA". Fica e) a g), sem o h).
   - "13.e)" impresso na questão 12 vira "e)".
   - Itens com mais de uma palavra válida: 12a CA_O (carro/caro), 12c CA_ETA (careta/carreta), aceitas. As raras
     8e CA_A (cassa), 8g CA_ACO (cassaco) e 12f FE_O (fero) NÃO são aceitas: a prova imita a correção da professora.

## 9. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-conteudo.js
node jogo/ferramentas/gerar-index.js --conferir          # sala nova no manifesto
node jogo/ferramentas/vozes/listar-falas.js              # texto novo precisa de voz gravada
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados
npm test
```
