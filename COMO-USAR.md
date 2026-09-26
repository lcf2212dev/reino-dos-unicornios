# Mariana e o Reino dos Unicórnios

## Como jogar
- **Tablet, celular ou notebook (recomendado):** abra https://claude.ai/artifact/CQUd5TWJQW3fWWw5Cvg77U
  - Precisa estar logado no claude.ai com a sua conta nesses aparelhos, porque o link é privado.
  - O progresso é sincronizado entre os aparelhos. Quando um aparelho junta o que veio de outro lugar (outro aparelho, outra aba), ele reenvia o resultado ao servidor.
  - Duas abas do jogo no mesmo navegador juntam o progresso uma da outra, sem perder nada.
  - **Como andar:**
    - **Notebook:** clique num lugar e ela vai sozinha até lá; clique numa pessoa ou objeto e ela vai e conversa ou usa. Segurando o botão do mouse, ela anda para onde o ponteiro está e segue o ponteiro; soltou, ela para. As setas do teclado (ou W, A, S, D) também andam.
    - **Celular e tablet:** toque num lugar e ela vai sozinha até lá; toque numa pessoa ou objeto e ela age. Encostando o dedo na metade esquerda da tela e arrastando, aparece um controle redondo (joystick) no lugar do dedo, e ela anda para qualquer lado; soltou, o controle some e ela para.
    - Não existem mais as setas na tela (nem o item "Setas na tela" nos Ajustes).
  - **Teclado:** uma tela aberta pelo teclado mostra um contorno roxo em volta dela (o Tab leva ao primeiro botão), e o Esc fecha os balões do Claude e dos personagens.
  - **Teclado nas provas, salas e treino:** o foco acompanha. A tela rola até o botão focado; depois de escolher um bloco, o foco fica no monte de blocos; ao trocar de questão (ou sair do ritual de respirar), o foco vai para a questão nova. O Enter que chega logo depois da troca não escolhe nada sem ela ver.
  - **Letras da fonte do jogo:** as maiúsculas com acento saem certas em todo o jogo (HISTÓRIA, NÃO, ÁFRICA). Antes, a letra acentuada aparecia minúscula no meio da palavra.
  - **No celular:** Verdadeiro ou falso, Ligar e Separar cabem na tela em todas as matérias ("Falso" fica embaixo de "Verdadeiro", e os baús ficam um embaixo do outro).
  - O jogo só começa depois de buscar o progresso guardado, no claude.ai ou no computador de casa. Por isso, um aparelho novo já abre com o progresso dela.
  - Se aparecer "O reino não abriu agora", o jogo não conseguiu buscar o progresso. Confira a internet, ou o computador de casa, e toque em "Tentar de novo". Até isso dar certo, o jogo não começa.
- **Só no notebook, sem internet para o jogo:** abra `jogo/index.html` com duplo clique.
  - Nesse modo o progresso fica salvo só naquele navegador.

## Área dos pais
- Fica em ⚙️ Ajustes → 🔒 Área dos pais.
- PIN: **2026**. Para trocar, edite `pinPais` em `jogo/js/nucleo/config.js` e peça ao Claude para republicar.
- Na área dos pais dá para:
  - ver quanto ela ganhou por matéria;
  - ver quantas vezes ela fez o Treino da Medalha de cada matéria (com uma só, aparece "(1 vez)");
  - registrar o que já foi pago;
  - **🔄 Começar novo ciclo de provas:** zera salas, treinos, dinheiro e pagamentos, e mantém os unicórnios, as estrelas, os enfeites, a comida da despensa e a fome e a sede.
- Depois de registrar um pagamento ou começar um novo ciclo, a Área dos pais continua aberta, sem pedir o PIN de novo.
- **🗑️ Apagar tudo** zera TODO o progresso, inclusive unicórnios e estrelas, e não tem volta. Não use para resolver problema: peça ao Claude.

## Pedir uma novidade ao Claude
- Use o modelo `PEDIDO-DE-FEATURE.md`, que fica na pasta do projeto: copie, preencha e cole na conversa.
- Para ajuste pequeno, use o modelo curto, de 4 linhas. Para novidade de verdade, use o completo.
- Campo em branco vale o padrão escrito nele. O que vale sempre (vozes, ícones, persistência, os 3 aparelhos) já está no modelo.
- O Claude constrói à parte e te dá um servidor de teste para jogar. Merge, GitHub e artifact só com a sua marcação em "Até onde ir".

## Nova matéria
1. Salve os prints numa pasta `Mariana Revisões/<Matéria>/`, por exemplo `Mariana Revisões/Geografia/`.
2. Peça ao Claude para criar a matéria no reino.
3. O Claude cria um lugar novo no mapa, com salas que somam R$20, os desafios da apostila, o livro-resumo e os unicórnios da matéria (em `jogo/js/conteudo/materias/<matéria>/`; cada arquivo novo ganha uma linha em `jogo/js/manifesto.js` e o `jogo/index.html` é refeito com `npm run index`). Sobrou uma clareira livre no mapa, a de cima à direita (23,4). O lugar novo entra "por cima" do mapa: as árvores e as flores do resto do reino não mudam.
4. O Claude grava as vozes das falas novas e republica no mesmo link. O progresso da Mariana é mantido.
5. A matéria também ganha um prédio por dentro. Se o Claude ainda não desenhou um prédio próprio, entra um interior padrão automático: hall com guia e livro, uma sala com um personagem para cada sala, uma ala no Castelo e baias no Estábulo. O ideal é pedir ao Claude um prédio próprio com personagens, como o Museu e a Torre.

