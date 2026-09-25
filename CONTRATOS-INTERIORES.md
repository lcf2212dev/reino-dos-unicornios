# Contratos: construções por dentro

Fonte da verdade da feature "construções por dentro" (branch `feat/construcoes-por-dentro`).
Cada módulo depende só destes contratos. Mudança de contrato: só o orquestrador decide.

Convenções do projeto: scripts clássicos (sem módulos), tudo em `window.Reino` e nos globais
`Mapa`, `Jogador`, `PA`; nomes e comentários em português; pixel art desenhada em código
(contorno `#3a2446`); tile de 16 px; fonte "Press Start 2P" para texto no canvas.

## 0. Ordem dos scripts (index.html)

```
config, icones, pixelart, unicornios, materias/*, provas/*, progresso, audio, voz, claude,
falas, mapa, jogador, minijogos, prova, provas, ui,
interiores.js, npcs.js, interiores/<cada prédio>.js, cena.js, main.js, debug.js
```
CSS: `css/jogo.css`, `css/interiores.css`.

`js/interiores.js`, `js/npcs.js` e `js/interiores/*.js` **não tocam em DOM, canvas, `PA` nem
`Reino.Progresso` no carregamento** (só dentro de funções chamadas depois). As ferramentas em Node
(`listar-falas.js`, `validar-interiores.js`) carregam esses arquivos num `vm` sem DOM.

## 1. Cena ativa — `js/cena.js` (`Reino.Cena`)

Estados (strings): `'mapa'`, `'transicao'`, `'interior'`, `'dialogo'`, `'atividade'`.

```
Reino.Cena = {
  MAPA, TRANSICAO, INTERIOR, DIALOGO, ATIVIDADE,   // as strings acima
  estado() → string        // derivado, nesta prioridade: transição > tela DOM aberta (UI.temTela)
                           // > balão modal (Reino.Claude.dialogoAberto()) > tipo da cena ativa
  atual() → cena ativa     // objeto com a interface de cena (seção 2)
  mapa                     // a cena do mapa (adaptador sobre Mapa)
  bloqueado() → bool       // true em transição, atividade e diálogo: sem andar, sem portas, sem NPCs
  emTransicao() → bool
  entrar(lugarId) → Promise      // mapa → interior de entrada do lugar, com íris.
                                 // Lugar sem interior registrado: UI.abrirLugar(lugar) (painel antigo).
  irPara(interiorId, chegada {x,y}, olhar {x,y}) → Promise   // interior → interior (escadas), com íris
  sair() → Promise               // interior → mapa, 1 tile abaixo da porta do lugar, olhando para baixo
  paraTela(wx, wy) → {x, y}      // px do jogo → px CSS da página (para testes e toques)
  quadros: { media() → ms, ultimo }   // tempo de desenho por quadro (últimos ~120), para o debug
}
evento: U.emit('cena', { de: idAntigo, para: idNovo })   // quando a cena ativa troca
```

- Entrar: pisar na porta, tocar no prédio ou na placa (ela anda até a porta), Enter/Espaço na porta,
  menu Lugares. Com interior registrado, vem a íris; sem, o painel antigo, como hoje.
- Dentro: ela aparece em `spawn` (1 tile acima do tapete de saída), **de costas** (`J.virar(0,-1)`).
- Sair: pisar no tapete, tocar nele ou Enter/Espaço em cima dele. Reaparece em `porta.x, porta.y + 1`,
  virada para baixo. Sem loop: `J.portaIgnorada` vale para porta, tapete e escada.
- Menu Lugares dentro de um interior: `sair()`, anda até o destino e entra. Se o destino é o próprio
  prédio, vai para o `spawn` da entrada (com íris).
- Atalhos do HUD (💰 Baú, ⭐ Loja, montaria/Estábulo, 🥚) continuam abrindo os painéis direto.
- Ao abrir o jogo ela começa no mapa. A posição nos interiores não é salva.

### 1.1 Transição em íris
- Fecha ~450 ms (ease-in) centrada na Mariana; fechada ≥120 ms **e** até `destino.preparar()` e
  `Reino.Voz.carregar(pacote)` terminarem (limite de segurança ~4 s); troca a cena; abre ~450 ms
  (ease-out) centrada na nova posição dela.
