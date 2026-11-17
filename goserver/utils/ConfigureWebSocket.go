package utils

/*utilizacion de la libreria gorilla*/

import (
	"fmt"
	"main/models"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

/*********************CANALES*********************************/

// crea un mapa de tipo Conn y utiliza make para que reserve memoria y quede utilizable
// la llave del mapa es la dirección de memoria de Conn y guarda un valor booleano
var clients = make(map[*websocket.Conn]bool)

// crea un canal de tipo Message y utiliza make para que reserve memoria y quede utilizable
var broadcast = make(chan models.MDataSocket)

// crea un canal de tipo Message y utiliza make para que reserve memoria y quede utilizable
// guarda la cantidad de usuarios conectados
var broadcast_users = make(chan *models.MUserConnected)

// canal para el registro de usuario conectado
var broadcast_register_users = make(chan models.MUser)

// canal para el envio de estado de mensajes guardado por cada uno de los usuarios
var broadcast_users_messages = make(chan models.MDataSocket)

// canal para el envio de todos los mensajes guardados por cada uno de los usuarios
var broadcast_users_messages_admin = make(chan models.MDataSocket)

/*********************************************************/

// guarda el registro de usuario conectado
var register_users = make(map[*websocket.Conn]models.MUser)

// guarda la informacion de usuarios conectados (cantidad)
var connected_user_info models.MUserConnected

// Informacion de mensaje por usuario
// guarda la información del mensaje para cada usuario (se actualiza la información cuando el usuario envie una nueva)
var users_messages = make(map[*websocket.Conn]models.MMessageData)

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
	connected_user_info = models.MUserConnected{
		Type:          NumberOfUsers,
		NumberOfUsers: len(clients),
	}
	broadcast_users <- &connected_user_info //se comunica con el canal que da a conocer usuarios activos
	fmt.Println("Usuario nuevo conectado...")

	for {
		var msg models.MDataSocket
		err := conn.ReadJSON(&msg)
		fmt.Println("Mensaje nuevo")
		//fmt.Println(err)

		//si es diferente a null, es decir que tenga un error cierra la conexion
		if err != nil {
			/*fmt.Println(err)
			delete(clients, conn)
			delete(register_users, conn)
			broadcast_users <- len(clients) //se comunica con el canal encargado de anunciar la cantidad de usuarios actualizada
			fmt.Println("Cliente desconectado...")*/
			DeleteUserDisconnected(&connected_user_info, conn, err)
			return
		}

		msg.ConnectionClient = conn //asigna la conexion actual
		msg.Clients = len(clients)

		fmt.Println("Mensaje nuevo de tipo:", msg.Type)
		if msg.Type == MessageLocation { //envia a los todos los usuarios excepto al patrocinador del mensaje
			fmt.Println("Mensajes de locaciones")
			//se comuninica con el canal de mensajes de locaciones
			msg.User = register_users[conn] //asigna datos del usuario actual , segun la conexion
			msg.AllUsers = false
			msg.Message.Type = msg.Type
			broadcast <- msg
		} else if msg.Type == ActiveUsersAll { //envia a todos los usuarios
			fmt.Println("Mensajes de locaciones todos los usuarios")
			//se comuninica con el canal de mensajes de locaciones
			msg.User = register_users[conn] //asigna datos del usuario actual , segun la conexion
			msg.AllUsers = true
			msg.Message.Type = msg.Type
			broadcast <- msg
		} else if msg.Type == ActiveUsers {
			fmt.Println("Mensaje de activar usuarios")
			var client_info = models.MUser{
				Names:            msg.User.Names,
				Key:              GenerateKey(),
				Date_time:        Current_date_format_data(),
				Type:             msg.Type,
				ConnectionClient: conn,
			}
			fmt.Println("El usuario es: " + msg.User.Names)
			broadcast_register_users <- client_info
		} else if msg.Type == SaveData {
			//users_messages[conn]=msg.Message
			msg.User = register_users[conn] //asigna datos del usuario actual , segun la conexion
			broadcast_users_messages <- msg
		} else if msg.Type == Admin {
			msg.User = register_users[conn] //asigna datos del usuario actual , segun la conexion
			broadcast_users_messages_admin <- msg
		} else {
			//otros tipos....
		}
	}
	fmt.Println("Usuario desconectado...")
}

/********************************************/
func DeleteUserDisconnected(InfoUser *models.MUserConnected, conn *websocket.Conn, err error) {
	fmt.Println(err)
	delete(clients, conn)
	delete(register_users, conn)
	delete(users_messages, conn)
	connected_user_info.NumberOfUsers = len(clients) //actualiza la lista de usuarios conectados
	broadcast_users <- InfoUser                      //se comunica con el canal encargado de anunciar la cantidad de usuarios actualizada
	fmt.Println("Cliente desconectado...")
}

