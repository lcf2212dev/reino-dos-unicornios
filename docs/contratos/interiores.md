# Contrato: interiores (construções por dentro)

Cobre o formato de um interior (cômodos, portas, escadas, objetos), a biblioteca de objetos, a grade,
o critério de "rico" conferido pelo validador, o desenho e as regras de cada prédio.
NPCs e diálogo: `npcs-e-dialogo.md`. Cena, íris e câmera: `cena-e-motor.md`.

## Índice
1. Onde está no código · 2. API `Reino.Interiores` · 3. Formato de um interior (3.1 Escadas pareadas) · 4. Grade ·
5. Biblioteca de objetos · 6. Desenho e desempenho · 7. Critério de "rico" (validador) ·
8. Convenções dos prédios · 9. Prédios (9.7 Lugar novo no mapa) · 10. Antes de mexer

## 1. Onde está no código
- Motor (`jogo/js/motor/`, nesta ordem): `interiores-base.js` (`Reino.registrarInterior`, `Reino._interiores`),
  `interiores-pisos.js` (pisos e paredes), `interiores-objetos-parede.js`, `interiores-objetos-moveis.js`,
  `interiores-objetos-enfeites.js` (biblioteca), `interiores-grade.js` (grade e caminho, puro),
  `interiores-estatico.js` (pré-render), `interiores-placas.js` (placas dos cômodos), `interiores-toque.js`
  (quem recebe o toque, falas e ações), `interiores-cena.js` (a cena, NPC genérico e a API `Reino.Interiores`).
- Helpers de desenho e paleta: `jogo/js/arte/desenho.js` (`Reino.Desenho`; os prédios usam `Reino.Interiores.desenho`).
- Prédios: `jogo/js/interiores/<prédio>/` (falas, objetos, interior, ações, desenho de fora); `jogo/js/interiores/padrao.js`.
- Prévia: `jogo/ferramentas/previas/interiores.html` (acha os prédios sozinha pelo grupo `interiores` do manifesto).
- Validador: `jogo/ferramentas/validar/validar-interiores.js` (escadas: `validar-escadas.js`, chamado por ele).

## 2. API `Reino.Interiores`
```
Reino.interiores = []                 // defs registradas, na ordem
Reino.registrarInterior(def)
Reino.Interiores = {
  T: 16,
  def(id) → def
  doLugar(lugarId) → def de entrada do lugar (entrada: true; senão a primeira) | null
  doPredio(lugarId) → [defs do lugar]
  cena(id) → cena (cena-e-motor.md §6), criada uma vez e reaproveitada
  grade(def) → { w, h, solido[y][x], chao[y][x], comodo[y][x] }   // puro, sem DOM (usado pelo validador)
  objeto(tipo, defObjeto)             // registra um tipo de objeto; cada prédio pode registrar os seus
  OBJETOS, PISOS, PAREDES, FUNDOS     // bibliotecas (FUNDOS: céu aberto, abaixo)
  desenho: { C, ret, circulo, elipse, triangulo, contornoRet, … }   // os helpers de arte/desenho.js
  chegadaDaEscada(origemId, i) → {x,y} | null   // onde ela chega pela escada i de origemId (§3.1)
  chegadaVindoDe(paraId, deId) → {x,y} | null   // ao lado da escada de paraId que volta para deId (§3.1)
}
```

