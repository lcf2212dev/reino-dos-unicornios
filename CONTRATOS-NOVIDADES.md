# Contratos: novidades (Pet Shop, fome e sede, nado, prêmios à venda, pergunta surpresa, Observatório)

Branch `feat/petshop-lago-observatorio` (worktree `/home/leandro/reino-novidades`). Estende
`CONTRATOS-INTERIORES.md`, que continua valendo inteiro. Mudança de contrato: só o orquestrador.

Convenções de sempre: scripts clássicos, tudo em `window.Reino` (e `Mapa`, `Jogador`, `PA`), nomes e
comentários em português, pixel art em código (contorno `#3a2446`, tile de 16 px), sem imagens.
Todo emoji que aparece na tela ou no canvas precisa do seu ícone em `js/icones.js` (confira em
`ferramentas/icones.html`). Ajustes → Animações desligado e `prefers-reduced-motion` valem em tudo:
sem animação, o desenho fica parado (sem partículas, ondinhas paradas, planetas parados).

## 0. Ordem dos scripts (index.html)
```
config, icones, pixelart, loja-itens, unicornios, materias/*, provas/*, progresso, audio, voz, claude,
falas, cuidados, surpresa, mapa, jogador, minijogos, prova, provas, ui,
interiores.js, npcs.js, interiores/<prédios>.js (… loja, bau, petshop-falas, petshop,
observatorio-falas, observatorio-cenas, observatorio, padrao), cena.js, main.js, debug.js
```
CSS: `css/jogo.css`, `css/interiores.css`, `css/novidades.css` (pergunta surpresa), `css/petshop.css` (Pet Shop, fome e sede).

`js/loja-itens.js`, `js/cuidados.js`, `js/surpresa.js`, `js/interiores/*.js` **não tocam em DOM,
canvas, `PA`, `Reino.Progresso`, `Reino.Cena` nem `document` no carregamento** (só dentro de funções
chamadas depois): `ferramentas/listar-falas.js` e `validar-interiores.js` os carregam num `vm` sem DOM.

## 1. Save: campos novos e mescla (js/progresso.js)

Nada existente muda: `chaveSave`, `v`, `geracao`, `ciclo`, o formato dos campos e as regras de
`P.mesclar()` para eles. Campos novos, todos aditivos (`estadoNovo()` + `completar()`):

```
cuidados: { <uniId>: { fome, sede, em } }        // 0–100 (100 = satisfeito); em = Date.now() da última mudança
despensa: { <comidaId>: { compradas, usadas } }  // contadores que só crescem; quantidade = compradas − usadas
ajustes.surpresa: true                           // interruptor "❓ Perguntas surpresa" (padrão ligado)
```
- Unicórnio sem registro em `cuidados` = fome 100 e sede 100 (unicórnio novo nasce satisfeito).
- **Mescla** (mesma geração):
  - `cuidados`: para cada `uniId` de qualquer lado, vale o registro com `em` maior (empate: o do lado mais recente).
  - `despensa`: para cada comida, `compradas` = maior e `usadas` = maior.
  - Um lado sem o campo (aparelho com a versão antiga, que pode apagá-lo): vale o outro lado inteiro.
    Um aparelho antigo nunca faz a Mariana perder comida comprada nem acessório (`loja` já é união).
  - `ajustes` continua vindo do lado mais recente (regra de hoje); `completar()` põe `surpresa: true` se faltar.
  - Geração diferente: continua vencendo o estado inteiro da geração maior (regra de hoje).
- "Novo ciclo" (`P.novoCiclo`) mantém `cuidados` e `despensa`. "Apagar tudo" (`P.apagarTudo`) zera, como o resto.
- Quem lê o estado sempre chama `P.estado()` de novo: a mescla troca o objeto inteiro.

## 2. Fome e sede — `js/cuidados.js` (`Reino.Cuidados`)

