import { Text } from "@react-navigation/elements";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Location from "expo-location";
import { generate_uuidv4 } from "../utils/GenUuid";
import { initClient, UserDataWS, ws } from "../utils/WebSocket";

export default function Main() {
  const insets = useSafeAreaInsets();

  const [vectorMarker,setVectorMarker] = useState<UserDataWS[]>([]);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const [selectedMarker,SetselectedMarker] = useState<boolean>(false);


  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      console.log("prueba");

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const data_loc:UserDataWS={
        id:generate_uuidv4(),
        latitud:location.coords.latitude??0,
        longitud:location.coords.longitude??0,
      }

      ws.send(JSON.stringify(data_loc));

    }

    getCurrentLocation();

    initClient();

    ws.onmessage = (e) => {
      // Mensaje recibido del servidor
      console.log('Datos recibidos:', e.data);

      if (!String(e.data).includes("id")) return;

      const data=JSON.parse(e.data);

      if("id" in data)
      {
        console.log("añadiendo informacion al vector");
        const data_convert=data as UserDataWS;
        console.log(data_convert);
        console.log(data_convert.latitud);
        console.log(data_convert.longitud);

        setVectorMarker(ref=> [...ref, data_convert]  );
      }

    };

  }, []);




  useEffect(() => {
    let text = "Waiting...";
    if (errorMsg) {
      text = errorMsg;
    } else if (location) {
      text = JSON.stringify(location);
      console.log(text);
    }
  }, [location]);

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        height: "100%",
      }}
    >
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: location?.coords.latitude ?? -0.1807,
            longitude: location?.coords.longitude ?? -78.4678,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/*<UrlTile
                urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
            />*/}

          {/*<Marker
            coordinate={{ latitude: -0.1807, longitude: -78.4678 }}
            title="Quito"
          />

          <Marker
            coordinate={{
              latitude: location?.coords.latitude ?? 0,
              longitude: location?.coords.longitude ?? 0,
            }}
            title="Quito"
          />*/}

          {
            vectorMarker?.map((currentValue, index, array)=>(
                <Marker
                  key={index}
                  coordinate={{
                    latitude: currentValue.latitud,
                    longitude: currentValue.longitud,
                  }}
                  onPress={e=>SetselectedMarker(ref=>!ref)}
                >
                  <Image
                    source={require('../../assets/images/truck.png')}
                    style={{ width: 40, height: 40 }}
                  />
                </Marker>
            ))
          }
        </MapView>

        <Text style={styles.data_user}>
          {"Latitud: " + location?.coords.latitude}
        </Text>
        <Text style={styles.data_user}>
          {"Longitud: " + location?.coords.longitude}
        </Text>

        {selectedMarker && (
          <View style={styles.container_data}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#000" }}>
                Carlos Moreno
              </Text>
                <Text style={{ color: "#000" }}>Telefono: 0999999999</Text>
                <Text style={{ color: "#000" }}>Latitud: -1.0371925</Text>
                <Text style={{ color: "#000" }}>Longitud: -79.4587168</Text>
                <Text style={{ color: "#000" }}>Operador</Text>
            </View>
          
            <Image
              source={require('../../assets/images/truck.png')}
              style={{
                width: 100,
                height: 100,
                marginLeft: 15
              }}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B2B0D4",
  },
  map: {
    width: "100%",
    height: 500,
  },
  data_user: {
    marginStart: "3%",
    color: "#000",
    fontSize: 20,
  },
  container_data:{
    zIndex: 999,
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
  }
});