## Vozes
- **Claude:** Antonio.
- **Narradora** (perguntas, opções e livro): Francisca.
- **Unicórnios:** Thalita, com a voz mais aguda.
- **Inglês:** Sonia (inglês britânico, como a apostila), um pouco mais devagar. Ouça as amostras 10, 11 e 12 em `amostras-de-voz/` (Sonia, Libby e Maisie, que tem voz de criança). Para trocar, edite `ingles` em `vozes` no `jogo/js/nucleo/config.js`, regrave e peça para republicar.
- Nas matérias e provas, o inglês fica entre «» no arquivo. Na tela, ele aparece destacado em azul-violeta, sem os sinais, e é falado pela voz inglesa. O resto é falado em português.
- **Português:** quando a pergunta fala de uma letra sozinha, em maiúsculas ("usando X ou CH", "a letra H"), a voz lê o nome da letra: xis, cê agá, éle agá, ene agá, ésse, dois ésses, zê, érre, dois érres, éle, agá.
- Nas palavras com um espaço para completar dentro delas (como XÍ_ARA), a voz lê só a pergunta, para não entregar a resposta.
- As falas são gravadas uma vez com as vozes naturais da leitura em voz alta do Microsoft Edge e ficam dentro do jogo. Por isso funcionam igual em todo aparelho, até sem internet.
- Nomes que a Mariana digita (como o nome do unicórnio) não são falados.
- Para regravar depois de mudar textos (roda dentro de `jogo/`):
  ```
  node ferramentas/vozes/listar-falas.js && uv run --with edge-tts python ferramentas/vozes/gerar-vozes.py && node ferramentas/vozes/empacotar-vozes.js
  ```
  Atalho, na raiz do repositório: `npm run vozes` (faz os três passos).
  Só as falas novas são gravadas; as antigas ficam em `ferramentas/gerado/vozes-cache/`.
- Se a rede cair e um pacote de vozes não chegar, o jogo tenta de novo sozinho, e na hora em que a rede volta.
- Para trocar de voz ou velocidade, edite `vozes` em `jogo/js/nucleo/config.js` e rode os mesmos comandos.
- **Personagens das construções:** cada um tem uma voz própria, gravada como as outras.
  - **Museu:** Dona Memória, Seu Antônio, Carteiro Chico, Guia Tainá, Vovó Contadeira e Restauradora Nina.
  - **Torre:** Seu Ponteiro, «Coach Ben», «Miss Stella», «Doctor Smile», «Miss Moon» e «Mister Joy» (os trechos em inglês de cada um usam a mesma voz, em inglês).
  - **Casa das Palavras:** Dona Palavrinha, Chef Manu, Jardineiro Heitor, Palhaço Chocalho, Capitã Brisa e Seu Carlos do Carrossel.
  - **Castelo:** Princesa Serena, Cavaleira Aurora, «Sir Oliver» e Cavaleira Clara. **Escola:** Diretora Margarida, Professora Helena, «Teacher Emma» e Professora Lúcia.
  - **Estábulo, Loja e Baú:** Seu Feno, Fada Pétala e Dragãozinho Tostão.
  - **Pet Shop:** Dona Aveia. **Observatório:** Doutora Vega e Robô Cosmo (com um leve efeito de robô na gravação).
  - A Doutora Vega tem voz própria: é a Francisca, a mesma voz da narradora, só que bem mais grave e um pouco mais rápida, para dar para reconhecer de ouvido.
  - O Robô Cosmo fala na velocidade normal e no mesmo volume dos outros, para as piadas ficarem claras.
  - Quando a Mariana escolhe "Tchau" depois de uma curiosidade da Vega ou de uma piada do Cosmo, o personagem se despede num balão que fecha sozinho.
  - O Carteiro Chico usa a voz do Claude, mais aguda e mais rápida.
  - Visual: Dona Palavrinha com um lápis no cabelo e um livro aberto; Jardineiro Heitor com chapéu de pescador e regador; Palhaço Chocalho com cachos verdes (visual próprio, sem lembrar palhaço famoso); Cavaleira Clara com um "A" dourado na armadura.
  - As falas são curtas para caber no balão do celular, inclusive as frases automáticas.
  - Amostras: `amostras-de-voz/` de 13 a 44 (34 Dona Aveia, 35 Doutora Vega, 36 Robô Cosmo; de 37 a 42 a Casa das Palavras, 43 a Cavaleira Clara e 44 a Professora Lúcia, já com as vozes que estão no jogo), ou todas juntas em `VOZES-DOS-PERSONAGENS.mp3`.
  - Para trocar, edite o perfil `npc-<nome>` em `vozes` no `jogo/js/nucleo/config.js` e peça ao Claude para regravar.

## Regras do jogo
- **Dinheiro:** cada sala paga uma vez. Cada matéria tem 5 salas de R$4, total de R$20. Com as 3 matérias (História, Inglês e Português), dá R$60 no total.
  - Se uma matéria tiver um número de salas que não divide R$20 certinho (6 salas, por exemplo), cada sala vale um valor redondo, de R$0,50 em R$0,50, e a sobra vem como bônus quando ela completa a matéria. Com 6 salas: R$3 por sala e R$2 de bônus no fim. O Baú e a tela da matéria mostram o bônus antes, e a tela de fim da última sala mostra "+ R$2 de bônus por completar". Nunca aparece valor quebrado, como R$3,33.
