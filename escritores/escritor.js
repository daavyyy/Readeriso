(() => {
  "use strict";

  const $ = (seletor, elemento = document) =>
    elemento.querySelector(seletor);

  function iniciar() {
    const listaRascunhos = $("#listaRascunhos");
    const listaPublicados = $("#listaPublicados");
    const formulario = $("#formNovaHistoria");
    const campoTitulo = $("#titulo");
    const campoDescricao = $("#descricao");
    const campoGenero = $("#genero");
    const erro = $("#erroForm");
    const elModal = $("#modalNovaHistoria");
    const botaoCriar = $("#btnCriar");

    let criando = false;

    function mostrarErro(mensagem) {
      if (!erro) return;
      erro.textContent = mensagem;
      erro.hidden = false;
    }

    function ocultarErro() {
      if (!erro) return;
      erro.textContent = "";
      erro.hidden = true;
    }

    function escapar(texto) {
      return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[caractere]);
    }

    function obterTimestamp(valor) {
      if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : 0;
      }

      const numero = Number(valor);
      if (valor !== "" && valor != null && Number.isFinite(numero)) {
        return numero;
      }

      const data = Date.parse(valor);
      return Number.isNaN(data) ? 0 : data;
    }

    function obterReaderiso() {
      const R = window.Readeriso;

      if (
        !R ||
        typeof R.criar !== "function" ||
        typeof R.listar !== "function"
      ) {
        throw new Error("O sistema Readeriso não foi carregado corretamente.");
      }

      return R;
    }

    function atualizarContador(seletor, quantidade) {
      const elemento = $(seletor);

      if (elemento) {
        elemento.textContent =
          `${quantidade} ${quantidade === 1 ? "história" : "histórias"}`;
      }
    }

    function mostrarMensagem(elemento, mensagem) {
      if (!elemento) return;
      elemento.innerHTML = `<p class="lista-vazia">${escapar(mensagem)}</p>`;
    }

    function preencherLista(elemento, livros, mensagem) {
      if (!elemento) return;

      if (livros.length === 0) {
        mostrarMensagem(elemento, mensagem);
        return;
      }

      elemento.innerHTML = livros.map(livro => {
        const titulo = escapar(livro.titulo || "Sem título");
        const id = encodeURIComponent(String(livro.id));
        const quantidadeCapitulos = Array.isArray(livro.capitulos)
          ? livro.capitulos.length
          : 0;
        const status = livro.publicada ? "Publicado" : "Rascunho";

        return `
          <a
            class="livro"
            href="editor.html?id=${id}"
            aria-label="Editar ${titulo}"
          >
            <div class="capa" aria-hidden="true">📖</div>
            <h3>${titulo}</h3>
            <p>
              ${status} · ${quantidadeCapitulos}
              ${quantidadeCapitulos === 1 ? "capítulo" : "capítulos"}
            </p>
          </a>
        `;
      }).join("");
    }

    function renderizar() {
      try {
        const R = obterReaderiso();
        const resultado = R.listar();

        if (!Array.isArray(resultado)) {
          throw new Error("A lista de histórias retornou um formato inválido.");
        }

        const livros = [...resultado].sort((a, b) =>
          obterTimestamp(b.atualizadoEm) - obterTimestamp(a.atualizadoEm)
        );

        const rascunhos = livros.filter(livro => !livro.publicada);
        const publicados = livros.filter(livro => livro.publicada);

        preencherLista(
          listaRascunhos,
          rascunhos,
          "Você ainda não tem rascunhos. Crie sua primeira história!"
        );

        preencherLista(
          listaPublicados,
          publicados,
          "Você ainda não publicou nenhuma história."
        );

        atualizarContador("#contadorRascunhos", rascunhos.length);
        atualizarContador("#contadorPublicados", publicados.length);
      } catch (erroInterno) {
        console.error("Erro ao carregar as histórias:", erroInterno);

        const msg = "Não foi possível carregar as histórias.";
        mostrarMensagem(listaRascunhos, msg);
        mostrarMensagem(listaPublicados, msg);
      }
    }

    function criarHistoria() {
      if (criando) return;

      ocultarErro();

      if (!campoTitulo || !campoDescricao || !campoGenero) {
        console.error("Não foi possível encontrar os campos do formulário.");
        return;
      }

      const titulo = campoTitulo.value.trim();
      const descricao = campoDescricao.value.trim();
      const genero = campoGenero.value;

      if (!titulo) {
        mostrarErro("Digite um título para a história.");
        campoTitulo.focus();
        return;
      }

      if (!genero) {
        mostrarErro("Selecione um gênero para a história.");
        campoGenero.focus();
        return;
      }

      criando = true;
      if (botaoCriar) botaoCriar.disabled = true;

      let livro;

      try {
        const R = obterReaderiso();

        livro = R.criar({ titulo, descricao, genero });

        if (!livro || livro.id === undefined || livro.id === null) {
          throw new Error("O livro foi criado sem um identificador válido.");
        }
      } catch (erroInterno) {
        console.error("Erro ao criar a história:", erroInterno);
        mostrarErro(
          "Não foi possível criar a história. Verifique o sistema de armazenamento."
        );
        criando = false;
        if (botaoCriar) botaoCriar.disabled = false;
        return;
      }

      window.location.href =
        `editor.html?id=${encodeURIComponent(String(livro.id))}`;
    }

    if (formulario) {
      formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        criarHistoria();
      });
    } else {
      console.error("Formulário #formNovaHistoria não encontrado.");
    }

    if (elModal) {
      elModal.addEventListener("shown.bs.modal", () => {
        if (campoTitulo) campoTitulo.focus();
      });

      elModal.addEventListener("hidden.bs.modal", () => {
        if (formulario) formulario.reset();
        ocultarErro();
        criando = false;
        if (botaoCriar) botaoCriar.disabled = false;
      });
    }

    // Volta pelo botão "voltar" (cache de navegação): reativa e atualiza a lista
    window.addEventListener("pageshow", evento => {
      if (!evento.persisted) return;

      criando = false;
      if (botaoCriar) botaoCriar.disabled = false;
      renderizar();
    });

    renderizar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();