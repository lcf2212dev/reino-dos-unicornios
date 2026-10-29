# Inventário da onda 3i: tocáveis com sombra de degrau e o `:active` de cada um

Refeito na main `49c56e0` (30/09/2026), **depois** de 2a e 2b e **antes** de 3h e 5a. Toda sombra de degrau em
repouso já é 2 ou 4 px (`--sombra-pequena`/`--sombra-grande`). Números: 57 seletores com sombra de degrau (2 deles
falsos, ver abaixo), 49 sem `:active`; 11 regras `:active` em 7 arquivos.

**Re-medir quando a 3h entrar:** as tabelas de `ui-base`, `ui-missao`, `ui-desafios`, `ui-telas`, `ui-hud`,
`ui-paineis`, `ui-personagem`, `ui-fotos` e `ui-animacoes` vão andar (linhas, talvez seletores e durações); os
comandos abaixo refazem tudo. A 5a pode pôr botão ou animação em `ui-foguete.css` (hoje fora das tabelas).

## Comandos para refazer (na raiz da worktree, depois de `git merge main`)
```
node pedidos/2026-09-29-tv-3i-medir/sombras.js .            # tabela abaixo (§1) e a lista de todo :active (§2)
node pedidos/2026-09-29-tv-3i-medir/sombras.js . --json     # o mesmo em JSON (para o validador e o conferente)
grep -n ':active' jogo/css/*.css                             # o grep do "Pronto quando" do D9-03
grep -rhoE "el\('button\.[a-z0-9.-]+" jogo/js --include='*.js' --exclude-dir=voz | sort -u   # todo botão criado no JS
grep -noE "(animation|transition)(-duration)?:[^;}]+" jogo/css/*.css                    # durações (D10-16, D9-12)
wc -l jogo/js/ui/base.js                                     # espaço da frente telas (teto 420)
```
`sombras.js` lê só `jogo/css/*.css`: acha toda regra com `box-shadow` de degrau (`0 Npx 0` sem `inset`, também por
custom property do `:root` e pelos tokens `--sombra-pequena`/`--sombra-grande`), diz a altura, se o JS cria a classe
com clique (heurística; a coluna "papel" do §3 é a leitura manual) e o `:active` que casa com o último seletor simples.
As duas linhas `ui-base.css:228` (`:is(button:disabled` e `button[aria-disabled="true"]…`) são falsas: o medidor corta
o `:is(...)` da regra de indisponível na vírgula. O validador ignora as duas (é a regra do §10.19.1, não um tocável).

