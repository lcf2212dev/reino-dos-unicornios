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
- As falas são gravadas uma vez com as vozes naturais da leitura em voz alta do Microsoft Edge e ficam dentro do jogo. Por isso funcionam igual em todo aparelho, até sem internet.
- Nomes que a Mariana digita (como o nome do unicórnio) não são falados.
- Para regravar depois de mudar textos (roda dentro de `jogo/`):
  ```
  node ferramentas/listar-falas.js && uv run --with edge-tts python ferramentas/gerar-vozes.py && node ferramentas/empacotar-vozes.js
  ```
  Só as falas novas são gravadas; as antigas ficam em `ferramentas/vozes-cache/`.
- Para trocar de voz ou velocidade, edite `vozes` em `jogo/js/config.js` e rode os mesmos comandos.

## Regras do jogo
- **Dinheiro:** cada sala paga uma vez. História tem 5 salas de R$4, total de R$20.
- **Unicórnios:**
  - **Comum:** concluir uma sala.
  - **Raro:** fazer a sala com tudo certo de primeira e sem aviso de pressa.
  - **Épico:** ouro no Treino da Medalha, ou acertar todas no treino.
  - **Lendário:** completar a matéria.
- **Crescimento:** o unicórnio que está de montaria cresce quando ela acerta. Bebê anda ao lado dela; a partir de "Pequeno" ela monta.
- **Treino da Medalha (Castelo):**
  - abre quando todas as salas da matéria estão feitas;
  - não tem relógio;
  - tem revisão obrigatória antes de entregar;
  - a medalha é dada só pelos acertos.
- **Medalha da escola:** a medalha de ouro da prova real (R$100) é combinada fora do jogo. O jogo só lembra a Mariana de ir com calma e revisar.

## Jogo no computador de casa
- Endereço na rede de casa: **http://reinodosunicornios.local** (ou pelo IP do PC, ex.: http://192.168.1.247).
- Roda no Docker (container `reino-unicornios`, volta sozinho quando o PC liga). Reiniciar: `cd "jogo/servidor" && docker compose restart`.
- O progresso fica no banco `jogo/servidor/dados/reino.db` (SQLite), com as últimas 50 versões guardadas como backup.
- O nome `reinodosunicornios.local` vem do serviço `systemctl --user status reino-nome`.
