/* Service worker do Reino na Vercel (o app instalado joga 100% sem rede). O montar.js troca ARQUIVOS pela lista
   { caminho: hash } do jogo publicado (index.html, css, js com as vozes, ícones), e cada deploy gera um sw.js novo.
   - install: guarda no cache cada arquivo que falta (chave caminho?v=hash). Só o que mudou desde o deploy anterior é
     baixado; se algum falhar, a instalação tenta de novo na próxima visita, sem perder o que já baixou.
   - activate: apaga do cache o que não é desta versão e assume as abas abertas.
   - fetch: arquivo da lista = do cache (a versão inteira de uma vez: nunca index novo com script velho); api/ e o
     resto = rede. Com a versão nova no controle, o js/versao.json dela muda, e o versao.js do jogo recarrega a aba
     quando ela está parada no mapa. */
const ARQUIVOS = __ARQUIVOS__;
const CACHE = 'reino-arquivos';
const JUNTOS = 6;

const escopo = new URL(self.registration.scope);
const chave = (caminho) => new URL(caminho + '?v=' + ARQUIVOS[caminho], escopo).href;

async function guardarTudo() {
  const cache = await caches.open(CACHE);
  const faltam = [];
  for (const c of Object.keys(ARQUIVOS)) if (!(await cache.match(chave(c)))) faltam.push(c);
  let falhou = null;
  async function trabalhador() {
    while (faltam.length) {
      const c = faltam.shift();
      try {
        const r = await fetch(new URL(c, escopo).href, { cache: 'no-cache' });
        if (!r.ok) throw new Error(c + ': ' + r.status);
        await cache.put(chave(c), r);
      } catch (e) { falhou = e; }
    }
  }
  await Promise.all(Array.from({ length: JUNTOS }, trabalhador));
  if (falhou) throw falhou;
}

self.addEventListener('install', (e) => {
  e.waitUntil(guardarTudo().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const validas = new Set(Object.keys(ARQUIVOS).map(chave));
    const cache = await caches.open(CACHE);
    for (const r of await cache.keys()) if (!validas.has(r.url)) await cache.delete(r);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== escopo.origin || !url.pathname.startsWith(escopo.pathname)) return;
  let caminho = decodeURIComponent(url.pathname.slice(escopo.pathname.length));
  if (caminho === '') caminho = 'index.html';
  if (!Object.prototype.hasOwnProperty.call(ARQUIVOS, caminho)) return;
  e.respondWith(caches.open(CACHE)
    .then((cache) => cache.match(chave(caminho)))
    .then((r) => r || fetch(req)));
});
