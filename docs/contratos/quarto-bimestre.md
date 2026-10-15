# Contrato: quarto bimestre (livros inteiros)

Cobre como o material do 4º bimestre entra no jogo: cada matéria nova ocupa o prédio da própria matéria,
reproduz os livros da escola página por página (conteúdo em cartas ricas, questões em desafios na ordem do livro) e
deixa o banco pronto para a Revisão da Escola. A temporada e o catálogo do 3º bimestre: `bimestres.md`. Tipos de
desafio, livro e salas em geral: `conteudo.md`. Prédio e andares: `interiores.md`.

## Índice
1. Onde está no código · 2. Matéria do 4º bimestre · 3. Sala de livro (`ordem: 'livro'`) · 4. Cartas ricas ·
5. Vozes por capítulo · 6. Rastreio do inventário (`origem`) · 7. No prédio da matéria · 8. Produções salvas ·
9. Banco para a Revisão · 10. Matéria seguinte (receita curta) · 11. Antes de mexer · 12. Tipos de desafio do livro

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
- Produções (escrita livre e desenho salvos): campo `producoes` (`jogo/js/sistemas/producoes.js`).

## 2. Matéria do 4º bimestre
1. Catálogo separado do 3º bimestre (`bimestres.md`): ids novos de matéria, sala, desafio, carta e unicórnio; nunca
   `arquivada`. `bimestre: 4` na matéria.
2. Nome diferente do da matéria arquivada (a cor do `ui.md` §10.22 é por nome): Português do 4º bimestre é
   **Língua Portuguesa** (o nome da capa do livro), id `portugues4`, cor `#8e4fd6`.
3. `livros`: os livros da escola que a matéria reproduz, cada um com nome e emoji:
   `livros: { aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' }, atividades: { … } }`
   (`curto`: o nome na aba e no título de grupo).
   Toda sala e toda carta dizem de qual livro vêm (`livro`/`livroOrigem` com a chave daqui).
4. `lugar: { nome, artigo, dentro: 'materia:<arquivada>', interior: '<interior de entrada do prédio>', novidade }`
   (`conteudo.md` §2.7): a matéria mora no prédio da matéria arquivada de mesmo assunto, a partir do térreo. Língua
   Portuguesa: `{ nome: 'Casa das Palavras', artigo: 'a', dentro: 'materia:portugues', interior: 'portugues' }`.
5. Dinheiro, unicórnios, treino, surpresa e prêmios: as regras de sempre (`conteudo.md` §2.3 e §5). Cada sala tem
   1 unicórnio comum e 1 raro; a matéria, 2 épicos e o lendário.

## 3. Sala de livro (`ordem: 'livro'`)
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
6. Sair no meio não conta (como sempre); terminar conta a sala, com dinheiro, estrelas e ovos de sempre.

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
   estação para sala de matéria arquivada). Os outros prédios (o Museu, a Torre…) não mudam.
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
