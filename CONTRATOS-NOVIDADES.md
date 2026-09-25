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

`ferramentas/listar-falas.js` carrega `js/interiores/*.js` em ordem **alfabética** (com `padrao.js` por
último), e não na ordem do index.html: `<prédio>-falas.js` e `<prédio>-cenas.js` precisam vir antes de
`<prédio>.js` também nessa ordem (hoje dá certo pelo nome).

## 1. Save: campos novos e mescla (js/progresso.js)

Não mudam: `chaveSave`, `v`, `geracao`, `ciclo` e o formato dos campos. As regras de `P.mesclar()` para os
campos existentes também não mudam, com um endurecimento só (em `estrelas`, logo abaixo). Campos novos,
todos aditivos (`estadoNovo()` + `completar()`):

```
cuidados: { <uniId>: { fome, sede, em, acao, acaoFome, acaoSede } }
                                                 // 0–100 (100 = satisfeito); em = Date.now() da última mudança;
                                                 // acaoFome = carimbo do último comer, acaoSede = do último beber:
                                                 // max(Date.now(), acao + 1), sempre crescente; acao = o maior dos
                                                 // dois; 0 = nunca. O gasto não mexe nos carimbos. registroParaMudar
                                                 // cria o registro com acao: 0 e dá ao registro que só tem `acao`
                                                 // acaoFome = acaoSede = acao (campos aditivos)
despensa: { <comidaId>: { compradas, usadas } }  // contadores que só crescem; quantidade = compradas − usadas
ajustes.surpresa: true                           // interruptor "❓ Perguntas surpresa" (padrão ligado)
ajustes.surpresaEm: <Date.now()>                 // carimbo da última troca de verdade do interruptor (só P.salvar marca)
```
- Unicórnio sem registro em `cuidados` = fome 100 e sede 100 (unicórnio novo nasce satisfeito).
- **Mescla** (mesma geração):
  - `cuidados` (`juntarCuidados`): para cada `uniId` de qualquer lado, se os DOIS lados têm carimbo para a fome
    e para a sede (o carimbo de um campo é `acaoFome`/`acaoSede` numérico ≥ 0 ou, na falta dele, `acao`; um
    `acao` mais novo que os dois carimbos de campo, de uma aba que só conhece o `acao`, vale para os dois
    campos; o 0 conta), CADA campo vem do lado com o seu carimbo maior (comida dada num aparelho e água dada no outro valem
    as duas); empate (inclusive 0 e 0) = o menor valor daquele campo (o gasto só desce entre uma ação e
    outra). `acao` = o maior dos dois lados; `em` = o maior. Se algum lado não tem carimbo nenhum (save da
    versão anterior ou valor estragado): vale o registro do `em` maior (empate: o lado mais recente). Quem
    tratar `acao: 0` como "sem acao" muda a mescla de dois aparelhos.
  - `despensa`: para cada comida, `compradas` = maior e `usadas` = maior (contador estragado conta 0).
  - Um lado sem o campo (aparelho com a versão antiga, que pode apagá-lo): vale o outro lado inteiro.
    Um aparelho antigo nunca faz a Mariana perder comida comprada nem acessório (`loja` já é união).
  - `ajustes` continua vindo do lado mais recente (regra de hoje), com uma exceção só para `surpresa`
    (`juntarSurpresa`, a mesma regra na mescla e na cópia): vale o lado com o carimbo `surpresaEm` maior;
    sem carimbo nos dois lados, o lado que fica só recebe o `surpresa` do outro se não tiver o campo
    (aparelho antigo não religa as perguntas que os pais desligaram). `estadoNovo()` não tem carimbo (um
    aparelho novo não "ganha" de quem desligou); `completar()` põe `surpresa: true` se faltar.
  - Geração diferente: continua vencendo o estado inteiro da geração maior (regra de hoje).
- **Endurecimento em campo existente:** `estrelas.ganhas`/`gastas` estragados (texto sem número, null, NaN)
  contam como 0 na mescla (`numeroOu`; `estrelas` que não é objeto conta como vazio; `gastas` ≥ 0) e em
  `P.estrelas`/`P.ganharEstrelas`/`P.gastarEstrelas`. Número em texto ("12") vale o número. Com números
  válidos, o resultado é o de antes.
