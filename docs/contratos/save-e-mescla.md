# Contrato: save e mescla

Cobre o estado salvo da Mariana (`Reino.Progresso`), os campos, a `chaveSave`, a cópia `-novidades`,
`P.mesclar`, a sincronização (abas, servidor de casa, claude.ai), os carimbos e as regras de segurança
do progresso real. Mudança aqui só com muito cuidado e testes.

## Índice
1. Onde está no código · 2. O que nunca muda · 3. Campos aditivos · 4. Mescla · 5. Cópia `-novidades` ·
6. Normalização · 7. Sincronização · 8. Novo ciclo, Apagar tudo, quem lê o estado · 9. Segurança do progresso real ·
10. Antes de mexer · 11. Campo novo (`registrarCampo`) · 12. Jogadores

## 1. Onde está no código
- `jogo/js/sistemas/progresso.js` — estado, `estadoNovo`, `completar`, `normalizarNovos`, `numeroOu`,
  carregar/salvar, `gravarLocal`, `vistoLocal`, `juntarDoAparelho`, `conteudo`/`trouxeAlgo`, cópia `-novidades`.
- `jogo/js/sistemas/progresso-mescla.js` — `P.mesclar`, `juntarCuidados`, `juntarSurpresa`, despensa.
- `jogo/js/sistemas/progresso-nuvem.js` — servidor de casa (`/api/progresso`) e claude.ai (`db`, doc
  `progresso/mariana`), `iniciarNuvem`, `limiteRedeMs`, `novaTentativaMs`.
- `jogo/js/sistemas/progresso-regras.js` — dinheiro, estrelas, unicórnios, salas, treinos, provas, pagamentos.
- `jogo/js/sistemas/progresso-campos.js` — `P.registrarCampo` e o catálogo de estratégias de mescla (§11).
- Interno compartilhado: `Reino._progresso` (`I.estado` é o objeto do save; ver o cabeçalho de progresso.js).
- Chave: `Reino.config.chaveSave` = `'mariana-reino-v1'` (`jogo/js/nucleo/config.js`).
- Testes: `jogo/ferramentas/testes/testar-save.js`, `testar-banho.js`.

## 2. O que nunca muda
1. `chaveSave`, `v`, `geracao`, `ciclo` e o formato dos campos existentes.
2. As regras de `P.mesclar()` para os campos existentes (só o endurecimento de `estrelas`, §4.5, o do lado
   incompleto, §4.4.4, e os carimbos das escolhas e do `pago`, §4.6 e §4.7, autorizados pelo Leandro).
3. Campo novo só aditivo, e declarado com `P.registrarCampo` (§11): o padrão, a limpeza, a mescla, o Novo ciclo
   e a cópia saem de uma declaração, e os testes de contrato valem para ele. Os campos de hoje ficam como estão.
4. Dinheiro e prêmios são DERIVADOS das conquistas, nunca guardados soltos. Status de NPC, medalhas,
   unicórnios nas baias, moedas no baú, prêmio no mural: derivados de `Reino.Progresso` (nada novo no save).
5. Matéria nova (ex.: Português) usa os campos de sempre, com ids novos: nenhum campo novo, nenhuma regra nova.
6. Fotos NUNCA no save nem no servidor (`fotos.md`).

## 3. Campos aditivos
```
cuidados: { <uniId>: { fome, sede, banho, em, acao, acaoFome, acaoSede, acaoBanho } }
   fome, sede, banho   0–100 (100 = satisfeito / limpinho)
   em                  Date.now() da última mudança
   acaoFome / acaoSede carimbo do último comer / beber: max(Date.now(), acao + 1), sempre crescente; 0 = nunca
   acao                o maior de acaoFome/acaoSede. O banho NÃO mexe nele
   acaoBanho           carimbo do último banho: max(Date.now(), acaoBanho + 1), sempre crescente; 0 = nunca
despensa: { <comidaId>: { compradas, usadas } }   // contadores que só crescem; quantidade = compradas − usadas
ajustes.surpresa: true                            // interruptor "❓ Perguntas surpresa" (padrão ligado)
ajustes.surpresaEm: <Date.now()>                  // carimbo da última troca de verdade do interruptor (só P.salvar marca)
escolhasEm: { <escolha>: <Date.now()> }           // última troca de cada escolha (§4.6; só P.salvar marca)
pagoEm: { <materiaId>: <Date.now()> }             // último "Já pago" dos pais (§4.7; P.registrarPagamento marca)
```
`escolhasEm` e `pagoEm` só aparecem na primeira troca (save sem troca sai igual ao de antes); ficam fora de
`estadoNovo()`, da cópia `-novidades` (§5.7) e de `P.NOMES_DO_SAVE` (não registre campo com esses nomes). Carimbo
estragado (não número ≥ 0, chave insegura) é limpo em `normalizarNovos` e conta como sem carimbo.
1. Unicórnio sem registro em `cuidados` = fome 100, sede 100 e banho 100 (nasce satisfeito).
2. `banho` ausente = 100 na leitura. Carregar o save, comer ou beber NÃO cria o campo `banho`; só o gasto
   (ou o banho) cria.
