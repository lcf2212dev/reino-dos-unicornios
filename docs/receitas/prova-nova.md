# Receita: prova bimestral nova (Escola do Reino)

Para que serve: pôr uma prova da escola (folha real) no jogo, com os 3 acessórios de prêmio.
Regras: `docs/contratos/conteudo.md` §5 e §8 (exemplo: Português), `docs/contratos/loja.md` §3.

## Checklist de arquivos
| Arquivo | O que é |
|---|---|
| `jogo/js/conteudo/provas/<m>-<n>bim.js` | `Reino.registrarProva({ id, materiaId, nome, bimestre, emoji, acessorios, questoes })` |
| `jogo/js/manifesto.js` | linha no grupo `'provas'` (`node: true`), depois das outras provas; `npm run index` |
| `jogo/js/arte/pixelart-unicornio-moldes.js` | desenho de cada acessório no bloco `var ENFEITES = {` (com `ancora`) |
| `jogo/js/arte/icones/<lote>.js` | ícones `"acessorio:<id>"` dos 3 acessórios (16×16) |
| (opcional) `jogo/js/personagens/elenco.js` + `jogo/js/nucleo/config.js` | professora com `paraProva: '<id da prova>'` e perfil `npc-<id>` (`personagem-novo.md`) |
| (opcional) `jogo/js/interiores/escola/falas.js` | falas da professora (`npcs.<id>`) |
Automático: a sala de aula na Escola (uma por prova), a vitrine de prêmios da Loja, a Área dos pais.
Sem professora no elenco: entra a "Professora do Reino" (`prof-<prova>`, voz `npc-padrao-3`).

## Passo a passo
1. Leia a folha (fotos na pasta da matéria). Enunciados e alternativas iguais aos da folha, na mesma ordem.
2. Copie o formato de `jogo/js/conteudo/provas/historia-3bim.js`: `acessorios: { lendario, raro, comum }`
   com `{ id, nome }`; questões com ids únicos (`<sigla>-01`…), `livro` (carta do livro da matéria) e `explica`.
3. Desenhe cada acessório no unicórnio (formato em `enfeite-novo.md` §3; o `slot` vem da `ancora`).
4. Ícone `acessorio:<id>` de cada um (formato em `enfeite-novo.md` §4).
5. Manifesto + `npm run index`.
6. Vozes: pacote `prova-<id>` (enunciados, opções, texto de apoio): `fala-nova-e-vozes.md`.

## Validadores
```
npm run validar        # validar-conteudo: acessórios com ícone e desenho, questões, livro
npm run unidade        # loja.test.js: um prêmio por raridade de cada prova, preço da config
npm test
npm run e2e            # esperado: dados das provas, da loja e da Escola
```

Referências (na worktree; precisam do git): em `npm test`, o passo *referências de dados* mostra a diferença
esperada abaixo; os outros passos têm que sair ✔. Diferenças esperadas no `npm run e2e`:
- dados: `falas`, `provas`, `interiores` (sala nova na Escola), `loja` (prêmios à venda, acessórios) e `vozes`;
- imagens: `tela-escola`, `tela-loja`, o interior da Escola e a Loja por dentro (vitrine de prêmios).
A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
depois do commit da mudança; não edite esse arquivo na tarefa. Qualquer diferença fora da lista acima é defeito.

Conferir: servidor de TESTE, `__reino.entrar('escola')`, e a prova por `Reino.Provas.iniciar`.

## Armadilhas
- Acessório sem `"acessorio:<id>"` quebra a tela de prêmios (`Reino.Provas.icone`); o validador acusa.
- Só nota 10 dá acessório; a tentativa define o tipo. Não mude a regra.
- Item com mais de uma resposta válida: `aceitas` (só as que a professora aceitaria).
- O que está escrito à mão na folha não é gabarito.
