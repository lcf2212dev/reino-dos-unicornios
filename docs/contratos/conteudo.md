# Contrato: conteúdo (matérias, salas, desafios, livro, provas, treino)

Cobre como as matérias são escritas (uma sala por arquivo), os tipos de desafio e seus campos, o livro,
as provas da escola, o treino, e as regras de conteúdo do Português (fontes da apostila, estilo, validação).
Personagens: `npcs-e-dialogo.md`. Prédios: `interiores.md`. Vozes: `som-musica-e-voz.md`.

## Índice
1. Onde está no código · 2. Matéria, sala e livro · 3. Tipos de desafio e campos · 4. Regras para escrever salas ·
5. Provas e treino · 6. Português: matéria, salas, unicórnios · 7. Português: fontes (apostila) ·
8. Português: prova · 9. Antes de mexer · 10. Ciências: matéria, salas, unicórnios

## 1. Onde está no código
- `jogo/js/conteudo/materias/registro.js` — `Reino.registrarSala`, `registrarLivro`, `salasDa`, `livroDa`.
- `jogo/js/conteudo/materias/<m>/<sala>.js` (uma sala por arquivo), `<m>/livro.js`, `<m>/<m>.js` (a matéria:
  `Reino.registrarMateria({ …, salas: Reino.salasDa('<m>'), livro: Reino.livroDa('<m>'), unicornios, … })`).
- `jogo/js/conteudo/provas/<prova>.js` — provas da escola (dados).
- `jogo/js/atividades/desafios.js` (núcleo: render, `pontuar`, `linhaCerta`, `conferir`, `Reino.registrarTipoDesafio`)
  + `jogo/js/atividades/desafios/<tipo>.js` (um por tipo; `vf` fica em `escolha.js`, `ordenar`/`frase` em `sequencia.js`).
  Todos `node: true` no manifesto (o validador e as falas usam os ganchos dos tipos). Tipo novo: §3.7.
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
   Dinheiro da matéria (`Reino.config.valorPorMateria`, derivado, nunca no save): cada sala vale um valor redondo,
   de R$ 0,50 em R$ 0,50 arredondado para baixo (`P.valorSala`), e a sobra é bônus quando a matéria fica completa
   (`P.bonusMateria`; `premios.bonus` no `concluirSala` da última sala). 5 salas: R$ 4,00 e bônus zero; 6 salas:
   R$ 3,00 + R$ 2,00. Nunca dízima (decisão do Leandro, 2026-09-26).
4. Estilo dos arquivos de sala: igual aos que já existem (ex.: `historia/h1.js`): indentação de 4 espaços na sala,
   8 nos desafios.
   <!-- validar-docs: ignorar -->
5. O Português era montado de `rascunho/` por `ferramentas/montar-portugues.js`: os dois foram removidos (estão no
   histórico do git). Edite direto as salas `portugues/p1.js`…`p5.js`, `livro.js` e `portugues.js`.
   <!-- validar-docs: fim -->
6. Onde a matéria fica (`lugar`): um prédio próprio no mapa (`nome`, `sprite`, `rect` ou uma clareira, `porCima`;
   ex.: §6) OU dentro de um prédio que já existe: `lugar: { nome, artigo, dentro: '<id do lugar anfitrião>',
   interior: '<id do andar>' }`, sem `rect` nem `sprite`. Com `dentro`, `Mapa.criar` (`mundo/mapa.js`) não põe nada
   no mapa (nem clareira, nem rua) e ela não conta na vez das clareiras: o reino sai idêntico. `Mapa.lugares()` ganha
   no fim `{ id: 'materia:<m>', tipo: 'materia', materiaId, dentro, interior, porta e rect do anfitrião }` só para o
   menu Lugares (o que desenha e faz colisão usa `Mapa._interno.lugares`, sem ela). "Ir" anda até a porta do
   anfitrião e entra direto no `interior` (`Cena.entrar`); de dentro do anfitrião vai direto, sem sair
   (`Cena.irAoLugar`); sair do andar dela volta à porta do anfitrião. O andar é um `Reino.registrarInterior` com
   `lugar: 'materia:<m>'` e `entrada: true` (pode não ter `saida` se tiver escada). O arco-íris de matéria completa
   aparece no anfitrião. `validar-interiores.js` acusa anfitrião ou andar inexistente. Gerador:
   `npm run novo -- materia <m> --nome … --emoji … --dentro <lugar> --interior <id>`. Ex.: Ciências
   (`dentro: 'observatorio'`, `interior: 'observatorio-3'`).
   - `andar: '3º andar'` (opcional, só com `dentro`): a linha do menu Lugares diz "No 3º andar do Observatório",
     com o emoji do anfitrião (sem `andar`: "Dentro do Observatório"). `mapa.js` copia `andar` e `anfitriaoNome`.
   - `novidade: 'AAAA-MM-DD'` (opcional, matéria ou `Reino.registrarLugar`): selo "✨ Novo!" (aviso `tipo: 'novo'`)
     no menu Lugares enquanto ela não entrou e a data tem menos de `config.novidadeDias` dias (padrão 45).
     Visita = entrar no interior ou abrir a tela do lugar; fica no campo `visitados` do save
     (`sistemas/visitados.js`, `Reino.Novidades.ehNovo(lugar)`). O `npm run novo` (matéria e prédio) põe a data de hoje.

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
6. Campo novo de desafio = aditivo (sem ele, as salas e provas de antes ficam idênticas) + conferência no
   `validar` do tipo (ou em `validar-conteudo.js`, se vale para todos) + estilos em `css/ui-desafios.css`.
