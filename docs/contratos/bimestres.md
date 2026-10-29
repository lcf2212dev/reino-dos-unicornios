# Bimestres e catálogo histórico

A temporada ativa está em `Reino.Bimestres`, em `js/sistemas/bimestres.js`. O quarto bimestre começa em
05/10/2026. Enquanto o material não chegar, nenhuma atividade escolar nova é inventada.

Os originais integrais do terceiro bimestre ficam em `arquivo/terceiro-bimestre/jogo/js/`, fora da pasta
publicada `jogo/` e do manifesto do navegador. Os caminhos relativos correspondem aos originais.

As seis matérias e provas continuam registradas com `arquivada: true`, mas os arquivos ativos não contêm
perguntas, respostas ou cartas do livro. As salas conservam os IDs e metadados necessários aos interiores.
O catálogo preserva os unicórnios, acessórios, nomes, sprites e vozes dos personagens. Não é uma temporada
jogável: as entradas de missão, treino, prova, livros e listas apresentam apenas o aviso de espera.

`emEspera(materiaOuId)` consulta o catálogo; `acaoEmEspera(acao)` reconhece as ações escolares, incluindo
guias, livros e diretores da escola e do castelo. Os NPCs atingidos mostram status de conversa e falam apenas
o aviso. Os objetos de estudo nas seis áreas também aguardam; serviços e outros passeios continuam.
`avisar(quem?)` abre o aviso no balão; `painel(titulo?, opcoes?)` é o estado vazio das listas.

Não há migração de save. IDs, chaves, dinheiro derivado, pagamentos, conquistas, ovos e acessórios continuam
compatíveis. A área dos pais identifica o terceiro bimestre como arquivado. As perguntas surpresa ignoram
matérias arquivadas, inclusive perguntas pendentes de versões anteriores, sem reescrever o save por isso.

Ao adicionar material futuro, registre um catálogo separado, com novos IDs de matéria, salas e provas
(o formato do 4º bimestre, no prédio de cada matéria: `quarto-bimestre.md`; sala nova: `docs/receitas/sala-4bim.md`).
Não reative nem acrescente salas ao catálogo do terceiro bimestre: o dinheiro já ganho depende da quantidade
de salas dele. Os NPCs e seus interiores poderão apontar para o material novo, mantendo o catálogo antigo
registrado para as conquistas. A mudança de temporada não chama `novoCiclo`.

Os testes do motor pedagógico carregam o arquivo histórico explicitamente, em VM ou contexto isolado.
As gravações históricas são servidas apenas pela fixture de teste. A validação confere tanto o catálogo
ativo vazio como o conteúdo completo preservado; o jogo publicado não carrega essa fixture.
