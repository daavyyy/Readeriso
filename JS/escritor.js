// escritor.js — lista rascunhos/publicadas e cria novas histórias
(() => {
  "use strict";

  function iniciar() {
    const R = window.Readeriso;
    const escapar = R.escaparHTML;

    const listaRascunhos = document.getElementById("listaRascunhos");
    const listaPublicados = document.getElementById("listaPublicados");
    const formulario = document.getElementById("formNovaHistoria");
    const campoTitulo = document.getElementById("titulo");
    const campoDescricao = document.getElementById("descricao");
    const campoGenero = document.getElementById("genero");
    const erroForm = document.getElementById("erroForm");
    const botaoCriar = document.getElementById("btnCriar");
    const modal = document.getElementById("modalNovaHistoria");

    function mostrarErro(mensagem) {
      erroForm.textContent = mensagem;
      erroForm.hidden = false;
    }

    // "1 história" / "3 histórias"
    function plural(quantidade, singular, varias) {
      return `${quantidade} ${quantidade === 1 ? singular : varias}`;
    }

    // Card de uma história do usuário
    function criarCard(livro) {
      const id = encodeURIComponent(livro.id);
      const capitulos = plural(livro.capitulos.length, "capítulo", "capítulos");
      const botaoLer = livro.publicada
        ? `<a href="biblioteca.html?ler=${id}" class="btn-secundario">Ler</a>`
        : "";

      return `
        <article class="card-historia">
          <div class="capa-historia sem-capa" aria-hidden="true">▧</div>
          <p class="genero">${escapar(livro.genero.toUpperCase())}</p>
          <h3>${escapar(livro.titulo || "Sem título")}</h3>
          <p class="descricao-historia">${escapar(livro.descricao || "Sem descrição.")}</p>
          <p class="info-livro">${livro.publicada ? "Publicada" : "Rascunho"} · ${capitulos}</p>
          <div class="card-acoes">
            <a href="editor.html?id=${id}" class="btn-principal">
              ${livro.publicada ? "Editar" : "Continuar escrevendo"}
            </a>
            ${botaoLer}
          </div>
        </article>
      `;
    }

    // Preenche uma lista ou mostra o aviso de vazio
    function preencherLista(elemento, livros, vazio) {
      elemento.innerHTML = livros.length
        ? livros.map(criarCard).join("")
        : `<p class="sem-resultado">${vazio}</p>`;
    }

    function renderizar() {
      const livros = R.listar().sort((a, b) => b.atualizadoEm - a.atualizadoEm);
      const rascunhos = livros.filter(livro => !livro.publicada);
      const publicados = livros.filter(livro => livro.publicada);

      preencherLista(listaRascunhos, rascunhos, "Você ainda não tem rascunhos. Crie sua primeira história!");
      preencherLista(listaPublicados, publicados, "Você ainda não publicou nenhuma história.");

      document.getElementById("contadorRascunhos").textContent = plural(rascunhos.length, "história", "histórias");
      document.getElementById("contadorPublicados").textContent = plural(publicados.length, "história", "histórias");
    }

    // Cria a história e abre direto no editor
    formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      erroForm.hidden = true;

      const titulo = campoTitulo.value.trim();
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

      botaoCriar.disabled = true;
      const livro = R.criar({ titulo, descricao: campoDescricao.value.trim(), genero });

      if (!livro) {
        mostrarErro("Não foi possível salvar esta história. Abra o projeto pelo Live Server e tente novamente.");
        botaoCriar.disabled = false;
        return;
      }

      window.location.href = `editor.html?id=${encodeURIComponent(livro.id)}`;
    });

    // Foca o título quando o modal abre e limpa o formulário quando fecha
    modal.addEventListener("shown.bs.modal", () => campoTitulo.focus());
    modal.addEventListener("hidden.bs.modal", () => {
      formulario.reset();
      erroForm.hidden = true;
    });

    // Recarrega a lista ao voltar pelo botão "voltar" do navegador
    window.addEventListener("pageshow", () => {
      botaoCriar.disabled = false;
      renderizar();
    });

    renderizar();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
