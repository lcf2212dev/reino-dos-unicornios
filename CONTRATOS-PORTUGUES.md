# Contratos: matéria Português (Casa das Palavras)

Branch `feat/materia-portugues`, worktree `/home/leandro/reino-portugues` (criada da main 9c061a7).
Estende `CONTRATOS-INTERIORES.md` e `CONTRATOS-NOVIDADES.md`, que continuam valendo inteiros.
Mudança de contrato: só o orquestrador.

## 0. Regras que valem para todo mundo
- O progresso real da Mariana é intocável: nada de porta 80, reinodosunicornios.local, IP da rede na porta 80,
  `jogo/servidor/dados/`, docker, artifact publicado, `localStorage.clear()`/`removeItem`, "Apagar tudo",
  "Novo ciclo" ou pagamento fora do teste. Só a worktree e o servidor de TESTE (porta 8789, banco temporário).
- Nada é escrito em `/home/leandro/Mariana Revisões` (a árvore principal, servida ao vivo).
- Nenhum campo novo no save, nenhuma regra nova. Português usa os campos de hoje com ids novos.
- Derrubar só servidores próprios, pelo PID. Nunca `pkill`/`killall` por nome (node, servidor.js, chrome).
- Testes só no Chromium do Playwright, em celular (390×844), tablet (820×1180) e notebook (1366×768).
- Convenções de sempre: scripts clássicos, `window.Reino`, nomes e comentários em português, pixel art em
  código (contorno `#3a2446`), todo emoji com ícone em `js/icones.js`.

## 1. Fotos
- Originais: `/home/leandro/reino-portugues/Português/` (IMG_7459 a 7485) e `Português/Revisão/` (7486 a 7488).
- JPEG para leitura (1400 px, já desvirados): `/tmp/claude-1000/-home-leandro-Mariana-Revis-es/c894d1ba-8f5b-4f06-8b13-e2a156c1afd5/scratchpad/fotos/`.
  As fotos da apostila mostram duas páginas lado a lado, deitadas (gire a cabeça); a 7465 está de cabeça para baixo.
- Para ampliar um trecho (frações da largura/altura da foto original):
  `uv run --with pillow --with pillow-heif python <scratchpad>/crop.py <original> <saida.jpg> x0 y0 x1 y1`
- O que está escrito à mão é da Mariana (ou da professora) e NUNCA é gabarito. Palavra coberta por escrita ou
  pintura (pp. 48, 69, 70, 78): não adivinhe; use só o que está legível.
- Textos de terceiros (receitas, o relato das irmãs Klink "Chegamos?"/"Os incríveis icebergs"): resuma com
  palavras próprias. Trecho curto da apostila só quando a questão depende dele.

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

## 2. Matéria (`js/materias/portugues.js`, montada pelo orquestrador)
`id: 'portugues'`, `nome: 'Português'`, `emoji: '📝'`, `nomeLivro: 'Livro das Letras'`.
Lugar: `nome: 'Casa das Palavras'`, `artigo: 'a'` (novo, opcional: "até a Casa", "salas da Casa"),
`sprite: 'palavras'`, `rect: { x: 22, y: 15, w: 5, h: 5 }` (clareira; na (23,4) a placa do Castelo cobria o telhado,
e ela fica livre), `placa: 'acima'`, `porCima: true` (novo, opcional: o lugar entra no mapa depois do sorteio dos
enfeites, como os EXTRAS, e o resto do reino fica com as mesmas árvores e flores). A placa da Loja das Fadas foi
para cima do telhado (ao lado ela cobria a casa).

| Sala | Nome | Emoji | Páginas | Fotos | Cartas do livro |
|---|---|---|---|---|---|
| p1 | Receita de Quê? | 🍓 | 30–36, 51–54 (54: questões 1 e 2) | 7459–7462, 7469–7471 | receita, partes-receita, passo-a-passo |
| p2 | O H Silencioso | 🌿 | 37–41, 54 (questão 3) | 7462–7464, 7471 | letra-h |
| p3 | CH, LH, NH e o X | 🐣 | 42–50, 55–56 | 7465–7469, 7471, 7472 | digrafos, x-ou-ch, sons-do-x |
| p4 | Expedição Antártida | 🧊 | 57–68 | 7472–7475, 7477–7479 | relato, tempo-no-relato, som-de-s, ponta-iceberg |
| p5 | L, R e RR | 🎠 | 69–80 | 7479–7485 | silabas, l-r-final, r-rr |

