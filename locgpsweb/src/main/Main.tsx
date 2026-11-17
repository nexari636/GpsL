import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import logo_truck from "../assets/truck.png";
import styles from "./Main.module.css"
import L from 'leaflet'
import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { initClient, ws } from '../utils/WebSocket';
import type { INumsUsers } from '../intefaces/INumsUsers';
import type { IMUser } from '../intefaces/IMUser';
import type { IMMessageData } from '../intefaces/IMessageData';

const CENTER: [number, number] = [-1.0371888, -79.4587187];
const REFRESH_OPTIONS = [5, 10, 20, 30];

const truckIcon = new L.DivIcon({
    className: styles.marker,
    html: `<div class="${styles.markerPin}"><img src="${logo_truck}" alt="" /></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -26]
});

function formatCoord(value: number) {
    return Number(value).toFixed(5);
}

export function Main(){

    const opcion = useRef<number>(5);
    const intervalId = useRef<number>(0);
    const [messageData, setMessageData] = useState<IMMessageData[]>();
    const [refreshRate, setRefreshRate] = useState<number>(5);
    const [connected, setConnected] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    function select_update(x: SyntheticEvent<HTMLSelectElement, Event>)
    {
        const value=x.currentTarget.value
        console.log(value);
        opcion.current=parseInt(value)
        setRefreshRate(opcion.current)
        interval()
    }

    function interval(){
        clear_interval()
        console.log("P= "+opcion.current);
        const intervalo = setInterval(() => {
            ws.send(JSON.stringify({"type":"admin","authorization":localStorage.getItem("key")}));
            console.log("Actualización");
        }, opcion.current*1000); // 1000ms = 1 segundo
        intervalId.current=intervalo;
    }

    function clear_interval(){
        clearInterval(intervalId.current);
    }

    function responsews(){
        ws.onmessage = (e) => {
            // Mensaje recibido del servidor
            console.log('Datos recibidos:', e.data);

            const data=e.data;
            const jsondata=JSON.parse(e.data)

            if (data.includes("number_of_users")) {
                const data_nuser=jsondata as INumsUsers;
                console.log("Existen "+data_nuser.NumberOfUsers+ " Usuarios conectados");
            }else if(data.includes("active_users")){
                const data_register=jsondata as IMUser;
                localStorage.setItem("key",data_register.key);
            }else if(data.includes("message_data")){
                const data_register=jsondata as IMMessageData[];
                console.log(data_register);
                setMessageData(data_register);
                setLastUpdate(new Date());
            }

        };
    }

    useEffect(() =>  {
        initClient(); //inicia el websocket
        responsews();

        const handleOpen = () => setConnected(true);
        const handleClose = () => setConnected(false);
        ws.addEventListener("open", handleOpen);
        ws.addEventListener("close", handleClose);

        console.log("Hello World!!!");
        interval();

        return () => {
            console.log("Cerrando WS...");
            clear_interval()
            ws.removeEventListener("open", handleOpen);
            ws.removeEventListener("close", handleClose);
            ws.close(); // se ejecuta al recargar o desmontar
        };

    }, []);

    const vehicleCount = messageData?.length ?? 0;
    const lastUpdateLabel = lastUpdate
        ? lastUpdate.toLocaleTimeString("es-EC", { hour12: false })
        : "—";

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <span className={styles.brandIcon}>
                        <img src={logo_truck} alt="" />
                    </span>
                    <div className={styles.brandText}>
                        <h1 className={styles.brandTitle}>LocGPS</h1>
                        <p className={styles.brandSubtitle}>Monitoreo de flota en tiempo real</p>
                    </div>
                </div>

                <div className={styles.headerMeta}>
                    <span className={`${styles.pill} ${connected ? styles.statusOnline : styles.statusOffline}`}>
                        <span className={styles.statusDot} aria-hidden="true" />
                        {connected ? "En línea" : "Sin conexión"}
                    </span>
                    <span className={styles.pill}>
                        {vehicleCount} {vehicleCount === 1 ? "vehículo" : "vehículos"}
                    </span>
                </div>
            </header>

            <main className={styles.content}>
                <section className={styles.mapCard} aria-label="Mapa de vehículos">
                    <MapContainer center={CENTER} zoom={16} scrollWheelZoom={false} className={styles.map}>
                        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {
                            messageData?.map((value,index)=>(
                                <Marker key={value.message.id || index} position={[value.message.latitud,value.message.longitud]} icon={truckIcon}>
                                    <Popup>
                                        <div className={styles.popup}>
                                            <div className={styles.popupHeader}>
                                                <span className={styles.popupAvatar}>
                                                    <img src={logo_truck} alt="" />
                                                </span>
                                                <div>
                                                    <p className={styles.popupName}>{value.user.names}</p>
                                                    <p className={styles.popupRole}>Vehículo monitoreado</p>
                                                </div>
                                            </div>
                                            <dl className={styles.popupCoords}>
                                                <dt>Latitud</dt>
                                                <dd>{formatCoord(value.message.latitud)}</dd>
                                                <dt>Longitud</dt>
                                                <dd>{formatCoord(value.message.longitud)}</dd>
                                            </dl>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))
                        }
                    </MapContainer>

                    {vehicleCount === 0 && (
                        <div className={styles.mapOverlay} role="status">
                            <span className={styles.mapOverlayDot} aria-hidden="true" />
                            Esperando datos de vehículos…
                        </div>
                    )}
                </section>

                <aside className={styles.sidebar}>
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Actualización</h2>
                            <span className={styles.cardBadge}>{refreshRate}s</span>
                        </div>
                        <p className={styles.cardHint}>Define cada cuánto se solicita la posición de la flota.</p>

                        <label className={styles.fieldLabel} htmlFor="refresh-rate">Frecuencia de actualización</label>
                        <div className={styles.selectWrap}>
                            <select
                                id="refresh-rate"
                                className={styles.select}
                                value={refreshRate}
                                onChange={select_update}
                            >
                                {REFRESH_OPTIONS.map((seconds) => (
                                    <option key={seconds} value={seconds}>{seconds} segundos</option>
                                ))}
                            </select>
                            <span className={styles.chevron} aria-hidden="true" />
                        </div>

                        <ul className={styles.metaList}>
                            <li className={styles.metaItem}>
                                <span className={styles.metaLabel}>Estado</span>
                                <span className={styles.metaValue}>{connected ? "Recibiendo datos" : "Reconectando…"}</span>
                            </li>
                            <li className={styles.metaItem}>
                                <span className={styles.metaLabel}>Última actualización</span>
                                <span className={styles.metaValue}>{lastUpdateLabel}</span>
                            </li>
                            <li className={styles.metaItem}>
                                <span className={styles.metaLabel}>Vehículos en mapa</span>
                                <span className={styles.metaValue}>{vehicleCount}</span>
                            </li>
                        </ul>
                    </section>

                    <section className={`${styles.card} ${styles.vehiclesCard}`}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Vehículos activos</h2>
                            <span className={styles.cardBadge}>{vehicleCount}</span>
                        </div>

                        {vehicleCount > 0 ? (
                            <ul className={styles.vehicleList}>
                                {messageData?.map((value, index) => (
                                    <li key={`${value.message.id}-${index}`} className={styles.vehicleItem}>
                                        <span className={styles.vehicleAvatar}>
                                            <img src={logo_truck} alt="" />
                                        </span>
                                        <div className={styles.vehicleInfo}>
                                            <p className={styles.vehicleName}>{value.user.names}</p>
                                            <p className={styles.vehicleCoords}>
                                                {formatCoord(value.message.latitud)}, {formatCoord(value.message.longitud)}
                                            </p>
                                        </div>
                                        <span className={styles.vehicleBadge}>Activo</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.emptyState}>
                                <strong>Sin vehículos por ahora</strong>
                                Los vehículos aparecerán aquí cuando se conecten.
                            </div>
                        )}
                    </section>
                </aside>
            </main>
        </div>
    )

}
