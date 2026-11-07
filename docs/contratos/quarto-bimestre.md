# Contrato: quarto bimestre (livros inteiros)

Cobre como o material do 4º bimestre entra no jogo: cada matéria nova ocupa o prédio da própria matéria,
reproduz os livros da escola página por página (conteúdo em cartas ricas, questões em desafios na ordem do livro) e
deixa o banco pronto para a Revisão da Escola. A temporada e o catálogo do 3º bimestre: `bimestres.md`. Tipos de
desafio, livro e salas em geral: `conteudo.md`. Prédio e andares: `interiores.md`.

## Índice
1. Onde está no código · 2. Matéria do 4º bimestre · 3. Sala de livro (`ordem: 'livro'`) · 4. Cartas ricas ·
5. Vozes por capítulo · 6. Rastreio do inventário (`origem`) · 7. No prédio da matéria · 8. Produções salvas ·
9. Banco para a Revisão · 10. Matéria seguinte (receita curta) · 11. Antes de mexer · 12. Tipos de desafio do livro (12.1 A pergunta sozinha) ·
13. Etapas da sala de livro · 14. Trilha perfeita (prêmio lendário)

## 1. Onde está no código
- Conteúdo: `jogo/js/conteudo/materias/<m>/` (uma sala por arquivo, `livro-<cap>.js` com as cartas de cada capítulo,
  `<m>.js`, `icones.js`). Português: `<m>` = `portugues4`.
- Inventário (checklist de cobertura, uma seção por página impressa): `matérias/4 Bimestre/<matéria>/INVENTARIO.md`.
- Cartas ricas e livro com os dois livros: `jogo/js/ui/materia-livro.js` (`UI.desenharCarta`, `UI.falaCarta`,
  `UI.abrirLivro(materia, cartaoId, livroOrigem?)`; ação `{ tipo: 'tela', tela: 'livro', materia, livro }`) e
  `css/ui-livro-blocos.css`; tela da matéria agrupada por capítulo e livro em `jogo/js/ui/materia.js`.
- Ilustrações maiores que um ícone (cenas, poema visual): `Reino.registrarIlustracao` (`jogo/js/arte/ilustracoes.js`),
  desenhos da matéria em `<m>/ilustracoes.js`.
- Sala de livro: `jogo/js/atividades/missao.js` (lista e resumo), `jogo/ferramentas/validar/validar-conteudo.js`.
- Língua Portuguesa no térreo da Casa das Palavras: `jogo/js/interiores/portugues/` (`portugues.js` = o layout;
  `lp-*.js` = pessoas, falas e objetos); o layout do 3º bimestre em
  `arquivo/terceiro-bimestre/jogo/js/interiores/portugues/portugues.js`.
- English na Torre do Relógio: `jogo/js/conteudo/materias/ingles4/` e `jogo/js/interiores/torre/` (`interiores.md` §9.5.1).
- Ciências da Natureza (`ciencias4`) no Laboratório de Ciências (`observatorio-3`, `jogo/js/interiores/observatorio/lab-andar3.js`,
  `ci-*.js`; o lugar dela fica dentro de `materia:ciencias`), Geografia do Mundo (`geografia4`) na Estação dos Caminhos
  (`interiores/geografia/`), História da Gente (`historia4`) no Museu das Memórias (`interiores/museu/`) e Matemática do
  Dia a Dia (`matematica4`) na Torre dos Números, com interior próprio (`interiores/matematica/`): `interiores.md` §9.5.2.
- Produções (escrita livre e desenho salvos): campo `producoes` (`jogo/js/sistemas/producoes.js`).

## 2. Matéria do 4º bimestre
1. Catálogo separado do 3º bimestre (`bimestres.md`): ids novos de matéria, sala, desafio, carta e unicórnio; nunca
   `arquivada`. `bimestre: 4` na matéria.
2. Nome diferente do da matéria arquivada (a cor do `arte.md` §22 é por nome): Português do 4º bimestre é
   **Língua Portuguesa** (o nome da capa do livro), id `portugues4`, cor `#8e4fd6`.
