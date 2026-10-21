const books = [
  {id:"primavera",title:"A dança da primavera imortal",description:"para se emocionar",genre:"romance",rating:5,cover:"assets/reading-cover.jpg"},
  {id:"mundo",title:"O Mundo Perdido",description:"Aventura e mistério",genre:"Aventura",rating:5,cover:"assets/lost-world-cover.jpg"},
  {id:"estrelas",title:"Além das Estrelas",description:"Ficção científica",genre:"Ficção científica",rating:4,cover:"assets/stars-cover.jpg"}
];
const favorites = new Set(JSON.parse(localStorage.getItem("crimsonReaderFavorites") || "[]"));
const bookGrid = document.getElementById("book-grid");
const favoritesContent = document.getElementById("favorites-content");
const favoriteCount = document.getElementById("favorite-count");
const favoritesHeadingCount = document.getElementById("favorites-heading-count");

function bookCard(book) {
  const favorite = favorites.has(book.id);
  return `<article class="book-card">
    <div class="cover-stage">
      <div class="book-cover"><img src="${book.cover}" alt="Capa de ${book.title}" loading="lazy"><span class="cover-title">${book.title}</span><span class="cover-caption">${book.genre}</span></div>
      <button class="cover-heart ${favorite ? "is-favorite" : ""}" data-favorite="${book.id}" aria-label="${favorite ? "Remover dos" : "Adicionar aos"} favoritos" aria-pressed="${favorite}">${favorite ? "♥" : "♡"}</button>
    </div>
    <div class="book-details"><p class="genre-label">${book.genre}</p><h3 class="book-title">${book.title}</h3><p class="book-description">${book.description}</p>
      <div class="rating-row" aria-label="${book.rating} de 5 estrelas">${"★".repeat(book.rating)}<span>${book.rating},0</span></div>
      <button class="favorite-btn ${favorite ? "is-favorite" : ""}" data-favorite="${book.id}" aria-pressed="${favorite}">${favorite ? "♥ Remover dos favoritos" : "♡ Adicionar aos favoritos"}</button>
    </div>
  </article>`;
}
function render() {
  bookGrid.innerHTML = books.map(bookCard).join("");
  const selected = books.filter(book => favorites.has(book.id));
  favoriteCount.textContent = String(favorites.size).padStart(2,"0");
  favoritesHeadingCount.textContent = String(favorites.size).padStart(2,"0");
  favoritesContent.innerHTML = selected.length
    ? `<div class="book-grid">${selected.map(bookCard).join("")}</div>`
    : `<div class="empty-favorites"><div class="heart">♡</div><p>Nenhum livro escolhido ainda.</p><span>Sua próxima história favorita pode estar logo acima.</span></div>`;
  localStorage.setItem("crimsonReaderFavorites", JSON.stringify([...favorites]));
}
document.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    render();
    return;
  }
  const nav = event.target.closest("[data-section]");
  if (nav) {
    document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link === nav));
  }
});
const modal = document.getElementById("settings-modal");
document.getElementById("open-settings").addEventListener("click", () => { modal.hidden = false; });
document.getElementById("close-settings").addEventListener("click", () => { modal.hidden = true; });
document.getElementById("save-settings").addEventListener("click", () => {
  document.getElementById("app").classList.toggle("light-reading", document.getElementById("theme-select").value === "claro");
  const app = document.getElementById("app");
  app.classList.remove("font-medium-reading","font-large-reading");
  if (document.getElementById("font-select").value === "18") app.classList.add("font-medium-reading");
  if (document.getElementById("font-select").value === "20") app.classList.add("font-large-reading");
  modal.hidden = true;
});
modal.addEventListener("click", event => { if (event.target === modal) modal.hidden = true; });
document.addEventListener("keydown", event => { if (event.key === "Escape") modal.hidden = true; });
render();