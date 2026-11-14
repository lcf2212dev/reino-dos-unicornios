# Mariana e o Reino dos Unicórnios

Jogo de revisão escolar em pixel art: HTML, CSS e JavaScript puros, sem build e sem dependências no jogo.
A criança anda pelo reino, conversa com os unicórnios e revê o conteúdo da escola (matérias, provas e desafios).

- **Jogar:** https://reino-dos-unicornios.vercel.app — também instala como app e joga sem internet depois da
  primeira visita.
- **Como usar:** [COMO-USAR.md](COMO-USAR.md).
- **Código:** o mapa das pastas e as regras de cada uma estão em [docs/ARQUITETURA.md](docs/ARQUITETURA.md) e nos
  `CLAUDE.md` de cada pasta.

## Desenvolvimento

O jogo em si não tem build. As ferramentas (testes, validadores e fluxo de trabalho) rodam em Node:

```sh
npm install
npm test        # unidade, validadores, tamanho, dados e tipos
npm run e2e     # o jogo comparado com a base de imagens, no Chromium
```

Os demais comandos estão em [CLAUDE.md](CLAUDE.md).

## Licença

MIT — veja [LICENSE](LICENSE).