3. `livros`: os livros da escola que a matéria reproduz, cada um com nome e emoji:
   `livros: { aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' }, atividades: { … } }`
   (`curto`: o nome na aba e no título de grupo).
   Toda sala e toda carta dizem de qual livro vêm (`livro`/`livroOrigem` com a chave daqui).
   Livro com `letra` e `sigla` próprias (English: `{ …, letra: 'e', sigla: 'ENG' }` e `{ …, letra: 'p', sigla: 'PRJ' }`,
   dois livros com capítulos de mesmo número): a letra vai nos ids e arquivos (`en12e1`, `livro-12e.js`,
   `unicornios-12e.js`) e a sigla nas origens do inventário (`ENG-125-q2`, página de 3 algarismos); sem elas, as do
   Português (`a`/`t`, `APR`/`ATI`).
4. `lugar: { nome, artigo, dentro: 'materia:<arquivada>', interior: '<interior de entrada do prédio>', novidade }`
   (`conteudo.md` §2.7): a matéria mora no prédio da matéria arquivada de mesmo assunto, a partir do térreo. Língua
   Portuguesa: `{ nome: 'Casa das Palavras', artigo: 'a', dentro: 'materia:portugues', interior: 'portugues' }`.
5. Dinheiro, unicórnios, treino, surpresa e prêmios: as regras de sempre (`conteudo.md` §2.3 e §5). Cada sala tem
   1 unicórnio comum e 1 raro; a matéria, 2 épicos e o lendário.

## 3. Sala de livro (`ordem: 'livro'`)
Sala nova: `npm run novo -- sala <m> <idSala>` (receita `docs/receitas/sala-4bim.md`).
```
Reino.registrarSala('portugues4', {
    id: 'lp10a1', nome: 'O Gato de Botas', emoji: '🐱',
    livroOrigem: 'aprendizagem', capitulo: 10,
    paginas: 'pp. 3 a 9',
    ordem: 'livro',
    cartas: ['lp-a03', 'lp-a05', 'lp-a06'],
    intro: 'Vamos ler o conto O Gato de Botas e conhecer as partes de uma história!',
    desafios: [ … ],
});
```
1. Uma sala = uma seção do livro (algumas páginas seguidas, do mesmo livro e capítulo). Toda página do livro está em
   alguma sala (como carta, como desafio ou os dois).
2. `ordem: 'livro'`: a missão mostra TODAS as cartas de `cartas` (na ordem dada) e depois TODOS os desafios, na ordem
   do arquivo (a do livro), sem sorteio. Sem `ordem`, tudo como antes (`desafiosPorSala` sorteados).
3. `cartas` (opcional): ids de cartas do livro da matéria, na ordem; sem ele, o resumo vem do campo `livro` dos
   desafios (como antes).
4. Sala de livro tem pelo menos 1 desafio e no máximo `config.desafiosSalaLivro` (14); as regras de "≥ 12 desafios"
   e "≥ 6 de escolha/vf/varias" valem só para as salas sorteadas. A matéria inteira precisa de
   `config.perguntasTreino` desafios treináveis (o treino do Castelo).
5. `livroOrigem` (`'aprendizagem'`/`'atividades'`, chave de `materia.livros`) e `capitulo` (número) são obrigatórios
   na sala de livro. `paginas` diz as páginas impressas daquele livro.
6. A sala de livro é jogada em etapas (§13): cada etapa terminada fica guardada; sair no meio de uma etapa só perde
   aquela etapa. Terminar a última conta a sala, com dinheiro, estrelas e ovos de sempre.

