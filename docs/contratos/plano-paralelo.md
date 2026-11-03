# Contrato: plano paralelo e reservas de personagem

Cobre como um pedido pronto (`PEDIDO-DE-FEATURE.md`) vira um plano de frentes que rodam ao mesmo tempo: a reserva
de personagem no jogo (a vaga tracejada), o arquivo do plano, as ondas, os estados e a conferência em pipeline.
Por que a reserva mora no jogo e o plano nas ferramentas: `docs/decisoes/plano-paralelo.md`.
Procedimento: skill `orquestrar-frentes` ("Plano paralelo").

## Índice
1. Onde está · 2. Reserva de personagem (jogo) · 3. O plano (arquivo) · 4. Tipos de tarefa e conferência ·
5. Ondas, estados e pipeline · 6. Regras de divisão · 7. Antes de mexer

## 1. Onde está
- Jogo: `jogo/js/nucleo/registros.js` (`Reino.reservarPersonagem`, `Reino.reservas`, e o `registrarPersonagem` que
  preenche a reserva); `jogo/js/personagens/npcs-reserva.js` (a base de sprite `'reserva'`, a vaga tracejada).
- Ferramentas: `jogo/ferramentas/fluxo/plano.js` (`npm run plano`), catálogo em `jogo/ferramentas/fluxo/plano-tipos.js`;
  `npm run novo -- reserva` (`novo/tipo-reserva.js`); validador em `validar/validar-interiores.js`.
- Exemplo testado: `jogo/ferramentas/fluxo/exemplos/salao-beleza.plano.json`.

## 2. Reserva de personagem (jogo)
A reserva é o contrato de um NPC: quem é, com que voz fala e onde fica. Ela é escrita ANTES das frentes (onda 0) e
não muda durante elas; o cenário, o visual do NPC, as falas e as vozes trabalham em paralelo em cima dela.

```
Reino.reservarPersonagem({
  id: 'salao-lulu',                 // único no jogo, com o prefixo do prédio
  nome: 'Dona Lulu',
  genero: 'f',                      // 'f' | 'm' (o elenco-vozes confere a voz por ele)
  idade: 'adulto',                  // 'crianca' | 'jovem' | 'adulto' | 'idoso' (guia do sprite)
  perfil: { voz, velocidade, tom }, // vira Reino.config.vozes['npc-<id>'] na hora
  predio: 'salao', x: 3, y: 5,      // a vaga: id do INTERIOR e o tile (1×1, fica sólido como todo NPC)
  acao: { tipo: 'tela', tela: 'salao-cabelo' },   // opcional (sem ela, a do interior)
});
```
1. Arquivo: `jogo/js/interiores/<p>/reservas.js` (ou `conteudo/materias/<m>/reservas.js` no interior padrão),
   o PRIMEIRO do prédio no manifesto (antes do `falas.js`). É do orquestrador (onda 0); as frentes só leem.
2. Na hora da reserva: o perfil de voz entra em `Reino.config.vozes`, a pessoa entra em `Reino.personagens` (e no
   `ELENCO`) com o nome, a voz e `sprite: { base: 'reserva', genero, idade }`, e em `Reino.personagensDoPredio`
   com a vaga (x, y, acao). Todo prédio (antigo ou do gerador) já a põe no interior: aparece a vaga tracejada, com
   o nome, que conversa com as falas reais (se já existirem) e é sólida como o NPC final.
3. `Reino.registrarPersonagem({ id, sprite, acao?, paraMateria?, paraProva?, lugares? })` preenche a reserva
   (arquivo `personagens.js` do prédio, da frente do NPC). Pode repetir `nome`, `perfil`, `predio`, `x`, `y`,
   `acao`, mas igual à reserva: diferente é erro ("difere da reserva"); campo de contrato que a reserva não tem
   também é erro ("falta na reserva"). Sem `acao` na reserva, a do registro vale. A reserva não tem `lugares`: a
   mesma pessoa em outro interior vai no registro (`lugares`) ou em `Reino.personagemTambemEm`.
   O resultado no `ELENCO` e no interior é o mesmo de registrar sem reserva (as referências do e2e não mudam).
