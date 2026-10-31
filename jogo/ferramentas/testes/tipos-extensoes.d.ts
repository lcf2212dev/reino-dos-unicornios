// Formas das APIs de extensão (para o `npm run tipos`): o que uma feature nova entrega aos registros do motor.
// Puxado por tipos-globais.d.ts, como tipos-jogo.d.ts. Um bloco por registro; contrato citado em cada um.
// Mapa "quero X → faço Y": docs/ARQUITETURA.md §5.1.

/* ---------- lugares (Reino.registrarLugar, js/nucleo/registros.js; interiores.md §9.7) ---------- */
/** Linha do menu Lugares de um tipo de lugar (ui/lugares.js). */
interface MenuLugar {
  emoji: string | ((l?: any) => string);
  /** texto pequeno embaixo do nome */
  info?(l?: any): string;
  /** os avisos (chips) da linha */
  avisos?(l?: any): { texto: string; icone?: string; tipo: string }[];
  /** abre a tela própria do lugar (sem ela, só o interior) */
  abrir?(l?: any): any;
}

/** Lugar novo no mapa, registrado pelo prédio (Reino.registrarLugar em nucleo/registros.js). */
interface LugarRegistrado {
  id: string;
  /** a placa */
  nome: string;
  /** chave de Mapa.PREDIOS */
  sprite: string;
  /** em tiles; a porta fica no meio da última linha */
  rect: Retangulo;
  placa?: 'acima' | 'direita';
  /** tiles [x, y] de rua da rua até a frente da porta (obrigatório) */
  caminho: [number, number][];
  /** cerquinha com portão na fileira da frente (depois do sorteio; mundo/mapa.js) */
  cerca?: boolean;
  menu?: MenuLugar;
}

/* ---------- módulos (js/nucleo/modulos.js) ---------- */
/** Uma fala de módulo para o pacote de vozes (voz padrão 'claude', pacote padrão 'geral'). */
interface FalaModulo { texto: string; voz?: string; pacote?: string }
/** O que um sistema entrega a Reino.registrarModulo. */
interface ModuloDef {
  id: string;
  iniciar?(ctx: { novo: boolean; tutorial: Promise<any> | null }): void;
  depoisDasBoasVindas?(ctx: { novo: boolean; tutorial: Promise<any> | null }): void;
  falas?(): FalaModulo[];
  depurar?(): any;
  /** ações de objeto/NPC que o sistema oferece aos prédios (npcs-conversa.js procura aqui) */
  acoes?: { [tipo: string]: (acao: any, ctx: any) => any };
  camada?: {
    ativo(): boolean;
    itensDesenho(pintor: any, t: number, animar: boolean): any[];
    sobre?(ctx: CanvasRenderingContext2D, pintor: any, t: number, animar: boolean): void;
  };
}

/* ---------- campos do save (Reino.Progresso.registrarCampo; save-e-mescla.md §11) ---------- */
/** Campo NOVO do save, declarado uma vez com Reino.Progresso.registrarCampo(nome, def)
 *  (js/sistemas/progresso-campos.js; contrato save-e-mescla.md §11). */
interface CampoSave {
  /** valor de um save que não tem o campo (estadoNovo, completar, "Apagar tudo") */
  padrao(): any;
  /** estratégia do catálogo ou função própria (a, b já limpos; `a` = o lado mais recente, ganha o empate) */
  mesclar: 'contadores' | 'carimbo' | 'uniao' | 'maior' | ((a: any, b: any) => any);
  /** saneamento extra, depois do da estratégia (entrada hostil); undefined = volta ao padrão */
  limpar?(v: any): any;
  /** "Novo ciclo" mantém o valor ou volta ao padrão */
  novoCiclo: 'mantem' | 'zera';
  /** entra na cópia -novidades (em `campos`) */
  copiaSeguranca?: boolean;
  /** dois valores de exemplo [a, b] para os testes de contrato (obrigatório com mesclar próprio) */
  exemplos?: [any, any];
}

/** Uma estratégia do catálogo de mescla (progresso-campos.js). */
interface EstrategiaMescla {
  /** entrada hostil vira o formato certo; undefined = inválido */
  limpar(v: any): any;
  /** junta os dois lados já limpos sem mudar nenhum; `base` ganha o empate */
  juntar(base: any, outro: any): any;
  /** dois valores de exemplo no formato do padrão, para os testes de contrato */
  exemplos(padrao: any): [any, any];
}