## 1. Saída do `sombras.js` na 49c56e0
| arquivo:linha | seletor | sombra | JS (heurística) | :active hoje |
|---|---|---|---|---|
| interiores.css:9 | `.claude-acoes .btn-dialogo` | 4 px | ? | interiores.css:15 transform: translateY(2px); box-shadow: 0 1px 0 var(--borda) |
| ui-base.css:201 | `.btn-grande` | 4 px | botão | ui-base.css:211 transform: translateY(3px); box-shadow: inset 0 1px 0 var(--brilho-fraco), 0 2px 0 var(--borda) |
| ui-base.css:215 | `.btn-pequeno` | 2 px | ? | — |
| ui-base.css:216 | `.btn-icone` | 4 px | botão | — |
| ui-base.css:228 | `:is(button:disabled` | 2 px | ? | ui-base.css:232 transform: none; sombra igual |
| ui-base.css:228 | `button[aria-disabled="true"]:not(:where(.armando:focus-visible)), .indisponivel)` | 2 px | botão | ui-base.css:232 transform: none; sombra igual |
| ui-desafios.css:29 | `.desenho-ferr` | 2 px | ? | — |
| ui-desafios.css:37 | `.desenho-cor` | 2 px | ? | — |
| ui-desafios.css:62 | `.apoio` | 4 px | botão | — |
| ui-desafios.css:135 | `.copiar-opcao` | 2 px | ? | — |
| ui-desafios.css:137 | `.copiar-opcao[aria-pressed="true"]` | 2 px | ? | — |
| ui-desafios.css:152 | `.copiar-peca` | 2 px | ? | — |
| ui-desafios.css:153 | `.copiar-peca.colocada` | 2 px | ? | — |
| ui-fotos.css:74 | `.fotos-mini` | 4 px | ? | ui-fotos.css:82 transform: translateY(3px); box-shadow: 0 1px 0 var(--borda) ; ui-fotos.css:94 transform: none; sombra igual ; ui-fotos.css:96 transform: none; sombra igual |
| ui-hud.css:20 | `.btn-tela-cheia` | 2 px | ? | ui-hud.css:27 transform: translateY(2px); box-shadow: 0 1px 0 var(--borda) |
| ui-hud.css:33 | `.chip` | 2 px | ? | — |
| ui-hud.css:42 | `.chip-montaria` | 2 px | ? | — |
| ui-hud.css:60 | `.dock` | 4 px | botão | — |
| ui-jogadores.css:10 | `.tela-jogadores .painel` | 4 px | botão | — |
| ui-jogadores.css:23 | `.jogadores-cartao` | 4 px | ? | ui-jogadores.css:30 transform: translateY(3px); box-shadow: 0 2px 0 var(--borda) |
| ui-jogadores.css:57 | `.jogadores-guardando` | 4 px | ? | — |
| ui-missao.css:56 | `.opcao` | 4 px | ? | — |
| ui-missao.css:72 | `.opcao[aria-pressed="true"]` | 4 px | ? | — |
| ui-missao.css:83 | `.opcao.certa` | 4 px | botão | — |
| ui-missao.css:83 | `.opcao-marcar.certa` | 4 px | botão | — |
| ui-missao.css:97 | `.ligar-item` | 4 px | ? | — |
| ui-missao.css:119 | `.seq-item` | 2 px | ? | — |
| ui-missao.css:135 | `.sep-item` | 2 px | ? | — |
| ui-missao.css:138 | `.bau` | 4 px | ? | — |
| ui-missao.css:146 | `.com-escolha .bau` | 4 px | ? | — |
| ui-missao.css:156 | `.carta-mem` | 4 px | ? | — |
| ui-paineis.css:45 | `.item-loja` | 4 px | ? | — |
| ui-paineis.css:52 | `.item-premio` | 4 px | ? | — |
| ui-paineis.css:73 | `.carta-uni` | 4 px | ? | — |
| ui-paineis.css:125 | `.painel-ovo` | 4 px | ? | — |
| ui-paineis.css:145 | `.bolinha-cor` | 2 px | ? | — |
| ui-paineis.css:172 | `.pin-tecla` | 2 px | ? | — |
| ui-personagem.css:15 | `.criar-palco` | 4 px | ? | — |
| ui-personagem.css:33 | `.criar-plaquinha` | 2 px | ? | — |
| ui-personagem.css:55 | `.criar-sexo-btn` | 2 px | ? | — |
| ui-personagem.css:78 | `.criar-opcao` | 2 px | ? | — |
| ui-prova.css:22 | `.item-revisao` | 2 px | ? | — |
| ui-prova.css:50 | `.selo-tentativa` | 4 px | ? | — |
| ui-prova.css:67 | `.linha-premio.agora` | 4 px | botão | — |
| ui-prova.css:77 | `.nota-folha` | 4 px | ? | — |
| ui-prova.css:97 | `.estilo-circular .opcao[aria-pressed="true"]` | 4 px | ? | — |
| ui-prova.css:103 | `.vf-botao` | 2 px | ? | — |
| ui-prova.css:105 | `.vf-botao[aria-pressed="true"]` | 2 px | ? | — |
| ui-prova.css:118 | `.chip-palavra` | 2 px | ? | — |
| ui-salao.css:17 | `.salao-opcao` | 2 px | ? | — |
| ui-telas.css:14 | `.painel` | 4 px | botão | — |
| ui-telas.css:59 | `.titulo-jogo` | 4 px | ? | — |
| ui-telas.css:66 | `.titulo-jogo::before` | 2 px | ? | — |
| ui-telas.css:66 | `.titulo-jogo::after` | 2 px | ? | — |
| ui-telas.css:102 | `.claude-fala` | 4 px | ? | — |
| ui-telas.css:116 | `.claude-acoes button` | 4 px | botão | — |
| ui-telas.css:124 | `.sala-card` | 4 px | ? | ui-telas.css:130 transform: translateY(2px); box-shadow: 0 2px 0 var(--borda) |