- **Cópia de segurança** (`Reino.config.chaveSave + '-novidades'`, constante em progresso.js): guarda
  `{ geracao, ciclo, atualizado, cuidados, despensa, surpresa, surpresaEm }` a cada gravação local. O código
  antigo não conhece essa chave, então uma aba antiga no mesmo navegador não a apaga. O que faltar volta
  dela, com as mesmas regras, ao carregar, a cada mescla, a cada gravação local (`gravarLocal` faz
  `normalizarNovos(comCopia(estado))`) e no aparelho "em branco" que adota o save guardado (`iniciarNuvem`).
  Da cópia só entram registros de cuidados com `fome`, `sede` e `em` numéricos ≥ 0 e registros da despensa
  com `compradas` e `usadas` numéricos ≥ 0. Só vale na mesma `geracao` ("Apagar tudo" não traz nada de
  volta). Sem `removeItem` nem `clear`.
- **Normalização** (`normalizarNovos`, no fim de `completar()` e em `gravarLocal`): só chaves próprias, e nunca
  `__proto__`, `constructor`, `prototype` nem outro nome de `Object.prototype` (`hasOwnProperty`,
  `toString`…); fome e sede entre 0 e 100 (inválida vira 100); `em` ≥ 0; `compradas`/`usadas` inteiros ≥ 0
  com `usadas ≤ compradas`; `surpresa` "true"/"false" em texto vira booleano (outro valor volta ao padrão);
  ids desconhecidos ficam guardados, sem efeito (uma versão não apaga a comida de outra); `acaoFome`/`acaoSede`
  que não são números ≥ 0 são apagados (contam como ausentes; vale o `acao`). `acao` **não** é normalizada
  aqui (nem apagada): quem a conserta é `Cuidados` ao mudar o registro (`registroParaMudar`).
- **Sincronização** (mesmas regras da mescla, só onde e quando ela roda):
  - **Duas abas no mesmo aparelho:** `vistoLocal` é o texto do save que esta aba leu ou gravou por último.
    `gravarLocal` confere antes de gravar: se o save do aparelho mudou (outra aba gravou), junta com
    `P.mesclar` e só então grava. O evento `storage` (chave do save) e a volta da aba (`visibilitychange`,
    para a aba congelada no fundo que perdeu o evento) fazem a mesma junção (`juntarDoAparelho`); se a
    junção trouxe algo que a outra aba não tinha, `P.salvar()` devolve com carimbo novo (aparelho e
    servidor); senão só avisa (`progresso`/`progressoRemoto`). Duas abas novas não entram em vaivém.
  - **"Trouxe algo novo"** (`trouxeAlgo`/`conteudo`): compara o conteúdo, e não o `atualizado`: chaves em
    ordem, sem valores vazios, sem `atualizado` e, nos cuidados, só os carimbos (`acao`, `acaoFome`,
    `acaoSede`), porque fome, sede e `em` mudam a cada segundo. Comida ou água dada num lado conta.
  - **Servidor/claude.ai:** o `onSnapshot` ignora o remoto de mesmo conteúdo (dois aparelhos podem mandar
    estados diferentes com o mesmo `atualizado`); se a junção trouxe algo que o banco não tem (ou
    `conferirPersistencia` achou algo), ganha `atualizado` novo e reenvia. No `iniciarNuvem`, o aparelho que
    trouxe algo ganha `atualizado` novo antes do primeiro envio (senão os outros o ignorariam como já visto).
  - **Rede lenta:** cada gravação e cada fetch do servidor desistem em `limiteRedeMs` (15 s; o fetch é
    cancelado com `AbortController`); depois de um erro, tenta de novo sozinha em `novaTentativaMs` (15 s).
    A busca inicial (`iniciarNuvem`) desiste em 12 s e rejeita; o jogo pode tentar de novo.
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
  comprar(comidaId) → { ok: true } | { ok: false, motivo: 'estrelas', faltam: n ≥ 1 }
                    | { ok: false, motivo: 'sem-comida' }   // id desconhecido
       // P.gastarEstrelas(preço) → compradas + 1 → P.salvar(). Só compra: quem pergunta antes é a UI (§6)
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
evento: U.emit('cuidados', depurar())  // a cada ponto inteiro que muda, ao cruzar o 25, ao comer, beber e comprar
```
- `Reino.Cuidados.frases` é **objeto**; `Reino.Surpresa.frases` (§5) é **função**. Não confundir.
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
  Também grava quando a aba vai para o fundo com mudança pendente; qualquer `P.salvar()` de outro lugar
  (evento `progresso`) zera o pendente, porque já levou a fome e a sede junto.
- **Lembrete gentil do Claude:** com a montaria baixa, no máximo 1 a cada `lembreteMs` (10 min), e só
  com ela livre: `Reino.Cena.estado()` é `'mapa'` ou `'interior'` e `!Reino.Claude.aberto()`. Não aparece
  dentro da Pet Shop. Balão comum do Claude (não modal), texto de `frases`, 6 s; some sozinho (balão fechado
  e voz calada) quando abre uma tela (evento `telas`) ou ela entra na Pet Shop.

## 3. Nadar no lago — `js/mapa.js` (água), `js/cena.js`, `js/jogador.js`, `js/audio.js`
```
Mapa.agua(tx, ty) → bool          // tile de água do lago (tipo 'a'); a fonte da praça não é água e segue sólida
Mapa.solido(tx, ty)               // a água do lago passa a ser andável (false); borda, prédios e enfeites, como hoje
Mapa.caminho(a, b)                // destino em terra: primeiro um caminho SEM água (o lago como sólido); só se
                                  // não houver nenhum (ela no meio do lago), um caminho nadando. Destino na água:
                                  // cada passo que entra na água custa config.nado.custo (3×). Na diagonal, de
                                  // terra para terra, não corta quina de água
