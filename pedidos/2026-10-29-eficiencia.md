# Pedido: motor e fluxo mais rápidos (29/10/2026)

Pedido do Leandro: analisar toda a engine e deixá-la mais rápida e eficiente no processo de criar o jogo; executar
todas as ondas do plano. Onda 3: os pacotes de voz continuam versionados no git; juntar scripts e CSS no build da
Vercel, as regras novas (processo proporcional, limite de linhas, skill de entrada única) e a limpeza (worktrees,
branches, áudios órfãos, ferramentas do artifact, TODO-VISUAL e pedidos antigos) ficam com o orquestrador.

## Medidas de base (main ffd735a2, 32 CPUs)
- `npm test` 192 s; unidade 185 s (concorrência 4, `unidade.js:19`); com 12: 117 s. Soma dos testes: 772 s.
  Mais lentos: `colar.navegador.test.js` celular 68 s e notebook 30 s; Português cap. 10–12 "salas inteiras"
  17–28 s; álbum duplo 27 e 26 s; tipografia 19 s; trava 12 s ×2; servidor lento 10,5 s ×2.
- `npm run e2e` 58 s quente, 72 s frio; piso = fila mapa+interiores numa aba por tamanho (60–65 s).
- O fecho roda no worker, no conferente e no integrar, e de novo depois do `--trocar-base` (`integrar.js:238`).
- Leitura por agente: 33 a 79 mil tokens de docs; 23% dos commits do mês são troca de base do e2e.

## O que entra
1. Testes de unidade paralelos e divididos; um fecho sem repetição e com o verde guardado por árvore.
2. `integrar`: base aceita no mesmo commit da feature, fase de vozes, sem trailer `Claude-Session`, sem prefixo duplo.
3. e2e: base `@`, cache por conteúdo, `--mudancas`, piso dividido, vagas de Chromium entre worktrees.
4. Vozes: conferência paralela, venv único, órfãos listáveis.
5. Motor: vozes sob demanda no início, LRU de vozes e estáticos, NPCs sem trabalho repetido, só o que aparece.
6. Vercel/PWA: scripts e CSS em lotes no build, núcleo antes das vozes no service worker.
7. Docs e skills: sem artifact nem servidor de casa, sem contradições, leitura por seção, skill de entrada única,
   processo proporcional, limite de linhas 420 (aviso) / 600 (falha).
8. Limpeza aplicada pelo orquestrador.

## Pronto quando
- `npm test` ≤ 100 s e `npm run e2e` ≤ 40 s (quente) nesta máquina; e2e idêntico à base (nenhuma imagem muda).
- Nenhuma regra de segurança do progresso enfraquecida; nada toca no progresso, no banco, no servidor de casa.