## 3. Formato de um interior (dados)
```
Reino.registrarInterior({
  id: 'museu',                        // único; andares: 'torre', 'torre-1', 'torre-2'…
  lugar: 'materia:historia',          // id do lugar no mapa ('castelo','escola','estabulo','loja','bau','petshop',
                                      // 'observatorio','materia:<id>')
  nome: 'Museu das Memórias',
  entrada: true,                      // por aqui se entra pelo mapa (um por lugar)
  pacote: 'interior-museu',           // pacote de voz; andares do mesmo prédio usam o mesmo
  tamanho: { w, h },                  // em tiles
  saida: { x, y },                    // tapete de saída (só no de entrada): tile de chão na última fileira do cômodo
  spawn: { x, y },                    // 1 tile acima do tapete (planeta, sem entrada: onde o e2e e o irPara sem chegada põem)
  fundo?: 'espaco',                   // céu aberto: I.FUNDOS[id] = { cor, desenhar(ctx, w, h) } pinta o vão em volta
                                      // dos cômodos (em vez do roxo-escuro, sem lábios) e `cor` é a cor fora do interior
  escadas: [{ x, y, para: 'torre-1', chegar: { x: 0, y: 1 }, olhar: { x: 0, y: 1 }, sentido: 'sobe'|'desce' }],
                                      // 'sobe' = arco na parede, 'desce' = vão no chão; pareadas (abaixo)
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
    acao?: { tipo: 'tela', tela: 'livro'|'plano'|'estabulo'|'loja'|'bau'|'ovos'|'petshop', materia? }
         | { tipo: 'unicornio', indice }      // (estábulo) o unicórnio da baia diz a frase gravada
         | { tipo: '<registrada>', … }        // ações de npcs-e-dialogo.md §7 (beber, banho, curiosidade…)
    var?: { … },                      // parâmetros do desenho (cor, unicórnio do quadro etc.)
  }],
  npcs: [ … npcs-e-dialogo.md §2 … ],
});
```
Ações de objeto recebem `ctx = { interior, cena, objeto }` e rodam DEPOIS da `fala` do objeto (se a fala
resolver `null`, a ação não roda).

### 3.1 Escadas pareadas
1. Toda escada tem **par** no andar `para`: exatamente uma escada de lá com `para` = este andar. Cada andar
   declara só as próprias escadas; nenhum arquivo de coordenação entre andares.
2. `chegar: { x, y }` é da escada que **recebe**: de que lado dela a Mariana aparece quando chega pelo par
   (um passo: `{x:±1,y:0}` ou `{x:0,y:±1}`; padrão `{ x: 0, y: 1 }`, logo abaixo). `olhar` é da escada de
   **origem**: para onde ela olha ao chegar.
3. O lado de chegada (escada + `chegar`) é andável, fora de escada e do tapete de saída do andar.
4. Sem par, ela chega no `spawn` do destino. `chegada: { x, y }` explícita ganha do par; com par também,
   o validador dá aviso (tire a `chegada`).
5. Onde ela chega de fato: `Reino.Interiores.chegadaDaEscada(origemId, i)` (validador, e2e, testes);
   `Reino.Interiores.chegadaVindoDe(paraId, deId)` é o que o motor usa (`cena-e-motor.md` §3).
6. Conferido por `validar/validar-escadas.js` (chamado pelo `validar-interiores.js`) e pela tabela congelada de
   `testes/unidade/escadas.test.js` (mudou uma posição de propósito: atualize a tabela).

## 4. Grade
1. Tiles fora de qualquer `rect` são sólidos (vão).
2. As 2 primeiras fileiras de cada `rect` são parede sólida.
3. `portas`, `saida`, `spawn`, `escadas` são andáveis.
4. Objeto sólido e NPC ocupam o tile.
5. Caminho: 8 direções, sem cortar quina (como no mapa).

