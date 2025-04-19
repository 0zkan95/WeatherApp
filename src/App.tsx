import { useState, useEffect } from 'react'
import { T, useTranslate, useTolgee } from "@tolgee/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaDroplet, FaWind } from "react-icons/fa6";
import { BiSearch } from "react-icons/bi";
import LanguageSelect from "./components/LanguageSelect";
import RippleLoader from "./components/Loader";
import './App.css';




interface WeatherData {
  name: string,
  main: {
    temp: number,
    humidity: number,
  };
  weather: {
    description: string,
    icon: string,
  }[];
  wind: {
    speed: number,
  };
};

interface ForecastData {
  list: {
    dt: number,
    main: {
      temp: number,
    };
    weather: {
      icon: string,
    }[];
  }[];
}

function App() {
  const { t } = useTranslate();      // ---> useTranslate
  const tolgee = useTolgee();        // ---> 
  const [city, setCity] = useState<string>("");  // ---> City input value
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);  // ---> Current weather data
  const [forecastData, setForecastData] = useState<ForecastData | null>(null); // --- > Forecast data
  const [loading, setLoading] = useState<boolean>(false) // -- > Loading state
  const [error, setError] = useState<string | null>(null);   // -- > Error message

  console.log('App component rendered. Tolgee current language:', tolgee.getLanguage());

  // Function to fetch weather and forecast data from OpenWeather API
  const fetchWeatherData = async (cityName: string) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;      // --- > API URL for current weather
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`; // --- >  API URL for 3-day forecast

    try {
      setLoading(true);
      setError(null);

      // --- > Fetching current weaher data
      const weatherResponse = await fetch(currentWeatherUrl);
      if (!weatherResponse.ok) {
        throw new Error("City not found! Try another one");
      }
      const weatherData: WeatherData = await weatherResponse.json();
      setWeatherData(weatherData); // --- > Setting the fetched weather data

      // -- > Fetching forecast data
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error("Unable to fetch forecast data");
      }
      const forecastData: ForecastData = await forecastResponse.json();
      setForecastData(forecastData);

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setWeatherData(null);
      setForecastData(null)
    } finally {
      setLoading(false);
    };

  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchWeatherData(city);
    setCity("");
  };

  useEffect(() => {

    console.log('App initial language:', tolgee.getLanguage());


    const getUserLocation = () => {
      if (navigator.geolocation) {
        // Checking if geolocation is available
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords; // Getting user's device location
            const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
            const reverseGeocodeUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`; // API URL for reverse geocoding (get location by lat/lon

            try {
              setLoading(true);
              setError(null);
              const response = await fetch(reverseGeocodeUrl); // Fetching weather data by geolocation
              if (!response.ok) {
                if (response.status === 404) {
                  throw new Error("Clould not find weather data for your location.")
                } else if (response.status === 401) {
                  throw new Error("Invalid API Key for OpenWeatherMap.")
                } else {
                  throw new Error(` Unable to fetch location data (Status ${response.status}) `)
                }
              }

              const initialWeatherData: WeatherData = await response.json(); // Parsing weather data

              if (initialWeatherData) {
                setCity(initialWeatherData.name);
                await fetchWeatherData(initialWeatherData.name);
              } else {
                setWeatherData(initialWeatherData);
                setForecastData(null);
                setError("Could not determine city name from location.")
              }

            } catch (error) {
              // Handling any errors that occur during the fetch
              if (error instanceof Error) {
                setError(error.message); // Displaying error message
              } else {
                setError("An unknown error occurred fetching location data.");
              }
              setWeatherData(null); // Resetting weather data
              setForecastData(null); // Resetting forecast data

            } finally {

            }
          },

          (geoError) => {
            // Handling geolocation errors (e.g., if user denies location access)
            setError(`Unable to retrieve location: ${geoError.message}`);
            setWeatherData(null);
            setForecastData(null);
            setLoading(false);
          }
        );
      } else {
        // Handling case where geolocation is not supported by the browser
        setError("Geolocation is not supported by this browser.");
        setWeatherData(null);
        setForecastData(null);
        setLoading(false);
      }
    };

    

    getUserLocation();
  }, []);

  console.log('App component rendered. Tolgee current language:', tolgee.getLanguage());

  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-screen px-3">
        <LanguageSelect />
        <div className="mt-3 bg-blue-500 rounded-xl opacity-80 shadow-lg border border-white/30 p-5 w-full md:w-[420px]">
          <div>
            <form className="relative" onSubmit={handleSubmit}>
              <input
                type="text"
                name="search"
                placeholder={t("search_city", "Search City")} // Translation for placeholder text
                className="w-full px-4 py-2 border-1 border-white rounded-full text-white/70 bg-blue-300 focus:outline-none focus:border-[#668ba0]"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button type="submit" className="absolute top-1 right-1 rounded-full hover:scale-110">
                <BiSearch className="text-white/70" size={20} />
              </button>
            </form>
          </div>

          {loading && (
            <div className="flex justify-center items-center">
              <RippleLoader />
            </div>
          )}
          {error && (
            <p className="text-red-600 font-bold flex justify-center items-center">
              {error}
            </p>
          )}

          {!error && weatherData && (
            <div>
              {/* Displaying current weather data */}

              <div className="flex justify-between items-center text-white font-bold">
                <span className="flex items-center gap-x-2">
                  <FaMapMarkerAlt size={20} />
                  <p className="text-xl font-serif">{weatherData.name}</p>
                </span>

                <div className="flex flex-col items-center">
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt="weather icon"
                  />{" "}
                  {/* Weather icon */}
                  <span>
                    <p className="text-6xl font-bold text-white">
                      {Math.round(weatherData.main.temp)} °C
                    </p>
                  </span>
                </div>
              </div>

              {/**  Displaying Forecast Data */}

              {!error && forecastData && forecastData.list && (
                <div className="mt-6 text-white">
                  <h3 className="text-xl font-semibold mb-4"><T keyName="forecast_title">Forecast for next 5 days</T></h3>
                  <div className="flex flex-wrap justify-around gap-2">
                    {/* Display first 5 forecast points (usually 3-hour intervals) */}
                    {forecastData.list.slice(0, 5).map((item) => (
                      <div key={item.dt} className="flex flex-col items-center bg-white/20 p-2 rounded">
                        {/* Format timestamp to a readable time */}
                        <p className="text-sm">
                          {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                        <img
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} // Use smaller icon for forecast
                          alt="forecast icon"
                          className="w-10 h-10"
                        />
                        <p className="font-bold">{Math.round(item.main.temp)}°C</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="my-5 flex justify-between items-center">
                {/* Humidity */}

                <div className="flex items-center gap-x-3">
                  <FaDroplet size={30} className="text-white/90" />
                  <span>
                    <p className="text-lg font-serif text-white font-bold">
                      <T keyName="humidity">Humidity</T>
                    </p>
                    <p className="text-lg font-medium text-white/90">
                      {weatherData.main.humidity}%
                    </p>
                  </span>
                </div>

                {/* Wind Speed */}

                <div className="flex w-1/2 items-center gap-x-3">
                  <FaWind size={30} className="text-white/90" />
                  <span>
                    <p className="text-lg font-serif text-white font-bold">
                      <T keyName="wind_speed">Wind Speed</T>
                    </p>
                    <p className="text-lg font-medium text-white/90">
                      {weatherData.wind.speed} km/h
                    </p>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default App
