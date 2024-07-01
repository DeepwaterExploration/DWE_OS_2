import sys
import os
cwd = os.getcwd()
sys.path.append(cwd)
os.chdir(os.path.join(cwd,"backend_py/src")) # access device_settings
# import the module from a diffrent path
import backend_py.src.stream