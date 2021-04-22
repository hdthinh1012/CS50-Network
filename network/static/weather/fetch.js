async function fetchCityInfo(apikey, city){
    let response = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apikey}&q=${city}`);
    let result = await response.json();
    return result[0];
}


async function fetchWeatherInfo(apikey, city){
    let response = await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${city.Key}?apikey=${apikey}`);
    let result = await response.json();
    return result[0];
}

