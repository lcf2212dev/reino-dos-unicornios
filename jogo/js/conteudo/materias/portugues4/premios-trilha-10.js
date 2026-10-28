/* Prêmios da trilha perfeita do capítulo 10 (docs/contratos/quarto-bimestre.md §14): ⭐ em todas as etapas
   da sala dá um acessório lendário do unicórnio (dourado, com brilho), um elemento e uma carta de experiência.
   Ícone 16×16 = o desenho ampliado 2× com brilhinhos nos cantos (contorno #3a2446). */
// lp10a1: o chapéu do Gato de Botas
Reino.registrarPremioTrilha({
  sala: 'lp10a1', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a1', nome: 'Chapéu de Pluma do Gato',
    desenho: { linhas: ['.....Pk', '....PWk', '.kkkPk.', '.kHHHk.', '.kYYYk.', 'kkkkkkk'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff7eb6', H: '#6b3fa0' }, ancora: 'cabeca', dx: -3, dy: -3 },
    icone: { n: 'Chapéu de Pluma do Gato (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff7eb6', H: '#6b3fa0' }, d: [
      'W...............',
      '...............W',
      '...........PPkk.',
      '...........PPkk.',
      '.........PPWWkk.',
      '.........PPWWkk.',
      '...kkkkkkPPkk...',
      '...kkkkkkPPkk...',
      '...kkHHHHHHkk...',
      '...kkHHHHHHkk...',
      '...kkYYYYYYkk...',
      '...kkYYYYYYkk...',
      '.kkkkkkkkkkkkkk.',
      '.kkkkkkkkkkkkkk.',
      '.W..............',
      '..............W.'] } },
  elemento: 30, experiencia: 'exp-pilha-limao'
});
// lp10a2: a pena que escreve contos
Reino.registrarPremioTrilha({
  sala: 'lp10a2', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a2', nome: 'Pena de Escritor',
    desenho: { linhas: ['..kWk', '.kWYk', 'kWYWk', 'kYWk.', 'kYk..', '.k...'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', B: '#9ad8ff' }, ancora: 'orelha', dx: -2, dy: -3 },
    icone: { n: 'Pena de Escritor (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', B: '#9ad8ff' }, d: [
      'W...............',
      '...............W',
      '.......kkWWkk...',
      '.......kkWWkk...',
      '.....kkWWYYkk...',
      '.....kkWWYYkk...',
      '...kkWWYYWWkk...',
      '...kkWWYYWWkk...',
      '...kkYYWWkk.....',
      '...kkYYWWkk.....',
      '...kkYYkk.......',
      '...kkYYkk.......',
      '.....kk.........',
      '.....kk.........',
      '.W..............',
      '..............W.'] } },
  elemento: 50, experiencia: 'exp-tambor-de-lata'
});
// lp10a3: o sinal de pergunta
Reino.registrarPremioTrilha({
  sala: 'lp10a3', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a3', nome: 'Laço Interrogação',
    desenho: { linhas: ['.kkk.', 'kYWYk', '..kYk', '.kYk.', '..k..', '.kYk.'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff' }, ancora: 'cauda', dx: -2, dy: -1 },
    icone: { n: 'Laço Interrogação (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff' }, d: [
      'W...............',
      '...............W',
      '.....kkkkkk.....',
      '.....kkkkkk.....',
      '...kkYYWWYYkk...',
      '...kkYYWWYYkk...',
      '.......kkYYkk...',
      '.......kkYYkk...',
      '.....kkYYkk.....',
      '.....kkYYkk.....',
      '.......kk.......',
      '.......kk.......',
      '.....kkYYkk.....',
      '.....kkYYkk.....',
      '.W..............',
      '..............W.'] } },
  elemento: 53, experiencia: 'exp-iodo-amido'
});
// lp10a4: a flor da lenda
Reino.registrarPremioTrilha({
  sala: 'lp10a4', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a4', nome: 'Coroa de Vitória-Régia',
    desenho: { linhas: ['..kPk..', '.kPWPk.', 'kGkYkGk', 'kGYWYGk', '.kkkkk.'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff9dc8', G: '#4fbf6a' }, ancora: 'cabeca', dx: -3, dy: -2 },
    icone: { n: 'Coroa de Vitória-Régia (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff9dc8', G: '#4fbf6a' }, d: [
      'W...............',
      '...............W',
      '................',
      '.....kkPPkk.....',
      '.....kkPPkk.....',
      '...kkPPWWPPkk...',
      '...kkPPWWPPkk...',
      '.kkGGkkYYkkGGkk.',
      '.kkGGkkYYkkGGkk.',
      '.kkGGYYWWYYGGkk.',
      '.kkGGYYWWYYGGkk.',
      '...kkkkkkkkkk...',
      '...kkkkkkkkkk...',
      '................',
      '.W..............',
      '..............W.'] } },
  elemento: 22, experiencia: 'exp-barquinho-flutua'
});
// lp10a5: quando e onde
Reino.registrarPremioTrilha({
  sala: 'lp10a5', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a5', nome: 'Ampulheta Dourada',
    desenho: { linhas: ['kkYkYkk', '..YYY..', '..kSk..', '...k...', '..kSk..', '..YYY..'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', S: '#ffb84d' }, ancora: 'pescoco', dx: -3, dy: 0 },
    icone: { n: 'Ampulheta Dourada (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', S: '#ffb84d' }, d: [
      'W...............',
      '...............W',
      '.kkkkYYkkYYkkkk.',
      '.kkkkYYkkYYkkkk.',
      '.....YYYYYY.....',
      '.....YYYYYY.....',
      '.....kkSSkk.....',
      '.....kkSSkk.....',
      '.......kk.......',
      '.......kk.......',
      '.....kkSSkk.....',
      '.....kkSSkk.....',
      '.....YYYYYY.....',
      '.....YYYYYY.....',
      '.W..............',
      '..............W.'] } },
  elemento: 37, experiencia: 'exp-relogio-de-sol'
});
// lp10a6: quem reconta histórias
Reino.registrarPremioTrilha({
  sala: 'lp10a6', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a6', nome: 'Óculos de Contadora',
    desenho: { linhas: ['.kk.kk.', 'kWYkWYk', 'kYYkYYk', '.kk.kk.'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff' }, ancora: 'olho', dx: -3, dy: -1 },
    icone: { n: 'Óculos de Contadora (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff' }, d: [
      'W...............',
      '...............W',
      '................',
      '................',
      '...kkkk..kkkk...',
      '...kkkk..kkkk...',
      '.kkWWYYkkWWYYkk.',
      '.kkWWYYkkWWYYkk.',
      '.kkYYYYkkYYYYkk.',
      '.kkYYYYkkYYYYkk.',
      '...kkkk..kkkk...',
      '...kkkk..kkkk...',
      '................',
      '................',
      '.W..............',
      '..............W.'] } },
  elemento: 74, experiencia: 'exp-teatro-de-sombras'
});
// lp10a7: o feijão que cresce até o céu
Reino.registrarPremioTrilha({
  sala: 'lp10a7', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10a7', nome: 'Pé de Feijão Mágico',
    desenho: { linhas: ['kGk..', '.kYk.', '..kGk', '.kGk.', 'kYk..'], paleta: { k: '#3a2446', Y: '#ffd34d', G: '#4fbf6a', W: '#ffffff' }, ancora: 'chifre', dx: -2, dy: 0 },
    icone: { n: 'Pé de Feijão Mágico (lendário)', p: { k: '#3a2446', Y: '#ffd34d', G: '#4fbf6a', W: '#ffffff' }, d: [
      'W...............',
      '...............W',
      '................',
      '...kkGGkk.......',
      '...kkGGkk.......',
      '.....kkYYkk.....',
      '.....kkYYkk.....',
      '.......kkGGkk...',
      '.......kkGGkk...',
      '.....kkGGkk.....',
      '.....kkGGkk.....',
      '...kkYYkk.......',
      '...kkYYkk.......',
      '................',
      '.W..............',
      '..............W.'] } },
  elemento: 25, experiencia: 'exp-feijao-no-algodao'
});
// lp10t1: a concha da sereia
Reino.registrarPremioTrilha({
  sala: 'lp10t1', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10t1', nome: 'Concha da Iara',
    desenho: { linhas: ['kYkYkYk', '..kPk..', '.kPWPk.', 'kPWPWPk', '.kkkkk.'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff9db0' }, ancora: 'pescoco', dx: -3, dy: 0 },
    icone: { n: 'Concha da Iara (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff9db0' }, d: [
      'W...............',
      '...............W',
      '................',
      '.kkYYkkYYkkYYkk.',
      '.kkYYkkYYkkYYkk.',
      '.....kkPPkk.....',
      '.....kkPPkk.....',
      '...kkPPWWPPkk...',
      '...kkPPWWPPkk...',
      '.kkPPWWPPWWPPkk.',
      '.kkPPWWPPWWPPkk.',
      '...kkkkkkkkkk...',
      '...kkkkkkkkkk...',
      '................',
      '.W..............',
      '..............W.'] } },
  elemento: 35, experiencia: 'exp-ovo-que-flutua'
});
// lp10t2: os três porquinhos
Reino.registrarPremioTrilha({
  sala: 'lp10t2', materia: 'portugues4',
  acessorio: { id: 'lpt-lp10t2', nome: 'Laço dos Porquinhos',
    desenho: { linhas: ['kk.kk', 'kPkPk', 'kYWYk', 'kPkPk', 'kk.kk'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff9dc8' }, ancora: 'cauda', dx: -2, dy: -1 },
    icone: { n: 'Laço dos Porquinhos (lendário)', p: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', P: '#ff9dc8' }, d: [
      'W...............',
      '...............W',
      '................',
      '...kkkk..kkkk...',
      '...kkkk..kkkk...',
      '...kkPPkkPPkk...',
      '...kkPPkkPPkk...',
      '...kkYYWWYYkk...',
      '...kkYYWWYYkk...',
      '...kkPPkkPPkk...',
      '...kkPPkkPPkk...',
      '...kkkk..kkkk...',
      '...kkkk..kkkk...',
      '................',
      '.W..............',
      '..............W.'] } },
  elemento: 24, experiencia: 'exp-ponte-de-papel'
});
