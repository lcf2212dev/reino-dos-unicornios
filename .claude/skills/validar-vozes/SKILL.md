---
name: validar-vozes
description: Use no Reino dos Unicórnios depois de criar personagem novo ou trocar um perfil de voz (checar o elenco ANTES de gravar tudo), e depois do `npm run vozes` para ler a conferência por transcrição (reprovadas, 2ª passada, palavra solta para ouvir). Completa a gravar-vozes, não a substitui; não use só para mudar o texto de uma fala (isso é gravar-vozes).
---
# Validar vozes

Receitas: `docs/receitas/fala-nova-e-vozes.md` e `docs/receitas/licoes-de-voz.md`. Gravar: skill `gravar-vozes`.
Gravação, amostras e conferência: só quem integra (o orquestrador). NUNCA abra `jogo/js/voz/*.js` nem
`jogo/ferramentas/gerado/**` (leia o `falas.json` só por script).

## Ordem para personagem novo
1. **Elenco** (na raiz da worktree): `npm run vozes-elenco`
   - `✘` voz base do Claude (`pt-BR-AntonioNeural`) com tom a até 15 Hz e velocidade a até 10 pontos: troque o perfil.
   - `!` mesmo prédio (pacote `interior-*`) com a mesma voz base, tom a até 8 Hz e velocidade a até 8 pontos;
     mesmo nome próprio no mesmo prédio ("Doutora Lia" x "Jardineira Lia"); voz de gênero trocado
     ("eu sou a …", Doutora, Professora… com voz masculina). Personagem NOVO: corrija. Perfil já aprovado: só informe.
2. **Amostras** (precisa de internet; sem esperar ninguém): `node jogo/ferramentas/vozes/listar-falas.js` e
   `uv run --with edge-tts python jogo/ferramentas/vozes/amostras.py 'npc-lab-.*' npc-nasa-lia`
   → `amostras-de-voz/NN-<Lugar>-<Nome>.mp3` (numeração segue a última) e um AMOSTRAS-NN-a-MM com todas. Confira as
   amostras pela transcrição (abaixo); a aprovação é o elenco limpo mais a transcrição sem `✘`.
3. **Gravar**: `npm run vozes` (skill gravar-vozes).

## Conferência (passo 4 do `npm run vozes`)
- 1ª passada com o `small`; as reprovadas passam de novo com o `medium` (`--segunda <modelo>`, `--sem-segunda`).
- Algarismo x extenso, "R$ 16" x "16 reais", "pro" x "para o", colmeia x coméia contam como iguais.
- `✘` (frase de 3+ palavras): voz errada de verdade. Reescreva ou use `PRONUNCIA` no `listar-falas.js` e grave de novo.
- `?` palavra solta (1–2 palavras, ex.: opções de desafio): não reprova; ouça o arquivo listado. Só regrave se soar errado.
- Reconferir avulsos: `.vozes/venv-whisper/bin/python jogo/ferramentas/vozes/conferir-vozes.py --amostras arq.mp3=texto --modelo medium`
  (sem esse venv: `uv run --with faster-whisper python jogo/ferramentas/vozes/conferir-vozes.py …`).
