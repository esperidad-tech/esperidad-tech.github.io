"""Le robot des voix (13 novembre, Bible §12.61) : « dès qu'on appuie sur 🔊, le son sort ».
Il ouvre le VRAI jeu sous son adresse https://esperidad-tech.github.io/brumeval/ (les voix naturelles ne s'activent que là),
mais tout est servi d'ici : le jeu construit (BRUMEVAL_DIST), et ce que le moteur des voix demande à jsDelivr, cdnjs et Hugging Face.
La « voix de l'appareil » est une fausse (le navigateur d'essai n'en a pas) : elle note ce qu'on lui fait dire, et quand.

Ce qu'il vérifie :
  1. voix pas téléchargées : la voix de l'appareil lit tout de suite, aucun moteur n'est chargé ;
  2. téléchargement, puis la mesure de vitesse de l'appareil (« rapide » sur cette machine) ; le moteur ne se charge qu'UNE fois ;
  3. un texte préparé d'avance (un vrai bouton 🔊 de l'écran) part tout de suite, avec la voix naturelle ;
  4. un texte pas prêt et long : la voix de l'appareil lit tout de suite (jamais d'attente) ;
  5. un texte pas prêt mais court : la voix naturelle, en moins d'une seconde ;
  6. un texte de plusieurs phrases se lit en entier, morceau après morceau ; la hauteur du personnage ; ⏹ arrête tout ;
  7. l'écran ne se fige pas pendant que la voix se fabrique ;
  8. « Jouer sans internet » : le moteur donne la liste de ses fichiers ;
  9. un appareil classé lent : aucun moteur chargé, la voix de l'appareil, les Réglages le disent ; remesuré après 14 jours ;
 10. une tablette dont la voix d'appareil reste muette : la voix naturelle prend le relais ;
 11. cdnjs en panne : le moteur vient de jsDelivr ; tout le moteur en panne : la voix de l'appareil, le jeu continue ;
 12. la page fermée deux fois de suite pendant le chargement d'une voix : on n'insiste plus sur cet appareil ;
 13. une vieille tablette sans « getDirectory » (les voix rangées dans IndexedDB) : tout marche pareil ;
 14. une promenade dans le jeu (créer un Barde, lire la lettre du maire) : les 🔊 de l'écran sont préparés, pas d'erreur.

Usage : BRUMEVAL_DIST=<dossier construit> python3 tools/voix.py [--vite]   (--vite : sans le n° 13, qui retélécharge les voix)
La première fois, il va chercher ce qu'il lui faut (trois paquets npm et une voix d'essai sur GitHub, 60 Mo) dans
BRUMEVAL_VOIX_CACHE (par défaut /tmp/brumeval-voix). La voix d'essai est la Siwis de 2023 (GitHub) : elle sert aussi de « Tom ».
Hugging Face n'est pas joignable depuis une session : les vraies voix d'aujourd'hui ne peuvent pas être essayées ici.
Termine par « ÉCHECS : [] » et « ERREURS : [] » si tout va bien."""
import os, sys, re, json, time, glob, shutil, tarfile, tempfile, subprocess
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
CACHE = os.path.abspath(os.environ.get('BRUMEVAL_VOIX_CACHE') or '/tmp/brumeval-voix')
SITE = 'https://esperidad-tech.github.io/brumeval/'
VITE = '--vite' in sys.argv
erreurs, echecs = [], []

dernier = {}
def verif(ok, msg):
    print(('  OK  ' if ok else '  ✗✗ ') + msg, flush=True)
    if not ok:
        echecs.append(msg)
        if dernier: print('        (dernier essai : %s)' % json.dumps(dernier, ensure_ascii=False)[:600], flush=True)
def essai(pg, texte=None, qui=None, clic=None, tout=False):
    r = pg.evaluate('([t, q, c, x]) => __essai(t, q, c, x)', [texte, qui, clic, tout])
    dernier.clear(); dernier.update(r); dernier['etat'] = {k: v for k, v in diag(pg).items() if k in ('mode', 'file', 'enCours', 'sons', 'muet', 'appareilVu', 'erreur', 'voix')}
    return r

