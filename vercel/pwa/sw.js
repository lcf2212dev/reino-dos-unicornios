/* Service worker do Reino na Vercel (o app instalado joga 100% sem rede). O montar.js troca ARQUIVOS pela lista
   { caminho: hash } do jogo publicado (index.html, os lotes de script, o CSS, a fonte, os ícones, as vozes), e cada
   deploy gera um sw.js novo. Cada arquivo fica no cache com a chave caminho?v=hash; só o que mudou é baixado.
   Em duas fases, para o jogo funcionar sem rede logo, sem esperar os ~70 MB de vozes:
   - install: guarda o NÚCLEO (tudo menos js/voz/ e as imagens de abertura do iOS). Se algum falhar, a instalação
     tenta de novo na próxima visita, sem perder o que já baixou.
   - activate: apaga do cache o que não é desta versão (a voz velha fica até a nova chegar: sem rede, ela ainda
     serve) e assume as abas abertas.
   - depois de ativo: as vozes e as aberturas em segundo plano, poucas por vez. O navegador para um service worker
     sem eventos; cada mensagem da aba ({ reino: 'continuar' } do index.html montado, { reino: 'como-esta' } da Área
     dos pais) e cada abertura do jogo o mantém baixando por até 4 min, e ele continua de onde parou.
   Conta às abas (mesmo as que ele ainda não controla) quanto já guardou: { reino: 'guardando', feitos, total, fase:
   'install' | 'ativo', falhou? } a cada arquivo e { reino: 'guardado', total, fase } com tudo no cache. A Área dos pais
   mostra isso (jogo/js/ui/sem-internet.js), e pergunta ao ativo ({ reino: 'como-esta' }) ao abrir.
   - fetch: arquivo da lista = do cache (a versão inteira de uma vez: nunca index novo com script velho); voz que
     ainda não chegou = a da versão anterior, se houver; senão rede. api/ e o resto = rede. Com a versão nova no
     controle, o js/versao.json dela muda, e o versao.js do jogo recarrega a aba quando ela está parada no mapa. */
const ARQUIVOS = __ARQUIVOS__;
const CACHE = 'reino-arquivos';
const JUNTOS = 6;          // downloads ao mesmo tempo na instalação
const JUNTOS_FUNDO = 2;    // e em segundo plano (o jogo aberto também usa a rede)
const FATIA_MS = 4 * 60000;   // quanto cada evento segura o service worker vivo baixando

const escopo = new URL(self.registration.scope);
const chave = (caminho) => new URL(caminho + '?v=' + ARQUIVOS[caminho], escopo).href;
const semVersao = (caminho) => new URL(caminho, escopo).href;
const depois = (c) => c.startsWith('js/voz/') || c.startsWith('abertura-');
const TODOS = Object.keys(ARQUIVOS);
const NUCLEO = TODOS.filter((c) => !depois(c));
const FUNDO = TODOS.filter(depois);
const TOTAL = TODOS.length;

// o cache aberto uma vez só
let aberto = null;
const cache = () => aberto || (aberto = caches.open(CACHE));

// aviso a todas as abas deste escopo; aba fechada ou sem ouvinte não atrapalha
async function avisar(msg) {
  try {
    for (const c of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) c.postMessage(msg);
  } catch (e) { /* sem abas */ }
}

// as chaves que já estão no cache (uma leitura só)
async function guardadas() { return new Set((await (await cache()).keys()).map((r) => r.url)); }

