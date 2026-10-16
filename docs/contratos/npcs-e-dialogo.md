# Contrato: NPCs e diálogo

Cobre o formato de um NPC, o elenco (ids fixos), o ícone de status, a conversa no balão, as ações
(sala, treino, prova, tela, guia e as registradas), as extensões (telas, ações, status, bases de sprite)
e o tamanho das falas. Interiores: `interiores.md`. Vozes: `som-musica-e-voz.md`.

## Índice
1. Onde está no código · 2. Formato de um NPC · 3. API `Reino.NPCs` · 4. Status · 5. Elenco ·
6. Ações · 7. Extensões · 8. Balão e diálogo · 9. NPCs do Observatório e da Pet Shop · 10. Falas · 11. Antes de mexer

## 1. Onde está no código
`jogo/js/personagens/` (a API pública é `Reino.NPCs`, o interno `Reino._npcs`; `claude.js` carrega antes de `npcs*.js`):
- `npcs.js` — cria `Reino.NPCs`/`Reino._npcs`, grade de pixels, parâmetros e medidas do sprite.
- `npcs-corpo.js`, `npcs-cabeca.js` — pintam corpo, acessórios, cabeça, cabelo, rosto, chapéus, nariz.
- `npcs-sprites.js` — dragãozinho, bases (`registrarBase`, `gradeSprite`), `sprite`, `retrato`.
- `npcs-status.js` — `registrarStatus`, `status`, `desenhar` (sprite + ícone).
- `npcs-falas.js` — falas padrão, `paginar`, `falasPossiveis`, `chips`, frases automáticas.
- `npcs-conversa.js` — baias, `registrarTela`, `registrarAcao`, `executar`, `interagir`, `telas()`, `acoes()`.
- `elenco.js` — `Reino.NPCs.ELENCO` (só dados).
- `claude.js` — `Reino.Claude` (o balão generalizado).

## 2. Formato de um NPC
```
npc = {
  id: 'antonio',                      // único no jogo
  nome: 'Seu Antônio',                // sem nomes de unicórnio nem sugestões de nome
  sprite: { base: 'pessoa', … },      // parâmetros do gerador de sprites (npcs*.js)
  voz: 'npc-antonio',                 // perfil em Reino.config.vozes (um por personagem)
  x, y,                               // tile (fica sólido)
  acao: { tipo: 'sala', materia: 'historia', sala: 'h1' }
      | { tipo: 'treino', materia: 'historia' }
      | { tipo: 'prova', prova: 'historia-3bim' }
      | { tipo: 'tela', tela: 'estabulo'|'loja'|'bau'|'plano'|'ovos'|'livro'|<registrada>, materia? }
      | { tipo: 'guia', lugar: 'materia:historia'|'castelo'|'escola', livro?: 'historia' }
      | { tipo: <registrada>, … },
  falas: {                            // listas; cada fala ≤ 2 linhas no balão
    oi: [],         // apresentação (1ª conversa na sessão). Sala: se vazio, usa sala.intro
    nova: [],       // convite: sala nova, treino liberado sem medalha, prova valendo, guia/tela
    feita: [],      // "de novo?"; o motor junta a dica do caminho da persistência (P.faltamPersistencia)
    bloqueada: [],  // treino antes de terminar as salas; o motor junta quantas faltam
    depois: [],     // comemoração quando ela volta com a atividade concluída
  },
}
```

## 3. API `Reino.NPCs`
```
status(npc) → { icone, rotulo }            // §4
sprite(npc, quadro) → canvas               // 1×, com contorno; quadros 0/1 (respirar/piscar); cacheado
retrato(npc, quadro) → canvas              // busto para o balão; cacheado
desenhar(pintor, npc, x, yPes, t, animar)  // corpo + ícone de status acima da cabeça
interagir(npc, ctx) → Promise              // conversa e dispara a ação; ctx = { interior: def, cena }
executar(acao, ctx) → Promise              // só a ação, sem conversa (usada também pelos objetos com `acao`)
chips(npc) → Node | null                   // sala: valor, ✓ Feita, 💙 Raro, 🌙 Calma (iguais aos da tela da matéria)
falasPossiveis(npc, def) → [{ texto, voz }]   // tudo o que o NPC pode falar, números enumerados
ELENCO                                     // id → { nome, sprite, voz }
unicornioDaBaia(n), BAIA_VAZIA             // Estábulo (interiores.md §9.1)
registrarTela, registrarAcao, registrarStatus, registrarBase, gradeSprite, telas(), acoes()   // §7
```
O que o NPC já disse na sessão fica só na memória (nada no save).