## 5. Biblioteca de objetos
```
Reino.Interiores.objeto('escrivaninha', {
  w: 2, h: 2, solido: 'base', alto: false, parede: false,
  desenhar(ctx, px, py, obj, P)   // px do jogo; P = Reino.Progresso (objetos derivados do estado)
  chave?(P, obj) → string         // objetos que mostram o estado: muda a chave → pré-render de novo
  topo?: px                       // móveis altos: quanto o desenho passa acima da pegada
  junto?: true                    // par de propósito (cadeira na frente do espelho): o aviso de móvel alto
                                  // cobrindo o vizinho ou a parede (interiores-extras.js) não se aplica
  anim?(ctx, px, py, t, obj)      // animação leve por quadro (só com Animações)
  semSombra?: bool                // a sombra sob o móvel é automática
  toque?(wx, wy, px, py, obj, folga) → bool   // área de toque própria, em px do jogo (ex.: planetas desenhados
                                              // maiores que a pegada); folga 0 = desenho exato, 1 = com folga
});
```
1. Biblioteca genérica (49 tipos). Parede: janela, cortina, quadro, quadro-unicornio (`var.uni`: silhueta com
   "?" até ela ganhar), estandarte, vitral, cartaz, relogio-parede, prateleira-parede, arandela, lousa,
   mapa-parede, espelho, bandeirinhas. Chão: estante, armario, mesa, mesa-centro, escrivaninha, cadeira,
   poltrona, sofa, banco, tapete, tapete-redondo, tapete-listrado, vaso-planta, planta-alta, flores,
   vaso-grande, bau, caixote, barril, pedestal, vitrine, lareira, fonte, bebedouro, cabideiro, globo,
   pilha-livros, papeis, almofada, luminaria-pe, cesto, balde, placa-chao, cavalete, relogio-pe; e "miudezas"
   sobre mesas e vitrines.
2. Pisos: taco, mosaico, pedra, palha, tabuas, azulejo, carpete. Paredes: papel, pedra, madeira, tijolo, azulejo.
   (Prédios podem registrar os seus, ex.: `observatorio-*`.)
3. Ver os arquivos `motor/interiores-objetos-*.js`, `motor/interiores-pisos.js` e a prévia `interiores.html`.
4. Prioridade do `alvoEm` nos interiores: NPC (o corpo e o balãozinho de status em cima da cabeça, que
   também é tocável) → objeto interativo com `toque` (exato, depois com folga 1; o desenhado por cima ganha)
   → objeto interativo cuja pegada contém o tile → parte desenhada acima da pegada (`topo`), a mais à frente;
   no chão livre, só onde há pixel desenhado (máscara do `desenhar` + `anim` no instante 0, feita uma vez e
   refeita quando o desenho muda).

## 6. Desenho e desempenho
1. Estático pré-renderizado UMA vez num canvas por interior; refeito só quando a chave de estado (junção
   das `chave(P)`) muda, conferida nos eventos `progresso`/`progressoRemoto`/`mapaMudou`.
2. Nada de criar canvas a cada quadro. Móveis altos viram sprites pré-renderizados.
3. Animações (vela, pêndulo, brilho, água) só com `animar`.
4. Placas dos cômodos: em px da tela, fonte pixel, tamanho do texto pela regra do `ui.md` §10.9.5, desenhadas por
   cima dos itens (`desenharSobre`), sempre opacas (nada de `globalAlpha` entre 0 e 1). Visual de placa de parede,
   não de chip: fundo `--laranja-claro` chapado (madeira clara, longe do `--papel-quente` dos chips), borda `--tinta`
   de 2 px CSS, dois preguinhos `--tinta-suave` de 1 pixel de arte, sem o degrau de sombra. A Mariana é obstáculo:
   a placa do cômodo dela muda de lugar em vez de sumir; a de um cômodo vizinho que não achar outro lugar some
   inteira enquanto ela estiver embaixo e volta em degrau (0 ou 1).
