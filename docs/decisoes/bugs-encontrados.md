# Bugs encontrados durante a refatoração

Regra: nada é consertado no meio da refatoração. No fim, com tudo verde, os bugs seguros são
corrigidos em commits separados, cada um com teste, e só a referência afetada é atualizada.

| # | Onde | O que acontece | Seguro corrigir? | Situação |
|---|---|---|---|---|
| 1 | sistemas/progresso (P.mesclar) | Lança `TypeError` quando um dos lados é um save sem `salas` ou sem `unis` (ex.: save antigo/incompleto vindo de outra aba ou do servidor): `Cannot read properties of undefined (reading 'h1')`. Referência: dados/save-mescla.json, pares com `lixo`. | Não mexer na regra da mescla nesta tarefa (regra C). Registrar. | aberto |
| 2 | ui/pais (tela dos pais) | O texto diz "Digite o PIN dos pais (definido em js/config.js)", mas o arquivo agora é js/nucleo/config.js. | Sim (só texto para o Leandro; imagem tela-pais muda). | aberto |