3. O gasto não mexe nos carimbos.
4. `registroParaMudar` (cuidados.js) cria o registro com `acao: 0` e dá ao registro que só tem `acao`
   `acaoFome = acaoSede = acao`.
5. Por que `acao` não muda de sentido: um aparelho da versão antiga trata um `acao` novo como comer e beber;
   com o banho em `acaoBanho`, ele nunca vê um banho como comida.

### 3.1 `visitados`
`visitados: { <id>: true }`: os ids dos interiores e lugares em que ela já entrou (selo "✨ Novo!" do menu Lugares).
Declarado em `sistemas/visitados.js` com `registrarCampo('visitados', { mesclar: 'uniao', novoCiclo: 'mantem' })`.
Só cresce; um aparelho antigo sem o campo não apaga nada (se sumir, o selo só volta). Fica fora da cópia `-novidades`.

## 4. Mescla (`P.mesclar`, mesma geração)
### 4.1 `cuidados` (`juntarCuidados`)
1. Para cada `uniId` de qualquer lado, se os DOIS lados têm carimbo para a fome e para a sede (o carimbo de
   um campo é `acaoFome`/`acaoSede` numérico ≥ 0 ou, na falta dele, `acao`; um `acao` mais novo que os dois
   carimbos de campo, de uma aba que só conhece o `acao`, vale para os dois campos; o 0 conta): CADA campo
   vem do lado com o seu carimbo maior (comida num aparelho e água no outro valem as duas).
2. Empate (inclusive 0 e 0) = o menor valor daquele campo (o gasto só desce entre uma ação e outra).
3. `acao` = o maior dos dois lados; `em` = o maior.
4. Algum lado sem carimbo nenhum (save antigo ou valor estragado): vale o registro do `em` maior (empate: o
   lado mais recente).
5. Quem tratar `acao: 0` como "sem acao" muda a mescla de dois aparelhos (proibido).
### 4.2 Banho (em `juntarCuidados`, depois da fome/sede, com os valores ORIGINAIS dos dois lados)
1. Só um lado tem `banho` numérico: vale esse lado (`banho` e `acaoBanho`), mesmo que a regra da fome/sede
   tenha escolhido o registro inteiro do outro (aparelho antigo nunca faz o banho sumir).
2. Os dois têm: carimbo = `acaoBanho` numérico ≥ 0, ou 0; vence o maior; empate = o menor `banho`;
   `acaoBanho` = o maior.
3. Nenhum lado tem: continua ausente.
### 4.3 `despensa`
Para cada comida, `compradas` = maior e `usadas` = maior (contador estragado conta 0).
### 4.4 Lado sem o campo e `ajustes`
1. Um lado sem o campo (aparelho antigo, que pode apagá-lo): vale o outro lado inteiro. Um aparelho antigo
   nunca faz a Mariana perder comida comprada nem acessório (`loja` já é união).
2. `ajustes` vem do lado mais recente (cada ajuste, pelo carimbo dele, §4.6), com uma exceção para `surpresa` (`juntarSurpresa`, a mesma regra na
   mescla e na cópia): vale o lado com o carimbo `surpresaEm` maior; sem carimbo nos dois, o lado que fica só
   recebe o `surpresa` do outro se não tiver o campo (aparelho antigo não religa as perguntas que os pais
   desligaram). `estadoNovo()` não tem carimbo (um aparelho novo não "ganha" de quem desligou);
   `completar()` põe `surpresa: true` se faltar.
3. Geração diferente: vence o estado inteiro da geração maior.
4. Lado incompleto ou estragado: `salas`, `treinos`, `provas`, `unis`, `loja` ou `pago` ausente ou que não é objeto
   conta como vazio nos dois lados (sem erro, sem engolir o do outro lado); `usando`, `aparencia` ou `ajustes` que não
   é objeto, ou `montaria` que não é texto, no lado mais recente: vale o do outro lado. Com saves válidos, o resultado
   é o de antes (`testes/unidade/save-mescla-incompleto.test.js`).
