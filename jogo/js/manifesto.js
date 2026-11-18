/* Manifesto: lista única de CSS e scripts, na ordem de carga (npm run index gera index.html).
   Formato: css = caminhos de jogo/css; scripts = { js, grupo, node? }.
   node:true permite avaliação no Node sem DOM; grupo seleciona scripts por área nas ferramentas.
   Pacotes js/voz/*.js ficam fora e carregam sob demanda. Sem DOM no carregamento.
   Regras completas: jogo/js/CLAUDE.md e docs/decisoes/manifesto-unico.md. */
(function () {
  var MANIFESTO = {
    css: [
      'css/ui-base.css',
      'css/ui-hud.css',
      'css/ui-telas.css',
      'css/ui-missao.css',
      'css/ui-etapas.css',
      'css/ui-respiro.css',
      'css/ui-prova.css',
      'css/ui-paineis.css',
      'css/ui-feira.css',
      'css/ui-escola-musica.css',
      'css/ui-musica-jogos.css',
      'css/ui-laboratorio.css',
      'css/ui-animacoes.css',
      'css/ui-desafios.css',
      'css/ui-livro-blocos.css',
      'css/ui-desafios-livro.css',
      'css/ui-desafios-grade.css',
      'css/interiores.css',
      'css/ui-novidades.css',
      'css/ui-foguete.css',
      'css/ui-et-desafio.css',
      'css/ui-album-ets.css',
      'css/ui-petshop.css',
      'css/ui-fotos.css',
      'css/ui-salao.css',
      'css/ui-cofre.css',
      'css/ui-quimica-bancada.css',
      'css/ui-quimica-caderno.css',
      'css/ui-quimica-microscopio.css',
      'css/ui-quimica-tabela.css',
      'css/ui-quimica-estados.css',
      'css/ui-quimica-separar.css',
      'css/ui-quimica-livros.css',
      'css/ui-quimica-experiencias.css',
      'css/ui-jogadores.css',
      'css/ui-abertura.css',
      'css/ui-abertura-novidade.css',
      'css/ui-personagem.css',
      'css/ui-voo.css',
      'css/ui-bau-presente.css',
      'css/ui-bau-cartao.css',
      'css/ui-bau-casa.css',
      'css/ui-casa-kits.css',
      'css/ui-casa-moveis.css',
      'css/ui-bosque.css',
      'css/ui-itens.css',
      'css/ui-itens-pocao.css',
      'css/ui-monstros.css',
      'css/ui-vila.css',
      'css/ui-treinadores.css',
      'css/ui-cursiva.css',
      'css/ui-parquinho.css',
      'css/ui-parquinho-areia.css',
      'css/ui-moedas-festa.css',
      'css/ui-casa-decorar.css',
      'css/ui-tempo-celular.css',
      'css/ui-juntos.css',
    ],
    scripts: [
      { js: 'js/nucleo/congelar.js', grupo: 'nucleo' },
      { js: 'js/nucleo/config.js', grupo: 'nucleo', node: true },
      { js: 'js/nucleo/config-itens.js', grupo: 'nucleo', node: true }, // números dos itens (Reino.config.itens; itens.md §12): logo depois do config.js
      { js: 'js/nucleo/config-vila.js', grupo: 'nucleo', node: true }, // Vila Arco-Íris: números das lojas e da Teleportadora (Reino.config.vila; vila.md)
      { js: 'js/nucleo/config-monstros.js', grupo: 'nucleo', node: true }, // Treinadores de Monstros: MonsterBall, captura, monstro que segue e ajuda (Reino.config.monstros; monstros.md)
      { js: 'js/nucleo/config-cursiva.js', grupo: 'nucleo', node: true }, // Letra cursiva: frases por bola, inclinação, tolerância do dedo (Reino.config.cursiva; cursiva.md)
      { js: 'js/nucleo/registros.js', grupo: 'nucleo', node: true },
      { js: 'js/sistemas/bimestres.js', grupo: 'nucleo', node: true },
      { js: 'js/nucleo/modulos.js', grupo: 'nucleo', node: true },
      { js: 'js/nucleo/util.js', grupo: 'nucleo', node: true },
      { js: 'js/nucleo/eventos.js', grupo: 'nucleo', node: true }, // eventos.js logo depois do util.js: os nomes dos eventos do barramento (Reino.EVENTOS)
      { js: 'js/nucleo/ambiente.js', grupo: 'nucleo', node: true }, // ambiente.js: onde o jogo roda (artifact, file:, https, servidor de casa, compartilhar, baixar)
      { js: 'js/arte/icones/icones.js', grupo: 'icones', node: true },
      { js: 'js/arte/ilustracoes.js', grupo: 'icones', node: true }, // ilustrações maiores que um ícone (Reino.registrarIlustracao; 4º bimestre): antes das ilustrações das matérias
      { js: 'js/arte/icones/interface.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/premios.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/pessoas.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/objetos.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/natureza.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/cotidiano.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/ingles.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/loja-petshop.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/loja-enfeites.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/espaco.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/planetas.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/portugues.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/portugues-palavras.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/portugues-salas.js', grupo: 'icones', node: true },
      { js: 'js/arte/icones/livros.js', grupo: 'icones', node: true }, // 📗 dos livros da escola (4º bimestre)
      { js: 'js/arte/desenho.js', grupo: 'arte', node: true }, // desenho.js antes da pixel art: Reino.Desenho (paleta e helpers) é a fonte das cores do PA.cor
      { js: 'js/arte/portal.js', grupo: 'arte', node: true }, // o portal mágico em qualquer cor (Reino.Portal: o do Bosque e os das outras arenas; arenas.md)
      { js: 'js/arte/teleportadora.js', grupo: 'arte', node: true }, // a Teleportadora, unicórnio de aura arco-íris (Reino.TeleportadoraArte; vila.md)
      { js: 'js/arte/pixelart.js', grupo: 'pixelart' }, // pixelart.js (base) primeiro: cria window.PA e PA._interno, que as outras partes usam
      { js: 'js/arte/pixelart-unicornio-moldes.js', grupo: 'pixelart' },
      { js: 'js/arte/enfeites-novidades.js', grupo: 'pixelart', node: true },
      { js: 'js/arte/pixelart-unicornio.js', grupo: 'pixelart' },
      { js: 'js/arte/pixelart-personagens.js', grupo: 'pixelart' },
      { js: 'js/arte/pixelart-mariana-visual.js', grupo: 'pixelart' },
      { js: 'js/arte/pixelart-menino-moldes.js', grupo: 'pixelart' },
      { js: 'js/arte/itens-vestir.js', grupo: 'pixelart' }, // itens: cabeça, armadura e botas no desenho dela, espada e escudo (PA._interno.aplicarVestes, PA.espadaItem/escudoItem; itens.md §8)
      { js: 'js/arte/pixelart-ovos.js', grupo: 'pixelart' },
      { js: 'js/arte/pixelart-icones.js', grupo: 'pixelart' },
      { js: 'js/conteudo/laboratorio/atividades.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/loja-itens.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/loja-novidades.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/ingredientes.js', grupo: 'conteudo', node: true }, // Laboratório de Química: os dados (docs/contratos/quimica.md); frases.js antes das frases-<tela>.js
      { js: 'js/conteudo/quimica/receitas.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/ingredientes-cartoes.js', grupo: 'conteudo', node: true }, // produtos que chegam com os cartões de experiência
      { js: 'js/conteudo/quimica/receitas-cartoes.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-bancada.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-caderno.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-microscopio.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-tabela.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/elementos.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/elementos-trilha.js', grupo: 'conteudo', node: true }, // os 25 elementos do prêmio da trilha perfeita (bloqueados até ganhar; quarto-bimestre.md §14)
      { js: 'js/conteudo/quimica/experiencias.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-experiencias.js', grupo: 'conteudo', node: true }, // frases do álbum Experiências do Reino (as páginas das cartas entram no Q.falas)
      { js: 'js/conteudo/quimica/tabela.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/licoes.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/laminas.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-estados.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-separar.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/frases-livros.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/curiosidades.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/estados.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/separar.js', grupo: 'conteudo', node: true },
      { js: 'js/conteudo/quimica/livros.js', grupo: 'conteudo', node: true },
      { js: 'js/personagens/unicornios.js', grupo: 'personagens', node: true },
      { js: 'js/conteudo/materias/registro.js', grupo: 'materias', node: true }, // registro.js antes das matérias: cada sala (e o livro) se registra e <m>.js junta tudo na matéria
      { js: 'js/conteudo/materias/historia/h1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia/h2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia/h3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia/h4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia/h5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia/livro.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia/historia.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/i1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/i2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/i3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/i4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/i5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/livro.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles/ingles.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/p1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/p2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/p3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/p4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/p5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/livro.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues/portugues.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/c1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/c2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/c3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/c4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/c5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/livro.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias/ciencias.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/m1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/m2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/m3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/m4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/m5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/m6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/livro.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica/matematica.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10a5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10a6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma10t3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a7.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11a8.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma11t3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a7.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a8.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12a9.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/ma12t3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/livro-10a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/livro-10t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/livro-11a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/livro-11t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/livro-12a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/livro-12t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/unicornios-10.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/unicornios-11.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/unicornios-12.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/unicornios-t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/matematica4/matematica4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/g1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/g2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/g3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/g4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/g5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/livro.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia/geografia.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi10a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi10a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi10a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi10t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi11a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi11a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi11a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi11t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi12a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi12a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi12a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/hi12t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/livro-10a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/livro-10t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/livro-11a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/livro-11t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/livro-12a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/livro-12t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/unicornios-10.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/unicornios-11.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/unicornios-12.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/historia4/historia4.js', grupo: 'materias', node: true },
      // Língua Portuguesa do 4º bimestre (térreo da Casa das Palavras; docs/contratos/quarto-bimestre.md): salas de livro na ordem dos livros,
      // cartas e unicórnios por capítulo, depois a matéria
      { js: 'js/conteudo/materias/portugues4/lp10a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10a5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10a6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10a7.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp10t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11a5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11a6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp11t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12a5.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12a6.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/lp12t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/livro-10a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/livro-10t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/livro-11a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/livro-11t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/livro-12a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/livro-12t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/unicornios-10.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/unicornios-11.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/unicornios-12.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/portugues4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/premios-trilha-10.js', grupo: 'materias', node: true }, // prêmio da trilha perfeita de cada sala (quarto-bimestre.md §14)
      { js: 'js/conteudo/materias/portugues4/premios-trilha-11.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/portugues4/premios-trilha-12.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge10a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge10a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge10a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge10t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge11a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge11a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge11a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge11a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge11t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge12a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge12a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge12a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge12a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge12t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/ge12t2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/livro-10a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/livro-10t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/livro-11a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/livro-11t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/livro-12a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/livro-12t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/unicornios-10.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/unicornios-11.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/unicornios-12.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/geografia4/geografia4.js', grupo: 'materias', node: true },
      // English do 4º bimestre (Torre do Relógio inteira; docs/contratos/quarto-bimestre.md): salas de livro na ordem do livro,
      // cartas e unicórnios por capítulo e livro (e = English, p = Projetos), depois a matéria
      { js: 'js/conteudo/materias/ingles4/en11e1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en11e2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en11e3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en11e4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en12e1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en12e2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en12e3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en11p1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en11p2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en11p3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en12p1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en12p2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/en12p3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/livro-11e.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/livro-12e.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/livro-11p.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/livro-12p.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/unicornios-11e.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/unicornios-12e.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/unicornios-11p.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/unicornios-12p.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ingles4/ingles4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci10a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci10a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci10a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci10a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci10t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci11a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci11a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci11a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci11a4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci11t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci12a1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci12a2.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci12a3.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ci12t1.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/livro-10a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/livro-10t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/livro-11a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/livro-11t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/livro-12a.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/livro-12t.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/unicornios-10.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/unicornios-11.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/unicornios-12.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/materias/ciencias4/ciencias4.js', grupo: 'materias', node: true },
      { js: 'js/conteudo/presentes.js', grupo: 'conteudo', node: true }, // presentes do jogo: as medalhas Ultra Lendárias (pedido 2026-10-28)
      { js: 'js/conteudo/casa/kits-a.js', grupo: 'conteudo', node: true }, // casa: kits estar, jantar e cozinha (casa.md §3)
      { js: 'js/conteudo/casa/kits-b.js', grupo: 'conteudo', node: true }, // casa: kits Banheiro, Quarto do jogador e Quarto do unicórnio
      { js: 'js/conteudo/casa/moveis-salas.js', grupo: 'conteudo', node: true }, // casa: os 42 móveis avulsos, um à escolha por sala feita (casa.md §12)
      { js: 'js/conteudo/casa/moveis-loja.js', grupo: 'conteudo', node: true }, // casa: os 50 enfeites da loja Casa Bonita da Vila, 30 estrelas cada (loja: true; vila.md)
      { js: 'js/conteudo/itens/catalogo.js', grupo: 'conteudo', node: true }, // itens dos monstros: o catálogo (Reino.ItensCatalogo; itens.md §3, §4)
      { js: 'js/conteudo/itens/vestes-a.js', grupo: 'conteudo', node: true }, // itens: moldes da cabeça (Reino.VESTES; itens.md §8)
      { js: 'js/conteudo/itens/vestes-b.js', grupo: 'conteudo', node: true }, // itens: moldes de armaduras, botas, espadas e escudos
      { js: 'js/conteudo/itens/icones-a.js', grupo: 'icones', node: true }, // itens: ícones item:<id> de espadas, escudos, capacetes e chapéus
      { js: 'js/conteudo/itens/icones-b.js', grupo: 'icones', node: true }, // itens: ícones de armaduras, botas, poções e bau-guardados
      { js: 'js/conteudo/itens/icones-monstros.js', grupo: 'icones', node: true }, // Treinadores de Monstros: o ícone da MonsterBall (item:bola-monster)
      { js: 'js/conteudo/itens/loja-moldes.js', grupo: 'conteudo', node: true }, // Vila: moldes e ícones gerados das 100 peças das lojas (vila.md)
      { js: 'js/conteudo/itens/loja-armas.js', grupo: 'conteudo', node: true }, // Vila: as 20 espadas da Forja
      { js: 'js/conteudo/itens/loja-cabecas.js', grupo: 'conteudo', node: true }, // Vila: os 20 capacetes e 20 chapéus
      { js: 'js/conteudo/itens/loja-armaduras.js', grupo: 'conteudo', node: true }, // Vila: as 20 armaduras e 20 botas
      { js: 'js/conteudo/itens/pluma.js', grupo: 'conteudo', node: true }, // Vila: as 6 peças épicas da Pluma, conquistadas pela letra cursiva (cursiva.md §6)
      { js: 'js/conteudo/materias/ciencias/icones.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/matematica/icones.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/geografia/icones.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/geografia4/icones-10.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/geografia4/icones-11.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/geografia4/icones-12.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/portugues4/icones-10.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/portugues4/ilustracoes-10.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/portugues4/icones-11.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/portugues4/ilustracoes-11.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/matematica4/icones-10.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/matematica4/icones-11.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/matematica4/icones-12.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/matematica4/icones-t.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/portugues4/icones-12.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/portugues4/ilustracoes-12.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ingles4/icones-geral.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/historia4/icones-10.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/historia4/icones-11.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/historia4/icones-12.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ingles4/icones-11e.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ingles4/icones-12e.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ingles4/icones-11p.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ingles4/icones-12p.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ciencias4/icones-10.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ciencias4/icones-11.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/materias/ciencias4/icones-12.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/quimica/icones.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/quimica/icones-2.js', grupo: 'icones', node: true },
      { js: 'js/conteudo/provas/historia-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/ingles-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/portugues-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/ciencias-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/matematica-3bim.js', grupo: 'provas', node: true },
      { js: 'js/conteudo/provas/geografia-3bim.js', grupo: 'provas', node: true },
      { js: 'js/sistemas/progresso.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/progresso-mescla.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/progresso-nuvem.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/progresso-regras.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/progresso-campos.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/tempo-celular.js', grupo: 'sistemas', node: true }, // campo tempoUsos; ganho derivado das salas
      { js: 'js/sistemas/visitados.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/producoes.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/etapas-progresso.js', grupo: 'sistemas', node: true }, // campo etapas (quarto-bimestre.md §13)
      { js: 'js/sistemas/trilhas.js', grupo: 'sistemas', node: true }, // campo trilhas e P.conferirTrilhas (§14)
      { js: 'js/sistemas/jogadores.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/som.js', grupo: 'sistemas' },
      { js: 'js/sistemas/som-escola.js', grupo: 'sistemas' },
      { js: 'js/sistemas/som-instrumentos.js', grupo: 'sistemas' },
      { js: 'js/sistemas/som-musica.js', grupo: 'sistemas' },
      { js: 'js/sistemas/musicas-faixas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/musicas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/voz.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/genero.js', grupo: 'sistemas', node: true },
      { js: 'js/personagens/claude.js', grupo: 'personagens', node: true },
      { js: 'js/sistemas/falas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/cuidados.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/surpresa.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/surpresa-painel.js', grupo: 'sistemas', node: true },
      { js: 'js/mundo/mapa.js', grupo: 'mundo' },
      { js: 'js/mundo/lugares.js', grupo: 'mundo' },
      { js: 'js/mundo/mapa-desenho.js', grupo: 'mundo' },
      { js: 'js/mundo/arvores.js', grupo: 'mundo' },
      { js: 'js/mundo/chao.js', grupo: 'mundo' },
      { js: 'js/mundo/lago.js', grupo: 'mundo' },
      { js: 'js/mundo/cidade-desenho.js', grupo: 'mundo' },
      { js: 'js/mundo/cidade-pecas.js', grupo: 'mundo' },
      { js: 'js/mundo/cofre-desenho.js', grupo: 'mundo' },
      { js: 'js/mundo/teleportadora.js', grupo: 'mundo' }, // a Teleportadora na praça da cidade (objeto do mapa, camada e toque; vila.md)
      { js: 'js/mundo/contorno.js', grupo: 'mundo' },
      { js: 'js/mundo/fachadas.js', grupo: 'mundo' },
      { js: 'js/mundo/fachadas-kit.js', grupo: 'mundo' },
      { js: 'js/mundo/fachadas-kit-2.js', grupo: 'mundo' },
      { js: 'js/mundo/predios.js', grupo: 'mundo' },
      { js: 'js/mundo/predios-3.js', grupo: 'mundo' },
      { js: 'js/mundo/predios-2.js', grupo: 'mundo' },
      { js: 'js/personagens/jogador.js', grupo: 'personagens' },
      { js: 'js/personagens/jogador-desenho.js', grupo: 'personagens' },
      { js: 'js/atividades/desafios.js', grupo: 'atividades', node: true }, // node: true: o validador e as falas usam os ganchos dos tipos (no carregamento, nada de document)
      { js: 'js/atividades/desafios/quebra.js', grupo: 'atividades', node: true }, // quebra de linha dos desafios: opção colada e hifenizada, sinal e "R$" presos, rótulo que desce um degrau
      { js: 'js/atividades/desafios/campo-texto.js', grupo: 'atividades', node: true }, // caixa de digitar com acentos (helpers dos tipos do 4º bimestre)
      { js: 'js/atividades/desafios/marcar.js', grupo: 'atividades', node: true }, // tipos do livro do 4º bimestre: circular/sublinhar/pintar, completar escrevendo, resposta escrita
      { js: 'js/atividades/desafios/digitar.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/escrever.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/figuras.js', grupo: 'atividades', node: true }, // figuras nas questões do 4º bimestre (opção, apoio, d.figura) e a conferência delas
      { js: 'js/atividades/desafios/tabela.js', grupo: 'atividades', node: true }, // tipos do livro do 4º bimestre, parte 2: tabela, cruzadinha, caça-palavras
      { js: 'js/atividades/desafios/cruzadinha.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/caca-palavras.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/escolha.js', grupo: 'atividades', node: true }, // cada tipo de desafio se registra no núcleo (Reino.registrarTipoDesafio, desafios.js, carregado antes)
      { js: 'js/atividades/desafios/varias.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/ligar.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/sequencia.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/separar.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/vfLista.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/completar.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/copiar.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/memoria.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/desafios/desenho.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/etapas.js', grupo: 'atividades', node: true }, // Reino.etapasDaSala (quarto-bimestre.md §13.1)
      { js: 'js/atividades/missao.js', grupo: 'atividades' },
      { js: 'js/atividades/missao-etapas.js', grupo: 'atividades' }, // trilha das etapas e fim de etapa (§13.3)
      { js: 'js/atividades/treino.js', grupo: 'atividades' },
      { js: 'js/atividades/provas.js', grupo: 'atividades' },
      { js: 'js/atividades/voo.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/voo-portais.js', grupo: 'atividades', node: true },
      { js: 'js/atividades/voo-desenho.js', grupo: 'atividades' },
      { js: 'js/ui/base.js', grupo: 'ui' },
      { js: 'js/ui/espera-fala.js', grupo: 'ui' },
      { js: 'js/ui/pecas.js', grupo: 'ui' },
      { js: 'js/ui/cuidados.js', grupo: 'ui' },
      { js: 'js/ui/hud.js', grupo: 'ui' },
      { js: 'js/ui/hud-fotos.js', grupo: 'ui' },
      { js: 'js/ui/juntos.js', grupo: 'ui' }, // Jogar juntos: o botão 👥 do HUD e a tela "Quem está no reino" (juntos.md §8)
      { js: 'js/ui/hud-aura.js', grupo: 'ui' },
      { js: 'js/ui/foguete.js', grupo: 'ui' },
      { js: 'js/ui/et-desafio.js', grupo: 'ui' },
      { js: 'js/ui/album-ets.js', grupo: 'ui' },
      { js: 'js/ui/materia.js', grupo: 'ui' },
      { js: 'js/ui/materia-livro.js', grupo: 'ui' }, // o livro: cartas (ricas do 4º bimestre) e os dois livros da escola
      { js: 'js/ui/laboratorio.js', grupo: 'ui' },
      { js: 'js/ui/laboratorio-cenas.js', grupo: 'ui' },
      { js: 'js/ui/laboratorio-jogos.js', grupo: 'ui' },
      { js: 'js/ui/feira.js', grupo: 'ui' },
      { js: 'js/ui/bau.js', grupo: 'ui' },
      { js: 'js/ui/tempo-celular.js', grupo: 'ui' }, // usar o tempo de celular (Baú) e mostrar aos pais
      { js: 'js/ui/loja.js', grupo: 'ui' },
      { js: 'js/ui/estabulo.js', grupo: 'ui' },
      { js: 'js/ui/petshop-enfeites.js', grupo: 'ui' },
      { js: 'js/ui/petshop.js', grupo: 'ui' },
      { js: 'js/ui/ovos.js', grupo: 'ui' },
      { js: 'js/ui/bau-presente.js', grupo: 'ui' }, // o baú dos presentes depois do login (UI.abrirPresentesPendentes)
      { js: 'js/ui/bau-cartao.js', grupo: 'ui' }, // o baú do cartão de experiência no fim da sala (UI.abrirCartaoBau)
      { js: 'js/ui/moedas-festa.js', grupo: 'ui' }, // as moedas voando até o chip do HUD (UI.festaMoedas)
      { js: 'js/ui/lugares.js', grupo: 'ui' },
      { js: 'js/ui/ajustes.js', grupo: 'ui' },
      { js: 'js/ui/aparencia.js', grupo: 'ui' },
      { js: 'js/ui/salao.js', grupo: 'ui' },
      { js: 'js/ui/cofre.js', grupo: 'ui' },
      { js: 'js/ui/casa-decorar-fantasma.js', grupo: 'ui' }, // casa: modo decorar, o modo colocar e o fantasma (casa.md §9.3)
      { js: 'js/ui/casa-decorar.js', grupo: 'ui' }, // casa: modo decorar, o painel das peças e o botão do HUD (UI.decorarCasa)
      { js: 'js/ui/quimica-palco.js', grupo: 'ui' },
      { js: 'js/ui/quimica-palco-2.js', grupo: 'ui' },
      { js: 'js/ui/quimica-bancada.js', grupo: 'ui' },
      { js: 'js/ui/quimica-caderno.js', grupo: 'ui' },
      { js: 'js/ui/quimica-laminas.js', grupo: 'ui' },
      { js: 'js/ui/quimica-microscopio.js', grupo: 'ui' },
      { js: 'js/ui/quimica-tabela.js', grupo: 'ui' },
      { js: 'js/ui/quimica-tabela-2.js', grupo: 'ui' },
      { js: 'js/ui/quimica-estados.js', grupo: 'ui' },
      { js: 'js/ui/quimica-estados-2.js', grupo: 'ui' },
      { js: 'js/ui/quimica-separar.js', grupo: 'ui' },
      { js: 'js/ui/quimica-separar-2.js', grupo: 'ui' },
      { js: 'js/ui/quimica-livros.js', grupo: 'ui' },
      { js: 'js/ui/quimica-livros-2.js', grupo: 'ui' },
      { js: 'js/ui/quimica-experiencias.js', grupo: 'ui' }, // álbum Experiências do Reino (quarto-bimestre.md §14.3)
      { js: 'js/ui/sem-internet.js', grupo: 'ui' },
      { js: 'js/ui/pais.js', grupo: 'ui' },
      { js: 'js/ui/jogadores.js', grupo: 'ui' },
      { js: 'js/ui/abertura-desenho.js', grupo: 'ui' },
      { js: 'js/ui/abertura-medalha.js', grupo: 'ui' },   // festa da medalha de ouro na abertura (até config.festaMedalha.ate)
      { js: 'js/ui/abertura-novidade.js', grupo: 'ui' },   // a novidade em destaque na abertura (até config.novidadeInicio.ate)
      { js: 'js/ui/abertura.js', grupo: 'ui' },
      { js: 'js/sistemas/fotos.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/fotos-moldura.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/fotos-telas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/presentes.js', grupo: 'sistemas', node: true }, // campo presentes, P.presentesPendentes, P.abrirPresente (módulo depois de cuidados, surpresa e fotos)
      { js: 'js/sistemas/casa.js', grupo: 'sistemas', node: true }, // casa do jogador (casa.md): campos casaBau/casaKits/casaItens, Reino.Casa, ação casaDecorar
      { js: 'js/sistemas/casa-moveis.js', grupo: 'sistemas', node: true }, // casa: campo casaMoveis, um móvel avulso por sala feita (Reino.CasaMoveis; casa.md §12)
      { js: 'js/ui/casa-falas.js', grupo: 'ui', node: true }, // falas do Claude no baú da casa e na escolha do kit (sem DOM)
      { js: 'js/ui/bau-casa.js', grupo: 'ui' }, // o baú da casa do jogador ao entrar no Reino (UI.abrirBauCasa; casa.md §9)
      { js: 'js/ui/casa-kits.js', grupo: 'ui' }, // a escolha do kit de móveis da casa (UI.escolherKitCasa, UI.casaKitsPendentes)
      { js: 'js/ui/casa-moveis.js', grupo: 'ui' }, // a escolha do móvel avulso de uma sala feita (UI.escolherMovelCasa, UI.casaMoveisPendentes)
      { js: 'js/ui/bosque-hud.js', grupo: 'ui' }, // Bosque dos Fantasmas: chip do HUD, botão da espada e o painel (UI.telaBosque; bosque.md §5)
      { js: 'js/ui/bosque-nivel.js', grupo: 'ui' }, // Bosque dos Fantasmas: prêmio da espada e o ponto de nível (UI.telaEspadaBosque, UI.subirNivelBosque)
      { js: 'js/ui/bosque-bau.js', grupo: 'ui' }, // Bosque dos Fantasmas: o baú do móvel surpresa, da pergunta e do nível (UI.bauBosque)
      { js: 'js/ui/bosque-pergunta.js', grupo: 'ui' }, // Bosque dos Fantasmas: a pergunta do bloco de 10 inimigos e o prêmio (UI.perguntaFantasma)
      { js: 'js/ui/hud-mochila.js', grupo: 'ui' }, // itens: o botão 🎒 do HUD, com o brilhinho de item novo (itens.md §13)
      { js: 'js/ui/itens-aviso.js', grupo: 'ui' }, // itens: o aviso pequeno no alto quando cai um item (UI.avisoItem; itens.md §13)
      { js: 'js/ui/mochila-item.js', grupo: 'ui' }, // itens: o cartão de um item (vestir, tirar, usar, dar, jogar fora; Reino._itensTelas)
      { js: 'js/ui/mochila.js', grupo: 'ui' }, // itens: a tela da Mochila, 20 espaços e a figura vestida (UI.telaMochila; itens.md §6)
      { js: 'js/ui/guardados.js', grupo: 'ui' }, // itens: a tela do Baú de Guardados da casa (UI.telaGuardados; itens.md §7)
      { js: 'js/ui/vila-pergunta.js', grupo: 'ui' }, // Vila: a pergunta do 4º bimestre antes de falar com o lojista (UI.perguntaVila)
      { js: 'js/ui/vila-conquistas.js', grupo: 'ui' }, // Vila: a faixa "Peças épicas" das lojas, conquistadas pela letra cursiva (Reino._vilaEpicas; cursiva.md §6)
      { js: 'js/ui/vila-loja.js', grupo: 'ui' }, // Vila: a tela de comprar e vender, vários de uma vez (UI.telaVilaLoja)
      { js: 'js/ui/treinadores-loja.js', grupo: 'ui' }, // Treinadores de Monstros: a loja das MonsterBalls (UI.telaTreinadores; monstros.md)
      { js: 'js/ui/cursiva.js', grupo: 'ui' }, // Letra cursiva: a tela de escrever, que só pinta no sentido certo (UI.telaCursiva; cursiva.md)
      { js: 'js/ui/itens-pocao.js', grupo: 'ui' }, // itens: o botão rápido da poção na arena (itens.md §9)
      { js: 'js/ui/monstros.js', grupo: 'ui' }, // Treinadores de Monstros: a tela Meus monstros e o aviso da bola (UI.telaMonstros; monstros.md)
      { js: 'js/ui/monstros-bola.js', grupo: 'ui' }, // Treinadores de Monstros: o botão da MonsterBall na arena (monstros.md §4)
      { js: 'js/ui/parquinho.js', grupo: 'ui' }, // Parquinho: a tela do que falta (portal dormindo, presentes; UI.telaParquinho)
      { js: 'js/ui/parquinho-areia.js', grupo: 'ui' }, // Parquinho: a caixa de areia de perto (UI.telaParquinhoAreia; parquinho.md)
      { js: 'js/sistemas/versao.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/aura.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/viagem.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/viagem-fluxo.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/viagem-perguntas.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/viagem-desafio.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/viagem-amigos.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/et-companheiro.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/monstros.js', grupo: 'sistemas', node: true }, // Treinadores de Monstros: coleção, monstros equipados em fila, campos monstros/monstroCompanheiro/monstrosJuntos (Reino.Monstros; monstros.md)
      { js: 'js/sistemas/monstros-materias.js', grupo: 'sistemas', node: true }, // Monstros das matérias (Casa Mal-Assombrada): os 6 moldes, ganhos com a matéria completa (monstros.md §10)
      { js: 'js/sistemas/quimica.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/quimica-andar2.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/cartoes.js', grupo: 'sistemas', node: true }, // cartões de experiência do Laboratório: derivados das salas feitas (quimica.md §10)
      { js: 'js/motor/interiores-base.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-pisos.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-objetos-parede.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-objetos-moveis.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-objetos-enfeites.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-grade.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-estatico.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-placas.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-toque.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-cena.js', grupo: 'motor', node: true },
      { js: 'js/motor/interiores-arena.js', grupo: 'motor', node: true }, // arenas (mapas de luta): Reino.registrarArena, registrarDesenhoInimigo, Reino.Arenas e o layout (Reino.Interiores.arena; arenas.md)
      { js: 'js/personagens/npcs.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-corpo.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-cabeca.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-sprites.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-reserva.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-status.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-falas.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/npcs-conversa.js', grupo: 'personagens', node: true },
      { js: 'js/personagens/elenco.js', grupo: 'personagens', node: true },
      { js: 'js/interiores/museu/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/museu/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/museu/objetos-acervo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/museu/hi-objetos.js', grupo: 'interiores', node: true }, // História da Gente (4º bimestre): a estação das salas e as peças dos capítulos
      { js: 'js/interiores/museu/hi-galerias.js', grupo: 'interiores', node: true }, // as galerias e as oficinas dos capítulos
      { js: 'js/interiores/museu/museu.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/objetos-casa.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/en-objetos.js', grupo: 'interiores', node: true }, // English do 4º bimestre: a estação das salas
      { js: 'js/interiores/torre/torre.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/torre/en-andares.js', grupo: 'interiores', node: true }, // andares 1 a 5 (um por capítulo) e o relógio
      { js: 'js/interiores/escola/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola/lousas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola/escola.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/castelo/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/castelo/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/castelo/castelo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/estabulo/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/estabulo/baias.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/estabulo/estabulo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/loja/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/loja/desenhos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/loja/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/loja/loja.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bau/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bau/bau.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/objetos-loja.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/objetos-agua.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/petshop.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/acoes.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/petshop/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/reservas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/personagens-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/nasa-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/planetas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/cenas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/robo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/ceu.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/objetos-parede.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/objetos-cupula-planetario.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/objetos-galeria.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/acoes.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/observatorio.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/nasa-personagens.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/nasa-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/nasa-experiencias.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/nasa-andar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/lab-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/lab-objetos-1.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/lab-objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/lab-objetos-3.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/ci-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/ci-comodos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/lab-atividades.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/observatorio/lab-andar3.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/reservas.js', grupo: 'interiores', node: true }, // reservas do 1º andar (orquestrador)
      { js: 'js/interiores/portugues/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/objetos-hall-cozinha.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/objetos-horta-circo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/objetos-porto.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/objetos-parque.js', grupo: 'interiores', node: true },
      // Língua Portuguesa do 4º bimestre no térreo (docs/contratos/quarto-bimestre.md §7): pessoas, falas e objetos
      // (prefixo lp-); o layout é o portugues.js
      { js: 'js/interiores/portugues/lp-personagens.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/personagens-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-respiro.js', grupo: 'interiores', node: true }, // ação lp-respiro (Vovó Serena): respiração guiada
      { js: 'js/interiores/portugues/lp-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-objetos-temas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-objetos-atelies.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-objetos-andar1.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-tesouros.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/portugues.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/portugues/lp-andar1.js', grupo: 'interiores', node: true }, // 1º andar (portugues-1): ateliês, Cantinho do Respiro, Galeria dos Tesouros
      { js: 'js/interiores/portugues/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/matematica/objetos-parede.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/matematica/objetos-chao.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/matematica/ma-objetos.js', grupo: 'interiores', node: true }, // Matemática do Dia a Dia (4º bimestre): a estação das salas e o quadro dos andares
      { js: 'js/interiores/matematica/ma-objetos-temas.js', grupo: 'interiores', node: true }, // os enfeites dos capítulos 10, 11 e 12
      { js: 'js/interiores/matematica/salas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/matematica/elenco.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/matematica/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/matematica/matematica.js', grupo: 'interiores', node: true }, // o saguão e os andares (um por capítulo)
      { js: 'js/interiores/matematica/ma-andares.js', grupo: 'interiores', node: true }, // andares 1 a 3: galerias e ateliê de cada capítulo
      { js: 'js/interiores/matematica/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/geografia/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/geografia/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/geografia/ge-objetos.js', grupo: 'interiores', node: true }, // Geografia do Mundo (4º bimestre): estação das salas, livros, mapa e painel
      { js: 'js/interiores/geografia/ge-objetos-temas.js', grupo: 'interiores', node: true }, // os enfeites dos capítulos 10, 11 e 12
      { js: 'js/interiores/geografia/geografia.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/geografia/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/planetas-comum.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/ets.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/personagens.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/lua-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/lua-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/lua-brincadeiras.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/lua.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/marte-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/marte-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/marte-brincadeiras.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/marte.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/saturno-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/saturno-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/saturno-brincadeiras.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/saturno.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/jupiter-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/jupiter-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/jupiter-brincadeiras.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/jupiter.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/venus-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/venus-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/venus-brincadeiras.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/venus.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/netuno-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/netuno-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/netuno-brincadeiras.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/planetas/netuno.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/icones.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/personagens.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/salao.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/acoes.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/salao/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/reservas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/personagens-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/personagens.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/quimica.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/andar2-falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/andar2-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/andar2-objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/andar2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/acoes.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/curiosidade.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/quimica/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/dados.js', grupo: 'interiores', node: true },
      { js: 'js/ui/feira-cenas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/objetos-natureza.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/acoes.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/feira.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/feira/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/icones.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/dados.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/acoes.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/teclado.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/fundamentos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/jogos-dados.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/jogos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/jogo-eco.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/jogo-ritmo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/jogo-ouvido.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/objetos-sala-jogos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/escola-musica.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/escola-musica/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/virar.js', grupo: 'interiores', node: true }, // casa do jogador (casa.md): o desenho dos móveis nas 4 direções
      { js: 'js/interiores/casa/moveis-estar.js', grupo: 'interiores', node: true }, // casa: móveis do kit Sala de Estar
      { js: 'js/interiores/casa/moveis-jantar.js', grupo: 'interiores', node: true }, // casa: móveis do kit Sala de Jantar
      { js: 'js/interiores/casa/moveis-cozinha.js', grupo: 'interiores', node: true }, // casa: móveis do kit Cozinha
      { js: 'js/interiores/casa/moveis-banheiro.js', grupo: 'interiores', node: true }, // casa: móveis do kit Banheiro
      { js: 'js/interiores/casa/moveis-quarto.js', grupo: 'interiores', node: true }, // casa: móveis do Quarto do jogador
      { js: 'js/interiores/casa/moveis-quarto-uni.js', grupo: 'interiores', node: true }, // casa: móveis do Quarto do unicórnio
      { js: 'js/interiores/casa/moveis-salas-estar.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) de Sala de Estar
      { js: 'js/interiores/casa/moveis-salas-jantar.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) de Sala de Jantar
      { js: 'js/interiores/casa/moveis-salas-cozinha.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) de Cozinha
      { js: 'js/interiores/casa/moveis-salas-banheiro.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) de Banheiro
      { js: 'js/interiores/casa/moveis-salas-quarto.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) de Quarto do jogador
      { js: 'js/interiores/casa/moveis-salas-quarto-et.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) do Quarto do ET
      { js: 'js/interiores/casa/moveis-salas-quarto-uni.js', grupo: 'interiores', node: true }, // casa: móveis avulsos (por sala) de Quarto do unicórnio
      { js: 'js/interiores/casa/moveis-loja-a.js', grupo: 'interiores', node: true }, // casa: desenhos dos enfeites da loja da Vila (casa-movel-<id>)
      { js: 'js/interiores/casa/moveis-loja-b.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/moveis-loja-c.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/falas.js', grupo: 'interiores', node: true }, // casa: o prédio (falas, caixa de mudança, térreo, 2º andar, fora, lugar)
      { js: 'js/interiores/casa/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/guardados.js', grupo: 'interiores', node: true }, // o Baú de Guardados da casa e a ação 'guardados' (itens.md §7)
      { js: 'js/interiores/casa/casa.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/andar2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/casa/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/icones.js', grupo: 'interiores', node: true }, // Bosque dos Fantasmas (bosque.md): ícones, o interior de céu aberto, o portal no mapa e o lugar (o último prédio)
      { js: 'js/interiores/bosque/fundo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/portal-vila.js', grupo: 'interiores', node: true }, // o portal para a Vila Arco-Íris, no centro-direita (vila.md)
      { js: 'js/interiores/bosque/bosque.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/portais.js', grupo: 'interiores', node: true }, // os portais novos dentro do Bosque (Orvalho, Neblina, Lua Cheia; arenas.md §8)
      { js: 'js/interiores/bosque/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/bosque/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/brincar.js', grupo: 'interiores', node: true }, // Parquinho (parquinho.md): a brincadeira (Reino.ParquinhoBrincar), o chão, os brinquedos, as poses, o interior, o portal na praça e o lugar
      { js: 'js/interiores/parquinho/fundo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/poses.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/poses-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/poses-balanco.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/balanco.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/poses-areia.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/areia-caixa.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/areia-desenho.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/parquinho.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/fora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/parquinho/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/pantano/falas.js', grupo: 'interiores', node: true }, // Pântano das Rãs Resmungonas (arenas.md): a arena 2, modelo dos mapas novos (falas, objetos, ícone e inimigos, chão/céu e interior, portal e lugar)
      { js: 'js/interiores/pantano/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/pantano/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/pantano/pantano.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/pantano/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/gelo/falas.js', grupo: 'interiores', node: true }, // Montanha Gelada (arenas.md): a arena 3 (falas, objetos, ícone e inimigos, chão/céu e interior, portal e lugar)
      { js: 'js/interiores/gelo/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/gelo/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/gelo/gelo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/gelo/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/dunas/falas.js', grupo: 'interiores', node: true }, // Dunas dos Escorpiões (arenas.md): a arena 4 (falas, objetos, inimigos, chão/céu e interior, portal e lugar)
      { js: 'js/interiores/dunas/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/dunas/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/dunas/dunas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/dunas/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/cristal/falas.js', grupo: 'interiores', node: true }, // Caverna de Cristal (arenas.md): a arena 5 (falas, objetos, inimigos, chão/teto e interior, portal e lugar)
      { js: 'js/interiores/cristal/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/cristal/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/cristal/cristal.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/cristal/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vulcao/falas.js', grupo: 'interiores', node: true }, // Vulcão dos Dragõezinhos (arenas.md): a arena 6 (falas, objetos, ícone e inimigos, chão/céu e interior, portal e lugar)
      { js: 'js/interiores/vulcao/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vulcao/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vulcao/vulcao.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vulcao/lugar.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/falas.js', grupo: 'interiores', node: true }, // Vila Arco-Íris (vila.md): falas e lojistas, céu e chão, objetos, a Teleportadora, a praça e as 4 lojas
      { js: 'js/interiores/vila/treinadores-falas.js', grupo: 'interiores', node: true }, // Treinadores de Monstros (monstros.md): a Treinadora Kiara e as falas do prédio
      { js: 'js/interiores/vila/assombrada-icones.js', grupo: 'interiores', node: true }, // Casa Mal-Assombrada: o ícone da abóbora acesa (🎃), o desenho do aviso na tela de início
      { js: 'js/interiores/vila/assombrada-falas.js', grupo: 'interiores', node: true }, // Casa Mal-Assombrada (vila.md §2): as falas dos enfeites e das 6 jaulas dos monstros das matérias
      { js: 'js/interiores/vila/fundo.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/treinadores-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/assombrada-objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/assombrada-objetos-2.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/teleportadora.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/vila.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/lojas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/treinadores.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/assombrada.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/vila/assombrada-acoes.js', grupo: 'interiores', node: true }, // Casa Mal-Assombrada: a ação das jaulas (módulo 'assombrada'; levar o monstro com Reino.Monstros.equipar)
      // Bosques de dentro do Bosque (arenas.md §8): no fim do grupo interiores (as fotos das cenas de antes do e2e não mudam);
      // depois do Bosque, que carrega antes, para chamarem Reino._predios.bosque.portalNovo
      { js: 'js/interiores/orvalho/falas.js', grupo: 'interiores', node: true }, // Bosque do Orvalho (arenas.md §8): bosque de dentro do Bosque (falas, objetos, inimigos, chão/céu, interior e portal)
      { js: 'js/interiores/orvalho/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/orvalho/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/orvalho/orvalho.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/neblina/falas.js', grupo: 'interiores', node: true }, // Bosque da Neblina (arenas.md §8): bosque de dentro do Bosque (falas, objetos, inimigos, chão/céu, interior e portal)
      { js: 'js/interiores/neblina/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/neblina/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/neblina/neblina.js', grupo: 'interiores', node: true },
      // Bosque da Lua Cheia (arenas.md §8): bosque de dentro do Bosque (falas, objetos, inimigos, chão/céu, interior e portal)
      { js: 'js/interiores/lua/falas.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/lua/objetos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/lua/inimigos.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/lua/lua.js', grupo: 'interiores', node: true },
      { js: 'js/interiores/padrao.js', grupo: 'interiores', node: true }, // padrao.js por último entre os prédios: monta o interior das matérias que não têm um próprio
      { js: 'js/sistemas/banho.js', grupo: 'sistemas' },
      { js: 'js/sistemas/banho-desenho.js', grupo: 'sistemas' },
      { js: 'js/sistemas/banho-medidas.js', grupo: 'sistemas' },
      { js: 'js/sistemas/casa-usos.js', grupo: 'sistemas', node: true }, // casa: os móveis funcionam (Reino.CasaUsos, ação casaUsar; casa.md §13)
      { js: 'js/sistemas/casa-usos-tabela.js', grupo: 'sistemas', node: true }, // casa: o uso de cada móvel de kit e avulso (casa.md §13)
      { js: 'js/sistemas/casa-usos-animar.js', grupo: 'sistemas' }, // casa: a animação de um uso (cena ocupada, pular, temporizador)
      { js: 'js/sistemas/casa-usos-poses-a.js', grupo: 'sistemas' }, // casa: poses sentar e deitar (ela e o unicórnio)
      { js: 'js/sistemas/casa-usos-poses-b.js', grupo: 'sistemas' }, // casa: poses banho, chuveiro e cozinhar
      { js: 'js/sistemas/vida-mapa.js', grupo: 'sistemas', node: true },
      { js: 'js/sistemas/et-companheiro-desenho.js', grupo: 'sistemas' },
      { js: 'js/sistemas/monstros-desenho.js', grupo: 'sistemas' }, // Treinadores de Monstros: o monstro que segue, o pulo da ajuda e a MonsterBall voando
      { js: 'js/sistemas/bosque-falas.js', grupo: 'sistemas', node: true }, // Bosque dos Fantasmas: falas do Claude (Reino.BosqueFalas; bosque.md §6)
      { js: 'js/sistemas/bosque.js', grupo: 'sistemas', node: true }, // Bosque dos Fantasmas: regras, campos bosque/bosquePontos, placar de mortos, migração e os prêmios de móvel (Reino.Bosque; bosque.md §4, §5)
      { js: 'js/sistemas/bosque-combate.js', grupo: 'sistemas', node: true }, // Bosque dos Fantasmas: combate dos 4 tipos, com a mosca (Reino.BosqueCombate, camada; bosque.md §5)
      { js: 'js/sistemas/bosque-alvo.js', grupo: 'sistemas', node: true }, // Bosque dos Fantasmas: clicar no fantasma ataca sozinho até vencer (BosqueCombate.mirar; bosque.md §5)
      { js: 'js/sistemas/bosque-combate-monstros.js', grupo: 'sistemas', node: true }, // Treinadores de Monstros: ferir e capturar no combate (BosqueCombate.ferir/capturar; monstros.md §5)
      { js: 'js/sistemas/monstros-bola.js', grupo: 'sistemas', node: true }, // Treinadores de Monstros: jogar a MonsterBall (Monstros.podeJogar/jogar)
      { js: 'js/sistemas/monstros-ajuda.js', grupo: 'sistemas', node: true }, // Treinadores de Monstros: o monstro equipado ataca junto na arena
      { js: 'js/sistemas/monstros-pets.js', grupo: 'sistemas', node: true }, // o unicórnio e o ET também atacam na arena (monstros.md §5)
      { js: 'js/sistemas/bosque-desenho.js', grupo: 'sistemas' }, // Bosque dos Fantasmas: desenho dos fantasmas e da mosca, da espada, do golpe e do desmaio
      { js: 'js/sistemas/itens.js', grupo: 'sistemas', node: true }, // itens: Mochila, Baú de Guardados, vestido e o campo itens (Reino.Itens; itens.md §6, §10)
      { js: 'js/sistemas/itens-drop.js', grupo: 'sistemas', node: true }, // itens: o que cai do inimigo vencido, gravado na hora (Reino.ItensDrop; itens.md §5)
      { js: 'js/sistemas/itens-chao.js', grupo: 'sistemas', node: true }, // itens: o item no chão da arena, salta e voa até ela (só desenho; itens.md §5)
      { js: 'js/sistemas/vila-lojas.js', grupo: 'sistemas', node: true }, // Vila: as 4 lojas, comprar e vender vários, a pergunta do 4º bimestre (Reino.VilaLojas; vila.md)
      { js: 'js/sistemas/treinadores.js', grupo: 'sistemas', node: true }, // Treinadores de Monstros: comprar MonsterBalls, a pergunta antes da Kiara (Reino.Treinadores; monstros.md)
      { js: 'js/sistemas/cursiva.js', grupo: 'sistemas', node: true }, // Letra cursiva: o caminho das palavras e o dedo só no sentido certo (Reino.Cursiva; cursiva.md)
      { js: 'js/conteudo/cursiva-letras.js', grupo: 'conteudo', node: true }, // Letra cursiva: o desenho de cada letra, na ordem do traço (depois do Reino.Cursiva)
      { js: 'js/conteudo/cursiva-frases.js', grupo: 'conteudo', node: true }, // Letra cursiva: o banco de frases da loja da Kiara
      { js: 'js/sistemas/teleportadora.js', grupo: 'sistemas', node: true }, // Vila: a Teleportadora leva entre as praças (Reino.Teleportadora; vila.md)
      { js: 'js/sistemas/parquinho.js', grupo: 'sistemas', node: true }, // Parquinho: a fase (3 matérias com Matemática ou LP; todas) e o módulo da brincadeira (Reino.Parquinho; parquinho.md)
      { js: 'js/sistemas/juntos.js', grupo: 'sistemas', node: true }, // Jogar juntos: a presença ao vivo (Reino.Juntos, módulo 'juntos'; juntos.md)
      { js: 'js/sistemas/juntos-desenho.js', grupo: 'sistemas', node: true }, // Jogar juntos: o desenho dos outros jogadores (Reino.JuntosDesenho; juntos.md §7)
      { js: 'js/motor/cena.js', grupo: 'motor' },
      { js: 'js/motor/transicao.js', grupo: 'motor' },
      { js: 'js/motor/camera.js', grupo: 'motor' },
      { js: 'js/motor/laco.js', grupo: 'motor' },
      { js: 'js/motor/entrada.js', grupo: 'motor' },
      { js: 'js/motor/main.js', grupo: 'motor' },
      { js: 'js/debug.js', grupo: 'debug' },
    ],
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = MANIFESTO;
  else if (typeof window !== 'undefined') { window.Reino = window.Reino || {}; window.Reino.MANIFESTO = MANIFESTO; }
})();