/* ---------- tipos de desafio (Reino.registrarTipoDesafio, js/atividades/desafios.js; conteudo.md §3.7) ---------- */
/** Um tipo de desafio: Reino.registrarTipoDesafio(tipo, def) em js/atividades/desafios/<tipo>.js (conteudo.md §3.7). */
interface TipoDesafioDef {
  /** a tela (DOM só aqui): o controle { el, valor, pronto, conferir, … }; pontuar: 0 a 1 (sem ele, 0) */
  montar(d: any, opts: any): any;
  pontuar?(d: any, valor: any): number;
  /** treino; sorteio da missão (especial: até 2 tipos por missão); pista: nome em Falas.fixas; campos só deste tipo */
  treinavel?: boolean; especial?: boolean; semprePrimeiro?: boolean; noFim?: boolean; pista?: string; campos?: string[];
  /** enunciado em texto e na tela (sem eles: d.pergunta); textos da correção; texto a mais da fala e da prova */
  enunciado?(d: any): string; enunciadoTela?(d: any): any[];
  textoCerto?(d: any): string; textoResposta?(d: any, valor: any): string;
  textoFala?(d: any): string; textoProva?(d: any): string;
  /** 🔊: recebe [pergunta, instrucao?] e devolve a lista lida; todos(lista) = índices na ordem da tela */
  falas?(d: any, todos: (lista: any[]) => number[], segs: string[]): string[];
  /** prova: ordem preparada uma vez; elemento a mais na correção (com ele, a lista da correção aparece sempre) */
  prepararProva?(d: any): any; extraCorrecao?(d: any, valor: any): any;
  /** validador (Node, sem DOM) */
  /** teste de unidade: um desafio sintético do tipo, a resposta certa de QUALQUER desafio do tipo (sem pontuar,
   *  não tem) e respostas estranhas no formato do tipo (erradas/vazias: não quebram, nota de 0 a 1) */
  exemplos?: { desafio: any; certa?(d: any): any; estranhos: any[] };
  validar?(d: any, v: { checar(cond: any, msg: string): void; avisar(msg: string): void; naProva: boolean; icones: { [nome: string]: any }; textoOk(t: any): boolean }): void;
}

/* ---------- personagens (Reino.registrarPersonagem, js/nucleo/registros.js; npcs-e-dialogo.md §5) ---------- */
/** Personagem declarado fora do elenco.js (Reino.registrarPersonagem): voz 'npc-<id>' com o perfil junto. */
interface PersonagemRegistrado {
  id: string;
  nome: string;
  sprite: SpriteNpc;
  paraMateria?: string;
  paraProva?: string;
  perfil?: PerfilVoz;
  /** no interior do prédio `predio` (Reino.personagensDoPredio): tile x, y e a ação (sem ela, o <p>.js decide) */
  predio?: string;
  x?: number;
  y?: number;
  acao?: AcaoNpc;
  /** outros interiores onde a mesma pessoa aparece (mesma voz; ver Reino.personagemTambemEm) */
  lugares?: LugarPersonagem[];
}
/** reserva de personagem (Reino.reservarPersonagem): o contrato de um NPC antes das frentes que o constroem
    (docs/contratos/plano-paralelo.md §2) */
interface ReservaPersonagem {
  id: string;
  nome: string;
  genero: 'f' | 'm';
  idade: 'crianca' | 'jovem' | 'adulto' | 'idoso';
  perfil?: PerfilVoz;
  predio?: string;
  x?: number;
  y?: number;
  acao?: AcaoNpc;
  /** true depois do registrarPersonagem que a preenche */
  preenchida?: boolean;
}
/** um lugar de um personagem registrado: o interior, o tile e a ação */
interface LugarPersonagem { predio: string; x?: number; y?: number; acao?: AcaoNpc; }

/* ---------- casa do jogador (Reino.registrarKitCasa, js/nucleo/registros.js; casa.md) ---------- */
/** Direção de um móvel da casa: 'baixo' = de frente (o desenho da biblioteca), 'esq'/'dir' = de lado (pegada w↔h). */
type DirCasa = 'baixo' | 'cima' | 'esq' | 'dir';
/** Um item de um kit: `objeto` é o tipo da biblioteca (Reino.Interiores.objeto) que desenha as direções. */
interface ItemKitCasa {
  id: string;
  nome: string;
  objeto: string;
  /** quantas peças iguais o kit traz (padrão 1) */
  qtd?: number;
  /** 4 = baixo/esq/cima/dir; 2 = baixo/esq; 1 = não gira */
  direcoes: 1 | 2 | 4;
  /** pendurado: só nas 2 fileiras da parede do fundo, não gira */
  parede?: boolean;
}
/** Um kit de móveis (casa.md §3). nome aceita {nome}, {a|b} e {uni}. */
interface KitCasaDef {
  id: string;
  nome: string;
  /** objeto da biblioteca desenhado como capa do kit na tela de escolha */
  capa: string;
  /** cômodo onde ele combina (só sugestão: os itens vão em qualquer cômodo) */
  comodo: string;
  itens: ItemKitCasa[];
}
/** Interior que o jogador decora (casa.md §4): o validador dispensa o critério de "rico" e a cena soma os móveis do save. */
interface InteriorDef {
  decoravel?: boolean;
  objetosExtras?(P: any): ObjetoInterior[];
}
