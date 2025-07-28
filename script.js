let allEpisodes = [];
const count = document.getElementById("match-count");

async function setup() {
  // allEpisodes = getAllEpisodes();

  // API
  const messageElement = document.getElementById("message"); // var for Loading msg
  try {
    messageElement.textContent = "Loading episodes..."; // msg Loading
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    // console.log(response);
    if (!response.ok) throw new Error("Failed to load data");
    allEpisodes = await response.json();
    // console.log(allEpisodes);
    messageElement.textContent = "";

    renderFilm(allEpisodes);
    populateSelectMenu(allEpisodes);
  } catch (error) {
    messageElement.textContent =
      "Error loading episodes. Please try again later.";
  } // END OF API

  // Event listener
  document.getElementById("search-input").addEventListener("keyup", onSearch);
  document
    .getElementById("episode-select")
    .addEventListener("change", onSelect);
}

// search function
function onSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filtered = allEpisodes.filter((ep) => {
    return (
      ep.name.toLowerCase().includes(searchTerm) ||
      ep.summary.toLowerCase().includes(searchTerm)
    );
  });
  // Filling display
  count.innerText = `Display ${filtered.length}/${allEpisodes.length} episodes.`;

  renderFilm(filtered);
}

function onSelect(event) {
  const value = event.target.value;
  if (value === "all") {
    // Filling display
    count.innerText = `Display ${allEpisodes.length}/${allEpisodes.length} episodes.`;

    renderFilm(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes[parseInt(value)];
    console.log(selectedEpisode.length);
    const count = document.getElementById("match-count");
    count.innerText = `Display 1/${allEpisodes.length} episodes.`;
    renderFilm([selectedEpisode]);
  }

  document.getElementById("search-input").value = "";
}

// Render function
function padNumber(num) {
  return num.toString().padStart(2, "0");
}

function formatEpisodeCode(season, number) {
  return `S${padNumber(season)}E${padNumber(number)}`;
}

function populateSelectMenu(episodes) {
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

function renderFilm(episodeList) {
  const containerEpisode = document.getElementById("root");
  containerEpisode.innerHTML = "";
  const templateEpisode = document.getElementById("episode-template");

  episodeList.forEach((episode) => {
    const clone = templateEpisode.content.cloneNode(true);
    clone.querySelector("img").src = episode.image.medium;
    clone.querySelector(".title").textContent =
      episode.name + " - " + formatEpisodeCode(episode.season, episode.number);

    clone.querySelector(".summary").innerHTML = episode.summary;
    containerEpisode.append(clone);
  });
}

window.onload = setup;
