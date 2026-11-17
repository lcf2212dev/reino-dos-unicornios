/nova-feature

# 1. Nome
bosques-novos

# 2. Tipo
[x] Prédio novo, ou um prédio por dentro (mapas de luta novos dentro do Bosque)
[x] Mecânica nova (três portais dentro do Bosque, cada um para um bosque com nível de dificuldade)
[x] Ajuste ou correção de algo que já existe (o painel da arena mostra o nível recomendado)

# 3. O que eu quero
No Bosque dos Fantasmas, mais 3 portais: um em cima, um embaixo e um na direita. Cada um leva a um bosque novo, com outros
monstros. Cada um desses bosques tem o seu nível de dificuldade, considerando todos os mapas que já existem, com inimigos
mais fortes do que os de hoje.

# 4. Por que
Depois de vencer o Vulcão (o mapa mais difícil até agora), ainda faltava um lugar para continuar crescendo: mais três
florestas encantadas, do mais fácil ao mais difícil, para ela escolher o desafio do dia e ganhar mais XP.

# 5. Como a Mariana usa, passo a passo
1. Ela entra no Bosque dos Fantasmas, como sempre.
2. Vê três portais novos, cada um com uma placa "Nv N": um no alto (fim da trilha principal), um embaixo à esquerda e um
   na borda direita. Cada um tem uma cor e um redemoinho próprios.
3. Ela pisa no portal e entra no bosque novo, com monstros diferentes dos que já existem; a luta, a espada, a pergunta,
   o nível e o baú são os de sempre.
4. O portal de volta fica no comecinho do bosque novo; ela volta para o lado do portal que usou.
5. No painel do chip (🗡), a arena nova mostra o nível recomendado.

# 6. Onde fica no reino
Dentro do Bosque dos Fantasmas (o interior da arena, `bosque`): 3 portais novos, com o portal de volta em cada floresta.
Ninguém entra por outro caminho (não são lugares do mapa): quem acha é quem já luta no Bosque.
Caminho: Bosque → portal (em cima, embaixo ou na direita) → bosque novo → portal de volta.

# 7. Material
Nenhum (pedido em texto).

# 8. Personagens e falas
Quem aparece: ninguém novo (os objetos dos bosques novos usam as falas já gravadas dos objetos do Bosque; as falas do
Claude na arena são as do próprio motor, sem voz nova).
Textos: [x] já existem (copiados dos objetos do Bosque, para não gravar voz nova)
Voz nova: [x] use uma que já existe

# 9. Prêmios
Os de sempre: XP, pergunta a cada terço do nível, estrela, ponto de habilidade e móvel surpresa no baú. Nada novo no save.

# 10. Números que eu quero poder mudar depois
Em `config.arenas` (cada floresta): nível recomendado, visão, quantos inimigos de cada tipo e, por tipo, vida, força,
velocidade, mortos no placar e XP. Todos acima do Vulcão (o mais forte de hoje) e crescendo de floresta em floresta.

# 11. O que NÃO pode mudar
O progresso da Mariana, o banco da Vercel, os saves, o servidor de casa, o Docker e o artifact. O Bosque, as 5 arenas
do mapa e o menu Lugares ficam como estão (os portais novos não são lugares do mapa); nada de voz nova; o e2e das
outras cenas não muda.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook

# 13. Pronto quando (o que eu vou conferir)
- [ ] No Bosque, 3 portais novos com placa de nível (em cima, embaixo e na direita), alcançáveis andando.
- [ ] Cada portal leva ao seu bosque novo, com 4 monstros novos e mais fortes que os de todos os mapas de hoje.
- [ ] Cada bosque novo tem o seu nível recomendado (25, 30 e 35) e números crescendo entre eles.
- [ ] O portal de volta devolve ao lado do portal usado, sem perder nada; desmaio, pergunta, nível e baú funcionam.
- [ ] O painel do chip mostra o nível recomendado na arena nova.
- [ ] Funciona no celular, no tablet e no notebook.

# 14. Decisões
Nomes, temas, bichos e cores são meus (Claude decide): "Bosque do Orvalho" (embaixo, Nv 25), "Bosque da Neblina"
(direita, Nv 30) e "Bosque da Lua Cheia" (em cima, Nv 35). Falas novas: nenhuma (as gravações do Bosque servem).

# 15. Até onde ir
Padrão: construir, testar, pôr na main, mandar para o GitHub e conferir a Vercel.
