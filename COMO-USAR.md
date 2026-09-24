# Mariana e o Reino dos Unicórnios

## Como jogar
- **Tablet, celular ou notebook (recomendado):** abra https://claude.ai/artifact/CQUd5TWJQW3fWWw5Cvg77U
  - Precisa estar logado no claude.ai com a sua conta nesses aparelhos, porque o link é privado.
  - O progresso é sincronizado entre os aparelhos.
  - O jogo só começa depois de buscar o progresso guardado, no claude.ai ou no computador de casa. Por isso, um aparelho novo já abre com o progresso dela.
  - Se aparecer "O reino não abriu agora", o jogo não conseguiu buscar o progresso. Confira a internet, ou o computador de casa, e toque em "Tentar de novo". Até isso dar certo, o jogo não começa.
- **Só no notebook, sem internet para o jogo:** abra `jogo/index.html` com duplo clique.
  - Nesse modo o progresso fica salvo só naquele navegador.

## Área dos pais
- Fica em ⚙️ Ajustes → 🔒 Área dos pais.
- PIN: **2026**. Para trocar, edite `pinPais` em `jogo/js/config.js` e peça ao Claude para republicar.
- Na área dos pais dá para:
  - ver quanto ela ganhou por matéria;
  - registrar o que já foi pago;
  - começar um novo ciclo de provas, que zera salas e dinheiro e mantém os unicórnios.

## Nova matéria
1. Salve os prints numa pasta `Mariana Revisões/<Matéria>/`, por exemplo `Mariana Revisões/Geografia/`.
2. Peça ao Claude para criar a matéria no reino.
3. O Claude cria um lugar novo no mapa, com salas que somam R$20, os desafios da apostila, o livro-resumo e os unicórnios da matéria.
4. O Claude grava as vozes das falas novas e republica no mesmo link. O progresso da Mariana é mantido.
5. A matéria também ganha um prédio por dentro. Se o Claude ainda não desenhou um prédio próprio, entra um interior padrão automático: hall com guia e livro, uma sala com um personagem para cada sala, uma ala no Castelo e baias no Estábulo. O ideal é pedir ao Claude um prédio próprio com personagens, como o Museu e a Torre.

## Vozes
- **Claude:** Antonio.
- **Narradora** (perguntas, opções e livro): Francisca.
- **Unicórnios:** Thalita, com a voz mais aguda.
- **Inglês:** Sonia (inglês britânico, como a apostila), um pouco mais devagar. Ouça as amostras 10, 11 e 12 em `amostras-de-voz/` (Sonia, Libby e Maisie, que tem voz de criança). Para trocar, edite `ingles` em `vozes` no `jogo/js/config.js`, regrave e peça para republicar.
- Nas matérias e provas, o inglês fica entre «» no arquivo. Na tela, ele aparece destacado em azul-violeta, sem os sinais, e é falado pela voz inglesa. O resto é falado em português.
- As falas são gravadas uma vez com as vozes naturais da leitura em voz alta do Microsoft Edge e ficam dentro do jogo. Por isso funcionam igual em todo aparelho, até sem internet.
- Nomes que a Mariana digita (como o nome do unicórnio) não são falados.
- Para regravar depois de mudar textos (roda dentro de `jogo/`):
  ```
  node ferramentas/listar-falas.js && uv run --with edge-tts python ferramentas/gerar-vozes.py && node ferramentas/empacotar-vozes.js
  ```
  Só as falas novas são gravadas; as antigas ficam em `ferramentas/vozes-cache/`.
- Para trocar de voz ou velocidade, edite `vozes` em `jogo/js/config.js` e rode os mesmos comandos.
- **Personagens das construções:** cada um tem uma voz própria, gravada como as outras.
  - **Museu:** Dona Memória, Seu Antônio, Carteiro Chico, Guia Tainá, Vovó Contadeira e Restauradora Nina.
  - **Torre:** Seu Ponteiro, «Coach Ben», «Miss Stella», «Doctor Smile», «Miss Moon» e «Mister Joy» (os trechos em inglês de cada um usam a mesma voz, em inglês).
  - **Castelo:** Princesa Serena, Cavaleira Aurora e «Sir Oliver». **Escola:** Diretora Margarida, Professora Helena e «Teacher Emma».
  - **Estábulo, Loja e Baú:** Seu Feno, Fada Pétala e Dragãozinho Tostão.
  - **Pet Shop:** Dona Aveia. **Observatório:** Doutora Vega e Robô Cosmo (com um leve efeito de robô na gravação).
  - O Carteiro Chico usa a voz do Claude, mais aguda e mais rápida.
  - As falas são curtas para caber no balão do celular.
  - Amostras: `amostras-de-voz/` de 13 a 36 (34 Dona Aveia, 35 Doutora Vega, 36 Robô Cosmo). As de 13 a 33 também estão juntas em `VOZES-DOS-PERSONAGENS.mp3`.
  - Para trocar, edite o perfil `npc-<nome>` em `vozes` no `jogo/js/config.js` e peça ao Claude para regravar.

