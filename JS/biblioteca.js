/* biblioteca.js - mostra rascunhos, publicações e leitura das histórias */
(() => {
  "use strict";

  function iniciar() {
    const R = window.Readeriso;
    if (!R || typeof R.listar !== "function" || typeof R.obter !== "function") {
      console.error("Carregue livros.js antes de biblioteca.js.");
      alert("Não foi possível carregar as histórias. Confira a ordem dos scripts em biblioteca.html.");
      return;
    }

    const listaLivros = document.getElementById("listaLivros");
    const mensagemVazia = document.getElementById("mensagemVazia");
    const contadorLivros = document.getElementById("contadorLivros");
    const abas = document.querySelectorAll(".aba");
    let tipoAtual = "publicados";
    let livroAberto = null;

    function escaparHTML(texto) {
      return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[caractere]);
    }

    function formatarTexto(texto) {
      return escaparHTML(texto)
        .replace(/^## (.+)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/__(.+?)__/g, "<u>$1</u>")
        .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
        .replace(/^- (.+)$/gm, "• $1")
        .replace(/\n/g, "<br>");
    }

    function carregarBiblioteca() {
      const filtrados = R.listar()
        .filter(livro => tipoAtual === "publicados" ? livro.publicada : !livro.publicada)
        .sort((a, b) => (b.atualizadoEm || 0) - (a.atualizadoEm || 0));

      listaLivros.replaceChildren();
      contadorLivros.textContent = `${filtrados.length} ${filtrados.length === 1 ? "história" : "histórias"}`;
      mensagemVazia.hidden = filtrados.length > 0;

      filtrados.forEach(livro => {
        const card = document.createElement("article");
        card.className = "card-livro";

        const capa = document.createElement("div");
        capa.className = "capa-livro";
        capa.textContent = "📖";
        capa.setAttribute("aria-hidden", "true");

        const generoEl = document.createElement("p");
        generoEl.className = "genero";
        generoEl.textContent = livro.genero || "SEM GÊNERO";

        const tituloEl = document.createElement("h2");
        tituloEl.textContent = livro.titulo || "História sem título";

        const descricaoEl = document.createElement("p");
        descricaoEl.className = "descricao";
        descricaoEl.textContent = livro.descricao || "Sem descrição.";

        const status = document.createElement("p");
        status.className = "status";
        status.textContent = livro.publicada ? "● Publicado" : "● Rascunho";

        const acoes = document.createElement("div");
        acoes.className = "acoes-livro";

        if (livro.publicada) {
          const botaoLer = document.createElement("button");
          botaoLer.type = "button";
          botaoLer.className = "botao principal";
          botaoLer.textContent = "Ler";
          botaoLer.addEventListener("click", () => abrirLeitura(livro.id));
          acoes.appendChild(botaoLer);
        }

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "botao secundario";
        botaoEditar.textContent = livro.publicada ? "Editar" : "Continuar escrevendo";
        botaoEditar.addEventListener("click", () => {
          window.location.href = `editor.html?id=${encodeURIComponent(String(livro.id))}`;
        });
        acoes.appendChild(botaoEditar);

        card.append(capa, generoEl, tituloEl, descricaoEl, status, acoes);
        listaLivros.appendChild(card);
      });

      if (livroAberto) mostrarLeitura(livroAberto);
    }

    function abrirLeitura(id) {
      livroAberto = id;
      mostrarLeitura(id);
    }

    function mostrarLeitura(id) {
      document.getElementById("painelLeitura")?.remove();
      const livro = R.obter(id);
      if (!livro || !livro.publicada) {
        livroAberto = null;
        return;
      }

      const painel = document.createElement("section");
      painel.id = "painelLeitura";
      painel.className = "leitura";
      painel.setAttribute("aria-label", "Leitura da história");

      const fechar = document.createElement("button");
      fechar.type = "button";
      fechar.className = "botao secundario";
      fechar.textContent = "← Fechar leitura";
      fechar.addEventListener("click", () => {
        livroAberto = null;
        painel.remove();
      });

      const tituloEl = document.createElement("h2");
      tituloEl.textContent = livro.titulo || "História sem título";

      const descricaoEl = document.createElement("p");
      descricaoEl.className = "descricao";
      descricaoEl.textContent = livro.descricao || "";
      painel.append(fechar, tituloEl, descricaoEl);

      livro.capitulos.forEach((capitulo, indice) => {
        const area = document.createElement("div");
        area.className = "texto-capitulo";

        const nomeCapitulo = document.createElement("h3");
        nomeCapitulo.textContent = capitulo.titulo || `Capítulo ${indice + 1}`;

        const texto = document.createElement("div");
        texto.className = "conteudo-formatado";
        texto.style.textAlign = capitulo.alinhamento || "left";
        texto.innerHTML = formatarTexto(capitulo.conteudo || "Este capítulo ainda não tem texto.");

        area.append(nomeCapitulo, texto);
        painel.appendChild(area);
      });

      listaLivros.before(painel);
      painel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    abas.forEach(aba => {
      aba.addEventListener("click", () => {
        tipoAtual = aba.dataset.tipo;
        abas.forEach(item => item.classList.remove("ativa"));
        aba.classList.add("ativa");
        livroAberto = null;
        document.getElementById("painelLeitura")?.remove();
        carregarBiblioteca();
      });
    });

    carregarBiblioteca();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
