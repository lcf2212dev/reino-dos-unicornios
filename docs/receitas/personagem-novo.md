# Receita: personagem novo (NPC)

Para que serve: pôr uma pessoa (ou bicho) dentro de um prédio, com sprite, voz própria, falas e uma ação.
Regras: `docs/contratos/npcs-e-dialogo.md` (§2 formato, §5 elenco, §10 falas).

## Checklist de arquivos (`<id>` = id do personagem, ex.: `rosa`)
| Arquivo | O que muda |
|---|---|
| `jogo/js/personagens/elenco.js` | `N.ELENCO.<id> = { nome, voz: 'npc-<id>', sprite: { … }, paraMateria?, paraProva? }` |
| `jogo/js/nucleo/config.js` | perfil `'npc-<id>': { voz, velocidade, tom, ingles?, efeito? }` em `Reino.config.vozes` |
| `jogo/js/interiores/<prédio>/falas.js` | `npcs.<id> = { oi, nova, feita, bloqueada, depois }` |
| `jogo/js/interiores/<prédio>/<prédio>.js` | o NPC na lista `npcs` do interior (com `x`, `y` e `acao`) |
| `amostras-de-voz/` (opcional, quem integra) | amostra da voz para o Leandro ouvir |
Nenhum arquivo novo: nada no manifesto.

## Passo a passo
1. Elenco: copie uma entrada parecida de `jogo/js/personagens/elenco.js`. Opções do sprite: as dos outros
   (`penteado`, `chapeu`, `roupa`, `avental`, `oculos`…; bases `'fada'`, `'dragao'`, `'robo'`). Nome sem
   nome de unicórnio; ninguém imitando pessoa real.
   - Cavaleiro do treino de uma matéria no Castelo: `paraMateria: '<m>'`. Professora da prova: `paraProva: '<prova>'`.
     Os prédios acham pelo `Reino.NPCs.doElenco` (sem mexer no Castelo nem na Escola).
2. Voz: perfil `npc-<id>` com voz, velocidade e tom diferentes dos outros do MESMO prédio (dá para reconhecer
   de ouvido). Vozes que já funcionam: as do `jogo/js/nucleo/config.js`. Nunca reaproveite `npc-teste-*`.
   Trechos «em inglês» com outro perfil: `ingles: 'npc-<id>-en'` (e crie esse perfil).
3. Falas: frases curtas (≤ 30 letras por página, 3+ palavras: `licoes-de-voz.md`).
4. No interior: use o ajudante do próprio prédio (ex.: `npc(id, x, y, acao)` em
   `jogo/js/interiores/petshop/petshop.js`), que lê sprite, nome e voz do elenco. Ações: `sala`, `treino`,
   `prova`, `tela`, `guia` ou registradas (`docs/contratos/npcs-e-dialogo.md` §6–§7). Uma atividade = um NPC.
5. Vozes: `fala-nova-e-vozes.md` (o pacote é o do interior).

## Validadores
```
npm run validar        # validar-interiores: NPC em chão livre, voz no config (aviso), ações, falas longas (aviso > 44)
node jogo/ferramentas/vozes/listar-falas.js
npm test
```
Conferir: servidor de TESTE, `__reino.entrar('<lugar>')`, `__reino.npcs()` (id, tile, status).

## Armadilhas
- Voz sem perfil em `Reino.config.vozes`: o validador só avisa, mas a gravação falha.
- Mudar o nome, a voz ou uma fala muda o texto falado: precisa regravar.
- Números que mudam nas falas são enumerados (cada valor é gravado); nomes que ela digita não são falados.
