# Contratos: banho, Observatório de galáxia, fotos, música por ambiente e fim das placas do mapa

Branch `feat/banho-fotos-musica` (worktree `/home/leandro/reino-banho`, criada da main 9985fa7). Estende
`CONTRATOS-INTERIORES.md`, `CONTRATOS-NOVIDADES.md` e `CONTRATOS-PORTUGUES.md`, que continuam valendo.
Mudança de contrato: só o orquestrador.

Convenções de sempre: scripts clássicos, tudo em `window.Reino` (e `Mapa`, `Jogador`, `PA`), nomes e
comentários em português, pixel art em código (contorno `#3a2446`, tile de 16 px), sem imagens. Todo emoji
na tela ou no canvas tem ícone em `js/icones.js` (🛁 📷 🖼 🫧 🧽 🚿 💾 🗑 ✨ 🎵 🧼 📸 já existem; 🦆 e 📥 não).
Animações desligado e `prefers-reduced-motion` valem em tudo. Texto para criança: pt-BR correto e carinhoso,
falas de personagem com até 30 letras por página, frases de 3 palavras ou mais.

## 0. Arquivos e donos (Fase 1)

| Dono | Arquivos |
|---|---|
| B1 save e cuidados | `js/progresso.js`, `js/cuidados.js`, `ferramentas/testar-save.js`, `ferramentas/testar-banho.js` (novo) |
| B2 banheira e animação | `js/banho.js` (novo), `js/interiores/petshop.js`, `js/interiores/petshop-falas.js`, `js/jogador.js`, `js/main.js` |
| B3 música e sons | `js/audio.js`, `js/musicas.js` (novo), `ferramentas/testar-musicas.js` (novo) |
| B4 fotos | `js/fotos.js` (novo), `css/fotos.css` (novo), `js/icones.js` |
| B5 Observatório | `js/interiores/observatorio.js`, `js/interiores/observatorio-cenas.js` |
| B6 placas e UI | `js/cena.js`, `js/ui.js`, `css/jogo.css`, `css/petshop.css`, `js/interiores/estabulo.js`, `js/interiores/*-falas.js` que não são de B2/B5 (só textos de "placa"), `ferramentas/validar-interiores.js` (só o que for de placa do mapa) |
| Orquestrador | `index.html`, `js/config.js`, `js/falas.js`, `ferramentas/listar-falas.js`, `js/debug.js`, `js/voz/*`, vozes, docs, commits |

Ordem nova dos scripts (index.html): `… progresso, audio, musicas, voz, claude, falas, cuidados, surpresa,
mapa, jogador, minijogos, prova, provas, ui, fotos, interiores.js, npcs.js, interiores/*, banho, cena.js, main.js, debug.js`.
CSS novo: `css/fotos.css`. `js/musicas.js`, `js/fotos.js` e `js/banho.js` **não tocam em DOM, canvas, PA,
Progresso nem Cena no carregamento** (as ferramentas em Node os carregam num `vm`).

## 1. Banho no save (js/progresso.js)

Não mudam: `chaveSave`, `v`, `geracao`, `ciclo`, o formato dos campos existentes e as regras de mescla deles.
O registro de cuidados ganha dois campos, só aditivos:

```
cuidados: { <uniId>: { fome, sede, banho, em, acao, acaoFome, acaoSede, acaoBanho } }
  banho      0–100 (100 = limpinho). Ausente = 100 (unicórnio sem registro ou registro da versão de hoje).
  acaoBanho  carimbo do último banho: max(Date.now(), acaoBanho + 1), sempre crescente; 0 = nunca.
```
- **`acao` NÃO muda de sentido:** continua o maior de `acaoFome`/`acaoSede` e o banho não mexe nele. Assim
  um aparelho da versão de hoje (que trata um `acao` novo como comer e beber) nunca vê um banho como comida.
- **Mescla do banho (`juntarCuidados`, depois da regra da fome e da sede, com os valores ORIGINAIS dos dois lados):**
  - só um lado tem `banho` numérico: vale esse lado (`banho` e `acaoBanho`), mesmo que a regra da fome e da
    sede tenha escolhido o registro inteiro do outro lado (aparelho de hoje nunca faz o banho sumir);
  - os dois lados têm: carimbo = `acaoBanho` numérico ≥ 0, ou 0; vence o carimbo maior; empate = o menor
    `banho` (o gasto só desce); `acaoBanho` = o maior;
  - nenhum lado tem: nada (continua ausente).
