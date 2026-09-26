# Regras do projeto

Jogo "Mariana e o Reino dos Unicórnios": revisão escolar da Mariana (7 anos). HTML/CSS/JS puro, sem build.
Este arquivo é o índice. Cada pasta principal tem um `CLAUDE.md` com as regras locais.

## Testes
- Os testes rodam só no Chrome (Chromium do Playwright), nos tamanhos de celular, tablet e notebook.
- Não rode testes no Firefox nem no Safari/WebKit, nem emulação de iPhone ou iPad com o motor WebKit.

## Agentes
- Até 8 subagentes e workers ao mesmo tempo. Quando um termina e há trabalho independente, outro entra no lugar.
- Se o teto mudar, os agentes que já estavam rodando continuam até terminar.
- Retomar um agente que já terminou conta como lançar um novo.

## Comandos
- Não apague temporários: deixe-os em `/tmp` (o sistema limpa ao reiniciar). Assim nenhum comando para esperando confirmação do Leandro.
- Se precisar apagar, só com o caminho escrito por extenso: `rm -rf /tmp/val1/jogo`. Alvo que só se conhece na hora de rodar faz o Claude Code parar e perguntar.
- Nunca use `rm` com alvo vindo de `$(...)`. Se for inevitável, leia o caminho para uma variável e use guarda:
  `d=$(cat arquivo.txt); rm -rf "${d:?}"`

## O progresso da Mariana é intocável
- Ele vive em 3 lugares: o servidor de casa (container `reino-unicornios`, porta 80,
  `reinodosunicornios.local`, banco em `jogo/servidor/dados/reino.db`); o artifact publicado no claude.ai
  (capacidade `db`, doc `progresso/mariana`); o localStorage `mariana-reino-v1` e `mariana-reino-v1-novidades`
  de cada aparelho.
- Nada disso se abre, testa, lê, copia, grava, publica ou apaga. Nada de `localStorage.clear()`, "Apagar tudo",
  "Novo ciclo" ou pagamento fora do ambiente de teste.
- Docker, container e o serviço `reino-nome`: só o Leandro.
- A árvore principal `/home/leandro/Mariana Revisões` é servida AO VIVO pelo container: não escreva nela.
  Trabalhe numa worktree.
- Detalhes: `docs/contratos/save-e-mescla.md` §9.

## Comandos do projeto (na raiz do repositório)
- `npm test` — tudo o que é rápido: unidade, validadores, tamanho, referências de dados.
- `npm run unidade` — só os testes de unidade (`node --test`).
- `npm run e2e` — referências do jogo atual x commit base, no Chromium, ~1 min; tem que dar idêntico (`--cenas <regex>`
  só uma parte, `--so-dados`, `--desempenho`; `--podar` limpa saídas velhas quando o /tmp enche).
- `npm run validar` — conteúdo, interiores, index x manifesto e docs.
- `npm run novo` — gerador: `predio`, `materia`, `sala`, `prova`, `personagem`, `sistema`, `desafio`, `arquivo`
  (`--lista`, `--seco`).
- `npm run ver` — abre uma cena (save sintético, `--ir`, `--tela`, `--passos`) e fotografa nos 3 tamanhos em segundos
  (`--previa mapa`, `--livres 5x4`, `--ajuda`).
- `npm run servidor-teste` — servidor de TESTE (porta livre ≥ 1024 (nunca 80), banco novo em `/tmp/reino-testes/`).
- `npm run index` — refaz o `jogo/index.html` a partir do manifesto.
- `npm run vozes` — lista as falas, grava as novas e empacota (`jogo/js/voz/`).
- `npm run artifact` — monta a página do artifact em `/tmp/reino-testes/artifact/` (nunca publica).
- `npm run tamanho` — código até 420 linhas, dados até 800.
- `npm run tipos` — TypeScript confere os arquivos anotados com JSDoc (lista em `jogo/ferramentas/testes/tipos.json`;
  as formas em `jogo/ferramentas/testes/tipos-jogo.d.ts`; as das APIs de extensão em `tipos-extensoes.d.ts`).

