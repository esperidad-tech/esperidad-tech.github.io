
/* ============ Les sons de l'établi : de petits sons discrets, fabriqués par le programme (comme ceux du labo et du jeu) ============
   Rien ne joue avant le premier toucher (les navigateurs l'interdisent). Dans le jeu, le réglage des sons du jeu décide. */
/* >>> LES SONS DE L'ÉTABLI (ce bloc est recopié tel quel dans l'Atelier des sons : donjon/essai/construire-sons.py)
   Les mêmes briques que le jeu et que le labo : des notes douces, des souffles, de petits grains. */
function sonsEtabli(audio, sortie){
  function tendre(f, t0, duree, vol, glisse, att, type, filtre){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
    g.connect(sortie(a)); o.start(t); o.stop(t + duree + 0.03);
  }
  /* un souffle : du bruit filtré dont la hauteur glisse de f0 à f1 */
  function souffle(t0, duree, vol, f0, f1, q, type){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
    f.type = type || 'bandpass'; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.06, duree * .3)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* de tout petits grains secs (le feu qui crépite, les graines, la poudre) */
  function grains(t0, duree, vol, nb, passeHaut){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr * duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var k = 0; k < nb; k++){ var c = Math.floor(n * Math.random() * .9), l = Math.floor(sr * (.001 + Math.random() * .004)), v = .4 + Math.random() * .6; for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random() * 2 - 1) * v * (1 - j / l); }
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = passeHaut || 2400; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* des bulles : de petites notes qui montent */
  function bulles(t0, nb, duree, f0, vol){ for(var i = 0; i < nb; i++){ var f = f0 * (1 + Math.random() * .9); tendre(f, t0 + Math.random() * duree, .07 + Math.random() * .05, vol, f * 1.7, .006); } }
  return {
    /* toucher, choisir, se tromper */
    clic:function(){ tendre(523, 0, .055, .04, 440, .005); },
    plante:function(){ souffle(0, .16, .022, 1800, 3200, .7); tendre(659, .02, .09, .035, 784, .008); tendre(988, .09, .14, .022, null, .008); },      /* on prend une plante sur le linge (un froissement de feuilles) */
    partie:function(){ souffle(0, .09, .03, 2600, 1500, .9); tendre(880, .04, .1, .03, 1175, .006); },                                                   /* on détache une partie : un petit « clac » de tige */
    pose:function(){ tendre(196, 0, .08, .06, 147, .004, 'triangle', 700); grains(0, .07, .012, 5, 1800); },                                             /* la matière se pose dans un outil */
    bien:function(){ tendre(660, 0, .1, .05, null, .01, 'triangle', 2600); tendre(990, .08, .2, .05, null, .01, 'triangle', 2800); },                                    /* le bon geste : deux notes claires */
    non:function(){ tendre(300, 0, .09, .045, 262, .01, 'triangle', 900); tendre(262, .09, .12, .04, 233, .01, 'triangle', 800); },                      /* ce n'était pas le bon geste */
    pouf:function(){ souffle(0, .34, .06, 500, 160, .5, 'lowpass'); tendre(110, 0, .16, .05, 70, .006, 'sine'); },                                       /* un petit nuage */
    nom:function(){ tendre(587, 0, .06, .03, 660, .006); },                                                                                              /* un outil dit son nom */
    zoom:function(){ souffle(0, .45, .018, 380, 1100, .6); },
    dezoom:function(){ souffle(0, .4, .018, 1100, 380, .6); },
    /* les outils */
    hache:function(){ tendre(170, 0, .05, .09, 110, .002, 'triangle', 900); grains(0, .04, .03, 4, 1500); souffle(0, .05, .02, 2400, 900, 1.2); },      /* un coup de couteau sur la planche */
    tamis:function(){ souffle(0, .13, .035, 2200, 3800, .9); grains(.02, .12, .018, 16, 3000); },                                                        /* une secousse du tamis */
    pilon:function(){ tendre(130, 0, .09, .1, 82, .003, 'sine'); tendre(520, 0, .03, .02, 300, .002, 'triangle', 1400); grains(.01, .06, .012, 4, 1400); }, /* un coup de pilon dans la pierre */
    presse:function(){ tendre(92, 0, .5, .05, 128, .05, 'sawtooth', 380); tendre(184, .08, .4, .014, 240, .05, 'triangle', 700); grains(.05, .4, .008, 9, 900); },  /* la vis de bois grince */
    goutte:function(){ tendre(880, 0, .07, .045, 1500, .004); tendre(1500, .05, .05, .016, 1900, .004); },                                               /* une goutte tombe */
    verse:function(){ souffle(0, .55, .04, 900, 1700, 1.4); bulles(.05, 9, .5, 420, .022); },                                                            /* la cruche verse son eau */
    huile:function(){ souffle(0, .5, .022, 500, 900, 1.6); bulles(.08, 5, .45, 300, .02); },                                                             /* l'huile coule, plus épaisse */
    filtre:function(){ for(var i = 0; i < 6; i++){ var f = 700 + Math.random() * 500; tendre(f, i * .13 + Math.random() * .04, .06, .03, f * 1.6, .004); } },   /* ça passe goutte à goutte à travers le tissu */
    buche:function(){ tendre(150, 0, .09, .11, 96, .003, 'triangle', 800); tendre(220, .07, .07, .05, 140, .003, 'triangle', 700); grains(0, .1, .012, 5, 1200); }, /* une bûche cogne les pierres du foyer */
    allumette:function(){ souffle(0, .09, .05, 3200, 5200, 1.2); grains(0, .08, .03, 14, 3200); souffle(.1, .45, .045, 700, 320, .6, 'lowpass'); },      /* craac… fouch */
    feu:function(){ souffle(0, 1.5, .03, 420, 300, .5, 'lowpass'); grains(.05, 1.4, .03, 26, 1800); },                                                   /* le feu prend et crépite */
    bouillon:function(){ souffle(0, 1.7, .016, 600, 900, .7); bulles(0, 26, 1.6, 240, .03); },                                                           /* ça bout à gros bouillons */
    mijote:function(){ bulles(0, 9, 1.5, 200, .024); souffle(0, 1.5, .008, 500, 600, .7); },                                                             /* ça chauffe tout doucement */
    trempe:function(){ tendre(300, 0, .12, .05, 520, .01); bulles(.1, 4, .5, 330, .018); },                                                              /* plouf : ça trempe dans l'eau froide */
    cuillere:function(){ tendre(240, 0, .05, .035, 190, .003, 'triangle', 900); tendre(260, .22, .05, .03, 200, .003, 'triangle', 900); },               /* la cuillère de bois cogne la marmite */
    seche:function(){ souffle(0, 1.6, .016, 1400, 2400, .5); tendre(1568, 1.3, .3, .014, null, .02); },                                                  /* un petit courant d'air, et le temps passe */
    alambic:function(){ souffle(0, 2.2, .014, 1800, 2600, 1.1); bulles(.1, 14, 2, 180, .022); },                                                         /* la vapeur siffle dans le col de cygne */
    grille:function(){ grains(0, .5, .035, 22, 2000); souffle(0, .5, .03, 2600, 1200, .8); },                                                            /* ça grille : raté */
    /* la mise en fiole */
    fiole:function(){ bulles(0, 8, .55, 380, .03); souffle(0, .55, .02, 700, 1500, 1.4); },                                                              /* glou, glou : la fiole se remplit */
    bouchon:function(){ tendre(210, 0, .06, .09, 420, .003, 'triangle', 1200); tendre(900, .01, .04, .02, 600, .003); },                                 /* pop : le bouchon de liège */
    potion:function(){ [659, 880, 1109, 1319, 1760].forEach(function(f, i){ tendre(f, i * .09, .5, .04, null, .012, 'triangle', 3200); }); tendre(2637, .46, .6, .012, null, .02); grains(.3, .5, .008, 18, 5000); },   /* une potion est prête : un arpège clair, des paillettes */
    toutes:function(){ [523, 659, 784, 1047, 1319, 1568].forEach(function(f, i){ tendre(f, i * .11, .7, .045, null, .012, 'triangle', 3000); }); tendre(2093, .7, .9, .02, null, .03); grains(.5, .8, .01, 30, 5000); },   /* les sept potions sont prêtes */
    /* le grimoire, le sac */
    livre:function(){ tendre(120, 0, .12, .06, 90, .004, 'triangle', 500); souffle(.05, .22, .03, 1500, 2800, .7); },                                    /* le grimoire s'ouvre */
    page:function(){ souffle(0, .2, .034, 1700, 3400, .8); grains(.02, .14, .008, 6, 3000); },                                                           /* une page tourne */
    sac:function(){ souffle(0, .2, .03, 500, 300, .7, 'lowpass'); tendre(1320, .12, .1, .02, 1100, .004); tendre(1650, .2, .12, .016, null, .004); }      /* le cuir du sac, les fioles qui tintent */
  };
}
/* <<< LES SONS DE L'ÉTABLI */
var SON = {actif:true, ctx:null};
try { if(localStorage.getItem('brumeval-etabli-son') === 'non') SON.actif = false; } catch(e){}
function audio(){
  if(!SON.ctx){ try { SON.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ SON.ctx = null; } }
  if(SON.ctx && SON.ctx.state === 'suspended') try { SON.ctx.resume(); } catch(e){}
  return SON.ctx;
}
var SONS = sonsEtabli(audio, function(a){ return a.destination; });
function son(nom){ if(!SON.actif) return; try { (SONS[nom] || SONS.clic)(); } catch(e){} }
