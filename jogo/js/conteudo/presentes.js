/* Presentes do jogo (pedido 2026-10-28-presente-medalhas): acessórios dados pelo próprio jogo a um jogador, entregues
   uma vez num baú depois do login (estado em sistemas/presentes.js, tela em ui/bau-presente.js).
   Reino.registrarPresente({ id, para, acessorios: [{ id, nome, raridade: 'ultra', usar, falas, desenho, icone }] }):
     para       login de quem ganha ('mariana' = a conta dela, Reino.Jogadores.ehMariana)
     desenho    formato de PA.ENFEITES_MONTARIA (linhas, paleta, ancora, dx, dy), como os acessórios das provas
     icone      formato de window.ICONES (n, p, d com 16 linhas de 16), vai para ICONES['acessorio:<id>']
     usar       o rótulo do botão do fim ("Usar a de prata")
     falas      o que o Claude fala quando ele aparece (até 30 letras por frase; módulo 'presentes', pacote geral)
   Ultra Lendário (raridade 'ultra', acima do lendário): nunca à venda; na Loja numa seção própria (Reino.LojaItens.ultras).
   node: true: no carregamento só guarda os dados (o desenho entra na montaria se o pixelart já carregou). */
(function () {
  var R = window.Reino;
  /** @type {{ id: string, para: string, acessorios: { id: string, nome: string, raridade: string, usar: string, falas?: string[], desenho: any, icone: any }[] }[]} */
  R.presentes = [];
  R.registrarPresente = function (def) {
    if (!def || !def.id || !def.para || !Array.isArray(def.acessorios) || !def.acessorios.length) throw new Error('registrarPresente: precisa de id, para e acessorios');
    if (R.presente(def.id)) throw new Error('registrarPresente: presente repetido "' + def.id + '"');
    def.acessorios.forEach(function (a) {
      if (!a.id || !a.nome || !a.desenho || !a.icone) throw new Error('registrarPresente: acessório sem id, nome, desenho ou ícone (' + def.id + ')');
      var erros = R.conferirIcone ? R.conferirIcone(a.icone) : [];
      if (erros.length) throw new Error('registrarPresente: ícone de "' + a.id + '": ' + erros.join('; '));
      if (window.ICONES) window.ICONES['acessorio:' + a.id] = a.icone;
      R.desenhosAcessorios[a.id] = a.desenho;
      if (window.PA && window.PA.ENFEITES_MONTARIA) window.PA.ENFEITES_MONTARIA[a.id] = a.desenho;
    });
    R.presentes.push(def);
  };
  /** @param {string} id */
  R.presente = function (id) { return R.presentes.find(function (p) { return p.id === id; }); };

  // as cores: contorno do jogo, prata (claro, médio, sombra), ouro (claro, médio, sombra), brilho e as fitas
  var K = '#3a2446', W = '#ffffff';
  var pPrata = { k: K, W: W, S: '#eef2f8', s: '#b4bfd2', D: '#7d8aa6', R: '#ff7eb6', B: '#5fb4ff' };
  var pOuro = { k: K, W: W, Y: '#ffe27a', y: '#f2b233', D: '#d98a12', R: '#ff4f6d', V: '#7c5cff', w: W };

  R.registrarPresente({
    id: 'medalhas-2026', para: 'mariana',
    acessorios: [
      { id: 'ultra-medalha-prata-2bim', nome: 'Medalha de Prata do 2º Bimestre', raridade: 'ultra', usar: 'Usar a de prata',
        falas: ['Uma medalha de prata!', 'Pelo seu segundo bimestre!'],
        // fita em V (rosa e azul) descendo do pescoço, disco prateado claro com brilho branco e uma estrelinha no miolo
        // (o "2" vai no ícone)
        desenho: { linhas: ['RR.....BB', '.RR...BB.', '..RRkBB..', '..kkkkk..', '.kWWDSsk.', '.kWDDDsk.', '.kSSDssk.', '..kkkkk..'], paleta: pPrata, ancora: 'pescoco', dx: -4, dy: -2 },
        icone: { n: 'Medalha de Prata do 2º Bimestre (ultra lendário)', p: pPrata, d: [
          '..kRRk....kBBk..',
          '...kRRk..kBBk...',
          '....kRRkkBBk....',
          '.....kRRBBk.....',
          '......kkkk......',
          '....kkSSSSkk....',
          '...kSWWSSSSsk...',
          '..kSWSDDDDSssk..',
          '..kSSSSSSDSssk..',
          '..kSSSDDDDSssk..',
          '..kSSSDSSSSssk..',
          '..kSSSDDDDSssk..',
          '...kSSSSSSssk...',
          '....kksssskk....',
          'W.....kkkk.....W',
          '................'] } },
      { id: 'ultra-medalha-ouro-3bim', nome: 'Medalha de Ouro do 3º Bimestre', raridade: 'ultra', usar: 'Usar a de ouro',
        falas: ['E uma medalha de ouro!', 'Pelo seu terceiro bimestre!'],
        // o mesmo formato, mais imponente: fita vermelha e roxa, disco dourado claro com brilho branco, estrelinha no miolo
        // e dois brilhinhos dos lados (o "3" vai no ícone)
        desenho: { linhas: ['RR.....VV', '.RR...VV.', '..RRkVV..', '..kkkkk..', 'wkWWDYykw', '.kWDDDyk.', '.kYYDyyk.', '..kkkkk..'], paleta: pOuro, ancora: 'pescoco', dx: -4, dy: -2 },
        icone: { n: 'Medalha de Ouro do 3º Bimestre (ultra lendário)', p: pOuro, d: [
          '.kRRk......kVVk.',
          '..kRRk....kVVk..',
          '...kRRk..kVVk...',
          'w...kRRkkVVk...w',
          '.....kRRVVk.....',
          '....kkkkkkkk....',
          '...kYWWYYYYyk...',
          '..kYWYDDDDYyyk..',
          'w.kYYYYYYDYyyk.w',
          '..kYYYYDDDYyyk..',
          '..kYYYYYYDYyyk..',
          '..kYYYDDDDYyyk..',
          '...kYYYYYYyyk...',
          '....kkyyyykk....',
          'w.....kkkk.....w',
          '................'] } },
    ],
  });
})();
