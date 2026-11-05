/* Nomes dos eventos do barramento Reino.util (on/emit), num lugar só: Reino.EVENTOS.
   Só dados (sem DOM): carrega logo depois de js/nucleo/util.js e também roda no Node.
   O valor de cada constante é o nome do evento (a string); ouvir: U.on(Reino.EVENTOS.CENA, fn),
   avisar: U.emit(Reino.EVENTOS.CENA, carga). Os ouvintes rodam na ordem em que se registraram.
   Em cada evento: quem emite, quem ouve e a carga (o argumento que chega ao ouvinte).
   Tipo: EventosReino (jogo/ferramentas/testes/tipos-jogo.d.ts); um nome qualquer de evento é `Evento`. */
window.Reino = window.Reino || {};

Reino.EVENTOS = {
  /* O progresso foi gravado ou trocado. Carga: o estado (objeto do save).
     Emite: sistemas/progresso.js (P.salvar e a junção com outra aba), sistemas/progresso-nuvem.js
     (estado vindo do servidor/claude.ai). Ouve: motor/main.js (HUD), sistemas/cuidados.js (zera o
     que falta gravar), motor/interiores-cena.js (redesenha o fundo do interior), motor/interiores-placas.js
     (refaz o texto das placas com {nome}/{uni}). */
  PROGRESSO: 'progresso',
  /* O estado veio de fora (outra aba ou a nuvem), logo depois de PROGRESSO. Carga: o estado.
     Emite: sistemas/progresso.js, sistemas/progresso-nuvem.js. Ouve: motor/main.js (reaplica os
     Ajustes e o HUD), motor/interiores-cena.js (redesenha o fundo do interior), motor/interiores-placas.js
     (texto das placas). */
  PROGRESSO_REMOTO: 'progressoRemoto',
  /* Algo que aparece no mapa mudou (compra, montaria, nome, prova, novo ciclo, Animações). Sem carga.
     Emite: ui/loja.js, ui/estabulo.js, ui/ovos.js, ui/materia.js, ui/pais.js, ui/ajustes.js (também
     depois da Aparência), atividades/provas.js, personagens/npcs-conversa.js.
     Ouve: motor/main.js (HUD e redesenho), motor/interiores-cena.js (redesenha o fundo do interior),
     motor/interiores-placas.js (texto das placas). */
  MAPA_MUDOU: 'mapaMudou',
  /* Uma sala virou trilha perfeita (⭐ em todas as etapas; docs/contratos/quarto-bimestre.md §14) e os 3 prêmios
     foram entregues. Carga: { sala, materia } (ids). Emite: sistemas/trilhas.js (P.conferirTrilhas).
     Ouve: atividades/missao-etapas.js (festa do prêmio), interiores/portugues/lp-tesouros.js (pedestal aceso). */
  TRILHA_PERFEITA: 'trilhaPerfeita',
  /* Começou (true) ou terminou (false) a transição em íris. Carga: boolean.
     Emite: motor/transicao.js. Ouve: ui/hud.js (botão das fotos). */
  TRANSICAO: 'transicao',
  /* Fome, sede ou banho mudaram de faixa (ou foram cuidados). Carga: Reino.Cuidados.depurar().
     Emite: sistemas/cuidados.js. Ouve: ui/cuidados.js (pinta as barras). */
  CUIDADOS: 'cuidados',
  /* A pilha de telas mudou (abriu ou fechou uma). Carga: quantas telas estão abertas (número).
     Emite: ui/base.js. Ouve, já na carga: ui/cuidados.js (dois ouvintes: balão do NPC e recado),
     ui/hud.js (botão das fotos), motor/cena.js (painel antigo de lugar), motor/laco.js (pausa o laço);
     e, quando o jogo começa: sistemas/cuidados.js (fecha o lembrete), sistemas/surpresa.js (painel e
     hora de estudo), sistemas/som-musica.js (música). */
  TELAS: 'telas',
  /* A cena ativa trocou (mapa ↔ interior). Carga: { de, para } (ids das cenas).
     Emite: motor/cena.js (trocarCena). Ouve: sistemas/cuidados.js (fecha o lembrete ao entrar na Pet Shop),
     sistemas/som-musica.js (música), ui/hud.js (botão das fotos). */
  CENA: 'cena',
  /* A cena ficou ocupada por uma animação no canvas, ou foi liberada. Carga: o motivo (texto) ou null.
     Emite: motor/cena.js (Cena.ocupar / Cena.liberar). Ouve: sistemas/som-musica.js, ui/hud.js. */
  OCUPADA: 'ocupada',
  /* Pedido para andar até um lugar do mapa (de dentro de um prédio, sai primeiro). Carga: o lugar.
     Emite: ui/lugares.js (menu Lugares), ui/estabulo.js. Ouve: motor/laco.js (Cena.irAoLugar). */
  IR_PARA: 'irPara',
  /* O status da sincronização mudou. Carga: 'sincronizado' | 'erro' | 'local' (nuvem.status).
     Emite: sistemas/progresso-nuvem.js. Ouve: ninguém no jogo (os testes em ferramentas/testes ouvem). */
  NUVEM: 'nuvem',
  /* O nome ou o sexo do jogador mudou (Reino.Jogadores.definirPerfil). Carga: { nome, sexo }.
     Emite: sistemas/jogadores.js. Ouve: quem mostra o nome ou desenha o personagem (a tela de criar personagem),
     motor/interiores-placas.js (texto das placas com {nome}). */
  PERFIL: 'perfil',
  /* Respostas conferidas (as mesmas que contam na Aura: salas, treino, provas, pergunta surpresa).
     Carga: { certas, erradas } (números; nota parcial não entra). Emite: sistemas/aura.js (Reino.Aura.contar,
     antes de gravar a Aura). Ouve: sistemas/viagem.js (o combustível do foguete). */
  RESPOSTAS: 'respostas',
  /* Algo aconteceu no Bosque dos Fantasmas (docs/contratos/bosque.md). Carga: { tipo, ... }:
     'vida' (a vida dela mudou), 'golpe' (ela atacou), 'vencido' { id, tipo } (um fantasma foi vencido),
     'desmaio' (a vida zerou), 'acerto' (pergunta certa), 'ponto' (ponto de habilidade posto).
     Emite: sistemas/bosque-combate.js (vida, golpe, vencido, desmaio), sistemas/bosque.js (acerto, ponto).
     Ouve: ui/bosque-hud.js (chip e botão da espada), ui/bosque-pergunta.js (abre a pergunta no 'vencido'). */
  BOSQUE: 'bosque',
};
