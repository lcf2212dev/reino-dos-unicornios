---
name: servidor-de-teste
description: Use para abrir, ver, testar ou tirar print do jogo Reino dos Unicórnios num navegador (Playwright ou manual), sempre no servidor de TESTE com saves sintéticos, nunca no servidor de casa nem no artifact publicado.
---
# Ver o jogo (servidor de teste)

Regras: `jogo/ferramentas/CLAUDE.md`.

1. PRIMEIRO `npm run ver` (na raiz da worktree): sobe servidor de TESTE e banco novos, põe um save sintético,
   vai ao lugar/tela, roda passos e fotografa nos 3 tamanhos em `/tmp/reino-testes/ver/<nome>/` (PNG, `<nome>/erros.txt`,
   `<nome>/estado.json`; sai com código ≠ 0 se houve erro de console). `npm run ver -- --ajuda` lista tudo.
   ```
   npm run ver -- --ir petshop --nome petshop
   npm run ver -- --estrelas 500 --tela loja --tamanhos celular
   npm run ver -- --cuidados fome=5,sede=5 --js 'Reino.UI.telaPetShop()'
   npm run ver -- --tela sala:h1 --passos 'perguntas'
   npm run ver -- --previa interiores:petshop --recorte 0,0,200,150 --ampliar 4
   npm run ver -- --tamanhos celular --passos 'arrastar:100,600,170,600,600,preso'   # thumbstick na foto
   npm run ver -- --tamanhos notebook --passos 'arrastar:600,400,800,400,500,mouse'
   npm run ver -- --passos 'segurar:#hud .btn-album,800'                          # toque longo
   npm run ver -- --tela foto              # prévia da foto recém-tirada
   npm run ver -- --tela album:2           # tira 2 fotos e abre a 2ª grande
   npm run ver -- --tela prova:historia-3bim:5   # questão 5, igual à imagem prova-historia-3bim-q05 do e2e
   ```
   Os gestos (`arrastar`, `segurar`) são de verdade: toque pelo CDP no celular/tablet, mouse no notebook; o
   `tocar` só faz `el.click()`.
2. Em script (várias fotos numa sessão): `abrirCenario()` de `jogo/ferramentas/testes/cenario.js`
   (exemplo no topo do arquivo). Não escreva outro ajudante de Playwright.
3. Só para o que o `ver` não cobre (jogar à mão, sessão longa):
   `npm run servidor-teste` (porta livre ≥ 1024, nunca 80; banco novo em `/tmp/reino-testes/`) e o Chromium de
   `jogo/ferramentas/testes/navegador.js` (`abrir({ url, tamanho, save, query })`), com saves de
   `jogo/ferramentas/testes/saves.js`. Em código: `const { iniciar } = require('./servidor-teste'); const s = await iniciar(); … s.parar();`

Guardas:
- Nunca porta 80, `reinodosunicornios.local`, `localhost` sem porta de teste nem o IP do PC.
- Nunca Firefox, WebKit nem emulação de iPhone/iPad com WebKit.
- Saves só sintéticos; nunca copie o save real. Nunca "Apagar tudo", "Novo ciclo" nem pagamento fora do teste.
- Pare só os seus servidores (Ctrl+C, `s.parar()` ou pelo PID). Nunca `pkill`/`killall` por nome.
- Temporários ficam em `/tmp/reino-testes/`, sem apagar.
