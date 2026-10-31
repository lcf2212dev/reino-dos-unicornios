# Arte do jogador e dos unicórnios

Pedido do Leandro (31/10/2026), em texto livre:

> Melhore substancialmente a arte do jogador e também dos unicórnios.

Tamanho M (arte de 2 personagens: moldes, paleta e o desenho do jogador; sem save, sem fala nova).

## O que muda
- **Unicórnios** (os 10 moldes: adulto e filhote, 5 vistas; vale para bebê, pequeno, jovem e adulto, para a
  montaria, o estábulo, o banho, a loja e o ícone do app):
  - crina e cauda mais cheias, com brilho na mecha de cima e sombra perto do pescoço (as 3 cores ganham um tom claro e
    um escuro, tirados da própria cor);
  - olho com cílio; de lado, o adulto tem olho de 3 px com íris na cor da crina; de frente, a boquinha sorrindo;
  - pelo com luz e sombra (brilho em cima, meia-sombra na borda da direita e de baixo, barriga e patas de trás mais
    escuras), casco com brilho;
  - andando, a ponta da cauda balança com o passo (adulto de lado, de costas e em 3/4 de costas; filhote de costas).
- **Jogador** (a Mariana e quem joga; todo corte, roupa, vista, passo, a pé e montada):
  - olhos de 2 px de altura, boquinha, bochechas;
  - brilho no cabelo (um arco claro no alto) e sombra na borda; a franja faz sombra nos cantos da testa;
  - roupa, braços, pernas e sapatos com o lado da sombra (luz de cima e da esquerda, arte.md §13).
- **Piscar** (só com Animações): ela pisca a cada 3,3 s e o unicórnio a cada 4,3 s (`config.piscar`).

## Pronto quando
- Os 10 moldes e a personagem com a arte nova em todas as vistas, passos, pulo, pose cansada e montada.
- Os enfeites continuam no lugar (validador de enfeites verde), alturas dentro da tabela do arte.md §12.
- Ícones do app refeitos com o unicórnio novo (`npm run icones`).
- `npm test` verde; e2e diferente só nas imagens com a Mariana ou unicórnio (base aceita).

## Decidido pelo Claude
- Mesmo tamanho de sprite (a tabela de alturas do arte.md §12 continua valendo) e o contorno de sempre: a melhora vem
  de luz, sombra, rosto e da crina, não de sprite maior (ela continua criança ao lado dos adultos).
- O acabamento da personagem é feito em código por cima dos moldes (vale igual para os 13 cortes e as 12 roupas do
  Salão); o do unicórnio é desenhado nos moldes, e só a meia-sombra da borda e o brilho do casco vêm do código (para
  valer também no passo, no pulo e na pose cansada).
- Piscar só com Animações ligadas (sem Animações, o desenho fica parado, como manda o arte.md §15).
