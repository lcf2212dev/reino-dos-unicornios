# Jogar com amigos (servidores como no PKXD)

Pedido: `pedidos/2026-11-06-jogar-juntos.md`. Cada jogador continua com o seu login, a sua senha e o seu save
(`save-e-mescla.md` §12). O que esta parte acrescenta é o que é **efêmero**: alguém **cria um servidor** (um código de
4 letras e um link de convite), manda para os amigos, e quem entra joga junto — vê os outros no mapa e nos interiores,
andando, montados no unicórnio, com o nome em cima, e pode acenar e mandar recados prontos. **Quem não cria nem entra
em servidor nenhum fica sozinho, exatamente como era antes** (e sem nenhum pedido de rede).

## 1. Onde está no código
| Parte | Arquivo |
|---|---|
| números da presença | `jogo/js/nucleo/config.js` (`Reino.config.juntos`) |
| estado, rede e módulo | `jogo/js/sistemas/juntos.js` (`Reino.Juntos`, módulo `'juntos'`) |
| desenho dos outros jogadores | `jogo/js/sistemas/juntos-desenho.js` (`Reino.JuntosDesenho`) |
| tela "Jogar com amigos" e botão 👥 | `jogo/js/ui/juntos.js` (`UI.abrirJuntos`), `jogo/css/ui-juntos.css` |
| rotas | `vercel/api/juntos.js` (criar, conferir o convite, fechar) e `vercel/api/presenca.js` (quem está e onde) |
| regras do que entra e do que sai | `vercel/lib/juntos.js` (código e pedido) e `vercel/lib/presenca.js` (presença) |
| tabelas | `vercel/lib/banco.js` (`juntos` e `presenca`) |
| evento do barramento | `jogo/js/nucleo/eventos.js` (`Reino.EVENTOS.JUNTOS`) |
| testes | `jogo/ferramentas/testes/unidade/juntos.test.js`, `juntos-servidor.test.js`, `juntos.navegador.test.js` |

## 2. O que viaja (e o que NUNCA viaja)
Dentro de um servidor, o jogo manda a cada `intervaloMs` (padrão 2,5 s):

```
{ login, servidor, sala, x, y, olharX, olharY, nome, sexo,
  aparencia: { pele, cabelo, roupa, laco },
  visual: { corte, modelo, semLaco },
  uni: { id, estagio, cores: { corpo, crina, chifre } } | null,
  aceno?: true, recado?: 'oi'|'vem'|'legal'|'tchau', saiu?: true }
```

1. Nada do save vai para o servidor de presença: nem salas, nem estrelas, nem unicórnios ganhos, nem `pago`. O
   `uni` é só o desenho do unicórnio montado (id, estágio e as 3 cores que já aparecem na tela).
2. O servidor **reconstrói** o registro campo a campo (`vercel/lib/presenca.js`): login no formato do jogo
   (`^[a-z0-9_-]{2,20}$`), servidor e sala em `[A-HJ-NP-Z2-9]{4}` e `[a-z0-9_-]{1,32}`, números finitos e limitados, nome de
   até 20 letras sem controle, cores só em `#rrggbb`, `visual` só com texto curto e booleano, `aceno`/`recado` só pelos
   valores da lista (4 recados). O que não passa é recusado (400) sem gravar nada.
3. A presença é **pública dentro do servidor**, como um nome num crachá: quem tem o código vê quem está nele, sem
   senha. Não há nada de valor ali e a conta continua sendo conferida no login (`/api/jogadores/entrar`). Isso é
   decisão consciente (o projeto já guarda senha em texto, `save-e-mescla.md` §12.4).
4. **Não há token de sessão** (como no resto da API, que fala por login): "só o dono fecha" vale para o login
   declarado no corpo. Quem souber o código e o login do dono consegue fechar o servidor, e quem souber um login consegue
   mandar presença por ele. Para o reino de família (com senha em texto, por pedido do Leandro) isso é aceito; um token
   por jogador seria o próximo passo se um dia o reino ficar aberto.

## 3. Servidores: `/api/juntos` e as tabelas `juntos` e `presenca`
1. `POST /api/juntos { acao: 'criar', login, nome }` → cria um servidor e devolve
   `{ servidor: { codigo, dono, nome, criado } }` (201). O código tem 4 caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
   (sem I, O, 0 e 1, que confundem ao ditar) e é gerado **no servidor**, com até 6 tentativas para não colidir.
2. `GET /api/juntos?codigo=XXXX` → 200 com o servidor se ele está aberto, 404 se não está. É o que o convite confere
   antes de entrar (e renova o `visto` do servidor).
3. `POST /api/juntos { acao: 'fechar', login, codigo }` → só o **dono** fecha (200); outro login recebe 403. Fechar
   apaga o servidor e a presença de todos os membros.
