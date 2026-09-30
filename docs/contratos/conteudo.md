# Contrato: conteúdo (matérias, salas, desafios, livro, provas, treino)

Cobre como as matérias são escritas (uma sala por arquivo), os tipos de desafio e seus campos, o livro,
as provas da escola, o treino e as regras de leitura das fotos (apostila e folha). Os dados de cada matéria
e prova (salas, cartas, unicórnios, acessórios, fotos) estão no próprio arquivo dela.
Personagens: `npcs-e-dialogo.md`. Prédios: `interiores.md`. Vozes: `som-musica-e-voz.md`.

## Índice
1. Onde está no código · 2. Matéria, sala e livro · 3. Tipos de desafio e campos · 4. Regras para escrever salas ·
5. Provas e treino · 6. Fontes: fotos da apostila e da folha · 7. Antes de mexer

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
2. Livro: `<m>/livro.js` com `Reino.registrarLivro('<m>', [{ id, e, titulo, texto, destaque? }, …])`
   (a tela divide o `texto` em blocos de até 3 frases e destaca o termo; `destaque` escolhe o termo quando o
   automático não serve; o texto falado é o `texto` inteiro).
3. Unicórnios da matéria: no `<m>/<m>.js` (`unicornios: [{ id, nome, raridade, sala | treino | materiaCompleta,
   cores: { corpo, crina: [3 cores], chifre, asa? }, frase }]`).
   Dinheiro da matéria (`Reino.config.valorPorMateria`, derivado, nunca no save): cada sala vale um valor redondo,
   de R$ 0,50 em R$ 0,50 arredondado para baixo (`P.valorSala`), e a sobra é bônus quando a matéria fica completa
   (`P.bonusMateria`; `premios.bonus` no `concluirSala` da última sala). 5 salas: R$ 4,00 e bônus zero; 6 salas:
   R$ 3,00 + R$ 2,00. Nunca dízima.
4. Estilo dos arquivos de sala: igual aos que já existem (ex.: `historia/h1.js`): indentação de 4 espaços na sala,
   8 nos desafios.
5. Cor da matéria: `cor: '#rrggbb'` (minúsculo) no `<m>/<m>.js`, a da tabela do `ui.md` §10.22 (matéria nova ganha
   linha lá); `validar-conteudo.js` confere a tabela e a repetição. O telhado do prédio no mapa é essa cor (`js/mundo/mapa.js`); `lugar.cores` só tem parede e detalhe.
6. Emojis novos da matéria: `<m>/icones.js` com `Reino.registrarIcones`, grupo `'icones'` no manifesto (para o
   validador enxergar).
