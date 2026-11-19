# A Garagem da casa e o Mercado de Lugares Famosos

Pedido do Leandro (19/11/2026), em texto livre:

> faça outra atualização daquela tela inicial de garagem de casa onde tem mercado [de] construções famosas onde se
> compra com estrelas e a casa é a mesma
>
> construções, quero dizer lugares
>
> os lugares vão ficar em uma vila nova, não na garagem, e publica

Tamanho G (interior novo da casa, loja nova, 12 móveis desenhados, aviso da tela inicial; sem campo novo no save).

## O que ela vê
- Na tela de início: "Nova atualização! A Garagem da Casa" / "Compre lugares famosos com estrelas!", com a
  Estátua da Liberdade desenhada e a atualização de mentira na 1ª vez do aparelho.
- A casa é a mesma no mapa. Dentro dela, no térreo, uma porta nova leva à Garagem (interior `casa-garagem`).
- Na Garagem, o balcão do Mercado de Lugares Famosos: tocar abre a loja, com as 12 miniaturas de lugares famosos
  (construções e lugares naturais de vários países) e o preço em estrelas; comprar várias de uma vez, como nas lojas da Vila.
- O portão da Garagem leva à Vila dos Lugares Famosos (nova, a céu aberto): 12 lotes, um por lugar. O lugar
  comprado aparece em pé no lote dele, grande (o desenho da miniatura em escala 2); o que falta é um lote vazio com
  a plaquinha "?". Tocar num lote ou num lugar mostra o nome e o país. Os lugares não vão para dentro da casa.

## Decidido pelo Claude
- Mercado de autoatendimento (um balcão), sem vendedor novo com voz.
- Preços de 60 a 200 estrelas, as mais simples mais baratas.
- Nada novo no save: a compra é a da Casa Bonita da Vila (`P.gastarEstrelas` e `CasaMoveis.guardar`); a vila mostra
  o que foi comprado (derivado), cada lugar num lote fixo.
- A Vila dos Lugares Famosos fica pelo portão da Garagem (a casa continua a mesma no mapa) e reaproveita o céu, as
  colinas e os enfeites da Vila Arco-Íris.
