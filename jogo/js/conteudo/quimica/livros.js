/* Laboratório de Química, 2º andar: os livros da Biblioteca da Química (Reino.QUIMICA.livros).
   Contrato: docs/contratos/quimica.md §3 e §9. Só dados. Lidos pelo Professor Carbono (até 30 letras, 3+ palavras).
   { id, ordem, titulo (só na tela; pode ter símbolo), emoji (com pixel art), paginas, desenho (chave de um desenho
   da tela dos livros; hoje o próprio id) }. Ler até o fim = descoberta 'livros' (estrelasLivroNovo).
   Os 8 ids são do contrato. Fatos conferidos (ar: ~78% nitrogênio, ~21% oxigênio; corpo: ~60% água; Marie Curie:
   Nobel de Física 1903 e de Química 1911, polônio e rádio em 1898; Lavoisier: conservação da massa; Mendeleiev: tabela
   de 1869 com casas vazias para o gálio, o escândio e o germânio). */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.livros = [
    { id: 'cozinha', ordem: 1, titulo: 'Química na cozinha', emoji: '🥣', desenho: 'cozinha',
      paginas: ['A cozinha é um laboratório!', 'O fermento solta um gás.', 'O gás faz o bolo crescer!',
        'O milho da pipoca tem água.', 'No calor, a água vira vapor.', 'O vapor estoura o milho: pop!',
        'Açúcar no fogo vira caramelo.', 'Cozinhar transforma a comida!'] },
    { id: 'ar', ordem: 2, titulo: 'O ar que a gente respira', emoji: '🌬', desenho: 'ar',
      paginas: ['O ar é uma mistura de gases.', 'Ele é invisível, mas existe.', 'A maior parte é nitrogênio.',
        'O corpo usa o oxigênio do ar.', 'E a gente solta gás carbônico.', 'As plantas usam esse gás!',
        'E devolvem oxigênio para nós.'] },
    { id: 'fogo', ordem: 3, titulo: 'O fogo precisa de três coisas', emoji: '🔥', desenho: 'fogo',
      paginas: ['O fogo precisa de três coisas.', 'Combustível, como a madeira.', 'Oxigênio, que vem do ar.',
        'E calor para começar.', 'Tirando uma, o fogo apaga!', 'Abafar tira o ar do fogo.',
        'Nunca brinque com fogo!', 'Fogo é só com um adulto!'] },
    { id: 'ferrugem', ordem: 4, titulo: 'A ferrugem', emoji: '🔩', desenho: 'ferrugem',
      paginas: ['O ferro pode enferrujar.', 'Ele reage com água e oxigênio.', 'E vira ferrugem, bem devagar.',
        'A tinta protege o ferro.', 'O ouro não enferruja nunca!', 'Olha a Estátua da Liberdade!',
        'Ela é de cobre e ficou verde.', 'Esse verde se chama azinhavre.'] },
    { id: 'agua', ordem: 5, titulo: 'A viagem da água', emoji: '🌧', desenho: 'agua',
      paginas: ['O sol esquenta a água do mar.', 'A água evapora e sobe.', 'Lá no alto, o vapor esfria.',
        'Ele condensa: vira gotinhas.', 'Muitas gotinhas fazem a nuvem.', 'As gotas pesam e cai a chuva!',
        'A chuva volta ao rio e ao mar.', 'É a mesma água há muito tempo!'] },
    { id: 'planta', ordem: 6, titulo: 'A planta que faz comida', emoji: '🌱', desenho: 'planta',
      paginas: ['A planta faz a própria comida!', 'Ela usa luz do sol e água.', 'E o gás carbônico do ar.',
        'Com isso, ela faz açúcar.', 'O açúcar é o alimento dela.', 'E ela solta oxigênio no ar!',
        'Isso se chama fotossíntese.', 'As plantas são importantes!'] },
    { id: 'corpo', ordem: 7, titulo: 'A química do corpo', emoji: '🧠', desenho: 'corpo',
      paginas: ['Seu corpo é cheio de química!', 'Mais da metade dele é água.', 'A saliva amolece a comida.',
        'Isso é o começo da digestão.', 'O estômago tem um ácido forte.', 'Ele ajuda a desmanchar tudo.',
        'A comida vira energia!', 'Energia para correr e brincar!'] },
    { id: 'cientistas', ordem: 8, titulo: 'Cientistas que mudaram tudo', emoji: '🧑‍🔬', desenho: 'cientistas',
      paginas: ['O cientista Lavoisier', 'pesava tudo com cuidado.', 'Na natureza, nada se perde,',
        'tudo se transforma!',
        'Marie Curie ganhou dois Nobel.', 'A primeira mulher a ganhar!', 'Achou os elementos polônio',
        'e rádio, com o marido Pierre.',
        'Mendeleiev arrumou a tabela.', 'E deixou vagas para descobrir!'] },
  ];
})();
