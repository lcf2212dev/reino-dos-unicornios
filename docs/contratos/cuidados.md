# Contrato: cuidados (fome, sede, banho, despensa)

Cobre `Reino.Cuidados` (fome, sede e banho da montaria, despensa de comidas), o relógio que gasta, os
lembretes do Claude, a Pet Shop por dentro (tela, bebedouro, banheira) e a animação do banho.
Campos e mescla no save: `save-e-mescla.md` §3–§6. Nado e velocidade: `cena-e-motor.md` §10.

## Índice
1. Onde está no código · 2. API `Reino.Cuidados` · 3. Quem gasta e o ritmo · 4. Gravação ·
5. Lembretes · 6. Pet Shop (tela, NPC, bebedouro) · 7. Banheira e animação do banho ·
8. HUD, Estábulo e avisos · 9. Antes de mexer

## 1. Onde está no código
- `jogo/js/sistemas/cuidados.js` — `Reino.Cuidados` (números em `Reino.config.cuidados` e `Reino.config.comidas`).
- `jogo/js/sistemas/banho.js`, `banho-desenho.js` — `Reino.Banho` (animação; `Reino._banho` interno).
- `jogo/js/interiores/petshop/acoes.js` — ações `beber` e `banho`, tela `petshop`, status da Dona Aveia.
- `jogo/js/ui/petshop.js` — `UI.telaPetShop`, `UI.visitaPetShop`.
- `jogo/js/ui/cuidados.js` — barrinhas do HUD (`UI.pintarCuidados`), balões com tela aberta.
- `jogo/js/ui/estabulo.js` — barras e "Dar comida" no Estábulo. `css/ui-petshop.css`.

## 2. API `Reino.Cuidados`
```
iniciar()                  // main.js chama no "Entrar no Reino" (depois do HUD): liga o relógio e os ouvintes
ativo() → bool             // o relógio está gastando agora
niveis(uniId?) → { fome, sede, banho }   // padrão: a montaria (P.montaria()); sem registro / sem campo = 100
baixo(uniId?) → { fome, sede, banho }    // < config.cuidados.baixo (25)
icone(uniId?) → '💧' | '🍎' | '🛁' | null  // prioridade: sede, fome, banho
iconeMontaria() → icone(P.montaria())
sujo(uniId?) → bool        // banho < 25 (o desenho sujinho)
fatorVelocidade() → 1 | config.cuidados.fatorLento   // da montaria: fome OU sede baixa = 0,7. Banho NÃO conta
comidas() → config.comidas
quantidade(comidaId) → compradas − usadas
despensa() → [{ comida, quantidade }]    // só as com quantidade > 0, na ordem de config.comidas
comprar(comidaId) → { ok: true } | { ok: false, motivo: 'estrelas', faltam: n ≥ 1 } | { ok: false, motivo: 'sem-comida' }
     // P.gastarEstrelas(preço) → compradas + 1 → P.salvar(). Só compra: quem pergunta antes é a UI (§6)
alimentar(uniId, comidaId) → { ok: true, antes, depois } | { ok: false, motivo: 'sem-comida' | 'cheio' | 'sem-uni' }
     // usadas + 1; fome + comida.fome (enche = 100), no máximo 100; 'cheio' = fome ≥ 99,5; grava na hora
beber(uniId) → { ok: true, antes, depois } | { ok: false, motivo: 'cheio' | 'sem-uni' }
     // sede = 100, de graça; 'cheio' = sede ≥ 99,5; grava na hora. O bebedouro da Pet Shop e os da casa chamam (`casa.md` §13)
comerEmCasa(uniId, quanto) → { ok: true, antes, depois } | { ok: false, motivo: 'cheio' | 'sem-uni' }
     // comida de casa, de graça: fome + quanto (config.casa.usos), no máximo 100; 'cheio' = fome ≥ 99,5; grava na hora
banhar(uniId?) → { ok: true, antes, depois: 100 } | { ok: false, motivo: 'cheio' | 'sem-uni' }
     // 'cheio' = banho ≥ 99,5; banho = 100, acaoBanho = max(agora, acaoBanho + 1), em = agora; grava na hora
     // (P.salvar) e emite 'cuidados'. De graça. Não mexe em acao/acaoFome/acaoSede
avancar(ms)                // debug e testes: gasta ms de jogo ativo na montaria (fome, sede e banho), sem as condições
depurar() → { montaria, fome, sede, banho, sujo, fator, icone, ativo, despensa: { id: n },
              todos: { uniId: { fome, sede, banho } } }
frases: { chave: texto }   // OBJETO (Reino.Surpresa.frases é FUNÇÃO: não confundir). Chaves fixas:
                           // lembreteFome, lembreteSede, lembreteAmbos, lembreteBanho, faltamEstrelas (Pet Shop),
                           // guardado (comprou e guardou), comeu, cheio, bebeu, semSede, despensaVazia,
                           // banhou, jaLimpinho
vozDaFrase(chave) → 'claude' | 'unicornio'   // comeu/bebeu/banhou = o unicórnio
falas() → [{ texto, voz }] // tudo o que os cuidados falam (pacote geral): os valores de `frases`, com a voz
evento: U.emit(Reino.EVENTOS.CUIDADOS, depurar())  // a cada ponto inteiro que muda, ao cruzar o 25, ao comer, beber, banhar e comprar
```

