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
2. Grade, ver grande, salvar, apagar com confirmação.
3. NUNCA no save nem no servidor.
4. Sem IndexedDB (ou erro): só salvar no aparelho, com aviso gentil.

## 6. Botão 📷
1. No HUD de cima, perto da tela cheia: toque → `Fotos.tirar()`; toque longo (`config.fotos.toqueLongoMs`) →
   `Fotos.abrirAlbum()`. Desabilitado quando `!Fotos.podeTirar()` e apagado durante a transição (evento `'transicao'`).
2. O Álbum NÃO está no menu de baixo (com 5 botões o menu ficava com 420 px numa tela de 390 e cortava):
   abre pela prévia e segurando o 📷. No celular o 📷 fica embaixo do botão de tela cheia; no tablet/notebook, ao lado.
3. Os blocos do HUD de cima deixam o toque passar (`loja.md` §6, regra 9).

## 7. Antes de mexer, rode
```
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados,imagens
npm test
```
No navegador de teste: `__reino.fotos()`.
