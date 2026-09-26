# Confere por transcrição (faster-whisper) as gravações NOVAS de voz: transcreve só o que não estava
# no índice antes e compara com o texto falado (normalizado: sem acento, pontuação nem maiúsculas).
# Acusa as que divergem (a voz embolou, trocou palavra, leu sigla errado) e sai com código 1.
# Uso (da raiz do repositório):
#   python3 jogo/ferramentas/vozes/conferir-vozes.py [--antes <vozes-indice antigo.json>] [--modelo small] [--limite 0.8]
#                                                     [--segunda medium | --sem-segunda]
#     --antes: índice de antes da gravação (o vozes.js passa a cópia que guardou); sem ele, o do último
#              commit (git show HEAD:jogo/ferramentas/gerado/vozes-indice.json)
#     --segunda: as reprovadas são transcritas de novo com um modelo maior (padrão medium; ~1,5 GB na 1ª vez)
#     Fala de 1–2 palavras que ainda diverge não reprova: vai para "conferir de ouvido" (o transcritor erra
#     palavra solta, ex.: "peixe" → "Deixe"), com o arquivo para ouvir.
# A comparação aceita algarismo x extenso ("3, 2, 1" = "três, dois, um"), "R$ 16" = "16 reais",
# "pro/pra" = "para o/para a" e colmeia/coméia.
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
VENV = os.path.join(REPO, '.vozes', 'venv-whisper')   # .vozes/ é ignorado pelo git (fora do /tmp, que é memória)
COMO_INSTALAR = f"""✘ faster-whisper não está instalado. Instale no venv do projeto (.vozes/, ignorado pelo git):
    python3 -m venv {VENV}
    {VENV}/bin/pip install faster-whisper
  e rode de novo com esse python (o npm run vozes já usa esse venv se ele existir):
    {VENV}/bin/python jogo/ferramentas/vozes/conferir-vozes.py {' '.join(sys.argv[1:])}
  (ou, com uv: uv run --with faster-whisper python jogo/ferramentas/vozes/conferir-vozes.py …)
  Na 1ª vez o modelo é baixado da internet (small: ~500 MB) para ~/.cache/huggingface."""


def opcao(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


UNIDADES = 'zero um dois tres quatro cinco seis sete oito nove dez onze doze treze quatorze quinze dezesseis dezessete dezoito dezenove'.split()
DEZENAS = ' dez vinte trinta quarenta cinquenta sessenta setenta oitenta noventa'.split(' ')
CENTENAS = ' cento duzentos trezentos quatrocentos quinhentos seiscentos setecentos oitocentos novecentos'.split(' ')
# o transcritor escreve diferente do texto, mas a voz disse certo
TROCAS = {'pro': 'para o', 'pra': 'para a', 'pros': 'para os', 'pras': 'para as', 'uma': 'um', 'catorze': 'quatorze',
          'comeia': 'colmeia', 'comeias': 'colmeias', 'real': 'reais'}


def extenso(n):
    if n < 20:
        return UNIDADES[n]
    if n < 100:
        return DEZENAS[n // 10] + ('' if n % 10 == 0 else ' e ' + UNIDADES[n % 10])
    if n == 100:
        return 'cem'
    if n < 1000:
        return CENTENAS[n // 100] + ('' if n % 100 == 0 else ' e ' + extenso(n % 100))
    return str(n)


def normalizar(t):
    t = re.sub(r'R\$\s?(\d+)(?:,(\d{2}))?', lambda m: m.group(1) + ' reais' + (' e ' + m.group(2) + ' centavos' if m.group(2) and m.group(2) != '00' else ''), t)
    t = re.sub(r'(\d),00\b', r'\1', t)
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r"[^a-z0-9]+", ' ', t)
    t = re.sub(r'\b(\d+)\b', lambda m: extenso(int(m.group(1))), t)
    return ' '.join(TROCAS.get(p, p) for p in t.split())


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


def carregar_modelo(nome=None):
    # modelo no cache padrão do usuário (~/.cache/huggingface; HF_HOME definido por fora vale)
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(COMO_INSTALAR)
        sys.exit(2)
    modelo = nome or opcao('--modelo', 'small')
    print(f'  carregando o modelo {modelo} do faster-whisper (CPU)…', flush=True)
    return WhisperModel(modelo, device='cpu', compute_type='int8')


def transcrever(modelo, arquivo, lingua):
    partes, _ = modelo.transcribe(arquivo, language=lingua, beam_size=5, vad_filter=False)
    return ' '.join(p.text.strip() for p in partes).strip()


def amostras():
    i = sys.argv.index('--amostras')
    itens = [a for a in sys.argv[i + 1:] if not a.startswith('--')]
    itens = [a for a in itens if a not in (opcao('--lingua'), opcao('--modelo'), opcao('--limite'), opcao('--segunda'))]
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
    segunda = opcao('--segunda', 'medium')
    if ruins and '--sem-segunda' not in sys.argv and segunda != opcao('--modelo', 'small'):
        print(f'  {len(ruins)} divergiram: 2ª passada só nelas com o modelo {segunda}…', flush=True)
        maior, de_novo = carregar_modelo(segunda), []
        for f, ouvido, nota in ruins:
            arq = os.path.join(GERADO, 'vozes-cache', indice[f['chave']])
            ouvido = transcrever(maior, arq, 'en' if f['voz'] in inglesas else 'pt')
            nota = parecido(f['fala'], ouvido)
            if nota < limite:
                de_novo.append((f, ouvido, nota))
        ruins = de_novo
    # palavra solta (1–2 palavras): o transcritor erra mesmo com a voz certa; não reprova, vai para o ouvido
    ouvir = [r for r in ruins if len(normalizar(r[0]['fala']).split()) <= 2]
    ruins = [r for r in ruins if r not in ouvir]
    for f, ouvido, nota in ruins:
        print(f"  ✘ {f['voz']} ({nota:.0%}) {indice[f['chave']]}\n      texto: «{f['fala']}»\n      ouvido: «{ouvido}»")
    if ouvir:
        print(f'  palavra solta (1–2 palavras): conferir de ouvido ({len(ouvir)}), não reprova sozinha')
        for f, ouvido, nota in ouvir:
            print(f"  ? {os.path.join(GERADO, 'vozes-cache', indice[f['chave']])}\n      texto: «{f['fala']}» · ouvido: «{ouvido}»")
    print(f"{'✘' if ruins else '✔'} {len(lista) - len(ruins) - len(ouvir)} de {len(lista)} gravações novas batem com o texto"
          f" (limite {limite:.0%}){f', {len(ouvir)} para ouvir' if ouvir else ''}")
    return len(ruins)


if __name__ == '__main__':
    sys.exit(1 if (amostras() if '--amostras' in sys.argv else novas()) else 0)
