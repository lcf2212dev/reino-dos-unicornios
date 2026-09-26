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
1. Sala: `❗` nova, `✓` feita, `💙` raro da sala já ganho (`P.temUni`).
2. Treino: `🔒` até terminar as salas; depois a melhor medalha (`🥇`/`🥈`/`🥉`) ou `❗` sem medalha.
3. Prova: `🌈`/`💙`/`🤍` o que vale a próxima tentativa (`P.valendoProva`); `✓` acessório ganho.
4. Guia e tela: `💬` (estábulo com ovos: `🥚`).
5. Status registrados (`registrarStatus`) passam na frente dos embutidos (§7).
6. O balãozinho de status é tocável (conta como toque no NPC).

## 5. Elenco (ids fixos; perfil de voz `npc-<id>`)
| Prédio | id | Nome | Ação |
|---|---|---|---|
| Museu (História) | `memoria` | Dona Memória | guia `materia:historia`, livro |
| | `antonio` | Seu Antônio | sala h1 |
| | `chico` | Carteiro Chico | sala h2 |
| | `taina` | Guia Tainá | sala h3 |
| | `contadeira` | Vovó Contadeira | sala h4 |
| | `nina` | Restauradora Nina | sala h5 |
| Torre (Inglês) | `ponteiro` | Relojoeiro Seu Ponteiro | guia `materia:ingles`, livro |
| | `ben` | «Coach Ben» | sala i1 |
| | `stella` | «Miss Stella» | sala i2 |
| | `smile` | «Doctor Smile» | sala i3 |
| | `moon` | «Miss Moon» | sala i4 |
| | `joy` | «Mister Joy» | sala i5 |
| Casa das Palavras (Português) | `palavrinha` | Dona Palavrinha | Hall; `{ tipo: 'guia', lugar: 'materia:portugues', livro: 'portugues' }` |
| | `manu` | Chef Manu | Cozinha das Receitas; sala p1 |
| | `heitor` | Jardineiro Heitor | Horta do H; sala p2 |
| | `chocalho` | Palhaço Chocalho | Pátio do Circo; sala p3 |
| | `brisa` | Capitã Brisa | Porto da Expedição; sala p4 |
| | `carlos` | Seu Carlos do Carrossel | Parque do Carrossel; sala p5 |
| Castelo | `serena` | Princesa Serena | guia `castelo` |
| | `aurora` | Cavaleira Aurora | treino historia |
| | `oliver` | «Sir Oliver» | treino ingles |
| | `clara` | Cavaleira Clara | ala de Português; `{ tipo: 'treino', materia: 'portugues' }` |
| Escola | `margarida` | Diretora Margarida | guia `escola` |
| | `helena` | Professora Helena | prova historia-3bim |
| | `emma` | «Teacher Emma» | prova ingles-3bim |
| | `lucia` | Professora Lúcia | sala da prova; `{ tipo: 'prova', prova: 'portugues-3bim' }` |
| Estábulo | `feno` | Seu Feno | tela estabulo |
| Loja | `petala` | Fada Pétala | tela loja |
| Baú | `tostao` | Dragãozinho Tostão | tela bau |
| Pet Shop | `aveia` | Dona Aveia | tela petshop |
| Observatório | `vega` | Doutora Vega | curiosidade (guia) |
| | `cosmo` | Robô Cosmo (`base: 'robo'`) | piada |

1. Opções do gerador de sprites (sem mudar as de antes): `chapeu: 'chef'` (touca alta branca),
   `chapeu: 'quepe'` (quepe de capitã, com `chapeuCor`) e `nariz: '<cor>'` (nariz redondo de palhaço).
2. Personagens não imitam pessoas reais (nem os autores da apostila).
3. Personagem novo = entrada em `elenco.js` + perfil `npc-<id>` em `Reino.config.vozes`. Cavaleiro ou professora:
   `paraMateria` / `paraProva` na entrada do elenco (`Reino.NPCs.doElenco(filtro)`).