Números em `Reino.config.cuidados` e `Reino.config.comidas` (ver config.js).
```
Reino.Cuidados = {
  iniciar()                  // main.js chama no "Entrar no Reino" (depois do HUD): liga o relógio e os ouvintes
  ativo() → bool             // o relógio está gastando agora
  niveis(uniId?) → { fome, sede }        // padrão: a montaria (P.montaria()); sem registro = 100/100
  baixo(uniId?) → { fome: bool, sede: bool }   // abaixo de config.cuidados.baixo (25)
  icone(uniId?) → '💧' | '🍎' | null     // sede baixa tem prioridade
  iconeMontaria() → icone(P.montaria())
  fatorVelocidade() → 1 | config.cuidados.fatorLento   // da montaria: fome OU sede baixa = 0,7
  comidas() → config.comidas
  quantidade(comidaId) → compradas − usadas
  despensa() → [{ comida, quantidade }]  // só as que têm quantidade > 0, na ordem de config.comidas
  comprar(comidaId) → { ok: true } | { ok: false, motivo: 'estrelas', faltam: n }
       // P.gastarEstrelas(preço) → compradas + 1 → P.salvar()
  alimentar(uniId, comidaId) → { ok: true, antes, depois } | { ok: false, motivo: 'sem-comida' | 'cheio' | 'sem-uni' }
       // usadas + 1; fome + comida.fome (enche = 100), no máximo 100; 'cheio' = fome ≥ 99,5; grava na hora
  beber(uniId) → { ok: true, antes, depois } | { ok: false, motivo: 'cheio' | 'sem-uni' }
       // sede = 100, de graça; 'cheio' = sede ≥ 99,5; grava na hora. Só o bebedouro da Pet Shop chama.
  avancar(ms)                // debug e testes: gasta ms de jogo ativo na montaria (como o relógio, sem as condições)
  depurar() → { montaria, fome, sede, fator, icone, ativo, despensa: { id: n }, todos: { uniId: { fome, sede } } }
  frases: { chave: texto }   // os textos falados (lembretes, Pet Shop, Estábulo), usados pela UI e pelos interiores.
                             // Chaves fixas: lembreteFome, lembreteSede, lembreteAmbos, faltamEstrelas (Pet Shop),
                             // guardado (comprou e guardou na despensa), comeu, cheio, bebeu, semSede, despensaVazia
  vozDaFrase(chave) → 'claude' | 'unicornio'   // quem fala cada frase (comeu/bebeu = o unicórnio)
  falas() → [{ texto, voz }] // tudo o que os cuidados falam (pacote geral): os valores de `frases`, com a voz
}
evento: U.emit('cuidados', depurar())  // a cada ponto inteiro que muda, ao comer/beber e ao cruzar o 25
```
- **Quem gasta:** só a montaria (`P.montaria()`, bebê que passeia junto inclusive), e só com o relógio ativo:
  depois de `iniciar()`, aba visível (`!document.hidden`) e com toque ou tecla (pointerdown, touchstart,
  keydown) nos últimos `semToqueMs` (5 min). O próprio "Entrar no Reino" conta como toque.
  Jogo fechado ou parado: nada muda (não existe gasto "offline").
- **Ritmo:** fome de 100 a 0 em `minutosFome` (120) min de jogo ativo; sede em `minutosSede` (60).
  Relógio de 1 s (setInterval), com o passo limitado a 5 s (aba que volta do fundo não dá salto).
- **Efeito:** fome ou sede abaixo de 25 → `fatorVelocidade()` = 0,7 (montada ou a pé com o bebê).
  Comeu ou bebeu → volta a 1 na hora. Não perde XP, dinheiro nem unicórnio.
- **Gravação:** `P.salvar()` no máximo a cada `gravarMs` (60 s) enquanto gasta, ou antes se juntou
  `gravarPontos` (10) de mudança, e sempre ao cruzar o 25, comer, beber ou comprar. Nunca a cada quadro:
  cada `P.salvar()` sincroniza. Entre gravações o valor vive em `P.estado().cuidados` (em memória).
- **Lembrete gentil do Claude:** com a montaria baixa, no máximo 1 a cada `lembreteMs` (10 min), e só
  com ela livre: `Reino.Cena.estado()` é `'mapa'` ou `'interior'` e `!Reino.Claude.aberto()`.
  Balão comum do Claude (não modal, fecha sozinho), texto de `frases`.

