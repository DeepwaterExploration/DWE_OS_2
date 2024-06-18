import sys
import os
cwd = os.getcwd()
sys.path.append(cwd)
os.chdir(os.path.join(cwd,"backend_py/src")) # access device_settings
# import the module from a diffrent path

from backend_py.src import recording
from backend_py.src.camera_types import StreamEncodeTypeEnum, Interval
from backend_py.src.schemas import StreamSchema

record = recording.Saving(
    h264_streamer="",
    mjpeg_streamer=""
) #create empty version of recording (no actual streaming capabilities)
def test_creation():
    '''Check to make sure class is created successfully'''
    assert isinstance(record, recording.Saving) # Just test that it is created successfully

def test_path():
    '''Check to make sure the path is correct'''
    assert record.path == os.path.join(os.environ["HOME"], ".DWE", "videos") # make sure path is correct

def test_h264_pipeline():
    '''Check that the h264 pipeline is correct'''
    temp_strftime = record.strftime
    temp_path = record.path
    record.path = ""
    record.strftime = "test"
    # Set output to a controlled location instead of STRFTIME
    assert record._construct_pipeline() == "gst-launch-1.0 -e v4l2src device= ! video/x-h264,width=1920,height=1080,framerate=30/1 ! h264parse ! queue ! mp4mux ! filesink location=test.mp4"
    record.strftime = temp_strftime
    record.path = temp_path
    #revert path

def test_mjpeg_pipeline():
    '''Check that the mjpeg pipeline is correct'''
    temp_strftime = record.strftime
    temp_path = record.path
    record.encode_type = StreamEncodeTypeEnum.MJPEG # Change selected to default
    record.path = ""
    record.strftime = "test"
    assert record._construct_pipeline() == "gst-launch-1.0 -e v4l2src device= ! image/jpeg,width=1920,height=1080,framerate=30/1 ! queue ! avimux ! filesink location=test.avi"
    record.strftime = temp_strftime
    record.path = temp_path

def test_customization():
    '''Make sure a base value works to customize'''
    record.set_customization({
        "width": 192,
        "height": 108,
        "interval": {
            "numerator": 1,
            "denominator": 60
        }
    })
    assert record.interval == Interval(numerator=1, denominator=60)
    assert record.width == 192
    assert record.height == 108
def test_failed_customization_handling():
    '''Make sure the program doesnt crash when given incorrect parameters'''
    try:
        record.set_customization({})
        assert True
    except:
        assert False

def test_incorrect_schema_type():
    '''Make sure incorrect types are detected'''
    record.set_customization({"width":"n0t qu1te @ number","interval":"not an object"})
    assert record.width != "n0t qu1te @ number"
    assert record.interval != "not an object"

def test_using_schema():
    '''Make sure objects can be loaded using schema'''
    schema = StreamSchema().load(data={"width":1000,"height":999})
    record.set_customization(schema)
    assert record.width == 1000
    assert record.height == 999

def test_with_failed_directory():
    '''Make sure program doesn't start when we don't make a valid save directory'''
    record.path = "path/to/nowhere"
    record.start()
    assert not record.started

