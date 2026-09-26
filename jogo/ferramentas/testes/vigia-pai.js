// Carregado com `node -r vigia-pai.js servidor/servidor.js` pelo servidor-teste.js (não muda o servidor):
// quando o processo pai some (terminou, caiu ou levou kill -9), o canal IPC fecha e o servidor de
// TESTE sai junto. Sem canal (servidor rodado à mão) não faz nada.
if (process.channel) {
  process.on('disconnect', () => process.exit(0));
  process.channel.unref();
}
