/* Sala lp12a4 (Livro de Aprendizagem, capítulo 12, pp. 71 a 74): letras maiúsculas e minúsculas, a mensagem de Ana
   (docs/contratos/quarto-bimestre.md §3). Letra que falta (pp. 72 e 73): tocar na letra certa (a digitada não
   confere maiúscula), em vários desafios para ter poucos botões (até 6). Decisões do INVENTARIO.md: "___apão" =
   Japão e "___ousa" = lousa; na mensagem de Ana, vovó e beijos são comuns opcionais (marcar: {x|1?});
   Parque Ibirapuera e Mercado São João levam maiúscula em todas as palavras. */
(function () {
  var LETRA = 'Complete as palavras com as letras que estão faltando. Dica: use a letra maiúscula em nomes próprios.';
  var PARENTESES = 'Complete as palavras usando a letra certa, conforme indicado nos parênteses.';
  Reino.registrarSala('portugues4',
    {
      id: 'lp12a4', nome: 'Maiúsculas e minúsculas', emoji: '🔠',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 71 a 74', ordem: 'livro',
      cartas: ['lp-a71', 'lp-a72', 'lp-a73', 'lp-a74'],
      intro: 'Vamos aprender quando usar letra maiúscula e letra minúscula. A Ana até escreveu uma mensagem para a avó!',
      desafios: [
        { id: 'lp12a4-01', tipo: 'completar', colado: true, origem: 'APR-72-q1a', pagina: 72, livro: 'lp-a72',
          pergunta: LETRA,
          palavras: ['J', 'j', 'T', 't', 'M', 'm'],
          frases: [
            { antes: '', depois: 'apão', certa: 0 },
            { antes: '', depois: 'elevisão', certa: 3 },
            { antes: '', depois: 'anaus', certa: 4 },
            { antes: '', depois: 'ocantins', certa: 2 },
          ],
          explica: 'Japão, Manaus e Tocantins são nomes próprios: J, M e T maiúsculos. Televisão é comum: t minúsculo.' },
        { id: 'lp12a4-02', tipo: 'completar', colado: true, origem: 'APR-72-q1b', pagina: 72, livro: 'lp-a72',
          pergunta: LETRA,
          palavras: ['L', 'l', 'R', 'r'],
          frases: [
            { antes: '', depois: 'ousa', certa: 1 },
            { antes: '', depois: 'oraima', certa: 2 },
          ],
          explica: 'Roraima é nome de lugar: R maiúsculo. Lousa é comum: l minúsculo.' },
        { id: 'lp12a4-03', tipo: 'completar', colado: true, origem: 'APR-72-q1c', pagina: 72, livro: 'lp-a72',
          pergunta: LETRA,
          palavras: ['P', 'p', 'C', 'c'],
          frases: [
            { antes: '', depois: 'arede', certa: 1 },
            { antes: '', depois: 'aminhão', certa: 3 },
          ],
          explica: 'Parede e caminhão são substantivos comuns: começam com letra minúscula.' },
        { id: 'lp12a4-04', tipo: 'ligar', origem: 'APR-72-q2', pagina: 72, livro: 'lp-a72',
          pergunta: 'Escolha um substantivo comum ou um substantivo próprio do quadro para nomear cada imagem a seguir.',
          pares: [
            [{ img: 'lp:12-ana', alt: 'menina' }, { t: 'Ana' }],
            [{ img: 'lp:12-mala', alt: 'mala' }, { t: 'mala' }],
            [{ img: 'lp:12-joaquim', alt: 'menino' }, { t: 'Joaquim' }],
            [{ img: 'lp:12-meias', alt: 'meias' }, { t: 'meias' }],
            [{ img: '🐝', alt: 'abelha' }, { t: 'abelha' }],
            [{ img: '🇧🇷', alt: 'bandeira do Brasil' }, { t: 'Brasil' }],
          ],
          adaptacao: 'Escrever o nome embaixo de cada imagem, com o quadro de palavras, virou ligar cada imagem ao nome do quadro.',
          explica: 'A menina é a Ana e o menino é o Joaquim; Brasil é o nome do país: próprios, com maiúscula. Mala, meias e abelha são comuns.' },
        { id: 'lp12a4-05', tipo: 'completar', colado: true, origem: 'APR-73-q3a', pagina: 73, livro: 'lp-a73',
          pergunta: PARENTESES,
          palavras: ['B', 'b', 'J', 'j'],
          frases: [
            { letra: 'a', antes: '', depois: 'runa levou para brincar na escola sua', certa: 0 },
            { antes: '', depois: 'oneca e sua', certa: 1 },
            { antes: '', depois: 'ola. (B - b)', certa: 1 },
            { letra: 'b', antes: 'A rua ', depois: 'oão Torres tem muitos parques. (J - j)', certa: 2 },
          ],
          explica: 'Bruna e João são nomes próprios: B e J maiúsculos. Boneca e bola são comuns: b minúsculo.' },
        { id: 'lp12a4-06', tipo: 'completar', colado: true, origem: 'APR-73-q3c', pagina: 73, livro: 'lp-a73',
          pergunta: PARENTESES,
          palavras: ['M', 'm', 'P', 'p'],
          frases: [
            { letra: 'c', antes: '', depois: 'ariana resolveu dar o nome de', certa: 0 },
            { antes: '', depois: 'el para sua nova gatinha. (M - m)', certa: 0 },
            { letra: 'd', antes: 'Meu cachorro chamado ', depois: 'udim adora correr pelo', certa: 2 },
            { antes: '', depois: 'arque. (P - p)', certa: 3 },
          ],
          explica: 'Mariana, Mel (o nome da gatinha) e Pudim são nomes próprios: maiúscula. Parque é comum: p minúsculo.' },
        { id: 'lp12a4-07', tipo: 'marcar', origem: 'APR-73-q4a', pagina: 73, livro: 'lp-a73',
          pergunta: 'Leia com atenção uma mensagem que Ana escreveu para sua avó. Contorne de azul os substantivos próprios da mensagem. Contorne de vermelho os substantivos comuns da mensagem.',
          marca: 'circular',
          cores: [{ nome: 'Azul: próprio', cor: '#3f6fd8' }, { nome: 'Vermelho: comum', cor: '#e8333a' }],
          texto: '{Vovó|1?} {Lúcia|0},\nOntem fui ao {parque|1} com o meu {pai|1}. Brinquei muito com a {Júlia|0} e o {Lucas|0}. ' +
            'Nós andamos de {bicicleta|1} e tomamos {sorvete|1}. Foi um {dia|1} muito divertido!\n{Beijos|1?},\n{Ana|0}',
          explica: 'Azul: Lúcia, Júlia, Lucas e Ana, nomes de pessoas. Vermelho: parque, pai, bicicleta, sorvete e dia. Vovó e beijos também são comuns!' },
        { id: 'lp12a4-08', tipo: 'escrever', origem: 'APR-73-q4c', pagina: 73, livro: 'lp-a73',
          pergunta: 'Escreva um bilhete para alguém de sua família contando uma coisa legal que você fez na escola ontem. Escreva pelo menos dois substantivos próprios e dois substantivos comuns.',
          linhas: 6, minPalavras: 8, minFrases: 1, maiusculas: true, minNomes: 2, chaves: [['escola', 'recreio']],
          modelo: 'Mamãe, ontem a Júlia e eu lemos um livro na biblioteca da Escola do Reino. Depois desenhamos uma flor. Beijos, Mariana.',
          adaptacao: 'O jogo confere o começo das frases e os dois nomes próprios com maiúscula, e que o bilhete fala da escola.',
          explica: 'Que bilhete legal! Os nomes próprios começam com letra maiúscula, e os comuns, com minúscula.' },
        { id: 'lp12a4-09', tipo: 'digitar', livre: true, origem: 'APR-74-q5', pagina: 74, livro: 'lp-a74',
          pergunta: 'Complete as frases a seguir. Lembre de usar letra maiúscula e letra minúscula nos lugares corretos.',
          frases: [
            { letra: 'a', antes: 'O nome da minha cidade é', depois: '. (Escreva o nome de sua cidade)', inicial: 'maiuscula' },
            { letra: 'b', antes: 'Eu gosto muito de brincar com', depois: '. (Escolha um brinquedo)', inicial: 'minuscula' },
            { letra: 'c', antes: 'A minha escola se chama', depois: '. (Escreva o nome da sua escola)', inicial: 'maiuscula' },
            { letra: 'd', antes: 'Gosto muito de assistir ao desenho', depois: '. (Escreva o nome do seu desenho preferido)', inicial: 'maiuscula' },
            { letra: 'e', antes: 'Em meu estojo, tem', depois: '. (Escreva o nome de um objeto que tem no seu estojo)', inicial: 'minuscula' },
          ],
          adaptacao: 'Resposta pessoal: vale a resposta de cada um, com maiúscula nos nomes próprios (cidade, escola, desenho) e minúscula nos comuns (brinquedo, objeto do estojo).',
          explica: 'Cidade, escola e desenho têm nome próprio: começam com maiúscula. O brinquedo e o objeto do estojo são comuns: minúscula.' },
        { id: 'lp12a4-10', tipo: 'marcar', origem: 'APR-74-q6', pagina: 74, livro: 'lp-a74',
          pergunta: 'As frases a seguir foram escritas com letras minúsculas. Reescreva as frases usando a letra maiúscula onde for necessário.',
          marca: 'circular',
          texto: '{minha} amiga {letícia} levou seu cachorro {paco} para uma consulta no veterinário.\n' +
            '{fomos} passear no {parque} {ibirapuera} e vimos uma árvore enorme.\n' +
            '{compramos} frutas no {mercado} {são} {joão}, perto da casa da vovó {ana}.',
          adaptacao: 'Reescrever virou contornar as palavras que precisam de letra maiúscula; a explicação mostra as frases reescritas.',
          explica: 'Minha amiga Letícia levou seu cachorro Paco ao veterinário. Fomos passear no Parque Ibirapuera. Compramos frutas no Mercado São João, perto da casa da vovó Ana.' },
      ],
    });
})();