### 4.5 Endurecimento de `estrelas`
`estrelas.ganhas`/`gastas` estragados (texto sem número, null, NaN) contam como 0 na mescla (`numeroOu`;
`estrelas` que não é objeto conta como vazio; `gastas` ≥ 0) e em `P.estrelas`/`P.ganharEstrelas`/
`P.gastarEstrelas`. Número em texto ("12") vale o número. Com números válidos, o resultado é o de antes.

### 4.6 Escolhas (`juntarEscolhas`, carimbos em `escolhasEm`)
1. Escolhas: `montaria`, `usando` (inteiro), `aparencia` (inteira), cada `ajustes.<k>` fora `surpresa`/`surpresaEm`
   (`ajuste:<k>`) e o `nome` de cada unicórnio (`nome:<uniId>`).
2. Carimbar: `P.salvar` compara cada escolha (em JSON) com a que esta aba viu por último (`vigiarSurpresa`, no
   carregar, em cada mescla e em cada gravação) e carimba a que mudou com `max(Date.now(), carimbo + 1)`. Nenhuma
   tela carimba. Carregar, mesclar e "Apagar tudo" trocam o objeto e não carimbam (como a surpresa).
3. Mescla: por escolha, vale o valor do lado com o carimbo MAIOR; sem carimbo conta 0; empate (inclusive 0 e 0)
   = o lado mais recente (a regra de antes). Os carimbos: por chave, o maior. Nome ausente com carimbo maior
   (apagado de propósito) apaga o do outro lado; unicórnio só de um lado vem inteiro, com o nome.
4. Trocas quase simultâneas em dois aparelhos (a segunda feita antes de o aparelho receber a primeira) seguem o
   relógio de cada um: vale o carimbo maior, mesmo que o relógio dele esteja adiantado (o mesmo limite do
   `surpresaEm`). Troca feita depois de receber a outra sempre vence (`carimbo + 1`).
5. Versão antiga (sem carimbos): guarda `escolhasEm` sem mexer (completar e gravar mantêm; a mescla antiga leva os
   do lado mais recente). Enquanto uma antiga estiver aberta, a escolha feita na versão nova pode perder para o
   estado dela (a regra de antes, pelo `atualizado`): a nova insiste uma vez por troca e depois cede (§4.8).
   Fechada a antiga, a próxima troca feita num aparelho novo volta à regra dos carimbos (§4.8.6).
7. `aparencia` ganha só ids novos de `corte`/`modelo` (cortes e roupas de menino) e a chave opcional `semLaco`; o sexo
   mora em `perfil` (§12). Sem corte/modelo salvo vale o padrão do sexo (`PA.VISUAL_SEXO`). A Mariana sem `perfil.sexo`
   é menina: o sprite dela não muda.
### 4.7 `pago` (carimbos em `pagoEm`)
1. `P.registrarPagamento` carimba a matéria (`max(Date.now(), carimbo + 1)`), também para menos (40 → 4).
2. Mesmo ciclo: vale o valor do lado com o carimbo maior; sem carimbo nos dois ou empate = o maior (a regra de antes).
   `pagoEm`: por chave, o maior. Ciclo diferente: `pago` e `pagoEm` vêm do ciclo mais novo; o Novo ciclo apaga `pagoEm`.
3. Limite conhecido: um aparelho da versão ANTIGA aberto junta `pago` pelo maior e leva o carimbo junto. Enquanto
   ele estiver aberto, a correção para menos pode voltar ao maior (a regra de antes; a nova cede, §4.8). Com ele
   fechado (ou recarregado na versão nova), a correção seguinte vale. Duas correções quase simultâneas em dois
   aparelhos seguem o relógio de cada um, como as escolhas (§4.6.4).
4. Testes: `testes/unidade/save-pendencias.test.js`, `save-escolhas-mescla.test.js`, `save-escolhas-versao-antiga.test.js`,
   `save-escolhas-vaivem.test.js`.
### 4.8 Sem vaivém com a versão antiga (`progresso-nuvem.js`, `juntarRemoto`)
A antiga decide escolhas e pago pelo `atualizado` (relógio dela) e reenvia o que juntou; a nova, pelos carimbos.
Com relógios diferentes, as duas se desfariam para sempre. Por isso:
1. O doc que a nova envia leva `versaoMescla: 2` (fora do `estado`: o save não muda) e, se o estado dela já foi
   decidido pela regra da antiga (`nuvem.cedeu`), `cedeu: true`. O doc da antiga não tem `versaoMescla`.