## 4. Cartas ricas
```
{ id: 'lp-a05', e: '🐱', titulo: 'O Gato de Botas – Parte 1', livroOrigem: 'aprendizagem', pagina: 5, capitulo: 10,
  blocos: [
    { t: 'texto', texto: 'Era uma vez um velho moleiro…' },
    { t: 'versos', versos: ['Pode ser um peixe', 'Que nunca sai do aquário', '', 'Pode ser um hamster'] },
    { t: 'lista', itens: [{ termo: 'Personagens', texto: 'são os seres que participam da história.' }] },
    { t: 'quadro', titulo: 'ORGANIZANDO O CONHECIMENTO', texto: '…' },        // quadro do livro (borda)
    { t: 'tabela', cab: ['Masculino', 'Feminino'], linhas: [['o alemão', 'a alemã']] },
    { t: 'figuras', itens: [{ img: 'lp:moinho', legenda: 'moinho' }] },        // ícones 16×16 (ICONES)
    { t: 'ilustracao', id: 'lp-poema-falta-de-sorte', alt: '…' },              // Reino.registrarIlustracao
    { t: 'fonte', texto: 'BRASIL. Ministério da Educação…' },
  ] }
```
1. `blocos` substitui o `texto` (carta antiga, só `texto`, continua igual). `t` é um destes: `texto`, `versos`
   (`''` separa estrofes), `lista`, `quadro` (`titulo` + `texto` ou `itens`), `tabela`, `figuras`, `ilustracao`,
   `fonte`, `fala` (`quem` + `texto`: travessão de diálogo destacado).
2. Uma carta cabe numa tela de celular com pouca rolagem: até ~110 palavras ou 16 versos. Texto maior (conto,
   letra de canção) vira cartas seguidas: "O Gato de Botas – Parte 1 (1 de 3)". `validar-conteudo` avisa.
3. A redação é a do livro, palavra por palavra (pontuação, travessões, aspas). O que a criança escreveu à mão
   nunca entra (`conteudo.md` §6.3).
4. Cabeçalho da carta: emoji do livro + "Livro de Aprendizagem • p. 5" (`livroOrigem`, `pagina`), na cor da matéria.
5. Fala da carta (`UI.falaCarta` = `Reino.Falas.segmentosCarta(c)`): título e o texto de cada bloco, na ordem; cada
   estrofe de `versos` é uma fala; `tabela` é lida por linha ("Masculino: o alemão. Feminino: a alemã."); `figuras`,
   as legendas. `fonte` e `ilustracao` ficam só na tela.

## 5. Vozes por capítulo
1. Carta com `capitulo` fala no pacote `<m>-livro-<capitulo>` (`Reino.Falas.pacoteCarta(m, c)`); sem, `<m>-livro`.
   Assim o pacote que a sala carrega tem só o capítulo dela (o Chromebook não baixa o livro inteiro).
2. Desafios: pacote da sala (`<m>-<sala>`), como sempre. Falas de NPC e objetos do prédio: pacote do interior.
3. `Falas.acertouDePrimeira(n)` vai até o maior número de desafios de uma sala (sorteada ou de livro).

## 6. Rastreio do inventário (`origem`)
1. Todo desafio de sala de livro tem `origem`: o id da questão no inventário (`APR-12-q3`, `ATI-05-q2`; item de uma
   questão dividida: `APR-12-q3b`). Toda carta tem `livroOrigem` + `pagina` (`pagina: 0` = página sem número; a tela diz "página sem número").
2. `node jogo/ferramentas/validar/cobertura-4bim.js <m>` cruza o inventário com o jogo: cada página impressa em
   alguma carta ou desafio, cada questão do inventário em algum desafio (ou listada em `soLeitura: ['APR-07-qA']` da
   carta que a mostra, para questão só de conversa que virou leitura), sem sobra nem falta. Faz parte do `npm run validar`.

3. Questão que mudou de formato (oral, pessoal, desenho, produção, recortar e colar, QR code…) leva
   `adaptacao: '<o que mudou e por quê, 1 linha>'` no desafio; `cobertura-4bim.js --tabela` lista todas (o
   relatório e o inventário usam essa lista).

## 7. No prédio da matéria
1. Cada matéria do 4º bimestre ocupa o prédio da própria matéria (o da matéria arquivada de mesmo assunto), a partir
   do térreo: o interior de entrada do prédio passa a ser dela. Língua Portuguesa = Casa das Palavras, térreo
   (interior `portugues`, lugar `materia:portugues`, pacote `interior-portugues`). Entra-se pela porta do mapa e
   pelo "Ir" do menu Lugares; sai-se pelo tapete do saguão. O mapa não muda (mesma casa, mesmo `rect`).
