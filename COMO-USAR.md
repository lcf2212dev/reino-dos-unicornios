# Mariana e o Reino dos Unicórnios

Guia de uso para o Leandro. As regras técnicas ficam em `docs/contratos/`.

## Como jogar
- **Tablet, celular ou notebook:** abra https://reino-dos-unicornios.vercel.app
  - **Instalar como app:** no Chrome do Android, menu ⋮ → "Instalar app" (ou "Adicionar à tela inicial"); no iPhone/iPad,
    Safari → Compartilhar → "Adicionar à Tela de Início"; no notebook, o ícone de instalar na barra de endereço.
  - **Sem internet:** abra uma vez com internet e espere até a Área dos pais dizer "Pronto para jogar sem internet."
    (antes ela mostra "Guardando o jogo para jogar sem internet… N de M."; o jogo inteiro, com as vozes, fica guardado
    no aparelho). Depois ele abre e joga sem rede; o progresso fica no aparelho e vai para o banco sozinho quando a
    internet volta. Um aparelho que nunca abriu o jogo precisa de internet na primeira vez.
  - O progresso é sincronizado entre os aparelhos e entre abas. Um aparelho novo já abre com o progresso dela.
  - **Jogar com amigos:** toque em 👥 (no alto da tela) → "Criar servidor". O reino dá um código de 4 letras e um link
    de convite: mande para os amigos (o botão "Copiar convite" copia o link). Quem abrir o link — ou digitar o código em
    👥 → "Entrar" — cai no mesmo reino e aparece no mapa com o nome em cima; dá para andar junto, acenar e mandar
    recados prontos. Cada um continua com o seu progresso. Sem criar nem entrar em servidor nenhum, o jogo é o de sempre,
    sozinho. O servidor fica aberto enquanto alguém estiver jogando nele.
  - **Entrar:** toda vez que o jogo abre, toque em "Entrar no Reino" e digite a senha. Mariana: login `mariana`,
    senha `unicorlice77` (o login de quem jogou por último já vem preenchido). Outros jogadores usam "Criar conta".
    Para sair: ⚙️ Ajustes → 🚪 Sair.
- O servidor de casa (`reinodosunicornios.local`) e o link do claude.ai foram aposentados: o progresso de lá foi
  copiado para a Vercel em 29/09/2026 e o que for feito neles não chega mais ao banco.
- **Como andar:**
  - **Notebook:** clique num lugar e ela vai até lá; clique numa pessoa ou objeto e ela conversa ou usa. Segurando o
    botão do mouse, ela segue o ponteiro. As setas (ou W, A, S, D) também andam.
  - **Celular e tablet:** toque num lugar, pessoa ou objeto. Arrastando o dedo na metade esquerda da tela, aparece um
    controle redondo (joystick) para andar para qualquer lado.
- **Teclado:** Tab passa pelos botões, Enter escolhe, Esc fecha balões e telas.
- **"O reino não abriu agora":** o jogo não conseguiu buscar o progresso. Confira a internet e toque em "Tentar de novo". Até dar certo, o jogo não começa, para não perder nada.
- **Sem internet, só no notebook:** abra `jogo/index.html` com duplo clique. Nesse modo o progresso fica só naquele
  navegador.

## Área dos pais
- Fica em ⚙️ Ajustes → 🔒 Área dos pais. PIN: **2026**. Para trocar, mude `pinPais` em `jogo/js/nucleo/config.js` e
  peça ao Claude para republicar.
- Lá dá para ver quantos Robux ela ganhou por matéria, quantos treinos fez, as tentativas e notas das provas, e
  registrar quantos Robux já foram dados. O que foi registrado antes em reais aparece convertido (R$ 20 = 500 Robux).
- **🔄 Começar novo ciclo de provas:** zera salas, treinos, Robux e pagamentos. Mantém unicórnios, estrelas,
  enfeites, despensa, fome, sede e banho.
- **🗑️ Apagar tudo:** zera TODO o progresso, sem volta. Não use para resolver problema: peça ao Claude.

## Pedir uma novidade
- Copie o modelo `PEDIDO-DE-FEATURE.md`, preencha e cole na conversa.
- Sem tempo? Escreva do seu jeito começando com `/nova-feature`.
- O Claude não pergunta nada: decide o que faltar, constrói, testa, põe na main, manda para o GitHub e a Vercel
  publica sozinha no mesmo endereço. No fim ele conta o que fez e o que decidiu.

## Nova matéria
1. Salve os prints em `reino-dos-unicornios/matérias/<matéria>/` (ex.: `matérias/geografia/`). A folha de revisão da
   prova vai numa subpasta, ex.: `matérias/geografia/Revisão/`.
2. Peça ao Claude para criar a matéria. Ele faz o lugar no reino, as salas, o livro, os unicórnios e as vozes, e
   publica no mesmo endereço. O progresso dela é mantido.
