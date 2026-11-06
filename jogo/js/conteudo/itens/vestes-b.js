/* Roupas de aventura, parte B: ARMADURAS, BOTAS, ESPADAS e ESCUDOS (docs/contratos/itens.md §3 e §8). Só dados: quem
   desenha é arte/itens-vestir.js (a cabeça mora em vestes-a.js).
   Armadura: troca { C: clara, D: escura, A: detalhe } nas linhas do corpo até a cintura (saia: true, até a saia, com
   pregas [a, b]); ombro, cinto, fivela, peito (de frente) e mangas (o braço de cima): letras pintadas por cima.
   Botas: troca { S: o pé, K: o cano } nas 2 últimas linhas do corpo.
   Espada: 5 × 11, em pé, com o contorno (k) no desenho, como a de hoje (sistemas/bosque-desenho.js); escudo: até 8 × 9.
   Letras minúsculas da paleta do molde ('k' é o contorno #3a2446, já posto por quem desenha). */
(function () {
  var R = window.Reino;
  var V = R.VESTES = R.VESTES || {};

  /* ---------- ARMADURAS ---------- */
  // colete acolchoado cor de laranja, com costurinhas e cinto marrom
  V['armadura-colete'] = { paleta: { a: '#ffb070', b: '#d9783a', c: '#fff1d0', d: '#8a5530' },
    troca: { C: 'a', D: 'b', A: 'c' }, ombro: 'b', cinto: 'd', fivela: 'c' };
  // folhas verdes, com saia de folhinhas
  V['armadura-folhas'] = { paleta: { a: '#8fd46a', b: '#4e9a3c', c: '#d2f5a8', d: '#3a7a2e' },
    troca: { C: 'a', D: 'b', A: 'd' }, ombro: 'c', saia: true, pregas: ['a', 'b'], peito: 'c' };
  // casaco polar azul e fofo, com gola e mangas de pelinho branco
  V['armadura-polar'] = { paleta: { a: '#9fd3ff', b: '#5fa0e0', c: '#ffffff', d: '#3a6fb0' },
    troca: { C: 'a', D: 'b', A: 'b' }, ombro: 'c', mangas: 'c', saia: true, pregas: ['a', 'a'], fivela: 'c' };
  // peitoral de cristal lilás com uma pedra rosa no meio
  V['armadura-cristal'] = { paleta: { a: '#e3d4ff', b: '#a07de6', c: '#ffffff', d: '#ff7eb6', e: '#7c5cff' },
    troca: { C: 'a', D: 'b', A: 'b' }, ombro: 'e', cinto: 'e', peito: 'd', fivela: 'c' };
  // escamas vermelhas do dragão, ombreiras e cinto dourados
  V['armadura-dragao'] = { paleta: { a: '#e0503f', b: '#9c2b33', c: '#ffd34d', d: '#ff8a6a' },
    troca: { C: 'a', D: 'b', A: 'd' }, ombro: 'c', cinto: 'c', peito: 'c', mangas: 'b', saia: true, pregas: ['a', 'b'] };

  /* ---------- BOTAS ---------- */
  V['botas-galocha'] = { paleta: { a: '#ffd34d', b: '#e0a020' }, troca: { S: 'b', K: 'a' } };
  V['botas-neve'] = { paleta: { a: '#ffffff', b: '#8a5530' }, troca: { S: 'b', K: 'a' } };
  V['botas-vento'] = { paleta: { a: '#bfe9ff', b: '#ffd34d' }, troca: { S: 'b', K: 'a' } };
  V['botas-cristal'] = { paleta: { a: '#d7c2ff', b: '#7c5cff' }, troca: { S: 'b', K: 'a' } };
  V['botas-dragao'] = { paleta: { a: '#e0503f', b: '#9c2b33' }, troca: { S: 'b', K: 'a' } };

  /* ---------- ESPADAS (em pé: a ponta em cima, o cabo embaixo) ---------- */
  V['espada-madeira'] = { paleta: { w: '#e0b07a', l: '#b9733c', o: '#8a5530', p: '#6b4430' }, linhas: [
    '..k..', '.kwk.', '.kwk.', '.kwk.', '.klk.', 'kkkkk', 'koook', 'kkpkk', '.kpk.', '.kok.', '..k..'] };
  V['espada-bambu'] = { paleta: { w: '#a8e07a', l: '#5aa040', o: '#3a7a2e', p: '#d2b070' }, linhas: [
    '..k..', '.kwk.', '.klk.', '.kwk.', '.klk.', 'kkkkk', 'koook', 'kkpkk', '.kpk.', '.kok.', '..k..'] };
  V['espada-gelo'] = { paleta: { w: '#ffffff', l: '#9fd3ff', o: '#5fb4ff', g: '#ffffff', p: '#3a6fb0' }, linhas: [
    '..k..', '.kwk.', '.klk.', '.kwk.', '.klk.', 'kkkkk', 'kogok', 'kkpkk', '.kpk.', '.kok.', '..k..'] };
  V['espada-sol'] = { paleta: { w: '#fff4cc', l: '#ffd34d', o: '#ff8a3d', g: '#ffffff', p: '#a8480a' }, linhas: [
    '..k..', '.kwk.', '.kwk.', '.klk.', '.klk.', 'kkkkk', 'kogok', 'kkpkk', '.kpk.', '.kok.', '..k..'] };
  V['espada-cristal'] = { paleta: { w: '#ffe0f0', l: '#d7a6ff', o: '#b58cff', g: '#ff4f9a', p: '#7c5cff' }, linhas: [
    '..k..', '.kwk.', '.kwk.', '.klk.', '.klk.', 'kkkkk', 'kogok', 'kkpkk', '.kpk.', '.kok.', '..k..'] };
  V['espada-dragao'] = { paleta: { w: '#ffb08a', l: '#e0503f', o: '#ffd34d', g: '#6fdc8c', p: '#9c2b33' }, linhas: [
    '..k..', '.kwk.', '.klk.', '.kwk.', '.klk.', 'kkkkk', 'kogok', 'kkpkk', '.kpk.', '.kok.', '..k..'] };

  /* ---------- ESCUDOS (de frente) ---------- */
  V['escudo-madeira'] = { paleta: { a: '#c98a4a', b: '#8a5530', c: '#e8b97a', m: '#a9b8e0' }, linhas: [
    '.kkkkkk.', 'kmmmmmmk', 'kcabcabk', 'kcabcabk', 'kmmmmmmk', 'kcabcabk', '.kabcak.', '..kmmk..'] };
  V['escudo-concha'] = { paleta: { a: '#ffc2a8', b: '#e08a7a', c: '#fff1e6' }, linhas: [
    '..kkkk..', '.kcacak.', 'kcbababk', 'kabababk', 'kabababk', '.kababk.', '..kbbk..', '..kkkk..'] };
  V['escudo-neve'] = { paleta: { a: '#5fb4ff', b: '#3a86d6', w: '#ffffff' }, linhas: [
    '.kkkkkk.', 'kaawaaak', 'kawawaak', 'kaawwwak', 'kwwwbwwk', 'kawwwaak', '.kawabk.', '..kaak..'] };
  V['escudo-cristal'] = { paleta: { a: '#d7c2ff', b: '#a07de6', w: '#ffffff', d: '#ff7eb6' }, linhas: [
    '...kk...', '..kwak..', '.kwaabk.', 'kwaddabk', 'kaaddabk', '.kaaabk.', '..kabk..', '...kk...'] };
  V['escudo-dragao'] = { paleta: { a: '#e0503f', b: '#9c2b33', c: '#ff8a6a', g: '#ffd34d', e: '#6fdc8c' }, linhas: [
    'kkkkkkkk', 'kggaaggk', 'kgaaaagk', 'kaageaak', 'kaagaaak', 'kaaaaabk', '.kaaabk.', '..kabk..'] };
})();