2. O térreo: um saguão com a guia, o mapa da casa, os dois livros e o tapete de saída, e para cada capítulo uma
   galeria do Livro de Aprendizagem com o ateliê do Livro de Atividades do mesmo capítulo ao lado. Portas largas
   entre vizinhos, sem corredor sem saída.
3. Cada sala do livro é uma estação (objeto `lp-estacao`: estante com o livro aberto, a página e o selo ❗/✓ derivado
   de `P.salas`), na ordem do livro; o anfitrião de cada galeria é um NPC com fala de convite.
4. Interior "rico" (`interiores.md` §7) em todo cômodo.
5. O layout do 3º bimestre sai do jogo (cópia em `arquivo/terceiro-bimestre/`, que a fixture histórica dos testes
   carrega); a matéria arquivada fica registrada, sem sala no prédio (`validar-interiores.js` não exige NPC nem
   estação para sala de matéria arquivada). Já são do 4º bimestre: a Casa das Palavras (Língua Portuguesa) e a Torre
   do Relógio (English: `interiores.md` §9.5.1); o Laboratório de Ciências, a Estação dos Caminhos, o Museu das Memórias e a Torre dos Números (`interiores.md` §9.5.2).
6. Menu Lugares: uma linha só para o prédio, a da matéria ativa (salas e dinheiro dela, sem "Dentro da…"), com as
   matérias ativas primeiro; o "Novo!" sai quando ela entra no prédio depois da novidade (`ui/lugares.js`).

## 8. Produções salvas
1. Escrita livre e desenho da criança ficam em `producoes: { <idDesafio>: { texto?, px?, em } }`
   (`P.registrarCampo('producoes', { mesclar: 'carimbo', novoCiclo: 'mantem', copiaSeguranca: true })`,
   `save-e-mescla.md` §11). Aditivo: save sem o campo carrega igual; nada mais muda no save.
2. Grava ao conferir (o que ela fez fica guardado mesmo que saia depois) e mostra de volta ao abrir de novo a mesma
   questão. Texto até 600 letras; desenho no formato do tipo `desenho`.

## 9. Banco para a Revisão
A Revisão da Escola do 4º bimestre (prova, `conteudo.md` §5) usa os desafios destas salas sem copiar texto: o arquivo
da prova pode montar `questoes` com `Reino.desafioPorOrigem('<origem>')` / `Reino.desafio('<id>')` (cópia rasa, com
`pagina` e `origem`) e acrescentar o que for só da folha. Tipos novos destas salas já funcionam na prova (os ganchos
`textoCerto`, `textoResposta`, `prepararProva`).

## 10. Matéria seguinte (receita curta)
1. Inventário da pasta (`matérias/4 Bimestre/<matéria>/INVENTARIO.md`) no mesmo formato.
2. `<m>4` com `bimestre: 4`, `livros`, salas de livro por seção, cartas por capítulo e `lugar.dentro: 'materia:<m>'`,
   `interior: '<id do interior de entrada do prédio>'` (sem `andar`). O layout novo substitui o `<prédio>.js` do térreo
   (o antigo vai intacto para `arquivo/terceiro-bimestre/jogo/js/interiores/<prédio>/`); pessoas, falas e objetos em
   arquivos próprios na pasta do prédio. Matéria sem prédio próprio: o interior padrão (`interiores/padrao.js`).
3. Cobertura (`cobertura-4bim.js <m>`), vozes, `validar-tudo`.

## 11. Antes de mexer
```
node jogo/ferramentas/validar/validar-conteudo.js
node jogo/ferramentas/validar/cobertura-4bim.js portugues4
node jogo/ferramentas/vozes/listar-falas.js
npm run unidade -- --so quarto-bimestre   # suíte de aceite: casa, questões, salas inteiras, persistência, save antigo, regressão
npm test
```