## 3. Quem gasta e o ritmo
1. Só a montaria (`P.montaria()`, bebê que passeia junto inclusive), e só com o relógio ativo: depois de
   `iniciar()`, aba visível (`!document.hidden`) e com toque ou tecla (pointerdown, touchstart, keydown) nos
   últimos `semToqueMs` (5 min). O próprio "Entrar no Reino" conta como toque.
2. Jogo fechado ou parado: nada muda (não existe gasto "offline").
3. Ritmo, de 100 a 0 em minutos de jogo ativo: fome `minutosFome` (120), sede `minutosSede` (60), banho
   `minutosBanho` (180). Relógio de 1 s (`setInterval`), passo limitado a 5 s (aba que volta do fundo não dá salto).
4. `cuidados.js` usa `Date.now()` (grava carimbos no save).
5. Efeito: fome ou sede abaixo de 25 → `fatorVelocidade()` = 0,7 (montada ou a pé com o bebê). Comeu ou
   bebeu → volta a 1 na hora. Sujinho não fica lento. Não perde XP, dinheiro nem unicórnio.

## 4. Gravação
1. `P.salvar()` no máximo a cada `gravarMs` (60 s) enquanto gasta, ou antes se juntou `gravarPontos` (10)
   de mudança, e sempre ao cruzar o 25, comer, beber, banhar ou comprar.
2. Nunca a cada quadro: cada `P.salvar()` sincroniza. Entre gravações o valor vive em `P.estado().cuidados`.
3. Também grava quando a aba vai para o fundo com mudança pendente; qualquer `P.salvar()` de outro lugar
   (evento `Reino.EVENTOS.PROGRESSO`) zera o pendente, porque já levou os cuidados junto.

## 5. Lembretes do Claude
1. Com a montaria baixa, no máximo 1 a cada `lembreteMs` (10 min), e só com ela livre:
   `Reino.Cena.estado()` é `'mapa'` ou `'interior'` e `!Reino.Claude.aberto()`. Não aparece dentro da Pet Shop.
2. Balão comum do Claude (não modal), texto de `frases`, 6 s; some sozinho (balão fechado e voz calada)
   quando abre uma tela (evento `Reino.EVENTOS.TELAS`) ou ela entra na Pet Shop.
3. `lembreteBanho` só quando a fome e a sede não estão baixas (elas têm prioridade).

## 6. Pet Shop: tela, Dona Aveia, bebedouro
1. NPC `aveia` (Dona Aveia, voz `npc-aveia`): `acao: { tipo: 'tela', tela: 'petshop' }`. O prédio registra
   `Reino.NPCs.registrarTela('petshop', function () { Reino.UI.telaPetShop(); }, '<convite>')` e um status
   (`registrarStatus`): 🍎/💧/🛁 na Dona Aveia com a montaria baixa, só se o emoji tem desenho
   (`PA.iconeDesenho`); com 🛁 ela mostra "Precisa de banho". O guia da Pet Shop menciona a banheira.
2. Bebedouro: objeto interativo com `acao: { tipo: 'beber' }`; o prédio registra
   `Reino.NPCs.registrarAcao('beber', fn)` → `Reino.Cuidados.beber(P.montaria())`.
   - bebeu: som `gole`, animação de água no bebedouro (só com animações) e `frases.bebeu` na voz do unicórnio
     (retrato e nome dele);
   - já satisfeito (`cheio`): `frases.semSede` (Claude);
   - sem unicórnio chocado: a fala das `extras` da Pet Shop (narradora).
   Sempre em balão modal com "Ok! 👍". `bebeu`/`semSede` já estão no pacote geral: não duplicar nas `extras`.
   Fora daqui, só a casa tem água (bebedouro, fontinha e filtro: `casa.md` §13).
3. `UI.telaPetShop()` (`ui/petshop.js`): saldo de estrelas; cada comida com ícone, nome, preço e quanto enche;
   a despensa; nota de que a água é de graça.
4. NADA é gasto sem ela confirmar: tocar numa comida abre UM `UI.escolher` (classe `painel-compra`), e só
   depois da escolha algo acontece:
   - sem essa comida guardada: "Trocar N estrelas por <comida>?" com "Comprar e dar agora <ícone>"
     (`principal`, `gasta`), "Comprar e guardar 🧺" (`gasta`) e "Agora não" (`seguro`: foco e Esc). De
     barriga cheia (fome ≥ 99,5) o "dar agora" não aparece, o "guardar" vira o principal e uma nota avisa
     antes de gastar;
   - com essa comida na despensa e ele podendo comer: "<comida>: tem N na despensa! 🧺" com "Dar uma da
     despensa 🧺" (`principal`, `gasta`: gasta comida guardada, sem estrela), "Agora não" (`seguro`) e, se
     der para comprar, "Comprar e guardar 🧺" (`gasta`), com a nota "Ou trocar N estrelas por mais uma."
     (sem "Comprar e dar": 4 botões não cabiam em tela pequena).