7. Onde a matéria fica (`lugar`): um prédio próprio no mapa (`nome`, `artigo`, `sprite`, `rect` ou uma clareira;
   `porCima: true` põe o lugar depois do sorteio dos enfeites, e o resto do reino fica com as mesmas árvores e
   flores; ex.: `portugues.js`) OU dentro de um prédio que já existe: `lugar: { nome, artigo, dentro: '<id do lugar anfitrião>',
   interior: '<id do andar>' }`, sem `rect` nem `sprite`. Com `dentro`, `Mapa.criar` (`mundo/mapa.js`) não põe nada
   no mapa (nem clareira, nem rua) e ela não conta na vez das clareiras: o reino sai idêntico. `Mapa.lugares()` ganha
   no fim `{ id: 'materia:<m>', tipo: 'materia', materiaId, dentro, interior, porta e rect do anfitrião }` só para o
   menu Lugares (o que desenha e faz colisão usa `Mapa._interno.lugares`, sem ela). "Ir" anda até a porta do
   anfitrião e entra direto no `interior` (`Cena.entrar`); de dentro do anfitrião vai direto, sem sair
   (`Cena.irAoLugar`); sair do andar dela volta à porta do anfitrião. O andar é um `Reino.registrarInterior` com
   `lugar: 'materia:<m>'` e `entrada: true` (pode não ter `saida` se tiver escada). O contorno dourado de matéria completa
   aparece no anfitrião. `validar-interiores.js` acusa anfitrião ou andar inexistente. Gerador:
   `npm run novo -- materia <m> --nome … --emoji … --dentro <lugar> --interior <id>`. Ex.: Ciências
   (`dentro: 'observatorio'`, `interior: 'observatorio-3'`).
   - `andar: '3º andar'` (opcional, só com `dentro`): a linha do menu Lugares diz "No 3º andar do Observatório",
     com o emoji do anfitrião (sem `andar`: "Dentro do Observatório"). `mapa.js` copia `andar` e `anfitriaoNome`.
   - `novidade: 'AAAA-MM-DD'` (opcional, matéria ou `Reino.registrarLugar`): selo "✨ Novo!" (aviso `tipo: 'novo'`)
     no menu Lugares enquanto ela não entrou e a data tem menos de `config.novidadeDias` dias (padrão 45).
     Visita = entrar no interior ou abrir a tela do lugar; fica no campo `visitados` do save
     (`sistemas/visitados.js`, `Reino.Novidades.ehNovo(lugar)`). O `npm run novo` (matéria e prédio) põe a data de hoje.
     Novidade dentro de um lugar que ela já visitou (ex.: um andar novo): `novidade: { desde: 'AAAA-MM-DD',
     interior: '<id do interior>' }`; o selo volta e vale pela data até ela entrar NESSE interior (a visita ao
     lugar ou a outro interior não conta). Ex.: `interiores/quimica/lugar.js` (`interior: 'quimica-2'`).

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
   No meio não mostra certo/errado nem nota; o aviso de pressa aparece no máximo 3 vezes por prova
   (`MAX_AVISOS_PRESSA`); revisar antes da nota é opcional; nota 0-10 com ponto parcial; sair no meio não
   conta tentativa. Correção: com lendário ou raro ainda em jogo, só marca onde errou; depois (e nos treinos)
   mostra a resposta. Prêmio só com `notaSucessoProva`; comprar não conta como prêmio (`loja.md` §3).
2. Treino do Castelo: `Reino.Prova.iniciar(materia, fim)`, só com todas as salas da matéria feitas.
   Sem relógio, revisão obrigatória antes de entregar, medalha só pelos acertos (`P.medalhaPara`,
   `jogo/js/atividades/treino.js`).
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

### 5.1 Persistência (unicórnios raros e épicos)
Além do caminho normal, o raro nasce jogando a sala dele `persistencia.sala` vezes (qualquer resultado); o épico
de `treino: 'ouro'` com ouro OU `persistencia.treinoOuro` treinos; o de `'perfeito'` acertando tudo OU
`persistencia.treinoPerfeito` treinos (`P.registrarTreino`). Vale o que já foi jogado: `P.conferirPersistencia`
roda ao abrir e ao mesclar, e o ovo aparece sozinho. Números em `Reino.config.persistencia`.

## 6. Fontes: fotos da apostila e da folha
1. As fotos ficam em `matérias/<matéria>/` (a revisão bimestral em `matérias/<matéria>/Revisão/`). A pasta, a faixa
   de IMG_ e as decisões de leitura de cada matéria ou prova ficam no comentário do topo do arquivo dela
   (`<m>/<m>.js` ou `provas/<prova>.js`), não aqui.
2. Para ler: converta para JPEG (≈1400 px, desvirado) em `/tmp`; para ampliar um trecho (frações da
   largura/altura da original): `uv run --with pillow --with pillow-heif python <script de recorte> <original>
   <saida.jpg> x0 y0 x1 y1`.
3. O que está escrito à mão pela criança (resposta, marcação) NUNCA é gabarito: o gabarito vem da apostila.
   Palavra coberta por escrita ou pintura: não adivinhe; use só o que está legível.
4. Texto impresso que falta e foi escrito à mão por adulto (professora) entra como se fosse da folha; item riscado
   pela professora fica de fora.
5. Textos de terceiros (receitas, relatos): resuma com palavras próprias. Trecho curto só quando a questão depende dele.
6. Na prova, só aceite (`aceitas`) respostas alternativas comuns; palavras raras não: a prova imita a correção da
   professora.

## 7. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-conteudo.js
node jogo/ferramentas/gerar-index.js --conferir          # sala nova no manifesto
node jogo/ferramentas/vozes/listar-falas.js              # texto novo precisa de voz gravada
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados
npm test
```
