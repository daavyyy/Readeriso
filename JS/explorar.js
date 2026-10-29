// explorar.js — busca e filtros das histórias (livros fixos + publicadas de todas as contas)
// Os livros fixos ficam em livros-padrao.js; o catálogo vem de livros.js (Readeriso.catalogo).

// Mesmos gêneros do editor (sem "Yaoi")
const GENEROS = [
  "Fantasia", "Aventura", "Romance", "Ficção científica",
  "Terror", "Drama", "Comédia", "Mistério", "Outro"
];

// Remove acentos e deixa minúsculo, para a busca ignorar maiúsculas/acentos
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const R = window.Readeriso;
  const escapar = R.escaparHTML;

  // Livros publicados por qualquer conta (inclui os fixos)
  const historias = R.catalogo();

  const campo = document.getElementById("campoBusca");
  const form = document.getElementById("formBusca");
  const filtros = document.getElementById("filtrosGenero");
  const lista = document.getElementById("listaHistorias");
  const semResultado = document.getElementById("semResultado");
  const titulo = document.getElementById("tituloHistorias");
  const descricao = document.getElementById("descricaoHistorias");

  let generoAtivo = "Todos";

  // Monta o HTML de um card de história
  function criarCard(h) {
    const capa = h.capa
      ? `<div class="capa-historia"><img src="${escapar(h.capa)}" alt="Capa de ${escapar(h.titulo)}" loading="lazy"></div>`
      : `<div class="capa-historia sem-capa" aria-hidden="true">▧</div>`;

    let selo = "";
    if (h.demo) selo = `<span class="aviso-demo">Obra demonstrativa</span>`;
    else if (h.propria) selo = `<span class="aviso-demo selo-obra">Sua obra</span>`;

    // Só o autor vê as estatísticas do próprio livro
    const stats = h.propria ? `<p class="stats-livro">${R.textoEstatisticas(h.id)}</p>` : "";

    return `
      <a class="card-historia" href="${escapar(h.link)}">
        ${capa}
        <p class="genero">${escapar(h.genero.toUpperCase())}</p>
        <h3>${escapar(h.titulo)}</h3>
        <p class="descricao-historia">${escapar(h.descricao)}</p>
        <p class="autor-historia">${escapar(h.autor)}</p>
        ${stats}
        ${selo}
      </a>
    `;
  }

  // ===== Filtros de gênero =====
  const generos = ["Todos", ...GENEROS];

  filtros.innerHTML = generos.map(g => `
    <button type="button" class="filtro${g === generoAtivo ? " ativo" : ""}" data-genero="${escapar(g)}">
      ${escapar(g)}
    </button>
  `).join("");

  filtros.addEventListener("click", e => {
    const botao = e.target.closest(".filtro");
    if (!botao) return;

    generoAtivo = botao.dataset.genero;
    filtros.querySelectorAll(".filtro").forEach(b => {
      b.classList.toggle("ativo", b === botao);
    });
    renderizar();
  });

  // ===== Busca =====
  function renderizar() {
    const termo = normalizar(campo.value);

    const encontradas = historias.filter(h => {
      const doGenero = generoAtivo === "Todos" || h.genero === generoAtivo;
      const doTermo = !termo ||
        normalizar(h.titulo).includes(termo) ||
        normalizar(h.genero).includes(termo) ||
        normalizar(h.autor).includes(termo);
      return doGenero && doTermo;
    });

    lista.innerHTML = encontradas.map(criarCard).join("");
    semResultado.hidden = encontradas.length > 0;

    // Troca o título da seção quando há busca ou filtro ativo
    if (termo || generoAtivo !== "Todos") {
      titulo.innerHTML = "Resultados<span>.</span>";
      descricao.textContent = `${encontradas.length} história(s) encontrada(s).`;
    } else {
      titulo.innerHTML = "Histórias em destaque<span>.</span>";
      descricao.textContent = "Uma seleção de histórias para sua próxima leitura.";
    }
  }

  campo.addEventListener("input", renderizar);

  // Enter no campo leva até os resultados
  form.addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("historias").scrollIntoView();
  });

  renderizar();
});