/********************************************/

func handleClientsConnectedRegister() {
	for {
		fmt.Println("enviando a usuario pcausa")
		var msg = <-broadcast_register_users
		register_users[msg.ConnectionClient] = msg
		var client = msg.ConnectionClient
		//fmt.Println(msg)
		err := client.WriteJSON(msg)
		if err != nil {
			/*fmt.Println(err)
			client.Close()
			delete(clients, client)
			broadcast_users <- len(clients)
			fmt.Println("Cliente desconectado...")*/
			DeleteUserDisconnected(&connected_user_info, client, err)
			return
		}
	}
}

// envia mensajes a cada cliente suscrito
// ignora al cliente propetario del mensaje
func handleMessages() {
	for {
		var msg = <-broadcast

		if strings.TrimSpace(msg.Authorization) == "" {
			var client = msg.ConnectionClient

			var data_error = models.MErrorSocket{
				Error: "Authorization key not sent",
			}

			err := client.WriteJSON(data_error)
			if err != nil {
				/*fmt.Println(err)
				client.Close()
				delete(clients, client)
				broadcast_users <- len(clients)
				fmt.Println("Cliente desconectado...")*/
				DeleteUserDisconnected(&connected_user_info, client, err)
				return
			}
			continue
		}

		fmt.Println("Clave obtenida correctamente...")

		for client := range clients {

			//compara posiciones de memoria *p=*p
			if !msg.AllUsers && client == msg.ConnectionClient {
				fmt.Println("Ignorando al cliente base....")
				continue
			}

			err := client.WriteJSON(models.MMessageData{Message: msg.Message, User: msg.User})
			if err != nil {
				/*fmt.Println(err)
				client.Close()
				delete(clients, client)
				broadcast_users <- len(clients)
				fmt.Println("Cliente desconectado...")*/
				DeleteUserDisconnected(&connected_user_info, client, err)
				return
			}
		}
	}
}

func handleMessageClientsConnected() {
	for {
		var msg = <-broadcast_users
		for client := range clients {
			err := client.WriteJSON(msg)
			//err := client.WriteMessage(websocket.TextMessage, []byte(strconv.Itoa(msg)))
			if err != nil {
				fmt.Println(err)
				client.Close()
				delete(clients, client)
				delete(register_users, client)
				delete(users_messages, client)
				fmt.Println("Cliente desconectado...")
				return
			}
		}
	}
}

func ClientMessageState() {
	for {

		var msg = <-broadcast_users_messages

		if strings.TrimSpace(msg.Authorization) == "" {
			var client = msg.ConnectionClient

			var data_error = models.MErrorSocket{
				Error: "Authorization key not sent",
			}

			err := client.WriteJSON(data_error)
			if err != nil {
				DeleteUserDisconnected(&connected_user_info, client, err)
				return
			}
			continue
		}

		fmt.Println("Clave obtenida correctamente...")

		var message = models.MStateMessage{
			Success: true,
		}

		users_messages[msg.ConnectionClient] = models.MMessageData{Message: msg.Message, User: msg.User}
		var client = msg.ConnectionClient
		//fmt.Println(msg)
		err := client.WriteJSON(message)
		if err != nil {
			DeleteUserDisconnected(&connected_user_info, client, err)
			return
		}
	}
}

func MessageBoxClient() {
	for {

		var msg = <-broadcast_users_messages_admin

		if strings.TrimSpace(msg.Authorization) == "" {
			var client = msg.ConnectionClient

			var data_error = models.MErrorSocket{
				Error: "Authorization key not sent",
			}

			err := client.WriteJSON(data_error)
			if err != nil {
				DeleteUserDisconnected(&connected_user_info, client, err)
				return
			}
			continue
		}

		fmt.Println("Clave obtenida correctamente...")

		var lstdata = []models.MMessageData{}

		for _, data := range users_messages {
			data.User.Key = ""
			data.User.Type = ""
			lstdata = append(lstdata, data)
		}

		var client = msg.ConnectionClient
		//fmt.Println(msg)
		err := client.WriteJSON(lstdata)
		if err != nil {
			DeleteUserDisconnected(&connected_user_info, client, err)
			return
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
	go handleClientsConnectedRegister()
	go ClientMessageState()
	go MessageBoxClient()

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error al iniciar el servidor: " + err.Error())
	}
}
