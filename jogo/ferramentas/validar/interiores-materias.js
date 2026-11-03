// Matérias nos prédios (chamado por validar-interiores.js; docs/contratos/conteudo.md §2.7):
//   anfitrioes: matéria dentro de um prédio que já existe (lugar.dentro + lugar.interior). O anfitrião é um prédio do
//     mapa e o interior existe: um andar dela (lugar 'materia:<id>') ou o interior de entrada do próprio anfitrião
//     (lugar = o do anfitrião; ex.: a Língua Portuguesa do 4º bimestre no térreo da Casa das Palavras).
//     Devolve { 'materia:<id>': '<lugar do anfitrião>' }.
//   esperadas: as atividades que cada prédio com interior precisa ter lá dentro: as salas de cada matéria (no lugar do
//     interior dela), o treino de cada uma no Castelo e as provas na Escola. Matéria arquivada (3º bimestre) não precisa
//     de sala no prédio, nem a dona de um prédio cujo térreo passou para outra matéria: a Casa das Palavras não tem mais
//     as do 3º bimestre (o térreo é da Língua Portuguesa; a cópia de teste com o conteúdo histórico também vale).
function anfitrioes(Reino, LUGARES, checar) {
  const ANFITRIAO = {};
  Reino.materias.filter((m) => m.lugar && m.lugar.dentro).forEach((m) => {
    const id = 'materia:' + m.id, l = m.lugar, di = Reino.interiores.find((d) => d.id === l.interior);
    ANFITRIAO[id] = l.dentro;
    const hospede = Reino.materias.find((h) => 'materia:' + h.id === l.dentro);   // o Museu é o lugar de História
    checar(LUGARES.has(l.dentro) && !(hospede && hospede.lugar && hospede.lugar.dentro && hospede.lugar.interior !== l.interior), `${id}: lugar.dentro "${l.dentro}" não é um prédio do mapa`);
    if (!checar(di, `${id}: lugar.interior "${l.interior}" não existe`)) return;
    checar(di.lugar === id || (di.lugar === l.dentro && di.entrada),
      `${id}: o interior "${l.interior}" tem lugar "${di.lugar}" (precisa ser "${id}", um andar dela, ou o de entrada do anfitrião "${l.dentro}")`);
  });
  return ANFITRIAO;
}

function esperadas(Reino) {
  const e = {}, juntar = (l, ks) => { e[l] = (e[l] || []).concat(ks); };
  const interiorDe = (m) => m.lugar && m.lugar.dentro && Reino.interiores.find((d) => d.id === m.lugar.interior);
  const passados = new Map();   // lugar de entrada -> a matéria que agora mora nele
  Reino.materias.forEach((m) => { const d = interiorDe(m); if (d && d.entrada) passados.set(d.lugar, m.id); });
  Reino.materias.forEach((m) => {
    const di = interiorDe(m), l = di ? di.lugar : 'materia:' + m.id;
    if (!m.arquivada && !(passados.has(l) && passados.get(l) !== m.id)) juntar(l, m.salas.map((s) => 'sala:' + s.id));
    juntar('castelo', ['treino:' + m.id]);
  });
  e.escola = Reino.provas.map((p) => 'prova:' + p.id);
  return e;
}

module.exports = { anfitrioes, esperadas };
