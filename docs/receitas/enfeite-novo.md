# Receita: enfeite novo na Loja das Fadas

Para que serve: pôr à venda um enfeite novo para o unicórnio (comprado com estrelas), desenhado no
unicórnio e com ícone em pixel. Regras: `docs/contratos/loja.md` §2 e §4.

## Quando usar
- Enfeite novo num encaixe que já existe: `orelha`, `olho`, `cabeca`, `chifre`, `pescoco`, `cauda`.
- NÃO serve para: encaixe novo (precisa de âncora nova nos 10 moldes, `docs/contratos/loja.md` §4.3), capa,
  rastro e asas (são especiais, desenhados por código), prêmio de prova (`prova-nova.md`).

## Checklist de arquivos
| Arquivo | O que muda |
|---|---|
| `jogo/js/conteudo/loja-itens.js` | uma linha em `L.ENFEITES` |
| `jogo/js/arte/pixelart-unicornio-moldes.js` | uma entrada no bloco `var ENFEITES = {` (perto do fim do arquivo) |
| `jogo/js/arte/icones/loja-petshop.js` | o ícone `"enfeite:<id>"` (16×16) |
| (opcional) `jogo/js/arte/pixelart-unicornio-moldes.js` | desenho próprio de uma vista (`enfeites:` de `UNI.<estágio>.<vista>`) |
Nada no manifesto (nenhum arquivo novo), nada no save (o save guarda só ids), nenhuma voz nova (o nome do
enfeite só aparece na tela; a fala "faltam estrelas" é fixa).

## Passo a passo
### 0. Onde trabalhar
- Na sua worktree (ex.: `/home/leandro/Development/projects/reino-dos-unicornios/worktrees/reino-<tarefa>`), nunca em `/home/leandro/Development/projects/reino-dos-unicornios`.
- Recomendado: uma worktree NOVA para a tarefa (o orquestrador cria; `node_modules` é um link). Nela tudo
  roda, inclusive `npm test` inteiro e `npm run e2e` (que precisam do git para ler o commit base).
- Rascunho em `/tmp` (só se pedirem): copie a SUA worktree inteira, sem `node_modules`, sem `.git` e sem
  `jogo/servidor/dados` (banco da Mariana: nunca copie), e ligue o `node_modules`:
  ```
  rsync -a --exclude=/node_modules --exclude=/.git --exclude=/jogo/servidor/dados /home/leandro/<sua-worktree>/ /tmp/<voce>/repo/
  ln -s /home/leandro/<sua-worktree>/node_modules /tmp/<voce>/repo/node_modules
  ```
  Alternativa equivalente ao rsync (a cópia de um commit, sem `.git` e sem `jogo/servidor/dados`, que não está no git):
  ```
  mkdir -p /tmp/<voce>/repo && git -C /home/leandro/<sua-worktree> archive <commit> | tar -x -C /tmp/<voce>/repo
  ln -s /home/leandro/<sua-worktree>/node_modules /tmp/<voce>/repo/node_modules
  ```
  (o `archive` leva só o que já está no commit: mudanças ainda não commitadas ficam de fora).
  No rascunho (sem `.git`) rode só `npm run unidade`, `npm run validar`, `npm run tamanho` e o §6. As
  referências (`npm run e2e` e o passo *referências de dados* do `npm test`) rodam na worktree, depois de
  levar a mudança para lá.

### 1. Escolha os dados
- `id`: minúsculas com hífen, único entre enfeites E prêmios das provas (ex.: `margarida-orelha`).
- `nome`: pt-BR, curto, sem repetir nome de enfeite ou prêmio (ex.: "Margarida na orelha").
- `preco`: inteiro; hoje os preços vão de 8 a 45 (a regra de 10–45 de `docs/contratos/loja.md` §4.1 valeu
  para a leva das novidades); o teste só exige inteiro > 0.