## Regras do jogo
- **Dinheiro:** cada sala paga uma vez. Cada matéria tem 5 salas de R$4, total de R$20.
- **Matérias:**
  - **História:** no Museu das Memórias.
  - **Inglês:** na Torre do Relógio, com uma sala para cada capítulo, do 6 ao 10: Living Together, Here Comes the Sun, I Brush My Teeth Every Day, A Day in My Life e If You're Happy, Clap Your Hands.
- **Unicórnios:**
  - **Comum:** concluir uma sala.
  - **Raro:** fazer a sala com tudo certo de primeira e sem aviso de pressa, **ou** jogar a sala 3 vezes, com qualquer resultado.
  - **Épico:** um vem com ouro no Treino da Medalha **ou** com 3 treinos terminados; o outro vem acertando todas no treino **ou** com 5 treinos terminados.
  - Esse caminho da persistência existe para nenhum unicórnio depender só de perfeição. A calma chega mais rápido, mas treinar também vale. O jogo mostra quantas vezes faltam, no fim da sala e no Estábulo, em "Como ganhar".
  - O que ela já tinha jogado antes conta. Quando alguém chega ao número de vezes, o ovo aparece sozinho ao abrir o jogo.
  - Para mudar os números, edite `persistencia` em `jogo/js/config.js`.
  - **Lendário:** completar a matéria.
- **Crescimento:** o unicórnio que está de montaria cresce quando ela acerta. Bebê anda ao lado dela; a partir de "Pequeno" ela monta.
- **Treino da Medalha (Castelo):**
  - abre quando todas as salas da matéria estão feitas;
  - não tem relógio;
  - tem revisão obrigatória antes de entregar;
  - a medalha é dada só pelos acertos.
- **Medalha da escola:** a medalha de ouro da prova real (R$100) é combinada fora do jogo. O jogo só lembra a Mariana de ir com calma e revisar.
- **Nadar no lago:** ela toca na água ou anda com as setas até o lago, e nada com o unicórnio. Na água anda mais devagar (60%). Se ela toca em terra, o caminho dá a volta por terra. Para mudar, edite `nado` em `jogo/js/config.js`.

## Pergunta surpresa
- De vez em quando (entre 3 e 10 minutos de jogo livre), o Claude aparece com uma pergunta das salas: escolha, verdadeiro/falso ou várias respostas.
- Acertou de primeira: ganha **2 estrelas**. Errou: vê a explicação e não perde nada.
- Tem "Agora não" para fechar sem responder.
- Nunca aparece no meio de sala, treino, prova ou conversa: espera ela ficar livre.
- Para desligar: ⚙️ Ajustes → "❓ Perguntas surpresa".
- Para mudar os números: `surpresa` em `jogo/js/config.js`.

## Construções por dentro
- **Entrar:** pisar na porta, tocar no prédio ou na placa, apertar Enter perto dele ou escolher no menu Lugares. Um círculo fecha a tela e abre de novo já lá dentro.
- **Sair:** pisar no tapete vermelho com a seta.
- O jogo sempre começa no mapa: o lugar dentro do prédio não é salvo.
- Os atalhos do topo (💰, ⭐, montaria, 🥚) continuam abrindo as telas direto.
- **O que tem em cada prédio:**
  - **Museu das Memórias:** hall com a Dona Memória e 5 galerias, com Seu Antônio, Carteiro Chico, Guia Tainá, Vovó Contadeira e Restauradora Nina. Cada galeria tem o quadro do seu unicórnio raro.
  - **Torre do Relógio:** térreo com o Seu Ponteiro e um andar por capítulo, pelas escadas, com «Coach Ben», «Miss Stella», «Doctor Smile», «Miss Moon» e «Mister Joy». O relógio fica no alto.
  - **Castelo da Medalha:** Princesa Serena, o Plano da Prova na tapeçaria e a estante das medalhas. Nas alas, a Cavaleira Aurora (História) e «Sir Oliver» (Inglês).
  - **Escola do Reino:** Diretora Margarida e o mural dos prêmios. Nas salas, a Professora Helena e a «Teacher Emma».
  - **Estábulo Mágico:** Seu Feno, o ninho dos ovos e uma baia para cada unicórnio do álbum. A baia fica vazia até ele nascer. Tocar num unicórnio faz ele falar.
  - **Loja das Fadas:** Fada Pétala, vitrines e o espelho mágico.
  - **Baú do Tesouro:** Dragãozinho Tostão e pilhas de moedas que crescem com o dinheiro dela.
  - **Pet Shop:** a loja da Dona Aveia e o Cantinho da Água, com o bebedouro.
  - **Observatório:** Cúpula do Telescópio, Planetário e Galeria do Espaço, com a Doutora Vega e o Robô Cosmo.
