# 2026-11-12 — Conferir todas as questões do 4º bimestre

Pedido: "Verifique todas as questões do quarto bimestre, de modo a se certificar de que todas elas estão sem quebras
de layout, e com o conteúdo correto."

Tipo: ajuste ou correção de algo que já existe. Tamanho G (837 questões e 466 cartas em 6 matérias; conteúdo, CSS e
os tipos de desafio).

## O que é
- **Layout:** cada questão das 6 matérias do 4º bimestre (`matematica4`, `portugues4`, `ingles4`, `historia4`,
  `geografia4`, `ciencias4`) na tela real, no celular, no tablet e no notebook: na sala (missão, em branco, com a
  resposta certa posta e com o retorno aberto) e sozinha ("Hora da pergunta!", com o "Leia antes"). Nada cortado,
  vazando do cartão, sobreposto, coberto pelo rodapé, com palavra partida no meio ou com marcação aparecendo.
- **Conteúdo:** cada questão contra o livro da escola (`matérias/4 Bimestre/<matéria>/`, PDF e `INVENTARIO.md`):
  enunciado e dados iguais aos do livro, gabarito certo (resolvido de novo, não copiado), só uma resposta certa
  quando é de escolha, respostas digitadas que aceitam o que uma criança escreveria, explicação que bate com a
  resposta, português correto, figura e apoio que a pergunta cita presentes na tela.
- O que estiver errado é corrigido; o resto não muda.

## Onde aparece
Nas salas de livro das 6 matérias e em todo lugar onde a pergunta sai sozinha (Bosque e arenas, Vila, surpresa,
viagem).

## O que NÃO pode mudar
- Ids de matéria, sala, desafio, carta e `origem` (o save e o inventário usam).
- A redação das cartas do livro (palavra por palavra do livro), salvo erro de cópia comprovado na página.
- Dinheiro, estrelas, etapas, prêmios, vozes que não mudaram de texto.

## Pronto quando
- [x] A varredura de layout roda nas 837 questões, nos 3 tamanhos, na sala e sozinha, sem defeito aberto.
- [x] Cada questão foi lida contra a página do livro por uma frente e os defeitos têm correção conferida por outro agente.
- [x] `npm test` e `npm run e2e` verdes; vozes das falas que mudaram gravadas e conferidas (na integração).
- [x] Relatório com a lista do que foi corrigido (questão, o que estava errado, como ficou): "Feito", abaixo.

## Feito
- **Conteúdo:** as 837 questões conferidas uma a uma contra a página impressa por 11 frentes (matéria e capítulo),
  cada frente com um conferente que não fez o trabalho, e o diff inteiro por uma conferência final. Corrigidas 71
  questões e 5 cartas (50 arquivos):
  - enunciado que mandava fazer o que a tela não deixa (traçar, circular, pintar o gráfico, colar, desenhar,
    conversar com o colega): 31, quase todos em Matemática (caps. 11 e 12);
  - resposta certa que era recusada: número por extenso nas tabelas de Matemática, a divisão nas duas ordens
    (ma11a3-09, ma11a3-13), "rua"/"parque"/"mercado" com minúscula (lp12a4-10, lp12t2-12), "Como se chama você"
    (lp10t2-05), marcadores de tempo "ainda", "já", "de novo" (lp10a7-06/07, lp10t2-10), "conseguiu" (lp10a2-04),
    "florinha" (lp11a6-13), "Está incorreto." (lp12t2-08), «bored»/«reflective» nas duas fotos (en11p2-06), "não
    poluir" e "obras" (ge12t2-06, ge10a3-02), "celulose" tocada no papel (ge10a2-02);
  - resposta errada que passava: "cãozinho"/"pombinho" numa linha que diz cachorro e pássaro (lp11t2-04), nome de rua
    em minúscula (lp12t2-12), frase sem maiúscula (lp12t1-10);
  - pergunta que citava o que não estava na tela: `apoio` novo (lp10a7-03, ma12a9-09, en12p2-09, ma11a3-07) e a
    carta certa no "Leia antes" (lp10a4-09, ci10a3-04, ci10a3-05); o último giz (en12e2-11); as fotos descritas nas
    cartas ci-t01 e ci-t04;
  - figura que não batia com o texto: avião de madeira (ge10a1-01/03, carta ge-a03), garrafa de plástico
    (ge12t2-05), cidade no lugar do museu (cartas ge-a19 e ge-t06);
  - `INVENTARIO.md` de História (p. 14) e de Ciências (ATI p. 4) corrigidos.
