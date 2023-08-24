import asyncio
import base64
import http.server
import json
import os
import platform
import sys
import urllib.parse
from http.server import HTTPServer

import cpuHandler
import systemHandler
import temperatureHandler
from loguru import logger

current_os = platform.system()
platform_name = platform.uname()

from wifiHandlerRPI import WifiHandler

if (
    current_os == "Linux"
    and "raspbian" in platform_name.release.lower()
    or platform_name.node == "blueos"
):
    from wifiHandlerRPI import WifiHandler
elif current_os == "Linux":
    pass
elif current_os == "Darwin":  # macOS
    pass
elif current_os == "Windows":
    pass
else:
    logger.error("You are running an unsupported platform. Exiting.")
    sys.exit(1)

wifi_handler = WifiHandler()


def base64Decode(encoded_string: str) -> int:
    """
    Returns the decoded string.

    Parameters:
    - encoded_string (str): The encoded string.

    Returns:
    - decoded_string (str): The decoded string.
    """
    # Convert the Base64 encoded string to bytes
    encoded_bytes = encoded_string.encode("utf-8")

    # Decode the bytes using Base64
    decoded_bytes = base64.b64decode(encoded_bytes)

    # Convert the decoded bytes back to a string
    decoded_string = decoded_bytes.decode("utf-8")

    return decoded_string


class HTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        logger.info("HTTP request handler initialized.")
        # Initialize the parent class
        super().__init__(*args, **kwargs)

    def end_headers(self):
        # Set "Access-Control-Allow-Origin" header to the value of the "Origin" header
        # If "Origin" header is not present in the request, use "*" to allow requests from any origin
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin", "*"))

        # Set "Access-Control-Allow-Methods" header to allow the specified HTTP methods for cross-origin requests
        # In this case, we allow "GET", "POST", and "OPTIONS" methods
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

        # Set "Access-Control-Allow-Headers" header to specify the allowed request headers for cross-origin requests
        # Here, we allow "X-Requested-With", "Content-Type", and "Accept" headers
        self.send_header(
            "Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept"
        )

        # Set "Access-Control-Allow-Credentials" header to "true" to allow sending credentials (e.g., cookies, HTTP authentication)
        # By default, it is set to "false", but in this case, we enable it to allow credentials for cross-origin requests
        self.send_header("Access-Control-Allow-Credentials", "true")

        # Call the end_headers method of the superclass to complete the headers of the response
        # This will send the headers to the client in the response
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    async def async_do_GET(self):
        # Handling GET requests asynchronously
        # Parse the request path and query parameters from the request URL sent by the client
        parsed_url = urllib.parse.urlparse(self.path)
        urllib.parse.parse_qs(parsed_url.query)
        logger.info(f"GET request path: {parsed_url.path}")
        url_path = parsed_url.path
        # when wifi is requested
        if url_path == "/wifiStatus":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.network_status()

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        elif url_path == "/wifiConnected":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.connected()

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        elif url_path == "/wifiScan":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.scan()

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        elif url_path == "/wifiSaved":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.saved()

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        elif url_path == "/getCPU":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary and convert to JSON format
            response_content = json.dumps(cpuHandler.get_cpu_info())

            # Send the response content encoded in utf-8
            self.wfile.write((response_content).encode("utf-8"))
        elif url_path == "/getMemory":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary and convert to JSON format
            response_content = json.dumps(cpuHandler.get_cpu_info())

            # Send the response content encoded in utf-8
            self.wfile.write((response_content).encode("utf-8"))
        elif url_path == "/getTemperature":
            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary and convert to JSON format
            response_content = json.dumps(temperatureHandler.get_temperature())

            # Send the response content encoded in utf-8
            self.wfile.write((response_content).encode("utf-8"))
        elif url_path == "/shutDownMachine":
            # Set the response status code
            self.send_response(200)

            systemHandler.shut_down()
        elif url_path == "/restartMachine":
            # Set the response status code
            self.send_response(200)

            systemHandler.restart_machine()
        else:
            # Set the response status code
            self.send_response(404)

            # Set the response headers
            self.send_header("Content-type", "text/html")
            self.end_headers()

            # Build the response content in HTML format
            response_content = "<html><body><h1>404 Not Found</h1></body></html>"

            # Send the response content encoded in utf-8
            self.wfile.write((response_content).encode("utf-8"))

    async def async_do_POST(self):
        # Handling POST requests asynchronously
        # Parse the request path and query parameters from the request
        parsed_url = urllib.parse.urlparse(self.path)
        logger.info(f"POST request path: {parsed_url.path}")
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length).decode("utf-8")
        parsed_data = json.loads(post_data)
        url_path = parsed_url.path
        if url_path == "/wifiToggle":
            # Extract wifi_status from the query parameters
            wifi_status = parsed_data["wifi_status"]

            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.toggle_wifi_status(wifi_status)

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))

        # connect to wifi with parameters
        elif url_path == "/wifiConnect":
            # Extract wifi ssid and password from query parameters
            wifi_ssid = base64Decode(parsed_data["wifi_ssid"])
            wifi_password = base64Decode(parsed_data["wifi_password"])

            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.connect(wifi_ssid, wifi_password)

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        elif url_path == "/wifiForget":
            # Extract wifi ssid from query parameters
            wifi_ssid = parsed_data["wifi_ssid"]

            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.forget(wifi_ssid)

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        elif url_path == "/wifiDisconnect":
            # Extract wifi ssid from query parameters
            wifi_ssid = parsed_data["wifi_ssid"]

            # Set the response status code
            self.send_response(200)

            # Set the response headers
            self.send_header("Content-type", "application/json")
            self.end_headers()

            # Build the response content as a dictionary
            response_content = await wifi_handler.disconnect(wifi_ssid)

            # Convert the response convert to JSON format
            json_response = json.dumps(response_content)

            # Send the response content encoded in utf-8
            self.wfile.write((json_response).encode("utf-8"))
        else:
            # Set the response status code
            self.send_response(404)

            # Set the response headers
            self.send_header("Content-type", "text/html")
            self.end_headers()

            # Build the response content in HTML format
            response_content = "<html><body><h1>404 Not Found</h1></body></html>"

            # Send the response content encoded in utf-8
            self.wfile.write((response_content).encode("utf-8"))

    async def handle_staticFiles(self):
        # Extract the file path from the request URL
        file_path = urllib.parse.urlparse(self.path).path

        # Remove the leading '/' from the file path
        file_path = file_path[1:]

        try:
            # Check if the requested file exists in the "static" directory
            if os.path.exists("static/" + file_path):
                # Open the requested file in binary mode
                with open("static/" + file_path, "rb") as file:
                    # Determine the file's content type based on the file extension
                    content_type = (
                        "text/html"
                        if file_path.endswith(".html")
                        else "text/css"
                        if file_path.endswith(".css")
                        else "application/javascript"
                    )

                    # Set the response status code
                    self.send_response(200)

                    # Set the response headers
                    self.send_header("Content-type", content_type)
                    self.end_headers()

                    # Send the file's content to the client
                    self.wfile.write(file.read())
            else:
                # If the file is not found, return a not found response
                self.send_response(404)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"File not found.")
        except FileNotFoundError:
            # If an exception occurs while reading the file, return an internal server error response
            self.send_response(500)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Internal Server Error.")

    def do_GET(self):
        asyncio.run(self.async_do_GET())

    def do_POST(self):
        asyncio.run(self.async_do_POST())


# Main function to run the server
def run_server():
    try:
        # Set up the server address and port
        PORT = 5050
        server = HTTPServer(("", PORT), HTTPRequestHandler)
        # Start the server
        logger.info(f"Server started at http://localhost:{PORT}.")
        server.serve_forever()
    except KeyboardInterrupt:
        print()
        # Stop the server on keyboard interrupt
        logger.error("Keyboard Interrupt received, shutting down the server.")
        server.server_close()


if __name__ == "__main__":
    if os.geteuid() != 0:
        logger.error(
            "You need root privileges to run this script.\nPlease try again using **sudo**. Exiting."
        )
        sys.exit(1)
    else:
        run_server()
