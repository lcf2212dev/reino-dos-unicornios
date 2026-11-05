# Plano: Portal e Bosque dos Fantasmas

## Resumo
- Portal no mapa: lugar registrado 1×1 em (53,38), `caminho: [[50,39],[51,39],[52,39],[53,39]]` (prolonga as pedras da casa). Desenho parado em `Mapa.PREDIOS['portal-bosque']`, brilho em `Mapa.PREDIOS_ANIM['portal-bosque']`.
- Bosque: interior de céu aberto `bosque` (`lugar: 'bosque'`, `entrada: true`), 56×44 tiles, um cômodo, layout por semente.
- Combate: módulo com `camada` (simulação avança em `itensDesenho`), passo puro testável no Node.
- Perguntas (pedido do Leandro, 05/11): sorteio uniforme entre TODAS as perguntas do bimestre em curso (`Reino.Bimestres.atual`; matérias desse bimestre, não arquivadas), independente de sala feita ou não: cada pergunta tem a mesma chance (não sorteia matéria e depois sala). Tipos com resposta conferível (`escolha`/`vf`/`varias`, sem `livre`). Sem fila e sem evitar repetição.
- Save: `bosque` (contadores) e `bosquePontos` (carimbo). Móvel por nível no `casaMoveis` com chave `bosque:<n>`.

## Evidências principais
1. Portal: (53,38) livre (árvores em (53,37),(54,37),(54,39), cristal em (52,38)); (53,39) liga à ponta do ladrilho da casa (49,39) (`casa/lugar.js:6`). rect 1×1 ⇒ porta = o tile (`mundo/mapa.js:35`); pisar: `Mapa.portaEm` → `Cena.acionar` → `entrarLugar` → `Cena.entrar` (`motor/cena.js:304-309, 243-248, 254-269`); tocar no tile ou no de baixo entra (`cena.js:124-127`); saída em (53,39) (`cena.js:297`). Lugar registrado entra depois do sorteio dos enfeites (`mapa.js:206-219`); caminho só pinta ladrilho (`mapa.js:110-113`).
   Sprite "alto": caixa de `px-16`..`px+w+16`, `py-40`..`py+h+6` (`mapa-desenho.js:205-209`); disco chato dentro do tile (pé PE=11,99, `:176`). `PREDIOS_ANIM` roda por quadro só com Animações ligadas (`mapa-desenho.js:316-320`; modelo `predios-2.js:188`); ~20 fillRect, cores prontas (nada de string/canvas por quadro).
2. Bosque = interior: `Cena.entrar` só entra em interior; `doLugar` (`interiores-cena.js:365-368`). Validador: 1 interior de entrada por lugar (`validar-interiores.js:103-104`); saída na última fileira de um cômodo, spawn logo acima (`:153-161`). 56×44, cômodo `{x:1,y:1,w:54,h:40}`, saída (28,40), spawn (28,39). Capacho/vão de luz da saída (`interiores-estatico.js:70-87`, chamada `:184`); onda 0 cria gancho `I.FUNDOS[id].saida(ctx,px,py)`. Céu aberto: padrão `planetas-comum.js:147-178`.
3. Combate: `ModuloDef` não tem `atualizar`; o laço chama `camada.itensDesenho` por quadro (`laco.js:100-104`), não com tela aberta (`:122`), sim durante íris/diálogo (`:124`) ⇒ congelar se `Reino.Cena.bloqueado()`. dt do `t`, limitado a 50 ms. Sorteios com `Reino.Desenho.rng(semente)`.
   Teclado: Enter/Espaço só agem no `alvoPerto` (`entrada.js:33-39`); o módulo põe `keydown` no `document` e ataca só se: no `bosque`, não bloqueado, sem tela, foco fora de controle e `alvoPerto` nulo.
   Toque: `UI.registrarBotaoHud` (`hud.js:62-68`); `pintar` tira o botão da fileira de cima (padrão Aura, `hud-aura.js:1-3`; `ui.md` §6.7) e põe redondo, fixo, embaixo à direita; escondido fora do Bosque (`casa-decorar.js:162-178`).
   Velocidade: onda 0 cria `Jogador.registrarFatorVelocidade(fn)` (`jogador.js:124-127`).