- **Ícone em cima de cada personagem:**
  - ❗ sala nova (ou treino aberto e ainda sem medalha), ✓ sala feita, 💙 o unicórnio raro já nasceu;
  - 🔒 treino fechado, 🥇🥈🥉 medalha do treino;
  - 🌈💙🤍 o que a próxima tentativa da prova vale (lendário, raro, comum);
  - 💬 conversar (guias, Seu Feno, Fada Pétala e Tostão), 🥚 ovos esperando;
  - 🍎/💧 na Dona Aveia: a montaria está com fome ou com sede;
  - ✓ na professora: o prêmio daquela prova já foi ganho.
- **Conversar:** tocar no personagem ou apertar Enter ao lado dele. O balão tem "Vamos!", "Agora não" e 🔊 para ouvir de novo.
- As salas, treinos e provas são os mesmos de antes, com as mesmas regras e o mesmo dinheiro. A lista antiga continua em "Ver a lista", com o guia de cada prédio.
- Nada disso mudou o progresso salvo: tudo o que os prédios mostram vem do que ela já fez.

## Pet Shop, fome e sede
- **Onde fica:** em frente ao Estábulo, do outro lado da rua de baixo. Quem atende é a **Dona Aveia**.
- **Fome e sede:** só a montaria gasta, e só enquanto ela joga (aba aberta e algum toque nos últimos 5 minutos). Jogo fechado ou parado não gasta.
  - A fome vai de cheia a zero em 120 minutos de jogo; a sede, em 60.
  - Abaixo de 25, o unicórnio anda mais devagar (70%). Comeu ou bebeu, volta ao normal na hora.
  - Não perde XP, dinheiro nem unicórnio.
  - Aparece 🍎 ou 💧 em cima do unicórnio, as barrinhas ficam no topo, junto da montaria, e a placa da Pet Shop mostra "Fome" ou "Sede".
  - O Claude lembra com carinho, no máximo uma vez a cada 10 minutos.
- **Comidas** (com estrelas):
  - 🥕 **Cenoura crocante:** 2 ⭐, enche 20.
  - 🍎 **Maçã do Reino:** 3 ⭐, enche 30.
  - 🌾 **Feno dourado:** 4 ⭐, enche 45.
  - 🍪 **Biscoito de aveia:** 5 ⭐, enche 60.
  - 🎂 **Bolo arco-íris:** 8 ⭐, enche tudo.
- A comida comprada vai para a **despensa**. Dá para dar na hora ou depois, em "Dar comida", no Estábulo.
- **Água:** de graça, só no bebedouro do Cantinho da Água, dentro da Pet Shop.
- **Para mudar:** os preços e quanto enche ficam em `comidas`; o ritmo, o limite de 25 e os lembretes ficam em `cuidados`. Os dois em `jogo/js/config.js`.
- O progresso guarda a fome, a sede e a despensa. "Novo ciclo" mantém; "Apagar tudo" zera.

## Observatório
- **Onde fica:** no morro a leste do lago, o ponto mais alto do reino.
- **Cômodos:** Cúpula do Telescópio (o telescópio mostra a Lua, Saturno, o Cruzeiro do Sul e outros), Planetário (o Sol, os 8 planetas e Plutão) e Galeria do Espaço (foguete, traje de astronauta, pedra da Lua, meteorito e constelações).
- **Doutora Vega:** a guia. Conta curiosidades sem repetir.
- **Robô Cosmo:** conta piadas.
- São 75 curiosidades, cada uma conferida na fonte (a maioria no NASA Space Place, e também ESA Kids, Agência Espacial Brasileira e outras páginas da NASA, da ESA e do INPE).
- **Do Brasil:** o Cruzeiro do Sul e as estrelas da bandeira, Marcos Pontes (o primeiro brasileiro no espaço) e a base de Alcântara.
- É só para curiosidade: não dá estrelas nem muda o progresso.

## Enfeites da Loja
- Na Loja das Fadas, com estrelas. Entraram encaixes novos: **pescoço**, **cauda** e **chifre**. Vale um enfeite por encaixe.
- **Novos:** Fitinha na cauda (10 ⭐), Gravata-borboleta (10 ⭐), Pompom na cauda (14 ⭐), Colar de pérolas (18 ⭐), Óculos de estrela (22 ⭐) e Coroa de flores (26 ⭐).
- **Do espaço:** Brinco de lua (16 ⭐), Tiara de estrelas (32 ⭐), Colar de planetas (35 ⭐), Anel de Saturno no chifre (40 ⭐) e Cometa na cauda (42 ⭐).
- Os de antes continuam iguais. A lista e os preços ficam em `jogo/js/loja-itens.js`.

