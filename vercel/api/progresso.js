/* /api/progresso (a Mariana) e /api/progresso/<login> (rewrite para ?login=): GET/PUT/HEAD do doc do jogador,
   como no servidor de casa. Outro jogador só grava com a conta criada (o jogo cria antes de sincronizar). */
const b = require('../lib/banco');

module.exports = async (req, res) => {
  b.cabecalhos(res);
  const q = new URL(req.url, 'http://x').searchParams.get('login');
  const id = q === null ? b.MARIANA : q;
  if (!b.LOGIN.test(id)) { res.statusCode = 404; return res.end(); }
  try {
    if (req.method === 'HEAD') return res.end();
    if (req.method === 'GET') {
      const dados = await b.lerProgresso(id);
      if (dados === null) { res.statusCode = 404; return res.end(); }
      res.setHeader('Content-Type', 'application/json');
      return res.end(dados);
    }
    if (req.method === 'PUT') {
      if (id !== b.MARIANA && (await b.senhaDe(id)) === null) { res.statusCode = 404; return res.end(); }
      const corpo = await b.lerCorpo(req, 2e6);
      let d = null;
      try { d = JSON.parse(corpo); } catch (e) { /* inválido */ }
      if (!d || typeof d.estado !== 'object') { res.statusCode = 400; return res.end(); }
      await b.gravarProgresso(id, JSON.stringify(d));
      res.statusCode = 204;
      return res.end();
    }
    res.statusCode = 405;
    return res.end();
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    return res.end();
  }
};
