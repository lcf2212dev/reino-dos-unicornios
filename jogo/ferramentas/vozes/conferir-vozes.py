# Confere por transcrição (faster-whisper) as gravações NOVAS de voz: transcreve só o que não estava
# no índice antes e compara com o texto falado (normalizado: sem acento, pontuação nem maiúsculas).
# Acusa as que divergem (a voz embolou, trocou palavra, leu sigla errado) e sai com código 1.
# Uso (da raiz do repositório):
#   python3 jogo/ferramentas/vozes/conferir-vozes.py [--antes <vozes-indice antigo.json>] [--modelo small] [--limite 0.8]
#                                                     [--segunda medium | --sem-segunda] [--processos N] [--feixe 1]
#     --antes: índice de antes da gravação (o vozes.js passa a cópia que guardou); sem ele, o do último
#              commit (git show HEAD:jogo/ferramentas/gerado/vozes-indice.json)
#     --segunda: as reprovadas são transcritas de novo com um modelo maior (padrão medium; ~1,5 GB na 1ª vez)
#     --processos: transcritores em paralelo na 1ª passada (padrão: 1 a cada 4 núcleos, até 6; 1 = sem paralelo)
#     --feixe: beam_size da 1ª passada (padrão 1, rápido); a 2ª passada usa sempre 5. Conferido em 2026-10-29: 30
#              gravações antigas com feixe 1 em 6 processos deram o mesmo veredito que o antigo (feixe 5, sequencial)
#     Fala de 1–2 palavras que ainda diverge não reprova: vai para "conferir de ouvido" (o transcritor erra
#     palavra solta, ex.: "peixe" → "Deixe"), com o arquivo para ouvir.
# A comparação aceita algarismo x extenso ("3, 2, 1" = "três, dois, um"), "R$ 16" = "16 reais",
# "pro/pra" = "para o/para a" e colmeia/coméia. Palavra que o transcritor não conhece (VOCABULARIO, ex.: Robux) vai
# de dica (initial_prompt) quando está no texto: sem ela, a voz certa sai transcrita como outra palavra.
#   python3 jogo/ferramentas/vozes/conferir-vozes.py --amostras a.mp3[=texto] b.mp3[=texto] [--lingua pt]
#     transcreve arquivos avulsos (ex.: amostras-de-voz/); com =texto, compara também
# Sem gravação nova, sai com 0 sem carregar o faster-whisper. Sem faster-whisper instalado, explica como instalar.
import concurrent.futures
import difflib
import importlib.util
import multiprocessing
import json
import os
import re
import subprocess
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
GERADO = os.path.join(AQUI, '..', 'gerado')
REPO = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
# venv único para todas as worktrees (o mesmo do vozes.js); REINO_VOZES_VENV escolhe outro lugar
VENV = os.environ.get('REINO_VOZES_VENV') or os.path.join(os.path.expanduser('~'), '.cache', 'reino-dos-unicornios', 'vozes-venv')
COMO_INSTALAR = f"""✘ faster-whisper não está instalado. Instale no venv das vozes (um só para todas as worktrees):
    uv venv --python 3.13 {VENV}
    uv pip install --python {VENV}/bin/python faster-whisper 'av<14'
  (sem uv: curl -LsSf https://astral.sh/uv/install.sh | sh; o av<14 não tem pacote para o Python 3.14)
  e rode de novo com esse python (o npm run vozes já usa esse venv se ele existir):
    {VENV}/bin/python jogo/ferramentas/vozes/conferir-vozes.py {' '.join(sys.argv[1:])}
  (ou: uv run --python 3.13 --with faster-whisper --with 'av<14' python jogo/ferramentas/vozes/conferir-vozes.py …)
  Na 1ª vez o modelo é baixado da internet (small: ~500 MB) para ~/.cache/huggingface."""


def opcao(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


UNIDADES = 'zero um dois tres quatro cinco seis sete oito nove dez onze doze treze quatorze quinze dezesseis dezessete dezoito dezenove'.split()
DEZENAS = ' dez vinte trinta quarenta cinquenta sessenta setenta oitenta noventa'.split(' ')
CENTENAS = ' cento duzentos trezentos quatrocentos quinhentos seiscentos setecentos oitocentos novecentos'.split(' ')
# o transcritor escreve diferente do texto, mas a voz disse certo
TROCAS = {'pro': 'para o', 'pra': 'para a', 'pros': 'para os', 'pras': 'para as', 'uma': 'um', 'catorze': 'quatorze',
          'comeia': 'colmeia', 'comeias': 'colmeias', 'real': 'reais', 'duas': 'dois',
          'sem': 'cem',   # homófonos: "Já ganhou 100 Robux" saía "sem" (vale para os dois lados, a voz diz igual)
          'arcoiris': 'arco iris', 'arcuiris': 'arco iris'}   # "Arco-Íris" sai junto (Vila Arco-Íris, 2026-11-06)


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
    # contas e horas da Matemática: "3 × 5 = 15" é lido "3 vezes 5 é igual a 15"; "09:00" e "9h" são "9 horas"
    t = t.replace('+', ' mais ').replace('×', ' vezes ').replace('=', ' igual ')
    t = re.sub(r'\b0?(\d{1,2})(?::|h)(\d{2})\b', lambda m: m.group(1) + ' horas' + ('' if m.group(2) == '00' else ' e ' + str(int(m.group(2)))), t)
    t = re.sub(r'\b0?(\d{1,2})h\b', r'\1 horas', t)
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r"[^a-z0-9]+", ' ', t)
    t = re.sub(r'\b(\d+)\b', lambda m: extenso(int(m.group(1))), t)
    t = ' '.join(TROCAS.get(p, p) for p in t.split())
    return re.sub(r'\be igual a\b', 'igual', t)


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