## 4. Status (ícone acima da cabeça, derivado do progresso)
1. Sala: `❗` nova, `✓` feita, `🦄` raro da sala já ganho (o `💙` fica só para "vale raro") (`P.temUni`).
2. Treino: `🔒` até terminar as salas; depois a melhor medalha (`🥇`/`🥈`/`🥉`) ou `❗` sem medalha.
3. Prova: `🌈`/`💙`/`🤍` o que vale a próxima tentativa (`P.valendoProva`); `✓` acessório ganho.
4. Guia e tela: `💬` (estábulo com ovos: `🥚`).
5. Status registrados (`registrarStatus`) passam na frente dos embutidos (§7).
6. O balãozinho de status é tocável (conta como toque no NPC).

## 5. Elenco (ids fixos; perfil de voz `npc-<id>`)
A lista está em `personagens/elenco.js` (`Reino.NPCs.ELENCO`), mais os registrados com `Reino.registrarPersonagem`
(item 4). Cada entrada: `{ nome, sprite, paraMateria?, paraProva? }`, com a voz em `Reino.config.vozes['npc-<id>']`.
O que o NPC faz (sala, guia, treino…) está no `npcs` do interior onde ele aparece, não no elenco.

1. Ids fixos: nunca renomeie (as falas gravadas e o `falas.json` usam o id). Nome visível entre «» quando for em inglês.
   Vozes (conferidas por `npm run vozes-elenco`, `vozes/elenco-vozes.js`): ninguém com a voz do Claude (ERRO); no
   mesmo pacote `interior-*`, nada de duas vozes iguais (mesma voz base, tom a até 8 Hz e velocidade a até 8 pontos),
   nome próprio repetido nem voz de gênero diferente do jeito que o personagem se apresenta (avisos).
2. Personagens não imitam pessoas reais (nem os autores da apostila).
3. Personagem novo = entrada em `elenco.js` + perfil `npc-<id>` em `Reino.config.vozes`. Cavaleiro ou professora:
   `paraMateria` / `paraProva` na entrada do elenco (`Reino.NPCs.doElenco(filtro)`).
4. Caminho novo, sem mexer em arquivo central: `Reino.registrarPersonagem(def)` (`nucleo/registros.js`) no
   `falas.js` do prédio ou no arquivo da prova. O `perfil` (formato de `Reino.config.vozes`) vira na hora
   `Reino.config.vozes['npc-<id>']`; o `elenco.js` soma os registrados ao `N.ELENCO` depois dos de sempre (quem
   registra depois do elenco entra direto). Id repetido (com o elenco ou entre registrados) lança erro.
   ```js
   Reino.registrarPersonagem({ id: 'rosa', nome: 'Professora Rosa', paraProva: 'ciencias-4bim',
     sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', roupa: '#39a860', perna: 'saia' },
     perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '-5%', tom: '+4Hz' } });
   ```
   Com `predio: '<p>'` (e, opcionais, `x`, `y`, `acao`), o registro entra em `Reino.personagensDoPredio('<p>')`
   (`[{ id, x, y, acao }]`, na ordem de registro). O `<p>.js` feito por `npm run novo -- predio` soma esses à lista
   `npcs` (pelo ajudante `npc()`, que lê sprite e voz do elenco; sem `x/y`, uma vaga livre perto da entrada; sem
   `acao`, `guia`). Os prédios de antes também somam, mas só com `x` e `y` (tile do interior; não têm vagas): sem
   eles o `validar-interiores` acusa; sem `acao`, a do guia do prédio. Personagem feito em frentes paralelas:
   primeiro `Reino.reservarPersonagem` (o contrato, com a vaga tracejada até o registro), depois o registro só com
   o sprite (`plano-paralelo.md` §2). O id é SEMPRE o do interior
   (`registrarInterior({ id })`): `'museu'`, `'escola'`…; na Torre, o de cada andar (`'torre'`, `'torre-1'`…
   `'torre-relogio'`); no interior padrão, `'padrao-<matéria>'`. `npm run novo -- personagem <id> --predio <p>`
   escreve o registro em `jogo/js/interiores/<p>/personagens.js` (depois do `falas.js`, antes do `<p>.js`).
   A mesma pessoa em mais de um interior (mesma voz e sprite; as falas de cada lugar em `FALAS_INTERIORES.<p>.npcs.<id>`):
   `lugares: [{ predio, x, y, acao }]` no registro ou, de outro arquivo, `Reino.personagemTambemEm(id, { predio, x, y, acao })`;
   `Reino.personagensDoPredio(p)` devolve quem tem `p` em qualquer lugar. O registro tem de carregar ANTES do layout de cada
   interior onde aparece (no manifesto e na ordem alfabética das pastas das ferramentas). Gerador:
   `npm run novo -- personagem <id> --predio <outro> --tambem`.
