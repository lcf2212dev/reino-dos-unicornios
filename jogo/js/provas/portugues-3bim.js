/* REVISÃO BIMESTRAL DE PORTUGUÊS — 2º ano, 3º bimestre (folha da escola, 12 questões).
   Os enunciados, os itens e o texto "Salada de frutas" são os da folha, na mesma ordem.
   O que muda é só o jeito de responder: tocar, montar a frase ou completar com as letras.
   Na folha, o título da receita e os itens 8e a 8g foram escritos à mão pela professora;
   o 8h (riscado, "REPETIDA") ficou de fora e o "13.e)" impresso na questão 12 virou "e)".
   Acessórios: lendário (acertou tudo na 1ª tentativa), raro (na 2ª), comum (depois). */
(function () {
  // texto de apoio das questões 1 a 4 (mostrado acima do enunciado)
  var SALADA = {
    titulo: 'Salada de frutas',
    partes: [
      { titulo: 'Ingredientes:', lista: ['1 banana', '1 maçã', '1 mamão pequeno', '1 laranja', '1 cacho de uvas'] },
      { titulo: 'Modo de preparo:', texto: 'Lave bem as frutas. Descasque a banana, a maçã, o mamão e a laranja. Corte as frutas em pedaços pequenos. Coloque tudo em uma tigela e misture. Depois, é só servir!' },
    ],
  };

  Reino.registrarProva({
    id: 'portugues-3bim',
    materiaId: 'portugues',
    nome: 'Revisão Bimestral de Português',
    bimestre: '3º bimestre',
    emoji: '📝',
    acessorios: {
      lendario: { id: 'chapeu-chef-arco-iris', nome: 'Chapéu de Chef Arco-íris' },
      raro: { id: 'cachecol-pinguim', nome: 'Cachecol de Pinguim' },
      comum: { id: 'lacinho-morango', nome: 'Lacinho de Morango' },
    },
    questoes: [
      { id: 'pb3-01', tipo: 'frase', livro: 'receita', lerItens: true, apoio: SALADA,
        pergunta: 'Qual é o nome da receita?',
        instrucao: 'Monte a resposta com os blocos.',
        blocos: ['O nome da receita é', 'Salada', 'de frutas.'],
        explica: 'O nome da receita é o título, que vem antes de tudo: "Salada de frutas".' },

      { id: 'pb3-02', tipo: 'escolha', estilo: 'marcar-x', livro: 'receita', apoio: SALADA,
        pergunta: 'Para que serve uma receita?',
        opcoes: [
          { t: 'Para contar uma história.' },
          { t: 'Para ensinar a preparar um alimento.' },
          { t: 'Para ensinar uma brincadeira.' },
        ], certa: 1,
        explica: 'A receita ensina a preparar um alimento: diz o que usar (ingredientes) e como fazer (modo de preparo).' },

      { id: 'pb3-03', tipo: 'varias', livro: 'partes-receita', apoio: SALADA,
        pergunta: 'Quais são os ingredientes usados para preparar essa receita?',
        instrucao: 'Toque em todos.',
        opcoes: [
          { t: 'banana', ok: true },
          { t: 'morango' },
          { t: 'maçã', ok: true },
          { t: 'mamão', ok: true },
          { t: 'abacaxi' },
          { t: 'laranja', ok: true },
          { t: 'melancia' },
          { t: 'uvas', ok: true },
        ],
        explica: 'Os ingredientes estão na lista da receita: banana, maçã, mamão, laranja e uvas. Morango, abacaxi e melancia não estão lá.' },

      { id: 'pb3-04', tipo: 'escolha', estilo: 'marcar-x', livro: 'passo-a-passo', apoio: SALADA,
        pergunta: 'O que devemos fazer antes de cortar as frutas?',
        opcoes: [
          { t: 'Comer as frutas.' },
          { t: 'Lavar bem as frutas.' },
          { t: 'Colocar as frutas na geladeira.' },
        ], certa: 1,
        explica: 'O modo de preparo começa com "Lave bem as frutas". Só depois a gente descasca e corta.' },

      { id: 'pb3-05', tipo: 'completar', livro: 'letra-h',
        pergunta: 'Complete as frases com as palavras do quadro:',
        palavras: ['HOJE', 'HOSPITAL', 'HISTÓRIA', 'HORTA'],
        frases: [
          { letra: 'a', antes: '', depois: 'eu vou estudar para a prova.', certa: 0 },
          { letra: 'b', antes: 'O médico trabalha no', depois: '.', certa: 1 },
          { letra: 'c', antes: 'A professora contou uma', depois: '.', certa: 2 },
          { letra: 'd', antes: 'O menino plantou uma cenoura na', depois: '.', certa: 3 },
        ],
        explica: 'HOJE eu vou estudar. O médico trabalha no HOSPITAL. A professora contou uma HISTÓRIA. A cenoura foi plantada na HORTA. Todas começam com H, que não tem som.' },

      { id: 'pb3-06', tipo: 'varias', estilo: 'circular', livro: 'letra-h',
        pergunta: 'Circule somente as palavras que começam com H:',
        opcoes: [
          { t: 'HOJE', ok: true },
          { t: 'BOLA' },
          { t: 'HORA', ok: true },
          { t: 'CASA' },
          { t: 'HISTÓRIA', ok: true },
          { t: 'HOMEM', ok: true },
          { t: 'SAPATO' },
          { t: 'HORTA', ok: true },
        ],
        explica: 'HOJE, HORA, HISTÓRIA, HOMEM e HORTA começam com H. BOLA, CASA e SAPATO não.' },

      { id: 'pb3-07', tipo: 'completar', colado: true, livro: 'x-ou-ch',
        pergunta: 'Complete as palavras usando X ou CH:',
        palavras: ['X', 'CH'],
        frases: [
          { letra: 'a', antes: '', depois: 'ícara', certa: 0 },
          { letra: 'b', antes: 'pei', depois: 'e', certa: 0 },
          { letra: 'c', antes: 'cai', depois: 'a', certa: 0 },
          { letra: 'd', antes: '', depois: 'ave', certa: 1 },
          { letra: 'e', antes: '', depois: 'uva', certa: 1 },
          { letra: 'f', antes: '', depois: 'inelo', certa: 1 },
        ],
        explica: 'Com X: xícara, peixe e caixa. Com CH: chave, chuva e chinelo. Depois de "ei" e "ai" quase sempre vem X.' },

      { id: 'pb3-08', tipo: 'completar', colado: true, livro: 'som-de-s',
        pergunta: 'Complete as palavras usando S ou SS:',
        palavras: ['S', 'SS'],
        frases: [
          { letra: 'a', antes: 'PA', depois: 'ARINHO', certa: 1 },
          { letra: 'b', antes: 'MA', depois: 'A', certa: 1 },
          { letra: 'c', antes: 'PA', depois: 'EIO', certa: 1 },
          { letra: 'd', antes: 'O', depois: 'O', certa: 1 },
          { letra: 'e', antes: 'CA', depois: 'A', certa: 0, aceitas: [1] },      // casa (e cassa, o tecido)
          { letra: 'f', antes: '', depois: 'AIA', certa: 0 },
          { letra: 'g', antes: 'CA', depois: 'ACO', certa: 0, aceitas: [1] },    // casaco (e cassaco, palavra regional)
        ],
        explica: 'Entre duas vogais, SS tem som de S: passarinho, massa, passeio, osso. Um S só, entre vogais, tem som de Z: casa, casaco. No começo da palavra é um S só: saia.' },

      { id: 'pb3-09', tipo: 'completar', colado: true, livro: 'sons-do-x',
        pergunta: 'Complete as palavras com X ou Z:',
        palavras: ['X', 'Z'],
        frases: [
          { letra: 'a', antes: 'E', depois: 'AME', certa: 0 },
          { letra: 'b', antes: 'E', depois: 'EMPLO', certa: 0 },
          { letra: 'c', antes: 'DO', depois: 'E', certa: 1 },
          { letra: 'd', antes: '', depois: 'EBRA', certa: 1 },
        ],
        explica: 'Exame e exemplo se escrevem com X, mesmo com som de Z. Doze e zebra se escrevem com Z.' },

      { id: 'pb3-10', tipo: 'completar', colado: true, livro: 'digrafos',
        pergunta: 'Escreva o nome das imagens, classificando corretamente:',
        instrucao: 'Toque em CH, LH ou NH para completar cada nome.',
        palavras: ['CH', 'LH', 'NH'],
        frases: [   // na ordem em que as figuras aparecem na folha
          { img: 'palavra:quinhentos', alt: 'o número 500', antes: 'QUI', depois: 'ENTOS', certa: 2 },
          { img: 'palavra:mochila', alt: 'mochila', antes: 'MO', depois: 'ILA', certa: 0 },
          { img: 'palavra:palhaco', alt: 'palhaço', antes: 'PA', depois: 'AÇO', certa: 1 },
          { img: 'palavra:coelho', alt: 'coelho', antes: 'COE', depois: 'O', certa: 1 },
          { img: 'palavra:ovelha', alt: 'ovelha', antes: 'OVE', depois: 'A', certa: 1 },
          { img: 'palavra:chave', alt: 'chave', antes: '', depois: 'AVE', certa: 0 },
          { img: 'palavra:pinheiro', alt: 'pinheiro', antes: 'PI', depois: 'EIRO', certa: 2 },
          { img: 'palavra:golfinho', alt: 'golfinho', antes: 'GOLFI', depois: 'O', certa: 2 },
          { img: 'palavra:chupeta', alt: 'chupeta', antes: '', depois: 'UPETA', certa: 0 },
          { img: 'palavra:aranha', alt: 'aranha', antes: 'ARA', depois: 'A', certa: 2 },
          { img: 'palavra:cachecol', alt: 'cachecol', antes: 'CA', depois: 'ECOL', certa: 0 },
          { img: 'palavra:dinheiro', alt: 'dinheiro', antes: 'DI', depois: 'EIRO', certa: 2 },
          { img: 'palavra:cachorro', alt: 'cachorro', antes: 'CA', depois: 'ORRO', certa: 0 },
          { img: 'palavra:chocolate', alt: 'chocolate', antes: '', depois: 'OCOLATE', certa: 0 },
          { img: 'palavra:folha', alt: 'folha', antes: 'FO', depois: 'A', certa: 1 },
          { img: 'palavra:ninho', alt: 'ninho', antes: 'NI', depois: 'O', certa: 2 },
          { img: 'palavra:olho', alt: 'olho', antes: 'O', depois: 'O', certa: 1 },
          { img: 'palavra:milho', alt: 'milho', antes: 'MI', depois: 'O', certa: 1 },
        ],
        explica: 'Com CH: cachorro, chocolate, chupeta, chave, mochila e cachecol. Com LH: palhaço, milho, folha, olho, coelho e ovelha. Com NH: ninho, quinhentos, golfinho, dinheiro, pinheiro e aranha.' },

      { id: 'pb3-11', tipo: 'copiar', livro: 'som-de-s',
        pergunta: 'Escolha a escrita correta e copie a palavra:',
        instrucao: 'Toque na escrita certa e depois monte a palavra tocando nas letras.',
        itens: [
          { letra: 'a', opcoes: ['PASEIO', 'PASSEIO'], certa: 1 },
          { letra: 'b', opcoes: ['EXAME', 'EZAME'], certa: 0 },
          { letra: 'c', opcoes: ['DESENHO', 'DEZENHO'], certa: 0 },
        ],
        explica: 'PASSEIO tem SS, porque o som de S fica entre vogais. EXAME se escreve com X, mesmo com som de Z. DESENHO tem um S só, com som de Z.' },

      { id: 'pb3-12', tipo: 'completar', colado: true, livro: 'r-rr',
        pergunta: 'Complete as palavras usando R ou RR:',
        palavras: ['R', 'RR'],
        frases: [
          { letra: 'a', antes: 'CA', depois: 'O', certa: 1, aceitas: [0] },      // carro (e caro)
          { letra: 'b', antes: 'BA', depois: 'IGA', certa: 1 },
          { letra: 'c', antes: 'CA', depois: 'ETA', certa: 0, aceitas: [1] },    // careta (e carreta)
          { letra: 'd', antes: '', depois: 'ATO', certa: 0 },
          { letra: 'e', antes: 'CO', depois: 'IDA', certa: 1 },
          { letra: 'f', antes: 'FE', depois: 'O', certa: 1, aceitas: [0] },      // ferro (e fero, que quer dizer feroz)
        ],
        explica: 'Entre vogais, o som forte do R se escreve com RR: carro, barriga, corrida, ferro. No começo da palavra, um R só já tem som forte: rato. Careta tem som fraco, com um R só.' },
    ],
  });
})();
