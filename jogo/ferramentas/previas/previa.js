/* Prévias (abrem por file://): escreve as tags <script> dos arquivos do jogo pedidos, na ordem de
   js/manifesto.js (nenhuma prévia guarda caminho de script). Carregar depois do manifesto:
     <script src="../../js/manifesto.js"></script>
     <script src="previa.js"></script>
     <script>Previa.carregar({ nomes: ['nucleo/config', 'arte/desenho'], grupos: ['pixelart', 'interiores'] });</script>
   Nome = caminho sob js/ sem .js (como em ferramentas/jogo-no-node.js); grupo = o do manifesto.
   document.write: os scripts rodam em ordem antes do resto da página. */
window.Previa = {
  carregar: function (filtro) {
    var nomes = filtro.nomes || [], grupos = filtro.grupos || [];
    var lista = Reino.MANIFESTO.scripts.filter(function (s) {
      return grupos.indexOf(s.grupo) >= 0 || nomes.indexOf(s.js.replace(/^js\//, '').replace(/\.js$/, '')) >= 0;
    });
    nomes.forEach(function (n) {
      if (!lista.some(function (s) { return s.js === 'js/' + n + '.js'; })) throw new Error('prévia: "' + n + '" não está no manifesto');
    });
    lista.forEach(function (s) { document.write('<script src="../../' + s.js + '"><\/script>'); });
  },
};