5. Onde a placa fica, nesta ordem (obstáculos: o HUD e o balão aberto de `#claude-balao`, com o retrato e a
   plaquinha, a 8 px CSS da folga do `ui.md` §10.18.2; os balãozinhos de status e cadeados, a 8 px; a Mariana; os objetos de parede do
   cômodo, `parede: true`, nas 2 fileiras da parede ou de chão com o desenho subindo até elas, com o desenho inteiro): (a) na parede do fundo do próprio cômodo, deslizando até o
   vão mais perto do meio; (b) sem vão, na moldura de cima do cômodo (metade sobre a borda, ou inteira acima dela),
   sem cruzar nenhum outro cômodo; (c) só a do cômodo da Mariana, sem lugar nas duas: desce para o chão (`ui.md`
   §10.18.4), a meio tile (em px de tela) da Mariana, dos NPCs, do que se toca (objeto com fala/ação, pedestal, tapete de saída, escada) e, se der, dos móveis: primeiro a faixa logo abaixo da parede, depois o fundo do cômodo, fora do tapete (enfeite plano, que ela pode cobrir se não houver outro lugar); depois na tela sem invadir outro cômodo; sem isso, cobre um
   enfeite de parede (o celular com o balão aberto no corredor da Escola). Ela só some se não houver nenhum
   retângulo fora do HUD, do balão e da Mariana (exceção). A placa de outro cômodo não aparece com o balão aberto e
   pode sumir. O HUD é medido pela `caixaParada` (a caixa sem o transform da animação) no máximo a cada 500 ms; o
   balão abrir, fechar ou trocar de texto remede na hora. A posição fica guardada por cômodo e só se recalcula
   quando muda a posição do cômodo na tela (câmera), o canvas, os retângulos do HUD/balão, os balãozinhos ou a
   célula da Mariana (ou ela passa por baixo); ao recalcular, o lugar de antes (preso ao cômodo) vale enquanto
   continuar livre, para a placa não pular com a câmera. Com Letras grandes (`html.letras-grandes`) a letra sobe um
   degrau (`texto.corpo` → `texto.g`, múltiplo de 8) e a fonte entra na chave. Conferido por `testes/unidade/placas-evitam.navegador.test.js`.
6. O ícone de status do NPC é desenhado em px da tela (via `pintor.ctx`).
7. Piso com contraste ≥ 2,9 com o contorno da Mariana (mediana dos pixels desenhados), em todo cômodo
   (`contraste-pisos.navegador.test.js`); exceção só com motivo em `validar/contraste.js`.

## 7. Critério de "rico" (conferido por `validar-interiores.js`)
1. Cada cômodo: ≥15 TIPOS de objeto distintos (pegada tocando o `rect`, parede inclusa).
2. Nenhuma janela de 3×3 tiles de chão sem nenhum objeto, NPC, tapete ou escada, fora dos `corredores`.
3. Camadas: piso com padrão, rodapé, parede decorada, móveis, objetos pequenos, sombras.
4. ≥3 objetos interativos por interior.
5. Tudo alcançável a partir do `spawn`: vizinho livre de cada NPC e objeto interativo, a saída e as escadas.
6. O validador aceita as telas e ações registradas (`Reino.NPCs.telas()`, `Reino.NPCs.acoes()`).

## 8. Convenções dos prédios
1. Uma pasta por prédio: `jogo/js/interiores/<prédio>/`. `falas.js` (`Reino.FALAS_INTERIORES.<prédio> =
   { npcs, objetos, extras? }`) carrega ANTES das outras partes; depois as partes do prédio (objetos
   temáticos, o interior `<prédio>.js`, `acoes.js`, `fora.js`…), que dividem o que precisam em
   `Reino._predios.<prédio>`. Cada arquivo ≤ ~400 linhas.
2. Todas as partes entram no `jogo/js/manifesto.js`, grupo `'interiores'`, `node: true`, antes de
   `interiores/padrao.js` (sempre o último dos prédios). A prévia `interiores.html` e as ferramentas acham os
   prédios sozinhas pelo grupo (não há lista para atualizar).
3. Objetos temáticos: `Reino.Interiores.objeto('<prédio>-<nome>', …)`.
4. NPCs com sprite e voz de `Reino.NPCs.ELENCO[id]`.
5. Nas ferramentas (vozes, validador) os prédios são carregados por ordem alfabética do nome da pasta
   (`padrao.js` por último) e, dentro da pasta, na ordem do manifesto (`jogo-no-node.js`, `ordemDosPredios`).
   Essa ordem define a ordem do `falas.json`. Falas e dados compartilhados têm de vir antes de quem usa
   também nessa ordem (o que vale se estiverem antes no manifesto, dentro da pasta).
6. Nada de canvas/PA/DOM no carregamento: só dentro das funções.
7. Geradores (dados → cômodos): a Escola monta uma sala de aula por prova (`Reino.provas`), com professor
   conhecido (campo `paraProva` no elenco, `personagens/elenco.js`, lido por `escola/escola.js` com
   `Reino.NPCs.doElenco`) ou padrão (`prof-<prova>`); o Castelo monta uma ala por matéria (`Reino.materias`),
   com cavaleiro conhecido (campo `paraMateria` no elenco, lido por `castelo/castelo.js`) ou padrão
   (`cav-<matéria>`); o Estábulo monta uma baia por unicórnio do baralho.