- **Normalização (`normalizarNovos`):** `banho` presente e inválido vira 100, presente fica entre 0 e 100;
  **ausente continua ausente**; `acaoBanho` que não é número ≥ 0 é apagado.
- **"Trouxe algo novo" (`conteudo`):** só os carimbos contam: o `acaoBanho` entra junto com `acao`,
  `acaoFome`, `acaoSede`. O `banho` em si (muda a cada segundo) não entra.
- **Cópia `-novidades`:** já leva `cuidados` inteiro; o filtro continua exigindo `fome`, `sede`, `em`; o banho
  volta dela pela mesma regra de mescla.
- "Novo ciclo" mantém; "Apagar tudo" zera (como fome e sede).

## 2. Banho nos cuidados (js/cuidados.js, `Reino.Cuidados`)
```
niveis(uniId?) → { fome, sede, banho }          // sem registro / sem campo = 100
baixo(uniId?)  → { fome, sede, banho }          // < config.cuidados.baixo (25)
icone(uniId?)  → '💧' | '🍎' | '🛁' | null       // prioridade: sede, fome, banho
sujo(uniId?)   → bool                           // banho < 25 (o desenho sujinho)
fatorVelocidade()                               // NÃO muda: só fome/sede. Sujinho não fica lento
banhar(uniId?) → { ok: true, antes, depois: 100 } | { ok: false, motivo: 'cheio' | 'sem-uni' }
                 // 'cheio' = banho ≥ 99,5; banho = 100, acaoBanho = max(agora, acaoBanho + 1), em = agora,
                 // grava na hora (P.salvar) e emite 'cuidados'. De graça. Não mexe em acao/acaoFome/acaoSede.
avancar(ms)    // também gasta o banho
depurar()      // + banho, sujo; todos: { uniId: { fome, sede, banho } }
frases         // novas chaves: lembreteBanho (Claude), banhou (unicórnio), jaLimpinho (Claude)
vozDaFrase('banhou') = 'unicornio'
```
- Ritmo: `config.cuidados.minutosBanho` (180) de 100 a 0, mesmo relógio e mesmas condições da fome e sede
  (só a montaria, só com ela jogando). Cruzar o 25 grava e emite, como a fome e a sede.
- Lembrete: o mesmo limite (1 a cada `lembreteMs`, livre, fora da Pet Shop). `lembreteBanho` só quando a
  fome e a sede não estão baixas (elas têm prioridade).

## 3. Banheira e animação (js/banho.js, `Reino.Banho`; js/interiores/petshop.js)
- O objeto `petshop-banheira` vira interativo ("Banho de espuma"), `acao: { tipo: 'banho' }`, registrado
  com `Reino.NPCs.registrarAcao('banho', fn)`. De graça. Tocar: ela anda até a banheira (como no bebedouro).
- `Reino.Banho = { iniciar(uniId) → Promise, ativo() → bool, depurar() → { ativo, fase, t, curta, uniId, pulou },
  itensDesenho(pintor, t, animar) → itens (main.js junta aos itens da cena), sobre(ctx, pintor, t, animar) }`.
- Estado: `Reino.Cena.ocupar('banho')` no começo e `Reino.Cena.liberar('banho')` no fim (já existe em
  cena.js: `Cena.estado()` vira 'atividade', o input fica bloqueado; evento `'ocupada'`). Depois de
  `config.banho.pularDepoisMs` (2 s), um toque (ou Enter/Espaço) pula para o fim.
- Fases (~6 s, `config.banho.duracaoMs`): `entrar` (cortado na linha da espuma, como no nado), `espuma`
  (cresce, bolhas sobem e estouram), `esfregar` (escova vai e vem), patinho balançando o tempo todo,
  `chuveiro` (enxágua), `sacudir` (sai e se sacode, gotas voando), `brilhos` ("limpinho").
  Sem Animações: versão curta (`duracaoCurtaMs`, ~1 s), só com brilho.