## Provas bimestrais (Escola do Reino)
- A Escola do Reino fica ao lado do Estábulo, perto da rua de baixo. A plaquinha mostra "Prova" enquanto houver prêmio para ganhar.
- As questões são as da folha da escola, com o mesmo texto e na mesma ordem. Muda só o jeito de responder:
  - **Marcar X e V/F:** ela toca.
  - **Ligar:** ela toca num item e depois no par dele.
  - **Circular:** o item tocado ganha um círculo.
  - **Completar:** ela escolhe a palavra do quadro.
  - **Pergunta aberta:** ela monta a resposta com blocos. É a questão 6 de História e a 10 de Inglês.
  - **Figuras:** os documentos da questão 10 de História e as figuras das questões 1 e 4 de Inglês são desenhos em pixel art.
  - **Numerar (questão 8 de Inglês):** ela toca nos planetas na ordem.
  - **Desenho (questão 11 de Inglês):** ela desenha numa prancheta. A questão vale quando ela usa linhas, formas e pelo menos 2 cores.
  - **Questões pessoais (2 e 3 de Inglês):** qualquer resposta vale, porque falam da rotina dela.
- Ajustes de texto:
  - **História:** "documeto" foi corrigido para "documento" na questão 10.
  - **Inglês:** "sport´s" virou "sport's", e o "not" da questão 6 aparece em maiúsculas (NOT), porque na folha ele está em negrito.
- Aparece uma questão por vez. O jogo não diz se está certo nem mostra a nota no meio da prova.
- Se ela tenta avançar rápido demais, o Claude pede para ler de novo (no máximo 3 vezes por prova).
- No fim, o jogo pergunta se ela quer revisar a prova antes de ver a nota. Se ela quiser, passa por todas as questões de novo e pode trocar respostas.
- **Nota:** vai de 0 a 10, e as questões com várias partes dão ponto parcial. Em História, cada questão vale 1 ponto. Em Inglês, que tem 11 questões, a nota é proporcional. Só dá 10 quem acerta tudo.
- **Prêmio:** ela ganha um acessório para o unicórnio quando tira nota 10. O prêmio depende da tentativa:
  - na 1ª tentativa, um acessório **lendário**: Tiara de Arco-íris em História, Coroa do Big Ben em Inglês;
  - na 2ª tentativa, um acessório **raro**: Pena Mágica em História, Óculos de Sol em Inglês;
  - da 3ª em diante, um acessório **comum**: Lacinho da Vovó em História, Lacinho de Estrela em Inglês.
- Isso aparece na capa da prova, numa faixa em cada questão e no resultado.
- Cada prova dá um acessório só. Depois disso ela vira treino (os outros dois passam a ser vendidos na Loja, veja abaixo).
- Sair no meio da prova não conta como tentativa.
- **Correção:**
  - Depois da 1ª tentativa errada, o jogo só mostra quais questões têm erro, sem dar a resposta, para ela procurar com atenção.
  - A partir da 2ª tentativa errada, e nos treinos, mostra também a resposta certa e a explicação.
- **Para exigir outra nota:** mude `notaSucessoProva` em `jogo/js/config.js`. Hoje é 10, que quer dizer acertar tudo.
- **Onde ver os acessórios:** ela usa e troca os acessórios na Loja das Fadas, na parte "Prêmios da Escola do Reino".
- **Prêmios à venda:** depois que ela ganha um acessório numa prova, os outros dois da mesma prova passam a ser vendidos na Loja, com estrelas: comum 25 ⭐, raro 40 ⭐, lendário 70 ⭐ (`precoPremio` em `jogo/js/config.js`).
  - A regra da prova não muda: o prêmio de verdade continua sendo só com nota 10.
  - Comprar não conta como prêmio: não muda a Área dos pais, o mural nem o arco-íris da Escola.
- **Área dos pais:** mostra as tentativas, as notas de cada tentativa e o prêmio ganho.
- **Nova prova:** mande as fotos da folha para o Claude. Ele cria `jogo/js/provas/<matéria>-<bimestre>.js` com três acessórios novos, grava as vozes e republica. A prova nova ganha uma sala de aula na Escola do Reino, com um professor (um padrão, se não houver um próprio).

## Jogo no computador de casa
- Endereço na rede de casa: **http://reinodosunicornios.local** (ou pelo IP do PC, ex.: http://192.168.1.247).
- Roda no Docker (container `reino-unicornios`, volta sozinho quando o PC liga). Reiniciar: `cd "jogo/servidor" && docker compose restart`.
- O progresso fica no banco `jogo/servidor/dados/reino.db` (SQLite), com as últimas 50 versões guardadas como backup.
- O nome `reinodosunicornios.local` vem do serviço `systemctl --user status reino-nome`.
