# android — regras locais

O app da Play Store (uma WebView própria, `MainActivity.java`, que abre o site da Vercel dentro do app; guia e
publicação: `README.md` desta pasta). Não depende do Chrome: o Family Link pode deixar só ele liberado.
- Nada do jogo mora aqui: o app só aponta para https://reino-dos-unicornios.vercel.app. Mudança no jogo = Vercel.
- Configuração num lugar só: o bloco `twa` de `app/build.gradle`. O `applicationId` nunca muda.
- Ícones (`app/src/main/res/mipmap-*`, `drawable-nodpi/abertura.png`): gerados (`npm run icones`); não edite à mão.
- Chave de envio fora do repositório (~/.config/reino-dos-unicornios/android/): nunca no git, nunca se apaga nem se
  recria por cima. Impressão nova em `vercel/loja/assetlinks.json` só pelo `npm run android -- --impressao`.
- Build só pelo `npm run android` (gradle em `/tmp/reino-testes/android/`); `versao.properties` sobe a cada envio.
