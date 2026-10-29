# Contrato: som, música e voz

Cobre os efeitos sonoros (`Reino.Som.tocar`), a música por ambiente (`Reino.Musicas` e o motor em
`Reino.Som`), as vozes gravadas (`Reino.Voz`: perfis, pacotes, cache) e as lições de voz para escrever
falas (até 30 letras por página, frases de 3+ palavras, conferência por transcrição).

## Índice
1. Onde está no código · 2. Efeitos · 3. Música por ambiente · 4. Vozes: perfis e pacotes ·
5. Lições de voz e texto · 6. Memória e rede (voz.js) · 7. Gravar vozes · 8. Antes de mexer

## 1. Onde está no código
- `jogo/js/sistemas/som.js` — AudioContext, efeitos (`SONS`, `S.tocar`), saída da voz (`Reino._som` interno).
- `jogo/js/sistemas/som-instrumentos.js` — instrumentos da música (WebAudio).
- `jogo/js/sistemas/som-musica.js` — motor da música (`S.musica`, `S.musicaAtual`, `S.renderizarFaixa`), ambiente.
- `jogo/js/sistemas/musicas-faixas.js` (as faixas, dados) e `musicas.js` (formato, API, expansão; formato
  documentado no topo).
- `jogo/js/sistemas/voz.js` — `Reino.Voz` (carregar pacotes, dividir, tocar, cache).
- `jogo/js/sistemas/falas.js` — `Reino.Falas.todas()` (tudo o que o jogo fala, por pacote).
- Perfis: `Reino.config.vozes` (`jogo/js/nucleo/config.js`); música: `Reino.config.musica`.
- Ferramentas: `jogo/ferramentas/vozes/listar-falas.js`, `gerar-vozes.py`, `empacotar-vozes.js`;
  `jogo/ferramentas/testes/testar-musicas.js`. Amostras: `amostras-de-voz/`.

## 2. Efeitos (`Reino.Som.tocar(nome)`, sintetizados)
1. `porta` (entrar/sair de prédio), `splash`/`gotas` (entrar/sair da água), `gole` (beber), `nhac` (comer),
   `bolhas`, `esfregar`, `chuveiro`, `sacudida` (banho), `clique` (foto), além dos de sempre (toque, acerto…).
2. "Som" desligado não cala a música; a música desligada não cala os efeitos (ganhos separados: `mestre`
   dos efeitos x ganho da música).

3. `Reino.Som.notaMusical(midi, { duracao?, volume?, timbre? })` toca uma nota afinada pelo
   número MIDI (Lá 4 = 69 = 440 Hz) e devolve uma função para interrompê-la. Respeita o ajuste Som,
   limita duração e volume e desconecta os nós ao terminar; as aulas encerram suas notas ao fechar.

## 3. Música por ambiente
1. `Reino.Musicas` (dados, sem DOM): `faixas: { <id>: { … } }`,
   `expandir(id) → [{ t, dur, freq, parte: 'melodia'|'harmonia'|'baixo'|'percussao', vol, onda? }]` (um loop
   inteiro, em segundos), `duracao(id) → s`, `secao()`, `compassos()`.
2. Formato (detalhado no topo de `musicas.js`): faixa `{ nome, bpm, compasso, tom, modo: 'maior'|'menor'|'dorico',
   volume, timbres, mix?, eco?, secoes, ordem, base? }`; seção `{ de?, acordes: '1 | 5 | 6 4 | 5M',
   melodia: "3 5:1.5 1':.5 | …", melodia2?, harmonia, baixo, percussao: 'b.c.a.c.', timbres?, oitava? }`.
   Na percussão, `onda` é o tipo do toque e `freq` a frequência central do filtro.
3. `Reino.Som.renderizarFaixa(id, segundos, { volume, taxa }) → Promise<AudioBuffer>` (OfflineAudioContext,
   mesmos instrumentos do motor), para o validador e para conferir picos e emendas.
4. Cada faixa: ≥ 20 s antes de repetir, ≥ 2 seções diferentes, nenhum trecho < 20 s repetido em loop, fim
   emendando no começo sem estalo. `testar-musicas.js` compara em tiques da grade (48 por batida). Brecha
   conhecida: uma frase de 1 compasso repetida só 2 vezes começando fora da batida não é pega (as faixas reais não têm isso).