## 3. Nadar no lago — `js/mapa.js` (água), `js/cena.js`, `js/jogador.js`, `js/audio.js`
```
Mapa.agua(tx, ty) → bool          // tile de água do lago (tipo 'a'); a fonte da praça não é água e segue sólida
Mapa.solido(tx, ty)               // a água do lago passa a ser andável (false); borda, prédios e enfeites, como hoje
Mapa.caminho(a, b)                // cada passo que entra na água custa config.nado.custo (3×)
cena.agua(tx, ty) → bool          // no adaptador do mapa (Reino.Cena.mapa); interiores não têm: ausente = false
Jogador.nadando() → bool          // o tile atual dela é água
Jogador.velocidade() → px/s       // base (montada 82, a pé 58) × (nadando ? config.nado.fator : 1) × Cuidados.fatorVelocidade()
Reino.Som.tocar('splash' | 'gotas' | 'gole' | 'nhac')   // sintetizados (entrar na água, sair, beber, comer)
```
- Só ela anda no mapa: a água é andável para ela e a montaria (ou ela e o bebê).
- Tocar na água: vai até lá, nadando. Tocar em terra: o caminho evita o lago sempre que há caminho por
  terra (custo 3×). A linha reta do `suavizar()` não pode cortar por água que o caminho de tiles evitou.
- Setas/teclado: entra e sai da água livremente. Nunca sai dos limites do mapa, nunca fica presa
  (vitórias-régias e juncos são enfeite: não travam).
- **Desenho na água** (todas as 5 vistas e os espelhos; montada e a pé com o bebê, cada um cortado no
  seu próprio tile): o sprite é cortado na linha d'água (só a parte de cima aparece), anel de ondinhas
  animado em volta (parado sem animação), respingo + `splash` ao entrar e gotinhas por 1 s ao sair
  (sem animação: nenhuma partícula; o som continua).
- **Ícone da fome/sede:** `Cuidados.iconeMontaria()` desenhado acima do unicórnio (montada: acima do
  conjunto; bebê: acima do bebê), em px da tela e nítido (inteiro de px por px do ícone), como a bolha
  de status dos NPCs. Em todas as cenas (mapa e interiores).
- **Placa da Pet Shop no mapa:** o extra da placa (`extraDaPlaca` em cena.js) mostra `'Sede'` ou `'Fome'`
  (sede primeiro) quando a montaria está abaixo de 25; senão nada.
- Desempenho: nada de canvas novo por quadro; cortes e ondinhas pré-renderizados ou desenhados com `pintor.ret`.

## 4. Loja: lista única, enfeites novos e prêmios à venda

### 4.1 `js/loja-itens.js` (`Reino.LojaItens`, dados sem DOM)
```
Reino.LojaItens = {
  ENFEITES: [{ id, nome, preco, slot, icone, espaco?: true }]   // tudo o que se compra com estrelas
  SLOTS: { <slot>: { nome } }       // orelha, olho, cabeca, capa, rastro, asas + os slots novos
  enfeite(id) → item | null
  premios() → [{ id, nome, raridade, provaId, preco, slot }]    // acessórios de todas as provas
  precoPremio(raridade) → Reino.config.precoPremio[raridade]
  estadoPremio(premio, P) → 'bloqueado' | 'aVenda' | 'ganho' | 'comprado'
  item(id) → enfeite ou prêmio no formato de item da loja (id, nome, slot, preco, premio?)
  FALAS: { chave: texto }           // o que a Loja fala de novo (o orquestrador liga em Falas.todas, pacote geral)
}
```
- É a única lista: `ui.js` (`UI.ITENS_LOJA` continua existindo como apelido de `ENFEITES`), a Loja por
  dentro (`js/interiores/loja.js`) e as ferramentas usam esta. Nenhuma cópia duplicada.
