const { ipcRenderer } = require('electron');
const nir = require('node-internet-radio');
var api_url = "";
var metaupdater;
document.addEventListener('DOMContentLoaded',pageLoaded);

function pageLoaded(){
    //Tell the main process we are loaded so it can start sending us some information we need such as the url for the api
    console.log("Im loaded, telling the main process");
    ipcRenderer.send("asynchronous-message","geturl");
    
}

ipcRenderer.on('asynchronous-message', function (evt, message){
    switch(message.type){
        //Main has sent us a url for accessing the radio stations database, store this somewhere so we can use it later
        case("dns"):
            api_url = message.radiourl;
            console.log("Database URL: " + api_url);
            getStation("bycountrycodeexact","gb");
        break;
        
    }
})

function searchStation(){
    search_type = document.getElementById("stype").value;
    search_string = document.getElementById("searchtext").value;

    if(searchtext!=""){
        getStation(search_type,search_string);
    }
}

function getStation(searchtype, searchstring){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
       processStations(this.responseText);
      }
    };
    xhttp.open("GET", api_url + "/json/stations/"+searchtype+"/"+searchstring, true);
    xhttp.send();
}

function playStation(url,name){
    audioPlayer = document.getElementById("player");
    lblstationname = document.getElementById("lblStationName");

    lblstationname.innerHTML = name;
    audioPlayer.src = url;
    audioPlayer.play();
    clearInterval(metaupdater);
    metaupdater = setInterval(function(){console.log("Updating Metadata");
    nir.getStationInfo(url,function(error, station) {
        document.getElementById("lblStationName").innerHTML = name + " " + station.title;
    })},15000); //Set a timer to update the song title every 15 seconds
    updateMeta(url,name);
}
function updateMeta(url,name){
    console.log("Updating Metadata - On Start");
    nir.getStationInfo(url,function(error, station) {
        document.getElementById("lblStationName").innerHTML = name + " " + station.title;
})
}
//Stations have been downloaded so format the page to display them
function processStations(result){
    console.log(result);
    var station_object = JSON.parse(result);
    let station_list_len = station_object.length;
    parent_element = document.getElementById("station-list");
    parent_element.innerHTML="";
    //Loop through all the stations and add them to the page
    for(let i = 0; i < station_list_len; i ++){
        container = createStationHolder();
        
        tmpname = document.createElement("h1");
        tmpname.innerHTML = station_object[i].name;
        
        container.appendChild(playButton(station_object[i].url_resolved,station_object[i].name));    
        container.appendChild(favButton(station_object[i].url_resolved,station_object[i].name));
        container.appendChild(favicon(station_object[i].favicon));
        container.appendChild(tmpname);
        parent_element.appendChild(container);

}

function createStationHolder(){
    let tmpdiv = document.createElement("div");
    tmpdiv.setAttribute("class","station-holder w3-container w3-border");
    return tmpdiv;
}

function favicon(path){
    let favicon = document.createElement("img");
    favicon.setAttribute("class","favicon");
    favicon.setAttribute("onerror","this.onerror=null; this.src='./img/station-default-icon.svg'")
    favicon.src = path;
    return favicon;
}
function favButton(url,name){
    let tmp = document.createElement("input");
    tmp.setAttribute("type","button");
    tmp.setAttribute("value","Favorite");
    tmp.setAttribute("onclick","playStation('" + url + "','"+name+"')");
    return tmp;
}

function playButton(url,name){
    let tmpplay = document.createElement("input");
    tmpplay.setAttribute("type","button");
    tmpplay.setAttribute("value","Play");
    tmpplay.setAttribute("onclick","playStation('" + url + "','"+name+"')");
    return tmpplay;
}



}