## 12. Tipos de desafio do livro
Cada um imita um formato do livro. Todos têm `pergunta` (o enunciado do livro), `explica`, `livro` (carta), `origem`,
e podem ter `apoio` (texto de apoio; `partes[].versos` e `partes[].figuras` também) e `figura`
(`{ img }` ícone ou `{ ilustracao }`, abaixo do enunciado). Digitação: `_d.campoTexto` (`desafios/campo-texto.js`,
fileira de acentos); resposta digitada vale sem diferença de maiúsculas, espaços e ponto final, com acento certo.
| Livro | Tipo | Formato |
|---|---|---|
| circular, sublinhar, pintar palavras ou sinais num texto (com legenda de cores) | `marcar` | `texto` com os alvos entre chaves: `'O {gato} correu{.\|0}'`; `{x\|n}` = cor `n` de `cores: [{ nome, cor }]` (sem `cores`, uma marca); `marca: 'circular'\|'sublinhar'\|'pintar'`; cada palavra e sinal é tocável; `\n` quebra a linha; alvo opcional (o livro aceita mas não exige): `{x?}` (uma palavra), `{várias palavras\|?}` ou `{x\|n?}` (frase terminada em `?` sem `\|` é recusada: a pergunta com o sinal é `{frase}{?}`), marcado na cor dele não é erro, sem marca não falta, fica fora do total ("também vale: …"); o sinal `?` é `{?}`, o `?` opcional é `{??}`; toda questão tem 1 alvo obrigatório; rótulo de item no começo da linha ("a) ", "1. ", "1) ") é só texto, não é tocável |
| completar digitando, escrever a palavra | `digitar` | `frases: [{ antes, depois, certas: ['...'], img?, alt?, inicial? }]`, `colado?`, `livre?` (pessoal: qualquer resposta não vazia), `qualquerOrdem?: [[0, 1], …]` (caixas que valem em qualquer ordem entre si, sem repetir; a caixa tem a largura da maior resposta do grupo), `trocarGrupos?` (os grupos do mesmo tamanho também trocados entre si), `frases[i].junto` (a caixa na mesma linha da anterior: "____ e ____"); `inicial: 'maiuscula'\|'minuscula'` confere a letra inicial (também na livre) |
| resposta escrita, produção de texto | `escrever` | `linhas`, `minPalavras?`, `minFrases?`, `chaves?: [['gato', 'gata'], …]` (cada grupo: alguma palavra, sem acento), `maiusculas?` (cada frase começa com maiúscula e a chave com maiúscula, nome próprio, vem com maiúscula), `minNomes?` (pelo menos N nomes próprios: palavras com maiúscula fora do começo da frase), `modelo?` (resposta possível mostrada depois); guarda em `producoes` |
| tabela, quadro para completar | `tabela` | `cab: [...]`, `linhas: [[ 'o alemão', { certas: ['a alemã'] } ]]` (célula digitada) ou `{ certa: i }` com `banco: [...]` (tocar a palavra) |
| cruzadinha | `cruzadinha` | `palavras: [{ resposta, x, y, dir: 'h'\|'v', dica? , img? }]` (grade e números saem dela) |
| caça-palavras | `cacaPalavras` | `grade: ['GATOX', …]` (letras maiúsculas), `palavras: ['GATO', …]` (horizontal ou vertical, achadas na grade) |
| desenho | `desenho` (existente) | `guardar: true` guarda em `producoes` e mostra de volta |
| marcar X, ligar, numerar, classificar, completar com quadro | `escolha`, `vf`, `varias`, `vfLista`, `ligar`, `ordenar`, `separar`, `completar` | os de sempre (`conteudo.md` §3); opção com `img` em `escolha`/`varias` |