5. Depois: dar da despensa (`Cuidados.alimentar` + `nhac` + `comeu`); ou `Cuidados.comprar(id)` → dar
   (`alimentar` + `nhac` + `comeu`) ou guardar (fala `guardado`). Nunca comprar primeiro e perguntar depois
   (a guarda de toque, `ui.md` §5, resolveu a compra sem querer).
6. Faltando estrelas e sem nada guardado (antes ou na compra): o número só na tela e a voz fala
   `frases.faltamEstrelas`, como na Loja.
7. Despedida: `UI.visitaPetShop = { comprou, deu }` conta o que aconteceu na última visita à tela (zera a cada
   abertura). Ao fechar, a Dona Aveia só se despede (fala `depois`, "Bom apetite!") se ela comprou ou deu
   comida; saiu sem nada, fica quieta (`npcs-conversa.js`).

## 7. Banheira e animação do banho
1. O objeto `petshop-banheira` é interativo ("Banho de espuma"), `acao: { tipo: 'banho' }`, registrado com
   `Reino.NPCs.registrarAcao('banho', fn)`. De graça. Age como o bebedouro: toca e começa, sem a fala antiga
   do objeto; ela anda até o lado da banheira (tile (21,7), virada para ela).
2. API:
   ```
   Reino.Banho = { iniciar(uniId) → Promise, ativo() → bool,
                   depurar() → { ativo, fase, t, curta, uniId, pulou },
                   itensDesenho(pintor, t, animar) → itens,   // o laço junta aos itens da cena
                   sobre(ctx, pintor, t, animar) }
   ```
3. Estado: `Reino.Cena.ocupar('banho')` no começo e `Reino.Cena.liberar('banho')` no fim (`Cena.estado()` =
   'atividade', input bloqueado, evento `Reino.EVENTOS.OCUPADA`). Durante o banho todos os toques da tela (inclusive HUD)
   são ignorados, com um temporizador de segurança que sempre libera a cena.
4. Depois de `config.banho.pularDepoisMs` (2 s), um toque (ou Enter/Espaço) pula para o fim.
5. Fases (~6 s, `config.banho.duracaoMs`): `entrar` (cortado na linha da espuma, como no nado), `espuma`
   (cresce, bolhas sobem e estouram), `esfregar` (escova vai e vem), patinho balançando o tempo todo,
   `chuveiro` (enxágua), `sacudir` (sai e se sacode, gotas voando), `brilhos` ("limpinho").
   Tudo desenhado a partir do tempo decorrido (sem partículas guardadas): pular é só ir ao fim.
6. Sem Animações: versão curta (`duracaoCurtaMs`, ~1 s), só com brilho.
7. Montada: a Mariana desce e fica ao lado (só no desenho; `J.montado()` não muda) e volta a montar no fim.
   Bebê: vai sozinho, ela fica ao lado.
8. Fim: `Reino.Cuidados.banhar(uniId)`, fala `banhou` ("Que banho cheiroso! Agora estou limpinho! ✨", voz
   'unicornio', balão com retrato), libera a cena. Banho com a barra cheia: fala `jaLimpinho`, sem animação.
9. Sons (`Reino.Som.tocar`): `'bolhas'`, `'esfregar'`, `'chuveiro'`, `'sacudida'`.
10. Falas novas da Dona Aveia sobre o banho ficam em `petshop/falas.js` (pacote `interior-petshop`).

## 8. HUD, Estábulo e avisos
1. HUD: três barrinhas (fome, sede, banho 🛁) no chip da montaria, com `data-uni`/`data-campo`, repintadas
   só pelo evento `Reino.EVENTOS.CUIDADOS` (`UI.pintarCuidados`); o `aria-label` do chip leva fome, sede e banho.
2. Balões dos cuidados com uma tela aberta (`balaoNaTela`): `body.recado-cuidado` + `--recado-altura`
   (`ui-petshop.css`) descem o balão para o pé da tela e encolhem a tela; o balão nunca cobre um botão.
3. Estábulo: a tela mostra as barras (fome, sede e banho) de cada unicórnio chocado; "Dar comida" (no detalhe)
   usa a despensa (`Cuidados.alimentar`); despensa vazia: fala que a Dona Aveia vende comidinhas e mostra
   "🐾 Ir até a Pet Shop" (`U.emit(Reino.EVENTOS.IR_PARA, lugar)`); com sede, avisa que a água é de graça.
4. Baias por dentro: `interiores.md` §9.1. Ícone acima do unicórnio e sujinho: `cena-e-motor.md` §7.
5. Menu Lugares: `Sede`/`Fome`/`Banho` na Pet Shop (`UI.avisosDoLugar`, `cena-e-motor.md` §9).

## 9. Antes de mexer, rode
```
node jogo/ferramentas/testes/testar-save.js
node jogo/ferramentas/testes/testar-banho.js
node jogo/ferramentas/validar/validar-interiores.js
npm test
```
No navegador de teste: `__reino.avancarJogo(ms)`, `__reino.cuidados()`, `__reino.banho(uniId)`,
`__reino.animacaoBanho()`.
