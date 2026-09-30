# Balão sem efeito de digitação

## Contexto
O D5-15 do backlog visual perguntava se o texto do balão devia aparecer letra a letra, no ritmo de
`esperaFala.msPorLetra`, com toque para completar. O próprio item dizia que era escolha, não defeito.

## Decisão
O texto aparece inteiro. A voz já lê cada balão; o texto inteiro deixa a Mariana (7 anos) acompanhar a
leitura no ritmo dela e voltar os olhos para uma palavra, e não cria um toque a mais para completar antes de
responder.

## Consequências
Nenhum código novo. Se um dia a trava da fala (`esperaFala.travar`) voltar, o ritmo continua sendo o da voz,
não o de um efeito de tela.