2. Doc limpo (`versaoMescla` sem `cedeu`): regra dos carimbos (§4.6, §4.7), e quem o junta fica limpo.
3. Doc da antiga: quem o junta fica `cedeu` (o estado dela não segue os carimbos, e carimbos podem ter ficado para trás).
4. Doc da antiga ou com `cedeu`: a nova compara a mescla com carimbos e a regra de antes (`I.mesclarSemCarimbos`).
   Se diferem, insiste (`nuvem.lutas` 1; vira 2 quando a insistência é ENVIADA). Se o conflito voltar depois do
   envio, cede (a regra de antes) e fica `cedeu`. Receber o mesmo doc duas vezes antes de enviar não conta.
   Conquistas saem iguais nas duas regras.
5. Uma troca feita no aparelho (escolha ou "Já pago") zera `lutas` e `cedeu`: cada aparelho novo insiste no máximo
   uma vez por troca, e com uma antiga aberta todos acabam na regra dela (a de antes, que converge).
6. Sem antiga aberta (ex.: logo depois da atualização, com o banco gravado pela antiga): os aparelhos ficam `cedeu`
   só até o primeiro doc limpo (o de quem trocou algo); daí em diante vale a regra dos carimbos, e o banco termina limpo.
7. O que volta ao banco depois de uma junção leva `atualizado = max(agora, atualizado do banco + 1)`: a antiga adota
   a insistência mesmo com o relógio adiantado.
8. Conferido (`save-escolhas-vaivem.test.js`): misturas 2N, 3N, 1N1V, 2N1V, 1N2V e 2N2V, relógios de −60 s a +60 s,
   voltas em ordem fixa e sorteada: converge, ninguém diverge, nenhuma conquista some; só novos com banco inicial
   sem marca e relógios iguais: nenhuma escolha nem pago volta atrás e o banco termina limpo.

## 5. Cópia de segurança `-novidades`
1. Chave `Reino.config.chaveSave + '-novidades'` (constante em progresso.js). Guarda
   `{ geracao, ciclo, atualizado, cuidados, despensa, surpresa, surpresaEm }` a cada gravação local.
2. O código antigo não conhece essa chave: uma aba antiga no mesmo navegador não a apaga.
3. O que faltar volta dela, com as mesmas regras, ao carregar, a cada mescla, a cada gravação local
   (`gravarLocal` faz `normalizarNovos(comCopia(estado))`) e no aparelho "em branco" que adota o save
   guardado (`iniciarNuvem`).
4. Da cópia só entram registros de cuidados com `fome`, `sede` e `em` numéricos ≥ 0 e registros da despensa
   com `compradas` e `usadas` numéricos ≥ 0. O banho volta dela pela mesma regra de mescla (§4.2).
5. Só vale na mesma `geracao` ("Apagar tudo" não traz nada de volta).
6. Sem `removeItem` nem `clear`.
7. `escolhasEm` e `pagoEm` NÃO entram: um carimbo velho devolvido pela cópia colaria num valor que uma aba antiga
   trocou sem carimbar. Sem carimbo, a troca da versão nova (carimbada) vence na mescla (§4.6).

## 6. Normalização (`normalizarNovos`, no fim de `completar()` e em `gravarLocal`)
1. Só chaves próprias; nunca `__proto__`, `constructor`, `prototype` nem outro nome de `Object.prototype`
   (`hasOwnProperty`, `toString`…).
2. Fome e sede entre 0 e 100 (inválida vira 100); `em` ≥ 0.
3. `banho`: presente e inválido vira 100, presente fica entre 0 e 100; AUSENTE CONTINUA AUSENTE.
4. `compradas`/`usadas` inteiros ≥ 0, com `usadas ≤ compradas`.
5. `surpresa` "true"/"false" em texto vira booleano (outro valor volta ao padrão).
6. Ids desconhecidos ficam guardados, sem efeito (uma versão não apaga a comida de outra).
   Vale para todo campo com id (unicórnio, ovo, montaria, sala, prova, treino, `pago`, comida, `loja`,
   `usando.enfeites`): a aba de uma versão ANTIGA recebe pela mescla ids da versão nova e não pode quebrar.
   - A LEITURA cai na reserva: `P.montaria()` devolve `'inicial'` quando o unicórnio não chocou, não está em `unis`
     ou não tem def (`!P.defUni(id)`); `P.ovosParaChocar()` só lista ovo com def. HUD, Loja, Mariana montada,
     Estábulo, Pet Shop, banho, xp e cuidados leem por essas duas e caem juntos na reserva.
   - A GRAVAÇÃO conserva: `estado.montaria` continua com o id desconhecido (ninguém grava `'inicial'` por cima);
     trocar enfeite na Loja só tira do encaixe o que ela conhece (`!it || it.slot !== item.slot`).
   - Segunda defesa na interface: `UI.chocarOvos` ignora ovo sem def; `UI.spriteMontaria` desenha `'inicial'`
     quando a def falta. Teste: `testes/unidade/futuro.test.js` e `futuro.navegador.test.js`.
