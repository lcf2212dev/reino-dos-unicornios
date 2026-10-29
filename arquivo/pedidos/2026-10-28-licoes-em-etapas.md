# Plano: Língua Portuguesa em etapas curtas (com casa maior e mais NPCs)

## Contexto
A Mariana (7 anos, autismo nível 1 e TDAH moderado) acha as lições de Língua Portuguesa (`portugues4`, 25 salas de
livro na Casa das Palavras) demoradas demais. Hoje cada sala é um bloco só: até 13 cartas de leitura (até ~930
palavras, ex.: `lp10a1`) e depois até 14 desafios (vários `escrever`), sem pausa. Sair no meio perde tudo
(`missao.js:41-48`; só a `producoes` fica).

O save publicado (um `GET /api/progresso` só de leitura, a seu pedido; nada gravado nem copiado) mostra:
- 7 salas feitas (lp10a1, a3, a4, a5, a6, lp10t2, lp11a1), entre 16 e 19/10;
- 4 salas **começadas e abandonadas**: lp10a2, lp11a2, lp11a6 e lp12t1 têm respostas escritas em `producoes`, mas não
  estão em `salas`. O tamanho da sala está fazendo ela desistir no meio;
- lp10a5 (5 desafios `marcar`) feita com 0 de primeira.

**Objetivo:** cada sala vira uma trilha de **etapas curtas** (~3–5 min: um pouco de leitura e logo as perguntas
daquela leitura). Cada etapa fica guardada ao terminar, e ela pode parar entre uma etapa e outra sem perder nada.
A casa ganha um andar, mais cômodos e 4 NPCs novos, para a pausa ser um passeio e não uma saída.

## Decisão central: etapas DENTRO da sala (o id da sala não muda)
Trocar uma sala por várias salas com ids novos faria as 7 salas feitas sumirem da contagem e travaria matéria completa,
lendário e treino. Também mudaria o valor em Robux de cada sala e quebraria unicórnios, estações e validadores.

Por isso:
- `sala.id`, `P.salas`, `P.concluirSala`, Robux (20 por sala, 500 por matéria), estrelas, ovos, unicórnios e pacotes de
  voz das salas **não mudam**;
- tudo o que ela já fez continua igual;
- a novidade é só uma camada de etapas e um campo novo e aditivo no save.

### Como a sala é dividida (automático, números no config)
O novo arquivo `jogo/js/atividades/etapas.js` (`node: true`) expõe `Reino.etapasDaSala(materia, sala)`, que divide
uma sala de livro assim:
1. Os desafios seguem a ordem do arquivo. Uma etapa fecha ao chegar a `etapaDesafiosMax` (4) pontos, em que
   `escrever` e `desenho` valem `etapaPesoEscrever` (2) e o resto vale 1.
2. Cada carta entra na etapa do **primeiro desafio que a cita** (`desafio.livro`). Carta que nenhum desafio cita vai
   com a carta seguinte. Dentro da etapa, as cartas ficam na ordem do livro.
3. Se as cartas de uma etapa passam de `etapaCartasMax` (3) ou `etapaPalavrasMax` (250), as primeiras viram etapa(s) só
   de leitura antes dela. É o caso do conto longo do `lp10a1`.
4. Uma sala pode trazer `etapas: [n, n, …]` (quantos desafios em cada etapa) para ajuste à mão. Nenhuma sala precisa
   disso agora.
5. A divisão é determinística: a mesma sala dá sempre as mesmas etapas, e o save guarda o índice delas.

Garantias, conferidas por teste: toda carta e todo desafio aparecem exatamente uma vez, a ordem relativa dos desafios
se mantém, e nenhuma etapa passa dos limites (fora uma carta grande sozinha).

A expectativa é de 3 a 5 etapas por sala, umas 90 no total. O validador imprime a tabela, sala por sala, para conferência.

### Save: campo novo `etapas` (aditivo, `save-e-mescla.md` §11)
O campo é declarado em `jogo/js/sistemas/etapas-progresso.js`:
- formato: `etapas: { <salaId>: { rodada: <vezes da sala quando começou>, feitas: { <n>: { a: acertos de primeira, t: total, p: pressas, em } } } }`;
- `registrarCampo('etapas', { padrao: {}, mesclar: função própria, novoCiclo: 'zera', copiaSeguranca: true, exemplos })`;
- mescla: por sala vale a `rodada` maior; na mesma rodada, união das etapas, e se a mesma etapa aparece nos dois
  aparelhos fica a de `em` mais novo. É comutativa e idempotente, e o contrato roda sozinho em `save-campos.test.js`;
