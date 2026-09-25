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
  - A Doutora Vega tem voz própria: é a Francisca, a mesma voz da narradora, só que bem mais grave e um pouco mais rápida, para dar para reconhecer de ouvido.
  - O Robô Cosmo fala na velocidade normal e um pouco mais alto que antes, para as piadas ficarem claras.
  - Quando a Mariana escolhe "Tchau" depois de uma curiosidade da Vega ou de uma piada do Cosmo, o personagem se despede num balão que fecha sozinho.
  - O Carteiro Chico usa a voz do Claude, mais aguda e mais rápida.
  - As falas são curtas para caber no balão do celular.
  - Amostras: `amostras-de-voz/` de 13 a 36 (34 Dona Aveia, 35 Doutora Vega, 36 Robô Cosmo, já com as vozes que estão no jogo), ou todas juntas em `VOZES-DOS-PERSONAGENS.mp3`.
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
- **Nadar no lago:** ela toca na água ou anda com as setas até o lago, e nada com o unicórnio. Na água anda mais devagar (60% da velocidade). Se ela toca em terra, o caminho dá a volta por terra. Para mudar, edite `nado` em `jogo/js/config.js`.

## Pergunta surpresa
- De vez em quando (entre 3 e 10 minutos de jogo livre), o Claude aparece com uma pergunta das salas: escolha, verdadeiro/falso ou várias respostas.
- Uma tentativa só. Acertou: ganha **2 estrelas**. Errou: vê a resposta certa e a explicação, e não perde nada.
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
  - Com fome ou sede abaixo de 25, o unicórnio anda mais devagar (70% da velocidade). Volta ao normal na hora em que as duas ficam em 25 ou mais.
  - Não perde XP, dinheiro nem unicórnio.
  - Aparece 🍎 ou 💧 em cima do unicórnio, e a placa da Pet Shop, em cima do telhado, mostra "Fome" ou "Sede" (a sede aparece primeiro).
  - **Barrinhas:** a fome é rosa-maçã e a sede é azul. Ficam no topo, junto da montaria (no celular, o nome fica em cima e as barrinhas embaixo), e também na Pet Shop e no detalhe de cada unicórnio no Estábulo.
  - Quando uma delas fica baixa, a barrinha ganha listras e aparece escrito "Quer comer!" ou "Quer água!", sem vermelho piscando.
  - O Claude lembra com carinho, no máximo uma vez a cada 10 minutos. O lembrete fecha sozinho quando ela abre uma tela ou sala.
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
  - Faltando estrelas, aparece "Faltam N estrelas! Uma sala dá estrelas."
  - Tocar duas vezes seguidas sem querer no mesmo botão não gasta estrela duas vezes.
- A comida comprada fica na **despensa**. Para dar depois: no Estábulo (botão do menu de baixo), toque no unicórnio e em "🥕 Dar comida".
- **Água:** de graça, só no bebedouro do Cantinho da Água, dentro da Pet Shop. Com sede, o detalhe do unicórnio no Estábulo lembra: "💧 Tem água fresquinha na Pet Shop, de graça!".
- **Para mudar:** os preços e quanto enche ficam em `comidas`; o ritmo, o limite de 25 e os lembretes ficam em `cuidados`. Os dois em `jogo/js/config.js` (veja "Números que dá para mudar", no fim).
- O progresso guarda a fome, a sede e a despensa. "Novo ciclo" mantém; "Apagar tudo" zera.

## Observatório
- **Onde fica:** no morro a leste do lago, o ponto mais alto do reino.
- **Cômodos:** Cúpula do Telescópio (o telescópio mostra a Lua, Saturno, o Cruzeiro do Sul e outros), Planetário (o Sol, os 8 planetas e Plutão) e Galeria do Espaço (foguete, traje de astronauta, pedra da Lua, meteorito e constelações).
- **Planetário:** o chão tem uma galáxia azul-clara, com braços de luz e estrelas, e a Mariana aparece bem em cima dela. Os planetas ficam parados (só as luas andam, devagar), e o toque de cada um segue o próprio desenho, até a ponta dos anéis de Saturno.
- Os pisos dos três cômodos são mais claros que o céu e as paredes, para ela e o unicórnio não sumirem no escuro. A placa do Observatório fica em cima da cúpula.
- **Doutora Vega:** a guia. Conta curiosidades sem repetir enquanto o jogo está aberto. Tocar nos planetas, no telescópio e nas peças da Galeria também conta uma.
- **Robô Cosmo:** conta piadas.
- São 75 curiosidades, cada uma conferida na fonte (a maioria no NASA Space Place, e também ESA Kids, Agência Espacial Brasileira e outras páginas da NASA, da ESA e do INPE).
- **Do Brasil:** o Cruzeiro do Sul e as estrelas da bandeira, Marcos Pontes (o primeiro brasileiro no espaço), a base de Alcântara e o satélite Amazônia Um.
- É só para curiosidade: não dá estrelas nem muda o progresso.

## Enfeites da Loja
- Na Loja das Fadas, com estrelas. Entraram encaixes novos: **pescoço**, **cauda** e **chifre**. Vale um enfeite por encaixe.
- **Novos:** Fitinha na cauda (10 ⭐), Gravata-borboleta (10 ⭐), Pompom na cauda (14 ⭐), Colar de pérolas (18 ⭐), Oculinhos de estrela (22 ⭐) e Coroa de flores (26 ⭐).
- **Do espaço:** Brinco de lua (16 ⭐), Tiara de estrelas (32 ⭐), Colar de planetas (35 ⭐), Anel de Saturno no chifre (40 ⭐) e Cometa na cauda (42 ⭐).
  - Foram redesenhados para aparecer bem no jogo: o anel de Saturno é um aro lilás atravessando o chifre, o colar tem três planetinhas presos em elos dourados, o cometa tem cabeça branca e rastro azul, e a tiara tem uma faixa azul-lavanda. O brinco de lua continua à vista com ela montada.
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

