/* GET /api/jogadores: os logins (a Mariana primeiro); POST: cria { login, senha } (201; 409 se existe; 400 inválido).
   POST /api/jogadores/entrar (rewrite para ?entrar=1): confere a senha (200 certa, 403 errada, 404 não existe).
   As mesmas respostas do servidor de casa. */
const b = require('../lib/banco');

module.exports = async (req, res) => {
  b.cabecalhos(res);
  const entrar = new URL(req.url, 'http://x').searchParams.get('entrar') === '1';
  try {
    if (!entrar && req.method === 'GET') {
      return b.json(res, 200, [b.MARIANA].concat((await b.logins()).filter((l) => l !== b.MARIANA)));
    }
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
    const corpo = await b.lerCorpo(req, 1e4);
    let d = null;
    try { d = JSON.parse(corpo); } catch (e) { /* inválido */ }
    if (!d || typeof d !== 'object') d = null;
    const login = d && typeof d.login === 'string' ? d.login : '';
    const senha = d && typeof d.senha === 'string' ? d.senha : null;
    if (!b.LOGIN.test(login)) return b.json(res, 400, { erro: 'login' });
    if (entrar) {
      const certa = await b.senhaDe(login);
      if (certa === null && login === b.MARIANA) return b.json(res, 200, { ok: true });
      if (certa === null) return b.json(res, 404, { erro: 'nao-existe' });
      return certa === senha ? b.json(res, 200, { ok: true }) : b.json(res, 403, { erro: 'senha' });
    }
    if (senha === null || !senha.length || senha.length > 100) return b.json(res, 400, { erro: 'senha' });
    if (login === b.MARIANA) return b.json(res, 409, { erro: 'existe' });
    return (await b.criarJogador(login, senha)) ? b.json(res, 201, { ok: true }) : b.json(res, 409, { erro: 'existe' });
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    return res.end();
  }
};
