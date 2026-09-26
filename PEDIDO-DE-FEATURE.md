# Modelo para pedir uma novidade no Reino

Como usar:
1. Copie um dos modelos abaixo (o curto ou o completo).
2. Preencha só o que importa. Campo em branco vale o padrão escrito nele. Não precisa repetir o que está em "O que já vale sempre".
3. Cole na conversa com o Claude. A primeira linha, `/nova-feature`, chama a skill que segue este modelo.

Sem tempo para o modelo? Escreva do seu jeito e comece com `/preparar-pedido`.

Fotos e prints vão numa pasta dentro de `matérias/`. Exemplo: `Mariana Revisões/matérias/geografia/`. No pedido, escreva só o nome da pasta.

## Modelo curto (ajuste pequeno ou correção)
```
/nova-feature
O que quero:
Onde aparece:
Pronto quando:
Parar antes? (em branco = até a main e o GitHub)
```

## Modelo completo (novidade de verdade)
```
/nova-feature

# 1. Nome
(2 ou 3 palavras; vira a branch feat/<nome>)
Para quando: (se tiver data. Exemplo: "prova na sexta")

# 2. Tipo (marque um ou mais)
[ ] Matéria nova ou salas novas
[ ] Prova da escola
[ ] Prédio novo, ou um prédio por dentro
[ ] Personagem novo
[ ] Mecânica nova (como banho, fotos, pergunta surpresa)
[ ] Jeito novo de perguntar (tipo de desafio)
[ ] Enfeite, comida ou prêmio da Loja
[ ] Música
[ ] Fala nova ou mudada (voz)
[ ] Ajuste ou correção de algo que já existe
[ ] Outro:

# 3. O que eu quero (1 a 3 frases)


# 4. Por que (o que isso faz pela Mariana)
(exemplos: revisar a tabuada sem pressa, dar vontade de voltar ao jogo, acalmar antes da prova)


# 5. Como a Mariana usa, passo a passo
1. Onde ela está e o que vê primeiro:
2. O que ela toca:
3. O que acontece:
4. Como termina e o que ela ganha:

# 6. Onde fica no reino
(mapa, dentro de qual prédio, qual menu ou tela. Se não fizer diferença, escreva "você escolhe")
Como ela acha a novidade: (o caminho até ela: porta, escada, menu Lugares, botão)


# 7. Material
(pasta com prints ou fotos, imagens de referência, links)


# 8. Personagens e falas
Quem aparece:
Jeito de falar:
Textos:     [ ] escrevo eu (abaixo)   [ ] escreva você
Voz nova:   [ ] quero ouvir amostras e escolher   [ ] use uma que já existe

# 9. Prêmios
(estrelas, R$, unicórnio, acessório, enfeite. Se não tiver prêmio, escreva "nenhum")
Caminho por persistência (ganhar sem acertar tudo):   [ ] você propõe   [ ] quero assim:

# 10. Números que eu quero poder mudar depois
(exemplos: quantas vezes por dia, quanto custa, quanto tempo dura)


# 11. O que NÃO pode mudar


# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook
Onde ela joga (se usa recurso do aparelho, como compartilhar, baixar ou câmera):   [ ] claude.ai   [ ] servidor de casa

# 13. Pronto quando (o que eu vou conferir)
- [ ]
- [ ]
- [ ]

# 14. Decisões
O que você já sabe que quer (o resto o Claude decide):

# 15. Até onde ir
Padrão: construir, testar, pôr na main (o servidor de casa passa a servir a novidade) e mandar para o GitHub.
[ ] Parar antes: só servidor de teste para eu jogar
[ ] Também republicar o artifact do claude.ai
```

## O que já vale sempre (não precisa escrever)
- **Progresso da Mariana:** ninguém toca. Os testes usam só o servidor de teste e saves inventados.
- **Sem pressa:** nada premia terminar primeiro.
- **Persistência:** todo prêmio pode ser ganho de outro jeito, além de acertar tudo. A exceção é o acessório da Escola, que exige nota 10.
- **Nada se perde:** nada tira o que ela já ganhou.
- **Textos:** português correto, carinhosos, em frases curtas. No balão do celular cabem umas 30 letras por página.
- **Ícones:** todo emoji na tela vira desenho em pixel art.
- **Vozes:** toda fala nova ganha voz gravada e conferida.
- **Tamanhos:** funciona no celular, no tablet e no notebook, e também pelo teclado (Tab, Enter e Esc).
- **Dinheiro:** vale a regra de hoje (R$ 20 por matéria, salas de R$ 0,50 em R$ 0,50). Só muda se você pedir.
- **Números:** os ajustáveis ficam em `jogo/js/nucleo/config.js`.

## O que o Claude faz com o pedido
O Claude não pergunta nada: decide o que faltar, constrói à parte, testa, põe na main e manda para o GitHub. No fim
te conta o que ficou pronto, o que ele decidiu e o endereço de um servidor de teste para você jogar.

## Exemplo preenchido
```
/nova-feature

# 1. Nome
estrela cadente

# 2. Tipo
[x] Mecânica nova

# 3. O que eu quero
De vez em quando cai uma estrela cadente no mapa. Se a Mariana chegar até ela, ganha 1 estrela e o Claude comemora.

# 4. Por que
Dar um motivo para passear pelo reino entre uma sala e outra, sem cobrança.

# 5. Como a Mariana usa, passo a passo
1. Ela está andando no mapa e vê um brilho caindo perto de um prédio.
2. Ela anda até o brilho.
3. A estrela voa até o contador de estrelas, com um som curto.
4. O Claude diz algo como "Uma estrela cadente! Faça um pedido!".
   Se ela não for buscar, a estrela some sozinha, sem aviso de que perdeu.

# 6. Onde fica no reino
Só no mapa, em lugar que ela alcança andando (nunca na água).

# 8. Personagens e falas
Textos: [x] escreva você
Voz nova: [x] use uma que já existe (a do Claude)

# 9. Prêmios
1 estrela por estrela cadente, no máximo 3 por dia.

# 10. Números que eu quero poder mudar depois
De quantos em quantos minutos cai, quanto tempo fica e o máximo por dia.

# 11. O que NÃO pode mudar
A pergunta surpresa continua igual, e as duas nunca aparecem ao mesmo tempo.

# 13. Pronto quando
- [ ] cai uma estrela a cada 5 a 10 minutos de jogo no mapa
- [ ] nunca cai na água nem em lugar onde ela não chega
- [ ] depois de 3 no dia, só volta a cair no dia seguinte
- [ ] no celular, dá para pegar só com toque

# 14. Decisões
Não mexer na pergunta surpresa.
```
