# Pedido 1 de 1: aura-contorno
/nova-feature
O que quero: a aura deixa de ser uma oval atrás da Mariana e passa a contornar a silhueta exata dela (a pé, montada no unicórnio pequeno ou grande, no banho), com um brilho suave em volta que pulsa, na cor da faixa atual (arco-íris passando as cores). Brilhinhos piscam em pontos do próprio contorno.
Onde aparece: no mapa e nos interiores, em volta dela (sistemas/aura.js; o desenho dela em personagens/jogador-desenho.js informa a silhueta do quadro).
Pronto quando: o contorno acompanha a figura pixel a pixel em todas as vistas, com espelho e na água (corta na linha d'água); com Animações desligadas fica parado; sem queda de quadros (máscara em cache por sprite e cor).
Decidido pelo Claude: o bebê unicórnio que segue a pé fica fora da aura (a aura é dela); o brilho suave é o shadowBlur do canvas, em px da tela.
