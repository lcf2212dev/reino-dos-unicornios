# Pedido 1 de 3: abertura animada

# 1. Nome
abertura-animada

# 2. Tipo
[x] Ajuste ou correção de algo que já existe (tela de início)
[x] Mecânica nova: cena ilustrada e animada em canvas próprio na tela de início (código novo, não só CSS)

# 3. O que eu quero
Uma abertura com ilustração e animação profissional, com o título "Reino dos Unicórnios" (sem "Mariana e").

# 4. Por que
Dar cara de jogo de verdade logo no primeiro segundo e vontade de entrar.

# 5. Como a Mariana usa, passo a passo
1. Abre o jogo: céu do entardecer em degradê, estrelas piscando, nuvens em camadas (parallax), o castelo do reino
   ao fundo sobre colinas, um arco-íris que se desenha, unicórnios voando/galopando com rastro de brilho.
2. O título "Reino dos Unicórnios" entra com um brilho que passa pelas letras; o botão "Entrar no Reino ✨" pulsa de leve.
3. Toca no botão: a cena faz um brilho/zoom rápido no castelo e o jogo segue (como hoje).
4. Com "reduzir movimento" ou Animações desligadas: a mesma ilustração parada.

# 6. Onde fica no reino
Tela de início (`telaInicio`, `logo()` em `jogo/js/motor/main.js`), também na espera "Abrindo o reino..." e nas boas-vindas.
Como ela acha a novidade: é a primeira coisa que aparece ao abrir o jogo.

# 10. Números que eu quero poder mudar depois
Duração da entrada do título, quantidade de estrelas e de unicórnios voando (em `config.js`, decidido pelo Claude).

# 11. O que NÃO pode mudar
A classe `.btn-comecar` no botão de entrar (teste de desempenho e testes de navegador clicam nele).
Modo congelado (`?congelar=1`) continua pulando a tela: nenhuma foto do e2e muda.
Nada de canvas novo por quadro; a cena para de desenhar (rAF cancelado) quando a tela fecha (vigias de memória).

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook (a ilustração preenche a tela nos três, em pé e deitado)

# 13. Pronto quando
- [ ] Abertura animada nos 3 tamanhos, com o título "Reino dos Unicórnios".
- [ ] Parada com reduzir movimento; sem vazamento (rAF parado depois de entrar).
- [ ] e2e idêntico.

# 14. Decisões
Decidido pelo Claude: tudo desenhado em código (pixel art com `Reino.Desenho`/`PA`), sem imagem externa; o
`<title>` já é "Reino dos Unicórnios"; a música continua começando só no toque (regra do navegador).

# Pedido 2 de 3: jogadores com login

# 1. Nome
jogadores

# 2. Tipo
[x] Mecânica nova: contas de jogador (login/senha em texto), um save por jogador, banco no servidor de casa e docs no claude.ai

# 3. O que eu quero
Poder ter jogadores diferentes, cada um com login, senha e progresso próprio. O save que já existe é da Mariana
e ganha o nome "Mariana".

# 4. Por que
Irmãos, primos e amigos podem jogar sem mexer no progresso da Mariana.

# 5. Como usa, passo a passo
1. No aparelho em que a Mariana já joga, nada muda para ela: a abertura mostra "Entrar no Reino ✨" e entra como
   Mariana (lembrada no aparelho). Um botão pequeno "Trocar jogador" abre a tela "Quem vai jogar?".
2. "Quem vai jogar?": cartões com os jogadores lembrados neste aparelho e os do banco (servidor de casa / claude.ai),
   e "➕ Criar jogador". Tocar num cartão pede a senha (se o aparelho não lembra dele) e entra.
3. "Criar jogador": login (letras minúsculas, números, - e _), senha e repetir a senha, só texto. Login repetido
   avisa. Depois vai para a criação do personagem (pedido 3) e para a escolha do unicórnio, como na primeira vez hoje.
4. Área dos pais: continua igual, vale para o jogador que está jogando.

# 6. Onde fica no reino
Tela de início (antes de carregar o save) e botão "Trocar jogador" na abertura e nos Ajustes.

# 10. Números
Tamanho mínimo/máximo do login e da senha (config.js).