Mapa.maisPerto(x, y, de)          // tocou em terra sólida: prefere terra; quem já está nadando prefere a terra
                                  // encostada no que tocou (senão a água em volta); tocou na água: aceita água
Mapa.fundura(wx, wy) → px         // quanto o ponto está dentro da água DESENHADA (a elipse do lago); negativo = margem
cena.agua(tx, ty) → bool          // no adaptador do mapa (Reino.Cena.mapa); interiores não têm: ausente = false
Jogador.nadando() → bool          // o tile atual dela é água (vale para velocidade e som)
Jogador.fundura(x, y) → 0–1       // Mapa.fundura suavizada numa RAMPA de 12 px; fora do mapa = 0
Jogador.velocidade() → px/s       // o ALVO: base (montada 82, a pé 58) × (nadando ? config.nado.fator : 1)
                                  // × Cuidados.fatorVelocidade(). O passo usa J.vel, que chega ao alvo aos
                                  // poucos (SUAVE_VEL 0,18 s), sem tranco na margem
Reino.Som.tocar('splash' | 'gotas' | 'gole' | 'nhac')   // sintetizados (entrar na água, sair, beber, comer)
```
- Só ela anda no mapa: a água é andável para ela e a montaria (ou ela e o bebê).
- Tocar na água: vai até lá, nadando. Tocar em terra: vai por terra sempre que existe caminho por terra,
  mesmo longo (a busca sem água vem primeiro; o custo 3× só decide quando não há). A linha reta do
  `suavizar()` não pode cortar por água que o caminho de tiles evitou.
- Setas/teclado: entra e sai da água livremente. Nunca sai dos limites do mapa, nunca fica presa
  (vitórias-régias e juncos são enfeite: não travam).
- **Desenho na água** (todas as 5 vistas e os espelhos; montada e a pé com o bebê, cada corpo medido no
  próprio ponto dos pés): o corte na linha d'água (só a parte de cima aparece), o anel de ondinhas (parado
  sem animação), o respingo e as gotinhas seguem a água **desenhada** (`Jogador.fundura`), e não a grade de
  tiles: nas pontas da elipse o tile é água mas o desenho é areia, e ali ela não aparece cortada. Entra com
  fundura ≥ 0,5 (respingo + `splash`) e sai com ≤ 0,15 (gotinhas por 1 s + `gotas`); a folga evita piscar
  na margem. Sem animação: nenhuma partícula; o som continua. `Jogador.nadando()` continua sendo pelo tile.
- **Mapa em volta:** `EXTRAS` com `placa: 'acima'` na Pet Shop e no Observatório (a placa do lado cobria
  "Sede"/"Fome" ou ficava longe da cúpula) e `caminho` com a lista explícita dos tiles de rua. `BORDA_BAIXO`
  (4 fileiras de grama) desenhada abaixo do mapa e margem de baixo da câmera medida no HUD
  (`margemBaixoMapa`, main.js), para as portas de baixo e ela nadando não sumirem atrás do menu. As placas
  desviam dos chips do HUD pela `caixaParada` (a caixa sem o transform da animação, remedida a cada 500 ms).
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
  ENFEITES: [{ id, nome, preco, slot, icone, espaco?: true }]   // tudo o que se compra com estrelas;
                                    // icone = emoji com desenho em icones.js OU a chave 'enfeite:<id>'
  SLOTS: { <slot>: { nome } }       // orelha, olho, cabeca, chifre, pescoco, cauda (em usando.enfeites, com âncora
                                    // nos moldes) + capa, rastro, asas (especiais: usando.capa, usando.estrelinhas,
                                    // usando.asasFada). Não existe `patas`
  enfeite(id) → item | null
  premios() → [{ id, nome, raridade, provaId, preco, slot }]    // acessórios de todas as provas; slot = âncora
                                    // de PA.ENFEITES_MONTARIA (null sem PA, como nas ferramentas em vm)
  precoPremio(raridade) → Reino.config.precoPremio[raridade]
  estadoPremio(premio, P) → 'bloqueado' | 'aVenda' | 'ganho' | 'comprado'
  item(id) → enfeite, ou prêmio como { id, nome, slot, preco, raridade, provaId, icone: 'acessorio:<id>', premio: true }
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
- Slots com âncora hoje: `orelha`, `olho`, `cabeca`, `chifre`, `pescoco`, `cauda`. Enfeite de chifre usa o
  slot `chifre` que já existe. Slot novo = âncora nova em **todos** os 10 moldes (`UNI.adulto` e
  `UNI.filhote`, vistas lado/frente/costas/diagFrente/diagCostas). As direções da esquerda são o espelho.
  Vista que não mostra o encaixe: âncora `null` (como `olho` de costas e `cauda` de frente, nos dois
  estágios), e o enfeite não aparece nela.
- Tudo continua em `usando.enfeites` (lista de ids): nenhum campo novo no save.
- Cada enfeite novo tem ícone em pixel e aparece em `ferramentas/acessorios.html` (grade vista × estágio).

## 5. Pergunta surpresa — `js/surpresa.js` (`Reino.Surpresa`)
```
Reino.Surpresa = {
  iniciar({ tutorial })   // main.js chama no fim de entrarNoReino; tutorial = Promise da 1ª vez (ou null):
                          // o relógio só começa depois que ela resolver
  forcar() → Promise      // debug: sorteia e mostra agora (se ela estiver ocupada, assim que ficar livre).
                          // Resolve quando o painel ABRE, com { materia, sala, desafio, tipo } (ids), ou null
                          // sem pergunta; com o painel já aberto, resolve na hora com o dele. Ignora o
                          // interruptor, `ativo`, o tempo sorteado e `esperaLivreMs`; espera ela livre,
                          // parada e com a aba visível
  restante() → ms | null  // quanto falta para vencer (null com o interruptor desligado ou antes de iniciar)
  aberta() → bool
  proximaPergunta() → { materia, sala, desafio } | null   // o que sairia agora (para os testes)
  falas() → [{ texto, voz }]   // tudo o que a surpresa fala (pacote geral)
  frases() → { abertura, vale, ganhou, erro }   // FUNÇÃO (monta o número de estrelas); Cuidados.frases é objeto
}
```
- **Tempo:** sorteado entre `config.surpresa.minMinutos` e `maxMinutos` (3 a 10) de relógio livre.
- **O relógio conta só com ela livre:** depois de iniciar (e do tutorial), `ajustes.surpresa !== false`,
  aba visível, toque ou tecla nos últimos 5 min, `Reino.Cena.estado()` `'mapa'` ou `'interior'` e
  `!Reino.Claude.aberto()`. Andando também conta (o tempo corre); só a **abertura** espera ela parada (sem
  `Jogador.caminho` nem `aoChegar`: ela termina o que começou), e ao abrir o painel chama `Jogador.parar()`
  (senão entraria sozinha na porta ao fechar a pergunta).
- **Relógio monotônico:** `performance.now()` + `setInterval`, que o relógio falso do Playwright também
  controla. Nunca `Date.now()` aqui: o relógio do aparelho mudando (ajuste manual, NTP) travaria ou
  dispararia a espera. (`cuidados.js` usa `Date.now()`, porque grava carimbos no save.) Passo limitado a 5 s
  (aba que volta do fundo não dá salto).
- **Tutorial:** o relógio começa quando a promessa resolver, OU depois de 10 s seguidos livre, OU no máximo
  2 min depois de entrar (`Claude.limpar()` pode descartar a promessa sem resolver).
- **Venceu com ela ocupada:** espera ela ficar livre e parada e aparece depois de `esperaLivreMs` (4 s)
  seguidos. Nunca no meio de sala, treino, prova, tela, diálogo ou transição.
- **Recomeço depois de estudar:** terminou sala, treino ou prova (`.tela-missao`/`.tela-prova` saiu da pilha,
  evento `telas`) → sorteia um tempo novo do zero, para a surpresa não cair logo depois do estudo.
- **Pergunta:** só das salas que ela **já fez** (`estado.salas[id].feita`); de qualquer matéria, só das
  salas (`materia.salas[].desafios`, nunca `Reino.provas`), só dos tipos `config.surpresa.tipos` (escolha,
  vf, varias; sem `livre: true`). **Nenhuma sala feita: nenhuma pergunta, e a surpresa não abre** (o tempo é
  sorteado de novo; `forcar()` resolve `null`). Fila: primeiro as que ainda não vieram na sessão; depois as
  que ela adiou com "Agora não" (a mais antiga primeiro); acabou tudo: recomeça, sem repetir a última.
  `proximaPergunta()` e a abertura mostram a mesma (a sorteada fica guardada). Carrega o pacote de voz da
  sala (`Reino.Voz.carregarSala`) antes, esperando no máximo 4 s; o 🔊 do card lê a pergunta. Card com
  `Reino.Desafios.render(d, { modo: 'surpresa', onMudar })` (hoje `modo` não tem efeito no `D.render`),
  correção com `Reino.Desafios.pontuar(d, valor) === 1`. Depende também de `D.enunciado`, `D.linhaCerta` e
  de `ctrl.pronto/valor/travado/marcarCerto/revelar/card`.
- **Painel:** tela do DOM (`UI.painel('surpresa', '❓ Pergunta surpresa')`), com o Claude, o card,
  "Conferir" e "Agora não". Esc = "Agora não" (vale sempre); tocar fora do cartão **não** fecha.
  **Travas de 600 ms** (`OK_TRAVA_MS`): "Agora não" e ✕ nascem travados (um toque no menu do celular no
  instante em que o painel abre não fecha a pergunta sem ela ver), e o "Ok!" do resultado também (o toque
  duplo no "Conferir" não fecha antes de ela ler). Uma tentativa só:
  - acertou: `P.ganharEstrelas(config.surpresa.estrelas)` + `P.salvar()`, confete pequeno, som e elogio de
    `Claude.FALAS.acerto` sem os que citam "historiador" (servem para qualquer matéria);
  - errou: revela a certa no card (`ctrl.revelar`), mostra `D.linhaCerta(d)` e `d.explica`, sem perder nada;
  - nos dois, o enunciado se repete no topo do resultado e o painel rola até ele;
  - **"Agora não", ✕ ou Esc: fecha sem nada e a pergunta volta** para o fim da fila (não conta como feita).
  Em todos os casos, sorteia o próximo tempo. **Ao fechar, o foco vai para o mapa** (o painel não tem
  `_focoAntes`), nunca de volta ao botão do HUD (o Espaço de andar abriria o Estábulo).
- **Ajustes:** interruptor "❓ Perguntas surpresa" (`ajustes.surpresa`, já está em `UI.telaAjustes`).
  Desligado: nunca aparece e o relógio não conta.

## 6. Pet Shop (lugar `petshop`)
- **Mapa:** já posicionada (`EXTRAS` em mapa.js): rect `{ x: 2, y: 21, w: 5, h: 4 }`, porta (4, 24),
  caminho de rua até a rua de baixo, em frente ao Estábulo. Desenho de fora: `Mapa.PREDIOS.petshop`,
  registrado pelo próprio prédio (js/interiores/petshop.js:
  `if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.petshop = function (ctx, px, py, w, h) {…}`).
  A porta é o tile (4, 24): a porta desenhada fica no meio dele.
- **Interior** (`js/interiores/petshop-falas.js` + `petshop.js`, pacote `interior-petshop`), critério de
  "rico" dos contratos, 2 cômodos:
  - `loja` (nome na tela: "Pet Shop"): balcão, prateleiras de comida, sacos de feno, cestas de cenoura e
    maçã, potes de biscoito, escovas de crina, coleiras, casinha, aquário, balança. A `estante` e a vitrine
    do `bolo` também abrem a tela (`acao: { tipo: 'tela', tela: 'petshop' }`);
  - `agua` (Cantinho da Água): bebedouro grande, toalhas e banheira de espuma.
- **NPC** `aveia` (Dona Aveia, voz `npc-aveia`): `acao: { tipo: 'tela', tela: 'petshop' }`.
  O prédio registra `Reino.NPCs.registrarTela('petshop', function () { Reino.UI.telaPetShop(); }, '<convite>')`
  e um status (`Reino.NPCs.registrarStatus`): 🍎/💧 na Dona Aveia com a montaria baixa, só se o emoji tem
  desenho (`PA.iconeDesenho`).
- **Bebedouro:** objeto interativo com `acao: { tipo: 'beber' }`. O prédio registra
  `Reino.NPCs.registrarAcao('beber', fn)` → `Reino.Cuidados.beber(P.montaria())`. Bebeu: som `gole`,
  animação de água no bebedouro (só com animações) e `Cuidados.frases.bebeu` na voz do unicórnio (retrato e
  nome dele); já satisfeito (`cheio`): `Cuidados.frases.semSede` (Claude); sem unicórnio chocado: a fala das
  `extras` da Pet Shop (narradora). Sempre em balão modal com "Ok! 👍". `bebeu`/`semSede` já estão no pacote
  geral: não duplicar nas `extras`. É o único lugar com água.
- **`UI.telaPetShop()`** (ui.js): saldo de estrelas; cada comida com ícone, nome, preço e quanto enche;
  a despensa; nota de que a água é de graça. **Nada é gasto sem ela confirmar:** tocar numa comida abre UM
  `UI.escolher` (classe `painel-compra`), e só depois da escolha algo acontece:
  - **sem essa comida guardada:** "Trocar N estrelas por <comida>?" com "Comprar e dar agora <ícone>"
    (`principal`, `gasta`), "Comprar e guardar 🧺" (`gasta`) e "Agora não" (`seguro`: foco e Esc). De
    barriga cheia (fome ≥ 99,5) o "dar agora" não aparece, o "guardar" vira o principal e uma nota avisa
    antes de gastar;
  - **com essa comida na despensa e ele podendo comer:** "<comida>: tem N na despensa! 🧺" com "Dar uma da
    despensa 🧺" (`principal`, `gasta`: gasta comida guardada, sem estrela), "Agora não" (`seguro`) e, se
    der para comprar, "Comprar e guardar 🧺" (`gasta`), com a nota "Ou trocar N estrelas por mais uma."
    (sem "Comprar e dar": 4 botões não cabiam em tela pequena).
  Depois: dar da despensa (`Cuidados.alimentar` + `nhac` + `comeu`); ou `Cuidados.comprar(id)` → dar
  (`alimentar` + `nhac` + `comeu`) ou guardar (fala `guardado`). Nunca comprar primeiro e perguntar depois
  (volta a compra sem querer que a guarda de toque, §13, resolveu). Faltando estrelas e sem nada guardado
  (antes ou na compra): o número só na tela e a voz fala `Cuidados.frases.faltamEstrelas`, como na Loja.
- **Despedida da Dona Aveia:** `UI.visitaPetShop = { comprou, deu }` conta o que aconteceu na última visita
  à tela (zera a cada abertura). Ao fechar a tela, ela só se despede (a fala `depois`, "Bom apetite!") se
  ela comprou ou deu alguma comida; saiu sem nada, a Dona Aveia fica quieta (`npcs.js`).
- **HUD:** duas barrinhas (fome e sede) no chip da montaria, com `data-uni`/`data-campo`, repintadas só
  pelo evento `cuidados` (`UI.pintarCuidados`); o `aria-label` do chip leva a fome e a sede.
- **Balões dos cuidados com uma tela aberta** (`balaoNaTela`): `body.recado-cuidado` + `--recado-altura`
  (petshop.css) descem o balão para o pé da tela e encolhem a tela, e o balão nunca cobre um botão.
- **Estábulo:** a tela mostra as barras de cada unicórnio chocado; "Dar comida" (no detalhe) usa a
  despensa (`Cuidados.alimentar`); despensa vazia: fala que a Dona Aveia vende comidinhas e mostra o botão
  "🐾 Ir até a Pet Shop" (`U.emit('irPara', lugar)`); com sede, avisa que a água é de graça.
  As baias por dentro (`js/interiores/estabulo.js`) mostram 🍎/💧 quando a barra do unicórnio está baixa,
  e isso entra na `chave` do pré-render da baia.
- **Menu Lugares:** Pet Shop (🐾) e Observatório (🔭) com uma linha de informação cada.

## 7. Observatório (lugar `observatorio`)
- **Mapa:** já posicionado (`EXTRAS`): rect `{ x: 28, y: 21, w: 6, h: 5 }`, porta (31, 25), no morro a
  leste do lago (o ponto alto do reino). Desenho de fora: `Mapa.PREDIOS.observatorio` (morro, cúpula,
  telescópio), registrado pelo próprio prédio em `observatorio-cenas.js`, do mesmo jeito da Pet Shop.
- **Cenas do telescópio e robô** (`js/interiores/observatorio-cenas.js`):
  ```
  Reino.ObservatorioCenas = {
    temas() → ['lua','saturno','jupiter','marte','cruzeiro','cometa','galaxia','venus','pleiades']
    cena(tema, t?) → canvas (160×112 px do jogo, com moldura redonda de luneta). Sem t: o fixo, cacheado.
                     Com t (ms): UM canvas de animação por tema, reaproveitado e sobrescrito na próxima
                     chamada (desenhe na hora e não guarde). Tema desconhecido = 'lua'
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
- **Ações** registradas pelo prédio (`registrarAcao`):
  ```
  { tipo: 'curiosidade', tema }   // tema 'todas' = qualquer uma; tema 'telescopio' = abre o painel do telescópio;
                                  // tema sem curiosidade cai em 'todas' e depois numa frase de reserva
  { tipo: 'piada' }               // Robô Cosmo
  ```
  Fim de cada uma: "Outra curiosidade! ✨" / "Mais uma! 🤖" (repete) ou "Tchau! 💛" (resolve `'tchau'`: o
  NPC se despede, §8). Curiosidade tocada num objeto é contada pelo objeto (retrato e nome dele) com a voz
  `npc-vega`; vinda de NPC, pela Doutora Vega.
- **Telescópio:** painel do DOM (`UI.painel('telescopio')`) com a cena animada a 5 quadros/s, só com as
  animações ligadas e o painel aberto. `Reino.ObservatorioInterior = { retratoDe, abrirTelescopio, temaDaCena }`.
- **Curiosidades:**
  ```
  Reino.FALAS_INTERIORES.observatorio.curiosidades = [
    // fonte: <NASA Space Place | ESA Kids | Agência Espacial Brasileira> — <URL>
    { id, tema, paginas: ['frase curta.', 'outra frase.'] },
  ]
  Reino.Observatorio (em observatorio-falas.js) = {
    temas() → [tema]                                  // temas com pelo menos uma curiosidade
    curiosidade(tema) → { id, tema, paginas } | null  // sorteia sem repetir na sessão; 'todas' (ou vazio) = qualquer
    piada() → { id, paginas } | null                  // piadas do Cosmo, sem repetir na sessão
    reiniciar()                                       // só testes: zera a memória da sessão
  }
  ```
  Pelo menos 40, em temas: sol, lua, mercurio, venus, terra, marte, jupiter, saturno, urano, netuno,
  plutao, estrelas, constelacoes, astronautas, foguetes, cometas, galaxias. Corretas, atuais e curtas
  para o 2º ano (cada página até 30 letras, frases de 3+ palavras). Toques do Brasil: o Cruzeiro do Sul
  na bandeira; Marcos Pontes, o primeiro astronauta brasileiro. Todas narradas pela voz da Doutora Vega
  (`npc-vega`), em qualquer lugar em que apareçam. Só curiosidades: não dá estrelas nem mexe no save.

## 8. NPCs: extensões (`js/npcs.js`)
```
Reino.NPCs.registrarTela(nome, abrir(acao, ctx), convite?)   // tela nova para { tipo: 'tela', tela: nome };
                                                              // o convite vira a fala `nova` padrão de NPC com essa tela
Reino.NPCs.registrarAcao(tipo, fn(acao, ctx) → Promise)      // ação nova de NPC/objeto ({ tipo: 'beber' } …)
Reino.NPCs.registrarStatus(fn(npc) → { icone, rotulo } | null)   // roda ANTES dos status embutidos (sala nova…)
                                                              // e os substitui: o primeiro não nulo vence;
                                                              // exceção vira console.error e segue
Reino.NPCs.registrarBase(nome, fn(o, quadro) → { g, busto })     // base nova de sprite (o.base escolhe);
                                                              // o.cru = sprite original; quadro: bit 1 = respirando,
                                                              // bit 2 = piscando
Reino.NPCs.gradeSprite = { Grade, W, CX, TOPO, HY, BY, CONTORNO, esc, cla, mis }   // para desenhar a base
                                                              // (esc/cla/mis = escurecer, clarear, misturar cores)
Reino.NPCs.telas(), Reino.NPCs.acoes()                        // o que foi registrado (o validador aceita)
```
- **`ctx` das ações:** vinda de objeto, `{ interior, cena, objeto }`, e a ação roda **depois** da `fala`
  do objeto (se houver; se a fala resolver `null`, a ação não roda). Vinda de NPC, `{ npc, quem }`, e só roda no
  "vamos"/"lista" do diálogo.
- **Despedida:** tela registrada que fecha, ou ação que resolve `'tchau'` → o NPC fala a sua `depois`
  (balão simples de 5 s). Exceção: a tela `petshop` sem compra nem comida dada (`UI.visitaPetShop`, §6).
- Pontos de extensão do motor de interiores usados aqui (campo `toque` da biblioteca, balãozinho de status
  tocável): `CONTRATOS-INTERIORES.md` §4.2.1.

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
- **Áudio decodificado** (`voz.js`): cache LRU de `AudioBuffer` com teto de 24 MB (`TETO_BUFFERS`); a fala
  usada há mais tempo sai primeiro e, se voltar, é decodificada de novo do base64 (que continua guardado).
  Duas filas: as falas ouvidas uma vez (curiosidades, perguntas) saem antes das que se repetem (acertos,
  erros, avisos do Claude), que têm até 14 MB protegidos (`TETO_REPETIDAS`); a que acabou de chegar sempre
  fica. `V.memoria()` → `{ falas, repetidas, bytes }` para os testes.
- **Pacote de voz que falhou** (Wi-Fi caiu): é esquecido e pedido de novo sozinho em 3 s, 10 s e 30 s
  (`ESPERAS`), também na próxima fala (no máximo a cada 5 s) e na hora no evento `online`. A fala que já
  passou muda não toca atrasada.
- **Sprites com enfeites** (`pixelart.js`): o cache guarda só as 24 combinações de enfeites usadas por
  último (`TETO_COMBOS`; a sem enfeite fica sempre), contando `PA.unicornio` e a composição montada
  (`PA.montada`), que sai do cache junto com a sua combinação. A que sai é redesenhada no mesmo quadro se voltar.

## 12. Divisão de arquivos
Divisão histórica das fases; não indica quem é o dono dos arquivos hoje (o `ui.js`, por exemplo, foi
mexido por várias fases).

| Fase | Quem | Arquivos (e só eles) |
|---|---|---|
| 0 | orquestrador | index.html, config.js, mapa.js (EXTRAS), npcs.js (extensões e ELENCO), falas.js, listar-falas.js, gerar-vozes.py, validar-interiores.js, debug.js, main.js, ui.js (1 linha em Ajustes), arquivos provisórios da Fase 1 |
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

## 13. Guarda de toque (ui.js; vale para toda tela que gasta estrela ou comida)
Um botão que some no 1º toque deixava o 2º toque cair no que aparece embaixo (já comprou comida, trocou
enfeite e ligou interruptor sem ela querer). Tudo vale só para toque e mouse de verdade (`isTrusted`,
`detail > 0`); o toque ignorado afunda o botão de leve, sem som.
```
UI.segurarToques(ms = 800)   // abriu ou fechou uma tela por toque (até 600 ms antes): cliques PERTO (40 px) desse
                             // toque ficam ignorados por 800 ms; cada toque ignorado no mesmo lugar estica a
                             // guarda (+800 ms), até 2 s depois da troca de tela. Longe dele, vale na hora
UI.toqueSegurado(x, y) → bool   // o toque em (x, y) está segurado agora? (e estica a guarda). main.js usa no
                             // pointerdown do mapa: o 2º toque no "Ir" do Lugares não troca o destino
UI.escolher(msg, [{ rotulo, valor, principal?, seguro?, gasta? }], classe?) → Promise(valor)
                             // o `seguro` (ou o 1º) recebe o foco e é o que o Esc escolhe. `gasta`: ver abaixo
UI.confirmar(msg, sim, nao, gasta?)   // atalho de UI.escolher com dois botões ("não" é o seguro)
```
- **Botões que gastam** (`gasta: true`; estrela ou comida guardada, como "Dar uma da despensa"): nascem
  apagados (`.armando`, `aria-disabled`) e só acendem depois de 1,1 s (`ARMAR_MS`) **sem nenhum toque** na
  tela; cada toque nesse tempo recomeça a espera. Uma barrinha enche durante a espera (com "reduzir
  movimento", o texto "Espera um pouquinho…"). O "Agora não" vale na hora.
- **Sob o dedo:** se o toque que abriu o diálogo (até 600 ms antes) cai a 40 px de um botão que gasta, esse
  botão troca de lugar com o seguro; se ainda sobrar um embaixo do dedo, o diálogo se move até o "Agora não"
  ficar sob o dedo; se nem assim, um toque a 40 px dali não gasta.
- **Ajustes:** no 1º segundo depois de abrir, nenhum toque muda interruptor.
- **Loja:** logo depois de uma compra, o cartão comprado (só ele) ignora toques perto do ponto da compra
  por 1 s (`logoDepoisDaCompra`).
- **Teclado sem trava:** Enter/Espaço (clique com `detail` 0) e `.click()` de código passam sempre, inclusive
  num botão apagado (ela chega nele com um Tab de propósito); Enter/Espaço segurados (repetição automática)
  não acionam de novo. Tela nova que não põe o foco em nada recebe o foco **nela mesma** (como um diálogo),
  não no 1º botão: um Enter logo depois não age sozinho; o Tab leva ao 1º botão. (O `UI.escolher` foca o
  seguro.)
- Toda compra nova pergunta ANTES de gastar, com os botões de gastar marcados `gasta: true` e um botão
  `seguro`. Nunca gastar e perguntar depois.
