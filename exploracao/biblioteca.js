/* biblioteca.js - lista e leitura das histórias (usa window.Readeriso, de livros.js) */
(() => {
  "use strict";

  function iniciar() {
    /* Parte 1 - Elementos e dados */
    const R = window.Readeriso;

    if (!R || typeof R.listar !== "function" || typeof R.obter !== "function") {
      console.error("Readeriso não encontrado. Carregue livros.js antes de biblioteca.js.");
      return;
    }

    const listaLivros = document.getElementById("listaLivros");
    const mensagemVazia = document.getElementById("mensagemVazia");
    const contadorLivros = document.getElementById("contadorLivros");
    const abas = document.querySelectorAll(".aba");

    let tipoAtual = "publicados";
    let livroAberto = null;

    /* Parte 2 - Mostrar a biblioteca */
    function carregarBiblioteca() {
      const filtrados = R.listar()
        .filter(livro =>
          tipoAtual === "publicados" ? livro.publicada : !livro.publicada
        )
        .sort((a, b) => b.atualizadoEm - a.atualizadoEm);

      listaLivros.replaceChildren();
      contadorLivros.textContent =
        `${filtrados.length} ${filtrados.length === 1 ? "história" : "histórias"}`;

      mensagemVazia.hidden = filtrados.length > 0;

      filtrados.forEach(livro => {
        const card = document.createElement("article");
        card.className = "card-livro";

        const capa = document.createElement("div");
        capa.className = "capa-livro";
        capa.textContent = "📖";

        const genero = document.createElement("p");
        genero.className = "genero";
        genero.textContent = livro.genero || "SEM GÊNERO";

        const titulo = document.createElement("h2");
        titulo.textContent = livro.titulo || "História sem título";

        const descricao = document.createElement("p");
        descricao.className = "descricao";
        descricao.textContent = livro.descricao || "Sem descrição.";

        const status = document.createElement("p");
        status.className = "status";
        status.textContent = livro.publicada ? "● Publicado" : "● Rascunho";

        const acoes = document.createElement("div");
        acoes.className = "acoes-livro";

        const botaoLer = document.createElement("button");
        botaoLer.type = "button";
        botaoLer.className = "botao principal";
        botaoLer.textContent = "Ler";
        botaoLer.addEventListener("click", () => abrirLeitura(livro.id));

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "botao secundario";
        botaoEditar.textContent = "Escrever";
        botaoEditar.addEventListener("click", () => {
          window.location.href = `editor.html?id=${encodeURIComponent(livro.id)}`;
        });

        acoes.append(botaoLer, botaoEditar);
        card.append(capa, genero, titulo, descricao, status, acoes);
        listaLivros.appendChild(card);
      });

      if (livroAberto) {
        mostrarLeitura(livroAberto);
      }
    }

    /* Parte 3 - Abrir uma história para leitura */
    function abrirLeitura(id) {
      livroAberto = id;
      mostrarLeitura(id);
    }

    function mostrarLeitura(id) {
      const livro = R.obter(id);

      document.getElementById("painelLeitura")?.remove();

      if (!livro) {
        livroAberto = null;
        return;
      }

      const painel = document.createElement("section");
      painel.id = "painelLeitura";
      painel.className = "leitura";

      const fechar = document.createElement("button");
      fechar.type = "button";
      fechar.className = "botao secundario";
      fechar.textContent = "← Fechar leitura";
      fechar.addEventListener("click", () => {
        livroAberto = null;
        painel.remove();
      });

      const titulo = document.createElement("h2");
      titulo.textContent = livro.titulo || "História sem título";

      const descricao = document.createElement("p");
      descricao.className = "descricao";
      descricao.textContent = livro.descricao || "";

      painel.append(fechar, titulo, descricao);

      livro.capitulos.forEach((capitulo, indice) => {
        const area = document.createElement("div");
        area.className = "texto-capitulo";

        const nomeCapitulo = document.createElement("h3");
        nomeCapitulo.textContent = capitulo.titulo || `Capítulo ${indice + 1}`;

        const texto = document.createElement("p");
        texto.style.textAlign = capitulo.alinhamento || "left";
        texto.textContent =
          capitulo.conteudo || "Este capítulo ainda não tem texto.";

        area.append(nomeCapitulo, texto);
        painel.appendChild(area);
      });

      listaLivros.before(painel);
      painel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* Parte 4 - Alternar entre publicações e rascunhos */
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

    /* Parte 5 - Inicialização */
    carregarBiblioteca();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();