7. `acaoFome`/`acaoSede`/`acaoBanho` que não são números ≥ 0 são apagados (contam como ausentes; vale o `acao`).
8. `acao` NÃO é normalizada aqui (nem apagada): quem a conserta é `Cuidados` ao mudar o registro (`registroParaMudar`).

## 7. Sincronização (mesmas regras da mescla)
1. Duas abas no mesmo aparelho: `vistoLocal` é o texto do save que esta aba leu ou gravou por último.
   `gravarLocal` confere antes de gravar: se o save do aparelho mudou (outra aba gravou), junta com
   `P.mesclar` e só então grava.
2. O evento `storage` (chave do save) e a volta da aba (`visibilitychange`, para a aba congelada no fundo
   que perdeu o evento) fazem a mesma junção (`juntarDoAparelho`); se a junção trouxe algo que a outra aba
   não tinha, `P.salvar()` devolve com carimbo novo (aparelho e servidor); senão só avisa
   (`Reino.EVENTOS.PROGRESSO`/`PROGRESSO_REMOTO`). Duas abas novas não entram em vaivém.
3. "Trouxe algo novo" (`trouxeAlgo`/`conteudo`): compara o CONTEÚDO, não o `atualizado`: chaves em ordem,
   sem valores vazios, sem `atualizado` e, nos cuidados, só os carimbos (`acao`, `acaoFome`, `acaoSede`,
   `acaoBanho`), porque fome, sede, banho e `em` mudam a cada segundo. Comida ou água dada num lado conta.
4. Servidor/claude.ai: o `onSnapshot` ignora o remoto de mesmo conteúdo (dois aparelhos podem mandar
   estados diferentes com o mesmo `atualizado`); se a junção trouxe algo que o banco não tem (ou
   `conferirPersistencia` achou algo), ganha `atualizado` novo e reenvia. No `iniciarNuvem`, o aparelho que
   trouxe algo ganha `atualizado` novo antes do primeiro envio (senão os outros o ignorariam como já visto).
5. Rede lenta: cada gravação e cada fetch do servidor desistem em `limiteRedeMs` (15 s; o fetch é cancelado
   com `AbortController`); depois de um erro, tenta de novo sozinha em `novaTentativaMs` (15 s). A busca
   inicial (`iniciarNuvem`) desiste em 12 s e rejeita; o jogo pode tentar de novo.
   O jogo só começa depois dela (`jogo/js/motor/main.js`), com uma exceção: sem resposta e com o save deste jogador
   já no aparelho (`P.podeJogarSemNuvem`: `comecou`), joga com ele e `P.reconectarNuvem` tenta de novo no evento
   `online` e a cada `reconectarMs` (30 s) até o `iniciarNuvem` dar certo (junta e envia o que foi feito sem rede).
   Sem o save (aparelho que nunca começou), a tela de início mostra "O reino não abriu agora" (ou "Sem internet")
   e "Tentar de novo", e nada anda até dar certo. Teste: `testes/unidade/nuvem-reconectar.test.js`.
6. Cuidados gravam no máximo a cada 60 s (ou 10 pontos), nunca a cada quadro: cada `P.salvar()` sincroniza
   (`cuidados.md` §4).

## 8. Novo ciclo, Apagar tudo, quem lê o estado
1. "Novo ciclo" (`P.novoCiclo`) mantém `cuidados` (fome, sede e banho) e `despensa`. "Apagar tudo"
   (`P.apagarTudo`) zera, como o resto.
2. Quem lê o estado sempre chama `P.estado()` de novo: a mescla troca o objeto inteiro. Nunca guarde o
   objeto numa variável.
3. Ex.: os interruptores dos Ajustes leem `P.estado().ajustes` na hora do toque (defeito antigo: a tela
   guardava o objeto e, depois de uma mescla com a tela aberta, o 🎵 parava a música mas o save continuava ligado).

## 9. Segurança do progresso real (inegociável)
1. O progresso real vive no banco da Vercel (Postgres/Neon de `reino-dos-unicornios.vercel.app`, API em `vercel/`,
   mesmas rotas do servidor de casa) e no localStorage `mariana-reino-v1` (e a cópia `mariana-reino-v1-novidades`) de
   cada aparelho; nenhum teste ou ferramenta toca neles. Aposentados em 29/09/2026 e guardados como cópia, também
   intocáveis: o servidor de casa (container Docker `reino-unicornios` desligado, banco em
   `jogo/servidor/dados/reino.db`, copiado para a Vercel) e o artifact do claude.ai (doc `progresso/mariana`).
