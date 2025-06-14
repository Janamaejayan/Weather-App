export const setPlaceHolderText = () =>{
    const input = document.getElementById("searchBar__text");
    window.innerWidth < 400 ? (input.placeholder = "City, State, Country") : (input.placeholder = "City, State, Country, or Zip Code");
};

export const addSpinner = (element) =>{
    animateButton(element);
    setTimeout(animateButton, 1000, element);
};

const animateButton = (element) =>{
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
    element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) =>{
    updateWeatherLocation(headerMsg);
    updateScreenReader(srMsg);
}

export const displayApiError = (statusCode) =>{
    const properMsg = toProperCase(statusCode.message);
    updateWeatherLocation(properMsg);
    updateScreenReader(`${properMsg}. Please TRY AGAIN.`);
};

const toProperCase = (text) =>{
    const words = text.split(" ");
    const properWords = words.map(words =>{
        return words.charAt(0).toUpperCase() + words.slice(1);
    });

    return properWords.join(" ");
}

export const updateWeatherLocation = (message) => {
    const h1 = document.getElementById("currentForecast__location");

    if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:")!== -1){
        const msgArray = message.split(" ");
        const mapArr = msgArray.map((msg) =>{
            return msg.replace(":", ": ");
        })

        // console.log(mapArr[0]);
        // console.log(mapArr[1]);
        // console.log(mapArr[3]);

        const lat  = mapArr[1].indexOf("-") === -1 ? mapArr[1].slice(0,6) : mapArr[1].slice(0,7);

        const lon  = mapArr[3].indexOf("-") === -1 ? mapArr[3].slice(0,6) : mapArr[3].slice(0,7);

        h1.textContent = `Lat: ${lat} ⋈ Long: ${lon}`;

    }else{
        h1.textContent = message;
    }
    
};

export const updateScreenReader = (message) =>{
    document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj, forecastJson) =>{
    fadeDisplay();
    clearDisplay();

    const weatherClass = getWeatherClass(weatherJson.weather[0].icon);
    setBGImage(weatherClass);

    const screenReader = buildScreenReader(weatherJson, locationObj);

    updateScreenReader(screenReader);
    updateWeatherLocation(locationObj.getName());
    const fiveDayArr = createFiveDayArr (forecastJson);
    const ccArray = createCurrentConditionDivs(weatherJson, locationObj.getUnit(), fiveDayArr);
    
    displayFiveDayForecast(fiveDayArr, locationObj.getUnit());
    console.log(ccArray);
    displayCurrent(ccArray);
    setFocusOnSearch();
    fadeDisplay();
}

const fadeDisplay = () =>{
    const cc = document.getElementById("currentForecast");
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");

    const fiveDay = document.getElementById("dailyForecast");

    fiveDay.classList.toggle("zero-vis");
    fiveDay.classList.toggle("fade-in");
}

const clearDisplay = () =>{
    const currentConditions = document.getElementById("currentForecast__conditions");
    deleteContents(currentConditions);
    const fiveDay = document.getElementById("dailyForecast__contents");
    deleteContents(fiveDay);
}

