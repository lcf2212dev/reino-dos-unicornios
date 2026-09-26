# Decisão: limites de tamanho e divisão em arquivos

Para que serve: explica os limites de linhas e como um arquivo grande é dividido sem mudar a API.

## Contexto
- Arquivos de 1 000 a 6 000 linhas obrigavam a IA a ler muito para mudar pouco.
- Um IIFE grande tinha funções privadas usadas por todo o arquivo.

## Decisão
- Limites (`npm run tamanho`, `jogo/ferramentas/tamanho.js`): código ≤ 420 linhas (alvo ~400), dados ≤ 800
  (conteúdo, ícones, falas, elenco, moldes, faixas), gerados sem limite. Exceção só temporária e com motivo.
- Divisão por responsabilidade, em arquivos que carregam em sequência (ex.: `jogo/js/sistemas/progresso.js`,
  `progresso-mescla.js`, `progresso-nuvem.js`, `progresso-regras.js`).
- O que era privado e as partes dividem vai para um objeto INTERNO criado pela 1ª parte e documentado no
  cabeçalho dela: `Reino._motor`, `Reino._cena`, `Reino._interiores`, `Reino._predios.<prédio>`,
  `Reino._npcs`, `Reino._progresso`, `Reino._som`, `Reino._musicas`, `Reino._ui`, `Reino._desafios`,
  `Reino._banho`, `Reino._fotos`, `Reino._surpresa`, `Reino._jogador`, `PA._interno`, `Mapa._interno`.
- A API pública não muda: `Reino.*`, `Mapa`, `Jogador`, `PA`, `window.__reino`.
- Helpers de desenho idênticos têm uma implementação só (`jogo/js/arte/desenho.js`); helpers com constantes
  diferentes continuam separados (o pixel tem que sair igual).

## Consequências
- Cada parte diz no cabeçalho de onde veio, o que registra e o que lê do interno.
- Interno não é API: ninguém de fora do grupo de arquivos usa.
- Ler estado compartilhado sempre na hora (ex.: `I.estado` do progresso é trocado pela mescla).
- Tabela completa em `docs/ARQUITETURA.md` §7.
