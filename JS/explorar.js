
// Livros disponíveis para a busca (adicione novos aqui)
const livros = [
  { titulo: "Fantasia", genero: "Fantasia", autor: "...", arquivo: "livro.teste/fantasia.txt", capa: "livro.teste/1.png" },
  { titulo: "Romance",  genero: "Romance",  autor: "...", arquivo: "livro.teste/romance.txt",  capa: "livro.teste/2.png" },
  { titulo: "Yaoi",     genero: "Yaoi",     autor: "...", arquivo: "livro.teste/yaoi.txt",     capa: "livro.teste/3.png" }
];
 
// Remove acentos e deixa minúsculo, para a busca ignorar maiúsculas/acentos
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
 
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
 
document.addEventListener("DOMContentLoaded", () => {
  const campo = document.getElementById("campoBusca");
  const resultados = document.getElementById("resultadosBusca");
  const secaoHistorias = document.getElementById("secaoHistorias");
 
  // Busca de livros
  if (campo && resultados) {
    campo.addEventListener("input", () => {
      const termo = normalizar(campo.value);
 
      if (!termo) {
        resultados.hidden = true;
        resultados.innerHTML = "";
        if (secaoHistorias) secaoHistorias.hidden = false;
        return;
      }
 
      const encontrados = livros.filter(l =>
        normalizar(l.titulo).includes(termo) ||
        normalizar(l.genero).includes(termo) ||
        normalizar(l.autor).includes(termo)
      );
 
      resultados.hidden = false;
      if (secaoHistorias) secaoHistorias.hidden = true;
 
      if (encontrados.length === 0) {
        resultados.innerHTML = '<p class="sem-resultado">Nenhum livro encontrado.</p>';
        return;
      }
 
      resultados.innerHTML = encontrados.map(l => `
        <a class="resultado-item" href="${escapar(l.arquivo)}">
          <img src="${escapar(l.capa)}" alt="${escapar(l.titulo)}">
          <div>
            <h3>${escapar(l.titulo)}</h3>
            <p>Autor: ${escapar(l.autor)}</p>
          </div>
        </a>
      `).join("");
    });
  }
 
  // Links provisórios (ainda sem destino)
  document.querySelectorAll(".link-provisorio").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      alert("Em breve!");
    });
  });
});