# jogo/js/interiores — regras locais

Contrato: `docs/contratos/interiores.md` (§8 convenções, §9 prédios). NPCs: `docs/contratos/npcs-e-dialogo.md`.
Receitas: `docs/receitas/predio-novo.md`, `docs/receitas/personagem-novo.md`.

## Uma pasta por prédio: `interiores/<p>/`
- `falas.js` — `Reino.FALAS_INTERIORES.<p> = { npcs, objetos, extras? }`. Carrega ANTES das outras partes.
- `objetos*.js` — objetos temáticos: `Reino.Interiores.objeto('<p>-<nome>', …)`.
- `<p>.js` — o layout e `Reino.registrarInterior(def)`.
- `acoes.js` — ações, telas e status dos NPCs do prédio (quando houver).
- `fora.js` — o prédio de fora, no mapa (`Mapa.PREDIOS.<p>`), quando houver.
- As partes dividem o que precisam em `Reino._predios.<p>`. Cada arquivo até ~400 linhas.
- A ordem exata de cada prédio é a do manifesto (o Observatório tem partes extras: planetas, cenas, robo, ceu).

## Manifesto
- Toda parte: grupo `'interiores'`, `node: true`, ANTES de `interiores/padrao.js` (sempre o último).
- Nas ferramentas, os prédios carregam em ordem alfabética da pasta; dentro da pasta, na ordem do manifesto.
  Falas e dados compartilhados vêm antes de quem usa.
- A prévia `jogo/ferramentas/previas/interiores.html` acha os prédios pelo grupo. Não há lista para atualizar.

## Regras
- Nada de canvas, `PA` ou DOM no carregamento: só dentro das funções.
- Falas de personagem: até 30 letras por página (sem contar «» e emoji); frases de 3 palavras ou mais.
- NPC com sprite e voz de `Reino.NPCs.ELENCO[id]` (perfil de voz `npc-<id>`).
- Voz pelo TEXTO EXATO: mudou a fala, precisa gravar de novo (pacote `interior-<p>`).
- `padrao.js` monta o interior de toda matéria sem prédio próprio.

## Antes de entregar
- `npm run validar` (critério de "rico" e grade), `npm test`, `npm run e2e`.
