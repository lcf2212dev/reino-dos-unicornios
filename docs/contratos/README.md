# Contratos do jogo (índice e regras gerais)

Regras que o código do "Mariana e o Reino dos Unicórnios" segue, um arquivo por subsistema.
Este arquivo tem o índice e as regras que valem para todos. Mudança de contrato: só o orquestrador.
A origem de cada regra (os 4 contratos antigos da raiz) está em `rastreio.md`.

## Índice
- `cena-e-motor.md` — cena ativa, transição em íris, câmera, pintor, laço, entrada, camadas de desenho, mapa e nado.
- `interiores.md` — formato de um interior, cômodos, portas, objetos, biblioteca, grade, "rico", validador, cada prédio.
- `npcs-e-dialogo.md` — NPC, elenco, status, balões, falas até 30 letras por página, ações e telas.
- `save-e-mescla.md` — estado, campos, `chaveSave`, cópia `-novidades`, `P.mesclar`, sincronização, carimbos, segurança do progresso.
- `cuidados.md` — fome, sede, banho, despensa, Pet Shop, banheira.
- `loja.md` — enfeites, comidas, preços, prêmios da escola, guarda de toque das compras.
- `surpresa.md` — pergunta surpresa.
- `som-musica-e-voz.md` — efeitos, músicas por ambiente, vozes gravadas, pacotes, lições de voz.
- `fotos.md` — fotos e álbum.
- `conteudo.md` — matérias, salas, desafios e tipos, livro, provas, treino, Português.
- `rastreio.md` — tabela: regra antiga → onde está agora.

