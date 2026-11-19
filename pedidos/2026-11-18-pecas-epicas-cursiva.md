# 1. Nome
peças épicas cursiva

# 2. Tipo
[x] Enfeite, comida ou prêmio da Loja (6 peças épicas de aventura, o Conjunto da Pluma)
[x] Mecânica nova (lugar novo no corpo: a calça; conquistar uma peça escrevendo, nas lojas da Vila)

# 3. O que eu quero
Pedido do Leandro (texto original): "Crie uma espada, uma armadura, um capacete, uma calça, uma bota e uma espada.
Tudo épico. A única forma de conseguir é nas lojas que vendem esses itens. Porém, não é com dinheiro nem estrelas.
Deve ser conquistado cada um deles escrevendo 5 frases com letra cursiva, semelhante como é para ganhar uma Pokéball.
Monster Ball."

# 4. Por que
Dar um motivo forte para treinar a letra cursiva no sentido certo: um conjunto épico que nenhuma estrela compra.

# 5. Como a Mariana usa, passo a passo
1. Numa loja de peças da Vila Arco-Íris (Forja Brilhante, Elmos e Chapéus, Armaduras e Botas), depois da pergunta do
   lojista, a aba Comprar abre com a faixa "Peças épicas" no alto: um cartão por peça da Pluma daquela loja, com o
   desenho, o nome, "Épico", os atributos e o botão "✏ Escrever 5 frases". Não tem preço e não entra no carrinho.
2. Ela toca no botão: abre a "Letra cursiva" (a mesma tela da MonsterBall), com 5 frases sorteadas do banco.
3. Com as 5 prontas: "Você escreveu as 5 frases!" e "Pegar a Espada da Pluma" (o nome da peça).
4. A peça vai para a Mochila (cheia: para o baú) e a loja diz "Você conquistou a Espada da Pluma! ✨". O cartão passa a
   dizer "Você já tem! ✨". Ela veste pela Mochila, como qualquer peça.

# 6. Onde fica no reino
Vila Arco-Íris → a loja do tipo da peça → falar com o lojista → aba Comprar, faixa "Peças épicas" no alto.
- Forja Brilhante (Seu Bigorna): Espada da Pluma e Escudo da Pluma.
- Elmos e Chapéus (Madame Plumita): Elmo da Pluma.
- Armaduras e Botas (Capitão Ferrolho): Armadura da Pluma, Calça da Pluma e Botas da Pluma.

# 8. Personagens e falas
Nenhum personagem novo. Só texto na tela (sem voz nova), como o resto das lojas e da letra cursiva.

# 9. Prêmios
As 6 peças, todas épicas (`conteudo/itens/pluma.js`): Espada (Força +9), Escudo (Proteção +3, Vida +2), Elmo
(Proteção +2, Vida +4), Armadura (Vida +9, Proteção +1), Calça (Vida +3, Proteção +1) e Botas (Rapidez +13%).
Caminho por persistência: nenhum erro tira nada; o traço errado só não pinta e ela tenta quantas vezes quiser.

# 10. Números que eu quero poder mudar depois
`Reino.config.cursiva.frasesPorPeca` (5), em `jogo/js/nucleo/config-cursiva.js`. Os atributos, no catálogo.

# 11. O que NÃO pode mudar
A compra e a venda com estrelas das lojas, a MonsterBall pelas 2 frases, o save (nenhum campo novo: as peças são
itens, campo `itens`). Sem calça vestida, o desenho dela sai pixel a pixel o de hoje.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook (mouse). Escrever é com o dedo ou o mouse; Tab/Enter/Esc nos botões.

# 13. Pronto quando
- [ ] cada loja de peças mostra a faixa "Peças épicas" com as peças dela, sem preço
- [ ] "Escrever 5 frases" abre a letra cursiva com 5 frases; prontas, a peça entra na Mochila sem gastar estrela
- [ ] nenhuma das 6 se compra com estrelas, cai de monstro ou se vende
- [ ] a calça tem lugar próprio na Mochila e aparece no desenho dela (a pé e montada), com as outras peças
- [ ] fechar no meio guarda as frases e o ponto onde parou (até recarregar o jogo), por peça
- [ ] quem já tem a peça vê "Você já tem! ✨" (jogou fora: pode conquistar de novo)

# 14. Decisões (do Claude)
- O pedido diz "espada" duas vezes: a 2ª virou o **escudo** (só cabe uma espada na mão, e o escudo era o lugar do
  corpo que faltava para o conjunto ficar completo). Fica na Forja Brilhante, a loja das armas.
- "Calça" não existia: ganhou lugar próprio no corpo (`calca`, o 6º da Mochila), para o conjunto inteiro se vestir
  junto. Fica na loja Armaduras e Botas.
- Nome do conjunto: **da Pluma** (a pena de escrever), em lilás épico, branco e dourado.
- Uma de cada: com a peça na mochila, no baú ou vestida, o cartão diz "Você já tem! ✨" (escrever 5 frases por uma
  peça repetida seria frustrante). Jogou fora: pode conquistar de novo.
- Não se vendem (são conquista, não mercadoria; e escrever não vira fábrica de estrelas).
- O progresso da escrita fica só na memória, por peça, como na MonsterBall (sem campo novo no save).
- Aparelho com a versão antiga do jogo guarda as peças novas sem mostrar (regra de sempre dos itens desconhecidos).

# 15. Até onde ir
Padrão: construir, testar, pôr na main e mandar para o GitHub (a Vercel publica sozinha).
