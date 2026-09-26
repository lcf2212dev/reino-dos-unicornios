# Rastreio: contratos antigos → contratos novos

Cada regra dos 4 contratos antigos da raiz (removidos; versão conferida: `git show 626513e:<arquivo>`) e onde
ela está agora. Linhas = números de linha no arquivo antigo em 626513e.
Siglas: **INT** = `CONTRATOS-INTERIORES.md`, **NOV** = `CONTRATOS-NOVIDADES.md`, **POR** = `CONTRATOS-PORTUGUES.md`,
**BFM** = `CONTRATOS-BANHO-FOTOS-MUSICA.md`. Destino = `docs/contratos/<arquivo>.md` §seção (regra).
Situação: **igual** (mesma regra, talvez com o caminho de arquivo atual), **atualizada** (a regra mudou de forma
por causa da reorganização ou de uma regra posterior; motivo ao lado), **removida** (narrativa/histórico sem
regra, ou o que deixou de existir; motivo ao lado).

## CONTRATOS-INTERIORES.md
| contrato antigo | seção/linha | regra (resumo curto) | onde está agora | situação |
|---|---|---|---|---|
| INT | cab. L1–3 | título; "fonte da verdade da feature", branch `feat/construcoes-por-dentro` | — | removida: narrativa da rodada (branch já integrada) |
| INT | cab. L4 | cada módulo depende só dos contratos; mudança de contrato só pelo orquestrador | README.md (cabeçalho) | igual |
| INT | cab. L6–7 | scripts clássicos, `window.Reino`, globais `Mapa`/`Jogador`/`PA`, nomes e comentários em português | README.md §1.2, §2.1–2.2 | igual |
| INT | cab. L7–8 | pixel art em código, contorno `#3a2446`, tile 16 px, fonte "Press Start 2P" no canvas | README.md §2.3–2.4 | igual |
| INT | §0 L10–16 | ordem dos scripts no index.html | README.md §3.1–3.4 | atualizada: a ordem vive em `js/manifesto.js`; index.html é gerado (`gerar-index.js`) |
| INT | §0 L17 | CSS `ui-jogo.css`, `interiores.css` | README.md §3.5 | atualizada: lista de CSS no manifesto (ui-*.css divididos) |
| INT | §0 L19–21 | interiores/npcs/prédios não tocam DOM/canvas/PA/Progresso no carregamento; ferramentas em vm | README.md §3.6 | atualizada: vale para todo script `node: true` do manifesto, carregado por `jogo-no-node.js` |
| INT | §1 L23–25 | estados da cena (5 strings) | cena-e-motor.md §2 | igual |
| INT | §1 L27–42 | API `Reino.Cena` (estado com prioridade, atual, mapa, bloqueado, emTransicao, entrar, irPara, sair, paraTela, quadros) | cena-e-motor.md §2 | igual |
| INT | §1 L43 | evento `cena` { de, para } | cena-e-motor.md §2 | igual |
| INT | §1 L46–47 | formas de entrar; com interior íris, sem interior painel antigo | cena-e-motor.md §3.1 | igual |
| INT | §1 L48 | aparece em `spawn`, de costas | cena-e-motor.md §3.2 | igual |
| INT | §1 L49–50 | sair pelo tapete; reaparece 1 abaixo da porta; `J.portaIgnorada` sem loop | cena-e-motor.md §3.3–3.4 | igual |
| INT | §1 L51–52 | menu Lugares dentro de interior; destino = próprio prédio vai ao spawn | cena-e-motor.md §3.5 | igual |
| INT | §1 L53 | atalhos do HUD abrem painéis direto | cena-e-motor.md §3.6 | igual |
| INT | §1 L54 | começa no mapa; posição no interior não é salva | cena-e-motor.md §3.7 | igual |
| INT | §1.1 L57–59 | íris: fecha ~450 ms, fechada ≥120 ms e até preparar/voz (limite ~4 s), abre ~450 ms | cena-e-motor.md §4.1 | igual |
| INT | §1.1 L60–61 | íris no canvas por cima de tudo, cor `#3a2446`, borda em degraus de `escala` px | cena-e-motor.md §4.2 | igual |
| INT | §1.1 L62 | som `porta` ao entrar e sair | cena-e-motor.md §4.3 | igual |
| INT | §1.1 L63–64 | durante a transição tudo bloqueado; nunca dispara duas vezes | cena-e-motor.md §4.4 | igual |
| INT | §1.1 L65 | resize/rotação no meio não quebra | cena-e-motor.md §4.5 | igual |
| INT | §1.1 L66 | sem animações: troca rápida ~150 ms sem círculo | cena-e-motor.md §4.6 | igual |
| INT | §1.2 L68–76 | interface do pintor (ret, sprite, ctx, escala, dpr, cam, tela) | cena-e-motor.md §5 | igual (hoje em `motor/camera.js`) |
| INT | §1.3 L79–80 | passos 1–2: buffer (fundo, desenharFundo, marcador) e ampliação | cena-e-motor.md §5 (ordem 1–2) | igual |
| INT | §1.3 L81 | passo 3: desenharTela com placas do mapa e dos cômodos | cena-e-motor.md §5 (ordem 3), §9.1 | atualizada: placas do mapa removidas (BFM §7); desenharTela do mapa é vazio |
| INT | §1.3 L82 | passo 4: itens por Y (jogador + cena) | cena-e-motor.md §5 (ordem 4) | igual |
| INT | §1.3 L83–84 | passo 5: desenharSobre com placas dos cômodos; placas do mapa no passo 3 | cena-e-motor.md §5 (ordem 5) | atualizada: não há placas do mapa (BFM §7) |
| INT | §1.3 L85–86 | passos 6–7: luz (vinheta), íris | cena-e-motor.md §5 (ordem 6–7) | igual |
| INT | §2 L90–111 | interface de cena (id, tipo, lugarId, corFundo, solido, portaEm, saidaEm, caminho, maisPerto, alvoEm, alvoPerto, npcs, preparar, desenhar*) | cena-e-motor.md §6 | igual |
| INT | §2 L102–103 | alvoEm no mapa: prédio, placa, Claude | cena-e-motor.md §6 | atualizada: sem toque na placa (placas do mapa removidas, BFM §7) |
| INT | §2 L114–117 | formato de `alvo` (tipo, id, tile, olhar, agir) | cena-e-motor.md §6 | igual |
| INT | §2 L119–121 | controle genérico: toque → alvoEm/irPara/virar/agir; Enter → alvoPerto; ignorado se bloqueado | cena-e-motor.md §6.1–6.3 | igual |
| INT | §3 L124–125 | jogador consulta `Reino.Cena.atual()` (Mapa de reserva) | cena-e-motor.md §7.1 | igual |
| INT | §3 L126–127 | `J.atualizar` chama `aoPisar` uma vez por tile | cena-e-motor.md §7.2 | igual |
| INT | §3 L128–129 | `J.itensDesenho` (Mariana e bebê separados, montada um item); `J.desenhar` continua | cena-e-motor.md §7.3 | igual |
| INT | §4 L133–145 | API `Reino.interiores`, `registrarInterior`, `Reino.Interiores` (T, def, doLugar, doPredio, cena, grade, objeto, bibliotecas) | interiores.md §2 | igual |
| INT | §4 L145 | `desenho`: mesmos helpers do mapa.js | interiores.md §2, §1 | atualizada: helpers únicos em `arte/desenho.js` (`Reino.Desenho`) |
| INT | §4.1 L150–186 | formato de um interior (id, lugar, nome, entrada, pacote, tamanho, saida, spawn, escadas, comodos, portas, corredores, objetos, npcs) | interiores.md §3 | igual (lista de lugares e ações ampliada) |
| INT | §4.1 L160–161 | chegada nunca em cima de escada; 'sobe' arco, 'desce' vão | interiores.md §3 | igual |
| INT | §4.1 L165 | 2 primeiras fileiras do rect = parede do fundo | interiores.md §3, §4.2 | igual |
| INT | §4.1 L188–189 | regras da grade (fora do rect sólido, parede sólida, portas/saída/spawn/escadas andáveis, objeto e NPC ocupam) | interiores.md §4.1–4.4 | igual |
| INT | §4.2 L193–200 | biblioteca `objeto(tipo, {w,h,solido,alto,parede,desenhar,chave,topo,anim,semSombra})` | interiores.md §5 | igual |
| INT | §4.2 L203–209 | 49 tipos genéricos, miudezas, pisos e paredes | interiores.md §5.1–5.2 | igual (conferido: 49 tipos) |
| INT | §4.2 L210 | ver `js/motor/interiores.js` e a prévia | interiores.md §1, §5.3 | atualizada: motor dividido em `motor/interiores-*.js` |
| INT | §4.2.1 L213–216 | `toque?(wx, wy, px, py, obj, folga)` | interiores.md §5 | igual |
| INT | §4.2.1 L217–221 | prioridade do `alvoEm` (NPC e balão, toque exato/folga, pegada, topo, máscara) | interiores.md §5.4 | igual |
| INT | §4.2.1 L221–222 | ações de objeto recebem `{ interior, cena, objeto }` e rodam depois da fala | interiores.md §3; npcs-e-dialogo.md §6.7 | igual |
| INT | §4.2.1 L222–223 | status registrados passam na frente; `'tchau'` faz despedir; detalhes em NOV §8 | npcs-e-dialogo.md §4.5, §6.8, §7 | atualizada: referência cruzada aponta para o contrato novo |
| INT | §4.3 L226–228 | estático pré-renderizado uma vez; refeito pela chave nos eventos; nada de canvas por quadro; móveis altos sprites | interiores.md §6.1–6.2 | igual |
| INT | §4.3 L229 | animações só com `animar` | interiores.md §6.3 | igual |
| INT | §4.3 L230 | câmera igual à do mapa | cena-e-motor.md §8.1 | igual |
| INT | §4.3 L231 | placas dos cômodos: fonte pixel `8 * max(2, round(escala/2))` | interiores.md §6.4 | igual |
| INT | §4.4 L234 | ≥15 tipos por cômodo | interiores.md §7.1 | igual |
| INT | §4.4 L235 | nenhum 3×3 vazio fora dos corredores | interiores.md §7.2 | igual |
| INT | §4.4 L236 | camadas (piso, rodapé, parede, móveis, pequenos, sombras) | interiores.md §7.3 | igual |
| INT | §4.4 L237 | ≥3 interativos por interior | interiores.md §7.4 | igual |
| INT | §4.4 L238 | tudo alcançável do spawn | interiores.md §7.5 | igual |
| INT | §5 L243–261 | formato de um NPC (id único, nome sem nomes de unicórnio, sprite, voz, x/y, acao, falas oi/nova/feita/bloqueada/depois) | npcs-e-dialogo.md §2 | igual |
| INT | §5 L263–276 | API `Reino.NPCs` (status, sprite, retrato, desenhar, interagir, executar, chips, falasPossiveis) | npcs-e-dialogo.md §3 | igual |
| INT | §5 L265–268 | ícones de status (sala, treino, prova, guia/tela) | npcs-e-dialogo.md §4.1–4.4 | igual |
| INT | §5 L279–303 | elenco com ids fixos (Museu, Torre, Castelo, Escola, Estábulo, Loja, Baú) | npcs-e-dialogo.md §5 | igual |
| INT | §5 L305 | perfil de voz `npc-<id>` | npcs-e-dialogo.md §5 (título) | igual |
| INT | §5 L305–307 | interior de teste da Fase 1 (`teste.js`, NPCs `teste-guia`/`teste-sala`) | interiores.md §9.6 | removida: o interior de teste foi trocado pelo Baú e não existe (perfis de voz ainda em config.js, registrado) |
| INT | §5 L310 | sala → `Reino.Missao.iniciar` | npcs-e-dialogo.md §6.1 | igual |
| INT | §5 L311 | treino → `Reino.Prova.iniciar` (só com a matéria completa; senão `bloqueada`) | npcs-e-dialogo.md §6.2 | igual |
| INT | §5 L312 | prova → `Reino.Provas.iniciar` | npcs-e-dialogo.md §6.3 | igual |
| INT | §5 L313–314 | tela → funções da UI | npcs-e-dialogo.md §6.4 | igual |
| INT | §5 L315–316 | guia → "Ver a lista" + livro | npcs-e-dialogo.md §6.5 | igual |
| INT | §5 L317–318 | `fim(premios)`: mapaMudou, comemoração, depoisDaMissao, fica ao lado | npcs-e-dialogo.md §6.6 | igual |
| INT | §6 L322–333 | `Reino.Claude.falar` com quem/botoes/extra/modal; resolve valor ou null; `dialogoAberto` | npcs-e-dialogo.md §8 | igual |
| INT | §6 L335 | botões grandes; principal com foco; Esc = 'nao' | npcs-e-dialogo.md §8.1 | igual |
| INT | §6 L336–337 | ~17 letras por linha, até ~34 letras por balão, paginar, falas curtas | npcs-e-dialogo.md §10.1, §8.2 | atualizada: o limite vigente é 30 letras por página (INT §7.3, mais novo) |
| INT | §7 L340–344 | perfis `npc-<id>` com `ingles?`; `Voz.dividir`; perfis de sempre não mudam | som-musica-e-voz.md §4.2–4.3 | igual |
| INT | §7 L345 | um pacote por prédio `interior-<id>`, carregado na íris | som-musica-e-voz.md §4.4 | igual |
| INT | §7 L346 | `Falas.todas()` inclui falasPossiveis e `fala` dos objetos | som-musica-e-voz.md §4.6; npcs-e-dialogo.md §10.4 | igual |
| INT | §7 L347 | listar-falas carrega interiores.js, npcs.js e prédios | README.md §3.6; som-musica-e-voz.md §1 | atualizada: carrega todo `node: true` do manifesto (`jogo-no-node.js`) |
| INT | §7 L348 | números enumerados; inglês entre «» | som-musica-e-voz.md §4.8 | igual |
| INT | §7.1 L351 | extras de `Reino.Cena` (acionar, irAoLugar, irAoAlvo, entrarLugar, faseTransicao) | cena-e-motor.md §2 | igual |
| INT | §7.1 L352 | `Jogador.gatilhoEm`; `alvo.semCaminho` | cena-e-motor.md §7.4, §6 | igual |
| INT | §7.1 L353 | `Reino.NPCs.ELENCO` | npcs-e-dialogo.md §3, §1 | igual (hoje em `personagens/elenco.js`) |
| INT | §7.1 L354 | ícone de status em px da tela | interiores.md §6.6 | igual |
| INT | §7.1 L355 | câmera dos interiores passa da borda até o HUD | cena-e-motor.md §8.2 | igual |
| INT | §7.2 L358–361 | dois arquivos por prédio (falas antes); entram no index.html e na lista `INTERIORES` da prévia | interiores.md §8.1–8.2 | atualizada: pasta por prédio com várias partes (`Reino._predios`); grupo `interiores` do manifesto entra sozinho na prévia |
| INT | §7.2 L360 | objetos temáticos `<prédio>-<nome>`; NPCs com sprite/voz do ELENCO | interiores.md §8.3–8.4 | igual |
| INT | §7.2 L362–363 | lista dos prédios e lugares | interiores.md §9 | igual (ampliada com petshop, observatorio, portugues) |
| INT | §7.2 L364–366 | geradores da Escola, Castelo e Estábulo (`prof-`, `cav-`) | interiores.md §8.7 | igual |
| INT | §7.2 L367–368 | ação `unicornio` (unicornioDaBaia, BAIA_VAZIA) | interiores.md §9.1.1 | igual |
| INT | §7.2 L368 | a Loja lê `UI.ITENS_LOJA` | interiores.md §9.2.1; loja.md §2.1 | atualizada: lê `Reino.LojaItens` (NOV §4.1); `UI.ITENS_LOJA` é apelido |
| INT | §7.2 L369–371 | frases automáticas do motor (guia, persistência, prova, treino, estábulo) | npcs-e-dialogo.md §10.2 | igual |
| INT | §7.3 L374 | até 30 letras por fala/página (sem «» e emoji) | som-musica-e-voz.md §5.1; npcs-e-dialogo.md §10.1 | igual |
| INT | §7.3 L375–377 | frases de 3+ palavras; padrão «palavra» + "quer dizer…" | som-musica-e-voz.md §5.2 | igual |
| INT | §7.3 L378 | gravação conferida por transcrição (faster-whisper) | som-musica-e-voz.md §5.3 | igual |
| INT | §8 L381–382 | nada novo no save; tudo derivado; o que o NPC disse só na memória | save-e-mescla.md §2.4; npcs-e-dialogo.md §3 | igual |
| INT | §9 L385–386 | ganchos de depuração `window.__reino` | cena-e-motor.md §12 | igual |

