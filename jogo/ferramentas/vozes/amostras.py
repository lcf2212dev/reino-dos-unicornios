# Amostras de voz para o Leandro escolher ANTES de gravar tudo: a narradora diz quem é e onde fica,
# e o personagem fala 3 frases dele (de 3+ palavras). Um mp3 por personagem e um com todos.
# Uso (da raiz do repositório; precisa de internet, ffmpeg e edge-tts):
#   uv run --with edge-tts python jogo/ferramentas/vozes/amostras.py <perfil|regex> [...] [--pasta amostras-de-voz]
#     ex.: … amostras.py 'npc-lab-.*' npc-nasa-lia     (perfis de Reino.config.vozes, regex inteira)
#   grava <pasta>/NN-<Lugar>-<Nome>.mp3 (NN segue o maior número que já está na pasta)
#   e <pasta>/AMOSTRAS-NN-a-MM.mp3 com todas. Antes: node jogo/ferramentas/vozes/elenco-vozes.js (checagens).
# As frases vêm do falas.json (texto já preparado para a voz; rode o listar-falas antes) ou, sem ele, das falas do NPC.
import asyncio
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

import edge_tts

AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
FALAS = os.path.join(AQUI, '..', 'gerado', 'falas.json')


def opcao(nome, padrao=None):
    return sys.argv[sys.argv.index(nome) + 1] if nome in sys.argv else padrao


# o mesmo corte de silêncio e os mesmos efeitos (robo-leve) da gravação de verdade
sys.dont_write_bytecode = True   # sem __pycache__ na pasta do projeto
_spec = importlib.util.spec_from_file_location('gerar_vozes', os.path.join(AQUI, 'gerar-vozes.py'))
GERAR = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(GERAR)

ELENCO = json.loads(subprocess.run(['node', os.path.join(AQUI, 'elenco-vozes.js'), '--json'], capture_output=True, text=True, check=True).stdout)
DADOS = json.load(open(FALAS, encoding='utf-8'))
VOZES = DADOS['vozes']
TMP = tempfile.mkdtemp(prefix='amostras-', dir='/tmp/reino-testes' if os.path.isdir('/tmp/reino-testes') else None)


def arquivo_nome(t):
    t = unicodedata.normalize('NFD', t.replace('«', '').replace('»', ''))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^A-Za-z0-9]+', '-', t).strip('-')


def sem_emoji(t):
    return ' '.join(re.sub(r'[^\w\s,.!?;:\'"«»()-]', '', t).replace('«', '').replace('»', '').split())


async def falar(texto, perfil, destino):
    v = VOZES[perfil]
    bruto = destino + '.bruto.mp3'
    for tentativa in range(5):   # rede instável: tenta de novo
        try:
            await edge_tts.Communicate(texto, v['voz'], rate=v['velocidade'], pitch=v['tom']).save(bruto)
            break
        except Exception:
            if tentativa == 4:
                raise
            await asyncio.sleep(2 * (tentativa + 1))
    filtro = (GERAR.EFEITOS[v['efeito']] + ',' if v.get('efeito') else '') + GERAR.FILTRO
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', bruto, '-af', filtro, '-ac', '1', '-ar', '24000', destino], check=True)


def juntar(partes, destino, pausa=True):
    # recodifica (com -c copy a junção de mp3 dá avisos de dts)
    silencio = os.path.join(TMP, 'silencio.wav')
    if not os.path.exists(silencio):
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.5', silencio], check=True)
    lista = os.path.join(TMP, os.path.basename(destino) + '.txt')
    with open(lista, 'w') as f:
        for p in partes:
            f.write(f"file '{p}'\n" + (f"file '{silencio}'\n" if pausa else ''))
    comprimir = ['-b:a', '48k'] if destino.endswith('.mp3') else []
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista,
                    '-ac', '1', '-ar', '24000'] + comprimir + [destino], check=True)


def frases(p):
    lista = [f['fala'] for f in DADOS['falas'] if f['voz'] == p['voz'] and len(f['fala'].split()) >= 3]
    if not lista:
        lista = [sem_emoji(f) for f in p['falas'] if len(sem_emoji(f).split()) >= 3]
    return lista[:3]


async def principal():
    filtros = [a for a in sys.argv[1:] if not a.startswith('--') and a != opcao('--pasta')]
    if not filtros:
        print('uso: amostras.py <perfil|regex> … [--pasta <pasta>]  (veja o cabeçalho do arquivo)')
        return 2
    escolhidos = [p for p in ELENCO if any(re.fullmatch(f, p['voz']) for f in filtros)]
    if not escolhidos:
        print('✘ nenhum personagem com esses perfis (veja: node jogo/ferramentas/vozes/elenco-vozes.js --json)')
        return 1
    pasta = os.path.abspath(opcao('--pasta', os.path.join(REPO, 'amostras-de-voz')))
    os.makedirs(pasta, exist_ok=True)
    numeros = [int(m.group(1)) for m in (re.match(r'(\d+)-', f) for f in os.listdir(pasta)) if m]
    n = max(numeros, default=0)
    primeiro, feitos = n + 1, []
    for p in escolhidos:
        n += 1
        lugar = (p['lugares'] or ['Reino'])[0]
        falas = frases(p)
        partes = [os.path.join(TMP, f'{n}-0.wav')]
        await falar(f"{p['nome'].replace('«', '').replace('»', '')}, {lugar}.", 'narradora', partes[0])
        for i, fr in enumerate(falas, 1):
            partes.append(os.path.join(TMP, f'{n}-{i}.wav'))
            await falar(fr, p['voz'], partes[-1])
        destino = os.path.join(pasta, f"{n:02d}-{arquivo_nome(lugar.split()[0])}-{arquivo_nome(p['nome'])}.mp3")
        juntar(partes, destino)
        feitos.append(os.path.join(TMP, f'{n}.wav'))   # a junção de todas parte dos wav (mp3 em série dá erro de pacote)
        juntar(partes, feitos[-1])
        v = VOZES[p['voz']]
        print(f"  ✔ {os.path.basename(destino)}  {v['voz']} {v['velocidade']} {v['tom']} | {' / '.join(falas)}", flush=True)
    todas = os.path.join(pasta, f'AMOSTRAS-{primeiro:02d}-a-{n:02d}.mp3')
    juntar(feitos, todas)
    print(f'✔ {len(feitos)} amostra(s) em {pasta}; todas juntas: {os.path.basename(todas)}')
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(principal()))
