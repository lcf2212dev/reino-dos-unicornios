/* Sala hi10a3 (Livro de Aprendizagem, capítulo 10, pp. 9 a 12): o trabalho na comunidade, as fases do leite, o
   jogo da memória dos trabalhos (Saberes em ação), o poema Profissão (Testando as ideias) e o Agora você já sabe...
   (docs/contratos/quarto-bimestre.md §3). Os 7 passos da p. 11 são uma atividade só (APR-11-qA). */
(function () {
  var POEMA = { titulo: 'Profissão', partes: [{ versos: [
    'Todo mundo me pergunta', 'O que vou ser quando crescer.', 'Que insistência, coisa doida,', 'Nem sei o que eu vou comer!',
    'Estou pensando, escolhendo,', 'Eu gosto de responder.', 'Um médico, piscineiro', 'Ou cantor de MPB.',
    'Não sei se imito o papai,', 'Que é um grande professor,', 'Ou a minha prima Célia,', 'Que conserta até motor.'] }] };
  Reino.registrarSala('historia4',
    {
      id: 'hi10a3', nome: 'O trabalho na comunidade', emoji: '🥛',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 9 a 12', ordem: 'livro',
      cartas: ['hi-a09', 'hi-a09b', 'hi-a10', 'hi-a11', 'hi-a11b', 'hi-a12'],
      intro: 'Vamos ver como cada trabalho ajuda a comunidade, seguir o caminho do leite e ler um poema sobre profissões!',
      desafios: [
        { id: 'hi10a3-01', tipo: 'ordenar', origem: 'APR-10-q1a', pagina: 10, livro: 'hi-a10',
          pergunta: 'Observe as fases de produção e distribuição do leite. a) Enumere as atividades na ordem em que elas acontecem até o leite chegar na sua casa.',
          itens: [
            'Retirada do leite da vaca.',
            'Transporte para o local de embalagem.',
            'Embalagem do leite.',
            'Transporte para o local de venda.',
            'Venda no supermercado.',
          ],
          adaptacao: 'Escrever o número nos parênteses virou tocar nas atividades na ordem.',
          explica: 'Primeiro tiram o leite da vaca. Depois ele vai para a embalagem, é embalado, vai para o mercado e é vendido.' },
        { id: 'hi10a3-02', tipo: 'ligar', origem: 'APR-10-q1b', pagina: 10, livro: 'hi-a10',
          pergunta: 'b) Quem são os trabalhadores que aparecem na ilustração? Ligue cada quadro à profissão.',
          pares: [
            [{ t: 'Quadro 1: tira o leite da vaca' }, { t: 'produtor de leite' }],
            [{ t: 'Quadro 2: leva o latão de leite' }, { t: 'carregador' }],
            [{ t: 'Quadro 3: põe as caixinhas na esteira' }, { t: 'trabalhador da fábrica' }],
            [{ t: 'Quadro 4: dirige o caminhão' }, { t: 'motorista de caminhão' }],
            [{ t: 'Quadro 5: arruma as caixas no mercado' }, { t: 'vendedora do supermercado' }],
          ],
          adaptacao: 'Escrever as profissões como souber virou ligar cada quadro da ilustração à profissão.',
          explica: 'O produtor tira o leite, o carregador leva o latão, o trabalhador da fábrica embala, o motorista transporta e a vendedora arruma o leite no mercado.' },
        { id: 'hi10a3-03', tipo: 'ligar', origem: 'APR-11-qA', pagina: 11, livro: 'hi-a11b',
          pergunta: 'Agora, você vai criar um jogo da memória sobre os tipos de trabalho. Forme os pares, juntando o nome e o desenho de cada um dos trabalhos.',
          pares: [
            [{ img: '🔥', alt: 'fogo' }, { t: 'apagar incêndios' }],
            [{ img: '👩‍🏫', alt: 'professora' }, { t: 'ensinar' }],
            [{ img: '🌱', alt: 'broto' }, { t: 'plantar' }],
            [{ img: '✂', alt: 'tesoura' }, { t: 'cortar o cabelo' }],
            [{ img: '🧽', alt: 'esponja' }, { t: 'lavar a louça' }],
            [{ img: '🧹', alt: 'vassoura' }, { t: 'varrer a casa' }],
          ],
          adaptacao: 'Recortar, desenhar e brincar em dupla virou ligar o nome de 6 trabalhos ao desenho de cada um.',
          explica: 'Muito bem! Cada nome de trabalho tem o seu desenho, como no jogo da memória.' },
        { id: 'hi10a3-04', tipo: 'marcar', origem: 'APR-12-q1', pagina: 12, livro: 'hi-a12',
          pergunta: 'Leia o poema a seguir. Encontre e circule o nome das profissões citadas no texto.',
          marca: 'circular',
          texto: 'Todo mundo me pergunta\nO que vou ser quando crescer.\nQue insistência, coisa doida,\nNem sei o que eu vou comer!\n' +
            'Estou pensando, escolhendo,\nEu gosto de responder.\nUm {médico}, {piscineiro}\nOu {cantor} {de MPB|?}.\n' +
            'Não sei se imito o papai,\nQue é um grande {professor},\nOu a minha prima Célia,\nQue conserta até motor.',
          explica: 'As profissões do poema são médico, piscineiro, cantor e professor.' },
        { id: 'hi10a3-05', tipo: 'digitar', origem: 'APR-12-q2', pagina: 12, livro: 'hi-a12', apoio: POEMA,
          pergunta: 'Qual será a profissão da prima Célia? Converse com os colegas e o professor e escreva a sua resposta.',
          frases: [
            { antes: '', depois: '', certas: ['mecânica', 'mecânico', 'a mecânica', 'ela é mecânica', 'mecânica de carros',
              'mecânica de carro', 'mecânica de motor', 'mecânica de motores'] },
          ],
          adaptacao: 'A conversa com os colegas ficou de fora; a resposta é escrita.',
          explica: 'A prima Célia conserta até motor: ela é mecânica!' },
        { id: 'hi10a3-06', tipo: 'completar', livre: true, origem: 'APR-12-qA', pagina: 12, livro: 'hi-a12',
          pergunta: 'Agora você já sabe... Para cada item, escolha: Já sei, Preciso saber mais ou Ainda não sei.',
          palavras: ['Já sei', 'Preciso saber mais', 'Ainda não sei'],
          frases: [
            { antes: 'Reconhecer as atividades que são consideradas trabalho.', depois: '' },
            { antes: 'Diferenciar trabalho de emprego.', depois: '' },
            { antes: 'Reconhecer que todos os trabalhos são importantes para a vida em comunidade.', depois: '' },
          ],
          adaptacao: 'As carinhas da legenda viraram as palavras Já sei, Preciso saber mais e Ainda não sei.',
          explica: 'Obrigado por contar! O que ainda não sabe, dá para treinar de novo.' },
      ],
    });
})();
