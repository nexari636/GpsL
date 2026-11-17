import { URL_SOCKET } from "./BaseUrl";

export let ws: WebSocket;
//export let frameCallbackMessages: (data: string) => void;

export interface UserDataWS {
    id: string;
    latitud: number;
    longitud: number;
}

/*export function registerOnDataMessagesRecibe(fn: () => void) {
  frameCallbackMessages = fn;
}*/

export function initClient() {
   
    ws=new WebSocket(URL_SOCKET);

    ws.onopen = () => {
        // Conexión establecida
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({"type":"active_users","user":{"names":"admin"}})); //autenticarse
        } else {
            console.log("WebSocket aún no está listo");
        }
    };

    /*ws.onmessage = (e) => {
        // Mensaje recibido del servidor
        console.log('Datos recibidos:', e.data);
        frameCallbackMessages(e.data);
    };*/

    ws.onerror = (e:Event) => {
        // Error en la conexión
        console.log('Error:', e);
    };

    ws.onclose = (e:CloseEvent) => {
        // Conexión cerrada
        console.log('Cerrado:', e.code, e.reason);
    };

}


/*

function wsMessage(message:UserDataWS)
{
    ws.send(JSON.stringify(message));
}

*/