- **Matérias:**
  - **História:** no Museu das Memórias.
  - **Inglês:** na Torre do Relógio, com uma sala para cada capítulo, do 6 ao 10: Living Together, Here Comes the Sun, I Brush My Teeth Every Day, A Day in My Life e If You're Happy, Clap Your Hands.
  - **Português:** na Casa das Palavras, com o Livro das Letras e 5 salas:
    - **Receita de Quê?** 🍓: o que é uma receita, as partes dela (ingredientes e modo de preparo) e o passo a passo.
    - **O H Silencioso** 🌿: palavras que começam com H, a letra que não tem som.
    - **CH, LH, NH e o X** 🐣: palavras com CH, LH e NH, quando se usa X ou CH e os sons do X.
    - **Expedição Antártida** 🧊: o relato de viagem, o tempo no relato e o som de S (S ou SS).
    - **L, R e RR** 🎠: sílabas, o L e o R no fim da sílaba, e quando se usa R ou RR.
  - **Texto de apoio nas salas:** algumas perguntas trazem o texto para ler junto: a lista das frutas da receita (sala Receita de Quê?), trechos do relato "Chegamos?" (Expedição Antártida) e um resumo do relato do piquenique (L, R e RR). O resumo e os trechos são do jogo, não da apostila.
    - Na Expedição Antártida, cada desafio mostra só o trecho do relato de que precisa (quem escreveu, a ordem da viagem, os sinais de chegada, o combinado do iceberg), e não o resumo inteiro.
    - Nas salas, a caixa do texto vem sempre aberta.
  - Nas explicações de verdadeiro ou falso de Português, a resposta falsa começa com "É falso!".
  - Na sala CH, LH, NH e o X, NI_O aceita NINHO e NICHO, porque as duas palavras existem.
  - Na sala com S, SS, Z e X, no celular, os itens ficam um por linha.
- **Unicórnios:**
  - **Comum:** concluir uma sala.
  - **Raro:** fazer a sala com tudo certo de primeira e sem aviso de pressa, **ou** jogar a sala 3 vezes, com qualquer resultado.
  - **Épico:** um vem com ouro no Treino da Medalha **ou** com 3 treinos terminados; o outro vem acertando todas no treino **ou** com 5 treinos terminados.
  - Esse caminho da persistência existe para nenhum unicórnio depender só de perfeição. A calma chega mais rápido, mas treinar também vale. O jogo mostra quantas vezes faltam, no fim da sala e no Estábulo, em "Como ganhar".
  - O que ela já tinha jogado antes conta. Quando alguém chega ao número de vezes, o ovo aparece sozinho ao abrir o jogo.
  - Para mudar os números, edite `persistencia` em `jogo/js/nucleo/config.js`.
  - **Lendário:** completar a matéria.
- **Crescimento:** o unicórnio que está de montaria cresce quando ela acerta. Bebê anda ao lado dela; a partir de "Pequeno" ela monta. Nas cartas do Estábulo, 🌱 é a barrinha de crescimento, e 🍎, 💧 e 🛁 (uma embaixo da outra) são a fome, a sede e o banho.
- **Treino da Medalha (Castelo):**
  - abre quando todas as salas da matéria estão feitas;
  - não tem relógio;
  - tem revisão obrigatória antes de entregar;
  - a medalha é dada só pelos acertos;
  - o balão "REVISAR!" some quando ela começa a revisar, para não cobrir as questões.
- **Medalha da escola:** a medalha de ouro da prova real (R$100) é combinada fora do jogo. O jogo só lembra a Mariana de ir com calma e revisar.
- **Nadar no lago:** ela toca na água, ou anda até o lago (mouse segurado, joystick do toque ou setas do teclado), e nada, montada ou a pé. Na água anda mais devagar (60% da velocidade). Se a montaria estiver com fome ou sede, as duas lentidões se somam: na água fica com cerca de 42% da velocidade. Se ela toca em terra, o caminho dá a volta por terra. Para mudar, edite `nado` em `jogo/js/nucleo/config.js`.

## Pergunta surpresa
- De vez em quando (entre 3 e 10 minutos de jogo livre), o Claude aparece com uma pergunta das salas que ela já fez: escolha, verdadeiro/falso ou várias respostas. Sem nenhuma sala feita, a pergunta não aparece.
- Uma tentativa só. Acertou: ganha **2 estrelas**. Errou: vê a resposta certa e a explicação, e não perde nada.
- Tem "Agora não" para fechar sem responder. A pergunta não se perde: volta mais tarde, no fim da fila.
- Nunca aparece no meio de sala, treino, prova ou conversa, nem com ela andando: espera ela ficar livre e parada.
- Depois de uma sala, treino ou prova, a contagem recomeça do zero, para a pergunta não cair logo depois de ela estudar.
- Não repete enquanto o jogo está aberto; quando acabam, recomeça pelas mesmas salas.
- Para desligar: ⚙️ Ajustes → "❓ Perguntas surpresa".
- Para mudar os números: `surpresa` em `jogo/js/nucleo/config.js`.

## Construções por dentro
- **Entrar:** pisar na porta, tocar no prédio, apertar Enter perto dele ou escolher no menu Lugares. Um círculo fecha a tela e abre de novo já lá dentro.
- **Sair:** pisar no tapete vermelho com a seta.
- **Placas:**
  - No mapa, os prédios não têm mais placa com o nome. O nome e os avisos de cada lugar ficam no menu **Lugares**: 0/5 ou "Pronto" nas matérias, "Ovo" no Estábulo, "Prova" na Escola e 💧 Sede, 🍎 Fome ou 🛁 Banho na Pet Shop.
  - Dentro dos prédios, as placas dos cômodos continuam. Quando o menu do topo cobre a placa de um cômodo, ela desvia só dentro da parede do próprio cômodo. Se não couber ali, some enquanto estiver coberta. Assim ela nunca parece estar no chão ou no cômodo de baixo.