## 2. Todo `:active` de hoje
- interiores.css:15 `.claude-acoes .btn-dialogo:active` → transform: translateY(2px); box-shadow: 0 1px 0 var(--borda);
- ui-base.css:211 `.btn-grande:active:not(:disabled)` → transform: translateY(3px); box-shadow: inset 0 1px 0 var(--brilho-fraco), 0 2px 0 var(--borda);
- ui-base.css:232 `:is(button:disabled, button[aria-disabled="true"], .indisponivel):active` → transform: none;
- ui-fotos.css:82 `.fotos-mini:active` → transform: translateY(3px); box-shadow: 0 1px 0 var(--borda);
- ui-fotos.css:94 `body.sem-animacao .fotos-mini, body.sem-animacao .fotos-mini:active` → transition: none; transform: none;
- ui-fotos.css:96 `.fotos-mini, .fotos-mini:active` → transition: none; transform: none;
- ui-hud.css:27 `.btn-tela-cheia:active` → transform: translateY(2px); box-shadow: 0 1px 0 var(--borda);
- ui-hud.css:84 `.dock-btn:active` → background: var(--ambar-claro);
- ui-jogadores.css:30 `.jogadores-cartao:active` → transform: translateY(3px); box-shadow: 0 2px 0 var(--borda);
- ui-petshop.css:100 `.item-comida:active` → transform: translateY(3px); box-shadow: 0 1px 0 var(--borda);
- ui-telas.css:130 `.sala-card:active` → transform: translateY(2px); box-shadow: 0 2px 0 var(--borda);

57 seletores com sombra de degrau (2 falsos); 49 sem :active. Nenhum dos 8 `:active` com transform/sombra bate
com a regra nova (desce = sombra, sombra some): todos saem na regra única (pedido §14.1).

## 3. Leitura manual: quem é tocável e o que vira

Todos os tocáveis abaixo são `<button>` criados em JS (`el('button.<classe>'…)`); nenhum botão da interface é
desenhado em canvas com sombra de degrau (joystick, portais do voo e placas não têm sombra nem estado apertado),
então **não há frente JS para o D9-03**. "Hoje" é o `:active` na 49c56e0; todos viram a regra única (pedido §14.1),
com `--degrau` igual à sombra.

| Tela / cena | Arquivo CSS | Seletor (tocável) | Sombra | `:active` hoje |
|---|---|---|---|---|
| todas (rodapés, intros, fim de sala, loja, prova) | ui-base.css | `.btn-grande` (+ `.btn-principal`, `.btn-secundario`, `.btn-perigo`, `.btn-conferir`, `.et-botao`, `.foguete-*`, `.jogadores-criar/entrar`) | 4 px + brilho `inset` | desce 3, sombra 2 |
| todas | ui-base.css | `.btn-pequeno` (📖 Ver no livro, loja, Área dos pais) | 2 px | nada |
| todas (✕ sair, fechar, ouvir do voo, setas das fotos) | ui-base.css | `.btn-icone` (`.btn-sair`, `.btn-fechar`, `.fotos-nav`, `.voo-ouvir`) | 4 px | nada |
| balão do Claude e dos NPCs | interiores.css, ui-telas.css | `.claude-acoes .btn-dialogo`, `.claude-acoes button` | 4 px | desce 2, sombra 1 (só `.btn-dialogo`) |
| desafio-escolha, desafio-varias, surpresa, ET | ui-missao.css | `.opcao`, `.opcao-marcar` (e `[aria-pressed]`, `.certa`) | 4 px | nada |
| prova (estilo circular) | ui-prova.css | `.estilo-circular .opcao[aria-pressed="true"]` | 4 px | nada |
| desafio-vf, prova V/F | ui-prova.css | `.vf-botao` (e `[aria-pressed]`) | 2 px | nada |
| desafio-ligar | ui-missao.css | `.ligar-item` | 4 px | nada |
| desafio-sequencia | ui-missao.css | `.seq-item` | 2 px | nada |
| desafio-separar | ui-missao.css | `.sep-item` 2 px, `.bau` / `.com-escolha .bau` 4 px | 2 / 4 px | nada (o `.bau` tem `pulsar`: pedido §14.5) |
| desafio-memoria | ui-missao.css | `.carta-mem` | 4 px | nada |
| desafio-copiar | ui-desafios.css | `.copiar-opcao` (e `[aria-pressed]`), `.copiar-peca` (e `.colocada`) | 2 px | nada |
| desafio-completar | ui-prova.css | `.chip-palavra` | 2 px | nada |
| desafio-desenho | ui-desafios.css | `.desenho-ferr`, `.desenho-cor` | 2 px | nada |
| treino (revisão) | ui-prova.css | `.item-revisao` | 2 px | nada |
| matéria, Lugares, capa das provas | ui-telas.css | `.sala-card` (`.cartao-prova`) | 4 px | desce 2, sombra 2 |
| HUD | ui-hud.css | `.chip` (`.chip-dinheiro`, `.chip-estrelas`, `.chip-aura`, `.chip-ovos`), `.chip-montaria` | 2 px | nada |
| HUD | ui-hud.css | `.btn-tela-cheia` (`.btn-foto`, `.btn-album`) | 2 px | desce 2, sombra 1 |
| HUD (dock) | ui-hud.css | `.dock-btn` | sem sombra (a de 4 px é do `.dock`) | fundo `--ambar-claro` (fica) |
| tela-loja | ui-paineis.css | `.item-loja`; **`.item-premio`** (novo: `button.item-loja`, `ui/loja.js`) | 4 px | nada |
| tela-estabulo, Pet Shop | ui-paineis.css, ui-petshop.css | `.carta-uni`; `.item-comida` (é `.item-loja`) | 4 px | `.item-comida`: desce 3, sombra 1 |
| tela-estabulo (ovo) | ui-paineis.css | `.ovo-grande` | **sem sombra** (transparente) | nada; tem `balancar` (§14.2 e §14.5) |
| nome do unicórnio (sugestões) | ui-paineis.css, ui-telas.css | `.chip-mini.sugestao` | **sem sombra** (ganha 2 px, §14.2) | nada |
| aparência (laço) | ui-paineis.css | `.bolinha-cor` | 2 px | nada |
| Área dos pais (PIN) | ui-paineis.css | `.pin-tecla` | 2 px | nada |
| criar personagem | ui-personagem.css | `.criar-palco` 4 px, `.criar-sexo-btn` 2 px, `.criar-opcao` 2 px | 2 / 4 px | nada |
| Salão | ui-salao.css | `.salao-opcao` | 2 px | nada |
| álbum de fotos | ui-fotos.css | `.fotos-mini` | 4 px | desce 3, sombra 1; `sem-animacao` e `reduce` tiram o `transform` (saem, §14.4) |
| tela de jogadores | ui-jogadores.css | `.jogadores-cartao` | 4 px | desce 3, sombra 2 |

