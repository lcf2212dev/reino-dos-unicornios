---
name: nova-feature
description: Use quando o Leandro pedir uma novidade, um ajuste ou uma correção no Reino dos Unicórnios pelo modelo `PEDIDO-DE-FEATURE.md` (ou colando um pedido com os campos dele, curto ou completo), para ler o pedido, completar o que falta, escolher a skill ou receita certa e entregar só até onde ele marcou.
---
# Nova feature (pedido pelo modelo)

Pedido em texto livre, sem o modelo: primeiro a skill `preparar-pedido`, que preenche o modelo e volta aqui.

O modelo que o Leandro preenche: `PEDIDO-DE-FEATURE.md` (raiz). Campo em branco vale o padrão escrito no modelo;
"O que já vale sempre" vale em todo pedido, mesmo sem estar escrito.

1. **Ler e completar.** Leia o pedido inteiro, e a pasta de material se houver. Pergunte só o que muda o trabalho e não
   tem padrão: tipo incerto, dinheiro novo, voz nova, campo novo no save, algo que esbarra em "O que NÃO pode mudar" ou em
   "Me pergunte antes". Tudo numa rodada só (AskUserQuestion, a opção recomendada primeiro). O resto, decida e anote no plano.
2. **Escolher o caminho** pelo campo "Tipo" e ler o contrato do assunto (tabela do `CLAUDE.md` da raiz) antes de mexer:

   | Tipo | Siga |
   |---|---|
   | Matéria ou salas | skill `nova-materia` |
   | Prova da escola | skill `nova-prova` |
   | Prédio | skill `novo-predio` |
   | Fala ou voz | skill `gravar-vozes` |
   | Mecânica, desafio, personagem, enfeite, comida, música | `docs/ARQUITETURA.md` §5.1 e a receita em `docs/receitas/README.md` |
   | Ajuste ou correção | o `CLAUDE.md` da pasta do assunto e o contrato; bug: primeiro um teste que reproduz, depois a correção |

3. **Plano curto ao Leandro** (5 a 10 linhas): o que ela vai ver, arquivos novos e mexidos, o que decidi sozinho.
   Pedido pequeno: faça você mesmo. Pedido com várias frentes: orquestre com agentes `worker-low` (teto no `CLAUDE.md`
   da raiz), cada um com seus arquivos.
4. **Worktree** com o nome do campo 1: `npm run worktree -- <nome> [--material <Pasta>]`. Nunca escreva na árvore principal.
5. **Construir** começando pelo gerador quando houver: `npm run novo -- <tipo> <id>`. Cada item de "O que já vale
   sempre" é requisito: caminho por persistência em todo prêmio, nada que premie pressa, emoji novo = ícone, fala nova =
   texto listado no retorno (quem integra grava e confere com `gravar-vozes` e `validar-vozes`), número do campo 10 em `jogo/js/nucleo/config.js`, comentado.
6. **Conferir** cada passo do campo 5 com `npm run ver` nos aparelhos do campo 12; feche com a skill `validar-tudo`.
   Diferença no `npm run e2e` só a que a novidade explica.
7. **Entregar:**
   - servidor de teste para ele jogar: `npm run servidor-teste -- --fundo`, com o endereço e o PID;
   - as fotos;
   - o "Pronto quando" item a item (feito / não feito / como conferir);
   - quando a novidade usa recurso do aparelho, onde funciona (claude.ai x servidor de casa, campo 12);
   - só atualize o `COMO-USAR.md` se mudar como o Leandro USA o jogo (jogar, área dos pais, dia de atualizar);
     nada de changelog, catálogo nem números — números ajustáveis ficam comentados em `jogo/js/nucleo/config.js`.
8. **Até onde ir:** só o que estiver marcado no campo 15 (no modelo curto, a linha "Até onde ir"). Commit só por quem
   integra, com o campo 15 marcado ou autorização escrita, no estilo `Reino dos Unicórnios: <o que mudou>`. Merge, push e artifact só marcados ou pedidos por escrito. O artifact segue
   `docs/decisoes/seguranca-do-progresso.md`.

Nunca: servidor de casa, artifact publicado, save real, Docker (`docs/contratos/save-e-mescla.md` §9).
