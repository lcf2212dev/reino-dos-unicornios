/* Visual de menino do Salão e da criação de personagem: cortes curtos e roupas próprias, somados aos da Mariana
   (PA.CORTES / PA.MODELOS, com sexo: 'menino'). Só dados: quem aplica é PA._interno.aplicarVisual
   (pixelart-mariana-visual.js), nas 5 vistas, a pé (3 passos) e sentado (montado). Liberados para qualquer sexo.
   Letras novas da paleta (pixelart-personagens.js): Z cabelo raspado, J jeans, Q cinto, O prata, V prata escura. */
(function () {
  var PA = window.PA, I = PA._interno;

  /* ---------- CORTES (as 7 linhas da cabeça; o cabelo comprido some do corpo: curto) ---------- */
  var CORTES = {
    // curtinho penteado de lado, com orelhas aparecendo
    curto: { curto: true, menino: true,
      cabeca: {
        frente: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', '.HHHKKKKHH.', '.HKEKKKEKH.', '.KRKKKKKRK.', '...KKKKK...'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '.KHHHHHHHK.', '...KKKKK...'],
        lado: ['...HHHH....', '..HHHHHHH..', '..HLLHHHHH.', '..HHHHKKKK.', '..HKHKKEKK.', '..HHHKKKRK.', '...HHKKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '..HLLHHHHH.', '..HHHHKKKH.', '..HKHEKKEK.', '..HHKKKKRK.', '...HHKKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HHHLLHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '..HHHHHHKK.', '....KKKK...'],
      } },
    // espetado para cima, com pontas
    espetado: { curto: true, menino: true,
      cabeca: {
        frente: ['.H..H.H..H.', '.HH.HHH.HH.', '.HHHLHLHHH.', '.HHKHKKHKH.', '.HKEKKKEKH.', '.KRKKKKKRK.', '...KKKKK...'],
        costas: ['.H..H.H..H.', '.HH.HHH.HH.', '.HHHLHLHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '.KHHHHHHHK.', '...KKKKK...'],
        lado: ['.H..H.H....', '.HH.HHH.H..', '..HHLHLHHH.', '..HHHHKHKK.', '..HKHKKEKK.', '..HHHKKKRK.', '...HHKKKK..'],
        diagFrente: ['..H..H.H...', '..HH.HHH.H.', '..HHLHLHHH.', '..HHHKHKKH.', '..HKHEKKEK.', '..HHKKKKRK.', '...HHKKKK..'],
        diagCostas: ['.H..H.H....', '.HH.HHH.H..', '..HHLHLHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '..HHHHHHKK.', '....KKKK...'],
      } },
    // topete alto na frente
    topete: { curto: true, menino: true,
      cabeca: {
        frente: ['....HHHH...', '..HHLLHHH..', '.HHHHHLHHH.', '.HHKKKKKHH.', '.HKEKKKEKH.', '.KRKKKKKRK.', '...KKKKK...'],
        costas: ['...HHHH....', '..HHHHHHH..', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '.KHHHHHHHK.', '...KKKKK...'],
        lado: ['.....HHHH..', '..HHHHLLHH.', '..HHHHHHHHH', '..HHHKKKKK.', '..HKHKKEKK.', '..HHHKKKRK.', '...HHKKKK..'],
        diagFrente: ['....HHHH...', '..HHHHLLHH.', '..HLHHHHHHH', '..HHHKKKKH.', '..HKHEKKEK.', '..HHKKKKRK.', '...HHKKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHLH..', '..HHHLLHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '..HHHHHHKK.', '....KKKK...'],
      } },
    // cacheadinho fofo, bem cheio
    cacheadoCurto: { curto: true, menino: true,
      cabeca: {
        frente: ['..HLH.HLH..', '.HHHHHHHHH.', 'HHLHHLHHLHH', 'HHHKKKKKHHH', '.HKEKKKEKH.', '.KRKKKKKRK.', '...KKKKK...'],
        costas: ['..HLH.HLH..', '.HHHHLHHHH.', 'HLHHHHHLHHH', 'HHHLHHLHHLH', '.HHHHHHHHH.', '.KHLHHHLHK.', '...KKKKK...'],
        lado: ['..HLH.HH...', '.HHHHHLHH..', 'HLHHLHHHHH.', 'HHHHHKKKKK.', '.HKHKKKEKK.', '.HHHKKKKRK.', '..HHHKKKK..'],
        diagFrente: ['..HLH.HLH..', '.HHHHHHHHH.', 'HLHHLHHLHHH', 'HHHHKKKKKH.', '.HKHHEKKEK.', '.HHHKKKKRK.', '..HHHKKKK..'],
        diagCostas: ['..HLH.HH...', '.HHHHLHHHH.', 'HLHHHHLHHHH', 'HHHLHHHHLHK', '.HHHHHHHHK.', '.HLHHHHHKK.', '...KKKKK...'],
      } },
    // moicano: faixa no meio e os lados raspados
    moicano: { curto: true, menino: true,
      cabeca: {
        frente: ['....HHH....', '...HHLHH...', '.ZZZHHHZZZ.', '.ZZKKKKKZZ.', '.ZKEKKKEKZ.', '.KRKKKKKRK.', '...KKKKK...'],
        costas: ['....HHH....', '...HHLHH...', '.ZZZHHHZZZ.', '.ZZZHLHZZZ.', '.ZZZHHHZZZ.', '.KZZHHHZZK.', '...KKKKK...'],
        lado: ['..HHHHHH...', '.HHHLLHHHH.', '..ZZZZZZZZ.', '..ZZZZKKKK.', '..ZKZKKEKK.', '..ZZZKKKRK.', '...ZZKKKK..'],
        diagFrente: ['...HHHH....', '..HHHLHHH..', '..ZZZHHHZZ.', '..ZZZZKKKZ.', '..ZKZEKKEK.', '..ZZKKKKRK.', '...ZZKKKK..'],
        diagCostas: ['...HHHH....', '..HHLHHH...', '..ZZHHHZZZ.', '..ZZHLHZZZ.', '..ZZHHHZZK.', '..ZZZHZZKK.', '....KKKK...'],
      } },
  };

  /* ---------- ROUPAS ---------- */
  /* Além das trocas por papel (pixelart-mariana-visual.js): calca (a linha da saia vira calça/bermuda, estreita
     como as pernas), pernas (quantas linhas de perna a calça cobre em pé: 1 bermuda, 2 comprida), gola, botoes,
     ziper (no meio, só de frente), cinto [cinto, fivela] e mangas (o braço de cima). */
  var MODELOS = {
    camiseta: { tronco: { A: 'C' }, estampa: 'W', cintura: { A: 'C' }, calca: 'J', pernas: 1, pe: { S: 'T' } },
    camisaCalca: { tronco: { A: 'C' }, gola: 'W', botoes: 'W', cinto: ['Q', 'G'], calca: 'J', pernas: 2 },
    agasalho: { mangas: 'C', tronco: { A: 'C' }, ziper: 'W', cintura: { A: 'D', C: 'D' }, calca: 'D', pernas: 2,
      pe: { S: 'T' } },
    // armadura prateada com túnica na cor da roupa e brasão dourado
    cavaleiro: { ombro: { C: 'O' }, mangas: 'O', tronco: { A: 'G' }, cinto: ['V', 'G'], saia: { D: 'C' },
      coxa: { D: 'O' }, perna: { K: 'O', D: 'O' }, pe: { S: 'V' } },
  };

  Object.keys(CORTES).forEach(function (id) { I.CORTES_VISUAL[id] = CORTES[id]; });
  Object.keys(MODELOS).forEach(function (id) { I.MODELOS_VISUAL[id] = MODELOS[id]; });
  PA.CORTES.push({ id: 'curto', nome: 'Curtinho', sexo: 'menino' }, { id: 'espetado', nome: 'Espetado', sexo: 'menino' },
    { id: 'topete', nome: 'Topete', sexo: 'menino' }, { id: 'cacheadoCurto', nome: 'Cacheadinho', sexo: 'menino' },
    { id: 'moicano', nome: 'Moicano', sexo: 'menino' });
  PA.MODELOS.push({ id: 'camiseta', nome: 'Camiseta e bermuda', sexo: 'menino' },
    { id: 'camisaCalca', nome: 'Camisa e calça', sexo: 'menino' }, { id: 'agasalho', nome: 'Agasalho', sexo: 'menino' },
    { id: 'cavaleiro', nome: 'Cavaleiro', sexo: 'menino' });
})();
