# Contrato: viagem de foguete (planetas, voo, ETs)

Cobre a viagem espacial: o combustível que enche com as respostas certas, o painel do foguete (com o passaporte),
o minijogo de voo e os planetas (interiores do Observatório com céu aberto e ETs). Pedido:
`pedidos/2026-09-27-viagem-espacial.md`. Números em `Reino.config.viagem`.

## Índice
1. Onde está · 2. Fluxo · 3. `Reino.Viagem` · 4. `Reino.Voo` · 5. Planetas · 6. ETs · 7. Pulo · 8. Save · 9. Antes de mexer

## 1. Onde está
| Arquivo | O quê |
|---|---|
| `jogo/js/sistemas/viagem.js` (+ partes `viagem-*.js`) | `Reino.Viagem`: planetas, tanque, passaporte, ação `viagem`, fluxo decolar → voo → chegada; falas do Claude |
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
- `materia` (2ª versão): a matéria das perguntas dos portais do voo e dos ETs daquele planeta. A Lua não tem.

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
- 2ª versão: portais de resposta no caminho (`iniciar({ planeta, perguntas })`); a 1ª versão deixa o espaço para isso.

## 5. Planetas (`interiores/planetas/`)
- Interior com `lugar: 'observatorio'`, sem `entrada`, `pacote: 'interior-observatorio'`, `fundo: 'espaco'`,
  `spawn` = a chegada. Não aparece no menu Lugares; entrar marca `visitados`.
- Um cômodo aberto (as 2 fileiras de "parede" são o horizonte), piso do planeta com contraste com a Mariana.
- Obrigatório: o foguete de pouso com a ação de volta (§2.4) ao lado da chegada; as vagas dos ETs livres.
- Lua (`planeta-lua`, 24×17, chegada (11, 14)): só brincar. Brincadeiras: pular alto (`Jogador.pular`), pedra que
  flutua, esconde-esconde com o Pipo, cristais para pegar (memória da sessão), curiosidades de verdade.

## 6. ETs
- Base de sprite `et` (`interiores/planetas/ets.js`), com chaves (cor, antenas, olhos…) para variar por planeta.
- Cada ET: reserva (`observatorio/reservas.js`, onda 0), sprite em `interiores/planetas/personagens.js`
  (`Reino.registrarPersonagem({ id, sprite: { base: 'et', … } })`), falas em `observatorio/personagens-falas.js`.
- Vozes: multilíngues falando português (sotaque de outro planeta), aprovadas pela transcrição.
- Lua: `lua-lumi` (Lumi) (8, 7), `lua-pipo` (Pipo) (16, 9), `lua-vovo` (Vovó Cratera) (5, 12).

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
- Nada mais vai para o save (cristais, esconde-esconde: memória da sessão).

## 9. Antes de mexer
```
npm run unidade -- --so 'viagem|voo|pulo'
node jogo/ferramentas/validar/validar-interiores.js --so observatorio
npm run ver -- --ir planeta-lua
```
