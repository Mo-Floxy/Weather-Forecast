import React, { useState, useEffect } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // kept (fetches still use it)
  const [darkMode, setDarkMode] = useState(false);

  const API_KEY = "0e400ff44b79686930aba79e2b3f5531";

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Function to group forecast and pick entry closest to 12:00
  const getDailyForecast = (list) => {
    const daily = {};
    list.forEach((item) => {
      const date = new Date(item.dt_txt).toLocaleDateString("en-CA"); // YYYY-MM-DD
      const hour = new Date(item.dt_txt).getHours();
      if (!daily[date]) {
        daily[date] = item;
      } else {
        // Replace if this hour is closer to 12:00
        if (
          Math.abs(hour - 12) <
          Math.abs(new Date(daily[date].dt_txt).getHours() - 12)
        ) {
          daily[date] = item;
        }
      }
    });
    return Object.values(daily).slice(0, 5); // first 5 days
  };

  const fetchWeatherByCity = async (cityName) => {
    if (!cityName) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200 && data.cod !== "200") {
        setError("❌ City not found. Please enter a valid city name");
        setForecast([]);
        setLoading(false);
        return;
      }
      setWeather(data);
      setError("");

      // Use forecast API (3-hour interval)
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      setForecast(getDailyForecast(forecastData.list));
    } catch (err) {
      setError("⚠ Failed to fetch weather data. Please try again later.");
      setForecast([]);
    } finally {
      setLoading(false);
      setWeather({
        name: "Current Location",
        main: {
          temp: data.current.temp,
          humidity: data.current.humidity,
          pressure: data.current.pressure,
        },
        weather: data.current.weather,
        wind: { speed: data.current.wind_speed },
        sys: { sunrise: data.current.sunrise, sunset: data.current.sunset },
        uvi: data.current.uvi, // ✅ UV index
      });
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeather(data);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      setForecast(getDailyForecast(forecastData.list));
      setCity(data.name);
    } catch (err) {
      setError("⚠ Failed to fetch weather data by location.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("📍 Coords:", latitude, longitude);

          try {
            // Reverse geocode to get a nearby city
            const res = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const data = await res.json();

            if (data.length > 0) {
              // ✅ Just use the city name
              const cityName = data[0].name;
              console.log("🏙️ Nearest city:", cityName);

              // Fetch weather by lat/lon (reliable)
              fetchWeatherByCoords(latitude, longitude);

              // Show short city name (Ikoyi, Lekki, Ikeja…)
              setCity(cityName);
            } else {
              setError("⚠ Could not determine city from location.");
            }
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
            setError("⚠ Failed to fetch city name from location.");
          }
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
          alert("Location access denied or unavailable.");
        }
      );
      setError("");
    } else {
      alert("Geolocation not supported in this browser.");
    }
  };

  useEffect(() => {
    fetchWeatherByCity("Lagos");
  }, []);

  const getWeatherEmoji = (description) => {
    if (!description) return "☀️";
    const desc = description.toLowerCase();
    const emojiMap = {
      "clear sky": "☀️",
      "few clouds": "🌤️",
      "scattered clouds": "🌥️",
      "broken clouds": "⛅",
      "overcast clouds": "☁️",
      "shower rain": "🌧️",
      rain: "🌦️",
      "light rain": "🌦️",
      "moderate rain": "🌧️",
      thunderstorm: "⛈️",
      snow: "❄️",
      mist: "🌫️",
      haze: "🌫️",
      smoke: "🌫️",
      dust: "🌪️",
      fog: "🌁",
    };
    return emojiMap[desc] || "🌍";
  };

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      {/* Dark Mode Toggle */}
      <button className="dark-toggle" onClick={toggleDarkMode}>
        <span className="dark-text">
          {darkMode ? "☀️Light Mode" : "🌙Dark Mode"}
        </span>
        <span className="dark-icon">{darkMode ? "☀️" : "🌙"}</span>
      </button>

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundImage: darkMode
            ? "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1503264116251-35a269479413?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')"
            : "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1501630834273-4b5604d2ee31')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
          <h1
            className="text-center mb-3 fw-bold"
            style={{ fontSize: "2.2rem" }}
          >
            🌤 Weather Forecast
          </h1>

          {/* Search Input */}
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
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "#FFD70080")
              }
            >
              Search
            </button>
          </div>

          {error && (
            <div className="text-danger mt-2" style={{ fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          {/* Location Button */}
          <button
            onClick={getLocation}
            className="btn btn-outline-light mb-3"
            style={{ fontSize: "0.85rem" }}
          >
            📍 Use My Location
          </button>

          {/* <<< Spinner removed - nothing here now >>> */}

          {/* Weather Card */}
          {!loading && weather && (
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
                  {weather?.name || "City Name"},{" "}
                  {weather?.sys?.country || "XX"}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    fontSize: "2rem",
                  }}
                  className="weather-emoji"
                >
                  <span style={{ fontSize: "2.3rem", fontWeight: "bold" }}>
                    {Math.round(weather?.main?.temp ?? 0)}°C
                  </span>
                  {getWeatherEmoji(weather?.weather?.[0]?.description)}
                </div>
                <p
                  className="text-capitalize mb-1"
                  style={{ fontSize: "1.05rem" }}
                >
                  {weather?.weather?.[0]?.description || "Weather condition"}
                </p>

                {/* Updated Humidity, Wind, Pressure, Sunrise, Sunset */}
                <div
                  className="d-flex flex-column mt-2 w-100"
                  style={{ fontSize: "0.85rem" }}
                >
                  {/* First row: 3 items */}
                  <div className="d-flex justify-content-around mb-2 gap-3">
                    <div>
                      <span style={{ fontWeight: "500" }}>Humidity:</span>{" "}
                      {weather?.main?.humidity ?? 0}%
                    </div>
                    <div>
                      <span style={{ fontWeight: "500" }}>Wind:</span>{" "}
                      {weather?.wind?.speed ?? 0} m/s
                    </div>
                    <div>
                      <span style={{ fontWeight: "500" }}>Pressure:</span>{" "}
                      {weather?.main?.pressure ?? 0} hPa
                    </div>
                  </div>

                  {/* Second row: 2 items */}
                  <div className="d-flex justify-content-around">
                    <div>
                      <span style={{ fontWeight: "500" }}>Sunrise:</span>{" "}
                      {weather?.sys?.sunrise
                        ? new Date(
                            weather.sys.sunrise * 1000
                          ).toLocaleTimeString()
                        : "--:--"}
                    </div>
                    <div>
                      <span style={{ fontWeight: "500" }}>Sunset:</span>{" "}
                      {weather?.sys?.sunset
                        ? new Date(
                            weather.sys.sunset * 1000
                          ).toLocaleTimeString()
                        : "--:--"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Cards */}
          {!loading && forecast.length > 0 && (
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
                      <h6
                        className="fw-bold mb-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {new Date(day.dt_txt).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </h6>
                      <p
                        className="fw-bold mb-1"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {Math.round(day.main.temp)}°C
                      </p>
                      <p
                        className="text-capitalize small mb-1"
                        style={{ fontSize: "0.7rem", textAlign: "center" }}
                      >
                        {day.weather[0].description}
                      </p>
                      <p
                        style={{ fontSize: "1.4rem" }}
                        className="weather-emoji"
                      >
                        {getWeatherEmoji(day.weather[0].description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
