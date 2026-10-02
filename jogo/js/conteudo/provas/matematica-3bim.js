/* Catálogo de compatibilidade do 3º bimestre. Original integral em arquivo/terceiro-bimestre/jogo/js/conteudo/provas/matematica-3bim.js.
   Sem atividades disponíveis; IDs preservam progresso, recompensas e identidade do lugar. */
Reino.registrarPersonagem({
  "id": "prof-celia",
  "nome": "Professora Célia",
  "paraProva": "matematica-3bim",
  "sprite": {
    "pele": "#c98e62",
    "cabelo": "#2b1a12",
    "penteado": "coque",
    "roupa": "#3f7fe0",
    "roupa2": "#ffc93c",
    "perna": "saia",
    "livro": "#3f7fe0",
    "presilha": true
  },
  "perfil": {
    "voz": "pt-BR-ThalitaMultilingualNeural",
    "velocidade": "-6%",
    "tom": "+2Hz"
  }
});
Reino.registrarProva({
  "id": "matematica-3bim",
  "materiaId": "matematica",
  "nome": "Revisão Bimestral de Matemática",
  "bimestre": "3º bimestre",
  "emoji": "🔢",
  "acessorios": {
    "lendario": {
      "id": "coroa-numeros",
      "nome": "Coroa dos Números",
      "desenho": {
        "linhas": [
          "k..k..k",
          "yk.y.ky",
          "yykyyyy",
          "yrybyyg",
          "YYYYYYY"
        ],
        "paleta": {
          "k": "#3a2446",
          "y": "#ffd34d",
          "Y": "#e0a800",
          "r": "#e0433f",
          "b": "#2f6fd6",
          "g": "#3fbf7f"
        },
        "ancora": "cabeca",
        "dx": -3,
        "dy": -5
      },
      "icone": {
        "n": "Coroa dos Números",
        "p": {
          "k": "#3a2446",
          "y": "#ffd34d",
          "Y": "#e0a800",
          "r": "#e0433f",
          "b": "#2f6fd6",
          "g": "#3fbf7f"
        },
        "d": [
          "................",
          "................",
          "................",
          "..k....k....k...",
          ".kyk..kyk..kyk..",
          ".kyyk.kyk.kyyk..",
          ".kyyykyyykyyyk..",
          ".kyyyyyyyyyyyk..",
          ".kyrryybbyyggk..",
          ".kyrryybbyyggk..",
          ".kyyyyyyyyyyyk..",
          ".kYYYYYYYYYYYk..",
          "..kkkkkkkkkkk...",
          "................",
          "................",
          "................"
        ]
      }
    },
    "raro": {
      "id": "relogio-bolso",
      "nome": "Relógio de Bolso",
      "desenho": {
        "linhas": [
          "..y..",
          ".kkk.",
          "kwkwk",
          "kwkkk",
          ".kkk."
        ],
        "paleta": {
          "k": "#3a2446",
          "y": "#ffd34d",
          "w": "#ffffff"
        },
        "ancora": "pescoco",
        "dx": -2,
        "dy": 0
      },
      "icone": {
        "n": "Relógio de Bolso",
        "p": {
          "k": "#3a2446",
          "y": "#ffd34d",
          "w": "#ffffff"
        },
        "d": [
          "................",
          "......kkk.......",
          ".....kyyyk......",
          "......kyk.......",
          "....kkkkkkk.....",
          "...kwwwwwwwk....",
          "..kwwwwkwwwwk...",
          "..kwwwwkwwwwk...",
          "..kwwwwkkkwwk...",
          "..kwwwwwwwwwk...",
          "..kwwwwwwwwwk...",
          "...kwwwwwwwk....",
          "....kkkkkkk.....",
          "................",
          "................",
          "................"
        ]
      }
    },
    "comum": {
      "id": "laco-tabuada",
      "nome": "Laço da Tabuada",
      "desenho": {
        "linhas": [
          "kk..kk",
          "kbkkbk",
          "kbkkbk",
          "kk..kk"
        ],
        "paleta": {
          "k": "#3a2446",
          "b": "#3f7fe0"
        },
        "ancora": "orelha",
        "dx": -2,
        "dy": 0
      },
      "icone": {
        "n": "Laço da Tabuada",
        "p": {
          "k": "#3a2446",
          "b": "#3f7fe0",
          "w": "#ffffff"
        },
        "d": [
          "................",
          "................",
          "................",
          ".kkk.......kkk..",
          "kbbbkk...kkbbbk.",
          "kbbbbbk.kbbbbbk.",
          "kbbwbbbkbbbwbbk.",
          "kbbbbbkkkbbbbbk.",
          "kbbbbbkwkbbbbbk.",
          "kbbbbbkkkbbbbbk.",
          "kbbbbbk.kbbbbbk.",
          "kbbbkk...kkbbbk.",
          ".kkk.......kkk..",
          "................",
          "................",
          "................"
        ]
      }
    }
  },
  "questoes": [],
  "arquivada": true
});
