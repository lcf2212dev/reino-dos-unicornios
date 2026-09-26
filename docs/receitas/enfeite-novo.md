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
- Na sua worktree (ex.: `/home/leandro/reino-<tarefa>`), nunca em `/home/leandro/Mariana Revisões`.
- Rascunho em `/tmp` (se pedirem): copie a SUA worktree inteira, sem `node_modules`, sem `.git` e sem
  `jogo/servidor/dados` (banco da Mariana: nunca copie), e ligue o `node_modules`:
  ```
  rsync -a --exclude=/node_modules --exclude=/.git --exclude=/jogo/servidor/dados /home/leandro/<sua-worktree>/ /tmp/<voce>/repo/
  ln -s /home/leandro/<sua-worktree>/node_modules /tmp/<voce>/repo/node_modules
  ```
  Todos os comandos abaixo rodam da raiz dessa cópia (ou da worktree).

### 1. Escolha os dados
- `id`: minúsculas com hífen, único entre enfeites E prêmios das provas (ex.: `margarida-orelha`).
- `nome`: pt-BR, curto, sem repetir nome de enfeite ou prêmio (ex.: "Margarida na orelha").
- `preco`: inteiro de 10 a 45.
- `slot`: um encaixe com âncora (lista acima). Um enfeite por encaixe: comprar troca o do mesmo encaixe.
- `espaco: true` só se for do tema espaço.

### 2. `jogo/js/conteudo/loja-itens.js`
Acrescente em `L.ENFEITES`, na ordem de preço (a ordem da lista é a ordem da tela da Loja e da vitrine):
```
{ id: 'margarida-orelha', nome: 'Margarida na orelha', preco: 19, slot: 'orelha', icone: 'enfeite:margarida-orelha' },
```
- `icone` sempre `'enfeite:<id>'` (o desenho do passo 4). Emoji solto só se já existir desenho dele.

### 3. Desenho no unicórnio (`jogo/js/arte/pixelart-unicornio-moldes.js`)
No bloco `var ENFEITES = {` (logo antes de `PA.ENFEITES_MONTARIA = ENFEITES;`), acrescente:
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
- Exatamente 16 linhas de 16 caracteres. Confira em `jogo/ferramentas/previas/icones.html` (por `file://`).

### 5. Validadores (da raiz)
```
npm run unidade      # loja.test.js e loja-enfeites-completos.test.js: id único, preço, encaixe, ícone e desenho
npm run validar      # conteúdo, interiores (carrega a Loja), index x manifesto, docs
npm run tamanho      # moldes e ícones são dados: até 800 linhas por arquivo
npm test             # tudo o que é rápido
```
Tudo tem que sair ✔. `loja-enfeites-completos.test.js` acusa: ícone que falta, desenho que falta e `ancora`
diferente do `slot`.

### 6. Conferir no jogo (visual), com save sintético
Salve o script abaixo em `/tmp/<voce>/conferir-enfeite.js` e rode
`node /tmp/<voce>/conferir-enfeite.js <raiz do repositório> <id> /tmp/<voce>/fotos`. Ele:
1. abre a prévia `jogo/ferramentas/previas/acessorios.html?id=<id>` por `file://` (o enfeite em 8 direções,
   4 estágios e montado) → previa.png;
2. sobe um servidor de TESTE (porta livre, banco em `/tmp/reino-testes/`), gera os saves sintéticos do
   próprio jogo (`jogo/ferramentas/testes/saves.js`), compra e veste o enfeite num unicórnio adulto;
3. abre o jogo no Chromium de teste (celular e notebook, `?debug=1&congelar=1`) → `mapa-<tamanho>.png` e a
   Loja rolada até o cartão do enfeite → `loja-<tamanho>.png`. Mostra os erros de página (tem que ser "nenhum").
