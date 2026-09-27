---
name: orquestrar-frentes
description: Use no Reino dos Unicórnios quando o trabalho for grande o bastante para vários agentes (várias features, um plano com pacotes, uma matéria com muitas salas), para dividir em frentes com propriedade de arquivos, escrever briefings curtos, lançar os workers e conferir cada um na volta. Para um pedido só, use `nova-feature`.
---
# Orquestrar frentes

Para quem coordena. Os workers (`.claude/agents/worker-low.md`) já trazem as regras fixas; o briefing só diz o que é
da frente.

## Dividir
1. Parta do pedido pronto (skills `preparar-pedido` e `nova-feature`) ou do plano.
2. **Propriedade de arquivos:** cada arquivo pertence a UMA frente. Os disputados ficam com o orquestrador:
   `package.json`, `CLAUDE.md`, `jogo/js/manifesto.js` e `jogo/index.html`, `COMO-USAR.md`, `docs/ARQUITETURA.md`,
   `tipos*.d.ts`/`tipos.json`, `.gitignore`, `jogo/ferramentas/testes/base-referencia.txt`. O worker cita no retorno
   a linha que precisa; você integra.
3. **Worktree:** uma por frente quando a frente roda navegador (e2e, `npm run ver`). Frentes só de texto ou de dados
   podem dividir uma worktree, com prefixo de id e arquivo de falas próprios.
4. **Teto:** o do `CLAUDE.md` da raiz. Quando um termina e há trabalho independente, outro entra.
5. **Effort:** `worker-low` nas frentes comuns (conteúdo, salas, arte, docs). Effort maior nas delicadas:
   save/progresso e mescla, git, motor central (laço, cena, câmera, entrada).

## Briefing (curto)
```
Tarefa: <o que fazer, 2 a 5 linhas>
Worktree: /home/leandro/reino-<tema> (branch feat/<tema>)
Arquivos seus: <lista exata; pastas só se forem novas>
Prefixo de id: <ex.: nasa->
Arquivo de falas: <ex.: jogo/js/interiores/observatorio/nasa-falas.js>
Pode ler: <contratos, receitas, arquivos de referência>
Pronto quando: <itens conferíveis>
Diferença esperada no e2e: <cenas/imagens que podem mudar, ou "idêntico">
```

## Quando cada agente volta
A conferência vai para um subagent conferente (regra do `CLAUDE.md` da raiz), lançado assim que a frente termina,
sem esperar as outras. Ele não fez o trabalho, não edita nem faz commit: só lê e roda comandos. O briefing leva a
worktree, o pedido, o retorno do worker (as afirmações a conferir) e a lista de arquivos da frente. Ele confere:
1. **Afirmações:** reabrindo o arquivo ou rodando o comando (`npm test`, `npm run e2e` uma vez). Já houve agente
   afirmando errado que `npm test` não roda os testes de navegador.
2. **Fotos e jogo:** o "Pronto quando" do pedido, item a item, nas fotos e com `npm run ver` nos 3 tamanhos; teclado.
3. **Diferenças no e2e:** cada uma explicada pela feature; o resto é defeito.
4. **Arquivos fora da propriedade:** `git status` na worktree.
5. **Processos presos:** `ps -eo pid,args | grep reino-<tema>`; derruba só os seus, pelo PID (nunca `pkill`/`killall`).

Retorno: veredito (aprovado / com ressalvas / reprovado) e defeitos com arquivo:linha e foto. Defeito volta para a
frente que fez (retomada dela) e passa por outra conferência. Com você fica: nomes e vozes repetidos entre frentes
(`npm run vozes-elenco` depois de juntar os personagens) e a integração, só com as worktrees paradas (nenhum agente
rodando nelas), fechada pela skill `validar-tudo`.

## Falas e vozes
Workers não gravam. Na integração: skill `gravar-vozes` e, com personagem novo ou perfil trocado, `validar-vozes`.

## Entrega e artifact
Integração e entrega, até o merge na main, o push e o artifact, sem perguntar: skill `entregar` (artifact pela
skill `publicar-artifact`).
