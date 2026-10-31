// Casa do jogador, kits Banheiro, Quarto do jogador e Quarto do unicórnio (casa.md §3 e §5): cada item aponta para um
// objeto registrado com o id casa-<kit>-<item>; cada direção declarada desenha dentro da pegada (com a folga do topo);
// esq difere de baixo. Salva a prancha de cada kit em /tmp/reino-testes/casa-moveis-b/<kit>.png para olhar.
// Servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/casa-moveis-b';

test('kits b: itens registrados, desenho dentro da pegada em cada direção', async () => {
  fs.mkdirSync(PASTA, { recursive: true });
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: PASTA + '/cena' });
  try {
    const r = await c.js(`(function () {
      var T = 16, ESC = 4, OB = Reino.Interiores.OBJETOS, res = { erros: [], pranchas: {}, kits: [] };
      var DIRS = { 1: ['baixo'], 2: ['baixo', 'esq'], 4: ['baixo', 'cima', 'esq', 'dir'] };
      ['banheiro', 'quarto-jogador', 'quarto-uni'].forEach(function (kid) {
        var kit = Reino.kitCasa(kid);
        if (!kit) { res.erros.push('kit ' + kid + ' sem registro'); return; }
        var n = kit.itens.reduce(function (s, it) { return s + (it.qtd || 1); }, 0);
        res.kits.push({ id: kid, pecas: n, capa: !!OB[kit.capa] });
        var prancha = document.createElement('canvas'); prancha.width = 4 * 70 * ESC; prancha.height = kit.itens.length * 80 * ESC;
        var pc = prancha.getContext('2d'); pc.imageSmoothingEnabled = false; pc.fillStyle = '#efe6d8'; pc.fillRect(0, 0, prancha.width, prancha.height);
        kit.itens.forEach(function (it, li) {
          var lib = OB[it.objeto];
          if (it.objeto !== 'casa-' + kid + '-' + it.id) res.erros.push(it.objeto + ': id fora de casa-<kit>-<item>');
          if (!lib) { res.erros.push(it.objeto + ': objeto sem registro'); return; }
          if (!!lib.parede !== !!it.parede) res.erros.push(it.objeto + ': parede diferente no kit e no objeto');
          var vistas = {};
          DIRS[it.direcoes].forEach(function (dir, ci) {
            var lado = dir === 'esq' || dir === 'dir', w = lado ? lib.h : lib.w, h = lado ? lib.w : lib.h, topo = lib.topo || 0;
            var cv = document.createElement('canvas'); cv.width = 70; cv.height = 80;
            var cx = cv.getContext('2d'), px = 8, py = 8 + topo;
            lib.desenhar(cx, px, py, { tipo: it.objeto, x: 0, y: 0, w: w, h: h, dir: dir }, Reino.Progresso);
            var d = cx.getImageData(0, 0, 70, 80).data, dentro = 0, fora = 0;
            for (var y = 0; y < 80; y++) for (var x = 0; x < 70; x++) {
              if (!d[(y * 70 + x) * 4 + 3]) continue;
              if (x >= px && x < px + w * T && y >= py - topo && y < py + h * T) dentro++; else fora++;
            }
            if (!dentro) res.erros.push(it.objeto + ' ' + dir + ': não desenhou nada');
            if (fora) res.erros.push(it.objeto + ' ' + dir + ': ' + fora + ' px fora da pegada');
            vistas[dir] = cv.toDataURL();
            pc.strokeStyle = '#c0b0a0'; pc.strokeRect(ci * 70 * ESC + px * ESC, li * 80 * ESC + (py) * ESC, w * T * ESC, h * T * ESC);
            pc.drawImage(cv, ci * 70 * ESC, li * 80 * ESC, 70 * ESC, 80 * ESC);
          });
          if (vistas.esq && vistas.esq === vistas.baixo) res.erros.push(it.objeto + ': esq igual a baixo');
        });
        res.pranchas[kid] = prancha.toDataURL();
      });
      return res;
    })()`);
    for (const k of Object.keys(r.pranchas)) fs.writeFileSync(PASTA + '/' + k + '.png', Buffer.from(r.pranchas[k].split(',')[1], 'base64'));
    assert.deepStrictEqual(r.erros, []);
    assert.strictEqual(r.kits.length, 3);
    for (const k of r.kits) {
      assert.ok(k.pecas >= 6 && k.pecas <= 8, k.id + ': ' + k.pecas + ' peças');
      assert.ok(k.capa, k.id + ': capa sem objeto');
    }
  } finally { await c.fechar(); }
});
