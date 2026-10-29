# Pedido 1 de 1: Laboratório de Química

/nova-feature

# 1. Nome
laboratorio-quimica

# 2. Tipo
[x] Prédio novo, ou um prédio por dentro
[x] Personagem novo
[x] Mecânica nova (bancada de misturas com animação, caderno de receitas, microscópio, tabela periódica)
[x] Fala nova ou mudada (voz)

Mecânica nova escondida (decidido pelo Claude): campo novo no save (`quimica`), 4 telas novas com canvas animado,
lógica de misturas pura (testável em node), ícones novos, e uma mudança pequena em `mundo/mapa.js` para o prédio
registrado na clareira ganhar a cerquinha com portão sem mexer no sorteio do reino.

# 3. O que eu quero
Um Laboratório de Química no terreno vazio do mapa, onde a Mariana mistura produtos nos tubos de ensaio e vê o que
acontece (com animação), olha lâminas no microscópio (nada de bicho) e aprende o básico de química num cantinho da
tabela periódica. Um caderno de receitas guarda cada mistura que ela descobre; a primeira receita, já escrita no
caderno, é uma explosão inofensiva.

# 4. Por que
A Mariana pediu para fazer experimentos. Ela aprende rápido e gosta de ir fundo: o laboratório dá liberdade para
explorar (misturar à vontade, sem errar), vocabulário de verdade (ácido, base, gás carbônico, átomo, molécula) e a
alegria da descoberta, sem pressa nem cobrança.

# 5. Como a Mariana usa, passo a passo
1. No mapa ela vê um prédio novo, com frascos borbulhando, onde antes havia o terreno com "?" (ao lado da Loja das
   Fadas, acima do Observatório). No menu Lugares aparece "Laboratório de Química" com o selo ✨ Novo!.
2. Ela entra e encontra a Doutora Proveta na Bancada de Misturas. A doutora diz oi e convida: "Vamos misturar poções?".
3. Bancada de misturas (tela): uma prateleira com 12 tubos de ensaio coloridos (vinagre, bicarbonato, água,
   detergente, suco de repolho roxo, limão, sal, óleo, corante azul, fermento, água oxigenada, leite). Ela toca
   (ou arrasta) até 3 tubos para o béquer e toca "Misturar!". A animação mostra o que acontece: espuma, troca de
   cor, bolhas, camadas, redemoinho de cores ou a explosão de confete. A Doutora Proveta explica, em frases curtas,
   por que aconteceu. Mistura nova vai para o caderno com festa; mistura sem receita diz com carinho que nada de
   especial aconteceu e, se faltou só um ingrediente, dá a dica "Quase! Falta um ingrediente.".
4. Caderno de receitas (tela, pelo botão 📒 da bancada e pelo caderno no púlpito): 10 receitas. A primeira,
   "POF! Explosão de confete" (vinagre + bicarbonato), já vem escrita e aberta. As outras aparecem como "?" com uma
   adivinha de dica até ela descobrir misturando. Cada receita descoberta mostra os ingredientes, o que acontece, a
   explicação e o aviso "Na vida real, chame um adulto!".
5. Microscópio (tela): 8 lâminas sem nenhum animal (sal, açúcar, folha, casca de cebola, pólen de flor, areia, fio
   de algodão, floco de neve). Ela escolhe a lâmina, o aumento (10×, 40×, 100×) e gira o foco até a imagem ficar nítida;
   a Doutora Proveta conta o que ela está vendo.
6. Cantinho dos Átomos (tela da tabela periódica): o mapa das 118 casas colorido por família, cartões tocáveis dos
   elementos 1 a 20 e mais ferro, cobre, prata e ouro (símbolo, nome, número, onde a gente encontra, curiosidade), e
   6 lições curtas: tudo é feito de átomos; o que é um elemento; moléculas (água = H₂O); sólido, líquido e gás;
   ácidos e bases (o repolho roxo muda de cor); mistura ou reação?
7. Termina quando ela quiser (Esc / ✕). O que ela descobriu fica salvo, em todos os aparelhos.

As 10 receitas (decidido pelo Claude; ingredientes exatos, a ordem não importa):
1. POF! Explosão de confete: vinagre + bicarbonato (explosão inofensiva: gás carbônico empurra espuma e confete).
2. Vulcão de espuma: vinagre + bicarbonato + detergente (a espuma transborda como lava).
3. Poção rosa: repolho roxo + limão (ácido deixa o repolho rosa).
4. Poção verde-azulada: repolho roxo + bicarbonato (base deixa o repolho verde-azulado).
5. Pasta de dente de elefante: água oxigenada + fermento + detergente (coluna gigante de espuma; oxigênio).
6. Água do mar: água + sal (o sal se dissolve: mistura, não reação).
7. Camadas teimosas: água + óleo (não se misturam; o óleo boia).
8. Chuva de cores: água + óleo + corante azul (gotas coloridas descem pelo óleo).
9. Leite mágico: leite + corante azul + detergente (as cores fogem em redemoinho).
10. Bolhas de sabão: água + detergente (bolhas flutuando).