- `slot`: um encaixe com âncora (lista acima). Um enfeite por encaixe: comprar troca o do mesmo encaixe.
- `espaco: true` só se for do tema espaço.

### 2. `jogo/js/conteudo/loja-itens.js`
Acrescente em `L.ENFEITES`, na ordem de preço; em empate de preço, depois dos que já existem (a ordem da
lista é a ordem da tela da Loja e da vitrine):
```
{ id: 'margarida-orelha', nome: 'Margarida na orelha', preco: 19, slot: 'orelha', icone: 'enfeite:margarida-orelha' },
```
- `icone` sempre `'enfeite:<id>'` (o desenho do passo 4). Emoji solto só se já existir desenho dele.
- Anote o índice do item na lista (0 = o primeiro): se for ≤ 5, espere mudança também nas imagens com a
  montaria no e2e (§7).

### 3. Desenho no unicórnio (`jogo/js/arte/pixelart-unicornio-moldes.js`)
No bloco `var ENFEITES = {`, no fim do grupo `// enfeites da Loja das Fadas`, antes de
`// prêmios da prova de Português` (não no fim do bloco: ali ficam os prêmios de Português), acrescente:
```
'margarida-orelha': { linhas: ['.kWk.', 'kWYWk', '.kWk.'], paleta: { k: '#3a2446', W: '#ffffff', Y: '#ffd34d' }, ancora: 'orelha', dx: -2, dy: 1 },
```
- `linhas`: uma string por linha de pixels; `.` = transparente; cada letra = uma cor da `paleta`.
- `k: '#3a2446'` (o contorno do jogo) em volta do desenho: sem ele o enfeite some no meio da crina.
- `ancora` = o mesmo `slot` do passo 2. `dx`/`dy`: deslocamento (px) do canto do desenho a partir da âncora.
- A âncora de cada vista está em `ancoras:` de cada molde (`UNI.adulto.lado`, `UNI.filhote.frente`…). Âncora
  `null` numa vista = o enfeite não aparece nela (ex.: `olho` de costas). As vistas da esquerda são espelho.
- Desenho diferente numa vista (opcional): em `enfeites:` daquele molde,
  `'<id>': { linhas, x, y, bebe?, naFrente? }` (usa a paleta do passo 3; `bebe` = outro desenho para o bebê;
  `naFrente` = pintado de novo por cima da Mariana montada). Exemplos: `gravata-borboleta`, `brinco-lua`.

### 4. Ícone (`jogo/js/arte/icones/loja-petshop.js`)
No começo do objeto, junto dos outros `"enfeite:…"`, no mesmo formato:
```
"enfeite:margarida-orelha": { n: "Margarida na orelha", p: { k: '#3a2446', W: '#ffffff', Y: '#ffd34d' }, d: [
  '................',
  ... 16 linhas de 16 letras (o contorno k faz parte do desenho) ...
] },
```
- Exatamente 16 linhas de 16 caracteres. Confira na prévia `jogo/ferramentas/previas/icones.html` (por `file://`):
  `npm run ver -- --previa icones` (§6).

### 5. Validadores (da raiz)
```
npm run unidade      # loja.test.js e loja-enfeites-completos.test.js: id único, preço, encaixe, ícone e desenho
npm run validar      # conteúdo, interiores (carrega a Loja), index x manifesto, docs
npm run tamanho      # moldes e ícones são dados: até 800 linhas por arquivo
npm test             # tudo o que é rápido (só na worktree: o último passo precisa do git)
```
Unidade, validadores e tamanho têm que sair ✔. Em `npm test`, o passo *referências de dados* mostra a
diferença esperada da Loja (§7); os outros passos têm que sair ✔. `loja-enfeites-completos.test.js` acusa: ícone que falta, desenho que falta e `ancora`
diferente do `slot`.