## CONTRATOS-NOVIDADES.md
| contrato antigo | seção/linha | regra (resumo curto) | onde está agora | situação |
|---|---|---|---|---|
| NOV | cab. L1–4 | título, branch/worktree, estende INT, mudança só pelo orquestrador | README.md (cabeçalho) | removida: narrativa da rodada; a regra do orquestrador ficou no README |
| NOV | cab. L6–7 | convenções de sempre, sem imagens | README.md §2.1–2.3 | igual |
| NOV | cab. L8–9 | todo emoji na tela/canvas com ícone em `icones.js`, conferir em `icones.html` | README.md §2.5 | atualizada: ícones divididos em `js/arte/icones/<lote>.js` |
| NOV | cab. L9–10 | Animações desligado/reduced-motion: tudo parado | README.md §2.6 | igual |
| NOV | §0 L12–18 | ordem dos scripts | README.md §3.1–3.4 | atualizada: ordem no manifesto; index.html gerado |
| NOV | §0 L19 | CSS (ui-jogo, interiores, ui-novidades, ui-petshop) | README.md §3.5 | atualizada: lista no manifesto |
| NOV | §0 L21–23 | loja-itens/cuidados/surpresa/interiores sem DOM/canvas/PA/Progresso/Cena/document no carregamento | README.md §3.6 | atualizada: vale para todo `node: true` |
| NOV | §0 L25–27 | listar-falas carrega prédios em ordem alfabética (padrao por último); falas/cenas antes pelo nome | interiores.md §8.5 | atualizada: ordem alfabética da PASTA do prédio e, dentro dela, a do manifesto (`ordemDosPredios`) |
| NOV | §1 L31–33 | não mudam chaveSave/v/geracao/ciclo/formato/regras; campos novos aditivos | save-e-mescla.md §2.1–2.3 | igual |
| NOV | §1 L36–42 | `cuidados` { fome, sede, em, acao, acaoFome, acaoSede }; carimbos crescentes; gasto não mexe; `registroParaMudar` | save-e-mescla.md §3, §3.3–3.4 | igual |
| NOV | §1 L43 | `despensa` { compradas, usadas } só crescem | save-e-mescla.md §3 | igual |
| NOV | §1 L44–45 | `ajustes.surpresa` e `surpresaEm` (só P.salvar marca) | save-e-mescla.md §3 | igual |
| NOV | §1 L47 | sem registro = fome e sede 100 | save-e-mescla.md §3.1 | igual |
| NOV | §1 L49–56 | mescla de `cuidados` (carimbos por campo, empate = menor, acao/em maiores, sem carimbo = `em` maior, `acao: 0` conta) | save-e-mescla.md §4.1 | igual |
| NOV | §1 L57 | mescla da despensa: maiores; estragado = 0 | save-e-mescla.md §4.3 | igual |
| NOV | §1 L58–59 | lado sem o campo: vale o outro; aparelho antigo não faz perder comida nem acessório | save-e-mescla.md §4.4.1 | igual |
| NOV | §1 L60–64 | `ajustes` do mais recente, exceção `surpresa` (`juntarSurpresa`, carimbo, estadoNovo sem carimbo, completar) | save-e-mescla.md §4.4.2 | igual |
| NOV | §1 L65 | geração diferente: vence a maior | save-e-mescla.md §4.4.3 | igual |
| NOV | §1 L66–69 | endurecimento de `estrelas` (`numeroOu`) | save-e-mescla.md §4.5 | igual |
| NOV | §1 L70–77 | cópia `-novidades` (o que guarda, quando volta, filtros, mesma geração, sem removeItem/clear) | save-e-mescla.md §5 | igual |
| NOV | §1 L78–84 | normalização (`normalizarNovos`) | save-e-mescla.md §6 | igual |
| NOV | §1 L86–91 | duas abas: `vistoLocal`, `gravarLocal`, `storage`/`visibilitychange`, `juntarDoAparelho`, sem vaivém | save-e-mescla.md §7.1–7.2 | igual |
| NOV | §1 L92–94 | "trouxe algo novo" compara conteúdo e só carimbos nos cuidados | save-e-mescla.md §7.3 | igual |
| NOV | §1 L95–98 | servidor/claude.ai: onSnapshot, reenvio, iniciarNuvem | save-e-mescla.md §7.4 | igual |
| NOV | §1 L99–101 | rede lenta: 15 s, AbortController, nova tentativa 15 s, iniciarNuvem 12 s | save-e-mescla.md §7.5 | igual |
| NOV | §1 L102 | Novo ciclo mantém cuidados/despensa; Apagar tudo zera | save-e-mescla.md §8.1 | igual |
| NOV | §1 L103 | sempre `P.estado()` de novo | save-e-mescla.md §8.2 | igual |
| NOV | §2 L107 | números em `config.cuidados` e `config.comidas` | cuidados.md §1 | igual |
| NOV | §2 L109–135 | API `Reino.Cuidados` (iniciar … falas) e evento `cuidados` | cuidados.md §2 | igual (com o banho de BFM §2) |
| NOV | §2 L137 | `Cuidados.frases` é objeto; `Surpresa.frases` é função | cuidados.md §2; surpresa.md §2 | igual |
| NOV | §2 L138–141 | quem gasta (montaria, relógio ativo, 5 min, "Entrar" conta); sem gasto offline | cuidados.md §3.1–3.2 | igual |
| NOV | §2 L142–143 | ritmo 120/60 min; relógio 1 s, passo ≤ 5 s | cuidados.md §3.3 | igual |
| NOV | §2 L144–145 | efeito: < 25 → 0,7; volta a 1 ao comer/beber; não perde nada | cuidados.md §3.5 | igual |
| NOV | §2 L146–150 | gravação: 60 s ou 10 pontos, sempre ao cruzar 25/comer/beber/comprar; nunca por quadro; aba ao fundo; `progresso` zera pendente | cuidados.md §4 | igual |
| NOV | §2 L151–154 | lembrete gentil (10 min, livre, fora da Pet Shop, balão 6 s, some com tela) | cuidados.md §5.1–5.2 | igual |
| NOV | §3 L156–173 | API do nado (`Mapa.agua`, `solido`, `caminho`, `maisPerto`, `fundura`, `cena.agua`, `Jogador.nadando/fundura/velocidade`, sons) | cena-e-motor.md §10 | igual (água hoje em `mundo/lago.js`) |
| NOV | §3 L175 | só ela anda no mapa | cena-e-motor.md §10.1 | igual |
| NOV | §3 L176–178 | tocar na água/terra; linha reta não corta água | cena-e-motor.md §10.2 | igual |
| NOV | §3 L179–180 | setas; nunca sai dos limites nem fica presa | cena-e-motor.md §10.3 | igual |
| NOV | §3 L181–186 | desenho na água pela água desenhada; limiares 0,5/0,15; sem animação sem partículas | cena-e-motor.md §10.4–10.5 | igual |
| NOV | §3 L187–188 | `EXTRAS` com `placa: 'acima'` e `caminho` explícito | cena-e-motor.md §9.4 | atualizada: `EXTRAS` virou `Mapa.LUGARES_FIXOS` (`mundo/lugares.js`); `placa` sem uso (BFM §7) |
| NOV | §3 L188–190 | `BORDA_BAIXO` e `margemBaixoMapa` | cena-e-motor.md §8.3 | igual |
| NOV | §3 L190–191 | placas do mapa desviam dos chips do HUD (`caixaParada`) | interiores.md §6.5 | atualizada: placas do mapa removidas (BFM §7); a `caixaParada` segue nas placas dos cômodos |
| NOV | §3 L192–194 | ícone de fome/sede acima do unicórnio, px da tela, nítido, todas as cenas | cena-e-motor.md §7.5 | igual |
| NOV | §3 L195–196 | placa da Pet Shop mostra Sede/Fome (`extraDaPlaca`) | cena-e-motor.md §9.3; cuidados.md §8.5 | atualizada: aviso vai no menu Lugares (`UI.avisosDoLugar`, BFM D12) |
| NOV | §3 L197 | nado sem canvas novo por quadro | cena-e-motor.md §10.6 | igual |
| NOV | §4.1 L203–216 | API `Reino.LojaItens` (ENFEITES, SLOTS sem patas, enfeite, premios, precoPremio, estadoPremio, item, FALAS) | loja.md §2 | igual |
| NOV | §4.1 L218–219 | lista única; `UI.ITENS_LOJA` apelido; sem cópia | loja.md §2.1 | igual (tela em `ui/loja.js`) |
| NOV | §4.1 L220–224 | estado de um prêmio (ganho, comprado, aVenda, bloqueado) | loja.md §3.1 | igual |
| NOV | §4.1 L225–227 | comprar prêmio; não mexe em provas/mural/pais; preços 25/40/70 | loja.md §3.2–3.3 | igual |
| NOV | §4.1 L228 | regra da prova intacta | loja.md §3.4; conteudo.md §5.1 | igual |
| NOV | §4.1 L229–230 | mural da Escola conta só o prêmio | loja.md §3.5; interiores.md §9.2.2 | igual (`ganhou()` hoje em `escola/objetos.js`) |
| NOV | §4.2 L233–234 | ≥10 enfeites novos, 10–45 ⭐, ≥3 do espaço, nomes sem repetir, um por slot | loja.md §4.1 | igual |
| NOV | §4.2 L235 | `PA.ENFEITES_MONTARIA[id]` com contorno `k` | loja.md §4.2 | igual (em `arte/pixelart-unicornio-moldes.js`) |
| NOV | §4.2 L236–240 | slots com âncora; slot novo nos 10 moldes; espelho; âncora `null` | loja.md §4.3–4.4 | igual |
| NOV | §4.2 L241 | tudo em `usando.enfeites` | loja.md §4.5 | igual |
| NOV | §4.2 L242 | ícone em pixel e `acessorios.html` | loja.md §4.6 | igual |
| NOV | §5 L246–259 | API `Reino.Surpresa` | surpresa.md §2 | igual |
| NOV | §5 L261 | tempo 3–10 min | surpresa.md §3.1 | igual |
| NOV | §5 L262–266 | relógio só com ela livre; abertura espera parada; `Jogador.parar()` | surpresa.md §3.2–3.3 | igual |
| NOV | §5 L267–270 | relógio monotônico, nunca `Date.now()`; passo ≤ 5 s | surpresa.md §3.4; cuidados.md §3.4 | igual |
| NOV | §5 L271–272 | tutorial (resolve, 10 s livre ou 2 min) | surpresa.md §3.5 | igual |
| NOV | §5 L273–274 | venceu ocupada: espera 4 s livre; nunca no meio de atividade | surpresa.md §3.6 | igual |
| NOV | §5 L275–276 | recomeço depois de estudar | surpresa.md §3.7 | igual |
| NOV | §5 L277–281 | só salas feitas, só salas, só os tipos; nenhuma sala = não abre; fila | surpresa.md §4.1–4.3 | igual |
| NOV | §5 L282–286 | mesma pergunta; pacote da sala (4 s); render/pontuar e dependências | surpresa.md §4.4–4.6 | igual |
| NOV | §5 L287–288 | painel DOM; Esc = Agora não; tocar fora não fecha | surpresa.md §5.1–5.2 | igual |
| NOV | §5 L289–291 | travas de 600 ms | surpresa.md §5.3 | igual |
| NOV | §5 L291–296 | uma tentativa: acerto, erro, enunciado no topo, Agora não volta à fila | surpresa.md §5.4 | igual |
| NOV | §5 L297–298 | sorteia o próximo; foco vai para o mapa | surpresa.md §5.5–5.6 | igual |
| NOV | §5 L299–301 | fechou com o dedo: renova a guarda até 3 s | surpresa.md §5.7 | igual |
| NOV | §5 L302–303 | interruptor nos Ajustes | surpresa.md §6 | igual |
| NOV | §6 L306–310 | Pet Shop no mapa (rect, porta, caminho, desenho de fora registrado pelo prédio) | interiores.md §9.3.1–9.3.2; cena-e-motor.md §9.6 | atualizada: posição em `Mapa.LUGARES_FIXOS`; desenho de fora em `petshop/fora.js` |
| NOV | §6 L311–316 | interior da Pet Shop (pacote, rico, cômodos loja e agua, estante/bolo abrem a tela) | interiores.md §9.3.3 | atualizada: prédio dividido em partes (`objetos-loja`, `objetos-agua`, `acoes`, `fora`) |
| NOV | §6 L317–320 | NPC `aveia`; `registrarTela('petshop')`; status 🍎/💧 só com desenho | cuidados.md §6.1; npcs-e-dialogo.md §9.8 | igual (registros em `petshop/acoes.js`) |
| NOV | §6 L321–326 | bebedouro (`beber`, som, fala do unicórnio, `semSede`, extras, balão modal, único lugar com água) | cuidados.md §6.2 | igual |
| NOV | §6 L327–337 | `UI.telaPetShop`: nada gasto sem confirmar; os dois diálogos e seus botões | cuidados.md §6.3–6.4 | igual (em `ui/petshop.js`) |
| NOV | §6 L338–341 | depois da escolha; nunca comprar antes; faltando estrelas | cuidados.md §6.5–6.6 | igual |
| NOV | §6 L342–344 | despedida da Dona Aveia (`UI.visitaPetShop`) | cuidados.md §6.7 | igual (em `npcs-conversa.js`) |
| NOV | §6 L345–346 | HUD: barrinhas no chip, só pelo evento, aria-label | cuidados.md §8.1 | igual |
| NOV | §6 L347–348 | `balaoNaTela`, `recado-cuidado`, nunca cobre botão | cuidados.md §8.2 | igual |
| NOV | §6 L349–351 | Estábulo: barras, "Dar comida", despensa vazia, "Ir até a Pet Shop", água grátis | cuidados.md §8.3 | igual |
| NOV | §6 L352–353 | baias mostram 🍎/💧 e entram na `chave` | interiores.md §9.1.2 | igual |
| NOV | §6 L354 | menu Lugares: Pet Shop e Observatório | cena-e-motor.md §9.3 | igual |
| NOV | §7 L357–359 | Observatório no mapa; desenho de fora registrado pelo prédio em `cenas.js` | interiores.md §9.4.1–9.4.2 | atualizada: desenho de fora em `observatorio/fora.js` |
| NOV | §7 L360–371 | `Reino.ObservatorioCenas` (temas, cena, desenharPlaneta); `registrarBase('robo')`; nada de canvas no carregamento | interiores.md §9.4.3 | atualizada: partes em `cenas.js`, `planetas.js`, `robo.js` |
| NOV | §7 L372–380 | interior noturno, 3 cômodos, planetas tocáveis | interiores.md §9.4.4 | igual |
| NOV | §7 L381–383 | NPCs `vega` e `cosmo` | npcs-e-dialogo.md §9.1–9.2 | igual |
| NOV | §7 L384–389 | ações `curiosidade` e `piada` | npcs-e-dialogo.md §9.3 | igual (em `observatorio/acoes.js`) |
| NOV | §7 L390–392 | fim das ações; `tchau`; quem conta a curiosidade | npcs-e-dialogo.md §9.4–9.5 | igual |
| NOV | §7 L393–394 | painel do telescópio 5 quadros/s; `Reino.ObservatorioInterior` | interiores.md §9.4.5 | igual (em `acoes.js`) |
| NOV | §7 L396–407 | formato das curiosidades e `Reino.Observatorio` | npcs-e-dialogo.md §9.6 | igual |
| NOV | §7 L408–412 | ≥40 curiosidades, temas, 30 letras, Brasil, voz `npc-vega`, sem save | npcs-e-dialogo.md §9.7 | igual |
| NOV | §8 L416–427 | extensões `registrarTela/Acao/Status/Base`, `gradeSprite`, `telas()/acoes()` | npcs-e-dialogo.md §7 | igual |
| NOV | §8 L429–431 | `ctx` das ações (objeto depois da fala; NPC só no vamos/lista) | npcs-e-dialogo.md §6.7 | igual |
| NOV | §8 L432–433 | despedida (tela registrada ou `'tchau'`); exceção petshop | npcs-e-dialogo.md §6.8 | igual |
| NOV | §8 L434–435 | pontos de extensão do motor (toque, balão de status tocável): ver INT §4.2.1 | interiores.md §5, §5.4; npcs-e-dialogo.md §4.6 | atualizada: referência cruzada aponta para o contrato novo |
| NOV | §8 L437–438 | registrar no carregamento é permitido; elenco novo aveia/vega/cosmo | npcs-e-dialogo.md §7, §5 | igual |
| NOV | §9 L441–443 | perfis npc-aveia/vega/cosmo; `efeito: 'robo-leve'`; amostras 34–36 | som-musica-e-voz.md §4.3, §4.11 | igual |
| NOV | §9 L444–445 | pacotes `interior-petshop`/`-observatorio`; falas de cuidados/surpresa/loja no geral | som-musica-e-voz.md §4.4 | igual |
| NOV | §9 L446–447 | `extras` do prédio no pacote do interior | som-musica-e-voz.md §4.5 | igual |
| NOV | §9 L448–449 | todo texto falado nas listas; números enumerados; nomes digitados não falados; «» | som-musica-e-voz.md §4.7–4.8 | igual |
| NOV | §9 L450–451 | regras da INT §7.3 (30 letras, 3+ palavras, transcrição) | som-musica-e-voz.md §5 | igual |
| NOV | §10 L454–455 | debug: avancarJogo, cuidados, surpresa, agua | cena-e-motor.md §12 | igual |
| NOV | §11 L458–459 | ≤16,7 ms com CPU 4× mais lenta; sem canvas por quadro | cena-e-motor.md §11.1–11.2 | igual |
| NOV | §11 L460–464 | cache LRU de áudio 24 MB, duas filas, 14 MB protegidos, `V.memoria()` | som-musica-e-voz.md §6.1–6.2 | igual |
| NOV | §11 L465–467 | pacote que falhou: 3/10/30 s, próxima fala, `online`; não toca atrasada | som-musica-e-voz.md §6.3 | igual |
| NOV | §11 L468–470 | cache de sprites com enfeites (24 combinações, `TETO_COMBOS`) | loja.md §4.7 | igual (em `arte/pixelart-unicornio.js`) |
| NOV | §12 L472–488 | divisão de arquivos por fase e agente | — | removida: histórico de quem fez o quê; não é regra (o próprio texto dizia que não indica dono) |
| NOV | §13 L491–493 | por quê da guarda; só toque/mouse de verdade; toque ignorado afunda sem som | loja.md §6 (por quê), §6.1 | igual |
| NOV | §13 L494–503 | API `segurarToques`, `toqueSegurado` (pointerdown do mapa), `escolher`, `confirmar` | loja.md §6 | igual (o pointerdown do mapa hoje em `motor/entrada.js`) |
| NOV | §13 L504–507 | botões que gastam: `.armando`, 1,1 s sem toque, barrinha, Agora não na hora | loja.md §6.2 | igual |
| NOV | §13 L508–510 | sob o dedo: troca com o seguro, move o diálogo | loja.md §6.3 | igual |
| NOV | §13 L511 | Ajustes: 1º segundo sem mudar interruptor | loja.md §6.4 | igual |
| NOV | §13 L512–514 | Loja: `logoDepoisDaCompra` | loja.md §6.5 | igual |
| NOV | §13 L515–517 | teclado sem trava; repetição não aciona | loja.md §6.6 | igual |
| NOV | §13 L517–519 | tela nova foca nela mesma; `escolher` foca o seguro | loja.md §6.7 | igual |
| NOV | §13 L520–521 | toda compra pergunta antes, com `gasta` e `seguro` | loja.md §6.8 | igual |

