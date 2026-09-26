# Receita: comida nova na Pet Shop

Para que serve: uma comida nova para a montaria, comprada com estrelas na Pet Shop e guardada na despensa.
Regras: `docs/contratos/cuidados.md` §2 e §6, `docs/contratos/loja.md` §5.

## Checklist de arquivos
| Arquivo | O que muda |
|---|---|
| `jogo/js/nucleo/config.js` | uma entrada em `Reino.config.comidas`: `{ id, nome, icone, preco, fome, enche? }` |
| `jogo/js/arte/icones/loja-petshop.js` | o desenho do emoji do `icone` (se ainda não existir) |
| (opcional) `jogo/js/interiores/petshop/` | objeto novo na loja (desenho e fala) |
Nada no save (a despensa guarda por id), nenhum arquivo novo.

## Passo a passo
1. Acrescente NO FIM de `Reino.config.comidas` (a ordem é a da tela e da despensa; os saves sintéticos usam
   as 3 primeiras). `fome` = quanto enche (0–100); `enche: true` vai direto a 100.
2. Emoji do `icone`: se não há `"<emoji>"` em `jogo/js/arte/icones/`, desenhe (16×16, formato do lote; confira
   em `jogo/ferramentas/previas/icones.html` por `file://`).
3. Nome curto (a tela quebra nomes longos). O nome aparece na tela; as falas dos cuidados são fixas
   (`Reino.Cuidados.frases`), então não há voz nova, a não ser que você mude uma fala.

## Validadores
```
npm run unidade        # cuidados-despensa, cuidados-fome-sede (compra, alimentar, preços)
npm run validar
npm test
npm run e2e            # esperado: dados da config/Pet Shop mudam
```

Referências (na worktree; precisam do git): em `npm test`, o passo *referências de dados* mostra a diferença
esperada abaixo; os outros passos têm que sair ✔. Diferenças esperadas no `npm run e2e`:
- dados: `loja` (`comidas` e `config`);
- imagens: `tela-petshop` (e o Estábulo, se a comida estiver na despensa do save sintético: só as 3 primeiras estão).
A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
depois do commit da mudança; não edite esse arquivo na tarefa. Qualquer diferença fora da lista acima é defeito.

Conferir (fotos em `/tmp/reino-testes/ver/<nome>/`; `<nome>/estado.json` traz `__reino.cuidados()` com a despensa):
```
npm run ver -- --estrelas 500 --ir petshop --tela petshop --nome comida      # a tela da Pet Shop com o item
npm run ver -- --cuidados fome=10,sede=5 --tela estabulo --tamanhos celular   # barras e despensa
```
Em script: `abrirCenario()` de `jogo/ferramentas/testes/cenario.js`.

## Armadilhas
- Id de comida nunca muda nem é reaproveitado: a despensa do save guarda contadores por id (ids
  desconhecidos ficam guardados e sem efeito numa versão antiga).
- Toda compra pergunta ANTES de gastar, com a guarda de toque (`docs/contratos/loja.md` §6): use a tela que existe.
- Água é de graça e só no bebedouro; comida não mexe na sede.
