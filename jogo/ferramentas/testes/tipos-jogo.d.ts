// As FORMAS do jogo (save, conteúdo, interiores, NPCs, falas, loja, músicas, eventos), para o `npm run tipos`.
// Só o TypeScript lê este arquivo (é puxado por tipos-globais.d.ts); o jogo NÃO carrega nada daqui e
// continua sem build. Os arquivos do jogo usam estes nomes nos comentários JSDoc:
//   /** @param {Materia} m */   /** @returns {EstadoSave} */   /** @type {Object<string, Musica>} */
// Os nomes são globais (este arquivo não tem import/export). Forma nova ou campo novo: acrescente aqui,
// junto do contrato em docs/contratos/, e rode npm run tipos.
// Regra: o tipo descreve o que o jogo JÁ faz. Se um tipo não bate com o código ou os dados, o tipo é que
// está errado (ou há um bug: anote, não mude o jogo para agradar o TypeScript).

/* ============================ SAVE (docs/contratos/save-e-mescla.md) ============================ */

/** O estado salvo da Mariana (Reino.Progresso.estado(); localStorage `mariana-reino-v1`, servidor e doc
 *  progresso/mariana). Criado por estadoNovo() em js/sistemas/progresso.js. Dinheiro e prêmios são
 *  DERIVADOS disto, nunca guardados. Valores que vêm de fora podem estar estragados: completar() e
 *  normalizarNovos() arrumam, e as regras de mescla toleram (ver o contrato). */
interface EstadoSave {
  /** versão do formato (sempre 1) */
  v: number;
  /** sobe a cada "Apagar tudo"; na mescla, a geração maior vence inteira */
  geracao: number;
  /** ciclo de provas; "Novo ciclo" sobe e zera salas, treinos e pago */
  ciclo: number;
  /** carimbos Date.now() */
  criado: number;
  atualizado: number;
  /** já passou da tela de entrada */
  comecou: boolean;
  /** cores da Mariana (PA.APARENCIA_PADRAO) */
  aparencia: Aparencia;
  /** cor do unicórnio inicial (Reino.Unicornios.CORES_INICIAIS) */
  corInicial: string;
  /** salaId → registro */
  salas: { [salaId: string]: RegSala };
  /** materiaId → registro do treino no Castelo */
  treinos: { [materiaId: string]: RegTreino };
  /** provaId → registro da prova bimestral (não zera no novo ciclo) */
  provas: { [provaId: string]: RegProva };
  /** uniId → unicórnio ganho (ovo ou chocado) */
  unis: { [uniId: string]: RegUni };
  /** id do unicórnio que ela monta ('inicial' se o escolhido não estiver chocado) */
  montaria: string;
  /** saldo = ganhas − gastas (P.estrelas) */
  estrelas: { ganhas: number; gastas: number };
  /** itemId → true (enfeite comprado ou acessório ganho/comprado) */
  loja: { [itemId: string]: boolean };
  usando: Usando;
  /** materiaId → valor já pago pelos pais (R$) */
  pago: { [materiaId: string]: number };
  ajustes: Ajustes;
  ritualVisto: boolean;
  /** uniId → fome, sede e banho (js/sistemas/cuidados.js; campo aditivo) */
  cuidados: { [uniId: string]: RegCuidado };
  /** comidaId → contadores (campo aditivo) */
  despensa: { [comidaId: string]: RegDespensa };
}

/** Cores da Mariana (PA.APARENCIA_PADRAO em js/arte/pixelart-personagens.js). */
interface Aparencia {
  pele: string;
  cabelo: string;
  roupa: string;
  laco: string;
  [campo: string]: string;
}

/** Registro de uma sala feita. */
interface RegSala {
  /** carimbo da primeira vez que terminou (ausente = ainda não fez) */
  feita?: number;
  /** melhor número de acertos de primeira */
  melhor: number;
  perfeita?: boolean;
  /** terminou sem pressa (nenhuma resposta apressada) */
  calma?: boolean;
  vezes: number;
}

/** Registro do treino de uma matéria. */
interface RegTreino {
  melhor?: Medalha;
  /** carimbo da primeira medalha de ouro */
  ouro?: number;
  /** carimbo do primeiro treino sem erro */
  perfeito?: number;
  vezes: number;
}

/** Registro de uma prova bimestral. */
interface RegProva {
  tentativas: number;
  /** as últimas 20 notas */
  notas: number[];
  melhor?: number;
  /** o acessório ganho (ausente = ainda não ganhou) */
  premio?: RaridadePremio;
  premioEm?: number;
}

/** Unicórnio ganho. */
interface RegUni {
  /** carimbo de quando ganhou */
  em: number;
  /** nome que a Mariana deu (ausente = o nome do baralho) */
  nome?: string;
  xp: number;
  chocado: boolean;
}