const deleteContents = (parentElement) =>{
    let child = parentElement.lastElementChild;

    while(child){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
}

const getWeatherClass = (icon) =>{
    const firsttwochars = icon.slice(0,2);
    const last = icon.slice(2);
    const weatherLookup = {
        "09" : "snow",
        "10": "rain",
        "11": "rain",
        "13": "snow",
        "50": "fog"
    };

    let weatherClass;
    if (weatherLookup[firsttwochars]){
        weatherClass = weatherLookup[firsttwochars];
    } else if (last === "d"){
        weatherClass = "clouds";
    } else{
        weatherClass = "night";
    }
    return weatherClass;
}

const setBGImage = (weatherClass) =>{
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach( img =>{
        if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
}

const buildScreenReader = (weatherJson, locationObj) =>{
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "F" : "C";
    return `${weatherJson.weather[0].description} and ${Math.round(Number(weatherJson.main.temp))}°${tempUnit} in ${location}`
}

const setFocusOnSearch = () =>{
    document.getElementById("searchBar__text").focus();
}

const createCurrentConditionDivs = (weatherObj, unit, Arr) =>{
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "mph" : "m/s";
    const icon = createMainImgDiv(weatherObj.weather[0].icon,weatherObj.weather[0].description);

    const temp = createElem("div", "temp", `${Math.round(Number(weatherObj.main.temp))}°`, tempUnit);

    const properDesc = toProperCase(weatherObj.weather[0].description);

    const desc = createElem("div", "desc", properDesc);
    const feels = createElem("div", "feels", `Feels Like ${Math.round(Number(weatherObj.main.feels_like))}°`);

    const maxTemp = createElem("div", "maxTemp",`High ${Math.round(Number(Arr[0].maxTemp))}°`);

    const minTemp = createElem("div", "minTemp",`Low ${Math.round(Number(Arr[0].minTemp))}°`);

    const humidity = createElem("div", "humidity",`Humidity ${weatherObj.main.humidity}%`);

    const wind = createElem("div", "wind",`Wind ${Math.round(Number(weatherObj.wind.speed))} ${windUnit}`);

    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
}

const createFiveDayArr  = (forecastObj) =>{
    const dailyData = {};

    forecastObj.list.forEach(entry => {
        const date = new Date(entry.dt_txt);
        const day = date.toISOString().split("T")[0]; // Format: 'YYYY-MM-DD'

        // Skip today if needed
        const today = new Date().toISOString().split("T")[0];
       // if (day === today) return;

        if (!dailyData[day]) {
            dailyData[day] = {
                temps: [],
                weather: {},
                icon: "",
                description: ""
            };
        }

        dailyData[day].temps.push(entry.main.temp_min);
        dailyData[day].temps.push(entry.main.temp_max);

        const icon = entry.weather[0].icon;
        const desc = entry.weather[0].description;

        if (!dailyData[day].weather[icon]) {
            dailyData[day].weather[icon] = 1;
        } else {
            dailyData[day].weather[icon]++;
        }

        // Optionally store the description for most frequent icon
        if (!dailyData[day].descriptionMap) {
            dailyData[day].descriptionMap = {};
        }

        dailyData[day].descriptionMap[icon] = desc;
    });

    const finalForecast = [];

    Object.entries(dailyData).slice(0, 5).forEach(([day, data]) => {
        const maxTemp = Math.max(...data.temps);
        const minTemp = Math.min(...data.temps);

        // Pick the most frequent icon
        const mostCommonIcon = Object.entries(data.weather)
            .sort((a, b) => b[1] - a[1])[0][0];

        finalForecast.push({
            date: getDayOfWeek(day),
            maxTemp: Math.round(maxTemp),
            minTemp: Math.round(minTemp),
            icon: mostCommonIcon,
            description: data.descriptionMap[mostCommonIcon]
        });
    });

    return finalForecast;
}

const displayFiveDayForecast = (Arr) =>{
    for (let i = 1; i <5; i++){
        const dfArray = createDailyForecastDivs(Arr[i]);
        displayDailyForecast(dfArray);
    }
}

const createMainImgDiv = (icon, altText) =>{
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";

    const faIcon = translate(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
}



const createElem = (elemType, divClassName, divText, unit) =>{
    const div = document.createElement(elemType);
    div.className = divClassName;

    if (divText){
        div.textContent = divText;
    }

    if (divClassName === "temp"){
        const unitDiv = document.createElement("div");
        unitDiv.classList.add("unit");
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }

    return div;
};

const translate = (icon) =>{
    const i = document.createElement("i");
    const firsttwochars = icon.slice(0,2);
    const last = icon.slice(2);

    switch (firsttwochars) {
        case "01" :
            if (last === "d") i.classList.add("far", "fa-sun");
            else i.classList.add("far", "fa-moon");
            break;
        
        case "02" :
            if (last === "d") i.classList.add("fas", "fa-cloud-sun");
            else i.classList.add("fas", "fa-cloud-moon");
            break;
        
        case "03":
            i.classList.add("fas", "fa-cloud");
            break;

        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
            break;
        
        case "09":
            i.classList.add("fas", "fa-cloud-rain");
            break;

        case "10":
            if (last === "d") i.classList.add("fas", "fa-cloud-sun-rain");
            else i.classList.add("fas", "fa-cloud-moon-rain");
            break;

        case "11":
            i.classList.add("fas", "fa-poo-storm");
            break;
        
        case "13":
            i.classList.add("far", "fa-snowflake");
            break;

        case "50":
            i.classList.add("fas", "fa-smog");
            break;

        default:
            i.classList.add("far", "fa-question-circle");
    }

    return i;
}

const displayCurrent = (arr) =>{
    const ccContainer = document.getElementById("currentForecast__conditions");
    arr.forEach(cc =>{
        ccContainer.appendChild(cc);
    });
}

const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"
};

const createDailyForecastDivs = (dayWeather) =>{
    //console.log(dayWeather);
    
    const dayAbbText = dayWeather.date.slice(0,3).toUpperCase();

    const dayAbbreviation = createElem("p", "dayAbbreviation", dayAbbText);

    const img = document.createElement("img");

    if (window.innerWidth < 768 || window.innerHeight < 1025) img.src = `https://openweathermap.org/img/wn/${dayWeather.icon}.png`;

    else img.src = `https://openweathermap.org/img/wn/${dayWeather.icon}@2x.png`;
    img.alt = dayWeather.description;

    const dayHigh = createElem("p", "dayHigh", `${Math.round(Number(dayWeather.maxTemp))}°`);

    const dayLow = createElem("p", "dayLow", `${Math.round(Number(dayWeather.minTemp))}°`);

    return [dayAbbreviation, img, dayHigh, dayLow];
}

const displayDailyForecast = (dfArray) =>{
    const dayDiv = createElem("div", "forecastday");
    dfArray.forEach(el =>{
        dayDiv.appendChild(el);
    });

    const dailyForecastContainer = document.getElementById("dailyForecast__contents");

    dailyForecastContainer.append(dayDiv);
}