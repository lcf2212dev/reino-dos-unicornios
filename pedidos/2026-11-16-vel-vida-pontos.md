# Pontos de Velocidade e Vida mais fortes

- Velocidade: além de andar mais rápido, ataca mais rápido (10% por ponto). A recarga da espada é
  `recargaMs / (1 + 0,1 × pontos)`. Teto de 3×, como o andar tem o dele (decidido pelo Claude).
- Vida: além de mais vida, regenera 0,5% da vida máxima por segundo por ponto. Soma ao 1 a cada 3 s e espera os
  mesmos 5 s sem levar toque (decidido pelo Claude).
- Só os pontos contam; a Rapidez dos itens segue só no andar (decidido pelo Claude).
- Cartões do nível: "Anda e ataca mais rápido" e "Mais vida e cura". A fala do Claude não muda (sem voz nova).
- Pronto quando: os números em `config.fantasmas.jogador`, testes de unidade cobrindo recarga, teto e cura.
