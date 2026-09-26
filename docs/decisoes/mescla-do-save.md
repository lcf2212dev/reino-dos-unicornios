# Decisão: as regras de `P.mesclar` não mudam sem teste

Para que serve: resume as regras da mescla do save e diz por que mexer nelas é perigoso. Regra completa:
`docs/contratos/save-e-mescla.md` §4–§7. Código: `jogo/js/sistemas/progresso-mescla.js`.

## Contexto
- O mesmo save da Mariana é gravado por vários aparelhos, várias abas e duas nuvens (servidor de casa e
  claude.ai), às vezes por uma versão ANTIGA do jogo aberta numa aba esquecida.
- `Reino.Progresso.mesclar` (P.mesclar) junta dois estados. Uma regra errada apaga conquista, comida ou
  enfeite de verdade, e o erro se espalha na próxima sincronização.

## Decisão (regras vigentes)
- Geração diferente: vence o estado inteiro da geração maior ("Apagar tudo" sobe a geração).
- Mesma geração: a base é o lado com `atualizado` maior; o outro lado soma por cima.
- Ciclo diferente ("Novo ciclo"): salas, treinos e pagamentos vêm do ciclo mais novo.
- Conquistas (salas, treinos, provas, unicórnios, loja): união, com o melhor de cada lado (maior nota, mais
  tentativas, melhor prêmio, maior XP, primeira data).
- `estrelas`: maior `ganhas` e maior `gastas`; valor estragado conta 0 (`numeroOu`).
- `cuidados`: por campo, vence o lado com o carimbo maior (`acaoFome`, `acaoSede`; na falta, `acao`);
  empate = o menor valor; sem carimbo num lado = o registro do `em` maior. `acao: 0` é carimbo (não "vazio").
- Banho: carimbo próprio `acaoBanho`, fora do `acao`; só um lado com `banho` = vale esse lado.
- `despensa`: maior `compradas` e maior `usadas`, por comida.
- Lado sem o campo (aparelho antigo): vale o outro lado inteiro.
- `ajustes` do lado mais recente; `surpresa` pelo carimbo `surpresaEm`.
- Cópia `mariana-reino-v1-novidades`: devolve o que faltar, com as mesmas regras (`save-e-mescla.md` §5).
- Dinheiro e prêmios nunca são guardados: são derivados das conquistas.

## Consequências
- Mudar uma regra, um campo ou `chaveSave` (`'mariana-reino-v1'`) só com teste novo de dois aparelhos
  (versão antiga e nova num `vm`, como em `jogo/ferramentas/testes/unidade/banho-versao-antiga.test.js`).
- Campo novo: só aditivo (`estadoNovo` + `completar`), com regra de mescla própria e teste.
- Defeito conhecido e NÃO corrigido na refatoração: `P.mesclar` lança erro com save sem `salas`/`unis`
  (`docs/pendencias.md`).
- Testes: `npm run unidade` (save-*.test.js, cuidados-*.test.js, banho*.test.js), saves sintéticos em `vm`.
