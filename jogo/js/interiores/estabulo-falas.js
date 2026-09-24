/* Estábulo Mágico: tudo o que o Seu Feno e os objetos dizem (gravado com a voz de cada um).
   A frase de cada unicórnio já está gravada no deck; os nomes que ela dá só aparecem na tela. */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.estabulo = {
  npcs: {
    // tratador: abre o Estábulo (coleção, montar, renomear)
    feno: {
      oi: ['Oi! Eu sou o Seu Feno. 🐴', 'Cuido de todos os unicórnios.'],
      nova: ['Vamos ver sua coleção? 🦄', 'Quer visitar seus amiguinhos?'],
      depois: ['Seus unicórnios estão felizes!', 'Que visita mais carinhosa! 💛'],
    },
  },
  objetos: {
    'ninho': ['O ninho quentinho de palha. 🥚', 'Aqui os ovinhos descansam.'],
    'cocho': ['Água fresquinha e brilhante! 💧', 'Os unicórnios bebem aqui.'],
    'cenouras': ['Um saco de cenouras! 🥕', 'O lanche preferido deles.'],
    'escovas': ['As escovas de crina! 🪮', 'Escovar com calma é carinho.'],
    'vitral': ['Um vitral de unicórnio! 🌈', 'Ele brilha quando faz sol.'],
  },
};