### 6. Conferir no jogo (visual), com save sintético
Com `npm run ver` (servidor de TESTE e banco novos, save sintético; fotos em `/tmp/reino-testes/ver/<nome>/`,
sai com erro se houve erro de console):
```
npm run ver -- --previa acessorios:<id> --nome enf-previa         # o enfeite em 8 direções, 4 estágios e montado
npm run ver -- --previa icones --nome enf-icone                # o cartão enfeite:<id> (6x e tamanho do jogo)
M='{"loja":{"<id>":true},"usando":{"enfeites":["<id>"]},"unis":{"inicial":{"xp":200}}}'   # comprado, vestido, adulto
npm run ver -- --mudar "$M" --tamanhos celular,notebook --nome enf-frente --js 'Jogador.virar(0,1)'
npm run ver -- --mudar "$M" --tamanhos celular,notebook --nome enf-lado   --js 'Jogador.virar(1,0)'
npm run ver -- --mudar "$M" --tamanhos celular,notebook --nome enf-costas --js 'Jogador.virar(0,-1)'
npm run ver -- --mudar "$M" --estrelas 500 --tela loja --nome enf-loja   # role até o cartão com --js se preciso
```
Para ampliar a montaria: `--recorte x,y,w,h --ampliar 4` (a posição na tela: `Reino.Cena.paraTela(Jogador.x, Jogador.y)`).
Em script (mais fotos numa sessão só): `abrirCenario()` de `jogo/ferramentas/testes/cenario.js` (exemplo no topo do arquivo).
Olhe as fotos (ex.: com a ferramenta de ler imagem): o enfeite aparece em cada vista da prévia, sem cobrir o
olho; na montaria, nas vistas em que o encaixe aparece (enfeite de `cauda` some de frente e o de `olho`, de
costas: para esses encaixes vale a vista de lado e a prévia); na Loja, o cartão com o ícone e "Usando".

### 7. Referências (prova de que o resto não mudou)
Regras gerais das referências: `README.md`. Diferenças ESPERADAS no `npm run e2e`:
- os dados da Loja (o item novo), também no passo *referências de dados* do `npm test`;
- a imagem `loja` muda sempre (a grade se desloca);
- as imagens com a montaria mudam se o enfeite cair nas posições 0–5 da lista (os saves sintéticos de
  `jogo/ferramentas/testes/saves.js` compram as posições 0–5 e vestem 0–1 e 2–4).
Registre as esperadas para quem integra.

## Armadilhas
- `'<id>': { linhas` aparece também em `enfeites:` de cada vista: o desenho principal vai no bloco
  `var ENFEITES = {`, não nos moldes (trocar texto com busca simples pega os dois lugares).
- `ancora` diferente do `slot`: o enfeite fica no encaixe errado e o teste de unidade acusa.
- Ícone sem desenho: a Loja mostra o texto `enfeite:<id>` no lugar do ícone. Todo emoji que aparece na tela
  precisa de desenho em `jogo/js/arte/icones/`.
- Não dá para ver pelo servidor de teste as prévias de `jogo/ferramentas/previas/`: ele só entrega
  `index.html`, `css/` e `js/`. Prévia é por `file://`.
- Save: nada novo. Nunca teste com o save real; só `jogo/ferramentas/testes/saves.js`.
- Aba com a versão antiga do jogo não conhece o id novo: ao trocar de enfeite, ela o tira do unicórnio (a
  compra fica). Ela se atualiza sozinha quando para no mapa (`cena-e-motor.md` §15).
- "Page crashed"/"Target crashed" no Chromium: confira `df -h /tmp`; se estiver cheio, rode com
  `TMPDIR=/dev/shm/<pasta>` (não apague temporários de outros).
- No zsh deste PC, `cp` pede confirmação ao sobrescrever: use `command cp -f` em scripts.
- Temporários ficam em `/tmp`; não apague (se precisar, só com o caminho escrito por extenso).
- Testes só no Chromium (`npm run ver` / `abrirCenario`); nunca a porta 80 nem outro navegador.
