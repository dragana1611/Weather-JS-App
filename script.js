let city = "";

let searchCity = $("#search-city");
const searchButton = $("#search-button");
const clearButton = $("#clear-history");
const clearSearchButton = $("#clear-search");
const currentCity = $("#current-city");
const currentTemperature = $("#temperature");
const currentHumidty = $("#humidity");
const currentWSpeed = $("#wind-speed");
const currentAtmPressure = $("#pressure");
const currentUvindex = $("#uv-index");
let sCity = [];

function find(c) {
  for (let i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

//Set up the API key
const APIKey = "a0aca8a89948154a4182dcecc780b513";

function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  } else {
    $("#search-city").val("Enter city");
  }
}

function currentWeather(city) {
  const queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKey;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);

    //Dta object from server side Api for icon property.
    const weathericon = response.weather[0].icon;
    const iconurl =
      "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

    const date = new Date(response.dt * 1000).toLocaleDateString();

    $(currentCity).html(
      response.name + "(" + date + ")" + "<img src=" + iconurl + ">"
    );

    // Convert the temp to °C
    const tempC = response.main.temp - 273.15;
    $(currentTemperature).html(tempC.toFixed(1) + " °C");

    // Display the Humidity
    $(currentHumidty).html(response.main.humidity + " %");

    //Display Wind speed m/s
    const ws = response.wind.speed;
    const windsmps = ws.toFixed(1);
    $(currentWSpeed).html(windsmps + " m/s");

    //Display Atmospheric pressure mbar
    const atmP = response.main.pressure;
    $(currentAtmPressure).html(atmP + " mbar");

    // Display UVIndex
    UVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);

    if (response.cod == 200) {
      sCity = JSON.parse(localStorage.getItem("cityname"));
      console.log(sCity);
      if (sCity == null) {
        sCity = [];
        sCity.push(city.toUpperCase());
        localStorage.setItem("cityname", JSON.stringify(sCity));
        addToList(city);
      } else {
        if (find(city) > 0) {
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        }
      }
    }
  });
}

// UVIindex response.
function UVIndex(ln, lt) {
  const uvqURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKey +
    "&lat=" +
    lt +
    "&lon=" +
    ln;
  $.ajax({
    url: uvqURL,
    method: "GET",
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

// Display the 5 days forecast for the current city.
function forecast(cityid) {
  let dayover = false;
  const queryforcastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&appid=" +
    APIKey;
  $.ajax({
    url: queryforcastURL,
    method: "GET",
  }).then(function (response) {
    for (let i = 0; i < 5; i++) {
      const date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      const iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      const iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      const tempK = response.list[(i + 1) * 8 - 1].main.temp;
      const tempC = (tempK - 273.15).toFixed(1);
      const humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $("#fDate" + i).html(date);
      $("#fImg" + i).html("<img src=" + iconurl + ">");
      $("#fTemp" + i).html(tempC + "°C");
      $("#fHumidity" + i).html(humidity + "%");
    }
  });
}

//Daynamically add the city on the search history
function addToList(c) {
  const listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

// Display the past search
function invokePastSearch(event) {
  const liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

function loadlastCity() {
  $("ul").empty();
  let sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  }
}

//Clear the search city
function clearCity(event) {
  event.preventDefault();
  $("#search-city").val("");
}

//Clear the search history
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}

//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-search").on("click", clearCity);
$("#clear-history").on("click", clearHistory);