/** Fome, sede e banho de um unicórnio (0–100, 100 = satisfeito/limpinho). Ver cuidados.md e save-e-mescla.md §3. */
interface RegCuidado {
  fome: number;
  sede: number;
  /** ausente = 100 na leitura (só o gasto ou o banho criam o campo) */
  banho?: number;
  /** Date.now() da última mudança */
  em: number;
  /** o maior de acaoFome/acaoSede (o banho não mexe nele); 0 = nenhum */
  acao?: number;
  acaoFome?: number;
  acaoSede?: number;
  acaoBanho?: number;
}

/** Comida guardada: contadores que só crescem; quantidade = compradas − usadas. */
interface RegDespensa {
  compradas: number;
  usadas: number;
}

/** Enfeites em uso na montaria (e a capa, na Mariana). */
interface Usando {
  /** ids de ENFEITES/acessórios com encaixe (um por encaixe) */
  enfeites: string[];
  capa: boolean;
  asasFada: boolean;
  estrelinhas: boolean;
}

/** Interruptores dos Ajustes. */
interface Ajustes {
  som: boolean;
  musica: boolean;
  voz: boolean;
  animacoes: boolean;
  /** escala do texto (1 = normal) */
  texto: number;
  /** antigo (setas na tela): fica no save, o jogo ignora */
  setas: boolean;
  /** perguntas surpresa (campo aditivo) */
  surpresa: boolean;
  /** carimbo da última troca de verdade do interruptor da surpresa */
  surpresaEm?: number;
}

type Medalha = 'ouro' | 'prata' | 'bronze';
/** Raridade dos unicórnios do baralho. */
type Raridade = 'comum' | 'raro' | 'epico' | 'lendario';
/** Raridade dos acessórios das provas (não existe épico). */
type RaridadePremio = 'comum' | 'raro' | 'lendario';

/** O que concluirSala recebe da atividade. */
interface ResultadoSala {
  acertosPrimeira: number;
  total: number;
  /** respostas apressadas (0 = sala calma) */
  pressas: number;
}
/** Unicórnio que cresceu de estágio com o XP (P.xpMontaria). */
interface Cresceu { id: string; estagio: number }
/** O que P.concluirSala devolve para a tela de prêmios. */
interface PremiosSala {
  primeiraVez: boolean;
  dinheiro: number;
  estrelas: number;
  calma: boolean;
  perfeita: boolean;
  /** ids dos unicórnios que nasceram em ovo */
  ovos: string[];
  cresceu: Cresceu | null;
  materiaCompleta: boolean;
  /** o raro veio pelo caminho da persistência */
  porPersistencia?: boolean;
  /** bônus da matéria (a sobra da divisão em valores redondos), na sala que a completa */
  bonus?: number;
}
/** O que P.registrarTreino devolve. */
interface PremiosTreino {
  medalha: Medalha;
  ovos: string[];
  estrelas: number;
  cresceu?: Cresceu | null;
}
/** O que P.registrarProva devolve. */
interface PremiosProva {
  tentativa: number;
  nota: number;
  sucesso: boolean;
  /** o que esta tentativa valia (null = acessório já ganho, era treino) */
  valendo: RaridadePremio | null;
  raridade: RaridadePremio | null;
  acessorio: Acessorio | null;
  estrelas: number;
  /** o que a próxima tentativa vale */
  proximo?: RaridadePremio | null;
  cresceu?: Cresceu | null;
}
/** Unicórnio visto pela regra da persistência (P.faltamPersistencia). */
interface DefPersistencia {
  raridade: Raridade;
  sala?: string;
  treino?: 'ouro' | 'perfeito';
  materiaId?: string;
}

type StatusNuvem = 'sincronizado' | 'erro' | 'local';

/** Doc do progresso: o da capacidade db do claude.ai ou o adaptador do servidor de casa (mesma forma). */
interface DocProgresso {
  get(): Promise<InstantaneoProgresso>;
  set(d: { estado: EstadoSave; atualizado: number }): Promise<any>;
  onSnapshot(ok: (s: InstantaneoProgresso) => void, erro?: (e?: any) => void): any;
}
interface InstantaneoProgresso {
  exists: boolean;
  data(): { estado?: EstadoSave; atualizado?: number } | null;
  metadata: { hasPendingWrites: boolean };
}
/** Estado da sincronização (Reino._progresso.nuvem). */
interface EstadoNuvem {
  ref: DocProgresso | null;
  ok: boolean;
  gravando: boolean;
  pendente: boolean;
  timer: any;
  status: StatusNuvem;
}

