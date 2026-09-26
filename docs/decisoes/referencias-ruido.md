# Ruído de antialiasing nas referências de imagem

**Data:** 2026-09-26 · **Contexto:** refatoração (branch feat/refatoracao)

## Problema
No modo determinístico (`?debug=1&congelar=1`) a mesma cena, capturada duas vezes, sai idêntica
em quase tudo. A exceção: no **celular** (densidade de pixels 3), elementos com `transform: scale`
estático (o ponto atual das salas, `.ponto.atual`, e o balão do Ritual da Calma, `.balao-respira`)
às vezes saem com ±1 a 3 de diferença nos pixels da borda (7 a 20 pixels por imagem).

Tentado sem sucesso: rasterização sem GPU e com uma thread, perfil de cor sRGB, sem hinting,
movimento reduzido no contexto, CSS sem animações nem transições desde o carregamento, duas capturas
seguidas. A variação é do rasterizador do Chromium, não do jogo.

## Decisão
O comparador (`ferramentas/testes/referencias.js`) separa:
- **ruído**: pixel que muda no máximo 4 em cada canal; até 64 pixels assim por imagem são
  aceitos e informados à parte;
- **pixel forte solto**: até 4 pixels (do aparelho) que mudam mais que isso numa imagem também contam como ruído
  (o Chromium às vezes varia 1–2 pixels entre execuções; decisão de 2026-09-26);
- **diferença**: mais de 4 pixels fortes, ou mais de 64 pixels de ruído na mesma imagem. Uma diferença reprova.

Qualquer mudança real de desenho (cor, posição, forma) muda os pixels muito mais que 4 e reprova.