2. Proibido:
   - abrir, chamar ou testar qualquer endereço do servidor de casa, ou ler e gravar o banco da Vercel;
   - ler, copiar, gravar ou apagar qualquer coisa em `jogo/servidor/dados/`;
   - `docker compose restart/down/up/build`, mexer no container ou no serviço `reino-nome`;
   - publicar ou republicar o artifact, ou abrir o jogo publicado;
   - `localStorage.clear()`, `removeItem` em chaves existentes, "Apagar tudo", "Novo ciclo" ou pagamentos
     fora do ambiente de teste.
3. Como testar sem risco:
   - servidor de TESTE: `node jogo/ferramentas/testes/servidor-teste.js` (porta livre ≥ 1024, nunca 80, banco novo em
     `/tmp/reino-testes/`; recusa a porta 80 e banco fora de `/tmp`/dentro de `servidor/dados`). Em código:
     `const { iniciar } = require('./servidor-teste'); const s = await iniciar(); … s.parar();`;
   - Playwright só Chromium e só na porta de teste (`jogo/ferramentas/testes/navegador.js` bloqueia o resto);
   - saves 100% sintéticos (`jogo/ferramentas/testes/saves.js`); nunca copie o save real;
   - testes sem navegador num `vm` com localStorage de mentira (`testar-save.js`, `testar-banho.js`);
   - derrube só os seus servidores, pelo PID; nunca `pkill`/`killall` por nome.
4. Nada é escrito na árvore principal `/home/leandro/Development/products/reino-dos-unicornios` (servida ao vivo pelo container).

## 10. Antes de mexer, rode
```
node jogo/ferramentas/testes/testar-save.js
node jogo/ferramentas/testes/testar-banho.js
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados
npm test
```
Mudou regra de mescla ou campo: teste novo em `testar-save.js` com dois aparelhos (versão antiga e nova,
`git show <commit>:…` num `vm` separado, como em `testar-banho.js`).

## 11. Campo novo (`registrarCampo`)
Mecânica nova com estado declara o campo UMA vez, num script carregado antes do `P.carregar()` (no
carregamento, depois de `progresso-campos.js` no manifesto):
```
Reino.Progresso.registrarCampo('jardim', {
  padrao: function () { return {}; },   // save sem o campo (antigo, novo, "Apagar tudo")
  mesclar: 'carimbo',                   // do catálogo abaixo, ou function (a, b) própria
  limpar: function (v) { return v; },   // opcional: saneamento extra, depois do da estratégia
  novoCiclo: 'mantem',                  // 'mantem' | 'zera'
  copiaSeguranca: true,                 // opcional: entra na cópia -novidades (em `campos`)
  exemplos: [a, b],                     // opcional (OBRIGATÓRIO com mesclar próprio): valores realistas p/ os testes
});
```
1. Onde entra: `estadoNovo()` e `completar()` põem `padrao()`; `normalizarNovos()` limpa (a da estratégia,
   depois `limpar`; `undefined` = estragado, volta ao padrão; lista onde o padrão é objeto, ou o contrário,
   também); `P.mesclar` junta (base = o lado mais recente, como a despensa; um lado sem o campo ou estragado não
   apaga o outro; campo que `zera`, entre ciclos diferentes, vem inteiro do ciclo mais novo, como as salas);
   `P.novoCiclo` põe o padrão nos que `zera`; a cópia `-novidades` guarda os que pediram em `campos: { nome: valor }`
   e devolve pela mesma regra da mescla (os que `zera`, só do mesmo ciclo).
2. Nome: palavra em camelCase, fora de `Object.prototype`, não usado pelo save de hoje (`salas`, `cuidados`,
   `despensa`, `ajustes`, `geracao`…) nem registrado antes. Senão, erro claro. O padrão tem que passar pela limpeza. `exemplos`, quando vem, é
   `[a, b]` e os dois passam pela limpeza; com `mesclar` função própria ele é obrigatório (erro claro sem ele).
