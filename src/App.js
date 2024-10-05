import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [stationData, setStationData] = useState();
  const [departureData, setdepartureData] = useState();
  const [error, setError] = useState();

  async function queryMvg(lat, lon) {
    const response = await fetch(
      `https://www.mvg.de/api/fib/v2/station/nearby?latitude=${lat}&longitude=${lon}`
    );
    if (!response.ok) {
      console.error("Failed to fetch data from MVG API");
      return;
    }
    const data = await response.json();

    setStationData(data[0]);

    const stationId = data[0].globalId;

    const departureResponse = await fetch(
      `https://www.mvg.de/api/fib/v2/departure?globalId=${stationId}&limit=10&offsetInMinutes=0`
    );
    if (!departureResponse.ok) {
      console.error("Failed to fetch departure data from MVG API");
      return;
    }
    const departureData = await departureResponse.json();

    setdepartureData(departureData);
  }

  async function locationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    await queryMvg(latitude, longitude);
  }

  function onError(e) {
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
      case e.UNKNOWN_ERROR:
        setError("An unknown error occurred.");
        break;
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
    <div className="App">
      {error && <p>{error}</p>}
      {stationData && (
        <div>
          <h2>Station Information</h2>
          <p>
            <strong>Name:</strong> {stationData.name}
          </p>
          <p>
            <strong>Place:</strong> {stationData.place}
          </p>
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
            <strong>Distance in Meters:</strong> {stationData.distanceInMeters}
          </p>
        </div>
      )}
      {departureData && (
        <div>
          <h2>Departure Information</h2>
          {departureData.map((departure, index) => (
            <div key={index}>
              <p>
                <strong>Transport Type:</strong> {departure.transportType}
              </p>
              <p>
                <strong>Label:</strong> {departure.label}
              </p>
              <p>
                <strong>Destination:</strong> {departure.destination}
              </p>
              <p>
                <strong>Planned Departure Time:</strong>{" "}
                {new Date(departure.plannedDepartureTime).toLocaleString()}
              </p>
              <p>
                <strong>Realtime Departure Time:</strong>{" "}
                {new Date(departure.realtimeDepartureTime).toLocaleString()}
              </p>
              <p>
                <strong>Delay in Minutes:</strong> {departure.delayInMinutes}
              </p>
              <p>
                <strong>Cancelled:</strong> {departure.cancelled ? "Yes" : "No"}
              </p>
              <p>
                <strong>Occupancy:</strong> {departure.occupancy}
              </p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
