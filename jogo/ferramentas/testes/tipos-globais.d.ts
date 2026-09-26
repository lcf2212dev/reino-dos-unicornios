// Declarações de ambiente para o `npm run tipos` (jogo/ferramentas/testes/tipos.js): as globais que os
// scripts clássicos do jogo compartilham pelo window. Tudo `any` por enquanto; quando um módulo ganhar
// tipos de verdade (JSDoc no jogo), troque o `any` dele aqui por um tipo (ex.: `util: ReinoUtil`).

/** Tudo o que os arquivos registram em window.Reino (config, util, materias, Progresso, UI…). */
interface ReinoGlobal {
  [nome: string]: any;
  config?: any;
  util?: any;
  materias?: any[];
  provas?: any[];
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
}
