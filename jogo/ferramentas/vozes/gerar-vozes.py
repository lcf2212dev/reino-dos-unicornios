# Grava as falas do jogo com vozes naturais (vozes neurais pt-BR e, nos trechos
# «em inglês», en-GB, da leitura em voz alta do Microsoft Edge). Só grava o que ainda não está no cache.
# Uso: uv run --with edge-tts python ferramentas/vozes/gerar-vozes.py
import asyncio
import hashlib
import json
import os
import sys

import edge_tts

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'gerado')  # falas.json, vozes-indice.json e vozes-cache/
CACHE = os.path.join(BASE, 'vozes-cache')
dados = json.load(open(os.path.join(BASE, 'falas.json'), encoding='utf-8'))
VOZES = dados['vozes']

# tira o silêncio do começo e do fim e deixa em mp3 mono leve (24 kHz, 32 kbps)
FILTRO = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,'
          'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse')
# efeitos opcionais do perfil (campo `efeito` em Reino.config.vozes), aplicados antes do corte do silêncio
EFEITOS = {
    # robô leve: a voz de verdade com metade de uma cópia metálica e monótona por cima (Robô Cosmo).
    # O robô inteiro embolava as frases (58% de acerto na transcrição); assim fica clara e ainda robótica.
    # No fim, +2,5 dB (a mistura saía ~3 dB abaixo das outras vozes) com um limitador contra estouro.
    'robo-leve': ("asplit[a][b];[b]afftfilt=real='hypot(re,im)*cos(0)':imag='hypot(re,im)*sin(0)':win_size=512:overlap=0.75,"
                  "volume=0.55[r];[a]volume=0.75[s];[s][r]amix=inputs=2:normalize=0,volume=2.5dB,alimiter=limit=0.9"),
}


def arquivo(fala):
    v = VOZES[fala['voz']]
    partes = [v['voz'], v['velocidade'], v['tom'], fala['fala']]
    if v.get('efeito'):
        partes.append(v['efeito'])   # só perfis com efeito mudam a chave (as gravações antigas continuam valendo)
    base = '|'.join(partes)
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
                filtro = (EFEITOS[v['efeito']] + ',' + FILTRO) if v.get('efeito') else FILTRO
                # ffmpeg sem travar o laço async: as outras gravações seguem enquanto ele converte
                proc = await asyncio.create_subprocess_exec('ffmpeg', '-loglevel', 'error', '-y', '-i', bruto, '-af', filtro,
                                                            '-ac', '1', '-ar', '24000', '-b:a', '32k', destino)
                if await proc.wait() != 0:
                    raise RuntimeError(f'ffmpeg saiu com {proc.returncode}')
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


if __name__ == '__main__':   # o amostras.py importa o FILTRO e os EFEITOS sem gravar
    asyncio.run(principal())
