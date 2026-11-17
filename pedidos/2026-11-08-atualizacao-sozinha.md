# 2026-11-08 — Atualização sozinha do jogo (web e app instalado)

Pedido: "Quando eu entro no jogo, pela web, ele não atualiza automaticamente. precisa ficar dando vários reload.
Quando eu instalo ele via navegador, o instalado não atualiza." Tamanho M.

Problema (diagnóstico do Lead, reproduzido no Chromium de teste): a página aberta nunca confere o `sw.js` sozinha
(só reload, `visibilitychange` ou `registration.update()`); quando o service worker novo assume (`controllerchange`), a
aba continua com o index/scripts velhos e o `sistemas/versao.js` só percebia no poll de 10 min (com `cacheMs` de
5,5 min); o reload manual logo depois do deploy ainda serve a versão velha até o SW novo instalar/assumir; e havia a
corrida em que o SW novo assume antes de o `versao.js` iniciar (a marca-base lida já era a nova e a página velha nunca
seria percebida).

Feito (`vercel/montar.js`, `jogo/js/sistemas/versao.js`; contrato em `docs/contratos/cena-e-motor.md` §15):
- REGISTRO do index montado: o listener de `controllerchange` fica no `<head>` (fora do `load`) e guarda
  `tinhaControle`; quando um SW novo assume uma aba que ele já controlava, chama `Reino.Versao.novaVersao()` e, se o
  jogo ainda não entrou (ou o módulo não existe), recarrega na hora — o install do `sw.js` novo termina o núcleo
  inteiro ANTES do `skipWaiting`, então a versão nova já está no cache. O primeiro controle (instalação nova) não
  recarrega. A conferência do `sw.js` (`registration.update()`) agora também acontece ao abrir, quando a aba volta a
  ficar visível e a cada 60 s com a aba visível (sem rate-limit extra).
- `versao.js`: listener de `controllerchange` na avaliação do módulo (guarda `navigator`), flags `controle`/`trocou`
  expostas em `depurar()`, e `V.novaVersao()` público (fase `nova` com `nova = 'serviceworker'`; `false` quando o jogo
  ainda não entrou = quem recarrega é o registro; `true` quando já está a caminho ou desligado). Se a troca aconteceu
  antes de `V.iniciar`, ele cai no fluxo normal (corrida resolvida). O resto do fluxo (parada no mapa, aviso do
  Claude, `P.salvar`, `lembrarEntrada`, reload direto no mapa) e os números de `config.versao` não mudaram.
- Teste novo `unidade/atualizacao-sozinha.navegador.test.js` (app montado + service worker, v2 = v1 com outro
  `index.html`, outro `js/versao.json` e os hashes no `sw.js`): falhava antes (só reload manual; `nova: null`) e
  passa depois. `unidade/montar-lotes.navegador.test.js` ganhou asserções do REGISTRO (conferência periódica e reload).

## Decidido pelo Claude
- `Controllerchange` de primeira instalação não é troca de versão (a página acabou de baixar a mesma versão): só
  conta se a aba já era controlada por um service worker (`tinhaControle`/`controle`), senão a primeira visita de
  cada aparelho mostraria o aviso e recarregaria à toa.
- Na tela de início (jogo ainda não entrou) o reload é imediato, sem aviso: não há progresso em jogo para guardar.
- Sem rate-limit no `registration.update()`: repetir é inofensivo e é o que faz o deploy ser percebido rápido.
- O e2e continua sem service worker e sem fetch de `versao.json`; nenhuma fala, voz, `config.versao` ou
  `jogo/index.html` mudou.
- Dispositivo que ainda esteja rodando a versão anterior desta correção só recebe a correção no primeiro reload
  manual; a partir daí as publicações seguintes já entram sozinhas.
