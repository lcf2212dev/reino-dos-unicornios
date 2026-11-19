# 1. Nome
bolas pela cursiva

# 2. Tipo
[x] Ajuste da loja dos Treinadores de Monstros (a Mini e a Super também se ganham escrevendo)

# 3. O que eu quero
Pedido do Leandro (texto original): "Crie também uma forma de conseguir a Super Monster Ball sem ser com dinheiro,
escrevendo 3 frases com letra cursiva. E para ganhar a Mini Monster Ball, também adicione a possibilidade de ganhar
sem estrela, apenas escrevendo uma frase em letra cursiva."

# 5. Como a Mariana usa, passo a passo
1. Na loja da Treinadora Kiara, cada cartão de bola tem, embaixo do − e +, "ou" e o botão de escrever dela:
   Mini MonsterBall "✏ Escrever 1 frase", MonsterBall "✏ Escrever 2 frases" (como já era), Super MonsterBall
   "✏ Escrever 3 frases".
2. Abre a "Letra cursiva" com as frases sorteadas; prontas, "Pegar a Super MonsterBall" (o nome da bola).
3. A bola vai para a Mochila (cheia: para o baú), sem gastar estrela: "Você ganhou 1 Super MonsterBall! ✨".

# 6. Onde fica no reino
Vila Arco-Íris → Treinadores de Monstros → falar com a Kiara → o cartão de cada bola.

# 8. Personagens e falas
Nenhum personagem novo. Só texto na tela (sem voz nova).

# 9. Prêmios
1 Mini por 1 frase, 1 MonsterBall por 2, 1 Super por 3. Sem limite por dia; o traço errado só não pinta.

# 10. Números que eu quero poder mudar depois
`Reino.config.cursiva` (`jogo/js/nucleo/config-cursiva.js`): `frasesMini` (1), `frasesPorBola` (2), `frasesSuper` (3).

# 11. O que NÃO pode mudar
A compra com estrelas (preços, desconto, carrinho) e a MonsterBall pelas 2 frases. Nada no save.

# 13. Pronto quando
- [ ] o cartão da Mini tem "Escrever 1 frase" e o da Super, "Escrever 3 frases"; o da MonsterBall continua com 2
- [ ] escrevendo, ganha 1 bola daquele cartão, sem gastar estrela
- [ ] fechar no meio guarda as frases e o ponto onde parou, por bola

# 14. Decisões (do Claude)
- Um botão por cartão, e cada bola guarda as suas frases começadas (dá para parar a Super no meio e fazer a Mini).
- 0 no número de uma bola tira o botão dela (quem quiser desligar).
- O botão de escrever não se desliga com a tela de escrever aberta: pelo teclado, o Esc devolve o foco a ele.
- O número `config.cursiva.bola` (qual bola as 2 frases davam) saiu: agora cada botão dá a bola do cartão dele.
- No celular, o recado "Você ganhou 1 Super MonsterBall!" entra na tela mesmo com ela rolada até o 3º cartão.

# 15. Até onde ir
Padrão: construir, testar, pôr na main e mandar para o GitHub (a Vercel publica sozinha).