// baixa e guarda os caminhos de `lista` que faltam; conta sobre o TOTAL (o que já estava conta como feito)
async function guardar(lista, juntos, fase) {
  const c = await cache(), ja = await guardadas();
  const faltam = lista.filter((x) => !ja.has(chave(x)));
  let feitos = TODOS.filter((x) => ja.has(chave(x))).length;
  if (faltam.length) avisar({ reino: 'guardando', feitos, total: TOTAL, fase });
  let falhou = null;
  async function trabalhador() {
    while (faltam.length) {
      const x = faltam.shift();
      try {
        const r = await fetch(semVersao(x), { cache: 'no-cache' });
        if (!r.ok) throw new Error(x + ': ' + r.status);
        await c.put(chave(x), r);
        // a voz velha (outra versão do mesmo caminho) sai só agora que a nova chegou
        if (depois(x)) for (const v of await c.keys(semVersao(x), { ignoreSearch: true })) if (v.url !== chave(x)) await c.delete(v);
        feitos++;
        avisar({ reino: 'guardando', feitos, total: TOTAL, fase });
      } catch (e) { falhou = e; }
    }
  }
  await Promise.all(Array.from({ length: juntos }, trabalhador));
  if (falhou) {
    avisar({ reino: 'guardando', feitos, total: TOTAL, fase, falhou: true });
    throw falhou;
  }
  if (feitos >= TOTAL) avisar({ reino: 'guardado', total: TOTAL, fase });
}

// voz velha que sobrou (o service worker parou entre guardar a nova e apagar a velha): sai se a nova já está aqui
async function limparSobras() {
  const c = await cache(), ja = await guardadas();
  for (const url of ja) {
    const u = new URL(url), x = decodeURIComponent(u.pathname.slice(escopo.pathname.length));
    if (depois(x) && ARQUIVOS[x] && url !== chave(x) && ja.has(chave(x))) await c.delete(url);
  }
}

// o segundo plano: um só de cada vez; se falhar (rede caiu), o próximo evento recomeça do que falta
let fundo = null, completo = false;
function segundoPlano() {
  if (completo) return Promise.resolve();
  if (!fundo) {
    fundo = limparSobras().catch(() => {}).then(() => guardar(FUNDO, JUNTOS_FUNDO, 'ativo'))
      .then(() => { completo = true; }, () => {})
      .then(() => { fundo = null; });
  }
  return fundo;
}
// segura o service worker vivo enquanto baixa, no máximo FATIA_MS por evento
function seguirBaixando(e) {
  if (completo || (self.serviceWorker && self.serviceWorker.state !== 'activated')) return;   // instalando: depois
  e.waitUntil(Promise.race([segundoPlano(), new Promise((ok) => setTimeout(ok, FATIA_MS))]));
}

self.addEventListener('install', (e) => {
  e.waitUntil(guardar(NUCLEO, JUNTOS, 'install').then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  const limpo = (async () => {
    const validas = new Set(TODOS.map(chave));
    const c = await cache(), ja = await guardadas();
    // fica: o desta versão e a voz velha cuja nova ainda não chegou
    const esperando = new Set(FUNDO.filter((x) => !ja.has(chave(x))).map(semVersao));
    for (const r of await c.keys()) {
      if (validas.has(r.url)) continue;
      const u = new URL(r.url);
      if (esperando.has(u.origin + u.pathname)) continue;
      await c.delete(r);
    }
    await self.clients.claim();
  })();
  e.waitUntil(limpo);
  // as vozes começam logo depois, fora do waitUntil (senão a ativação esperaria por elas)
  limpo.then(segundoPlano, () => {});
});

self.addEventListener('message', (e) => {
  const m = e.data;
  if (!m || (m.reino !== 'como-esta' && m.reino !== 'continuar')) return;
  seguirBaixando(e);
  // a aba pergunta como está a versão que a serve: responde só a ela
  if (m.reino !== 'como-esta' || !e.source) return;
  e.waitUntil(guardadas().then((ja) => {
    const feitos = TODOS.filter((x) => ja.has(chave(x))).length;
    e.source.postMessage(feitos >= TOTAL ? { reino: 'guardado', total: TOTAL, fase: 'ativo' }
      : { reino: 'guardando', feitos, total: TOTAL, fase: 'ativo' });
  }));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== escopo.origin || !url.pathname.startsWith(escopo.pathname)) return;
  let caminho = decodeURIComponent(url.pathname.slice(escopo.pathname.length));
  if (caminho === '') caminho = 'index.html';
  if (!Object.prototype.hasOwnProperty.call(ARQUIVOS, caminho)) return;
  if (req.mode === 'navigate') seguirBaixando(e);
  e.respondWith(cache().then(async (c) => (await c.match(chave(caminho)))
    || (depois(caminho) && await c.match(semVersao(caminho), { ignoreSearch: true }))
    || fetch(req)));
});
