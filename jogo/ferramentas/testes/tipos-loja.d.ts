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
  raridade: RaridadePremio;
  /** a prova (ausente no prêmio da trilha) */
  provaId?: string;
  /** 'trilha': lendário da trilha perfeita (quarto-bimestre.md §14.3), nunca à venda */
  origem?: 'trilha';
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
  /** derivado do save; P = Reino.Progresso (opcional: sem ele, 'bloqueado') */
  estadoPremio(premio: Premio, P?: ProgressoApi): EstadoPremio;
  item(id: string): ItemLoja | null;
}
