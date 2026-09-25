# Regras do projeto

## Testes
- Os testes rodam só no Chrome (Chromium do Playwright), nos tamanhos de celular, tablet e notebook.
- Não rode testes no Firefox nem no Safari/WebKit, nem emulação de iPhone ou iPad com o motor WebKit.

## Agentes
- No máximo 8 subagentes e workers ao mesmo tempo.
- Quando o teto baixar, os agentes que já estavam rodando continuam até terminar. Nenhum novo é lançado enquanto houver 8 ou mais ativos.
- Retomar um agente que já terminou conta como lançar um novo.