### 2.1 Rascunho de uma sala (`rascunho/portugues-pN.js`, fora do jogo)
```
/* Rascunho da sala pN: montado em js/materias/portugues.js por ferramentas/montar-portugues.js */
Reino.RASCUNHO_PORTUGUES = Reino.RASCUNHO_PORTUGUES || {};
Reino.RASCUNHO_PORTUGUES.pN =
    {
      id: 'pN', nome: '…', emoji: '…', paginas: 'pp. … a …',
      intro: '…',
      desafios: [
        { id: 'pN-01', tipo: 'escolha', livro: '<carta>', pagina: 32, pergunta: '…', opcoes: [{ e: '🍓', t: '…' }, …], certa: 0,
          explica: '…' },
        …
      ],
    };
```
- Estilo igual ao de `js/materias/historia.js` (indentação de 4 espaços na sala, 8 nos desafios). O trecho
  depois de `=` entra no arquivo final do jeito que está.
- Todo desafio tem `pagina` (número da página da apostila de onde ele vem; campo novo, só informativo, o jogo
  ignora), `livro` (uma das cartas da tabela) e `explica`.
- Pelo menos 12 desafios, variados; pelo menos 6 de `escolha`, `vf` ou `varias` (a pergunta surpresa e o treino
  do Castelo usam só esses três). Tipos das salas: escolha, vf, varias, ligar, ordenar, frase, separar,
  completar, memoria.
- Textos curtos, para uma criança de 7 anos, com as palavras da própria apostila.
- Adivinhas e ditado viram escolha ou completar; produção de texto vira ordenar passos, montar frase com
  blocos ou identificar partes; nada de "desenhe"/"recorte".
- Letras sozinhas em MAIÚSCULAS ("usando X ou CH", "a letra H"): a voz lê o nome da letra (xis, cê agá,
  éle agá, ene agá, ésse, dois ésses, zê, érre, dois érres, éle, agá).
- Palavra com lacuna dentro dela (xí__ara): use `completar` com `colado: true` (§4.2). Nas salas, a narradora
  lê só o enunciado desse tipo.
- Separação de sílabas: escreva em minúsculas com hífen (`bal-de`).
- Ligar: a palavra mais comprida da coluna da esquerda + a da direita até 24 letras (senão, no celular,
  quebra palavra ou vaza); `validar-conteudo.js` avisa.
- Emoji: prefira os que já têm desenho em `js/icones.js` (ver `jogo/ferramentas/icones.html`). Emoji novo:
  liste no retorno (o orquestrador pede o desenho).
- Validar sozinho, sem tocar no arquivo do jogo:
  ```
  cd /home/leandro/reino-portugues/jogo
  node ferramentas/montar-portugues.js --parcial --saida /tmp/<seu-nome>/portugues.js
  node ferramentas/validar-conteudo.js --materia /tmp/<seu-nome>/portugues.js
  ```

### 2.2 Base (`rascunho/portugues-base.js`)
```
Reino.RASCUNHO_PORTUGUES = Reino.RASCUNHO_PORTUGUES || {};
Reino.RASCUNHO_PORTUGUES.livro =
  [
    { id: 'receita', e: '🍓', titulo: '…', texto: '…' },
    …
  ];
Reino.RASCUNHO_PORTUGUES.unicornios =
  [
    { id: 'p-pitada', nome: 'Pitada', raridade: 'comum', sala: 'p1', cores: { corpo, crina: [3 cores], chifre }, frase: '…' },
    …
  ];
```
Cartas (ids fixos, nesta ordem): `receita`, `partes-receita`, `passo-a-passo`, `letra-h`, `digrafos`,
`x-ou-ch`, `sons-do-x`, `relato`, `tempo-no-relato`, `som-de-s`, `ponta-iceberg`, `silabas`, `l-r-final`, `r-rr`.

Unicórnios (ids fixos):

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

## 3. Personagens (`Reino.NPCs.ELENCO`, já no npcs.js; perfis `npc-<id>` já no config.js)
| id | Nome | Onde | Ação |
|---|---|---|---|
| palavrinha | Dona Palavrinha | Hall | `{ tipo: 'guia', lugar: 'materia:portugues', livro: 'portugues' }` |
| manu | Chef Manu | Cozinha das Receitas | sala p1 |
| heitor | Jardineiro Heitor | Horta do H | sala p2 |
| chocalho | Palhaço Chocalho | Pátio do Circo | sala p3 |
| brisa | Capitã Brisa | Porto da Expedição | sala p4 |
| carlos | Seu Carlos do Carrossel | Parque do Carrossel | sala p5 |
| clara | Cavaleira Clara | Castelo, ala de Português | `{ tipo: 'treino', materia: 'portugues' }` |
| lucia | Professora Lúcia | Escola, sala da prova | `{ tipo: 'prova', prova: 'portugues-3bim' }` |

