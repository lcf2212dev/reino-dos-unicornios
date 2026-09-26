# Contratos consolidados por subsistema

**Data:** 2026-09-26 · **Contexto:** refatoração para IA, Fase 4 (documentação)

## Por que consolidar
- Havia 4 contratos na raiz (`CONTRATOS-INTERIORES.md`, `-NOVIDADES`, `-PORTUGUES`, `-BANHO-FOTOS-MUSICA`),
  escritos por feature, em rodadas diferentes. Um estendia o outro ("continua valendo inteiro"), então a regra
  de um assunto ficava espalhada (ex.: o save em NOVIDADES §1 e em BANHO §1; os cuidados em três lugares).
- Citavam arquivos que a reorganização moveu ou removeu (`js/ui.js`, `js/interiores.js`, `js/npcs.js`,
  `rascunho/`, `montar-portugues.js`, lista `INTERIORES` da prévia, `EXTRAS` do mapa) e misturavam regras com
  narrativa de rodada (branches, donos por fase, portas fixas por agente).
- Uma IA precisa achar a regra de UM subsistema lendo UM arquivo curto, com os caminhos de hoje e os
  comandos para conferir.

## Divisão escolhida (`docs/contratos/`)
- `README.md`: índice e regras gerais (ambiente, convenções, manifesto, segurança do progresso, testes, comandos).
- Um arquivo por subsistema: `cena-e-motor.md`, `interiores.md`, `npcs-e-dialogo.md`, `save-e-mescla.md`,
  `cuidados.md`, `loja.md`, `surpresa.md`, `som-musica-e-voz.md`, `fotos.md`, `conteudo.md`.
- Cada um: 2–3 linhas do que cobre, índice, "onde está no código", regras numeradas, "antes de mexer, rode".
- Regras que tocam dois assuntos ficam num lugar só, com referência cruzada (ex.: a guarda de toque em
  `loja.md` §6; a Pet Shop por dentro em `interiores.md` §9.3 e a tela/ações dela em `cuidados.md` §6).
- Ficaram as decisões e os "por quês" curtos; saiu a narrativa de quem fez o quê em qual fase.
- Onde a reorganização mudou o jeito de fazer, vale a regra atual (ex.: arquivo novo = linha no
  `js/manifesto.js` + `gerar-index.js`; sala do Português editada direto em `conteudo/materias/portugues/pN.js`;
  servidor de teste por `ferramentas/testes/servidor-teste.js`).

## Como achar uma regra antiga
- `docs/contratos/rastreio.md`: uma linha por regra dos 4 contratos antigos (seção e linhas na versão
  `626513e`), com o destino (arquivo e §) e a situação (igual / atualizada / removida, com o motivo).
- Texto original: `git show 626513e:CONTRATOS-<nome>.md`.
- Removidas: só narrativa (cabeçalhos de branch, tabelas de donos por fase) e o que deixou de existir
  (interior de teste da primeira fase, placa da Loja no mapa depois que as placas do mapa saíram).

## Ajustes depois da consolidação (Fase 4, validador de docs)
- `conteudo.md` §2.5: o parágrafo sobre `rascunho/` e `montar-portugues.js` (removidos) ficou entre marcadores
  `<!-- validar-docs: ignorar -->` … `fim` (histórico).
- `interiores.md` §8.7 e §9.5.4: `PROFESSORES`/`CAVALEIROS` fixos não existem mais; o texto aponta para
  `paraProva`/`paraMateria` do elenco (`Reino.NPCs.doElenco`), como no código desde f8e280a.
- `loja.md` §7 e `interiores.md` §10: as prévias abrem por `file://` (o servidor de teste não entrega `ferramentas/`).