- Desenhada no canvas principal, por cima de tudo (cenário, personagens, placas), cor `#3a2446`.
  Borda em degraus: faixas horizontais de `escala` px (como `circulo()` do mapa.js).
- Som `Reino.Som.tocar('porta')` ao entrar e ao sair.
- Durante a transição: input bloqueado, portas e NPCs inativos, nenhuma tela abre (cliques no HUD
  são ignorados). Nunca dispara duas vezes (a segunda chamada devolve a mesma promessa).
  Resize/rotação no meio não quebra (raio calculado em fração da tela a cada quadro).
- Ajustes → Animações desligado ou `prefers-reduced-motion`: troca rápida (~150 ms), sem círculo.

### 1.2 Pintor (main.js → cenas)
```
pintor = {
  ret(x, y, w, h, cor)     // px do jogo, desenhado direto em px da tela (suave, sem tremer)
  sprite(img, x, yPes)     // img centrada em x, com a base em yPes (px do jogo)
  ctx, escala, dpr, cam {x, y}
  tela(x, y) → {x, y}      // px do jogo → px do canvas
}
```

### 1.3 Ordem de desenho de cada quadro
1. buffer (px do jogo): fundo `cena.corFundo`; `cena.desenharFundo(bctx, t, animar)`; marcador do toque.
2. buffer ampliado no canvas.
3. `cena.desenharTela(ctx, pintor, t, animar)` — placas (mapa) e placas dos cômodos.
4. Itens ordenados por Y: `Jogador.itensDesenho(pintor, animar)` + `cena.itensDesenho(pintor, t, animar)`.
5. `cena.desenharSobre(ctx, pintor, t, animar)` (opcional) — por cima dos itens: placas dos cômodos nos
   interiores (quase transparentes quando cobrem a Mariana). As placas do mapa continuam no passo 3.
6. Luz (vinheta), como hoje.
7. Íris, se houver transição.

## 2. Interface de cena (Mapa e cada interior)

```
cena = {
  id: 'mapa' | '<id do interior>',
  tipo: 'mapa' | 'interior',
  lugarId: null | '<id do lugar no mapa>',
  corFundo: '#c6e15a' (mapa) | cor escura (interior),
  largura(), altura()              // px do jogo
  solido(tx, ty) → bool            // fora dos limites = true
  portaEm(tx, ty) → lugar | null   // só o mapa: porta de prédio (como Mapa.portaEm)
  saidaEm(tx, ty) → gatilho | null // só interiores: { id, tipo: 'saida'|'escada', x, y, para?, chegada?, olhar? }
  caminho(a, b) → [{x,y}] | null   // 8 direções, sem cortar quina (mesma regra de Mapa.caminho)
  maisPerto(x, y, de) → {x,y} | null
  alvoEm(wx, wy) → alvo | null     // toque, em px do jogo (NPC, objeto interativo, tapete/escada;
                                   // no mapa: prédio, placa, Claude)
  alvoPerto(tile, olhar) → alvo | null   // Enter/Espaço: gatilho no tile atual; NPC/objeto/Claude
                                         // vizinho (4 vizinhos), preferindo o que ela está olhando
  npcs() → [npc]                   // NPCs da cena (mapa: [])
  preparar() → Promise             // pré-renderiza o estático (só se precisar) — chamado com a íris fechada
  desenharFundo(bctx, t, animar)   // buffer em px do jogo: canvas estático + animações leves
  desenharTela(ctx, pintor, t, animar)   // em px da tela, antes dos personagens (placas do mapa)
  desenharSobre?(ctx, pintor, t, animar) // em px da tela, depois dos personagens (placas dos cômodos)
  itensDesenho(pintor, t, animar) → [{ y, desenhar() }]   // NPCs, móveis altos, Claude (ordem por Y)
}

alvo = { tipo: 'npc'|'objeto'|'saida'|'escada'|'lugar'|'claude', id,
         tile: {x, y},      // onde ela para (vizinho livre alcançável; para gatilhos, o próprio tile)
         olhar: {x, y},     // para onde ela vira ao chegar
         agir() }           // o que acontece ao chegar
```
Controle genérico (main.js/cena.js): toque → `alvoEm`; se houver alvo, `Jogador.irPara(tile)` e,
ao chegar, `Jogador.virar(olhar)` e `agir()`; senão anda até o tile (ou `maisPerto`).
Enter/Espaço → `alvoPerto`. Tudo ignorado quando `Reino.Cena.bloqueado()`.

