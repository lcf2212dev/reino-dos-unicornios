# Receita: fala nova (ou mudada) e as vozes

Para que serve: escrever ou mudar um texto que o jogo fala e deixar a voz gravada certa. Regras:
`docs/contratos/som-musica-e-voz.md` §4–§7; como escrever: `licoes-de-voz.md`.

## Como a voz acha a fala
- Pelo TEXTO EXATO: chave = perfil de voz + texto normalizado (`Reino.Voz.chave`; sem emoji, sem «», espaços
  juntados). Mudou uma letra ou vírgula → gravação nova. Trocar só emoji não muda a chave.
- `Reino.Voz.dividir` corta os trechos «em inglês» para a voz inglesa do perfil (mesma divisão ao gravar e ao tocar).
- As falas vão em pacotes de nome fixo `js/voz/<pacote>.js`: `geral`, `interior-<prédio>`,
  `<matéria>-<sala>`, `<matéria>-extra`, `<matéria>-livro`, `prova-<prova>`, `interior-padrao-<matéria>`.
- Só é gravado o que está em `Reino.Falas.todas()` (`jogo/js/sistemas/falas.js`): conteúdo das salas e provas,
  falas e `extras` dos prédios, `falasPossiveis` dos NPCs, `fala` dos objetos, frases de Cuidados, Surpresa,
  Fotos e Loja. Texto falado fora dessas listas fica mudo.

## Checklist
| Onde está o texto | Arquivo |
|---|---|
| NPC ou objeto de um prédio | `jogo/js/interiores/<prédio>/falas.js` |
| fala do prédio que não é de NPC nem objeto | `Reino.FALAS_INTERIORES.<prédio>.extras = [{ texto, voz }]` no mesmo `falas.js` |
| sala, livro, prova | `jogo/js/conteudo/materias/<m>/`, `jogo/js/conteudo/provas/` |
| Claude e avisos fixos | `jogo/js/sistemas/falas.js` |
| cuidados, surpresa, fotos, loja | `frases`/`falas()` de `jogo/js/sistemas/cuidados.js`, `surpresa.js`, `fotos.js`, `jogo/js/conteudo/loja-itens.js` (`FALAS`) |
| frases automáticas dos NPCs | `jogo/js/personagens/npcs-falas.js` |
| perfil de voz | `Reino.config.vozes` em `jogo/js/nucleo/config.js` |

## Passo a passo (quem escreve)
1. Escreva seguindo `licoes-de-voz.md`.
2. Número que muda dentro da fala: enumere todas as variações (como `treinoBloqueado`); nome que ela digita
   não é falado.
3. Confira a lista:
   ```
   node jogo/ferramentas/vozes/listar-falas.js            # gera jogo/ferramentas/gerado/falas.json e resume por pacote
   node jogo/ferramentas/vozes/listar-falas.js --mostrar  # mostra só as falas cujo texto falado difere do escrito
   ```
   (Nunca abra `falas.json`: é enorme. Use o resumo e o `--mostrar`.)
4. Entregue o texto; a gravação é de quem integra.

## Personagem novo ou perfil trocado (antes de gravar)
1. `npm run vozes-elenco` (`jogo/ferramentas/vozes/elenco-vozes.js`): erro se a voz lembra a do Claude; aviso
   para vozes iguais no mesmo prédio, nome repetido no mesmo prédio e gênero trocado.
2. Amostras para o Leandro escolher: `uv run --with edge-tts python jogo/ferramentas/vozes/amostras.py <perfil|regex> …`
   (grava em `amostras-de-voz/`). Só depois da aprovação, o `npm run vozes`. Detalhes: skill `validar-vozes`.

## Passo a passo (quem integra: gravar)
```
npm run vozes    # listar → gravar (só o que falta) → empacotar → conferir por transcrição
```
- `npm run vozes -- --saida /tmp/<voce>/voz` empacota em outra pasta e compara com `jogo/js/voz/`.
- Passos avulsos: `node jogo/ferramentas/vozes/listar-falas.js`,
  `cd jogo && uv run --with edge-tts python ferramentas/vozes/gerar-vozes.py`,
  `node jogo/ferramentas/vozes/empacotar-vozes.js`, conferência (`jogo/ferramentas/vozes/conferir-vozes.py`).
- A conferência transcreve (faster-whisper `small`) SÓ as gravações novas; as que divergem passam de novo com o
  `medium` e, se ainda divergirem, frase de 3+ palavras reprova (`✘`) e palavra solta (1–2) vai para "conferir de
  ouvido" (`?`, com o arquivo), sem reprovar. Algarismo x extenso, "R$ N" x "N reais" e "pro" x "para o" não
  contam como erro. Voz embolada: reescreva a frase (`licoes-de-voz.md`) ou acrescente a pronúncia em `listar-falas.js` (`PRONUNCIA`).
- Precisa de internet (edge-tts), `uv` e `ffmpeg`.
- O transcritor (faster-whisper) roda pelo `.vozes/venv-whisper` se existir; senão por `uv run --with faster-whisper`;
  sem `uv`, o `npm run vozes` cria o venv em `.vozes/` (baixa pacotes). A cópia do índice de antes e os temporários
  das amostras também ficam em `.vozes/` (ignorado pelo git; fora do /tmp, que é memória). O modelo fica em
  `~/.cache/huggingface`.

## Validadores
```
npm run validar        # validar-interiores avisa fala > 44 letras e «» desbalanceado
npm test               # inclui as referências de dados e vozes (lista de falas) contra o commit base
```

Referências (na worktree; precisam do git): em `npm test`, o passo *referências de dados* mostra a diferença
esperada abaixo; os outros passos têm que sair ✔. Diferenças esperadas no `npm run e2e`:
- dados: `falas` (e `interiores`/`elenco`/`materias`, conforme onde o texto mora);
- vozes: os pacotes regravados (`vozes`); imagens: só as telas e balões que mostram o texto mudado.
A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
depois do commit da mudança; não edite esse arquivo na tarefa. Qualquer diferença fora da lista acima é defeito.

No jogo (`npm run ver -- --ir <lugar> --js 'console.log(JSON.stringify(__reino.faltando))'`): `__reino.faltando` lista as falas pedidas sem áudio (tem que ficar vazio).

## Armadilhas
- Fala mudada sem regravar: fica muda (ou com o áudio velho, se o texto antigo ainda existir em outro lugar).
- O cabeçalho dos pacotes cita um caminho antigo de propósito: mudar o texto mudaria todos os pacotes.
- Nunca abra `jogo/js/voz/*.js`, `jogo/ferramentas/gerado/falas.json`, `vozes-indice.json` nem `vozes-cache/`.
- Letras soletradas ("a letra H") só nos pacotes de Português.
