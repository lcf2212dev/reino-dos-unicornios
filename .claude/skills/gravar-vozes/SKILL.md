---
name: gravar-vozes
description: Use depois de criar ou mudar qualquer texto falado do Reino dos Unicórnios (falas de NPC, salas, provas, avisos do Claude) ou de trocar voz/velocidade em `vozes` do config, para listar, gravar, empacotar e conferir as vozes.
---
# Gravar vozes

Receitas: `docs/receitas/fala-nova-e-vozes.md` e `docs/receitas/licoes-de-voz.md` (como escrever). Contrato:
`docs/contratos/som-musica-e-voz.md` §4–§7. Personagem novo ou perfil trocado: ANTES, skill `validar-vozes`.

- Só quem integra grava; quem escreve falas entrega o texto exato. Vozes são achadas pelo TEXTO EXATO.
- NUNCA abra `jogo/js/voz/*.js` nem `jogo/ferramentas/gerado/**` (enormes).
- Na integração: o `--vozes` do `npm run integrar` (skill `entregar`). Fora dela, na raiz da worktree:
  `npm run vozes` (listar → gravar só as novas → empacotar → conferir). Precisa de internet, `uv` e `ffmpeg`.
- Python: venv único `~/.cache/reino-dos-unicornios/vozes-venv` (`REINO_VOZES_VENV`), criado sozinho
  (`uv venv --python 3.13`). Temporários em `.vozes/`.
- Conferir sem tocar no jogo: `npm run vozes -- --saida /tmp/reino-testes/vozes/<pasta>`.
- mp3 sem uso no cache: `npm run vozes -- --orfaos` lista; `--aplicar` tira.
- Resultado da conferência e voz embolada: skill `validar-vozes`.
- Depois: o `npm test` já confere a lista de falas (sem `e2e --so-dados` à parte).