5. Ambientes → faixa: `mapa`, `lago` (nadando), `museu`, `torre`, `portugues` (e `portugues-gelo` no cômodo
   `porto`: a cantiga da cozinha com sininhos, pad frio e eco), `castelo`, `escola`, `estabulo`, `loja`, `bau`,
   `petshop`, `observatorio`, `sala` (tela `.tela-missao`). Interior sem faixa própria: a do mapa.
6. Treino e prova (`.tela-prova`) e aulas da Escola de Música (`.tela-musica-teclado`,
   `.tela-musica-fundamentos`) em qualquer lugar da pilha: silêncio (fade) da música ambiente e volta ao sair.
   As notas das aulas continuam audíveis quando o ajuste Som está ligado.
7. O ambiente é decidido lendo a cena ativa, o nado e a tela do topo (`.tela-missao` = sala, `.tela-prova` =
   treino e prova), sem API nova na UI.
8. Nadar e trocar de cômodo só trocam a faixa depois de 250 ms firmes (sem vaivém na margem); ao voltar a
   um ambiente, a faixa continua de onde parou.
9. Motor: agendador pelo relógio do AudioContext (lookahead `config.musica.lookaheadS`, verificado a cada
   `intervaloMs`), ganho próprio da música, compressor leve na saída, crossfade `crossfadeS` na troca, abaixa
   para `comVoz` (30%) enquanto a voz fala, pausa com a aba escondida.
10. Rampas de volume sem `cancelAndHoldAtTime` (dava degrau de 8–17 dB no Chromium); descida e volta com a voz
    em rampa exponencial (0,6 s / 0,8 s). Volume interno: música perto dos efeitos e bem abaixo da voz.
11. `Reino.Som.musica(ligar)` liga e desliga tudo (`ajustes.musica`, padrão desligado).
12. `Reino.Som.musicaAtual() → { ligada, ambiente, faixa, tocando, volume, abafada, pausada }`.

## 4. Vozes: perfis e pacotes
1. As vozes são achadas pelo TEXTO EXATO e agrupadas em pacotes de nome fixo `js/voz/<pacote>.js`.
   Mudou uma vírgula, precisa gravar de novo.
2. Perfis de sempre (não mudam): `claude`, `narradora`, `unicornio`, `ingles`.
3. Perfil de personagem: `'npc-<id>': { voz, velocidade, tom, ingles?, efeito? }` em `Reino.config.vozes`
   (um por personagem).
   - `ingles` (opcional) = perfil usado nos trechos «em inglês» dessa personagem (padrão `'ingles'`); esse
     perfil também existe em `Reino.config.vozes` e é tratado como inglês na preparação do texto.
     `Reino.Voz.dividir(texto, voz)` usa esse campo (mesma divisão ao gravar e ao tocar).
   - `efeito: 'robo-leve'` (opcional): filtro metálico leve na gravação (`gerar-vozes.py`); muda a chave só
     dos perfis que têm efeito (ex.: `npc-cosmo`).
4. Pacotes:
   - `geral` — Claude, avisos, `Reino.Cuidados.falas()`, `Reino.Surpresa.falas()`, `Reino.LojaItens.FALAS`,
     `Reino.Fotos.falas()`;
   - `interior-<prédio>` (`def.pacote`; andares do mesmo prédio usam o mesmo) — NPCs, objetos e `extras` do
     prédio; carregado durante a íris de entrada;
   - `<matéria>-<sala>` (ex.: `portugues-p1`), `<matéria>-extra`, `<matéria>-livro`, `prova-<prova>`.
   Os de Português: `portugues-p1` a `portugues-p5`, `portugues-extra`, `portugues-livro`,
   `interior-portugues`, `prova-portugues-3bim`.
5. `extras: [{ texto, voz }]` no `Reino.falasDoPredio('<prédio>', …)`: falas do prédio que não saem de NPC nem de
   objeto (bebedouro, curiosidades, piadas do Cosmo). `Falas.todas()` põe no pacote `interior-<prédio>`.
6. `Reino.Falas.todas()` inclui `NPCs.falasPossiveis` de cada NPC e as `fala` dos objetos, no pacote do interior.
7. Todo texto falado precisa estar em alguma dessas listas, com a mesma divisão do balão.
8. Números que mudam são enumerados (como `treinoBloqueado`); nomes que ela digita não são falados;
   inglês entre «» (na tela aparece destacado, sem os sinais, e é falado pela voz inglesa).
