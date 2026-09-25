# Regras do projeto

## Testes
- Os testes rodam só no Chrome (Chromium do Playwright), nos tamanhos de celular, tablet e notebook.
- Não rode testes no Firefox nem no Safari/WebKit, nem emulação de iPhone ou iPad com o motor WebKit.

## Agentes
- Até 16 subagentes e workers ao mesmo tempo. Quando um termina e há trabalho independente, outro entra no lugar.
- Se o teto mudar, os agentes que já estavam rodando continuam até terminar.
- Retomar um agente que já terminou conta como lançar um novo.

## Comandos
- Nunca use `rm` com alvo vindo de `$(...)`. Leia o caminho para uma variável e use guarda:
  `d=$(cat arquivo.txt); rm -rf "${d:?}"`
