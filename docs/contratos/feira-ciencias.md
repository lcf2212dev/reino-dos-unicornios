# Feira de Ciências

Extensão independente em `interiores/feira/`, lugar e interior de entrada `feira`, pacote `interior-feira`.
Revisa o currículo existente de Ciências por exploração, sem alterar matéria ou dinheiro. A Aura usa o campo e a regra já existentes.

## Partes e integração
- `dados.js`: `Reino.FeiraCiencias = { salas: [...] }`. Sem DOM; dados disponíveis antes de falas, objetos e interior.
- Cinco salas, nesta ordem: `jardim` (c1), `teia` (c2), `parcerias` (c3), `habitats` (c4), `observatorio` (c5).
- Sala: `{ id, nome, chamada, emoji, cor, clara, selo, origem, missoes }`.
- Missão: `{ id, titulo, convite: string[], dica: string[], descoberta: string[], cena, opcoes: [{ id, nome, emoji }], certa }`.
  `certa` é o id da peça correta. Ids de missão são únicos. `cena` usa o id do tema (os cinco acima).
  Cada missão tem 3 opções de ações/peças (verbos e coisas da brincadeira, sem enunciado escolar).
  Convite conta o que está acontecendo; dica ajuda a tentar outra ideia; descoberta explica o efeito científico.
- `falas.js` registra em `Reino.falasDoPredio('feira', { objetos, extras })` as falas dos objetos e todas as páginas
  de convites, dicas e descobertas com voz `narradora` (mesmo texto exato). Chaves dos objetos: `boasvindas`,
  `passaporte`, `jardim`, `teia`, `parcerias`, `habitats`, `observatorio`.
- `ui/feira.js`: `Reino.UI.telaFeira({ sala?, missao? })` abre `UI.painel('feira', ...)`.
  Sem sala abre o passaporte/menu de visita. Tocar numa sala abre suas instalações. Missões disponíveis livremente.
  Passaporte somente em memória desta sessão, sem novo campo de save. Ao concluir uma tentativa chama `Reino.Aura.contar(true, 'ciencias')` uma vez.
  Refazer permite nova conclusão e Aura; reabrir resultado ou toque duplo não contam. Tentativa de outra peça não tira Aura.
  API para ilustração: `Reino.FeiraCiencias.desenharCena(ctx, salaId, { feita, missao, escolha })`, canvas 160×96.
- `ui/feira-cenas.js`: implementação do desenho acima; recebe missão inteira em `missao`.
- `acoes.js`: ação registrada `feira` chama `UI.telaFeira({ sala: acao.sala })` e carrega o pacote de voz.
- Objetos `feira-*`, prefixo e formas: `portal` 3×2, `estufa` 3×2, `formigueiro` 3×2, `terrario` 3×2,
  `colmeia` 2×2, `jardineira` 2×1, `aquario` 3×2, `deserto` 3×2, `polar` 3×2, `lupa` 2×2,
  `painel` 2×2 (parede), `bandeirolas` 3×1 (parede), `bancada` 3×2, `passaporte` 2×2,
  `pegadas` 1×1 (plano andável), `flor` 1×1 (plano andável). Arte estática rica; `var.cor` e `var.tema` opcionais.
  Objetos `solido: 'base'` salvo os de parede e os andáveis. `desenhar` dentro da pegada; sem topo extra.
- `fora.js` desenha pavilhão 112×80 com cúpula/estufa, bandeirolas arco-íris, vitrines temáticas e porta no centro.
- `feira.js`: hall e 5 salas; piso claro contrastante; ≥15 tipos de objetos por sala; estações acessíveis.

## Verificação
Cobertura dos 17 tópicos do livro e c1–c5, toque e teclado, tentativa livre, passaporte em memória, narração,
objetos e porta alcançáveis, todos os ícones existentes. Chrome CDP 127.0.0.1:9222 com contexto isolado,
servidor de teste e saves sintéticos. Nenhum acesso ao banco real.

Na Feira, uma peça experimentada recebe destaque tracejado suave e continua disponível. A marca vermelha/riscada
de questões (`arte.md` §19.2) não se aplica: a atividade é exploração sem nota, conforme o pedido.
`desenharCena.feita` é boolean; `escolha` é id ou null; `telaFeira.missao` é id da missão.

## Aura (pedido complementar de 01/10/2026)
Cada atividade concluída vale um passo da Aura. Em 02/10/2026 vale 4× esse passo pela configuração
existente `config.aura.materiaDoDia`; antes e depois vale 1×. A data segue o fuso do aparelho, como toda
a Aura do jogo. Não multiplica duas vezes nem aplica o multiplicador de outra matéria. O painel mostra
o aviso de amanhã/hoje e o ganho real. Passaporte permanece em memória; a Aura é salva pela API existente.
