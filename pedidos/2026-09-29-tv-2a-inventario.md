# Inventário da paleta (onda 2a do backlog visual)

Foto de `main f37edf0` (29/09), **recontada na `main 83c4e87`** (depois das ondas 1c e 3e; contrato da 2a): os
números do topo e dos §1 e §5 são de `83c4e87`. A tabela do §2 guarda as linhas de `f37edf0` (ache pelo conteúdo):
ela diz o destino de cada cor, que não muda com a linha.

Como refazer (da raiz da worktree):
```
grep -rnoE '#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)' jogo/css | wc -l                  # ocorrências (83c4e87: 343; 313 fora do :root)
grep -rnE '#(ffd6ec|ff6fae|ffd0e6|ff8fc4|e24c9a|b0508f|ff9aa6|ffe4f4|f1e4ff|ffe0f0|e5d8ff|ffd0ea|d8c6ff|ffc0db|e3d8ff|f6f1ff|cdbff5|b3a6cc|a597bd|b58cff|efe4ff)' jogo/css   # D10-02 (83c4e87: 14 linhas, 1 no :root)
grep -rn '#3a2446\|#2b1233' jogo/css                                                 # D10-14 (83c4e87: 9 linhas e 14 ocorrências fora do :root)
grep -rnE '#(2b5ea8|5b2aa8|a86a00)' jogo/css                                          # D10-13 (83c4e87: 8 linhas fora do :root)
grep -rn 'opacity' jogo/css | wc -l                                                    # D10-B04 (83c4e87: 41)
grep -noE "fill(=|%3D)['\"%27]*[^ '\"]{3,30}" jogo/css/*.css                         # cor dentro de SVG em data: URI
```
Depois da 2a, a conta é o `validar-cores.js` (frente `css`), rodado pelo `npm run validar`.

## 1. Números de `83c4e87` (fora do `:root` de `ui-base`)
- 313 cores literais em 20 CSS: 146 cores distintas, 115 hex (8 deles são os tokens de cuidado do `:root` de
  `ui-petshop`, que ficam; sobram 107, como em `f37edf0`). 82 são `#fff`/`#ffffff`.
- Mudou desde `f37edf0`: `--erro` e `--erro-fundo` já existem no `:root` (3e, D8B-16), mas com `#b3261e` e
  `#ffe3e6`; a 2a os leva aos valores do §10.8 (`#b02c47`, `#ffe0e0`). O anel do ovo (`ui-paineis:91`, SVG) ganhou
  `rgb(157,140,137)` com `fill-opacity` (desenho: fica). A silhueta do álbum de ETs e a `.silhueta` das cartas saíram
  da lista de `opacity` (D10-15: silhueta com contorno).
- **Tintas escuras: 9 hex** (o TODO contava 7; iguais em `83c4e87`): `#3a2446` ×12 (voo) e `#2b1233` ×2 (texto do botão principal e do
  Claude) e `#000` ×1 (contorno de texto do álbum de ETs) → `--tinta`; `#2a1b52` (abertura), `#1b1840` (retrato do
  ET), `#2a1850` (céu dos jogadores), `#0d0a26` (voo) → `--noite`; `#2b2452` (trilho da barra do voo), `#57307e`
  (faixa do céu dos jogadores) → `--noite-2`. Fica fora: `#000` de `ui-paineis:53` é máscara (`mask`), não cor.
