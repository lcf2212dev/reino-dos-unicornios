# Confere por transcrição (faster-whisper) as gravações NOVAS de voz: transcreve só o que não estava
# no índice antes e compara com o texto falado (normalizado: sem acento, pontuação nem maiúsculas).
# Acusa as que divergem (a voz embolou, trocou palavra, leu sigla errado) e sai com código 1.
# Uso (da raiz do repositório):
#   python3 jogo/ferramentas/vozes/conferir-vozes.py [--antes <vozes-indice antigo.json>] [--modelo small] [--limite 0.8]
#     --antes: índice de antes da gravação (o vozes.js passa a cópia que guardou); sem ele, o do último
#              commit (git show HEAD:jogo/ferramentas/gerado/vozes-indice.json)
#   python3 jogo/ferramentas/vozes/conferir-vozes.py --amostras a.mp3[=texto] b.mp3[=texto] [--lingua pt]
#     transcreve arquivos avulsos (ex.: amostras-de-voz/); com =texto, compara também
# Sem gravação nova, sai com 0 sem carregar o faster-whisper. Sem faster-whisper instalado, explica como instalar.
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
GERADO = os.path.join(AQUI, '..', 'gerado')
REPO = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
VENV = '/tmp/reino-testes/venv-whisper'
COMO_INSTALAR = f"""✘ faster-whisper não está instalado. Instale num venv em /tmp (não entra no projeto):
    python3 -m venv {VENV}
    {VENV}/bin/pip install faster-whisper
  e rode de novo com esse python:
    {VENV}/bin/python jogo/ferramentas/vozes/conferir-vozes.py {' '.join(sys.argv[1:])}
  (ou, com uv: uv run --with faster-whisper python jogo/ferramentas/vozes/conferir-vozes.py …)
  Na 1ª vez o modelo é baixado da internet (small: ~500 MB)."""


def opcao(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


def normalizar(t):
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r"[^a-z0-9]+", ' ', t)
    return ' '.join(t.split())


def parecido(a, b):
    return difflib.SequenceMatcher(None, normalizar(a).split(), normalizar(b).split()).ratio()


def indice_antes():
    arq = opcao('--antes')
    if arq:
        return json.load(open(arq, encoding='utf-8'))
    r = subprocess.run(['git', '-C', REPO, 'show', 'HEAD:jogo/ferramentas/gerado/vozes-indice.json'], capture_output=True, text=True)
    if r.returncode != 0:
        print('  (sem índice no último commit: todas as gravações contam como novas)')
        return {}
    return json.loads(r.stdout)


def carregar_modelo():
    # modelo baixado para /tmp (não enche a pasta pessoal); HF_HOME definido por fora vale
    os.environ.setdefault('HF_HOME', '/tmp/reino-testes/hf')
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(COMO_INSTALAR)
        sys.exit(2)
    modelo = opcao('--modelo', 'small')
    print(f'  carregando o modelo {modelo} do faster-whisper (CPU)…', flush=True)
    return WhisperModel(modelo, device='cpu', compute_type='int8')


def transcrever(modelo, arquivo, lingua):
    partes, _ = modelo.transcribe(arquivo, language=lingua, beam_size=5, vad_filter=False)
    return ' '.join(p.text.strip() for p in partes).strip()


def amostras():
    i = sys.argv.index('--amostras')
    itens = [a for a in sys.argv[i + 1:] if not a.startswith('--')]
    itens = [a for a in itens if a not in (opcao('--lingua'), opcao('--modelo'), opcao('--limite'))]
    modelo, lingua, limite = carregar_modelo(), opcao('--lingua', 'pt'), float(opcao('--limite', '0.8'))
    ruins = 0
    for item in itens:
        arq, _, texto = item.partition('=')
        ouvido = transcrever(modelo, arq, lingua)
        if texto:
            nota = parecido(texto, ouvido)
            ok = nota >= limite
            ruins += not ok
            print(f"  {'✔' if ok else '✘'} {os.path.basename(arq)} ({nota:.0%}): esperado «{texto}» · ouvido «{ouvido}»")
        else:
            print(f'  • {os.path.basename(arq)}: «{ouvido}»')
    return ruins


def novas():
    dados = json.load(open(os.path.join(GERADO, 'falas.json'), encoding='utf-8'))
    indice = json.load(open(os.path.join(GERADO, 'vozes-indice.json'), encoding='utf-8'))
    antes = indice_antes()
    # vozes inglesas: 'ingles' e todo perfil usado como `ingles` de outro perfil (como no listar-falas.js)
    inglesas = {'ingles'} | {v['ingles'] for v in dados['vozes'].values() if isinstance(v, dict) and v.get('ingles')}
    lista = [f for f in dados['falas'] if f['chave'] in indice and antes.get(f['chave']) != indice[f['chave']]]
    if not lista:
        print('✔ nenhuma gravação nova para conferir')
        return 0
    print(f'Conferindo {len(lista)} gravação(ões) nova(s) por transcrição…', flush=True)
    modelo, limite = carregar_modelo(), float(opcao('--limite', '0.8'))
    ruins = []
    for n, f in enumerate(lista, 1):
        arq = os.path.join(GERADO, 'vozes-cache', indice[f['chave']])
        ouvido = transcrever(modelo, arq, 'en' if f['voz'] in inglesas else 'pt')
        nota = parecido(f['fala'], ouvido)
        if nota < limite:
            ruins.append((f, ouvido, nota))
        if n % 25 == 0:
            print(f'  {n}/{len(lista)}…', flush=True)
    for f, ouvido, nota in ruins:
        print(f"  ✘ {f['voz']} ({nota:.0%}) {indice[f['chave']]}\n      texto: «{f['fala']}»\n      ouvido: «{ouvido}»")
    print(f"{'✘' if ruins else '✔'} {len(lista) - len(ruins)} de {len(lista)} gravações novas batem com o texto (limite {limite:.0%})")
    return len(ruins)


if __name__ == '__main__':
    sys.exit(1 if (amostras() if '--amostras' in sys.argv else novas()) else 0)
