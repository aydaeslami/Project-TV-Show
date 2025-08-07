// let allEpisodes = [];
let allShows = [];
let episodeCount = 0;
let currentView = "show"; // Track current status display
let fetchCache = new Map(); // Cache to prevent duplicate fetches
let filterShows = []; // Filtered shows based on search input
let filtered = [];
const containerEpisode = document.getElementById("root");
const count = document.getElementById("match-count");
const countShow = document.getElementById("countShow ");
const messageElement = document.getElementById("message");
const episodeSearchContainer = document.getElementById("search-holder");
const showSearchContainer = document.getElementById("showSearchHolder");
// ----------------------- Main Setup -----------------------
function testAida() {
  console.log("testAida function called");
}
// ----------------------- Fetching functions -----------------------

async function fetchWithCache(url) {
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    const data = await res.json();
    fetchCache.set(url, data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchEpisodesForShow(showId) {
  try {
    messageElement.textContent = "Loading episodes...";
    const episodes = await fetchWithCache(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    messageElement.textContent = "";
    return episodes;
  } catch (error) {
    messageElement.textContent =
      "Error loading episodes. Please try again later.";
    console.error(error);
    return [];
  }
}

async function fetchAllShowsPaginated(maxPages = 10) {
  let all = [];

  async function getPage(page = 0) {
    const url = `https://api.tvmaze.com/shows?page=${page}`;
    try {
      const data = await fetchWithCache(url);
      if (!Array.isArray(data) || data.length === 0) return;
      all.push(...data);
      if (page + 1 < maxPages) await getPage(page + 1);
    } catch (err) {
      console.error("Failed fetching show page", page, err);
    }
  }

  await getPage(0);
  return all.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
}

async function setup() {
  episodeSearchContainer.style.display = "none";

  allShows = await fetchAllShowsPaginated();
  console.log("Fetched all shows:", allShows);

  renderShow(allShows);
  updateCount(allShows.length, allShows.length);
  document.getElementById("episodeSelect").innerHTML =
    '<option value="all">-- No Episodes --</option>';

  document.getElementById("searchEpisode").addEventListener("keyup", onSearch);
  document.getElementById("searchShow").addEventListener("keyup", onSearch);
  ////
  document
    .getElementById("selectShow")
    .addEventListener("change", onSelectSingleShow);
  /////
  document
    .getElementById("episodeSelect")
    .addEventListener("change", onSelectEpisode);
  document
    .getElementById("showSelect")
    .addEventListener("change", onSelectShow);
}

document.getElementById("backBtn").addEventListener("click", () => {
  renderShow(allShows);
});

// ----------------------- EventListener function logics -----------------------

function onSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  console.log("Search term:", searchTerm);

  if (currentView === "episode") {
    const filtered = allEpisodes.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        (item.summary && item.summary.toLowerCase().includes(searchTerm))
      );
    });
    renderFilm(filtered);
    updateCount(filtered.length, allEpisodes.length);
  } else {
    filtered = allShows.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        (item.summary && item.summary.toLowerCase().includes(searchTerm)) ||
        (item.genres &&
          item.genres.some((genre) => genre.toLowerCase().includes(searchTerm)))
      );
    });
    filterShows = filtered; // Store filtered shows for later use
    console.log("Filtered shows:", filterShows);
    document.getElementById("countShows").innerHTML = `Found ${filtered.length} shows`;
    renderShow(filtered);
    populateShowsMenu(filtered);
    updateCount(filtered.length, allShows.length);
  }
}

function onSelectEpisode(event) {
  const value = event.target.value;
  if (value === "all") {
    renderFilm(allEpisodes);
    updateCount(allEpisodes.length, allEpisodes.length);
  } else {
    const selectedEpisode = allEpisodes[parseInt(value)];
    updateCount(1, allEpisodes.length);
    renderFilm([selectedEpisode]);
  }
  document.getElementById("search-input").value = "";
}