- O jogo sempre começa no mapa: o lugar dentro do prédio não é salvo.
- Os atalhos do topo (💰, ⭐, montaria, 🥚) continuam abrindo as telas direto.
- **O que tem em cada prédio:**
  - **Museu das Memórias:** hall com a Dona Memória e 5 galerias, com Seu Antônio, Carteiro Chico, Guia Tainá, Vovó Contadeira e Restauradora Nina. Cada galeria tem o quadro do seu unicórnio raro.
  - **Torre do Relógio:** térreo com o Seu Ponteiro e um andar por capítulo, pelas escadas, com «Coach Ben», «Miss Stella», «Doctor Smile», «Miss Moon» e «Mister Joy». O relógio fica no alto.
  - **Casa das Palavras:** por fora, um livro aberto com "Aa" na fachada e a porta roxa, e o mastro com a flâmula do lápis no alto. Hall com a Dona Palavrinha (lápis no cabelo e livro aberto na mão), a lista das salas, o Livro das Letras, uma poltrona de leitura e um tapete de página de caderno. Cinco cômodos, um por sala:
    - **Cozinha das Receitas:** Chef Manu, com a tigela de salada de frutas e a mesa de preparo (Receita de Quê?);
    - **Horta do H:** Jardineiro Heitor, de chapéu de pescador e regador, com canteiros de terra no chão, tomates, hibiscos e um vaso de hortelã (O H Silencioso);
    - **Pátio do Circo:** Palhaço Chocalho, com cachos verdes, nariz vermelho, bochechas rosadas e gola (a pele é a de sempre, sem rosto branco), com uma amarelinha no chão, um chocalho em pé no seu suporte, um carrinho de pipoca e um ninho com três ovinhos (CH, LH, NH e o X);
    - **Porto da Expedição:** Capitã Brisa, com o cais, um tanque com um iceberg (só a "ponta" fora da água, a maior parte embaixo), pinguins, focas e um albatroz (Expedição Antártida);
    - **Parque do Carrossel:** Seu Carlos do Carrossel, com um carrossel de unicórnios, balões e uma árvore (L, R e RR).
    - Cada cômodo tem o quadro do seu unicórnio raro.
  - **Castelo da Medalha:** Princesa Serena, o Plano da Prova na tapeçaria e a estante das medalhas. Nas alas, a Cavaleira Aurora (História), «Sir Oliver» (Inglês) e a Cavaleira Clara (Português), com um "A" dourado no peito. A ala de Português tem blocos de letras, um livro aberto e um cavalete com uma receita.
  - **Escola do Reino:** Diretora Margarida e o mural dos prêmios. Nas salas, a Professora Helena, a «Teacher Emma» e a Professora Lúcia (prova de Português).
  - **Estábulo Mágico:** Seu Feno, o ninho dos ovos e uma baia para cada unicórnio do álbum. A baia fica vazia até ele nascer. Tocar num unicórnio faz ele falar.
  - **Loja das Fadas:** Fada Pétala, vitrines e o espelho mágico. A vitrine de prêmios mostra também os de Português.
  - **Baú do Tesouro:** Dragãozinho Tostão e pilhas de moedas que crescem com o dinheiro dela. O monte grande fica cheio em R$40 e nunca encolhe quando entra uma matéria nova. As pilhas de cada matéria continuam crescendo com o dinheiro dela.
  - **Pet Shop:** a loja da Dona Aveia e o Cantinho da Água, com o bebedouro e a banheira de espuma.
  - **Observatório:** Cúpula do Telescópio, Planetário e Galeria do Espaço, com a Doutora Vega e o Robô Cosmo.
- **Ícone em cima de cada personagem:**
  - ❗ sala nova (ou treino aberto e ainda sem medalha), ✓ sala feita, 💙 o unicórnio raro já nasceu;
  - 🔒 treino fechado, 🥇🥈🥉 medalha do treino;
  - 🌈💙🤍 o que a próxima tentativa da prova vale (lendário, raro, comum);
  - 💬 conversar (guias, Seu Feno, Fada Pétala e Tostão), 🥚 ovos esperando;
  - 🍎/💧/🛁 na Dona Aveia: a montaria está com fome, com sede ou precisando de banho;
  - ✓ na professora: o prêmio daquela prova já foi ganho.
- **Conversar:** tocar no personagem ou apertar Enter ao lado dele. O balão tem "Vamos!", "Agora não" e 🔊 para ouvir de novo.
- As salas, treinos e provas são os mesmos de antes, com as mesmas regras e o mesmo dinheiro. A lista antiga continua em "Ver a lista", com o guia de cada prédio.
- Nada disso mudou o progresso salvo: tudo o que os prédios mostram vem do que ela já fez.

## Pet Shop, fome, sede e banho
- **Onde fica:** em frente ao Estábulo, do outro lado da rua de baixo. Quem atende é a **Dona Aveia**.
- **Fome e sede:** só a montaria gasta, e só enquanto ela joga (aba aberta e algum toque nos últimos 5 minutos). Jogo fechado ou parado não gasta.
  - A fome vai de cheia a zero em 120 minutos de jogo; a sede, em 60.
  - Com fome ou sede abaixo de 25, ela anda mais devagar (70% da velocidade), montada ou a pé com o bebê. Volta ao normal na hora em que as duas ficam em 25 ou mais.
  - Não perde XP, dinheiro nem unicórnio.
  - Aparece 🍎 ou 💧 em cima do unicórnio, e o menu Lugares mostra "Fome" ou "Sede" ao lado da Pet Shop.
  - **Barrinhas:** a fome é rosa-maçã, a sede é azul e o banho é verde-água. Ficam no topo, junto da montaria (no celular, o nome fica em cima e as barrinhas embaixo), e também na Pet Shop e no detalhe de cada unicórnio no Estábulo.
  - Quando uma delas fica baixa, a barrinha ganha listras e aparece escrito "Quer comer!", "Quer água!" ou "Quer banho!", sem vermelho piscando.
  - O Claude lembra com carinho, no máximo uma vez a cada 10 minutos. Se houver comida guardada, o lembrete avisa que tem comidinha na despensa. O lembrete fecha sozinho quando ela abre uma tela ou sala.