9. Português: letras sozinhas em MAIÚSCULAS ("usando X ou CH", "a letra H") são lidas pelo nome (xis, cê agá,
   éle agá, ene agá, ésse, dois ésses, zê, érre, dois érres, éle, agá), só nos pacotes de Português
   (`listar-falas.js`). Em todos os desafios, a narradora lê somente a pergunta, sem instruções nem
   respostas, tanto automaticamente quanto no 🔊. Em V/F, lê "Verdadeiro ou falso?" e a afirmação.
10. Texto de apoio: lido pela narradora com `Reino.Falas.segmentosApoio(apoio)` (título, título de cada parte,
    cada item da lista, o texto), no pacote da sala ou da prova.
11. Falas com botão de seguir ou sair: `Reino.Voz.falarEsperando(segs, op) → { espera, fim }` (espera = false quando
    nada vai soar: voz desligada, sem gravação, AudioContext parado; `fim` resolve no fim da fala, quando outra a corta
    ou no teto de `config.esperaFala`) e `Reino.UI.esperarFala(alvos, segs, op)`, que fala e devolve esse `fim`. Só com
    `config.esperaFala.travar` (desligado desde 29/09/2026: ela pula, responde ou sai durante a fala; seguir ou fechar
    cala a voz) trava os botões dos alvos (classe `esperando-fala`; `.livre-na-fala` fica livre; Esc bloqueado) até o
    `fim`. O 🔊 durante uma espera usa `Reino.UI.ouvirDeNovo(segs, op)` (repete e estica a espera; `Som.falar`
    cortaria a fala e soltaria os botões). Toda fala que tem botão de seguir ou sair (balão, sala, treino, prova) passa
    por ela.
12. Amostras em `amostras-de-voz/` (13 a 44; 34 Dona Aveia, 35 Doutora Vega, 36 Robô Cosmo, 37 a 44 Casa das
    Palavras, Cavaleira Clara e Professora Lúcia).

## 5. Lições de voz e texto
1. Cada fala de personagem (ou página) com até 30 letras (sem contar «» e emoji): no celular cabem ~15–17 por
   linha e o balão tem 2 linhas.
2. Cada frase vira um áudio. Vozes multilíngues embolam frases portuguesas de 1–2 palavras soltas, sobretudo
   coladas a «inglês» ("Sou a «Miss Stella»" → "Soa"). Use frases de 3+ palavras ("Eu sou a «Miss Stella».")
   e o padrão «palavra» + "quer dizer <português>.".
3. Toda gravação nova é conferida por transcrição (faster-whisper) antes de entregar.
4. Gravação e conferência: só quem integra (o orquestrador). Quem escreve falas entrega o texto.

## 6. Memória e rede (`voz.js`)
1. Áudio decodificado: cache LRU de `AudioBuffer` com teto de 24 MB (`TETO_BUFFERS`); a fala usada há mais
   tempo sai primeiro e, se voltar, é decodificada de novo do base64 (que continua guardado).
2. Duas filas: as falas ouvidas uma vez (curiosidades, perguntas) saem antes das que se repetem (acertos,
   erros, avisos do Claude), que têm até 14 MB protegidos (`TETO_REPETIDAS`); a que acabou de chegar sempre
   fica. `V.memoria()` → `{ falas, repetidas, bytes }` para os testes.
3. Pacote que falhou (Wi-Fi caiu): é esquecido e pedido de novo sozinho em 3 s, 10 s e 30 s (`ESPERAS`), também
   na próxima fala (no máximo a cada 5 s) e na hora no evento `online`. A fala que já passou muda não toca atrasada.

## 7. Gravar vozes (quem integra)
```
node jogo/ferramentas/vozes/listar-falas.js          # gera jogo/ferramentas/gerado/falas.json
cd jogo && uv run --with edge-tts python ferramentas/vozes/gerar-vozes.py
node jogo/ferramentas/vozes/empacotar-vozes.js       # --saida <pasta>: grava em outra pasta, para conferir
```
(ou `npm run vozes`). Só as falas novas são gravadas; as antigas ficam no cache gerado. Nunca abra
`falas.json`, `vozes-indice.json`, `vozes-cache/` nem `js/voz/*.js` (são enormes).

## 8. Antes de mexer, rode
```
node jogo/ferramentas/testes/testar-musicas.js
node jogo/ferramentas/vozes/listar-falas.js      # e compare a lista de falas (referencias.js --so vozes)
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so vozes
npm test
```
No navegador de teste: `__reino.musicaAtual()`.
