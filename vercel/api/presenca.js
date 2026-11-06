/* /api/presenca (docs/contratos/juntos.md §2 e §3): quem está jogando agora dentro do MEU servidor de "Jogar juntos".
   GET ?servidor=XXXX: a lista de quem está nesse servidor (sem senha: a presença é pública dentro do reino).
   POST: grava onde o jogador está, apaga o que venceu e devolve a lista do servidor dele.
   Sem servidor (quem não criou nem entrou em nenhum) fica sozinho como sempre: a resposta é vazia, sem banco.
   O que entra é reconstruído campo a campo em ../lib/presenca.js; nada do save da Mariana passa por aqui. */
const b = require('../lib/banco');
const p = require('../lib/presenca');
const j = require('../lib/juntos');

module.exports = async (req, res) => {
  b.cabecalhos(res);
  try {
    if (req.method === 'GET') {
      const servidor = j.normalizar(new URL(req.url, 'http://x').searchParams.get('servidor'));
      if (servidor && !j.valido(servidor)) return b.json(res, 400, { erro: 'servidor' });
      const jogadores = servidor && await b.tocarJuntos(servidor) ? await b.lerPresenca(servidor) : [];
      return b.json(res, 200, { agora: Date.now(), ttl: p.TTL_MS, jogadores: jogadores });
    }
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
    const corpo = await b.lerCorpo(req, 4e3);
    let d = null;
    try { d = JSON.parse(corpo); } catch (e) { /* inválido */ }
    const agora = Date.now();
    const m = p.montar(d, agora);
    if (!m) return b.json(res, 400, { erro: 'presenca' });
    const servidor = m.saiu ? m.servidor : m.dados.servidor;
    if (m.saiu) {
      if (servidor) await b.sairPresenca(m.login);   // quem nunca entrou em servidor não tem linha
      return b.json(res, 200, { agora: Date.now(), ttl: p.TTL_MS, jogadores: servidor ? await b.lerPresenca(servidor) : [] });
    }
    if (!servidor) return b.json(res, 200, { agora: agora, ttl: p.TTL_MS, jogadores: [] });   // sozinho
    if (!(await b.tocarJuntos(servidor))) return b.json(res, 404, { erro: 'servidor' });   // o servidor fechou
    const jogadores = await b.gravarPresenca(m.login, servidor, JSON.stringify(m.dados));
    return b.json(res, 200, { agora: Date.now(), ttl: p.TTL_MS, jogadores: jogadores });
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    return res.end();
  }
};