Opções novas do gerador de sprites (npcs.js, feitas pelo construtor do prédio, sem mudar as de hoje):
`chapeu: 'chef'` (touca alta branca), `chapeu: 'quepe'` (quepe de capitã, com `chapeuCor`) e `nariz: '<cor>'`
(nariz redondo de palhaço). Personagens não imitam pessoas reais (nem os autores da apostila).

## 4. Extensões de motor (aditivas: sem os campos novos, tudo sai igual a hoje)
### 4.1 Texto de apoio (qualquer desafio ou questão)
```
apoio: { titulo: 'Salada de frutas',
         partes: [ { titulo: 'Ingredientes:', lista: ['1 banana', …] },
                   { titulo: 'Modo de preparo:', texto: 'Lave bem as frutas. …' } ] }
```
Caixa "texto de apoio" acima do enunciado, sempre visível, com botão "🔊 Ouvir o texto" (narradora, lendo
`Reino.Falas.segmentosApoio(apoio)`: título, título de cada parte, cada item da lista, o texto). As falas
entram no pacote da prova ou da sala (já em `js/falas.js`).
### 4.2 `completar` (campos novos)
- `colado: true` (no desafio): a lacuna fica dentro da palavra, sem espaços (`PA` + lacuna + `ARINHO`), com a
  lacuna mais curta. A narradora lê só o enunciado.
- `frases[i].img: 'palavra:cachorro'` + `frases[i].alt: 'cachorro'`: figura de `window.ICONES` antes da palavra
  (desenho que falta: ❓, sem quebrar). Muitos itens com figura ficam numa grade compacta.
- `frases[i].aceitas: [j, …]`: outros índices de `palavras` também certos, além de `certa` (itens com mais de
  uma palavra válida: CA_O = carro ou caro). Vale na pontuação, na conferência e na revisão; a resposta
  certa mostrada é a de `certa`, com "(ou …)" para as aceitas.
### 4.3 Tipo novo `copiar` (questão 11 da prova)
```
{ tipo: 'copiar', pergunta, itens: [ { letra: 'a', opcoes: ['PASEIO', 'PASSEIO'], certa: 1 }, … ], explica, livro }
```
Cada item: "a) ( ) PASEIO ( ) PASSEIO": ela toca na escrita certa; embaixo, "Resposta:" montada tocando nas
peças de letras (as letras das duas escritas, sem repetir as comuns além do necessário, embaralhadas; tocar
numa letra colocada tira). Valor: `[{ escolha: i | null, letras: [índices das peças] }]`. Pronto: todo item com
escolha e com tantas letras quanto a escrita escolhida. Pontuação: 2 partes por item (escolheu a certa; a
cópia forma `opcoes[certa]`), em fração, como as outras questões com partes.
### 4.4 Onde
`js/minijogos.js` (render, `pontuar`, `linhaCerta`, `linhaValor`, `conferir`), `js/provas.js` (tempo mínimo de
leitura e lista de revisão com os tipos novos), `css/jogo.css` (estilos), `ferramentas/validar-conteudo.js`
(`copiar` e os campos novos). As provas de História e de Inglês e as salas de hoje ficam idênticas.

## 5. Prova (`js/provas/portugues-3bim.js`)
`id: 'portugues-3bim'`, `materiaId: 'portugues'`, `nome: 'Revisão Bimestral de Português'`,
`bimestre: '3º bimestre'`, `emoji: '📝'`, questões `pb3-01` a `pb3-12`.
Acessórios: lendário `chapeu-chef-arco-iris` "Chapéu de Chef Arco-íris" (slot cabeca), raro `cachecol-pinguim`
"Cachecol de Pinguim" (pescoco), comum `lacinho-morango` "Lacinho de Morango" (orelha).
Figuras da questão 10: `palavra:<nome>` em `js/icones.js` (32×32): cachorro, chocolate, chupeta, chave, mochila,
cachecol, palhaco, milho, folha, olho, coelho, ovelha, ninho, quinhentos, golfinho, dinheiro, pinheiro, aranha.