## Mapa de pastas
```
jogo/index.html            GERADO do manifesto (npm run index)
jogo/css/                  plano, sem subpasta; ordem da cascata = manifesto
jogo/js/manifesto.js       a ÚNICA lista de scripts e CSS, na ordem de carga
jogo/js/nucleo/            config (dados), util, eventos, registros, congelar
jogo/js/motor/  mundo/     laço, câmera, entrada, cena, motor dos interiores; mapa, prédios, lago
jogo/js/personagens/ arte/ jogador, unicórnios, NPCs, elenco; pixel art, ícones, desenho
jogo/js/sistemas/          progresso (save), cuidados, som, música, voz, falas, fotos, banho, surpresa
jogo/js/atividades/ ui/    desafios, missão, treino, provas; telas por cima do mapa
jogo/js/interiores/<p>/    cada prédio por dentro;  jogo/js/conteudo/: matérias, provas, loja
jogo/ferramentas/          vozes/, validar/, testes/, previas/, gerado/ (GERADO)
jogo/servidor/             servidor de casa: intocável
docs/                      ARQUITETURA.md, contratos/, receitas/, decisoes/
```

## Antes de mexer, leia o contrato
| Assunto | Contrato em `docs/contratos/` |
|---|---|
| regras gerais, ordem de carga, testes | `README.md` |
| cena, motor, câmera, mapa, jogador, nado | `cena-e-motor.md` |
| interiores (prédios por dentro) | `interiores.md` |
| NPCs, elenco, balões, falas | `npcs-e-dialogo.md` |
| save, progresso, sincronização | `save-e-mescla.md` |
| fome, sede, banho, Pet Shop | `cuidados.md` |
| loja, enfeites, comidas, prêmios | `loja.md` |
| pergunta surpresa | `surpresa.md` |
| som, música, vozes | `som-musica-e-voz.md` |
| fotos e álbum | `fotos.md` |
| matérias, salas, desafios, provas | `conteudo.md` |

## Gerados: não abra, não edite à mão
- `jogo/js/voz/*.js` (pacotes de áudio, enormes; nomes fixos).
- `jogo/ferramentas/gerado/**` (`falas.json`, `vozes-indice.json`, `vozes-cache/`).
- `jogo/index.html`: gerado do `jogo/js/manifesto.js`. Mude o manifesto e rode `npm run index`.

## Fluxo de trabalho
1. Worktree nova a partir da ponta:
   `git worktree add /home/leandro/reino-<tema> -b feat/<tema> main` (ou a branch de integração em curso).
2. Para o Playwright, `node_modules` pode ser um link para um já instalado. Nunca `git add` desse link.
3. `npm run ver` para ver o jogo (ex.: `npm run ver -- --ir petshop`; em script, `abrirCenario`).
4. Feature nova: comece por `npm run novo -- <tipo> <id>` (preencha os `(preencher)`); leia antes o contrato do assunto.
5. `npm test` e `npm run e2e` (compara com as referências). Diferença fora do que a receita espera reprova.
6. Commit na branch, em português, no estilo do histórico: `Reino dos Unicórnios: <o que mudou>`.
7. Sem merge nem push sem o Leandro.

## Onde está o resto
- Arquitetura: `docs/ARQUITETURA.md` (§5.1: quero X → qual registro uso).
- Receitas passo a passo: `docs/receitas/README.md` (matéria, prova, prédio, personagem, enfeite, comida,
  música, fala e vozes, lições de voz).
- Decisões: `docs/decisoes/README.md`; plano da refatoração: `docs/decisoes/refatoracao-plano.md`.
- Guia do Leandro (o que o jogo faz, números que dá para mudar): `COMO-USAR.md`.
- Pedido de novidade do Leandro: modelo em `PEDIDO-DE-FEATURE.md`, seguido pela skill nova-feature.
- Skills do projeto: `.claude/skills/` (nova-feature, nova-materia, nova-prova, novo-predio, gravar-vozes,
  validar-tudo, servidor-de-teste).
