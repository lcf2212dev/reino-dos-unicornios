/* Observatório: tudo o que a Doutora Vega, o Robô Cosmo e os objetos dizem (gravado com a voz de cada um),
   as curiosidades do espaço (cada uma conferida numa fonte oficial, com a URL no comentário) e as piadas
   do Cosmo. Cada página é uma frase inteira com até 30 letras (sem contar «» e emoji) e 3+ palavras.
   Sem DOM no carregamento: ferramentas/listar-falas.js e validar-interiores.js carregam este arquivo num vm.

   Reino.Observatorio sorteia sem repetir na sessão (a memória fica só aqui, nada vai para o save). */
(function () {
  var R = window.Reino;
  R.FALAS_INTERIORES = R.FALAS_INTERIORES || {};

  var OBS = R.FALAS_INTERIORES.observatorio = {
    npcs: {
      // a astrônoma, guia do Observatório: conta curiosidades (voz npc-vega)
      vega: {
        oi: ['Olá, eu sou a Doutora Vega! 🔭', 'Eu estudo as estrelas do céu.'],
        nova: ['Quer ouvir uma curiosidade? ✨', 'Vamos descobrir o céu juntas?', 'Eu tenho um segredo do espaço!'],
        depois: ['Volte para olhar o céu! 🌙', 'O céu tem muitos segredos.', 'Até logo, pequena astrônoma! ⭐'],
      },
      // o ajudante engraçado: conta piadas (voz npc-cosmo, com efeito de robô)
      cosmo: {
        oi: ['Bip bop, eu sou o Robô Cosmo! 🤖', 'Minha bateria está feliz!'],
        nova: ['Você quer ouvir uma piada, bip?', 'Carreguei uma piada nova!', 'Processando uma piada boa!'],
        depois: ['Minha bateria riu muito, bip!', 'Tchau, tchau, até logo, bip!', 'Volte logo, bip bop, bip bop!'],
      },
    },

    // falas curtas dos objetos sem ação (voz narradora), se o interior quiser
    objetos: {},   // os objetos do Observatório contam curiosidades (ação), sem fala própria

    // nomes para placas e balões (Plutão é planeta-anão)
    nomes: {
      sol: 'Sol', mercurio: 'Mercúrio', venus: 'Vênus', terra: 'Terra', marte: 'Marte',
      jupiter: 'Júpiter', saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno',
      plutao: 'Plutão, o planeta-anão', lua: 'Lua',
      telescopio: 'Telescópio', foguete: 'Foguete', traje: 'Traje de astronauta',
      'pedra-lua': 'Pedra da Lua', meteorito: 'Meteorito', 'mapa-constelacoes': 'Mapa das constelações',
    },

    // nomes dos temas (para botões ou títulos, se o interior quiser)
    nomesTemas: {
      sol: 'Sol', lua: 'Lua', mercurio: 'Mercúrio', venus: 'Vênus', terra: 'Terra', marte: 'Marte',
      jupiter: 'Júpiter', saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno', plutao: 'Plutão',
      estrelas: 'Estrelas', constelacoes: 'Constelações', astronautas: 'Astronautas',
      foguetes: 'Foguetes', cometas: 'Cometas', galaxias: 'Galáxias',
    },

    curiosidades: [
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/
      { id: 'sol-estrela', tema: 'sol', paginas: ['O Sol é uma estrela.', 'Ele é uma bola de gás quente.', 'Nunca olhe direto para ele.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/
      { id: 'sol-tamanho', tema: 'sol', paginas: ['O Sol é enorme!', 'Pense em cem Terras em fila.', 'A fila tem a largura do Sol!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/
      { id: 'sol-luz', tema: 'sol', paginas: ['A luz do Sol viaja rápido.', 'Mas ela leva uns oito minutos.', 'Só então chega até nós!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-sun/en/
      { id: 'sol-forca', tema: 'sol', paginas: ['O Sol tem uma força enorme.', 'Ela segura os planetas.', 'Todos giram em volta dele!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-luz', tema: 'lua', paginas: ['A Lua não tem luz própria.', 'Ela reflete a luz do Sol!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-mesmo-lado', tema: 'lua', paginas: ['A Lua gira em volta da Terra.', 'Vemos sempre o mesmo lado!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-crateras', tema: 'lua', paginas: ['A Lua tem muitas crateras.', 'Lá não tem vento.', 'Então as marcas ficam!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-pulo', tema: 'lua', paginas: ['Na Lua, tudo pesa menos.', 'Dá para pular bem alto!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-astronautas', tema: 'lua', paginas: ['Astronautas já foram à Lua!', 'Eles andaram no chão dela.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-fases', tema: 'lua', paginas: ['A Lua parece mudar de forma.', 'São as fases da Lua!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mercury/en/
      { id: 'mercurio-menor', tema: 'mercurio', paginas: ['Mercúrio é o menor planeta.', 'Ele é o mais perto do Sol!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mercury/en/
      { id: 'mercurio-ano', tema: 'mercurio', paginas: ['Um ano em Mercúrio é curto.', 'Dura oitenta e oito dias!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mercury/en/
      { id: 'mercurio-crateras', tema: 'mercurio', paginas: ['O chão de Mercúrio é duro.', 'Ele é cheio de crateras!'] },

      // fonte 2: NASA Space Place — https://spaceplace.nasa.gov/all-about-mercury/en/
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/en/
      { id: 'venus-quente', tema: 'venus', paginas: ['Vênus é o planeta mais quente.', 'Mais quente até que Mercúrio!', 'Ele tem nuvens bem grossas.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/en/
      { id: 'venus-contrario', tema: 'venus', paginas: ['Vênus gira ao contrário.', 'Lá o Sol nasce no oeste!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/en/
      { id: 'venus-dia', tema: 'venus', paginas: ['Em Vênus, o dia é bem longo.', 'Um dia dura mais que um ano!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/en/
      { id: 'venus-tamanho', tema: 'venus', paginas: ['Vênus e a Terra são parecidas.', 'Têm quase o mesmo tamanho!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/
      { id: 'terra-vida', tema: 'terra', paginas: ['A Terra é a nossa casa.', 'Só nela sabemos que há vida!', 'Tem plantas, bichos e você!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/
      { id: 'terra-agua', tema: 'terra', paginas: ['A Terra tem muita água!', 'Tem mais mar do que chão!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/
      { id: 'terra-terceira', tema: 'terra', paginas: ['A Terra é o terceiro planeta.', 'Antes vêm Mercúrio e Vênus.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/
      { id: 'terra-ano', tema: 'terra', paginas: ['A Terra gira em volta do Sol.', 'Cada volta dura um ano!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/
      { id: 'terra-dia', tema: 'terra', paginas: ['A Terra gira como um pião.', 'Cada giro é um dia!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-earth/en/
      { id: 'terra-ar', tema: 'terra', paginas: ['O ar cobre a Terra.', 'Ele mantém a Terra quentinha.'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mars/
      { id: 'marte-ferrugem', tema: 'marte', paginas: ['Marte é o planeta vermelho.', 'O chão dele tem ferrugem!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/volcanoes/en/
      { id: 'marte-vulcao', tema: 'marte', paginas: ['Marte tem um vulcão gigante.', 'O maior do Sistema Solar!', 'Ele se chama Monte Olimpo.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mars/
      { id: 'marte-tamanho', tema: 'marte', paginas: ['Marte é menor que a Terra.', 'Tem metade da largura dela.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-mars/
      { id: 'marte-robos', tema: 'marte', paginas: ['Robôs passeiam por Marte!', 'Eles tiram fotos de lá.'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-jupiter/
      { id: 'jupiter-maior', tema: 'jupiter', paginas: ['Júpiter é o maior planeta.', 'Ele é uma bola de gás.', 'Não dá para pisar nele!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-jupiter/
      { id: 'jupiter-mancha', tema: 'jupiter', paginas: ['Júpiter tem uma mancha.', 'Ela é uma tempestade gigante!', 'Ela é maior que a Terra.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-jupiter/
      { id: 'jupiter-dia', tema: 'jupiter', paginas: ['Um dia em Júpiter é curtinho.', 'Dura só umas dez horas.'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-saturn/
      { id: 'saturno-aneis', tema: 'saturno', paginas: ['Saturno tem anéis lindos.', 'Eles são de gelo e pedra.'] },
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Nuestro_Universo/Planetas_y_lunas/Saturno_-_el_gigante_gaseoso
      { id: 'saturno-leve', tema: 'saturno', paginas: ['Saturno é leve para o tamanho.', 'Numa piscina gigante, boiaria!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-saturn/
      { id: 'saturno-galileu', tema: 'saturno', paginas: ['Galileu viu Saturno na luneta.', 'Achou que ele tinha alças!', 'Eram os anéis de Saturno!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-uranus/
      { id: 'urano-deitado', tema: 'urano', paginas: ['Urano gira deitado de lado.', 'Nenhum outro planeta é assim!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-uranus/
      { id: 'urano-azul', tema: 'urano', paginas: ['Urano tem uma cor azul.', 'O gás metano faz essa cor.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-uranus/
      { id: 'urano-ano', tema: 'urano', paginas: ['Um ano em Urano é longo.', 'Dura oitenta e quatro anos!'] },

      // fonte 2: NASA Space Place — https://spaceplace.nasa.gov/all-about-neptune/
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Nuestro_Universo/Planetas_y_lunas/Neptuno
      { id: 'netuno-ventos', tema: 'netuno', paginas: ['Netuno tem ventos fortes.', 'E grandes tempestades também!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-neptune/
      { id: 'netuno-longe', tema: 'netuno', paginas: ['Netuno é o oitavo planeta.', 'Ele é o mais distante do Sol!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-neptune/
      { id: 'netuno-ano', tema: 'netuno', paginas: ['O ano de Netuno é enorme!', 'Passa de cem anos da Terra.'] },
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Nuestro_Universo/Planetas_y_lunas/Neptuno
      { id: 'netuno-descoberta', tema: 'netuno', paginas: ['Cientistas fizeram contas.', 'Assim acharam Netuno no céu!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-pluto/
      { id: 'plutao-anao', tema: 'plutao', paginas: ['Plutão é um planeta-anão.', 'Ele mora bem longe do Sol.', 'Lá tem muitos mundos gelados.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-pluto/
      { id: 'plutao-coracao', tema: 'plutao', paginas: ['Plutão tem um coração!', 'Ele é uma área bem clarinha.'] },
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Nuestro_Universo/Planetas_y_lunas/Pluton
      { id: 'plutao-pequeno', tema: 'plutao', paginas: ['Plutão é menor que a Lua.', 'Ele é pequeno e gelado!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/sun-compare/en/
      { id: 'estrelas-sol', tema: 'estrelas', paginas: ['Nosso Sol tem tamanho médio.', 'Há estrelas maiores que ele.', 'E há estrelas menores também.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/star-cookies/en/
      { id: 'estrelas-cores', tema: 'estrelas', paginas: ['Estrelas têm cores diferentes.', 'As azuis são as mais quentes.', 'As vermelhas são mais frias.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/nebula/en/
      { id: 'estrelas-bercario', tema: 'estrelas', paginas: ['Estrelas nascem em nuvens.', 'São nuvens de poeira e gás.', 'Há nuvens que são berçários!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/meteor-shower/en/
      { id: 'estrelas-cadente', tema: 'estrelas', paginas: ['Estrela cadente não é estrela!', 'Ela é um meteoro no céu!', 'O ar em volta dele brilha.'] },
      // fonte 2: NASA StarChild — https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question26.html
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/review/cosmic-colors/hubble.html
      { id: 'estrelas-piscam', tema: 'estrelas', paginas: ['Por que a estrela pisca?', 'A luz dela passa pelo ar.', 'O ar mexe, e a luz balança!'] },

      // fonte 2: Agência Espacial Brasileira — https://www.gov.br/aeb/pt-br/centrais-de-conteudo/publicacoes/instagram-do-periodo-de-defeso-eleitoral-2022/curiosidades-do-espaco-bandeira-nacional-e-constelacoes
      // fonte: NASA JPL — https://www.jpl.nasa.gov/images/pia13442-dark-reflections-in-the-southern-cross/
      { id: 'constelacoes-cruzeiro', tema: 'constelacoes', paginas: ['O Cruzeiro do Sul é uma cruz.', 'Ele está na nossa bandeira!', 'Vemos bem no Hemisfério Sul.'] },
      // fonte: Agência Espacial Brasileira — https://www.gov.br/aeb/pt-br/centrais-de-conteudo/publicacoes/instagram-do-periodo-de-defeso-eleitoral-2022/curiosidades-do-espaco-bandeira-nacional-e-constelacoes
      { id: 'constelacoes-bandeira', tema: 'constelacoes', paginas: ['A bandeira mostra um céu.', 'Ele é o céu do Rio de Janeiro.', 'Foi no dia da República!'] },
      // fonte: Agência Espacial Brasileira — https://www.gov.br/aeb/pt-br/centrais-de-conteudo/publicacoes/instagram-do-periodo-de-defeso-eleitoral-2022/curiosidades-do-espaco-bandeira-nacional-e-constelacoes
      { id: 'constelacoes-estados', tema: 'constelacoes', paginas: ['Nossa bandeira tem estrelas.', 'Elas lembram nossos estados.', 'E também o Distrito Federal.'] },
      // fonte 2: USP São Carlos — https://saocarlos.usp.br/aprenda-mais-sobre-a-constelacao-de-orion-as-tres-marias-e-sua-familia-estelar-no-sessao-astronomia-deste-sabado/
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/constellations/en/
      { id: 'constelacoes-tres-marias', tema: 'constelacoes', paginas: ['As Três Marias são estrelas.', 'Elas ficam em fila no céu.', 'São o cinto do caçador Órion.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/constellations/en/
      { id: 'constelacoes-desenhos', tema: 'constelacoes', paginas: ['Estrelas formam desenhos.', 'Esses desenhos têm nomes.', 'São as constelações!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/constellations/en/
      { id: 'constelacoes-oitenta-e-oito', tema: 'constelacoes', paginas: ['O céu tem muitas constelações.', 'São oitenta e oito ao todo!'] },

      // fonte 2: Agência Brasil (o segundo brasileiro foi em 2022) — https://agenciabrasil.ebc.com.br/geral/noticia/2022-06/engenheiro-e-o-segundo-brasileiro-viajar-ao-espaco
      // fonte: NASA — https://www.nasa.gov/history/space-station-20th-space-flight-participants/
      { id: 'astronautas-marcos-pontes', tema: 'astronautas', paginas: ['Marcos Pontes foi ao espaço!', 'Ele foi o primeiro do Brasil!', 'Foi em dois mil e seis.'] },
      // fonte: NASA — https://www.nasa.gov/history/space-station-20th-space-flight-participants/
      { id: 'astronautas-pontes-estacao', tema: 'astronautas', paginas: ['Marcos Pontes foi à estação.', 'Aquela estação lá no espaço!', 'Ficou oito dias e fez ciência!'] },
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Vida_en_el_Espacio/Vivir_en_el_espacio/El_sueno_en_el_espacio
      { id: 'astronautas-saco-de-dormir', tema: 'astronautas', paginas: ['Astronautas dormem em sacos.', 'O saco fica preso na parede!', 'Assim, ninguém fica flutuando!'] },
      // fonte 2: NASA — https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Vida_en_el_Espacio/Vivir_en_el_espacio/Dormir_en_la_ISS
      { id: 'astronautas-dezesseis-sois', tema: 'astronautas', paginas: ['A estação dá voltas na Terra.', 'Quem está lá vê o Sol nascer.', 'São dezesseis vezes por dia!'] },
      // fonte 2: NASA — https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
      // fonte: NASA — https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-the-international-space-station-grades-k-4/
      { id: 'astronautas-estacao-gigante', tema: 'astronautas', paginas: ['A estação espacial é enorme!', 'Ela cobre um campo de futebol!'] },
      // fonte 2: NASA — https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
      // fonte: NASA — https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-the-international-space-station-grades-k-4/
      { id: 'astronautas-casa-no-espaco', tema: 'astronautas', paginas: ['A estação é uma casa espacial.', 'Sempre tem gente morando lá!'] },
      // fonte: ESA Kids — https://www.esa.int/kids/es/Aprende/Vida_en_el_Espacio/Astronautas/Entrenamiento_para_astronautas
      { id: 'astronautas-treino-na-agua', tema: 'astronautas', paginas: ['Astronautas treinam muito!', 'Eles aprendem a mergulhar.', 'Muitos aprendem russo também.'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/launching-into-space/en/
      { id: 'foguetes-empurrao-de-gas', tema: 'foguetes', paginas: ['O foguete joga gás para baixo.', 'E ele sobe para o outro lado!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/launching-into-space/en/
      { id: 'foguetes-mais-forte-que-a-gravidade', tema: 'foguetes', paginas: ['A gravidade puxa para baixo.', 'O foguete empurra mais forte!', 'Por isso ele sobe ao céu.'] },
      // fonte: NASA — https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-a-rocket-grades-k-4/
      { id: 'foguetes-sem-ar', tema: 'foguetes', paginas: ['O foguete não precisa de ar.', 'Ele leva tudo o que precisa.', 'Por isso voa no espaço!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/launching-into-space/en/
      { id: 'foguetes-janela-para-marte', tema: 'foguetes', paginas: ['Quer ir a Marte de foguete?', 'Tem que esperar a hora certa.', 'Isso é a cada dois anos!'] },
      // fonte: Agência Espacial Brasileira — https://www.gov.br/aeb/pt-br/acoes-e-programas/aplicacoes-espaciais/infraestrutura-de-solo/centros-de-lancamento
      { id: 'foguetes-alcantara', tema: 'foguetes', paginas: ['O Brasil lança foguetes!', 'A base fica em Alcântara.', 'Pertinho da linha do Equador!'] },
      // fonte 2: MundoGEO (ainda em órbita em 2026) — https://mundogeo.com/2026/03/02/satelite-amazonia-1-completa-cinco-anos-em-orbita/
      // fonte: INPE — https://www.gov.br/inpe/pt-br/programas/amazonia1/sobre-o-satelite/sobre-o-satelite
      { id: 'foguetes-amazonia-um', tema: 'foguetes', paginas: ['O Brasil fez um satélite!', 'Ele se chama Amazônia Um.', 'Ele fotografa a floresta!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/comets/en/
      { id: 'cometas-gelo', tema: 'cometas', paginas: ['Cometas são bolas geladas.', 'São feitos de gelo e poeira.', 'Eles giram em volta do Sol.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/comets/en/
      { id: 'cometas-cauda', tema: 'cometas', paginas: ['Perto do Sol, o gelo vira gás.', 'Forma uma nuvem, a coma.', 'E surge uma cauda brilhante!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/comets/en/
      { id: 'cometas-duas-caudas', tema: 'cometas', paginas: ['Cometas têm duas caudas!', 'Uma de poeira e outra de gás.', 'Apontam para longe do Sol.'] },
      // fonte: ESA Kids — https://www.esa.int/kids/en/learn/Our_Universe/Comets_and_meteors/Mission_complete_Rosetta
      { id: 'cometas-rosetta', tema: 'cometas', paginas: ['Uma nave visitou um cometa!', 'Ela se chamava Rosetta.', 'E pousou um robô nele!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/meteor-shower/en/
      { id: 'cometas-chuva-meteoros', tema: 'cometas', paginas: ['Cometas soltam poeirinha.', 'A Terra passa por ela.', 'E vemos chuva de meteoros!'] },

      // fonte: NASA Space Place — https://spaceplace.nasa.gov/galaxy/en/
      { id: 'galaxias-via-lactea', tema: 'galaxias', paginas: ['Moramos na Via Láctea.', 'Ela é uma galáxia enorme.', 'Tem bilhões de estrelas!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/galaxy/en/
      { id: 'galaxias-formas', tema: 'galaxias', paginas: ['Há galáxias como cata-ventos.', 'Outras são ovais e lisas.', 'E outras não têm forma certa.'] },
      // fonte 2: ESA — https://www.esa.int/ESA_Multimedia/Images/2015/02/Exploring_the_colours_of_the_Small_Magellanic_Cloud
      // fonte: NASA APOD — https://apod.nasa.gov/apod/ap081219.html
      { id: 'galaxias-magalhaes', tema: 'galaxias', paginas: ['Há galáxias vizinhas da nossa.', 'São as Nuvens de Magalhães.', 'Dá para ver no céu do Sul!'] },
    ],

    // piadas gentis do Robô Cosmo (pergunta e resposta; ninguém é alvo)
    piadas: [
      { id: 'lua-cheia', paginas: ['Por que a Lua não tem fome?', 'Porque ela já está cheia!'] },
      { id: 'estrela-estuda', paginas: ['Por que a estrela estuda?', 'Para ficar mais brilhante!'] },
      { id: 'saturno-vaidoso', paginas: ['Qual é o planeta vaidoso?', 'Saturno, cheio de anéis!'] },
      { id: 'lua-obrigada', paginas: ['O que a Lua disse ao Sol?', 'Obrigada pela luz emprestada!'] },
      { id: 'astronauta-calmo', paginas: ['Por que o astronauta é calmo?', 'Porque ele tem muito espaço!'] },
      { id: 'robo-chips', paginas: ['Qual é o lanche do robô?', 'Sanduíche de parafuso, bip!'] },
      { id: 'terra-fofa', paginas: ['Qual é o planeta mais fofo?', 'A Terra, porque tem você!'] },
      { id: 'cometa-penteado', paginas: ['Qual é o penteado do cometa?', 'Um rabo de cavalo brilhante!'] },
      { id: 'terra-abraco', paginas: ['O que a Terra deu para a Lua?', 'Um abraço bem apertado!'] },
      { id: 'robo-escuro', paginas: ['O que o robô faz no escuro?', 'Acende os olhos de lanterna!'] },
      { id: 'estrela-robo', paginas: ['O que a estrela disse ao robô?', 'Você também é brilhante!'] },
      { id: 'foguete-alegre', paginas: ['Como o foguete fica alegre?', 'Ele dá um pulo até o céu!'] },
      { id: 'robo-danca', paginas: ['Qual é a dança do robô?', 'A dança do robô, bip bop!'] },
      { id: 'robo-memoria', paginas: ['Onde o robô guarda piadas?', 'Na memória de risadas, bip!'] },
    ],

    extras: [],
  };

  // ---- extras: cada página falada fora do balão do NPC (curiosidades: Vega; piadas: Cosmo) ----
  // montado aqui no fim, depois das listas; o orquestrador acrescenta curiosidades acima.
  (function montarExtras() {
    var vistos = {};
    function add(texto, voz) {
      var k = voz + '|' + texto;
      if (vistos[k]) return;
      vistos[k] = true;
      OBS.extras.push({ texto: texto, voz: voz });
    }
    OBS.curiosidades.forEach(function (c) { c.paginas.forEach(function (p) { add(p, 'npc-vega'); }); });
    OBS.piadas.forEach(function (pd) { pd.paginas.forEach(function (p) { add(p, 'npc-cosmo'); }); });
  })();

  // ---- sorteio sem repetir na sessão ----
  var vistas = {};        // id da curiosidade → true (já contada nesta sessão)
  var ultimaCur = null;   // id da última curiosidade contada
  var piadasVistas = {};
  var ultimaPiada = null;

  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function copia(o) {
    var c = {};
    Object.keys(o).forEach(function (k) { c[k] = Array.isArray(o[k]) ? o[k].slice() : o[k]; });
    return c;
  }

  // escolhe da lista sem repetir; esgotou: zera só a memória dessa lista (sem repetir a última)
  function escolher(lista, memoria, ultima) {
    if (!lista.length) return null;
    var livres = lista.filter(function (x) { return !memoria[x.id]; });
    if (!livres.length) {
      lista.forEach(function (x) { delete memoria[x.id]; });
      livres = lista.length > 1 ? lista.filter(function (x) { return x.id !== ultima; }) : lista.slice();
    }
    var e = sortear(livres);
    memoria[e.id] = true;
    return e;
  }

  R.Observatorio = {
    // temas que têm pelo menos uma curiosidade, na ordem da lista
    temas: function () {
      var out = [];
      OBS.curiosidades.forEach(function (c) { if (out.indexOf(c.tema) < 0) out.push(c.tema); });
      return out;
    },
    // tema 'todas' (ou vazio) = qualquer uma; a memória é a mesma para todos os temas
    curiosidade: function (tema) {
      var lista = (!tema || tema === 'todas') ? OBS.curiosidades
        : OBS.curiosidades.filter(function (c) { return c.tema === tema; });
      var e = escolher(lista, vistas, ultimaCur);
      if (!e) return null;
      ultimaCur = e.id;
      return copia(e);
    },
    piada: function () {
      var e = escolher(OBS.piadas, piadasVistas, ultimaPiada);
      if (!e) return null;
      ultimaPiada = e.id;
      return copia(e);
    },
    // só para testes: zera a memória da sessão
    reiniciar: function () { vistas = {}; ultimaCur = null; piadasVistas = {}; ultimaPiada = null; },
  };
})();