- ao terminar uma etapa, o jogo grava a entrada e chama `salvar()`;
- ao terminar a **última** etapa, chama `P.concluirSala(materia, sala, { acertosPrimeira: Σa, total: Σt, pressas: Σp })`
  com os números somados das etapas. Dinheiro, estrelas, calma, perfeita, ovo comum, raro e persistência saem
  exatamente como hoje;
- a entrada da sala **não é apagada**: quando `salas[id].vezes` sobe, a `rodada` antiga fica velha e é ignorada, e
  replay começa da etapa 1. Nada se apaga e a mescla com outro aparelho continua segura;
- save antigo (sem o campo), as 7 salas feitas e as respostas em `producoes` carregam igual. Uma sala feita aparece
  como feita, e jogar de novo vai por etapas;
- PWA ou aba com versão antiga: o campo desconhecido é preservado (§6.6). Isso vai ser provado com teste de dois
  aparelhos, versão antiga por `git show` num `vm` (§10).

As salas abandonadas (lp10a2, lp11a2, lp11a6, lp12t1) não ganham etapas por dedução: só desafios escritos ficam em
`producoes`. Quando ela voltar, as respostas escritas já aparecem preenchidas (comportamento de hoje), então refazer
essas etapas é rápido. (decidido pelo Claude)

### Na missão (`jogo/js/atividades/missao.js` e partes)
- **Abrir a sala** mostra a **trilha das etapas**: bolinhas ✓ feita, ▶ a próxima, e as outras apagadas, com "Etapa 2 de
  4". "Começar" abre a próxima etapa não feita; numa sala já feita, abre a etapa 1.
- **Uma etapa** mostra as cartas dela e depois os desafios dela, com a trilha atual ("Carta 1 de 2 / Desafio 3 de 4")
  contando só a etapa.
- **Fim da etapa:** uma tela curta com festa leve, "Etapa guardada!" e a fala da guia, e dois botões:
  - "Próxima etapa ▶";
  - "Descansar 🌿": fecha, tudo já está guardado, e a guia sugere o Cantinho do Respiro.
  
  Na última etapa vem a tela de sala concluída de hoje.
- **✕ no meio de uma etapa:** a confirmação passa a dizer que as etapas anteriores estão guardadas. Só a etapa atual
  recomeça.
- **Tela da matéria** (`ui/materia.js`) e **estação** (`lp-objetos.js` `estadoSala`): novo estado "em andamento", com
  o selo ◐ e "2/4" no rótulo, ao lado de ❗ nova, ✓ feita e raro. O menu Lugares continua contando salas feitas.
- **Ajustáveis** em `jogo/js/nucleo/config.js`: `etapaDesafiosMax`, `etapaPesoEscrever`, `etapaCartasMax`,
  `etapaPalavrasMax`.

Vale para toda sala `ordem: 'livro'`, então as matérias seguintes do 4º bimestre já nascem em etapas. As salas
sorteadas (6 desafios) não mudam.

## A Casa das Palavras: mais cômodos e mais NPCs
Hoje são 7 cômodos no térreo, com galerias de 7 estações (apertadas) e ateliês sem NPC. A proposta (decidido pelo
Claude):
- **Térreo** (`portugues.js`): saguão e as 3 galerias do Livro de Aprendizagem como hoje, mas cada galeria fica só com
  as salas 1–4 do capítulo. A fileira de cima (onde hoje ficam os ateliês) vira a **Sala de Leitura** de cada capítulo,
  com as salas 5 em diante. Menos estações por cômodo, menos poluição visual. Uma **escada no saguão** sobe para o 1º
  andar.
- **1º andar novo** (`portugues-1`, arquivo `lp-andar1.js` no modelo do `observatorio/nasa-andar.js`;
  `lugar: 'materia:portugues'`, pacote `interior-portugues`):
  - os 3 **ateliês do Livro de Atividades**, maiores, cada um com o NPC anfitrião dele;
  - o **Cantinho do Respiro**: pufes, almofadas, aquário, plantas, bebedouro, luz suave, um NPC calmo com falas de
    pausa ("Respira devagar…", "Você já guardou X etapas hoje!") e nenhum desafio.
- **4 NPCs novos**, reservados na onda 0 em `interiores/portugues/reservas.js`, nomes e vozes escolhidos no
  `npm run vozes-elenco`, diferentes das 4 de hoje e dos perfis antigos do prédio:
  - anfitrião do Ateliê 10, adulto;
  - anfitriã do Ateliê 11, adulta;
  - anfitrião do Ateliê 12, jovem;
  - guardiã do Cantinho do Respiro, idosa.