# ---------- ce qu'il faut sous la main ----------
PAQUETS = {'vits': '@diffusionstudio/vits-web@1.0.3', 'ort': 'onnxruntime-web@1.18.0', 'phon': '@diffusionstudio/piper-wasm@1.0.0'}
VOIX_ESSAI = 'https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-fr-siwis-medium.tar.gz'
def preparer():
    os.makedirs(CACHE, exist_ok=True)
    for nom, paquet in PAQUETS.items():
        d = os.path.join(CACHE, nom)
        if os.path.isdir(os.path.join(d, 'package')): continue
        print('  (je vais chercher', paquet, ')', flush=True)
        tmp = tempfile.mkdtemp(dir=CACHE)
        subprocess.run(['npm', 'pack', paquet, '--silent'], cwd=tmp, check=True, stdout=subprocess.DEVNULL)
        os.makedirs(d, exist_ok=True)
        with tarfile.open(glob.glob(os.path.join(tmp, '*.tgz'))[0]) as t: t.extractall(d, filter='data')
        shutil.rmtree(tmp)
    m = os.path.join(CACHE, 'voix', 'fr-siwis-medium.onnx')
    if not os.path.exists(m):
        print('  (je vais chercher la voix d\'essai sur GitHub, 60 Mo)', flush=True)
        os.makedirs(os.path.dirname(m), exist_ok=True)
        a = os.path.join(CACHE, 'voix.tar.gz')
        subprocess.run(['curl', '-sSL', '-m', '600', '-o', a, VOIX_ESSAI], check=True)
        with tarfile.open(a) as t: t.extractall(os.path.dirname(m), filter='data')
        os.remove(a)
    return m

TYPES = {'.js': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.html': 'text/html; charset=utf-8',
         '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json'}
CORS = {'access-control-allow-origin': '*'}
def poser(ctx, modele, journal, etat):
    """etat['couper'] : fonction(adresse) → True pour faire échouer cette adresse (essais de panne)."""
    VITS = os.path.join(CACHE, 'vits', 'package', 'dist'); ORT = os.path.join(CACHE, 'ort', 'package', 'dist'); PHON = os.path.join(CACHE, 'phon', 'package', 'build')
    # la bibliothèque telle que jsDelivr la sert (« +esm ») : son import du moteur de calcul devient une adresse
    vits = open(os.path.join(VITS, 'vits-web.js'), encoding='utf-8').read().replace('import("onnxruntime-web")', 'import("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/+esm")')
    def fichier(route, chemin):
        if not os.path.exists(chemin): route.fulfill(status=404, body='absent'); return
        route.fulfill(status=200, path=chemin, headers=dict(CORS, **{'content-type': TYPES.get(os.path.splitext(chemin)[1], 'application/octet-stream')}))
    def traiter(route):
        u = route.request.url.split('?')[0]
        journal.append(u)
        if etat.get('couper') and etat['couper'](u): route.abort(); return
        if u.startswith(SITE): fichier(route, os.path.join(DIST, u[len(SITE):] or 'index.html')); return
        if u == 'https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm':
            route.fulfill(status=200, body=vits, headers=dict(CORS, **{'content-type': 'text/javascript'})); return
        for motif, dossier in ((r'https://cdn\.jsdelivr\.net/npm/@diffusionstudio/vits-web@1\.0\.3/(piper-[\w-]+\.js)$', VITS),
                               (r'https://cdn\.jsdelivr\.net/npm/onnxruntime-web@1\.18\.0/dist/(.+)$', ORT),
                               (r'https://cdnjs\.cloudflare\.com/ajax/libs/onnxruntime-web/1\.18\.0/(.+)$', ORT),
                               (r'https://cdn\.jsdelivr\.net/npm/@diffusionstudio/piper-wasm@1\.0\.0/build/(.+)$', PHON)):
            m = re.match(motif, u)
            if m: fichier(route, os.path.join(dossier, m.group(1))); return
        if u == 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/+esm': fichier(route, os.path.join(ORT, 'esm', 'ort.min.js')); return
        m = re.match(r'https://huggingface\.co/diffusionstudio/piper-voices/resolve/main/fr/fr_FR/\w+/medium/fr_FR-\w+-medium\.onnx(\.json)?$', u)
        if m: fichier(route, modele + (m.group(1) or '')); return
        if re.match(r'https://fonts\.(googleapis|gstatic)\.com/', u): route.fulfill(status=200, body='', headers=dict(CORS, **{'content-type': 'text/css'})); return
        route.fulfill(status=404, body='hors essai')
    ctx.route('**/*', traiter)

