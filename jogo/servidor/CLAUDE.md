# jogo/servidor — INTOCÁVEL sem o Leandro

É o servidor de casa: container `reino-unicornios`, porta 80, `reinodosunicornios.local`.
Guarda o progresso REAL da Mariana em `dados/reino.db` (SQLite, com as últimas 50 versões).

## Proibido
- Mudar `servidor.js` (só com pedido do Leandro, e só aditivo), `Dockerfile`, `docker-compose.yml` ou `publicar-nome.sh`.
- Ler, copiar, gravar ou apagar qualquer coisa em `dados/`.
- `docker compose restart/down/up/build`, mexer no container ou no serviço `reino-nome`.
  Reiniciar é só o Leandro.
- Abrir, chamar ou testar qualquer endereço do servidor de casa.

## Como ele funciona (para não quebrar por fora)
- O container monta a pasta `jogo/` da árvore principal, só leitura: o que entra em `main` é servido na hora.
  Por isso ninguém escreve na árvore principal.
- Entrega só `index.html`, `css/<arquivo>` (sem subpasta) e `js/**`. `index.html` sem cache; o resto, 300 s.
- `/api/progresso` lê e grava o progresso da Mariana (linha `'mariana'`; GET/PUT/HEAD, histórico de 50).
- Jogadores (`docs/contratos/save-e-mescla.md` §12; mudança aditiva autorizada pelo Leandro, só carrega quando ELE
  reiniciar o container): tabela `jogadores (login, senha, criado)`, senha em texto.
  - `/api/progresso/<login>` (GET/PUT/HEAD): o mesmo doc na linha `<login>`, com o histórico dele (50);
    login fora de `^[a-z0-9_-]{2,20}$` = 404; PUT de login sem conta na tabela `jogadores` = 404 (o jogo cria a conta
    antes de sincronizar). `/api/progresso/mariana` = a linha dela.
  - Endereço com `%` malformado: 400 (antes derrubava o processo).
  - A conta `'mariana'` (senha `unicorlice77`) é semeada na tabela ao iniciar, com `ON CONFLICT DO NOTHING`: nunca
    sobrescreve a que já existe. O progresso dela não muda de lugar (linha `'mariana'` de `progresso`).
  - `GET /api/jogadores`: os logins (`'mariana'` primeiro). `POST /api/jogadores` `{ login, senha }`: 201 criada,
    409 já existe (ou `'mariana'`), 400 inválido. `POST /api/jogadores/entrar`: 200 certa, 403 senha errada,
    404 não existe (a Mariana confere a linha dela; sem a linha, 200).
  - Toda resposta da API manda `X-Reino-Jogadores: 1`: é por ele que o jogo sabe que o servidor não é o antigo
    (que grava tudo na linha `'mariana'`).

## Para testar
- `npm run servidor-teste`: o mesmo `servidor.js` numa porta livre, com banco novo em `/tmp/reino-testes/`.
- Guardas e navegador: `jogo/ferramentas/CLAUDE.md`.
