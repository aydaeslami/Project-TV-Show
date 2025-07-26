function setup() {
  const allEpisodes = getAllEpisodes();
  const rootElem = document.getElementById("root");

  for (let i = 0; i < allEpisodes.length; i++) {
    // big div
    const card = document.createElement("div");
    card.classList.add("episode-card");

    // name film
    const nameInfo = document.createElement("div");
    nameInfo.classList.add("nameFilm");

    let seasonFilm = String(allEpisodes[i].season);
    let numberFilm = String(allEpisodes[i].number);
    nameInfo.textContent =
      allEpisodes[i].name +
      " - " +
      "S" +
      seasonFilm.padStart(2, "0") +
      "E" +
      numberFilm.padStart(2, "0");

    // image
    const episodeImage = document.createElement("img");
    episodeImage.src = allEpisodes[i].image.medium;
    episodeImage.classList.add("episode-image");
    // summery film
    const summeryFilm = document.createElement("div");
    summeryFilm.classList.add("summeryFilm");

    summeryFilm.innerHTML = allEpisodes[i].summary;

    rootElem.appendChild(card);
    card.appendChild(nameInfo);
    card.appendChild(episodeImage);
    card.appendChild(summeryFilm);
  }
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;
