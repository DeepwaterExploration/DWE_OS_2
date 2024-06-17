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
)
def test_creation():
    assert isinstance(record, recording.Saving)

def test_path():
    assert record.path == os.path.join(os.environ["HOME"], ".DWE", "videos")

def test_h264_pipeline():
    temp_strftime = record.strftime
    temp_path = record.path
    record.path = ""
    record.strftime = "test"
    assert record._construct_pipeline() == "gst-launch-1.0 -e v4l2src device= ! video/x-h264,width=1920,height=1080,framerate=30/1 ! h264parse ! queue ! mp4mux ! filesink location=test.mp4"
    record.strftime = temp_strftime
    record.path = temp_path

def test_mjpeg_pipeline():
    temp_strftime = record.strftime
    temp_path = record.path
    record.encode_type = StreamEncodeTypeEnum.MJPEG
    record.path = ""
    record.strftime = "test"
    assert record._construct_pipeline() == "gst-launch-1.0 -e v4l2src device= ! image/jpeg,width=1920,height=1080,framerate=30/1 ! queue ! avimux ! filesink location=test.avi"
    record.strftime = temp_strftime
    record.path = temp_path

def test_customization():
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
    try:
        record.set_customization({})
        assert True
    except:
        assert False

def test_incorrect_schema_type():
    record.set_customization({"width":"n0t qu1te @ number","interval":"not an object"})
    assert record.width != "n0t qu1te @ number"
    assert record.interval != "not an object"

def test_using_schema():
    schema = StreamSchema().load(data={"width":1000,"height":999})
    record.set_customization(schema)
    assert record.width == 1000
    assert record.height == 999

def test_with_failed_directory():
    record.path = "path/to/nowhere"
    record.start()
    assert not record.started