/** Reino.Progresso: a API do save, montada nas quatro partes (progresso.js, -mescla, -nuvem, -regras). */
interface ProgressoApi {
  // progresso.js
  carregar(): EstadoSave;
  /** o objeto do save de agora (carregar, mesclar e "Apagar tudo" TROCAM o objeto: leia sempre de novo) */
  estado(): EstadoSave;
  salvar(semNuvem?: boolean): void;
  // progresso-mescla.js
  mesclar(a: EstadoSave, b: EstadoSave): EstadoSave;
  // progresso-nuvem.js
  iniciarNuvem(): Promise<void>;
  statusNuvem(): StatusNuvem;
  // progresso-regras.js
  valorSala(materia: Materia): number;
  bonusMateria(materia: Materia): number;
  dinheiroMateria(materia: Materia): number;
  dinheiroTotal(): number;
  pago(materiaId: string): number;
  salasFeitas(materia: Materia): number;
  materiaCompleta(materia: Materia): boolean;
  estrelas(): number;
  ganharEstrelas(n: number): void;
  gastarEstrelas(n: number): boolean;
  temUni(id: string): boolean;
  defUni(id: string): any;
  nomeUni(id: string): string;
  ganharUni(id: string): boolean;
  ovosParaChocar(): string[];
  chocar(id: string): void;
  montaria(): string;
  xpMontaria(n: number): Cresceu | null;
  concluirSala(materia: Materia, sala: Sala, resultado: ResultadoSala): PremiosSala;
  persistiuSala(salaId: string): boolean;
  faltamPersistencia(def: DefPersistencia): number | null;
  conferirPersistencia(): string[];
  medalhaPara(acertos: number, total: number): Medalha;
  registrarTreino(materia: Materia, acertos: number, total: number): PremiosTreino;
  premioDaTentativa(n: number): RaridadePremio;
  /** só o id da prova importa (a Loja passa { id }) */
  regProva(prova: { id: string }): RegProva;
  valendoProva(prova: { id: string }): RaridadePremio | null;
  registrarProva(prova: Prova, nota: number): PremiosProva;
  registrarPagamento(materiaId: string, valor: number): void;
  novoCiclo(): void;
  apagarTudo(): void;
  // progresso-campos.js
  registrarCampo(nome: string, def: CampoSave): void;
  camposRegistrados(): string[];
  /** nomes do save de hoje, que um campo registrado não pode usar (progresso-campos.js) */
  NOMES_DO_SAVE: string[];
}

/** Reino._progresso: o que as quatro partes do progresso dividem (interno, não é API). Os auxiliares são
 *  publicados no fim de cada parte, por isso opcionais aqui. */
interface ProgressoInterno {
  /** o objeto do save (sempre ler I.estado, nunca guardar numa variável) */
  estado: EstadoSave | null;
  nuvem: EstadoNuvem;
  P: ProgressoApi;
  // progresso.js
  agora?(): number;
  estadoNovo?(): EstadoSave;
  objeto?(x: any): boolean;
  numero?(x: any): boolean;
  numeroOu?(x: any, padrao: number): number;
  chaveSegura?(o: object, k: string): boolean;
  proprio?(o: object, k: string): any;
  completar?(e: any): EstadoSave;
  comCopia?(e: any): EstadoSave;
  conteudo?(e: EstadoSave): string;
  trouxeAlgo?(mesclado: EstadoSave, recebido: EstadoSave): boolean;
  gravarLocal?(): void;
  vigiarSurpresa?(): void;
  // progresso-mescla.js
  CAMPOS_CUIDADO?: string[][];
  carimbo?(r: Partial<RegCuidado>, chave: string): number | null;
  ORDEM_MEDALHA?: { [m: string]: number };
  juntarCuidados?(base: { [uniId: string]: RegCuidado }, outro: any): { [uniId: string]: RegCuidado };
  juntarDespensa?(base: { [comidaId: string]: RegDespensa }, outro: any): { [comidaId: string]: RegDespensa };
  juntarSurpresa?(base: any, outro: any): any;
  // progresso-nuvem.js
  agendarNuvem?(): void;
  // progresso-campos.js (o registro `campos` nasce vazio em progresso.js)
  campos: { [nome: string]: CampoSave };
  cadaCampo?(f: (nome: string, def: CampoSave) => void): void;
  ESTRATEGIAS?: { [nome: string]: EstrategiaMescla };
  limparCampo?(def: CampoSave, v: any): any;
  juntarCampo?(def: CampoSave, base: any, outro: any): any;
  exemplosCampo?(def: CampoSave): any[];
}

/* ============================ CONTEÚDO (docs/contratos/conteudo.md) ============================ */

