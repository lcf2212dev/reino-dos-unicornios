/* REVISÃO BIMESTRAL DE CIÊNCIAS — 2º ano, 3º bimestre (folha da escola, 11 questões).
   Os enunciados e as alternativas são os da folha, na mesma ordem. O que muda é só o jeito de responder:
   tocar, pôr em ordem ou completar com as palavras (as questões 03 e 04 são pessoais: qualquer ser da lista vale).
   Na folha as respostas foram escritas à mão pela Mariana: não são gabarito (o gabarito vem da apostila, cap. 8 e 9).
   Acessórios: lendário (acertou tudo na 1ª tentativa), raro (na 2ª), comum (depois), com desenho e ícone aqui mesmo. */
(function () {
  // as situações das questões 07 e 11 (na folha vêm num quadro, acima das perguntas)
  function situacao(texto) { return { titulo: 'Situação', partes: [{ texto: texto }] }; }

  // a professora da prova (docs/contratos/npcs-e-dialogo.md §5): voz brasileira que nenhuma outra professora usa
  Reino.registrarPersonagem({ id: 'prof-flora', nome: 'Professora Flora', paraProva: 'ciencias-3bim',
    sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', roupa: '#39a860', roupa2: '#6b4a9a', perna: 'saia' },
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '-2%', tom: '+6Hz' } });

  Reino.registrarProva({
    id: 'ciencias-3bim',
    materiaId: 'ciencias',
    nome: 'Revisão Bimestral de Ciências',
    bimestre: '3º bimestre',
    emoji: '🔬',
    acessorios: {
      lendario: { id: 'oculos-cientista', nome: 'Óculos de Cientista',
        desenho: { linhas: ['.yyy.yyy.', 'ywbbybwby', 'ybbbkbbby', '.yyy.yyy.'], paleta: { k: '#3a2446', y: '#ffd34d', b: '#7fd6ff', w: '#ffffff' }, ancora: 'olho', dx: -4, dy: -1 },
        icone: { n: 'Óculos de Cientista', p: { k: '#3a2446', y: '#ffd34d', b: '#7fd6ff', w: '#ffffff' },
          d: [
            '................',
            '................',
            '................',
            '................',
            '..yyyy....yyyy..',
            '.ywwbby..ywwbby.',
            'kywbbbyyyywbbbyk',
            'kybbbbykkybbbbyk',
            '.ybbbby..ybbbby.',
            '..yyyy....yyyy..',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
          ] } },
      raro: { id: 'lupa-exploradora', nome: 'Lupa de Exploradora',
        desenho: { linhas: ['.kkk..', 'kbwbk.', 'kbbbk.', '.kkkm.', '....mm'], paleta: { k: '#3a2446', b: '#9fd8ff', w: '#ffffff', m: '#8a5a2b' }, ancora: 'pescoco', dx: -2, dy: 0 },
        icone: { n: 'Lupa de Exploradora', p: { k: '#3a2446', b: '#9fd8ff', w: '#ffffff', m: '#8a5a2b' },
          d: [
            '................',
            '....kkkkk.......',
            '...kbbbbbk......',
            '..kbwwbbbbk.....',
            '..kbwbbbbbk.....',
            '..kbbbbbbbk.....',
            '..kbbbbbbbk.....',
            '...kbbbbbk......',
            '....kkkkkm......',
            '.........mm.....',
            '..........mm....',
            '...........mm...',
            '............mm..',
            '.............m..',
            '................',
            '................',
          ] } },
      comum: { id: 'broto-cabeca', nome: 'Brotinho na Cabeça',
        desenho: { linhas: ['.kk.kk.', 'kgGkGgk', '.kkGkk.', '..kGk..'], paleta: { k: '#3a2446', g: '#6fdc8c', G: '#2f9e55' }, ancora: 'cabeca', dx: -3, dy: -4 },
        icone: { n: 'Brotinho na Cabeça', p: { k: '#3a2446', g: '#6fdc8c', G: '#2f9e55', m: '#8a5a2b' },
          d: [
            '................',
            '................',
            '...kkk....kkk...',
            '..kgggk..kgggk..',
            '.kgGggkkkggGgk..',
            '.kggGGkGkGGggk..',
            '..kkkkkGkkkkk...',
            '......kGk.......',
            '......kGk.......',
            '......kGk.......',
            '....mmmmmmm.....',
            '...mmmmmmmmm....',
            '................',
            '................',
            '................',
            '................',
          ] } },
    },
    questoes: [
      { id: 'cb3-01', tipo: 'escolha', estilo: 'marcar-x', livro: 'seres-vivos',
        pergunta: 'O que são seres vivos? Assinale a alternativa correta:',
        opcoes: [
          { t: 'Coisas que não se movem e não precisam de nada para existir.' },
          { t: 'Seres que nascem, crescem, se alimentam, se reproduzem e morrem.' },
          { t: 'Objetos fabricados pelas pessoas, como carros e brinquedos.' },
        ], certa: 1,
        explica: 'Seres vivos nascem, crescem, se alimentam, se reproduzem e morrem. Carros e brinquedos são feitos pelas pessoas e não são vivos.' },

      { id: 'cb3-02', tipo: 'vfLista', rotulos: ['V', 'F'], livro: 'seres-vivos',
        pergunta: 'Marque V para verdadeiro e F para falso:',
        itens: [
          { t: 'Os seres vivos nascem, crescem e morrem.', v: true },
          { t: 'Os seres vivos não precisam de água para viver.', v: false },
          { t: 'Todos os seres vivos respiram.', v: true },
          { t: 'As pedras e os brinquedos são seres vivos.', v: false },
          { t: 'Os seres vivos podem se reproduzir, ou seja, gerar filhotes ou sementes.', v: true },
        ],
        explica: 'Todo ser vivo precisa de água, então a segunda é falsa (F). Pedras e brinquedos não são vivos: falsa (F). As outras são verdadeiras (V).' },

      { id: 'cb3-03', tipo: 'completar', livre: true, livro: 'seres-vivos',
        pergunta: 'Escreva três exemplos de seres vivos que você conhece.',
        instrucao: 'Toque em um ser vivo para cada linha.',
        palavras: ['cachorro', 'gato', 'passarinho', 'peixe', 'formiga', 'borboleta', 'árvore', 'flor', 'eu'],
        frases: [
          { letra: 'a', antes: '', depois: '', certa: 0 },
          { letra: 'b', antes: '', depois: '', certa: 1 },
          { letra: 'c', antes: '', depois: '', certa: 2 },
        ],
        explica: 'Qualquer ser vivo vale: bichos, plantas e até você! Todos nascem, crescem e se alimentam.' },

      { id: 'cb3-04', tipo: 'completar', livre: true, livro: 'fatores-abioticos',
        pergunta: 'Escreva três exemplos de seres não vivos que você conhece.',
        instrucao: 'Toque em um ser não vivo para cada linha.',
        palavras: ['pedra', 'água', 'Sol', 'cadeira', 'mesa', 'carro', 'brinquedo', 'lápis'],
        frases: [
          { letra: 'a', antes: '', depois: '', certa: 0 },
          { letra: 'b', antes: '', depois: '', certa: 1 },
          { letra: 'c', antes: '', depois: '', certa: 2 },
        ],
        explica: 'Qualquer um da lista vale: eles não nascem, não crescem e não se reproduzem.' },

      { id: 'cb3-05', tipo: 'escolha', estilo: 'marcar-x', livro: 'ajuda',
        pergunta: 'O que significa dizer que um ser vivo foi BENEFICIADO em uma relação?',
        opcoes: [
          { t: 'Ele ganhou algo bom, como alimento, proteção ou ajuda.' },
          { t: 'Ele perdeu algo ou saiu machucado.' },
        ], certa: 0,
        explica: 'Beneficiado é quem ganhou algo bom na relação: alimento, proteção ou ajuda.' },

      { id: 'cb3-06', tipo: 'escolha', estilo: 'marcar-x', livro: 'prejuizo',
        pergunta: 'O que significa dizer que um ser vivo foi PREJUDICADO em uma relação?',
        opcoes: [
          { t: 'Ele ganhou alimento e proteção.' },
          { t: 'Ele saiu perdendo, machucado ou foi usado como alimento.' },
        ], certa: 1,
        explica: 'Prejudicado é quem saiu perdendo: ficou machucado ou virou alimento de outro ser vivo.' },

      { id: 'cb3-07', tipo: 'completar', livro: 'alimentacao', apoio: situacao('O leão persegue e caça a zebra para se alimentar.'),
        pergunta: 'Leia a situação e responda:',
        instrucao: 'Toque no animal certo para cada pergunta.',
        palavras: ['o leão', 'a zebra'],
        frases: [
          { letra: 'a', antes: 'Quem foi beneficiado?', depois: '', certa: 0 },
          { letra: 'b', antes: 'Quem foi prejudicado?', depois: '', certa: 1 },
        ],
        explica: 'O leão ganhou alimento: foi beneficiado. A zebra foi caçada: foi prejudicada.' },

      { id: 'cb3-08', tipo: 'escolha', estilo: 'marcar-x', livro: 'sociedade',
        pergunta: 'Em uma colmeia, várias abelhas trabalham juntas. Algumas procuram alimento, enquanto outras cuidam da colmeia. Essa situação mostra que:',
        opcoes: [
          { t: 'Os seres vivos podem estabelecer relações entre si.' },
          { t: 'Os animais não precisam uns dos outros.' },
          { t: 'Apenas os seres humanos vivem em grupos.' },
        ], certa: 0,
        explica: 'As abelhas dividem o trabalho e se ajudam: os seres vivos podem estabelecer relações entre si.' },

      { id: 'cb3-09', tipo: 'ordenar', livro: 'seres-vivos',
        pergunta: 'Numere de 1 a 4 a ordem correta do ciclo de vida de uma planta:',
        instrucao: 'Toque nas fases da primeira até a última.',
        itens: ['Semente plantada na terra.', 'Muda pequena começando a crescer.', 'Planta adulta com flores.', 'Fruto com novas sementes.'],
        explica: 'Primeiro a semente é plantada (1), depois vem a muda pequena (2), a planta adulta com flores (3) e o fruto com novas sementes (4). E as sementes começam tudo de novo!' },

      { id: 'cb3-10', tipo: 'completar', livro: 'fatores-abioticos',
        pergunta: 'O Sol é um ser vivo ou um ser não vivo? Explique o motivo da sua resposta.',
        instrucao: 'Toque na resposta e depois no motivo.',
        palavras: ['um ser vivo', 'um ser não vivo', 'porque nasce, cresce e se reproduz', 'porque não nasce, não cresce e não se reproduz'],
        frases: [
          { letra: 'a', antes: 'O Sol é', depois: '.', certa: 1 },
          { letra: 'b', antes: 'Ele é assim', depois: '.', certa: 3 },
        ],
        explica: 'O Sol é um ser não vivo: ele não nasce, não cresce, não se alimenta e não se reproduz. Mas a luz e o calor dele ajudam os seres vivos!' },

      { id: 'cb3-11', tipo: 'completar', livro: 'ajuda', apoio: situacao('O passarinho anu-branco pousa nas costas do boi e come os carrapatos que incomodam o animal.'),
        pergunta: 'Leia a situação e responda:',
        instrucao: 'Toque na resposta certa para cada pergunta.',
        palavras: ['Sim, porque ganhou alimento: os carrapatos.', 'Não, porque saiu machucado.', 'beneficiado', 'prejudicado'],
        frases: [
          { letra: 'a', antes: 'O passarinho foi beneficiado? Por quê?', depois: '', certa: 0 },
          { letra: 'b', antes: 'O boi foi beneficiado ou prejudicado?', depois: '', certa: 2 },
        ],
        explica: 'Os dois foram beneficiados! O anu-branco ganhou alimento (os carrapatos) e o boi ficou livre dos carrapatos que o incomodavam.' },
    ],
  });
})();
