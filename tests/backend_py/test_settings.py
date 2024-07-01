import sys
import os
cwd = os.getcwd()
src =os.path.join(cwd,"backend_py/src")
if (os.path.isdir(src)):
    sys.path.append(cwd)
    os.chdir(src) # access device_settings
# import the module from a diffrent path
import backend_py.src.settings