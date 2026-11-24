# Les modèles du combat du Barde (barde/outils.js, golems.js, grosbec.js), repris tels quels, avec trois petites retouches pour le combat du Sage :
#  - les golems peuvent être cuits plus petits (ici ils sont deux fois plus petits qu'en face du Barde) ;
#  - leur ombre n'est plus cuite avec eux (ici ils tournent en l'air quand on les projette : l'ombre doit rester au sol) ;
#  - Grosbec peut être vu d'un peu plus haut (le réglage E de son modèle), et cuit plus petit.
import os
D = os.path.dirname(os.path.abspath(__file__))
def modeles():
    ou = open(D + '/barde/outils.js').read(); go = open(D + '/barde/golems.js').read(); gr = open(D + '/barde/grosbec.js').read()
    def rep(s, a, b):
        assert s.count(a) == 1, (a[:70], s.count(a)); return s.replace(a, b)
    go = rep(go, "function regler(k) { k = Math.min(2, Math.max(1, k));", "function regler(k) { k = Math.min(2, Math.max(0.4, k));")
    go = rep(go, "function sol(x, r) { // son ombre, et le rouge qu'il pose sur les dalles", "function sol(x, r) { return; // (combat du Sage : l'ombre est dessinée à part)")
    gr = rep(gr, "const E = 0.2, Y0 = -132, HAUT = 286;", "const E = 0.45, Y0 = -132, HAUT = 286;   // (combat du Sage : vu d'un peu plus haut ; 0.2 en face du Barde)")
    assert "const BOITE = { x0: -212, y0: -306, w: 424, h: 342 };" in gr
    gr = rep(gr, "function construire(K0, gk0) { K = Math.min(2, Math.max(1, K0)); gk = gk0; kc = Math.min(2.3, K0 * gk0);", "function construire(K0, gk0) { K = Math.min(2, Math.max(0.6, K0)); gk = gk0; kc = Math.min(2.3, gk0);")
    return ou + '\n' + go + '\n' + gr
