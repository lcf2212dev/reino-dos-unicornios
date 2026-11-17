# 2026-11-07 — A pergunta da batalha só fecha acertada

Pedido: "na batalha, ao exibir a pergunta, é possível fechar ela. só fecha ao responder ela corretamente." Tamanho P.
Feito (`ui/bosque-pergunta.js`, `bosque.md` §5): sem ✕, Esc nem toque fora; errou → a certa à vista e "Tentar de
novo" com a mesma pergunta em branco, até acertar; o "Continuar" só aparece no acerto.
## Decidido pelo Claude
- O prêmio (estrela, Aura, móvel) continua sendo só da 1ª tentativa; acertar depois só fecha (nada premia chute).
- Só a batalha (Bosque e arenas); a pergunta dos lojistas da Vila fica como estava.
- Tela fechada por fora (troca de cena, fecharTodas) continua resolvendo como erro, para a fila não travar.
