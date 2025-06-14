import CurrentLocation from "./CurrentLocation.js";
import {
    setPlaceHolderText, addSpinner, displayError, updateScreenReader, displayApiError, updateDisplay
} from "./domFunctions.js";
import{
    setLocationObj, getHomeLocation, cleanText,getCoordsFromApi, getWeatherFromCoords, getSixDayCoordsFromApi
} from "./dataFunctions.js";


const currentLoc = new CurrentLocation(); 

const initApp = () =>{
    // add listeners
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);

    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather);

    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);

    const unitButton = document.getElementById("unit");
    unitButton.addEventListener("click", setUnitPref);

    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click",refreshWeather);

    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);
    // set up

    setPlaceHolderText();
    // load weather
    loadWeather();
}

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) =>{
    if (event) {
        if (event.type === "click"){
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }

    if (!navigator.geolocation) {
        geoError();
        return;
    }
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) =>{
    const errMsg = errObj.message ? errObj.message : "GeoLocation not Supported";
    displayError(errMsg, errMsg);
};

const geoSuccess = (position) =>{
    const myCoordinate = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
        name : `Lat: ${position.coords.latitude} Long: ${position.coords.longitude}`
    };

    setLocationObj(currentLoc, myCoordinate);
    //console.log(currentLoc);
    updateDataAndDisplay(currentLoc);
}

const loadWeather = (event) =>{
    const savedLocation = getHomeLocation();
    if (!savedLocation && !event) return getGeoWeather();

    if (!savedLocation && event.type === "click"){
        displayError("No Home Location Saved",
            "Sorry! Please save your Home Location"
        );
        return;
    } else if (savedLocation && !event){
        displayHomeLocationWeather(savedLocation);
    } else{
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);

    }
}

const displayHomeLocationWeather = (homeLoc) =>{
    if (typeof homeLoc === "string"){
        const locationJson = JSON.parse(homeLoc);
        const myCoordinate = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit
        }

        setLocationObj(currentLoc,myCoordinate);
        updateDataAndDisplay(currentLoc);
    }
}

const saveLocation = () =>{
    if (currentLoc.getLat() & currentLoc.getLon()){
        const saveicon = document.querySelector(".fa-save");
        addSpinner(saveicon);

        const location = {
            name : currentLoc.getName(),
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            unit: currentLoc.getUnit()
        };

        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreenReader(`Saved ${currentLoc.getName()} as Home Location`);
    }
}

const setUnitPref = () =>{
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
}

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
}

// from subitNewLocation add 6daycoords and do the following

const submitNewLocation = async (event) =>{
    event.preventDefault();

    const text = document.getElementById("searchBar__text").value;
    const entryText = cleanText(text);

    if (!entryText.length) return;

    const locationIcon = document.querySelector(".fa-search");
    addSpinner(locationIcon);

    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    //API
        if (coordsData){
            if (coordsData.cod === 200){
            //success
            const myCoordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: coordsData.sys.country 
                ? `${coordsData.name}, ${coordsData.sys.country}` 
                : coordsData.name
            };
            setLocationObj(currentLoc, myCoordsObj);
            updateDataAndDisplay(currentLoc);
            }else{
            displayApiError(coordsData);
            }
        }else{
            displayError("Connection Error", "Connection Error");
        }
}

const updateDataAndDisplay = async (locationObj) =>{
    const weatherJson = await getWeatherFromCoords(locationObj);
    //console.log(locationObj);

    const forecastJson = await getSixDayCoordsFromApi(locationObj);
    //console.log(forecastJson);
    if (weatherJson && forecastJson) updateDisplay(weatherJson, locationObj, forecastJson); 
    
    //console.log(locationObj);
    //const h2 = document.getElementById("currentForecast__location");
    //h2.textContent = locationObj.getName();
}