/** Uma matéria (js/conteudo/materias/<m>/<m>.js, Reino.registrarMateria). */
interface Materia {
  id: string;
  nome: string;
  emoji: string | ((l?: any) => string);
  /** o prédio da matéria no mapa */
  lugar: LugarMateria;
  /** fala do guia (voz 'claude') */
  guia: string;
  /** na ordem do manifesto (Reino.salasDa) */
  salas: Sala[];
  /** cartas do livro da matéria (Reino.livroDa) */
  livro: CartaLivro[];
  unicornios: UnicornioMateria[];
  /** nome do livro na tela (padrão: "Livro") */
  nomeLivro?: string;
}

/** O prédio de uma matéria no mapa. */
interface LugarMateria {
  nome: string;
  /** desenho de fora (Mapa.PREDIOS) */
  sprite: string;
  /** em tiles; a porta fica no meio da última linha */
  rect: Retangulo;
  /** onde fica a placa do nome ('acima', …) */
  placa: string;
  cores: { parede: string; telhado: string; detalhe: string };
  /** 'a' = lugar feminino ("a Casa das Palavras"); sem ele, masculino */
  artigo?: 'a';
  porCima?: boolean;
}

/** Unicórnio do baralho de uma matéria. */
interface UnicornioMateria {
  id: string;
  nome: string;
  raridade: Raridade;
  /** comum e raro: a sala que dá o ovo */
  sala?: string;
  /** épico: medalha de ouro ou treino perfeito */
  treino?: 'ouro' | 'perfeito';
  /** lendário: terminar todas as salas */
  materiaCompleta?: boolean;
  cores: { corpo: string; crina: string[]; chifre: string; asa?: string };
  /** o que ele diz (voz 'unicornio') */
  frase: string;
}

/** Unicórnio do baralho inteiro (Reino.Unicornios.todos()): o inicial e os das matérias, com a matéria. */
interface UnicornioBaralho {
  id: string;
  nome: string;
  raridade: Raridade;
  sala?: string;
  treino?: 'ouro' | 'perfeito';
  materiaCompleta?: boolean;
  /** só o unicórnio inicial (Estrelinha) */
  inicial?: boolean;
  cores: { corpo: string; crina: string[]; chifre: string; asa?: string };
  frase: string;
  /** null = o inicial */
  materiaId: string | null;
}

/** Carta do livro da matéria (resumo para ler antes ou depois de errar). */
interface CartaLivro {
  id: string;
  /** emoji */
  e: string;
  titulo: string;
  texto: string;
}

/** Uma sala (js/conteudo/materias/<m>/<sala>.js, Reino.registrarSala). */
interface Sala {
  id: string;
  nome: string;
  emoji: string | ((l?: any) => string);
  /** páginas da apostila */
  paginas: string;
  /** fala de abertura (voz 'claude') */
  intro: string;
  desafios: Desafio[];
}

/** Prova bimestral (js/conteudo/provas/<id>.js, Reino.registrarProva). */
interface Prova {
  id: string;
  materiaId: string;
  nome: string;
  bimestre: string;
  emoji: string | ((l?: any) => string);
  /** o prêmio de cada tentativa: 1ª lendário, 2ª raro, depois comum */
  acessorios: { lendario: Acessorio; raro: Acessorio; comum: Acessorio };
  questoes: Desafio[];
}

/** Acessório prêmio de prova (desenho em PA.ENFEITES_MONTARIA[id]). */
interface Acessorio {
  id: string;
  nome: string;
  /** desenho na montaria no próprio arquivo (senão, em pixelart-unicornio-moldes.js) */
  desenho?: DesenhoEnfeite;
  /** ícone 'acessorio:<id>' no próprio arquivo (senão, em js/arte/icones/) */
  icone?: IconePixel;
}

/** Desenho de um enfeite na montaria (item de PA.ENFEITES_MONTARIA). */
interface DesenhoEnfeite {
  linhas: string[];
  paleta: { [letra: string]: string };
  ancora: 'orelha' | 'cabeca' | 'olho' | 'chifre' | 'pescoco' | 'cauda';
  dx: number;
  dy: number;
  [k: string]: any;
}

/** Ícone 16×16 de window.ICONES: n = nome, p = paleta, d = 16 linhas de 16 letras. */
interface IconePixel {
  n: string;
  p: { [letra: string]: string };
  d: string[];
}

/** Texto de apoio de uma questão (lido no 🔊 da caixa do texto). */
interface ApoioDesafio {
  titulo: string;
  partes: { titulo?: string; lista?: string[]; texto?: string }[];
}