# ---------- la fausse voix de l'appareil, et un mouchard sur le lecteur de sons ----------
FAUX = r"""
(function(){
  if(/essai=temoin/.test(location.search)) try{ localStorage.setItem('brumeval-voix-temoin', '1'); }catch(e){}
  var A = window.__app = {dits:[], muet:false, annules:0};
  var faux = {
    speaking:false, pending:false, onvoiceschanged:null,
    getVoices:function(){ return []; },   /* (une fausse voix dans cette liste ferait planter « u.voice = … » : le navigateur veut une vraie) */
    speak:function(u){
      A.dits.push({t:u.text, a:performance.now()});
      if(A.muet) return;
      faux.speaking = true; faux.__u = u;
      u.__d = setTimeout(function(){ u.dispatchEvent(new Event('start')); }, 60);
      u.__f = setTimeout(function(){ faux.speaking = false; faux.__u = null; u.dispatchEvent(new Event('end')); }, 60 + u.text.length * 25);
    },
    cancel:function(){
      A.annules++;
      var u = faux.__u; faux.__u = null; faux.speaking = false;
      if(u){ clearTimeout(u.__d); clearTimeout(u.__f); setTimeout(function(){ var e = new Event('error'); e.error = 'interrupted'; u.dispatchEvent(e); }, 5); }
    },
    addEventListener:function(){}, removeEventListener:function(){}
  };
  try{ Object.defineProperty(window, 'speechSynthesis', {value:faux, configurable:true}); }catch(e){}
  var J = window.__jeux = [], jouer = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(){
    var x = {a:performance.now(), src:String(this.src), taux:this.playbackRate, o:-1};
    J.push(x);
    if(/^blob:/.test(x.src)) fetch(x.src).then(function(r){ return r.blob(); }).then(function(b){ x.o = b.size; }, function(){ x.o = 0; });
    return jouer.apply(this, arguments);
  };
  /* un toucher sur un 🔊 : l'heure du toucher */
  document.addEventListener('click', function(){ window.__clic = performance.now(); }, true);
  /* lit un texte et dit ce qui est parti, et au bout de combien de millisecondes */
  window.__essai = function(texte, qui, clic, tout){
    var nj = J.length, na = A.dits.length, t0 = performance.now();
    if(clic) window.__clic = 0;
    if(clic) document.querySelector(clic).click(); else M.lire(texte, qui ? {qui:qui} : undefined);
    if(clic) t0 = window.__clic || t0;
    return new Promise(function(ok){
      (function voir(){
        var r = {appareil:null, naturelle:null, amorce:null, taux:null, dit:null}, i, flou = false;
        if(A.dits.length > na){ r.appareil = Math.round(A.dits[na].a - t0); r.dit = A.dits[na].t; }
        for(i = nj; i < J.length; i++){
          if(!/^blob:/.test(J[i].src)) continue;
          if(J[i].o < 0){ flou = true; continue; }
          if(J[i].o < 5000){ if(r.amorce === null) r.amorce = Math.round(J[i].a - t0); }
          else if(r.naturelle === null){ r.naturelle = Math.round(J[i].a - t0); r.taux = J[i].taux; }
        }
        if(!flou && (r.naturelle !== null || (r.appareil !== null && !tout))) ok(r);
        else if(performance.now() - t0 > 9000) ok(r);
        else setTimeout(voir, 20);
      })();
    });
  };
  window.__sons = function(depuis){ return J.slice(depuis || 0).filter(function(x){ return x.o > 5000; }).length; };
})();
"""

def diag(pg): return pg.evaluate('Voix.diag()')
def attendre(pg, cond, s=60, pas=0.25):
    t = time.time()
    while time.time() - t < s:
        if pg.evaluate(cond): return True
        time.sleep(pas)
    return False
def moteur_vu(journal, depuis=0):
    return [u for u in journal[depuis:] if re.search(r'onnxruntime-web|piper-wasm', u)]
def ouvrir(pg, suite=''):
    pg.goto(SITE + suite)
    pg.wait_for_function('window.M && window.Voix && window.__essai')
def calme(pg):
    pg.evaluate('M.stop()')
    attendre(pg, '!Voix.diag().enCours && !Voix.diag().file', 30)
def mesure(pg, o):
    calme(pg)
    pg.evaluate('(o) => localStorage.setItem("brumeval-voix-mesure", JSON.stringify(o))', o)

