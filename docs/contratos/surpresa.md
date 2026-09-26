# Contrato: pergunta surpresa

Cobre `Reino.Surpresa`: de tempos em tempos (3 a 10 minutos de jogo livre) o Claude aparece com uma
pergunta das salas que ela já fez, valendo estrelas. Interruptor e carimbo no save: `save-e-mescla.md` §3–§4.

## Índice
1. Onde está no código · 2. API · 3. Tempo e relógio · 4. Que pergunta sai · 5. Painel · 6. Ajustes · 7. Antes de mexer

## 1. Onde está no código
- `jogo/js/sistemas/surpresa.js` — relógio, fila, sorteio, `Reino.Surpresa` (`Reino._surpresa` interno).
- `jogo/js/sistemas/surpresa-painel.js` — o painel (`OK_TRAVA_MS`), acerto/erro, fechar.
- `css/ui-novidades.css`. Números em `Reino.config.surpresa` (`minMinutos` 3, `maxMinutos` 10, `estrelas` 2,
  `esperaLivreMs` 4000, `tipos: ['escolha', 'vf', 'varias']`).

## 2. API `Reino.Surpresa`
```
iniciar({ tutorial })   // main.js chama no fim de entrarNoReino; tutorial = Promise da 1ª vez (ou null):
                        // o relógio só começa depois que ela resolver
forcar() → Promise      // debug: sorteia e mostra agora (se ela estiver ocupada, assim que ficar livre).
                        // Resolve quando o painel ABRE, com { materia, sala, desafio, tipo } (ids), ou null sem
                        // pergunta; com o painel já aberto, resolve na hora com o dele. Ignora o interruptor,
                        // `ativo`, o tempo sorteado e `esperaLivreMs`; espera ela livre, parada e com a aba visível
restante() → ms | null  // quanto falta (null com o interruptor desligado ou antes de iniciar)
aberta() → bool
proximaPergunta() → { materia, sala, desafio } | null   // o que sairia agora (para os testes)
falas() → [{ texto, voz }]   // tudo o que a surpresa fala (pacote geral)
frases() → { abertura, vale, ganhou, erro }   // FUNÇÃO (monta o número de estrelas); Cuidados.frases é objeto
```
Nada vai para o save nem para o localStorage (a fila vive na memória da sessão). Nada toca em DOM,
Progresso, Cena ou `document` no carregamento.

## 3. Tempo e relógio
1. Tempo sorteado entre `config.surpresa.minMinutos` e `maxMinutos` (3 a 10) de relógio livre.
2. O relógio conta só com ela livre: depois de iniciar (e do tutorial), `ajustes.surpresa !== false`, aba
   visível, toque ou tecla nos últimos 5 min, `Reino.Cena.estado()` `'mapa'` ou `'interior'` e
   `!Reino.Claude.aberto()`.
3. Andando também conta (o tempo corre); só a ABERTURA espera ela parada (sem `Jogador.caminho` nem
   `aoChegar`: ela termina o que começou), e ao abrir o painel chama `Jogador.parar()` (senão entraria sozinha
   na porta ao fechar a pergunta).
4. Relógio monotônico: `performance.now()` + `setInterval` (o relógio falso do Playwright também controla).
   Nunca `Date.now()` aqui: o relógio do aparelho mudando (ajuste manual, NTP) travaria ou dispararia a
   espera. Passo limitado a 5 s (aba que volta do fundo não dá salto).
5. Tutorial: o relógio começa quando a promessa resolver, OU depois de 10 s seguidos livre, OU no máximo
   2 min depois de entrar (`Claude.limpar()` pode descartar a promessa sem resolver).
6. Venceu com ela ocupada: espera ela ficar livre e parada e aparece depois de `esperaLivreMs` (4 s) seguidos.
   Nunca no meio de sala, treino, prova, tela, diálogo ou transição.
