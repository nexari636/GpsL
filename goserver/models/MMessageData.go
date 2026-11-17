package models

type MMessageData struct {
	User    MUser    `json:"user"`
	Message MMessage `json:"message"`
}
