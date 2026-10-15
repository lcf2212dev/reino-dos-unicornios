/* Sala lp11t2 (Livro de Atividades, capítulo 11, pp. 11 e 12): graus do substantivo, aumentativo e diminutivo
   (os dois quadros, escrever o diminutivo, a palavra diferente de cada grupo e os animais). Na p. 12 os quadros
   não têm rótulo (verde = aumentativo, lilás = diminutivo): no jogo, as colunas têm nome. O quinto animal é um
   pássaro (vale também pombo). */
Reino.registrarSala('portugues4',
    {
      id: 'lp11t2', nome: 'Aumentativo e diminutivo', emoji: '🐦',
      livroOrigem: 'atividades', capitulo: 11, paginas: 'pp. 11 e 12', ordem: 'livro',
      cartas: ['lp-t11', 'lp-t12'],
      intro: 'Casarão ou casinha? Vamos treinar o aumentativo e o diminutivo no Livro de Atividades!',
      desafios: [
        { id: 'lp11t2-01', tipo: 'separar', origem: 'ATI-11-q1', pagina: 11, livro: 'lp-t11',
          pergunta: 'As palavras a seguir estão no grau aumentativo ou no diminutivo? Leve cada palavra ao quadro certo.',
          grupos: [{ e: '⬆', t: 'Aumentativo', dica: 'grandão' }, { e: '⬇', t: 'Diminutivo', dica: 'pequenininho' }],
          itens: [
            { t: 'casarão', g: 0 },
            { t: 'peixinho', g: 1 },
            { t: 'carrão', g: 0 },
            { t: 'pedrinha', g: 1 },
            { t: 'livrão', g: 0 },
            { t: 'mãozona', g: 0 },
            { t: 'criancinha', g: 1 },
          ],
          adaptacao: 'Ligar cada palavra a um dos dois quadros virou separar as palavras nos dois quadros.',
          explica: 'Aumentativo: casarão, carrão, livrão e mãozona. Diminutivo: peixinho, pedrinha e criancinha.' },
        { id: 'lp11t2-02', tipo: 'digitar', origem: 'ATI-11-q2', pagina: 11, livro: 'lp-t11',
          pergunta: 'Escreva o diminutivo das palavras a seguir.',
          frases: [
            { letra: 'a', antes: 'animal:', depois: '', certas: ['animalzinho'] },
            { letra: 'b', antes: 'amor:', depois: '', certas: ['amorzinho'] },
            { letra: 'c', antes: 'beijos:', depois: '', certas: ['beijinhos'] },
            { letra: 'd', antes: 'dia:', depois: '', certas: ['diazinho'] },
            { letra: 'e', antes: 'escola:', depois: '', certas: ['escolinha'] },
          ],
          explica: 'Animalzinho, amorzinho, beijinhos, diazinho e escolinha.' },
        { id: 'lp11t2-03', tipo: 'marcar', origem: 'ATI-11-q3', pagina: 11, livro: 'lp-t11', marca: 'circular',
          pergunta: 'Circule as palavras diferentes de cada grupo, ou seja, aquelas palavras que não estão no mesmo grau das outras.',
          texto: '1) pobrezinho, {livrão}, narizinho\n\n' +
            '2) criançona, {velhinho}, arvorezona\n\n' +
            '3) pratão, carrão, {anjinho}\n\n' +
            '4) lobão, {docinho}, amigona\n\n' +
            '5) peixinho, aviãozinho, {amigão}\n\n' +
            '6) elefantinho, caderninho, {patão}',
          adaptacao: 'As seis caixas do livro viraram seis grupos numerados, um embaixo do outro, com as palavras separadas por vírgula.',
          explica: 'As diferentes são: livrão, velhinho, anjinho, docinho, amigão e patão.' },
        { id: 'lp11t2-04', tipo: 'tabela', origem: 'ATI-12-q4', pagina: 12, livro: 'lp-t12',
          apoio: { titulo: 'Os animais', partes: [{ figuras: [
            { img: '🐟', legenda: 'peixe' }, { img: 'palavra:cachorro', legenda: 'cachorro' }, { img: 'lp:11-rato', legenda: 'rato' },
            { img: '🐢', legenda: 'tartaruga' }, { img: '🐦', legenda: 'pássaro' },
          ] }] },
          pergunta: 'Escreva o aumentativo e o diminutivo de cada um dos animais representados a seguir.',
          cab: ['Animal', 'Aumentativo', 'Diminutivo'],
          linhas: [
            ['peixe', { certas: ['peixão'] }, { certas: ['peixinho'] }],
            ['cachorro', { certas: ['cachorrão', 'canzarrão'] }, { certas: ['cachorrinho', 'cãozinho'] }],
            ['rato', { certas: ['ratão'] }, { certas: ['ratinho'] }],
            ['tartaruga', { certas: ['tartarugona'] }, { certas: ['tartaruguinha'] }],
            ['pássaro', { certas: ['passarão', 'pombão'] }, { certas: ['passarinho', 'pombinho'] }],
          ],
          adaptacao: 'Os quadros sem nome do livro (verde e lilás) viraram as colunas Aumentativo e Diminutivo.',
          explica: 'Peixão e peixinho; cachorrão e cachorrinho; ratão e ratinho; tartarugona e tartaruguinha; passarão e passarinho.' },
      ],
    });
