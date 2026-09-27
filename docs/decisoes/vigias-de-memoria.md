# Vigias de memória e de travamento nos testes

**Data:** 2026-09-27 · **Contexto:** frente do Salão de Beleza "travada" por uma hora; já tinha acontecido antes

## Problema
Um agente passou uma hora sem mudar arquivo, rodando `npm run e2e` de novo e de novo: o Chromium caía ("Target
crashed") ou o tempo estourava. A máquina chegou a 89 GB em uso e 27 GB de swap: cada aba do e2e, que normalmente
fica abaixo de 1 GB, estava com 8 a 17 GB.

A causa estava na ferramenta de teste, não no jogo:
- o `avancar` do e2e (`testes/referencias-pagina.js`) espera os pacotes de voz (`js/voz/*.js`) chegarem, olhando o
  buffer do Resource Timing do navegador;
- esse buffer guarda 250 entradas. A main carregava 248 recursos; a frente do salão passou disso **durante a
  carga**, e os pacotes de voz que chegaram depois nunca entraram no buffer (aumentá-lo depois da carga era tarde);
- o `avancar` então girava até 20 000 voltas a cada passo de 16 ms, e cada volta criava um `MessageChannel` que
  nunca era fechado: gigabytes por minuto, até o Chromium cair;
- de quebra, 12 dos 17 comandos do `package.json` ignoravam `--ajuda`: um agente que pediu a ajuda do e2e rodou o
  e2e inteiro (12 abas) com o defeito.

## Decisão
- `navegador.js` põe, antes da carga de cada página, o buffer em 5000 e uma marca de todo `<script>` que terminou
  (`window.__scriptsProntos`), e guarda o relógio de verdade (`__agoraReal`: no modo congelado `Date` e
  `performance.now` são virtuais). O `avancar` consulta essa marca, usa um canal só e tem teto de tempo por passo:
  pacote que não termina vira erro com o nome dele.
- Vigia dentro de todo teste de navegador (`testes/vigia-memoria.js`): memória por processo, soma e aba sem foto
  nova; ao disparar, diagnóstico, derruba só os processos daquele teste e sai com código 3.
- Hook do Claude Code (`.claude/settings.json` → `fluxo/vigia-travamento.js`), depois de cada ferramenta e a cada
  mensagem: avisa o agente e o Leandro de Chromium de teste inchado, teste rodando há tempo demais, memória livre
  baixa e diagnóstico novo do vigia.
- `--ajuda` em todo comando (`ferramentas/ajuda.js`); e2e e servidor de teste recusam opção desconhecida.
- Skill `investigar-vazamento` e `npm run memoria` (sonda de uma aba) para achar e corrigir o próximo.

## Consequências
- Um vazamento ou uma espera sem fim agora param o teste em segundos ou minutos, com a cena e o motivo, em vez
  de travar o agente e a máquina.
- Os limites são números de ambiente (`REINO_MEMORIA_GB`, `REINO_MEMORIA_TOTAL_GB`, `REINO_TRAVADO_MIN`,
  `REINO_ESPERA_VOZ_MS`, `REINO_VIGIA_TOTAL_GB`, `REINO_VIGIA_TESTE_MIN`); o padrão cobre a máquina de hoje com folga.
- Testes: `unidade/avancar-voz.navegador.test.js` (reprova o `avancar` antigo), `unidade/vigia-memoria.test.js`,
  `unidade/ajuda.test.js`.
