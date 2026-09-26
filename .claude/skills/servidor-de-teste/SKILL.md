---
name: servidor-de-teste
description: Use para abrir, ver, testar ou tirar print do jogo Reino dos Unicórnios num navegador (Playwright ou manual), sempre no servidor de TESTE com saves sintéticos, nunca no servidor de casa nem no artifact publicado.
---
# Servidor de teste

Regras: `jogo/ferramentas/CLAUDE.md` e `docs/contratos/README.md` §5.

1. Na raiz da worktree:
   ```
   npm run servidor-teste                      # porta livre > 1024, banco novo em /tmp/reino-testes/
   npm run servidor-teste -- --porta 8801      # porta escolhida (nunca a 80)
   ```
   Ele mostra o endereço: `http://127.0.0.1:<porta>/?debug=1` (determinístico: `&congelar=1`).
2. Navegador: só Chromium do Playwright, pelo `jogo/ferramentas/testes/navegador.js`
   (`abrir({ url, tamanho, save, query })`; tamanhos `celular`, `tablet`, `notebook`). Ele bloqueia toda outra rede.
3. Saves 100% sintéticos: `jogo/ferramentas/testes/saves.js`. Nunca copie o save real.
4. Em código: `const { iniciar } = require('./servidor-teste'); const s = await iniciar(); … s.parar();`

Guardas:
- Nunca porta 80, `reinodosunicornios.local`, `localhost` sem porta de teste nem o IP do PC.
- Nunca Firefox, WebKit nem emulação de iPhone/iPad com WebKit.
- Nunca "Apagar tudo", "Novo ciclo" nem pagamento fora do servidor de teste.
- Pare só os seus servidores (Ctrl+C, `s.parar()` ou pelo PID). Nunca `pkill`/`killall` por nome.
- Temporários ficam em `/tmp/reino-testes/`, sem apagar.
