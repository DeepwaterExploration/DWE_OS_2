package main

type CameraInfo struct {
	Model    string `json:"model"`
	Nickname string `json:"nickname"`
	ID       string `json:"id"`
}

type VideoInfo struct {
	Path              string     `json:"path"`
	Camera            CameraInfo `json:"camera"`
	DateCreated       float64    `json:"dateCreated"`
	HumanReadableDate string     `json:"humanReadableDate"`
}