3. Catálogo (`progresso-campos.js`, `ESTRATEGIAS`), cada uma com a sua garantia:
   | estratégia | formato | regra | garantia |
   |---|---|---|---|
   | `contadores` | `{ id: n }` ou `{ id: { a: n, … } }` | por chave (e subchave) o maior; contador estragado = 0 | nada some, comutativa |
   | `carimbo` | `{ id: { …, em } }` | por chave vence o `em` maior; empate = a base | nenhuma chave some; comutativa com carimbos diferentes |
   | `uniao` | lista de valores simples ou `{ id: true }` | união (ordem da base, depois os novos) | nada some, comutativa como conjunto |
   | `maior` | número | o maior | nunca desce, comutativa |
   Todas: `mesclar(a, a) = a`; só chaves próprias e seguras (§6.1); NaN, Infinity e texto sem número não entram.
   Função própria recebe `(base, outro)` já limpos e não pode mudar nenhum dos dois.
   Cada estratégia sabe gerar dois exemplos no formato do `padrao()` (`exemplos(padrao)`); os do def, se vierem, valem no lugar.
4. Sem campo registrado, o save, a cópia, a mescla e o Novo ciclo saem byte a byte iguais aos de antes.
5. Testes: `jogo/ferramentas/testes/unidade/save-campos.test.js` carrega o jogo inteiro no vm (todos os `node: true`
   do manifesto) e roda o contrato (idempotência, nada some, comutatividade, entrada hostil, save antigo, Novo
   ciclo, ida e volta pela cópia) para CADA campo de `P.camposRegistrados()`, com os exemplos do campo. Campo real
   novo entra sozinho, sem mexer no teste (o arquivo precisa estar no manifesto com `node: true`); um caso prova isso com
   uma feature de mentira num arquivo à parte. Também há um campo de mentira por estratégia.
6. Exemplo: a despensa, se fosse nova, seria
   `registrarCampo('despensa', { padrao: () => ({}), mesclar: 'contadores', novoCiclo: 'mantem', copiaSeguranca: true,
   limpar: (d) => { /* usadas ≤ compradas, inteiros */ return d; } })` — no lugar do `juntarDespensa`, do trecho em
   `normalizarNovos`, da linha em `comCopia`/`gravarCopia` e do comentário no `P.novoCiclo`.
7. Gravar depois de mudar o campo (nos ganchos ou quando a Mariana age, nunca no carregamento): mude
   `Reino.Progresso.estado().<campo>` e chame `Reino.Progresso.salvar()` (grava no aparelho e agenda a nuvem).

## 12. Jogadores
Cada jogador tem o seu save; a Mariana é o jogador `'mariana'`, e o dela não muda de lugar nem de formato.
Código: `jogo/js/sistemas/jogadores.js` (`Reino.Jogadores`, contas, perfil), `ui/jogadores.js` ("Entrar no Reino"),
`P.usarJogador`/`P.jogador`/`P.chaveSave` (progresso.js), a sincronização em progresso-nuvem.js e as rotas em
`jogo/servidor/servidor.js`.
1. Onde mora cada save:
   | | Mariana (`'mariana'`) | outro jogador (`<login>`) |
   |---|---|---|
   | aparelho | `mariana-reino-v1` (+ `-novidades`) | `reino-v1-<login>` (+ `-novidades`; `config.jogadores.prefixoSave`) |
   | claude.ai | doc `progresso/mariana` | doc `progresso/<login>`; conta em `jogadores/<login>` (`{ login, senha, criado }`) |
   | servidor de casa | `/api/progresso`, linha `'mariana'` | `/api/progresso/<login>`, linha `<login>`; conta na tabela `jogadores` |
   | fotos (IndexedDB) | `reino-fotos` (as de antes) | `reino-fotos-<login>` |
   Login: `^[a-z0-9_-]{2,20}$`, fora dos nomes de `Object.prototype`; `'mariana'` é reservado (criar dá "já existe").
   A conta dela mora no banco como as outras (o progresso dela, NÃO: continua onde sempre esteve):
   - servidor de casa: linha `'mariana'` da tabela `jogadores`, semeada pelo `servidor.js` ao iniciar com
     `ON CONFLICT DO NOTHING` (nunca sobrescreve; banco sem a linha = entra, como antes);
   - claude.ai: doc `jogadores/mariana`; se faltar, o jogo o cria com `config.jogadores.senhaMariana` na primeira
     conferência (nunca por cima de um que exista);
   - sem banco (arquivo, servidor antigo): confere com `config.jogadores.senhaMariana` (vazio = ninguém entra nela
     sem banco: nunca sem senha).
   Ninguém entra sem senha, nem no aparelho que tem o save dela (só o modo congelado dos testes). "Sair" (Ajustes,
   `Jogadores.sair`) guarda e marca `reino-jogador-atual = ':saiu'` (nunca é login): o próximo login vem em branco;
   o save fica onde está.