- **Claras (luminância > 0,8): 40 hex** (os mesmos em `83c4e87`, contando os `%23` dos SVG), destino: `--papel` 11 (`#fffbe6 #fffbe8 #fffef8 #fbfdff #fffaf0 #fff7e6
  #fff8ee #f6f3fa #f6f1ff`, e o `#fff` de fundo de cartão), `--papel-quente` 9 (`#fff4d6 #fff6d4 #fff3c4 #fff4c8
  #ffe3ef #ffe4f4 #f1e4ff #eadff7`), `--papel-2` 6 (`#fff0e0 #f1edf5 #f3f0f5 #f1e6ff`), `--ouro-claro` 3 (`#fff6a8
  #fff6c8 #fff6cc`), `--laranja-claro` 2 (`#ffe7b8 #ffe0f0`), `--certo-fundo` 3 (`#e2f7e9 #e3f7df #f1fbf3`),
  `--quase-fundo` 1 (`#fff1d6`), raridade 9 (`--comum-fundo` `#ffe9f4 #fff4fa`; `--raro-fundo` `#dcebff #eef5ff`;
  `--lendario-fundo` `#fff1c2 #ffe0e8 #e3ffe9 #e0efff`), `--roxo-claro` 1 (`#e6e9ff`), `--ambar-claro` 1 (`#efe4ff`),
  `--branco` (`#fff` de brilho e halo). Depois: `#fff` só como `--branco` e as claras só no `:root`.
- **Alfa:** 13 brancos translúcidos (0,22 a 0,9) → `--brilho` (≥ 0,5) e `--brilho-fraco` (< 0,5); 10 sombras em
  `rgba(58,36,70,…)` (0,12 a 0,85) → `--sombra-chao` (0,12–0,22), `--sombra-veu` (0,3–0,45), `--veu` (fundo atrás do
  painel, `ui-telas:8`) e `--noite-2` (0,85 do voo vira chapado); 5 véus da abertura `rgba(20,10,40,…)` →
  `--veu-noite` / `--veu-noite-fraco`.
- **SVG em `data:` URI** (não aceita `var()`, fica literal, com hex da paleta): `ui-abertura:26` (flash: `#fffbe8
  #fff3c4 #ffd6ec` → `#fff8ee #fff1cc #fff4cc`), `ui-jogadores:6` (estrelas: `#fff #ffe9a8 #ffd6f0` → `#fff8ee
  #fff4cc`), `ui-telas:44` (arco-íris: fica, é desenho), `ui-paineis:90` (anéis do ovo: `rgb(255,244,204)` →
  `#fff4cc`; `rgb(58,36,70)` fica).

## 2. Tabela: cada literal e o token que ele vira
Coluna 2 = ocorrências; `arquivo:linha` sem o `.css`. Linhas de `f37edf0`: na main nova, ache pelo conteúdo.
Destinos com "(cor: …)" = a borda volta para `--borda` e a cor da raridade vai para o fundo e a faixa interna.

