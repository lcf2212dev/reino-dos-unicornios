# Pedido 1 de 1: 2º andar do Laboratório de Química

/nova-feature

# 1. Nome
quimica-andar2

# 2. Tipo
[x] Prédio novo, ou um prédio por dentro (2º andar do Laboratório de Química)
[x] Personagem novo
[x] Mecânica nova
[x] Fala nova ou mudada (voz)

Mecânica nova escondida (decidido pelo Claude):
- interior novo `quimica-2` com escadas pareadas: o TÉRREO ganha a escada que sobe, então o layout da Bancada de
  Misturas muda (objeto que atrapalha é mudado de lugar, nunca tirado) e a base do e2e troca;
- 3 telas novas em painel DOM com canvas animado (quadro final sem Animações): Fogão dos Estados, Mesa de Separar
  Misturas e Estante de Livros;
- curiosidades sorteadas sem repetir na sessão (como as da NASA), contadas pelo guia e pelos objetos do andar;
- grupos novos no campo `quimica` do save (`estados`, `separar`, `livros`), com estrelas da 1ª vez;
- selo "✨ Novo!" para uma novidade DENTRO de um lugar já visitado: hoje o `Reino.Novidades.ehNovo` só olha se ela
  já entrou no lugar, e a Mariana já entrou no laboratório; o selo tem de voltar até ela entrar no `quimica-2`;
- ícones novos em pixel art.

# 3. O que eu quero
Um 2º andar no Laboratório de Química, cheio de ensinamentos e curiosidades: uma cozinha-laboratório para ver a
água derreter, ferver, condensar e congelar e para separar misturas; um salão de curiosidades da química com um
professor que conta uma atrás da outra; e uma biblioteca com livrinhos de lições novas.

# 4. Por que
A Mariana gostou do laboratório e aprende rápido. O 2º andar dá muito mais para descobrir, com vocabulário de
verdade (derreter, evaporar, condensar, filtrar, ferrugem, carbono, fotossíntese), e liga a química ao que ela vê
em casa (café coado, feijão catado, pipoca, pão de queijo), sem pressa nem cobrança.

# 5. Como a Mariana usa, passo a passo
1. Ela entra no laboratório e, olhando da porta para o fundo da Bancada de Misturas, vê uma escada que sobe, com o
   cartaz "2º andar". No menu Lugares o Laboratório volta a ter ✨ Novo! até ela subir, e a Doutora Proveta convida
   ("Lá em cima tem mais surpresas!").
2. Ela sobe e chega ao Salão das Curiosidades (meio). O Professor Carbono diz oi e conta uma curiosidade; no fim
   aparecem "Outra curiosidade! ✨" e "Tchau! 💛". Vitrines e objetos do salão contam curiosidades do tema deles
   (diamante e grafite, ferrugem, fogos de artifício, a Estátua da Liberdade verde, ouro, ar, sal, corpo humano).
3. Na Cozinha Química (esquerda), com a Dona Caramela:
   a. Fogão dos Estados (tela `quimica-estados`): ela escolhe o que vai para a panela (gelo, chocolate, manteiga ou
      vela), toca 🔥 Esquentar ou ❄️ Esfriar e vê o termômetro subir ou descer e as bolinhas (moléculas) mudarem:
      juntinhas e tremendo (sólido), soltinhas deslizando (líquido), voando longe (gás). A água faz o ciclo todo: o
      gelo derrete a 0 °C, a água ferve a 100 °C, o vapor vira gotinhas na tampa fria (condensa) e a água congela
      de novo. Chocolate, manteiga e cera de vela derretem cada um na sua temperatura e endurecem ao esfriar. A Dona
      Caramela explica cada mudança.
   b. Mesa de Separar Misturas (tela `quimica-separar`): 6 misturas e as ferramentas. Ela escolhe a mistura e a
      ferramenta; a certa separa com animação e a Dona Caramela conta o nome do jeito; a que não serve diz com
      carinho que essa não separa e pede para tentar outra (sem erro, sem som de erro). As 6 (decidido pelo Claude):
      café com pó → coador (filtrar); feijão com pedrinhas → catar com a mão (catação, como se faz antes de
      cozinhar); areia com pedrinhas → peneira (peneirar); água com sal → sol esquentando (evaporar: é assim nas
      salinas); areia com clipes de ferro → ímã; água barrenta → esperar a areia descer (decantar).
      Quando dois jeitos funcionam de verdade (ex.: água barrenta também passa no coador), os dois valem.
4. Na Biblioteca da Química (direita), a estante abre os livros (tela `quimica-livros`, no jeito das lições da
   tabela: páginas curtas com desenho), lidos pelo Professor Carbono. 8 livros (decidido pelo Claude):
   Química na cozinha (fermento, pipoca, caramelo); O ar que a gente respira; O fogo precisa de três coisas
   (combustível, ar e calor; nunca brinque com fogo); A ferrugem (e o ouro que não enferruja); A viagem da água
   (evapora, vira nuvem, chove); A planta que faz comida com luz (fotossíntese); A química do corpo (muita água,
   a digestão começa na boca); Cientistas que mudaram tudo (Lavoisier, Marie Curie, Mendeleiev).
5. Termina quando ela quiser (Esc / ✕ nas telas; a escada desce para o térreo). O que ela descobriu fica salvo,
   em todos os aparelhos.

Curiosidades (decidido pelo Claude): pelo menos 40, corretas e atuais, cada uma com a fonte e a URL no comentário
(Royal Society of Chemistry, American Chemical Society, USGS, Britannica, Ciência Hoje das Crianças, Embrapa,
Fiocruz). Temas: cozinha, corpo, natureza e água, ar e fogo, metais, cores e luz, elementos, cientistas. Toques do
Brasil: café coado, feijão catado, o sal das salinas do Rio Grande do Norte, o pão de queijo que cresce com o
vapor, o nióbio. Nada de bicho (como no microscópio do térreo).

