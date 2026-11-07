# lent-outil.py <outil.py> [args] : lance un outil Playwright avec des délais de 30 s (machine chargée)
import sys, runpy
from playwright.sync_api import Page, BrowserContext
_o = Page.set_default_timeout
Page.set_default_timeout = lambda self, t: _o(self, 30000)
_c = BrowserContext.new_page
def np(self, *a, **k):
    p = _c(self, *a, **k); _o(p, 30000); return p
BrowserContext.new_page = np
from playwright.sync_api import Browser
_b = Browser.new_page
def bp(self, *a, **k):
    p = _b(self, *a, **k); _o(p, 30000); return p
Browser.new_page = bp
outil = sys.argv[1]; sys.argv = [outil] + sys.argv[2:]
runpy.run_path(outil, run_name='__main__')