| Token alvo | N | Literais de hoje (arquivo:linha) |
|---|---|---|
| `--ambar` | 5 | `#ff8fc4` ui-abertura:57 · `#b58cff` ui-desafios:181 · `#ffc0db` ui-hud:42 · `#d8c6ff` ui-jogadores:28 · `#c07a12` ui-voo:30 |
| `--ambar-claro` | 3 | `#efe4ff` ui-desafios:182 · `#e5d8ff` ui-jogadores:25 · `#e3d8ff` ui-missao:132 |
| `--arco-iris` | 11 | `#ff6b6b` ui-hud:109 · `#ffb830` ui-hud:109 · `#ffe45c` ui-hud:109 · `#6ee07a` ui-hud:109 · `#5cb8ff` ui-hud:109 · `#b57cff` ui-hud:109 · `#ff7ec4` ui-hud:109 · `#ff6b8a` ui-paineis:53 · `#ffb020` ui-paineis:53 · `#6fdc8c` ui-paineis:53 · `#5fb4ff` ui-paineis:53 |
| `--azul` | 2 | `#7fb2ff` ui-desafios:141 · `#8fd3ff` ui-voo:12 |
| `--borda` | 1 | `#cfc3e6` ui-paineis:81 |
| `--borda (cor: --epico-fundo/--epico-desenho)` | 2 | `#5b2aa8` ui-paineis:51 ui-paineis:95 |
| `--borda (cor: --lendario-fundo/--lendario-desenho)` | 3 | `#a86a00` ui-paineis:52 ui-paineis:96 ui-prova:137 |
| `--borda (cor: --raro-fundo/--raro-desenho)` | 3 | `#2b5ea8` ui-paineis:50 ui-paineis:94 ui-prova:136 |
| `--branco` | 70 | `#ffffff` ui-desafios:30 ui-desafios:38 ui-desafios:45 ui-desafios:47 ui-desafios:130 ui-desafios:131 ui-desafios:148 ui-fotos:6 ui-hud:55 ui-missao:15 ui-missao:19 ui-missao:63 ui-missao:67 ui-missao:68 ui-missao:69 ui-missao:70 ui-novidades:75 ui-paineis:24 ui-paineis:25 ui-paineis:68 ui-paineis:69 ui-paineis:104 ui-paineis:111 ui-paineis:112 ui-paineis:130 ui-paineis:133 ui-personagem:48 ui-petshop:28 ui-petshop:37 ui-petshop:80 ui-prova:59 ui-prova:82 ui-prova:85 ui-prova:112 ui-prova:114 ui-prova:127 ui-prova:128 ui-prova:139 ui-salao:7 ui-salao:8 ui-telas:127 |
| `--brilho` | 13 | `rgb(255,255,255)/0.65` interiores:12 ui-abertura:92 ui-abertura:93 ui-base:142 · `rgb(255,255,255)/0.85` ui-base:155 ui-fotos:74 ui-hud:25 ui-hud:48 · `rgb(255,255,255)/0.9` ui-hud:38 ui-hud:107 · `rgb(255,255,255)/0.55` ui-hud:56 · `rgb(255,255,255)/0.6` ui-personagem:27 · `rgb(255,255,255)/0.5` ui-petshop:30 |
| `--brilho-fraco` | 3 | `rgb(255,255,255)/0.35` ui-base:145 · `rgb(255,255,255)/0.22` ui-desafios:20 ui-voo:70 |
| `--certo` | 2 | `#4fb37a` ui-desafios:185 · `#2f8a3c` ui-voo:29 |
| `--certo-fundo` | 3 | `#e2f7e9` ui-desafios:185 · `#f1fbf3` ui-telas:111 · `#e3f7df` ui-voo:29 |
| `--ceu` | 2 | `#d9c8ff` ui-personagem:22 · `#bfe9ff` ui-telas:37 |
| `--comum-fundo` | 7 | `#ffe9f4` ui-paineis:49 ui-prova:59 · `#fff4fa` ui-prova:40 ui-prova:49 ui-prova:54 ui-prova:89 |
| `--epico-fundo` | 1 | `#eadcff` ui-paineis:51 |
| `--erro` | 3 | `#e0405a` ui-personagem:51 · `#d8455f` ui-prova:85 · `#c0344f` ui-prova:85 |
| `--erro-fundo` | 2 | `#ffd9d9` ui-base:149 · `#ffe0e0` ui-jogadores:54 |
| `--grama` | 2 | `#c6e15a` ui-personagem:22 ui-telas:37 |
| `--laranja` | 2 | `#ff6fae` ui-abertura:39 · `#e24c9a` ui-abertura:57 |
| `--laranja-claro` | 4 | `#ffe0f0` ui-jogadores:25 ui-personagem:22 · `#ffd0ea` ui-jogadores:28 · `#ffe7b8` ui-missao:129 |
| `--lendario-fundo` | 14 | `#ffe39a` ui-paineis:52 ui-paineis:71 ui-prova:58 ui-prova:61 · `#ffe0e8` ui-prova:42 ui-prova:51 · `#fff1c2` ui-prova:42 ui-prova:47 ui-prova:51 · `#e3ffe9` ui-prova:42 ui-prova:51 · `#e0efff` ui-prova:42 ui-prova:51 |
| `--lilas` | 2 | `#c89bff` ui-voo:12 · `#d9d2ff` ui-voo:56 |
| `--noite` | 4 | `#2a1b52` ui-abertura:4 · `#1b1840` ui-et-desafio:4 · `#2a1850` ui-jogadores:7 · `#0d0a26` ui-voo:4 |
| `--noite-2` | 5 | `#57307e` ui-jogadores:7 · `#b0508f` ui-jogadores:7 · `#ff9aa6` ui-jogadores:7 · `#2b2452` ui-voo:10 · `rgb(58,36,70)/0.85` ui-voo:53 |
| `--ouro` | 13 | `#ffd0e6` ui-abertura:57 · `rgb(255,224,102)/0.85` ui-abertura:92 · `#f0b400` ui-desafios:187 · `#ffd56a` ui-hud:41 · `rgb(255,196,60)/0.9` ui-paineis:99 · `#ffd34d` ui-prova:31 ui-voo:31 |
| `--ouro-claro` | 14 | `#fff6c8` ui-abertura:57 ui-abertura:71 ui-animacoes:11 · `#fff6cc` ui-desafios:187 · `#fff6a8` ui-personagem:26 ui-voo:31 ui-voo:38 · `#ffdb70` ui-telas:128 |
| `--papel` | 28 | `rgb(255,248,238)/0.92` ui-abertura:79 ui-abertura:95 · `#fffef8` ui-desafios:61 · `#fbfdff` ui-desafios:141 · `#fff8ee` ui-hud:64 · `#ffffff` ui-jogadores:25 ui-jogadores:28 ui-jogadores:56 ui-paineis:49 ui-paineis:50 ui-paineis:51 ui-prova:60 ui-prova:61 ui-voo:7 ui-voo:35 ui-voo:46 · `#fff7e6` ui-missao:129 · `#f6f1ff` ui-missao:132 · `rgb(255,255,255)/0.75` ui-missao:170 · `#fffbe8` ui-paineis:3 ui-paineis:96 ui-prova:120 · `#fffbe6` ui-paineis:52 ui-prova:58 ui-prova:74 ui-prova:137 · `#f6f3fa` ui-paineis:81 · `#fffaf0` ui-voo:21 |
| `--papel-2` | 10 | `#e8e2ee` ui-foguete:19 · `#f3f0f5` ui-missao:74 ui-telas:112 · `#f1edf5` ui-novidades:69 ui-paineis:54 ui-petshop:99 ui-prova:138 · `#e6e0ee` ui-paineis:129 · `#f1e6ff` ui-personagem:48 · `#fff0e0` ui-prova:24 |
| `--papel-quente` | 11 | `#ffd6ec` ui-abertura:26 · `#fff3c4` ui-abertura:38 ui-desafios:147 · `#ffe3ef` ui-fotos:35 · `#fff6d4` ui-hud:41 · `#ffffff` ui-hud:42 · `#fff4d6` ui-jogadores:11 · `#ffe4f4` ui-jogadores:15 · `#f1e4ff` ui-jogadores:15 · `#eadff7` ui-jogadores:43 · `#fff4c8` ui-telas:37 |
| `--quase-fundo` | 1 | `#fff1d6` ui-voo:30 |
| `--raro-fundo` | 10 | `#dcebff` ui-paineis:50 ui-prova:41 ui-prova:48 ui-prova:50 ui-prova:57 ui-prova:60 ui-prova:90 ui-telas:123 · `#eef5ff` ui-prova:73 |
| `--rosa` | 1 | `#ff9db5` ui-desafios:140 |
| `--roxo-claro` | 2 | `rgb(124,92,255)/0.13` ui-desafios:9 · `#e6e9ff` ui-telas:124 |
| `--roxo-texto` | 2 | `rgb(59,47,196)/0.45` ui-desafios:4 · `#3b2fc4` ui-desafios:5 |
| `--sombra-chao` | 3 | `rgb(58,36,70)/0.2` ui-missao:160 · `rgb(58,36,70)/0.12` ui-personagem:23 · `rgb(58,36,70)/0.22` ui-personagem:33 |
| `--sombra-veu` | 5 | `rgb(58,36,70)/0.3` ui-fotos:20 ui-telas:93 · `rgb(58,36,70)/0.35` ui-hud:90 ui-telas:22 · `rgb(42,24,80)/0.45` ui-jogadores:11 |
| `--tinta` | 18 | `#2b1233` interiores:14 ui-base:147 · `#000000` ui-album-ets:20 · `#3a2446` ui-voo:9 ui-voo:14 ui-voo:21 ui-voo:36 ui-voo:42 ui-voo:47 ui-voo:53 |
| `--tinta-suave` | 3 | `#cdbff5` ui-desafios:145 · `#d9cfee` ui-desafios:149 · `#6b5378` ui-foguete:41 |
| `--verde-folha` | 1 | `#9ccc4a` ui-personagem:22 |
| `--veu` | 1 | `rgb(58,36,70)/0.45` ui-telas:8 |
| `--veu-noite` | 4 | `rgb(20,10,40)/0.45` ui-abertura:20 · `rgb(20,10,40)/0.3` ui-abertura:21 · `rgb(20,12,40)/0.35` ui-abertura:22 |
| `--veu-noite-fraco` | 3 | `rgb(20,10,40)/0.22` ui-abertura:20 · `rgb(20,12,40)/0.18` ui-abertura:22 |
| `transparent` | 1 | `rgb(255,224,102)/0` ui-abertura:93 |

