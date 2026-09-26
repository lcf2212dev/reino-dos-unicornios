# jogo/js/sistemas — regras locais

Contratos: `docs/contratos/save-e-mescla.md`, `cuidados.md`, `surpresa.md`, `som-musica-e-voz.md`, `fotos.md`.

## Save: cuidado máximo
- O save é o progresso da Mariana. Um erro aqui apaga estrelas, unicórnios ou comida dela.
- `progresso.js` (estado, carregar/salvar, cópia `-novidades`), `progresso-mescla.js` (`P.mesclar`),
  `progresso-nuvem.js` (servidor de casa e claude.ai), `progresso-regras.js` (dinheiro, estrelas, salas…).
  Dividem `Reino._progresso`: leia sempre `I.estado` (carregar, mesclar e "Apagar tudo" trocam o objeto).
- Nunca mudam: `chaveSave` (`'mariana-reino-v1'`), `v`, `geracao`, `ciclo`, o formato dos campos existentes
  e as regras de `P.mesclar` para eles.
- Campo novo só aditivo: `estadoNovo()` + `completar()` + regra de mescla própria + teste com dois aparelhos
  (versão antiga e nova).
- Dinheiro e prêmios são DERIVADOS das conquistas, nunca guardados soltos. Fotos nunca no save.
- Não mexa na chave `mariana-reino-v1-novidades` sem ler `save-e-mescla.md` §5.

## Sistema novo
- `Reino.registrarModulo` no fim do arquivo (receita `docs/receitas/sistema-novo.md`); não edite `motor/main.js`, `motor/laco.js`, `falas.js` nem `debug.js`.

## Outros sistemas
- `cuidados.js` (fome, sede, banho, despensa), `banho.js` + `banho-desenho.js`, `surpresa*.js`, `fotos*.js`.
- `versao.js`: percebe o jogo novo no servidor de casa (`js/versao.json`, `npm run versao`) e, parada no mapa, avisa,
  grava e recarrega a aba sozinho (`docs/contratos/cena-e-motor.md` §15). Desligado no artifact, em `file:` e no
  modo congelado (a menos de `&versao=1`). Nunca recarregue sem `P.salvar()` antes.
- `som*.js` (efeitos sintetizados), `musicas*.js` (música por ambiente), `voz.js` (toca áudios gravados).
- `falas.js`: tudo o que o jogo fala. Voz pelo TEXTO EXATO; texto novo precisa de `npm run vozes`.
- `banho.js` e `banho-desenho.js` não tocam em DOM no carregamento (mesmo sem `node: true`).

## Antes de entregar
- `npm test` (unidade: `save-*.test.js`, `cuidados-*`, `banho*`, `surpresa`, `musicas`).
- `node jogo/ferramentas/testes/testar-save.js` e `testar-banho.js`.
- Tudo com saves sintéticos (`jogo/ferramentas/testes/saves.js`). Nunca o save real.
