# 1. Nome
parquinho-brincar

# 2. Tipo
[x] Ajuste ou correção de algo que já existe (o balanço do Parquinho)
[x] Mecânica nova (a brincadeira da caixa de areia)

# 3. O que eu quero
Pedido do Leandro (texto original): "No parquinho, minha filha pediu ajustes: 1. No balanço, não sair sozinho. Ela
quer efeito que dê para puxar o balanço e soltar. E se puxar tudo, o personagem e o unicórnio são arremessados para a
caixa de areia. 2. Ao interagir com a tela de areia, ser tipo um mini-game, onde dá pra fazer castelinho de areia,
cobrir a personagem e o unicórnio até o pescoço, cavar, etc."

# 4. Por que
Pedido da própria Mariana: brincar de verdade no parquinho, no controle, em vez de só assistir.

# 5. Como a Mariana usa, passo a passo
## Balanço
1. Ela toca no balanço (ou Enter/Espaço ao lado dele): ela senta no assento azul e o unicórnio no rosa. O balanço
   fica parado: não balança sozinho e nada a tira de lá sozinho. Até o 1º puxão, uma mãozinha em pixel art mostra o
   gesto de arrastar (decidido pelo Claude).
2. Ela arrasta o dedo (ou o mouse) para cima: o balanço vai para trás junto com o dedo, e um medidor de força ao lado
   enche (verde, amarelo, arco-íris). Arrastar para baixo também puxa (para a frente). Pelo teclado: segurar Espaço,
   Enter ou ↑ puxa aos poucos (`teclaMs` até puxar tudo).
3. Soltou: o balanço vai e volta, cada vez menos, até parar (som a cada ida). Pode puxar de novo quantas vezes quiser.
4. Puxou tudo (medidor cheio, brilhando) e soltou: na ida para a frente os dois voam pelo ar dando cambalhota, caem
   na caixa de areia (logo abaixo do balanço) com um "puf" de areia e estrelinhas de tontura e saem da caixa. Ela
   fica em pé ao lado da caixa. A queda deixa a marca dos dois na areia da brincadeira da caixa (decidido pelo Claude).
5. Para descer: um toque sem arrastar, Esc ou as setas de andar.
Sem Animações: o balanço segue o dedo e para logo ao soltar (sem vaivém); puxou tudo = os dois aparecem na caixa,
sem o voo.
O balanço vai para trás e para a frente (na direção da câmera), porque a caixa de areia fica na frente dele
(decidido pelo Claude).

## Caixa de areia
1. Ela toca na caixa de areia: ela e o unicórnio sentam na areia e abre a tela da caixa de areia, de perto.
2. Na tela: a areia grande, ela e o unicórnio sentados nela, e as ferramentas em pixel art (decidido pelo Claude):
   - pazinha: cava buracos (e, em cima dela ou do unicórnio, tira a areia de cima);
   - balde: carimba uma torre de castelo; tocar de novo na torre a faz crescer um andar (até `andaresMax`);
   - mão: amontoa areia (montinhos e muralhas); passando em cima dela ou do unicórnio, cobre aos poucos até o
     pescoço (`cobrirPassadas`), com a cabeça sempre de fora;
   - enfeites: conchinha, estrela-do-mar, bandeirinha e florzinha (até `enfeitesMax`);
   - rastelo: alisa a areia.
3. Coberto até o pescoço, cada um dá risadinha (som) e balança a cabeça.
4. ✕ ou Esc fecha; ela fica em pé ao lado da caixa. O que ela construiu fica até fechar o jogo (memória, nada no
   save); no parquinho, a caixa mostra o castelinho se ela fez alguma torre.
Teclado: Tab passa pelas ferramentas e pela areia; na areia, as setas movem um cursor e Enter/Espaço usam a
ferramenta; Esc fecha. Sem Animações: tudo igual, sem os grãos voando.

# 6. Onde fica no reino
Parquinho (portal da praça): o balanço em (3, 4) e a caixa de areia em (3, 10), logo abaixo dele.
Como ela acha a novidade: o caminho de hoje (portal da praça → Parquinho → tocar no brinquedo).

# 8. Personagens e falas
Nenhum personagem novo e nenhuma fala nova com voz (decidido pelo Claude: só sons e o texto dos botões, como o resto
do parquinho).

# 9. Prêmios
Nenhum, como o resto do parquinho (só diversão). Nada no save.

# 10. Números que eu quero poder mudar depois
`Reino.config.parquinho.balanco` (quanto arrastar para puxar tudo, segurar a tecla, o que conta como "tudo", quanto o
balanço perde a cada ida, uma ida e volta, o voo) e `Reino.config.parquinho.areia` (passadas para cobrir até o
pescoço, andares da torre, enfeites).

# 11. O que NÃO pode mudar
Escorregador, gangorra, carrossel, pula-pula e tanque de bolinhas continuam iguais; a fase, o portal e a tela do que
falta também. Nada no save.

# 12. Aparelhos
[x] celular   [x] tablet   [x] notebook
Recurso do aparelho: nenhum.

# 13. Pronto quando
- [ ] no balanço, ela fica sentada até descer (toque sem arrastar, Esc ou setas); o balanço não balança sozinho
- [ ] arrastar puxa o balanço, com o medidor de força; soltar faz ele ir e voltar e parar aos poucos
- [ ] puxar tudo e soltar: ela e o unicórnio voam e caem na caixa de areia; depois ela fica em pé ao lado da caixa
- [ ] pelo teclado: segurar Espaço/Enter/↑ puxa, soltar solta, Esc desce
- [ ] a caixa de areia abre uma tela com pazinha, balde, mão, enfeites e rastelo, em pixel art
- [ ] dá para fazer castelo (torres que crescem), cavar e cobrir ela e o unicórnio até o pescoço (e descobrir)
- [ ] o que ela fez fica até fechar o jogo; a caixa no parquinho mostra o castelinho
- [ ] celular, tablet, notebook e teclado (Tab, Enter, Esc)

# 14. Decisões
Tamanho G (duas frentes: balanço e caixa de areia), decidido pelo Claude. Onda 0 (contrato): o balanço e a caixa de
areia saíram do `poses.js` para `poses-balanco.js` e `poses-areia.js`; a pose ganhou o gancho `fim`; os números novos
em `config.parquinho.balanco` e `config.parquinho.areia`.

# 15. Até onde ir
Padrão: construir, testar, pôr na main e mandar para o GitHub (a Vercel publica sozinha).
