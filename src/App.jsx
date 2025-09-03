import React, { useState, useEffect } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const API_KEY = "0e400ff44b79686930aba79e2b3f5531";

  const fetchWeatherByCity = async (cityName) => {
    if (!cityName) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== "200" && data.cod !== 200) {
        setError("❌City not found. Please enter a valid city name");
        setForecast([]);
        return;
      }
      setWeather(data);
      setError("");

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));
    } catch (err) {
      setError("⚠ Failed to fetch weather data. Please try again later.");
      setForecast([]);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeather(data);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));
      setCity(data.name);
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => alert("Location access denied.")
      );
      setError("");
    } else {
      alert("Geolocation not supported");
    }
  };

  useEffect(() => {
    fetchWeatherByCity("Lagos");
  }, []);

  const getWeatherEmoji = (main) => {
    if (!main) return "☀️";
    const emojiMap = {
      Clouds: "☁️",
      Clear: "☀️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Mist: "🌫️",
      Snow: "❄️",
      Thunderstorm: "⛈️",
    };
    return emojiMap[main] || "☀️";
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1501630834273-4b5604d2ee31')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0",
      }}
    >
      <div
        className="container p-3 rounded shadow-lg d-flex flex-column align-items-center"
        style={{
          maxWidth: "900px",
          width: "100%",
          minHeight: "600px",
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.31)",
          color: "white",
        }}
      >
        <h1 className="text-center mb-3 fw-bold" style={{ fontSize: "2.2rem" }}>
          🌤Weather Forecast
        </h1>

        <div className="input-group mb-3" style={{ maxWidth: "500px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              fontSize: "1rem",
              borderRadius: "6px 0 0 6px",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "0.375rem 0.75rem",
            }}
          />
          <button
            onClick={() => fetchWeatherByCity(city)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0095ff92",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0 6px 6px 0",
              height: "38px",
              fontSize: "0.85rem",
              color: "black",
              cursor: "pointer",
              padding: "0 10px",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "#FFD700AA")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#FFD70080")}
          >
            Search
          </button>
        </div>

        {error && (
          <div className="text-danger mt-2" style={{ fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <button
          onClick={getLocation}
          className="btn btn-outline-light mb-3"
          style={{ fontSize: "0.85rem" }}
        >
          📍 Use My Location
        </button>

        {weather && (
          <div
            className="card mb-3 text-dark d-flex flex-column align-items-center"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              borderRadius: "10px",
            }}
          >
            <div className="card-body text-center">
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.4rem" }}>
                {weather?.name || "City Name"}, {weather?.sys?.country || "XX"}
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontSize: "2rem",
                }}
              >
                <span style={{ fontSize: "2.3rem", fontWeight: "bold" }}>
                  {Math.round(weather?.main?.temp ?? 0)}°C
                </span>
                {getWeatherEmoji(weather?.weather?.[0]?.main)}
              </div>
              <p
                className="text-capitalize mb-1"
                style={{ fontSize: "1.0rem" }}
              >
                {weather?.weather?.[0]?.description || "Weather condition"}
              </p>

              <div
                className="d-flex justify-content-around flex-wrap mt-2 w-100 flex-direction-column flex-sm-row"
                style={{ fontSize: "0.85rem" }}
              >
                <div>
                  <span style={{ fontWeight: "500" }}>Humidity:</span>{" "}
                  {weather?.main?.humidity ?? 0}%
                </div>
                <div>
                  <span style={{ fontWeight: "500" }}>Wind: </span>
                  {weather?.wind?.speed ?? 0} m/s
                </div>
                <div>
                  <span style={{ fontWeight: "500" }}>Pressure: </span>
                  {weather?.main?.pressure ?? 0} hPa
                </div>
                <div>
                  <span style={{ fontWeight: "500" }}>Sunrise: </span>{" "}
                  {weather?.sys?.sunrise
                    ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString()
                    : "--:--"}
                </div>
                <div>
                  <span style={{ fontWeight: "500" }}>Sunset: </span>{" "}
                  {weather?.sys?.sunset
                    ? new Date(weather.sys.sunset * 1000).toLocaleTimeString()
                    : "--:--"}
                </div>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="flex-grow-1 d-flex flex-column align-items-center w-100 mt-2">
            <h5 className="mb-3 fw-semibold" style={{ fontSize: "1.4rem" }}>
              5-Day Forecast
            </h5>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {forecast.map((day, index) => (
                <div
                  key={index}
                  className="card border-0 d-flex flex-column align-items-center"
                  style={{
                    width: "120px",
                    height: "150px",
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.35)",
                    borderRadius: "10px",
                    paddingTop: "20px",
                  }}
                >
                  <div className="card-body text-center p-2 d-flex flex-column justify-content-center align-items-center">
                    <h6 className="fw-bold mb-1" style={{ fontSize: "0.8rem" }}>
                      {new Date(day.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </h6>
                    <p className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
                      {Math.round(day.main.temp)}°C
                    </p>
                    <p
                      className="text-capitalize small mb-1"
                      style={{ fontSize: "0.7rem", textAlign: "center" }}
                    >
                      {day.weather[0].description}
                    </p>
                    <p style={{ fontSize: "1.4rem" }}>
                      {getWeatherEmoji(day.weather[0].main)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
