/* Cartas do Livro de Aprendizagem, Capítulo 11 "Profissionais da comunidade" (pp. 13 a 22), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; página longa vira cartas seguidas.
   As fotos e ilustrações viram figuras com legenda (a legenda do livro e, quando a questão depende dela, uma frase
   curta do que a imagem mostra). Os QR codes das pp. 13 e 19 (conteúdo digital) ficam de fora. */
(function () {
  var L = 'aprendizagem', C = 11;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  Reino.registrarCartas('historia4', [
    // abertura e Conversa vai / vem (pp. 13 e 14)
    carta('hi-a13', '📷', 'Profissionais da comunidade – Capítulo 11', 13, [
      { t: 'figuras', itens: [{ img: '📷', legenda: 'Num campo florido, uma família com roupas antigas posa parada para uma foto. O fotógrafo, com a cabeça coberta por um pano preto, fica atrás de uma câmera grande de madeira, num tripé.' }] },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'O que as pessoas que aparecem na cena estão fazendo?' },
        { texto: 'Essa cena aconteceu no passado ou na atualidade? Por que você acha isso?' },
        { texto: 'Quanto tempo demora para vermos o resultado das fotos que tiramos na atualidade?' },
      ] },
    ]),
    carta('hi-a14', '📱', 'Conversa vem...', 14, [
      { t: 'texto', texto: 'Observe atentamente as duas imagens a seguir e circule 8 diferenças entre elas.' },
      { t: 'figuras', itens: [{ img: '📱', legenda: 'Duas selfies quase iguais de um grupo de crianças, cada uma na tela de um celular.' },
        { img: '📸', legenda: 'Um menino de camiseta azul tira uma foto com uma câmera digital.' }] },
    ]),

    // Profissões do passado: o fotógrafo e as telefonistas (pp. 15 e 16)
    carta('hi-a15', '📷', 'Profissões do passado (1 de 3)', 15, [
      { t: 'texto', texto: 'Você descobriu que o trabalho faz parte da vida do ser humano. Por meio dele, produzimos alimentos, prestamos serviços e conseguimos dinheiro para alcançar objetivos, como ter uma casa, estudar ou realizar atividades de lazer.' },
      { t: 'texto', texto: 'Ao longo do tempo, as formas de executar o trabalho evoluem conforme as pessoas desenvolvem novas tecnologias. Observe o processo que um fotógrafo profissional realizava para revelar uma fotografia.' },
    ]),
    carta('hi-a15b', '📷', 'Profissões do passado (2 de 3)', 15, [
      { t: 'lista', itens: [
        { termo: '1.', texto: 'O fotógrafo usava câmeras que tinham filmes para registrar a luz.' },
        { termo: '2.', texto: 'Para revelar as fotos, ele ia a uma sala escura e tirava o filme da câmera com muito cuidado.' },
        { termo: '3.', texto: 'Depois, o fotógrafo mergulhava o filme em uma mistura de produtos e o deixava descansar por algum tempo.' },
        { termo: '4.', texto: 'Em seguida, ele lavava o filme com água e o deixava secar em um lugar escuro, até obter uma foto com as cores invertidas, chamada de negativo.' },
      ] },
    ]),
    carta('hi-a15c', '📷', 'Profissões do passado (3 de 3)', 15, [
      { t: 'lista', itens: [
        { termo: '5.', texto: 'Então, o fotógrafo colocava o negativo em uma máquina chamada ampliador, que transferia a imagem para o papel fotográfico.' },
        { termo: '6.', texto: 'Na sequência, o fotógrafo mergulhava o papel fotográfico em outra mistura de produtos e o deixava descansar por algum tempo, até a foto aparecer.' },
        { termo: '7.', texto: 'Por fim, o fotógrafo pendurava as fotos em um varal, até que elas ficassem secas.' },
      ] },
      { t: 'quadro', texto: 'Esse processo podia levar várias horas ou até mesmo dias, dependendo do tipo e da quantidade de fotos que o fotógrafo queria revelar.' },
    ]),
    carta('hi-a16', '📱', 'Como é o processo de tirar fotografias atualmente?', 16, [
      { t: 'texto', texto: 'Na atualidade, as fotografias podem ser feitas de forma digital, feitas com smartphones ou câmeras modernas, e podem ser vistas logo após serem tiradas. Com poucos toques, é possível editá-las, imprimir ou compartilhar com outras pessoas.' },
      { t: 'texto', texto: 'Com o tempo, a tecnologia transformou o trabalho do fotógrafo. Esse profissional não desapareceu, mas precisou aprender a usar novas ferramentas e técnicas. Hoje, muitos fotógrafos trabalham com computadores, celulares e até redes sociais.' },
    ]),
    carta('hi-a16b', '☎', 'As telefonistas', 16, [
      { t: 'texto', texto: 'Em alguns casos, porém, novas tecnologias fizeram com que algumas profissões deixassem de existir. É o caso das telefonistas, que trabalhavam em centrais telefônicas ajudando a conectar as ligações entre as pessoas. Com os telefones modernos, esse trabalho passou a ser feito por sistemas automáticos.' },
      { t: 'texto', texto: 'Antigamente, quando as pessoas queriam ligar umas para as outras, elas precisavam ligar para uma central telefônica. Lá, elas eram atendidas por telefonistas, que transferiam a chamada para a pessoa desejada. Para isso, elas conectavam manualmente os fios das linhas de cada pessoa.' },
      { t: 'figuras', itens: [{ img: '☎', legenda: 'Telefonistas trabalhando em uma central telefônica no ano de 1955.' }] },
    ]),

    // o acendedor de lampiões (p. 17)
    carta('hi-a17', '🏮', ORGANIZANDO, 17, [
      { t: 'texto', texto: 'Observe a imagem a seguir.' },
      { t: 'figuras', itens: [{ img: '🏮', legenda: 'Acendedor de lampiões, em 1900. Na foto, um homem de chapéu leva uma escada no ombro e ergue uma vara comprida até o lampião do poste.' }] },
    ]),

    // Profissões da atualidade e profissões novas (pp. 18 e 19)
    carta('hi-a18', '🧵', 'Profissões da atualidade (1 de 2)', 18, [
      { t: 'texto', texto: 'Apesar de algumas profissões do passado não existirem mais, outras conseguiram se adaptar às mudanças e continuam sendo muito importantes para a sociedade.' },
      { t: 'texto', texto: 'A profissão de costureiro, por exemplo, é uma das mais antigas do mundo. No passado, os profissionais de costura faziam o trabalho à mão, usando agulha e linha para criar roupas sob medida para as pessoas. Quando as máquinas de costura foram inventadas, o trabalho dos costureiros ficou muito mais rápido.' },
      { t: 'fonte', texto: 'MILLET, Jean-François. Mulher costurando à luz de lamparina. 1852. 1 óleo sobre tela, 100,6 x 81,9 cm. Detalhe.' },
    ]),
    carta('hi-a18b', '🧵', 'Profissões da atualidade (2 de 2)', 18, [
      { t: 'texto', texto: 'Atualmente, os costureiros usam várias tecnologias modernas para criar modelos, costurar e cortar tecidos. Essa profissão continua muito importante, pois, além de criar roupas novas, os costureiros ajustam e consertam peças.' },
      { t: 'figuras', itens: [{ img: '🧵', legenda: 'Costureira utilizando máquina de costura para bordar uma peça de roupa.' }] },
    ]),
    carta('hi-a19', '💻', 'Profissões novas (1 de 2)', 19, [
      { t: 'texto', texto: 'Nos últimos anos, surgiram várias profissões novas. Isso aconteceu porque as necessidades das pessoas mudaram com o tempo.' },
      { t: 'texto', texto: 'Com o avanço da tecnologia, as pessoas descobrem novas maneiras de fazer as coisas, e isso faz com que novos tipos de trabalho sejam necessários.' },
      { t: 'figuras', itens: [{ img: '💻', legenda: 'Programadora em seu local de trabalho utilizando tecnologias variadas.' }] },
      { t: 'texto', texto: 'Com o surgimento da internet, várias profissões começaram a existir, como analista de mídias sociais, desenvolvedor de aplicativos, cientista de dados etc.' },
    ]),
    carta('hi-a19b', '👵', 'Profissões novas (2 de 2)', 19, [
      { t: 'figuras', itens: [{ img: '👵', legenda: 'Cuidador de idosos na prática de sua profissão.' }] },
      { t: 'texto', texto: 'Outra profissão que se tornou cada vez mais importante é a de cuidador de idosos. Isso aconteceu porque, com a criação de novos medicamentos, vacinas e tecnologias da saúde, as pessoas passaram a viver por mais tempo. Com isso, mais pessoas se profissionalizaram e se tornaram cuidadores de idosos.' },
      { t: 'quadro', texto: 'O trabalho é uma atividade humana que evolui de acordo com as necessidades da sociedade e com as tecnologias que se desenvolvem. Por isso, algumas profissões que eram necessárias no passado podem deixar de existir, enquanto outras profissões podem se adaptar e novas profissões podem surgir.' },
    ]),

    // dicas e profissões, trabalho infantil e entrevista (pp. 20 a 22)
    carta('hi-a20', '🧑‍🏫', ORGANIZANDO, 20, [
      { t: 'texto', texto: 'Leia as dicas a seguir e ligue cada uma delas à profissão certa.' },
      { t: 'lista', itens: [
        { termo: 'Marceneiro(a)', texto: 'um homem de avental numa oficina de madeira.' },
        { termo: 'Professor(a)', texto: 'uma moça sorrindo diante da lousa.' },
        { termo: 'Sapateiro(a)', texto: 'mãos trabalhando um sapato de couro.' },
        { termo: 'Relojoeiro(a)', texto: 'um senhor de óculos consertando um relógio na bancada.' },
      ] },
    ]),
    carta('hi-a21', '🚫', 'Saberes em ação (1 de 2)', 21, [
      { t: 'quadro', texto: 'Você sabia que, antigamente, as crianças tinham que trabalhar desde pequenas? Muitas vezes, elas faziam trabalhos difíceis e perigosos.\nIsso acontecia porque as pessoas não sabiam que as crianças precisam de cuidados especiais. Elas achavam normal uma criança trabalhar, mas hoje sabemos que isso está errado, criança não deve trabalhar. Por isso, o trabalho de crianças é proibido por lei no Brasil.' },
    ]),
    carta('hi-a21b', '🚫', 'Saberes em ação (2 de 2)', 21, [
      { t: 'texto', texto: 'Hoje, entendemos que a infância é uma fase importante da vida e que precisa de muita atenção. Nessa etapa, as crianças devem brincar, estudar e aprender coisas novas para crescerem saudáveis e felizes.' },
      { t: 'texto', texto: 'Porém, ainda existem situações em que crianças trabalham. Portanto, é necessário combater o trabalho infantil. Fale sobre isso com a sua família, seus professores e seus colegas. Todo mundo pode ajudar a proteger as crianças.' },
      { t: 'figuras', itens: [{ img: '🚫', legenda: 'Crianças segurando uma faixa: NÃO AO TRABALHO INFANTIL.' }] },
    ]),
    carta('hi-a22', '📋', 'Testando as ideias', 22, [
      { t: 'texto', texto: 'Escolha alguém da sua família para entrevistar. Depois, preencha as informações abaixo sobre essa pessoa.' },
      { t: 'lista', itens: [
        { texto: 'Nome:' },
        { texto: 'Profissão:' },
        { texto: 'Sua profissão existia no passado? Sim ou Não.' },
        { texto: 'Por quais mudanças a sua profissão passou ao longo do tempo?' },
        { texto: 'Do que você mais gosta em sua profissão?' },
      ] },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Reconhecer que algumas profissões deixaram de existir ao longo do tempo.' },
        { texto: 'Perceber que algumas profissões se adaptaram às novas tecnologias e ainda são muito importantes na atualidade.' },
        { texto: 'Entender que as profissões podem mudar por causa das novas tecnologias ou das necessidades das pessoas.' },
      ] },
    ]),
  ]);
})();
