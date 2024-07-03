package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func handleWifiStatus(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkStatus()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error getting wifi status: %v", err))
		return
	} else {
		// Marshal the response content into JSON
		jsonData, err := json.Marshal(responseContent)
		if err != nil {
			Log.Error(fmt.Sprintf("Error marshaling JSON: %v", err))
			return
		}

		// Write the JSON response to the client
		w.Write(jsonData)
	}
}

func handleWifiScan(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkScan()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error getting the connected wifi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func handleWifiSaved(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkSaved()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error getting the connected wifi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func handleWifiConnected(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkConnected()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error getting the connected wifi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func toggleWifiStatus(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Parse the request body into a WifiToggleRequest struct
	var request WifiToggleRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkToggle(request.WifiState)

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error toggling the WiFi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func connectToWifi(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Parse the request body into a WifiToggleRequest struct
	var request WifiConnectRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}
	Log.Info(fmt.Sprintf("Attempting to connect to %s with password: %s", request.WifiSSID, request.WifiPassword))

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkConnect(request.WifiSSID, request.WifiPassword)

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error connecting to the WiFi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func disconnectWifi(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Parse the request body into a WifiToggleRequest struct
	var request WifiDisconnectRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkDisconnect(request.WifiSSID)

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error disconnecting from the WiFi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func forgetWifi(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Parse the request body into a WifiToggleRequest struct
	var request WifiForgetRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}

	// Build the response content as a JSON struct
	responseContent, err := wifiHandler.NetworkForget(request.WifiSSID)

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error forgetting the WiFi network: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func shutdownMachine(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	err := ShutDown()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error forgetting the WiFi network: %v", err))
		return
	}
}

func restartMachine(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	err := Restart()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error forgetting the WiFi network: %v", err))
		return
	}
}

func handleGetTemperature(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	responseContent, err := GetTemperature()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error getting the temperature: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}

func handleCPU(w http.ResponseWriter, r *http.Request) {
	// Set the response status code
	w.WriteHeader(http.StatusOK)

	// Set the response headers to indicate the content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Build the response content as a JSON struct
	responseContent, err := GetCPUInfo()

	// Check if there was an error
	if err != nil {
		// Log the error
		Log.Error(fmt.Sprintf("Error getting the CPU info: %v", err))
		return
	} else {
		// Send the response content convert encoded in utf-8
		json.NewEncoder(w).Encode(responseContent)
	}
}
func handleVideo(w http.ResponseWriter, r *http.Request) {

	// Set the response headers to indicate the content type
	path := r.URL.Query().Get("path")
	if path == "" {
		path, err = os.UserHomeDir()
		if err != nil {
			Log.Error(fmt.Sprintf("Error getting the Video path: %v", err))
			return
		}
	}
	dwePath := path + "/.DWE"
	videos := dwePath + "/videos"
	universalJson := videos + "/videos.json"

	_, err := os.ReadFile(universalJson)

	if err != nil {
		if os.IsNotExist(err) {
			Log.Warn(fmt.Sprint("Creating file"))
			os.Mkdir(dwePath, 0777)
			os.Mkdir(videos, 0777)
			file, err := os.OpenFile(universalJson, os.O_RDONLY|os.O_CREATE, 0777)
			if err != nil {
				return
			}
			empty := []byte("[]")
			os.WriteFile(universalJson, empty, 0777)

			file.Close()
		} else {
			Log.Error(fmt.Sprintf("Error getting the Video File: %v", err))
			return
		}
	}
	http.ServeFile(w, r, universalJson)

}

func deleteVideo(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	file := r.URL.Query().Get("file")

	path, err := os.UserHomeDir()
	if err != nil {
		log.Printf("Error getting the Video path: %v", err)
		return
	}

	dwePath := filepath.Join(path, ".DWE")
	videos := filepath.Join(dwePath, "videos")
	universalJson := filepath.Join(videos, "videos.json")

	videoPath := filepath.Join(videos, file)

	// Ensure directories exist
	if _, err := os.Stat(dwePath); os.IsNotExist(err) {
		if err := os.Mkdir(dwePath, 0777); err != nil {
			log.Printf("Error creating directory: %v", err)
			return
		}
	}
	if _, err := os.Stat(videos); os.IsNotExist(err) {
		if err := os.Mkdir(videos, 0777); err != nil {
			log.Printf("Error creating directory: %v", err)
			return
		}
	}

	// Ensure the JSON file exists
	if _, err := os.Stat(universalJson); os.IsNotExist(err) {
		file, err := os.Create(universalJson)
		if err != nil {
			log.Printf("Error creating JSON file: %v", err)
			return
		}
		empty := []byte("[]")
		if _, err := file.Write(empty); err != nil {
			log.Printf("Error writing to JSON file: %v", err)
			return
		}
		file.Close()
		log.Println("Created new JSON file")
		return // there was no file to delete
	}

	// Read the JSON file
	contents, err := os.ReadFile(universalJson)
	if err != nil {
		log.Printf("Error reading JSON file: %v", err)
		return
	}

	var data []VideoInfo
	if err := json.Unmarshal(contents, &data); err != nil {
		log.Printf("Error unmarshalling JSON: %v", err)
		return
	}

	newData := make([]VideoInfo, 0)
	videoDeleted := false
	for _, video := range data {
		if video.Path == videoPath {
			videoDeleted = true
		} else {
			newData = append(newData, video)
		}
	}

	if !videoDeleted {
		log.Println("Video not found:", videoPath)
		return
	}

	// Remove the video file
	if err := os.Remove(videoPath); err != nil {
		log.Printf("Error deleting video file: %v", err)
		return
	}

	// Save the updated JSON data
	updatedContents, err := json.MarshalIndent(newData, "", "  ")
	if err != nil {
		log.Printf("Error marshalling JSON: %v", err)
		return
	}

	if err := os.WriteFile(universalJson, updatedContents, 0644); err != nil {
		log.Printf("Error writing JSON file: %v", err)
		return
	}

}

func serveVideo(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("path")
	if url == "" {
		Log.Warn("Error serving video, no url provided")
		return
	}
	http.ServeFile(w, r, url)
}

var wifiHandler *WifiHandler
var err error
var errs []error

func init() {
	// Initialize the logger
	initalizeLogger()

	// Initialize the Wi-Fi handler
	wifiHandler, err = NewWifiHandler()
	if err != nil {
		Log.Error(fmt.Sprintf("Error initializing wifi handler: %v", err))
		return
	}
}

func main() {
	if wifiHandler != nil {
		// Initialize the router
		r := mux.NewRouter()
		r.HandleFunc("/wifiStatus", handleWifiStatus).Methods("GET")
		r.HandleFunc("/wifiScan", handleWifiScan).Methods("GET")
		r.HandleFunc("/wifiSaved", handleWifiSaved).Methods("GET")
		r.HandleFunc("/wifiConnected", handleWifiConnected).Methods("GET")
		r.HandleFunc("/wifiToggle", toggleWifiStatus).Methods("POST")
		r.HandleFunc("/wifiConnect", connectToWifi).Methods("POST")
		r.HandleFunc("/wifiDisconnect", disconnectWifi).Methods("POST")
		r.HandleFunc("/wifiForget", forgetWifi).Methods("POST")
		r.HandleFunc("/shutDownMachine", shutdownMachine).Methods("POST")
		r.HandleFunc("/restartMachine", restartMachine).Methods("POST")
		r.HandleFunc("/getTemperature", handleGetTemperature).Methods("GET")
		r.HandleFunc("/getCPU", handleCPU).Methods("GET")
		r.HandleFunc("/videos", handleVideo).Methods("GET")
		r.HandleFunc("/deletevideo", deleteVideo).Methods("GET")
		r.HandleFunc("/servevideo", serveVideo).Methods("GET")

		// Create a new HTTP server with the CORS (Cross-Origin Resource Sharing) middleware enabled
		corsOptions := handlers.CORS(
			handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Accept"}), // Allow only headers from the list
			handlers.AllowedOrigins([]string{"Access-Control-Allow-Origin", "*"}),           // Allow requests from any origin
			handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),                     // Allow only GET and POST methods
		)

		// Set up the server address and port
		const port = 5050
		const host = "0.0.0.0"

		// Start the server
		Log.Info(fmt.Sprintf("Server started at http://%s:%d.", host, port))
		http.Handle("/", corsOptions(r))
		http.ListenAndServe(fmt.Sprintf("%s:%d", host, port), nil)
	}
}
