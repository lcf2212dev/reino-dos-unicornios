# Decisão: vozes achadas pelo texto exato, em pacotes de nome fixo

Para que serve: explica como as falas gravadas são guardadas e achadas, e por que texto mudado exige regravar.

## Contexto
- As vozes do navegador variam por aparelho e somem sem internet. A Mariana joga no tablet, no celular e no notebook.
- Os áudios somam dezenas de MB: não dá para carregar tudo de uma vez.

## Decisão
- Cada fala é gravada uma vez (vozes neurais do edge-tts) e embutida em `.js` (`jogo/js/voz/<pacote>.js`,
  base64), carregados sob demanda por `Reino.Voz.carregar` (durante a íris de entrada de um prédio).
- Chave = perfil de voz + texto normalizado (`Reino.Voz.chave`, sem emoji, sem «»). A MESMA função
  (`Reino.Falas.todas`, `Reino.Voz.dividir`) é usada ao gravar e ao tocar.
- Pacotes de nome fixo (`geral`, `interior-<prédio>`, `<matéria>-<sala>`, `<matéria>-extra`,
  `<matéria>-livro`, `prova-<prova>`); o cabeçalho dos pacotes não muda (mudaria todos os arquivos).
- Gravação em lote só do que falta (`npm run vozes`), com conferência por transcrição das novas.
- Gerados, sem edição à mão: `jogo/ferramentas/gerado/` e `jogo/js/voz/` (nunca abrir).

## Consequências
- Mudou uma vírgula: gravação nova. Trocar só emoji não muda a chave.
- Todo texto falado precisa estar em `Reino.Falas.todas()`; o que fica de fora sai mudo (`__reino.faltando`).
- Regras de escrita: `docs/receitas/licoes-de-voz.md`. Passo a passo: `docs/receitas/fala-nova-e-vozes.md`.
