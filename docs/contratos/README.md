# Contratos do jogo (índice)

Invariantes e APIs do "Mariana e o Reino dos Unicórnios", um arquivo por assunto. Antes de mexer num assunto, leia o
contrato dele. Mudança de contrato: só o orquestrador. Histórico da refatoração: `docs/decisoes/historico/`.

## Índice: assunto → contrato
| Assunto | Contrato |
|---|---|
| cena ativa, transição em íris, câmera, pintor, laço, entrada, camadas de desenho, mapa, jogador, nado, depuração | `cena-e-motor.md` |
| interiores (prédios por dentro): formato, cômodos, portas, objetos, biblioteca, grade, "rico", validador, cada prédio | `interiores.md` |
| NPCs, elenco, status, balões, falas até 30 letras por página, ações e telas | `npcs-e-dialogo.md` |
| telas e UI: pilha de telas, `UI.painel`, foco/Tab/Esc, HUD e `UI.registrarBotaoHud`, guarda de toque, Área dos pais | `ui.md` |
| save, progresso, `chaveSave`, cópia `-novidades`, `P.mesclar`, sincronização, carimbos, segurança do progresso (§9) | `save-e-mescla.md` |
| fome, sede, banho, despensa, Pet Shop, banheira | `cuidados.md` |
| loja, enfeites, comidas, preços, prêmios da escola | `loja.md` |
| pergunta surpresa | `surpresa.md` |
| viagem de foguete: combustível, painel, voo, planetas, ETs, pulo | `viagem.md` |
| som, música por ambiente, vozes gravadas (achadas pelo texto exato), pacotes, lições de voz | `som-musica-e-voz.md` |
| fotos e álbum | `fotos.md` |
| matérias, salas, desafios e tipos, livro, provas, treino, Português | `conteudo.md` |
| temporada ativa, arquivo do terceiro bimestre, espera e preservação de conquistas | `bimestres.md` |
| Laboratório de Química: misturas, caderno de receitas, microscópio, tabela periódica, 2º andar (curiosidades, estados, separar, livros), campo `quimica` | `quimica.md` |
| experiências e mini-jogos do Laboratório de Ciências no Observatório | `laboratorio-atividades.md` |
| plano de frentes paralelas, reserva de personagem (vaga tracejada), ondas, conferência em pipeline | `plano-paralelo.md` |
| regras gerais de código, ordem de carga, testes | tabela abaixo |

## Onde mora cada regra geral (uma fonte só)
| Regra | Fonte |
|---|---|
| Onde o jogo roda (file://, servidor de casa, artifact), `Reino.ambiente`, scripts clássicos, sem `fetch` local | `jogo/js/CLAUDE.md` |
| Manifesto, `index.html` gerado, arquivo novo, `node: true` | `jogo/js/CLAUDE.md` |
| Objetos internos `Reino._*` (regra); quem cria e quem usa (mapa) | `jogo/js/CLAUDE.md`; `docs/ARQUITETURA.md` §7 |
| `Reino.EVENTOS`, modo determinístico, `Reino.sorteioDaChave`, `?debug=1` | `jogo/js/CLAUDE.md` |
| Pixel art, ícones de emoji (`Reino.registrarIcones`), animações e movimento reduzido | `jogo/js/CLAUDE.md` (Arte) |
| Tamanho dos arquivos (400/420/800) | `jogo/js/CLAUDE.md` (Tamanho) |
| CSS plano, cascata, `sem-animacao` | `jogo/css/CLAUDE.md` |
| Testes: Chromium, tamanhos, servidor e navegador de teste, saves sintéticos, `npm run ver`, gerador, e2e | `jogo/ferramentas/CLAUDE.md` |
| Texto para criança: tom pt-BR carinhoso, tamanho das falas, frases | `docs/receitas/licoes-de-voz.md` |
| Save (`chaveSave`, formato, `P.mesclar`, sincronização): só muda com muito cuidado e testes | `save-e-mescla.md` |
| Progresso da Mariana intocável | `save-e-mescla.md` §9 e o `CLAUDE.md` da raiz |
| Comandos, gerados que não se abrem, fluxo de trabalho, temporários e `rm` | `CLAUDE.md` da raiz |
| Onde mora cada coisa, quero X → qual registro | `docs/ARQUITETURA.md` (§5.1) |