```js
// Fotos para conferir um enfeite: a prévia (file://) e o jogo no servidor de TESTE com save sintético.
// Uso: node conferir-enfeite.js <raiz do repositório> <id do enfeite> <pasta de saída em /tmp>
const path = require('path');
const [raiz, id, saida] = process.argv.slice(2).map((a, i) => (i === 1 ? a : path.resolve(a)));
if (!raiz || !id || !saida || !saida.startsWith('/tmp/')) { console.error('uso: node conferir-enfeite.js <repo> <id> </tmp/pasta>'); process.exit(1); }
const T = path.join(raiz, 'jogo', 'ferramentas', 'testes');
const { iniciar } = require(path.join(T, 'servidor-teste'));
const { abrir, lancar } = require(path.join(T, 'navegador'));
const { gerarSaves } = require(path.join(T, 'saves'));
require('fs').mkdirSync(saida, { recursive: true });

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
async function noMapa(page) {
  await page.waitForFunction(() => window.__congelar && window.__reino, null, { timeout: 30000 });
  for (let i = 0; i < 400; i++) {
    const ok = await page.evaluate(() => { const h = document.querySelector('#hud'); return window.__reino.estado() === 'mapa' && h && !h.hidden; });
    if (ok) return avancar(page, 1000);
    await avancar(page, 50); await page.waitForTimeout(15);
  }
  throw new Error('o jogo não chegou no mapa');
}

(async () => {
  const browser = await lancar();
  const servidores = [];
  try {
    // 1. prévia: o enfeite em todas as vistas e estágios (abre por file://; o servidor não entrega ferramentas/)
    const url = 'file://' + path.join(raiz, 'jogo/ferramentas/previas/acessorios.html') + '?id=' + encodeURIComponent(id);
    const p = await abrir({ browser, url, tamanho: 'notebook' });
    await p.page.waitForTimeout(800);
    await p.page.screenshot({ path: path.join(saida, 'previa.png'), fullPage: true });
    console.log('erros na prévia:', p.page.__erros.length ? p.page.__erros : 'nenhum');
    // 2. save sintético feito pelo próprio jogo (saves.js), com o enfeite comprado e vestido, montaria adulta
    const s1 = await iniciar({ raiz: path.join(raiz, 'jogo') }); servidores.push(s1);
    const a = await abrir({ browser, url: s1.url, tamanho: 'celular', query: '?debug=1&congelar=1' });
    await a.page.waitForFunction(() => window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
    const saves = await a.page.evaluate(`(${gerarSaves.toString()})()`);
    const save = saves.completo;
    save.loja[id] = true;
    save.usando.enfeites = [id];
    save.unis.inicial.xp = 200;          // adulto
    await a.context.close();
    // 3. o jogo com esse save, em outro servidor de teste (banco novo)
    for (const tamanho of ['celular', 'notebook']) {
      const s = await iniciar({ raiz: path.join(raiz, 'jogo') }); servidores.push(s);
      const b = await abrir({ browser, url: s.url, tamanho, save, query: '?debug=1&congelar=1' });
      await noMapa(b.page);
      await b.page.screenshot({ path: path.join(saida, `mapa-${tamanho}.png`) });
      await b.page.evaluate((id) => {
        Reino.UI.telaLoja();
        try { Reino.Claude.limpar(); } catch (e) { /* sem balão */ }
        const nome = Reino.LojaItens.enfeite(id).nome;   // rola a tela até o cartão do enfeite
        const c = [...document.querySelectorAll('#telas *')].find((e) => e.children.length === 0 && e.textContent.trim() === nome);
        if (c) c.scrollIntoView({ block: 'center' });
      }, id);
      await avancar(b.page, 800);
      await b.page.screenshot({ path: path.join(saida, `loja-${tamanho}.png`) });
      console.log(`${tamanho}: vestindo`, await b.page.evaluate(() => Reino.Progresso.estado().usando.enfeites), 'erros:', b.page.__erros.length ? b.page.__erros : 'nenhum');
      await b.context.close();
    }
    console.log('fotos em ' + saida);
  } finally {
    await browser.close();
    servidores.forEach((s) => s.parar());
  }
})().catch((e) => { console.error('✘ ' + e.message); process.exit(1); });
```
Olhe as fotos (ex.: com a ferramenta de ler imagem): o enfeite aparece em cada vista da prévia, sem cobrir o
olho; no mapa, na montaria; na Loja, o cartão com o ícone e "Usando".

### 7. Referências (prova de que o resto não mudou)
`npm run e2e` compara com o commit base. Diferenças ESPERADAS: os dados da Loja (o item novo) e, se o enfeite
entrou entre os 6 primeiros da lista, as imagens com a montaria enfeitada (os saves sintéticos vestem os
primeiros da lista). Qualquer outra diferença é defeito. Registre as esperadas para quem integra.

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
  compra fica). Por isso servidor de casa e artifact são atualizados no mesmo dia (quem faz é o orquestrador).
- No zsh deste PC, `cp` pede confirmação ao sobrescrever: use `command cp -f` em scripts.
- Temporários ficam em `/tmp`; não apague (se precisar, só com o caminho escrito por extenso).
- Testes só no Chromium de `jogo/ferramentas/testes/navegador.js`; nunca a porta 80 nem outro navegador.