- Os NPCs de hoje ganham uma fala que convida para a próxima etapa e outra que lembra que pode descansar.
- O mapa da casa (`lp-mapa`: desenho e fala) mostra os dois andares.
- Todo cômodo cumpre o critério de "rico" (`interiores.md` §7), e `VAGAS` vai para galeria / sala de leitura / ateliê.
- Como ela acha: tudo continua entrando pela mesma porta e pelo "Ir" do menu Lugares, até o saguão. A Bibliotecária
  Letícia aponta a escada, e o fim de cada etapa aponta o Cantinho.

## Prêmio da trilha perfeita (pedido do Leandro)
Cada sala de Língua Portuguesa terminada **sem errar nada** dá três prêmios, só dela:
1. **Um acessório lendário** para o unicórnio.
2. **Uma carta de experiência** nova.
3. **Um elemento químico** novo.

Ela pode refazer até conseguir.

### O que conta como "sem errar"
- Cada etapa vale ⭐ quando é feita com todos os desafios certos de primeira (`acertos === total`).
- A **trilha perfeita** é ter ⭐ em todas as etapas da sala, mesmo que em tentativas diferentes.
- Para refazer, ela toca numa etapa ✓ sem ⭐ na trilha e repete **só aquela etapa**, curta, sem precisar refazer a sala
  inteira.
- A trilha mostra "⭐ 3 de 4: falta 1 etapa para o prêmio lendário!".
- Não se exige calma nem pressa: nada premia terminar primeiro.
- Persistência: por pedido seu, este prêmio só sai sem erros (a mesma exceção da nota 10 da Escola). O raro, os Robux e
  o resto da sala continuam com o caminho por persistência de hoje.

### Os três prêmios (decidido pelo Claude)
- **Acessório lendário:** um por sala (25), com o tema da lição. Exemplos: Botas do Gato (`lp10a1`), Coroa de
  Vitória-Régia (`lp10a4`).
  - É enfeite de unicórnio (`usando.enfeites`, âncoras de hoje, desenho inline como os prêmios das provas,
    `registros.js:30-43`). A personagem não tem slot de acessório, e criar um seria um sistema à parte.
  - Ao ganhar, ela recebe `loja[id] = true` e o enfeite aparece na vitrine da Loja como "lendário".
  - A Loja passa a conhecer a origem "trilha": `L.premios()` e `L.estadoPremio` em `loja-itens.js:138,164` ganham a
    fonte nova. Enquanto não ganho, o item mostra "Faça a trilha de <sala> sem errar".
- **Carta de experiência:** um álbum novo, "Experiências do Reino", com 25 cartas no visual do Álbum de ETs: silhueta
  "?" até ganhar.
  - Cada carta traz uma experiência simples e segura, feita **com um adulto**: o que precisa, os passos, o que acontece
    e por quê.
  - Cada uma é ligada ao elemento ganho junto (ex.: iodo e amido).
  - O texto é curto, com páginas de até 30 letras, e tem voz.
  - O álbum abre no Laboratório de Química (uma estante nova) e pelo botão "Ver carta" da tela do prêmio.
- **Elemento químico:** 25 cartões novos de elemento (os 24 de hoje continuam abertos, nada se fecha), por exemplo
  Ti, Cr, Mn, Ni, Zn, Br, Sn, I, Pt, Hg, Pb.
  - Ficam com "?" na tabela até serem ganhos, com a dica "Ganhe numa trilha perfeita de Língua Portuguesa".
  - São gravados pelo `Q.descobrir('elementos', 'z<n>')` (grupo novo em `sistemas/quimica.js:13-20`). Os elementos
    usam `z` e não `id`, então `descobertas()` precisa de ajuste.
- **Galeria dos Tesouros** (cômodo novo no 1º andar da Casa): 25 pedestais, um por sala. Prêmio ganho fica aceso; o
  que falta mostra "?" com o nome da sala.

### Save
- Campo novo `trilhas: { <salaId>: em }`: a data em que a trilha virou perfeita. Usa `registrarCampo` com mescla
  própria (por sala, o menor `em`), `novoCiclo: 'mantem'` e `copiaSeguranca`. O prêmio não some no Novo ciclo.
- As ⭐ de cada etapa ficam no campo `etapas`, numa parte `perfeitas: { <n>: em }` fora da `rodada`, e passam por
  união na mescla. Assim, refazer a sala não apaga ⭐ já ganha.
- A entrega dos prêmios é derivada e idempotente: `P.conferirTrilhas()` roda junto do `conferirPersistencia` (ao
  abrir o jogo e ao mesclar).
  - Para cada sala em `trilhas` ou com ⭐ em todas as etapas, garante `loja[acessório]` e `quimica.elementos` /
    `quimica.experiencias`.
  - Prêmio ganho num aparelho aparece no outro.
- **Retroativo:** sala que já está em `salas` com `perfeita: true` conta como trilha perfeita. No save dela isso vale
  para a `lp10a1`, então ela ganha os 3 prêmios dessa sala no primeiro acesso, com festa ao entrar na Casa.

