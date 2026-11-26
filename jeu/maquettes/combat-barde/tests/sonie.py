# sonie approximative par mesure (pondération proche de la K des LUFS : on coupe les graves, on pousse un peu les aigus)
import wave, numpy as np, sys
def kpoids(fr):
    hp = (fr / 100) ** 4 / (1 + (fr / 100) ** 4)           # coupe sous 100 Hz
    sh = 1 + (10 ** (4 / 10) - 1) * (fr / 1500) ** 2 / (1 + (fr / 1500) ** 2)  # +4 dB au-dessus de 1,5 kHz
    return hp * sh
def sonie(f, bar):
    w = wave.open(f); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2) / 32768
    n = int(sr * bar); out = []
    for i in range(0, len(x) - n + 1, n):
        seg = x[i:i + n]; tot = 0
        for c in range(2):
            S = np.abs(np.fft.rfft(seg[:, c])) ** 2; fr = np.fft.rfftfreq(n, 1 / sr)
            tot += (S * kpoids(fr)).sum() / n / n * 2
        out.append(round(10 * np.log10(tot + 1e-12) - 0.7, 1))
    return out
for a in sys.argv[1:]:
    f, bpm = a.split(':'); print(f, sonie(f, 240 / float(bpm)))