# une première phrase longue et sans virgule : elle ne peut pas être prête « dans l'instant » (une phrase longue se coupe à une virgule)
LONG = "Le vieux sonneur a trouvé ce matin une lettre glissée sous la porte du clocher par un inconnu très pressé. Le maire veut des réponses avant ce soir."
COURT = "Bonjour à toi, l'ami !"
TROIS = "La brume se lève doucement sur le village. Les volets s'ouvrent un à un, sans bruit. Quelqu'un a laissé une lanterne allumée."

def contexte(p, profil, modele, journal, etat, taille=(1180, 820), avant=''):
    ctx = p.chromium.launch_persistent_context(profil, args=['--autoplay-policy=no-user-gesture-required'], viewport={'width': taille[0], 'height': taille[1]})
    poser(ctx, modele, journal, etat)
    ctx.add_init_script(avant + FAUX)
    pg = ctx.pages[0] if ctx.pages else ctx.new_page()
    pg.set_default_timeout(60000)
    pg.on('console', lambda m: erreurs.append(m.text[:300]) if m.type == 'error' and 'ERR_' not in m.text and '404' not in m.text and 'net::' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append('PAGEERROR ' + str(e)[:300]))
    return ctx, pg

def telecharger(pg):
    t = time.time()
    pg.evaluate('Voix.telecharger()')
    return time.time() - t