## CONTRATOS-PORTUGUES.md
| contrato antigo | seção/linha | regra (resumo curto) | onde está agora | situação |
|---|---|---|---|---|
| POR | cab. L1–5 | título, branch/worktree, estende INT e NOV, mudança só pelo orquestrador | README.md (cabeçalho) | removida: narrativa da rodada; a regra do orquestrador ficou no README |
| POR | §0 L8–9 | progresso real intocável (porta 80, local, IP, dados, docker, artifact, clear/removeItem, Apagar tudo, Novo ciclo, pagamento) | save-e-mescla.md §9.1–9.2; README.md §4 | igual |
| POR | §0 L10 | só a worktree e o servidor de TESTE (porta 8789, banco temporário) | save-e-mescla.md §9.3; README.md §5.3 | atualizada: `servidor-teste.js` escolhe porta livre e banco em /tmp (sem porta fixa) |
| POR | §0 L11 | nada escrito na árvore principal | README.md §4.3; save-e-mescla.md §9.4 | igual |
| POR | §0 L12 | nenhum campo novo no save; ids novos nos campos de sempre | save-e-mescla.md §2.5 | igual |
| POR | §0 L13 | derrubar só pelo PID; nunca pkill/killall | README.md §5.6 | igual |
| POR | §0 L14 | testes só Chromium, 390×844, 820×1180, 1366×768 | README.md §5.1–5.2 | igual |
| POR | §0 L15–16 | convenções e emoji com ícone | README.md §2 | atualizada: ícones em `icones/<lote>.js` |
| POR | §1 L19 | originais em `/home/leandro/reino-portugues/Português/` e `Revisão/` | conteudo.md §7.1 | atualizada: worktree antiga; hoje a pasta `Português/` da raiz |
| POR | §1 L20 | JPEG 1400 px num scratchpad de sessão | conteudo.md §7.2 | atualizada: caminho temporário de sessão antiga; gerar de novo em /tmp |
| POR | §1 L21 | páginas lado a lado, deitadas; 7465 de cabeça para baixo | conteudo.md §7.1 | igual |
| POR | §1 L22–23 | recorte com `crop.py` via `uv run … pillow-heif` | conteudo.md §7.2 | atualizada: script era do scratchpad antigo; comando genérico mantido |
| POR | §1 L24–25 | escrito à mão nunca é gabarito; palavra coberta (pp. 48, 69, 70, 78) não se adivinha | conteudo.md §7.3 | igual |
| POR | §1 L26–27 | textos de terceiros resumidos; trecho curto só se necessário | conteudo.md §7.4 | igual |
| POR | §1 L29–44 | tabela foto → páginas | conteudo.md §7.5 | igual |
| POR | §2 L46–47 | matéria id/nome/emoji/nomeLivro, "montada pelo orquestrador" | conteudo.md §6.1, §2.5 | atualizada: `portugues.js` é editado direto (sem montagem) |
| POR | §2 L48–51 | lugar: nome, artigo, sprite, rect (22,15), placa acima, porCima | conteudo.md §6.2 | igual (`placa` hoje sem uso, BFM §7) |
| POR | §2 L51–52 | placa da Loja das Fadas foi para cima do telhado | — | removida: placas do mapa removidas (BFM §7) |
| POR | §2 L54–60 | tabela das salas p1–p5 | conteudo.md §6.3 | igual |
| POR | §2.1 L62–76 | formato do rascunho `rascunho/portugues-pN.js` montado por `montar-portugues.js` | conteudo.md §2.1, §2.5 | atualizada: rascunho/ e montar-portugues.js removidos; a sala é `portugues/pN.js` com `Reino.registrarSala` |
| POR | §2.1 L77–78 | estilo igual ao de historia.js (4 e 8 espaços) | conteudo.md §2.4 | atualizada: referência é `historia/h1.js` (uma sala por arquivo) |
| POR | §2.1 L79–80 | todo desafio tem `pagina` (informativo), `livro` e `explica` | conteudo.md §3.2 | igual |
| POR | §2.1 L81–83 | ≥12 desafios; ≥6 escolha/vf/varias; tipos das salas | conteudo.md §4.1–4.2 | igual |
| POR | §2.1 L84 | textos curtos, 7 anos, palavras da apostila | conteudo.md §4.3 | igual |
| POR | §2.1 L85–86 | adivinhas/ditado/produção de texto viram tipos; nada de desenhe/recorte | conteudo.md §4.4 | igual |
| POR | §2.1 L87–88 | letras sozinhas em MAIÚSCULAS lidas pelo nome | conteudo.md §4.5; som-musica-e-voz.md §4.9 | igual |
| POR | §2.1 L89–90 | lacuna dentro da palavra: `completar` com `colado: true`; narradora lê só o enunciado | conteudo.md §4.6, §3.4 | igual |
| POR | §2.1 L91 | sílabas em minúsculas com hífen | conteudo.md §4.7 | igual |
| POR | §2.1 L92–93 | Ligar até 24 letras; validador avisa | conteudo.md §4.8 | igual |
| POR | §2.1 L94–95 | emoji com desenho; emoji novo avisado no retorno | conteudo.md §4.9 | igual |
| POR | §2.1 L96–101 | validar com `montar-portugues.js --parcial` + `validar-conteudo.js --materia` | conteudo.md §4.11 | atualizada: `validar-conteudo.js --materia` aceita a sala ou a matéria copiada para /tmp |
| POR | §2.2 L103–116 | formato do `rascunho/portugues-base.js` (livro e unicórnios) | conteudo.md §2.2–2.3 | atualizada: livro em `portugues/livro.js` (`registrarLivro`); unicórnios em `portugues.js` |
| POR | §2.2 L117–118 | ids e ordem das cartas | conteudo.md §6.4 | igual |
| POR | §2.2 L120–136 | tabela dos unicórnios (ids fixos) | conteudo.md §6.5 | igual |
| POR | §2.2 L138 | épicos e lendário com `asa` | conteudo.md §6.5 | igual |
| POR | §3 L140–150 | personagens do Português (ids, nomes, onde, ações) | npcs-e-dialogo.md §5 | igual (ELENCO em `elenco.js`) |
| POR | §3 L152–153 | opções de sprite `chef`, `quepe` (+`chapeuCor`), `nariz` | npcs-e-dialogo.md §5.1 | igual (em `npcs-cabeca.js`) |
| POR | §3 L154 | personagens não imitam pessoas reais | npcs-e-dialogo.md §5.2 | igual |
| POR | §4 L156 | extensões aditivas: sem os campos, tudo igual | conteudo.md §3.6 | igual |
| POR | §4.1 L158–165 | texto de apoio (formato, caixa, 🔊, segmentosApoio, pacote) | conteudo.md §3.3; som-musica-e-voz.md §4.10 | igual |
| POR | §4.2 L167–168 | `colado: true` | conteudo.md §3.4 | igual |
| POR | §4.2 L169–170 | `frases[i].img`/`alt`, ❓ sem desenho, grade compacta | conteudo.md §3.4 | igual |
| POR | §4.2 L171–173 | `frases[i].aceitas` | conteudo.md §3.4 | igual |
| POR | §4.3 L174–182 | tipo `copiar` (formato, peças, valor, pronto, pontuação) | conteudo.md §3.5 | igual |
| POR | §4.4 L184–186 | onde: desafios.js, provas.js, `css/ui-jogo.css`, validar-conteudo; História/Inglês idênticas | conteudo.md §1, §3.6, §5.3 | atualizada: tipos em `atividades/desafios/<tipo>.js`, estilos em `css/ui-desafios.css` |
| POR | §5 L188–190 | prova `portugues-3bim` (ids, nome, bimestre, questões) | conteudo.md §8.1 | igual |
| POR | §5 L191–192 | acessórios da prova | conteudo.md §8.2 | igual |
| POR | §5 L193–194 | figuras `palavra:<nome>` 32×32 | conteudo.md §8.3 | atualizada: ícones em `icones/<lote>.js` |
| POR | §5 L197–198 | título escrito à mão vai no texto de apoio ("ponto para o Leandro") | conteudo.md §8.4 | igual (o aviso ao Leandro era da rodada) |
| POR | §5 L199–200 | questão 8: e) a g), sem h) | conteudo.md §8.4 | igual |
| POR | §5 L201 | "13.e)" vira "e)" | conteudo.md §8.4 | igual |
| POR | §5 L202–204 | aceitas 12a/12c; não aceitas 8e/8g/12f; NI_O aceita ninho e nicho | conteudo.md §8.4, §6.6 | igual |
| POR | §6 L207–208 | desenho de fora `Mapa.PREDIOS.palavras` registrado pelo prédio; a placa não cobre os vizinhos | interiores.md §9.5.1 | atualizada: em `portugues/fora.js`; a regra da placa caiu com as placas do mapa (BFM §7) |
| POR | §6 L209–211 | interior (falas + portugues.js), ids, pacote, objetos `portugues-<nome>` | interiores.md §9.5.2 | atualizada: prédio dividido em partes (`objetos-*.js`, `fora.js`) |
| POR | §6 L212–214 | cômodos, rico, objetos da apostila, quadro do raro | interiores.md §9.5.3 | igual |
| POR | §6 L215–216 | `CAVALEIROS.portugues`, `TEMAS.portugues`, `PROFESSORES['portugues-3bim']`, falas nos prédios | interiores.md §9.5.4 | igual |
| POR | §6 L217–218 | falas fixas do Claude que citam só História: genéricas ou na matéria certa | npcs-e-dialogo.md §8.3 | igual |
| POR | §7 L221–222 | pacotes do Português | som-musica-e-voz.md §4.4 | igual |
| POR | §7 L222 | 30 letras por página, 3+ palavras | som-musica-e-voz.md §5.1–5.2 | igual |
| POR | §7 L222–223 | gravação e transcrição só pelo orquestrador; amostras 37–44 | som-musica-e-voz.md §5.4, §4.11 | igual |
| POR | §8 L225–235 | arquivos e donos da Fase 1 | — | removida: histórico de quem fez o quê |
| POR | §8 L237 | servidor de teste `127.0.0.1:8789/?debug=1` | README.md §5.3; save-e-mescla.md §9.3 | atualizada: `servidor-teste.js` (porta livre, banco em /tmp) |
| POR | §8 L237–238 | saves sintéticos no scratchpad (`sem-portugues`, `portugues-metade`, `prova-premiada`) | README.md §5.5; save-e-mescla.md §9.3 | atualizada: saves sintéticos gerados por `ferramentas/testes/saves.js` |

