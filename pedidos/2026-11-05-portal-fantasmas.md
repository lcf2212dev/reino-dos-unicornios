# 1. Nome
portal fantasmas

# 2. Tipo
[x] Mecânica nova
[x] Prédio novo (um lugar novo: o Bosque dos Fantasmas, interior de céu aberto)
[x] Prêmio (móvel da casa)

# 3. O que eu quero
No bosque à direita da Minha Casa (as árvores ao lado do caminho de pedras), um brilho redondo no chão, como um
portal de RPG, com a cara do Reino (rosa, lilás, estrelinhas). Ao entrar, um mapa grande como a cidade, com grama,
mato e árvores, onde o jogador luta contra fantasmas com uma espada. Cada fantasma vencido traz uma pergunta das
matérias: acertou, ganha XP e 1 estrela.

# 4. Por que
Revisar as matérias num jogo de aventura, com vontade de voltar, sem pressa e sem perder nada.

# 5. Como a Mariana usa, passo a passo
1. No mapa, perto da casa dela, vê o portal brilhando no chão, entre as árvores.
2. Anda até o portal (ou toca nele): entra no Bosque dos Fantasmas (íris de transição).
3. Na 1ª vez abre a tela de prêmio: "Você ganhou uma espada!". A partir daí ela tem barra de vida, nível e pontos
   (Força, Vida, Velocidade), que aparecem no HUD só dentro do Bosque.
4. Anda pelo bosque; os fantasmas flutuam. Ela ataca com o botão da espada (toque), Espaço ou Enter. Fantasma
   encostando tira um pouco de vida.
5. Fantasma vencido: abre uma pergunta aleatória das 6 matérias. Acertou: XP e 1 estrela. Errou: nada (o fantasma
   volta a aparecer depois; dá para tentar de novo, sem castigo).
6. A cada 10 acertos sobe de nível (até o 1000): ganha 1 ponto para pôr em Força, Vida ou Velocidade e escolhe um
   móvel para a casa.
7. Vida zerada: ela "desmaia" com carinho e volta ao começo do bosque com a vida cheia, sem perder nada.
8. Sai pelo portal de volta, que fica no começo do bosque, e aparece ao lado do portal na cidade.

# 6. Onde fica no reino
Mapa da cidade, no bosque à direita da Minha Casa (lugar `casa`, rect x:46,y:33,w:6,h:5), em tile livre entre as árvores.
Como ela acha: andando no mapa; o portal brilha e pulsa. Também no menu Lugares (decidido pelo Claude).

# 8. Personagens e falas
Quem aparece: nenhum NPC novo. Os fantasmas não falam. O Claude fala (voz que já existe).
Textos: escreva você. Voz: a do Claude.

# 9. Prêmios
- Espada na 1ª entrada.
- 1 estrela + XP por acerto (fantasma fácil 1 XP... ver decisões).
- Por nível: 1 ponto de habilidade + 1 móvel da casa à escolha (mesma tela dos móveis avulsos). Se ela ainda não
  ganhou a casa, os móveis ficam guardados e aparecem quando ganhar.
Persistência: errar não tira nada; o fantasma volta; nenhuma pergunta tem tempo.

# 10. Números que eu quero poder mudar depois (config.js, `Reino.config.fantasmas`)
Acertos por nível (10), nível máximo (1000), vida/força/velocidade de cada tipo de fantasma e do jogador por ponto,
quantos fantasmas no mapa, tempo para um fantasma voltar.

# 11. O que NÃO pode mudar
Nada se perde. A pergunta surpresa, as salas, o save de hoje: iguais. Fora do Bosque, nada de barra de vida nem
espada no HUD.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook; teclado (setas, Espaço/Enter ataca, Esc).

# 13. Pronto quando
- [ ] o portal aparece no bosque à direita da casa, brilhando, e leva ao Bosque dos Fantasmas
- [ ] 1ª entrada: tela de prêmio com a espada; nas seguintes não aparece
- [ ] barra de vida, nível, XP e pontos visíveis no Bosque
- [ ] 3 fantasmas de cores diferentes (fácil, médio, difícil) com vida/força/velocidade diferentes
- [ ] vencer → pergunta das 6 matérias; certo = XP + 1 estrela; errado = nada
- [ ] 10 acertos → nível novo (máx. 1000), 1 ponto para Força/Vida/Velocidade, e escolha de um móvel da casa
- [ ] vida zerada: volta ao começo do bosque, sem perder nada
- [ ] funciona no celular (toque), tablet e notebook (teclado)

# 14. Decisões (decidido pelo Claude)
- "A cada 10 perguntas" = 10 acertos (só acerto dá XP). XP = 1 por acerto; nível = 1 + acertos/10 (até 1000).
- Fantasmas fofos (não assustadores): lilás (fácil), azul-turquesa (médio), rosa-vinho com coroa (difícil).
  Os mais difíceis têm mais vida, batem mais e são mais rápidos; todos dão 1 estrela e 1 XP ao acertar.
- Força = dano da espada; Vida = vida máxima; Velocidade = passo do jogador no Bosque.
- Pergunta (pedido do Leandro): sorteio totalmente aleatório entre todas as perguntas do bimestre em curso, sala feita ou não; cada pergunta com a mesma chance.
- Móvel por nível (pedido do Leandro): escolhido entre os móveis avulsos que já existem e que ela ainda não tem (nada de móvel novo nem repetido). Se já tem todos, o nível fica sem móvel.