Ficam como estão: `rgb()` de `ui-paineis:90` (SVG, ver §1) e o `#000` de máscara de `ui-paineis:53`.
`--ceu`, `--grama` e `--verde-folha` recebem os fundos de cenário da tela de criar personagem (`ui-personagem:22`) e do
`.tela-inicio` antigo (`ui-telas:37`). O `conic-gradient` da aura arco-íris (`ui-hud:109`, exceção escrita no
`validar-pixel`) passa a usar `--arco-iris`, com 6 cores em vez de 7.

## 3. O `:root` depois da 2a
Já existem e ficam: `--tinta --tinta-suave --papel --papel-2 --papel-quente --ambar --ambar-claro --roxo --roxo-texto
--laranja --laranja-claro --laranja-forte --laranja-escuro --verde-folha --rosa --lilas --ouro-claro --ceu --certo
--certo-fundo --quase-fundo --raro-texto --epico-texto --lendario-texto --grama` e os de `ui-petshop.css` (fome, sede,
banho: cores de desenho dos cuidados).

Mudam: `--borda: var(--tinta)` (vira apelido; 207 usos ficam); `--ouro` `#ffc94a` → `#ffd34d` (§10.8);
`--papel-leve` sai (11 usos: fundo de painel → `--papel`, cabeçalho e chip → `--papel-quente`).

