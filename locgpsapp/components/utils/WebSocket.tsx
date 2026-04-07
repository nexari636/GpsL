
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

export async function initClient() {

    ws=new WebSocket('wss://typically-rested-antelope.ngrok-free.app/ws');

    /*ws.onopen = () => {
        // Conexión establecida
        ws.send('¡Hola servidor!');
    };*/

    /*ws.onmessage = (e) => {
        // Mensaje recibido del servidor
        console.log('Datos recibidos:', e.data);
        frameCallbackMessages(e.data);
    };*/

    ws.onerror = (e:any) => {
        // Error en la conexión
        console.log('Error:', e.message);
    };

    ws.onclose = (e:any) => {
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