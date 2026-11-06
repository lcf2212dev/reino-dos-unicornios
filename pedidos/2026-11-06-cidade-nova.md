# Cidade Nova (portal no Bosque, 4 lojas e Teleportadora)

Pedido do Leandro (06/11/2026), em texto livre. No mapa dos fantasmas, no centro-direita, um portal leva a uma
nova cidade menor, com alguns terrenos livres e 4 lojas:

1. **Casa & Lar** — itens de decoração para a casa, cada um por **30 estrelas**; 50 itens novos.
2. **Forja das Lâminas** — NPC; compra e venda de armas por estrelas; 20 itens.
3. **Elmos & Chapéus** — NPC; compra e venda de capacetes e chapéus por estrelas; 20 de cada.
4. **Armaduras & Botas** — NPC; compra e venda de armaduras e botas por estrelas; 20 de cada.

Regra: ao falar com o NPC de uma loja, a conversa só começa depois de acertar uma pergunta sorteada entre todas as
disponíveis do **4º bimestre**. Pode comprar/vender mais de um item por vez. Na entrada, um NPC unicórnio com aura
arco-íris chamado **Teleportadora**; uma na praça da cidade principal e outra na praça da Cidade Nova.

## Decisões (decidido pelo Claude)
- "20 de cada" para as lojas 3 e 4 = 20 capacetes + 20 chapéus e 20 armaduras + 20 botas (40 itens por loja); a loja
  de armas, 20 espadas. Todos os 100 equipamentos são novos, de loja (não caem de monstro).
- Preços dos equipamentos por raridade (18/32/52/80 estrelas); venda pela metade. Os 50 móveis, 30 estrelas.
- A decoração usa o sistema de móveis avulsos da casa (`CasaMoveis`), guardada em chaves `loja:<id>:<n>`; nenhum
  campo novo no save. Sem casa, a peça espera.
- A pergunta da entrada é a mesma lista do Bosque, mas do 4º bimestre fixo; acertar não dá estrela/Aura nem mexe no
  save do Bosque.
- A Teleportadora é um objeto do mapa/interior (unicórnio desenhado), sem voz nova: o balão usa a voz `narradora` e
  leva entre as duas praças.
- A Cidade Nova e as lojas são **interiores de portal** (`portal: true`): entram por `Cena.irPara`, não por porta do
  mapa; o validador de interiores reconhece o novo marcador.
- Os 3 terrenos livres são decorativos, com placa "Terreno livre", prontos para uma novidade futura.