- Montada: a Mariana desce e fica ao lado (só no desenho; `J.montado()` não muda) e volta a montar no fim.
  Bebê: vai sozinho, ela fica ao lado.
- Fim: `Reino.Cuidados.banhar(uniId)`, fala `banhou` (voz 'unicornio', balão com retrato), liberar a cena.
  Banho com a barra cheia: fala `jaLimpinho`, sem animação.
- Sons (Reino.Som.tocar): `'bolhas'`, `'esfregar'`, `'chuveiro'`, `'sacudida'`.
- Sujinho (jogador.js): com `Cuidados.sujo()` o unicórnio ganha manchinhas no pelo e uma nuvenzinha de
  poeira (anima só com Animações). O ícone 🛁 vem de `Cuidados.iconeMontaria()` (já desenhado hoje).
- Falas novas da Dona Aveia sobre o banho (petshop-falas.js, pacote interior-petshop) e o guia da Pet Shop
  menciona a banheira.

## 4. Observatório de galáxia (observatorio.js, observatorio-cenas.js)
Paleta azul-marinho → azul #2f3fb8 → roxo #6c3fd4 → magenta #b24fe0, toques ciano #6fd6ff e rosa; faixa de
Via Láctea na cúpula; halos em anéis de pixel; estrelas em cruz; poeira cintilante; estrelas que trocam de cor
(branco → ciano → lilás) em ritmos diferentes; estrela cadente a cada 8–15 s. Nos 3 cômodos, na cena do
telescópio e no prédio do mapa. Nebulosas e céu pré-renderizados (canvas cacheado); no máximo ~80 partículas
animadas; parado e colorido sem Animações. Balões, placas dos cômodos e ícones de status legíveis.

## 5. Fotos (js/fotos.js, css/fotos.css; `Reino.Fotos`)
```
Reino.Fotos = {
  podeTirar() → bool          // jogo começou, Cena.estado() é 'mapa' ou 'interior' (nadando inclusive), sem tela
  tirar() → Promise<foto|null> // flash + som 'clique' + prévia "Que foto linda!"
  abrirAlbum() → Promise
  depurar() → { podeTirar, banco: 'ok' | 'sem-indexeddb' | 'erro', quantidade, ultima: { lugar, data, w, h } | null }
  falas() → [{ texto, voz }]  // pacote geral
}
```
- Captura só o canvas `#reino` (sem HUD), depois de desenhar um quadro limpo, sem íris. Escala inteira mais
  próxima (vizinho mais próximo) com o lado maior ≤ `config.fotos.maxLado`; moldura em pixel e carimbo com
  o nome do lugar e a data, na fonte pixel. PNG.
- Prévia com "Guardar no álbum" (padrão), "Salvar no aparelho" (download `reino-<lugar>-<data>.png`, lugar
  sem acento e com hífen, data AAAA-MM-DD) e "Apagar".
- Álbum em IndexedDB próprio `config.fotos.banco` ('reino-fotos'), só no aparelho, até `maxAlbum` (40) fotos
  (avisa quando lotar). Grade, ver grande, salvar, apagar com confirmação. Nunca no save nem no servidor.
  Sem IndexedDB (ou erro): só salvar no aparelho, com aviso gentil.
- Nunca pedir câmera (nada de getUserMedia).
- Botão 📷 no HUD de cima, perto da tela cheia (ui.js, B6): toque → `Fotos.tirar()`; toque longo
  (`config.fotos.toqueLongoMs`) → `Fotos.abrirAlbum()`. Desabilitado quando `!Fotos.podeTirar()`.

## 6. Música por ambiente (js/audio.js, js/musicas.js)
- `Reino.Musicas` (dados, sem DOM): `faixas: { <id>: { nome, bpm, … , secoes, ordem } }`,
  `expandir(id) → [{ t, dur, freq, parte: 'melodia'|'harmonia'|'baixo'|'percussao', vol, onda? }]` (um loop
  inteiro, em segundos), `duracao(id) → s`, `secao()`, `compassos()`. O formato exato fica documentado no topo de musicas.js:
  faixa `{ nome, bpm, compasso, tom, modo: 'maior'|'menor'|'dorico', volume, timbres, mix?, eco?, secoes, ordem, base? }`;
  seção `{ de?, acordes: '1 | 5 | 6 4 | 5M', melodia: "3 5:1.5 1':.5 | …", melodia2?, harmonia, baixo, percussao: 'b.c.a.c.', timbres?, oitava? }`.
  Na percussão, `onda` é o tipo do toque e `freq` a frequência central do filtro.