/** O que todo desafio tem (sala ou prova). O resto depende do `tipo`. */
interface DesafioBase {
  id: string;
  /** id da carta do livro que explica o assunto (pista depois de errar) */
  livro: string;
  /** página da apostila */
  pagina?: number;
  /** explicação mostrada depois de responder (voz 'narradora') */
  explica: string;
  /** o jeito de responder no jogo, numa linha própria (a pergunta fica igual à folha) */
  instrucao?: string;
  apoio?: ApoioDesafio;
  /** pista própria depois de um erro (Falas.pista; hoje nenhum dado usa) */
  dica?: string;
  /** a narradora lê também os itens (nas provas, que não têm pista) */
  lerItens?: boolean;
  /** questão pessoal: qualquer resposta vale (varias e completar); a pergunta surpresa pula estas */
  livre?: boolean;
}
/** Opção de escolha/varias: emoji e texto. */
interface OpcaoDesafio {
  e?: string;
  t: string;
  /** varias: esta opção é certa */
  ok?: boolean;
}
interface DesafioEscolha extends DesafioBase {
  tipo: 'escolha';
  pergunta: string;
  opcoes: OpcaoDesafio[];
  /** índice da opção certa */
  certa: number;
  /** aparência da folha ('marcar-x') */
  estilo?: string;
}
interface DesafioVf extends DesafioBase {
  tipo: 'vf';
  afirmacao: string;
  certo: boolean;
}
interface DesafioVarias extends DesafioBase {
  tipo: 'varias';
  pergunta: string;
  opcoes: OpcaoDesafio[];
  /** aparência da folha ('circular', 'marcar-x') */
  estilo?: string;
}
/** Lado de um par do ligar: emoji/imagem e texto. */
interface LadoLigar {
  e?: string;
  t?: string;
  img?: string;
  alt?: string;
}
interface DesafioLigar extends DesafioBase {
  tipo: 'ligar';
  pergunta: string;
  /** [esquerda, direita] na ordem certa */
  pares: [LadoLigar, LadoLigar][];
  /** ordem fixa da coluna da direita na tela (índices de pares); sem ela, embaralha */
  direita?: number[];
}
interface DesafioOrdenar extends DesafioBase {
  tipo: 'ordenar';
  pergunta: string;
  /** na ordem certa */
  itens: string[];
}
interface DesafioFrase extends DesafioBase {
  tipo: 'frase';
  pergunta: string;
  /** blocos da frase na ordem certa */
  blocos: string[];
}
interface DesafioSeparar extends DesafioBase {
  tipo: 'separar';
  pergunta: string;
  grupos: { e: string; t: string; dica?: string }[];
  /** g = índice do grupo certo */
  itens: { e: string; t: string; g: number }[];
}
interface DesafioVfLista extends DesafioBase {
  tipo: 'vfLista';
  pergunta: string;
  itens: { t: string; v: boolean }[];
  /** rótulos dos dois botões (padrão V/F) */
  rotulos?: [string, string];
}
/** Uma lacuna do completar. */
interface FraseCompletar {
  antes: string;
  depois: string;
  /** índice da palavra certa em `palavras` */
  certa: number;
  letra?: string;
  /** outros índices de `palavras` também aceitos (ex.: CARO e CARRO) */
  aceitas?: number[];
  img?: string;
  alt?: string;
}
interface DesafioCompletar extends DesafioBase {
  tipo: 'completar';
  pergunta: string;
  /** o quadro de palavras */
  palavras: string[];
  frases: FraseCompletar[];
  /** a lacuna fica dentro da palavra (PA__ARINHO): a narradora não lê as palavras */
  colado?: boolean;
}
interface DesafioCopiar extends DesafioBase {
  tipo: 'copiar';
  pergunta: string;
  instrucao: string;
  /** escolher a escrita certa e montar a palavra */
  itens: { letra: string; opcoes: string[]; certa: number }[];
}
interface DesafioMemoria extends DesafioBase {
  tipo: 'memoria';
  pergunta: string;
  /** [emoji, texto] de cada par */
  pares: [string, string][];
}
interface DesafioDesenho extends DesafioBase {
  tipo: 'desenho';
  pergunta: string;
  /** o que o desenho tem de usar (ids da listinha) */
  requisitos: string[];
}
/** Um desafio de sala ou questão de prova: união pelo `tipo`. */
type Desafio = DesafioEscolha | DesafioVf | DesafioVarias | DesafioLigar | DesafioOrdenar | DesafioFrase
  | DesafioSeparar | DesafioVfLista | DesafioCompletar | DesafioCopiar | DesafioMemoria | DesafioDesenho;
type TipoDesafio = Desafio['tipo'];

/* ============================ INTERIORES E NPCs (interiores.md, npcs-e-dialogo.md) ============================ */

interface Ponto { x: number; y: number }
interface Retangulo { x: number; y: number; w: number; h: number }

