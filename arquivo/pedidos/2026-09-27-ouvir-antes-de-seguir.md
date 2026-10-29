# Pedido 1 de 1: ouvir antes de seguir

/nova-feature

# 1. Nome
ouvir antes de seguir

# 2. Tipo
[x] Mecânica nova (espera da fala: ajuda única em `Reino.Voz`, usada pelo balão, pela sala, pelo treino e pela prova)
[x] Ajuste ou correção de algo que já existe

# 3. O que eu quero
Toda fala tem de ser ouvida até o fim antes de seguir: enquanto a voz fala, os botões de continuar e de sair
ficam desabilitados. Vale para as conversas com NPC, as salas (que passam a mostrar o resumo antes das questões,
e leem cada questão em voz alta), o treino e as provas.

# 4. Por que
A Mariana passa as falas sem ouvir. Ouvir o resumo e cada pergunta inteira ajuda a revisar com calma.

# 5. Como a Mariana usa, passo a passo
1. Conversa com NPC: o balão fala; "Continuar →", os botões do convite, "Ok!" e o ✕ ficam apagados (com um
   🔊 pulsando) até a fala acabar. Enter e Esc também esperam. A página seguinte fala e espera de novo.
2. Sala: depois da intro (que também espera a fala), "Começar" leva ao RESUMO: as cartas do livro da matéria
   usadas pela sala (campo `livro` dos desafios, sem repetir, na ordem), uma por página, lidas pela narradora;
   "Continuar →" e ✕ só depois da leitura. Depois as questões.
3. Cada questão é lida em voz alta sozinha ao aparecer (a mesma fala do 🔊 Ouvir); responder, "Conferir" e ✕
   ficam desabilitados até acabar. O retorno (acertou/errou) também espera antes de "Continuar".
4. Treino e prova: a capa, cada questão (lida sozinha) e o resultado esperam a fala antes de liberar
   "Próxima", "Anterior", "Entregar" e ✕.

# 6. Onde fica no reino
Em todo balão de conversa com personagem, em toda sala de matéria, no treino e nas provas da Escola.
Como ela acha a novidade: não precisa achar; aparece no que ela já usa.

# 8. Personagens e falas
Nenhuma fala nova: o resumo usa as cartas do livro (pacote `<m>-livro`, já gravado) e as questões as falas do
🔊 (já gravadas) (decidido pelo Claude).

# 9. Prêmios
nenhum

# 10. Números que eu quero poder mudar depois
Em `config.js` (`esperaFala`): folga do teto sobre o tempo estimado do texto, teto máximo em segundos, e
ligar/desligar a leitura automática das questões e o resumo antes das questões.

# 11. O que NÃO pode mudar
- Ela nunca fica presa: se a voz está desligada nos Ajustes, se a fala não tem gravação, se o áudio está
  bloqueado pelo navegador ou se o pacote não carregou, os botões ficam liberados na hora; e há um teto de tempo
  (estimado pelo tamanho do texto) que libera tudo mesmo se o áudio travar (decidido pelo Claude).
- Avisos do Claude que somem sozinhos continuam como são.
- O 🔊 Ouvir continua funcionando (repetir a fala).
- O livro da matéria pela estante continua igual; o botão "📖 Ler o resumo antes" da intro sai, porque o resumo
  agora vem sempre (decidido pelo Claude).
- Sala de matéria sem livro ou sem cartas: vai direto às questões.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook

# 13. Pronto quando
- [ ] no balão de NPC, Continuar/Ok/✕ desabilitados enquanto fala, liberados no fim
- [ ] na sala, o resumo aparece antes da 1ª questão e só libera depois da leitura
- [ ] cada questão (sala, treino, prova) é lida sozinha e só libera depois
- [ ] com a voz desligada nos Ajustes, nada espera
- [ ] áudio travado: libera pelo teto de tempo

# 14. Decisões
Decidido pelo Claude: o ✕ também espera (como pedido), mas com o teto de tempo para nunca prender; o resumo
são as cartas do livro da sala; treino entra junto com as provas; Esc e Enter respeitam a espera.
