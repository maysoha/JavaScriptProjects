const apiKey = "aab4a1121834dd53a402b3146f46055a";
const bodyElement = document.querySelector("body");
const weatherDataElement = document.querySelector("#weather-data");
const cityInputElement = document.querySelector("#city-input");
const formElement = document.querySelector("form");
const toggle = document.querySelector("#toggle");
const dateTimeElement = document.querySelector(".date-time");
let isCelsius = true;

const spinner = document.querySelector(".spinner");

function showSpinner() {
  spinner.style.display = "flex";
}

function hideSpinner() {
  spinner.style.display = "none";
}

function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  const dateTimeString = `${date} ${time}`;
  dateTimeElement.textContent = dateTimeString;
}

function convertToFahrenheit(celsius) {
  return Math.round(celsius * 1.8 + 32);
}

function convertToCelsius(fahrenheit) {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

updateDateTime();
setInterval(updateDateTime, 1000);

toggle.addEventListener("change", () => {
  isCelsius = !isCelsius;
  const currentTemperature = weatherDataElement.querySelector(".temperature");
  const currentTemperatureValue = currentTemperature.textContent.slice(0, -2);
  const newTemperatureValue = isCelsius
    ? convertToCelsius(currentTemperatureValue)
    : convertToFahrenheit(currentTemperatureValue);
  currentTemperature.textContent =
    newTemperatureValue + (isCelsius ? "°C" : "°F");

  const forecastTemperatures = document.querySelectorAll(
    ".forecast-item div:last-child"
  );
  forecastTemperatures.forEach((temperatureElement) => {
    const temperatureValue = temperatureElement.textContent.slice(0, -2);
    const newTemperature = isCelsius
      ? convertToCelsius(temperatureValue)
      : convertToFahrenheit(temperatureValue);
    temperatureElement.textContent = newTemperature + (isCelsius ? "°C" : "°F");
  });
});

formElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const toggleLabels = document.querySelectorAll("label[for='toggle']");
  const toggleInput = document.getElementById("toggle");
  toggleLabels.forEach((toggleLabel) => (toggleLabel.style.display = "block"));
  toggleInput.style.display = "block";
  const cityValue = cityInputElement.value;
  getWeatherData(cityValue);
});

async function getWeatherData(cityValue) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${apiKey}&units=metric`
    );
    showSpinner();
    if (!response.ok) {
      throw new Error("Network repsonse was not ok");
    }
    const data = await response.json();
    // const temperature = Math.round(data.main.temp);
    const temperatureUnit = isCelsius ? "°C" : "°F";
    const temperature = Math.round(
      isCelsius ? data.main.temp : convertToFahrenheit(data.main.temp)
    );
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const details = [
      `Feels like: ${Math.round(data.main.feels_like)}`,
      `Humidity: ${Math.round(data.main.humidity)}%`,
      `Wind Speed: ${Math.round(data.wind.speed)} m/s`,
    ];

    weatherDataElement.querySelector(
      ".icon"
    ).innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"
  />`;

    weatherDataElement.querySelector(
      ".temperature"
    ).textContent = `${temperature}°C`;

    weatherDataElement.querySelector(
      ".description"
    ).textContent = `${description}`;

    weatherDataElement.querySelector(".details").innerHTML = details
      .map((detail) => `<div>${detail}</div>`)
      .join("");
    console.log(data); //weather[0].main;

    bodyElement.style.backgroundImage = `url('images/${data.weather[0].main}.jpg')`;

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityValue}&appid=${apiKey}&units=metric`
    );
    if (!forecastResponse.ok) {
      throw new Error("Network response was not ok");
    }
    const forecastData = await forecastResponse.json();
    const forecasts = forecastData.list.filter((forecast) =>
      forecast.dt_txt.endsWith("12:00:00")
    );
    const forecastHtml = forecasts
      .map((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const temperature = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        return `<div class="forecast-item">
                    <div>${weekday}</div>
                    <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" />
                    <div>${temperature}°C</div>
                  </div>`;
      })
      .join("");
    weatherDataElement.querySelector(".forecast").innerHTML = forecastHtml;
  } catch (error) {
    const toggleLabels = document.querySelectorAll("label[for='toggle']");
    const toggleInput = document.querySelector("#toggle");
    toggleLabels.forEach((toggleLabel) => (toggleLabel.style.display = "none"));
    toggleInput.style.display = "none";
    weatherDataElement.querySelector(".icon").innerHTML = "";
    weatherDataElement.querySelector(".temperature").textContent = "";
    weatherDataElement.querySelector(".description").innerHTML =
      "<h4>An error happened, please try again</h4>";
    weatherDataElement.querySelector(".details").innerHTML = "";
    weatherDataElement.querySelector(".forecast").innerHTML = "";
    toggle.innerHTML = "";
  } finally {
    hideSpinner();
  }
}