### 12.1 A pergunta sozinha (`avulsa`)
Toda pergunta conferível do bimestre também sai sozinha, fora da sala e sem as questões de antes: no Bosque e nas
arenas ("Hora da pergunta!", `ui/bosque-pergunta.js`), nos lojistas da Vila (`ui/vila-pergunta.js`), na pergunta
surpresa e nos portais da viagem. Ali o "📖 Leia antes" é a carta `livro` inteira, e depois vêm `apoio`, `figura` e o
enunciado. Pedido do Leandro (2026-11-07, "perguntas muito estranhas"): sozinha, ela tem de fazer sentido.
1. Dado que a pergunta usa (tabela, preços, texto-base) vem na carta, no `apoio` ou na `figura`; nada de "a atividade
   anterior", "o gráfico" ou "a resposta que você deu" que não esteja na tela.
2. `avulsa: { carta: '<id>' }`: a carta do "Leia antes" quando sozinha (a `livro` fala de outra atividade ou só manda
   pintar/recortar); `avulsa: { carta: null }`: sem carta (o `apoio` basta). Na sala, nada muda.
3. `avulsa: false`: só na sala (depende de verdade da questão anterior). `Reino.avulsa(d)` filtra os quatro sorteios;
   `Reino.cartaAvulsa(materia, d)` dá a carta (`nucleo/registros.js`). `validar-conteudo` confere o formato.

## 13. Etapas da sala de livro
Por quê: uma sala inteira (até 13 cartas e 14 desafios) é longa demais de uma vez para a Mariana (TDAH e autismo
nível 1). A sala vira uma trilha de etapas curtas; o `id` da sala, `P.salas`, moedas, estrelas, ovos e unicórnios não
mudam (nada do que ela já fez se perde).

### 13.1 Divisão (`jogo/js/atividades/etapas.js`, `node: true`)
`Reino.etapasDaSala(materia, sala)` → `null` (sala sem `ordem: 'livro'`) ou
`[{ n: 0, cartas: ['lp-a03', …], desafios: [<desafio>, …] }, …]` (`n` = índice, a partir de 0):
1. Desafios na ordem do arquivo; uma etapa fecha ao chegar a `config.etapaDesafiosMax` pontos (`escrever` e `desenho`
   valem `config.etapaPesoEscrever`, o resto 1). Sobra de 1 desafio sem carta própria junta-se à etapa anterior.
2. Cada carta de `sala.cartas` entra na etapa do primeiro desafio que a cita (`desafio.livro`); carta sem desafio vai
   com a carta seguinte (a última, com a última etapa); as cartas ficam na ordem de `sala.cartas` e nunca voltam para
   uma etapa anterior à da carta de antes.
3. Leitura demais numa etapa (mais de `config.etapaCartasMax` cartas ou de `config.etapaPalavrasMax` palavras): as
   primeiras cartas viram etapa(s) só de leitura antes dela, com o máximo que couber; uma carta grande sozinha pode.
4. `sala.etapas: [n, n, …]` (opcional): quantos desafios em cada etapa, à mão; as cartas seguem a regra 2.
5. Determinística e pura (só a sala e o config); toda carta e todo desafio em exatamente uma etapa; desafios na ordem.
   `node jogo/ferramentas/validar/etapas-4bim.js [--tabela]` confere e imprime a divisão (entra no `npm run validar`).

### 13.2 Estado (`jogo/js/sistemas/etapas-progresso.js`)
Campo `etapas` (`registrarCampo`, `save-e-mescla.md` §11; mescla própria com `exemplos`, `novoCiclo: 'zera'`,
`copiaSeguranca: true`):
```
etapas: { lp10a4: { rodada: 0,                                   // salas[id].vezes quando a rodada começou
                    feitas: { 0: { a: 3, t: 3, p: 0, em: 1792… } },// a = acertos de 1ª, t = total, p = pressas
                    perfeitas: { 0: 1792… } } }                   // ⭐: etapa feita sem erro (fica entre rodadas)
```
- Mescla: `rodada` maior vence (as `feitas` da rodada menor somem da mescla); mesma rodada, união das `feitas` (a
  mesma etapa nos dois: a de `em` maior); `perfeitas` sempre união (menor `em`). Comutativa e idempotente.
- `rodada` velha (menor que `salas[id].vezes` atual) = trilha nova: nenhuma etapa feita nesta rodada.

