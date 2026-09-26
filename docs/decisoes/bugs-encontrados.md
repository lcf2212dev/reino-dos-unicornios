# Bugs encontrados durante a refatoração

Regra: nada é consertado no meio da refatoração. No fim, com tudo verde, os bugs seguros são
corrigidos em commits separados, cada um com teste, e só a referência afetada é atualizada.

| # | Onde | O que acontece | Decisão | Situação |
|---|---|---|---|---|
| 1 | `sistemas/progresso-mescla.js` (P.mesclar) | Lança `TypeError` quando um lado é um save sem `salas` ou sem `unis` (ex.: `Cannot read properties of undefined (reading 'h1')`). Visto no corpus de `dados/save-mescla.json` (pares com `lixo`). Na prática o jogo mescla estados já completados. | Não corrigir: as regras de P.mesclar não mudam nesta tarefa. | aberto (registrado) |
| 2 | `ui/pais.js` | A tela dos pais diz "Digite o PIN dos pais (definido em js/config.js)", mas o arquivo agora é `js/nucleo/config.js`. | Corrigir (só texto para o Leandro; muda a imagem `tela-pais`). | a corrigir |
| 3 | `atividades/desafios/ligar.js` (`marcarErro`) | O par errado é apagado aos 450 ms, mas a classe `treme` do botão da direita só sai aos 600 ms e procura o par já apagado: o botão fica com `treme` para sempre e um novo erro nele não treme de novo (10 de 21 desafios de ligar no teste de interação). | Corrigir (seguro, só visual, com teste). | a corrigir |
| 4 | `atividades/desafios.js` (`D.pontuar`) | `memoria` sempre vale 0 em `D.pontuar`; lança erro com valor em formato inesperado (ex.: `{}` num `varias`). | Não corrigir: a missão confere memória pelo controle e os valores reais vêm dos controles. | registrado |
| 5 | `motor/interiores-estatico.js` (`desenharSaida`) | `if (g.dentro(s.x, s.y + 1) \|\| true)` é sempre verdadeiro. | Não mexer (tirar mudaria o desenho). | registrado |
| 6 | `sistemas/surpresa.js`, `sistemas/banho.js` | `elogioAcerto` chama `C.frase` sem checar `Reino.Claude`; `B.iniciar` usa `Jogador` sem checar. Só importa fora do jogo. | Não corrigir. | registrado |
| 7 | `jogo/servidor/servidor.js` | Escuta em todas as interfaces (não só 127.0.0.1): o servidor de TESTE fica visível na rede enquanto roda. Sem variáveis de ambiente, o padrão é a porta 80 e o banco de casa. | Não mexer: `jogo/servidor/` é do Leandro (o container só relê com restart). O `servidor-teste.js` sempre define porta e banco. | registrado para o Leandro |
| 8 | vários | Código sem uso: `comidaPorId` (ui/cuidados.js), `ICONE_ABRIR`/`ICONE_FECHAR` (ui/hud.js), `pers` em `convite()` (npcs-falas.js), `noRect` e `alvoCentro` (motor), `r` em `desenharChao` (mapa-desenho.js). | Não é bug; fica. | registrado |