- **Estado de um prêmio** (derivado, nada novo no save):
  - `ganho`: `P.regProva(prova).premio === premio.raridade`;
  - `comprado`: `estado.loja[id]` e não é o ganho;
  - `aVenda`: não tem, e já ganhou algum acessório desta prova (`P.regProva(prova).premio`);
  - `bloqueado`: ainda não ganhou nenhum desta prova.
- **Comprar um prêmio:** `P.gastarEstrelas(preço)` → `estado.loja[id] = true` → põe no slot (como os
  enfeites) → `P.salvar()`. Não mexe em `estado.provas`, `P.regProva`, arco-íris da Escola, status das
  professoras, mural da Escola nem Área dos pais. Preços: `Reino.config.precoPremio` (comum 25, raro 40, lendário 70).
- Regra da prova intacta: só nota 10 dá acessório, a tentativa define o tipo, depois vira treino.
- Mural da Escola por dentro (`js/interiores/escola.js`, `ganhou()`): passa a contar só o prêmio da
  prova (`P.regProva(prova).premio === r`), não a compra.

### 4.2 Enfeites novos e slots (`js/pixelart.js`)
- Pelo menos 10 enfeites novos, preço de 10 a 45 ⭐, pelo menos 3 do espaço (`espaco: true`), nomes que
  não repetem os de hoje nem os acessórios das provas. Um enfeite por slot, como hoje.
- Desenho em `PA.ENFEITES_MONTARIA[id] = { linhas, paleta, ancora, dx, dy }` (com contorno próprio `k`).
- Slot novo (ex.: `pescoco`, `cauda`, `patas`) = âncora nova em **todos** os 10 moldes (`UNI.adulto` e
  `UNI.filhote`, vistas lado/frente/costas/diagFrente/diagCostas). As direções da esquerda são o espelho.
  Vista que não mostra o encaixe: âncora `null` (como `olho` de costas), e o enfeite não aparece nela.
- Tudo continua em `usando.enfeites` (lista de ids): nenhum campo novo no save.
- Cada enfeite novo tem ícone em pixel e aparece em `ferramentas/acessorios.html` (grade vista × estágio).

## 5. Pergunta surpresa — `js/surpresa.js` (`Reino.Surpresa`)
```
Reino.Surpresa = {
  iniciar({ tutorial })   // main.js chama no fim de entrarNoReino; tutorial = Promise da 1ª vez (ou null):
                          // o relógio só começa depois que ela resolver
  forcar() → Promise      // debug: sorteia e mostra agora (se ela estiver ocupada, assim que ficar livre)
  restante() → ms | null  // quanto falta para vencer (null com o interruptor desligado ou antes de iniciar)
  aberta() → bool
  proximaPergunta() → { materia, sala, desafio } | null   // o que sairia agora (para os testes)
  falas() → [{ texto, voz }]   // tudo o que a surpresa fala (pacote geral)
}
```
- **Tempo:** sorteado entre `config.surpresa.minMinutos` e `maxMinutos` (3 a 10) de relógio livre.
- **O relógio conta só com ela livre:** depois de iniciar (e do tutorial), `ajustes.surpresa !== false`,
  aba visível, toque ou tecla nos últimos 5 min, `Reino.Cena.estado()` `'mapa'` ou `'interior'` e
  `!Reino.Claude.aberto()`. Use `Date.now()`/`setInterval` (os testes usam relógio falso do Playwright).
- **Venceu com ela ocupada:** espera ela ficar livre e aparece depois de `esperaLivreMs` (4 s) seguidos
  de livre. Nunca no meio de sala, treino, prova, tela, diálogo ou transição.
- **Pergunta:** de qualquer matéria, só das salas (`materia.salas[].desafios`, nunca `Reino.provas`), só
  dos tipos `config.surpresa.tipos` (escolha, vf, varias; sem `livre: true`), de preferência de salas que
  ela já fez, sem repetir na sessão. Carrega o pacote de voz da sala (`Reino.Voz.carregarSala`) antes; o
  🔊 do card lê a pergunta. Card com `Reino.Desafios.render(d, { modo: 'surpresa', onMudar })`,
  correção com `Reino.Desafios.pontuar(d, valor) === 1`, explicação em `d.explica`.
