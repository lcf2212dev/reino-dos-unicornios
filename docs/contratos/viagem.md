# Contrato: viagem de foguete (planetas, voo, ETs)

Cobre a viagem espacial: o combustível que enche com as respostas certas, o painel do foguete (com o passaporte),
o minijogo de voo e os planetas (interiores do Observatório com céu aberto e ETs). Pedido:
`arquivo/pedidos/2026-09-27-viagem-espacial.md`. Números em `Reino.config.viagem`.

## Índice
1. Onde está · 2. Fluxo · 3. `Reino.Viagem` · 4. `Reino.Voo` · 5. Planetas · 6. ETs · 7. Pulo · 8. Save · 9. Antes de mexer

## 1. Onde está
| Arquivo | O quê |
|---|---|
| `jogo/js/sistemas/viagem.js` (+ partes `viagem-*.js`) | `Reino.Viagem`: planetas, tanque, passaporte, ação `viagem`, fluxo decolar → voo → chegada; falas do Claude |
| `jogo/js/sistemas/viagem-perguntas.js` | `Reino.Viagem.perguntas(materia, n, chave)`: perguntas curtas das salas para os portais (§4.1) |
| `jogo/js/sistemas/viagem-desafio.js`, `jogo/js/ui/et-desafio.js`, `css/ui-et-desafio.css` | o desafio do ET (ação `viagem-desafio`) e o campo `etsAmigos` (§6.1) |
| `jogo/js/sistemas/viagem-amigos.js`, `jogo/js/ui/album-ets.js`, `css/ui-album-ets.css` | o álbum de ETs e a regra de amizade (§6.2) |
| `jogo/js/sistemas/et-companheiro.js`, `jogo/js/sistemas/et-companheiro-desenho.js` | o ET que acompanha a Mariana no mapa e nos interiores (§6.3) |
| `jogo/js/ui/foguete.js`, `css/ui-foguete.css` | painel do foguete (`Reino.UI.telaFoguete()`): tanque, destinos, passaporte |
| `jogo/js/atividades/voo.js`, `voo-desenho.js`, `css/ui-voo.css` | `Reino.Voo`: o minijogo de voo em tela própria com canvas |
| `jogo/js/interiores/planetas/` | `planetas-comum.js` (fundo `espaco`, pisos, horizonte, foguete de pouso), um arquivo (ou mais) por planeta |
| `jogo/js/interiores/planetas/ets.js` | base de sprite `et` (`Reino.NPCs.registrarBase`) |
| `jogo/js/interiores/observatorio/reservas.js`, `personagens-falas.js` | reservas e falas dos ETs (lugar do Observatório) |
| `jogo/js/personagens/jogador*.js` | `Jogador.pular()` |
| `jogo/ferramentas/validar/validar-viagem.js` | o validador segue a viagem na alcançabilidade; confere `fundo` e destinos |
| `jogo/js/motor/interiores-*.js` | `I.FUNDOS` e `def.fundo` (céu aberto; `interiores.md` §3) |

## 2. Fluxo
1. Hangar dos Foguetes (`observatorio-2`): o foguete grande tem `acao: { tipo: 'viagem' }` → `Reino.UI.telaFoguete()`.
2. Painel: tanque (`Reino.Viagem.tanque()`), destinos (`Reino.Viagem.planetas()`), passaporte (`carimbos()`).
   Tanque cheio → "Decolar!" para um destino. Não cheio → quantas respostas certas faltam e onde conseguir.
3. Decolar: fecha o painel → `Reino.Voo.iniciar({ planeta })` → resolve `{ chegou, estrelas, batidas }`.
   - `chegou: false` (ela saiu com Esc/✕): nada se gasta, ela continua no Hangar.
   - `chegou: true`: `Reino.Viagem.gastar()` (zera o tanque), `P.ganharEstrelas(min(estrelas, config.viagem.estrelasPorVoo))`,
     `Reino.Cena.irPara(planeta.interior, planeta.chegada, { x: 0, y: 1 })`, depois `carimbar(planeta.id)` e o
     Claude fala a chegada (carimbo novo só na 1ª vez).
4. No planeta, o foguete de pouso tem `acao: { tipo: 'viagem', para: 'observatorio-2', chegada: { x: 7, y: 9 } }`:
   volta ao Hangar, ao lado do foguete, de graça (com uma pergunta "Voltar para o Reino?" antes, decidida pela mecânica).
5. O Claude avisa uma vez por sessão, no mapa e livre, até o primeiro carimbo: "O foguete da NASA agora voa!".

