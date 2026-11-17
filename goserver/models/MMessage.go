package models

type MMessage struct {
	IdMessage string  `json:"id"`
	Latitud   float64 `json:"latitud"`
	Longitud  float64 `json:"longitud"`
	Type      string  `json:"type"`
}
