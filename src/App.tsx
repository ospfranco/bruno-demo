import "./App.css";
import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  InfoWindow,
  Marker,
} from "@vis.gl/react-google-maps";
import { FaBus, FaTrain, FaTram } from "react-icons/fa";

async function fetchStationsData(lat: number, lon: number) {
  const response = await fetch(
    `https://www.mvg.de/api/fib/v2/station/nearby?latitude=${lat}&longitude=${lon}`
  );
  if (!response.ok) {
    console.error("Failed to fetch station data from MVG API");
    return;
  }
  const stationData = await response.json();
  return stationData;
}

async function getStationDepartures(stationId: string) {
  const response = await fetch(
    `https://www.mvg.de/api/fib/v2/departure?globalId=${stationId}&limit=10&offsetInMinutes=0`
  );
  if (!response.ok) {
    console.error("Failed to fetch departure data from MVG API");
    return;
  }
  const departureData = await response.json();
  return departureData;
}

function App() {
  const [lat, setLat] = useState<number>(48.132284);
  const [lon, setLon] = useState<number>(11.609243);
  const [stationData, setStationData] = useState<any>(null);
  const [departureData, setdepartureData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!stationData) return;

    const fetchData = async () => {
      for (let station of stationData) {
        let departureData = await getStationDepartures(station.globalId);
        setdepartureData((prevData: any) => [...prevData, departureData]);
      }
    };
    fetchData();
  }, [stationData]);

  async function queryMvg(lat: number, lon: number) {
    let data = await fetchStationsData(lat, lon);

    setStationData(data.slice(0, 4));
  }

  async function locationSuccess(position: GeolocationPosition) {
    let latitude = 48.132284;
    let longitude = 11.609243;
    if (process.env.NODE_ENV !== "development") {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    }

    await queryMvg(latitude, longitude);
    setLat(latitude);
    setLon(longitude);
  }

  function onError(e: GeolocationPositionError) {
    switch (e.code) {
      case e.PERMISSION_DENIED:
        setError("User denied the request for Geolocation.");
        break;
      case e.POSITION_UNAVAILABLE:
        setError("Location information is unavailable.");
        break;
      case e.TIMEOUT:
        setError("The request to get user location timed out.");
        break;
      // case e.UNKNOWN_ERROR:
      //   setError("An unknown error occurred.");
      // break;
    }
  }
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationSuccess, onError);
    } else {
      setError("Geolocation not supported");
    }
  }, []);

  return (
    <div>
      {!!error && <p className="error">{error}</p>}

      <APIProvider apiKey="AIzaSyCY-zbetNbqES20us3lrD3a2AlYoZiRwR0">
        <Map
          style={{ width: "100vw", height: "100vh" }}
          defaultCenter={{ lat: lat, lng: lon }}
          defaultZoom={18}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          <Marker position={{ lat: lat, lng: lon }} />
          {!!stationData &&
            stationData?.map((station: any, index: number) => {
              let departures = departureData[index];

              return (
                <InfoWindow
                  className="info-window"
                  minWidth={350}
                  maxWidth={350}
                  headerDisabled
                  disableAutoPan
                  position={{
                    lat: station.latitude,
                    lng: station.longitude,
                  }}
                >
                  <div className="station-header">
                    <p className="station-title">{station.name}</p>
                  </div>
                  {departures
                    ?.slice(0, 6)
                    .map((departure: any, index: number) => {
                      let minuteDiff = Math.round(
                        (new Date(departure.realtimeDepartureTime).getTime() -
                          new Date().getTime()) /
                          60000
                      );

                      return (
                        <div key={index} className="departure">
                          {/* <p
                          style={{
                            backgroundColor: departure.cancelled
                              ? "red"
                              : "transparent",
                          }}
                        > */}
                          {departure.transportType === "BUS" && <FaBus />}
                          {departure.transportType === "TRAM" && <FaTram />}
                          {departure.transportType === "UBAHN" && (
                            <FaTrain />
                          )}{" "}
                          <p className="departure-label">{departure.label}</p>
                          {departure.destination.length > 20
                            ? `${departure.destination.substring(0, 20)}...`
                            : departure.destination}
                          {/* </p> */}
                          <div style={{ flex: 1 }} />
                          <span>
                            {minuteDiff > 0 && <span>in {minuteDiff}m </span>}
                            <strong>
                              {new Date(
                                departure.realtimeDepartureTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </strong>
                          </span>
                        </div>
                      );
                    })}
                </InfoWindow>
              );
            })}
        </Map>
      </APIProvider>
    </div>
  );
}

export default App;
