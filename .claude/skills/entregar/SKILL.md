---
name: entregar
description: Use no Reino dos Unicórnios, como orquestrador, quando as frentes (worktrees de agentes) terminaram e é hora de juntá-las na main, testar e entregar (commit, merge, push, artifact), ou para criar a worktree de uma frente nova com o material. Não use dentro de uma frente (worker) nem para testar uma frente só (validar-tudo).
---
# Entregar (integrar frentes na main)

Para quem coordena. Ferramentas em `jogo/ferramentas/fluxo/` (Node, sem dependência). O histórico é LINEAR:
cherry-pick, nunca merge commit. Pedido do Leandro vai ponta a ponta (`CLAUDE.md` da raiz): commit, troca da base
do e2e, merge e push sem perguntar. Artifact só quando ele pedir.

## Começar uma frente
```
npm run worktree -- <tema> --material <Pasta>
```
- Cria `/home/leandro/reino-<tema>` na branch `feat/<tema>` a partir da main (`--base <ref>` para outra), com
  `node_modules` por link (`--ci` faz `npm ci`) e cópia dos arquivos NÃO rastreados de `matérias/<pasta>/` (prints de uma
  matéria ou prova; `<Pasta>` é o nome da matéria, ex.: `Geografia` ou `ciências/Revisão`). Só lê a árvore principal.
- Prints e fotos: `node jogo/ferramentas/fluxo/material.js <Pasta> --folha` grava cópias reduzidas, índice e
  folhas de contato em `/tmp/reino-testes/material/<pasta>/`. Agente lê só essas.

## Integrar
1. Confira que as frentes pararam (a ferramenta também confere: processo vivo numa worktree de frente = mostra os
   PIDs e para; espere, não derrube processo que não é seu). Leia o retorno de cada frente: linhas para
   `package.json`, `CLAUDE.md`, manifesto, `base-referencia.txt`, falas novas.
2. Rode, na ordem em que as frentes devem entrar (branch com commit ou caminho de worktree sem commit):
   ```
   node jogo/ferramentas/fluxo/integrar.js feat/a /home/leandro/reino-b --assunto "o que a frente b fez"
   ```
   - Worktree `/home/leandro/reino-integracao-<data>` (branch `integracao/<data>`; `--nome` para outro nome).
   - Branch com commits além da main: cherry-pick. Worktree sem commit: diff dela aplicado com `apply --3way`
     + os arquivos novos. Sem `--commit`, as frentes soltas entram depois dos cherry-picks e ficam sem commit
     (dá para testar antes). Com `--commit`, um commit por frente solta:
     "Reino dos Unicórnios: <assunto>" + linha Claude-Session (variável `CLAUDE_SESSION_URL`).
   - Depois: `npm run index`, aviso se o `falas.json` mudou, `npm test`, `npm run e2e` (e o resumo dele, se
     houver). Relatório e saídas em `/tmp/reino-testes/integrar/<nome>/`.
3. Conflito: a ferramenta para, lista os arquivos e grava o estado. Resolva na worktree de integração, `git add`
   e rode `node jogo/ferramentas/fluxo/integrar.js --continuar --nome <nome>`.
   - `jogo/index.html`: resolvido sozinho (um lado + `npm run index`).
   - Lista de skills (ou outra lista) no `CLAUDE.md`: JUNTE as duas listas, sem perder item de nenhum lado.
   - Manifesto: mantenha as linhas das duas frentes, na ordem de carga que cada uma pediu.
4. Linhas do orquestrador (`package.json`, `CLAUDE.md`, `COMO-USAR.md`, tipos, `.gitignore`): ponha na worktree
   de integração e rode `npm test` de novo.
5. Vozes: com falas novas ou o aviso do `falas.json`, skill `gravar-vozes`; personagem novo ou perfil de voz
   trocado, antes a skill `validar-vozes`.
6. Diferença no e2e: confira cada uma com o que as frentes disseram. Diferença não explicada = volte à frente.
7. Colisões: arquivo NÃO rastreado na árvore principal (ex.: a pasta de prints) que a integração passa a
   rastrear. Igual byte a byte = "mover" (só com `--merge`, para `/tmp/reino-testes/antes-do-merge/<data>/`);
   diferente = a ferramenta para e lista: é material do Leandro, pergunte qual vale.

## Entregar (sem perguntar, com tudo verde)
1. **Commit:** `--commit` (ou commits à mão na worktree de integração).
2. **Base do e2e:** só se o e2e mudou de propósito (a diferença que a feature explica) →
   `--trocar-base "<descrição curta>"` (commit "Reino dos Unicórnios: base do e2e em <hash> (<descrição>)").
3. **Merge:** `--merge` move as colisões iguais e faz `merge --ff-only` na árvore principal (servida ao vivo); exige
   `npm test` verde e a integração sem mudança solta. Se a árvore principal tiver mudança em arquivo rastreado, veja
   o que é: o Leandro pode ter mexido nela (ex.: moveu uma pasta de material); leve a mudança para a integração e
   restaure a árvore principal ao que está no git antes do merge; se não der para entender, pare e conte.
4. **Push:** `--push` (`git push origin main`, nunca `--force`).
As flags vão juntas numa chamada só: `--commit --trocar-base … --merge --push`.
5. **Artifact:** só quando o Leandro pedir → skill `publicar-artifact`.
6. **Relatório final ao Leandro:** o que entrou, o que você decidiu sozinho, o hash da main e o servidor de teste.

## Nunca
- Escrever na árvore principal fora do `--merge`; `git push --force`; merge commit; `rm` com caminho variável.
- Servidor de casa, save real, artifact publicado ou Docker (regras do `CLAUDE.md` da raiz).
- Apagar a worktree de integração ou as das frentes (ficam; o Leandro limpa quando quiser).
