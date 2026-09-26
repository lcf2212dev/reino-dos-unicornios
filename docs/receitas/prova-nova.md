# Receita: prova bimestral nova (Escola do Reino)

Para que serve: pôr uma prova da escola (folha real) no jogo, com os 3 acessórios de prêmio.
Regras: `docs/contratos/conteudo.md` §5 e §6 (exemplo: `provas/portugues-3bim.js`), `docs/contratos/loja.md` §3.

## Comece pelo gerador
```
npm run novo -- prova <m> <n> --nome "Revisão de Geografia" --professora <id> --nome-professora "Professora Rosa" --seco
npm run novo -- prova <m> <n> --nome "Revisão de Geografia" --professora <id> --nome-professora "Professora Rosa"
```
Cria `jogo/js/conteudo/provas/<m>-<n>bim.js` com 10 questões, os 3 acessórios inline e (com `--professora`) a
professora; põe a linha no manifesto e roda o index. À mão: questões, desenhos, ícones e vozes (`(preencher)` é recusado).

## Checklist de arquivos
| Arquivo | O que é |
|---|---|
| `jogo/js/conteudo/provas/<m>-<n>bim.js` | TUDO: `Reino.registrarProva({ id, materiaId, nome, bimestre, emoji, acessorios, questoes })` e `Reino.registrarPersonagem` da professora |
| `jogo/js/manifesto.js` | linha no grupo `'provas'` (`node: true`), depois das outras provas (o gerador põe) |
| (opcional) `jogo/js/interiores/escola/falas.js` | falas da professora (`npcs.<id>`) |
Automático: a sala de aula na Escola (uma por prova), a vitrine de prêmios da Loja, a Área dos pais.
Prova nova NÃO edita `pixelart-unicornio-moldes.js`, os lotes de `jogo/js/arte/icones/`, `elenco.js` nem `config.js`
(as provas de hoje continuam com os desenhos e professoras lá). Sem professora: entra a "Professora do Reino"
(`prof-<prova>`, voz `npc-padrao-3`).

## Passo a passo
1. Leia a folha: `npm run material -- <Pasta> --folha` e só as reduzidas em `/tmp/reino-testes/material/`, nunca
   os originais. O que a criança respondeu à mão NUNCA é gabarito: o enunciado vem do impresso.
   Enunciados e alternativas iguais aos da folha, na mesma ordem.
2. Questões com ids únicos (`<sigla>-01`…), `livro` (carta do livro da matéria) e `explica`. Formato:
   `jogo/js/conteudo/provas/historia-3bim.js`.
3. Acessórios `{ lendario, raro, comum }`, cada um `{ id, nome, desenho, icone }` no próprio arquivo
   (`docs/contratos/conteudo.md` §5 item 4): `desenho` = `linhas`, `paleta`, `ancora`, `dx`, `dy` (como em
   `enfeite-novo.md` §3); `icone` = `n`, `p`, `d` com 16 linhas de 16 (como em `enfeite-novo.md` §4).
   Encaixes (`ancora`): `cabeca`, `orelha`, `olho`, `chifre`, `pescoco`, `cauda` (cada vista do unicórnio tem o ponto; `olho`
   some nas vistas de costas). Confira nas 8 direções: `npm run ver -- --previa acessorios:<id>`.
4. Professora: `Reino.registrarPersonagem({ id, nome, paraProva: '<id da prova>', sprite, perfil })` no mesmo
   arquivo (`docs/contratos/npcs-e-dialogo.md` §5 item 4), voz diferente das outras professoras.
5. Vozes: pacote `prova-<id>` (enunciados, opções, texto de apoio): `fala-nova-e-vozes.md`.

## Validadores
```
npm run validar        # validar-conteudo: acessórios com ícone e desenho (inline: linhas, paleta, âncora), questões, livro, (preencher)
npm run unidade        # loja.test.js: um prêmio por raridade de cada prova, preço da config
npm test
npm run e2e            # esperado: dados das provas, da loja e da Escola
```

Diferenças esperadas no `npm run e2e` (como ler e o que é defeito: `README.md`):
- dados: `falas`, `provas`, `elenco` (professora), `interiores` (sala nova na Escola), `loja` (prêmios à venda, acessórios) e `vozes`;
- imagens: `tela-escola`, `tela-loja`, o interior da Escola e a Loja por dentro (vitrine de prêmios).

Conferir: `npm run ver -- --previa acessorios:<id do acessório>` (o desenho), `npm run ver -- --previa icones`,
`npm run ver -- --ir escola --nome escola` (a sala de aula) e `npm run ver -- --tela prova:<id> --tamanhos celular`
(a prova aberta). Em script: `abrirCenario()` de `jogo/ferramentas/testes/cenario.js`.

## Armadilhas
- Acessório sem `"acessorio:<id>"` quebra a tela de prêmios (`Reino.Provas.icone`); o validador acusa.
- Só nota 10 dá acessório; a tentativa define o tipo. Não mude a regra.
- Item com mais de uma resposta válida: `aceitas` (só as que a professora aceitaria).
- O que está escrito à mão na folha não é gabarito.