/** Um interior (Reino.registrarInterior(def); js/interiores/<prédio>/<prédio>.js). */
interface InteriorDef {
  /** único; andares: 'torre', 'torre-1'… */
  id: string;
  /** lugar no mapa: 'castelo', 'escola', 'estabulo', 'loja', 'bau', 'petshop', 'observatorio', 'materia:<id>' */
  lugar: string;
  nome: string;
  /** por aqui se entra pelo mapa (um por lugar) */
  entrada?: boolean;
  /** pacote de voz (andares do mesmo prédio usam o mesmo) */
  pacote: string;
  /** em tiles */
  tamanho: { w: number; h: number };
  /** tapete de saída (só no de entrada) */
  saida?: Ponto;
  /** onde ela aparece (1 tile acima do tapete) */
  spawn?: Ponto;
  escadas?: Escada[];
  comodos: Comodo[];
  /** vãos entre cômodos (andáveis) */
  portas?: Retangulo[];
  /** passagens que ficam livres (fora da regra do 3×3 vazio) */
  corredores: Retangulo[];
  objetos: ObjetoInterior[];
  npcs: Npc[];
}

interface Escada extends Ponto {
  /** id do interior do outro andar */
  para: string;
  chegada: Ponto;
  /** para onde ela olha ao chegar */
  olhar: Ponto;
  sentido: 'sobe' | 'desce';
}

interface Comodo {
  id: string;
  nome: string;
  /** placa na parede do fundo */
  placa: string;
  /** o cômodo inteiro; as 2 primeiras fileiras são a parede do fundo */
  rect: Retangulo;
  /** 'taco', 'mosaico', 'pedra', 'palha', 'tabuas', 'azulejo', 'carpete' ou registrado pelo prédio */
  piso: string;
  /** 'papel', 'pedra', 'madeira', 'tijolo', 'azulejo' ou registrado pelo prédio */
  parede: string;
  paleta?: { piso?: string; piso2?: string; parede?: string; parede2?: string; rodape?: string; detalhe?: string };
}

/** Objeto de um interior (tipo da biblioteca Reino.Interiores.objeto). */
interface ObjetoInterior extends Ponto {
  tipo: string;
  /** pegada em tiles (padrão: da biblioteca) */
  w?: number;
  h?: number;
  solido?: boolean | 'base';
  alto?: boolean;
  /** enfeite pendurado na parede do fundo */
  parede?: boolean;
  /** nome no balão (interativo) */
  nome?: string;
  /** fala curta ao tocar (voz 'narradora', ou `voz`); lista = uma por toque */
  fala?: string | string[];
  voz?: string;
  acao?: AcaoObjeto;
  /** chave de estado do pré-render */
  chave?: string;
  /** parâmetros do desenho (cor, unicórnio do quadro etc.) */
  var?: { [k: string]: any };
}

/** Ação de um objeto: abrir tela, baia do Estábulo ou ação registrada (beber, banho, curiosidade…). */
interface AcaoObjeto {
  tipo: 'tela' | 'unicornio' | string;
  tela?: string;
  materia?: string;
  /** Estábulo: baia */
  indice?: number;
  /** Observatório: tema da curiosidade */
  tema?: string;
  [k: string]: any;
}

/** Parâmetros do gerador de sprites (js/personagens/npcs*.js); base 'pessoa' (padrão), 'fada', 'dragao', 'robo'. */
interface SpriteNpc {
  base?: string;
  [param: string]: any;
}

/** Personagem do elenco (Reino.NPCs.ELENCO[id], js/personagens/elenco.js). */
interface PersonagemElenco {
  nome: string;
  /** perfil de voz em Reino.config.vozes ('npc-<id>') */
  voz: string;
  sprite: SpriteNpc;
  /** cavaleiro do treino desta matéria no Castelo */
  paraMateria?: string;
  /** professora desta prova na Escola */
  paraProva?: string;
}

/** Perfil de voz (Reino.config.vozes[nome]). */
interface PerfilVoz {
  voz: string;
  velocidade: string;
  tom: string;
  ingles?: string;
  efeito?: string;
}

/** NPC de um interior (npcs-e-dialogo.md §2). */
interface Npc extends Ponto {
  id: string;
  nome: string;
  sprite: SpriteNpc;
  voz: string;
  acao: AcaoNpc;
  falas: FalasNpc;
}

/** O que o NPC faz depois da conversa: sala, treino, prova, tela, guia ou ação registrada (curiosidade, piada…). */
interface AcaoNpc {
  tipo: 'sala' | 'treino' | 'prova' | 'tela' | 'guia' | string;
  materia?: string;
  sala?: string;
  prova?: string;
  tela?: string;
  /** guia: lugar que ele apresenta */
  lugar?: string;
  livro?: string;
  tema?: string;
  [k: string]: any;
}

/** Falas de um NPC por situação (listas; cada fala ≤ 2 linhas no balão). */
interface FalasNpc {
  oi?: string[];
  nova?: string[];
  feita?: string[];
  bloqueada?: string[];
  depois?: string[];
}

