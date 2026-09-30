/* Laboratório de Química, 2º andar: as curiosidades do Salão (Reino.QUIMICA.curiosidades), contadas pelo Professor
   Carbono e pelos objetos do andar (ação quimica-curiosidade). Contrato: docs/contratos/quimica.md §9.
   { id, tema, paginas } — até 30 letras por página, 3+ palavras; cada uma com a fonte e a URL no comentário.
   Temas do contrato: cozinha, corpo, agua, ar-fogo, metais, cores, elementos, cientistas, cristais, brasil.
   Só curiosidade: não dá estrela nem mexe no save. Nada de bicho. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.curiosidades = [
    /* ---------- cozinha ---------- */
    // fonte: Britannica — https://www.britannica.com/topic/popcorn
    { id: 'pipoca', tema: 'cozinha', paginas: ['O milho de pipoca tem água.', 'No calor, ela vira vapor.', 'O vapor estoura o grão. Poc!'] },
    // fonte: Britannica — https://www.britannica.com/topic/baking-powder
    { id: 'fermento-bolo', tema: 'cozinha', paginas: ['O fermento solta bolhinhas.', 'Elas fazem o bolo crescer!'] },
    // fonte: Britannica — https://www.britannica.com/story/why-do-sliced-apples-turn-brown
    { id: 'maca-marrom', tema: 'cozinha', paginas: ['A maçã cortada fica marrom.', 'É o ar mexendo com ela!', 'Umas gotas de limão ajudam.'] },
    // fonte: Britannica — https://www.britannica.com/topic/caramel
    { id: 'caramelo', tema: 'cozinha', paginas: ['O açúcar quente vira caramelo.', 'Fica marrom e bem cheiroso!'] },
    // fonte: Britannica — https://www.britannica.com/topic/egg-food
    { id: 'clara-ovo', tema: 'cozinha', paginas: ['A clara crua é transparente.', 'No calor, ela fica branquinha!', 'E não volta mais a ser crua.'] },
    // fonte: Library of Congress — https://www.loc.gov/everyday-mysteries/item/why-does-chopping-an-onion-make-you-cry/
    { id: 'cebola-choro', tema: 'cozinha', paginas: ['Cortar cebola solta um gás.', 'Ele faz os olhos lacrimejarem.'] },

    /* ---------- corpo ---------- */
    // fonte: USGS — https://www.usgs.gov/special-topics/water-science-school/science/water-you-water-and-human-body
    { id: 'corpo-agua', tema: 'corpo', paginas: ['O seu corpo tem muita água.', 'Mais da metade dele é água!'] },
    // fonte: Britannica — https://www.britannica.com/science/perspiration
    { id: 'suor', tema: 'corpo', paginas: ['O suor seca na sua pele.', 'Assim ele esfria o corpo!'] },
    // fonte: Britannica — https://www.britannica.com/science/gastric-juice
    { id: 'estomago-acido', tema: 'corpo', paginas: ['O estômago tem um ácido forte.', 'Ele ajuda a digerir a comida.'] },
    // fonte: Britannica — https://www.britannica.com/science/calcium
    { id: 'ossos-calcio', tema: 'corpo', paginas: ['Os ossos guardam muito cálcio.', 'O leite tem cálcio para eles!'] },
    // fonte: Britannica — https://www.britannica.com/science/tooth-anatomy
    { id: 'esmalte-dente', tema: 'corpo', paginas: ['O esmalte cobre os dentes.', 'É a parte mais dura do corpo!'] },
    // fonte: Britannica — https://www.britannica.com/science/hemoglobin
    { id: 'sangue-ferro', tema: 'corpo', paginas: ['O sangue tem um pouquinho', 'de ferro dentro dele.', 'Ele ajuda a levar o oxigênio!'] },

    /* ---------- água ---------- */
    // fonte: USGS — https://www.usgs.gov/special-topics/water-science-school/science/how-much-water-there-earth
    { id: 'terra-agua', tema: 'agua', paginas: ['A água cobre a maior parte', 'da superfície da Terra.', 'Quase toda ela é do mar!'] },
    // fonte: Britannica — https://www.britannica.com/science/water
    { id: 'gelo-boia', tema: 'agua', paginas: ['O gelo boia na água.', 'Ele é mais leve que a água!'] },
    // fonte: USGS — https://www.usgs.gov/special-topics/water-science-school/science/water-cycle
    { id: 'chuva-mar', tema: 'agua', paginas: ['O Sol faz a água evaporar.', 'Lá no céu, ela vira nuvem.', 'Depois ela cai como chuva!'] },
    // fonte: Britannica — https://www.britannica.com/science/boiling-point
    { id: 'ferver-montanha', tema: 'agua', paginas: ['No alto de uma montanha,', 'a água ferve com menos calor!'] },
    // fonte: Britannica — https://www.britannica.com/science/water
    { id: 'agua-dissolve', tema: 'agua', paginas: ['A água dissolve muita coisa.', 'Até o sal e o açúcar somem!', 'Mas eles continuam lá dentro.'] },
    // fonte: USGS — https://www.usgs.gov/special-topics/water-science-school/science/how-much-water-there-earth
    { id: 'agua-doce', tema: 'agua', paginas: ['A água doce é bem pouquinha.', 'Por isso não se desperdiça!'] },

    /* ---------- ar e fogo ---------- */
    // fonte: Britannica — https://www.britannica.com/science/fire-combustion
    { id: 'fogo-oxigenio', tema: 'ar-fogo', paginas: ['O fogo precisa de oxigênio.', 'Sem ar, a vela se apaga!'] },
    // fonte: Britannica — https://www.britannica.com/science/atmosphere
    { id: 'ar-mistura', tema: 'ar-fogo', paginas: ['O ar é uma mistura de gases.', 'O que mais tem é nitrogênio!'] },
    // fonte: Britannica — https://www.britannica.com/science/flame
    { id: 'chama-azul', tema: 'ar-fogo', paginas: ['A parte azul da chama', 'é mais quente que a amarela!'] },
    // fonte: Britannica — https://www.britannica.com/technology/candle
    { id: 'vela-cera', tema: 'ar-fogo', paginas: ['A chama derrete a cera.', 'A cera vira gás e queima!', 'É ela que faz a vela brilhar.'] },
    // fonte: Britannica — https://www.britannica.com/science/atmospheric-pressure
    { id: 'ar-peso', tema: 'ar-fogo', paginas: ['O ar tem peso, sabia?', 'Ele aperta tudo em volta!'] },

    /* ---------- metais ---------- */
    // fonte: Britannica — https://www.britannica.com/place/Statue-of-Liberty
    { id: 'estatua-verde', tema: 'metais', paginas: ['Uma estátua famosa é de cobre.', 'Ela ficou verde com o tempo!'] },
    // fonte: Britannica — https://www.britannica.com/science/rust-corrosion
    { id: 'ferrugem', tema: 'metais', paginas: ['O ferro com ar e água', 'vira ferrugem, bem marrom!'] },
    // fonte: Britannica — https://www.britannica.com/science/gold-chemical-element
    { id: 'ouro-brilha', tema: 'metais', paginas: ['O ouro não enferruja.', 'Por isso ele brilha sempre!'] },
    // fonte: Britannica — https://www.britannica.com/science/mercury-chemical-element
    { id: 'mercurio-liquido', tema: 'metais', paginas: ['O mercúrio é um metal líquido.', 'Ele é perigoso: não toque!'] },
    // fonte: Britannica — https://www.britannica.com/science/aluminum
    { id: 'latinha', tema: 'metais', paginas: ['A latinha é de alumínio.', 'Dá para reciclar de novo!'] },
    // fonte: Britannica — https://www.britannica.com/science/copper
    { id: 'fio-cobre', tema: 'metais', paginas: ['Os fios da casa são de cobre.', 'Ele leva bem a eletricidade.'] },

    /* ---------- cores ---------- */
    // fonte: Britannica — https://www.britannica.com/technology/fireworks
    { id: 'fogos-cores', tema: 'cores', paginas: ['Os fogos de artifício', 'têm metais dentro deles.', 'Cada metal dá uma cor!'] },
    // fonte: Britannica — https://www.britannica.com/science/chlorophyll
    { id: 'folha-verde', tema: 'cores', paginas: ['A folha é verde por causa', 'da clorofila, que pega sol!'] },
    // fonte: Britannica — https://www.britannica.com/science/acid-base-indicator
    { id: 'repolho-roxo', tema: 'cores', paginas: ['O suco de repolho roxo', 'fica rosa com o limão!'] },
    // fonte: Britannica — https://www.britannica.com/science/carotene
    { id: 'cenoura-laranja', tema: 'cores', paginas: ['A cenoura é laranja por causa', 'do betacaroteno dela!'] },
    // fonte: USDA Forest Service — https://www.fs.usda.gov/visit/fall-colors/science-of-fall-colors
    { id: 'folhas-outono', tema: 'cores', paginas: ['No outono, o verde some.', 'Aparece o amarelo da folha!'] },
    // fonte: Britannica — https://www.britannica.com/science/lycopene
    { id: 'tomate-vermelho', tema: 'cores', paginas: ['O tomate é vermelho', 'por causa do licopeno!'] },

    /* ---------- elementos ---------- */
    // fonte: IUPAC — https://iupac.org/what-we-do/periodic-table-of-elements/
    { id: 'cento-dezoito', tema: 'elementos', paginas: ['Existem 118 elementos.', 'Todos estão na tabela!'] },
    // fonte: Britannica — https://www.britannica.com/science/hydrogen
    { id: 'hidrogenio-universo', tema: 'elementos', paginas: ['O hidrogênio é o elemento', 'que mais tem no Universo!'] },
    // fonte: NASA — https://science.nasa.gov/sun/facts/
    { id: 'sol-feito', tema: 'elementos', paginas: ['O Sol é feito quase todo', 'de hidrogênio e hélio!'] },
    // fonte: Britannica — https://www.britannica.com/science/oxygen
    { id: 'oxigenio-crosta', tema: 'elementos', paginas: ['O oxigênio é o elemento', 'que mais tem nas rochas!'] },
    // fonte: Britannica — https://www.britannica.com/science/atom
    { id: 'tudo-atomos', tema: 'elementos', paginas: ['Tudo à nossa volta tem átomos.', 'Eles são pequenos demais!', 'Nem a lupa consegue ver.'] },
    // fonte: Britannica — https://www.britannica.com/science/uranium
    { id: 'nome-planeta', tema: 'elementos', paginas: ['O urânio tem esse nome', 'por causa do planeta Urano!'] },

    /* ---------- cientistas ---------- */
    // fonte: Nobel Prize — https://www.nobelprize.org/prizes/physics/1903/marie-curie/biographical/
    { id: 'marie-curie', tema: 'cientistas', paginas: ['A cientista Marie Curie', 'ganhou dois prêmios Nobel!'] },
    // fonte: Britannica — https://www.britannica.com/biography/Dmitri-Mendeleev
    { id: 'mendeleiev', tema: 'cientistas', paginas: ['Mendeleiev montou a tabela.', 'Ele deixou espaços vazios', 'para elementos não achados!'] },
    // fonte: Britannica — https://www.britannica.com/biography/Antoine-Lavoisier
    { id: 'lavoisier', tema: 'cientistas', paginas: ['Lavoisier mostrou que nada', 'se perde: tudo se transforma!'] },
    // fonte: Britannica — https://www.britannica.com/biography/Rosalind-Franklin
    { id: 'rosalind-franklin', tema: 'cientistas', paginas: ['Rosalind Franklin fez fotos', 'de coisas muito pequenas!', 'Ela ajudou a entender o DNA.'] },
    // fonte: Science History Institute — https://www.sciencehistory.org/education/scientific-biographies/stephanie-l-kwolek/
    { id: 'stephanie-kwolek', tema: 'cientistas', paginas: ['Stephanie Kwolek inventou', 'um fio mais forte que o aço!'] },

    /* ---------- cristais ---------- */
    // fonte: Britannica — https://www.britannica.com/science/carbon-chemical-element
    { id: 'diamante-grafite', tema: 'cristais', paginas: ['O diamante é feito de carbono.', 'A ponta do lápis também!'] },
    // fonte: Britannica — https://www.britannica.com/science/halite
    { id: 'sal-cubinhos', tema: 'cristais', paginas: ['O sal tem cristais', 'em forma de cubinhos!'] },
    // fonte: Britannica — https://www.britannica.com/science/snowflake-weather
    { id: 'floco-neve', tema: 'cristais', paginas: ['O floco de neve é um cristal.', 'Ele costuma ter seis pontas!'] },
    // fonte: Britannica — https://www.britannica.com/science/diamond-gemstone
    { id: 'diamante-duro', tema: 'cristais', paginas: ['O diamante é o mais duro', 'de todos os minerais!'] },
    // fonte: Britannica — https://www.britannica.com/science/sucrose
    { id: 'acucar-cristal', tema: 'cristais', paginas: ['O açúcar também é cristal!', 'Olhe com uma lupa forte.'] },
    // fonte: Britannica — https://www.britannica.com/science/quartz
    { id: 'areia-quartzo', tema: 'cristais', paginas: ['A areia da praia tem quartzo,', 'um cristal bem comum!'] },

    /* ---------- Brasil ---------- */
    // fonte: Britannica Kids — https://kids.britannica.com/students/article/mixture/701095
    { id: 'cafe-coado', tema: 'brasil', paginas: ['O café coado é uma separação.', 'O coador segura o pó!', 'Só o líquido passa.'] },
    // fonte: Britannica — https://www.britannica.com/place/Rio-Grande-do-Norte
    { id: 'sal-salinas', tema: 'brasil', paginas: ['O Sol seca a água do mar', 'nas salinas e sobra o sal.', 'O Rio Grande do Norte faz', 'quase todo o sal do Brasil!'] },
    // fonte: SciELO, Ciência e Tecnologia de Alimentos — https://scielo.br/scielo.php?pid=S0101-20612004000400003&script=sci_abstract&tlng=pt
    { id: 'pao-de-queijo', tema: 'brasil', paginas: ['O pão de queijo cresce', 'sem fermento nenhum!', 'Quem faz isso é o vapor!'] },
    // fonte: USGS — https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-niobium.pdf
    { id: 'niobio', tema: 'brasil', paginas: ['O Brasil produz quase todo', 'o nióbio do mundo!', 'Ele deixa o aço mais forte.'] },
    // fonte: Britannica — https://www.britannica.com/science/rubber-chemical-compound
    { id: 'borracha', tema: 'brasil', paginas: ['A borracha vem do látex', 'da seringueira, da Amazônia!'] },
    // fonte: UNICA (União da Indústria de Cana-de-Açúcar) — https://www.sugarcane.org/sugarcane-products/ethanol/flex-fuel/
    { id: 'etanol-cana', tema: 'brasil', paginas: ['Muitos carros aqui andam', 'com o etanol da cana!'] },
  ];
})();
