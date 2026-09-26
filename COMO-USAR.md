# Mariana e o Reino dos Unicórnios

Guia de uso para o Leandro. As regras técnicas ficam em `docs/contratos/`.

## Como jogar
- **Tablet, celular ou notebook (recomendado):** abra https://claude.ai/artifact/CQUd5TWJQW3fWWw5Cvg77U
  - Precisa estar logado no claude.ai com a sua conta, porque o link é privado.
  - O progresso é sincronizado entre os aparelhos e entre abas. Um aparelho novo já abre com o progresso dela.
- **Como andar:**
  - **Notebook:** clique num lugar e ela vai até lá; clique numa pessoa ou objeto e ela conversa ou usa. Segurando o
    botão do mouse, ela segue o ponteiro. As setas (ou W, A, S, D) também andam.
  - **Celular e tablet:** toque num lugar, pessoa ou objeto. Arrastando o dedo na metade esquerda da tela, aparece um
    controle redondo (joystick) para andar para qualquer lado.
- **Teclado:** Tab passa pelos botões, Enter escolhe, Esc fecha balões e telas.
- **"O reino não abriu agora":** o jogo não conseguiu buscar o progresso. Confira a internet (ou o computador de casa)
  e toque em "Tentar de novo". Até dar certo, o jogo não começa, para não perder nada.
- **Sem internet, só no notebook:** abra `jogo/index.html` com duplo clique. Nesse modo o progresso fica só naquele
  navegador.

## Área dos pais
- Fica em ⚙️ Ajustes → 🔒 Área dos pais. PIN: **2026**. Para trocar, mude `pinPais` em `jogo/js/nucleo/config.js` e
  peça ao Claude para republicar.
- Lá dá para ver quanto ela ganhou por matéria, quantos treinos fez, as tentativas e notas das provas, e registrar o
  que já foi pago.
- **🔄 Começar novo ciclo de provas:** zera salas, treinos, dinheiro e pagamentos. Mantém unicórnios, estrelas,
  enfeites, despensa, fome, sede e banho.
- **🗑️ Apagar tudo:** zera TODO o progresso, sem volta. Não use para resolver problema: peça ao Claude.

## Pedir uma novidade
- Copie o modelo `PEDIDO-DE-FEATURE.md`, preencha e cole na conversa.
- Sem tempo? Escreva do seu jeito começando com `/preparar-pedido`.
- O Claude não pergunta nada: decide o que faltar, constrói, testa, põe na main e manda para o GitHub. O computador
  de casa passa a servir a novidade na hora (as abas abertas se atualizam sozinhas quando ela para no mapa). No fim
  ele conta o que fez e o que decidiu. O claude.ai só muda quando você pedir para republicar.

## Nova matéria
1. Salve os prints em `Mariana Revisões/matérias/<matéria>/` (ex.: `matérias/geografia/`). A folha de revisão da
   prova vai numa subpasta, ex.: `matérias/geografia/Revisão/`.
2. Peça ao Claude para criar a matéria. Ele faz o lugar no reino, as salas, o livro, os unicórnios e as vozes, e
   republica no mesmo link. O progresso dela é mantido.
3. Prova nova: mande as fotos da folha e peça ao Claude. Ela vira uma sala na Escola do Reino, com 3 prêmios.

## Regras do jogo (resumo)
- **Dinheiro:** cada matéria vale R$20, divididos entre as salas (cada sala paga uma vez). Hoje são 4 matérias
  (História, Inglês, Português e Ciências), R$80 no total. Se a divisão não der redonda, a sobra vem de bônus ao
  completar a matéria.
- **Unicórnios:** comum ao concluir uma sala; raro com a sala toda certa de primeira e sem pressa, **ou** jogando a
  sala 3 vezes; épicos pelo Treino da Medalha (ouro ou tudo certo), **ou** com 3 e 5 treinos terminados; lendário ao
  completar a matéria. Esse caminho da persistência faz nenhum unicórnio depender só de perfeição.
