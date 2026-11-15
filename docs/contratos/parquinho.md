# Parquinho (portal na praça e brinquedos)

Pedidos: `pedidos/2026-11-05-parquinho.md`; o balanço de puxar e a caixa de areia de perto:
`pedidos/2026-11-15-parquinho-brincar.md`. Com 3 matérias completas, uma delas Matemática ou Língua Portuguesa, o
portal da praça acorda e leva a um parque de céu aberto; ela e o unicórnio brincam nos brinquedos. Com todas as
matérias completas, os presentes do parque viram brinquedos novos. Sem prêmio, sem fala nova, nada no save.

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `Reino.config.parquinho` (`js/nucleo/config.js`) |
| a fase e o módulo `'parquinho'` (ação `parquinhoBrincar`, camada, `desenhaEla`) | `js/sistemas/parquinho.js` (`Reino.Parquinho`) |
| a brincadeira (cena ocupada, pular, timers) | `js/interiores/parquinho/brincar.js` (`Reino.ParquinhoBrincar`; no começo da pasta, porque as poses se registram nele) |
| chão, cerca, céu aberto e o portal de volta | `js/interiores/parquinho/fundo.js` (cria `Reino._predios.parquinho`) |
| brinquedos e enfeites | `objetos.js` (fase 1 e o presente), `objetos-2.js` (fase 2 e enfeites) |
| como cada um brinca | `poses.js` (escorregador e gangorra; ajudantes `P.H`), `poses-2.js` (fase 2), `poses-balanco.js`, `poses-areia.js` |
| o balanço de puxar e soltar: as contas (`P.Balanco`) | `balanco.js` |
| a caixa de areia de perto: estado e regras (`Reino.ParquinhoAreia`), desenho e ícones | `areia-caixa.js`, `areia-desenho.js` |
| a tela da caixa de areia | `js/ui/parquinho-areia.js` (`UI.telaParquinhoAreia`), `css/ui-parquinho-areia.css` |
| o interior | `parquinho.js` |
| o portal no mapa | `fora.js` (dormindo no desenho parado; acordado na camada do módulo `'parquinho-portal'`), `lugar.js` |
| a tela do que falta | `js/ui/parquinho.js` (`UI.telaParquinho`), `css/ui-parquinho.css` |

## 2. A fase (calculada na hora, nunca guardada)
- Matérias que contam: as mesmas dos kits da casa (`casa.md`): `bimestre >= config.casa.desdeBimestre`, com sala;
  completa = `P.materiaCompleta` (todas as salas feitas), arquivada ou não.
- 0 = fechado; 1 = `config.parquinho.fase1` completas e pelo menos uma de `config.parquinho.chave` (id começa com
  `matematica` ou `portugues`); 2 = todas as que contam completas.
- API: `Reino.Parquinho = { fase(), completas(), contam(), ehChave(m), falta() → { fase, completas, precisa, chave,
  total }, liberado() }`.

## 3. Lugar fechado (`liberado` no `registrarLugar`)
- `lugar.js` registra `liberado()`; `Reino.lugarLiberado(l)` (`nucleo/registros.js`) é o único jeito de ler (sem
  `liberado` ou com erro: aberto). Fechado: `Cena.entrarLugar` (`motor/cena.js`) abre `menu.abrir` (a tela do portal
  dormindo) em vez do interior, e o menu Lugares (`ui/lugares.js`) não mostra o lugar. Contrato: `interiores.md` §9.7.
- O tile (20, 20) e o caminho `[[20, 21]]` (rua) existem para todo mundo; o desenho parado é o portal dormindo, e
  só quem liberou vê o acordado (camada).

## 4. A brincadeira
- Objeto com `acao: { tipo: 'parquinhoBrincar', brinquedo, surpresa? }`. `surpresa` (os da fase 2) com fase < 2 abre
  `UI.telaParquinho('presente')`.