5. Chaves do `sprite` (lista em `Reino.NPCs.OPCOES_SPRITE`, `personagens/npcs.js`; o desenho está em
   `npcs-corpo.js`, `npcs-cabeca.js` e `npcs-sprites.js`). Chave fora daqui é ignorada pelo desenho: o
   `validar-interiores` AVISA (elenco, `registrarPersonagem` e NPCs dos interiores), e também valor fora da lista.
   "cor" = `'#rrggbb'`; "sim" = `true` (onde diz "ou cor", aceita uma cor no lugar de `true`).

   | Chave | Valores aceitos |
   |---|---|
   | `base` | `'pessoa'` (padrão), `'fada'` (criança com asas), `'dragao'`, e as de `registrarBase` (hoje `'robo'`) |
   | `idade` | `'adulto'` (padrão; fada: `'crianca'`), `'crianca'`, `'idoso'` (cabelo grisalho padrão) |
   | `penteado` | `'curto'` (padrão), `'careca'`, `'cachos'`, `'espetado'`, `'longo'`, `'trancas'`, `'chanel'`, `'rabo'`, `'rabos'`, `'coque'`, `'black'`, `'cacheado'` |
   | `chapeu` | `'bone'`, `'chapeu'`, `'palha'`, `'cartola'`, `'boina'`, `'coroa'`, `'tiara'`, `'elmo'`, `'turbante'`, `'gorro'`, `'lenco'`, `'chef'`, `'quepe'`, `'pescador'`, `'festa'`, `'faixa'`, `'flores'` |
   | `perna` | `'calca'` (padrão; fada: `'vestido'`), `'saia'`, `'vestido'`, `'short'` |
   | `estampa` | `'listras'`, `'xadrez'`, `'bolinhas'`, `'estrelas'` (no tronco; bolinhas/estrelas em `cor2`) |
   | `emblema` | `'A'` (letra na sobreveste da `armadura`; cor em `emblemaCor`) |
   | cores | `pele`, `cabelo`, `roupa`, `roupa2` (calça/saia), `sapato`, `cor2` (detalhes), `chapeuCor`, `oculosCor`, `aventalCor`, `capaCor`, `bolsaCor`, `cachecolCor`, `regadorCor`, `emblemaCor`, `colete` |
   | sim | `boca` (`false` tira a boca), `oculos`, `avental`, `capa`, `capaEstrelas`, `jaleco`, `apito`, `bengala`, `bolsa`, `cachecol`, `cracha`, `carta`, `pincel`, `violao`, `varinha`, `presilha`, `flor`, `espelhoTesta`, `armadura`, `jardineira`, `corrente` (com `colete`), `asas`, `lapis`, `palhaco`, `sapatoes`, `regador` |
   | sim ou cor | `barba`, `bigode` (padrão: cor do cabelo), `nariz`, `colar`, `gravata`, `gola`, `livro`, `livroAberto` (padrão: `cor2`) |
   | dragão | `corpo`, `barriga`, `asa` (cores), `moeda` (`false` tira a moeda) |
   | robô | `corpo`, `detalhe`, `antena` (cores; `observatorio/robo.js`) |
   | ofício | `armaduraCor` (cor da matéria na `armadura`), `foguete`, `chave`, `mapa`, `tesoura` (sim: objeto na mão) |
   | ET (`base: 'et'`) | `idade` (criança −2 linhas de corpo, idoso +2), `planeta` (traço fixo do planeta), `xale`, `bengala` |

   Base nova: `registrarBase(nome, fn, chaves?)`, com `chaves = { detalhe: 'cor', … }` (as que ela lê de `o.cru`),
   para o validador não avisar.