## CONTRATOS-BANHO-FOTOS-MUSICA.md
| contrato antigo | seção/linha | regra (resumo curto) | onde está agora | situação |
|---|---|---|---|---|
| BFM | cab. L1–5 | título, branch/worktree, estende os outros, mudança só pelo orquestrador | README.md (cabeçalho) | removida: narrativa da rodada; a regra do orquestrador ficou no README |
| BFM | cab. L7–8 | convenções de sempre, sem imagens | README.md §2 | igual |
| BFM | cab. L8–9 | todo emoji com ícone; lista de quais já existiam (🦆 e 📥 não) | README.md §2.5 | atualizada: ícones em `icones/<lote>.js`; a lista pontual era da rodada (confira em `icones.html`) |
| BFM | cab. L10–11 | animações/reduced-motion; texto pt-BR carinhoso; 30 letras; 3+ palavras | README.md §2.6–2.7; som-musica-e-voz.md §5 | igual |
| BFM | §0 L13–23 | arquivos e donos da Fase 1 | — | removida: histórico de quem fez o quê |
| BFM | §0 L25–26 | ordem nova dos scripts | README.md §3 | atualizada: ordem no manifesto |
| BFM | §0 L27 | CSS novo `ui-fotos.css` | README.md §3.5; fotos.md §1 | atualizada: lista de CSS no manifesto |
| BFM | §0 L27–28 | musicas/fotos/banho não tocam DOM/canvas/PA/Progresso/Cena no carregamento | README.md §3.6 | atualizada: vale para todo `node: true`; banho.js citado à parte (não é `node: true`) |
| BFM | §1 L32 | não mudam chaveSave/v/geracao/ciclo/formato/regras | save-e-mescla.md §2.1–2.2 | igual |
| BFM | §1 L36–38 | campos `banho` (ausente = 100) e `acaoBanho` | save-e-mescla.md §3, §3.1–3.2 | igual |
| BFM | §1 L40–41 | `acao` não muda de sentido; banho não mexe nele | save-e-mescla.md §3, §3.5 | igual |
| BFM | §1 L42–47 | mescla do banho (um lado, os dois, nenhum) | save-e-mescla.md §4.2 | igual |
| BFM | §1 L48–49 | normalização do banho (ausente continua ausente; `acaoBanho` inválido apagado) | save-e-mescla.md §6.3, §6.7 | igual |
| BFM | §1 L50–51 | "trouxe algo": `acaoBanho` conta, `banho` não | save-e-mescla.md §7.3 | igual |
| BFM | §1 L52–53 | cópia `-novidades` leva o banho; filtro fome/sede/em | save-e-mescla.md §5.4 | igual |
| BFM | §1 L54 | Novo ciclo mantém, Apagar tudo zera | save-e-mescla.md §8.1 | igual |
| BFM | §2 L57–70 | API dos cuidados com banho (niveis, baixo, icone, sujo, fatorVelocidade, banhar, avancar, depurar, frases, vozDaFrase) | cuidados.md §2 | igual |
| BFM | §2 L71–72 | ritmo do banho 180 min, mesmas condições; cruzar 25 grava | cuidados.md §3.3, §4.1 | igual |
| BFM | §2 L73–74 | lembrete do banho só sem fome/sede baixas | cuidados.md §5.3 | igual |
| BFM | §3 L77–78 | banheira interativa `acao: banho`, `registrarAcao('banho')`, de graça, anda até ela | cuidados.md §7.1 | igual (registro em `petshop/acoes.js`) |
| BFM | §3 L79–80 | API `Reino.Banho` (itensDesenho que o main.js junta) | cuidados.md §7.2; cena-e-motor.md §5 | atualizada: quem junta é `motor/laco.js` (main.js dividido) |
| BFM | §3 L81–83 | `Cena.ocupar/liberar('banho')`; pular depois de 2 s | cuidados.md §7.3–7.4; cena-e-motor.md §2 | igual |
| BFM | §3 L84–87 | fases (~6 s) e versão curta sem animações | cuidados.md §7.5–7.6 | igual |
| BFM | §3 L88–89 | montada desce só no desenho; bebê vai sozinho | cuidados.md §7.7 | igual |
| BFM | §3 L90–91 | fim: `banhar`, fala `banhou`, libera; barra cheia: `jaLimpinho` | cuidados.md §7.8 | igual |
| BFM | §3 L92 | sons bolhas/esfregar/chuveiro/sacudida | cuidados.md §7.9; som-musica-e-voz.md §2.1 | igual |
| BFM | §3 L93–94 | sujinho (manchinhas, poeira); ícone 🛁 de `iconeMontaria` | cena-e-motor.md §7.5–7.6 | igual |
| BFM | §3 L95–96 | falas da Dona Aveia sobre banho; guia menciona a banheira | cuidados.md §7.10, §6.1 | igual |
| BFM | §4 L99–103 | Observatório de galáxia (paleta, Via Láctea, halos, estrelas, cadente 8–15 s, pré-render, ≤~80 partículas, parado sem animações, legível) | interiores.md §9.4.6–9.4.7 | igual |
| BFM | §5 L106–113 | API `Reino.Fotos` | fotos.md §2 | igual |
| BFM | §5 L115–117 | captura só `#reino`, quadro limpo sem íris, escala inteira ≤ maxLado, moldura e carimbo, PNG | fotos.md §3 | igual |
| BFM | §5 L118–119 | prévia com 3 botões; nome do download | fotos.md §4.1, §4.3 | igual |
| BFM | §5 L120–122 | álbum IndexedDB próprio, 40 fotos, nunca no save; sem IndexedDB só salvar | fotos.md §5 | igual |
| BFM | §5 L123 | nunca pedir câmera | fotos.md §3.4 | igual |
| BFM | §5 L124–125 | botão 📷 no HUD, toque/toque longo, desabilitado | fotos.md §6.1 | igual (em `ui/hud.js`) |
| BFM | §6 L128–133 | `Reino.Musicas` e formato de faixa/seção (topo de musicas.js) | som-musica-e-voz.md §3.1–3.2 | igual |
| BFM | §6 L134–135 | `renderizarFaixa` | som-musica-e-voz.md §3.3 | igual |
| BFM | §6 L136 | conferência `testar-musicas.js` | som-musica-e-voz.md §8 | igual |
| BFM | §6 L137–138 | cada faixa ≥20 s, ≥2 seções, sem loop curto, emenda sem estalo | som-musica-e-voz.md §3.4 | igual |
| BFM | §6 L139–142 | ambientes → faixa; treino e prova em silêncio; interior sem faixa = mapa | som-musica-e-voz.md §3.5–3.6 | igual |
| BFM | §6 L143–145 | motor (agendador, ganho próprio, compressor, crossfade, 30% com voz, pausa escondida) | som-musica-e-voz.md §3.9 | igual |
| BFM | §6 L146–147 | `Som.musica(ligar)`, padrão desligado; som desligado não cala música | som-musica-e-voz.md §3.11, §2.2 | igual |
| BFM | §6 L148 | `musicaAtual()` | som-musica-e-voz.md §3.12 | igual |
| BFM | §6 L149 | sons novos em SONS | som-musica-e-voz.md §2.1 | igual |
| BFM | §7 L152–153 | placas do mapa saem (desenho, toque, desvio, código morto); `placa` sem uso | cena-e-motor.md §9.1 | igual |
| BFM | §7 L154 | fica: toque no prédio, arco-íris, placas dos cômodos | cena-e-motor.md §9.2 | igual |
| BFM | §7 L155–156 | menu Lugares mostra os avisos | cena-e-motor.md §9.3 | igual |
| BFM | §7 L157 | 3ª barrinha (banho) no HUD, no Estábulo e ícone nas baias | cuidados.md §8.1, §8.3; interiores.md §9.1.2 | igual |
| BFM | §8 L160–162 | servidor de teste próprio (porta dele, banco temporário, PID, nunca pkill) | README.md §5.3, §5.6; save-e-mescla.md §9.3 | atualizada: `servidor-teste.js` (porta livre, banco em /tmp) |
| BFM | §8 L163–164 | Playwright `/tmp/reino-banho-pw/abrir.js` e saves em /tmp | README.md §5.4–5.5 | atualizada: `ferramentas/testes/navegador.js` e `saves.js` |
| BFM | §8 L165–166 | ganchos de debug (avancarJogo, cuidados, banho, animacaoBanho, musicaAtual, fotos, tempoQuadro) | cena-e-motor.md §12 | igual |
| BFM | D1 L169–170 | `acao` só de comer/beber; banho com `acaoBanho` | save-e-mescla.md §3.5 | igual |
| BFM | D2 L171 | `banho` ausente continua ausente | save-e-mescla.md §6.3, §3.2 | igual |
| BFM | D3 L172–173 | banho usa `Cena.ocupar/liberar` para o canvas seguir desenhando | cena-e-motor.md §2.2 | igual |
| BFM | D4 L174–175 | música decide o ambiente pela cena, nado e tela do topo | som-musica-e-voz.md §3.7 | igual |
| BFM | D5 L206 | portas de teste fixas por agente (8791–8797) | README.md §5.3 | atualizada: `servidor-teste.js` escolhe porta livre |
| BFM | D6 L176–178 | fotos: prévia descarta com ✕/Esc; Apagar não pergunta; avisos só por voz; escala inteira; margens escuras | fotos.md §4.2, §4.4, §3.2 | igual |
| BFM | D7 L179–180 | Álbum fora do menu de baixo; 📷 embaixo/ao lado da tela cheia | fotos.md §6.2 | igual |
| BFM | D8 L181–184 | banheira como bebedouro, tile (21,7), toques ignorados com temporizador de segurança, frase `banhou`, "Precisa de banho" | cuidados.md §7.1, §7.3, §7.8, §6.1 | igual |
| BFM | D9 L185 | carregar/comer/beber não cria `banho` | save-e-mescla.md §3.2 | igual |
| BFM | D10 L186–189 | `.tela-prova` em qualquer lugar = silêncio; 250 ms firmes; continua de onde parou; `portugues-gelo`; volume | som-musica-e-voz.md §3.5–3.6, §3.8, §3.10 | igual |
| BFM | D11 L190–191 | piso de galáxia clara (contraste ≥ 2,9), ~78 partículas, Planetário clareado | interiores.md §9.4.7–9.4.8 | igual |
| BFM | D12 L192–193 | `UI.avisosDoLugar`; `placa` sem uso; `desenharTela` vazio; evento `'transicao'` | cena-e-motor.md §9.1, §9.3, §2 | igual |
| BFM | D13 L194–195 | interruptores leem `P.estado().ajustes` na hora do toque | save-e-mescla.md §8.3 | igual |
| BFM | D14 L196–197 | blocos do HUD de cima com `pointer-events: none` | loja.md §6.9; fotos.md §6.3 | igual |
| BFM | D15 L198–199 | maiúscula acentuada com a fonte reserva sai deslocada; fora do escopo, não mexido | README.md §2.9 | igual |
| BFM | D16 L200–202 | rampas sem `cancelAndHoldAtTime`, exponenciais 0,6/0,8 s; tiques 48 por batida; brecha conhecida | som-musica-e-voz.md §3.10, §3.4 | igual |
| BFM | D17 L203–204 | `Mapa.PREDIOS_ANIM[sprite]` na camada animada | cena-e-motor.md §9.5 | igual |
| BFM | D18 L205 | download no mapa `reino-dos-unicornios-<data>.png` | fotos.md §4.3 | igual |

