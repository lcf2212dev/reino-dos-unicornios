/* Bosque dos Fantasmas: o portal no mapa (Mapa.PREDIOS['portal-bosque'], 1 × 1 tile; docs/contratos/bosque.md).
   Um disco chato no chão, dentro do próprio tile (ela pisa em cima e aparece na frente): aro lilás, redemoinho
   rosa e estrelinhas. O brilho (Mapa.PREDIOS_ANIM['portal-bosque'], só com Animações) é para ser visto de longe:
   halo que pulsa por fora do aro, miolo pulsando, coluna de luz, faíscas 2×2 subindo e estrelinhas piscando.
   O desenho mora em arte/portal.js (Reino.Portal), o mesmo dos portais das outras arenas (arenas.md); sem cores, o
   do Bosque. O sprite tem folga de 16 px dos lados e 40 em cima. */
Reino.Portal.registrar('portal-bosque');