## 6. Ações (as mesmas funções de sempre, regras intactas)
1. sala → `Reino.Missao.iniciar(materia, sala, fim)` (`atividades/missao.js`).
2. treino → `Reino.Prova.iniciar(materia, fim)` (`atividades/treino.js`); só com a matéria completa; senão fala `bloqueada`.
3. prova → `Reino.Provas.iniciar(prova, fim)` (`atividades/provas.js`).
4. tela → `UI.abrirLivro(m, null, acao.livro)` (`livro`: qual dos `materia.livros`, 4º bimestre), `UI.telaPlano()`, `UI.telaLoja()`, `UI.telaEstabulo()`,
   `UI.chocarOvos(P.ovosParaChocar())`, `UI.telaBau()`, ou a tela registrada (§7).
5. guia → botão "Ver a lista" abre `UI.telaMateria(m)` / `UI.telaCastelo()` / `Reino.Provas.telaEscola()`;
   guia de matéria também oferece o livro.
6. `fim(premios)`: `U.emit(Reino.EVENTOS.MAPA_MUDOU)`; se concluiu, o NPC comemora (`depois`); depois de sala concluída,
   `Reino.Claude.depoisDaMissao()`. Ela continua ao lado do NPC.
7. `ctx` das ações: vinda de objeto, `{ interior, cena, objeto }`, e roda DEPOIS da `fala` do objeto (se a
   fala resolver `null`, não roda). Vinda de NPC, `{ npc, quem }`, e só roda no "vamos"/"lista" do diálogo.
8. Outro tipo: primeiro as de `registrarAcao`, depois as `acoes` dos módulos (`Reino.registrarModulo`, cena-e-motor
   §14; um sistema carrega antes dos NPCs e declara ali). Tipo que ninguém tem não faz nada (o validador acusa).
9. Despedida: tela registrada que fecha, ou ação que resolve `'tchau'` → o NPC fala a sua `depois` (balão
   simples de 5 s). Exceção: a tela `petshop` sem compra nem comida dada (`UI.visitaPetShop`, `cuidados.md` §6).

## 7. Extensões
```
Reino.NPCs.registrarTela(nome, abrir(acao, ctx), convite?)   // tela nova para { tipo: 'tela', tela: nome };
                                                              // o convite vira a fala `nova` padrão de NPC com essa tela
Reino.NPCs.registrarAcao(tipo, fn(acao, ctx) → Promise)      // ação nova de NPC/objeto ({ tipo: 'beber' } …)
Reino.NPCs.registrarStatus(fn(npc) → { icone, rotulo } | null)   // roda ANTES dos status embutidos e os substitui:
                                                              // o primeiro não nulo vence; exceção vira console.error e segue
Reino.registrarModulo({ id, acoes: { tipo: fn(acao, ctx) → Promise } })   // o mesmo, vindo de um SISTEMA
                                                              // (carrega antes dos NPCs; cena-e-motor.md §14)
Reino.NPCs.registrarBase(nome, fn(o, quadro) → { g, busto }, chaves?) // base nova de sprite (o.base escolhe); o.cru =
                                                              // sprite original; quadro: bit 1 = respirando, bit 2 =
                                                              // piscando; chaves: as dela ({ detalhe: 'cor' }, §5)
Reino.NPCs.gradeSprite = { Grade, W, CX, TOPO, HY, BY, CONTORNO, esc, cla, mis }   // para desenhar a base
                                                              // (esc/cla/mis = escurecer, clarear, misturar)
Reino.NPCs.telas(), Reino.NPCs.acoes()                        // o que foi registrado (o validador aceita);
                                                              // acoes() inclui as dos módulos
Reino.NPCs.OPCOES_SPRITE                                      // chaves do sprite → valores (§5)
```
Registrar no carregamento é permitido (só guarda a função).

