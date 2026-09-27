# Decisão: plano paralelo (reserva no jogo, plano nas ferramentas)

## Contexto
Até 2026-09-27 um pedido com prédio, personagens e vozes andava em fila: o cenário decidia onde o NPC ficava, o NPC
trazia as falas no mesmo arquivo do visual, e as vozes só eram gravadas depois de tudo. Com o pedido escrito já se
sabe quem são os personagens (nome, gênero, idade) e o que acontece; faltava um contrato que deixasse as frentes
começarem juntas sem pisar umas nas outras, e um jeito de conferir cada uma assim que fica pronta.

## Decisão
1. **Reserva de personagem mora no jogo** (`Reino.reservarPersonagem`, `nucleo/registros.js`; a vaga tracejada em
   `personagens/npcs-reserva.js`). Motivo: o lugar reservado precisa existir na grade do interior (sólido, com o
   tamanho do NPC final), aparecer na tela e nas fotos das frentes e entrar na lista de falas para as vozes serem
   gravadas antes do visual. Só o jogo carregado sabe disso; uma lista nas ferramentas duplicaria o motor e poderia
   divergir. O registro que preenche a reserva dá exatamente o mesmo resultado de antes (as referências do e2e não
   mudam), então não há custo em produção: sem reservas no código, nada muda.
2. **Plano, ondas, estados e pipeline de conferência moram nas ferramentas** (`jogo/ferramentas/fluxo/plano.js`,
   `npm run plano`) e nas skills. Motivo: são sobre o trabalho, não sobre o jogo; nunca chegam no aparelho da
   Mariana, e o `conferir` pega à máquina os conflitos que um plano à mão deixaria passar (arquivo com dois donos,
   dependência que falta, voz esperando visual).
3. **Contrato antes de dividir** (onda 0, só o orquestrador): reservas (`npm run novo -- reserva`), ids de telas e
   ações, arquivo de falas separado (`<p>/personagens-falas.js`). Frentes só leem o contrato; mudar a reserva é
   replanejar.
4. **Plano em arquivo próprio** (`pedidos/<data>-<nome>.plano.json`), não seção do pedido: o pedido é do Leandro, em
   português, e não pode quebrar por uma vírgula; o plano é do orquestrador, lido e conferido por ferramenta.
5. **Conferência em pipeline, sem afrouxar nada**: cada frente tem o seu conferente lançado quando ela termina; a
   integração continua rodando `npm test` e `npm run e2e` inteiros. A reserva sem registro é ERRO no validador; só
   as frentes a rebaixam a aviso (`REINO_RESERVAS_ABERTAS=1`), e o `npm run integrar` apaga essa variável.

## Consequências
- NPC novo com plano passa a ter três arquivos: `<p>/reservas.js` (contrato), `<p>/personagens.js` (visual) e
  `<p>/personagens-falas.js` (falas). Sem plano, o caminho antigo (`novo personagem` com tudo junto) continua valendo.
- Tipos de tarefa novos entram no catálogo `jogo/ferramentas/fluxo/plano-tipos.js` com a conferência deles.
- O que continua em fila, por natureza: gravação das vozes (uma pessoa, rede), integração, troca da base do e2e,
  merge, push e artifact.
- Contrato: `docs/contratos/plano-paralelo.md`.
