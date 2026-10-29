# Terceiro bimestre — arquivo de código

Cópia integral dos arquivos de conteúdo das seis matérias, seis provas e falas educativas substituídas na
preparação do quarto bimestre. Os arquivos sob `jogo/js/` mantêm o caminho original e foram conferidos byte
a byte contra o commit anterior à mudança.

Este diretório fica fora de `jogo/`, não entra no manifesto do navegador nem na publicação. O manifesto de
conteúdo registra a ordem histórica para testes. Os pacotes de voz substituídos também estão preservados
em `jogo/js/voz/`, sem entrar na distribuição ativa. O registro compartilhado (`materias/registro.js`) continua
no jogo e não é conteúdo de um bimestre.

O layout da Casa das Palavras do 3º bimestre (`jogo/js/interiores/portugues/portugues.js`: Cozinha, Horta, Circo,
Porto e Parque) também está aqui, intacto: no jogo, o térreo da casa passou a ser da Língua Portuguesa do 4º
bimestre (`docs/contratos/quarto-bimestre.md` §7). A fixture histórica dos testes carrega este no lugar do novo.

O mesmo vale para a Torre do Relógio (`jogo/js/interiores/torre/torre.js` e `falas.js`: um andar por sala i1–i5):
no jogo, a torre inteira passou a ser do English do 4º bimestre; a fixture carrega os dois daqui.

No jogo ativo resta um catálogo sem perguntas, respostas ou cartas de estudo. Ele conserva IDs, nomes,
recompensas, sprites e metadados para manter progresso, dinheiro derivado, conquistas e identidade dos
prédios. Consulte `docs/contratos/bimestres.md` para os pontos de acesso bloqueados e os cuidados ao adicionar
material futuro.
