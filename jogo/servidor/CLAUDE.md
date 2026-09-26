# jogo/servidor — INTOCÁVEL sem o Leandro

É o servidor de casa: container `reino-unicornios`, porta 80, `reinodosunicornios.local`.
Guarda o progresso REAL da Mariana em `dados/reino.db` (SQLite, com as últimas 50 versões).

## Proibido
- Mudar `servidor.js`, `Dockerfile`, `docker-compose.yml`, `publicar-nome.sh` ou `reino-nome.service`.
- Ler, copiar, gravar ou apagar qualquer coisa em `dados/`.
- `docker compose restart/down/up/build`, mexer no container ou no serviço `reino-nome`.
  Reiniciar é só o Leandro.
- Abrir, chamar ou testar qualquer endereço do servidor de casa.

## Como ele funciona (para não quebrar por fora)
- O container monta a pasta `jogo/` da árvore principal, só leitura: o que entra em `main` é servido na hora.
  Por isso ninguém escreve na árvore principal.
- Entrega só `index.html`, `css/<arquivo>` (sem subpasta) e `js/**`. `index.html` sem cache; o resto, 300 s.
- `/api/progresso` lê e grava o progresso.

## Para testar
- `npm run servidor-teste`: o mesmo `servidor.js` numa porta livre, com banco novo em `/tmp/reino-testes/`.
- Guardas e navegador: `jogo/ferramentas/CLAUDE.md`.