7. **Tipo de desafio novo** = UM arquivo `jogo/js/atividades/desafios/<tipo>.js` + a linha dele no manifesto
   (`grupo: 'atividades', node: true`, depois de `desafios.js`) + `npm run index`. O núcleo (`desafios.js`),
   a prova (`provas.js`), as falas (`falas.js`) e o validador não sabem de tipo nenhum: chamam os ganchos.
   `Reino.registrarTipoDesafio(tipo, def)` (forma: `TipoDesafioDef` em `ferramentas/testes/tipos-extensoes.d.ts`):
   - `montar(d, opts)` (obrigatório; DOM só aqui dentro) devolve o controle `{ el, valor, pronto, conferir, … }`;
     `pontuar(d, valor)` de 0 a 1 (sem ele: 0).
   - `treinavel` (treino e mínimo do validador), `especial`/`semprePrimeiro`/`noFim` (sorteio da missão),
     `pista` (nome da frase em `Falas.fixas`), `campos` (campos opcionais só deste tipo: `livre`, `colado`, `rotulos`).
   - Textos: `enunciado(d)`/`enunciadoTela(d)` (sem eles: `d.pergunta`), `textoCerto(d)`, `textoResposta(d, valor)`
     (correção), `textoFala(d)` e `textoProva(d)` (tempo mínimo de leitura da prova).
   - Voz: `falas(d, todos, segs)` recebe `[pergunta, instrucao?]` e devolve a lista lida no 🔊 e gravada
     (`todos(lista)` = índices na ordem da tela). Mudou o que é lido: `npm run vozes`.
   - Prova: `prepararProva(d)` (ordem preparada uma vez), `extraCorrecao(d, valor)` (elemento a mais na correção).
   - `validar(d, v)`: checagens sem DOM, no Node; `v = { checar(cond, msg), avisar(msg), naProva, icones, textoOk }`.
   - `exemplos: { desafio, certa(d), estranhos }` (obrigatório para o `npm test`): um desafio sintético do tipo,
     `certa(d)` a resposta certa de QUALQUER desafio do tipo (sem `pontuar`, não tem) e `estranhos` (respostas
     erradas ou vazias no formato do tipo). `desafios-pontuacao.test.js` percorre todos os tipos registrados: a
     certa vale 1 em toda sala e prova, e nenhuma estranha quebra ou sai de 0..1. Sem eles: "falta exemplos em <tipo>".
   No carregamento o arquivo não toca em `document` (o Node carrega todos). Exemplo mínimo:
   ```
   (function () {
     var el = Reino.util.el;
     Reino.registrarTipoDesafio('conta', {
       montar: function (d, opts) { /* … tela: el(...), opts.onMudar() … */ },
       pontuar: function (d, valor) { return valor === d.resultado ? 1 : 0; },
       falas: function (d, todos, segs) { return segs.concat(['Quanto é ' + d.conta + '?']); },
       textoCerto: function (d) { return String(d.resultado); },
       textoResposta: function (d, valor) { return String(valor); },
       validar: function (d, v) { v.checar(typeof d.conta === 'string', d.id + ': conta sem a conta'); },
       exemplos: { desafio: { id: 'x', tipo: 'conta', conta: '2 + 3', resultado: 5 },
         certa: function (d) { return d.resultado; }, estranhos: [-1, '5', null, true] },
     });
   })();
   ```
   Teste de modelo: `ferramentas/testes/unidade/desafio-tipo.test.js` (tipo de mentira no validador, falas e pontuação).

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
4. Prova autocontida (um arquivo + a linha no manifesto): cada acessório pode trazer `desenho` (formato de um
   item de `PA.ENFEITES_MONTARIA`: `linhas`, `paleta`, `ancora`, `dx`, `dy`) e `icone` (formato de `window.ICONES`:
   `n`, `p`, `d` com 16 linhas de 16). `Reino.registrarProva` põe o ícone em `ICONES['acessorio:<id>']` e o desenho
   na montaria; sem eles, valem o desenho em `pixelart-unicornio-moldes.js` e o ícone em `js/arte/icones/`. A
   professora vem no mesmo arquivo com `Reino.registrarPersonagem` (`npcs-e-dialogo.md` §5).
   `validar-conteudo` confere linhas do mesmo tamanho, letras da paleta e âncora válida.
   ```js
   comum: { id: 'estrelinha', nome: 'Estrelinha',
     desenho: { linhas: ['.k.', 'kyk', '.k.'], paleta: { k: '#3a2446', y: '#ffd34d' }, ancora: 'orelha', dx: -1, dy: 1 },
     icone: { n: 'Estrelinha (comum)', p: { k: '#3a2446', y: '#ffd34d' }, d: [ /* 16 linhas de 16 */ ] } },
   ```
