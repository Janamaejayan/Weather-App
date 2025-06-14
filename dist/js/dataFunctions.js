const API_key = "35f8ba47d742a7d8f7d8a66e97c06877";

export const setLocationObj = (location, myCoordinate) =>{
    const {lat, lon, name , unit} = myCoordinate;
    location.setLat(lat);
    location.setLon(lon);
    location.setName(name);

    if (unit){
        location.setUnit(unit);
    }
}

export const getHomeLocation = () =>{
    return localStorage.getItem("defaultWeatherLocation");
}

export const getWeatherFromCoords = async (locationObj) =>{
    const lat = locationObj.getLat();
    const lon = locationObj.getLon();
    const units = locationObj.getUnit();

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_key}`;
    try {
        const weatherStream = await fetch(url);
        const weatherJson = await weatherStream.json();
        return weatherJson;
    } catch (err){
        console.log(err);
    }
}

export const getSixDayCoordsFromApi = async (locationObj) =>{
    const lat = locationObj.getLat();
    const lon = locationObj.getLon();
    const units = locationObj.getUnit();
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_key}`;

    const encodedUrl = encodeURI(url);
    try{
        const dataStream = await fetch(encodedUrl);
        const jsonData = await dataStream.json();
        return jsonData;
    }catch (err){
        console.error(err.stack);
    }
}

export const getCoordsFromApi = async (entryText, units) =>{
    const regex = /^\d+$/g;
    const flag = regex.test(entryText) ? "zip" : "q";
    const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${API_key}`;

    const encodedUrl = encodeURI(url);
    try{
        const dataStream = await fetch(encodedUrl);
        const jsonData = await dataStream.json();
        return jsonData;
    }catch (err){
        console.error(err.stack);
    }

}

export const cleanText = (text) =>{
    const regex = / {2,}/g;
    const entryText = text.replaceAll(regex, " ").trim();
    return entryText;
}