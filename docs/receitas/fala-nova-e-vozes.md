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
| fala do prédio que não é de NPC nem objeto | `extras: [{ texto, voz }]` no `Reino.falasDoPredio('<prédio>', …)` do mesmo `falas.js` |
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

## Gravar e conferir (quem integra)
Não é da tarefa de quem escreve: skill `gravar-vozes` (`npm run vozes`: gravar, empacotar, conferir por
transcrição) e, com personagem novo ou perfil trocado, ANTES a skill `validar-vozes` (elenco e amostras).

## Validadores
```
npm run validar        # validar-interiores avisa fala > 44 letras e «» desbalanceado
npm test               # inclui as referências de dados e vozes (lista de falas) contra o commit base
```

Diferenças esperadas no `npm run e2e` (como ler e o que é defeito: `README.md`):
- dados: `falas` (e `interiores`/`elenco`/`materias`, conforme onde o texto mora);
- vozes: os pacotes regravados (`vozes`); imagens: só as telas e balões que mostram o texto mudado.

No jogo (`npm run ver -- --ir <lugar> --js 'console.log(JSON.stringify(__reino.faltando))'`): `__reino.faltando` lista as falas pedidas sem áudio (tem que ficar vazio).

## Armadilhas
- Fala mudada sem regravar: fica muda (ou com o áudio velho, se o texto antigo ainda existir em outro lugar).
- O cabeçalho dos pacotes cita um caminho antigo de propósito: mudar o texto mudaria todos os pacotes.
- Nunca abra `jogo/js/voz/*.js`, `jogo/ferramentas/gerado/falas.json`, `vozes-indice.json` nem `vozes-cache/`.
- Letras soletradas ("a letra H") só nos pacotes de Português.
