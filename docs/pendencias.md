# Pendências conhecidas (não corrigidas de propósito)

Defeitos e sobras achados no código que ficaram como estão, com o motivo. Corrigir um deles: commit próprio, com
teste, e a linha sai daqui. Os já corrigidos estão em `docs/decisoes/historico/bugs-da-refatoracao.md`.

| Onde | O que acontece | Por que fica |
|---|---|---|
| `sistemas/progresso-mescla.js` (`P.mesclar`) | Lança `TypeError` quando um lado é um save sem `salas` ou sem `unis` (visto nos pares com `lixo` das referências de dados do e2e). Na prática o jogo só mescla estados completados. | As regras de `P.mesclar` só mudam com teste de dois aparelhos (`docs/decisoes/mescla-do-save.md`). |
| `atividades/desafios.js` (`D.pontuar`) | `memoria` sempre vale 0; valor em formato inesperado (ex.: `{}` num `varias`) lança erro. | A missão confere a memória pelo controle, e os valores reais vêm dos controles. |
| `motor/interiores-estatico.js` (`desenharSaida`) | `if (g.dentro(s.x, s.y + 1) \|\| true)` é sempre verdadeiro. | Tirar mudaria o desenho. |
| `sistemas/surpresa.js`, `sistemas/banho.js` | `elogioAcerto` chama `C.frase` sem checar `Reino.Claude`; `B.iniciar` usa `Jogador` sem checar. | Só importa fora do jogo. |
| `jogo/servidor/servidor.js` | Escuta em todas as interfaces: o servidor de TESTE fica visível na rede enquanto roda; sem variáveis de ambiente, o padrão é a porta 80 e o banco de casa. | `jogo/servidor/` é do Leandro. O `servidor-teste.js` sempre define porta e banco. |
| vários | Código sem uso: `comidaPorId` (ui/cuidados.js), `ICONE_ABRIR`/`ICONE_FECHAR` (ui/hud.js), `pers` em `convite()` (npcs-falas.js), `noRect` e `alvoCentro` (motor), `r` em `desenharChao` (mapa-desenho.js). | Não é bug. |