Novos:

| Token | Valor | Papel |
|---|---|---|
| `--noite`, `--noite-2` | `#24162e`, `#33224a` | telas escuras (§10.8.3) e o degrau |
| `--erro`, `--erro-fundo` | `#b02c47`, `#ffe0e0` | erro, sair, perigo, nota da folha |
| `--branco` | `#ffffff` | brilho de 1 px, halo, texto sobre seleção cheia (`--roxo-texto`, `--certo`) |
| `--brilho`, `--brilho-fraco` | `rgba(255,255,255,0.85)`, `rgba(255,255,255,0.35)` | brilho interno de botão e chip; apertado |
| `--sombra-chao`, `--sombra-veu`, `--veu` | `rgba(58,36,70,0.2)`, `rgba(58,36,70,0.35)`, `rgba(58,36,70,0.45)` | sombra de chão; elevação; véu atrás do painel |
| `--veu-noite`, `--veu-noite-fraco` | `rgba(36,22,46,0.4)`, `rgba(36,22,46,0.2)` | vinheta da abertura |
| `--roxo-claro` | `#ebe5ff` | fundo leve roxo: trecho em inglês (`.en`), chip "calma" |
| `--azul` | `#5fb4ff` | cor de desenho (pauta do caderno, barra do voo); nunca moldura |
| `--arco-iris` | `#ff5c6a 0 17%, #ff9f45 17% 33%, #ffe066 33% 50%, #6fdc8c 50% 67%, #5fb4ff 67% 83%, #a66bff 83%` | faixas do brilho lendário e da aura (as do `ARCO` da abertura) |
| `--comum-fundo`, `--comum-desenho` (+ `--comum-texto: var(--tinta-suave)`) | `#fff8ee`, `#ff9cc6` | raridade (§10.8) |
| `--raro-fundo`, `--raro-desenho` | `#dcebff`, `#5fb4ff` | idem |
| `--epico-fundo`, `--epico-desenho` | `#eadcff`, `#a66bff` | idem |
| `--lendario-fundo`, `--lendario-desenho` | `#ffe39a`, `#ffb020` | idem |
| `--apagado` | `grayscale(1) brightness(1.1)` | `filter` do DESENHO no estado indisponível (nunca no texto) |

