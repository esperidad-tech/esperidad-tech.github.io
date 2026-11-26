import wave, numpy as np, sys
def bandes(f, t0=None, t1=None):
    w = wave.open(f); n = w.getnframes(); sr = w.getframerate()
    x = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, 2) / 32768
    if t0 is not None: x = x[int(t0*sr):int(t1*sr)]
    m = x.mean(1); S = np.abs(np.fft.rfft(m * np.hanning(len(m))))**2; fr = np.fft.rfftfreq(len(m), 1/sr)
    tot = S.sum(); out = []
    for a, b in [(20, 100), (100, 250), (250, 800), (800, 2500), (2500, 6000), (6000, 20000)]:
        out.append(round(10*np.log10(S[(fr>=a)&(fr<b)].sum()/tot+1e-12), 1))
    side = (x[:,0]-x[:,1]); width = round(10*np.log10((side**2).mean()/((m**2).mean()+1e-12)+1e-12),1)
    return out, width
for f in sys.argv[1:]:
    print(f, 'bandes 20-100/100-250/250-800/800-2.5k/2.5-6k/6k+ :', *bandes(f))