- **Painel:** tela do DOM (`UI.painel('surpresa', '❓ Pergunta surpresa')`), com o Claude, o card,
  "Conferir" e "Agora não". Uma tentativa só:
  - acertou: `P.ganharEstrelas(config.surpresa.estrelas)` + `P.salvar()`, confete pequeno, som e elogio;
  - errou: mostra `d.explica`, sem perder nada;
  - "Agora não" ou ✕: fecha sem nada.
  Em todos os casos, sorteia o próximo tempo.
- **Ajustes:** interruptor "❓ Perguntas surpresa" (`ajustes.surpresa`, já está em `UI.telaAjustes`).
  Desligado: nunca aparece e o relógio não conta.

## 6. Pet Shop (lugar `petshop`)
- **Mapa:** já posicionada (`EXTRAS` em mapa.js): rect `{ x: 2, y: 21, w: 5, h: 4 }`, porta (4, 24),
  caminho de rua até a rua de baixo, em frente ao Estábulo. Desenho de fora: `Mapa.PREDIOS.petshop`
  (provisório em mapa.js). O construtor do prédio entrega o desenho final no próprio arquivo:
  `if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.petshop = function (ctx, px, py, w, h) {…}` (o
  orquestrador depois move para mapa.js). A porta é o tile (4, 24): a porta desenhada fica no meio dele.
- **Interior** (`js/interiores/petshop-falas.js` + `petshop.js`, pacote `interior-petshop`), critério de
  "rico" dos contratos, 2 cômodos:
  - `loja` (Loja): balcão, prateleiras de comida, sacos de feno, cestas de cenoura e maçã, potes de
    biscoito, escovas de crina, coleiras, casinha, aquário, balança;
  - `agua` (Cantinho da Água): bebedouro grande, toalhas e banheira de espuma.
- **NPC** `aveia` (Dona Aveia, voz `npc-aveia`): `acao: { tipo: 'tela', tela: 'petshop' }`.
  O prédio registra `Reino.NPCs.registrarTela('petshop', function () { Reino.UI.telaPetShop(); }, '<convite>')`
  e pode registrar um status (`Reino.NPCs.registrarStatus`), ex.: 🍎/💧 na Dona Aveia com a montaria baixa.
- **Bebedouro:** objeto interativo com `acao: { tipo: 'beber' }`. O prédio registra
  `Reino.NPCs.registrarAcao('beber', fn)`: `Reino.Cuidados.beber(P.montaria())`, som `gole`, animação de
  água no bebedouro (só com animações) e uma fala curta (das `extras` do prédio). É o único lugar com água.
- **`UI.telaPetShop()`** (ui.js): saldo de estrelas; cada comida com ícone, nome, preço e quanto enche;
  a despensa. Comprar: `Cuidados.comprar(id)` e, se deu certo, oferece "Dar agora para <nome>?"
  (`UI.confirmar`) → `Cuidados.alimentar(P.montaria(), id)`. Faltando estrelas: fala gentil como a da
  Loja (texto de `Cuidados.frases`).
- **HUD:** duas barrinhas (fome e sede) no chip da montaria, atualizadas no evento `cuidados`.
- **Estábulo:** a tela mostra as barras de cada unicórnio chocado; "Dar comida" (no detalhe) usa a
  despensa (`Cuidados.alimentar`); despensa vazia: fala que a Dona Aveia vende comidinhas.
  As baias por dentro (`js/interiores/estabulo.js`) mostram 🍎/💧 quando a barra do unicórnio está baixa,
  e isso entra na `chave` do pré-render da baia.
- **Menu Lugares:** Pet Shop (🐾) e Observatório (🔭) com uma linha de informação cada.

## 7. Observatório (lugar `observatorio`)
- **Mapa:** já posicionado (`EXTRAS`): rect `{ x: 28, y: 21, w: 6, h: 5 }`, porta (31, 25), no morro a
  leste do lago (o ponto alto do reino). Desenho de fora: `Mapa.PREDIOS.observatorio` (morro, cúpula,
  telescópio), provisório em mapa.js; o final vem em `observatorio-cenas.js`, do mesmo jeito da Pet Shop.
