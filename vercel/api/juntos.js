/* /api/juntos (docs/contratos/juntos.md §3): os servidores de "Jogar juntos", como no PKXD.
   POST { acao: 'criar', login, nome } → cria e devolve o código do servidor.
   POST { acao: 'fechar', login, codigo } → só o dono fecha (403 para os outros).
   GET ?codigo=XXXX → confere se o servidor está aberto (é o que o convite faz antes de entrar).
   A presença de cada um (quem está e onde) fica em /api/presenca, sempre presa ao servidor. */
const b = require('../lib/banco');
const j = require('../lib/juntos');

module.exports = async (req, res) => {
  b.cabecalhos(res);
  try {
    if (req.method === 'GET') {
      const codigo = j.normalizar(new URL(req.url, 'http://x').searchParams.get('codigo'));
      if (!j.valido(codigo)) return b.json(res, 400, { erro: 'codigo' });
      const servidor = await b.lerJuntos(codigo);
      if (!servidor) return b.json(res, 404, { erro: 'servidor' });
      await b.tocarJuntos(codigo);   // quem abriu o convite conta como alguém dentro
      return b.json(res, 200, { servidor: servidor });
    }
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
    const corpo = await b.lerCorpo(req, 4e3);
    let d = null;
    try { d = JSON.parse(corpo); } catch (e) { /* inválido */ }
    const pedido = j.lerPedido(d);
    if (!pedido) return b.json(res, 400, { erro: 'pedido' });
    if (pedido.acao === 'criar') {
      const servidor = await b.criarJuntos(pedido.login, pedido.nome);
      if (!servidor) return b.json(res, 503, { erro: 'sem-codigo' });
      return b.json(res, 201, { servidor: servidor });
    }
    const fechou = await b.fecharJuntos(pedido.login, pedido.codigo);
    return b.json(res, fechou ? 200 : 403, fechou ? { ok: true } : { erro: 'dono' });
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    return res.end();
  }
};
