# 1. Nome
parquinho

# 2. Tipo
[x] Prédio novo (um lugar novo: o Parquinho, interior de céu aberto, com portal na praça)
[x] Mecânica nova (brincar nos brinquedos com o unicórnio)

# 3. O que eu quero
Pedido do Leandro (texto original): "Quando o jogador completar 3 matérias completas, sendo uma de matemática ou de
língua portuguesa, abra um portal na praça da cidade, que teleporta para um parquinho, onde ela e o unicórnio podem
interagir com os brinquedos, caixa de areia, etc. Quando completar as outras 3, ou seja, todas completas, então o
parquinho ganha mais brinquedos."

# 4. Por que
Um prêmio de diversão por terminar as matérias, que dá vontade de completar as outras (os presentes embrulhados
mostram que vem mais).

# 5. Como a Mariana usa, passo a passo
1. Na entrada oeste da praça (onde a Rua da Praça chega ao calçamento, ao lado do poste) há um anel de pedrinhas com o
   miolo cinza: o portal dormindo. Tocando nele, uma tela diz o que falta (3 matérias, uma de Matemática ou Língua
   Portuguesa ⭐) e quais matérias já estão completas. (decidido pelo Claude: mostrar apagado com a plaquinha)
2. Com 3 matérias completas, uma delas Matemática ou Língua Portuguesa, o portal acorda: redemoinho de arco-íris,
   brilho e faíscas. Ele aparece no menu Lugares ("Parquinho", 🎠). Pisando nele, ela vai ao Parquinho.
3. No Parquinho: balanço, escorregador, gangorra e caixa de areia. Ela chega perto e toca (ou Enter/Espaço): uma
   brincadeira curta com o unicórnio, com som:
   - balanço: ela e o unicórnio balançam nos dois assentos;
   - escorregador: ela sobe a escada, senta e escorrega; o unicórnio vai logo atrás;
   - gangorra: ela numa ponta, o unicórnio na outra, sobe e desce;
   - caixa de areia: ela senta na areia e o castelinho sobe em etapas; ele fica de pé até fechar o jogo.
4. À direita, três presentes embrulhados. Tocando, a tela diz que eles abrem com todas as matérias completas.
5. Com todas as matérias completas, os presentes viram carrossel (ela monta num cavalinho, o unicórnio vai no
   carrossel), pula-pula (os dois pulam, um de cada vez) e tanque de bolinhas (os dois pulam para dentro e saem).
6. Sai pelo portal de volta, no pé do parque, e aparece na frente do portal da praça.
Um toque durante a brincadeira pula para o fim. Sem Animações: a pose parada, curtinha.

# 6. Onde fica no reino
Mapa, tile (20, 20), na grama da entrada oeste da praça (a praça é 21..33 × 15..27; o validador não aceita lugar em
cima do calçamento dela). Menu Lugares só depois de liberado.

# 8. Personagens e falas
Nenhum personagem novo, nenhuma fala nova com voz. Os textos da tela do portal dormindo e dos presentes são só tela.

# 9. Prêmios
Nenhum (só diversão; decidido pelo Claude). Nada novo no save: a fase é calculada na hora das salas feitas.

# 10. Números que eu quero poder mudar depois (config.js, `Reino.config.parquinho`)
Quantas matérias abrem o portal (3), quais contam como "chave" (ids que começam com matematica/portugues), quanto
dura cada brincadeira, a versão curta sem Animações e quando o toque pode pular.
