/* PORTUGUÊS — 2º ano, Volume 3, Língua Portuguesa, Capítulos 8 e 9 (pp. 30 a 80 da apostila).
   Capítulo 8, "Receita de quê?" (pp. 30 a 56); Capítulo 9, "Vi, fiz e relatei!" (pp. 57 a 80).
   Lugar no reino: Casa das Palavras. 5 salas que dividem os 500 Robux, na ordem do livro.
   Fotos em matérias/português/ (IMG_7459 a 7485): duas páginas por foto, deitadas (7459 = pp. 30–31 … 7485 = p. 80);
   a 7465 está de cabeça para baixo, a 7463 tem a p. 41 por cima da 39 e a 7476 é repetição borrada da 7477 (não use).
   Palavras cobertas por escrita ou pintura nas pp. 48, 69, 70 e 78: ficou só o que está legível.
   Salas em p1.js, p2.js, p3.js, p4.js, p5.js e o livro em livro.js (carregados antes deste arquivo, na ordem do
   manifesto; ver conteudo/materias/registro.js). */
Reino.registrarMateria({
  arquivada: true,
  id: 'portugues',
  nome: 'Português',
  emoji: '📝',
  cor: '#e0433f',   // a cor da matéria (docs/contratos/arte.md §22)
  nomeLivro: 'Livro das Letras',
  lugar: {
    nome: 'Casa das Palavras',
    artigo: 'a',   // "até a Casa das Palavras", "as salas da Casa das Palavras" (js/sistemas/falas.js)
    sprite: 'palavras',
    rect: { x: 4, y: 24, w: 5, h: 5 },   // fileira de baixo, a oeste; a porta (6,28) desce até a Avenida do Lago
    placa: 'acima',   // no telhado; a placa do Castelo que desvia do chip dos ovos não cai mais sobre ela (js/motor/cena.js)
    porCima: true,   // entra depois do sorteio dos enfeites: o resto do reino fica igual (js/mundo/mapa.js)
    cores: { parede: '#fff4ec', detalhe: '#39a860' },
  },
  guia: 'Em breve teremos novos conteúdos do quarto bimestre!',

  salas: Reino.salasDa('portugues'),         // p1.js, p2.js, p3.js, p4.js, p5.js, na ordem do manifesto

  /* Livro das Letras: resumos curtos para ler antes ou quando errar. */
  livro: Reino.livroDa('portugues'),         // livro.js

  /* Unicórnios de Português: 1 comum e 1 raro por sala, 2 épicos e o lendário. */
  unicornios:   [
    { id: 'p-pitada', nome: 'Pitada', raridade: 'comum', sala: 'p1',
      cores: { corpo: '#ffe8ec', crina: ['#e8364f', '#7bc86c', '#fff5f7'], chifre: '#ffd166' },
      frase: 'Uma pitada de carinho em cada receita! 🍓' },
    { id: 'p-receitinha', nome: 'Receitinha', raridade: 'raro', sala: 'p1',
      cores: { corpo: '#fff6e0', crina: ['#ff8c42', '#9bd65a', '#ffcf33'], chifre: '#e8364f' },
      frase: 'Primeiro os ingredientes, depois o passo a passo!' },
    { id: 'p-hortela', nome: 'Hortelã', raridade: 'comum', sala: 'p2',
      cores: { corpo: '#eafff2', crina: ['#3fbf7f', '#a8f0c6', '#1f8a5b'], chifre: '#fffbe6' },
      frase: 'Hortelã começa com H... mas o H não faz som! 🌿' },
    { id: 'p-hibisco', nome: 'Hibisco', raridade: 'raro', sala: 'p2',
      cores: { corpo: '#ffe3ee', crina: ['#d6246e', '#ff7aa8', '#7a1f4d'], chifre: '#ffd23f' },
      frase: 'Vamos falar bem baixinho! O H é mudinho: hora, hotel, hibisco.' },
    { id: 'p-ninho', nome: 'Ninho', raridade: 'comum', sala: 'p3',
      cores: { corpo: '#f6ecdc', crina: ['#a0703f', '#f2c14e', '#dbb68a'], chifre: '#8fd3ff' },
      frase: 'No meu ninho mora o NH! 🐣' },
    { id: 'p-xicara', nome: 'Xícara', raridade: 'raro', sala: 'p3',
      cores: { corpo: '#f4faff', crina: ['#2f5fb3', '#f7a1c4', '#ffffff'], chifre: '#c98b4d' },
      frase: 'Xícara é com X, chave é com CH!' },
    { id: 'p-pinguim', nome: 'Pinguim', raridade: 'comum', sala: 'p4',
      cores: { corpo: '#f2f7fb', crina: ['#1d2533', '#ffb627', '#ffffff'], chifre: '#ff9e1b' },
      frase: 'Que frio gostoso aqui! Vamos ver os pinguins saltando? 🐧' },
    { id: 'p-iceberg', nome: 'Iceberg', raridade: 'raro', sala: 'p4',
      cores: { corpo: '#e3f6ff', crina: ['#5cc8e8', '#a3e9ff', '#2c7fb8'], chifre: '#ffffff' },
      frase: 'Sou só a ponta do iceberg... tem muito mais!' },
    { id: 'p-rodinha', nome: 'Rodinha', raridade: 'comum', sala: 'p5',
      cores: { corpo: '#fff1e6', crina: ['#ff4f7b', '#ffd23f', '#4cc9f0'], chifre: '#b5179e' },
      frase: 'Roda, roda, carrossel! Carrossel tem RR! 🎠' },
    { id: 'p-farol', nome: 'Farol', raridade: 'raro', sala: 'p5',
      cores: { corpo: '#fdf6e3', crina: ['#d62828', '#ffffff', '#fcbf49'], chifre: '#ffe169' },
      frase: 'No meu nome, Farol, o L no fim tem som de U!' },
    { id: 'p-douradinha', nome: 'Douradinha', raridade: 'epico', treino: 'ouro',
      cores: { corpo: '#ffe07a', crina: ['#e0a800', '#ff7a59', '#fff4c2'], chifre: '#ffffff', asa: '#fff3c4' },
      frase: 'Brilhei de orgulho: você é ouro nas palavras!' },
    { id: 'p-caprichosa', nome: 'Caprichosa', raridade: 'epico', treino: 'perfeito',
      cores: { corpo: '#f0e6ff', crina: ['#9b5de5', '#f15bb5', '#fee440'], chifre: '#00bbf9', asa: '#f6f0ff' },
      frase: 'Tudo certinho e caprichado! Ficou tudo perfeito!' },
    { id: 'p-rainha-palavras', nome: 'Rainha das Palavras', raridade: 'lendario', materiaCompleta: true,
      cores: { corpo: '#fffaf2', crina: ['#ef476f', '#06d6a0', '#118ab2'], chifre: '#ffd166', asa: '#fdeef4' },
      frase: 'Você aprendeu todas as palavras da Casa! 👑' },
  ],
});
