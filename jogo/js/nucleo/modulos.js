/* Registro dos módulos (sistemas como cuidados, surpresa, fotos, banho): cada sistema chama
   Reino.registrarModulo(def) no próprio arquivo e o núcleo percorre Reino.modulos, na ordem de registro
   (= ordem do manifesto). Sistema novo = arquivos na pasta dele + linhas no manifesto; nada em main.js,
   laco.js, falas.js nem debug.js. Contrato: docs/contratos/cena-e-motor.md ("Módulos (sistemas)").
   Ganchos (todos opcionais):
     iniciar(ctx)              ao entrar no Reino, ANTES das boas-vindas/tutorial (ex.: fome e sede)
     depoisDasBoasVindas(ctx)  ao entrar no Reino, DEPOIS de começar o tutorial (ex.: pergunta surpresa)
       ctx = { novo, tutorial } (tutorial: promessa do tutorial da primeira vez, ou null)
       São dois ganchos porque a ordem das chamadas é a de antes (o modo determinístico depende dela).
     falas()                   [{ texto, voz?, pacote? }] para o pacote de vozes (padrão 'claude', 'geral')
     depurar()                 o estado para os testes: __reino.modulo(id)
     acoes                     { tipo: fn(acao, ctx) → Promise }: ações de objeto/NPC ({ tipo: 'assar' }) que o
                               sistema oferece aos prédios (o NPCs.registrarAcao ainda não existe quando ele carrega);
                               a conversa procura aqui depois das de registrarAcao, e o validar-interiores as aceita
     camada                    desenho por cima do mapa/interior no quadro (js/motor/laco.js):
       { ativo(), itensDesenho(pintor, t, animar) → itens ordenados por y, sobre?(ctx, pintor, t, animar) }
   Registrar só guarda funções: nada de DOM, Progresso ou Cena no carregamento (node: true). */
window.Reino = window.Reino || {};

/** @type {ModuloDef[]} */
Reino.modulos = [];
/** @param {ModuloDef} def */
Reino.registrarModulo = function (def) { Reino.modulos.push(def); };
/** @param {string} id @returns {ModuloDef | undefined} */
Reino.modulo = function (id) { return Reino.modulos.find(function (m) { return m.id === id; }); };
