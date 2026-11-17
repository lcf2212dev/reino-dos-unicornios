---
name: entregar
description: Use no Reino dos Unicórnios, como orquestrador, para criar a worktree de uma frente (com o material) e, quando as frentes terminaram, juntá-las na main, testar e entregar (commit, vozes, base do e2e, merge, push, conferência da Vercel) e limpar o que sobrou. Não use dentro de uma frente (worker) nem para testar uma frente só (validar-tudo).
---
# Entregar

Para quem coordena; autorizado pelo `CLAUDE.md` da raiz, sem perguntar. Histórico LINEAR (cherry-pick, nunca merge
commit). Detalhe de cada opção: `--ajuda` da ferramenta.

## Começar uma frente
`npm run worktree -- <tema> [--material <Pasta>] [--base <ref>]` → `/home/leandro/Development/projects/reino-dos-unicornios/worktrees/reino-<tema>`, branch `feat/<tema>`,
`node_modules` por link, cópia dos NÃO rastreados de `matérias/<Pasta>/` (ex.: `Geografia`, `ciências/Revisão`).
Prints: `npm run material -- <Pasta> --folha` (reduzidas e folhas em `/tmp/reino-testes/material/<pasta>/`; agente lê só essas).

## Integrar e entregar (uma chamada)
Antes: frentes paradas (processo vivo numa worktree de frente = a ferramenta para e mostra os PIDs; espere) e o
retorno de cada uma lido (linhas para os arquivos disputados, falas novas, diferenças do e2e).
```
npm run integrar -- feat/a /home/leandro/Development/projects/reino-b --assunto "o que a b fez" --commit --vozes \
  --esperado '<regex das imagens que a feature explica>' [--trocar-base "<descrição>"] --merge --push
```
- `--esperado` sempre (idêntico esperado: `--esperado '^$'`, sem `--trocar-base`); `--trocar-base "<descrição>"` só
  se o e2e mudou de propósito (o que a feature explica). `--merge` recusa e2e vermelho sem `--esperado` aceito.
- Worktree `reino-integracao-<data>` (`--nome` outro). Branch com commit: cherry-pick; worktree solta: diff +
  arquivos novos, um commit por frente com `--commit` (mensagem sem Claude-Session e sem prefixo dobrado).
- `--vozes`: grava, empacota e confere as falas sem áudio (commit "vozes …"); conferência reprovada = para (skill
  `validar-vozes`, depois `--continuar`). `--merge` recusa fala sem áudio. Personagem novo ou perfil trocado: antes,
  `npm run vozes-elenco`.
- e2e diferente fora do `--esperado` = para, sem base nem merge: volte à frente. `--trocar-base` grava a base `@`
  dentro do último commit (sem commit "base do e2e").
- Conflito: para e lista; resolva na worktree de integração, `git add`, `npm run integrar -- --continuar --nome <n>`
  (o estado mora no git dela). Resolvidos sozinhos: `index.html` e vozes (índice juntado; a mesma fala com áudios
  diferentes para e pede escolha). Lista no `CLAUDE.md`: junte as duas. Manifesto: as linhas das duas frentes.
- Linhas dos arquivos disputados: ponha na worktree de integração e rode de novo (sem entradas, retoma o que falta).
- Colisão (não rastreado na árvore principal que a integração passa a rastrear): igual = movido pelo `--merge`;
  diferente = para: vale o da árvore principal; copie para a integração, `git add`, `--continuar`.
- Árvore principal com mudança em arquivo rastreado: leve-a para a integração (nada se perde), restaure a principal
  ao git e explique no relatório.
- Push recusado (GitHub andou): `git fetch`, `merge --ff-only origin/main` na principal (ou integre de novo por
  cima) e push. Nunca `--force`.

## Depois do push
1. `npm run vercel -- --conferir` (jogo não mudou: sai na hora). Erro: `npm run vercel` (plano B). Nada de artifact.
2. Limpeza: `npm run limpar` lista; `npm run limpar -- --aplicar --manter '<regex das worktrees em uso>'` só com
   nenhuma frente rodando.
3. Relatório: skill `nova-feature`, passo 7.

## Nunca
Escrever na árvore principal fora do `--merge`; `git push --force`; merge commit; `rm` com caminho variável; o que o
`CLAUDE.md` da raiz protege (progresso, banco da Vercel, servidor de casa, artifact, Docker).
