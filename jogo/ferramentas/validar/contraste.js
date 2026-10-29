// Contraste do chão com o contorno da Mariana (docs/contratos/interiores.md): regra, conta WCAG e exceções.
// Medido no PIXEL DESENHADO pelo teste de navegador testes/unidade/contraste-pisos.navegador.test.js
// (a cor declarada do piso engana: a galáxia do Observatório pinta cores mais claras).
// Exceção = '<interior>:<cômodo>' → motivo. Só entra com motivo; cor do jogo não se muda aqui.
const MINIMO = 2.9;          // mediana da razão de contraste dos pixels do piso contra o contorno
const CONTORNO = '#3a2446';  // Reino.Desenho.K

const EXCECOES = {
  'observatorio:planetario': 'chão clareado aprovado pelo pai (interiores.md §6.7)',
  // medida em 2026-09-26 (mediana 2,87); o céu de noite do antigo andar 2 da Torre (2,90) saiu com o English do 4º bimestre
  'observatorio:cupula': 'aceito pelo Leandro em 2026-09-26',
};

// luminância relativa (WCAG 2) de r, g, b em 0–255
function luminancia(r, g, b) {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function razao(l1, l2) { return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function hexParaRgb(h) { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mediana(v) { const s = v.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

module.exports = { MINIMO, CONTORNO, EXCECOES, luminancia, razao, hexParaRgb, mediana };