- `Reino.Som.renderizarFaixa(id, segundos, { volume, taxa }) → Promise<AudioBuffer>` (OfflineAudioContext, mesmos
  instrumentos do motor), para o validador e para conferir picos e emendas.
- Conferência pelos dados: `node jogo/ferramentas/testar-musicas.js`.
- Cada faixa: ≥ 20 s antes de repetir, ≥ 2 seções diferentes, nenhum trecho < 20 s repetido em loop, fim
  emendando no começo sem estalo.
- Ambientes → faixa: `mapa`, `lago` (nadando), `museu`, `torre`, `portugues` (e `portugues-gelo` no cômodo
  `porto`, se couber), `castelo`, `escola`, `estabulo`, `loja`, `bau`, `petshop`, `observatorio`, `sala`
  (tela `.tela-missao`). Treino e prova (`.tela-prova`): silêncio (fade) e volta ao sair. Interior sem faixa
  própria: a do mapa.
- Motor: agendador pelo relógio do AudioContext (lookahead `config.musica.lookaheadS`, verificado a cada
  `intervaloMs`), ganho próprio da música (separado do `mestre` dos efeitos), compressor leve na saída,
  crossfade `crossfadeS` na troca, abaixa para `comVoz` (30%) enquanto a voz fala, pausa com a aba escondida.
- `Reino.Som.musica(ligar)` continua ligando e desligando tudo (ajustes.musica, padrão desligado). Som
  desligado não cala a música.
- `Reino.Som.musicaAtual() → { ligada, ambiente, faixa, tocando, volume, abafada, pausada }`.
- Sons novos em SONS: `bolhas`, `esfregar`, `chuveiro`, `sacudida` (banho), `clique` (foto).

## 7. Placas do mapa removidas (js/cena.js, js/ui.js)
- Sai: desenho das placas dos prédios, toque na placa, desvio do HUD (`caixaParada` etc.) e código morto.
  O campo `placa` dos dados de mapa.js fica sem uso.
- Fica: toque no prédio, arco-íris dos concluídos, placas DOS CÔMODOS nos interiores.
- Menu Lugares mostra o nome e os avisos que a placa dava: `0/5`/`Pronto` (matéria), `Ovo` (Estábulo),
  `Prova` (Escola), `Sede`/`Fome`/`Banho` (Pet Shop).
- HUD: 3ª barrinha (banho, ícone 🛁) no chip da montaria; barra de banho na tela do Estábulo; ícone nas baias.

## 8. Teste (todos)
- Servidor de teste próprio de cada agente, com banco temporário, na porta dele (nunca 80):
  `cd /home/leandro/reino-banho/jogo && PORTA=<porta> BANCO="$(mktemp -d)/reino-teste.db" node servidor/servidor.js &`
  guardando o PID (`$!`) e derrubando só por ele (nunca pkill/killall por nome).
- Playwright: `/tmp/reino-banho-pw/abrir.js` (`abrir({ porta, save, tamanho: 'celular'|'tablet'|'notebook', animacoes })`),
  saves sintéticos em `/tmp/reino-banho-pw/saves/` (hoje-sem-banho, banho-baixo, tudo-baixo, bebe-banho-baixo, banho-cheio).
- Gancho `?debug=1` (`window.__reino`): `avancarJogo(ms)`, `cuidados()`, `banho(uniId)` (chama Cuidados.banhar),
  `animacaoBanho()`, `musicaAtual()`, `fotos()`, `tempoQuadro()`.

## Decisões
- D1. `acao` continua sendo só de comer/beber; o banho tem carimbo próprio (`acaoBanho`) e não mexe em `acao`,
  para aparelhos da versão de hoje não confundirem banho com comida.
- D2. `banho` ausente continua ausente na normalização (vale 100 na leitura); só valor presente e estragado vira 100.
- D3. Estado 'atividade' da animação do banho: `Cena.ocupar/liberar` (cena.js) em vez de uma tela DOM, para o
  canvas continuar desenhando a animação.
