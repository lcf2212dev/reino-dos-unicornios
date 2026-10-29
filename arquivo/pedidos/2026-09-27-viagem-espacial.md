# Pedido 1 de 3: viagem-espacial (1ª versão: foguete, tanque, voo e Lua)

/nova-feature

# 1. Nome
viagem-espacial

# 2. Tipo
[x] Mecânica nova (sistema `viagem`: campos novos no save `combustivel` e `passaporte`; evento novo de resposta
    conferida; ação `viagem`; painel do foguete com o passaporte; minijogo de voo em tela própria com canvas; pulo
    da Mariana; gancho no motor dos interiores para céu aberto em volta de um planeta; o validador passa a seguir a
    viagem para achar o que é alcançável)
[x] Prédio por dentro (planeta Lua como interior do Observatório, alcançado só pelo foguete)
[x] Personagem novo (3 ETs lunares, com base de sprite nova `et`)
[x] Fala nova ou mudada (voz)

# 3. O que eu quero
A Mariana voa de foguete para outros planetas, brinca lá e conhece ETs. O combustível do foguete enche com as
respostas certas que ela dá no jogo (salas, treino, provas, pergunta surpresa). Nesta 1ª versão: o foguete do Hangar
da NASA, o tanque, o voo e a Lua (só brincar, sem pergunta).

# 4. Por que
Pedido da Mariana. Estudar vira combustível para a aventura: cada resposta certa aproxima a próxima viagem.

# 5. Como a Mariana usa, passo a passo
1. No Observatório, 2º andar (NASA), Hangar dos Foguetes: o foguete grande. O Astronauta Davi diz que o foguete
   agora voa. Ela toca no foguete.
2. Abre o painel do foguete: o tanque (10 gotinhas de combustível), os destinos (Lua) e o passaporte.
   Tanque cheio: "Decolar!". Tanque não cheio: quantas respostas certas faltam e onde conseguir.
3. Decolar: contagem 3, 2, 1 e o voo (uns 30 s): ela move o foguete para os lados (arrastar ou tocar dos lados no
   celular/tablet; setas no notebook), desvia de asteroides (bater só dá uma tremidinha) e pega estrelas.
4. Chega na Lua: chão cinza de crateras, céu preto estrelado com a Terra no alto. Ganha o carimbo da Lua no
   passaporte (1ª vez) e as estrelas que pegou no voo (até 5).
5. Na Lua: pula alto na cama de cratera (gravidade baixa), faz a pedra flutuar, acha o ET que se esconde, pega os
   cristais, ouve curiosidades de verdade sobre a Lua e conversa com os ETs lunares.
6. Volta tocando no foguete da Lua ("Voltar para o Reino"): aparece no Hangar, ao lado do foguete. A volta não gasta
   combustível.

# 6. Onde fica no reino
Observatório → escada para o 2º andar (NASA) → Hangar dos Foguetes (à esquerda) → o foguete grande.
A Lua é um interior do Observatório que não aparece no menu Lugares (só se chega voando).
Como ela acha a novidade: o Claude avisa uma vez por sessão, no mapa, até o primeiro voo ("O foguete da NASA agora
voa! Vá ao Observatório, no 2º andar."); o Astronauta Davi fala do foguete no Hangar (decidido pelo Claude).

# 8. Personagens e falas
Quem aparece:
Lumi, menina, criança
Pipo, menino, criança
Vovó Cratera, mulher, idosa
Jeito de falar: ETs lunares fofos, curiosos, falam de pular e de estrelas; frases curtas.
Textos: [x] escreva você
Voz nova: [x] crie uma nova (o Claude escolhe e confere)

# 9. Prêmios
Carimbo da Lua no passaporte (1ª chegada). Estrelas que ela pega no voo viram estrelas de verdade, até 5 por voo.
Caminho por persistência: o combustível vem de qualquer resposta certa, em qualquer lugar; errar não tira
combustível; bater no asteroide não tira nada.

# 10. Números que eu quero poder mudar depois
Tamanho do tanque (10 respostas certas), duração do voo (30 s), máximo de estrelas por voo (5), tanque cheio no
primeiro voo (sim). Em `config.viagem`.

# 11. O que NÃO pode mudar
Aura, estrelas, R$, surpresa e salas continuam iguais; o evento de resposta só é emitido por onde a Aura já conta.
O foguete grande do Hangar deixa de fazer a experiência de decolagem no lugar (a decolagem passa a abrir a viagem;
o voo começa com a contagem). Save antigo sem os campos: tanque cheio e passaporte vazio.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook (setas, Enter, Esc)

# 13. Pronto quando
- [ ] resposta certa em sala, treino, prova ou surpresa enche 1 gotinha; errada não tira
- [ ] tocar no foguete do Hangar abre o painel com o tanque certo; cheio decola, vazio explica
- [ ] o voo roda nos 3 tamanhos com toque e setas; asteroide só treme; estrelas contam
- [ ] chega na Lua, ganha o carimbo (1ª vez) e as estrelas; o passaporte mostra o carimbo
- [ ] na Lua: pulo, pedra flutuante, esconde-esconde, cristais, curiosidades e 3 ETs com voz
- [ ] o foguete da Lua leva de volta ao Hangar sem gastar combustível
- [ ] Animações desligadas: tudo funciona, sem partículas

# 14. Decisões
Decidido pelo Claude:
- Planeta = interior do Observatório (lugar `observatorio`, pacote de voz `interior-observatorio`), sem `entrada`,
  alcançado pela ação `viagem`; céu aberto em volta por um fundo registrado (`I.FUNDOS`).
- Combustível: 1 por resposta certa (evento `RESPOSTAS` emitido por `Reino.Aura.contar`), máx. 10; save antigo e
  primeiro jogo começam com o tanque cheio. Voar zera o tanque; voltar é de graça.
- Voo em tela própria com canvas (o laço do mapa pausa sozinho); a física roda mesmo sem Animações (é a atividade),
  sem partículas nem parallax. Sem pressa: o voo dura o mesmo tempo aconteça o que acontecer.
- Passaporte dentro do painel do foguete (sem botão novo no HUD).
- 2ª versão: Marte (Matemática) e Saturno (Inglês) com portais de resposta no voo. 3ª: Júpiter, Terra, Netuno,
  álbum de ETs, ET que acompanha e capacete de astronauta.
