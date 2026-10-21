// Histórias de demonstração (adicione novas aqui)
const historiasDemo = [
  {
    titulo: "Fantasia",
    genero: "Fantasia",
    autor: "Autor de exemplo",
    descricao: "Um reino à beira do fim guarda um segredo esquecido.",
    link: "livro.teste/fantasia.txt",
    capa: "livro.teste/1.png"
  },
  {
    titulo: "Romance",
    genero: "Romance",
    autor: "Autora de exemplo",
    descricao: "Duas pessoas descobrem o que nunca conseguiram dizer.",
    link: "livro.teste/romance.txt",
    capa: "livro.teste/2.png"
  },
  {
    titulo: "Yaoi",
    genero: "Yaoi",
    autor: "Autor de exemplo",
    descricao: "Um encontro inesperado muda tudo o que eles sabiam.",
    link: "livro.teste/yaoi.txt",
    capa: "livro.teste/3.png"
  }
];

// Remove acentos e deixa minúsculo, para a busca ignorar maiúsculas/acentos
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const R = window.Readeriso;
  const escapar = R.escaparHTML;

  // Histórias publicadas pelo usuário (abrem na leitura da Biblioteca)
  const publicadas = R.listar()
    .filter(livro => livro.publicada && livro.titulo)
    .map(livro => ({
      titulo: livro.titulo,
      genero: livro.genero,
      autor: R.usuarioAtual().usuario,
      descricao: livro.descricao || "Sem descrição.",
      link: `biblioteca.html?ler=${encodeURIComponent(livro.id)}`,
      capa: null,
      propria: true
    }));

  const historias = [...publicadas, ...historiasDemo];

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

    const selo = h.propria
      ? `<span class="aviso-demo selo-obra">Sua obra</span>`
      : `<span class="aviso-demo">Obra demonstrativa</span>`;

    return `
      <a class="card-historia" href="${escapar(h.link)}">
        ${capa}
        <p class="genero">${escapar(h.genero.toUpperCase())}</p>
        <h3>${escapar(h.titulo)}</h3>
        <p class="descricao-historia">${escapar(h.descricao)}</p>
        <p class="autor-historia">${escapar(h.autor)}</p>
        ${selo}
      </a>
    `;
  }

  // ===== Filtros de gênero =====
  const generos = ["Todos", ...new Set(historias.map(h => h.genero))];

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
