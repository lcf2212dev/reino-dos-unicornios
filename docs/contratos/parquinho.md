# Parquinho (portal na praça e brinquedos)

Pedido: `pedidos/2026-11-05-parquinho.md`. Com 3 matérias completas, uma delas Matemática ou Língua Portuguesa, o
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
| como cada um brinca | `poses.js` (fase 1, ajudantes `P.H`), `poses-2.js` (fase 2) |
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
- `Reino.ParquinhoBrincar = { registrarPose(id, def), poses(), brincar(acao, ctx), ativo(), emUso(id), castelos(),
  itens(), sobre(), parar(), depurar() }`; o formato de `def` está no cabeçalho de `brincar.js`.
- Como a casa (`casa.md` §13): `Cena.ocupar('parquinho')`, toque ou Enter depois de `pularDepoisMs` pula para o fim,
  temporizador de segurança, versão curta (`curtaMs`) sem Animações. Troca de cena encerra.
- O desenho normal dela e do unicórnio some enquanto o módulo diz `desenhaEla()` (`cena-e-motor.md` §14); a pose
  desenha os dois. Pose com `esconde`: a parte que se mexe sai do desenho parado (`emUso` na `chave`, `refazer`).
- O castelinho da caixa de areia fica de pé até fechar o jogo (memória, `castelos()`).

## 5. Testes
`npm run unidade -- --so parquinho` (fases 0/1/2, 3 completas sem Matemática nem LP, lugar liberado, brinquedos e
poses); `npm run ver -- --materias portugues4,matematica4,ingles4 --ir parquinho`.