def partie_normale(p, modele):
    profil = tempfile.mkdtemp(prefix='brumeval-voix-')
    journal, etat = [], {}
    ctx, pg = contexte(p, profil, modele, journal, etat)
    ouvrir(pg)
    time.sleep(2)   # la vérification du démarrage (1,5 s)

    print('1. Les voix ne sont pas téléchargées', flush=True)
    r = essai(pg, LONG)
    verif(r['appareil'] is not None and r['appareil'] <= 30, 'la voix de l\'appareil lit tout de suite (%s ms)' % r['appareil'])
    verif(r['naturelle'] is None and not moteur_vu(journal), 'aucun moteur de voix n\'est chargé')
    pg.evaluate('M.stop()')

    print('2. Téléchargement, puis mesure de la vitesse', flush=True)
    s = telecharger(pg)
    verif(pg.evaluate('Voix.pret') is True, 'les deux voix sont dans l\'appareil (%.0f s)' % s)
    verif(diag(pg)['mode'] == 'inconnu', 'tant que rien n\'est mesuré, le mode est « inconnu »')
    r = essai(pg, COURT)
    verif(r['appareil'] is not None and r['appareil'] <= 30 and r['naturelle'] is None, 'pendant la mesure, la voix de l\'appareil lit tout de suite (%s ms)' % r['appareil'])
    pg.evaluate('M.stop()')
    verif(attendre(pg, 'Voix.diag().mode !== "inconnu"', 90), 'la mesure se termine')
    d = diag(pg)
    print('     ', json.dumps({k: d[k] for k in ('mode', 'vitesse', 'voix', 'base')}, ensure_ascii=False), flush=True)
    verif(d['mode'] == 'rapide' and d['vitesse'] >= 2, 'cette machine est « rapide » (×%s)' % d['vitesse'])
    verif(json.loads(pg.evaluate('localStorage.getItem("brumeval-voix-mesure")'))['n'] >= 2, 'la mesure est gardée pour les prochains lancements')
    verif(d['base'].startswith('https://cdnjs.cloudflare.com/'), 'le moteur de calcul vient de cdnjs (l\'adresse déjà gardée par les tablettes « sans internet »)')

    print('3. Un texte préparé d\'avance part tout de suite', flush=True)
    pg.evaluate('M.UI.ecran = "reglages"; M.render()')
    verif(pg.get_attribute('.hr-voix-mode', 'data-mode') == 'rapide', 'les Réglages disent que l\'appareil est assez rapide')
    verif('×' in pg.inner_text('.hr-voix-vit'), 'les Réglages affichent la vitesse (%s)' % pg.inner_text('.hr-voix-vit'))
    n0 = d['sons']
    verif(attendre(pg, 'Voix.diag().sons > %d && !Voix.diag().enCours && !Voix.diag().file' % n0, 30), 'la première phrase du 🔊 de l\'écran a été fabriquée d\'avance')
    r = essai(pg, clic='.hr-voix-mode .b-lire')
    verif(r['naturelle'] is not None and r['naturelle'] <= 100, 'un toucher sur ce 🔊 : la voix naturelle part tout de suite (%s ms)' % r['naturelle'])
    verif(r['appareil'] is None, 'la voix de l\'appareil ne s\'en mêle pas')
    verif(pg.evaluate('M.parle') is True and pg.is_visible('#stop-voix'), 'le bouton ⏹ Stop est là pendant la lecture')
    verif(attendre(pg, '!M.parle', 40), 'la lecture va jusqu\'au bout, le bouton ⏹ s\'en va')

    print('4. Un texte pas prêt et long : jamais d\'attente', flush=True)
    r = essai(pg, LONG)
    verif(r['appareil'] is not None and r['appareil'] <= 30, 'la voix de l\'appareil lit tout de suite (%s ms)' % r['appareil'])
    verif(r['naturelle'] is None and r['dit'] == LONG, 'elle lit tout le texte, la voix naturelle ne part pas par-dessus')
    pg.evaluate('M.stop()')

    print('5. Un texte pas prêt mais court', flush=True)
    attendre(pg, 'Voix.diag().voix.length === 2 && !Voix.diag().chargements', 60); calme(pg)
    r = essai(pg, COURT)
    verif(r['naturelle'] is not None and r['naturelle'] <= 1000, 'la voix naturelle, en moins d\'une seconde (%s ms)' % r['naturelle'])
    verif(r['appareil'] is None, 'sans la voix de l\'appareil')
    verif(r['amorce'] is not None and r['amorce'] <= 30, 'le lecteur est réveillé pendant le toucher (pour iPhone et iPad)')
    attendre(pg, '!M.parle', 20)
    r = essai(pg, COURT)
    verif(r['naturelle'] is not None and r['naturelle'] <= 30, 'la deuxième fois, elle est en réserve : tout de suite (%s ms)' % r['naturelle'])
    attendre(pg, '!M.parle', 20)

    print('6. Plusieurs phrases, la hauteur du personnage, le bouton Stop', flush=True)
    morceaux = pg.evaluate('Voix.decouper(%s)' % json.dumps(TROIS))
    verif(len(morceaux) == 3, 'le texte est coupé en trois phrases')
    j0 = pg.evaluate('__jeux.length')
    r = essai(pg, TROIS, 'tim')
    verif(r['naturelle'] is not None and abs(r['taux'] - 1.25) < 0.01, 'Tim parle plus aigu (lecteur à ×%s)' % r['taux'])
    verif(attendre(pg, '!M.parle', 60), 'la lecture se termine toute seule')
    verif(pg.evaluate('__sons(%d)' % j0) == 3, 'les trois morceaux ont été joués, l\'un après l\'autre')
    verif(attendre(pg, 'Voix.diag().voix.length === 2 && !Voix.diag().chargements', 60), 'sur un appareil rapide, la voix d\'homme est chargée d\'avance, elle aussi')
    calme(pg)
    r = essai(pg, "Tiens, voilà du bon pain !", 'gaspard')
    verif(r['naturelle'] is not None and r['appareil'] is None, 'Gaspard parle avec la voix d\'homme, sans attendre (%s ms)' % r['naturelle'])
    pg.evaluate('M.stop()')
    attendre(pg, '!Voix.diag().enCours && !Voix.diag().file', 30)
    j0 = pg.evaluate('__jeux.length')
    essai(pg, "Le vent tourne. " + TROIS)
    pg.evaluate('M.stop()')
    time.sleep(1.5)
    verif(pg.evaluate('M.parle') is False and pg.evaluate('__sons(%d)' % j0) <= 1 and not pg.is_visible('#stop-voix'), '⏹ arrête la lecture : plus rien ne part ensuite')
    r = essai(pg, "Derrière la porte de la boulangerie deux voix se disputent tout bas à propos d'une vieille clé perdue depuis des années.")
    verif(r['appareil'] is not None and pg.is_visible('#stop-voix'), 'après un Stop, la voix de l\'appareil et son bouton ⏹ marchent toujours')
    essai(pg, COURT)
    time.sleep(0.3)
    verif(pg.evaluate('M.parle') is True and pg.is_visible('#stop-voix'), 'une lecture coupée par une autre ne cache pas le ⏹ de la nouvelle')
    attendre(pg, '!M.parle', 20)

    print('7. L\'écran ne se fige pas pendant que la voix se fabrique', flush=True)
    trou = pg.evaluate("""() => new Promise(function(ok){
      var max = 0, avant = performance.now(), fini = false;
      (function tic(){ var t = performance.now(); if(t - avant > max) max = t - avant; avant = t; if(!fini) requestAnimationFrame(tic); })();
      M.UI.lectures = [{t:%s, qui:null}];
      var b = document.createElement('button'); b.className = 'b-lire'; b.setAttribute('data-act', 'lire'); b.setAttribute('data-i', '0'); b.textContent = '🔊';
      b.style.cssText = 'position:fixed;left:10px;top:10px;z-index:999'; document.body.appendChild(b);
      var n = Voix.diag().sons;
      (function voir(){ var d = Voix.diag(); if(d.sons > n && !d.enCours && !d.file){ fini = true; b.remove(); M.render(); ok(Math.round(max)); } else setTimeout(voir, 50); })();
    })""" % (json.dumps("Voici une phrase toute neuve, assez longue pour demander un vrai calcul au moteur des voix de Brumeval, pendant que l'écran continue de bouger.")))
    verif(trou <= 120, 'pendant le calcul d\'une longue phrase, l\'écran ne s\'arrête jamais plus de %d ms' % trou)

    print('8. « Jouer sans internet » : la liste des fichiers du moteur', flush=True)
    verif(pg.evaluate('Voix.prechauffer()') is True, 'le préchauffage réussit')
    l = pg.evaluate('Voix.listeFichiers')
    for nom in ('ort.wasm.min.js', 'ort-wasm-simd.wasm', 'piper_phonemize.js', 'piper_phonemize.wasm', 'piper_phonemize.data'):
        verif(any(u.endswith('/' + nom) for u in l), 'la liste contient ' + nom)
    for nom in ('ort.wasm.min.js', 'ort-wasm-simd.wasm', 'piper_phonemize.wasm', 'piper_phonemize.data'):
        n = len([u for u in journal if u.endswith('/' + nom)])
        verif(n == 1, '%s n\'a été chargé qu\'une fois depuis le début (%d)' % (nom, n))

    print('9. Un appareil classé lent', flush=True)
    mesure(pg, {'r': 3.2, 'c': 170, 'n': 3, 'd': int(time.time() * 1000), 'p': 0, 'ok': False})
    j0 = len(journal)
    ouvrir(pg); time.sleep(7.5)
    d = diag(pg)
    verif(d['mode'] == 'lent' and not d['voix'] and not moteur_vu(journal, j0), 'mode « lent » : aucun moteur n\'est chargé, même après 7 secondes')
    r = essai(pg, COURT, 'gaspard')
    verif(r['appareil'] is not None and r['appareil'] <= 30 and r['naturelle'] is None, 'la voix de l\'appareil lit tout de suite, même un texte court (%s ms)' % r['appareil'])
    pg.evaluate('M.stop(); M.UI.ecran = "reglages"; M.render()')
    verif(pg.get_attribute('.hr-voix-mode', 'data-mode') == 'lent' and 'trop lent' in pg.inner_text('.hr-voix-mode'), 'les Réglages le disent : « trop lent pour ces voix »')
    time.sleep(2)
    verif(not moteur_vu(journal, j0) and diag(pg)['sons'] == 0, 'rien n\'est préparé d\'avance sur un appareil lent')
    pg.click('[data-act=voix-mesurer]', force=True)
    verif(pg.get_attribute('.hr-voix-mode', 'data-mode') == 'inconnu', '« 🔁 Mesurer encore » : la mesure repart')
    verif(attendre(pg, 'Voix.diag().mode === "rapide"', 90) and attendre(pg, 'document.querySelector(".hr-voix-mode").getAttribute("data-mode") === "rapide"', 10), '… et les Réglages se mettent à jour tout seuls (ici : rapide)')
    verif(pg.query_selector('[data-act=voix-mesurer]') is None, 'le bouton ne s\'affiche plus sur un appareil rapide')
    mesure(pg, {'r': 3.2, 'c': 170, 'n': 3, 'd': int((time.time() - 15 * 86400) * 1000), 'p': 0, 'ok': False})
    ouvrir(pg)
    verif(attendre(pg, 'Voix.diag().mode === "rapide"', 90), 'une mesure « lent » de plus de 14 jours est refaite (ici : rapide)')

    print('10. La voix de l\'appareil reste muette', flush=True)
    pg.evaluate('M.stop(); __app.muet = true')
    attendre(pg, '!Voix.diag().enCours && !Voix.diag().file', 30)
    r = essai(pg, "Personne ne répond derrière cette porte alors que la cheminée fume encore comme si quelqu'un venait tout juste de partir d'ici.", tout=True)
    verif(r['appareil'] is not None and r['naturelle'] is not None and 1500 <= r['naturelle'] <= 6000, 'la voix naturelle prend le relais au bout de deux secondes (%s ms)' % r['naturelle'])
    verif(diag(pg)['muet'] is False and pg.evaluate('M.parle') is True, 'une fois ne suffit pas pour dire l\'appareil muet ; le ⏹ est là')
    attendre(pg, '!M.parle', 40)
    r = essai(pg, "Une deuxième fois la voix de l'appareil ne dit rien du tout alors la voix naturelle doit encore venir à son secours ici.", tout=True)
    verif(r['appareil'] is not None and r['naturelle'] is not None and diag(pg)['muet'] is True, 'deux fois de suite : le relais encore (%s ms), et l\'appareil est tenu pour muet' % r['naturelle'])
    attendre(pg, '!M.parle', 40)
    r = essai(pg, "Un troisième texte long lui aussi pour voir que cette fois la voix naturelle est demandée directement sans passer par l'appareil.")
    verif(r['appareil'] is None and r['naturelle'] is not None, 'ensuite, la voix naturelle est demandée directement (%s ms)' % r['naturelle'])
    pg.evaluate('M.stop(); __app.muet = false')
    # une voix d'appareil qui parle sans jamais dire « je commence » : elle dit au moins qu'elle a fini, et on la croit
    ouvrir(pg); time.sleep(2); attendre(pg, 'Voix.diag().voix.length === 2 && !Voix.diag().chargements', 60); calme(pg)
    pg.evaluate("""() => { var s = speechSynthesis.speak; speechSynthesis.speak = function(u){ var d = u.dispatchEvent; u.dispatchEvent = function(e){ return e.type === 'start' ? true : d.call(u, e); }; return s.call(speechSynthesis, u); }; }""")
    r = essai(pg, "Un texte court mais sans virgule que la voix de l'appareil lit toute seule du début jusqu'à la toute fin.")
    verif(r['appareil'] is not None and r['naturelle'] is None, 'la voix de l\'appareil lit, sans dire qu\'elle commence')
    verif(attendre(pg, 'Voix.diag().appareilVu === true', 15) and diag(pg)['muets'] == 0 and pg.evaluate('__sons(0)') == 0, 'quand elle dit qu\'elle a fini, le jeu sait qu\'elle parle : pas de relais')
    ctx.close()

    print('11. Des pannes', flush=True)
    journal2, etat2 = [], {'couper': lambda u: u.startswith('https://cdnjs.cloudflare.com/') and u.endswith('.js')}
    ctx, pg = contexte(p, profil, modele, journal2, etat2)
    ouvrir(pg)
    verif(attendre(pg, 'Voix.diag().voix.length >= 1', 60), 'cdnjs ne répond pas : le moteur se charge quand même')
    verif(diag(pg)['base'].startswith('https://cdn.jsdelivr.net/'), '… depuis jsDelivr')
    ctx.close()
    etat3 = {'couper': lambda u: bool(re.search(r'onnxruntime-web|piper-wasm', u))}
    ctx, pg = contexte(p, profil, modele, [], etat3)
    ouvrir(pg)
    time.sleep(4.5)
    r = essai(pg, COURT)
    verif(r['appareil'] is not None and r['appareil'] <= 30, 'tout le moteur est injoignable : dès le premier toucher, la voix de l\'appareil lit (%s ms)' % r['appareil'])
    pg.evaluate('M.stop(); M.UI.ecran = "reglages"; M.render()')
    verif(attendre(pg, 'Voix.diag().mode === "panne"', 30), 'au deuxième échec, mode « panne » : on n\'insiste plus')
    r = essai(pg, COURT)
    verif(r['appareil'] is not None and r['appareil'] <= 30, 'la voix de l\'appareil lit tout de suite (%s ms)' % r['appareil'])
    pg.evaluate('M.stop(); M.render()')
    verif(pg.get_attribute('.hr-voix-mode', 'data-mode') == 'panne', 'les Réglages le disent')
    ctx.close()

    print('12. La page fermée toute seule pendant le chargement d\'une voix', flush=True)
    ctx, pg = contexte(p, profil, modele, journal, etat)
    ouvrir(pg); time.sleep(2); calme(pg)
    pg.evaluate('localStorage.setItem("brumeval-voix-temoin", "1")')
    ouvrir(pg); time.sleep(0.5)
    verif(pg.evaluate('localStorage.getItem("brumeval-voix-temoin")') is None, 'quitter la page normalement ne compte pas pour une fermeture brutale')
    ouvrir(pg, '?essai=temoin')
    verif(attendre(pg, 'Voix.diag().voix.length >= 1', 60) and diag(pg)['mode'] == 'rapide', 'une fois : on réessaie, et un chargement réussi efface l\'ardoise')
    verif(diag(pg)['mesure']['p'] == 0, 'le compteur est revenu à zéro')
    m = json.loads(pg.evaluate('localStorage.getItem("brumeval-voix-mesure")')); m['p'] = 1
    mesure(pg, m)
    j0 = len(journal)
    ouvrir(pg, '?essai=temoin'); time.sleep(5)
    d = diag(pg)
    verif(d['mode'] == 'panne' and not d['voix'] and not moteur_vu(journal, j0), 'deux fois de suite : on n\'insiste plus, aucun moteur n\'est chargé')
    r = essai(pg, COURT)
    verif(r['appareil'] is not None and r['appareil'] <= 30, 'la voix de l\'appareil lit tout de suite')
    m['p'] = 0; mesure(pg, m)
    pg.evaluate('M.stop()')

    print('14. Une promenade dans le jeu', flush=True)
    ouvrir(pg); time.sleep(2.5)
    pg.click('[data-act=creer]', force=True); pg.click('[data-act=crea-role][data-r=barde]', force=True)
    pg.click('[data-act=crea-hasard]', force=True); pg.click('[data-act=crea-suite]', force=True)
    pg.fill('#nom', 'Barde'); pg.click('[data-act=crea-fin]', force=True)
    pg.click('[data-act=nouvelle-enquete]', force=True)
    verif(attendre(pg, 'document.querySelectorAll(".b-lire[data-act=lire]").length > 0', 20), 'la lettre du maire a des boutons 🔊')
    time.sleep(1.5)   # le temps que le jeu voie les nouveaux boutons
    verif(attendre(pg, 'Voix.diag().voix.length === 2 && !Voix.diag().chargements && Voix.diag().sons > 0 && !Voix.diag().enCours && !Voix.diag().file', 60), 'leurs premières phrases sont préparées (le maire parle avec la voix d\'homme)')
    r = essai(pg, clic='.b-lire[data-act=lire]')
    verif(r['naturelle'] is not None and r['naturelle'] <= 100 and r['appareil'] is None, 'un toucher sur le premier 🔊 : la voix naturelle, tout de suite (%s ms)' % r['naturelle'])
    pg.evaluate('M.stop()')
    pg.click('[data-act=commencer]', force=True)
    time.sleep(3)
    verif(pg.evaluate('!!M.P()') is True, 'l\'enquête commence, le jeu tourne')
    ctx.close()
    shutil.rmtree(profil, ignore_errors=True)