- **Cenas do telescópio e robô** (`js/interiores/observatorio-cenas.js`):
  ```
  Reino.ObservatorioCenas = {
    temas() → ['lua', 'saturno', 'cruzeiro', …]      // cenas que o telescópio sabe mostrar
    cena(tema, t?) → canvas (160×112 px do jogo, com moldura redonda de luneta)  // cacheado; t = animação leve
    desenharPlaneta(ctx, id, cx, cy, raio)             // Sol, 8 planetas e Plutão, para o Planetário
  }
  Reino.NPCs.registrarBase('robo', fn)   // o Robô Cosmo (parâmetros: corpo, detalhe, antena)
  ```
  Nada de canvas/PA no carregamento (só dentro das funções).
- **Interior noturno** (`js/interiores/observatorio-falas.js` + `observatorio.js`, pacote
  `interior-observatorio`), estrelas piscando (só com animações), 3 cômodos:
  - `cupula` (Cúpula do Telescópio): olhar no telescópio abre uma cena em pixel art (Lua, Saturno,
    Cruzeiro do Sul…) com uma curiosidade;
  - `planetario` (Planetário): o Sol e os 8 planetas em órbita (animação leve); Plutão como planeta-anão.
    Tocar num planeta conta uma curiosidade dele (cada planeta é um objeto interativo; a animação não
    tira o planeta da própria pegada, para o toque sempre achá-lo);
  - `galeria` (Galeria do Espaço): foguete, traje de astronauta, pedra da Lua, meteorito e mapa das
    constelações, cada um interativo.
- **NPCs:** `vega` (Doutora Vega, voz `npc-vega`, a guia: "Outra curiosidade!", sorteando sem repetir na
  sessão) e `cosmo` (Robô Cosmo, voz `npc-cosmo`, falas engraçadas; sprite com a base `'robo'`,
  registrada pelo prédio com `Reino.NPCs.registrarBase('robo', fn)`).
- **Ação** `{ tipo: 'curiosidade', tema }` registrada pelo prédio (`registrarAcao`). Curiosidades:
  ```
  Reino.FALAS_INTERIORES.observatorio.curiosidades = [
    // fonte: <NASA Space Place | ESA Kids | Agência Espacial Brasileira> — <URL>
    { id, tema, paginas: ['frase curta.', 'outra frase.'] },
  ]
  Reino.Observatorio = { curiosidade(tema) → { id, tema, paginas }   // sorteia sem repetir na sessão
                         temas() → [tema] }
  ```
  Pelo menos 40, em temas: sol, lua, mercurio, venus, terra, marte, jupiter, saturno, urano, netuno,
  plutao, estrelas, constelacoes, astronautas, foguetes, cometas, galaxias. Corretas, atuais e curtas
  para o 2º ano (cada página até 30 letras, frases de 3+ palavras). Toques do Brasil: o Cruzeiro do Sul
  na bandeira; Marcos Pontes, o primeiro astronauta brasileiro. Todas narradas pela voz da Doutora Vega
  (`npc-vega`), em qualquer lugar em que apareçam. Só curiosidades: não dá estrelas nem mexe no save.

## 8. NPCs: extensões (`js/npcs.js`)
```
Reino.NPCs.registrarTela(nome, abrir(acao, ctx), convite?)   // tela nova para { tipo: 'tela', tela: nome }
Reino.NPCs.registrarAcao(tipo, fn(acao, ctx) → Promise)      // ação nova de NPC/objeto ({ tipo: 'beber' } …)
Reino.NPCs.registrarStatus(fn(npc) → { icone, rotulo } | null)   // status extra (vale o primeiro não nulo)
Reino.NPCs.registrarBase(nome, fn(o, quadro) → { g, busto })     // base nova de sprite; o.cru = sprite original
Reino.NPCs.gradeSprite = { Grade, W, CX, TOPO, HY, BY, CONTORNO, esc, cla, mis }   // para desenhar a base
Reino.NPCs.telas(), Reino.NPCs.acoes()                        // o que foi registrado (o validador aceita)
```
Registrar no carregamento é permitido (só guarda a função). Elenco novo em `Reino.NPCs.ELENCO`:
`aveia` (Dona Aveia), `vega` (Doutora Vega), `cosmo` (Robô Cosmo, `base: 'robo'`).

