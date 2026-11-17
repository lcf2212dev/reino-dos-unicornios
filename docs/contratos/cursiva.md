# Letra cursiva (escrever frases na loja da Kiara, com o traçado no sentido certo)

Pedido: `pedidos/2026-11-17-escrita-cursiva.md`. No cartão da MonsterBall da loja da Treinadora Kiara
(`monstros.md`), "ou" e **Escrever 2 frases**: ela escreve, em letra cursiva, as frases sorteadas do banco e ganha 1
MonsterBall (40%) sem gastar estrela. O dedo só pinta seguindo o caminho certo de cada letra.

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números | `js/nucleo/config-cursiva.js` (`Reino.config.cursiva`) |
| o caminho das palavras e o dedo que segue | `js/sistemas/cursiva.js` (`Reino.Cursiva`, `node: true`) |
| o desenho das letras, na ordem do traço | `js/conteudo/cursiva-letras.js` (dados) |
| o banco de frases | `js/conteudo/cursiva-frases.js` (dados) |
| a tela de escrever | `js/ui/cursiva.js` (`UI.telaCursiva`), `css/ui-cursiva.css` |
| o botão e o prêmio na loja | `js/ui/treinadores-loja.js`, `Reino.Treinadores.ganharEscrevendo` (`sistemas/treinadores.js`) |
| testes | `unidade/cursiva.test.js` (o caminho e os bloqueios), `unidade/cursiva.navegador.test.js` (com o dedo de verdade) |

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
tocar(traço, k, x, y, op?) → dedo     arrastar(dedo, x, y) → dedo { k, pegou, contra }   // o dedo inteiro (a tela usa)
seguir(traço, k, x0, y0, x1, y1, op?) → k'     perto(traço, k, x, y, op?) → bool       // as peças
registrarLetras({…})  registrarFrases([…])  frases()  sortearFrases(n?)  faltam(texto)
op = { tol, pegar, contra } em x-altura (padrão: config.cursiva)
```
1. A ponta `k` é uma conta num fio: só anda para a frente e só puxada pelo dedo. O dedo conta a cada `PASSADA`
   (0,06) andada: a direção é a desse pedaço, não a de cada evento (o toque do celular treme menos de 1 px, e um passo
   de 1 px aponta para qualquer lado). Em cada pedaço, a ponta vai para o ponto logo à frente (até `ALCANCE` 0,3 de
   arco; com um bico do desenho a até 0,3 à frente, até 0,3 depois dele) que está a menos de `tol` do dedo, mais perto dele que a ponta, é (com folga de 0,08) o pedaço do caminho mais
   perto do dedo na vizinhança (1,4 de arco para trás e para a frente) e tem o caminho andando para onde o dedo anda
   (até 60° da direção do caminho naquele ponto). Assim: para
   baixo no começo do "a", voltas para a direita na bolinha de a, o, d, g, q, o "e" e as laçadas altas (l, b, h, f)
   ao contrário (também com o tremor do toque), voltar, andar de lado e rabiscar (alto ou baixinho, em qualquer
   velocidade) não pintam
   (`unidade/cursiva.test.js` confere cada um, com a tolerância do config e com a mais folgada). O alcance maior perto
   dos bicos (os `[x, y, 1]` das letras: o alto do i e do t, o fundo do m, a haste do a) deixa virar um pouco antes da
   ponta sem travar; na curva lisa ele fica curto, e não dá para cortar o alto de uma laçada.
2. Começar só TOCANDO na bolinha verde (`pegar`). Andar `contra` sem pintar: a setinha fica vermelha e a dica diz
   "Por aí não! Siga a setinha." (som `toque`; nada se perde). Se afastar mais de 2,2 × `tol` da ponta: soltou ("Levante
   o dedo e comece na bolinha verde."), e só volta a pintar tocando de novo na bolinha (arrastar por cima dela não pega:
   rabisco não escreve). O traço fica pronto a 0,2 do fim (a saidinha da última letra).
3. A tolerância na tela: `tolerancia` (0,3), mas nunca menos que `toleranciaPx` da tela (letra pequena no celular)
   nem mais que `toleranciaMax` (0,38). Com a letra grande (tablet, notebook), até o n escrito como u fica sem
   terminar; no celular, a diferença de forma pequena cabe no dedo, o sentido não.
4. Levantar o dedo no meio da palavra pode: continua da bolinha (não premia pressa nem pune a criança de 7 anos).
5. Pingos, acentos, cedilha, corte do t e pontuação aparecem sozinhos quando a palavra acaba (decisão: o que se
   cobra é o sentido das letras).

## 4. A tela (`UI.telaCursiva({ frases, estado?, titulo?, premio? }) → Promise(bool)`)
- Em cima "Frase 1 de 2", a frase em letra de forma e a frase toda pequena em cursiva (as palavras feitas em tinta).
  No meio o papel (pauta do caderno: haste e perna tracejadas, a faixa do meio azul-clara), com a palavra da vez
  grande e tracejada, a bolinha verde (a ponta) e duas setinhas laranja à frente (com um bico logo à frente, a 1ª
  fica bem antes dele, apontando para ele: vá até a ponta). Canvas em px de arte (2 px CSS),
  riscos por carimbo. "Ver como faz": a caneta laranja faz o que falta do traço (sem animação: o caminho em laranja
  com setinhas). Fim: "Você escreveu as N frases!", festa 2 e o botão `premio` ("Pegar a MonsterBall").
- `estado` guarda frase, palavra, a ponta de cada traço e `pronto`: quem chama devolve o mesmo objeto e ela continua
  dali. Resolve `true` com tudo pronto (pelo botão ou fechando depois de pronto), `false` fechando antes.
- Pelo teclado: Tab chega em "Ver como faz", no ✕ e no botão do fim; escrever é com o dedo ou o mouse (a dica diz).
- Só texto na tela (sem voz nova). Nada no save.

## 5. Na loja da Kiara
- No cartão da MonsterBall: "ou" e "✏ Escrever N frases" (`frasesPorBola`). Sorteia as frases
  (`sortearFrases`: diferentes, sem repetir as da última vez enquanto der; chave `'cursiva:frases'` no modo
  congelado) e abre a tela. Pronto: `Treinadores.ganharEscrevendo()` põe 1 `config.cursiva.bola` na mochila (cheia:
  no baú), grava, e a loja diz "Você ganhou 1 MonsterBall! ✨". Sem estrela, sem limite por dia.
- Fechou no meio: as mesmas frases e o ponto onde parou ficam na memória da loja (até recarregar o jogo) e o botão
  vira "✏ Continuar a escrever".

## 6. Números
`Reino.config.cursiva` (comentados lá): `frasesPorBola` 2, `bola` `'bola-monster'`, `inclinacao`, `tolerancia`,
`toleranciaPx`, `toleranciaMax`, `pegar`, `pegarPx`, `contra`, `espaco`, `xAlturaMax`, `esperaPalavraMs`.