## 3. Jogador (`js/jogador.js`)
- Consulta sempre `Reino.Cena.atual()` (com `Mapa` como reserva antes de a cena existir) para
  `solido`, `caminho`, `portaEm`/`saidaEm`.
- `J.atualizar(dt, teclas, aoPisar)`: andando com as setas, ao pisar num tile com `portaEm` ou
  `saidaEm`, chama `aoPisar(gatilhoOuLugar)` uma vez (`J.portaIgnorada` = id até sair do tile).
- `J.itensDesenho(pintor, animar) → [{ y, desenhar() }]` (Mariana e bebê como itens separados;
  montada = um item). `J.desenhar(pintor, animar)` continua existindo (desenha os próprios itens em ordem).

## 4. Interiores — `js/interiores.js` (`Reino.registrarInterior`, `Reino.Interiores`)

```
Reino.interiores = []                 // defs registradas, na ordem
Reino.registrarInterior(def)
Reino.Interiores = {
  T: 16,
  def(id) → def
  doLugar(lugarId) → def de entrada do lugar (entrada: true; senão a primeira) | null
  doPredio(lugarId) → [defs do lugar]
  cena(id) → cena (seção 2), criada uma vez e reaproveitada
  grade(def) → { w, h, solido[y][x], chao[y][x], comodo[y][x] }   // puro, sem DOM (usado pelo validador)
  objeto(tipo, defObjeto)             // registra um tipo de objeto; cada prédio pode registrar os seus
  OBJETOS, PISOS, PAREDES             // bibliotecas
  desenho: { C, ret, circulo, elipse, triangulo, contornoRet }   // mesmos helpers do mapa.js
}
```

### 4.1 Formato de um interior (dados)
```
Reino.registrarInterior({
  id: 'museu',                        // único; andares: 'torre', 'torre-1', 'torre-2'…
  lugar: 'materia:historia',          // id do lugar no mapa ('castelo','escola','estabulo','loja','bau','materia:<id>')
  nome: 'Museu das Memórias',
  entrada: true,                      // é por aqui que se entra pelo mapa (um por lugar)
  pacote: 'interior-museu',           // pacote de voz; andares do mesmo prédio usam o mesmo
  tamanho: { w, h },                  // em tiles
  saida: { x, y },                    // tapete de saída (só no de entrada): tile de chão na última fileira do cômodo
  spawn: { x, y },                    // 1 tile acima do tapete
  escadas: [{ x, y, para: 'torre-1', chegada: { x, y }, olhar: { x: 0, y: 1 }, sentido: 'sobe'|'desce' }],
                                      // chegada nunca em cima de escada; 'sobe' = arco na parede, 'desce' = vão no chão
  comodos: [{
    id: 'galeria1', nome: 'Cartas e Lembranças',
    placa: 'Sala 1 • Cartas e Lembranças',   // placa com a fonte pixel na parede do fundo
    rect: { x, y, w, h },             // cômodo inteiro; as 2 primeiras fileiras são a parede do fundo (sólida)
    piso: 'taco' | 'mosaico' | 'pedra' | 'palha' | 'tabuas' | 'azulejo' | 'carpete',
    parede: 'papel' | 'pedra' | 'madeira' | 'tijolo' | 'azulejo',
    paleta: { piso, piso2, parede, parede2, rodape, detalhe },   // opcional
  }],
  portas: [{ x, y, w: 1, h: 2 }],     // vãos entre cômodos (andáveis), inclusive atravessando parede
  corredores: [{ x, y, w, h }],       // passagens que ficam livres (fora da regra do 3×3 vazio)
  objetos: [{
    tipo: 'escrivaninha', x, y,       // canto superior esquerdo, em tiles
    w?, h?,                           // pegada em tiles (padrão: da biblioteca)
    solido?: true | false | 'base',   // 'base' = só a fileira de baixo (padrão da biblioteca)
    alto?: bool,                      // desenhado na ordem por Y com a Mariana (móvel solto no meio do cômodo)
    parede?: bool,                    // enfeite pendurado na parede do fundo
    nome?: 'Caixinha de lembranças',  // nome no balão, se for interativo
    fala?: 'Texto curto.',            // interativo: fala curta (voz 'narradora', ou `voz`)
    voz?: 'narradora',
    acao?: { tipo: 'tela', tela: 'livro'|'plano'|'estabulo'|'loja'|'bau'|'ovos', materia? }
         | { tipo: 'unicornio', indice }   // (estábulo) o unicórnio da baia diz a frase gravada
    var?: { … },                      // parâmetros do desenho (cor, unicórnio do quadro, etc.)
  }],
  npcs: [ …seção 5… ],
});
```
Grade: tiles fora de qualquer `rect` são sólidos (vão); as 2 primeiras fileiras de cada `rect` são
parede sólida; `portas`, `saida`, `spawn`, `escadas` são andáveis; objeto sólido e NPC ocupam o tile.

