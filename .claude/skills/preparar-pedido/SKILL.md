---
name: preparar-pedido
description: Use quando o Leandro descrever novidades do Reino dos Unicórnios em texto livre (lista, parágrafo, áudio transcrito), sem o modelo `PEDIDO-DE-FEATURE.md`, para separar em features, investigar o código, preencher um pedido no modelo para cada uma, perguntar o que falta numa rodada só e, com o sinal dele, construir. Não use se o pedido já vier no modelo (use `nova-feature`).
---
# Preparar pedido (texto livre → pedidos no modelo)

O modelo: `PEDIDO-DE-FEATURE.md` (raiz). Depois de preenchidos, cada pedido é construído pela skill `nova-feature`.
Aqui não se escreve código: só se lê o jogo e se escreve o pedido.

1. **Separar.** Uma feature por pedido quando dá para construir e entregar sem a outra (cada uma vira uma branch
   `feat/<nome>` e uma worktree). Coisas que mexem nos mesmos arquivos ficam juntas.
2. **Investigar** antes de perguntar, para preencher com o que o jogo já tem (use `docs/ARQUITETURA.md` §5.1 e o
   `CLAUDE.md` da pasta; em pedido grande, um agente `Explore` por feature, em paralelo):
   - onde mora hoje (prédio, andar, cômodo, tela, ajuste) e o que já existe parecido;
   - o que o texto chama de um jeito e o código de outro (ex.: "setas" = `#setas` e o ajuste `ajustes.setas`);
   - a pasta de material em `matérias/` (ex.: `matérias/ciências/`): o que tem nela e se uma subpasta pede outra
     coisa (ex.: `matérias/ciências/Revisão/` é folha de prova: pergunte se vira prova);
   - `npm run ver -- --ir <lugar>` para olhar o lugar quando ajudar.
3. **Preencher o modelo completo** de cada feature (o curto para ajuste pequeno). Campo sem nada a dizer fica fora,
   como no exemplo do modelo. Não repita "O que já vale sempre". Decisão que o texto não fecha e que muda o trabalho
   ganha `(responda)` no campo; o resto você decide e escreve em "Pode decidir sozinho".
4. **Checar** cada pedido (lições de 2026-09-26):
   - **Como ela acha a novidade** (campo 6): o caminho até ela (porta, escada, menu Lugares, botão). O Leandro não
     achou o laboratório de primeira.
   - **Personagens:** nome que já existe no mesmo prédio; voz igual à do Claude ou à de outro personagem do mesmo
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
6. **Perguntar tudo numa rodada** (AskUserQuestion, até 4 perguntas por chamada, a opção recomendada primeiro; se
   passar de 4, chamadas seguidas sem trabalho no meio). Cada `(responda)` vira uma pergunta, mais "Posso seguir para
   a construção?".
7. **Anotar as respostas** no próprio campo, com "(resposta do Leandro)", e regravar o arquivo.
8. **Construir**, só se ele disser para seguir: para cada pedido, a skill `nova-feature` com ele. Uma worktree por
   feature (`/home/leandro/reino-<nome>`, branch `feat/<nome>`); features independentes em agentes paralelos, até o
   teto do `CLAUDE.md` da raiz. Cada worktree guarda uma cópia do seu pedido em `pedidos/AAAA-MM-DD-<nome>.md`, que
   entra no commit da feature (feito por quem integra, quando o campo 15 marcar commit).

## Exemplo (2026-09-26, resumido)
Texto do Leandro: Ciências no 3º andar do Observatório e o 2º andar como centro da NASA só de diversão; um lugar para
ver as fotos e compartilhar; tirar as setas e andar seguindo o mouse, com thumbstick no celular e no tablet.
- Virou 3 pedidos: `ciencias-observatorio`, `album-compartilhar`, `andar-thumbstick`.
- Investigado: o Observatório só tinha o térreo com 3 cômodos; o álbum só abria segurando o 📷; "setas" = `#setas`
  e `ajustes.setas`; tocar para andar já existia; ciências/Revisão era folha de prova.
- `(responda)`: compartilhar livre ou com PIN? Tocar para andar continua? Thumbstick fixo ou onde o dedo encosta?
  A folha de revisão vira prova?
- Trecho do pedido 1:
  ```
  # 6. Onde fica no reino
  Observatório: 2º andar NASA, 3º andar Ciências. Pelo menu Lugares, "Ciências" leva direto ao 3º andar.
  # 7. Material
  Pasta matérias/ciências/ (apostila, cap. 8 e 9). matérias/ciências/Revisão/ vira a prova ciencias-3bim (resposta do Leandro).
  # 14. Decisões
  Me pergunte antes: as vozes novas (amostras) e o número de salas, se os prints pedirem mais ou menos que 5.
  ```

Nunca: servidor de casa, artifact publicado, save real, Docker (`docs/contratos/save-e-mescla.md` §9).
