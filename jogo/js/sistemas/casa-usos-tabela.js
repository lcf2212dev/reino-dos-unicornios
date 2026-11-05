/* Casa do jogador: o uso de cada móvel (Reino.CasaUsos.registrar; docs/contratos/casa.md §13), pelo objeto
   (tipo). Todo item de kit (conteudo/casa/kits-a.js, kits-b.js) e todo móvel avulso (moveis-salas.js) tem uma
   linha, mesmo enfeite (o teste casa-usos.test.js confere). Campos: uso, som (Reino.Som.tocar), melodia
   ([[midi, inícioS, duraçãoS]], Som.notaMusical), quem ('ambos' = "Quem vai?"; 'uni' = só o unicórnio; sem = ela),
   fome (chave de config.casa.usos). Dados só: nada roda além dos registros. */
(function () {
  var R = window.Reino;
  var K = 'casa-', M = 'casa-movel-';

  // brilha, brilha, estrelinha; arpejo do piano; cuco; carrilhão do relógio de pé
  var ESTRELINHA = [[60, 0, 0.3], [60, 0.32, 0.3], [67, 0.64, 0.3], [67, 0.96, 0.3], [69, 1.28, 0.3], [69, 1.6, 0.3], [67, 1.92, 0.55]];
  var ARPEJO = [[60, 0, 0.3], [64, 0.3, 0.3], [67, 0.6, 0.3], [72, 0.9, 0.55], [67, 1.5, 0.3], [64, 1.8, 0.3], [60, 2.1, 0.4]];
  var CUCO = [[79, 0, 0.25], [76, 0.3, 0.4], [79, 1, 0.25], [76, 1.3, 0.4]];
  var CARRILHAO = [[76, 0, 0.45], [72, 0.5, 0.45], [74, 1, 0.45], [67, 1.5, 0.9]];

  var TABELA = [
    // liga e desliga (luz, TV, fogo)
    [K + 'estar-estante-tv', { uso: 'alternar', som: 'clique' }],
    [K + 'estar-luminaria', { uso: 'alternar', som: 'clique' }],
    [K + 'quarto-jogador-criado-mudo', { uso: 'alternar', som: 'clique' }],
    [K + 'quarto-uni-estrela', { uso: 'alternar', som: 'plim' }],
    [M + 'luminaria-lua', { uso: 'alternar', som: 'plim' }],
    [M + 'aquario', { uso: 'alternar', som: 'bolhas' }],
    [M + 'cristal', { uso: 'alternar', som: 'estrela' }],
    [M + 'lareira', { uso: 'alternar', som: 'rachar' }],
    [M + 'disco-voador', { uso: 'alternar', som: 'estrela' }],
    [M + 'abajur-saturno', { uso: 'alternar', som: 'plim' }],
    // abre e fecha
    [K + 'jantar-cristaleira', { uso: 'abrir', som: 'porta' }],
    [K + 'cozinha-geladeira', { uso: 'abrir', som: 'porta' }],
    [K + 'cozinha-armario', { uso: 'abrir', som: 'porta' }],
    [K + 'banheiro-armario', { uso: 'abrir', som: 'porta' }],
    [K + 'banheiro-cesto', { uso: 'abrir', som: 'porta' }],
    [K + 'quarto-jogador-guarda-roupa', { uso: 'abrir', som: 'porta' }],
    [K + 'quarto-uni-bau', { uso: 'abrir', som: 'porta' }],
    [M + 'aparador', { uso: 'abrir', som: 'porta' }],
    [M + 'lixeira', { uso: 'abrir', som: 'porta' }],
    [M + 'casa-boneca', { uso: 'abrir', som: 'porta' }],
    // faz algo por um tempinho e para sozinho (config.casa.usos.efeitoMs)
    [K + 'cozinha-pia', { uso: 'efeito', som: 'gotas' }],
    [K + 'banheiro-pia', { uso: 'efeito', som: 'gotas' }],
    [K + 'banheiro-vaso', { uso: 'efeito', som: 'splash' }],
    [M + 'piano', { uso: 'efeito', melodia: ARPEJO }],
    [M + 'vitrola', { uso: 'efeito', melodia: ESTRELINHA }],
    [M + 'relogio-cuco', { uso: 'efeito', melodia: CUCO }],
    [M + 'relogio-pe', { uso: 'efeito', melodia: CARRILHAO }],
    [M + 'jogo-cha', { uso: 'efeito', som: 'plim' }],
    [M + 'sorveteira', { uso: 'efeito', som: 'estrela' }],
    [M + 'patinhos', { uso: 'efeito', som: 'selecionar' }],
    [M + 'balanca', { uso: 'efeito', som: 'clique' }],
    [M + 'uni-balanco', { uso: 'efeito', som: 'sacudida' }],
    [M + 'ursao', { uso: 'efeito', som: 'estrela' }],
    [M + 'globo', { uso: 'efeito', som: 'clique' }],
    [M + 'brinquedos', { uso: 'efeito', som: 'estrela' }],
    [M + 'telescopio', { uso: 'efeito', som: 'estrela' }],
    [M + 'painel-nave', { uso: 'efeito', som: 'selecionar' }],
    [M + 'robozinho', { uso: 'efeito', som: 'sacudida' }],
    [M + 'penteadeira', { uso: 'efeito', som: 'plim' }],
    // ela senta
    [K + 'estar-sofa', { uso: 'sentar' }],
    [K + 'estar-poltrona', { uso: 'sentar' }],
    [K + 'jantar-cadeira', { uso: 'sentar' }],
    [K + 'cozinha-banquinho', { uso: 'sentar' }],
    [K + 'quarto-jogador-cadeira', { uso: 'sentar' }],
    [M + 'pufe', { uso: 'sentar' }],
    [M + 'banco', { uso: 'sentar' }],
    [M + 'banco-banho', { uso: 'sentar' }],
    // deita: as camas dela (ou do unicórnio) e as do unicórnio
    [K + 'quarto-jogador-cama', { uso: 'deitar', quem: 'ambos', som: 'respira' }],
    [M + 'cama-dossel', { uso: 'deitar', quem: 'ambos', som: 'respira' }],
    [M + 'beliche', { uso: 'deitar', quem: 'ambos', som: 'respira' }],
    [M + 'cama-foguete', { uso: 'deitar', quem: 'ambos', som: 'respira' }],
    [K + 'quarto-uni-almofadao', { uso: 'deitar', quem: 'uni', som: 'respira' }],
    [M + 'caminha-nuvem', { uso: 'deitar', quem: 'uni', som: 'respira' }],
    // banho (o do unicórnio é o banho de espuma do Reino.Banho), chuveiro e fogão
    [K + 'banheiro-banheira', { uso: 'banho', quem: 'ambos', som: 'bolhas' }],
    [M + 'chuveiro', { uso: 'chuveiro', quem: 'ambos', som: 'chuveiro' }],
    [K + 'cozinha-fogao', { uso: 'cozinhar', som: 'clique' }],
    // comida e água de graça para o unicórnio
    [K + 'cozinha-fruteira', { uso: 'comer', som: 'nhac', fome: 'fomeFruta' }],
    [M + 'cesto-macas', { uso: 'comer', som: 'nhac', fome: 'fomeFruta' }],
    [M + 'cesta-paes', { uso: 'comer', som: 'nhac', fome: 'fomeFruta' }],
    [K + 'quarto-uni-comedouro', { uso: 'comer', som: 'nhac', fome: 'fomeComedouro' }],
    [K + 'quarto-uni-bebedouro', { uso: 'beber', som: 'gole' }],
    [M + 'fontinha', { uso: 'beber', som: 'gole' }],
    [M + 'filtro', { uso: 'beber', som: 'gole' }],
  ];
  // só enfeite: sem nome nem ação (tapetes, quadros, vasos, espelhos…)
  var ENFEITES = [K + 'estar-mesa-centro', K + 'estar-planta', K + 'estar-quadro', K + 'estar-tapete', K + 'jantar-mesa',
    K + 'jantar-tapete', K + 'jantar-quadro', K + 'cozinha-mesinha', K + 'banheiro-espelho', K + 'banheiro-toalheiro',
    K + 'banheiro-tapete', K + 'quarto-jogador-escrivaninha', K + 'quarto-jogador-tapete', K + 'quarto-jogador-estante',
    K + 'quarto-jogador-espelho', K + 'quarto-uni-tapete', K + 'quarto-uni-espelho', K + 'quarto-uni-cabideiro',
    M + 'vitral', M + 'vaso-flores', M + 'quadro-uvas', M + 'prateleira', M + 'panelas', M + 'samambaia', M + 'toalhas',
    M + 'quadro-concha', M + 'lousa', M + 'arco-iris', M + 'ferradura',
    M + 'planta-alien', M + 'quadro-galaxia'];

  TABELA.forEach(function (l) { R.CasaUsos.registrar(l[0], l[1]); });
  ENFEITES.forEach(function (t) { R.CasaUsos.registrar(t, { uso: 'enfeite' }); });
})();
