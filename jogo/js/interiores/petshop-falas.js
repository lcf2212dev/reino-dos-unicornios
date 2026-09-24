/* Pet Shop: tudo o que a Dona Aveia e os objetos dizem (gravado com a voz de cada um).
   As frases de beber (bebeu, semSede) são do Reino.Cuidados (pacote geral): não se repetem aqui.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.petshop = {
  npcs: {
    // dona da Pet Shop: abre a tela das comidinhas (UI.telaPetShop)
    aveia: {
      oi: ['Olá, eu sou a Dona Aveia! 🌾', 'Cuido da comida e da água.'],
      nova: ['Quer ver as comidinhas? 🥕', 'Tenho lanches bem gostosos!'],
      depois: ['Bom apetite para vocês! 💛', 'Volte sempre, viu? 🐾'],
    },
  },
  objetos: {
    'estante': ['A estante das comidinhas! 🌾', 'Tem cenoura, maçã e biscoito.'],
    'bolo': ['Um bolo arco-íris! 🌈', 'Ele enche a barriga inteira.'],
    'aquario': ['Um aquário com peixinhos!', 'Eles nadam o dia inteiro.'],
    'balanca': ['A balança da Pet Shop!', 'Aqui se pesa o feno dourado.'],
    'casinha': ['Uma casinha bem fofinha!', 'Tem almofada lá dentro.'],
    'banheira': ['A banheira de espuma! ✨', 'Banho morninho e cheiroso.'],
    'toalhas': ['Toalhas macias e quentinhas.', 'Para secar a crina toda.'],
  },
  // o bebedouro sem unicórnio para beber (as frases de beber são do Reino.Cuidados)
  extras: [
    { texto: 'Os unicórnios bebem água aqui. 💧', voz: 'narradora' },
  ],
};
