# Receita: tipo de desafio novo

Para que serve: um jeito novo de perguntar (ex.: conta armada, relógio, arrastar números), quando nenhum dos tipos de hoje
serve (`escolha`, `vf`, `varias`, `ligar`, `ordenar`, `frase`, `separar`, `vfLista`, `completar`, `copiar`, `memoria`,
`desenho`). Regras: `docs/contratos/conteudo.md` §3.7. Antes de criar um tipo, veja se um de hoje com outro texto resolve.

## Comece pelo gerador
```
npm run novo -- desafio <tipo> --seco                 # confere o que vai criar (tipo em camelCase, ex.: contaArmada)
npm run novo -- desafio <tipo> [--treinavel] [--especial]
```
Ele cria `jogo/js/atividades/desafios/<tipo>.js` (com `Reino.registrarTipoDesafio` e uma tela mínima que já funciona),
o teste `jogo/ferramentas/testes/unidade/desafio-<tipo>.test.js`, a linha no manifesto e o index, e imprime o checklist.
- `--treinavel`: o tipo entra no treino do Castelo e na pergunta surpresa (só para tipos rápidos, de uma resposta).
- `--especial`: no sorteio da missão, no máximo 2 tipos especiais por sala.
- Declare `exemplos` no `Reino.registrarTipoDesafio` (ver `conteudo.md` §3.7): o esqueleto ainda não traz.

## Passo a passo
1. Formato: escreva no cabeçalho do arquivo os campos do desafio (troque os `(preencher)`).
2. Tela (`montar`): DOM só aqui dentro; chame `opts.onMudar()` quando a resposta mudar. Estilo, se precisar, em
   `jogo/css/ui-desafios.css` (sem arquivo CSS novo). Toque grande (celular 390 px de largura), sem depender de arrastar.
3. Pontos (`pontuar`, de 0 a 1; parcial vale) e correção (`textoCerto`, `textoResposta`).
4. Voz (`falas`): o que o 🔊 lê depois da pergunta. Tudo o que é lido é gravado: `fala-nova-e-vozes.md`.
5. Validador (`validar`): cada campo obrigatório do formato, com mensagem que diga o id do desafio.
6. Use numa sala (o checklist traz um desafio de exemplo para colar) e veja: `npm run ver -- --tela sala:<id da sala>`
   (e `--tamanhos celular` para conferir o toque).

## Validadores
```
npm run unidade          # o teste gerado + desafio-tipo.test.js
npm run validar
npm test
npm run e2e              # o tipo sozinho não muda nada; quando uma sala o usar, mudam os dados/imagens dessa sala
```

## Armadilhas
- No carregamento o arquivo não toca em `document` (ele é `node: true`: o validador e as falas carregam no Node).
- Tipo sem `validar` passa no validador sem checar nada: sempre escreva o `validar`.
- Mudar o que `falas` devolve muda o texto falado: regravar as vozes.