## 8. Balão e diálogo — `Reino.Claude` (`personagens/claude.js`)
```
Reino.Claude.falar(texto, opcoes) → Promise<valor>
  opcoes: tipo, tempo, falar, fala (segmentos), voz, agora,
    quem: { nome: 'Seu Antônio', retrato: canvas | [canvas0, canvas1], voz: 'npc-antonio' }   // sem quem = Claude
    botoes: [{ texto: 'Vamos! ✨', valor: 'vamos', principal: true }, { texto: 'Agora não', valor: 'nao' }]
            // sem botoes = [Ok! 👍] com valor 'ok'; o 🔊 aparece sempre
    extra: Node      // linha entre o texto e os botões (ex.: chips da sala)
    modal: true      // enquanto aberto, Cena.estado() = 'dialogo' (não anda, portas/NPCs inativos)
  resolve com o valor do botão tocado; com null se o balão for limpo (Claude.limpar/fechar)
Reino.Claude.dialogoAberto() → bool   // o balão aberto é modal
```
1. Botões grandes, fáceis de tocar; o principal recebe o foco (Enter/Espaço funcionam); Esc aciona `'nao'` (balão por cima de uma tela: `ui.md` §3.2).
2. Falas maiores que uma página são paginadas pelo NPC (Continuar →).
3. Falas fixas do Claude que citam só uma matéria ("revisar História", "ótima historiadora", "esse museu",
   "O Museu e a Torre…"): genéricas ou só na matéria certa; nenhuma numa sala de outra matéria.

## 9. NPCs do Observatório e da Pet Shop
1. `vega` (Doutora Vega, voz `npc-vega`, a guia): "Outra curiosidade!", sorteando sem repetir na sessão.
2. `cosmo` (Robô Cosmo, voz `npc-cosmo`, falas engraçadas; sprite com a base `'robo'`).
3. Ações registradas pelo Observatório (`observatorio/acoes.js`):
   ```
   { tipo: 'curiosidade', tema }   // tema 'todas' = qualquer uma; 'telescopio' = abre o painel do telescópio;
                                   // tema sem curiosidade cai em 'todas' e depois numa frase de reserva
   { tipo: 'piada' }               // Robô Cosmo
   ```
4. Fim de cada uma: "Outra curiosidade! ✨" / "Mais uma! 🤖" (repete) ou "Tchau! 💛" (resolve `'tchau'`: o NPC
   se despede num balão que fecha sozinho).
5. Curiosidade tocada num objeto é contada pelo objeto (retrato e nome dele) com a voz `npc-vega`; vinda de
   NPC, pela Doutora Vega.
6. Curiosidades:
   ```
   Reino.FALAS_INTERIORES.observatorio.curiosidades = [
     // fonte: <NASA Space Place | ESA Kids | Agência Espacial Brasileira> — <URL>
     { id, tema, paginas: ['frase curta.', 'outra frase.'] },
   ]
   Reino.Observatorio (observatorio/falas.js) = {
     temas() → [tema]                                  // temas com pelo menos uma curiosidade
     curiosidade(tema) → { id, tema, paginas } | null  // sorteia sem repetir na sessão; 'todas' (ou vazio) = qualquer
     piada() → { id, paginas } | null                  // piadas do Cosmo, sem repetir na sessão
     reiniciar()                                       // só testes: zera a memória da sessão
   }
   ```
