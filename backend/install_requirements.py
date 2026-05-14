# install_requirements.py
import os
import sys

python = sys.executable

os.system(f'"{python}" -m pip install -r requirements.txt')
os.system(f'"{python}" -m pip install flask-cors')

print("Installed")