# Decisões (índice)

Para que serve: o porquê das escolhas do projeto, um registro curto por decisão (Contexto / Decisão /
Consequências). Para o "como", veja `docs/receitas/`; para as regras, `docs/contratos/`.

| Decisão | Arquivo |
|---|---|
| Scripts clássicos, sem módulos e sem build | `scripts-classicos-sem-build.md` |
| Um manifesto só para a ordem de carga (index.html gerado) | `manifesto-unico.md` |
| Limites de tamanho, divisão em arquivos e objetos internos | `divisao-em-arquivos.md` |
| Vozes achadas pelo texto exato, em pacotes de nome fixo | `vozes-pelo-texto.md` |
| Regras de `P.mesclar` e por que não mudam sem teste | `mescla-do-save.md` |
| Segurança do progresso real (3 lugares, proibições, guardas) | `seguranca-do-progresso.md` |
| Ruído de antialiasing nas referências de imagem | `referencias-ruido.md` |
| Helpers de desenho: uma fonte só (`jogo/js/arte/desenho.js`) | `helpers-de-desenho.md` |

Histórico em `historico/` (caminhos de antes da refatoração; `npm run validar` não confere a pasta, lista
`HISTORICOS` em `jogo/ferramentas/validar/validar-docs.js`): o plano da refatoração (`refatoracao-plano.md`), os
contratos consolidados (`contratos-consolidados.md`) e os bugs achados nela (`bugs-da-refatoracao.md`).
Defeitos conhecidos que ficaram abertos: `docs/pendencias.md`.
