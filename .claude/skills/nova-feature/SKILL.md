---
name: nova-feature
description: Use para QUALQUER pedido do Leandro no Reino dos Unicórnios (novidade, ajuste ou correção), no modelo `PEDIDO-DE-FEATURE.md` ou em texto livre (lista, parágrafo, áudio transcrito), para separar em features, completar o pedido, medir o tamanho (P/M/G), escolher a skill ou receita certa e entregar ponta a ponta, até o merge na main e o push, sem perguntar.
---
# Nova feature (entrada de todo pedido)

Modelo: `PEDIDO-DE-FEATURE.md` (raiz). Campo em branco vale o padrão do modelo; "O que já vale sempre" vale em todo
pedido. Não pergunte: o que o pedido não fecha, decida (a opção que recomendaria) e anote "(decidido pelo Claude)".

1. **Texto livre → pedidos no modelo.** Uma feature por pedido quando dá para entregar sem a outra; o que mexe nos
   mesmos arquivos fica junto. Investigue antes de preencher (`docs/ARQUITETURA.md` §5.1, o `CLAUDE.md` da pasta; em
   pedido grande, um `Explore` por feature): onde mora hoje, o que já existe parecido, o nome no código do que o texto
   chama de outro jeito, a pasta em `matérias/` (subpasta `Revisão/` = prova); `npm run ver -- --ir <lugar>` para olhar o lugar. Confira em cada pedido:
   - **Como ela acha** (campo 6): o caminho até a novidade (porta, escada, menu Lugares, botão).
   - **Personagens:** um por linha, `Nome, gênero, idade` (o `npm run plano -- rascunho` lê); sem nome repetido no
     prédio; voz diferente da do Claude e das do prédio, do gênero certo (skill `validar-vozes`).
   - **Recurso do aparelho** (compartilhar, baixar, câmera, vibrar): onde funciona (campo 12; Web Share só em https).
   - **Mecânica escondida:** "sem prédio novo", "em outro andar", "no lugar de X" pedem código novo (campo 2).
   - **O que some:** o que acontece com quem já usava (save antigo, ajuste ligado) (campo 11).
   Mostre os pedidos no chat. Pedidos independentes andam em paralelo (um agente cada), até o teto do `CLAUDE.md` da raiz.
2. **Tamanho e caminho** (anote no relatório):

   | Tamanho | Quando | Como |
   |---|---|---|
   | P | até ~5 arquivos; sem save/progresso/mescla, motor central (laço, cena, câmera, entrada), git/fluxo nem personagem novo com voz | você, ou 1 `worker-low`; sem plano paralelo. Conferência leve: 1 conferente que confere as afirmações, o `git status`, as fotos do `npm run ver` e as diferenças do e2e (não reroda o que o verde por árvore já registrou) |
   | M | o resto, numa frente só | 1 worker + 1 conferente completo (`orquestrar-frentes`, "Quando cada agente volta") |
   | G | várias frentes (prédio + personagem, personagem + voz, tela + conteúdo…) | skill `orquestrar-frentes` (plano paralelo) |

   Assunto: matéria ou salas → `nova-materia`; prova → `nova-prova`; prédio → `novo-predio`; fala ou voz →
   `gravar-vozes`; mecânica, personagem, enfeite, comida, música → `docs/ARQUITETURA.md` §5.1 e
   `docs/receitas/README.md`; ajuste → o `CLAUDE.md` da pasta e o contrato (bug: primeiro o teste que reproduz).
3. **Worktree** com o nome do pedido: `npm run worktree -- <nome> [--material <Pasta>]` (opções: skill `entregar`).
   Grave nela o pedido em `pedidos/AAAA-MM-DD-<nome>.md` (entra no commit).
4. **Construir** pelo gerador quando houver (`npm run novo -- <tipo> <id> --seco`, depois sem `--seco`). "O que já vale
   sempre" é requisito: caminho por persistência em todo prêmio, nada que premie pressa, emoji novo = ícone, fala nova
   = texto exato no retorno, número do campo 10 comentado em `jogo/js/nucleo/config.js`.
5. **Conferir** o campo 5 com `npm run ver` nos aparelhos do campo 12 (conferente pelo tamanho acima); fecho: skill
   `validar-tudo`. Diferença no e2e só a que a novidade explica.
6. **Integrar e entregar:** skill `entregar`, até o push e a conferência da Vercel. Só pare antes se o pedido disser
   ("só servidor de teste"). `COMO-USAR.md` só muda se mudar como o Leandro USA o jogo.
7. **Relatório final** (o único modelo; as outras skills apontam para cá), curto: o que ela vai ver e como acha; o
   "Pronto quando" item a item (feito / não feito / como conferir); tamanho P/M/G; o que você decidiu sozinho; fotos;
   onde o recurso do aparelho funciona; hash da main e a Vercel conferida; servidor de teste para ele jogar
   (`npm run servidor-teste -- --fundo`, endereço e PID).

Progresso da Mariana, banco da Vercel, saves de outros jogadores, servidor de casa, artifact e Docker: intocáveis
(`CLAUDE.md` da raiz; `docs/contratos/save-e-mescla.md` §9).