Folha (IMG_7486 a 7488), notas da leitura do orquestrador:
- "SALADA DE FRUTAS" (depois de "LEIA O TEXTO:") está escrito à mão, com letra de adulto; o texto impresso não
  traz o título. No jogo o título aparece no texto de apoio (é a resposta da questão 1). Ponto para o Leandro.
- Questão 8: a) a d) impressos; e) CA_A, f) _AIA, g) CA_ACO escritos à mão (letra de adulto); h) riscado com
  "REPETIDA". Fica e) a g), sem o h). Ponto para o Leandro.
- "13.e)" impresso na questão 12 vira "e)".
- Itens com mais de uma palavra válida: 12a CA_O (carro/caro), 12c CA_ETA (careta/carreta), aceitas.
  Decisão da Fase 2: as raras 8e CA_A (cassa), 8g CA_ACO (cassaco) e 12f FE_O (fero) NÃO são aceitas — a prova
  imita a correção da professora. Na sala p3, NI_O aceita ninho e nicho (treino).

## 6. Prédio (lugar `materia:portugues`)
- Desenho de fora: `Mapa.PREDIOS.palavras`, registrado pelo próprio prédio (como a Pet Shop): casinha de
  cozinha com chaminé, livros e uma bandeirinha de expedição; cores próprias; a placa não cobre os vizinhos.
- Interior: `js/interiores/portugues-falas.js` (`Reino.FALAS_INTERIORES.portugues = { npcs, objetos, extras? }`) e
  `js/interiores/portugues.js`; ids `portugues` (entrada) e, se houver andares ou alas, `portugues-<n>`; todos com
  `pacote: 'interior-portugues'`. Objetos temáticos `portugues-<nome>`.
- Cômodos: Hall (Dona Palavrinha, lista das salas e Livro das Letras no púlpito), Cozinha das Receitas, Horta do H,
  Pátio do Circo (amarelinha no chão), Porto da Expedição (icebergs, pinguins, focas, albatroz), Parque do
  Carrossel. Critério de "rico" dos contratos, objetos da apostila, quadro do unicórnio raro em cada sala.
- Castelo: `CAVALEIROS.portugues = 'clara'` e um tema de ala `TEMAS.portugues`. Escola:
  `PROFESSORES['portugues-3bim'] = 'lucia'`. Falas próprias nos `-falas.js` de cada prédio.
- Falas fixas do Claude que citam só História ("revisar História", "ótima historiadora", "esse museu",
  "O Museu e a Torre…"): genéricas ou só na matéria certa; nenhuma numa sala de Português.

## 7. Vozes
Pacotes: `portugues-p1` a `portugues-p5`, `portugues-extra`, `portugues-livro`, `interior-portugues`,
`prova-portugues-3bim`. Falas de personagem até 30 letras por página, frases de 3+ palavras. Gravação e
conferência por transcrição: só o orquestrador. Amostras 37 a 44 em `amostras-de-voz/`.

## 8. Arquivos e donos (Fase 1)
| Quem | Arquivos (e só eles) |
|---|---|
| orquestrador | index.html, js/config.js, js/npcs.js (ELENCO), js/falas.js, js/main.js, js/materias/portugues.js, ferramentas/listar-falas.js, ferramentas/montar-portugues.js, CONTRATOS-PORTUGUES.md, COMO-USAR.md, js/voz/*, amostras-de-voz/ |
| Sala p1…p5 | rascunho/portugues-pN.js |
| Livro e unicórnios | rascunho/portugues-base.js |
| Motor | js/minijogos.js, js/provas.js, css/jogo.css, ferramentas/validar-conteudo.js |
| Prova | js/provas/portugues-3bim.js |
| Arte | js/icones.js, js/pixelart.js, ferramentas/acessorios.html, ferramentas/icones.html |
| Prédio | js/interiores/portugues-falas.js, js/interiores/portugues.js, js/npcs.js (só o gerador: chef, quepe, nariz), ferramentas/interiores.html (lista) |
| Castelo e Escola | js/interiores/castelo.js, castelo-falas.js, escola.js, escola-falas.js, js/claude.js (só as falas fixas) |

Servidor de teste: `http://127.0.0.1:8789/?debug=1` (worktree, banco temporário). Saves sintéticos em
`<scratchpad>/saves/`: `sem-portugues.json`, `portugues-metade.json`, `prova-premiada.json`.