/** Reino.NPCs (a parte com tipo; o resto do módulo fica solto). */
interface NpcsApi {
  [k: string]: any;
  ELENCO?: { [id: string]: PersonagemElenco };
  /** id do primeiro do elenco cujos campos batem com o filtro, ou null */
  doElenco?(filtro: Partial<PersonagemElenco>): string | null;
  /** tudo o que o NPC pode falar, com a voz */
  falasPossiveis?(npc: Npc, def: InteriorDef): { texto: string; voz: string }[];
}

/* ============================ FALAS E VOZ (som-musica-e-voz.md) ============================ */

/** Uma fala a gravar (item de Reino.Falas.todas()). A voz é achada pelo TEXTO EXATO. */
interface Fala {
  texto: string;
  /** 'claude', 'narradora', 'unicornio', 'ingles' ou perfil 'npc-<id>' (Reino.config.vozes) */
  voz: string;
  /** pacote de áudio (js/voz/<pacote>.js): 'geral', '<materia>-extra', '<materia>-<sala>', 'prova-<id>', 'interior-<prédio>'… */
  pacote: string;
}

/** Reino.Falas (js/sistemas/falas.js). */
interface FalasApi {
  fixas: { [chave: string]: string };
  medalhas: { [m in Medalha]: { emoji: string; titulo: string; frase: string } };
  provas: {
    escola: string;
    valendo: { [r in RaridadePremio]: string };
    treino: string;
    perguntaRevisar: string;
    comecaRevisao: string;
    ganhou: { [r in RaridadePremio]: string };
    quase: { raro: string; comum: string };
    treinoDez: string;
    treinoFeito: string;
    lojaPremio: string;
  };
  /** raridade: um valor de Raridade */
  ovo(raridade: string): string;
  acertouDePrimeira(n: number): string;
  acertouDeTotal(n: number, total: number): string;
  tutorialMapa(m: Materia): string;
  treinoBloqueado(m: Materia, faltam: number): string;
  pistaLivro(titulo: string): string;
  /** pista depois de um erro (sem entregar a resposta) */
  pista(d: Desafio, materia: Materia): string;
  /** o que a narradora lê no 🔊 de um desafio (`ordem` = opções na ordem da tela) */
  segmentosDesafio(d: Desafio, ordem?: number[]): string[];
  segmentosApoio(apoio?: ApoioDesafio): string[];
  fraseComLacuna(f: FraseCompletar): string;
  pacotesDaMateria(m: Materia): { extra: string; livro: string; sala(s: Sala): string };
  /** tudo o que o jogo fala (as ferramentas gravam os áudios a partir disto) */
  todas(): Fala[];
}

/* ============================ LOJA (docs/contratos/loja.md) ============================ */

/** Encaixe de enfeite (Reino.LojaItens.SLOTS). */
type Encaixe = 'orelha' | 'olho' | 'cabeca' | 'chifre' | 'pescoco' | 'cauda' | 'capa' | 'rastro' | 'asas';

/** Enfeite à venda por estrelas (Reino.LojaItens.ENFEITES). */
interface Enfeite {
  id: string;
  nome: string;
  preco: number;
  slot: Encaixe;
  /** emoji com desenho em js/arte/icones/ ou 'enfeite:<id>' */
  icone: string;
  /** enfeite do tema espaço */
  espaco?: boolean;
}

/** Acessório de prova visto pela Loja (Reino.LojaItens.premios()). */
interface Premio {
  id: string;
  nome: string;
  raridade: RaridadePremio;
  provaId: string;
  preco: number;
  /** âncora do desenho (PA.ENFEITES_MONTARIA[id].ancora); null sem PA (Node) */
  slot: string | null;
}

/** Prêmio de prova no formato de item da loja (Reino.LojaItens.item). */
interface ItemPremio extends Premio {
  /** 'acessorio:<id>' */
  icone: string;
  premio: true;
}

/** Item da Loja das Fadas: enfeite ou acessório de prova. */
type ItemLoja = Enfeite | ItemPremio;

type EstadoPremio = 'ganho' | 'comprado' | 'aVenda' | 'bloqueado';

/** Comida da Pet Shop (Reino.config.comidas). */
interface Comida {
  id: string;
  nome: string;
  icone: string;
  /** em estrelas */
  preco: number;
  /** quanto enche a fome */
  fome: number;
  /** vai a 100 */
  enche?: boolean;
}

/** Reino.LojaItens (js/conteudo/loja-itens.js). */
interface LojaItensApi {
  SLOTS: { [s in Encaixe]: { nome: string } };
  ENFEITES: Enfeite[];
  FALAS: { [chave: string]: string };
  enfeite(id: string): Enfeite | null;
  precoPremio(raridade: RaridadePremio): number;
  premios(): Premio[];
  /** derivado do save; P = Reino.Progresso (opcional: sem ele, 'bloqueado') */
  estadoPremio(premio: Premio, P?: ProgressoApi): EstadoPremio;
  item(id: string): ItemLoja | null;
}

