---
name: preparar-pedido
description: Use quando o Leandro descrever novidades do Reino dos Unicórnios em texto livre (lista, parágrafo, áudio transcrito), sem o modelo `PEDIDO-DE-FEATURE.md`, para separar em features, investigar o código, preencher um pedido no modelo para cada uma e construir ponta a ponta, sem perguntar. Não use se o pedido já vier no modelo (use `nova-feature`).
---
# Preparar pedido (texto livre → pedidos no modelo)

O modelo: `PEDIDO-DE-FEATURE.md` (raiz). Depois de preenchidos, cada pedido é construído pela skill `nova-feature`.
Aqui não se escreve código: só se lê o jogo e se escreve o pedido.

1. **Separar.** Uma feature por pedido quando dá para construir e entregar sem a outra (cada uma vira uma branch
   `feat/<nome>` e uma worktree). Coisas que mexem nos mesmos arquivos ficam juntas.
2. **Investigar** para preencher com o que o jogo já tem (use `docs/ARQUITETURA.md` §5.1 e o
   `CLAUDE.md` da pasta; em pedido grande, um agente `Explore` por feature, em paralelo):
   - onde mora hoje (prédio, andar, cômodo, tela, ajuste) e o que já existe parecido;
   - o que o texto chama de um jeito e o código de outro (ex.: "setas" = `#setas` e o ajuste `ajustes.setas`);
   - a pasta de material em `matérias/` (ex.: `matérias/4 Bimestre/português/`): o que tem nela e se uma subpasta pede outra
     coisa (ex.: uma subpasta `Revisão/` é folha de prova: vira prova);
   - `npm run ver -- --ir <lugar>` para olhar o lugar quando ajudar.
3. **Preencher o modelo completo** de cada feature (o curto para ajuste pequeno). Campo sem nada a dizer fica fora,
   como no exemplo do modelo. Não repita "O que já vale sempre". O que o texto não fecha, você decide (a opção que
   recomendaria) e escreve no campo com "(decidido pelo Claude)".
4. **Checar** cada pedido (lições de 2026-09-26):
   - **Como ela acha a novidade** (campo 6): o caminho até ela (porta, escada, menu Lugares, botão). O Leandro não
     achou o laboratório de primeira.
   - **Personagens:** um por linha em "Quem aparece", no formato `Nome, gênero, idade` (ex.: `Dona Lulu, mulher,
     adulta`): o `npm run plano -- rascunho` lê essa linha para reservar cada um e as frentes começarem juntas;
     nome que já existe no mesmo prédio; voz igual à do Claude ou à de outro personagem do mesmo
     prédio, ou de gênero trocado (vozes em `vozes` do `jogo/js/nucleo/config.js`; para conferir, a skill `validar-vozes`
     se existir, senão `gravar-vozes`).
   - **Recurso do aparelho** (compartilhar, baixar, câmera, vibrar, tela cheia): dizer no campo 12 onde funciona.
     Web Share só em https; no artifact do claude.ai o compartilhar e os downloads são bloqueados; o servidor de casa é
     http. Se não funcionar em algum lugar, o que aparece ali.
   - **Mecanismo novo escondido:** "sem prédio novo", "em outro andar", "no lugar de X" costuma pedir código novo, não
     só conteúdo. Escreva isso no campo 2 (Mecânica nova) para o plano não subestimar.
   - **O que some:** quando o pedido remove algo (botão, ajuste), dizer o que acontece com quem já usava (save antigo,
     ajuste ligado) no campo 11.
5. **Salvar e mostrar.** Um arquivo por rodada em `/tmp/reino-testes/pedidos/AAAA-MM-DD-<resumo>.md`, com os pedidos
   em sequência ("# Pedido 1 de N: <título>" e o bloco do modelo). Fica fora da árvore principal, que é servida ao
   vivo. Mostre os pedidos no chat.
6. **Construir** sem esperar: para cada pedido, a skill `nova-feature` com ele, até o merge na main e o push. Uma
   worktree por feature (`npm run worktree -- <nome>`, branch `feat/<nome>`); features independentes em agentes
   paralelos, até o teto do `CLAUDE.md` da raiz. Cada worktree guarda uma cópia do seu pedido em
   `pedidos/AAAA-MM-DD-<nome>.md`, que entra no commit da feature.

## Exemplo (2026-09-26, resumido)
Texto do Leandro: Ciências no 3º andar do Observatório e o 2º andar como centro da NASA só de diversão; um lugar para
ver as fotos e compartilhar; tirar as setas e andar seguindo o mouse, com thumbstick no celular e no tablet.
- Virou 3 pedidos: `ciencias-observatorio`, `album-compartilhar`, `andar-thumbstick`.
- Investigado: o Observatório só tinha o térreo com 3 cômodos; o álbum só abria segurando o 📷; "setas" = `#setas`
  e `ajustes.setas`; tocar para andar já existia; ciências/Revisão era folha de prova.
- Decidido pelo Claude: compartilhar livre (sem PIN); tocar para andar continua; thumbstick onde o dedo encosta;
  a folha de revisão vira prova.
- Trecho do pedido 1:
  ```
  # 6. Onde fica no reino
  Observatório: 2º andar NASA, 3º andar Ciências. Pelo menu Lugares, "Ciências" leva direto ao 3º andar.
  # 7. Material
  Pasta matérias/ciências/ (apostila, cap. 8 e 9). matérias/ciências/Revisão/ vira a prova ciencias-3bim (decidido pelo Claude).
  # 14. Decisões
  Decidido pelo Claude: vozes novas diferentes das do prédio; 5 salas, uma por capítulo.
  ```

Nunca: servidor de casa, artifact publicado, save real, Docker (`docs/contratos/save-e-mescla.md` §9).
