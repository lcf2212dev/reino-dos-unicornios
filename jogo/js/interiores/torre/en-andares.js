/* Torre do Relógio do English (4º bimestre), os andares de cima: um por capítulo, na ordem do livro, com o anfitrião
   do capítulo e as estações das salas (geradas dos dados em torre/torre.js, nas vagas (3,3), (7,3), (3,7) e (7,7):
   aqui, o tile de cima de cada vaga e o (3,5) do anfitrião ficam livres, e o tile de baixo de cada vaga só com objeto
   baixo (topo ≤ 3) ou livre: não cobre o pé da estação), e o mecanismo do relógio no alto.
   Usa de Reino._predios.torre (torre/torre.js): andar, andarDoCapitulo, inter e cartaz. */
(function () {
  var R = window.Reino;
  var S = R._predios.torre;
  // sem a matéria do 4º bimestre o torre.js não monta a torre (fixture histórica dos testes: layout arquivado)
  if (!S || !S.andarDoCapitulo) return;
  var C = R.Interiores.desenho.C;
  var andar = S.andar, andarDoCapitulo = S.andarDoCapitulo, inter = S.inter, cartaz = S.cartaz;
  var BRONZE2 = S.BRONZE2;

  /* ---------- ANDAR 1: English, capítulo 10 «If You're Happy, Clap Your Hands» (sentimentos: sala de música) ---------- */
  andarDoCapitulo(1, '«If You\'re Happy, Clap Your Hands»', {
    placa: 'Cap. 10 • «Clap Your Hands»', piso: 'mosaico', parede: 'papel',
    paleta: { piso: '#fff0f6', piso2: '#ffc2d8', detalhe: '#ffd34d', parede: '#fff6d8', parede2: '#ffc2d8', rodape: '#ff4f9a' },
  }, [
    { tipo: 'janela', x: 0, y: 0 },
    inter('carinhas', 'Cartaz das carinhas', { tipo: 'torre-carinhas', x: 1, y: 0 }),
    cartaz(3, 'feliz', '#fff8ee', C.rosa), { tipo: 'bandeirinhas', x: 4, y: 0 }, cartaz(6, 'nota', '#fff8ee', C.ouro),
    { tipo: 'torre-palavra', x: 7, y: 0, var: { palavra: 'HAPPY', faixa: C.rosa, icone: 'feliz' } }, { tipo: 'janela', x: 10, y: 0 },
    { tipo: 'flores', x: 0, y: 2 }, { tipo: 'torre-blocos-abc', x: 1, y: 2 },
    inter('piano', 'Piano', { tipo: 'torre-piano', x: 0, y: 4 }),
    { tipo: 'sofa', x: 0, y: 6, var: { cor: '#ffd34d' } },
    inter('pandeiro', 'Pandeiro', { tipo: 'torre-pandeiro', x: 0, y: 7 }), { tipo: 'almofada', x: 1, y: 7, var: { cor: '#5fb4ff' } },
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#ff7eb6', '#ffd34d', '#5fb4ff', '#6fdc8c'] } },
    { tipo: 'torre-pandeiro', x: 3, y: 8 }, { tipo: 'vaso-planta', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'estrela' } }, { tipo: 'bau', x: 1, y: 10 }, { tipo: 'flores', x: 2, y: 10 },
    { tipo: 'torre-mochila', x: 3, y: 10, var: { cor: '#ff7eb6' } },
    { tipo: 'flores', x: 10, y: 2 },
    { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffc2d8', itens: ['bolo', 'xicara'] } }, { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#ffd34d' } },
    { tipo: 'torre-tapete-palavras', x: 8, y: 6, w: 2, h: 2, var: { palavra: 'SING', cor: '#ffd34d' } }, { tipo: 'torre-blocos-abc', x: 10, y: 6 },
    { tipo: 'torre-caixa-brinquedos', x: 8, y: 8, var: { cor: '#ff7eb6' } }, { tipo: 'cavalete', x: 10, y: 8 },
    { tipo: 'torre-pandeiro', x: 7, y: 10 }, { tipo: 'torre-tapete-palavras', x: 8, y: 10, w: 2, h: 1, var: { palavra: 'HI', cor: '#ffc2d8' } },
    { tipo: 'almofada', x: 10, y: 10, var: { cor: '#ff7eb6' } },
  ], 'joy', 'estrela');

  /* ---------- ANDAR 2: English, capítulo 11 «I Dance When I'm Happy!» (ações, abrigo de animais e alfabeto) ---------- */
  andarDoCapitulo(2, '«I Dance When I\'m Happy!»', {
    placa: 'Cap. 11 • «I Dance!»', piso: 'tabuas', parede: 'tijolo',
    paleta: { piso: '#f0c88a', piso2: '#d9a45e', parede: '#ffb070', parede2: '#e8884a', rodape: '#2f4f8a', detalhe: '#ffffff' },
  }, [
    { tipo: 'janela', x: 0, y: 0 },
    inter('alfabeto', 'Cartaz do alfabeto', { tipo: 'escola-alfabeto', x: 1, y: 0 }),
    cartaz(3, 'apito', '#fff8ee', C.ouro),
    { tipo: 'torre-palavra', x: 4, y: 0, var: { palavra: 'DANCE', faixa: C.laranja, icone: 'feliz' } },
    { tipo: 'relogio-parede', x: 6, y: 0 }, { tipo: 'petshop-placa-patinha', x: 7, y: 0 },
    cartaz(10, 'estrela', '#fff8ee', C.azul),
    { tipo: 'torre-caixa-brinquedos', x: 0, y: 2, var: { cor: '#ff8a3d' } },
    inter('trave', 'Trave de futebol', { tipo: 'torre-trave', x: 0, y: 4 }),
    { tipo: 'torre-mochila', x: 0, y: 6, var: { cor: '#5fb4ff' } }, { tipo: 'lp-bola', x: 1, y: 6 }, { tipo: 'cesto', x: 0, y: 7 },
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#6fdc8c', '#ffffff', '#6fdc8c', '#ffffff'] } },
    { tipo: 'lp-pufe', x: 3, y: 8 }, { tipo: 'pilha-livros', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'medalha' } }, { tipo: 'torre-tapete-palavras', x: 1, y: 10, var: { palavra: 'ABC', cor: '#ffc896' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'torre-blocos-abc', x: 3, y: 10 },
    { tipo: 'petshop-potes-biscoito', x: 10, y: 2 },
    inter('casinha', 'Casinha do cachorro', { tipo: 'petshop-casinha', x: 8, y: 4 }), { tipo: 'lab-cachorro', x: 10, y: 4 },
    { tipo: 'petshop-tapete-patinhas', x: 8, y: 6 },
    { tipo: 'petshop-estante-comida', x: 8, y: 9 }, { tipo: 'lp-hamster', x: 10, y: 9 },
    { tipo: 'torre-tapete-palavras', x: 8, y: 10, w: 2, h: 1, var: { palavra: 'DOG', cor: '#ffc896' } },
    { tipo: 'flores', x: 10, y: 10 },
  ], 'ben', 'medalha');

  /* ---------- ANDAR 3: English, capítulo 12 «Book Time» (tempo, roupas, tempo livre e rotina: o quarto) ---------- */
  andarDoCapitulo(3, '«Book Time»', {
    placa: 'Cap. 12 • «Book Time»', piso: 'taco', parede: 'papel',
    paleta: { piso: '#e8c49a', piso2: '#caa078', parede: '#efe2fb', parede2: '#ffe28a', rodape: '#7c5cff' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'lp-nuvem', x: 1, y: 0 },
    { tipo: 'torre-cartaz', x: 3, y: 0, var: { icone: 'sol', palavra: 'SUN', faixa: C.ouro } },
    inter('rotina', 'O dia na parede', { tipo: 'torre-rotina', x: 4, y: 0 }),
    { tipo: 'torre-palavra', x: 7, y: 0, var: { palavra: 'RAIN', faixa: C.azul, icone: 'chuveiro' } }, { tipo: 'lp-relampago', x: 10, y: 0 },
    inter('cama', 'Cama', { tipo: 'torre-cama', x: 0, y: 2 }),
    { tipo: 'armario', x: 0, y: 4 },
    { tipo: 'poltrona', x: 0, y: 6, var: { cor: '#9b7bff' } }, { tipo: 'luminaria-pe', x: 1, y: 6 }, { tipo: 'pilha-livros', x: 0, y: 7 },
    { tipo: 'torre-tapete-palavras', x: 0, y: 8, w: 2, h: 1, var: { palavra: 'HOT', cor: '#ffe066' } }, { tipo: 'torre-mochila', x: 2, y: 8, var: { cor: '#b58cff' } },
    { tipo: 'cesto', x: 0, y: 9 },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'ursinho' } }, { tipo: 'lp-bola', x: 2, y: 10 },
    { tipo: 'geografia-tv', x: 3, y: 10 },
    { tipo: 'torre-relogio-sol', x: 10, y: 2 },
    { tipo: 'escrivaninha', x: 8, y: 4 }, inter('protetor', 'Protetor solar', { tipo: 'torre-protetor', x: 10, y: 4 }),
    inter('roupas', 'Arara de roupas', { tipo: 'salao-arara', x: 8, y: 6 }),
    { tipo: 'poltrona', x: 7, y: 9, var: { cor: '#9b7bff' } }, { tipo: 'sofa', x: 8, y: 9, var: { cor: '#9b7bff' } }, { tipo: 'planta-alta', x: 10, y: 9 },
    { tipo: 'papeis', x: 7, y: 10 }, { tipo: 'torre-tapete-palavras', x: 8, y: 10, w: 2, h: 1, var: { palavra: 'HAT', cor: '#d8c4ff' } },
    { tipo: 'torre-blocos-abc', x: 10, y: 10 },
  ], 'stella', 'relogio');

  /* ---------- ANDAR 4: Projetos, capítulo 11 «Be Kind!» (diferenças, empatia e a caixa da gentileza) ---------- */
  andarDoCapitulo(4, '«Be Kind!»', {
    placa: 'Projetos 11 • «Be Kind!»', piso: 'carpete', parede: 'papel',
    paleta: { piso: '#ffe2d2', piso2: '#f6c4ac', parede: '#fff3e6', parede2: '#ffc2a8', rodape: '#e0433f', detalhe: '#ff7eb6' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-torcida' } },
    cartaz(3, 'mao', '#fff8ee', C.azul),
    { tipo: 'torre-palavra', x: 4, y: 0, var: { palavra: 'KIND', faixa: C.rosa, icone: 'coracao' } },
    inter('amigos', 'Cartaz dos amigos', cartaz(6, 'amigos', '#fff8ee', C.verde)),
    { tipo: 'bandeirinhas', x: 7, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
    { tipo: 'flores', x: 0, y: 2 }, { tipo: 'cesto', x: 1, y: 2 },
    { tipo: 'mesa', x: 0, y: 4, var: { toalha: '#ffc2d8', itens: ['bule', 'bolo'] } },
    inter('gentileza', 'Caixa da gentileza', { tipo: 'museu-caixinha', x: 2, y: 4 }),
    { tipo: 'sofa', x: 0, y: 6, var: { cor: '#ff7eb6' } }, { tipo: 'almofada', x: 0, y: 7, var: { cor: '#ffd34d' } },
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#ff7eb6', '#ffffff', '#ffd34d', '#ffffff'] } },
    { tipo: 'lp-pufe', x: 3, y: 8 }, { tipo: 'torre-mochila', x: 0, y: 9, var: { cor: '#6fdc8c' } },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'torre-tapete-palavras', x: 1, y: 10, var: { palavra: 'HI', cor: '#ffc2d8' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'museu-caixa-correio', x: 3, y: 10 },
    { tipo: 'flores', x: 10, y: 2 },
    inter('brinquedos', 'Caixa de brinquedos', { tipo: 'torre-caixa-brinquedos', x: 8, y: 4, var: { cor: '#5fb4ff' } }),
    { tipo: 'vaso-planta', x: 10, y: 4 },
    { tipo: 'tapete', x: 8, y: 6, w: 3, h: 2, var: { cor: '#ffc2d8', borda: '#ffffff' } },
    { tipo: 'poltrona', x: 7, y: 9, var: { cor: '#ffd34d' } }, { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'planta-alta', x: 10, y: 9 },
    { tipo: 'torre-tapete-palavras', x: 8, y: 10, w: 2, h: 1, var: { palavra: 'NICE', cor: '#ffe066' } }, { tipo: 'flores', x: 10, y: 10 },
  ], 'moon', 'coroa');

  /* ---------- ANDAR 5: Projetos, capítulo 12 «I Have a Healthy Diet!» (comida, de onde ela vem e gráficos) ---------- */
  andarDoCapitulo(5, '«I Have a Healthy Diet!»', {
    placa: 'Projetos 12 • «Healthy Diet!»', piso: 'azulejo', parede: 'azulejo',
    paleta: { piso: '#eef8ff', piso2: '#bfe3f7', detalhe: '#5fb4ff', parede: '#e6f6ff', parede2: '#9fdcff', rodape: '#2f6fa8' },
  }, [
    { tipo: 'janela', x: 0, y: 0 },
    inter('grafico', 'Gráfico das comidas', { tipo: 'matematica-grafico', x: 1, y: 0 }),
    cartaz(3, 'maca', '#fff8ee', C.verde),
    { tipo: 'torre-palavra', x: 4, y: 0, var: { palavra: 'HEALTHY', faixa: C.verde, icone: 'maca' } },
    cartaz(6, 'dente', '#fff8ee', C.agua), { tipo: 'prateleira-parede', x: 7, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
    { tipo: 'portugues-cesta-frutas', x: 0, y: 2 }, { tipo: 'estabulo-cenouras', x: 1, y: 2 },
    { tipo: 'quimica-mesa-cozinha', x: 0, y: 4 }, inter('salada', 'Salada', { tipo: 'portugues-salada', x: 2, y: 4 }),
    { tipo: 'portugues-geladeira', x: 0, y: 6 }, { tipo: 'quimica-fruteira', x: 1, y: 6 }, { tipo: 'petshop-cesta-macas', x: 0, y: 7 },
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 2, h: 1, var: { cores: ['#6fdc8c', '#ffffff', '#ff7a5a', '#ffffff'] } },
    { tipo: 'portugues-liquidificador', x: 2, y: 8 },
    { tipo: 'torre-tapete-palavras', x: 3, y: 8, var: { palavra: 'YUM', cor: '#7ed9c8' } },
    { tipo: 'vaso-planta', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'planta' } }, { tipo: 'torre-tapete-palavras', x: 1, y: 10, var: { palavra: 'EAT', cor: '#7ed9c8' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'portugues-abacaxi', x: 3, y: 10 },
    { tipo: 'flores', x: 10, y: 2 },
    inter('horta', 'Horta', { tipo: 'portugues-canteiro', x: 8, y: 4 }), { tipo: 'portugues-regador', x: 10, y: 4 },
    { tipo: 'portugues-leira', x: 8, y: 6 },
    inter('pia', 'Pia', { tipo: 'torre-pia', x: 8, y: 9 }), { tipo: 'torre-escova', x: 9, y: 9 }, { tipo: 'torre-sabonetes', x: 10, y: 9 },
    { tipo: 'torre-tapete-palavras', x: 8, y: 10, w: 2, h: 1, var: { palavra: 'GOOD', cor: '#7ed9c8' } },
    { tipo: 'flores', x: 10, y: 10 },
  ], 'smile', 'vaso');

  /* ---------- NO ALTO: o mecanismo do relógio (sem personagem) ---------- */
  andar(6, 'O Relógio', {
    placa: 'No alto • O Relógio', piso: 'tabuas', parede: 'pedra',
    paleta: { piso: '#b98a5e', piso2: '#8f6440', parede: '#d8ccb8', parede2: '#b8a888', rodape: BRONZE2, detalhe: C.ouro },
  }, [
    { tipo: 'torre-engrenagem-grande', x: 0, y: 0 }, { tipo: 'arandela', x: 2, y: 0 },
    { tipo: 'torre-engrenagem-grande', x: 3, y: 0, var: { sentido: -1 } }, { tipo: 'arandela', x: 5, y: 0 }, { tipo: 'janela', x: 6, y: 0 },
    { tipo: 'arandela', x: 7, y: 0 },
    inter('mostrador', 'Mostrador do relógio', { tipo: 'torre-mostrador', x: 8, y: 0 }),
    inter('pendulo', 'Pêndulo', { tipo: 'torre-pendulo', x: 1, y: 2, junto: true }),
    { tipo: 'torre-caixa-pecas', x: 0, y: 3 }, { tipo: 'flores', x: 0, y: 2 },
    inter('engrenagem-grande', 'Engrenagens do relógio', { tipo: 'torre-maquina', x: 2, y: 3 }),
    { tipo: 'caixote', x: 0, y: 5, var: { item: 'relogio' } }, { tipo: 'torre-caixa-pecas', x: 3, y: 5 },
    { tipo: 'torre-tapete-palavras', x: 1, y: 6, w: 2, h: 2, var: { palavra: 'TOCK', cor: '#d9a86a' } },
    { tipo: 'bau', x: 0, y: 7 }, { tipo: 'caixote', x: 3, y: 8 },
    { tipo: 'torre-blocos-abc', x: 0, y: 9 },
    { tipo: 'torre-caixa-pecas', x: 0, y: 10 }, { tipo: 'caixote', x: 2, y: 10 }, { tipo: 'papeis', x: 3, y: 10 },
    inter('sino', 'Sino da torre', { tipo: 'torre-sino', x: 10, y: 4 }),
    { tipo: 'torre-maquina', x: 7, y: 4 },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#c98a4b', borda: C.ouro } },
    { tipo: 'luminaria-pe', x: 10, y: 6 },
    { tipo: 'mesa', x: 8, y: 8, var: { toalha: '#e8dcc8', itens: ['relogio', 'moedas'] } }, { tipo: 'cadeira', x: 10, y: 8 },
    { tipo: 'torre-engrenagens', x: 7, y: 10 }, { tipo: 'relogio-pe', x: 10, y: 10 },
  ], []);
})();