- `Reino.ParquinhoBrincar = { registrarPose(id, def), poses(), brincar(acao, ctx), ativo(), emUso(id), itens(),
  sobre(), parar(), depurar() }`; o formato de `def` está no cabeçalho de `brincar.js` (`fim` = o que fica depois).
- Como a casa (`casa.md` §13): `Cena.ocupar('parquinho')`, toque ou Enter depois de `pularDepoisMs` pula para o fim,
  temporizador de segurança, versão curta (`curtaMs`) sem Animações. Troca de cena encerra. Exceção: a pose
  interativa (abaixo).
- O desenho normal dela e do unicórnio some enquanto o módulo diz `desenhaEla()` (`cena-e-motor.md` §14); a pose
  desenha os dois. Pose com `esconde`: a parte que se mexe sai do desenho parado (`emUso` na `chave`, `refazer`).
- Pose interativa (`interativo: true`; hoje só o balanço): sem fim por tempo nem temporizador de segurança (sair
  de cena encerra). Ganchos `comecar(st, ctx)`, `toque(st, { fase, dx, dy, ms, toque })`, `tecla(st, { fase, key })`
  e `depurar(st)`; a pose encerra com `st.acabar(porToque?)` e marca timers com `st.depois(ms, fn)`. Até
  `pularDepoisMs` nada passa (o toque ou o Enter que sentou não conta); Esc encerra sempre; erro num gancho encerra;
  com tela ou balão do Claude aberto por cima, o toque e a tecla são deles.

## 5. O balanço (puxar e soltar)
- Pose interativa (`poses-balanco.js`; as contas em `P.Balanco`, `balanco.js`; números em `config.parquinho.balanco`).
  Ela fica sentada até descer (toque sem arrastar, Esc, ←/→/↓). Arrastar (em qualquer lugar da tela) ou segurar
  Espaço/Enter/↑ puxa, com o medidor de força; soltar vai e volta perdendo `amortece` a cada ida.
- Puxou tudo (`cheio`): no pico da frente os dois voam para a caixa de areia (o objeto `parquinho-areia` do
  interior), chamam `P.areiaTombo()` (§6) e ela termina no tile livre ao lado da caixa (`P.Balanco.ladoDaCaixa`).
- Sem Animações: segue o dedo e volta logo ao meio; puxou tudo = os dois aparecem direto na caixa.

## 6. A caixa de areia de perto
- Tocar na caixa: a pose `'areia'` (`poses-areia.js`, `config.parquinho.ms.areia`) senta os dois e, no `fim`, abre
  `UI.telaParquinhoAreia` (só se a cena ainda é o parque). Fechando, ela fica onde estava, ao lado da caixa.
- `Reino.ParquinhoAreia` (`areia-caixa.js`): a areia é uma grade de alturas; ela e o unicórnio sentados na frente.
  `usar(ferr, x, y, tipo?)` num toque; `comecar`/`mover`/`soltar` no arrasto. Ferramentas: cavar, castelo (torre
  que cresce até `andaresMax`), amontoar, alisar, enfeite (concha, estrela, bandeira, flor; até `enfeitesMax`).
  Amontoar em cima deles cobre até o pescoço (`cobrirPassadas`, a cabeça sempre de fora); cavar e alisar descobrem.
- Tudo em memória até fechar o jogo; nada no save. A caixa do parque mostra torres, buracos e montinhos
  (`desenharMundo`); a chave do objeto (`chaveMundo`) só muda com a tela fechada; fechar e a queda chamam
  `Reino.Interiores.refazer('parquinho')`.
- A queda do balanço: `P.areiaTombo()` marca os dois na areia e desmancha a torre de lá.

## 7. Testes
`npm run unidade -- --so parquinho` (fases 0/1/2, 3 completas sem Matemática nem LP, lugar liberado, brinquedos e
poses; `parquinho-balanco.test.js` e `parquinho-areia.test.js`); `npm run ver -- --materias
portugues4,matematica4,ingles4 --ir parquinho`.