- **Montaria:** o unicórnio montado cresce quando ela acerta. Bebê anda ao lado; a partir de "Pequeno" ela monta.
- **Treino da Medalha (Castelo):** abre quando todas as salas da matéria estão feitas. Sem relógio, com revisão
  obrigatória antes de entregar; a medalha vem só dos acertos.
- **Provas (Escola do Reino):** as questões da folha da escola, uma por vez, sem mostrar certo ou errado no meio.
  Nota 10 dá um acessório: lendário na 1ª tentativa, raro na 2ª, comum depois. Ganhando um, os outros dois da mesma
  prova ficam à venda na Loja, com estrelas (comprar não conta como prêmio). A medalha de ouro da prova real
  (R$100) é combinada fora do jogo.
- **Pergunta surpresa:** de vez em quando, com ela livre no mapa, o Claude faz uma pergunta de uma sala já feita.
  Acertou de primeira: 2 estrelas. Errou: vê a explicação, sem perder nada. Dá para desligar em ⚙️ Ajustes.
- **Fome, sede e banho:** só a montaria gasta, e só com ela jogando. Com fome ou sede baixa, anda mais devagar;
  sujinho não fica lento. Comida se compra com estrelas na Pet Shop (sempre com confirmação); água e banho são de
  graça lá dentro. Nada disso tira XP, dinheiro ou unicórnio.
- **Nadar:** ela entra no lago e nada, mais devagar.
- **Fotos e álbum:** o 📷 no topo tira foto do jogo (nunca da câmera). O álbum guarda até 40 fotos e fica só naquele
  aparelho. No claude.ai, para salvar ou compartilhar, ela segura o dedo na foto (no notebook, botão direito). No
  servidor de casa, "Salvar no aparelho" funciona.
- **Música:** ⚙️ Ajustes → "🎵 Musiquinha" (começa desligada). Cada lugar tem a sua; some no treino e nas provas.
- **Observatório:** curiosidades do espaço e piadas do Robô Cosmo, só para brincar: não dá estrelas nem muda o
  progresso.
- **Lugar novo:** mostra "✨ Novo!" no menu Lugares até ela entrar nele.

## Jogo no computador de casa
- Endereço na rede de casa: **http://reinodosunicornios.local** (ou pelo IP do PC, ex.: http://192.168.1.247).
- Roda no Docker e volta sozinho quando o PC liga. Reiniciar: `cd "jogo/servidor" && docker compose restart`.
- O progresso fica no banco `jogo/servidor/dados/reino.db`, com as últimas 50 versões guardadas como backup.
- O nome `reinodosunicornios.local` vem do serviço `systemctl --user status reino-nome`.

## Dia de atualizar o jogo
O servidor de casa e o claude.ai guardam o progresso em lugares separados, mas precisam ser atualizados no mesmo
dia. Uma aba antiga aberta pode tirar enfeites novos ou apagar comida comprada.
1. Escolha um horário em que a Mariana não esteja jogando.
2. Em **todos** os aparelhos, feche as abas do jogo (servidor de casa e claude.ai), inclusive no seletor de abas e de
   apps do celular e do tablet. Não deixe nenhuma aba antiga esquecida.
3. Peça ao Claude para republicar o claude.ai (o computador de casa já serve o jogo novo desde o merge, sem
   reiniciar o Docker; abas abertas lá se atualizam sozinhas quando ela para no mapa).
4. Espere **uns 5 minutos** (o navegador guarda os arquivos antigos por até 5 minutos).
5. Abra um aparelho só, no computador de casa. Confira o que a novidade trouxe e se estrelas, salas e unicórnios
   estão como antes. Se algo estiver estranho, recarregue a página.
6. Depois abra o claude.ai num aparelho e confira do mesmo jeito.
7. Só então libere os outros aparelhos, abrindo o jogo numa aba nova.
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