- **Comidas** (com estrelas):
  - 🥕 **Cenoura crocante:** 2 ⭐, enche 20.
  - 🍎 **Maçã do Reino:** 3 ⭐, enche 30.
  - 🌾 **Feno dourado:** 4 ⭐, enche 45.
  - 🍪 **Biscoito de aveia:** 5 ⭐, enche 60.
  - 🎂 **Bolo arco-íris:** 8 ⭐, enche tudo.
- **Onde comprar:** tocar na Dona Aveia ou na estante das comidinhas, no canto do fundo à direita da loja.
- **Comprar:** nada é gasto sem ela confirmar. Ao tocar numa comida, o jogo pergunta "Trocar N estrelas por …?" com três botões:
  - **Comprar e dar agora:** a montaria come na hora;
  - **Comprar e guardar 🧺:** a comida vai para a despensa;
  - **Agora não:** fecha sem gastar nada (é o botão que o Esc aperta).
  - Com a barriga cheia, o "dar agora" não aparece: o jogo avisa que a comidinha fica guardada para depois, antes de ela gastar.
  - Se já tem daquela comida na despensa, o primeiro botão é **Dar uma da despensa 🧺** (sem gastar estrela), com "Agora não" e "Comprar e guardar".
  - Faltando estrelas, o jogo diz quantas faltam e lembra que fazer salas dá estrelas.
  - Contra compra sem querer: os botões que gastam começam apagados e acendem depois de ~1 segundo sem toque, com uma barrinha que enche no pé do botão. O "Agora não" vale na hora, e pelo teclado não há espera.
- A comida comprada fica na **despensa**. Para dar depois: no Estábulo (botão do menu de baixo), toque no unicórnio e em "🥕 Dar comida".
- **Banho:** a terceira barrinha (🛁). Vai de limpinho a zero em 180 minutos de jogo, do mesmo jeito que a fome e a sede (só a montaria, só com ela jogando).
  - Abaixo de 25, o unicórnio fica sujinho (manchinhas no pelo e uma nuvenzinha de poeira), aparece 🛁 em cima dele (depois da sede e da fome) e o Claude lembra, dentro do mesmo limite de lembretes. Sujinho **não** fica mais lento.
  - **Onde dar:** na banheira de espuma do Cantinho da Água, dentro da Pet Shop. É de graça. Ela toca na banheira, vai até lá, desce do unicórnio e ele toma banho: entra na espuma, bolhas, escova, patinho, chuveirinho, se sacode e brilha de limpinho. Leva uns 6 segundos; depois de 2 segundos, um toque pula para o fim. Com "Animações" desligado, é só um brilho de 1 segundo.
  - Se ele já estiver limpinho, o Claude avisa e não tem banho.
- **Água:** de graça, só no bebedouro do Cantinho da Água, dentro da Pet Shop. Com sede, o detalhe do unicórnio no Estábulo lembra: "💧 Tem água fresquinha na Pet Shop, de graça!".
- **Para mudar:** os preços e quanto enche ficam em `comidas`; o ritmo (inclusive `minutosBanho`), o limite de 25 e os lembretes ficam em `cuidados`; a duração do banho fica em `banho`. Os dois em `jogo/js/nucleo/config.js` (veja "Números que dá para mudar", no fim).
- O progresso guarda a fome, a sede, o banho e a despensa. "Começar novo ciclo de provas" mantém; "Apagar tudo" zera.

## Observatório
- **Onde fica:** no morro a leste do lago, o ponto mais alto do reino.
- **Cômodos:** Cúpula do Telescópio (o telescópio mostra a Lua, Saturno, o Cruzeiro do Sul e outros), Planetário (o Sol, os 8 planetas e Plutão) e Galeria do Espaço (foguete, traje de astronauta, pedra da Lua, meteorito e constelações).
- No Planetário, os planetas ficam parados e são fáceis de tocar; nos três cômodos o chão é claro, para ela não sumir no escuro.
- **Brilho de galáxia:** paredes, chão, cúpula e telescópio em azul, roxo e magenta, com Via Láctea, halos nos planetas e nas luminárias, estrelas que piscam e trocam de cor e uma estrela cadente a cada 8 a 15 segundos. O prédio no mapa tem a cúpula com reflexo de galáxia. Com "Animações" desligado fica colorido e parado.
- **Doutora Vega:** a guia. Conta curiosidades sem repetir enquanto o jogo está aberto. Tocar nos planetas, no telescópio e nas peças da Galeria também conta uma.
- **Robô Cosmo:** conta piadas.
- São 75 curiosidades, cada uma conferida na fonte (a maioria no NASA Space Place, e também ESA Kids, Agência Espacial Brasileira e outras páginas da NASA e da ESA, além de fontes brasileiras: INPE, USP São Carlos, Agência Brasil e MundoGEO).
- **Do Brasil:** o Cruzeiro do Sul e as estrelas da bandeira, Marcos Pontes (o primeiro brasileiro no espaço), a base de Alcântara e o satélite Amazônia Um.
- É só para curiosidade: não dá estrelas nem muda o progresso.

## Fotos do jogo
- **Tirar:** o botão 📷 no topo, ao lado do botão de tela cheia. Funciona no mapa e dentro dos prédios, até nadando. Fica apagado durante a troca de tela, com uma tela ou conversa aberta e durante o banho.
- São fotos do **jogo**, não da câmera: o aparelho nunca pede para usar a câmera.
- Ao tocar: um flash branco, um clique, e a foto sai só com o cenário (sem os botões do topo e do menu), numa moldura cor-de-rosa com o nome do lugar e a data. O tamanho máximo é 1600 pixels no lado maior (PNG).
- Na prévia "Que foto linda!": **Guardar no álbum**, **Salvar no aparelho** (baixa um arquivo `reino-<lugar>-<data>.png`) ou **Apagar**.
- **Álbum:** abre pela prévia ou **segurando** o botão 📷. Mostra as fotos em grade; tocar numa abre grande, com setas, salvar e apagar (o apagar pergunta antes).
  - Guarda até **40 fotos**. Cheio, o jogo avisa e pede para apagar uma antes de guardar outra.
  - O álbum fica **só naquele aparelho** (no próprio navegador). Não vai para o progresso, nem para o computador de casa, nem para o claude.ai. Outro aparelho tem o seu próprio álbum, e limpar os dados do navegador apaga o álbum dele.
  - Se o navegador não deixar guardar (modo anônimo, por exemplo), ainda dá para salvar a foto no aparelho, e o jogo avisa com carinho.