def partie_vieille_tablette(p, modele):
    print('13. Une vieille tablette sans « getDirectory »', flush=True)
    profil = tempfile.mkdtemp(prefix='brumeval-voix-')
    journal, etat = [], {}
    ctx, pg = contexte(p, profil, modele, journal, etat, taille=(1024, 600), avant='try{ delete StorageManager.prototype.getDirectory; }catch(e){}\n')
    ouvrir(pg); time.sleep(2)
    verif(pg.evaluate('window.__brumeOpfsSecours === true'), 'le rangement de secours (IndexedDB) est en place')
    telecharger(pg)
    verif(pg.evaluate('Voix.pret') is True, 'les voix se téléchargent')
    verif(attendre(pg, 'Voix.diag().mode !== "inconnu"', 120) and diag(pg)['mode'] == 'rapide', 'le moteur lit la voix rangée dans IndexedDB, la mesure se fait')
    attendre(pg, 'Voix.diag().voix.length === 2 && !Voix.diag().chargements', 60); calme(pg)
    r = essai(pg, COURT)
    verif(r['naturelle'] is not None and r['naturelle'] <= 1000, 'la voix naturelle part (%s ms)' % r['naturelle'])
    ctx.close()
    shutil.rmtree(profil, ignore_errors=True)

if __name__ == '__main__':
    modele = preparer()
    with sync_playwright() as p:
        partie_normale(p, modele)
        if not VITE: partie_vieille_tablette(p, modele)
    print('ÉCHECS :', echecs)
    print('ERREURS :', erreurs[:20])
