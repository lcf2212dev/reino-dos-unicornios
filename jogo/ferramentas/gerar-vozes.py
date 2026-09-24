# Grava as falas do jogo com vozes naturais (vozes neurais pt-BR e, nos trechos
# «em inglês», en-GB, da leitura em voz alta do Microsoft Edge). Só grava o que ainda não está no cache.
# Uso: uv run --with edge-tts python ferramentas/gerar-vozes.py
import asyncio
import hashlib
import json
import os
import subprocess
import sys

import edge_tts

BASE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(BASE, 'vozes-cache')
dados = json.load(open(os.path.join(BASE, 'falas.json'), encoding='utf-8'))
VOZES = dados['vozes']

# tira o silêncio do começo e do fim e deixa em mp3 mono leve (24 kHz, 32 kbps)
FILTRO = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,'
          'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse')


def arquivo(fala):
    v = VOZES[fala['voz']]
    base = '|'.join([v['voz'], v['velocidade'], v['tom'], fala['fala']])
    h = hashlib.sha1(base.encode('utf-8')).hexdigest()[:16]
    return os.path.join(fala['voz'], h + '.mp3')


async def gravar(fala, sem, contagem):
    rel = arquivo(fala)
    destino = os.path.join(CACHE, rel)
    if os.path.exists(destino):
        contagem['cache'] += 1
        return rel
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    v = VOZES[fala['voz']]
    async with sem:
        for tentativa in range(5):
            bruto = destino + '.bruto.mp3'
            try:
                com = edge_tts.Communicate(fala['fala'], v['voz'], rate=v['velocidade'], pitch=v['tom'])
                await com.save(bruto)
                subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', bruto, '-af', FILTRO,
                                '-ac', '1', '-ar', '24000', '-b:a', '32k', destino], check=True)
                os.remove(bruto)
                contagem['novas'] += 1
                if contagem['novas'] % 25 == 0:
                    print(f"  {contagem['novas']} gravadas...", flush=True)
                return rel
            except Exception as erro:  # rede instável: espera e tenta de novo
                if os.path.exists(bruto):
                    os.remove(bruto)
                if tentativa == 4:
                    print(f"  FALHOU: {fala['fala'][:60]} ({erro})", flush=True)
                    contagem['falhas'] += 1
                    return None
                await asyncio.sleep(1.5 * (tentativa + 1))


async def principal():
    contagem = {'cache': 0, 'novas': 0, 'falhas': 0}
    sem = asyncio.Semaphore(8)
    falas = dados['falas']
    resultados = await asyncio.gather(*[gravar(f, sem, contagem) for f in falas])
    indice = {f['chave']: rel for f, rel in zip(falas, resultados) if rel}
    with open(os.path.join(BASE, 'vozes-indice.json'), 'w', encoding='utf-8') as saida:
        json.dump(indice, saida, indent=1)
    print(f"Pronto: {contagem['novas']} novas, {contagem['cache']} já estavam gravadas, {contagem['falhas']} falhas.")
    if contagem['falhas']:
        sys.exit(1)


asyncio.run(principal())