2. Ordem (`motor/main.js`): abertura (visual de quem jogou por último, só LIDO do save dele: `Jogadores.visualGuardado`)
   → toque em "Entrar no Reino" (`.btn-comecar`) → login com senha (`UI.telaQuemVaiJogar`) → `P.usarJogador` →
   `P.carregar()` → jogo. O save da nuvem é buscado com o login ainda aberto (`aoEntrar`, botão "Abrindo o
   reino..."): dele direto para o mapa; a abertura só volta se a busca falhar (aviso e "Tentar de novo"). Nada é lido para jogar nem gravado na chave de ninguém antes da senha certa. O jogador não muda
   com o jogo aberto: `P.usarJogador` depois do carregar lança erro; trocar (`UI.trocarJogador`) grava, mostra
   "Guardando...", envia já (`P.enviarAgora`, espera no máximo 5 s), marca e recarrega; o recarregar entra direto em
   quem acabou de passar pela senha (sessionStorage `reino-entrou`, vale uma vez, só se bater com o lembrado).
   A versão nova (`sistemas/versao.js`, `cena-e-motor.md` §15) usa o mesmo atalho: logo antes de recarregar,
   `Jogadores.lembrarEntrada()` grava `reino-entrou` com o login de agora, só se ele é o lembrado
   (`=== Jogadores.ultimo()`; depois de "Sair" não grava), e o reload cai direto no mapa, sem abertura nem senha.
   É só sessionStorage da aba: nenhum save é lido, migrado nem regravado.
   O evento `storage` só junta a chave do jogador atual.
3. Entrar sem perguntar: só o modo congelado (e2e) = a Mariana, sem ler nada (e o atalho de uma vez do item 2: Trocar
   jogador e versão nova).
   Login preenchido (`Jogadores.ultimo`): o lembrado em `reino-jogador-atual` (se o aparelho conhece a conta); sem ele,
   a Mariana se `mariana-reino-v1` está no aparelho; depois de `':saiu'`, em branco. Tela "Entrar no Reino": cartões
   "Neste aparelho" e "No reino" (atalhos: preenchem o login e levam à senha; o do login preenchido fica destacado),
   abas "Entrar" e "Criar conta".
   Testes com navegador sem congelar fazem o login (senha da Mariana): `referencias-dados.js` (desempenho),
   `album-duplo.navegador.test.js`, `jogadores.navegador.test.js`.
4. Contas: senha em TEXTO, sem segurança (pedido do Leandro; no claude.ai qualquer visitante lê). Lembradas no aparelho
   em `reino-jogadores` (`{ login: { senha, criado } }`): servem de cartão e de senha para sincronizar; entrar pede a
   senha sempre. Com banco, a conta nasce e é
   conferida nele; sem banco (arquivo, servidor antigo), só no aparelho.
5. Servidor antigo (grava tudo na linha `'mariana'`, inclusive `api/progresso?x`): outro jogador SÓ sincroniza com
   servidor que manda `X-Reino-Jogadores: 1` no HEAD de `/api/progresso`; sem ele, o save fica no aparelho. Segunda
   barreira: antes de sincronizar, `conferirConta` confere a conta no banco (`/api/jogadores/entrar`, ou o doc
   `jogadores/<login>`); conta só do aparelho é criada lá; senha diferente (outra pessoa com o mesmo login) = fica no
   aparelho. A Mariana não passa por nada disso (o caminho dela é o de sempre).
6. Campo `perfil: { nome, sexo: 'menina' | 'menino', em }` (`registrarCampo`, mescla própria: vence o `em` maior,
   empate = a base; Novo ciclo mantém). Padrão: Mariana → `{ nome: 'Mariana', sexo: 'menina', em: 0 }`; outro → nome
   vazio (`Jogadores.perfil()` mostra o login com a inicial maiúscula). Nada gravado no carregamento: entra no save da
   Mariana quando o jogo grava. `Jogadores.definirPerfil({ nome, sexo })` carimba, grava e emite `EVENTOS.PERFIL`.
7. Nenhuma ferramenta migra, copia ou regrava o save da Mariana.
8. Testes: `testes/unidade/jogadores-save.test.js` (chaves, decidir, perfil, contas, claude.ai, fotos),
   `jogadores-servidor.test.js` (rotas; servidor ANTIGO do commit 98e606f + jogador novo = linha `'mariana'` igual),
   `jogadores.navegador.test.js` (criar, trocar, entrar com senha no Chromium),
   `versao-entrou.navegador.test.js` (versão nova no modo vivo: reload direto no mapa, uma vez só).