/** Resultado de comprar, alimentar, beber e banhar (Reino.Cuidados). */
interface ResultadoCuidado {
  ok: boolean;
  /** 'sem-comida', 'estrelas', 'sem-uni', 'cheio' */
  motivo?: string;
  /** estrelas que faltam */
  faltam?: number;
  antes?: number;
  depois?: number;
}
/** Níveis de um unicórnio (0–100). */
interface NiveisCuidado { fome: number; sede: number; banho: number }

/* ============================ MÚSICA (js/sistemas/musicas.js) ============================ */

/** Uma faixa (Reino.Musicas.faixas[id], dados em js/sistemas/musicas-faixas.js). Formato no cabeçalho de musicas.js. */
interface Musica {
  nome: string;
  /** batidas por minuto */
  bpm: number;
  /** batidas por compasso (4 = 4/4, 3 = valsa) */
  compasso: number;
  /** tônica: C, C#, Db, D, … B */
  tom: string;
  modo: 'maior' | 'menor' | 'dorico';
  /** ganho da faixa */
  volume: number;
  timbres: TimbresMusica;
  /** volume de cada parte (opcional) */
  mix?: MixMusica;
  /** eco com DelayNode (tempo em batidas) */
  eco?: { tempo: number; retorno: number; mistura: number } | null;
  secoes: { [nome: string]: SecaoMusica };
  /** um loop inteiro */
  ordem: string[];
  /** seções de outra faixa (a mesma cantiga com outro arranjo) */
  base?: { [nome: string]: SecaoMusica };
}
/** Instrumento de cada parte (nomes em js/sistemas/som.js). */
interface TimbresMusica { melodia?: string; melodia2?: string; harmonia?: string; baixo?: string }
interface MixMusica { melodia?: number; melodia2?: number; harmonia?: number; baixo?: number; percussao?: number }
/** Seção de uma faixa. Com `de`, herda os campos da seção de nome `de` e troca só os que vierem. */
interface SecaoMusica {
  de?: string;
  /** um compasso por "|": graus 1–7 com b/#, M/m/7 */
  acordes?: string;
  melodia?: string;
  melodia2?: string;
  /** padrão do acompanhamento (PADROES_HARMONIA) */
  harmonia?: string;
  /** padrão do baixo (PADROES_BAIXO) */
  baixo?: string;
  /** um caractere por colcheia; '' = sem */
  percussao?: string;
  timbres?: TimbresMusica;
  /** desloca a melodia em oitavas */
  oitava?: number;
}
/** Nota expandida (Reino.Musicas.expandir). */
interface NotaMusica {
  /** segundos desde o começo do loop */
  t: number;
  dur: number;
  freq: number;
  parte: 'melodia' | 'harmonia' | 'baixo' | 'percussao';
  vol: number;
  /** timbre (ou tipo do toque, na percussão) */
  onda: string;
}
/** Reino.Musicas. */
interface MusicasApi {
  faixas: { [id: string]: Musica };
  secao(id: string, nome: string): SecaoMusica;
  expandir(id: string): NotaMusica[];
  duracao(id: string): number;
  compassos(id: string): { secao: string; t: number; batidas: number; melodia: number; melodia2: number | null; linhasMel: number; linhasAc: number; linhasMel2: number | null }[];
  PADROES_HARMONIA: string[];
  PADROES_BAIXO: string[];
  PERCUSSAO: { [c: string]: { onda: string; freq: number; vol: number } };
}

/* ============================ EVENTOS (js/nucleo/eventos.js) ============================ */

/** Reino.EVENTOS: nome de cada evento do barramento Reino.util (on/emit). Carga de cada um no eventos.js. */
interface EventosReino {
  /** carga: EstadoSave */
  PROGRESSO: 'progresso';
  /** carga: EstadoSave */
  PROGRESSO_REMOTO: 'progressoRemoto';
  /** sem carga */
  MAPA_MUDOU: 'mapaMudou';
  /** carga: boolean (começou/terminou) */
  TRANSICAO: 'transicao';
  /** carga: Reino.Cuidados.depurar() */
  CUIDADOS: 'cuidados';
  /** carga: número de telas abertas */
  TELAS: 'telas';
  /** carga: { de, para } */
  CENA: 'cena';
  /** carga: motivo (texto) ou null */
  OCUPADA: 'ocupada';
  /** carga: o lugar */
  IR_PARA: 'irPara';
  /** carga: StatusNuvem */
  NUVEM: 'nuvem';
}
/** Nome de um evento ('progresso', 'cena'…). */
type Evento = EventosReino[keyof EventosReino];