8. Matéria sem interior próprio ganha o interior padrão (`interiores/padrao.js`): hall com guia e livro e um
   cômodo por sala; ala no Castelo e baias no Estábulo vêm dos geradores.

## 9. Prédios
Cômodos, objetos e paleta de cada prédio estão no próprio código (`jogo/js/interiores/<p>/`, cabeçalho de cada
parte). Aqui só o que outros arquivos usam. Escada entre andares de lugares diferentes vale se um for matéria
`dentro` do outro (Ciências no 3º andar do Observatório, `conteudo.md` §2 item 7).

### 9.1 Estábulo
1. Ação de objeto `{ tipo: 'unicornio', indice }` (baia; índice em `Reino.NPCs.unicornioDaBaia(n)`: baia fixa
   por unicórnio do álbum; baia vazia fala `Reino.NPCs.BAIA_VAZIA`).
2. As baias mostram 🍎/💧/🛁 quando a barra do unicórnio está baixa; isso entra na `chave` do pré-render da baia.

### 9.2 Loja e Escola
1. A Loja por dentro lê a lista única `Reino.LojaItens` (`loja.md`); `UI.ITENS_LOJA` é apelido.
2. Mural da Escola (`escola/objetos.js`, `ganhou()`): conta só o prêmio da prova
   (`P.regProva(prova).premio === r`), não a compra.

### 9.3 Pet Shop (lugar `petshop`)
1. Posição no mapa em `Mapa.LUGARES_FIXOS` (`mundo/lugares.js`); desenho de fora `Mapa.PREDIOS.petshop`
   registrado pelo próprio prédio (`petshop/fora.js`).
2. A `estante` e a vitrine do `bolo` também abrem a tela (`acao: { tipo: 'tela', tela: 'petshop' }`).
3. NPC `aveia` e as ações `beber`/`banho`: `cuidados.md` §6 e §7.

### 9.3.1 Baú do Tesouro (lugar `bau`)
1. Monte grande (`bau/bau.js`): escala fixa de 2 matérias, cheio em R$40 (`valorPorMateria` × 2); matéria nova
   nunca faz o mesmo dinheiro parecer menor. Cada `bau-pilha` cresce com o dinheiro da própria matéria.

### 9.4 Observatório (lugar `observatorio`)
1. Desenho de fora e cintilar (`Mapa.PREDIOS.observatorio`, `Mapa.PREDIOS_ANIM.observatorio`) em `observatorio/fora.js`.
2. Cenas do telescópio e robô:
   ```
   Reino.ObservatorioCenas = {                      // observatorio/cenas.js (+ planetas.js)
     temas() → ['lua','saturno','jupiter','marte','cruzeiro','cometa','galaxia','venus','pleiades']
     cena(tema, t?) → canvas (160×112 px do jogo, moldura redonda de luneta). Sem t: o fixo, cacheado.
                      Com t (ms): UM canvas de animação por tema, reaproveitado e sobrescrito na próxima
                      chamada (desenhe na hora e não guarde). Tema desconhecido = 'lua'
     desenharPlaneta(ctx, id, cx, cy, raio)       // Sol, 8 planetas e Plutão, para o Planetário
   }
   Reino.NPCs.registrarBase('robo', fn)            // observatorio/robo.js: o Robô Cosmo (corpo, detalhe, antena)
   Reino.ObservatorioInterior = { retratoDe, abrirTelescopio, temaDaCena }   // observatorio/acoes.js
   ```
3. Telescópio: painel do DOM (`UI.painel('telescopio')`) com a cena animada a 5 quadros/s, só com animações
   ligadas e o painel aberto. Planetas animados nunca saem da própria pegada (o toque sempre os acha).
