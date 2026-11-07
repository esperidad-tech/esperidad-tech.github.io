import json
from playwright.sync_api import sync_playwright
D = '/home/claude/brumeval/brumeval-sources/d-rapide/'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto('file://' + D + 'index.html'); pg.wait_for_timeout(800)
    data = pg.evaluate("""() => {
      var RET = {ordre:1, temperature:1, rythme:1, loupe:1, ragots:1};
      var out = {};
      Object.keys(MJ.TYPES).forEach(function(k){
        var d = MJ.TYPES[k]; if(RET[k] || d.role === 'barde') return;
        var niv = {}; [1,2,3,4,5,6,7,8,9,10].forEach(function(n){ try{ var p = MJ.reglages(k, n, {}, {brut:true}); niv[n] = (p.lignes || []).map(function(l){ return [l.nom, String(l.val)]; }); }catch(e){ niv[n] = [['erreur', String(e)]]; } });
        var cons = ''; try{ cons = typeof d.consigne === 'function' ? d.consigne({}) : (d.consigne || ''); }catch(e){}
        var phrase = ''; try{ var f = MJ.PHRASES && MJ.PHRASES[k]; phrase = typeof f === 'function' ? f({}) : (f || ''); }catch(e){}
        var enq = {}; ['1','2','3'].forEach(function(e){ enq[e] = {enfant:MJ.niveauPour(k, +e, 'enfant'), adulte:MJ.niveauPour(k, +e, 'adulte')}; });
        out[k] = {nom:d.nom, ic:d.ic, role:d.role, consigne:cons, phrase:phrase, niv:niv, enq:enq, usages:[]};
      });
      /* où chaque jeu sert : les points des lieux, les pages du livre, les bonus… (tout objet avec mj:) */
      function fouiller(o, chemin, e){
        if(!o || typeof o !== 'object') return;
        if(Array.isArray(o)){ o.forEach(function(x, i){ fouiller(x, chemin, e); }); return; }
        if(typeof o.mj === 'string' && out[o.mj]) out[o.mj].usages.push({e:e, ou:chemin, nom:o.nom || o.titre || o.id || '', params:o.params || null});
        Object.keys(o).forEach(function(k){ if(k !== 'mj' && typeof o[k] === 'object') fouiller(o[k], chemin.length < 3 ? chemin.concat([k]) : chemin, e); });
      }
      Object.keys(window.ENQUETES || {}).forEach(function(e){ fouiller(ENQUETES[e], [], +e); });
      return out;
    }""")
    json.dump(data, open('/tmp/claude-0/-home-claude/3372a2cf-1f77-5598-a3f4-e1f632bdb837/scratchpad/mj-donnees.json', 'w'), ensure_ascii=False, indent=1)
    for k, v in data.items(): print(k, v['role'], v['nom'], '| E1', v['enq']['1'], 'E2', v['enq']['2'], '| usages', [(u['e'], '/'.join(u['ou'][:3]), u['nom']) for u in v['usages']][:6])
    b.close()
