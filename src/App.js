import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [lat, setLat] = useState();
  const [lon, setLon] = useState();
  const [nearestStationData, setNearestStationData] = useState();
  const [error, setError] = useState();

  async function queryMvg(lat, lon) {
    // https://www.mvg.de/api/fib/v2/station/nearby?latitude=48.132534&longitude=11.609269
    const response = await fetch(
      `https://www.mvg.de/api/fib/v2/station/nearby?latitude=${lat}&longitude=${lon}`
    );
    if (!response.ok) {
      console.error("Failed to fetch data from MVG API");
      return;
    }
    const data = await response.json();
    // console.log(data);

    const stationId = data[0].globalId;

    const departureResponse = await fetch(
      `https://www.mvg.de/api/fib/v2/departure?globalId=${stationId}&limit=10&offsetInMinutes=0`
    );
    if (!departureResponse.ok) {
      console.error("Failed to fetch departure data from MVG API");
      return;
    }
    const departureData = await departureResponse.json();
    console.log(departureData);
    setNearestStationData(departureData);
  }

  async function locationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLat(latitude);
    setLon(longitude);

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
      <p>Lat: {lat}</p>
      <p>Long: {lon}</p>
      {error && <p>{error}</p>}
      {nearestStationData && (
        <div>
          <h2>Departure Information</h2>
          {nearestStationData.map((departure, index) => (
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
