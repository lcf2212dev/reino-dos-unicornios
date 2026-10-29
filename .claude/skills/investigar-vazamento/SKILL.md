---
name: investigar-vazamento
description: Use no Reino dos Unicórnios quando um teste ou agente parece travado ou a memória explode — aviso "VIGIA DE TRAVAMENTO" do hook, "VIGIA DOS TESTES" (código 3) no e2e/npm test, "pacote de voz não terminou de carregar", "Target crashed"/"Page crashed", Chromium de teste com GBs, e2e ou npm test muito mais lentos que o normal, agente sem mudar arquivo há muito tempo — para achar a causa, derrubar com segurança e corrigir o vazamento.
---
# Investigar vazamento ou travamento

Normal, para comparar: uma aba do jogo fica abaixo de 1 GB; `npm run e2e` completo leva poucos minutos; `npm test`
até ~6 min. Esperando vaga de Chromium não é travamento: a mensagem diz quem ocupa (abaixo).

## 1. Parar o estrago (antes de investigar)
1. Quem é o dono: o aviso do hook traz o PID do teste e a worktree. Se não trouxer:
   `ps -eo pid,ppid,etime,rss,args --sort=-rss | head -20` e `readlink /proc/<pid>/cwd`.
2. Um agente roda naquela worktree? O orquestrador para o agente (TaskStop) antes de mexer nos processos dele.
3. Derrube o comando de teste (o node, não os Chromium um a um) pelo PID: `kill <pid>`. Nunca `pkill`/`killall`.
   Os Chromium e servidores filhos morrem juntos (vigia-pai.js, processo.js); confira com `ps` que sumiram.

4. Nada do progresso, servidor de casa, Docker, artifact: `CLAUDE.md` da raiz.

## 2. Reproduzir pequeno
- Uma aba, medindo passo a passo (heap, nós do DOM, ouvintes, RSS do Chromium):
  `npm run memoria -- --raiz <worktree>/jogo --comparar "/home/leandro/Development/projects/reino-dos-unicornios/jogo"` (a main só é lida).
  `--ir <lugar>`, `--tela <nome>`, `--passos`, `--ms`: os mesmos lugares e telas do `npm run ver`.
- `CRESCE` só na worktree = o vazamento é da mudança dela; nas duas = já estava na main (ou é da ferramenta).
- Travou sem crescer (o `avancar` não volta): é espera sem fim. O e2e tem teto: "pacote de voz não terminou de
  carregar em 20 s: <arquivo>" diz qual pacote.
- Achar a cena: `npm run e2e -- --cenas '<regex>' --paralelo 1 --tamanhos celular`. Ao disparar, o vigia lista a cena de
  cada aba (também em `/tmp/reino-testes/vigia/`).

## 3. Causas já vistas
| Sintoma | Causa | Correção |
|---|---|---|
| Chromium de teste a 10–17 GB, "Target crashed", e2e sem fim quando entram scripts novos | O buffer do Resource Timing (250) enchia na carga; o `avancar` esperava para sempre um pacote de voz "sumido" e abria um `MessageChannel` por volta | Corrigido na ferramenta (2026-09-27): `navegador.js` marca os scripts antes da carga e o `avancar` tem teto e um canal só |
| `npm run ver`/cenário parado sem gastar memória | `--js`/`js:` esperando uma Promise do jogo congelado (ex.: `Reino.Cena.sair()`) | `void <código>` + `esperar:<ms>`; a espera tem teto de 15 s com mensagem (`jogo/ferramentas/CLAUDE.md`) |
| Ferramenta roda de verdade ao pedir ajuda | `--ajuda` ignorado | Todo comando do package.json responde a `--ajuda` (`ferramentas/ajuda.js`) |
| Heap sobe a cada quadro | cache cuja chave muda sempre (hora, `Math.random`, objeto na chave); `canvas` novo por quadro guardado numa lista | chave estável; criar uma vez e reusar |
| Ouvintes ou nós do DOM sobem ao abrir e fechar telas | `addEventListener` sem remover; tela fechada ainda referenciada | remover no fechar; não guardar o elemento |
| Memória sobe devagar e não volta | `setInterval`/`requestAnimationFrame` que não para; `MessagePort` sem `close()` | parar no fim; fechar o canal |

## 4. Corrigir e provar
1. Corrija na worktree da frente (ou numa worktree de ferramenta, se o defeito é do teste) e ponha um teste que
   pegaria o defeito de novo (ex.: `unidade/vigia-memoria.test.js`, `unidade/avancar-voz.navegador.test.js`).
2. `npm run memoria` de novo: `estável`. Depois a skill `validar-tudo`; o vigia fica ligado em todo teste de navegador.
3. No relatório: causa, prova (antes e depois da sonda) e o que ficou para evitar a volta.

## Vagas e lotes
- Todo Chromium de teste pega uma vaga (`testes/vagas.js`, sempre em `/tmp/reino-testes/vagas/`), dividida entre
  as worktrees: `REINO_VAGAS_CHROMIUM` (padrão metade das CPUs, até 16); quem espera há `REINO_VAGAS_ESPERA_MS`
  (60 s) usa a reserva `REINO_VAGAS_EXTRA` (4). Esperando, avisa quem ocupa (a cada 30 s); teste de unidade espera
  até 90 s e falha com "✘ sem vaga de Chromium há N s". Dono morto libera a vaga sozinho.
- A fila mapa + interiores do e2e vai em lotes (`REINO_LOTES_MAPA`, padrão 3); `REINO_TEMPOS=1` mostra o tempo de cada grupo.

## Os vigias
Limites e variáveis: `jogo/ferramentas/CLAUDE.md` ("Testes que não travam"). O porquê: `docs/decisoes/vigias-de-memoria.md`.
