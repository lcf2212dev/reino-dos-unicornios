FROM node:24-alpine
# o jogo entra por volume (somente leitura), então mudanças aparecem sem reconstruir
WORKDIR /app
ENV RAIZ=/app BANCO=/dados/reino.db PORTA=80
EXPOSE 80
CMD ["node", "servidor/servidor.js"]
