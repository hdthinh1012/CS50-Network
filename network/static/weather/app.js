default_city = "Ho Chi Minh";
apikey = "Epy8FR4gq7BB3TVuLA3YdHZw1pYv2Kvy";

document.addEventListener("DOMContentLoaded", updateAll(default_city));


async function updateAll(city_query){
    let city = await fetchCityInfo(apikey, city_query);
    let weather = await fetchWeatherInfo(apikey, city);
    document.querySelector(".weather-details").innerHTML = `
        <h5 class="city-title">${city.LocalizedName}, ${city.Country.LocalizedName}</h5>
        <p class="weather-text">${weather.WeatherText}</p>
        <span class="temperature-text">${weather.Temperature.Metric.Value}</span><span>&deg;C</span>
    `
        document.querySelector("img.card-img-top").src = (weather.IsDayTime) ? `/media/image/weather/day.svg` : `/media/image/weather/night.svg`

    appEventListener();
    console.log( {
        city: city,
        weather: weather,
    });
}


function appEventListener(){
    document.querySelector(".change-location-btn").onclick = function() {
        document.querySelector(".weather-edit-form").style.display = "block";
        this.style.display = 'none';
    }
    document.querySelector(".weather-edit-form").onsubmit = async function(event) {
        event.preventDefault();
        let query_city = document.querySelector(".weather-edit-content").value;
        let result = await updateAll(query_city);
        console.log(result);
        document.querySelector(".change-location-btn").style.display = "block";
        this.style.display = 'none';
    }
}