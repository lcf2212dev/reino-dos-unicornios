---
name: publicar-artifact
description: Use SÓ quando o Leandro pedir, por escrito, para publicar (atualizar) o artifact do Reino dos Unicórnios no claude.ai. Publica apenas o que mudou desde a versão registrada, em lotes, sem mexer no progresso da Mariana. Só o orquestrador; nunca um worker nem um subagente.
---

# Publicar o artifact por delta

Só com pedido explícito do Leandro. Só o orquestrador. Nunca abra o jogo publicado, nunca use `ArtifactData`,
nunca leia nem grave o doc `progresso/mariana`. Nunca `force`. Nunca o campo `capabilities` (omitir mantém o `db`).

1. **Ler antes.** `jogo/ferramentas/artifact-publicado.txt` tem `<hash> <url> <versão>`. Faça
   `Artifact action "read"` nessa `url` (o publish por `url` exige a leitura; confira que é "writer").
   Se a versão viva for mais nova que a registrada, pare e pergunte ao Leandro.
2. **Montar o delta** (na main integrada, tudo em commit): `npm run artifact -- --desde publicado`.
   Recusa se houver mudança fora de commit em `jogo/js`, `jogo/css` ou `jogo/index.html`.
   Grava em `/tmp/reino-testes/artifact/<data>/`: a página index.html, os lotes lote-1.json…lote-N.json e o resumo.txt.
3. **Mostrar ao Leandro** o resumo.txt: novos, mudados, removidos e o número de lotes. Espere o sinal.
4. **Publicar um lote por vez**, na ordem: `Artifact` publish com `url` (a registrada), `file_path` = o
   `index.html` da pasta e `files` = o conteúdo do lote-K.json. Sem `capabilities`, sem `icon`, sem `force`.
   A página e os removidos (`null`) estão no ÚLTIMO lote: os anteriores só acrescentam arquivos.
   Conflito de versão: pare e conte ao Leandro (não sobrescreva).
5. **Conferir**: `Artifact action "list"`, `scope "files"`, na `url`: a contagem bate com a lista inteira
   (`npm run artifact` sem `--desde` mostra o total) e os removidos sumiram. Anote a versão que o resultado
   do último publish mostrou.
6. **Avisar o Leandro**: fechar as abas antigas do artifact (uma aba velha pode pedir arquivo que mudou).
   As abas do servidor de casa se atualizam sozinhas quando existir o módulo de versão (frente A2, módulo versao.js).
7. **Registrar**: `npm run artifact -- --registrar <hash do HEAD publicado> --versao vN`. Deixe o
   `artifact-publicado.txt` alterado para o commit (commit só com autorização do Leandro).
