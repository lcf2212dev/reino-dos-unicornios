# Contrato: save e mescla

Cobre o estado salvo da Mariana (`Reino.Progresso`), os campos, a `chaveSave`, a cópia `-novidades`,
`P.mesclar`, a sincronização (abas, servidor de casa, claude.ai), os carimbos e as regras de segurança
do progresso real. Mudança aqui só com muito cuidado e testes.

## Índice
1. Onde está no código · 2. O que nunca muda · 3. Campos aditivos · 4. Mescla · 5. Cópia `-novidades` ·
6. Normalização · 7. Sincronização · 8. Novo ciclo, Apagar tudo, quem lê o estado · 9. Segurança do progresso real ·
10. Antes de mexer

## 1. Onde está no código
- `jogo/js/sistemas/progresso.js` — estado, `estadoNovo`, `completar`, `normalizarNovos`, `numeroOu`,
  carregar/salvar, `gravarLocal`, `vistoLocal`, `juntarDoAparelho`, `conteudo`/`trouxeAlgo`, cópia `-novidades`.
- `jogo/js/sistemas/progresso-mescla.js` — `P.mesclar`, `juntarCuidados`, `juntarSurpresa`, despensa.
- `jogo/js/sistemas/progresso-nuvem.js` — servidor de casa (`/api/progresso`) e claude.ai (`db`, doc
  `progresso/mariana`), `iniciarNuvem`, `limiteRedeMs`, `novaTentativaMs`.
- `jogo/js/sistemas/progresso-regras.js` — dinheiro, estrelas, unicórnios, salas, treinos, provas, pagamentos.
- Interno compartilhado: `Reino._progresso` (`I.estado` é o objeto do save; ver o cabeçalho de progresso.js).
- Chave: `Reino.config.chaveSave` = `'mariana-reino-v1'` (`jogo/js/nucleo/config.js`).
- Testes: `jogo/ferramentas/testes/testar-save.js`, `testar-banho.js`.

## 2. O que nunca muda
1. `chaveSave`, `v`, `geracao`, `ciclo` e o formato dos campos existentes.
2. As regras de `P.mesclar()` para os campos existentes (só o endurecimento de `estrelas`, §4.5).
3. Campo novo só aditivo (`estadoNovo()` + `completar()`), com regra de mescla própria e teste.
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
```
1. Unicórnio sem registro em `cuidados` = fome 100, sede 100 e banho 100 (nasce satisfeito).
2. `banho` ausente = 100 na leitura. Carregar o save, comer ou beber NÃO cria o campo `banho`; só o gasto
   (ou o banho) cria.
3. O gasto não mexe nos carimbos.
4. `registroParaMudar` (cuidados.js) cria o registro com `acao: 0` e dá ao registro que só tem `acao`
   `acaoFome = acaoSede = acao`.
5. Por que `acao` não muda de sentido: um aparelho da versão antiga trata um `acao` novo como comer e beber;
   com o banho em `acaoBanho`, ele nunca vê um banho como comida.

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
2. `ajustes` vem do lado mais recente, com uma exceção para `surpresa` (`juntarSurpresa`, a mesma regra na
   mescla e na cópia): vale o lado com o carimbo `surpresaEm` maior; sem carimbo nos dois, o lado que fica só
   recebe o `surpresa` do outro se não tiver o campo (aparelho antigo não religa as perguntas que os pais
   desligaram). `estadoNovo()` não tem carimbo (um aparelho novo não "ganha" de quem desligou);
   `completar()` põe `surpresa: true` se faltar.
3. Geração diferente: vence o estado inteiro da geração maior.
### 4.5 Endurecimento de `estrelas`
`estrelas.ganhas`/`gastas` estragados (texto sem número, null, NaN) contam como 0 na mescla (`numeroOu`;
`estrelas` que não é objeto conta como vazio; `gastas` ≥ 0) e em `P.estrelas`/`P.ganharEstrelas`/
`P.gastarEstrelas`. Número em texto ("12") vale o número. Com números válidos, o resultado é o de antes.

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

## 6. Normalização (`normalizarNovos`, no fim de `completar()` e em `gravarLocal`)
1. Só chaves próprias; nunca `__proto__`, `constructor`, `prototype` nem outro nome de `Object.prototype`
   (`hasOwnProperty`, `toString`…).
2. Fome e sede entre 0 e 100 (inválida vira 100); `em` ≥ 0.
3. `banho`: presente e inválido vira 100, presente fica entre 0 e 100; AUSENTE CONTINUA AUSENTE.
4. `compradas`/`usadas` inteiros ≥ 0, com `usadas ≤ compradas`.
5. `surpresa` "true"/"false" em texto vira booleano (outro valor volta ao padrão).
6. Ids desconhecidos ficam guardados, sem efeito (uma versão não apaga a comida de outra).
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
1. O progresso real vive em três lugares, e nenhum teste ou ferramenta toca neles:
   - servidor de casa: container Docker `reino-unicornios`, porta 80 (`reinodosunicornios.local`,
     `localhost`, `127.0.0.1` e o IP do PC na rede), banco em `jogo/servidor/dados/reino.db`;
   - o artifact publicado no claude.ai (capacidade `db`, doc `progresso/mariana`);
   - o localStorage `mariana-reino-v1` (e a cópia `mariana-reino-v1-novidades`) de cada aparelho.
2. Proibido:
   - abrir, chamar ou testar qualquer endereço do servidor de casa;
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
4. Nada é escrito na árvore principal `/home/leandro/Mariana Revisões` (servida ao vivo pelo container).

## 10. Antes de mexer, rode
```
node jogo/ferramentas/testes/testar-save.js
node jogo/ferramentas/testes/testar-banho.js
node jogo/ferramentas/testes/referencias.js capturar /tmp/<voce>/nova --raiz jogo --so dados
npm test
```
Mudou regra de mescla ou campo: teste novo em `testar-save.js` com dois aparelhos (versão antiga e nova,
`git show <commit>:…` num `vm` separado, como em `testar-banho.js`).
