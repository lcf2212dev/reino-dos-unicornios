# android — regras locais

O app da Play Store (Trusted Web Activity que abre o site da Vercel; guia e publicação: `README.md` desta pasta).
- Nada do jogo mora aqui: o app só aponta para https://reino-dos-unicornios.vercel.app. Mudança no jogo = Vercel.
- Configuração num lugar só: o bloco `twa` de `app/build.gradle`. O `applicationId` nunca muda.
- Ícones (`app/src/main/res/mipmap-*`, `drawable-nodpi/abertura.png`): gerados (`npm run icones`); não edite à mão.
- Chave de envio fora do repositório (~/.config/reino-dos-unicornios/android/): nunca no git, nunca se apaga nem se
  recria por cima. Impressão nova em `vercel/loja/assetlinks.json` só pelo `npm run android -- --impressao`.
- Build só pelo `npm run android` (gradle em `/tmp/reino-testes/android/`); `versao.properties` sobe a cada envio.