### Tela
Na última ⭐ da trilha vem uma festa maior, com três cartões: o acessório no unicórnio dela ("Usar agora"), o
elemento e a carta de experiência. A Bibliotecária Letícia fala do prêmio. Um evento novo
`Reino.EVENTOS.TRILHA_PERFEITA` é documentado em `eventos.js`.

## Frentes (skill `orquestrar-frentes`, `npm run plano`)
- **Onda 0, contrato** (quem orquestra):
  - API `Reino.etapasDaSala`, formato do campo `etapas`, números no config;
  - reservas dos 4 NPCs;
  - `docs/contratos/quarto-bimestre.md` §3: as regras das etapas ficam aqui, em lugar nenhum mais;
  - linhas no manifesto.
- **A, motor e save:** `atividades/etapas.js`, `sistemas/etapas-progresso.js`, o fluxo de etapas em `missao.js`,
  `concluirSala` com as somas. Testes: divisão, campo, dois aparelhos (antigo e novo), sala inteira por etapas com o
  mesmo prêmio de antes.
- **B, telas:** trilha das etapas na intro, tela de fim de etapa, ◐ na tela da matéria e no selo da estação, CSS
  (celular, tablet, notebook, teclado Tab/Enter/Esc, sem animação quando desligada).
- **C, casa:** térreo redistribuído, `lp-andar1.js`, escadas pareadas, Sala de Leitura, Cantinho do Respiro, objetos
  novos com ícones, 4 NPCs e falas, mapa da casa.
- **D, prêmio da trilha:** campo `trilhas`, ⭐ por etapa, `conferirTrilhas` (incluindo o retroativo), origem "trilha"
  na Loja, festa do prêmio e evento. Depende de A.
- **E, acessórios:** 25 enfeites lendários (desenho, ícone, nome, tema), em `portugues4/premios-trilha.js`, que
  registra `{ sala, acessorio, elemento, experiencia }` sem mexer nos arquivos das salas. Dois workers: cap. 10 e
  cap. 11–12.
- **F, química:** 25 cartões de elemento, 25 cartas de experiência, grupos novos no `Q.descobrir`, bloqueio com "?" na
  tabela, Álbum de Experiências e a estante no laboratório. Dois workers: elementos e experiências.
- Contando as frentes, os conferentes e as vozes, fica dentro do teto de 8 agentes ao mesmo tempo.
- Um conferente para cada frente, lançado assim que ela termina.
- Depois, quem orquestra: `npm run vozes` (falas novas e de NPC), skill `validar-vozes` para os 4 perfis,
  `validar-tudo`, troca da base do e2e (as cenas da casa e das salas mudam de propósito) e `npm run integrar --
  feat/licoes-em-etapas --commit --merge --push`, e por fim `npm run vercel -- --conferir`.

## Verificação
- `node jogo/ferramentas/validar/validar-conteudo.js` e `cobertura-4bim.js portugues4` (nada some nem duplica) e a
  tabela de etapas por sala (nenhuma passa dos limites).
- `npm run unidade -- --so quarto-bimestre` e testes novos:
  - fazer as etapas 1 e 2, sair, recarregar e voltar: começa na 3;
  - terminar todas as etapas: Robux, estrelas e ovo iguais aos da sala feita de uma vez;
  - save sintético que imita o dela (7 feitas e `producoes` em 4 abandonadas): as 7 continuam ✓, nada some, e as
    respostas aparecem preenchidas.
- Testes do prêmio:
  - errar uma etapa não dá prêmio; refazer só aquela etapa sem errar dá os 3;
  - save com `salas.lp10a1.perfeita` recebe os prêmios uma vez só;
  - Novo ciclo não tira os prêmios;
  - dois aparelhos: o prêmio ganho num aparece no outro;
  - `validar-conteudo` / `validar-enfeites` nos 25 acessórios;
  - química com 49 elementos, 25 com "?".
- `node jogo/ferramentas/testes/testar-save.js` com dois aparelhos (versão antiga e nova) e `save-campos.test.js`.
- `npm run validar` (interiores ricos, escadas, NPC por cômodo), `npm run tamanho`.
- `npm run ver -- --ir portugues` e `--ir portugues-1` nos 3 tamanhos, e uma sala percorrida etapa por etapa no
  servidor de teste.
- `npm test` e `npm run e2e`, com a base trocada na mesma integração.
- Nunca: gravar no banco da Vercel, save real, servidor de casa, artifact ou Docker.

## Fora deste plano (observação)
A lp10a5 terminou com 0 de primeira em 5 desafios `marcar`: tocar em sinais pequenos pode estar difícil para ela.
Vale um pedido à parte para olhar o `marcar` no celular.