async function onSelectShow(event) {
  const showId = event.target.value;

  if (showId === "all") {
    renderFilm(allShows);
    updateCount(allShows.length, allShows.length);
    return;
  }

  console.log("Fetching episodes for show ID:", showId);
  const episodes = await fetchEpisodesForShow(showId);
  console.log("Fetched episodes:", episodes);

  allEpisodes = episodes;
  episodeCount = episodes.length;

  renderFilm(episodes);
  populateEpisodeMenu(episodes);
  updateCount(episodes.length, episodes.length);

  document.getElementById("search-input").value = "";
  document.getElementById("episodeSelect").value = "all";
}
function onSelectSingleShow(event) {
  const showId = event.target.value;

  if (showId === "all") {
    renderShow(filterShows);
    updateCount(allShows.length, allShows.length);
    return;
  }

  const selectedShow = allShows.find((show) => show.id == showId);
  if (selectedShow) {
    renderShow([selectedShow]);
    updateCount(1, allShows.length);
  }
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
  console.log("Populating episode menu...");
  const select = document.getElementById("episodeSelect");
  select.innerHTML = '<option value="all">-- Show All Episodes --</option>';
  console.log("Populating episode menu with episodes:", episodes);
  episodes.forEach((ep, index) => {
    const code = formatEpisodeCode(ep.season, ep.number);
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });
}

function populateShowsMenu(shows) {
  const showSelect = document.getElementById("selectShow");
  showSelect.innerHTML = '<option value="all">-- Show All Shows --</option>';

  shows.forEach((sh) => {
    const option = document.createElement("option");
    option.value = sh.id;
    option.textContent = sh.name;
    showSelect.appendChild(option);
  });
}

function renderFilm(mediaList) {
  currentView = "episode";
  episodeSearchContainer.style.display = "block";
  showSearchHolder.style.display = "none";
  document.body.classList.add("show-mode"); // 👈 اضافه شد
  containerEpisode.innerHTML = "";
  const templateEpisode = document.getElementById("episode-template");

  mediaList.forEach((mediaItem) => {
    const clone = templateEpisode.content.cloneNode(true);
    const img = clone.querySelector("img");
    img.src =
      mediaItem.image?.medium ||
      "https://via.placeholder.com/210x295?text=No+Image";

    clone.querySelector(".title").textContent =
      mediaItem.season !== undefined && mediaItem.number !== undefined
        ? `${mediaItem.name} - ${formatEpisodeCode(
            mediaItem.season,
            mediaItem.number
          )}`
        : mediaItem.name || "Show";

    clone.querySelector(".summary").innerHTML =
      mediaItem.summary || "No summary available.";

    const urlElement = clone.querySelector(".episode-url");
    if (urlElement) {
      urlElement.href = mediaItem.url || "#";
    }

    containerEpisode.append(clone);
  });
}

function renderShow(mediaList) {
  currentView = "show";
  episodeSearchContainer.style.display = "none";
  showSearchHolder.style.display = "block";
  document.body.classList.remove("show-mode");
  containerEpisode.innerHTML = "";
  const templateShow = document.getElementById("show-template");

  mediaList.forEach((mediaItem) => {
    const cloneShow = templateShow.content.cloneNode(true);
    cloneShow.querySelector(".show-card").dataset.showId = mediaItem.id;

    const imgShow = cloneShow.querySelector(".show-img");
    imgShow.src =
      mediaItem.image?.medium ||
      "https://via.placeholder.com/210x295?text=No+Image";
    imgShow.alt = mediaItem.name || "Show Image";

    cloneShow.querySelector(".showTitle").textContent =
      mediaItem.name || "Show";
    cloneShow.querySelector(".showSummary").innerHTML =
      mediaItem.summary || "No summary available.";
    cloneShow.querySelector(".showRated").textContent =
      mediaItem.rating?.average || "N/A";
    cloneShow.querySelector(".showGenres").textContent = mediaItem.genres
      ?.length
      ? mediaItem.genres.join(", ")
      : "N/A";
    cloneShow.querySelector(".showStatus").textContent =
      mediaItem.status || "N/A";
    cloneShow.querySelector(".showRuntime").textContent = mediaItem.runtime
      ? `${mediaItem.runtime} min`
      : "N/A";

    containerEpisode.append(cloneShow);
  });
}

window.onload = () => {
  setup();

  containerEpisode.addEventListener("click", async (e) => {
    if (e.target.classList.contains("watchShowBtn")) {
      const showId = e.target.closest(".show-card").dataset.showId;
      console.log("Clicked Show ID:", showId);

      const episodes = await fetchEpisodesForShow(showId);
      allEpisodes = episodes;

      renderFilm(episodes);
      populateEpisodeMenu(episodes);
      updateCount(episodes.length, episodes.length);

      document.getElementById("search-input").value = "";
      document.getElementById("episodeSelect").value = "all";
    }
  });
};