4. `POST /api/presenca` grava (upsert por `login`), apaga o que venceu e devolve a lista **do mesmo servidor**. Sem
   `servidor` (quem não entrou em nenhum) a resposta é vazia e o banco nem é tocado. Servidor que fechou ou venceu = 404
   `{ erro: 'servidor' }`, e o jogo sai dele e avisa.
5. Tabelas separadas do progresso:
   `juntos (codigo TEXT PRIMARY KEY, dono TEXT NOT NULL, nome TEXT NOT NULL, criado BIGINT NOT NULL, visto BIGINT NOT NULL)`
   e `presenca (login TEXT PRIMARY KEY, servidor TEXT NOT NULL DEFAULT '', dados TEXT NOT NULL, visto BIGINT NOT NULL)`.
   `dados` é o JSON montado pelo servidor. Nada de `progresso`, `historico` ou `jogadores` é lido ou escrito aqui.
6. O servidor vive enquanto alguém está dentro: cada presença (e cada conferência de convite) renova o `visto`; sem
   ninguém por `TTL_MS` (2 min, `vercel/lib/juntos.js`), ele vence e o código deixa de valer. Não há nome de servidor
   escolhido: ele aparece como "Servidor de <nome de quem criou>".
7. Servidor sem as rotas (servidor de teste, `file:`, artifact) responde 404 e o jogo fica sozinho (§6.3).

## 4. Sala
A sala é o **id da cena ativa** (`Reino.Cena.atual().id`): `'mapa'` no mapa e o id do interior dentro de um prédio. O
jogo só desenha quem está na mesma sala; a tela "Jogar com amigos" mostra o nome do lugar de cada um
(`Reino.Juntos.nomeDaSala`), que é o `nome` do interior ou "Reino" no mapa.

## 5. Estado no jogo (`Reino.Juntos`)
```
iniciar()                 // o gancho iniciar() do módulo: lê o convite (?servidor=) e o servidor guardado
parar()                   // desliga e esquece o servidor (usado pelos testes)
pode() → bool             // o ambiente aceita jogar com amigos (http/https, fora do congelado e do artifact)
ligado() → bool           // está dentro de um servidor e contando a presença
servidor() → { codigo, dono, nome } | null
dono() → bool             // quem está neste aparelho criou o servidor
criar() → Promise<bool>   // cria e entra (o código vem do reino)
entrar(codigo) → Promise<bool>   // entra pelo código (o convite faz isto sozinho)
sair()                    // sai do servidor (o progresso fica; a presença sai na hora)
fechar() → Promise<bool>  // só o dono: fecha para todos
aviso() / limparAviso()   // a última mensagem para a tela (código errado, servidor fechado, rede)
outros() → [{ login, nome, sala, x, y, … }]   // na MINHA sala e no MEU servidor, menos eu
todos() → [{ … }]         // todos do MEU servidor, para a tela
total() → number          // quantas outras pessoas estão no servidor
salaAtual(), nomeDaSala(id)
acenar(), recado(chave)
depurar()                 // para os testes
```
1. A posição que chega é o **alvo**; o desenho persegue o alvo a cada quadro (`suavidade` em `config.juntos`), então o
   outro jogador anda deslizando em vez de pular a cada 2,5 s.
2. `aceno` e `recado` são de UM envio só: ficam em `pendente` e saem no próximo POST (que é imediato quando há algo
   pendente). Quem recebe vê o balão por `acenoMs`/`recadoMs`, contados pelo relógio do servidor (`acenoEm`/`recadoEm`).
3. `Reino.EVENTOS.JUNTOS` (carga `{ total, sala, jogadores, servidor, aviso }`) só é emitido quando muda o **conjunto**
   (login, nome, sala, servidor) ou o aviso: a tela e o botão do HUD não repintam a cada posição.
4. O servidor fica guardado no aparelho em `reino-juntos-servidor` (só o código; é o que faz um recarregar voltar para o
   mesmo servidor). O link do convite (`?servidor=XXXX`) entra na frente dele. Sair grava vazio; não apaga nada do save.
5. O estado é do jogador de agora (`Reino.Progresso.jogador()`); ele não muda com o jogo aberto (`save-e-mescla.md` §12.2).

## 6. Quando liga e quando desliga
1. Liga no gancho `iniciar` do módulo (depois do login e do save, antes das boas-vindas) se: `config.juntos.ligado`,
   não é o modo congelado (`Reino.congelado`), não é o artifact, o protocolo é `http:`/`https:` (`Reino.ambiente`) e há
   jogador. **Sem convite nem servidor guardado, fica sozinho e não faz nenhum pedido.**