API `Reino.Etapas` (no navegador; lê o estado na hora):
- `estado(materia, sala)` → `{ total, feitas: [n…], perfeitas: [n…], proxima: n|null, emAndamento, salaFeita,
  trilhaPerfeita }` (`proxima` = primeira etapa não feita na rodada; `emAndamento` = alguma feita e falta alguma).
- `concluirEtapa(materia, sala, n, { acertosPrimeira, total, pressas })` → grava a etapa (e a ⭐ se
  `acertosPrimeira === total`), salva, e devolve `{ ultima, perfeita, sala?: <retorno de P.concluirSala>,
  trilha?: <retorno de conferirTrilhas para esta sala> }`. Na última etapa da rodada chama `P.concluirSala` com a soma
  das etapas da rodada (moedas, estrelas, ovos e persistência como sempre).
- Etapa refeita fora da rodada (para ganhar a ⭐): `concluirEtapa` aceita etapa já feita; grava de novo e não chama
  `concluirSala` se a rodada já tinha sido concluída.

### 13.3 Na missão
`Reino.Missao`/`atividades/missao.js`: abrir a sala mostra a trilha (`atividades/missao-etapas.js`): uma bolinha
por etapa (✓ feita, ⭐ perfeita, ▶ próxima), "Etapa N de M" e "⭐ X de M". "Começar" abre a `proxima` (sala feita:
a primeira sem ⭐, ou a 1ª); tocar numa etapa feita sem ⭐ refaz só ela. A etapa mostra as cartas dela e os desafios
dela (a trilha "Carta 1 de 2 / Desafio 3 de 4" conta só a etapa). Fim de etapa: "Etapa guardada!", "Próxima etapa ▶"
e "Descansar 🌿" (fecha; tudo guardado). Última etapa: a tela de sala concluída de sempre. ✕ no meio: só a etapa
atual recomeça. Tela da matéria e estação da Casa: estado "em andamento" (◐, "2/4").

## 14. Trilha perfeita (prêmio lendário)
Pedido do Leandro (2026-10-28): cada sala de Língua Portuguesa com ⭐ em todas as etapas dá um acessório lendário
para o unicórnio, uma carta de experiência e um elemento químico. Só sem erros (como a nota 10 da Escola: sem caminho
por persistência), mas pode refazer só a etapa que faltou, quantas vezes quiser, sem pressa (calma não conta).

### 14.1 Registro (`jogo/js/nucleo/registros.js`)
```
Reino.registrarPremioTrilha({
  sala: 'lp10a1', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a1', nome: 'Botas do Gato', icone: { n, p, d }, desenho: { linhas, paleta, ancora, dx, dy } },
  elemento: 30,                  // z do cartão de Reino.QUIMICA.elementos (bloqueado até ganhar)
  experiencia: 'exp-pilha-limao' // id do cartão de Reino.QUIMICA.experiencias
});
Reino.premiosTrilha            // lista, na ordem de registro
Reino.premioTrilha(salaId)     // o prêmio da sala ou undefined
```
O acessório entra como os das provas (`ICONES['acessorio:<id>']`, `Reino.desenhosAcessorios`,
`PA.ENFEITES_MONTARIA`). Arquivos: `conteudo/materias/portugues4/premios-trilha-<cap>.js` (um por capítulo).

### 14.2 Estado e entrega (`jogo/js/sistemas/trilhas.js`)
Campo `trilhas: { <salaId>: em }` (mescla própria: por sala fica o menor `em`, nada some; `novoCiclo: 'mantem'`, `copiaSeguranca`).
`P.conferirTrilhas()` (roda junto do `P.conferirPersistencia`: ao abrir e ao mesclar; idempotente; devolve as salas
premiadas agora): sala com prêmio registrado e (⭐ em todas as etapas, ou `salas[id].perfeita` — retroativo: a sala
feita de uma vez sem erro antes das etapas) → `trilhas[id]`, `loja[acessorio.id] = true`,
`Q.descobrir('elementos', 'z' + z)` e `Q.descobrir('experiencias', id)` (sem as estrelas da química). Evento
`Reino.EVENTOS.TRILHA_PERFEITA` `{ sala, materia }` por sala nova. A festa (3 cartões) sai na tela de fim da última ⭐;
o prêmio retroativo, na próxima vez que ela entra na Casa das Palavras.

