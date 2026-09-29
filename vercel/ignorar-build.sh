#!/bin/sh
# "Ignored Build Step" da Vercel (ignoreCommand do vercel.json), no deploy que a integração com o GitHub dispara a
# cada push. Sai 0 = não publica; sai 1 = publica. Roda em vercel/ (a pasta raiz do projeto), com o clone raso do repo.
# 1. Só produção (a main): preview nunca, porque as variáveis do banco (saves reais) valem também em preview.
# 2. Só quando o jogo muda desde a última publicação da main (VERCEL_GIT_PREVIOUS_SHA): index.html, css/, js/, o
#    gerar-versao.js que o build usa e o próprio vercel/. Push só de docs ou ferramentas não publica (CLAUDE.md da raiz).
# Na dúvida (sem publicação anterior, commit fora do clone raso), publica.
if [ "$VERCEL_ENV" != "production" ]; then
  echo "ignorado: $VERCEL_ENV não é produção"
  exit 0
fi
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "publica: sem publicação anterior pelo Git"
  exit 1
fi
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- ../jogo/index.html ../jogo/css ../jogo/js \
  ../jogo/ferramentas/gerar-versao.js ../jogo/ferramentas/ajuda.js .
case $? in
  0) echo "ignorado: o jogo não mudou desde $VERCEL_GIT_PREVIOUS_SHA"; exit 0 ;;
  1) echo "publica: o jogo mudou desde $VERCEL_GIT_PREVIOUS_SHA"; exit 1 ;;
  *) echo "publica: não deu para comparar com $VERCEL_GIT_PREVIOUS_SHA"; exit 1 ;;
esac
