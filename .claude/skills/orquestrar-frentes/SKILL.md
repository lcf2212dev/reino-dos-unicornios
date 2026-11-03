---
name: orquestrar-frentes
description: Use no Reino dos Unicórnios quando o pedido é tamanho G (várias frentes: várias features, um plano com pacotes, uma matéria com muitas salas), para fazer o plano paralelo, dividir com posse de arquivos, escrever briefings curtos, lançar os workers e conferir cada um em pipeline. Pedido P ou M: `nova-feature`.
---
# Orquestrar frentes (plano paralelo)

Para quem coordena. As regras fixas de toda frente estão em `docs/contratos/frente.md` (os presets globais não conhecem o projeto):
todo briefing começa mandando ler esse arquivo; depois só diz o que é da frente. Contrato: `docs/contratos/plano-paralelo.md`. Parta dos pedidos prontos (skill `nova-feature`).

## Plano
1. **Rascunho:** `npm run plano -- rascunho pedidos/<data>-<nome>.md --saida pedidos/<data>-<nome>.plano.json`.
   Complete: vaga (`predio`, `x`, `y`) de cada personagem, arquivos exatos de cada tarefa, dependências REAIS.
2. **Conferir:** `npm run plano -- conferir <plano>` até ✔; `npm run plano -- ondas <plano> --mermaid` vai no relatório.
3. **Onda 0, contrato (você):** `npm run plano -- reservas <plano>` imprime um `npm run novo -- reserva …` por
   personagem; rode na worktree da feature, mais os ids de telas/ações compartilhados; `npm run vozes-elenco` limpo.
   Commit do contrato na branch da feature; as frentes nascem dele (`npm run worktree -- <tema> --base feat/<nome>`).
4. **Lançar pelo estado:** `npm run plano -- proximas <plano>` → para cada uma, `npm run plano -- briefing <plano>
   <tarefa>` → worker; `marcar … lancada`. Frente com reserva de personagem testa com `REINO_RESERVAS_ABERTAS=1`.
5. **Pipeline:** voltou → `marcar … feita` → conferente NA HORA (`npm run plano -- conferente <plano> <tarefa>`) →
   `aprovada` (libera as seguintes) ou `reprovada` (volta à mesma frente). Tarefa `falas` aprovada: grave as vozes na
   worktree dela (`validar-vozes`, `gravar-vozes`) enquanto o resto segue.
6. Integração quando `proximas` diz "pode integrar": skill `entregar`.

## Dividir
- **Posse:** cada arquivo é de UMA frente. Disputados ficam com você: `package.json`, `CLAUDE.md`, `COMO-USAR.md`,
  `docs/ARQUITETURA.md`, `tipos*.d.ts`/`tipos.json`, `.gitignore`, `base-referencia.txt`. Manifesto e `index.html`:
  o worker pode pôr as linhas dele na worktree e cita no retorno; quem integra junta.
- **Worktree:** uma por frente que roda navegador; frentes só de texto ou dados podem dividir uma, com prefixo de id
  e arquivo de falas próprios.
- **Teto:** o do `CLAUDE.md` da raiz; terminou um e há trabalho independente, outro entra.
- **Quem executa (presets globais):** frente comum (conteúdo, salas, arte) → `builder` (sonnet/medium); delicada
  (save/mescla, git/fluxo, motor central) → `builder` com `model: opus, effort: high`; bug sem causa óbvia → `debugger`;
  edição mecânica → `runner`; testes → `tester`; docs → `writer`; conferente → `reviewer` (só lê e roda comandos).

## Briefing (o `plano briefing` monta; à mão, os mesmos campos)
```
Leia antes: docs/contratos/frente.md
Tarefa: <2 a 5 linhas>
Worktree: /home/leandro/Development/projects/reino-<tema> (branch feat/<tema>)
Arquivos seus: <lista exata>        Prefixo de id: <nasa->        Arquivo de falas: <…/nasa-falas.js>
Gerador: <npm run novo -- … (comece por ele, com --seco)>
Modelo: <arquivo pronto para copiar o formato>
Ler (§): <contrato.md §N, receita, o pedido> (só as seções citadas)
Testes focados: <npm run unidade -- --so '<x>'; npm run e2e -- --mudancas> (no fim, uma vez: npm test)
Pronto quando: <itens conferíveis>
Diferença esperada no e2e: <regex das imagens, ou "idêntico">
```

## Quando cada agente volta (o conferente)
Subagent que não fez o trabalho: só lê e roda comandos, sem editar nem commit. Leva a worktree, o pedido, o retorno
do worker e a lista de arquivos. Confere:
1. **Afirmações:** reabrindo o arquivo ou rodando o comando (`npm test`, `npm run e2e`, uma vez; árvore já verde
   sai na hora).
2. **Jogo:** o "Pronto quando" item a item nas fotos e com `npm run ver` nos 3 tamanhos; teclado.
3. **e2e:** cada diferença explicada pela feature; o resto é defeito.
4. **Posse:** `git status` sem arquivo fora da lista.
5. **Processos:** `ps -eo pid,args | grep reino-<tema>`; derruba só os seus, pelo PID (nunca `pkill`/`killall`).
Retorno: aprovado / com ressalvas / reprovado, defeitos com arquivo:linha e foto. Defeito volta à frente que fez e
passa por outra conferência. Nomes e vozes repetidos entre frentes: `npm run vozes-elenco` depois de juntar.