## 3. `Reino.Viagem` (`sistemas/viagem.js`, `node: true`)
```
registrarPlaneta({ id, nome, interior, chegada: {x,y}, ordem, cor, materia? })   // no carregamento do planeta
planetas() → [planeta] (por ordem)      planeta(id | interior) → planeta | null
tanque() → { n, max }       cheio() → bool       ganhar(n)       gastar()      // gastar: n = 0
carimbos() → { <id>: true }  carimbar(id) → bool (true = carimbo novo)
falas() → [{ texto, voz? }]   // tudo o que o painel e o fluxo falam (voz 'claude', pacote 'geral'): texto exato
```
- Ouve `Reino.EVENTOS.RESPOSTAS` (`{ certas, erradas }`, emitido por `Reino.Aura.contar`): `ganhar(certas)`. Errada
  não tira. O tanque nunca passa de `config.viagem.tanque`.
- `materia` (2ª versão): a matéria das perguntas dos portais do voo e do ET do desafio daquele planeta. A Lua não tem.
- `artigo` ('na' | 'em'): "Chegamos na Lua!", "Chegamos em Marte!". `depois` (id): o planeta só abre depois do
  carimbo desse (o painel mostra o cadeado e diz qual visitar antes). Lua → Marte → Saturno.

## 4. `Reino.Voo` (`atividades/voo.js`)
```
iniciar({ planeta }) → Promise<{ chegou, estrelas, batidas }>
aberto() → bool
```
- Tela própria (`UI.abrirTela('voo')`, canvas; o laço do mapa pausa sozinho). Contagem 3, 2, 1, depois
  `config.viagem.vooSegundos` de voo, e a chegada (o planeta cresce no alto). Sem pressa: dura o mesmo tempo
  aconteça o que acontecer.
- Controles: arrastar ou tocar dos lados (celular e tablet); setas ←/→ (notebook). Esc ou ✕ = sair (`chegou: false`).
- Asteroide: só uma tremidinha (conta em `batidas`). Estrelas: somam em `estrelas`.
- Relógio do rAF (congela no modo determinístico); sorteio por `Reino.sorteioDaChave`; sem Animações, a física
  roda (é a atividade) sem partículas, parallax nem tremida.
- Portais (2ª versão): `iniciar({ planeta, perguntas })`, `perguntas` de `Reino.Viagem.perguntas` (§4.1). Um portal por
  pergunta, espalhados no voo: a pergunta aparece (e a narradora lê) um pouco antes; as opções (2 ou 3) viram faixas
  lado a lado; passar pela certa = estrela a mais (`config.viagem.estrelasPorPortal`) e `Reino.Aura.contar([true], matéria)`
  (enche o tanque e a Aura); pela errada = "Quase!" com a certa, sem tirar nada. Resolve também `portais: { certos, erros }`.

### 4.1 Perguntas da viagem (`Reino.Viagem.perguntas`)
```
perguntas(materia, n, chave) → [{ id, materia, sala, texto, opcoes: [texto], certa, desafio }]
```
- Das salas da matéria (primeiro as que ela já fez; senão todas): `escolha` com até 3 opções curtas (até 16 letras,
  sem `apoio`) e `vf` (Verdadeiro/Falso). `texto` é o enunciado (`Reino.Desafios.enunciado`); `desafio` é o original
  (para ler com a voz gravada: `Reino.Falas.segmentosDesafio`, voz 'narradora', pacote da sala).
- Sorteio por `U.embaralhar(lista, chave)` (determinístico no modo congelado); sem repetir dentro da mesma lista.

## 5. Planetas (`interiores/planetas/`)
- Interior com `lugar: 'observatorio'`, sem `entrada`, `pacote: 'interior-observatorio'`, `fundo: 'planeta-<id>'`
  (`P.fundo` em `planetas-comum.js`: o chão do planeta vai até a borda, sem espaço embaixo),
  `spawn` = a chegada. Não aparece no menu Lugares; entrar marca `visitados`.
- Um cômodo aberto (as 2 fileiras de "parede" são o horizonte), piso do planeta com contraste com a Mariana.
- Obrigatório: o foguete de pouso com a ação de volta (§2.4) ao lado da chegada; as vagas dos ETs livres.
- Lua (`planeta-lua`, 24×28, chegada (13, 4), diante do horizonte): só brincar. Brincadeiras: pular alto (`Jogador.pular`), pedra que
  flutua, esconde-esconde com o Pipo, cristais para pegar (memória da sessão), curiosidades de verdade.

## 6. ETs
- Base de sprite `et` (`interiores/planetas/ets.js`), com chaves (cor, antenas, olhos…) para variar por planeta.
- Cada ET: reserva (`observatorio/reservas.js`, onda 0), sprite em `interiores/planetas/personagens.js`
  (`Reino.registrarPersonagem({ id, sprite: { base: 'et', … } })`), falas em `observatorio/personagens-falas.js`.
