let allEpisodes = [];
let allShows = [];
let currentShowEpisodes = []; // Track episodes for currently selected show
let fetchCache = new Map(); // Cache to prevent duplicate fetches
console.log("global fetchCache-----", fetchCache)

const count = document.getElementById("match-count");
const messageElement = document.getElementById("message"); // global now

// ----------------------- Fetching functions -----------------------

// Purpose: To fetch data from an API only once per URL and reuse that response later instead of fetching it again from the network.
async function fetchWithCache(url) {
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    const data = await res.json();
    fetchCache.set(url, data);
    // console.log("data inside fetchCache-----", data)
    // console.log("global fetchCache-----", fetchCache)
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Fetch and return episodes
async function fetchEpisodesForShow(showId) {
  try {
    messageElement.textContent = "Loading episodes...";
    const episodes = await fetchWithCache(`https://api.tvmaze.com/shows/${showId}/episodes`); // Dynamic showId + caching
    messageElement.textContent = "";
    return episodes;
  } catch (error) {
    messageElement.textContent = "Error loading episodes. Please try again later.";
    console.error(error);
    return [];
  }
}


// Fetch and return all shows
async function fetchAllShowsPaginated(maxPages = 10) {
  let all = [];

  async function getPage(page = 0) {
    const url = `https://api.tvmaze.com/shows?page=${page}`;
    try {
      const data = await fetchWithCache(url);
      if (!Array.isArray(data) || data.length === 0) return;
      all.push(...data);
      if (page + 1 < maxPages) await getPage(page + 1);
      // else stop after maxPages
    } catch (err) {
      console.error("Failed fetching show page", page, err);
    }
  }

  await getPage(0);
  return all.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}


// ----------------------- Main Setup -----------------------

async function setup() {
  // Load all shows first
  allShows = await fetchAllShowsPaginated(); 
  populateShowsMenu(allShows); 
  console.log(allShows)

  // Load episodes for the first show (Game of Thrones, ID 82) as default
  allEpisodes = await fetchEpisodesForShow(82); 
  currentShowEpisodes = allEpisodes; 
  renderFilm(allEpisodes);
  populateEpisodeMenu(allEpisodes); 
  updateCount(allEpisodes.length, allEpisodes.length); 
  
  // Set up event listeners (same as yours)
  document.getElementById("search-input").addEventListener("keyup", onSearch);
  document.getElementById("episode-select").addEventListener("change", onSelectEpisode);
  document.getElementById("show-select").addEventListener("change", onSelectShow);
}



// ----------------------- EventListener function logics -----------------------

function onSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filtered = currentShowEpisodes.filter((ep) => { 
    return (
      ep.name.toLowerCase().includes(searchTerm) ||
      (ep.summary && ep.summary.toLowerCase().includes(searchTerm)) 
    );
  });
  
  updateCount(filtered.length, currentShowEpisodes.length); 
  renderFilm(filtered);
}



function onSelectEpisode(event) {
  const value = event.target.value;
  if (value === "all") {
    renderFilm(currentShowEpisodes); 
    updateCount(currentShowEpisodes.length, currentShowEpisodes.length); 
  } else {
    const selectedEpisode = currentShowEpisodes[parseInt(value)]; 
    updateCount(1, currentShowEpisodes.length); 
    renderFilm([selectedEpisode]);
  }
  
  document.getElementById("search-input").value = "";
}

// Made async to handle fetching
async function onSelectShow(event) { 
  const showId = event.target.value; // the value is the id of the show 
  
  if (showId === "all") {
    return; 
  }
  
  // Fetch episodes for selected show
  const episodes = await fetchEpisodesForShow(showId); 
  currentShowEpisodes = episodes; 
  allEpisodes = episodes; 
  
  // Update all displays
  renderFilm(episodes);
  populateEpisodeMenu(episodes); 
  updateCount(episodes.length, episodes.length);
  
  // Reset other controls
  document.getElementById("search-input").value = "";
  document.getElementById("episode-select").value = "all";
}



// ----------------------- Helper functions -----------------------

function updateCount(displayed, total) {
  count.innerText = `Displaying ${displayed}/${total} episodes.`;
}

function padNumber(num) {
  return num.toString().padStart(2, "0");
}

function formatEpisodeCode(season, number) {
  return `S${padNumber(season)}E${padNumber(number)}`;
}

// ----------------------- Render functions -----------------------

function populateEpisodeMenu(episodes) {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="all">-- Show All Episodes --</option>';

  episodes.forEach((ep, index) => {
    const code = formatEpisodeCode(ep.season, ep.number);
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });
}


function populateShowsMenu(shows) {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = '<option value="all">-- Show All Shows --</option>';

  shows.forEach((sh) => {
    const option = document.createElement("option");
    option.value = sh.id; // Show ID is used to fetch episodes
    option.textContent = sh.name;
    showSelect.appendChild(option);
  });
}



function renderFilm(episodeList) {
  const containerEpisode = document.getElementById("root");
  containerEpisode.innerHTML = "";
  const templateEpisode = document.getElementById("episode-template");

  episodeList.forEach((episode) => {
    const clone = templateEpisode.content.cloneNode(true);
    
    // Handle missing images
    const img = clone.querySelector("img");
    if (episode.image && episode.image.medium) {
      img.src = episode.image.medium;
    } else {
      img.src = "https://via.placeholder.com/210x295?text=No+Image";
    }
    
    clone.querySelector(".title").textContent =
      episode.name + " - " + formatEpisodeCode(episode.season, episode.number);

    clone.querySelector(".summary").innerHTML = episode.summary || "No summary available.";
    containerEpisode.append(clone);
  });
}

window.onload = setup;
