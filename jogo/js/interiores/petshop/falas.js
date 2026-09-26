/* Pet Shop: tudo o que a Dona Aveia e os objetos dizem (gravado com a voz de cada um).
   As frases de beber (bebeu, semSede) e de banho (banhou, jaLimpinho) são do Reino.Cuidados
   (pacote geral): não se repetem aqui.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.petshop = {
  npcs: {
    // dona da Pet Shop: abre a tela das comidinhas (UI.telaPetShop)
    aveia: {
      oi: ['Olá, eu sou a Dona Aveia! 🌾', 'Cuido da comida e da água.', 'E do banho de espuma também! 🛁'],
      nova: ['Quer ver as comidinhas? 🥕', 'Tenho lanches bem gostosos!'],
      depois: ['Bom apetite para vocês! 💛', 'Volte sempre, viu? 🐾', 'Banho de espuma é de graça! 🛁', 'A banheira fica ali do lado! 🛁'],
    },
  },
  objetos: {
    'estante': ['A estante das comidinhas! 🌾', 'Tem cenoura, maçã e biscoito.'],
    'bolo': ['Um bolo arco-íris! 🌈', 'Ele enche a barriga inteira.'],
    'aquario': ['Um aquário com peixinhos!', 'Eles nadam o dia inteiro.'],
    'balanca': ['A balança da Pet Shop!', 'Aqui se pesa o feno dourado.'],
    'casinha': ['Uma casinha bem fofinha!', 'Tem almofada lá dentro.'],
    'toalhas': ['Toalhas macias e quentinhas.', 'Para secar a crina toda.'],
  },
  // o bebedouro e a banheira sem unicórnio (as frases de beber e de banho são do Reino.Cuidados);
  // `para` diz de quem é a fala (o bebedouro usa a primeira)
  extras: [
    { texto: 'Os unicórnios bebem água aqui. 💧', voz: 'narradora' },
    { texto: 'Aqui é o banho dos unicórnios! 🛁', voz: 'narradora', para: 'banheira' },
  ],
};
