function setup() {
  const allEpisodes = getAllEpisodes();
  renderFilm(allEpisodes);
}

// Render function
function padNumber(num) {
  return num.toString().padStart(2, "0");
}

function formatEpisodeCode(season, number) {
  return `S${padNumber(season)}E${padNumber(number)}`;
}

function renderFilm(episodeList) {
  console.log("aida");
  const containerEpisode = document.getElementById("root");
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
