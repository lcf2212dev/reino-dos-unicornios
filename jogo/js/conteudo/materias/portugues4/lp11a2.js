/* Sala lp11a2 (Livro de Aprendizagem, capítulo 11, pp. 34 a 36): Organizando o conhecimento sobre Rei da Floresta
   (tema, estrofes, versos, rimas e refrão), os bichos da canção, música e canção e o trecho do macaco. As questões
   que pedem para voltar à letra trazem a canção inteira no texto de apoio. */
(function () {
  var REFRAO = ['Eu sou o rei da floresta', 'Conheço tudo por aqui', 'Eu ando por tudo, correndo e caçando', 'Tem tanto bicho que eu já vi'];
  var MACACO = ['Já vi um macaco marrom', 'Pulando de galho em galho', 'Comendo banana', 'Coçando a cabeça', 'E procurando um atalho'];
  var CANCAO = { titulo: 'Rei da Floresta', partes: [{ versos: REFRAO.concat([''],
    ['Já vi um elefante', 'Bem grande, muito grande', 'Tomando água pelo nariz', 'E quando ele espirra a água pra fora', 'Parece um chafariz'],
    [''], REFRAO, [''], MACACO, [''],
    ['Pra escapar da girafa', 'Que queria pegar seu lanche', 'A boca dela alcança a comida dos outros', 'Com aquele pescoço gigante'],
    [''], REFRAO, [''],
    ['E quando olhei bem para cima', 'Vi uma arara voando', 'Toda colorida, tão bonita', 'E eu acho que ela tava falando'],
    [''],
    ['E quando olhei para o chão', 'Vi a tartaruga, que não voa não', 'Bem devagarinho ela caminha', 'E o casco é a sua casinha'],
    [''], REFRAO) }] };
  var TRECHO = { titulo: 'Rei da Floresta (trecho)', partes: [{ versos: MACACO }] };

  Reino.registrarSala('portugues4',
    {
      id: 'lp11a2', nome: 'Os bichos da canção', emoji: '🐒',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 34 a 36', ordem: 'livro',
      cartas: ['lp-a34', 'lp-a34b', 'lp-a35', 'lp-a36'],
      intro: 'Vamos organizar o que aprendemos com o Rei da Floresta: estrofes, versos, rimas e os bichos da canção!',
      desafios: [
        { id: 'lp11a2-01', tipo: 'escrever', origem: 'APR-34-q1a', pagina: 34, livro: 'lp-a32',
          apoio: CANCAO,
          pergunta: 'Sobre a letra da canção Rei da Floresta: qual é o tema da canção?',
          linhas: 2, minPalavras: 2,
          chaves: [['animais', 'animal', 'bichos', 'bicho', 'elefante', 'macaco', 'girafa', 'arara', 'tartaruga', 'floresta']],
          modelo: 'Os animais da floresta que o leão já viu.',
          explica: 'O tema são os animais da floresta: o rei da floresta conta os bichos que já viu.' },
        { id: 'lp11a2-02', tipo: 'desenho', origem: 'APR-34-q1b', pagina: 34, livro: 'lp-a33d', guardar: true,
          pergunta: 'Qual animal é o rei da floresta? Desenhe-o no espaço abaixo.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O espaço do livro virou a prancheta de desenho do jogo.',
          explica: 'O rei da floresta é o leão! Que juba bonita!' },
        { id: 'lp11a2-03', tipo: 'escolha', origem: 'APR-34-q2', pagina: 34, livro: 'lp-a33b',
          apoio: CANCAO,
          pergunta: 'Quantas estrofes essa canção tem?',
          opcoes: [
            { t: '10 estrofes' },
            { t: '9 estrofes' },
            { t: '8 estrofes' },
          ], certa: 1,
          explica: 'São 9 estrofes: o refrão aparece 4 vezes, e há mais 5 estrofes, com o elefante, o macaco, a girafa, a arara e a tartaruga.' },
        { id: 'lp11a2-04', tipo: 'escolha', origem: 'APR-34-q3', pagina: 34, livro: 'lp-a33b',
          apoio: CANCAO,
          pergunta: 'Numere cada verso da letra da canção, contando um por um. Depois, pinte o quadro que mostra a quantidade de versos que a canção tem.',
          opcoes: [
            { t: '35 versos' },
            { t: '38 versos' },
            { t: '40 versos' },
          ], certa: 1,
          adaptacao: 'Escrever o número de cada verso no livro virou contar os versos; pintar o quadro virou tocar nele.',
          explica: 'São 38 versos: 4 + 5 + 4 + 5 + 4 + 4 + 4 + 4 + 4. Cada linha da letra é um verso!' },
        { id: 'lp11a2-05', tipo: 'marcar', origem: 'APR-34-q4', pagina: 34, livro: 'lp-a33c', marca: 'pintar',
          pergunta: 'Agora, pinte as palavras que rimam em cada estrofe da canção. Lembre-se: as palavras que rimam terminam com o mesmo som.',
          texto: 'Eu sou o rei da floresta\nConheço tudo por {aqui}\nEu ando por tudo, correndo e caçando\nTem tanto bicho que eu já {vi}\n\n' +
            'Já vi um {elefante}\nBem {grande?}, muito {grande}\nTomando água pelo {nariz}\nE quando ele espirra a água pra fora\nParece um {chafariz}\n\n' +
            'Já vi um macaco marrom\nPulando de {galho?} em {galho}\nComendo banana\nCoçando a cabeça\nE procurando um {atalho}\n\n' +
            'Pra escapar da girafa\nQue queria pegar seu {lanche}\nA boca dela alcança a comida dos outros\nCom aquele pescoço {gigante}\n\n' +
            'E quando olhei bem para cima\nVi uma arara {voando}\nToda colorida, tão bonita\nE eu acho que ela tava {falando}\n\n' +
            'E quando olhei para o {chão}\nVi a tartaruga, que não voa {não}\nBem devagarinho ela {caminha}\nE o casco é a sua {casinha}',
          adaptacao: 'O refrão aparece uma vez só: nas outras vezes, as rimas são as mesmas.',
          explica: 'Rimam: aqui e vi; elefante e grande; nariz e chafariz; galho e atalho; lanche e gigante; voando e falando; chão e não; caminha e casinha.' },
        { id: 'lp11a2-06', tipo: 'escrever', origem: 'APR-34-q5', pagina: 34, livro: 'lp-a33c',
          apoio: CANCAO,
          pergunta: 'Copie, a seguir, o refrão da canção.',
          linhas: 4, minPalavras: 20,
          chaves: [['rei'], ['floresta'], ['conheco'], ['aqui'], ['ando'], ['correndo'], ['cacando'], ['bicho'], ['vi']],
          modelo: 'Eu sou o rei da floresta\nConheço tudo por aqui\nEu ando por tudo, correndo e caçando\nTem tanto bicho que eu já vi',
          explica: 'O refrão é a estrofe que se repete: "Eu sou o rei da floresta, conheço tudo por aqui, eu ando por tudo, correndo e caçando, tem tanto bicho que eu já vi".' },
        { id: 'lp11a2-07', tipo: 'ligar', origem: 'APR-35-q6', pagina: 35, livro: 'lp-a35',
          apoio: CANCAO,
          pergunta: 'Ligue cada animal ao que ele faz na canção Rei da Floresta.',
          pares: [
            [{ img: 'lp:11-elefante', alt: 'elefante' }, { t: 'Espirra água pelo nariz como um chafariz.' }],
            [{ img: '🐒', alt: 'macaco' }, { t: 'Pula de galho em galho, come banana e procura um atalho.' }],
            [{ img: 'lp:11-girafa', alt: 'girafa' }, { t: 'Queria pegar seu lanche com aquele pescoço gigante.' }],
            [{ img: '🦜', alt: 'arara' }, { t: 'Voa toda colorida, tão bonita.' }],
            [{ img: '🐢', alt: 'tartaruga' }, { t: 'Caminha bem devagarinho e o casco é sua casinha.' }],
          ],
          direita: [3, 4, 0, 2, 1],
          explica: 'O elefante espirra água, o macaco pula de galho em galho, a girafa tem o pescoço gigante, a arara voa colorida e a tartaruga caminha devagarinho.' },
        { id: 'lp11a2-08', tipo: 'digitar', origem: 'APR-36-q7', pagina: 36, livro: 'lp-a36',
          apoio: TRECHO,
          pergunta: 'Releia um trecho da canção Rei da Floresta. Depois, responda aos itens.',
          frases: [
            { letra: 'a', antes: 'Quantas estrofes tem esse trecho?', depois: '', certas: ['1', 'uma', '1 estrofe', 'uma estrofe', 'tem 1 estrofe', 'tem uma estrofe'] },
            { letra: 'b', antes: 'Quantos versos tem esse trecho?', depois: '', certas: ['5', 'cinco', '5 versos', 'cinco versos', 'tem 5 versos', 'tem cinco versos'] },
            { letra: 'c', antes: 'Qual é a palavra que rima com galho?', depois: '', certas: ['atalho'] },
            { letra: 'd', antes: 'Qual era a cor do macaco de acordo com o eu lírico da canção?', depois: '', certas: ['marrom', 'era marrom', 'o macaco era marrom'] },
          ],
          explica: 'O trecho tem 1 estrofe com 5 versos. Galho rima com atalho, e o macaco era marrom!' },
        { id: 'lp11a2-09', tipo: 'varias', origem: 'APR-36-q7e', pagina: 36, livro: 'lp-a36',
          apoio: TRECHO,
          pergunta: 'Pinte as opções que mostram o que o macaco estava fazendo quando o eu lírico chegou.',
          opcoes: [
            { t: 'Comendo banana.', ok: true },
            { t: 'Procurando um atalho.', ok: true },
            { t: 'Andando pela floresta.' },
            { t: 'Coçando a cabeça.', ok: true },
            { t: 'Dormindo.' },
            { t: 'Brincando no rio.' },
          ],
          adaptacao: 'Pintar os quadros virou tocar neles.',
          explica: 'O macaco estava comendo banana, coçando a cabeça e procurando um atalho.' },
      ],
    });
})();
