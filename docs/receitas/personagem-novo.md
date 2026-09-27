# Receita: personagem novo (NPC)

Para que serve: pôr uma pessoa (ou bicho) dentro de um prédio, com sprite, voz própria, falas e uma ação.
Regras: `docs/contratos/npcs-e-dialogo.md` (§2 formato, §5 elenco, §10 falas).

## Comece pelo gerador
```
npm run novo -- personagem <id> --predio <p> --nome "Seu Trigo" --seco
npm run novo -- personagem <id> --predio <p> --nome "Seu Trigo" [--x 5 --y 6] [--acao guia]
```
Cria (ou acrescenta) `jogo/js/interiores/<p>/personagens.js` com `Reino.registrarPersonagem({ …, predio, x, y, acao })`,
uma voz ainda não usada no prédio e as falas `(preencher)` (em `Reino.FALAS_INTERIORES.<p>.npcs.<id>`, no mesmo
arquivo). `--acao`: `guia` (padrão) ou um JSON (`'{"tipo":"tela","tela":"loja"}'`).
Prédio feito com `npm run novo -- predio`: o `<p>.js` já soma `Reino.personagensDoPredio('<p>')` à lista `npcs`,
então a pessoa aparece no interior sem editar o layout (sem `--x/--y`, na próxima vaga livre perto da entrada).
Prédio de antes (Pet Shop, Museu, Torre…, e o padrão das matérias): também soma os registrados, mas só com `x/y`;
sem `--x/--y` o gerador escolhe um chão livre alcançável perto da entrada e diz qual. `--predio` é o id do INTERIOR
(`torre-1`, `padrao-<m>`). À mão: sprite, falas e as vozes.

## Em frentes paralelas (pedido com plano)
O orquestrador reserva antes (onda 0), e cada parte vira uma frente (`docs/contratos/plano-paralelo.md`):
```
npm run novo -- reserva <id> --predio <p> --nome "Dona Lulu" --genero f --idade adulto [--x 3 --y 5] [--acao …]
npm run novo -- personagem <id> --predio <p>      # a frente do NPC: só o sprite (e a ação, se a reserva não tiver)
```
A reserva (`<p>/reservas.js`) fixa nome, gênero, idade, voz e vaga; as falas ficam em `<p>/personagens-falas.js`
(frente das falas; as vozes são gravadas sem esperar o visual). Até o registro, a vaga tracejada ocupa o tile.

## Checklist de arquivos (`<id>` = id do personagem, ex.: `rosa`)
| Arquivo | O que muda |
|---|---|
| `jogo/js/interiores/<p>/personagens.js` | `Reino.registrarPersonagem({ id, nome, sprite, perfil, predio?, x?, y?, acao?, paraMateria?, paraProva? })` e as falas `npcs.<id> = { oi, nova, feita, bloqueada, depois }` |
| `jogo/js/interiores/<p>/<p>.js` | só em prédio de antes: o NPC na lista `npcs` (com `x`, `y` e `acao`) |
| `amostras-de-voz/` (opcional, quem integra) | amostra da voz, conferida por transcrição |
Personagem novo NÃO edita `personagens/elenco.js` nem `nucleo/config.js` (os de hoje continuam lá). Professora
de prova nova: no arquivo da prova (`prova-nova.md`).

## Passo a passo
1. Registro (`docs/contratos/npcs-e-dialogo.md` §5 item 4): sprite com as opções dos outros (`penteado`, `chapeu`,
   `roupa`, `avental`, `oculos`…; bases `'fada'`, `'dragao'`, `'robo'`). Nome sem nome de unicórnio; ninguém
   imitando pessoa real. Cavaleiro do treino: `paraMateria: '<m>'`; professora: `paraProva: '<prova>'`.
   `perfil` vira `Reino.config.vozes['npc-<id>']`. Id repetido lança erro.
2. Voz (`perfil`): voz, velocidade e tom diferentes dos outros do MESMO prédio. Vozes que já funcionam: as de
   `jogo/js/nucleo/config.js`. Nunca reaproveite `npc-teste-*`.
3. Falas: curtas, como manda `licoes-de-voz.md`.
4. No interior: com `predio` (e `x`, `y`, `acao`) no registro, o `<p>.js` que lê `Reino.personagensDoPredio('<p>')`
   (todo prédio do gerador) já o põe lá. Nos outros, use o ajudante do próprio prédio (ex.: `npc(id, x, y, acao)` em
   `jogo/js/interiores/petshop/petshop.js`), que lê sprite, nome e voz do elenco. Ações: `sala`, `treino`,
   `prova`, `tela`, `guia` ou registradas (`docs/contratos/npcs-e-dialogo.md` §6–§7). Uma atividade = um NPC.
5. Vozes: `fala-nova-e-vozes.md` (o pacote é o do interior).

## Validadores
```
npm run validar        # validar-interiores: NPC em chão livre, voz no config (aviso), ações, falas longas (aviso > 44)
node jogo/ferramentas/vozes/listar-falas.js
npm test
```

Diferenças esperadas no `npm run e2e` (como ler e o que é defeito: `README.md`):
- dados: `elenco`, `interiores` (o NPC no prédio), `falas`, `loja` (a `config` entra aí: o perfil de voz novo)
  e `vozes`;
- imagens: as do interior onde o personagem mora (e a conversa com ele).

Conferir: `npm run ver -- --ir <lugar> --nome <id>` (fotos nos 3 tamanhos; `--js 'console.log(JSON.stringify(__reino.npcs()))'`
mostra id, tile e status). Em script: `abrirCenario()` de `jogo/ferramentas/testes/cenario.js`.

## Armadilhas
- Sem `perfil` no registro: o validador só avisa, mas a gravação falha.
- Mudar o nome, a voz ou uma fala muda o texto falado: precisa regravar.
- Números que mudam nas falas são enumerados (cada valor é gravado); nomes que ela digita não são falados.
