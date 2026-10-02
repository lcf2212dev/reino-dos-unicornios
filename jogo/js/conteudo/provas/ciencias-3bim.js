/* Catálogo de compatibilidade do 3º bimestre. Original integral em arquivo/terceiro-bimestre/jogo/js/conteudo/provas/ciencias-3bim.js.
   Sem atividades disponíveis; IDs preservam progresso, recompensas e identidade do lugar. */
Reino.registrarPersonagem({
  "id": "prof-flora",
  "nome": "Professora Flora",
  "paraProva": "ciencias-3bim",
  "sprite": {
    "pele": "#f1c7a5",
    "cabelo": "#5a3825",
    "penteado": "chanel",
    "roupa": "#39a860",
    "roupa2": "#6b4a9a",
    "perna": "saia",
    "livro": "#139a8c"
  },
  "perfil": {
    "voz": "de-DE-SeraphinaMultilingualNeural",
    "velocidade": "-2%",
    "tom": "+6Hz"
  }
});
Reino.registrarProva({
  "id": "ciencias-3bim",
  "materiaId": "ciencias",
  "nome": "Revisão Bimestral de Ciências",
  "bimestre": "3º bimestre",
  "emoji": "🔬",
  "acessorios": {
    "lendario": {
      "id": "oculos-cientista",
      "nome": "Óculos de Cientista",
      "desenho": {
        "linhas": [
          ".yyy.yyy.",
          "ywbbybwby",
          "ybbbkbbby",
          ".yyy.yyy."
        ],
        "paleta": {
          "k": "#3a2446",
          "y": "#ffd34d",
          "b": "#7fd6ff",
          "w": "#ffffff"
        },
        "ancora": "olho",
        "dx": -4,
        "dy": -1
      },
      "icone": {
        "n": "Óculos de Cientista",
        "p": {
          "k": "#3a2446",
          "y": "#ffd34d",
          "b": "#7fd6ff",
          "w": "#ffffff"
        },
        "d": [
          "................",
          "................",
          "................",
          "................",
          "..yyyy....yyyy..",
          ".ywwbby..ywwbby.",
          "kywbbbyyyywbbbyk",
          "kybbbbykkybbbbyk",
          ".ybbbby..ybbbby.",
          "..yyyy....yyyy..",
          "................",
          "................",
          "................",
          "................",
          "................",
          "................"
        ]
      }
    },
    "raro": {
      "id": "lupa-exploradora",
      "nome": "Lupa de Exploradora",
      "desenho": {
        "linhas": [
          ".kkk..",
          "kbwbk.",
          "kbbbk.",
          ".kkkm.",
          "....mm"
        ],
        "paleta": {
          "k": "#3a2446",
          "b": "#9fd8ff",
          "w": "#ffffff",
          "m": "#8a5a2b"
        },
        "ancora": "pescoco",
        "dx": -2,
        "dy": 0
      },
      "icone": {
        "n": "Lupa de Exploradora",
        "p": {
          "k": "#3a2446",
          "b": "#9fd8ff",
          "w": "#ffffff",
          "m": "#8a5a2b"
        },
        "d": [
          "................",
          "....kkkkk.......",
          "...kbbbbbk......",
          "..kbwwbbbbk.....",
          "..kbwbbbbbk.....",
          "..kbbbbbbbk.....",
          "..kbbbbbbbk.....",
          "...kbbbbbk......",
          "....kkkkkm......",
          ".........mm.....",
          "..........mm....",
          "...........mm...",
          "............mm..",
          ".............m..",
          "................",
          "................"
        ]
      }
    },
    "comum": {
      "id": "broto-cabeca",
      "nome": "Brotinho na Cabeça",
      "desenho": {
        "linhas": [
          ".kk.kk.",
          "kgGkGgk",
          ".kkGkk.",
          "..kGk.."
        ],
        "paleta": {
          "k": "#3a2446",
          "g": "#6fdc8c",
          "G": "#2f9e55"
        },
        "ancora": "cabeca",
        "dx": -3,
        "dy": -4
      },
      "icone": {
        "n": "Brotinho na Cabeça",
        "p": {
          "k": "#3a2446",
          "g": "#6fdc8c",
          "G": "#2f9e55",
          "m": "#8a5a2b"
        },
        "d": [
          "................",
          "................",
          "...kkk....kkk...",
          "..kgggk..kgggk..",
          ".kgGggkkkggGgk..",
          ".kggGGkGkGGggk..",
          "..kkkkkGkkkkk...",
          "......kGk.......",
          "......kGk.......",
          "......kGk.......",
          "....mmmmmmm.....",
          "...mmmmmmmmm....",
          "................",
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