- D4. Música decide o ambiente lendo a cena ativa, o nado e a tela do topo (`.tela-missao` = sala,
  `.tela-prova` = treino e prova), sem precisar de API nova na UI.
- D6. Fotos: a prévia descarta com ✕/Esc; "Apagar" na prévia não pergunta (a foto ainda não foi guardada). Avisos
  escritos na tela também são falados só como voz (sem balão); só "Foto guardada no álbum!" usa o balão do Claude.
  Escala inteira com vizinho mais próximo; interior menor que a tela sai com as margens escuras do canvas.
- D7. O Álbum NÃO entrou no menu de baixo: com 5 botões o menu ficou com 420 px numa tela de 390 e cortava. O álbum
  abre pela prévia e segurando o 📷. No celular o 📷 fica embaixo do botão de tela cheia; no tablet/notebook, ao lado.
- D8. Banho: a banheira age como o bebedouro (toca e começa, sem a fala antiga do objeto); ela para no tile (21,7)
  virada para a banheira. Durante o banho todos os toques da tela (inclusive HUD) são ignorados, com um temporizador
  de segurança que sempre libera a cena. A frase `banhou` virou "Que banho cheiroso! Agora estou limpinho! ✨"
  (3+ palavras por frase). A Dona Aveia mostra "Precisa de banho" quando o ícone é 🛁.
- D9. Carregar o save, comer ou beber não cria o campo `banho`; só o gasto (ou o banho) cria.
- D10. Música: `.tela-prova` em qualquer lugar da pilha = silêncio; nadar e trocar de cômodo só trocam a faixa depois
  de 250 ms firmes (sem vaivém na margem); ao voltar a um ambiente a faixa continua de onde parou; `portugues-gelo`
  é a cantiga da cozinha com sininhos, pad frio e eco. Volume interno ajustado para a música ficar perto dos efeitos
  e bem abaixo da voz.
- D11. Observatório: piso da Cúpula e da Galeria em galáxia clara (contraste com o contorno da Mariana ≥ 2,9), cerca
  de 78 partículas animadas no prédio todo; o Planetário mantém o chão clareado que o pai aprovou.
- D12. Placas: `UI.avisosDoLugar(l)` em ui.js no lugar de `extraDaPlaca`; o campo `placa` dos dados ficou sem uso;
  `mapa.desenharTela` ficou vazio (o main.js ainda chama); evento novo `'transicao'` (true/false) em cena.js.
- D13. Interruptores dos Ajustes leem `P.estado().ajustes` na hora do toque (defeito antigo: a tela guardava o objeto
  e, depois de uma mescla com a tela aberta, o 🎵 parava a música mas o save continuava ligado).
- D14. Blocos do HUD de cima (`.hud-esq`, `.hud-dir`, `.hud-botoes`) com `pointer-events: none`; só botões e chips pegam
  toque (o 📷 tinha criado uma faixa morta sob o chip da montaria no celular).
- D15. Maiúscula acentuada com a fonte reserva (sem internet para a fonte do Google) sai com o acento deslocado em todo
  o jogo ("´Album", "´Area dos pais"); defeito antigo e geral, fora do escopo; com a Press Start 2P sai certo. Não mexido.
- D16. Música: rampas de volume sem `cancelAndHoldAtTime` (dava degrau de 8–17 dB no Chromium); descida e volta com a voz
  em rampa exponencial (0,6 s / 0,8 s). `testar-musicas.js` compara em tiques da grade (48 por batida). Brecha conhecida:
  uma frase de 1 compasso repetida só 2 vezes começando fora da batida não é pega (as faixas reais não têm isso).
- D17. `Mapa.PREDIOS_ANIM[sprite](ctx, px, py, w, h, t)`: gancho genérico na camada animada do mapa (só com Animações),
  usado pelo Observatório para cintilar no mapa.
- D18. Download no mapa: `reino-dos-unicornios-<data>.png` (sem repetir "reino").
- D5. Portas de teste: B1 8791, B2 8792, B3 8793, B4 8794, B5 8795, B6 8796; validadores 8797 em diante.
