# Regras do projeto

Jogo "Mariana e o Reino dos Unicórnios": revisão escolar da Mariana (7 anos). HTML/CSS/JS puro, sem build.
Este arquivo tem as regras invioláveis e o índice. As regras de código de cada pasta estão no `CLAUDE.md` dela.

## O progresso da Mariana é intocável
- Ele vive em 3 lugares: o servidor de casa (container `reino-unicornios`, porta 80,
  `reinodosunicornios.local`, banco em `jogo/servidor/dados/reino.db`); o artifact publicado no claude.ai
  (capacidade `db`, doc `progresso/mariana`); o localStorage `mariana-reino-v1` e `mariana-reino-v1-novidades`
  de cada aparelho.
- Nada disso se abre, testa, lê, copia, grava, publica ou apaga. Nada de `localStorage.clear()`, "Apagar tudo",
  "Novo ciclo" ou pagamento fora do ambiente de teste.
- Docker, container e o serviço `reino-nome`: nunca se mexe. Não precisa: o servidor de casa serve a árvore
  principal ao vivo, e o merge na main já o atualiza.
- A árvore principal `/home/leandro/reino-dos-unicornios` é servida AO VIVO pelo container: não escreva nela.
  Trabalhe numa worktree (`npm run worktree -- <tema> [--material <Pasta>]`).
- Detalhes: `docs/contratos/save-e-mescla.md` §9.

## Fluxo 100% autônomo
- Feature, ajuste ou correção vão até o fim sem pedir decisão, confirmação nem ajuda a ninguém: decida com o
  padrão mais sensato (a opção que você recomendaria), construa numa worktree, feche com `validar-tudo`, faça o commit,
  integre na main e dê push (skill `entregar`: `npm run integrar -- <branch> --commit --merge --push`).
  Depois do push, se o jogo mudou, republique o artifact do claude.ai (skill `publicar-artifact`).
  Commit, merge na main, push, troca da base do e2e e artifact estão autorizados por escrito, sempre.
- Nunca use AskUserQuestion, nunca pare para aprovar plano, amostra ou resultado. O que você decidiu vai no
  relatório final, curto.
- Merge só com `npm test` e `npm run e2e` verdes; diferença no e2e fora do que a feature explica é defeito: corrija.
  Mudança de propósito no e2e: troque a base (`--trocar-base`) na mesma integração.
- O que não tem volta não se faz, e o trabalho segue pelo outro caminho:
  - progresso da Mariana, Docker, servidor de casa: não se tocam (acima);
  - apagar o que não é temporário: não apague; deixe o arquivo e cite no relatório final;
  - material em `matérias/` que colide com outro conteúdo: vale o da árvore principal (é o mais novo); leve-o para a
    integração e integre de novo;
  - push recusado porque o GitHub andou: traga o `origin/main` e integre de novo por cima; nunca `git push --force`;
  - artifact com versão viva diferente da registrada: a main é a fonte da verdade do jogo; leia o que o claude.ai
    pedir e publique a versão da main (skill `publicar-artifact`), sem `force`.
- Travou em algo que não está aqui: escolha a saída segura que não perde nada (deixar, não apagar, não sobrescrever
  o que não é seu), siga com o resto e explique no relatório.
- O artifact publica só o jogo (o delta desde `jogo/ferramentas/artifact-publicado.txt`); o doc `progresso/mariana`
  nunca se toca. Mudança só em docs ou ferramentas: sem publicar.
- Voz nova: escolha pelo `npm run vozes-elenco` e aprove pela conferência por transcrição (skill `validar-vozes`).
- Frentes (workers) não fazem commit; quem orquestra integra. Commit no estilo `Reino dos Unicórnios: <o que mudou>`.
- O `node_modules` da worktree é um link: nunca `git add` dele.

## Testes
- Só no Chrome (Chromium do Playwright), nos tamanhos de celular, tablet e notebook. Nada de Firefox,
  Safari/WebKit nem emulação de iPhone ou iPad com o motor WebKit.
- Fecho de qualquer mudança: skill `validar-tudo` (`npm test` e `npm run e2e`).
- Teste travado, memória explodindo ou aviso "VIGIA": skill `investigar-vazamento` (os vigias e os limites deles:
  `jogo/ferramentas/CLAUDE.md`).

## Agentes
- Pedido com várias frentes: plano paralelo antes de lançar (`npm run plano`; skill `orquestrar-frentes`): contrato
  na onda 0 (reservas de personagem), cada frente lançada quando as dependências dela são aprovadas, e o conferente
  de cada uma lançado assim que ela termina.