### 14.3 Onde aparece
- Loja (`loja-itens.js`): `L.premios()` inclui os da trilha (`raridade: 'lendario'`, `origem: 'trilha'`, `sala`);
  estado `ganho` (em `trilhas`) ou `bloqueado` ("Faça a trilha de <sala> sem errar"); nunca à venda.
- Química: os 25 cartões novos de elemento ficam com "?" até ganhar (os 24 de antes, sempre abertos);
  "Experiências do Reino" (`ui/quimica-experiencias.js`): álbum de 25 cartas, silhueta "?" até ganhar.
- Casa das Palavras, 1º andar (`portugues-1`): Galeria dos Tesouros, um pedestal por sala (aceso = ganho).

### 14.4 Tabela (fixa: as frentes usam estes ids)
| Sala | Elemento (z) | Experiência |
|---|---|---|
| lp10a1 O Gato de Botas | Zinco (30) | `exp-pilha-limao` |
| lp10a2 As partes do conto | Estanho (50) | `exp-tambor-de-lata` |
| lp10a3 Os sinais de pontuação | Iodo (53) | `exp-iodo-amido` |
| lp10a4 A lenda da Vitória-Régia | Titânio (22) | `exp-barquinho-flutua` |
| lp10a5 Quando e onde? | Rubídio (37) | `exp-relogio-de-sol` |
| lp10a6 Meu reconto | Tungstênio (74) | `exp-teatro-de-sombras` |
| lp10a7 João e o pé de feijão | Manganês (25) | `exp-feijao-no-algodao` |
| lp10t1 A sereia Iara | Bromo (35) | `exp-ovo-que-flutua` |
| lp10t2 Os Três Porquinhos | Cromo (24) | `exp-ponte-de-papel` |
| lp11a1 Rei da Floresta | Níquel (28) | `exp-violao-de-elastico` |
| lp11a2 Os bichos da canção | Germânio (32) | `exp-telefone-de-copo` |
| lp11a3 Masculino e feminino | Cobalto (27) | `exp-repolho-roxo` |
| lp11a4 Aumentativo | Lantânio (57) | `exp-lupa-de-gota` |
| lp11a5 Diminutivo | Gálio (31) | `exp-gelo-e-sal` |
| lp11a6 Minha paródia | Criptônio (36) | `exp-lanterna-colorida` |
| lp11t1 O animal de estimação | Selênio (34) | `exp-calor-do-sol` |
| lp11t2 Aumentativo e diminutivo | Neodímio (60) | `exp-bussola-caseira` |
| lp12a1 Jacaré letrado | Platina (78) | `exp-batata-espuma` |
| lp12a2 Palavras em -ã, -ão, -ães | Estrôncio (38) | `exp-arco-iris-no-copo` |
| lp12a3 Próprios e comuns | Chumbo (82) | `exp-lapis-sem-chumbo` |
| lp12a4 Maiúsculas e minúsculas | Mercúrio (80) | `exp-termometro-caseiro` |
| lp12a5 Meu poema visual | Bário (56) | `exp-leite-colorido` |
| lp12a6 A primavera endoideceu | Molibdênio (42) | `exp-flor-colorida` |
| lp12t1 Falta de sorte | Xenônio (54) | `exp-balao-estatico` |
| lp12t2 Letras e nomes | Bismuto (83) | `exp-cristais-de-sal` |

Cartão de experiência (`conteudo/quimica/experiencias.js`, `Reino.QUIMICA.experiencias`):
`{ id, nome, emoji, elemento: z, comAdulto: true, precisa: ['…'], passos: ['…'], acontece: '…', porque: ['…'] }`;
cada página até 30 letras, 3+ palavras; só materiais de casa e seguros (nada de fogo, nada de tomada).
