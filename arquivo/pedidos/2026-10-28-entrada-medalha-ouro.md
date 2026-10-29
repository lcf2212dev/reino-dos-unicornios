# Pedido 1 de 2: saldo-robux
/nova-feature
O que quero: o 💰 do HUD mostra o que falta receber (ganho − já pago). Hoje: 3.140 ganhos, 3.000 pagos → 140.
Onde aparece: chip 💰 do HUD, linha do Baú no menu Lugares ("140 Robux para receber"), tela do Baú (já ganhou / já recebeu / para receber).
Pronto quando: save com 3.140 ganhos e R$ 120 pagos mostra 140 no HUD; a Área dos Pais e o save não mudam; o Baú mostra os três números.
Decidido pelo Claude: P.pagoTotal() e P.saldoRobux() em progresso-regras.js; saldo nunca negativo; as pilhas de moedas do Baú (interior) seguem o total ganho.

# Pedido 2 de 2: entrada-medalha-ouro
/nova-feature
O que quero: a tela de entrada do jogo vira uma festa de medalha de ouro do 3º bimestre.
Onde aparece: tela de início (antes do "Entrar no Reino"), só quando a última jogadora é a Mariana (outros logins veem a de sempre).
Pronto quando: medalha de ouro grande e brilhante, confete/estrelas douradas, faixa "Medalha de Ouro! 3º bimestre", "Parabéns, Mariana!", unicórnios com rastro dourado; ao tocar "Entrar", fanfarra e o Claude parabeniza (voz); sem animação: tudo parado e bonito; celular, tablet e notebook.
Decidido pelo Claude: liga por config (festaMedalha: { ate: '2026-12-20' }) e some sozinha depois; a frase velha "4º bimestre · Novos conteúdos em breve" vira "4º bimestre · Língua Portuguesa chegou!".