# 6. Onde fica no reino
Laboratório de Química (clareira 1), 2º andar: interior `quimica-2` (lugar `quimica`, pacote `interior-quimica`,
sem saída para o mapa), 3 cômodos de 13×13 lado a lado como o térreo (43×15): Cozinha Química (esquerda) |
Salão das Curiosidades (meio, com a escada que desce) | Biblioteca da Química (direita).
Térreo: escada que sobe no fundo da Bancada de Misturas, no fim do corredor que sai da porta (sem cobrir a placa
do cômodo), com o cartaz "2º andar" (decidido pelo Claude).
Como ela acha a novidade: (1) entrando no laboratório, a escada fica bem na frente da porta, no fim do corredor;
(2) menu Lugares: ✨ Novo! no Laboratório até ela entrar no 2º andar (também para quem já tinha entrado no
laboratório) e a linha de baixo passa a ser "Misturas, microscópio, átomos e 2º andar"; (3) a Doutora Proveta
fala do 2º andar nas falas de depois.

# 7. Material
Nenhum (não é matéria da escola). Química básica escrita pelo Claude e conferida nas fontes das curiosidades.

# 8. Personagens e falas
Quem aparece:
Professor Carbono, homem, idoso
Dona Caramela, mulher, adulta
Jeito de falar: Professor Carbono é um vovô cientista calmo que adora um "Sabia que…?": guia do Salão das
Curiosidades e voz das curiosidades (as do guia e as dos objetos do andar) e dos livros. Dona Caramela é uma
cozinheira-cientista animada que compara tudo com a cozinha: voz do Fogão dos Estados e da Mesa de Separar.
Os dois lembram que experimento de verdade é com um adulto. Símbolo químico só na tela; a voz fala por extenso.
Textos: [x] escreva você
Voz nova: [x] crie uma nova (decidido pelo Claude: escolhidas pelo `npm run vozes-elenco` e aprovadas pela
transcrição; Professor Carbono na base Antonio, longe do Claude (-5% +0Hz); Dona Caramela na Francisca, longe da
Doutora Proveta (+10% -34Hz), porque a Thalita embolava as palavras de química)
Visual (decidido pelo Claude): Professor Carbono idoso, grisalho, de jaleco e bigode; Dona Caramela de avental e
chapéu de chef, com cores do laboratório. Nenhum dos dois parecido com a Doutora Proveta, a Doutora Vega ou a
Chef Manu.

# 9. Prêmios
Estrelas só na 1ª vez (decidido pelo Claude): 1 ⭐ por mudança de estado vista pela 1ª vez no Fogão (água:
derreter, ferver, condensar, congelar; derreter o chocolate, a manteiga e a vela: 7), 1 ⭐ por mistura separada
pela 1ª vez (6), 1 ⭐ por livro lido até o fim (8). Curiosidades não dão estrela (como as da NASA). Nada de
dinheiro nem Aura.
Caminho por persistência: não há erro possível; tudo se ganha explorando.

# 10. Números que eu quero poder mudar depois
Em `Reino.config.quimica`: estrelas de cada mudança de estado, de cada mistura separada e de cada livro, e quantos
graus o termômetro anda a cada toque.

# 11. O que NÃO pode mudar
O que o térreo tem hoje (bancada, caderno, microscópio, tabela, a Doutora Proveta na vaga (24, 6), portas, saída,
spawn e as chaves dos 4 objetos do contrato); as descobertas e estrelas que ela já tem; save antigo sem os grupos
novos abre normalmente. O mapa, o Observatório e as curiosidades da Doutora Vega; o selo ✨ Novo! dos outros
lugares.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook
Sem recurso do aparelho (nada de câmera, compartilhar ou baixar). Funciona na Vercel e no app instalado sem rede.

# 13. Pronto quando
- [ ] a escada aparece no fundo da Bancada de Misturas, vista da porta, e leva ao 2º andar e de volta
- [ ] no menu Lugares, ✨ Novo! no Laboratório até ela entrar no 2º andar, mesmo já tendo entrado no laboratório
- [ ] os 3 cômodos cheios e com placa (validador de "rico" verde)
- [ ] o Professor Carbono conta curiosidades sem repetir na sessão; pelo menos 40, com fonte
- [ ] Fogão: a água derrete, ferve, condensa e congela; chocolate, manteiga e vela derretem e endurecem; termômetro e bolinhas
- [ ] Mesa de Separar: 6 misturas; a ferramenta certa separa com animação; a errada não pune
- [ ] Biblioteca: 8 livros com desenho, na voz do Professor Carbono
- [ ] estrelas só na 1ª vez; descobertas salvas e somadas entre aparelhos
- [ ] vozes novas aprovadas e toda fala nova gravada
- [ ] tudo pelo teclado (Tab, Enter, Esc); sem Animações mostra o quadro final; celular, tablet e notebook sem corte

# 14. Decisões
Decidido pelo Claude: interior `quimica-2` no mesmo pacote de voz; objetos novos com o prefixo `quimica-`; telas
`quimica-estados`, `quimica-separar`, `quimica-livros`; curiosidades e livros na voz do Professor Carbono, telas da
cozinha na voz da Dona Caramela; grupos `estados`, `separar`, `livros` no campo `quimica`; nada de bicho; sons
combinando os que já existem.

# 15. Até onde ir
Padrão: até a main, o GitHub e a Vercel (o artifact está aposentado).
