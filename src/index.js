const form = document.querySelector("form");
const search = document.querySelector("input");
const movieList = document.querySelector("#movie-list");
const apiKey = "983bf0ac";
let currentResultArray = [];
//api key: 983bf0ac

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    currentResultArray = [];
    fetchResults(search.value);
    console.log("Searching for " + search.value);
  });
}
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".watchlist-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains("add")) {
    console.log("trying to run addToWatchlist");
    addToWatchlist(id);
  } else if (btn.classList.contains("remove")) {
    console.log("trying to run removeFromWatchlist");
    removeFromWatchlist(id);

    if (window.location.pathname.endsWith("watchlist")) {
      const card = document
        .getElementById(`btn-wrapper-${id}`)
        ?.closest(".movie-card");
      if (card) card.remove();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("watchlist")) {
    console.log("On watchlist.html");
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    console.log(watchlist);
    for (let movie of watchlist) {
      renderResults(movie);
    }
  }
});

async function fetchResults(searchInput) {
  const res = await fetch(
    `https://www.omdbapi.com/?s=${searchInput}&apikey=${apiKey}`
  );
  const data = await res.json();
  console.log(data);
  for (let id of data.Search) {
    fetchMovieById(id.imdbID);
  }
}

async function fetchMovieById(id) {
  const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
  const data = await res.json();
  console.log(data);
  currentResultArray.push(data);
  renderResults(data);
}

function renderResults(resultObj) {
  const {
    Poster: poster,
    Title: title,
    imdbRating: rating,
    Ratings: ratings,
    Runtime: runtime,
    Genre: genre,
    Plot: plot,
    imdbID: id,
  } = resultObj;
  let update = "";
  let connectingWord = "to";
  console.log("ID passed in:", id);
  if (alreadyOnWatchlist(id)) {
    update = "remove";
    connectingWord = "from";
  } else {
    update = "add";
  }
  movieList.innerHTML += `<div class="movie-card">
          <img
            class="poster"
            src="${poster}"
          />
          <div class="text-wrapper">
          <div class="title-wrapper">
            <h2>
              ${title}
            </h2>
            <div class="ratings">
            <div><img src="/src/images/star.png" /><p>${rating}</p></div>
            <div><img src="/src/images/tomato.svg" /><p>${ratings[1].Value}</p></div>
            </div>
            </div>
            <div class="info-wrapper">
              <p class="runtime">${runtime}</p>
              <p class="genre">${genre}</p>
              <div class="btn-wrapper" id="btn-wrapper-${id}">
                <button class="watchlist-btn ${update}" data-id="${id}"><img src="/src/images/icon-${update}.png">${connectingWord} Watchlist</button>
            </div>
            </div>
            <p class="plot">${plot}</p>
          </div>
        </div>
        `;
}
function alreadyOnWatchlist(id) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  return watchlist.some((m) => String(m.imdbID).trim() === String(id).trim());
}

function addToWatchlist(id) {
  const movie = currentResultArray.find((m) => m.imdbID === id);

  const newMovie = {
    Poster: movie.Poster,
    Title: movie.Title,
    imdbRating: movie.imdbRating,
    Ratings: movie.Ratings,
    Runtime: movie.Runtime,
    Genre: movie.Genre,
    Plot: movie.Plot,
    imdbID: movie.imdbID,
  };
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (!alreadyOnWatchlist(id)) {
    console.log("checked to make sure movie is not on watchlist already");
    watchlist.push(newMovie);
    console.log("added newMovie to watchlist array");
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    console.log("watchlist in localstorage updated");
    updateButton("remove", id);
  } else {
    console.log("movie was already on watchlist");
  }
}

function removeFromWatchlist(id) {
  if (alreadyOnWatchlist(id)) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter((m) => m.imdbID !== id);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    console.log("movie removed from watchlist");
    updateButton("add", id);
    console.log("movie wasnt on the watchlist");
  }
  if (window.location.pathname.endsWith("watchlist.html")) {
  }
}

function updateButton(update, id) {
  let connectingWord = "to";
  if (update === "remove") {
    connectingWord = "from";
  }
  document.getElementById(`btn-wrapper-${id}`).innerHTML = `
    <button class="watchlist-btn ${update}" data-id="${id}"><img src="/src/images/icon-${update}.png">${connectingWord} Watchlist</button>`;
}