7. Recomeço depois de estudar: terminou sala, treino ou prova (`.tela-missao`/`.tela-prova` saiu da pilha,
   evento `telas`) → sorteia um tempo novo do zero.

## 4. Que pergunta sai
1. Só das salas que ela JÁ FEZ (`estado.salas[id].feita`); de qualquer matéria; só das salas
   (`materia.salas[].desafios`, nunca `Reino.provas`); só dos tipos `config.surpresa.tipos` (escolha, vf,
   varias; sem `livre: true`).
2. Nenhuma sala feita: nenhuma pergunta, e a surpresa não abre (o tempo é sorteado de novo; `forcar()` resolve `null`).
3. Fila: primeiro as que ainda não vieram na sessão; depois as que ela adiou com "Agora não" (a mais antiga
   primeiro); acabou tudo: recomeça, sem repetir a última.
4. `proximaPergunta()` e a abertura mostram a mesma (a sorteada fica guardada).
5. Carrega o pacote de voz da sala (`Reino.Voz.carregarSala`) antes, esperando no máximo 4 s; o 🔊 do card lê a pergunta.
6. Card com `Reino.Desafios.render(d, { modo: 'surpresa', onMudar })` (`modo` não tem efeito no `D.render`),
   correção com `Reino.Desafios.pontuar(d, valor) === 1`. Depende também de `D.enunciado`, `D.linhaCerta` e de
   `ctrl.pronto/valor/travado/marcarCerto/revelar/card`.
7. Toda sala deve ter pelo menos 6 desafios desses três tipos (`conteudo.md` §4).

## 5. Painel
1. Tela do DOM (`UI.painel('surpresa', '❓ Pergunta surpresa')`), com o Claude, o card, "Conferir" e "Agora não".
2. Esc = "Agora não" (vale sempre); tocar fora do cartão NÃO fecha.
3. Travas de 600 ms (`OK_TRAVA_MS`): "Agora não" e ✕ nascem travados (um toque no menu do celular no instante
   em que o painel abre não fecha a pergunta sem ela ver), e o "Ok!" do resultado também (o toque duplo no
   "Conferir" não fecha antes de ela ler).
4. Uma tentativa só:
   - acertou: `P.ganharEstrelas(config.surpresa.estrelas)` + `P.salvar()`, confete pequeno, som e elogio de
     `Claude.FALAS.acerto` sem os que citam "historiador" (servem para qualquer matéria);
   - errou: revela a certa no card (`ctrl.revelar`), mostra `D.linhaCerta(d)` e `d.explica`, sem perder nada;
   - nos dois, o enunciado se repete no topo do resultado e o painel rola até ele;
   - "Agora não", ✕ ou Esc: fecha sem nada e a pergunta volta para o fim da fila (não conta como feita).
5. Em todos os casos, sorteia o próximo tempo.
6. Ao fechar, o foco vai para o mapa (o painel não tem `_focoAntes`), nunca de volta ao botão do HUD (o Espaço
   de andar abriria o Estábulo).
7. Fechou com o dedo ("Ok!", "Agora não" ou ✕) e ela continua tocando perto dali (40 px, último toque há
   menos de 800 ms): 1 s depois de fechar, `UI.segurarToques(1)` renova a guarda, que dura até 3 s no total;
   o botão do menu que estava embaixo do painel não abre. Toque longe e teclado valem na hora.

## 6. Ajustes
Interruptor "❓ Perguntas surpresa" (`ajustes.surpresa`, em `UI.telaAjustes`). Desligado: nunca aparece e o
relógio não conta.

## 7. Antes de mexer, rode
```
node jogo/ferramentas/testes/testar-save.js          # ajustes.surpresa e surpresaEm na mescla
node jogo/ferramentas/validar/validar-conteudo.js    # salas com desafios dos tipos da surpresa
npm test
```
No navegador de teste: `__reino.surpresa()` (= `Surpresa.forcar()`).
