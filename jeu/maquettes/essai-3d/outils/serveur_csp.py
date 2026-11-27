# un petit serveur qui imite la règle de sécurité des pages Claude (pas de fetch de data:, images data:/blob: permises)
import http.server, socketserver, functools, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'")
        super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', int(sys.argv[2])), functools.partial(H, directory=sys.argv[1])) as s: s.serve_forever()
