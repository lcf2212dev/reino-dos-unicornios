# Receita: lições de voz (escrever falas que a voz lê bem)

Para que serve: as regras aprendidas gravando o jogo, para quem escreve fala de personagem, balão do Claude,
curiosidade ou enunciado. Contrato: `docs/contratos/som-musica-e-voz.md` §5 e `docs/contratos/npcs-e-dialogo.md` §10.

## As regras
1. **Até 30 letras por página de fala** (sem contar «» e emoji). No celular cabem ~15–17 letras por linha e o
   balão tem 2 linhas. Fala maior vira mais páginas (lista de frases curtas, uma por página).
   O validador só avisa acima de 44 (`jogo/ferramentas/validar/validar-interiores.js`); o alvo é 30.
2. **Frases de 3 palavras ou mais.** Cada frase vira um áudio; as vozes multilíngues embolam frase de 1–2
   palavras, sobretudo colada a inglês ("Sou a «Miss Stella»" saiu "Soa"). Escreva "Eu sou a «Miss Stella».".
3. **Inglês entre «»**, com o padrão «palavra» + "quer dizer <português>.". Na tela aparece destacado, sem os
   sinais; a voz inglesa do perfil lê.
4. **Pontuação conta**: vírgula e ponto mudam a chave e o ritmo. Texto igual em dois lugares = um áudio só.
5. **Números que mudam**: enumere (cada valor é uma gravação). "R$ 4,00" vira "4 reais"; datas "15/04/1956"
   viram "15 de abril de 1956" (`jogo/ferramentas/vozes/listar-falas.js`).
6. **Palavras em MAIÚSCULAS** são lidas como palavra (viram minúsculas). **Letras sozinhas em MAIÚSCULAS**
   ("usando X ou CH", "a letra H") são lidas pelo nome (xis, cê agá…), só nos pacotes de Português.
7. **Sílabas separadas por hífen** (`bal-de`) ganham uma pausa em cada hífen; palavras compostas e pronomes
   ("bem-vinda", "lave-os") não.
8. **Pronúncia errada** (conferida por transcrição): acrescente em `PRONUNCIA` do `listar-falas.js` (ex.: kiwi →
   kiuí); só o texto falado muda, a tela não.
9. **Lacuna** (`__`) vira pausa; no `completar` com `colado: true` a narradora lê só o enunciado.
10. **Conferência por transcrição**: toda gravação nova passa pela conferência do `npm run vozes`
    (faster-whisper). Divergiu: reescreva a frase (regra 2) ou use a pronúncia (regra 8), e grave de novo.
11. **Tom**: pt-BR correto e carinhoso, para uma criança de 7 anos. Personagem não imita pessoa real.

## Antes de entregar
```
node jogo/ferramentas/vozes/listar-falas.js --mostrar   # como cada fala vai ser lida
npm run validar
```
