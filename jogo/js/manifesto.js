/* Manifesto do jogo: a ÚNICA lista dos arquivos que o jogo carrega, na ordem de carga.
   Arquivo novo = uma linha aqui + `node ferramentas/gerar-index.js` (npm run index), que
   reescreve o index.html. `node ferramentas/gerar-index.js --conferir` acusa index.html
   desatualizado, arquivo que não existe e .js em js/ que ficou fora daqui.

   Formato (dados puros, sem DOM; funciona no Node e no navegador):
   - css: folhas de estilo, na ordem da cascata (css/ é plano: sem subpastas).
   - scripts: um por linha, na ordem em que o navegador carrega (a ordem importa: cada
     arquivo usa o que os de cima registraram em window.Reino).
       js     caminho a partir de jogo/
       grupo  área do arquivo (nucleo, arte, conteudo, materias, provas, personagens,
              sistemas, mundo, atividades, ui, motor, interiores, debug); as ferramentas
              escolhem os arquivos por grupo
       node   true = roda num vm do Node sem DOM (as ferramentas dão só console, relógio,
              timers e, nos testes, um localStorage/document de mentira). É o que
              ferramentas/jogo-no-node.js carrega para listar falas, validar e testar.
   js/voz/*.js não entra: são pacotes de áudio gerados, carregados sob demanda por Voz.carregar.
   O index.html não carrega este arquivo; se carregado, ele fica em Reino.MANIFESTO. */
(function () {
  var MANIFESTO = {
    css: [
      'css/ui-jogo.css',
      'css/interiores.css',
      'css/ui-novidades.css',
      'css/ui-petshop.css',
      'css/ui-fotos.css',
    ],
    scripts: [
      { js: 'js/nucleo/congelar.js', grupo: 'nucleo' },
      { js: 'js/nucleo/config.js', grupo: 'nucleo', node: true },
      { js: 'js/arte/icones.js', grupo: 'arte', node: true },
      { js: 'js/arte/pixelart.js', grupo: 'arte' },
      { js: 'js/conteudo/loja-itens.js', grupo: 'conteudo', node: true },
      { js: 'js/personagens/unicornios.js', grupo: 'personagens', node: true },
      { js: 'js/conteudo/materias/historia/historia.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/ingles.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/portugues.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/provas/historia-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/ingles-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/portugues-3bim.js', grupo: 'provas', node: true },
      { js: 'js/sistemas/progresso.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/som.js', grupo: 'sistemas' },
      { js: 'js/sistemas/musicas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/voz.js', grupo: 'sistemas', node: true },
      { js: 'js/personagens/claude.js', grupo: 'personagens', node: true },
      { js: 'js/sistemas/falas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/cuidados.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/surpresa.js', grupo: 'sistemas', node: true },
      { js: 'js/mundo/mapa.js', grupo: 'mundo' },
      { js: 'js/personagens/jogador.js', grupo: 'personagens' },
      { js: 'js/atividades/desafios.js', grupo: 'atividades' },
      // cada tipo de desafio se registra no núcleo (desafios.js), carregado antes
      { js: 'js/atividades/desafios/escolha.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/varias.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/ligar.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/sequencia.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/separar.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/vfLista.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/completar.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/copiar.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/memoria.js', grupo: 'atividades' },
      { js: 'js/atividades/desafios/desenho.js', grupo: 'atividades' },
      { js: 'js/atividades/missao.js', grupo: 'atividades' },
      { js: 'js/atividades/treino.js', grupo: 'atividades' },
      { js: 'js/atividades/provas.js', grupo: 'atividades' },
      { js: 'js/ui/ui.js', grupo: 'ui' },
      { js: 'js/sistemas/fotos.js', grupo: 'sistemas', node: true },
      { js: 'js/motor/interiores.js', grupo: 'motor', node: true },
      { js: 'js/personagens/npcs.js', grupo: 'personagens', node: true },
      { js: 'js/interiores/museu/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/museu/museu.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/torre.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola/escola.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/castelo/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/castelo/castelo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/estabulo/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/estabulo/estabulo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/loja/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/loja/loja.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bau/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bau/bau.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/petshop.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/cenas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/observatorio.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/portugues.js', grupo: 'interiores', node: true },
      // padrao.js por último entre os prédios: monta o interior das matérias que não têm um próprio
      { js: 'js/interiores/padrao.js', grupo: 'interiores', node: true },
      { js: 'js/sistemas/banho.js', grupo: 'sistemas' },
      { js: 'js/motor/cena.js', grupo: 'motor' },
      { js: 'js/motor/main.js', grupo: 'motor' },
      { js: 'js/debug.js', grupo: 'debug' },
    ],
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = MANIFESTO;
  else if (typeof window !== 'undefined') { window.Reino = window.Reino || {}; window.Reino.MANIFESTO = MANIFESTO; }
})();
