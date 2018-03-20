# flask /wsgi
from gevent.wsgi import WSGIServer
from gevent import monkey
from flask import Flask, request, redirect
from urllib.parse import urlparse, urlunparse

# patch for gevent cooperative tasking
monkey.patch_all()

from backend.api import makeApp

app = makeApp(preprefix='/energyhill')

@app.before_request
def redirect_eg():
    u = urlparse(request.url)

    # don't redirect static content to https
    # possibel security risk by appending static to a non-static url??
    if '/static/' in u.path:
        return None

    # already https
    if u.netloc == 'www.eg.bucknell.edu':# and request.is_secure:
        # logging.info("NO redirect {}".format(request.url))
        return None

    # redirect everything else
    # logging.info(str(u))
    # logging.info(request.headers)
    # force https
    x  = urlunparse(('https', 'www.eg.bucknell.edu') + u[2:])
    logging.info("redirect {} to {}".format(request.url, x))
    return redirect(x, code=301)

http_server = WSGIServer(('', 4002), app)
http_server.serve_forever()
