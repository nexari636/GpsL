import { Client } from "@stomp/stompjs";
import { URL_SOCKET } from "./BaseUrl";
import { ToastError, ToastSuccess } from "./ToastMessages";

export let client: Client;
const urlws = URL_SOCKET;
export let activate: boolean = false;
export let frameCallbackMessages: (data: string) => void;

export interface UserData {
  iduser: string;
  correo: string;
}

export function registerOnDataMessages(fn: () => void) {
  frameCallbackMessages = fn;
}

export async function initClient(userdata: UserData) {
  client = new Client({
    brokerURL: urlws,
    reconnectDelay: 5000, //si el websocket se cae cada 5 segundos se realizara la reconexion
    //heartbeatIncoming: 4000, //verifica si el servidor sigue vivo
    //heartbeatOutgoing: 4000, //envia un heartbeat al servidor para que sepa que el cliente sigue conectado
    forceBinaryWSFrames: true, //Fuerza a que el cliente STOMP envíe todos los frames STOMP como binarios (Blob o ArrayBuffer), en lugar de texto plano.
    appendMissingNULLonIncoming: true, //Le dice al cliente STOMP que agregue automáticamente el carácter de terminación \x00 (NULL) a los mensajes STOMP si no lo tienen. ejemplo: Hola mundo\x00
  });

  client.onStompError = function (frame) {
    console.log("Broker reported error: " + frame.headers["message"]);
    console.log("Additional details: " + frame.body);
    ToastError(
      "Error",
      "Error al conectar con el servidor. Intenta nuevamente más tarde.",
    );
  };

  client.onWebSocketError = (error) => {
    console.log("Error con websocket", error);
    ToastError(
      "Error",
      "La conexion con el web socket fallo reconectando.... ",
    );
  };

  client.debug = function (str) {
    console.log(str);
  };

  client.onConnect = function (frame) {
    ToastSuccess("Success", "Conexion establecida correctamente");

    client.publish({
      destination: "urlUser",
      body: JSON.stringify(userdata),
    });

    client.subscribe("data_pos", (data) => {
      ToastSuccess("Nuevo usuario!!", "Un usuario nuevo se ha unido al mapa");
      console.log(data.body);
      frameCallbackMessages(data.body);
    });
  };

  if (!activate) //si es false es porque no esta activo el websocket y lo activa
  {
    console.log("socket se esta activando.....");
    Conectar();
  }
}

export function Conectar() {
  client.activate();
  activate = true;
}

export function Desconectar() {
  client.deactivate();
  activate = false;
}