### 4.2 Biblioteca de objetos
```
Reino.Interiores.objeto('escrivaninha', {
  w: 2, h: 2, solido: 'base', alto: false, parede: false,
  desenhar(ctx, px, py, obj, P)   // px do jogo; P = Reino.Progresso (para objetos derivados do estado)
  chave?(P, obj) → string         // objetos que mostram o estado: muda a chave → pré-render de novo
  topo?: px                       // móveis altos: quanto o desenho passa acima da pegada
  anim?(ctx, px, py, t, obj)      // animação leve por quadro (só com Ajustes → Animações)
  semSombra?: bool                // sombra sob o móvel é automática
});
```

Biblioteca genérica pronta (49 tipos): parede — janela, cortina, quadro, quadro-unicornio (var.uni:
silhueta com "?" até ela ganhar), estandarte, vitral, cartaz, relogio-parede, prateleira-parede, arandela,
lousa, mapa-parede, espelho, bandeirinhas; chão — estante, armario, mesa, mesa-centro, escrivaninha,
cadeira, poltrona, sofa, banco, tapete, tapete-redondo, tapete-listrado, vaso-planta, planta-alta, flores,
vaso-grande, bau, caixote, barril, pedestal, vitrine, lareira, fonte, bebedouro, cabideiro, globo,
pilha-livros, papeis, almofada, luminaria-pe, cesto, balde, placa-chao, cavalete, relogio-pe; e
"miudezas" sobre mesas e vitrines. Pisos: taco, mosaico, pedra, palha, tabuas, azulejo, carpete.
Paredes: papel, pedra, madeira, tijolo, azulejo. Ver `js/interiores.js` e `ferramentas/interiores.html`.

#### 4.2.1 Extensões (novidades: Pet Shop e Observatório)
```
  toque?(wx, wy, px, py, obj, folga) → bool   // área de toque própria, em px do jogo (ex.: os planetas, desenhados
                                              // maiores que a pegada); folga 0 = desenho exato, 1 = com folga
```
Prioridade do `alvoEm` nos interiores: NPC (o corpo e o **balãozinho de status** em cima da cabeça, que
também é tocável) → objeto interativo com `toque` (exato, depois com folga 1; o desenhado por cima ganha) →
objeto interativo cuja pegada contém o tile → parte desenhada acima da pegada (`topo`), o mais à frente; no
chão livre, só onde há pixel desenhado (máscara do `desenhar` + `anim` no instante 0, feita uma vez e
refeita quando o desenho muda). Ações de objeto recebem `ctx = { interior, cena, objeto }` e rodam depois
da `fala` do objeto. Status registrados (`Reino.NPCs.registrarStatus`) passam na frente dos embutidos; ação
que resolve `'tchau'` faz o NPC se despedir. Detalhes em `CONTRATOS-NOVIDADES.md` §8.