## 9. Vozes e falas
- Perfis novos em `Reino.config.vozes`: `npc-aveia`, `npc-vega`, `npc-cosmo`. Campo novo opcional
  `efeito: 'robo-leve'` (filtro metálico leve na gravação, em `ferramentas/gerar-vozes.py`; muda a chave só dos
  perfis que têm efeito). Amostras 34 a 36 em `amostras-de-voz/`.
- Pacotes: `interior-petshop` e `interior-observatorio` (NPCs, objetos e `extras` do prédio); falas de
  `Reino.Cuidados.falas()`, `Reino.Surpresa.falas()` e `Reino.LojaItens.FALAS` no `geral`.
- `Reino.FALAS_INTERIORES.<prédio>.extras = [{ texto, voz }]`: falas do prédio que não saem de NPC nem
  de objeto (bebedouro, curiosidades, piadas do Cosmo). `Falas.todas()` põe no pacote `interior-<prédio>`.
- Todo texto falado precisa estar em alguma dessas listas, com a mesma divisão do balão. Números que
  mudam são enumerados (como `treinoBloqueado`); nomes que ela digita não são falados; inglês entre «».
- Regras da seção 7.3 dos contratos: até 30 letras por página nas falas de personagem, frases de 3+
  palavras, conferência por transcrição (faster-whisper) antes de entregar.

## 10. Depuração (`?debug=1`, `window.__reino`)
Além dos de hoje: `avancarJogo(ms)` (= `Cuidados.avancar`), `cuidados()` (= `Cuidados.depurar`),
`surpresa()` (= `Surpresa.forcar`), `agua(tx, ty)` (o tile é água?; sem argumentos: ela está nadando?).

## 11. Desempenho
Média de até 16,7 ms por quadro com a CPU 4× mais lenta (`__reino.tempoQuadro()`), no mapa, nadando,
na Pet Shop e no Planetário. Nada de canvas criado por quadro; estático pré-renderizado; animações leves.

## 12. Divisão de arquivos
| Fase | Quem | Arquivos (e só eles) |
|---|---|---|
| 0 | orquestrador | index.html, config.js, mapa.js (EXTRAS e PREDIOS provisórios), npcs.js (extensões e ELENCO), falas.js, listar-falas.js, gerar-vozes.py, validar-interiores.js, debug.js, main.js, ui.js (1 linha em Ajustes), arquivos provisórios da Fase 1 |
| 1 | A | js/cuidados.js, js/progresso.js |
| 1 | B | js/jogador.js, js/cena.js, js/mapa.js (só a água: solidez, `agua`, custo, brilho), js/audio.js |
| 1 | C | js/loja-itens.js, js/pixelart.js, js/icones.js, js/ui.js (só a Loja), js/interiores/loja.js, js/interiores/escola.js (só `ganhou()`), ferramentas/acessorios.html |
| 1 | D | js/surpresa.js, css/novidades.css |
| 2 | E | js/interiores/petshop-falas.js, js/interiores/petshop.js (com o desenho de fora), js/interiores/estabulo.js (só as baias) |
| 2 | F | js/ui.js (Pet Shop, HUD, Estábulo, Lugares), css/petshop.css |
| 3 | G1 | js/interiores/observatorio.js (interior, Planetário, ação `curiosidade`) |
| 3 | G2 | js/interiores/observatorio-cenas.js (cenas do telescópio, planetas, robô, desenho de fora) |
| 3 | H1–H4 | pesquisa das curiosidades (rascunhos); H junta em js/interiores/observatorio-falas.js |
| 2–3 | I | ícones novos num rascunho; o orquestrador junta em js/icones.js |