4. Registro antes da reserva do mesmo id: erro de id repetido (a ordem do manifesto do item 1 evita).
5. `Reino.reservas[id]` guarda a reserva; `Reino.reservas[id].preenchida` diz se o registro já veio.
6. Validador (`validar-interiores`): reserva sem registro é ERRO ("vaga tracejada na tela"); `genero`, `idade`,
   `perfil`, `predio`, `x`, `y` obrigatórios; a vaga passa pelas regras de todo NPC (chão livre, alcançável).
   Enquanto as frentes trabalham, `REINO_RESERVAS_ABERTAS=1` rebaixa a reserva sem registro a aviso (só nas
   frentes; a integração (`npm run integrar`) roda sem ela, e o merge exige tudo preenchido).
7. `npm run vozes-elenco` usa o `genero` da reserva (em vez de adivinhar pelo texto) para acusar voz de gênero trocado.

## 3. O plano (arquivo)
`pedidos/AAAA-MM-DD-<nome>.plano.json`, ao lado do pedido; entra no commit da feature. O pedido é do Leandro
(o que ela vê); o plano é do orquestrador (quem faz o quê, em que ordem) e é conferido por ferramenta.
```
{
  "nome": "salao-beleza",
  "pedido": "pedidos/2026-09-27-salao-beleza.md",
  "personagens": [ { "id", "nome", "genero", "idade", "predio", "x", "y", "acao"?, "perfil"? } ],
  "tarefas": [ {
    "id": "npc-lulu",                  // único; minúsculas e hífen
    "tipo": "npc",                     // §4
    "titulo": "Visual e ação da Dona Lulu",
    "quem": "builder",                 // builder | debugger | runner | tester | writer | orquestrador | <preset>
    "depende": ["contrato"],           // ids que BLOQUEIAM esta (dependência real, não preferência)
    "arquivos": ["jogo/js/interiores/salao/personagens.js"],   // posse exclusiva; pasta termina em '/'
    "worktree": "salao-npcs",          // reino-<worktree>; frentes só de texto podem dividir uma
    "personagens": ["salao-lulu"],     // (npc, falas, vozes) quem ela cobre
    "pronto": ["a Dona Lulu aparece no lugar da vaga, nos 3 tamanhos"],
    "estimativa": 20,                  // minutos (opcional; só para o caminho crítico)
    "ler": ["docs/contratos/interiores.md §8"],   // opcional: o que ler, por seção ("arquivo §n")
    "gerador": "npm run novo -- personagem …",   // opcional: o comando que começa a tarefa
    "modelo": "jogo/js/interiores/petshop/",     // opcional: o que copiar
    "testes": ["npm run unidade -- --so salao"]  // opcional: comando ou lista
  } ]
}
```

## 4. Tipos de tarefa e conferência
Cada tipo traz a conferência que o subagent conferente roda assim que a tarefa fica pronta
(`npm run plano -- conferente <plano> <tarefa>` imprime o briefing).