- O menu de baixo não ganhou um botão de álbum porque não cabia no celular.

## Música
- **Ligar e desligar:** ⚙️ Ajustes → "🎵 Musiquinha". Começa desligada. Desligar o "Som" (os efeitos) não desliga a música, e vice-versa.
- Cada lugar tem a sua música, de pelo menos 20 segundos antes de repetir, e ela troca devagar (cerca de 1,5 segundo) quando ela entra ou sai de um prédio, entra ou sai do lago ou abre uma sala:
  - **Mapa:** alegre, flauta e violão. **Nadando no lago:** aquática, com eco e sininhos.
  - **Museu:** caixinha de música. **Torre:** tique-taque, xilofone e sino. **Casa das Palavras:** cozinha alegre, de ukulele. **Castelo:** medieval, nobre e calma. **Escola:** leve. **Estábulo:** campestre, com trote. **Loja das Fadas:** harpa e sininhos. **Baú:** aventura de tesouro. **Pet Shop:** fofinha e saltitante. **Observatório:** espacial.
  - **Salas de estudo:** bem suave.
  - **Treino da Medalha e provas:** a música some, para ela se concentrar, e volta ao sair.
  - Prédio sem música própria (matéria nova) usa a do mapa.
- Enquanto uma voz fala, a música abaixa. Com a aba escondida, ela para.

## Enfeites da Loja
- Na Loja das Fadas, com estrelas. Entraram encaixes novos: **pescoço**, **cauda** e **chifre**. Vale um enfeite por encaixe.
- **Novos:** Fitinha na cauda (10 ⭐), Gravata-borboleta (10 ⭐), Pompom na cauda (14 ⭐), Colar de pérolas (18 ⭐), Oculinhos de estrela (22 ⭐) e Coroa de flores (26 ⭐).
- **Do espaço:** Brinco de lua (16 ⭐), Tiara de estrelas (32 ⭐), Colar de planetas (35 ⭐), Anel de Saturno no chifre (40 ⭐) e Cometa na cauda (42 ⭐).
  - O anel de Saturno é um aro lilás atravessando o chifre, o colar tem três planetinhas em elos dourados, o cometa tem cabeça branca e rastro azul, e a tiara tem uma faixa azul-lavanda.
- Os de antes continuam iguais. A lista e os preços ficam em `jogo/js/conteudo/loja-itens.js`.

## Provas bimestrais (Escola do Reino)
- A Escola do Reino fica ao lado do Estábulo, perto da rua de baixo. No menu Lugares aparece "Prova" enquanto houver prêmio para ganhar.
- As questões são as da folha da escola, com o mesmo texto e na mesma ordem. Muda só o jeito de responder:
  - **Marcar X e V/F:** ela toca.
  - **Ligar:** ela toca num item e depois no par dele.
  - **Circular:** o item tocado ganha um círculo.
  - **Completar:** ela escolhe a palavra do quadro.
  - **Pergunta aberta:** ela monta a resposta com blocos. É a questão 6 de História, a 10 de Inglês e a 1 de Português.
  - **Figuras:** os documentos da questão 10 de História e as figuras das questões 1 e 4 de Inglês são desenhos em pixel art.
  - **Numerar (questão 8 de Inglês):** ela toca nos planetas na ordem.
  - **Desenho (questão 11 de Inglês):** ela desenha numa prancheta. A questão vale quando ela usa linhas, formas e pelo menos 2 cores.
  - **Questões pessoais (2 e 3 de Inglês):** qualquer resposta vale, porque falam da rotina dela.
- **Prova de Português ("Revisão Bimestral de Português", 12 questões):**
  - **Texto de apoio (questões 1 a 4):** a receita "Salada de frutas", com o botão 🔊 para ouvir o texto.
    - Na 1ª questão que traz o texto, ele vem aberto.
    - No celular e no tablet em pé, depois disso ele fica numa caixa em cima da pergunta que abre e fecha ("📖 Ver o texto de apoio" / "📖 Esconder"). O 🔊 fica sempre à vista.
    - No notebook (e no tablet deitado), o texto fica ao lado da pergunta.
  - **Instrução:** em cada questão, o que fazer no jogo ("Toque em X ou CH para completar cada palavra.") vem numa linha própria, com 👉, separada do enunciado da folha.
  - **Completar letras dentro da palavra:** o espaço fica no meio da palavra (MO_ILA) e ela toca nas letras do quadro (X ou CH, S ou SS, X ou Z, R ou RR).
  - **Figuras (questão 10):** 18 figuras em pixel art, na ordem da folha. Em cada uma ela escolhe CH, LH ou NH para completar o nome.
  - **Escolher e montar com letras (questão 11):** ela toca na escrita certa (PASEIO ou PASSEIO) e depois monta a palavra tocando nas letras. Tocar numa letra já colocada tira ela. Cada item vale duas partes: escolher certo e copiar certo. Pelo teclado, depois de pôr uma letra, o foco volta para a primeira letra livre.
  - **Mais de uma resposta certa:** só em duas palavras da questão 12. CA_O vale CARRO ou CARO, e CA_ETA vale CARETA ou CARRETA. Na correção aparece a da folha, com "(ou …)" para a outra. Palavras raras (como cassa, cassaco e fero) não valem, porque a prova imita a correção da professora.