7. Pelo menos 40 curiosidades, em temas: sol, lua, mercurio, venus, terra, marte, jupiter, saturno, urano,
   netuno, plutao, estrelas, constelacoes, astronautas, foguetes, cometas, galaxias. Corretas, atuais e curtas
   para o 2º ano (página até 30 letras, frases de 3+ palavras), cada uma com a fonte oficial e a URL no
   comentário. Toques do Brasil: o Cruzeiro do Sul na bandeira; Marcos Pontes, o primeiro astronauta
   brasileiro. Todas narradas pela voz `npc-vega`, em qualquer lugar em que apareçam. Só curiosidades: não
   dão estrelas nem mexem no save.
8. 2º andar (NASA, `observatorio/nasa-personagens.js`, `Reino.registrarPersonagem`): `nasa-lia` (Doutora Lia,
   foguetes e missões), `nasa-davi` (Astronauta Davi, base de sprite `'astronauta'`), `nasa-bia` (Engenheira Bia,
   Estação Espacial e a voz das experiências). Ação `{ tipo: 'nasa-curiosidade', temas, quem }` (sorteia sem repetir
   na sessão, voz do tema: `OBS.nasa.TEMA_VOZ`) e `{ tipo: 'nasa-experiencia', exp }`; falas em
   `FALAS_INTERIORES.observatorio.nasa` (`nasa-falas.js`).
9. Pet Shop: `aveia` (Dona Aveia, voz `npc-aveia`), `acao: { tipo: 'tela', tela: 'petshop' }`; a tela, o
   status 🍎/💧/🛁 e as ações `beber`/`banho` estão em `cuidados.md` §6–§7.

## 10. Falas (tamanho e frases automáticas)
1. Cada fala (ou página) com até 30 letras (sem contar «» e emoji): no celular cabem ~15–17 letras por linha;
   o balão tem 2 linhas. Escreva falas curtas. Regras de voz: `som-musica-e-voz.md` §5.
   Exceção: o Claude (balão sem `quem`) tem até 4 linhas por página. A fala dele que passa de 4 linhas no celular
   (5 fora dele, com Letras grandes; 3 por página no celular com Letras grandes e uma tela aberta) aparece em
   páginas com "Continuar →" (`claude.js`, `paginar`: linhas medidas no próprio balão, o menor número de páginas,
   pedaços parecidos); a voz lê a frase inteira uma vez só, então as frases do Claude não se cortam no texto nem
   na gravação.
2. Frases automáticas do motor (`npcs-falas.js`), também curtas: resumo do guia ("Você fez N de 5 salas.",
   "Já ganhou X Robux!", "Agora vamos para a Sala N!"), persistência ("Mais N vezes e o raro nasce!", "Ou de
   primeira, com calma!"), prova ("Agora vale um prêmio lendário/raro/comum!"), treino ("Faltam N salas!"),
   estábulo com ovos.
3. Números que mudam são enumerados (como `treinoBloqueado`); inglês entre «».
4. `Reino.Falas.todas()` inclui `NPCs.falasPossiveis` de cada NPC e as `fala` dos objetos, no pacote do interior.
5. Falas de um prédio em partes (`nucleo/registros.js`, seguro no node): `Reino.falasDoPredio(id)` cria ou devolve
   `Reino.FALAS_INTERIORES[id]`; `Reino.falasDoPredio(id, parte)` junta a parte: listas (`extras`, …) concatenadas na
   ordem de carga; `npcs` e `objetos` por id; as outras chaves (`nasa`, `curiosidades`, …) inteiras. A mesma chave,
   NPC ou objeto em duas partes é erro (lança, com o nome). Qualquer ordem de carga dá o mesmo conteúdo, então
   nenhuma parte cria o objeto com `=` nem o lê ao carregar: cada uma monta o que é dela e entrega. Exemplo: o
   Observatório (`falas.js` base, `nasa-falas.js`, `lab-falas.js`). Teste: `testes/unidade/falas-predio.test.js`.

## 11. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/vozes/listar-falas.js      # fala nova ou mudada precisa de voz gravada
node jogo/ferramentas/gerar-index.js --conferir
npm test
```
