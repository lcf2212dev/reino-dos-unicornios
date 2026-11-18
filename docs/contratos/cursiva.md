# Letra cursiva (escrever frases na loja da Kiara e nas lojas de peças, com o traçado no sentido certo)

Pedido: `pedidos/2026-11-17-escrita-cursiva.md`. No cartão da MonsterBall da loja da Treinadora Kiara
(`monstros.md`), "ou" e **Escrever 2 frases**: ela escreve, em letra cursiva, as frases sorteadas do banco e ganha 1
MonsterBall (40%) sem gastar estrela. O dedo só pinta seguindo o caminho certo de cada letra. Desde 18/11
(`pedidos/2026-11-18-bolas-pela-cursiva.md`), a Mini sai por **1 frase** e a Super por **3** (§5). Nas lojas de peças
da Vila, **5 frases** conquistam cada peça épica do Conjunto da Pluma (§6).

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-cursiva.js` (`Reino.config.cursiva`) |
| o caminho das palavras e o dedo que segue | `js/sistemas/cursiva.js` (`Reino.Cursiva`, `node: true`) |
| o desenho das letras, na ordem do traço | `js/conteudo/cursiva-letras.js` (dados) |
| o banco de frases | `js/conteudo/cursiva-frases.js` (dados) |
| a tela de escrever | `js/ui/cursiva.js` (`UI.telaCursiva`), `css/ui-cursiva.css` |
| o botão e o prêmio na loja | `js/ui/treinadores-loja.js`, `Reino.Treinadores.frases` e `ganharEscrevendo` (`sistemas/treinadores.js`) |
| as peças épicas das lojas de peças (§6) | `js/conteudo/itens/pluma.js` (dados), `Reino.VilaLojas.conquistas`/`conquistar` (`sistemas/vila-lojas.js`), `js/ui/vila-conquistas.js` |
| testes | `unidade/cursiva.test.js` (o caminho e os bloqueios), `unidade/cursiva.navegador.test.js` (com o dedo de verdade), `unidade/treinadores-cursiva.test.js` (§5), `unidade/vila-conquistas.test.js` e `vila-conquistas.navegador.test.js` (§6) |

## 2. As letras (`cursiva-letras.js`)
- Unidade = x-altura: base `y = 0`, meio `1`, haste `2`, perna `-1`; `y` para cima, letra em pé (a inclinação vem de
  `config.cursiva.inclinacao`). `p` = os pontos por onde a caneta passa, NA ORDEM do traço; `[x, y, 1]` é bico (a
  caneta volta ou vira seco). Entre bicos, a curva é Catmull-Rom centrípeta, amostrada a cada `Cursiva.PASSO` de arco.
- Minúscula começa em `[0, J]` (`Cursiva.J`, a emenda) e termina na emenda da próxima; `saiAlto` = termina lá em cima
  (o, b, v, w, com um biquinho para a esquerda antes de sair: lacinho fino não cabe no dedo) e a próxima começa do
  ponto `alto`. `liga: false` levanta a caneta (o O maiúsculo): a palavra vira dois
  traços. `marcas`: pingo do i e do j, corte do t; acentos, cedilha e pontuação vêm de `sistemas/cursiva.js`.
- O sentido é o da escola: a, o, c, d, g, q e e giram para a esquerda (anti-horário), começando pela subida da emenda;
  m, n, h, p e v fazem os montinhos para a direita. Maiúsculas com desenho: A C E L M N O U (as frases só começam por
  elas). Mudou uma letra: confira na prévia (`unidade/cursiva.test.js` traça todas as palavras do banco).

## 3. Seguir o dedo (`Reino.Cursiva`)
```
palavra(texto) → { texto, tracos: [{ x, y, s, n, comp }], marcas: [{ tipo: 'risco' | 'ponto', x, y }], larg, topo, fundo }
frase(texto) → { texto, palavras: [palavra + x0], larg, topo, fundo }
tocar(traço, k, x, y, op?) → dedo     arrastar(dedo, x, y) → dedo { k, pegou, contra, solto }   // o dedo inteiro
opTela(px) → op        // a op da tela para a letra a px px de tela por x-altura (a tela e os testes usam)
seguir(traço, k, x0, y0, x1, y1, op?) → k'     perto(traço, k, x, y, op?) → bool       // as peças
registrarLetras({…})  registrarFrases([…])  frases()  sortearFrases(n?)  faltam(texto)
op = { tol, pegar, contra, passada } em x-altura (padrão: config.cursiva)
```
1. A ponta `k` é uma conta num fio: só anda para a frente e só puxada pelo dedo. O dedo conta a cada `passada`
   andada (0,06 de x-altura, e nunca menos que `passadaPx` 6 px de tela): a direção é a desse pedaço, não a de cada
   evento (o toque do celular treme ~1 px por evento, e um passo de 1 px aponta para qualquer lado). Em cada pedaço, a ponta vai para o ponto logo à frente (até `ALCANCE` 0,3 de
   arco, mais o que a passada passa de 0,06, porque a ponta fica até uma passada atrás do dedo; com um bico do desenho
   a até esse alcance à frente, até o alcance depois dele) que está a menos de `tol` do dedo, mais perto dele que a ponta, é (com folga de 0,08) o pedaço do caminho mais
   perto do dedo na vizinhança (1,4 de arco para trás e para a frente) e tem o caminho andando para onde o dedo anda
   (até 60° da direção do caminho naquele ponto). Assim: para
   baixo no começo do "a", voltas para a direita na bolinha de a, o, d, g, q, o "e" e as laçadas altas (l, b, h, f)
   ao contrário (também com o tremor do toque), voltar, andar de lado e rabiscar (alto ou baixinho, em qualquer
   velocidade) não pintam
   (`unidade/cursiva.test.js` confere cada um, com a tolerância do config e com a mais folgada). O alcance maior perto
   dos bicos (os `[x, y, 1]` das letras: o alto do i e do t, o fundo do m, a haste do a) deixa virar um pouco antes da
   ponta sem travar; na curva lisa ele fica curto, e não dá para cortar o alto de uma laçada.
2. Começar só TOCANDO na bolinha verde (`pegar`). Andar `contra` sem pintar: a setinha fica vermelha e a dica diz
   "Por aí não! Siga a setinha." (som `toque`; nada se perde). Se afastar mais de 2,2 × `tol` da ponta: soltou ("Ops! Comece
   de novo na bolinha verde."), e só volta a pintar tocando de novo na bolinha (arrastar por cima dela não pega:
   rabisco não escreve). O traço fica pronto a 0,2 do fim (a saidinha da última letra).
3. Na tela (`opTela`): a tolerância é `tolerancia` (0,3), mas nunca menos que `toleranciaPx` da tela (letra pequena
   no celular) nem mais que `toleranciaMax` (0,38); o toque inicial, `pegar` e `pegarPx`; a passada, acima. Com a letra grande (tablet, notebook), até o n escrito como u fica sem
   terminar; no celular, a diferença de forma pequena cabe no dedo, o sentido não.
   Limite conhecido: as palavras curtinhas de e ("é", "eu") saem com um rabisco teimoso (zigue-zague num ritmo certo
   ou uma molinha, que já gira o e para o lado certo), em 4 a 7 tentativas; nas outras palavras do banco, nenhum
   rabisco escreve (medido com a op real da tela, celular e tablet).
4. Levantar o dedo no meio da palavra pode: continua da bolinha (não premia pressa nem pune a criança de 7 anos).
5. Pingos, acentos, cedilha, corte do t e pontuação aparecem sozinhos quando a palavra acaba (decisão: o que se
   cobra é o sentido das letras).

## 4. A tela (`UI.telaCursiva({ frases, estado?, titulo?, premio? }) → Promise(bool)`)
- Em cima "Frase 1 de 2", a frase em letra de forma e a frase toda pequena em cursiva (as palavras feitas em tinta).
  No meio o papel (pauta do caderno: haste e perna tracejadas, a faixa do meio azul-clara), com a palavra da vez
  grande e tracejada, a bolinha verde (a ponta) e duas setinhas laranja à frente. Com um bico a até 0,7 à frente,
  uma só: longe dele, bem antes e apontando para ele (vá até a ponta); perto, depois dele, para onde virar, a 0,35 da
  bolinha no papel. Canvas em px de arte (2 px CSS),
  riscos por carimbo. "Ver como faz": a caneta laranja faz o que falta do traço (sem animação: o caminho em laranja
  com setinhas). Fim: "Você escreveu as N frases!", festa 2 e o botão `premio` ("Pegar a MonsterBall").
- `estado` guarda frase, palavra, a ponta de cada traço e `pronto`: quem chama devolve o mesmo objeto e ela continua
  dali. Resolve `true` com tudo pronto (pelo botão ou fechando depois de pronto), `false` fechando antes.
- Pelo teclado: Tab chega em "Ver como faz", no ✕ e no botão do fim; escrever é com o dedo ou o mouse (a dica diz).
- Só texto na tela (sem voz nova). Nada no save.

## 5. Na loja da Kiara
- Em cada cartão de bola: "ou" e "✏ Escrever N frases" (`Treinadores.frases(id)`: Mini `frasesMini` 1 ("Escrever 1
  frase"), MonsterBall `frasesPorBola` 2, Super `frasesSuper` 3; número 0 ou torto tira o botão daquela bola). Sorteia
  as frases (`sortearFrases(N)`: diferentes, sem repetir as da última vez enquanto der; chave `'cursiva:frases'` no
  modo congelado) e abre a tela, com `premio: 'Pegar a <bola>'`. Pronto: `Treinadores.ganharEscrevendo(id)` põe 1 bola
  daquele cartão na mochila (cheia: no baú), grava, e a loja diz "Você ganhou 1 Super MonsterBall! ✨". Sem estrela,
  sem limite por dia. `ganharEscrevendo()` sem id dá a de `config.cursiva.bola` (a MonsterBall).
- Fechou no meio: as mesmas frases e o ponto onde parou ficam na memória da loja, **por bola** (até recarregar o
  jogo), e o botão dela vira "✏ Continuar a escrever".
- O botão de escrever não se desliga com a tela de escrever aberta (quem impede abrir duas é a trava da loja): pelo
  teclado, o Esc devolve o foco a ele. Vale também para a faixa do §6.

## 6. Nas lojas de peças da Vila: o Conjunto da Pluma
Pedido: `pedidos/2026-11-18-pecas-epicas-cursiva.md`. Seis peças épicas, uma por lugar do corpo (`itens.md` §2), que
só existem pela letra cursiva: não têm preço, não caem de monstro (`arenas: []`) e não se vendem.
- **Dados** (`conteudo/itens/pluma.js`): `espada-pluma` e `escudo-pluma` (loja `armas`), `capacete-pluma` (`cabecas`),
  `armadura-pluma`, `calca-pluma` e `botas-pluma` (`armaduras`). No catálogo, `cursiva: true` (o `registrar` exige
  `loja` e recusa `preco`) e `artigo` (`'a' | 'o' | 'as'`, para as frases da tela). Atributos, moldes e ícones: lá.
- **Regras** (`Reino.VilaLojas`): `conquistas(loja) → [{ id, def, tem }]` (`tem` = ela tem uma viva: mochila, baú ou
  vestida); `frasesPorPeca()`; `conquistar(loja, id) → { ok, id, uid?, onde?, motivo?: 'sem-save' | 'itens' | 'ja-tem' }`
  dá a peça por `Itens.ganhar` (mochila; cheia, o baú), grava e emite `MAPA_MUDOU`. **Uma de cada**: com a peça viva,
  `'ja-tem'`; jogou fora, conquista de novo. `aVenda` e `compraveis` nunca as trazem. Nada novo no save.
- **Tela** (`ui/vila-conquistas.js`, interno `Reino._vilaEpicas.faixa`, chamado por `ui/vila-loja.js`): no alto da aba
  Comprar (escondida em Vender; a Casa Bonita não tem), a faixa "✏ Peças épicas" com a dica "Não se compram: conquiste
  escrevendo 5 frases em letra cursiva!" e um cartão por peça (desenho, nome, raridade, atributos), fora do carrinho.
  Botão "✏ Escrever N frases": sorteia (`sortearFrases(N)`), abre `UI.telaCursiva` com `premio: 'Pegar a Espada da
  Pluma'` e, pronto, `conquistar`: "Você conquistou a Espada da Pluma! ✨ Está na sua mochila." (cheia: "A mochila
  encheu: foi para o baú."; as Botas, no plural: "Estão…", "foram…"). Com a peça: o cartão encolhe (só o desenho, o
  nome e "Você já tem! ✨", sem botão), para a mercadoria comum caber na primeira tela do celular.
- Fechou no meio: as frases e o ponto onde parou ficam na memória, **por peça** (até recarregar o jogo), e o botão
  dela vira "✏ Continuar a escrever".
- Aparelho com a versão de antes guarda as peças sem mostrar (`itens.md` §10.5).

## 7. Números
`Reino.config.cursiva` (comentados lá): `frasesMini` 1, `frasesPorBola` 2, `frasesSuper` 3, `frasesPorPeca` 5, `bola`
`'bola-monster'`, `inclinacao`, `tolerancia`,
`toleranciaPx`, `toleranciaMax`, `pegar`, `pegarPx`, `contra`, `passadaPx`, `espaco`, `xAlturaMax`, `esperaPalavraMs`.