2. Desliga (e não desenha mais nada) quando o servidor responde 404 `erro: 'servidor'` (o dono fechou ou venceu), quando
   o jogador sai do servidor, ou quando `parar()` é chamado. Volta sozinho no evento `online`.
3. **No modo congelado dos testes (`?debug=1&congelar=1`), em `file:` e no artifact não faz NADA**: nem um pedido de
   rede, nem um pixel da presença. Num servidor sem as rotas (o servidor de teste), o primeiro convite/entrada leva 404
   e o jogo fica sozinho; sem convite nem servidor guardado, não há pedido nenhum. O botão 👥 do HUD, que é o caminho
   para criar ou entrar num servidor, aparece sempre (é a única mudança visível para quem joga sozinha).
4. Aba escondida manda menos (de `intervaloParadoMs` em diante), só para não sumir; ao voltar, manda na hora.
5. Fechar a aba manda `saiu: true` (com `keepalive`): a linha some na hora, sem esperar o TTL.

## 7. Desenho
1. Cada outro jogador na mesma sala entra na ordenação por Y do quadro pela camada do módulo (`Reino.registrarModulo`,
   `camada`): quem está mais embaixo fica na frente, como tudo no jogo. A sombra é a de `Jogador.sombra`.
2. Montado, o desenho é `PA.montada` com o unicórnio que ele mandou (id, estágio e cores); bebê ou sem montaria,
   `PA.mariana` a pé. A vista sai de `PA.vistaDaDirecao` (8 direções, espelhada), o passo é o mesmo de 4 quadros
   contado pela distância andada.
3. O nome fica em cima da cabeça, na fonte pixel, 12 px (o `aux` de `config.texto`) em creme com borda de tinta; até
   16 letras, com reticências. O balão do recado fica acima do nome, com a pontinha, por `recadoMs`.
4. Com Animações desligadas (ou `prefers-reduced-motion`) o outro jogador aparece parado, sem balanço e sem pulinho;
   nome e balão continuam (são informação).
5. Jogador de uma versão mais nova com um corte/modelo/unicórnio que este aparelho não conhece cai no padrão (mesma
   regra dos ids desconhecidos do save, `save-e-mescla.md` §6.6), sem erro.

## 8. Tela e botão
1. O botão 👥 fica **sempre** na fileira do HUD (ao lado de ⛶ 📷 🖼): é por ele que se cria e se entra num servidor.
   Com gente no servidor, ele leva uma contagem.
2. Sem servidor, a tela tem "Criar servidor" e o campo do código de um amigo.
3. No servidor, a tela mostra o código, o link do convite (com "Copiar convite", que usa o compartilhar do celular quando
   existe), quem está (com o retrato e o lugar), os recados prontos de quem está na mesma sala, "Sair do servidor" e,
   só para o dono, "Fechar o servidor".
4. Quando o servidor fecha (ou o convite não vale), o aviso aparece **também no alto do jogo** (`UI.avisoItem`, a mesma
   faixa dos itens), sem abrir tela nem pausar nada.
4. Sem teclado novo, sem chat livre: os recados são 4 frases prontas.

## 9. O que não muda
1. Save, `chaveSave`, `P.mesclar`, cópia `-novidades` e sincronização: **nada**. Presença não é campo do save.
2. O progresso da Mariana, o banco do progresso, o servidor de casa e o artifact continuam intocáveis
   (`save-e-mescla.md` §9). As tabelas `juntos` e `presenca` são as únicas coisas novas no banco e não encostam nas outras.
3. Quem não cria nem entra em servidor nenhum: o jogo é o de sempre, sem nenhum pedido de rede (é o que a maior parte do
   e2e confere).
4. Só há um poll por aba, e ele pausa com a aba escondida: nada de bater no banco a cada quadro.

## 10. Testes
- `juntos.test.js` (vm, sem navegador): sozinho sem pedido, criar, o convite (`?servidor=`) entrando sozinho, código
  errado, servidor que fecha, `aceno`/`recado` de um envio só, sair do servidor, o congelado que não faz nada e o `saiu`
  do `pagehide`.
- `juntos-servidor.test.js`: `vercel/lib/presenca.js` e `vercel/lib/juntos.js` campo a campo (o que passa, o que é
  recusado, o código, a validade) e as duas rotas com um banco de mentira.
- `juntos.navegador.test.js` (Chromium, servidor de TESTE + um proxy só do teste com as rotas em memória,
  `jogo/ferramentas/testes/servidor-presenca.js`): a ana cria o servidor pela tela, a bia entra pelo link do convite, o
  caio fica sozinho; as duas se veem, a posição chega, o aceno aparece, a tela mostra o código e quem fecha o jogo some
  (o `saiu` do `pagehide` chega no proxy, sem esperar o TTL).