### 4.3 Regras de desenho e desempenho
- Estático pré-renderizado **uma vez** num canvas por interior; refeito só quando a chave de estado
  (junção das `chave(P)`) muda, conferida nos eventos `progresso`/`progressoRemoto`/`mapaMudou`.
  Nada de criar canvas a cada quadro. Móveis altos viram sprites pré-renderizados.
- Animações (vela, pêndulo, brilho, água) só com `animar`.
- Câmera igual à do mapa: centraliza se couber; senão segue a Mariana com limite nas bordas.
- Placas dos cômodos em px da tela com a fonte pixel (tamanho `8 * max(2, round(escala/2))`, como no mapa).

### 4.4 Critério de "rico" (conferido por `ferramentas/validar-interiores.js`)
- Cada cômodo: ≥15 **tipos** de objeto distintos (pegada tocando o `rect`, parede inclusa).
- Nenhuma janela de 3×3 tiles de chão sem nenhum objeto, NPC, tapete ou escada, fora dos `corredores`.
- Camadas: piso com padrão, rodapé, parede decorada, móveis, objetos pequenos, sombras.
- ≥3 objetos interativos por interior.
- Tudo alcançável a partir do `spawn`: vizinho livre de cada NPC e objeto interativo, a saída e as escadas.

## 5. NPCs — `js/npcs.js` (`Reino.NPCs`)

```
npc = {
  id: 'antonio',                      // único no jogo
  nome: 'Seu Antônio',                // sem nomes de unicórnio nem sugestões de nome
  sprite: { base: 'pessoa', … },      // parâmetros do gerador de sprites (ver npcs.js)
  voz: 'npc-antonio',                 // perfil em Reino.config.vozes (um por personagem)
  x, y,                               // tile (fica sólido)
  acao: { tipo: 'sala', materia: 'historia', sala: 'h1' }
      | { tipo: 'treino', materia: 'historia' }
      | { tipo: 'prova', prova: 'historia-3bim' }
      | { tipo: 'tela', tela: 'estabulo'|'loja'|'bau'|'plano'|'ovos'|'livro', materia? }
      | { tipo: 'guia', lugar: 'materia:historia'|'castelo'|'escola', livro?: 'historia' },
  falas: {                            // listas; cada fala ≤ 2 linhas no balão
    oi: [],         // apresentação (1ª conversa na sessão). Sala: se vazio, usa sala.intro
    nova: [],       // convite: sala nova, treino liberado sem medalha, prova valendo, guia/tela
    feita: [],      // "de novo?"; o motor junta a dica do caminho da persistência (P.faltamPersistencia)
    bloqueada: [],  // treino antes de terminar as salas; o motor junta quantas faltam
    depois: [],     // comemoração quando ela volta com a atividade concluída
  },
}

Reino.NPCs = {
  status(npc) → { icone, rotulo }   // derivado do progresso:
      // sala: '❗' nova, '✓' feita, '💙' raro da sala já ganho (P.temUni)
      // treino: '🔒' até terminar as salas; depois a melhor medalha ('🥇'/'🥈'/'🥉') ou '❗' sem medalha
      // prova: '🌈'/'💙'/'🤍' o que vale a próxima tentativa (P.valendoProva); '✓' acessório ganho
      // guia e tela: '💬' (estábulo com ovos: '🥚')
  sprite(npc, quadro) → canvas      // 1×, com contorno; quadros 0/1 (respirar/piscar); cacheado
  retrato(npc, quadro) → canvas     // busto para o balão; cacheado
  desenhar(pintor, npc, x, yPes, t, animar)   // corpo + ícone de status acima da cabeça
  interagir(npc, ctx) → Promise     // conversa e dispara a ação; ctx = { interior: def, cena }
  executar(acao, ctx) → Promise     // só a ação, sem conversa (usada também pelos objetos com `acao`)
  chips(npc) → Node | null          // sala: valor, ✓ Feita, 💙 Raro, 🌙 Calma (iguais aos da tela da matéria)
  falasPossiveis(npc, def) → [{ texto, voz }]   // tudo o que o NPC pode falar, números enumerados
}
```

