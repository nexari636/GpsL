package models

type MPerson struct {
	Id              string `json:"id"`
	Nombre          string `json:"nombre"`
	Apellidos       string `json:"apellidos"`
	Edad            int    `json:"edad"`
	Correo          string `json:"correo"`
	Numero_telefono string `json:"numero_telefono"`
}