| Tipo | O que é | Conferência (além de `git status` e das afirmações do retorno) |
|---|---|---|
| `contrato` | reservas, ids, telas e APIs que outras frentes usam (orquestrador) | `npm run validar`, `vozes-elenco` limpo, ids únicos |
| `cenario` | layout do interior e objetos, com as vagas livres | `validar --so <p>`, `ver --ir <p>` 3 tamanhos, janelas vazias |
| `fachada` | o prédio de fora e o lugar no mapa | `ver --previa mapa`, `ver` do mapa nos 3 tamanhos |
| `npc` | sprite e ação de personagens reservados | `ver --ir <p> --nome <id>` 3 tamanhos, conversa, `validar` |
| `falas` | texto das falas (NPCs, objetos, extras) | lições de voz (30 letras, 3+ palavras), `listar-falas --mostrar` |
| `vozes` | perfis, amostras, gravação e conferência por transcrição (orquestrador) | `vozes-elenco`, transcrição sem `✘`, `__reino.faltando` vazio |
| `mecanica` | sistema ou tela nova (código) | `npm run unidade --so`, `ver --tela`, teclado (Tab, Enter, Esc) |
| `conteudo` | salas, livro, prova | `validar`, `ver --tela sala:<id>`/`prova:<id>`, `node jogo/ferramentas/validar/cobertura-4bim.js <m>` |
| `arte` | ícones, enfeites, comidas | `ver --previa`, ícone para todo emoji |
| `musica` | faixa nova | `testar-musicas.js` |
| `integracao` | juntar as frentes, vozes, e2e (orquestrador) | `validar-tudo` inteiro, diferenças do e2e explicadas |
| `entrega` | merge, push e a Vercel no ar (orquestrador) | skill `entregar`, `npm run vercel -- --conferir` |
| `ferramenta` | ferramentas, testes e docs | `npm run unidade -- --so <x>`, `--ajuda`, `npm test`, e2e idêntico |

## 5. Ondas, estados e pipeline
1. **Ondas**: onda de uma tarefa = 1 + a maior onda entre as que ela depende (a sem dependência é a onda 0).
   Tudo na mesma onda pode rodar junto; o teto de agentes é o do `CLAUDE.md` da raiz.
2. **Não se espera a onda inteira**: a tarefa começa quando as dependências dela estão `aprovada`
   (`npm run plano -- proximas <plano>`), mesmo que a onda anterior tenha outras ainda rodando.
3. **Estados**: `pendente` → `lancada` → `feita` (o worker voltou) → `aprovada` | `reprovada` (volta a `lancada`,
   retomando a mesma frente). Guardados em `/tmp/reino-testes/planos/<nome>.estado.json`
   (`npm run plano -- marcar <plano> <tarefa> <estado>`), fora do repositório.
4. **Pipeline de conferência**: ao marcar `feita`, a ferramenta imprime "lance o conferente de <tarefa>"; o
   conferente é lançado NA HORA, sem esperar as outras frentes. A integração só começa com todas `aprovada`.
5. Nenhuma conferência some por ser em pipeline: a integração ainda roda `npm test` e `npm run e2e` inteiros.

## 6. Regras de divisão (o `plano conferir` acusa)
1. Todo arquivo tem UM dono; pasta (`.../`) cobre tudo dentro. Os disputados (`package.json`, `CLAUDE.md`,
   manifesto, `index.html`, `COMO-USAR.md`, `docs/ARQUITETURA.md`, tipos, `.gitignore`, `base-referencia.txt`)
   só em tarefa do `orquestrador`; o worker cita a linha no retorno.
2. Dependências existem e não fecham ciclo.
3. Tarefa que usa um personagem (`npc`, `falas`, `vozes`, `cenario` do prédio dele) depende, direta ou
   indiretamente, da tarefa `contrato` que reserva esse personagem.
4. Todo personagem do plano tem `id`, `nome`, `genero`, `idade`, `predio`, `x`, `y` e aparece em exatamente uma
   tarefa `npc`.
5. `vozes` depende das `falas` dos mesmos personagens (a voz é achada pelo TEXTO EXATO); nunca do visual (`npc`).
6. `integracao` depende de todas as outras (menos `entrega`); `entrega` depende de `integracao`.
7. Frentes que dividem uma worktree não podem rodar navegador ao mesmo tempo: dividem worktree só as `falas` e
   `contrato` entre si, ou tarefas em sequência (uma depende da outra, como `vozes` na worktree das `falas`).
8. Troca de mãos em sequência vale: o `npm run novo -- reserva` do contrato cria `<p>/personagens-falas.js` com
   `(preencher)`, e a tarefa `falas` (que depende do contrato) é a dona dele dali em diante.

## 7. Antes de mexer
```
npm run plano -- conferir jogo/ferramentas/fluxo/exemplos/salao-beleza.plano.json
npm run unidade -- --so 'plano|reserva'
npm run validar
```