Elenco (ids fixos; os prédios usam estes):

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
| Castelo | `serena` | Princesa Serena | guia `castelo` |
| | `aurora` | Cavaleira Aurora | treino historia |
| | `oliver` | «Sir Oliver» | treino ingles |
| Escola | `margarida` | Diretora Margarida | guia `escola` |
| | `helena` | Professora Helena | prova historia-3bim |
| | `emma` | «Teacher Emma» | prova ingles-3bim |
| Estábulo | `feno` | Seu Feno | tela estabulo |
| Loja | `petala` | Fada Pétala | tela loja |
| Baú | `tostao` | Dragãozinho Tostão | tela bau |

Perfil de voz de cada um: `npc-<id>`. Interior de teste da Fase 1 (`js/interiores/teste.js`, lugar
`bau`, trocado pelo Baú de verdade na Fase 4): NPCs `teste-guia` e `teste-sala`, vozes
`npc-teste-guia` e `npc-teste-sala`.

Ações (as mesmas funções de hoje, regras intactas):
- sala → `Reino.Missao.iniciar(materia, sala, fim)`
- treino → `Reino.Prova.iniciar(materia, fim)` (só com a matéria completa; senão fala `bloqueada`)
- prova → `Reino.Provas.iniciar(prova, fim)`
- tela → `UI.abrirLivro(m)`, `UI.telaPlano()`, `UI.telaLoja()`, `UI.telaEstabulo()`,
  `UI.chocarOvos(P.ovosParaChocar())`, `UI.telaBau()`
- guia → botão "Ver a lista" abre `UI.telaMateria(m)` / `UI.telaCastelo()` / `Reino.Provas.telaEscola()`;
  guia de matéria também oferece o livro.
- `fim(premios)`: `U.emit('mapaMudou')`; se concluiu, o NPC comemora (`depois`); depois de sala
  concluída, `Reino.Claude.depoisDaMissao()`, como hoje. Ela continua ao lado do NPC.

## 6. Diálogo — `js/claude.js` (balão generalizado)

```
Reino.Claude.falar(texto, opcoes) → Promise<valor>
  opcoes de hoje: tipo, tempo, falar, fala (segmentos), voz, agora
  opcoes novas:
    quem: { nome: 'Seu Antônio', retrato: canvas | [canvas0, canvas1], voz: 'npc-antonio' }
          // sem quem = Claude, exatamente como hoje
    botoes: [{ texto: 'Vamos! ✨', valor: 'vamos', principal: true }, { texto: 'Agora não', valor: 'nao' }]
          // sem botoes = [Ok! 👍] com valor 'ok'; o 🔊 aparece sempre
    extra: Node      // linha entre o texto e os botões (ex.: chips da sala)
    modal: true      // enquanto aberto, Cena.estado() = 'dialogo' (não anda, portas/NPCs inativos)
  resolve com o valor do botão tocado; com null se o balão for limpo (Claude.limpar/fechar)
Reino.Claude.dialogoAberto() → bool   // o balão aberto é modal
```
Botões grandes, fáceis de tocar; o principal recebe o foco (Enter/Espaço funcionam); Esc aciona 'nao'.
**Tamanho das falas:** no celular cabem ~17 letras por linha. Cada balão deve ter até ~34 letras para
caber em 2 linhas; falas maiores são paginadas pelo NPC (Continuar →). Escreva falas curtas.

## 7. Vozes
- Perfis novos em `Reino.config.vozes`: `'npc-<id>': { voz, velocidade, tom, ingles? }`.
  `ingles` (opcional) = perfil usado nos trechos «em inglês» dessa personagem (padrão `'ingles'`);
  esse perfil também existe em `Reino.config.vozes` e é tratado como inglês na preparação do texto.
  `Reino.Voz.dividir(texto, voz)` usa esse campo (mesma divisão ao gravar e ao tocar).
  Perfis de hoje (claude, narradora, unicornio, ingles) não mudam.
