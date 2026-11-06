# Jogar com amigos (servidores, como no PKXD)

Pedido do Leandro (06/11/2026), em texto livre: "Faça ser possível pessoas jogarem juntas no mesmo servidor."
Depois: "é a pessoa que cria o server (estilo no PKXD), e convida os amigos" e "se a pessoa nao criar, entao ela fica
sozinha, como já é".

Contrato: `docs/contratos/juntos.md`.

## O que é

Como no PKXD: quem quiser jogar junto **cria um servidor** (o reino gera um código de 4 letras e um link de convite),
manda o convite para os amigos, e quem entra cai no mesmo reino: os dois aparecem no mapa e dentro dos prédios,
andando, montados no unicórnio, com o nome em cima. Dá para acenar e mandar recados curtos escolhidos na tela. Cada um
continua com o seu save e a sua senha (`save-e-mescla.md` §12) — o servidor é só o lugar onde se encontram.
Quem não cria nem entra em servidor nenhum fica **sozinho, como sempre foi**.

## Decisões (decidido pelo agente)

- **Servidor de verdade, como no PKXD.** Quem cria vira o dono, recebe um código de 4 letras (sem I, O, 0 e 1) e um
  link `?servidor=XXXX`; quem abre o link (ou digita o código) entra no mesmo servidor. O servidor vive enquanto alguém
  está dentro (2 min sem ninguém e ele fecha) e o dono pode fechá-lo para todos.
- **A presença é do servidor, não do mundo.** O reino só mostra quem está no MESMO servidor e na mesma sala; quem não
  entrou em nenhum fica sozinho e o jogo não faz nenhum pedido de rede (é o jogo de antes, byte a byte, fora o botão 👥).
- **Nada do save vai para o servidor.** Só o que é efêmero: nome, lugar, posição, olhar, aparência (as cores e o corte
  que já aparecem no jogo), unicórnio montado e o último aceno/recado. O progresso continua um por login, intocável.
- **Um pedido de rede a cada 2,5 s dentro do servidor** (`POST /api/presenca`, que já devolve a lista), nada de
  WebSocket: a Vercel é serverless e o reino é de família. Quem fica 15 s sem falar some da lista.
- **Sala = cena ativa** (`mapa` no mapa; o id do interior dentro do prédio). A tela mostra o lugar de cada um.
- **Sem chat livre.** Recados prontos ("Oi!", "Vem cá!", "Que legal!", "Até logo!"), que é o que uma criança de 7
  anos usa sem teclado e sem moderação.
- **No `file:`, no artifact e no modo congelado dos testes**, a presença não faz nada (nem rede, nem pixel). O botão 👥
  do HUD aparece sempre — é a única mudança visível para quem joga sozinha, e o e2e a aceita de propósito.
- **Não mexe no servidor de casa** (`jogo/servidor/`), no container, no Docker nem no save da Mariana. O servidor de
  teste não tem as rotas; para conferir em casa, o teste de navegador sobe um proxy de TESTE só dele.

## Pronto quando

- [x] criar um servidor gera um código de 4 letras e um link de convite para mandar aos amigos
- [x] quem entra pelo link (ou digita o código) cai no mesmo servidor e vê o outro (avatar, unicórnio e nome)
- [x] quem não cria nem entra fica sozinho, como sempre foi (e sem nenhum pedido de rede)
- [x] quem sai do lugar (ou fecha o jogo) some da tela do outro; o dono pode fechar o servidor
- [x] botão 👥 no HUD abre a tela, com o código, o convite, quem está e o lugar de cada um
- [x] recados prontos e aceno aparecem em balão em cima do jogador, para todos do mesmo lugar
- [x] o save, a mescla e o banco do progresso ficam como estavam
