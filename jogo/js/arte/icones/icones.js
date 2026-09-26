/* Ícones do jogo em pixel art 16x16, desenhados à mão.
   Cada um: n = nome, p = paleta {letra: cor}, d = 16 linhas de 16 letras ('.' = transparente).
   O contorno já faz parte do desenho. Emoji sem desenho aqui vira pixel automaticamente (pixelart-icones.js).
   Este arquivo só cria window.ICONES; os desenhos estão nos lotes por tema (js/arte/icones/<lote>.js),
   que se somam a ele na ordem do manifesto (a ordem das chaves é a de sempre: a prévia lista nela).
   Ícone novo: no lote do tema (ou no fim do último), no formato dos outros. */
window.ICONES = {};
