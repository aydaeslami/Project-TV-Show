let allEpisodes =[]

function setup() {
  allEpisodes = getAllEpisodes();

  renderFilm(allEpisodes);
  populateSelectMenu(allEpisodes);

  document.getElementById("search-input").addEventListener("keyup", onSearch)
  document.getElementById("episode-select").addEventListener("change" , onSelect)
}


// search function
function onSearch (event){
  const searchTerm = event.target.value.toLowerCase();
  const filtered = allEpisodes.filter( (ep) => {
    return (
      ep.name.toLowerCase().includes(searchTerm) ||
      ep.summary.toLowerCase().includes(searchTerm)
    )
  })
  const count = document.getElementById("match-count")
  count.innerText = `Display ${filtered.length}/77 episodes.`
  renderFilm(filtered)
}

function onSelect(event) {
  const value = event.target.value;
  if (value === "all") {
    renderFilm(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes[parseInt(value)];
    renderFilm([selectedEpisode]);
  }

  document.getElementById("search-input").value = "";
}

// Render function
function padNumber(num) {
  return num.toString().padStart(2, "0");
}
// creates S01E12
function formatEpisodeCode(season, number) {
  return `S${padNumber(season)}E${padNumber(number)}`;
}


function populateSelectMenu(episodes) {
  const select = document.getElementById("episode-select");

  // Clear existing options except "-- Show All --"
  select.innerHTML = '<option value="all">-- Show All Episodes --</option>';

  episodes.forEach((ep, index) => {
    const code = formatEpisodeCode(ep.season, ep.number);
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });
}


// render template function
function renderFilm(episodeList) {
  const containerEpisode = document.getElementById("root");
  containerEpisode.innerHTML = ""

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