- Vozes: multilíngues falando português (sotaque de outro planeta), aprovadas pela transcrição.
- Lua: `lua-lumi` (Lumi) (8, 7), `lua-pipo` (Pipo) (16, 9), `lua-vovo` (Vovó Cratera) (5, 12).
- Marte (Matemática): `marte-rubi` (Rubi, desafio) (8, 7), `marte-faisca` (Faísca) (16, 9), `marte-vovo` (Vovô Vulcão) (5, 12).
- Saturno (Inglês): `saturno-sky` («Sky», desafio) (8, 7), `saturno-nico` (Nico) (16, 9), `saturno-vovo` (Vovó Anel) (5, 12).
- Júpiter (Português): `jupiter-tinta` (Tinta, desafio) (8, 7), `jupiter-bolha` (Bolha) (16, 9), `jupiter-vovo` (Vovô Tempestade) (5, 12).
- Vênus (Geografia): `venus-mapi` (Mapi, desafio) (8, 7), `venus-quentinho` (Quentinho) (16, 9), `venus-vovo` (Vovó Nuvem) (5, 12).
- Netuno (Ciências e História): `netuno-gota` (Gota, desafio de Ciências) (8, 7), `netuno-memo` (Memo, desafio de
  História) (16, 9), `netuno-vovo` (Vovó Ventania) (5, 12). Portais do voo com Ciências.
- Ordem de abertura: Lua → Marte → Saturno → Júpiter → Vênus → Netuno (`depois`).
- Os planetas montam os NPCs por `Reino._predios.planetas.npcsDoPlaneta(interior)` (planetas-comum.js).

### 6.1 O desafio do ET (`viagem-desafio`)
- Ação `{ tipo: 'viagem-desafio', materia }` no ET com um problema (Rubi: a nave quebrou; «Sky»: quer praticar inglês).
- Painel (`Reino.UI.telaDesafioET(npc, materia)`) com `config.viagem.desafioPerguntas` perguntas de
  `Reino.Viagem.perguntas`, uma por vez, com o card de `Reino.Desafios.render` (o mesmo da pergunta surpresa).
  Cada Conferir conta na Aura (`Reino.Aura.contar(ok)`); acerto de primeira vale `estrelasPorAcertoET` estrela;
  errada mostra a certa e a explicação e segue. Terminar (acertando ou não) faz do ET um amigo.
- Falas do ET no desafio: as do módulo (`falas()`), na voz do ET (`npc-<id>`), texto exato.
- Save: `etsAmigos: { <npcId>: true }` (uniao, `novoCiclo: 'mantem'`).

### 6.2 Amizade e álbum de ETs (3ª versão)
- Regra: o ET do desafio vira amigo ao terminar o desafio (§6.1); os outros ETs viram amigos quando ela brinca ou
  ouve a curiosidade com eles: toda ação de ET de planeta chama `Reino.Viagem.fazerAmigo(npcId)` (se existir).
- `Reino.Viagem.ets() → [{ id, nome, planeta, amigo }]` (todos os ETs dos planetas, na ordem dos planetas).
- Álbum (`Reino.UI.telaAlbumETs()`), aberto por um botão no painel do foguete: um cartão por ET (sprite, nome,
  planeta); amigo em cores, ainda não = silhueta com "?". No cartão de um amigo: "Levar comigo" (§6.3).

### 6.3 O ET que acompanha
- `Reino.Viagem.companheiro() → id | null`, `escolherCompanheiro(id | null)` (só amigo). Save: `etCompanheiro:
  { mariana: { id, em } }` (carimbo, `novoCiclo: 'mantem'`).
- Camada de desenho (`registrarModulo` com `camada`): o ET flutua um pouco atrás da Mariana, no mapa e nos
  interiores, seguindo o caminho dela (rastro próprio; recomeça ao trocar de cena), balançando devagar (parado sem
  Animações). Não conversa nem bloqueia nada. Número em `config.viagem.companheiroDistancia`.

### 6.4 Capacete de astronauta (Loja)
- Enfeite do unicórnio no encaixe `cabeca` (receita `docs/receitas/enfeite-novo.md`), tema espaço (`espaco: true`).

## 7. Pulo (`Jogador.pular`)
```
Jogador.pular({ altura?, ms? }) → bool   // a Mariana (e a montaria) sobe e desce; a sombra fica no chão
Jogador.pulando() → bool
```
Sem Animações ou com movimento reduzido: não pula (devolve false). Ela pode andar durante o pulo.

## 8. Save
- `combustivel: { mariana: { n, em } }`: mesclar `carimbo` (sobe e desce), `novoCiclo: 'mantem'`, `limpar` prende
  entre 0 e o máximo. Sem o campo: `config.viagem.cheioNoComeco` → tanque cheio.
- `passaporte: { <planeta>: true }`: mesclar `uniao`, `novoCiclo: 'mantem'`. Só cresce.
- `etsAmigos: { <npcId>: true }`: mesclar `uniao`, `novoCiclo: 'mantem'` (§6.1).
- Nada mais vai para o save (cristais, esconde-esconde: memória da sessão).

## 9. Antes de mexer
```
npm run unidade -- --so 'viagem|voo|pulo'
node jogo/ferramentas/validar/validar-interiores.js --so observatorio
npm run ver -- --ir planeta-lua
```
