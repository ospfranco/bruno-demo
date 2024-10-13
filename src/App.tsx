import "./App.css";
import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  InfoWindow,
  Marker,
} from "@vis.gl/react-google-maps";

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
    const response = await fetch(
      `https://www.mvg.de/api/fib/v2/station/nearby?latitude=${lat}&longitude=${lon}`
    );
    if (!response.ok) {
      console.error("Failed to fetch data from MVG API");
      return;
    }
    const data = await response.json();

    if (!data || data.length === 0) {
      setError("No station data found");
      return;
    }

    setStationData(data.slice(0, 3));
  }

  async function locationSuccess(position: GeolocationPosition) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    await queryMvg(latitude, longitude);
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
                  minWidth={300}
                  maxWidth={300}
                  headerDisabled
                  disableAutoPan
                  position={{
                    lat: station.latitude,
                    lng: station.longitude,
                  }}
                >
                  <div>
                    <h2>{station.name}</h2>
                    {departures
                      ?.slice(0, 6)
                      .map((departure: any, index: number) => (
                        <div key={index} style={{ paddingBottom: 10 }}>
                          <p
                            style={{
                              backgroundColor: departure.cancelled
                                ? "red"
                                : "transparent",
                            }}
                          >
                            <strong>{departure.transportType}</strong>{" "}
                            {departure.label} to {departure.destination}
                          </p>
                          <p>
                            <strong>
                              {new Date(
                                departure.realtimeDepartureTime
                              ).toLocaleTimeString()}{" "}
                              (+{departure.delayInMinutes})
                            </strong>{" "}
                          </p>
                          {/* {departure.delayInMinutes > 0 && (
                        <p>
                          <strong>Delay:</strong> {departure.delayInMinutes} min
                        </p>
                      )} */}
                        </div>
                      ))}
                  </div>
                </InfoWindow>
              );
            })}
        </Map>
      </APIProvider>
      {/* {stationData && (
        <div>
          <div className="station-header">
            <h2>Nearest station</h2>
          </div>
          <div className="station-data">
            <p>{stationData.name}</p>
            <p>
              <strong>Transport Types:</strong>{" "}
              {stationData.transportTypes.join(", ")}
            </p>
            <p>
              <strong>Aliases:</strong> {stationData.aliases}
            </p>
            <p>
              <strong>Tariff Zones:</strong> {stationData.tariffZones}
            </p>
            <p>
              <strong>Distance in Meters:</strong>{" "}
              {stationData.distanceInMeters}
            </p>
          </div>
        </div>
      )}
      {departureData && (
        <div>
          <div className="station-header">
            <h2>Departure Information</h2>
          </div>

          {departureData.map((departure, index) => (
            <div key={index} className="departure-item">
              <p
                style={{
                  backgroundColor: departure.cancelled ? "red" : "transparent",
                }}
              >
                <strong>{departure.transportType}</strong> {departure.label} to{" "}
                {departure.destination}
              </p>
              <p>
                <strong>Planned:</strong>{" "}
                {new Date(departure.plannedDepartureTime).toLocaleTimeString()}
              </p>
              <p>
                <strong>Realtime:</strong>{" "}
                {new Date(departure.realtimeDepartureTime).toLocaleTimeString()}
              </p>
              {departure.delayInMinutes > 0 && (
                <p>
                  <strong>Delay:</strong> {departure.delayInMinutes} min
                </p>
              )}
              <p>
                <strong>Occupancy:</strong> {departure.occupancy}
              </p>
              <hr />
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}

export default App;
