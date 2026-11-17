# Até 4 monstros equipados, e mais com matéria terminada

Pedido do Leandro (17/11/2026), em texto livre:

> E também pode colocar pra equipar no máximo 4 monstros
> E e pra equipar mais do que 4 monstros precisa terminar uma matéria

Tamanho M (campo novo no save, aditivo; regra, desenho e tela dos monstros; sem fala nova).

## O que muda
- Em "Meus monstros", "Levar comigo" põe o monstro no fim da fila e "Deixar em casa" tira só aquele. Ela leva até 4.
- Cada matéria do bimestre de agora terminada (todas as salas feitas) libera mais 1 vaga: com as 6 do 4º bimestre,
  até 10. Sem vaga, o "Levar comigo" fica apagado e o topo diz "com você: 4 de 4. Termine uma matéria para levar mais
  um!".
- Na rua e nas arenas, os monstros andam em fila atrás dela (22 px um do outro, cada um com o coração de amigo), e o ET
  que ela levou vai no fim da fila. Na luta, cada monstro ajuda no seu tempo.
- Save: campo novo `monstrosJuntos` (a fila, `carimbo`); o `monstroCompanheiro` continua com o primeiro da fila, para
  o aparelho com a versão antiga (se ele trocar o monstro depois, o dele vale).

## Decidido pelo Claude
- "Mais do que 4 com uma matéria terminada" virou +1 vaga por matéria (do bimestre de agora: as do 3º bimestre,
  arquivadas, não contam), para cada matéria terminada valer um monstro a mais. Números em `config.monstros.equipar`.
- Se a vaga diminuir (outro aparelho, Novo ciclo), a fila mostra só os primeiros, sem apagar a lista gravada.
- Todos os monstros da fila ajudam na luta, cada um com o seu tempo de ataque.