4. Andares `observatorio-2` (NASA: só diversão, sem pergunta, estrela, dinheiro ou save; "NASA" em letras
   próprias, nunca o logotipo) e `observatorio-3` (lugar `materia:ciencias`, sem saída para o mapa). NPCs, ações e
   curiosidades: `npcs-e-dialogo.md` §9.
5. Os andares 1 e 2 são só curiosidade: `observatorio/acoes.js` só LÊ o progresso (nada de estrela, dinheiro ou save).

### 9.5 Casa das Palavras (lugar `materia:portugues`)
1. Desenho de fora `Mapa.PREDIOS.palavras`, em `portugues/fora.js`. Ids `portugues` e, se houver andares ou alas,
   `portugues-<n>`, todos com `pacote: 'interior-portugues'`.
2. Cavaleira e professora vêm do elenco (`paraMateria` / `paraProva`, §8.7); o tema da ala em `TEMAS.<matéria>`
   (`castelo/castelo.js`). O mesmo vale para Ciências (`lab-cavaleira`, registrada no `castelo/castelo.js`, que
   carrega antes do Observatório).

### 9.6 Interior de teste
O interior de teste da primeira fase (`teste`, lugar `bau`, NPCs `teste-guia`/`teste-sala`) foi trocado pelo
Baú de verdade e não existe mais. Os perfis de voz `npc-teste-guia`/`npc-teste-sala` ainda estão em
`config.js` (sem uso no jogo); não os reaproveite para personagem novo.

### 9.7 Lugar novo no mapa
Prédio novo = a pasta `jogo/js/interiores/<p>/` + as linhas dela no manifesto. Nada muda em `mundo/lugares.js`,
`ui/lugares.js` nem `validar-interiores.js`: o prédio se registra ao carregar.
- `Reino.registrarLugar(def)` (`nucleo/registros.js`) guarda em `Reino.lugaresRegistrados`, na ordem de registro.
  `def = { id, nome, sprite, rect, placa?, caminho, menu? }`; `caminho` (tiles `[x, y]` da rua até a frente da
  porta) é OBRIGATÓRIO: sem ele o lugar é recusado (devolve `false`, vai para `Reino.lugaresRecusados` e o
  validador acusa). `Mapa.criar` põe os registrados depois dos fixos com caminho (depois do sorteio dos enfeites).
- `menu = { emoji, info?(l), avisos?(l) → [{ texto, icone?, tipo }], abrir?(l) }` alimenta a linha do menu
  Lugares, os chips e a tela própria (`Reino.UI.registrarLugarMenu(tipo, menu)`, a mesma tabela dos lugares de
  hoje). Sem `menu`: 📍, sem informação, sem avisos e só o interior. `tipo` do lugar = `id`.
- O validador lê os lugares dos dados (`ferramentas/validar/lugares-do-mapa.js`) e acusa id repetido, registrado
  sem caminho, rect fora do mapa ou por cima de outro lugar, caminho fora do mapa ou por dentro de um prédio.
```js
// jogo/js/interiores/ninho/lugar.js (depois do desenho de fora em Mapa.PREDIOS.ninho)
Reino.registrarLugar({
  id: 'ninho', nome: 'Ninho das Corujas', sprite: 'ninho', rect: { x: 10, y: 10, w: 5, h: 4 }, placa: 'acima',
  caminho: [[14, 14], [13, 14], [12, 14]],   // livre de verdade: npm run ver -- --livres 5x4
  menu: { emoji: '🦉', info: function () { return 'Histórias da noite'; } },
});
// e o interior de entrada: Reino.registrarInterior({ id: 'ninho', lugar: 'ninho', entrada: true, ... })
```

## 10. Antes de mexer, rode
```
node jogo/ferramentas/validar/validar-interiores.js
node jogo/ferramentas/gerar-index.js --conferir
node jogo/ferramentas/vozes/listar-falas.js        # se mudou fala: confira as falas novas
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
npm test
```
Abra `jogo/ferramentas/previas/interiores.html` por `file://` (o servidor de teste só entrega `index.html`, `css/` e `js/`)
para ver os cômodos.
