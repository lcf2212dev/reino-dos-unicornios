# 1. Nome
treinadores

# 2. Tipo
[x] Prédio novo (Treinadores de Monstros, num terreno livre da Vila Arco-Íris)
[x] Personagem novo (a lojista)
[x] Mecânica nova (MonsterBall, capturar monstros, monstro que segue e ajuda na luta)
[x] Ajuste (bosques de dentro do Bosque dos Fantasmas mais fortes)

# 3. O que eu quero
Pedido do Leandro (texto original): "Na cidade nova, em algum terreno vazio, crie uma construção "Treinadores de
Monstros". Lá poderá comprar `MonsterBalls`, que pode ser utilizada para tentar capturar um monstro do jogo. Cada
`MonsterBall`, deve custar 50 estrelas e tem a chance de 40% de conquistar ao ser utilizada.
Ao ser conquistado, o monstro poderá ser equipado, e ficará seguindo a Mariana. Deve ser permitido apenas 1 por vez
equipado. Hoje ela está equipada com um alienígena. Se ela equipar um monstro, então fica somente o monstro, sem o
alienígena.
Os monstros ajudam Mariana a atacar nos inimigos. Deixe os 3 bosques que têm portal dentro do bosque dos fantasmas,
com os bixos mais forte. Está muito fácil para Mariana."

# 4. Por que
Um motivo novo para voltar às arenas (colecionar monstros) e um desafio de verdade nos bosques mais altos.

# 5. Como a Mariana usa, passo a passo
1. Na Vila Arco-Íris (a "cidade nova"), o terreno livre da direita (31, 12) virou o prédio "Treinadores de Monstros",
   com letreiro e porta. (decidido pelo Claude: o terreno da direita, perto da praça)
2. Dentro, a Treinadora Kiara atrás do balcão, com prateleiras de MonsterBalls e uma estante de monstros. Como nos
   outros lojistas da Vila, para conversar ela responde certo uma pergunta do 4º bimestre. (decidido pelo Claude)
3. A Kiara oferece: "Comprar MonsterBalls" (50 ⭐ cada, carrinho com − e +, vão para a mochila) e "Meus monstros".
4. Na arena (Bosque dos Fantasmas e todos os bosques e mapas de luta), com MonsterBall na mochila, aparece um botão
   da bola perto da espada. Ela joga a bola no monstro mais perto (até `alcanceBola`): a bola voa, balança e
   - 40%: "Pegou!" — o monstro some como vencido (sem XP e sem item: o prêmio é o monstro) e entra na coleção;
   - 60%: "Escapou!" — a bola some, o monstro continua.
   Gasta 1 MonsterBall por jogada. Sem monstro perto, o botão fica apagado (nada se gasta).
5. "Meus monstros" (na loja da Kiara e no botão da mochila): cada monstro capturado, com desenho, nome, de onde veio
   e quantos. "Levar comigo" equipa (só 1); "Deixar em casa" tira. Equipar um monstro tira o ET; escolher o ET no
   álbum tira o monstro. (decidido pelo Claude: a mochila também abre a tela)
6. O monstro equipado anda atrás dela (no mapa, nos prédios e nas arenas), no lugar do ET.
7. Nas arenas ele ajuda: a cada `ajuda.recargaMs` pula no inimigo mais perto (até `ajuda.alcance`) e tira uma fração
   do dano da espada dela (mais forte o tipo e mais alta a arena de onde veio). O inimigo que ele vence conta como
   vencido por ela (XP, pergunta, drop), como se fosse a espada.
8. Os Bosques do Orvalho, da Neblina e da Lua Cheia (os portais dentro do Bosque dos Fantasmas) ficam mais fortes:
   vida ×2, força ×1,6, velocidade ×1,15, visão +16 e um inimigo a mais de cada tipo (o voador fica 3); XP ×1,25.

# 6. Onde fica no reino
Vila Arco-Íris (portal no Bosque dos Fantasmas ou Teleportadora da praça), terreno da direita. Interior
`vila-treinadores`.

# 8. Personagens e falas
Treinadora Kiara, mulher, jovem. Animada, fala de aventura e de cuidar bem dos monstrinhos. Textos: escreve o Claude.
Voz nova: o Claude escolhe e confere.

# 9. Prêmios
O monstro capturado. Caminho por persistência: 40% a cada bola, sem limite de tentativas; estrelas se ganham nas
salas e nas arenas. Nada premia pressa.

# 10. Números que eu quero poder mudar depois
`Reino.config.monstros` (`jogo/js/nucleo/config-monstros.js`): preço (50), chance (0,4), alcance e recarga da bola,
distância do monstro que segue, alcance, recarga e força da ajuda. Força dos bosques: `config.arenas.orvalho|neblina|lua`.

# 11. O que NÃO pode mudar
O ET continua no álbum (a amizade não some); o save antigo abre igual (sem monstro, o ET de antes continua com ela).
Progresso da Mariana intocável.

# Acréscimo (pedido do Leandro, mesmo dia)
"adicione também a Super MonsterBall que custará 125 e terá 100% de chance de captura."
Item `bola-super` (125 ⭐, `config.monstros.precoSuper`; chance `chanceSuper` = 1). Na loja da Kiara, um segundo cartão;
na arena, um segundo botão (borda dourada), só quando ela tem Super na mochila. (decidido pelo Claude)

# Acréscimo 2 (pedido do Leandro, mesmo dia)
"Só deve ser possível comprar a MonsterBall depois de completar 16 salas de matemática. Só deve ser possível comprar a
Super MonsterBall depois de completar as 32 salas de matemática."
A matéria é a Matemática do Dia a Dia (`matematica4`, 32 salas). `config.monstros.libera: { materia, bola: 16, super: 32 }`.
Na loja, a bola trancada fica com o cartão apagado: "Abre com 16 salas de Matemática feitas. Você fez N." Jogar a bola
que ela já tem continua livre. (decidido pelo Claude)

# Acréscimo 3 (pedido do Leandro, mesmo dia)
"Adicione uma Mini MonsterBall, que desbloqueia com 5 salas de matemática feitas, custa 25 estrelas e têm 20% de chance."
Item `bola-mini` (`config.monstros.precoMini` 25, `chanceMini` 0,2, `libera.mini` 5). Na loja, o primeiro cartão (borda
azul); na arena, um botão à esquerda do da MonsterBall, só quando ela tem Mini na mochila. (decidido pelo Claude)

# Acréscimo 4 (pedido do Leandro, mesmo dia)
"não precisa condicionar as pokebolas às salas. porém se fizer 5 salas, elas ficam 10% mais baratas, se fizer 16 ficam
25% mais baratas e se fizer 32 ficam 50% mais baratas."
Sem trava: as três bolas sempre à venda. `config.monstros.desconto` (Matemática do Dia a Dia): 5 → 10%, 16 → 25%,
32 → 50%, preço arredondado (Mini 25/23/19/13, MonsterBall 50/45/38/25, Super 125/113/94/63). Na loja, o preço cheio
riscado e a frase do desconto de agora e do próximo. (decidido pelo Claude: arredondar para o inteiro mais perto)
