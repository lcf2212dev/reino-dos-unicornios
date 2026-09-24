/* REVISÃO BIMESTRAL DE HISTÓRIA — 2º ano, 3º bimestre (folha da escola, 10 questões).
   Os enunciados e as alternativas são os da folha, na mesma ordem. O que muda é só
   o jeito de responder: tocar em vez de marcar, ligar ou escrever.
   Acessórios: lendário (acertou tudo na 1ª tentativa), raro (na 2ª), comum (depois). */
Reino.registrarProva({
  id: 'historia-3bim',
  materiaId: 'historia',
  nome: 'Revisão Bimestral de História',
  bimestre: '3º bimestre',
  emoji: '📜',
  acessorios: {
    lendario: { id: 'tiara-arco-iris', nome: 'Tiara de Arco-íris' },
    raro: { id: 'pena-magica', nome: 'Pena Mágica' },
    comum: { id: 'laco-vovo', nome: 'Lacinho da Vovó' },
  },
  questoes: [
    { id: 'hb3-01', tipo: 'escolha', estilo: 'marcar-x', livro: 'documentos',
      pergunta: 'Marque um X a opção abaixo, que nos ajuda a conhecer a história de uma pessoa:',
      opcoes: [
        { t: 'Certidão de nascimento' },
        { t: 'Fotografia antiga' },
        { t: 'Carta antiga' },
        { t: 'Todos os anteriores' },
      ], certa: 3,
      explica: 'A certidão, a fotografia e a carta ajudam a conhecer a história de uma pessoa. Por isso a resposta é "Todos os anteriores".' },

    { id: 'hb3-02', tipo: 'ligar', livro: 'vestigios', lerItens: true,
      pergunta: 'Ligue cada item à informação que ele pode nos trazer:',
      pares: [
        [{ t: 'Fotografia antiga' }, { t: 'Como era a pessoa no passado.' }],
        [{ t: 'Certidão de nascimento' }, { t: 'Informações sobre o nascimento.' }],
        [{ t: 'Carta antiga' }, { t: 'Mensagens e acontecimentos de outra época.' }],
        [{ t: 'Objeto antigo' }, { t: 'Como as pessoas viviam e usavam as coisas.' }],
      ],
      direita: [1, 0, 3, 2],   // mesma ordem da folha
      explica: 'A fotografia mostra como a pessoa era; a certidão tem as informações do nascimento; a carta traz mensagens de outra época; o objeto mostra como as pessoas viviam.' },

    { id: 'hb3-03', tipo: 'escolha', estilo: 'marcar-x', livro: 'vestigios',
      pergunta: 'João encontrou uma fotografia de sua avó quando ela era criança. Essa fotografia mostra:',
      opcoes: [
        { t: 'Como sua avó é hoje.' },
        { t: 'Como sua avó era quando criança.' },
        { t: 'Como sua avó será no futuro.' },
      ], certa: 1,
      explica: 'A fotografia foi tirada quando a avó era criança, então mostra como ela era naquele tempo.' },

    { id: 'hb3-04', tipo: 'escolha', estilo: 'marcar-x', livro: 'documentos',
      pergunta: 'Qual documento registra informações sobre o nascimento de uma pessoa?',
      opcoes: [
        { t: 'Certidão de nascimento' },
        { t: 'Fotografia' },
        { t: 'Carta' },
      ], certa: 0,
      explica: 'A certidão de nascimento é o documento que registra o nascimento: nome, data e lugar.' },

    { id: 'hb3-05', tipo: 'varias', estilo: 'circular', livro: 'vestigios',
      pergunta: 'Circule os objetos que podem ajudar a contar histórias do passado:',
      opcoes: [
        { t: 'BRINQUEDO ANTIGO', ok: true },
        { t: 'CELULAR ATUAL' },
        { t: 'CARTA ANTIGA', ok: true },
        { t: 'FOTOGRAFIA ANTIGA', ok: true },
        { t: 'OBJETO ANTIGO', ok: true },
      ],
      explica: 'Tudo o que é antigo ajuda a contar o passado. O celular atual é de hoje.' },

    { id: 'hb3-06', tipo: 'frase', livro: 'vestigios', lerItens: true,
      pergunta: 'Por que uma fotografia antiga pode ser importante para conhecer a história de uma família?',
      blocos: ['Porque ela mostra', 'como eram as pessoas', 'da família', 'no passado.'],
      explica: 'A fotografia antiga mostra como eram as pessoas da família no passado.' },

    { id: 'hb3-07', tipo: 'vfLista', livro: 'documentos',
      pergunta: 'Marque V para verdadeiro e F para falso:',
      itens: [
        { t: 'Fotografias podem ajudar a conhecer o passado.', v: true },
        { t: 'Documentos não possuem nenhuma informação sobre as pessoas.', v: false },
        { t: 'Cartas antigas podem contar acontecimentos de outras épocas.', v: true },
        { t: 'Certidões são documentos importantes.', v: true },
      ],
      explica: 'Só a segunda é falsa: os documentos têm muitas informações sobre as pessoas, como o nome e a data de nascimento.' },

    { id: 'hb3-08', tipo: 'varias', estilo: 'marcar-x', livro: 'vestigios',
      pergunta: 'Marque um X nos itens que podem ser fontes para conhecer a história da escola:',
      opcoes: [
        { t: 'Fotografia antiga da turma.', ok: true },
        { t: 'Relato de uma professora.', ok: true },
        { t: 'Brinquedo inventado sem relação com a escola.' },
        { t: 'Caderno de chamada antigo.', ok: true },
        { t: 'Objeto usado em uma apresentação escolar.', ok: true },
        { t: 'Papel em branco sem informação.' },
      ],
      explica: 'A foto da turma, o relato da professora, o caderno de chamada e o objeto da apresentação são da escola. O brinquedo inventado e o papel em branco não contam nada sobre ela.' },

    { id: 'hb3-09', tipo: 'completar', livro: 'documentos',
      pergunta: 'Complete as frases com as palavras do quadro.',
      palavras: ['FOTOGRAFIAS', 'DOCUMENTOS', 'PASSADO'],
      frases: [
        { letra: 'a', antes: 'Os', depois: 'ajudam a registrar informações importantes.', certa: 1 },
        { letra: 'b', antes: 'As', depois: 'podem mostrar como eram as pessoas antigamente.', certa: 0 },
        { letra: 'c', antes: 'Os documentos podem nos ajudar a conhecer o', depois: '.', certa: 2 },
      ],
      explica: 'Os DOCUMENTOS registram informações importantes. As FOTOGRAFIAS mostram como eram as pessoas. Os documentos ajudam a conhecer o PASSADO.' },

    { id: 'hb3-10', tipo: 'ligar', livro: 'documentos', lerItens: true,
      pergunta: 'Ligue cada documento, ao seu respectivo nome:',
      pares: [
        [{ img: 'doc:rg', alt: 'documento com foto e digital' }, { t: 'RG' }],
        [{ img: 'doc:cpf', alt: 'cartão azul escrito CPF' }, { t: 'CPF' }],
        [{ img: 'doc:certidao', alt: 'folha com o registro do nascimento' }, { t: 'Certidão de nascimento' }],
      ],
      direita: [1, 2, 0],      // mesma ordem da folha: CPF, Certidão de nascimento, RG
      explica: 'O RG tem a foto e a digital. O cartão do CPF tem escrito "CPF". A certidão de nascimento é a folha com o registro do nascimento.' },
  ],
});