- **Layout:** ferramenta nova, `npm run varredura` (`jogo/ferramentas/CLAUDE.md`, "Ver o jogo"): joga cada sala e
  abre cada pergunta sozinha nos 3 tamanhos, mede a tela e fotografa. Resultado final: 15.507 telas no modo normal e
  15.507 com Letras grandes, sem defeito. Todas as questões também foram lidas de olho, em fotos, antes e depois.
  Corrigido:
  - pergunta sozinha num painel (Bosque, Vila, surpresa) no notebook e no tablet: saía em duas colunas espremidas,
    com letra enorme, botões e tabelas cortados; agora uma coluna em qualquer largura de janela;
  - texto que não cabe nunca parte no meio nem vaza do botão: quebra entre palavras, desce um degrau (com os irmãos
    juntos) ou ganha o hífen da sílaba (`jogo/js/atividades/desafios/quebra.js`); "R$" preso ao número e o sinal
    preso à lacuna;
  - título da sala no cabeçalho do celular; rodapé do tablet; caixa de digitar que cresce para resposta longa ou
    pessoal; tabela larga vira ficha; `completar` com palavras longas;
  - maiúscula acentuada desenhada uma letra à esquerda nos versos do texto de apoio ("VOCÊ" saía "VOÊ");
  - figura que virava "?" quando o emoji tinha o seletor invisível (`ligar`, `completar`, `digitar`);
  - opções: a frase comprida (mais de 24 letras) ocupa a largura toda em vez de meia coluna, desde que nenhuma opção
    saia da tela por isso; opções com figura em grade que usa a largura; rótulo curto em inglês («I cry.») numa
    linha só; a letra volta ao tamanho cheio quando a tela alarga ou gira (ficava presa no degrau menor);
  - o que devia ficar junto e quebrava por dentro ("5 / reais", "No, / I / didn't.", "a / passarela"): o texto curto
    desce um degrau e fica inteiro na linha; no texto longo as palavras quebram como texto comum (menos linhas);
  - com Ajustes → Letras grandes: cerca de 2.000 quebras (palavra longa partida, botões e legendas vazando, fim de
    etapa).
- **Conferência do layout:** sete rodadas, cada uma com conferente que não fez o trabalho (medidas refeitas, e2e
  imagem por imagem, custo) e leitura das fotos; nenhuma pergunta de opção ficou com a última opção mais escondida
  do que antes da mudança (291 perguntas, 3 tamanhos, com e sem Letras grandes).

## Decidido pelo Claude
- **Botão "📖 Livro" na pergunta da sala de livro**, ao lado do "🔊 Ouvir": abre a página do livro daquela pergunta
  sem precisar errar antes. Motivo: 222 das 837 perguntas citam uma carta mostrada numa etapa ANTERIOR da sala (156
  sem apoio nem figura), e no livro da escola a página fica aberta enquanto a criança responde. Não aparece na
  pergunta sozinha, no treino nem na prova. Para tirar: não passar `aoLivro` em `jogo/js/atividades/missao.js`.
- Opções com rótulo em sequência ("a)", "b)"; "Foto 1", "Foto 2") ficam na ordem do conteúdo, sem sorteio.
- Células numéricas de tabela aceitam o número por extenso; as caixas de dinheiro do `digitar` continuam só com
  algarismo (a caixa cresceria).
- A conferência cobre também as cartas ("Leia antes") quando a questão depende delas.
- Frentes de conteúdo por matéria e capítulo (11), cada uma com um conferente; layout numa frente só.
- O modo Letras grandes entrou na conferência (o pedido fala de "todas as questões"). Nele, o texto curto de uma
  opção que não cabe numa linha desce para o tamanho normal em vez de quebrar ("5 reais", «I jump.»).
- A varredura de layout virou ferramenta do repositório, com teste que põe cada quebra de propósito.
- Fica como está (limite do tipo, não do conteúdo): em lp12t2-12, o `escrever` conta a 1ª palavra da frase como nome
  próprio ("Mariana mora na rua." vale).
- Fica como está (feio, não quebra; a varredura avisa `texto-esmagado`): legenda comprida de figura das cartas em
  coluna de 160 px, colunas do `ligar` no celular, célula de tabela com frase, e opção com figura de rótulo comprido
  (no tablet e no notebook a grade fica em 3 + 1).
- Fica como está (a varredura avisa `letra-sozinha`): no painel da pergunta sozinha do celular, 3 questões de nome
  comprido em coluna estreita ainda deixam uma letra sozinha na linha (en12p1-01, hi12t1-04, hi12t1-05; com Letras
  grandes também ge12t2-04).