4. Pergunta: sorteio uniforme sobre todas as perguntas do bimestre atual (ver Resumo); coleta como `surpresa.js:83-96` mas sem preferência por salas feitas nem fila; tela copiando `ui/et-desafio.js:56-131` (`Desafios.render`/`pontuar`/`linhaCerta`, narradora, trava 600 ms). Estrela: `P.ganharEstrelas(1)` (`progresso-regras.js:44`), `P.salvar()`, `Aura.contar([ok], materia)` como `viagem-desafio.js:75-84`. Uma pergunta por fantasma, uma tentativa; fechar = erro; fantasma volta após `voltaMs`.
5. Save (`save-e-mescla.md` §11): `bosque: { acertos, espada, vencidos }` `mesclar: 'contadores'`; `bosquePontos: { '<nível>': { h, em } }` `mesclar: 'carimbo'`. Derivados: nível = `min(nivelMax, 1 + floor(acertos/acertosPorNivel))`; pontos = escolhas válidas com nível ≤ atual; pendentes = níveis 2..atual sem escolha. Ambos `novoCiclo: 'mantem'`, `copiaSeguranca: true`.
6. Móvel por nível: `casaMoveis` aceita qualquer chave (mescla carimbo `casa-moveis.js:14-20`; semente por chave `:68-75`). Novo `CasaMoveis.registrarFonte({ id, chaves(), titulo(chave) })`; `pendentes()` = salas + fontes; `CasaMoveis.titulo(chave)`; em `ui/casa-moveis.js:15-17` e `:25` trocar `salaInfo` por `CM.pendentes()`/`CM.titulo` (texto das salas não muda). Sem casa: `pendentes()` já devolve `[]` (`:44-45`); aparecem depois (login `main.js:152`, caixa/HUD `casa.js:347-350`).
7. HUD: chip na coluna da esquerda (padrão Aura): vida, "Nv N", XP n/10, selo de ponto pendente; tocar abre `UI.telaBosque`. Chip e botão `hidden` fora do `bosque`. Prêmio da espada ao fim da íris de entrada se `!temEspada()`, nunca no modo congelado (`main.js:151`). Subir de nível: 3 cartões (Força, Vida, Velocidade); "Depois"/Esc deixa pendente; trava 600 ms + `UI.segurarToques`.
8. Falas do Claude em `sistemas/bosque-falas.js` (`Reino.BosqueFalas`, modelo `ui/casa-falas.js`), voz `claude`, pacote `interior-bosque` (`som-musica-e-voz.md` §4). Nada de número na fala. Ícones novos: 👻 U+1F47B, 🗡 U+1F5E1, 🌀 U+1F300. Já existem 💖, ⭐, 💪, ⚡.

## Contrato entre frentes (API)
```
Reino.Bosque (C1, sistemas/bosque.js, node:true, módulo 'bosque')
  acertos() nivel() xp()→{n,de,maximo}  temEspada() ganharEspada()→bool(1ª vez)
  pontos()→{forca,vida,velocidade}  pontosPendentes()→[n]  porPonto(n,'forca'|'vida'|'velocidade')→bool
  dano() vidaMax() fatorVelocidade()  pergunta()→{materia,sala,desafio}|null
  acertou(materiaId)→{estrelas,nivel,subiu:n|null}  errou(materiaId)  chaveMovel(n)→'bosque:'+n
Reino.BosqueCombate (C2, módulo 'bosque-combate' com camada)
  ativo() vida()→{n,max} atacar()→bool fantasmas()→[{id,tipo,x,y,vida,max,estado}]
  devolver(id) reiniciar()  passo(estado,dt,jogador) (puro)
Reino.EVENTOS.BOSQUE {tipo:'vida'|'golpe'|'vencido'{id,tipo}|'desmaio'|'acerto'|'ponto'}
UI (D): telaEspadaBosque()→P  perguntaFantasma(f)→P<'certo'|'errado'|'depois'>  subirNivelBosque(n)→P  telaBosque()
```
Fluxo: C2 emite `vencido` → D abre a pergunta, chama `acertou`/`errou`, depois `devolver(id)`. Subiu: D abre `subirNivelBosque(n)`; depois, se `Casa.ganhou()`, `UI.escolherMovelCasa(chaveMovel(n))`, senão fala "móvel guardado".
Desmaio (C2): `Cena.ocupar('bosque-desmaio')` + estrelinhas; Claude fala; `Cena.irPara('bosque', spawn, {x:0,y:-1})`; `reiniciar()`.

## Ondas
**Onda 0 — contrato**: `nucleo/config.js` (bloco `fantasmas`), `nucleo/eventos.js` (`BOSQUE`), `personagens/jogador.js` (`Jogador.registrarFatorVelocidade(fn)`), `motor/interiores-estatico.js` (`desenharSaida` usa `FUNDOS[def.fundo].saida` se existir), `interiores/bosque/lugar.js` (id `bosque`, "Bosque dos Fantasmas", sprite `portal-bosque`, rect e caminho, `novidade: {desde:'2026-11-05', interior:'bosque'}`, menu 👻 e `info`), `sistemas/bosque-falas.js`, `interiores/bosque/bosque.js` (esqueleto válido), `docs/contratos/bosque.md` + linhas em `contratos/README.md`, `ARQUITETURA.md` §5, `cena-e-motor.md` §10, `interiores.md` §3.
Manifesto: `sistemas/bosque-falas|bosque|bosque-combate|bosque-desenho` logo depois de `et-companheiro-desenho.js`; `ui/bosque-*` depois de `ui/casa-moveis.js`; `css/ui-bosque.css` depois de `ui-casa-moveis.css`; `interiores/bosque/*` depois de `casa/lugar.js` e antes de `padrao.js` (Bosque = último interior; fotos das outras cenas do e2e não mudam).