def carregar_modelo(nome=None, threads=0):
    # modelo no cache padrão do usuário (~/.cache/huggingface; HF_HOME definido por fora vale)
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(COMO_INSTALAR)
        sys.exit(2)
    modelo = nome or opcao('--modelo', 'small')
    if not threads:
        print(f'  carregando o modelo {modelo} do faster-whisper (CPU)…', flush=True)
    return WhisperModel(modelo, device='cpu', compute_type='int8', cpu_threads=threads)


# sem a dica, "Robux" saía "robôs" ou "Rollbooks" com a voz certa; com ela, as 4 vozes testadas batem e as grafias que
# soam errado ("Róbux", com ó aberto: "robos") continuam reprovando (conferido por transcrição em 2026-10-16)
# (cúrcuma e taninos: os cartões da Química, 2026-10-31; sem a dica saíam "cor com uma" e "chatentaninos")
VOCABULARIO = {'robux': 'Robux é a moeda do Roblox.', 'cúrcuma': 'A cúrcuma é um tempero amarelo.',
               'taninos': 'O chá tem taninos.', 'monsterball': 'A MonsterBall pega monstros.',
               'terrazo': 'O Shopping Terrazo fica no Eusébio.',
               'degraus': 'A escada tem muitos degraus.'}   # "degraus" saía "de graus" (a Torre de Pisa, 19/11)   # sem a dica saía "Terrazzo" (o Shopping, 19/11)


def dica(texto):
    achadas = [d for p, d in VOCABULARIO.items() if re.search(r'\b' + p + r'\b', texto or '', re.I)]
    return ' '.join(achadas) or None


def transcrever(modelo, arquivo, lingua, texto=None, feixe=5):
    partes, _ = modelo.transcribe(arquivo, language=lingua, beam_size=feixe, vad_filter=False, initial_prompt=dica(texto))
    return ' '.join(p.text.strip() for p in partes).strip()


# 1ª passada em paralelo: cada processo carrega o próprio modelo (com uma parte dos núcleos) e transcreve um pedaço
_MODELO = None


def _iniciar(nome, threads):
    global _MODELO
    _MODELO = carregar_modelo(nome, threads)


def _um(item):
    arq, lingua, texto, feixe = item
    return transcrever(_MODELO, arq, lingua, texto, feixe)


def transcrever_todos(itens, nome, feixe):
    """itens: [(arquivo, língua, texto)] → transcrições na mesma ordem."""
    nucleos = os.cpu_count() or 4
    processos = min(int(opcao('--processos', str(max(1, min(6, nucleos // 4))))), max(1, len(itens) // 10))
    tarefas = [(a, l, t, feixe) for a, l, t in itens]
    if processos <= 1:
        modelo, saida = carregar_modelo(nome), []
        for n, t in enumerate(tarefas, 1):
            saida.append(transcrever(modelo, *t))
            if n % 25 == 0:
                print(f'  {n}/{len(tarefas)}…', flush=True)
        return saida
    print(f'  carregando o modelo {nome} do faster-whisper (CPU) em {processos} processos, feixe {feixe}…', flush=True)
    # spawn: cada filho começa limpo (fork depois do ctranslate2 carregado deixa as threads disputando a CPU)
    with concurrent.futures.ProcessPoolExecutor(processos, mp_context=multiprocessing.get_context('spawn'), initializer=_iniciar,
                                                initargs=(nome, 4)) as ex:
        saida = []
        for n, ouvido in enumerate(ex.map(_um, tarefas, chunksize=4), 1):
            saida.append(ouvido)
            if n % 100 == 0:
                print(f'  {n}/{len(tarefas)}…', flush=True)
        return saida


def amostras():
    i = sys.argv.index('--amostras')
    itens = [a for a in sys.argv[i + 1:] if not a.startswith('--')]
    itens = [a for a in itens if a not in (opcao('--lingua'), opcao('--modelo'), opcao('--limite'), opcao('--segunda'),
                                           opcao('--processos'), opcao('--feixe'))]
    modelo, lingua, limite = carregar_modelo(), opcao('--lingua', 'pt'), float(opcao('--limite', '0.8'))
    ruins = 0
    for item in itens:
        arq, _, texto = item.partition('=')
        ouvido = transcrever(modelo, arq, lingua, texto)
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
    # sem faster-whisper, explica como instalar antes de abrir processos (só procura: importar aqui atrasaria os filhos)
    if importlib.util.find_spec('faster_whisper') is None:
        print(COMO_INSTALAR)
        sys.exit(2)
    limite = float(opcao('--limite', '0.8'))
    itens = [(os.path.join(GERADO, 'vozes-cache', indice[f['chave']]), 'en' if f['voz'] in inglesas else 'pt', f['fala']) for f in lista]
    ouvidos = transcrever_todos(itens, opcao('--modelo', 'small'), int(opcao('--feixe', '1')))
    ruins = [(f, o, parecido(f['fala'], o)) for f, o in zip(lista, ouvidos)]
    ruins = [r for r in ruins if r[2] < limite]
    segunda = opcao('--segunda', 'medium')
    # a 2ª passada (modelo maior, feixe 5) desfaz as reprovações falsas do feixe 1
    if ruins and '--sem-segunda' not in sys.argv and (segunda != opcao('--modelo', 'small') or opcao('--feixe', '1') != '5'):
        print(f'  {len(ruins)} divergiram: 2ª passada só nelas com o modelo {segunda}…', flush=True)
        maior, de_novo = carregar_modelo(segunda), []
        for f, ouvido, nota in ruins:
            arq = os.path.join(GERADO, 'vozes-cache', indice[f['chave']])
            ouvido = transcrever(maior, arq, 'en' if f['voz'] in inglesas else 'pt', f['fala'])
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
