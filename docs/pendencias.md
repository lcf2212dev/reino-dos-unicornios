# Pendências conhecidas (não corrigidas de propósito)

Defeitos e sobras achados no código que ficaram como estão, com o motivo. Corrigir um deles: commit próprio, com
teste, e a linha sai daqui. Os já corrigidos estão em `docs/decisoes/historico/bugs-da-refatoracao.md`.

| Onde | O que acontece | Por que fica |
|---|---|---|
| `sistemas/progresso-mescla.js` (`P.mesclar`) | Lança `TypeError` quando um lado é um save sem `salas` ou sem `unis` (visto nos pares com `lixo` das referências de dados do e2e). Na prática o jogo só mescla estados completados. | As regras de `P.mesclar` só mudam com teste de dois aparelhos (`docs/decisoes/mescla-do-save.md`). |
| `sistemas/progresso-mescla.js` (`P.mesclar`: base = lado com `atualizado` maior) | Escolha feita num aparelho (nome do unicórnio, montaria, `usando`, `aparencia`, `ajustes` fora a surpresa) volta atrás quando outro aparelho aberto, que ainda não a recebeu, grava depois e envia (ex.: a gravação dos cuidados, a cada 60 s com toque nos últimos 5 min): o `atualizado` dele é maior e vira a base. Caso provável: a Área dos pais aberta no notebook enquanto ela brinca no tablet. Reprodução: `save-pendencias.test.js` (`todo`). | Corrigir pede um carimbo por escolha (como o `surpresaEm`) e mudar a regra do `P.mesclar` para campos que já existem, o que `jogo/js/sistemas/CLAUDE.md` proíbe: decisão do Leandro. |
| `sistemas/progresso-mescla.js` (`pago`: vale o maior) | "Já pago" corrigido para MENOS na Área dos pais (40 digitado no lugar de 4) volta ao valor maior na próxima sincronização com outro aparelho ou com a nuvem. Reprodução: `save-pendencias.test.js` (`todo`). | O mesmo da linha de cima (carimbo `pagoEm` e regra nova para `pago`). |
| `atividades/desafios.js` (`D.pontuar`) | `memoria` sempre vale 0; valor em formato inesperado (ex.: `{}` num `varias`) lança erro. | A missão confere a memória pelo controle, e os valores reais vêm dos controles. |
| `motor/interiores-estatico.js` (`desenharSaida`) | `if (g.dentro(s.x, s.y + 1) \|\| true)` é sempre verdadeiro. | Tirar mudaria o desenho. |
| `sistemas/surpresa.js`, `sistemas/banho.js` | `elogioAcerto` chama `C.frase` sem checar `Reino.Claude`; `B.iniciar` usa `Jogador` sem checar. | Só importa fora do jogo. |
| `jogo/servidor/servidor.js` | Escuta em todas as interfaces: o servidor de TESTE fica visível na rede enquanto roda; sem variáveis de ambiente, o padrão é a porta 80 e o banco de casa. | `jogo/servidor/` é do Leandro. O `servidor-teste.js` sempre define porta e banco. |
| `jogo/servidor/` (`reino-nome.service`, container `reino-unicornios`) | A pasta principal foi renomeada de `/home/leandro/Mariana Revisões` para `/home/leandro/reino-dos-unicornios` em 27/09. A cópia `reino-nome.service` do repositório ainda aponta para o caminho antigo (a unidade instalada no systemd do usuário já foi corrigida), e o container foi criado com as montagens no caminho antigo: funciona até ser recriado ou o PC reiniciar, quando o Docker procura a pasta que não existe mais. | `jogo/servidor/` e o Docker são do Leandro: acertar o `ExecStart` da cópia e recriar o container da pasta nova (`docker compose up -d` em `jogo/servidor`; mesmo banco). |
| vários | Código sem uso: `comidaPorId` (ui/cuidados.js), `ICONE_ABRIR`/`ICONE_FECHAR` (ui/hud.js), `pers` em `convite()` (npcs-falas.js), `noRect` e `alvoCentro` (motor), `r` em `desenharChao` (mapa-desenho.js). | Não é bug. |

## Suspeitas não confirmadas
Mecanismo visto no código, mas sem reprodução aqui (só Chromium, sem aparelho de verdade) ou sem caso real hoje.
Confirmou com teste que falha: vira linha da tabela de cima ou correção.

| Onde | Suspeita | O que falta para confirmar |
|---|---|---|
| `sistemas/som.js` (`S.ativar`) | Só retoma o `AudioContext` em `'suspended'`; o Safari (iPad/iPhone) usa `'interrupted'` (tela bloqueada, ligação, outro app tocando): efeitos, música e voz podem ficar mudos até recarregar. | Um iPad de verdade (os testes são só Chromium). |
| `ui/hud-fotos.js`, `sistemas/fotos-telas.js` | Toque duplo no álbum antes de o IndexedDB abrir (1ª vez na sessão) abre dois álbuns, um em cima do outro. | Medir a 1ª abertura do banco num tablet lento (aqui abre em menos de 15 ms). |
| `atividades/provas.js`, `treino.js`, `missao.js` | O ✕ da tela de resultado diz que "a tentativa não vai contar", mas ela já contou (e o "Chocar o ovo" é pulado). | Um teste de navegador que feche o resultado pelo ✕. |
| `atividades/treino.js` (`Pr.balaoQueSome`) | O intervalo de 200 ms nunca é limpo se o balão não chega a aparecer (ficou na fila e o `Claude.limpar()` a descartou). | Um caminho real com outro balão aberto na hora do "Hora de revisar!". |
| `sistemas/cuidados.js` (`C.ativo`) | Com o relógio do aparelho voltando no tempo, os cuidados gastam sem toque por até o salto + 5 min. | Relógio do aparelho mudado com o jogo aberto (fuso e horário de verão não mudam o `Date.now()`). |
| `sistemas/progresso-nuvem.js` | Depois do erro `invalid_argument` do claude.ai, a nuvem fica desligada até recarregar a página. | O erro real do claude.ai (não se abre o artifact publicado). |
| `personagens/npcs-conversa.js` (`quebrarNaTela`) | Uma "palavra" de mais de 30 letras recursa sem fim. | Nenhuma fala chega perto hoje. |
| `ferramentas/artifact-delta.js` | Nome de arquivo com acento sai entre aspas do `git diff` (sem `core.quotePath=false`) e some do delta. | Nenhum arquivo do jogo tem acento, e o gerador só aceita `[a-z0-9-]`. |
