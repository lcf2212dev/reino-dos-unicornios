# Contrato: fotos e álbum

Cobre `Reino.Fotos`: tirar foto da cena do jogo (📷), a moldura com carimbo, a prévia, o download e o
álbum guardado só no aparelho. Fotos nunca vão para o save nem para o servidor.

## Índice
1. Onde está no código · 2. API · 3. Captura e moldura · 4. Prévia e download · 5. Álbum · 6. Botão 📷 · 7. Antes de mexer

## 1. Onde está no código
- `jogo/js/sistemas/fotos.js` — frases, banco (IndexedDB), lugar e data, captura (`Reino._fotos` interno).
- `jogo/js/sistemas/fotos-moldura.js` — moldura em pixel e carimbo.
- `jogo/js/sistemas/fotos-telas.js` — tirar (flash, prévia), álbum, foto grande, salvar, `depurar`.
- `css/ui-fotos.css`. Botão 📷: `jogo/js/ui/hud.js`. Números: `Reino.config.fotos`
  (`maxLado` 1600, `maxAlbum` 40, `banco` 'reino-fotos', `toqueLongoMs` 600).

## 2. API `Reino.Fotos`
```
podeTirar() → bool           // jogo começou, Cena.estado() é 'mapa' ou 'interior' (nadando inclusive), sem tela
tirar() → Promise<foto|null> // flash + som 'clique' + prévia "Que foto linda!"
abrirAlbum() → Promise
depurar() → { podeTirar, banco: 'ok' | 'sem-indexeddb' | 'erro', quantidade, ultima: { lugar, data, w, h } | null }
falas() → [{ texto, voz }]   // pacote geral
```
Nada toca em DOM, canvas, PA, Progresso ou Cena no carregamento.

## 3. Captura e moldura
1. Captura só o canvas `#reino` (sem o HUD), depois de desenhar um quadro limpo, sem íris.
2. Escala inteira mais próxima (vizinho mais próximo) com o lado maior ≤ `config.fotos.maxLado`; interior
   menor que a tela sai com as margens escuras do canvas.
3. Moldura em pixel e carimbo com o nome do lugar e a data, na fonte pixel. PNG.
4. Nunca pedir câmera (nada de `getUserMedia`).

## 4. Prévia e download
1. Prévia com "Guardar no álbum" (padrão), "Salvar no aparelho" e "Apagar".
2. A prévia descarta com ✕/Esc; "Apagar" na prévia não pergunta (a foto ainda não foi guardada).
3. Download: `reino-<lugar>-<data>.png` (lugar sem acento e com hífen, data AAAA-MM-DD); no mapa,
   `reino-dos-unicornios-<data>.png` (sem repetir "reino").
4. Avisos escritos na tela também são falados só como voz (sem balão); só "Foto guardada no álbum!" usa o
   balão do Claude.

## 5. Álbum
1. IndexedDB próprio `config.fotos.banco` ('reino-fotos'), só no aparelho, até `maxAlbum` (40) fotos (avisa
   quando lotar).
2. Grade, ver grande, compartilhar, salvar, apagar com confirmação.
5. Vazio: "O álbum ainda está vazio. Vamos tirar uma foto?" (escrito e falado).
6. Compartilhar (foto grande), LIVRE, sem PIN: Web Share API com arquivo (`File` PNG, nome de §4.3):
   `navigator.canShare({ files })` → `navigator.share({ files, title })`. Só aparece onde `canShare` diz sim
   (celular, tablet); aí ele é o principal e o Salvar vira secundário. No resto (ex.: Chrome no notebook
   Linux) o botão nem aparece e fica só o "Salvar no aparelho" (um botão que salvaria com outro nome
   confundiria a criança). Cancelar (`AbortError`) não diz nada; outro erro cai no salvar (e avisa "salva").
7. Onde cada jeito funciona. No artifact do claude.ai (`window.claude.use` existe) a plataforma recusa o share e
   bloqueia o download: "Compartilhar" e "Salvar no aparelho" ficam escondidos (prévia e foto grande); "Apagar" fica.
   No servidor de casa (http) não há Web Share API; o Salvar funciona. O Compartilhar só aparece em https fora do
   claude.ai. Em todo lugar, a foto (`.fotos-img` da prévia e da foto grande, `<img>` com URL `blob:`) deixa o menu
   do navegador: segurar (toque) ou botão direito. Sem `-webkit-touch-callout: none` nem `contextmenu` bloqueado
   nela (o 📷 do HUD continua sem menu).
8. Dica `.fotos-dica` embaixo da foto sempre que o Compartilhar não aparece (na prévia, sempre): com toque
   (`pointer: coarse`) "Segure a foto para compartilhar ou salvar."; com mouse "Clique com o botão direito na foto
   para salvar.". É legenda fixa, como lugar e data: NÃO é falada (não é aviso de algo que aconteceu; falar a cada
   foto aberta repetiria a mesma frase sem parar e taparia a voz das frases de §4.4).
3. NUNCA no save nem no servidor.
4. Sem IndexedDB (ou erro): só salvar no aparelho, com aviso gentil.

## 6. Botão 📷
1. No HUD de cima, perto da tela cheia (tela cheia, 📷, álbum): toque → `Fotos.tirar()`; toque longo (`config.fotos.toqueLongoMs`) →
   `Fotos.abrirAlbum()`. Desabilitado quando `!Fotos.podeTirar()` e apagado durante a transição (evento `Reino.EVENTOS.TRANSICAO`).
2. Botão do álbum (`.btn-album`, ícone `menu:album`) logo depois do 📷: um toque → `Fotos.abrirAlbum()`, apagado
   junto com o 📷. NÃO fica no menu de baixo (com 5 botões o menu ficava com 420 px numa tela de 390 e cortava).
   Também abre pela prévia e segurando o 📷. No celular os três ficam um embaixo do outro; no tablet/notebook, lado a lado.
3. Os blocos do HUD de cima deixam o toque passar (`loja.md` §6, regra 9).

## 7. Antes de mexer, rode
```
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
npm test
```
No navegador de teste: `__reino.fotos()`.
