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
Conferir: servidor de TESTE + save sintético com estrelas (modelo em `enfeite-novo.md` §6), `__reino.entrar('petshop')`,
`Reino.UI.telaPetShop()`, `__reino.cuidados()` (despensa).

## Armadilhas
- Id de comida nunca muda nem é reaproveitado: a despensa do save guarda contadores por id (ids
  desconhecidos ficam guardados e sem efeito numa versão antiga).
- Toda compra pergunta ANTES de gastar, com a guarda de toque (`docs/contratos/loja.md` §6): use a tela que existe.
- Água é de graça e só no bebedouro; comida não mexe na sede.
