/* escritor.js — lista e criação de histórias usando o mesmo livros.js do editor. */
(() => {
  "use strict";

  function mostrarAvisoFileProtocol() {
    if (window.location.protocol !== "file:") return;
    const aviso = document.createElement("div");
    aviso.setAttribute("role", "alert");
    aviso.style.cssText = "margin:0;padding:14px 5%;background:#fff0cf;color:#4d3300;font:14px/1.5 Arial,sans-serif;border-bottom:1px solid #e5c16a";
    aviso.textContent = "Atenção: o site está aberto por file://. O navegador pode separar o localStorage entre escritor.html, editor.html e biblioteca.html. Abra o projeto pelo Live Server do VS Code e use sempre a mesma URL para salvar e publicar corretamente.";
    document.body.prepend(aviso);
  }

  function iniciar() {
    mostrarAvisoFileProtocol();

    const R = window.Readeriso;
    const $ = seletor => document.querySelector(seletor);
    const listaRascunhos = $("#listaRascunhos");
    const listaPublicados = $("#listaPublicados");
    const formulario = $("#formNovaHistoria");
    const campoTitulo = $("#titulo");
    const campoDescricao = $("#descricao");
    const campoGenero = $("#genero");
    const erroForm = $("#erroForm");
    const botaoCriar = $("#btnCriar");
    let criando = false;

    if (!R || typeof R.listar !== "function" || typeof R.criar !== "function") {
      console.error("livros.js não foi carregado antes de escritor.js.");
      if (erroForm) {
        erroForm.hidden = false;
        erroForm.textContent = "O sistema de histórias não carregou. Confira se livros.js está antes de escritor.js.";
      }
      return;
    }

    const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, caractere => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caractere]);

    function mostrarErro(mensagem) {
      if (!erroForm) return;
      erroForm.textContent = mensagem;
      erroForm.hidden = false;
    }

    function ocultarErro() {
      if (!erroForm) return;
      erroForm.textContent = "";
      erroForm.hidden = true;
    }

    function atualizarContador(id, quantidade) {
      const elemento = document.getElementById(id);
      if (elemento) elemento.textContent = `${quantidade} ${quantidade === 1 ? "história" : "histórias"}`;
    }

    function criarCard(livro) {
      const id = encodeURIComponent(String(livro.id));
      const titulo = escapar(livro.titulo || "Sem título");
      const descricao = escapar(livro.descricao || "Sem descrição.");
      const genero = escapar(livro.genero || "Outro");
      const quantidade = Array.isArray(livro.capitulos) ? livro.capitulos.length : 0;
      const status = livro.publicada ? "Publicado" : "Rascunho";
      return `
        <a class="livro" href="editor.html?id=${id}" aria-label="Continuar ${titulo}">
          <div class="capa" aria-hidden="true">📖</div>
          <p class="genero-livro">${genero}</p>
          <h3>${titulo}</h3>
          <p class="descricao-livro">${descricao}</p>
          <p>${status} · ${quantidade} ${quantidade === 1 ? "capítulo" : "capítulos"}</p>
        </a>`;
    }

    function preencherLista(elemento, livros, mensagem) {
      if (!elemento) return;
      elemento.replaceChildren();
      if (!livros.length) {
        const paragrafo = document.createElement("p");
        paragrafo.className = "lista-vazia";
        paragrafo.textContent = mensagem;
        elemento.appendChild(paragrafo);
        return;
      }
      elemento.innerHTML = livros.map(criarCard).join("");
    }

    function renderizar() {
      try {
        const livros = R.listar().sort((a, b) => (b.atualizadoEm || 0) - (a.atualizadoEm || 0));
        const rascunhos = livros.filter(livro => !livro.publicada);
        const publicados = livros.filter(livro => livro.publicada);
        preencherLista(listaRascunhos, rascunhos, "Você ainda não tem rascunhos. Crie sua primeira história!");
        preencherLista(listaPublicados, publicados, "Você ainda não publicou nenhuma história.");
        atualizarContador("contadorRascunhos", rascunhos.length);
        atualizarContador("contadorPublicados", publicados.length);
      } catch (erro) {
        console.error("Erro ao listar histórias:", erro);
        preencherLista(listaRascunhos, [], "Não foi possível carregar os rascunhos. Confira o console do navegador.");
        preencherLista(listaPublicados, [], "Não foi possível carregar as histórias publicadas.");
      }
    }

    function criarHistoria() {
      if (criando) return;
      ocultarErro();
      const titulo = campoTitulo?.value.trim() || "";
      const descricao = campoDescricao?.value.trim() || "";
      const genero = campoGenero?.value || "";

      if (!titulo) {
        mostrarErro("Digite um título para a história.");
        campoTitulo?.focus();
        return;
      }
      if (!genero) {
        mostrarErro("Selecione um gênero para a história.");
        campoGenero?.focus();
        return;
      }

      criando = true;
      if (botaoCriar) botaoCriar.disabled = true;

      let livro;
      try {
        livro = R.criar({ titulo, descricao, genero });
        if (!livro?.id) throw new Error("A história não foi gravada no armazenamento.");
        // Confirma que o mesmo ID e os metadados estão de fato disponíveis para o editor.
        const conferido = R.obter(livro.id);
        if (!conferido || conferido.titulo !== titulo || conferido.descricao !== descricao || conferido.genero !== genero) {
          throw new Error("A história foi criada, mas os metadados não puderam ser confirmados.");
        }
      } catch (erro) {
        console.error("Falha ao criar história:", erro);
        mostrarErro("Não foi possível salvar esta história. Abra o projeto pelo Live Server e tente novamente.");
        criando = false;
        if (botaoCriar) botaoCriar.disabled = false;
        return;
      }

      window.location.href = `editor.html?id=${encodeURIComponent(String(livro.id))}`;
    }

    formulario?.addEventListener("submit", evento => {
      evento.preventDefault();
      criarHistoria();
    });

    window.addEventListener("pageshow", () => {
      criando = false;
      if (botaoCriar) botaoCriar.disabled = false;
      renderizar();
    });

    renderizar();

    // Mostra uma indicação de retorno depois de salvar um rascunho.
    if (new URLSearchParams(window.location.search).get("status") === "rascunho") {
      const aviso = document.createElement("p");
      aviso.setAttribute("role", "status");
      aviso.textContent = "Rascunho salvo com sucesso. Ele está na lista Meus rascunhos.";
      aviso.style.cssText = "margin:12px 5%;padding:12px;border-left:3px solid #e50914;background:#171717;color:#fff";
      document.querySelector("main")?.prepend(aviso);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