## Títulos de seção e linhas de ligação
Os títulos não têm regra própria; os caminhos de arquivo que citavam foram conferidos e atualizados.
| contrato antigo | seção/linha | regra (resumo curto) | onde está agora | situação |
|---|---|---|---|---|
| INT | L56, L78, L88 | títulos: transição em íris, ordem de desenho, interface de cena | cena-e-motor.md §4, §5, §6 | igual |
| INT | L123 | título: Jogador em `js/personagens/jogador.js` | cena-e-motor.md §1, §7 | atualizada: desenho em `jogador-desenho.js` |
| INT | L131 | título: interiores em `js/motor/interiores.js` | interiores.md §1 | atualizada: motor dividido em `motor/interiores-*.js` |
| INT | L149, L191, L212, L225 | títulos: formato, biblioteca, extensões, desenho e desempenho | interiores.md §3, §5, §6 | igual |
| INT | L233 | título: critério de "rico" conferido por `validar-interiores.js` | interiores.md §7 | igual |
| INT | L240 | título: NPCs em `js/personagens/npcs.js` | npcs-e-dialogo.md §1 | atualizada: NPCs divididos em `npcs*.js` + `elenco.js` |
| INT | L309 | "as mesmas funções de hoje, regras intactas" | npcs-e-dialogo.md §6 (título) | igual |
| INT | L320 | título: diálogo em `js/personagens/claude.js` | npcs-e-dialogo.md §1, §8 | igual |
| INT | L339, L350, L357, L373, L380, L384 | títulos: vozes, extras, convenções dos prédios (fases), lições de voz, save, depuração | som-musica-e-voz.md §4–5; cena-e-motor.md §2, §12; interiores.md §8; save-e-mescla.md §2 | igual (as "fases" eram narrativa) |
| NOV | L29 | título: save em `js/sistemas/progresso.js` | save-e-mescla.md §1 | atualizada: progresso dividido em `progresso*.js` |
| NOV | L48, L85, L395 | subtítulos: mescla, sincronização, curiosidades | save-e-mescla.md §4, §7; npcs-e-dialogo.md §9.6 | igual |
| NOV | L105, L201, L244 | títulos: cuidados.js, loja-itens.js, surpresa.js | cuidados.md §1; loja.md §1; surpresa.md §1 | igual (surpresa dividida em `surpresa.js` + `surpresa-painel.js`) |
| NOV | L199, L305, L356, L440, L453, L457 | títulos: loja, Pet Shop, Observatório, vozes, depuração, desempenho | loja.md; interiores.md §9.3–9.4; som-musica-e-voz.md §4; cena-e-motor.md §11–12 | igual |
| NOV | L232 | título: enfeites em `js/arte/pixelart.js` | loja.md §1 | atualizada: `pixelart-unicornio-moldes.js` e `pixelart-unicornio.js` |
| NOV | L414 | título: extensões em `js/personagens/npcs.js` | npcs-e-dialogo.md §1, §7 | atualizada: em `npcs-conversa.js`, `npcs-status.js`, `npcs-sprites.js` |
| NOV | L490 | título: guarda de toque em ui.js, vale para toda tela que gasta | loja.md §1, §6 | atualizada: em `ui/base.js` (e `ui/loja.js`) |
| POR | L7, L18 | títulos: regras para todo mundo; fotos | README.md §4–5; conteudo.md §7 | igual |
| POR | L157, L166 | títulos: texto de apoio; campos novos do `completar` | conteudo.md §3.3–3.4 | igual |
| POR | L183 | título: onde (arquivos do motor) | conteudo.md §1 | atualizada: ver linha §4.4 acima |
| POR | L196 | notas da leitura da folha pelo orquestrador | conteudo.md §8.4 | igual |
| POR | L206, L220 | títulos: prédio; vozes | interiores.md §9.5; som-musica-e-voz.md §4 | igual |
| BFM | L30, L33 | título do banho no save; "dois campos, só aditivos" | save-e-mescla.md §3 | igual |
| BFM | L56, L76 | títulos: banho nos cuidados; banheira (banho.js, petshop.js) | cuidados.md §1, §7 | atualizada: banho em `banho.js` + `banho-desenho.js`; ação em `petshop/acoes.js` |
| BFM | L98, L105, L127 | títulos: Observatório de galáxia; fotos; música | interiores.md §9.4; fotos.md §1; som-musica-e-voz.md §1 | atualizada: fotos em `fotos*.js`, som em `som*.js` e `musicas-faixas.js` |
| BFM | L151 | título: placas removidas (cena.js, ui/ui.js) | cena-e-motor.md §9 | atualizada: avisos em `ui/lugares.js` |
| BFM | L159, L168 | títulos: teste; decisões | README.md §5; linhas D1–D18 acima | igual |

## Totais
| contrato antigo | linhas da tabela | igual | atualizada | removida |
|---|---|---|---|---|
| `CONTRATOS-INTERIORES.md` | 103 | 85 | 16 | 2 |
| `CONTRATOS-NOVIDADES.md` | 125 | 106 | 17 | 2 |
| `CONTRATOS-PORTUGUES.md` | 68 | 48 | 17 | 3 |
| `CONTRATOS-BANHO-FOTOS-MUSICA.md` | 74 | 61 | 11 | 2 |
| total | 370 | 300 | 61 | 9 |

Conferência de cobertura: toda linha não vazia de cada contrato antigo (fora `}` e cercas de código) está em alguma faixa de linhas acima.
