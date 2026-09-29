# Decisão: direção de arte (escala do mundo, cor por matéria, festa)

**Data:** 2026-09-29 · **Contexto:** backlog visual (`TODO-VISUAL.md`, item D10-19). As regras estão em
`docs/contratos/ui.md` §10.8 em diante; aqui fica só o porquê das escolhas de produto.

## Contexto
A auditoria visual achou o jogo coerente no traço (contorno único, tile de 16, cantos em degrau, sem desfoque), mas
sem regra escrita para cor, texto, escala e festa: cada tela decidia do seu jeito. Três escolhas não são técnicas,
são de produto, e precisavam de um motivo registrado.

## Decisão
1. **Escala do mundo pela altura (alvo de 18 tiles), não pelo lado menor.** A regra antiga (lado menor ÷ 200) dava
   2 px CSS por pixel no celular e 4 no notebook: no celular, NPCs e portas pequenos demais para o dedo de uma
   criança de 7 anos; no notebook, só 12 tiles de altura, com o HUD tapando o que ela procura. Com 18 tiles de
   altura o celular fica em 3 px CSS (personagem ≥ 44 px CSS, o alvo de toque), o notebook mostra 16 tiles e o
   tablet fica como está. O mínimo de 8 tiles no lado menor impede o celular em pé de virar um corredor.
2. **Uma cor e um ícone por matéria, do prédio ao prêmio.** Ela ainda está aprendendo a ler: reconhece a matéria
   pela cor e pelo desenho antes de ler o nome. Hoje só o telhado tem cor, há três azuis e duas "Torre". As seis
   cores são de famílias diferentes (um só azul) e ficam em faixa e desenho, nunca em texto: nenhuma serve ao mesmo
   tempo como texto no papel e como fundo da tinta (todas ficam abaixo de 4,5:1 no papel; só algumas passam com a
   tinta), e uma regra só para as seis evita exceção por matéria.
3. **Festa proporcional ao feito.** Terminar uma matéria (semanas de revisão) fazia menos festa que comprar um
   enfeite. A escala (acerto e compra < sala < prova < matéria completa) diz a ela, sem palavras, o que vale mais;
   compra fica no nível do acerto para a loja não competir com o estudo.

4. **Foco tracejado em `--tinta`, não roxo** (a §2 do TODO deixava "tracejado ou tinta"). O roxo já é a cor da
   seleção: com foco roxo a 1ª opção parecia marcada antes do toque. Tracejado e escuro lê como "estou aqui", não
   como "escolhi isto", e aparece em qualquer fundo claro.
5. **`.balao-respira` fica como exceção de movimento** (cresce contínuo, com `scale` fracionário). É o exercício
   de respirar do Ritual da Calma: o balão tem de encher devagar e sem saltos no ritmo da respiração (3,1 s); em
   degraus, o salto de tamanho atrapalharia o respirar. Como o balão é grande e sem texto, o borrão da borda não
   atrapalha a leitura.

## Consequências
- `camera.js` (`redimensionar`) muda de fórmula (D10-B09); o celular passa a mostrar ~8 tiles de largura e o e2e
  troca de base nos 3 tamanhos. Celular deitado (fora dos testes) fica no mínimo de 2 px CSS.
- Cada matéria ganha `cor` nos dados (D10-12); matéria nova escolhe uma cor de família livre (`ui.md` §10.22).
- Um nível de festa por tela de fim (D10-B10, D9-05); a compra na loja fica com o brilho curto do nível 1, sem
  confete.
