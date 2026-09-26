# Receita: música nova (faixa de um ambiente)

Para que serve: uma faixa nova de música de fundo para um lugar (ou trocar a de um lugar).
Regras: `docs/contratos/som-musica-e-voz.md` §3. Formato da faixa: cabeçalho de `jogo/js/sistemas/musicas.js`.

## Checklist de arquivos (`<amb>` = ambiente, ex.: `padaria`)
| Arquivo | O que muda |
|---|---|
| `jogo/js/sistemas/musicas-faixas.js` | `F.<amb> = { nome, bpm, compasso, tom, modo, volume, timbres, secoes, ordem, … }` |
| `jogo/js/sistemas/som-musica.js` | o id do interior em `COM_MUSICA` (ambiente = id da cena; torre e portugues têm regra própria em `ambienteAgora`) |
| `jogo/ferramentas/testes/testar-musicas.js` | o ambiente na lista `AMBIENTES` |
| (se quiser cobrir) `jogo/ferramentas/testes/unidade/musicas.test.js` | o ambiente na lista conferida |

## Passo a passo
1. Copie uma faixa parecida de `jogo/js/sistemas/musicas-faixas.js` (graus da escala, `|` por compasso,
   durações em batidas; cada compasso soma `compasso` batidas).
2. Regras da faixa: ≥ 20 s antes de repetir, ≥ 2 seções diferentes, nenhum trecho < 20 s em loop, fim emendando
   no começo. Instrumentos: os nomes de `jogo/js/sistemas/som-instrumentos.js`.
3. Ligue o ambiente em `COM_MUSICA` (interior sem faixa toca a do mapa).
4. Acrescente o ambiente em `AMBIENTES` do `testar-musicas.js`.

## Validadores
```
node jogo/ferramentas/testes/testar-musicas.js   # duração, seções, loops curtos, emenda, compassos
npm run unidade
npm test
```

Referências (na worktree; precisam do git): em `npm test`, o passo *referências de dados* mostra a diferença
esperada abaixo; os outros passos têm que sair ✔. Diferenças esperadas no `npm run e2e`:
- dados: `loja` só se mudou `Reino.config.musica` (a `config` entra aí); faixas novas não entram nos dados;
- imagens: nenhuma (música não aparece na tela).
A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
depois do commit da mudança; não edite esse arquivo na tarefa. Qualquer diferença fora da lista acima é defeito.

Conferir: `npm run ver -- --ajustes '{"musica":true}' --ir <lugar> --js 'console.log(JSON.stringify(__reino.musicaAtual()))'`
mostra `faixa: '<amb>'`. Ouvir mesmo, só o Leandro.

## Armadilhas
- `musicas-faixas.js` é `node: true`: só dados, nada de áudio no carregamento.
- Música vem desligada por padrão (`ajustes.musica`); som e música têm ganhos separados.
- Rampa de volume sem `cancelAndHoldAtTime` (dava degrau no Chromium).
