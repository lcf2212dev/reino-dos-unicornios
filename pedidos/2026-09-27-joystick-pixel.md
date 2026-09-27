# Pedido 1 de 1: joystick em pixel art

/nova-feature
O que quero: o thumbstick do toque (o "joystick" que aparece onde o dedo encosta no celular e no tablet) desenhado
em pixel art, como o resto do jogo, no lugar dos círculos lisos de CSS. Base: um disco de pixels com contorno escuro,
fundo claro meio transparente, anel de brilho e quatro setinhas (cima, baixo, esquerda, direita), com sombra de
pixels embaixo. Pino: uma bolinha de pixels creme com brilho em cima e sombra laranja embaixo. Base e pino na mesma
grade de pixels, e o pino anda de pixel em pixel dessa grade (decidido pelo Claude).
Onde aparece: no mapa e nos interiores, ao arrastar o dedo (#controle, js/motor/entrada.js e css/ui-hud.css).
Números: config.controles troca base/pino/baseTablet/pinoTablet por `pixel` (celular) e `pixelTablet`
(tela a partir de 700×700): o tamanho de cada pixel do desenho. Base de 22 pixels (110 px no celular, 132 no tablet),
pino de 10 (decidido pelo Claude). O que some: só as chaves antigas do config; nenhum save muda.
Pronto quando:
- [ ] no celular e no tablet o joystick aparece em pixel art nítido, sem borda redonda lisa
- [ ] o pino fica dentro da base e anda em degraus de pixel
- [ ] andar pelo joystick continua igual (zona morta, 8 direções, some ao soltar)
- [ ] npm test e npm run e2e verdes
Parar antes? (em branco = até a main, o GitHub e o claude.ai)
