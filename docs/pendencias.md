# Pendências conhecidas (não corrigidas de propósito)

Defeitos e sobras achados no código que ficaram como estão, com o motivo. Corrigir um deles: commit próprio, com
teste, e a linha sai daqui. Os já corrigidos estão em `docs/decisoes/historico/bugs-da-refatoracao.md`.

| Onde | O que acontece | Por que fica |
|---|---|---|
| `atividades/desafios.js` (`D.pontuar`) | `memoria` sempre vale 0; valor em formato inesperado (ex.: `{}` num `varias`) lança erro. | A missão confere a memória pelo controle, e os valores reais vêm dos controles. |
| `motor/interiores-estatico.js` (`desenharSaida`) | `if (g.dentro(s.x, s.y + 1) \|\| true)` é sempre verdadeiro. | Tirar mudaria o desenho. |
| `sistemas/surpresa.js`, `sistemas/banho.js` | `elogioAcerto` chama `C.frase` sem checar `Reino.Claude`; `B.iniciar` usa `Jogador` sem checar. | Só importa fora do jogo. |
| `jogo/servidor/servidor.js` | Escuta em todas as interfaces: o servidor de TESTE fica visível na rede enquanto roda; sem variáveis de ambiente, o padrão é a porta 80 e o banco de casa. | `jogo/servidor/` é do Leandro. O `servidor-teste.js` sempre define porta e banco. |
| `jogo/servidor/` (`reino-nome.service`, container `reino-unicornios`) | A pasta principal foi renomeada de `/home/leandro/Mariana Revisões` para `/home/leandro/reino-dos-unicornios` em 27/09. A cópia `reino-nome.service` do repositório ainda aponta para o caminho antigo (a unidade instalada no systemd do usuário já foi corrigida), e o container foi criado com as montagens no caminho antigo: funciona até ser recriado ou o PC reiniciar, quando o Docker procura a pasta que não existe mais. | `jogo/servidor/` e o Docker são do Leandro: acertar o `ExecStart` da cópia e recriar o container da pasta nova (`docker compose up -d` em `jogo/servidor`; mesmo banco). |
| vários | Código sem uso: `comidaPorId` (ui/cuidados.js), `ICONE_ABRIR`/`ICONE_FECHAR` (ui/hud.js), `pers` em `convite()` (npcs-falas.js), `noRect` e `alvoCentro` (motor), `r` em `desenharChao` (mapa-desenho.js). | Não é bug. |

## Suspeitas não confirmadas
Mecanismo visto no código, mas sem reprodução aqui (só Chromium, sem aparelho de verdade) ou sem caso real hoje.
Confirmou com teste que falha: vira linha da tabela de cima ou correção.

Nenhuma no momento.