3. Prova nova: mande as fotos da folha e peça ao Claude. Ela vira uma sala na Escola do Reino, com 3 prêmios.

## Regras do jogo (resumo)
- **Robux:** cada matéria vale 500 Robux, divididos entre as salas (cada sala paga uma vez, de 10 em 10 Robux). Se a
  divisão não der redonda, a sobra vem de bônus ao completar a matéria. O 💰 do jogo é o símbolo do Robux.
- **Unicórnios:** comum ao concluir uma sala; raro com a sala toda certa de primeira e sem pressa, **ou** jogando a
  sala 3 vezes; épicos pelo Treino da Medalha (ouro ou tudo certo), **ou** com 3 e 5 treinos terminados; lendário ao
  completar a matéria. Esse caminho da persistência faz nenhum unicórnio depender só de perfeição.
- **Montaria:** o unicórnio montado cresce quando ela acerta. Bebê anda ao lado; a partir de "Pequeno" ela monta.
- **Treino da Medalha (Castelo):** abre quando todas as salas da matéria estão feitas. Sem relógio, com revisão
  obrigatória antes de entregar; a medalha vem só dos acertos.
- **Provas (Escola do Reino):** as questões da folha da escola, uma por vez, sem mostrar certo ou errado no meio.
  Nota 10 dá um acessório: lendário na 1ª tentativa, raro na 2ª, comum depois. Ganhando um, os outros dois da mesma
  prova ficam à venda na Loja, com estrelas (comprar não conta como prêmio). A medalha de ouro da prova real
  (2.500 Robux) é combinada fora do jogo.
- **Pergunta surpresa:** de vez em quando, com ela livre no mapa, o Claude faz uma pergunta de uma sala já feita.
  Acertou de primeira: 2 estrelas. Errou: vê a explicação, sem perder nada. Dá para desligar em ⚙️ Ajustes.
- **Fome, sede e banho:** só a montaria gasta, e só com ela jogando. Com fome ou sede baixa, anda mais devagar;
  sujinho não fica lento. Comida se compra com estrelas na Pet Shop (sempre com confirmação); água e banho são de
  graça lá dentro. Nada disso tira XP, Robux ou unicórnio.
- **Nadar:** ela entra no lago e nada, mais devagar.
- **Fotos e álbum:** o 📷 no topo tira foto do jogo (nunca da câmera). O álbum guarda até 40 fotos e fica só naquele
  aparelho. "Salvar no aparelho" baixa a foto; no celular e no tablet também aparece "Compartilhar".
- **Música:** ⚙️ Ajustes → "🎵 Musiquinha" (começa desligada). Cada lugar tem a sua; some no treino e nas provas.
- **Observatório:** curiosidades do espaço e piadas do Robô Cosmo, só para brincar: não dá estrelas nem muda o
  progresso.
- **Minha Casa:** a casa dela, perto do Observatório (menu Lugares → Minha Casa). Na primeira entrada no jogo, um baú
  abre e dá a casa, vazia. Cada matéria completa do 4º bimestre dá um kit de móveis à escolha (Sala de Estar, Sala de
  Jantar, Cozinha, Banheiro, o quarto dela e o do unicórnio). Para decorar: o botão da casinha no topo, dentro da casa,
  ou a caixa de mudança de cada cômodo; escolha a peça, toque onde quer, gire e coloque (verde pode, vermelho não).
  Dá para mudar de lugar ou guardar de novo quando quiser.
- **Lugar novo:** mostra "✨ Novo!" no menu Lugares até ela entrar nele.

## Quando chega uma novidade
O Claude põe a novidade na main e a Vercel publica sozinha. O progresso da Mariana fica como está.
- As abas abertas (e o app instalado) se atualizam sozinhas quando ela para no mapa.
- Se preferir que nada mude enquanto ela joga, peça a novidade num horário em que ela não esteja jogando.
- **Se algo parecer errado:** não apague nada nem use "Apagar tudo". Deixe o jogo fechado e peça ao Claude para
  olhar.

## Limitações conhecidas
- Dois aparelhos gastando estrelas quase ao mesmo tempo: as duas compras podem virar uma só. As estrelas nunca ficam
  negativas.
- Aba com o jogo antigo aberta depois de atualizar: pode tirar enfeites novos do unicórnio (a compra fica; é só
  vestir de novo) ou dar erro. Feche a aba e abra de novo.

## Cópia de segurança
- Cada navegador guarda, além do progresso (`mariana-reino-v1`), a chave **`mariana-reino-v1-novidades`**, com a
  fome, a sede, o banho e a despensa. Ela protege a comida comprada de uma aba antiga. **Não apague essa chave.**

## Números que dá para mudar
Os números que dá para mudar ficam comentados em `jogo/js/nucleo/config.js`; mude e peça ao Claude para republicar.