## 6. Ações (as mesmas funções de sempre, regras intactas)
1. sala → `Reino.Missao.iniciar(materia, sala, fim)` (`atividades/missao.js`).
2. treino → `Reino.Prova.iniciar(materia, fim)` (`atividades/treino.js`); só com a matéria completa; senão fala `bloqueada`.
3. prova → `Reino.Provas.iniciar(prova, fim)` (`atividades/provas.js`).
4. tela → `UI.abrirLivro(m)`, `UI.telaPlano()`, `UI.telaLoja()`, `UI.telaEstabulo()`,
   `UI.chocarOvos(P.ovosParaChocar())`, `UI.telaBau()`, ou a tela registrada (§7).
5. guia → botão "Ver a lista" abre `UI.telaMateria(m)` / `UI.telaCastelo()` / `Reino.Provas.telaEscola()`;
   guia de matéria também oferece o livro.
6. `fim(premios)`: `U.emit(Reino.EVENTOS.MAPA_MUDOU)`; se concluiu, o NPC comemora (`depois`); depois de sala concluída,
   `Reino.Claude.depoisDaMissao()`. Ela continua ao lado do NPC.
7. `ctx` das ações: vinda de objeto, `{ interior, cena, objeto }`, e roda DEPOIS da `fala` do objeto (se a
   fala resolver `null`, não roda). Vinda de NPC, `{ npc, quem }`, e só roda no "vamos"/"lista" do diálogo.
8. Despedida: tela registrada que fecha, ou ação que resolve `'tchau'` → o NPC fala a sua `depois` (balão
   simples de 5 s). Exceção: a tela `petshop` sem compra nem comida dada (`UI.visitaPetShop`, `cuidados.md` §6).

## 7. Extensões
```
Reino.NPCs.registrarTela(nome, abrir(acao, ctx), convite?)   // tela nova para { tipo: 'tela', tela: nome };
                                                              // o convite vira a fala `nova` padrão de NPC com essa tela
Reino.NPCs.registrarAcao(tipo, fn(acao, ctx) → Promise)      // ação nova de NPC/objeto ({ tipo: 'beber' } …)
Reino.NPCs.registrarStatus(fn(npc) → { icone, rotulo } | null)   // roda ANTES dos status embutidos e os substitui:
                                                              // o primeiro não nulo vence; exceção vira console.error e segue
Reino.NPCs.registrarBase(nome, fn(o, quadro) → { g, busto }) // base nova de sprite (o.base escolhe); o.cru = sprite
                                                              // original; quadro: bit 1 = respirando, bit 2 = piscando
Reino.NPCs.gradeSprite = { Grade, W, CX, TOPO, HY, BY, CONTORNO, esc, cla, mis }   // para desenhar a base
                                                              // (esc/cla/mis = escurecer, clarear, misturar)
Reino.NPCs.telas(), Reino.NPCs.acoes()                        // o que foi registrado (o validador aceita)
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
1. Botões grandes, fáceis de tocar; o principal recebe o foco (Enter/Espaço funcionam); Esc aciona `'nao'`.
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
8. Pet Shop: `aveia` (Dona Aveia, voz `npc-aveia`), `acao: { tipo: 'tela', tela: 'petshop' }`; a tela, o
   status 🍎/💧/🛁 e as ações `beber`/`banho` estão em `cuidados.md` §6–§7.

## 10. Falas (tamanho e frases automáticas)
1. Cada fala (ou página) com até 30 letras (sem contar «» e emoji): no celular cabem ~15–17 letras por linha;
   o balão tem 2 linhas. Escreva falas curtas. Regras de voz: `som-musica-e-voz.md` §5.
2. Frases automáticas do motor (`npcs-falas.js`), também curtas: resumo do guia ("Você fez N de 5 salas.",
   "Já ganhou R$ X!", "Agora vamos para a Sala N!"), persistência ("Mais N vezes e o raro nasce!", "Ou de
   primeira, com calma!"), prova ("Agora vale um prêmio lendário/raro/comum!"), treino ("Faltam N salas!"),
   estábulo com ovos.
3. Números que mudam são enumerados (como `treinoBloqueado`); inglês entre «».
4. `Reino.Falas.todas()` inclui `NPCs.falasPossiveis` de cada NPC e as `fala` dos objetos, no pacote do interior.

## 11. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/vozes/listar-falas.js      # fala nova ou mudada precisa de voz gravada
node jogo/ferramentas/gerar-index.js --conferir
npm test
```