- Até 8 subagentes e workers ao mesmo tempo. Quando um termina e há trabalho independente, outro entra no lugar.
- Se o teto mudar, os que já rodavam continuam até terminar. Retomar um agente que terminou conta como lançar um novo.
- A conferência de um trabalho é sempre delegada a um subagent conferente, que não fez o trabalho e só lê e roda comandos
  (como fazer: skill `orquestrar-frentes`, "Quando cada agente volta"). Integração, vozes, merge, push e artifact ficam
  com quem orquestra.

## Comandos de shell
- Não apague temporários: deixe-os em `/tmp` (o sistema limpa ao reiniciar).
- Se precisar apagar, só com o caminho escrito por extenso (`rm -rf /tmp/val1/jogo`). Nunca `rm` com alvo vindo de
  variável ou de `$(...)`, nem com guarda (o Claude Code para e pergunta). Alvo que só se conhece na hora: não apague,
  deixe em `/tmp`.

## Gerados: não abra, não edite à mão
`jogo/js/voz/*.js` (pacotes de áudio enormes), `jogo/ferramentas/gerado/**`, `.vozes/` e `jogo/index.html`
(mude `jogo/js/manifesto.js` e rode `npm run index`).

## Comandos (na raiz; `--ajuda` em cada um)
- `npm test` (unidade, validadores, tamanho, referências de dados) · `npm run e2e` (jogo x commit base, tem que dar
  idêntico) · `npm run unidade` · `npm run validar` · `npm run tamanho` · `npm run tipos`
- `npm run novo -- <tipo> <id>` (gerador; `--lista`) · `npm run ver` (fotografa uma cena nos 3 tamanhos) ·
  `npm run servidor-teste` (skill `servidor-de-teste`) · `npm run memoria` (memória de uma aba, passo a passo)
- `npm run index` · `npm run versao` · `npm run vozes` e `npm run vozes-elenco` (skills `gravar-vozes`, `validar-vozes`)
- `npm run worktree` · `npm run material -- <Pasta>` (prints de `matérias/<pasta>/` reduzidos) · `npm run plano`
  (frentes paralelas de um pedido) · `npm run integrar` (skill `entregar`) · `npm run artifact` (skill `publicar-artifact`)

## Mapa de pastas
```
jogo/js/manifesto.js       a ÚNICA lista de scripts e CSS, na ordem de carga (index.html é gerado dele)
jogo/js/nucleo/            config (dados e números ajustáveis), util, eventos, registros, congelar
jogo/js/motor/  mundo/     laço, câmera, entrada, cena, motor dos interiores; mapa, prédios, lago
jogo/js/personagens/ arte/ jogador, unicórnios, NPCs, elenco; pixel art, ícones, desenho
jogo/js/sistemas/          progresso (save), cuidados, som, música, voz, falas, fotos, banho, surpresa
jogo/js/atividades/ ui/    desafios, missão, treino, provas; telas por cima do mapa
jogo/js/interiores/<p>/    cada prédio por dentro;  jogo/js/conteudo/: matérias, provas, loja
jogo/css/                  plano, sem subpasta; ordem da cascata = manifesto
jogo/ferramentas/          testes, validadores, vozes, fluxo (worktree, integrar), gerado/ (GERADO)
jogo/servidor/             servidor de casa: intocável
matérias/<matéria>/        prints e fotos da escola (apostila; Revisão/ = folha de prova)
docs/                      ARQUITETURA.md (mapa; §5.1 quero X → qual registro), contratos/, receitas/, decisoes/
```

## Onde cada coisa mora
| O quê | Onde |
|---|---|
| regras de código de uma pasta | `CLAUDE.md` da pasta |
| invariantes e APIs de um assunto (leia antes de mexer) | `docs/contratos/` (índice em `README.md`) |
| como fazer X (matéria, prova, prédio, personagem, enfeite, comida, música, fala) | `docs/receitas/` |
| procedimento disparado por um pedido | skills em `.claude/skills/` (pedido: `preparar-pedido` ou `nova-feature`) |
| por que foi assim | `docs/decisoes/` |
| guia do Leandro (usar o jogo) | `COMO-USAR.md`; modelo de pedido em `PEDIDO-DE-FEATURE.md` |

Cada regra fica num lugar só; nos outros, um ponteiro. Nada de changelog nem catálogo de dados nos docs: o que o
código já diz não se copia.