A tabela de JS (`Reino.config.paleta`, frente `contrato`) repete os que o canvas usa (`tinta`, `tintaSuave`, `noite`,
`noite2`, `papel`, `papel2`, `papelQuente`, `grama` e `raridade.<r>.texto|fundo|desenho`); o `validar-cores.js`
confere que ela e o `:root` dão o mesmo hex.

## 4. Raridade: onde tem cor hoje (os três jogos e o arco-íris)
1. **CSS** (`--raro-texto`… já no `:root`, o resto literal): cartas do estábulo `ui-paineis:49-54` (borda na cor da
   raridade e fundo em 2 faixas com `#fff`), detalhe `ui-paineis:71`, painel do ovo `ui-paineis:94-99` (borda e
   brilho `rgba(255,196,60,.9)` no épico e no lendário), prova `ui-prova:40-61,73-74,89-90,136-138` (chip, chip-mini,
   faixa "valendo", selo, prévia, linha de prêmio, próximo prêmio, item de prêmio), `ui-telas:123` (`.chip-mini.raro`).
   Lendário em **dois** jeitos: dourado (`#ffe39a`, borda `#a86a00`) e arco-íris (`ui-prova:42,51` fundo em 4
   faixas pastel; `ui-paineis:53` anel `::after` de 4 cores).
2. **Canvas do ovo** `jogo/js/arte/pixelart-ovos.js:30-35` (`PA.CORES_RARIDADE`: base/mancha/borda, comum rosa
   `#fff4fa/#ffb3d9/#ff9cc6`, raro `#e3f3ff/#5fb4ff/#4a9dff`, épico `#efe4ff/#a66bff/#8a4dff`, lendário
   `#fff4cc/#ffb020/#f5a300`; faixa de arco-íris de 6 px no lendário, linha 43), lida também pela plaquinha da baia
   `jogo/js/interiores/estabulo/estabulo.js:87` (com o reserva `#b8aac8`).
3. **Canvas da Escola** `jogo/js/interiores/escola/objetos.js:223-224` (quadro das provas: `FUNDO_RARIDADE`
   lendário `#ffe6f7`, raro `#dcefff`, comum `#f4f0f8`; `BORDA_RARIDADE` lendário `#ff7eb6` **rosa**, raro `#5fb4ff`,
   comum `#c4b4d4`).
Depois: um trio por raridade (tabela do §3), contorno sempre `--borda`, cor no fundo chapado e numa faixa interna de
4 px em `--<r>-desenho`; lendário dourado em todo lugar; arco-íris só no anel `::after` da carta lendária e na
faixa do ovo (brilho), com `--arco-iris`.

