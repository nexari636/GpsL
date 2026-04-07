package utils

/*utilizacion de la libreria gorilla*/

import (
	"fmt"
	"main/models"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

// crea un mapa de tipo Conn y utiliza make para que reserve memoria y quede utilizable
var clients = make(map[*websocket.Conn]bool)

// crea un canal de tipo Message y utiliza make para que reserve memoria y quede utilizable
var broadcast = make(chan models.MMessage)

// crea un canal de tipo Message y utiliza make para que reserve memoria y quede utilizable
// guarda la cantidad de usuarios conectados
var broadcast_users = make(chan int)

// permite la conexion a cualquier usuario
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	//ayuda que ante cualquier error cierre la conexion (comunmente se lo usa cuando la funcion termine liberar recursos)
	defer conn.Close()

	clients[conn] = true
	broadcast_users <- len(clients)
	fmt.Println("Usuario nuevo conectado...")

	for {
		var msg models.MMessage
		err := conn.ReadJSON(&msg)
		fmt.Println("Mensaje nuevo")
		//fmt.Println(err)

		//si es diferente a null, es decir que tenga un error cierra la conexion
		if err != nil {
			fmt.Println(err)
			delete(clients, conn)
			broadcast_users <- len(clients)
			fmt.Println("Cliente desconectado...")
			return
		}
		broadcast <- msg
	}
	fmt.Println("Usuario desconectado...")
}

// envia mensajes a cada cliente suscrito
func handleMessages() {
	for {
		var msg = <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				fmt.Println(err)
				client.Close()
				delete(clients, client)
				broadcast_users <- len(clients)
				fmt.Println("Cliente desconectado...")
			}
		}
	}
}

func handleMessageClientsConnected() {
	for {
		var msg = <-broadcast_users
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, []byte(strconv.Itoa(msg)))
			if err != nil {
				fmt.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func InitWebSocket() {
	http.HandleFunc("/ws", handleConnections)
	fmt.Println("Servidor web socket iniciado en el puerto :8080")

	//ejecuta una función en una goroutine (como un hilo ligero).
	//se ejecuta en conjunto con el programa pero sin bloquear el programa
	go handleMessages()
	go handleMessageClientsConnected()

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error al iniciar el servidor: " + err.Error())
	}
}