## 1. Como o jogo roda (restrições do ambiente)
1. Três jeitos: `jogo/index.html` aberto direto (file://), o servidor de casa e o artifact do claude.ai
   (montado por `jogo/ferramentas/gerar-artifact.js`). Tudo tem que funcionar nos três.
2. Sem módulos ES, sem bundler, sem build. Scripts clássicos, carregados em ordem.
3. Sem `fetch` de arquivo local.
4. O servidor só entrega `index.html`, `css/<arquivo>` (CSS sem subpasta) e `js/**`.
4a. Ambiente (artifact, `file:`, https, servidor de casa, toque, compartilhar, baixar): só por `Reino.ambiente`
   (`js/nucleo/ambiente.js`); não repita a checagem de `window.claude` nem de `navigator.share`.
5. As vozes são achadas pelo TEXTO EXATO da fala e agrupadas em pacotes de nome fixo (`js/voz/<pacote>.js`).
6. Save: `chaveSave`, formato do estado, regras de `P.mesclar` e da sincronização só mudam com muito
   cuidado e testes (ver `save-e-mescla.md`).
7. NUNCA abra os gerados enormes: `jogo/js/voz/*.js`, `jogo/ferramentas/gerado/vozes-cache/`,
   `jogo/ferramentas/gerado/falas.json`, `jogo/ferramentas/gerado/vozes-indice.json`.

## 2. Convenções de código
1. Tudo em `window.Reino` e nos globais `Mapa`, `Jogador`, `PA`.
2. Nomes e comentários em português.
3. Pixel art desenhada em código, sem imagens: contorno `#3a2446`, tile de 16 px.
4. Texto no canvas: fonte "Press Start 2P".
5. Todo emoji que aparece na tela ou no canvas tem ícone desenhado em `jogo/js/arte/icones/<lote>.js`
   (confira em `jogo/ferramentas/previas/icones.html`). Emoji novo sem desenho: avise quem integra.
   Feature com emoji próprio (ex.: o 🥐 da Padaria) desenha na PRÓPRIA pasta, sem editar os lotes:
   `Reino.registrarIcones({ '🥐': { n: 'croissant', p: { k: '#3a2446', … }, d: [16 linhas de 16] } })`
   (`js/arte/icones/icones.js`, `node: true`; chave sem `\uFE0F`). Chave que já existe ou formato torto
   (o mesmo que o `validar-conteudo` confere nos acessórios: `Reino.conferirIcone`) lança erro na hora.
   O `validar-interiores` avisa o `menu.emoji` de `Reino.registrarLugar` que ficar sem desenho.
6. Ajustes → Animações desligado e `prefers-reduced-motion` valem em tudo: sem animação, o desenho fica
   parado (sem partículas, ondinhas paradas, planetas parados). O som continua.
7. Texto para criança: pt-BR correto e carinhoso; falas de personagem até 30 letras por página, frases de
   3 palavras ou mais (`som-musica-e-voz.md` §5).
8. Arquivo dividido em partes compartilha o que era privado por um objeto interno documentado no
   cabeçalho (`Reino._interiores`, `Reino._npcs`, `Reino._progresso`, `Reino._som`, `Reino._motor`,
   `Reino._predios.<prédio>`…). A API pública (`Reino.*`, `Mapa`, `Jogador`, `PA`, `window.__reino`) não muda.
9. Eventos do barramento: use as constantes de `Reino.EVENTOS` (`jogo/js/nucleo/eventos.js`, que documenta quem
   emite, quem ouve e a carga): `U.on(Reino.EVENTOS.CENA, fn)`, `U.emit(Reino.EVENTOS.CENA, carga)`. Evento novo =
   constante nova lá, documentada.
10. Defeito conhecido, fora dos contratos: com a fonte reserva (sem internet para a Press Start 2P), maiúscula
   acentuada pode sair com o acento deslocado; com a Press Start 2P sai certo. Não é regra; não mexa por tabela.

## 3. Ordem de carga e arquivo novo
1. A ÚNICA lista de CSS e scripts, na ordem de carga, é `jogo/js/manifesto.js`. O `index.html` é GERADO dela.
2. Arquivo novo = uma linha no manifesto (com `grupo` e, se roda sem DOM, `node: true`) +
   `node jogo/ferramentas/gerar-index.js` (ou `npm run index`).
3. `node jogo/ferramentas/gerar-index.js --conferir` acusa index.html desatualizado, arquivo do manifesto
   que não existe e `.js` em `js/` fora do manifesto (fora `js/voz/`).
4. A ordem importa: cada arquivo usa o que os de cima registraram em `window.Reino`.
5. CSS é plano (`css/<arquivo>.css`, sem subpasta), na ordem da cascata do manifesto.
6. Arquivo com `node: true` NÃO toca em DOM, canvas, `document`, `PA`, `Reino.Progresso` nem `Reino.Cena`
   no carregamento: só dentro de funções chamadas depois. As ferramentas carregam esses arquivos num `vm`
   do Node sem DOM (`jogo/ferramentas/jogo-no-node.js`). Registrar no carregamento é permitido (só guarda a função).
   `js/sistemas/banho.js` e `banho-desenho.js` seguem a mesma regra, mesmo sem `node: true`.
7. `js/voz/*.js` não entra no manifesto: são pacotes gerados, carregados sob demanda por `Reino.Voz.carregar`.
8. Limite de tamanho: código ~400 linhas (ferramenta 420), dados ~800; gerados fora.

## 4. O progresso da Mariana é intocável
Resumo (detalhes em `save-e-mescla.md` §9):
1. O progresso real vive no servidor de casa (container `reino-unicornios`, porta 80, banco em
   `jogo/servidor/dados/reino.db`), no artifact publicado (capacidade `db`, doc `progresso/mariana`) e no
   localStorage `mariana-reino-v1` (e `mariana-reino-v1-novidades`) de cada aparelho.
2. Proibido: abrir/chamar o servidor de casa (porta 80, `reinodosunicornios.local`, `localhost`,
   `127.0.0.1` sem porta de teste, IP do PC na rede); ler/gravar/apagar em `jogo/servidor/dados/`; mexer no
   docker/container/serviço `reino-nome`; publicar ou abrir o artifact publicado; `localStorage.clear()`,
   `removeItem` em chave existente, "Apagar tudo", "Novo ciclo" ou pagamento fora do teste.
3. Nada é escrito na árvore principal `/home/leandro/Mariana Revisões` (servida ao vivo). Trabalhe na sua worktree.

## 5. Testes
1. Só no Chromium do Playwright. Nada de Firefox, Safari/WebKit nem emulação de iPhone/iPad com WebKit.
2. Tamanhos: celular 390×844, tablet 820×1180, notebook 1366×768 (`jogo/ferramentas/testes/navegador.js`, `TAMANHOS`).
3. Servidor de TESTE: `node jogo/ferramentas/testes/servidor-teste.js` (porta livre ≥ 1024, nunca 80, banco novo em
   `/tmp/reino-testes/`; recusa a porta 80 e banco fora de `/tmp`).
4. Navegador de teste: `jogo/ferramentas/testes/navegador.js` (`abrir({ url, tamanho, save, query })`), preso
   à porta de teste (bloqueia toda outra rede).
5. Saves 100% sintéticos: `jogo/ferramentas/testes/saves.js`. Nunca copie o save real.
6. Derrube só os seus servidores, pelo PID (ou `s.parar()`). Nunca `pkill`/`killall` por nome (node, servidor.js, chrome).
7. Temporários ficam em `/tmp` e não são apagados; `rm` só com caminho literal, nunca com alvo de `$(...)`.
8. Depuração: `?debug=1` → `window.__reino` (`jogo/js/debug.js`); modo determinístico: `?debug=1&congelar=1`
   (`jogo/js/nucleo/congelar.js`, `__congelar.avancar(ms)`).
   Nele, `U.embaralhar(arr, chave)`/`U.sortear(arr, chave)` sorteiam por `Reino.sorteioDaChave(chave)` (semente =
   FNV-1a da chave + nº de usos dela; não gasta o `Math.random` global): desafio, sala ou treino novo não muda a ordem
   das outras telas. Quem sorteia conteúdo passa a chave (`'sortear:' + sala.id + ...`, `['escolha', d]`). Sem
   congelar (o jogo de verdade), a chave é ignorada e tudo continua com `Math.random`.
9. "Page crashed"/"Target crashed" no Chromium: confira `df -h /tmp`; se estiver cheio, rode com
   `TMPDIR=/dev/shm/<pasta>` (não apague temporários de outros). A pasta de testes pode ir junto:
   `REINO_TESTES=/dev/shm/reino-testes` (só dentro de `/tmp` ou `/dev/shm`; `guardas.js`).
10. Ver e fotografar uma cena com UM comando: `npm run ver -- --ir petshop --estrelas 500 --tamanhos celular`
   (`jogo/ferramentas/testes/ver.js`; `--tela loja|sala:h1|prova:<id>|desafio:h1-03` (esse desafio, sem sorteio), `--passos`, `--js`, `--previa`, `--recorte`,
   `--ampliar`; `--ajuda` tem exemplos). Sai em `/tmp/reino-testes/ver/<nome>/` (PNG, erros.txt, estado.json e
   console.txt, o console todo da página) e com código ≠ 0 se houve erro de console. O `console.log` de cada `--js`/
   `--passos` e o valor que cada `--js` devolve saem no fim da saída. `--previa mapa` traz a grade (coluna/linha,
   rect e id de cada lugar e clareira, áreas livres em azul); `--livres 5x4` lista rects livres com o `caminho`
   sugerido até a rua (sem navegador; `cena-e-motor.md` §9). Em script: `abrirCenario()` de `jogo/ferramentas/testes/cenario.js` (servidor
   e banco novos por cenário, save de `saves-compor.js`); não escreva outro ajudante de Playwright.
11. Prédio, matéria ou sala novos começam com UM comando: `npm run novo -- predio padaria --nome "Padaria" --rect 10,10,5,4
   --caminho "14,14;13,14;12,14"`, `npm run novo -- materia geografia --nome "Geografia" --emoji 🌍` ou
   `npm run novo -- sala historia h6` (`jogo/ferramentas/novo/novo.js`; `--lista`, `--ajuda`, `--seco`, `--raiz`). Cria os
   arquivos dos modelos (`jogo/ferramentas/novo/modelos/`), põe as linhas no manifesto na ordem certa, refaz o index e
   imprime o que falta. O que só a pessoa escreve sai como `(preencher)`, que os validadores recusam ("falta preencher").

## 6. Comandos que existem hoje
```
node jogo/ferramentas/gerar-index.js --conferir          # index.html x manifesto
node jogo/ferramentas/validar/validar-interiores.js      # interiores e NPCs
node jogo/ferramentas/validar/validar-conteudo.js        # matérias, salas, provas
node jogo/ferramentas/testes/testar-save.js              # save, mescla, fome e sede (sem navegador)
node jogo/ferramentas/testes/testar-banho.js             # banho no save e nos cuidados
node jogo/ferramentas/testes/testar-musicas.js           # músicas pelos dados
node jogo/ferramentas/testes/referencias.js capturar <saida> --raiz <jogo> [--so dados,imagens,vozes,desempenho]
node jogo/ferramentas/testes/referencias.js comparar <referencia> <nova> [--desempenho]
node jogo/ferramentas/testes/desempenho.js <jogo-ref> <jogo-novo>
npm run e2e [-- --so-dados | --cenas <regex> | --paralelo N | --tamanhos celular | --manter]   # atual x base (e2e.js)
#   idêntico: a captura do atual é apagada (--manter guarda); abaixo de 1,5 GB livres nem começa
npm run e2e -- --podar                                   # apaga e2e-* com mais de 1 h e ref de harness antigo (lista antes)
#   --cenas: só as imagens cujo nome casa (sem dados/vozes; a base é a completa, em cache); cada aba
#            para quando o tamanho já tem todas as pedidas
#   --paralelo: abas ao mesmo tempo (padrão metade das CPUs, até 12; um Chromium por vaga)
#   diferença em imagem: caminhos da base, do atual e de e2e-<data>/diferencas/ (pixels em magenta)
node jogo/ferramentas/vozes/listar-falas.js              # gera ferramentas/gerado/falas.json
npm test                                                 # (atalhos npm: ver package.json)
```
