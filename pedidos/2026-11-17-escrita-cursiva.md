# 1. Nome
escrita cursiva

# 2. Tipo
[x] Mecânica nova (escrever em letra cursiva, com o traçado no sentido certo)
[x] Ajuste da loja dos Treinadores de Monstros (outra forma de pagar a MonsterBall)

# 3. O que eu quero
Pedido do Leandro (texto original): "Mariana tem bastante dificuldade com letras cursivas. Uma coisa que eu observei
nela é vendo ela escrever as letras cursivas é que ela às vezes faz o tracejado ao contrário, sabe? Não faz o
tracejado pelo caminho correto. Então, eu quero que na loja que vende as Monster Balls, que ela escreva cursiva 2
frases para ganhar uma Monster Ball que tem 40% de chance de captura. Escreva várias frases e quando ela for pegar essa
Monster Ball, que sorteie 2 destas frases e dê a opção para ela, né? De ela pagar com dinheiro ou fazer as 2 frases
cursiva. É o que eu quero, que para essas frases cursivas que bloqueie o caminho incorreto. Por exemplo, quando for
escrever o A, se ela começar para baixo, que bloqueie, que ela comece escrevendo para cima, né? Do jeito correto que é
para escrever, para ela ir pegando o jeito."

# 4. Por que
Treinar o sentido certo do traço da letra cursiva (onde começa, para onde gira), que ela faz ao contrário.

# 5. Como a Mariana usa, passo a passo
1. Na loja da Treinadora Kiara (Treinadores de Monstros, Vila Arco-Íris), no cartão da MonsterBall, embaixo do − e +:
   "ou" e "✏ Escrever 2 frases". (decidido pelo Claude: dentro do cartão da MonsterBall, a bola de 40%)
2. Abre "Letra cursiva": "Frase 1 de 2", a frase em letra de forma, a frase pequena em cursiva e, no papel com pauta
   de caderno de caligrafia, a palavra da vez grande e tracejada, com a bolinha verde onde começa e setinhas.
3. Ela escreve com o dedo (ou o mouse) por cima do tracejado. Só pinta seguindo o caminho, no sentido certo:
   começar para baixo no "a", girar ao contrário, voltar, pular ou tocar longe da bolinha não pinta; a setinha fica
   vermelha e a dica diz "Por aí não! Siga a setinha." "Ver como faz" mostra a caneta fazendo o caminho.
4. Palavra pronta: pingos, acentos e o corte do t aparecem sozinhos, "Muito bem!" e vem a próxima. As 2 frases
   prontas: "Você escreveu as 2 frases!" e "Pegar a MonsterBall": 1 MonsterBall na mochila, sem gastar estrela.

# 6. Onde fica no reino
Loja da Kiara (Vila Arco-Íris → Treinadores de Monstros → falar com a Kiara), cartão da MonsterBall.

# 8. Personagens e falas
Nenhum personagem novo. Só texto na tela (sem voz nova), como o resto da loja.

# 9. Prêmios
1 MonsterBall (`bola-monster`, 40%) a cada 2 frases. Caminho por persistência: não tem erro que perca nada; o
bloqueio só não pinta, e ela tenta de novo quantas vezes quiser. Sem limite por dia. (decidido pelo Claude)

# 10. Números que eu quero poder mudar depois
`Reino.config.cursiva` (`jogo/js/nucleo/config-cursiva.js`): frases por bola (2), qual bola, inclinação da letra,
tolerância do dedo, tamanho máximo da letra.

# 11. O que NÃO pode mudar
A compra com estrelas continua igual (Mini, MonsterBall e Super, desconto pelas salas de Matemática). Nada no save.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook (mouse). Escrever é com o dedo ou o mouse; pelo teclado, Tab/Enter/Esc nos
botões. (decidido pelo Claude)

# 13. Pronto quando
- [ ] no cartão da MonsterBall aparece "ou" e "Escrever 2 frases"
- [ ] saem 2 frases diferentes do banco (28 frases), sorteadas
- [ ] começar o "a" para baixo não pinta; subindo, pinta (e o mesmo para girar o "o" ao contrário)
- [ ] seguindo o tracejado, as 2 frases ficam prontas e dão 1 MonsterBall sem gastar estrela
- [ ] fechar no meio guarda as frases e o ponto onde parou

# 14. Decisões (do Claude)
- Letras no estilo cursivo da escola, com a subida da emenda no começo de cada minúscula (o "a" começa subindo),
  m com três montinhos e n com dois; maiúsculas desenhadas: A C E L M N O U (as frases começam por elas).
- Pingos, acentos, cedilha, corte do t e ponto final aparecem sozinhos no fim da palavra.
- Uma palavra por vez no papel (no celular a letra fica grande o bastante para o dedo).
- Levantar o dedo no meio pode (continua da bolinha); nenhuma pressa, nenhum erro tira nada.
- O progresso da tela fica só na memória (sem campo novo no save).

# 15. Até onde ir
Padrão: construir, testar, pôr na main e mandar para o GitHub (a Vercel publica sozinha).
