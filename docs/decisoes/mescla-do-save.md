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
- Escolhas (montaria, usando, aparência, cada ajuste, nome de cada unicórnio): por escolha, o carimbo maior em
  `escolhasEm` (P.salvar marca a troca sozinho); sem carimbo ou empate, o lado mais recente. `pago`: o carimbo maior
  em `pagoEm` (P.registrarPagamento), também para menos; sem carimbo ou empate, o maior. Mudança de regra em campos
  existentes autorizada pelo Leandro (27/09/2026) porque a regra do `atualizado` desfazia a escolha feita num
  aparelho quando outro gravava depois (gravação dos cuidados) e o "Já pago" corrigido para menos voltava ao maior.
  Carimbo (e não "vale o mais recente" por campo) porque só a troca de verdade pode vencer: gravar cuidados não é escolha.
- Versão antiga aberta (sem carimbos): a nova insiste uma vez por troca (contada depois de enviada) e depois cede à
  regra de antes; o doc diz de quem veio (`versaoMescla`, e `cedeu` quando o estado já seguiu a regra da antiga), para
  a nova só ceder a quem a segue; senão as duas regras se desfariam em vaivém para sempre com relógios diferentes, ou
  o banco de antes da atualização faria os aparelhos novos cederem entre si (`save-e-mescla.md` §4.8). Preço aceito:
  com a antiga aberta, a escolha e o pago corrigido podem voltar à regra de antes.
- Cópia `mariana-reino-v1-novidades`: devolve o que faltar, com as mesmas regras (`save-e-mescla.md` §5).
- Dinheiro e prêmios nunca são guardados: são derivados das conquistas.

## Consequências
- Mudar uma regra, um campo ou `chaveSave` (`'mariana-reino-v1'`) só com teste novo de dois aparelhos
  (versão antiga e nova num `vm`, como em `jogo/ferramentas/testes/unidade/banho-versao-antiga.test.js`).
- Campo novo: só aditivo (`estadoNovo` + `completar`), com regra de mescla própria e teste.
- Defeito conhecido e NÃO corrigido na refatoração: `P.mesclar` lança erro com save sem `salas`/`unis`
  (`docs/pendencias.md`).
- Testes: `npm run unidade` (save-*.test.js, cuidados-*.test.js, banho*.test.js), saves sintéticos em `vm`.
