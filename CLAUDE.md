# Regras do projeto

## Testes
- Os testes rodam só no Chrome (Chromium do Playwright), nos tamanhos de celular, tablet e notebook.
- Não rode testes no Firefox nem no Safari/WebKit, nem emulação de iPhone ou iPad com o motor WebKit.

## Agentes
- Até 8 subagentes e workers ao mesmo tempo. Quando um termina e há trabalho independente, outro entra no lugar.
- Se o teto mudar, os agentes que já estavam rodando continuam até terminar.
- Retomar um agente que já terminou conta como lançar um novo.

## Comandos
- Não apague temporários: deixe-os em `/tmp` (o sistema limpa ao reiniciar). Assim nenhum comando para esperando confirmação do Leandro.
- Se precisar apagar, só com o caminho escrito por extenso: `rm -rf /tmp/val1/jogo`. Alvo que só se conhece na hora de rodar faz o Claude Code parar e perguntar.
- Nunca use `rm` com alvo vindo de `$(...)`. Se for inevitável, leia o caminho para uma variável e use guarda:
  `d=$(cat arquivo.txt); rm -rf "${d:?}"`