- Ajustes de texto:
  - **História:** "documeto" foi corrigido para "documento" na questão 10.
  - **Inglês:** "sport´s" virou "sport's", e o "not" da questão 6 aparece em maiúsculas (NOT), porque na folha ele está em negrito.
  - **Português:**
    - "13.e)" impresso na questão 12 virou "e)".
    - O item h) da questão 8 está riscado na folha, com "REPETIDA", e ficou de fora.
    - O título "SALADA DE FRUTAS" e os itens e) a g) da questão 8 estão escritos à mão por um adulto na folha. Entraram como estão. O título é a resposta da questão 1.
- Aparece uma questão por vez. O jogo não diz se está certo nem mostra a nota no meio da prova.
- Se ela tenta avançar rápido demais, o Claude pede para ler de novo (no máximo 3 vezes por prova).
- No fim, o jogo pergunta se ela quer revisar a prova antes de ver a nota. Se ela quiser, passa por todas as questões de novo e pode trocar respostas.
- **Nota:** vai de 0 a 10, e as questões com várias partes dão ponto parcial. Em História, cada questão vale 1 ponto. Em Inglês (11 questões) e em Português (12 questões), a nota é proporcional. Só dá 10 quem acerta tudo.
- **Prêmio:** ela ganha um acessório para o unicórnio quando tira nota 10. O prêmio depende da tentativa:
  - na 1ª tentativa, um acessório **lendário**: Tiara de Arco-íris em História, Coroa do Big Ben em Inglês, Chapéu de Chef Arco-íris em Português;
  - na 2ª tentativa, um acessório **raro**: Pena Mágica em História, Óculos de Sol em Inglês, Cachecol de Pinguim em Português;
  - da 3ª em diante, um acessório **comum**: Lacinho da Vovó em História, Lacinho de Estrela em Inglês, Lacinho de Morango em Português.
- Isso aparece na capa da prova, numa faixa em cada questão e no resultado.
- Cada prova dá um acessório só. Depois disso ela vira treino (os outros dois passam a ser vendidos na Loja, veja abaixo).
- Sair no meio da prova não conta como tentativa.
- **Correção:**
  - Depois da 1ª tentativa errada, o jogo só mostra quais questões têm erro, sem dar a resposta, para ela procurar com atenção.
  - A partir da 2ª tentativa errada, e nos treinos, mostra também a resposta certa e a explicação.
- **Para exigir outra nota:** mude `notaSucessoProva` em `jogo/js/nucleo/config.js`. Hoje é 10, que quer dizer acertar tudo.
- **Onde ver os acessórios:** ela usa e troca os acessórios na Loja das Fadas, na parte "Prêmios da Escola do Reino".
- **Prêmios à venda:** depois que ela ganha um acessório numa prova, os outros dois da mesma prova passam a ser vendidos na Loja, com estrelas: comum 25 ⭐, raro 40 ⭐, lendário 70 ⭐ (`precoPremio` em `jogo/js/nucleo/config.js`).
  - A regra da prova não muda: o prêmio de verdade continua sendo só com nota 10.
  - Comprar não conta como prêmio: não muda a Área dos pais, o mural nem o arco-íris da Escola.
- **Área dos pais:** mostra as tentativas, as notas de cada tentativa e o prêmio ganho.
- **Nova prova:** mande as fotos da folha para o Claude. Ele cria `jogo/js/conteudo/provas/<matéria>-<bimestre>.js` com três acessórios novos, acrescenta a linha no `jogo/js/manifesto.js`, roda `npm run index`, grava as vozes e republica. A prova nova ganha uma sala de aula na Escola do Reino, com um professor (um padrão, se não houver um próprio).

## Jogo no computador de casa
- Endereço na rede de casa: **http://reinodosunicornios.local** (ou pelo IP do PC, ex.: http://192.168.1.247).
- Roda no Docker (container `reino-unicornios`, volta sozinho quando o PC liga). Reiniciar: `cd "jogo/servidor" && docker compose restart`.
- O progresso fica no banco `jogo/servidor/dados/reino.db` (SQLite), com as últimas 50 versões guardadas como backup.
- O nome `reinodosunicornios.local` vem do serviço `systemctl --user status reino-nome`.

## Cópia de segurança da comida e dos cuidados
- Além do progresso normal (`mariana-reino-v1`), cada navegador guarda uma segunda chave: **`mariana-reino-v1-novidades`**. Ela tem só a fome, a sede, o banho, a despensa e o interruptor das perguntas surpresa. Fica em cada aparelho (não vai para o servidor nem para o claude.ai) e não guarda os enfeites.
- **Por que existe:** uma aba com a versão antiga do jogo não conhece esses campos. Se ela gravar por último, apaga a comida comprada e os cuidados do progresso normal. A versão antiga não conhece a cópia e não mexe nela. Por isso, ao abrir o jogo e a cada sincronização, o que faltar volta da cópia, com as mesmas regras de sempre: vale a despensa maior e o cuidado mais recente.
- **Não apague essa chave.** Se for limpar alguma coisa à mão no navegador, deixe as duas chaves do jogo.
- "Apagar tudo" não traz nada de volta dessa cópia: depois dele, ela é ignorada e regravada na próxima vez que o jogo salvar.

## Dia de atualizar o jogo (servidor de casa e claude.ai juntos)
- O servidor de casa e o link do claude.ai guardam o progresso em lugares separados, e nada copia de um para o outro. Mesmo assim, os dois precisam ser atualizados no mesmo dia:
  - se só um lado tiver a Pet Shop e o Observatório, ela compra comida ou enfeite num lado e não acha no outro, e para ela isso é "sumiu";
  - uma aba ainda aberta com o jogo antigo tira o enfeite novo que ela está usando (a compra fica, é só vestir de novo) e pode apagar a comida comprada;
  - uma aba com o jogo antigo não conhece o banho: se ela gravar por último, o banho some do progresso daquele lado e só volta pela cópia de segurança do aparelho novo;
  - uma aba com o jogo **antigo** aberta, com a montaria sendo um unicórnio de Português, dá erro: a personagem some do mapa e a Loja não abre. O progresso não se perde, mas essa aba precisa ser fechada e aberta de novo.