## 5. "Trancado / desligado / sem dinheiro / esperando" com `opacity` (41 linhas em `83c4e87`)
Saem para o estado indisponível (§10.19.1: `--papel-2`, texto `--tinta-suave`, borda `--borda`, sombra de 2 px,
desenho com `filter: var(--apagado)`):
- `ui-base:82` `button.esperando-fala` 0,45 · `ui-base:83` `canvas.esperando-fala` 0,6 (desenho → `--apagado`)
- `ui-base:112,125` `.btn-grande.armando` 0,45 + `grayscale(.5)` (guarda de toque; o texto não pode apagar)
- `ui-base:148` `.btn-grande:disabled` 0,45 · `ui-novidades:25` `.btn-fechar:disabled` 0,45
- `ui-hud:32` `.btn-foto.desligado, .btn-album.desligado` 0,45 + `grayscale(.6)`
- `ui-foguete:20` gota vazia `grayscale(1)` 0,35 · `ui-foguete:31` `.foguete-decolar[disabled]` 0,45 ·
  `ui-foguete:34` `.foguete-trancado .foguete-bola, b` 0,55 (nome do planeta trancado: D8B-12)
- `ui-paineis:84` estágio não alcançado 0,6 (só desenho) · `ui-prova:77` prêmio que passou, canvas 0,45 +
  `grayscale(.7)` (só desenho; o texto da `.linha-premio.passou`, `ui-prova:76`, já é `--tinta-suave` no `--papel-2`)
- `ui-hud:114-115` cores da aura 0,7/1 · `ui-jogadores:35,39` texto 0,8/0,85 (vira `--tinta-suave`)
- Erro de item (§10.19.2, não é indisponível): `ui-missao:74` `.opcao.errada` 0,5 (fica riscada em `--erro-fundo`,
  sem `opacity`), `ui-novidades:69` (já 1), `ui-voo:39` `.voo-opcao-errada` 0,55.
Ficam (animação, véu, flash ou o escondido que aparece no foco): `ui-abertura:25,62,63,99,100`, `ui-animacoes:3,4,6`,
`ui-fotos:7,9,11,12`, `ui-hud:91` (joystick translúcido sobre o mapa), `ui-voo:47,49`, `ui-personagem:75,76,88`, `ui-novidades:53`, `ui-foguete:23` (volta a 1),
e o `fill-opacity` do SVG do anel do ovo (`ui-paineis:91`, desenho).
Onde cada estado nasce no JS: `js/ui/espera-fala.js:36` (`esperando-fala`), `js/ui/base.js:256` (`armando`),
`js/ui/hud-fotos.js:22` (`desligado`), `js/ui/foguete.js:70` (`foguete-trancado`), e a loja **não marca** o
enfeite caro (`js/ui/loja.js:58` só fala "Faltam N estrelas" depois do toque: D8A-05).

## 6. Cor de UI no JS (fora dos desenhos)
- `jogo/js/arte/desenho.js:13` `FUNDO = '#24162e'` (vão dos interiores; já é `--noite`, sem vir do token) ·
  `jogo/js/arte/icones/planetas.js:78` `#24162e` e `#e9e0f2`.
- `jogo/js/ui/foguete.js:26` reserva `#d8d8e8` do carimbo · `jogo/js/ui/et-desafio.js:46` Conferir com
  `btn-principal` (D6-20) · `jogo/js/sistemas/surpresa-painel.js:76` `btn-principal.surpresa-conferir`.
- Raridade: §4 (ovo, baia, Escola).
- Cor do app: `vercel/pwa/manifest.webmanifest:10-11` e `vercel/montar.js:14,31` `#3b2170`;
  `jogo/ferramentas/gerar-index.js:22` (sem cor no `<head>`: a página fica `--grama` `#c6e15a` enquanto carrega);
  `jogo/css/ui-abertura.css:4` `#2a1b52`.
- Só desenho (ficam): o céu, os morros e o arco-íris da abertura (`js/ui/abertura.js`, `abertura-desenho.js`), os
  confetes (`js/ui/pecas.js:44`), o ícone da porta (`js/ui/jogadores.js:12`), o ET do álbum, as cores do unicórnio
  de convidado (`jogadores.js:42`), o cálculo de cor da aparência.
