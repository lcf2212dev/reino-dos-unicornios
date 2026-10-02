# Atividades do Laboratório de Ciências

Extensão do terceiro andar do Observatório (`observatorio-3`). Acesso pelo hall do laboratório;
conteúdo independente das salas avaliativas de Ciências e do Laboratório de Química.

- Dados em `jogo/js/conteudo/laboratorio/atividades.js`: `Reino.LABORATORIO`.
- Telas `UI.telaLaboratorio(secao?)`, `UI.telaLaboratorioExperiencia(id)` e `UI.telaLaboratorioJogo(id)`.
  A seção opcional `jogos` abre os mini-jogos; o padrão abre as experiências.
  Cada atividade usa painel com retorno ao menu, teclado, toque e feedback textual além do desenho.
- `ui/laboratorio.js` cria `Reino._laboratorio`, compartilhado exclusivamente com
  `ui/laboratorio-cenas.js` e `ui/laboratorio-jogos.js`. CSS em `ui-laboratorio.css`.
- `interiores/observatorio/lab-atividades.js` registra a ação de entrada e as falas da narradora
  no pacote `interior-observatorio`. Carrega antes de `lab-andar3.js`.
- As simulações avançam pelos controles, sem depender de tempo, velocidade, arraste ou animação.
  Tentativas são livres. Jogos podem ser reiniciados e resultados explicam o fenômeno observado.
- Estado apenas em memória da atividade. Sem campo de save, estrelas, dinheiro ou mudança nas provas.
  Fechar o painel encerra a atividade; reabrir permite começar de novo.

Validação em contexto isolado do Chrome permanente, servidor de teste e saves sintéticos:
entrar pelo hall, testar todas as experiências e completar os três mini-jogos; conferir retorno,
reinício, teclado, telas pequenas e ausência de alteração no saldo.