- **Passo a passo:**
  1. Escolha um horário em que a Mariana não esteja jogando.
  2. Em **todos** os aparelhos (tablet, celular, notebook), feche as abas do jogo: a do computador de casa (reinodosunicornios.local ou o IP) e a do claude.ai. É fechar a aba mesmo, não só trocar de aba. No celular e no tablet, feche também no seletor de abas e de apps. Não deixe **nenhuma** aba antiga aberta, nem esquecida em outro aparelho: o jogo antigo não conhece o Português.
  3. Peça ao Claude para fazer o merge e republicar o link do claude.ai. O computador de casa passa a servir o jogo novo na hora do merge: não precisa reiniciar o Docker.
  4. Espere **uns 5 minutos** depois do merge. O servidor de casa deixa os arquivos do jogo guardados no navegador por até 5 minutos (300 s), e antes disso uma aba nova pode misturar arquivos novos com antigos.
  5. Abra um aparelho só, no computador de casa. Confira se aparece a barrinha 🛁 do banho junto da montaria, o botão 📷 no topo, a banheira dentro da Pet Shop, e se as estrelas, as salas e os unicórnios estão como antes. Se algo estiver estranho, recarregue a página.
  6. Depois abra o link do claude.ai num aparelho e confira do mesmo jeito.
  7. Só então libere os outros aparelhos, abrindo o jogo numa aba nova.
  8. Nos primeiros dias, se achar alguma aba esquecida de antes, feche e abra de novo antes de ela jogar.
- **Se algo parecer errado** (estrelas, salas ou unicórnios): não apague nada nem use "Apagar tudo". Deixe o jogo fechado e peça ao Claude para olhar. O computador de casa guarda as últimas 50 versões do progresso.

## Limitações conhecidas
- **Dois aparelhos gastando estrelas quase ao mesmo tempo:** as duas compras podem virar uma só na sincronização. As estrelas nunca ficam negativas.
- **Aba com o jogo ANTIGO aberta no dia de atualizar:** quando ela troca um enfeite ou grava por cima nessa aba, os enfeites e acessórios novos saem do unicórnio (a compra não se perde: é só vestir de novo na Loja). Se a montaria for um unicórnio de Português, a aba antiga dá erro: a personagem some do mapa e a Loja não abre (o progresso fica; é fechar a aba e abrir de novo). E, no mesmo aparelho, se a cópia de segurança não estiver lá, a comida comprada pode sumir de vez, com as estrelas já gastas. Por isso, nenhuma aba antiga pode ficar aberta: siga o passo a passo do dia de atualizar, acima.

## Números que dá para mudar (`jogo/js/nucleo/config.js`)
Depois de mudar, peça ao Claude para republicar.
- **`comidas`:** cada comida tem `nome`, `icone`, `preco` (estrelas) e `fome` (quanto enche, de 0 a 100). O bolo tem `enche: true`, que enche tudo. Hoje: cenoura 2 ⭐/20, maçã 3 ⭐/30, feno 4 ⭐/45, biscoito 5 ⭐/60, bolo 8 ⭐/tudo. **Não troque o `id`:** a despensa guarda a comida por ele.
- **`cuidados`:**
  - `minutosFome: 120`, `minutosSede: 60` e `minutosBanho: 180`: minutos de jogo para ir de cheia (ou limpinho) a zero;
  - `baixo: 25`: abaixo disso aparece o aviso; com fome ou sede o unicórnio fica mais lento (com banho baixo, só fica sujinho);
  - `fatorLento: 0.7`: a velocidade com fome ou sede (70%);
  - `semToqueMs`: sem toque há 5 minutos, ela parou de jogar e nada gasta;
  - `lembreteMs`: no máximo um lembrete do Claude a cada 10 minutos;
  - `gravarMs` e `gravarPontos`: de quanto em quanto tempo o jogo grava a fome e a sede (60 s ou 10 pontos). Melhor não mexer.
- **`surpresa`:** `minMinutos: 3` e `maxMinutos: 10` (o intervalo sorteado), `estrelas: 2` (o prêmio), `esperaLivreMs: 4000` (se o tempo acaba com ela ocupada, a pergunta espera ela ficar 4 segundos livre) e `tipos` (escolha, verdadeiro/falso, várias). Se mudar `estrelas`, peça também para regravar as vozes, porque o Claude fala o valor.
- **`banho`:** `duracaoMs: 6000` (a animação do banho), `duracaoCurtaMs: 1000` (sem Animações) e `pularDepoisMs: 2000` (depois disso um toque pula para o fim).
- **`fotos`:** `maxLado: 1600` (tamanho máximo da foto), `maxAlbum: 40` (fotos no álbum de cada aparelho) e `toqueLongoMs: 600` (quanto segurar o 📷 para abrir o álbum). Não troque o `banco`, senão o álbum parece vazio.
- **`musica`:** `volume` (0.22), `crossfadeS` (1,5 s de troca), `comVoz` (a música fica em 30% enquanto uma voz fala). Melhor não mexer em `lookaheadS` e `intervaloMs`.
- **`nado`:** `fator: 0.6` (a velocidade na água, 60%) e `custo: 3` (quanto a água "pesa" na hora de escolher o caminho: com 3, ela prefere dar a volta por terra).
- **`precoPremio`:** o preço dos acessórios das provas à venda na Loja: `comum: 25`, `raro: 40`, `lendario: 70`.