- Um pacote por prédio: `interior-<id do prédio>` (`def.pacote`), carregado durante a íris de entrada.
- `Reino.Falas.todas()` inclui `NPCs.falasPossiveis` de cada NPC e as `fala` dos objetos, no pacote do interior.
- `ferramentas/listar-falas.js` carrega `js/interiores.js`, `js/npcs.js` e `js/interiores/*.js`.
- Números que mudam são enumerados (como `treinoBloqueado`); inglês entre «».

## 7.1 Extras expostos na Fase 1 (podem ser usados)
- `Reino.Cena.acionar(gatilho)`, `irAoLugar(lugar)`, `irAoAlvo(alvo)`, `entrarLugar(lugar)`, `faseTransicao()`.
- `Jogador.gatilhoEm(tx, ty)`. `alvo.semCaminho` (opcional): o que fazer se não houver caminho.
- `Reino.NPCs.ELENCO` (id → { nome, sprite, voz }): parâmetros de sprite e voz de todo o elenco da tabela.
- O ícone de status do NPC é desenhado em px da tela (via `pintor.ctx`).
- Câmera dos interiores: pode passar da borda até o fim do HUD de cima e do menu de baixo.

## 7.2 Convenções dos prédios (Fases 2 a 4)
- Dois arquivos por prédio: `js/interiores/<prédio>-falas.js` (`Reino.FALAS_INTERIORES.<prédio> = { npcs, objetos }`)
  e `js/interiores/<prédio>.js` (interior, objetos temáticos `Reino.Interiores.objeto('<prédio>-<nome>', …)`,
  NPCs com sprite e voz de `Reino.NPCs.ELENCO[id]`). O de falas carrega antes. Os dois entram no `index.html`
  e na lista `INTERIORES` de `ferramentas/interiores.html`.
- Prédios: museu (materia:historia), torre + torre-1..5 + torre-relogio (materia:ingles), escola, castelo,
  estabulo, loja, bau.
- Geradores (dados → cômodos): a Escola monta uma sala de aula por prova (`Reino.provas`), com professor
  conhecido ou padrão (`prof-<prova>`); o Castelo monta uma ala por matéria (`Reino.materias`), com cavaleiro
  conhecido ou padrão (`cav-<matéria>`); o Estábulo monta uma baia por unicórnio do baralho.
- Ações extras de objeto: `{ tipo: 'unicornio', indice }` (baia do Estábulo; índice em
  `Reino.NPCs.unicornioDaBaia(n)`: baia fixa por unicórnio do álbum; baia vazia fala `Reino.NPCs.BAIA_VAZIA`). A Loja lê `UI.ITENS_LOJA`.
- Frases automáticas do motor (npcs.js): resumo do guia ("Você fez N de 5 salas.", "Já ganhou R$ X!",
  "Agora vamos para a Sala N!"), persistência ("Mais N vezes e o raro nasce!", "Ou de primeira, com calma!"),
  prova ("Agora vale um prêmio lendário/raro/comum!"), treino ("Faltam N salas!"), estábulo com ovos.

## 7.3 Lições de voz e texto
- Cada fala (ou página) com até 30 letras (sem contar «» e emoji): no celular cabem ~15-17 por linha.
- Cada frase vira um áudio. Vozes multilíngues embolam frases portuguesas de 1-2 palavras soltas, sobretudo
  coladas a «inglês» ("Sou a «Miss Stella»" → "Soa"). Use frases de 3+ palavras ("Eu sou a «Miss Stella».")
  e o padrão «palavra» + "quer dizer <português>.".
- Toda gravação nova é conferida por transcrição (faster-whisper) antes de entregar.

## 8. Save
Nada novo no save. Status, medalhas, unicórnios nas baias e moedas no baú são derivados de
`Reino.Progresso`. O que o NPC já disse na sessão fica só na memória.

## 9. Depuração (`?debug=1` → `window.__reino`)
`cena()`, `estado()`, `pos()`, `fps()`, `tempoQuadro()`, `entrar(lugarId)`, `sair()`, `npcs()`,
`paraTela(wx, wy)`, `faltando`, `progresso()`. Ver `js/debug.js`.
