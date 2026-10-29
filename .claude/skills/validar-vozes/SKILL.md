---
name: validar-vozes
description: Use no Reino dos Unicórnios depois de criar personagem novo ou trocar um perfil de voz (checar o elenco ANTES de gravar tudo), e depois do `npm run vozes` para ler a conferência por transcrição (reprovadas, 2ª passada, palavra solta para ouvir). Completa a gravar-vozes, não a substitui; não use só para mudar o texto de uma fala (isso é gravar-vozes).
---
# Validar vozes

Regras de quem grava e o que não se abre: skill `gravar-vozes`. Leia o `falas.json` só por script.

## Personagem novo
1. **Elenco:** `npm run vozes-elenco`
   - `✘` voz base do Claude (`pt-BR-AntonioNeural`) com tom a até 15 Hz e velocidade a até 10 pontos: troque o perfil.
   - `!` mesmo prédio com a mesma voz base, tom a até 8 Hz e velocidade a até 8 pontos; mesmo nome próprio no prédio;
     voz de gênero trocado. Personagem NOVO: corrija. Perfil já aprovado: só informe.
2. **Amostras** (internet): `node jogo/ferramentas/vozes/listar-falas.js` e
   `uv run --with edge-tts python jogo/ferramentas/vozes/amostras.py 'npc-lab-.*' npc-nasa-lia`
   → `amostras-de-voz/NN-<Lugar>-<Nome>.mp3`. Aprovação = elenco limpo + transcrição sem `✘`.
3. **Gravar:** skill `gravar-vozes`.

## Conferência (passo 4 do `npm run vozes`)
- Só as gravações novas: diferentes de `.vozes/indice-conferido.json` (sem ele, o índice do HEAD).
- 1ª passada em paralelo com feixe 1; as reprovadas de novo com o `medium` (`--segunda <modelo>`, `--sem-segunda`).
- Algarismo x extenso, "R$ 16" x "16 reais", "pro" x "para o", cem x sem contam como iguais. Palavra que o
  transcritor não conhece: dica em `VOCABULARIO` do `conferir-vozes.py`.
- `✘` (3+ palavras): voz errada. Reescreva ou use `PRONUNCIA` no `listar-falas.js` e grave de novo.
- `?` palavra solta: não reprova; ouça o arquivo listado.
- Avulso: `~/.cache/reino-dos-unicornios/vozes-venv/bin/python jogo/ferramentas/vozes/conferir-vozes.py --amostras arq.mp3=texto --modelo medium`.
