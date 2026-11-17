package models

import "github.com/gorilla/websocket"

type MDataSocket struct {
	Type             string          `json:"type"`
	User             MUser           `json:"user"`
	Message          MMessage        `json:"message"`
	Authorization    string          `json:"authorization"`
	AllUsers         bool            `json:"all_users"`
	ConnectionClient *websocket.Conn `json:"-"` //ignorar atributo
	Clients          int
}
