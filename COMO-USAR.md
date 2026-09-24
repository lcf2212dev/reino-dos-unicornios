# Mariana e o Reino dos Unicórnios

## Como jogar
- **Tablet, celular ou notebook (recomendado):** abra https://claude.ai/artifact/CQUd5TWJQW3fWWw5Cvg77U
  - Precisa estar logado no claude.ai com a sua conta nesses aparelhos, porque o link é privado.
  - O progresso é sincronizado entre os aparelhos.
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
- Cada prova dá um acessório só. Depois disso ela vira treino.
- Sair no meio da prova não conta como tentativa.
- **Correção:**
  - Depois da 1ª tentativa errada, o jogo só mostra quais questões têm erro, sem dar a resposta, para ela procurar com atenção.
  - A partir da 2ª tentativa errada, e nos treinos, mostra também a resposta certa e a explicação.
- **Para exigir outra nota:** mude `notaSucessoProva` em `jogo/js/config.js`. Hoje é 10, que quer dizer acertar tudo.
- **Onde ver os acessórios:** ela usa e troca os acessórios na Loja das Fadas, na parte "Prêmios da Escola do Reino".
- **Área dos pais:** mostra as tentativas, as notas de cada tentativa e o prêmio ganho.
- **Nova prova:** mande as fotos da folha para o Claude. Ele cria `jogo/js/provas/<matéria>-<bimestre>.js` com três acessórios novos, grava as vozes e republica.

## Jogo no computador de casa
- Endereço na rede de casa: **http://reinodosunicornios.local** (ou pelo IP do PC, ex.: http://192.168.1.247).
- Roda no Docker (container `reino-unicornios`, volta sozinho quando o PC liga). Reiniciar: `cd "jogo/servidor" && docker compose restart`.
- O progresso fica no banco `jogo/servidor/dados/reino.db` (SQLite), com as últimas 50 versões guardadas como backup.
- O nome `reinodosunicornios.local` vem do serviço `systemctl --user status reino-nome`.