**Com sombra de degrau, mas não tocáveis** (não ganham `--degrau`): `.painel`, **`.painel-ovo`** (novo: `div.painel`,
`ui/ovos.js`), **`.tela-jogadores .painel`** (novo), `.dock`, `.claude-fala`, `.titulo-jogo` e `::before/::after`,
`.nota-folha`, `.selo-tentativa`, `.linha-premio.agora`, `.jogadores-guardando`, `.criar-plaquinha`, `.apoio` (a
caixa; o botão dela, `.apoio-abrir`, não tem sombra).

**Indisponível:** `.btn-grande.armando`, `.btn-grande:disabled` e o `:active` de `.btn-foto/.btn-album.desligado`
saíram da lista: a 2b os pôs na regra única de indisponível (`ui-base.css:228-232`, §10.19.1), que não afunda.

**Botões sem sombra de degrau** (não afundam, fora os dois do D9-03): `.apoio-abrir`, `.interruptor` (a bola anda:
`transition: left 0.15s`, sem saída), `.jogadores-aba`, `.btn-ouvir`, `.dock-btn`.

## 4. Durações de hoje (para o D10-16 e o D9-12)
49 declarações em 14 CSS, 20 valores, 0 tokens, 4 `steps(n)`. Por arquivo: abertura 7, base 5, fotos 5, paineis 5,
petshop 5, prova 4, animacoes 3, missao 3, personagem 3, telas 3, jogadores 2, novidades 2, desafios 1, hud 1.
Valores: 1.2s ×7, 0.6s ×4, 0.08s ×4, 0.4s ×3, 600ms ×2 (`--entrar-ms`), 2.4s ×2, 0.25s ×2, 0.22s ×2 e uma vez cada
3.1s, 2s, 2.6s, 1.8s, 1.1s, 0.9s, 0.45s, 0.32s, 0.18s, 0.15s, 0ms, 0.01ms. `transition`: `.btn-grande` 0.08s
(ui-base:209, sem saída), `.fotos-mini` 0.08s (ui-fotos:80, com saída), `.interruptor-bola::after` 0.15s
(ui-paineis:159, sem saída), `.cuid-cheio` 0.4s (ui-petshop:34, com saída), `.fotos-flash` (ui-fotos:9/12), abertura
(ui-abertura:112-114), `.balao-respira` (ui-prova:11, exceção). Timers do JS que casam com uma duração do CSS:
`toqueIgnorado` 220 ms (`ui/base.js`), `ARMAR_MS`, o `balancar` do ovo (`ui/ovos.js`), o confete (§10.16).
`.tela` entra com `aparecer 0.18s ease-out` (ui-telas:10) e `UI.fecharTela` (`ui/base.js:187`, `fecharTodas` :220;
base.js com 405 linhas) tira o nó na hora. Tokens `--rapido/--normal/--lento` ainda não existem no CSS.