# 11. O que NÃO pode mudar
- A Mariana continua em `chaveSave` 'mariana-reino-v1' (+ '-novidades'), no doc `progresso/mariana` e na linha
  'mariana' do banco. Nenhum dado dela é migrado, copiado ou regravado por ferramenta; só o jogo, quando ela joga,
  passa a gravar o campo novo `perfil` (nome "Mariana", menina) pelo `registrarCampo`.
- Outros jogadores: chave `reino-v1-<login>` (+ '-novidades'), doc `progresso/<login>`, linha `<login>` no banco.
  O login "mariana" é reservado para o save dela.
- NUNCA um jogador que não é a Mariana sincroniza com um servidor que não anuncia vários jogadores (o servidor
  antigo grava sempre 'mariana'): sem o header novo, o save dele fica só no aparelho.
- Fotos (IndexedDB) separadas por jogador; as de hoje são da Mariana.
- Modo congelado (e2e) entra direto como Mariana; nenhuma foto do e2e muda.

# 12. Aparelhos
Servidor de casa: contas e saves no banco depois que o Leandro reiniciar o container (o código novo do servidor só
carrega ao reiniciar; até lá, jogadores novos ficam só no aparelho). claude.ai: contas em `jogadores/<login>`,
saves em `progresso/<login>`. `file://`: só no aparelho.

# 13. Pronto quando
- [ ] Aparelho da Mariana entra nela sem pedir nada; o save dela ganha `perfil.nome = "Mariana"`.
- [ ] Criar jogador, sair, trocar, entrar de novo com senha: cada um com o seu progresso.
- [ ] Servidor novo: /api/jogadores e /api/progresso/<login>; /api/progresso continua sendo a Mariana.
- [ ] Servidor antigo + jogador novo: nada chega à linha 'mariana' (teste).
- [ ] npm test verde, e2e idêntico.

# 14. Decisões
Decidido pelo Claude: servidor.js muda de forma só aditiva (tabela nova `jogadores`, rotas novas, mesma tabela
`progresso`); o Leandro autorizou ao pedir o banco, mas reiniciar o container é com ele. Senha em texto, como
pedido (no claude.ai qualquer visitante do artifact consegue ler). Conta "mariana" nasce sem senha (entra direto).

# Pedido 3 de 3: criar personagem

# 1. Nome
criar-personagem

# 2. Tipo
[x] Mecânica nova: criação de personagem (nome, sexo, roupa, corte, cores), arte de menino
[x] Ajuste do Salão de Beleza
[x] Fala nova ou mudada (voz): falas com "campeã" etc. ganham versão masculina

# 3. O que eu quero
Criação de personagem mais profissional: nome, menina ou menino, roupa e corte de cabelo (e as cores de hoje).
O Salão passa a mostrar os cortes e roupas novos.

# 5. Como usa, passo a passo
1. Jogador novo (pedido 2), depois do login: tela "Crie seu personagem" com prévia grande animada girando nas vistas.
2. Campos: nome (texto), Menina / Menino, pele, cor do cabelo, corte, roupa, cor da roupa (laço só para quem quiser).
3. "Pronto!": grava e segue para a escolha do unicórnio.
4. Pelos Ajustes, "Meu personagem" abre a mesma tela para mudar (nome e sexo também).
5. Salão: todos os cortes e roupas (os do sexo dela primeiro), incluindo os novos.

# 8. Personagens e falas
Falas com {nome}: mostram o nome do jogador; a voz gravada com "Mariana" só toca para a Mariana (os outros veem o
texto sem voz). Falas no feminino dirigidas ao jogador ("campeã", "caprichosa", "Bem-vinda", "ótima estudante"...):
marcador de gênero no texto e as duas versões gravadas (mesma voz de cada personagem).

# 11. O que NÃO pode mudar
A Mariana continua com a aparência que escolheu (corte/modelo/cores de hoje); vistas e montaria como hoje; e2e idêntico
(o sprite padrão não muda).

# 13. Pronto quando
- [ ] Tela nova nos 3 tamanhos e pelo teclado.
- [ ] Menino com cortes curtos e roupas próprias, a pé, montado, nadando e no espelho da loja.
- [ ] Salão com os novos cortes/roupas.
- [ ] Falas no masculino para menino, com voz.

# 14. Decisões
Decidido pelo Claude: cortes novos (curto, espetado, topete, cacheado curto, moicano) e roupas novas (camiseta e
bermuda, camisa e calça, agasalho, cavaleiro); cortes/roupas liberados para qualquer sexo no Salão.
