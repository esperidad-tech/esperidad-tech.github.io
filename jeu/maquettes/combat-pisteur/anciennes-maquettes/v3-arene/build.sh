#!/bin/sh
cd /home/claude/pisteur3
cat tete.html > index.html && printf '<script>{\n' >> index.html && cat consts.js son.js util.js gros.js jeu.js dessin.js >> index.html && printf '\n}</script>\n</body>\n</html>\n' >> index.html
python3 -c "
s=open('index.html').read();a=s.index('<script>{')+8;b=s.rindex('}</script>')+1;open('/tmp/v3.js','w').write(s[a:b])"
node --check /tmp/v3.js && echo SYNTAX_OK
