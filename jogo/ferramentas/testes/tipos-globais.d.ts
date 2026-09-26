// Declarações de ambiente para o `npm run tipos` (jogo/ferramentas/testes/tipos.js): as globais que os
// scripts clássicos do jogo compartilham pelo window. As FORMAS (EstadoSave, Materia, Sala, Desafio, Prova,
// InteriorDef, Npc, Fala, ItemLoja, Musica…) moram em tipos-jogo.d.ts, puxado pela linha abaixo.
// Módulo ainda sem tipo fica `any` (pela assinatura de índice); quando ganhar tipo, declare-o aqui.
// Os membros são opcionais porque cada arquivo registra o seu ao carregar (a ordem é a do manifesto).
/// <reference path="tipos-jogo.d.ts" />

/** Tudo o que os arquivos registram em window.Reino (config, util, materias, Progresso, UI…). */
interface ReinoGlobal {
  [nome: string]: any;
  config?: any;
  util?: any;
  // js/nucleo/registros.js
  materias?: Materia[];
  registrarMateria?(m: Materia): void;
  materia?(id: string): Materia | undefined;
  provas?: Prova[];
  registrarProva?(p: Prova): void;
  prova?(id: string): Prova | undefined;
  // js/nucleo/eventos.js
  EVENTOS?: EventosReino;
  // js/conteudo/materias/registro.js
  registrarSala?(materiaId: string, sala: Sala): void;
  registrarLivro?(materiaId: string, cartas: CartaLivro[]): void;
  salasDa?(materiaId: string): Sala[];
  livroDa?(materiaId: string): CartaLivro[];
  // js/conteudo/loja-itens.js
  LojaItens?: LojaItensApi;
  // js/sistemas/progresso*.js
  Progresso?: ProgressoApi;
  _progresso?: ProgressoInterno;
  // js/sistemas/musicas-faixas.js e musicas.js
  _musicas?: { faixas: { [id: string]: Musica } };
  Musicas?: MusicasApi;
  // js/sistemas/falas.js
  Falas?: FalasApi;
  // js/personagens/ (npcs.js cria; elenco.js põe o ELENCO)
  NPCs?: NpcsApi;
  /** o que as partes de cada prédio dividem (js/interiores/<prédio>/; interno) */
  _predios?: { [predio: string]: any };
  // js/motor/interiores-base.js
  interiores?: InteriorDef[];
  registrarInterior?(def: InteriorDef): void;
}

declare var Reino: ReinoGlobal;
/** Mapa do reino (js/mundo/). */
declare var Mapa: any;
/** A Mariana no mapa (js/personagens/jogador.js). */
declare var Jogador: any;
/** Pixel art (js/arte/pixelart*.js). */
declare var PA: any;

interface Window {
  Reino: ReinoGlobal;
  Mapa: any;
  Jogador: any;
  PA: any;
  /** Modo determinístico (?debug=1&congelar=1, js/nucleo/congelar.js). */
  __congelar?: any;
  /** Depuração (?debug=1, js/debug.js). */
  __reino?: any;
  /** Publicado no claude.ai: capacidades do artifact (window.claude.use('db')). */
  claude?: any;
  /** Safari antigo (js/sistemas/som.js, som-musica.js). */
  webkitAudioContext?: any;
  webkitOfflineAudioContext?: any;
}
