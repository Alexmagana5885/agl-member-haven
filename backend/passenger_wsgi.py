import imp
import os
import sys


sys.path.insert(0, os.path.dirname(__file__))

wsgi = imp.load_source('wsgi', 'passenger_wsgi.py')
application = wsgi.application


# passenger_wsgi.py

# import sys
# import os

# sys.path.insert(0, os.path.dirname(__file__))

# from app import app as application


