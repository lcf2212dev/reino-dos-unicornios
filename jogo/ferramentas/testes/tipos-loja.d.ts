// Catálogos, enfeites e comidas das lojas. Contrato: docs/contratos/loja.md.
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
  /** Ausente: Loja das Fadas; petshop: exclusivo da Pet Shop. */
  loja?: 'petshop';
}

/** Acessório de prova visto pela Loja (Reino.LojaItens.premios()). */
interface Premio {
  id: string;
  nome: string;
  /** 'ultra': Ultra Lendário, presente do jogo (LojaItens.ultras) */
  raridade: RaridadePremio | 'ultra';
  /** a prova (ausente no prêmio da trilha e no presente) */
  provaId?: string;
  /** 'trilha': lendário da trilha perfeita (quarto-bimestre.md §14.3); 'presente': Ultra Lendário dado pelo jogo
   *  (conteudo/presentes.js). Os dois nunca estão à venda */
  origem?: 'trilha' | 'presente';
  /** o presente (só com origem 'presente') */
  presente?: string;
  /** a sala da trilha (só com origem 'trilha') */
  sala?: string;
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
  naLoja(loja: 'fadas' | 'petshop'): Enfeite[];
  precoPremio(raridade: RaridadePremio): number;
  premios(): Premio[];
  /** a raridade acima do lendário (nome e emoji) */
  ULTRA: { nome: string, emoji: string };
  /** os Ultra Lendários (Reino.presentes), fora de premios() */
  ultras(): Premio[];
  /** derivado do save; P = Reino.Progresso (opcional: sem ele, 'bloqueado') */
  estadoPremio(premio: Premio, P?: ProgressoApi): EstadoPremio;
  item(id: string): ItemLoja | null;
}
