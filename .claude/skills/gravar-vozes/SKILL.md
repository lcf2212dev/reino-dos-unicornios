---
name: gravar-vozes
description: Use depois de criar ou mudar qualquer texto falado do Reino dos Unicórnios (falas de NPC, salas, provas, avisos do Claude) ou de trocar voz/velocidade em `vozes` do config, para listar, gravar, empacotar e conferir as vozes.
---
# Gravar vozes

Receitas: `docs/receitas/fala-nova-e-vozes.md` e `docs/receitas/licoes-de-voz.md`.
Contrato: `docs/contratos/som-musica-e-voz.md` §4–§7.
Personagem novo ou perfil de voz trocado: ANTES, a skill `validar-vozes` (checagens do elenco e amostras para
o Leandro aprovar). Depois de gravar, ela também explica o resultado da conferência.

- As vozes são achadas pelo TEXTO EXATO: mudou uma vírgula, grava de novo.
- Falas de personagem até 30 letras por página; frases de 3 palavras ou mais; inglês entre «».
- Gravação e conferência: só quem integra (o orquestrador). Quem escreve falas entrega o texto.
- NUNCA abra `jogo/js/voz/*.js` nem `jogo/ferramentas/gerado/**` (enormes).

Na raiz da worktree:
```
npm run vozes
```
(listar → gravar só as novas → empacotar em `jogo/js/voz/` → conferir por transcrição).
O transcritor roda pelo `.vozes/venv-whisper` (se existir), senão por `uv run --with faster-whisper`, senão o
`npm run vozes` cria o venv em `.vozes/`. Temporários das vozes (índice de antes etc.) ficam em `.vozes/` (ignorado
pelo git), não no /tmp; o modelo do whisper fica em `~/.cache/huggingface`.
Para conferir sem tocar no jogo: `npm run vozes -- --saida /tmp/reino-testes/vozes/<pasta>`.

Depois: `npm test` e `npm run e2e -- --so-dados` (a lista de falas entra nas referências).
