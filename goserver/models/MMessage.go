package models

type MMessage struct {
	Id       string  `json:"id"`
	Latitud  float64 `json:"latitud"`
	Longitud float64 `json:"longitud"`
}