## Cópia de segurança da comida e dos cuidados
- Além do progresso normal (`mariana-reino-v1`), cada navegador guarda uma segunda chave: **`mariana-reino-v1-novidades`**. Ela tem só a fome, a sede, a despensa e o interruptor das perguntas surpresa.
- **Por que existe:** uma aba com a versão antiga do jogo não conhece esses campos. Se ela gravar por último, apaga a comida comprada e os cuidados do progresso normal. A versão antiga não conhece a cópia e não mexe nela. Por isso, ao abrir o jogo e a cada sincronização, o que faltar volta da cópia, com as mesmas regras de sempre: vale a despensa maior e o cuidado mais recente.
- **Não apague essa chave.** Se for limpar alguma coisa à mão no navegador, deixe as duas chaves do jogo.
- "Apagar tudo" não traz nada de volta dessa cópia: depois dele, ela é ignorada e regravada na próxima vez que o jogo salvar.

## Dia de atualizar o jogo (servidor de casa e claude.ai juntos)
- O servidor de casa e o link do claude.ai guardam o progresso em lugares separados, e nada copia de um para o outro. Mesmo assim, os dois precisam ser atualizados no mesmo dia:
  - se só um lado tiver a Pet Shop e o Observatório, ela compra comida ou enfeite num lado e não acha no outro, e para ela isso é "sumiu";
  - uma aba ainda aberta com o jogo antigo tira o enfeite novo que ela está usando (a compra fica, é só vestir de novo) e pode apagar a comida comprada.
- **Passo a passo:**
  1. Escolha um horário em que a Mariana não esteja jogando.
  2. Em **todos** os aparelhos (tablet, celular, notebook), feche as abas do jogo: a do computador de casa (reinodosunicornios.local ou o IP) e a do claude.ai. É fechar a aba mesmo, não só trocar de aba. No celular e no tablet, feche também no seletor de abas e de apps.
  3. Peça ao Claude para fazer o merge e republicar o link do claude.ai. O computador de casa passa a servir o jogo novo na hora do merge: não precisa reiniciar o Docker.
  4. Espere **uns 5 minutos** depois do merge. O servidor de casa deixa os arquivos do jogo guardados no navegador por até 5 minutos (300 s), e antes disso uma aba nova pode misturar arquivos novos com antigos.
  5. Abra um aparelho só, no computador de casa. Confira se aparecem a Pet Shop, o Observatório e o lago, e se as estrelas, as salas e os unicórnios estão como antes. Se algo estiver estranho, recarregue a página.
  6. Depois abra o link do claude.ai num aparelho e confira do mesmo jeito.
  7. Só então libere os outros aparelhos, abrindo o jogo numa aba nova.
  8. Nos primeiros dias, se achar alguma aba esquecida de antes, feche e abra de novo antes de ela jogar.

## Limitações conhecidas
- **Dois aparelhos comprando comida quase ao mesmo tempo:** as duas compras podem virar uma só na sincronização. As estrelas nunca ficam negativas.
- **Dois aparelhos abertos ao mesmo tempo:** o que muda num deles só aparece no outro quando algum dos dois grava de novo (por exemplo, quando ela faz alguma coisa no jogo).
- **Duas abas do jogo no mesmo navegador:** podem perder progresso uma da outra. Isso já era assim antes das novidades. Deixe uma aba só.
- **Aba com o jogo antigo aberta:** quando ela troca um enfeite nessa aba, os enfeites novos saem de uso (a compra não se perde: é só vestir de novo na Loja). Veja o dia de atualizar, acima.

## Números que dá para mudar (`jogo/js/config.js`)
Depois de mudar, peça ao Claude para republicar.
- **`comidas`:** cada comida tem `nome`, `icone`, `preco` (estrelas) e `fome` (quanto enche, de 0 a 100). O bolo tem `enche: true`, que enche tudo. Hoje: cenoura 2 ⭐/20, maçã 3 ⭐/30, feno 4 ⭐/45, biscoito 5 ⭐/60, bolo 8 ⭐/tudo. **Não troque o `id`:** a despensa guarda a comida por ele.
- **`cuidados`:**
  - `minutosFome: 120` e `minutosSede: 60`: minutos de jogo para ir de cheia a zero;
  - `baixo: 25`: abaixo disso aparece o aviso e o unicórnio fica mais lento;
  - `fatorLento: 0.7`: a velocidade com fome ou sede (70%);
  - `semToqueMs`: sem toque há 5 minutos, ela parou de jogar e nada gasta;
  - `lembreteMs`: no máximo um lembrete do Claude a cada 10 minutos;
  - `gravarMs` e `gravarPontos`: de quanto em quanto tempo o jogo grava a fome e a sede (60 s ou 10 pontos). Melhor não mexer.
- **`surpresa`:** `minMinutos: 3` e `maxMinutos: 10` (o intervalo sorteado), `estrelas: 2` (o prêmio), `esperaLivreMs: 4000` (se o tempo acaba com ela ocupada, a pergunta espera ela ficar 4 segundos livre) e `tipos` (escolha, verdadeiro/falso, várias). Se mudar `estrelas`, peça também para regravar as vozes, porque o Claude fala o valor.
- **`nado`:** `fator: 0.6` (a velocidade na água, 60%) e `custo: 3` (quanto a água "pesa" na hora de escolher o caminho: com 3, ela prefere dar a volta por terra).
- **`precoPremio`:** o preço dos acessórios das provas à venda na Loja: `comum: 25`, `raro: 40`, `lendario: 70`.