5. Ciências (`provas/ciencias-3bim.js`, 11 questões, `cb3-01`…`cb3-11`, emoji 🔬): professora `prof-flora`
   ("Professora Flora", voz `de-DE-SeraphinaMultilingualNeural`, -2%, +6Hz); acessórios inline `oculos-cientista`
   (lendário, `olho`), `lupa-exploradora` (raro, `pescoco`), `broto-cabeca` (comum, `cabeca`). 03 e 04 são
   `completar` com `livre: true`; 07 e 11 trazem a situação como `apoio`; 09 (ciclo da planta) é `ordenar`;
   10 e 11 viram `completar` com a resposta e o motivo no quadro.

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

## 10. Ciências: matéria, salas, unicórnios
1. Matéria (`ciencias/ciencias.js`): `id: 'ciencias'`, `nome: 'Ciências'`, `emoji: '🔬'`,
   `nomeLivro: 'Caderno do Cientista'`. Apostila: 2º ano, volume 3, capítulos 8 ("Seres vivos e suas relações",
   pp. 13 a 22) e 9 ("Características dos seres vivos", pp. 23 a 32); fotos na pasta Ciências da raiz (IMG_7528 a 7538).
2. Lugar: `{ nome: 'Laboratório de Ciências', artigo: 'o', dentro: 'observatorio', interior: 'observatorio-3' }`,
   sem `rect` nem `sprite`: a matéria mora no 3º andar do Observatório.
3. Salas (ids fixos; o andar do Observatório usa c1 a c5):

| Sala | Nome | Emoji | Páginas | Fotos | Cartas do livro |
|---|---|---|---|---|---|
| c1 | Vivo ou Não Vivo? | 🌱 | 13–15, 22 | 7528, 7529, 7533 | seres-vivos, fatores-abioticos, formigueiro |
| c2 | Quem Ganha, Quem Perde | 🐆 | 16–19 | 7530 | relacoes, alimentacao, competicao, prejuizo, sociedade |
| c3 | Amigos da Natureza | 🐃 | 18–22 | 7531–7533 | ajuda (e seres-vivos, fatores-abioticos, sociedade, competicao) |
| c4 | Cada Um no Seu Hábitat | 🏜 | 23–27 | 7533–7535 | habitat, caatinga, muito-quente, muito-frio, aquatico, terrestre |
| c5 | Detetives da Natureza | 🔎 | 28–32 | 7536–7538 | adaptacoes, observar (e muito-quente, muito-frio, habitat) |

4. Cartas do livro (ids fixos, nesta ordem): `seres-vivos`, `fatores-abioticos`, `formigueiro`, `relacoes`,
   `alimentacao`, `competicao`, `prejuizo`, `sociedade`, `ajuda`, `habitat`, `caatinga`, `muito-quente`,
   `muito-frio`, `aquatico`, `terrestre`, `adaptacoes`, `observar`.
5. Unicórnios (ids fixos): c1 `c-brotinho` (Brotinho, comum) e `c-formiguinha` (Formiguinha, raro); c2
   `c-pintadinha` (Pintadinha) e `c-colmeia` (Colmeia); c3 `c-beija-flor` (Beija-Flor) e `c-parceria` (Parceria);
   c4 `c-mandacaru` (Mandacaru) e `c-aguape` (Aguapé); c5 `c-lupinha` (Lupinha) e `c-feneco` (Feneco); épicos
   `c-cientista` (`treino: 'ouro'`) e `c-descoberta` (`treino: 'perfeito'`); lendário `c-rainha-natureza`
   (Rainha da Natureza, `materiaCompleta: true`). Épicos e lendário com `asa`.
6. Ícones dos emojis novos em `ciencias/icones.js` (`Reino.registrarIcones`, grupo `'icones'` no manifesto para o
   validador enxergar): 🔬 🐜 🐆 🐊 🦗 🐒 🐃 🌵 🐪 🐻 🦊 🐺 🦎 🦥 🪨 🐦 🟫 🍄.
7. Na sala c3, a questão dos pássaros adultos (p. 21, b) tem como resposta a competição (comem o mesmo alimento),
   como no bugio e na arara (p. 16). O que está marcado à mão na foto é da Mariana (§7).
