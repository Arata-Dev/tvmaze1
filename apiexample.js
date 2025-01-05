let apiURL = 'https://api.tvmaze.com/';

// initialize page after HTML loads
window.onload = function() {
   closeLightBox();  // close the lightbox because it's initially open in the CSS
   document.getElementById("button").onclick = function () {
     searchTvShows();
   };
   document.getElementById("lightbox").onclick = function () {
     closeLightBox();
   };
} // window.onload

// load the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(error) {
      console.log('Service Worker registration failed:', error);
    });
  });
} 

// get data from TV Maze
async function searchTvShows() {
  
  let search = document.getElementById("search").value;  
  
  try {   
      const response = await fetch(apiURL + 'search/shows?q=' + search);
      const data = await response.json();
      showSearchResults(data);
  } catch(error) {
    console.error('Error fetching tv show:', error);
  } // catch
} // searchTvShows 


// change the activity displayed 
function showSearchResults(data) {

    document.getElementById("main").innerHTML = "";
  
  // show each tv show from search results in webpage
  for (let tvshow in data) {
    createTVShow(data[tvshow]);
  } // for

} // updatePage

// in the json, genres is an array of genres associated with the tv show 
// this function returns a string of genres formatted as a bulleted list
function showGenres(genres) {
   let output = "";
   for (g in genres) {

      if (genres.length == 0) {
        return 0;
      }

      if (g > 0) {
        output += ", ";
      } // if

      output += genres[g];

   } // for       
   
   return output; 
} // showGenres

// constructs one TV show entry on webpage
function createTVShow (tvshowJSON) {

    // get the main div tag
    var elemMain = document.getElementById("main");
    
    // create a number of new html elements to display tv show data
    var elemDiv = document.createElement("div");
    var elemImage = document.createElement("img");
    
    var elemShowTitle = document.createElement("h2");
    elemShowTitle.classList.add("showtitle"); // add a class to apply css
    
    var elemGenre = document.createElement("div");
    var elemRating = document.createElement("div");
    var elemSummary = document.createElement("div");
    
    // add JSON data to elements
    if (tvshowJSON.show.image == null || tvshowJSON.show.image.medium == null) {
      elemImage.innerHTML = "";
    } // if

    else {
      elemImage.src = tvshowJSON.show.image.medium;
    } // else


    elemShowTitle.innerHTML = tvshowJSON.show.name;

    if (showGenres(tvshowJSON.show.genres) == 0) {

      elemGenre.innerHTML = "";

    } // if
    else {

      elemGenre.innerHTML = "<b>Genres:</b> " + showGenres(tvshowJSON.show.genres);

    }

    if (tvshowJSON.show.rating.average == null) {

      elemRating.innerHTML = "";

    } // if
    else {

      elemRating.innerHTML = "<b>Rating:</b> " + tvshowJSON.show.rating.average;

    }
    
    elemSummary.innerHTML = tvshowJSON.show.summary;
    
    
    // add 5 elements to the div tag elemDiv
    elemDiv.appendChild(elemShowTitle);  
    elemDiv.appendChild(elemGenre);
    elemDiv.appendChild(elemRating);
    elemDiv.appendChild(elemSummary);
    elemDiv.appendChild(elemImage);
    
    // get id of show and add episode list
    let showId = tvshowJSON.show.id;
    fetchEpisodes(showId, elemDiv);
    
    // add this tv show to main
    elemMain.appendChild(elemDiv);
    
} // createTVShow

// fetch episodes for a given tv show id
async function fetchEpisodes(showId, elemDiv) {
  
  try {
     const response = await fetch(apiURL + 'shows/' + showId + '/episodes');  
     const data = await response.json();
     showEpisodes(data, elemDiv);
  } catch(error) {
    console.error('Error fetching episodes:', error);
  } // catch
    
} // fetch episodes


// list all episodes for a given showId in an ordered list 
// as a link that will open a light box with more info about
// each episode
function showEpisodes (data, elemDiv) {
     
    let elemEpisodes = document.createElement("div");  // creates a new div tag
    let output = "<ol>";
    for (episode in data) {
        output += "<li><a href='javascript:showLightBox(" + data[episode].id + ")'>" + data[episode].name + "</a></li>";
    }
    output += "</ol>";
    elemEpisodes.innerHTML = output;
    elemDiv.appendChild(elemEpisodes);  // add div tag to page
        
} // showEpisodes

// open lightbox and display episode info
async function showLightBox(episodeId){

    const response = await fetch(apiURL + "episodes/" + episodeId);  
    const episodeData = await response.json();

    document.getElementById("lightbox").style.display = "block";

    // show episode info in lightbox

    let nameElem = document.getElementById("name");
    let imageElem = document.getElementById("image");
    let seasonElem = document.getElementById("season");
    let numberElem = document.getElementById("number");
    let descriptionElem = document.getElementById("description");

    nameElem.innerHTML = episodeData.name + "<br>";

    if (episodeData.image == null || episodeData.image == "null" || episodeData.image.length == 0 || episodeData.image.medium == null) {

        imageElem.innerHTML = "" + "<br>";

    } // if

    else {

        imageElem.innerHTML = "<img src = '" + episodeData.image.medium + "' alt = 'episode image'><br>";
      
    } // else

    seasonElem.innerHTML = "<b>Season:</b> " + episodeData.season + "<br>";
    numberElem.innerHTML = "<b>Episode:</b> " + episodeData.number + "<br>";

    if (episodeData.summary == null || episodeData.summary == "null" || episodeData.summary.length == 0 || episodeData.summary == null) {

        descriptionElem.innerHTML = "" + "<br>";
  
      } // if
  
      else {
  
        descriptionElem.innerHTML = episodeData.summary + "<br>";
        
      } // else

    
    
} // showLightBox

 // close the lightbox
 function closeLightBox(){
     document.getElementById("lightbox").style.display = "none";
 } // closeLightBox 