**A — portal no mapa e ícones**: `interiores/bosque/fora.js`, `interiores/bosque/icones.js`. Modelo `observatorio/fora.js`, `predios-2.js:188`. Ler `cena-e-motor.md` §9 itens 4-7, `arte.md` §13 e §16, `jogo/js/CLAUDE.md` (Arte).
**B — cenário do Bosque**: `interiores/bosque/falas.js`, `fundo.js` (`I.FUNDOS.bosque` com `saida`, piso `bosque-grama`, parede `bosque-copas`), `objetos.js`, `objetos-2.js`, `bosque.js`. Modelo `planetas/lua.js`, `planetas-comum.js`. Ler `interiores.md` §3, §4, §6, §7, §9.7; `viagem.md` §5. Zonas: fileiras 27-38 fáceis (abertas), 15-26 médias, 3-14 difíceis; zona segura de 4 em volta do spawn.
**C1 — regras, save, móvel por nível**: `sistemas/bosque.js`, `sistemas/casa-moveis.js`, `ui/casa-moveis.js`. Modelo `viagem-desafio.js`, `casa-moveis.js`, `surpresa.js:83-125`. Ler `save-e-mescla.md` §2, §9, §11; `casa.md` §12; `surpresa.md` §4; `cena-e-motor.md` §14.
**C2 — combate e desenho**: `sistemas/bosque-combate.js`, `sistemas/bosque-desenho.js`. Modelo `sistemas/vida-mapa.js`. Ler `cena-e-motor.md` §5, §6, §11, §14; `arte.md` §13.
**D — telas e HUD** (depende de C1): `ui/bosque-hud.js`, `ui/bosque-pergunta.js`, `ui/bosque-nivel.js`, `css/ui-bosque.css`. Modelo `ui/et-desafio.js`, `ui/hud-aura.js`, `ui/casa-decorar.js:162-178`, `ui/bau-casa.js`. Ler `ui.md` §2-§6, §8; `arte.md` §16-§19.

## e2e
`--esperado 'interior-bosque|comodo-bosque-|tela-lugares|^dados/(falas|mapa|interiores|loja|save-estado-novo|save-mescla|npcs-status)\.json$|^vozes\.json$'`
Prêmio nunca abre no modo congelado; zona segura no spawn.

## config (`Reino.config.fantasmas`)
```js
fantasmas: { acertosPorNivel: 10, nivelMax: 1000, estrelasPorAcerto: 1, perguntaTipos: ['escolha', 'vf', 'varias'],
  jogador: { vidaBase: 10, vidaPorPonto: 2, danoBase: 1, danoPorPonto: 1, velocidadePorPonto: 0.04, velocidadeMax: 1.6,
    alcance: 20, recargaMs: 350, golpeMs: 180, invencivelMs: 1000, regenSemDanoMs: 5000, regenACadaMs: 3000 },
  tipos: { facil: { vida: 2, forca: 1, velocidade: 16 }, medio: { vida: 4, forca: 2, velocidade: 24 },
    dificil: { vida: 7, forca: 3, velocidade: 34 } },          // velocidade em px/s (ela a pé: 58)
  quantos: { facil: 5, medio: 4, dificil: 3 }, zonas: { facil: [27, 38], medio: [15, 26], dificil: [3, 14] },
  zonaSegura: 4, visao: 80, coleira: 144, raioToque: 9, recuoMs: 700, voltaMs: 20000, vencidoMs: 500, desmaioMs: 1600 },
```

## Falas (Claude, pacote `interior-bosque`; ≤30 letras)
- espada: "Você ganhou uma espada!" / "Ela tem a magia do Reino." / "Vença os fantasmas fofinhos!" / "Cada um traz uma pergunta."
- vencido: "Você venceu o fantasma!" / "Responda e ganhe uma estrela!"
- acerto: "Isso mesmo, muito bem!" / "Você acertou, que beleza!"
- erro: "Quase, veja a resposta certa." / "O fantasma volta depois." / "Depois você tenta de novo!"
- nivel: "Você subiu de nível!" / "Escolha onde pôr o seu ponto."
- ponto: forca "Sua espada ficou mais forte!" / vida "Agora você tem mais vida!" / velocidade "Agora você anda mais rápido!"
- semCasa: "Tem um móvel para a sua casa!" / "Ele fica guardado para você."
- desmaio: "Ufa, vamos descansar um pouco." / "Voltamos ao começo do bosque." / "Você não perdeu nada, viu?"
Objetos (frente B): placa "{Bem-vinda|Bem-vindo} ao bosque!" / "Os fantasmas daqui são fofos." / "Vença e responda às perguntas!"; árvore velha "Esta árvore é muito velhinha." / "Ela já viu muitos fantasmas."; cogumelo "Um cogumelo que brilha!" / "Ele ilumina o caminho."; lanterna "Uma lanterna das fadas." / "A luz dela nunca se apaga."
Só na tela: "Toque na espada, ou aperte Espaço, para atacar."
