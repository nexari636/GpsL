package models

import "github.com/gorilla/websocket"

type MUser struct {
	Names            string          `json:"names"`
	Key              string          `json:"key"`
	Date_time        string          `json:"date_time"`
	Type             string          `json:"type"`
	ConnectionClient *websocket.Conn `json:"-"` //ignorar atributo
}