# 6. Onde fica no reino
Mapa: clareira 1 (rect x 37, y 24, 5×5; porta em 39,28; caminho [[39,29]] até a Avenida do Lago), ao lado da Loja
das Fadas e acima do Observatório (decidido pelo Claude: a foto do "espaço" não chegou na conversa; das 3 clareiras
é a mais central e fica ao lado de Ciências). A lista `Mapa.CLAREIRAS` não muda (mudaria o sorteio do reino todo).
Um andar com 3 cômodos ligados por portas: Bancada de Misturas (entrada, com a Doutora Proveta), Sala do
Microscópio e Cantinho dos Átomos.
Como ela acha a novidade: andando pelo mapa (prédio novo no lugar do "?"), ou pelo menu Lugares ("Laboratório de
Química", ✨ Novo!, ícone 🧪), que a leva andando até a porta. Dentro, a Doutora Proveta está logo em frente à
entrada; a bancada, o caderno, o microscópio e a tabela são objetos que se tocam, cada um com placa no cômodo.

# 7. Material
Nenhum (não é matéria da escola). Conteúdo de química básica, correto, escrito pelo Claude.

# 8. Personagens e falas
Quem aparece:
Doutora Proveta, mulher, adulta
Jeito de falar: cientista animada e calma, frases curtas, palavras de verdade da química explicadas na hora; sempre
lembra que experimento de verdade é com um adulto.
Textos: [x] escreva você
Voz nova: [x] crie uma nova (decidido pelo Claude: pt-BR-ThalitaMultilingualNeural +0% -28Hz, longe do Claude e
dos outros; reserva pt-BR-FranciscaNeural +10% -34Hz se a transcrição reprovar termos de química)
Símbolos químicos aparecem só na tela; a voz fala por extenso ("água é agá dois ó" não; "dois hidrogênios e um oxigênio").

# 9. Prêmios
Estrelas só na primeira vez (decidido pelo Claude): 2 ⭐ por receita nova, 1 ⭐ por lâmina nova, 1 ⭐ por lição
lida até o fim, 10 ⭐ ao completar o caderno. Nada de dinheiro nem Aura (é diversão, não matéria).
Caminho por persistência: não há erro possível; tudo se ganha explorando, e a dica "Quase!" leva às receitas.

# 10. Números que eu quero poder mudar depois
Estrelas de cada descoberta e do caderno completo, e o máximo de tubos no béquer (3), em `Reino.config.quimica`.

# 11. O que NÃO pode mudar
O resto do mapa (sorteio de enfeites idêntico), o Observatório e o Laboratório de Ciências dele, a economia de
dinheiro, a Aura. Save antigo sem o campo `quimica` abre normalmente (caderno com só a 1ª receita).

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook
Sem recurso do aparelho (nada de câmera, compartilhar ou baixar). Funciona na Vercel e no app instalado sem rede.

# 13. Pronto quando
- [ ] o laboratório aparece na clareira 1, com cerquinha, e o resto do mapa fica igual
- [ ] no menu Lugares, "Laboratório de Química" com ✨ Novo! leva até a porta
- [ ] a Doutora Proveta fala com voz própria e abre a bancada
- [ ] vinagre + bicarbonato faz a explosão de confete animada e já está no caderno desde o início
- [ ] as 10 receitas têm animação própria; mistura desconhecida não pune e dá dica quando falta um ingrediente
- [ ] microscópio com 8 lâminas sem animais, aumento e foco
- [ ] tabela periódica com mapa das 118 casas, 24 cartões e 6 lições
- [ ] descobertas salvas e somadas entre aparelhos; estrelas só na primeira vez
- [ ] tudo pelo teclado (Tab, Enter, Esc) e com Animações desligadas mostra o quadro final
- [ ] celular, tablet e notebook sem nada cortado

# 14. Decisões
Decidido pelo Claude: prédio `quimica` (prefixo `quimica-`; `lab-` já é do Observatório), nome "Laboratório de
Química"; clareira 1; 3 cômodos num andar; telas em painel DOM com canvas (bancada, caderno, microscópio, tabela);
tocar no tubo despeja (arrastar é o extra); descoberta gravada na hora do "Misturar!"; sons combinando os que já
existem; sem Aura e sem dinheiro.

# 15. Até onde ir
Padrão: até a main, o GitHub e a Vercel (o artifact está aposentado).
