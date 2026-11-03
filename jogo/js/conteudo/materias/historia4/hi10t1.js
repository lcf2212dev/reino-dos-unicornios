/* Sala hi10t1 (Livro de Atividades, capítulo 10, pp. 1, 2 e 4): a palavra secreta, os trabalhos de casa e a
   canção Profissões, do astronauta (docs/contratos/quarto-bimestre.md §3). A p. 3 não está no PDF (fora do
   inventário e do jogo). Emoji 🧹: o 🔨 da divisão proposta é o da sala hi11a3. */
(function () {
  var CANCAO = { titulo: 'Profissões', partes: [{ versos: ['QUANDO VOCÊ CRESCER', 'DIZ AÍ O QUE VOCÊ QUER SER', '[...]',
    'SE NA LUA QUER PISAR', 'DE FOGUETE VIAJAR', 'VOAR PELA VIA LÁCTEA', 'TEM QUE SER ASTRONAUTA', '[...]'] }] };
  var SIMBOLOS = ['flor', 'gota', 'circulo', 'quadrado', 'circulo', 'losango', 'triangulo', 'estrela'];
  var LEGENDA = { titulo: 'Palavra secreta', partes: [
    { titulo: 'Os símbolos', figuras: SIMBOLOS.map(function (s, i) { return { img: 'hi:10-' + s, legenda: String(i + 1) }; }) },
    { titulo: 'Legenda', figuras: [
      { img: 'hi:10-circulo', legenda: 'A' }, { img: 'hi:10-quadrado', legenda: 'B' }, { img: 'hi:10-triangulo', legenda: 'H' },
      { img: 'hi:10-losango', legenda: 'L' }, { img: 'hi:10-estrela', legenda: 'O' }, { img: 'hi:10-gota', legenda: 'R' },
      { img: 'hi:10-flor', legenda: 'T' },
    ] },
  ] };
  Reino.registrarSala('historia4',
    {
      id: 'hi10t1', nome: 'Trabalhos de cada dia', emoji: '🧹',
      livroOrigem: 'atividades', capitulo: 10, paginas: 'pp. 1, 2 e 4', ordem: 'livro',
      cartas: ['hi-t01', 'hi-t02', 'hi-t04'],
      intro: 'Vamos descobrir uma palavra secreta, lembrar os trabalhos de casa e cantar sobre o astronauta!',
      desafios: [
        { id: 'hi10t1-01', tipo: 'digitar', origem: 'ATI-01-q1a', pagina: 1, livro: 'hi-t01', apoio: LEGENDA,
          pergunta: 'Troque os símbolos pelas letras da legenda e descubra a palavra secreta.',
          frases: [
            { antes: '', depois: '', certas: ['trabalho', 'TRABALHO'] },
          ],
          adaptacao: 'As 8 caixinhas, uma por símbolo, viraram uma caixa só para a palavra inteira.',
          explica: 'A palavra secreta é TRABALHO!' },
        { id: 'hi10t1-02', tipo: 'escrever', origem: 'ATI-01-q1b', pagina: 1, livro: 'hi-t01',
          pergunta: 'Escreva, como souber, o que significa a palavra que você descobriu.',
          linhas: 2, minPalavras: 3,
          modelo: 'Trabalho é tudo o que as pessoas fazem para produzir alguma coisa, cuidar ou ajudar em algo.',
          explica: 'Trabalho é o que fazemos para produzir, cuidar ou ajudar. Pode ser em casa ou num emprego!' },
        { id: 'hi10t1-03', tipo: 'desenho', origem: 'ATI-01-q2a', pagina: 1, livro: 'hi-t01', guardar: true,
          pergunta: 'Desenhe um tipo de trabalho em que as pessoas precisam usar mais esforço físico.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O quadro em branco do livro virou a prancheta de desenho do jogo.',
          explica: 'Que força! Pedreiros, agricultores e bombeiros usam muito o corpo no trabalho.' },
        { id: 'hi10t1-04', tipo: 'desenho', origem: 'ATI-01-q2b', pagina: 1, livro: 'hi-t01', guardar: true,
          pergunta: 'Desenhe um tipo de trabalho em que as pessoas precisam usar mais criatividade.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O quadro em branco do livro virou a prancheta de desenho do jogo.',
          explica: 'Que criativo! Pintores, músicos e escritores usam muito a imaginação.' },
        { id: 'hi10t1-05', tipo: 'ligar', origem: 'ATI-02-q3', pagina: 2, livro: 'hi-t02',
          instrucao: 'Ligue cada cena ao trabalho.',
          pergunta: 'Observe as cenas a seguir e escreva, como souber, quais trabalhos as pessoas estão fazendo.',
          pares: [
            [{ img: '🧺', alt: 'Cena 1: roupas, bacia e máquina de lavar' }, { t: 'lavar a roupa' }],
            [{ img: '🧹', alt: 'Cena 2: aspirador de pó e esfregão' }, { t: 'limpar a casa' }],
            [{ img: '🌱', alt: 'Cena 3: vaso e regador' }, { t: 'regar as plantas' }],
            [{ img: 'hi:10-ferro', alt: 'Cena 4: ferro e tábua de passar' }, { t: 'passar a roupa' }],
          ],
          adaptacao: 'Escrever o trabalho embaixo de cada cena virou ligar a cena ao trabalho.',
          explica: 'Lavar a roupa, limpar a casa, regar as plantas e passar a roupa: trabalhos que deixam o lar organizado e limpo.' },
        { id: 'hi10t1-06', tipo: 'escrever', origem: 'ATI-02-q4', pagina: 2, livro: 'hi-t02',
          pergunta: 'Escreva dois trabalhos que você faz em casa e que não apareceram na atividade anterior.',
          linhas: 2, minPalavras: 2,
          modelo: 'Arrumar a cama e guardar os brinquedos.',
          explica: 'Que ajudante! Arrumar a cama, pôr a mesa e guardar os brinquedos também são trabalhos de casa.' },
        { id: 'hi10t1-07', tipo: 'digitar', origem: 'ATI-04-q2a', pagina: 4, livro: 'hi-t04', apoio: CANCAO,
          pergunta: 'Leia o trecho de música a seguir. a) Qual é a profissão que foi citada no trecho da música?',
          frases: [
            { antes: '', depois: '', certas: ['astronauta', 'o astronauta', 'a astronauta'] },
          ],
          explica: 'A canção fala do astronauta, que viaja de foguete pela Via Láctea.' },
        { id: 'hi10t1-08', tipo: 'digitar', origem: 'ATI-04-q2b', pagina: 4, livro: 'hi-t04', apoio: CANCAO,
          pergunta: 'b) Qual é o meio de transporte usado por esse profissional para realizar seu trabalho?',
          frases: [
            { antes: '', depois: '', certas: ['foguete', 'o foguete', 'um foguete', 'de foguete'] },
          ],
          explica: 'O astronauta viaja de foguete!' },
        { id: 'hi10t1-09', tipo: 'varias', origem: 'ATI-04-q2c', pagina: 4, livro: 'hi-t04',
          pergunta: 'c) Pesquise e escreva o nome de duas outras profissões que também estão relacionadas com o espaço. Toque em TODAS as que são do espaço.',
          opcoes: [
            { img: '🔭', t: 'astrônomo', ok: true },
            { img: '🍲', t: 'cozinheiro' },
            { img: '🛰', t: 'engenheiro aeroespacial', ok: true },
            { img: '✉', t: 'carteiro' },
            { img: '🧑‍🔬', t: 'cientista espacial', ok: true },
            { img: '✂', t: 'cabeleireiro' },
          ],
          adaptacao: 'A pesquisa virou tocar nas profissões ligadas ao espaço.',
          explica: 'O astrônomo estuda as estrelas, o engenheiro aeroespacial constrói foguetes e satélites e o cientista espacial pesquisa o espaço.' },
        { id: 'hi10t1-10', tipo: 'digitar', livre: true, origem: 'ATI-04-q2d', pagina: 4, livro: 'hi-t04',
          pergunta: 'd) E você, qual profissão quer seguir quando crescer? Escreva, como souber, o nome dessa profissão.',
          frases: [
            { antes: '', depois: '' },
          ],
          explica: 'Que sonho lindo! Você pode ser o que quiser.' },
        { id: 'hi10t1-11', tipo: 'escrever', origem: 'ATI-04-q2e', pagina: 4, livro: 'hi-t04',
          pergunta: 'e) Quais ferramentas as pessoas usam na profissão que você escolheu?',
          linhas: 2, minPalavras: 1,
          modelo: 'O médico usa o estetoscópio e o termômetro.',
          explica: 'Cada profissão tem as suas ferramentas. Que bom que você pensou nelas!' },
      ],
    });
})();
